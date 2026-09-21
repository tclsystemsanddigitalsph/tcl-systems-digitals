"use server";

import { refundPayMongoPayment, refundPayPalCapture } from "@/lib/refunds";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminSupabaseClient } from "@/lib/supabase-admin";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { completeCustomOrderPayment } from "@/lib/custom-order-payments";
import { sendTclEmail } from "@/lib/resend";
import { tclEmailShell } from "@/lib/tcl-email-template";

async function requireAdmin() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");
  return user;
}

async function addActivityNote(orderId: string, note: string, createdBy: string) {
  const admin = createAdminSupabaseClient();
  const { error } = await admin.from("order_notes").insert({
    order_id: orderId,
    note,
    created_by: createdBy,
  });
  if (error) console.error("Unable to add activity note:", error);
}


async function addQuotationActivityLogsForOrder(
  admin: ReturnType<typeof createAdminSupabaseClient>,
  orderId: string,
  logs: Array<{
    actionType: string;
    summary: string;
    details?: Record<string, unknown>;
  }>,
) {
  if (!logs.length) return;

  const { data: quotationData, error: quotationError } = await admin
    .from("quotation_requests")
    .select("*")
    .eq("order_id", orderId)
    .maybeSingle();

  if (quotationError) {
    console.error(
      "Unable to find linked quotation for activity log:",
      quotationError,
    );
    return;
  }

  const quotation = quotationData as unknown as { id?: string } | null;

  if (!quotation?.id) return;

  const { error: logError } = await admin
    .from("quotation_activity_logs")
    .insert(
      logs.map((log) => ({
        quotation_request_id: quotation.id,
        action_type: log.actionType,
        summary: log.summary,
        details: log.details ?? {},
      })),
    );

  /*
   * Activity history should never undo a successful admin action.
   * If logging fails, preserve the project/order update and report it only
   * to the server console.
   */
  if (logError) {
    console.error("Unable to add quotation activity log:", logError);
  }
}

export async function resetFileDownloads(formData: FormData) {
  const user = await requireAdmin();
  const orderId = String(formData.get("order_id") ?? "").trim();
  const fileId = String(formData.get("product_file_id") ?? "").trim();
  if (!orderId || !fileId) throw new Error("Missing order or file ID.");

  const admin = createAdminSupabaseClient();
  const { data: order } = await admin.from("orders").select("id,order_number,product_id").eq("id", orderId).maybeSingle();
  if (!order?.product_id) throw new Error("Order not found.");

  const { data: file } = await admin.from("product_files").select("id,display_name").eq("id", fileId).eq("product_id", order.product_id).maybeSingle();
  if (!file) throw new Error("Product file not found.");

  const now = new Date().toISOString();
  const { error } = await admin.from("order_downloads").upsert({
    order_id: orderId,
    product_file_id: fileId,
    download_count: 0,
    last_downloaded_at: null,
    updated_at: now,
  }, { onConflict: "order_id,product_file_id" });
  if (error) throw new Error("Unable to reset download count.");

  await addActivityNote(orderId, `Download allowance reset for "${file.display_name}".`, user.email || "Admin");
  revalidatePath(`/admin/orders/${orderId}`);
}

export async function extendDownloadAccess(formData: FormData) {
  const user = await requireAdmin();
  const orderId = String(formData.get("order_id") ?? "").trim();
  const days = Number(String(formData.get("days") ?? "7"));
  if (!orderId) throw new Error("Missing order ID.");
  if (!Number.isInteger(days) || days < 1 || days > 365) throw new Error("Extension must be between 1 and 365 days.");

  const admin = createAdminSupabaseClient();
  const { data: order } = await admin.from("orders")
    .select("id,download_access_expires_at,paid_at,created_at")
    .eq("id", orderId).maybeSingle();
  if (!order) throw new Error("Order not found.");

  const now = Date.now();
  const existing = order.download_access_expires_at ? new Date(order.download_access_expires_at).getTime() : 0;
  const base = Number.isFinite(existing) && existing > now ? existing : now;
  const expiresAt = new Date(base + days * 86400000).toISOString();

  const { error } = await admin.from("orders").update({
    download_access_expires_at: expiresAt,
    updated_at: new Date().toISOString(),
  }).eq("id", orderId);
  if (error) throw new Error("Unable to extend download access.");

  await addActivityNote(orderId, `Digital download access extended by ${days} day${days === 1 ? "" : "s"} through ${expiresAt}.`, user.email || "Admin");
  revalidatePath(`/admin/orders/${orderId}`);
}

export async function revokeDownloadAccess(formData: FormData) {
  const user = await requireAdmin();
  const orderId = String(formData.get("order_id") ?? "").trim();
  if (!orderId) throw new Error("Missing order ID.");

  const admin = createAdminSupabaseClient();
  const now = new Date().toISOString();
  const { error } = await admin.from("orders").update({
    download_access_expires_at: now,
    updated_at: now,
  }).eq("id", orderId);
  if (error) throw new Error("Unable to revoke download access.");

  await addActivityNote(orderId, "Digital download access revoked by admin.", user.email || "Admin");
  revalidatePath(`/admin/orders/${orderId}`);
}

export async function addOrderNote(formData: FormData) {
  const user = await requireAdmin();
  const orderId = String(formData.get("order_id") ?? "").trim();
  const note = String(formData.get("note") ?? "").trim();
  if (!orderId) throw new Error("Missing order ID.");
  if (!note) throw new Error("Note cannot be empty.");
  if (note.length > 5000) throw new Error("Note is too long.");

  const adminSupabase = createAdminSupabaseClient();
  const { data: order, error: orderError } = await adminSupabase.from("orders").select("id").eq("id", orderId).maybeSingle();
  if (orderError || !order) throw new Error("Order not found.");

  const { error } = await adminSupabase.from("order_notes").insert({ order_id: orderId, note, created_by: user.email || "Admin" });
  if (error) throw new Error("Unable to add order note.");
  revalidatePath(`/admin/orders/${orderId}`);
}


export async function updateOrderStatus(formData: FormData) {
  const user = await requireAdmin();

  const orderId = String(formData.get("order_id") ?? "").trim();
  const nextStatus = String(formData.get("order_status") ?? "")
    .trim()
    .toUpperCase();

  if (!orderId) throw new Error("Missing order ID.");

  const allowedStatuses = [
    "PENDING",
    "IN_PROGRESS",
    "READY_FOR_DELIVERY",
    "COMPLETED",
  ] as const;

  if (!allowedStatuses.includes(nextStatus as (typeof allowedStatuses)[number])) {
    throw new Error("Invalid order status.");
  }

  const admin = createAdminSupabaseClient();

  const { data: order, error: orderError } = await admin
    .from("orders")
    .select(
      "id,order_number,customer_name,customer_email,product_name,order_status,payment_status",
    )
    .eq("id", orderId)
    .maybeSingle();

  if (orderError || !order) throw new Error("Order not found.");

  if (order.order_status === "CANCELLED") {
    throw new Error("A cancelled order cannot be moved to another status.");
  }

  const previousStatus = String(order.order_status || "PENDING")
    .trim()
    .toUpperCase();

  if (previousStatus === nextStatus) {
    redirect(`/admin/orders/${orderId}`);
  }

  const now = new Date().toISOString();

  const { error: updateError } = await admin
    .from("orders")
    .update({
      order_status: nextStatus,
      updated_at: now,
    })
    .eq("id", orderId);

  if (updateError) {
    throw new Error(`Unable to update order status: ${updateError.message}`);
  }

  const statusLabel = (status: string) =>
    status
      .toLowerCase()
      .split("_")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");

  await addActivityNote(
    orderId,
    `Order status changed from ${statusLabel(previousStatus)} to ${statusLabel(nextStatus)}.`,
    user.email || "Admin",
  );

  await addQuotationActivityLogsForOrder(admin, orderId, [
    {
      actionType: "ORDER_STATUS_CHANGED",
      summary: `Order status changed from ${statusLabel(previousStatus)} to ${statusLabel(nextStatus)}.`,
      details: {
        changed_by: user.email || "Admin",
        previous_status: previousStatus,
        new_status: nextStatus,
      },
    },
  ]);

  /*
   * Customer notifications are intentionally limited to meaningful progress
   * states. Moving an order back to PENDING remains an internal/admin change.
   * Email failure must never undo a successfully saved order-status update.
   */
  const emailContent: Record<
    string,
    { subject: string; heading: string; message: string }
  > = {
    IN_PROGRESS: {
      subject: "TCL Systems & Digitals PH - Project In Progress",
      heading: "Project In Progress",
      message:
        "Your project is now in progress. Work has started and we’ll continue moving through the agreed scope and requirements.\n\nWe’ll send another update when your project reaches its next meaningful stage.",
    },
    READY_FOR_DELIVERY: {
      subject: "TCL Systems & Digitals PH - Project Ready for Delivery",
      heading: "Project Ready for Delivery",
      message:
        "Your project has reached the ready-for-delivery stage.\n\nPlease check your order status for the latest project information. Any applicable turnover, access, or delivery details will be provided through the appropriate TCL channel.",
    },
    COMPLETED: {
      subject: "TCL Systems & Digitals PH - Project Completed",
      heading: "Project Completed",
      message:
        "Your project has been marked as completed.\n\nThank you for choosing TCL Systems & Digitals PH. You can still use the order-status page to review the latest status of your order.",
    },
  };

  const notification = emailContent[nextStatus];

  if (notification && order.customer_email) {
    try {
      const siteUrl = (
        process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://www.tclsystemsph.com"
      ).replace(/\/$/, "");

      const orderStatusUrl = `${siteUrl}/order-status`;
      const customerName = String(order.customer_name ?? "").trim();
      const firstName = customerName.split(/\s+/)[0] || "there";

      const message = [
        `Hi ${firstName},`,
        "",
        notification.message,
      ].join("\n");

      const html = tclEmailShell({
        eyebrow: "TCL PROJECT UPDATE",
        title: notification.heading,
        message,
        details: [
          { label: "Order Number", value: order.order_number },
          { label: "Package", value: order.product_name || "TCL Service" },
          { label: "Order Status", value: statusLabel(nextStatus) },
          {
            label: "Payment Status",
            value:
              String(order.payment_status ?? "").toUpperCase() === "COMPLETED"
                ? "Paid"
                : statusLabel(String(order.payment_status || "PENDING")),
          },
        ],
        buttonLabel: "Check Order Status",
        buttonUrl: orderStatusUrl,
        note:
          "This is a notification-only email. Please do not reply to this message. For questions or concerns, contact TCL Systems & Digitals PH on Telegram: @tclsystemsanddigitalsph.",
      });

      const text = [
        notification.heading,
        "",
        message,
        "",
        `Order Number: ${order.order_number}`,
        `Package: ${order.product_name || "TCL Service"}`,
        `Order Status: ${statusLabel(nextStatus)}`,
        `Payment Status: ${
          String(order.payment_status ?? "").toUpperCase() === "COMPLETED"
            ? "Paid"
            : statusLabel(String(order.payment_status || "PENDING"))
        }`,
        "",
        `Check Order Status: ${orderStatusUrl}`,
        "",
        "This is a notification-only email. Please do not reply.",
        "Questions or concerns: Telegram @tclsystemsanddigitalsph",
      ].join("\n");

      const emailResult = await sendTclEmail({
        to: order.customer_email,
        subject: notification.subject,
        html,
        text,
      });

      if (!emailResult.ok) {
        console.error(
          `Order status changed to ${nextStatus}, but the customer notification was not sent:`,
          emailResult,
        );
      }
    } catch (emailError) {
      console.error(
        `Order status changed to ${nextStatus}, but customer email processing failed:`,
        emailError,
      );
    }
  }

  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");
  revalidatePath("/admin");
  revalidatePath("/admin/customers");
  revalidatePath("/admin/deliveries");

  redirect(`/admin/orders/${orderId}?order_status_updated=1`);
}

export async function cancelOrder(formData: FormData) {
  const user = await requireAdmin();
  const orderId = String(formData.get("order_id") ?? "").trim();
  const reason = String(formData.get("reason") ?? "").trim();
  if (!orderId) throw new Error("Missing order ID.");
  if (!reason) throw new Error("Cancellation reason is required.");
  if (reason.length > 1000) throw new Error("Cancellation reason is too long.");

  const adminSupabase = createAdminSupabaseClient();
  const { data: order, error: orderError } = await adminSupabase.from("orders")
    .select("id,order_number,payment_status,order_status").eq("id", orderId).maybeSingle();
  if (orderError || !order) throw new Error("Order not found.");
  if (order.order_status === "CANCELLED") redirect(`/admin/orders/${orderId}`);

  const now = new Date().toISOString();
  const { data: cancelledOrder, error: cancelError } = await adminSupabase.from("orders").update({
    order_status: "CANCELLED", cancellation_reason: reason, cancelled_at: now, updated_at: now,
  }).eq("id", orderId).select("id").maybeSingle();
  if (cancelError || !cancelledOrder) throw new Error("Unable to cancel this order.");

  const paidNote = order.payment_status === "COMPLETED" ? " Payment remains COMPLETED; no automatic refund was issued." : "";
  await adminSupabase.from("order_notes").insert({
    order_id: orderId,
    note: `Order ${order.order_number} was cancelled by admin. Reason: ${reason}.${paidNote}`,
    created_by: user.email || "Admin",
  });
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");
  revalidatePath("/admin");
  redirect(`/admin/orders/${orderId}?cancelled=1`);
}



function moneyNumber(value: number | string | null | undefined) {
  const number = Number(value ?? 0);
  return Number.isFinite(number) ? Number(number.toFixed(2)) : 0;
}

async function getSuccessfulPaymentTotal(
  admin: ReturnType<typeof createAdminSupabaseClient>,
  orderId: string,
) {
  const { data, error } = await admin
    .from("order_payments")
    .select("amount")
    .eq("order_id", orderId)
    .eq("status", "COMPLETED");

  if (error) {
    throw new Error(
      `Unable to calculate successful payments: ${error.message}`,
    );
  }

  return Number(
    (data ?? [])
      .reduce((sum, row) => sum + moneyNumber(row.amount), 0)
      .toFixed(2),
  );
}

export async function updateCustomProjectAmount(formData: FormData) {
  const user = await requireAdmin();

  const orderId = String(formData.get("order_id") ?? "").trim();
  const basePriceRaw = String(formData.get("base_price") ?? "").trim();
  const reason = String(formData.get("reason") ?? "").trim();
  const discountType = String(formData.get("discount_type") ?? "NONE").trim().toUpperCase();
  const discountValueRaw = String(formData.get("discount_value") ?? "").trim();

  if (!orderId) throw new Error("Missing order ID.");
  if (!reason) throw new Error("Adjustment reason is required.");
  if (reason.length > 1000) throw new Error("Adjustment reason is too long.");

  const enteredBasePrice = Number(basePriceRaw);

  if (!Number.isFinite(enteredBasePrice) || enteredBasePrice <= 0) {
    throw new Error("Project amount must be greater than zero.");
  }

  if (!["NONE", "FIXED", "PERCENT"].includes(discountType)) {
    throw new Error("Invalid discount type.");
  }

  let discountValue = 0;
  if (discountType !== "NONE") {
    discountValue = Number(discountValueRaw);
    if (!Number.isFinite(discountValue) || discountValue <= 0) {
      throw new Error("Discount value must be greater than zero.");
    }
    if (discountType === "PERCENT" && discountValue >= 100) {
      throw new Error("Percentage discount must be less than 100%.");
    }
  }

  const discountAmount =
    discountType === "PERCENT"
      ? Number(((enteredBasePrice * discountValue) / 100).toFixed(2))
      : discountType === "FIXED"
        ? Number(discountValue.toFixed(2))
        : 0;

  const newBasePrice = Number((enteredBasePrice - discountAmount).toFixed(2));

  if (newBasePrice <= 0) {
    throw new Error("Discount cannot reduce the project amount to zero or below.");
  }

  const admin = createAdminSupabaseClient();

  const { data: order, error: orderError } = await admin
    .from("orders")
    .select(
      "id,order_number,base_price,processing_fee_percent,processing_fee,total_amount,amount_paid,balance_due,payment_terms,payment_status,order_status,receipt_token",
    )
    .eq("id", orderId)
    .maybeSingle();

  if (orderError || !order) throw new Error("Order not found.");

  if (order.order_status === "CANCELLED") {
    throw new Error("A cancelled order cannot be adjusted.");
  }

  const { data: linkedQuotation, error: linkedQuotationError } = await admin
    .from("quotation_requests")
    .select("id,secure_token,quoted_amount,admin_notes")
    .eq("order_id", order.id)
    .maybeSingle();

  if (linkedQuotationError) {
    throw new Error(
      `Unable to load the linked quotation: ${linkedQuotationError.message}`,
    );
  }

  if (!linkedQuotation) {
    throw new Error(
      "Only orders linked to a quotation can have their custom project amount edited here.",
    );
  }

  const { data: quotationItemsData, error: quotationItemsError } = await admin
    .from("quotation_items")
    .select("id,item_name,item_description,amount,display_order,created_at")
    .eq("quotation_request_id", linkedQuotation.id)
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (quotationItemsError) {
    throw new Error(
      `Unable to load quotation items before updating the project amount: ${quotationItemsError.message}`,
    );
  }

  const quotationItems = quotationItemsData ?? [];

  const processingFeePercent = moneyNumber(order.processing_fee_percent);
  const oldBasePrice = moneyNumber(order.base_price);
  const oldTotal = moneyNumber(order.total_amount);
  const oldBalanceDue = moneyNumber(order.balance_due);

  /*
   * Successful order_payments are the source of truth.
   * Never rely on a possibly stale orders.amount_paid when changing scope.
   */
  const successfulAmountPaid = await getSuccessfulPaymentTotal(admin, order.id);

  const baseCentavos = Math.round((newBasePrice + Number.EPSILON) * 100);
  const feeCentavos = Math.round(
    (baseCentavos * processingFeePercent) / 100,
  );
  const totalCentavos = baseCentavos + feeCentavos;

  const normalizedBasePrice = baseCentavos / 100;
  const processingFee = feeCentavos / 100;
  const newTotal = totalCentavos / 100;

  if (newTotal < successfulAmountPaid - 0.005) {
    throw new Error(
      `The new project total cannot be lower than the amount already successfully paid (${successfulAmountPaid.toFixed(2)}).`,
    );
  }

  const amountPaid = Math.min(newTotal, successfulAmountPaid);
  const balanceDue = Math.max(
    0,
    Number((newTotal - amountPaid).toFixed(2)),
  );

  /*
   * The orders table only accepts the existing coarse payment states.
   * Partial custom-project progress is represented by amount_paid,
   * balance_due, and order_payments — not a PARTIALLY_PAID status.
   */
  const nextPaymentStatus =
    balanceDue <= 0.005 ? "COMPLETED" : "PENDING";

  const now = new Date().toISOString();

  const orderUpdate: Record<string, unknown> = {
    base_price: normalizedBasePrice,
    processing_fee: processingFee,
    total_amount: newTotal,
    amount_paid: amountPaid,
    balance_due: balanceDue,
    payment_status: nextPaymentStatus,
    updated_at: now,
  };

  if (nextPaymentStatus === "COMPLETED") {
    if (order.payment_status !== "COMPLETED") {
      orderUpdate.paid_at = now;
    }
  } else {
    /*
     * If a previously fully-paid project increases, reopen its balance while
     * preserving every successful payment row.
     */
    orderUpdate.paid_at = null;
  }

  const { error: updateError } = await admin
    .from("orders")
    .update(orderUpdate)
    .eq("id", order.id);

  if (updateError) {
    throw new Error(`Unable to update project amount: ${updateError.message}`);
  }

  /*
   * Keep the accepted quotation synchronized with the Admin order edit.
   * The quotation is the public pricing source used by the quotation page and
   * by getCustomCheckoutState(), so leaving it stale would immediately cause
   * the checkout to restore the old total.
   */
  const { error: quotationUpdateError } = await admin
    .from("quotation_requests")
    .update({
      quoted_amount: normalizedBasePrice,
      updated_at: now,
    })
    .eq("id", linkedQuotation.id);

  if (quotationUpdateError) {
    throw new Error(
      `Order amount changed, but the linked quotation could not be updated: ${quotationUpdateError.message}`,
    );
  }

  /*
   * If this quotation is itemized, keep the itemized subtotal equal to the
   * newly saved project price as well. We preserve all item rows and adjust
   * pricing from the last item backwards. This avoids adding duplicate
   * adjustment rows every time the Admin changes the project total.
   *
   * Completed payment history is never touched.
   */
  if (quotationItems.length > 0) {
    const currentItemTotalCentavos = quotationItems.reduce(
      (sum, item) => sum + Math.round(moneyNumber(item.amount) * 100),
      0,
    );
    const targetItemTotalCentavos = baseCentavos;
    let deltaCentavos = targetItemTotalCentavos - currentItemTotalCentavos;

    if (deltaCentavos > 0) {
      const lastItem = quotationItems[quotationItems.length - 1];
      const nextAmountCentavos =
        Math.round(moneyNumber(lastItem.amount) * 100) + deltaCentavos;

      const { error: itemUpdateError } = await admin
        .from("quotation_items")
        .update({
          amount: nextAmountCentavos / 100,
          updated_at: now,
        })
        .eq("id", lastItem.id)
        .eq("quotation_request_id", linkedQuotation.id);

      if (itemUpdateError) {
        throw new Error(
          `Quotation total changed, but the itemized scope could not be synchronized: ${itemUpdateError.message}`,
        );
      }
    } else if (deltaCentavos < 0) {
      let reductionRemaining = Math.abs(deltaCentavos);

      for (
        let index = quotationItems.length - 1;
        index >= 0 && reductionRemaining > 0;
        index -= 1
      ) {
        const item = quotationItems[index];
        const currentAmountCentavos = Math.round(
          moneyNumber(item.amount) * 100,
        );
        const reduction = Math.min(
          currentAmountCentavos,
          reductionRemaining,
        );
        const nextAmountCentavos = currentAmountCentavos - reduction;

        const { error: itemUpdateError } = await admin
          .from("quotation_items")
          .update({
            amount: nextAmountCentavos / 100,
            updated_at: now,
          })
          .eq("id", item.id)
          .eq("quotation_request_id", linkedQuotation.id);

        if (itemUpdateError) {
          throw new Error(
            `Quotation total changed, but the itemized scope could not be synchronized: ${itemUpdateError.message}`,
          );
        }

        reductionRemaining -= reduction;
      }

      if (reductionRemaining > 0) {
        throw new Error(
          "Unable to synchronize the quotation items with the new project amount.",
        );
      }
    }
  }

  const { error: quotationNoteError } = await admin
    .from("quotation_note_logs")
    .insert({
      quotation_request_id: linkedQuotation.id,
      note_type: "AUTOMATIC",
      title: "Project amount adjusted",
      note: `Project price updated from ${oldBasePrice.toFixed(2)} to ${normalizedBasePrice.toFixed(2)} before the 6% processing fee. Reason: ${reason}`,
      details: {
        changed_by: user.email || "Admin",
        previous_project_amount: oldBasePrice,
        new_project_amount: normalizedBasePrice,
        previous_customer_total: oldTotal,
        new_customer_total: newTotal,
        successful_payments: amountPaid,
        remaining_balance: balanceDue,
      },
    });

  if (quotationNoteError) {
    console.error(
      "Unable to add quotation amount adjustment note:",
      quotationNoteError,
    );
  }

  const { data: payments, error: paymentsError } = await admin
    .from("order_payments")
    .select("id,payment_stage,status,created_at")
    .eq("order_id", order.id)
    .order("created_at", { ascending: true });

  if (paymentsError) {
    throw new Error(
      `Project amount changed, but payment records could not be refreshed: ${paymentsError.message}`,
    );
  }

  const depositCompleted = (payments ?? []).some(
    (payment) =>
      payment.payment_stage === "DEPOSIT" &&
      payment.status === "COMPLETED",
  );

  for (const payment of payments ?? []) {
    /*
     * Completed payments are immutable payment history.
     * Scope changes may only modify/cancel still-pending payment requests.
     */
    if (payment.status !== "PENDING") continue;

    if (balanceDue <= 0.005) {
      const { error: cancelPaymentError } = await admin
        .from("order_payments")
        .update({
          status: "CANCELLED",
          provider: null,
          paypal_order_id: null,
          paypal_capture_id: null,
          paymongo_checkout_session_id: null,
          paymongo_payment_id: null,
          paymongo_checkout_url: null,
          updated_at: now,
        })
        .eq("id", payment.id);

      if (cancelPaymentError) {
        throw new Error(
          `Project amount changed, but an obsolete pending payment could not be cancelled: ${cancelPaymentError.message}`,
        );
      }

      continue;
    }

    let nextAmount: number | null = null;

    if (
      order.payment_terms === "DEPOSIT_50" &&
      payment.payment_stage === "DEPOSIT" &&
      !depositCompleted &&
      amountPaid <= 0
    ) {
      /*
       * Before the first payment succeeds, the still-pending deposit may follow
       * the latest quotation total.
       */
      nextAmount = Number((newTotal / 2).toFixed(2));
    } else if (
      order.payment_terms === "FULL" &&
      payment.payment_stage === "FULL" &&
      amountPaid <= 0
    ) {
      nextAmount = newTotal;
    } else if (payment.payment_stage === "FINAL") {
      /*
       * After any successful payment, FINAL always means exactly:
       * current total - all successful payments.
       */
      nextAmount = balanceDue;
    }

    if (nextAmount === null || nextAmount <= 0) continue;

    const { error: paymentUpdateError } = await admin
      .from("order_payments")
      .update({
        amount: nextAmount,
        currency: "PHP",
        provider: null,
        status: "PENDING",
        paypal_order_id: null,
        paypal_capture_id: null,
        paymongo_checkout_session_id: null,
        paymongo_payment_id: null,
        paymongo_checkout_url: null,
        updated_at: now,
      })
      .eq("id", payment.id);

    if (paymentUpdateError) {
      throw new Error(
        `Project amount changed, but the pending payment could not be refreshed: ${paymentUpdateError.message}`,
      );
    }
  }

  const format = (value: number) =>
    new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(value);

  await addActivityNote(
    order.id,
    `Custom project amount adjusted from ${format(oldBasePrice)} to ${format(normalizedBasePrice)} before processing fee.${discountAmount > 0 ? ` Discount applied: ${discountType === "PERCENT" ? `${discountValue}%` : format(discountAmount)} from ${format(enteredBasePrice)}.` : ""} New customer total: ${format(newTotal)}. Successful payments kept: ${format(amountPaid)}. Remaining balance: ${format(balanceDue)}. Reason: ${reason}`,
    user.email || "Admin",
  );

  const amountChangeLogs: Array<{
    actionType: string;
    summary: string;
    details: Record<string, unknown>;
  }> = [
    {
      actionType: "QUOTATION_AMOUNT_CHANGED",
      summary: `Project amount changed from ${format(oldBasePrice)} to ${format(normalizedBasePrice)}.`,
      details: {
        changed_by: user.email || "Admin",
        reason,
        entered_project_amount: enteredBasePrice,
        discount_type: discountType,
        discount_value: discountValue,
        discount_amount: discountAmount,
        previous_project_amount: oldBasePrice,
        new_project_amount: normalizedBasePrice,
        previous_customer_total: oldTotal,
        new_customer_total: newTotal,
        processing_fee_percent: processingFeePercent,
        processing_fee: processingFee,
        successful_payments: amountPaid,
        previous_remaining_balance: oldBalanceDue,
        remaining_balance: balanceDue,
        previous_payment_status: order.payment_status,
        payment_status: nextPaymentStatus,
      },
    },
    {
      actionType: "BALANCE_RECALCULATED",
      summary: `Remaining balance recalculated to ${format(balanceDue)}.`,
      details: {
        changed_by: user.email || "Admin",
        current_customer_total: newTotal,
        successful_payments: amountPaid,
        previous_remaining_balance: oldBalanceDue,
        remaining_balance: balanceDue,
      },
    },
  ];

  if (
    order.payment_status === "COMPLETED" &&
    nextPaymentStatus !== "COMPLETED"
  ) {
    amountChangeLogs.push({
      actionType: "PROJECT_BALANCE_REOPENED",
      summary: `Project balance reopened after the agreed amount changed. Remaining balance: ${format(balanceDue)}.`,
      details: {
        changed_by: user.email || "Admin",
        previous_customer_total: oldTotal,
        new_customer_total: newTotal,
        successful_payments: amountPaid,
        remaining_balance: balanceDue,
        reason,
      },
    });
  }

  await addQuotationActivityLogsForOrder(
    admin,
    order.id,
    amountChangeLogs,
  );

  revalidatePath(`/admin/orders/${order.id}`);
  revalidatePath("/admin/orders");
  revalidatePath("/admin");
  revalidatePath(`/admin/quotation-requests/${linkedQuotation.id}`);
  revalidatePath(`/quotation/${linkedQuotation.secure_token}`);

  if (order.receipt_token) {
    revalidatePath(`/checkout/custom/${order.receipt_token}`);
  }

  redirect(`/admin/orders/${order.id}?amount_updated=1`);
}



export async function updateRegularOrderAmount(formData: FormData) {
  const user = await requireAdmin();

  const orderId = String(formData.get("order_id") ?? "").trim();
  const basePriceRaw = String(formData.get("base_price") ?? "").trim();
  const reason = String(formData.get("reason") ?? "").trim();
  const discountType = String(
    formData.get("discount_type") ?? "NONE",
  ).trim().toUpperCase();
  const discountValueRaw = String(
    formData.get("discount_value") ?? "",
  ).trim();

  if (!orderId) throw new Error("Missing order ID.");
  if (!reason) throw new Error("Adjustment reason is required.");
  if (reason.length > 1000) throw new Error("Adjustment reason is too long.");

  const enteredBasePrice = Number(basePriceRaw);
  if (!Number.isFinite(enteredBasePrice) || enteredBasePrice <= 0) {
    throw new Error("Order price must be greater than zero.");
  }

  if (!["NONE", "FIXED", "PERCENT"].includes(discountType)) {
    throw new Error("Invalid discount type.");
  }

  let discountValue = 0;
  if (discountType !== "NONE") {
    discountValue = Number(discountValueRaw);
    if (!Number.isFinite(discountValue) || discountValue <= 0) {
      throw new Error("Discount value must be greater than zero.");
    }
    if (discountType === "PERCENT" && discountValue >= 100) {
      throw new Error("Percentage discount must be less than 100%.");
    }
  }

  const discountAmount =
    discountType === "PERCENT"
      ? Number(((enteredBasePrice * discountValue) / 100).toFixed(2))
      : discountType === "FIXED"
        ? Number(discountValue.toFixed(2))
        : 0;

  const adjustedBasePrice = Number(
    (enteredBasePrice - discountAmount).toFixed(2),
  );

  if (adjustedBasePrice <= 0) {
    throw new Error("Discount cannot reduce the order price to zero or below.");
  }

  const admin = createAdminSupabaseClient();

  const { data: order, error: orderError } = await admin
    .from("orders")
    .select(
      "id,order_number,base_price,processing_fee_percent,processing_fee,total_amount,payment_status,order_status,payment_provider",
    )
    .eq("id", orderId)
    .maybeSingle();

  if (orderError || !order) throw new Error("Order not found.");

  if (order.order_status === "CANCELLED") {
    throw new Error("A cancelled order cannot be adjusted.");
  }

  const { data: linkedQuotation, error: linkedQuotationError } = await admin
    .from("quotation_requests")
    .select("id")
    .eq("order_id", order.id)
    .maybeSingle();

  if (linkedQuotationError) {
    throw new Error(
      `Unable to verify the order type: ${linkedQuotationError.message}`,
    );
  }

  if (linkedQuotation) {
    throw new Error(
      "This is a quotation-linked order. Use Custom project controls instead.",
    );
  }

  const successfulAmountPaid = await getSuccessfulPaymentTotal(admin, order.id);
  const processingFeePercent = moneyNumber(order.processing_fee_percent);

  const baseCentavos = Math.round(
    (adjustedBasePrice + Number.EPSILON) * 100,
  );
  const feeCentavos = Math.round(
    (baseCentavos * processingFeePercent) / 100,
  );
  const totalCentavos = baseCentavos + feeCentavos;

  const normalizedBasePrice = baseCentavos / 100;
  const processingFee = feeCentavos / 100;
  const newTotal = totalCentavos / 100;

  if (newTotal < successfulAmountPaid - 0.005) {
    throw new Error(
      `The new order total cannot be lower than the amount already successfully paid (${successfulAmountPaid.toFixed(2)}).`,
    );
  }

  const amountPaid = Math.min(newTotal, successfulAmountPaid);
  const balanceDue = Math.max(
    0,
    Number((newTotal - amountPaid).toFixed(2)),
  );
  const nextPaymentStatus =
    balanceDue <= 0.005 ? "COMPLETED" : "PENDING";
  const now = new Date().toISOString();

  const { error: updateError } = await admin
    .from("orders")
    .update({
      base_price: normalizedBasePrice,
      processing_fee: processingFee,
      total_amount: newTotal,
      amount_paid: amountPaid,
      balance_due: balanceDue,
      payment_status: nextPaymentStatus,
      paid_at: nextPaymentStatus === "COMPLETED" ? now : null,
      updated_at: now,
    })
    .eq("id", order.id);

  if (updateError) {
    throw new Error(`Unable to update order price: ${updateError.message}`);
  }

  /*
   * A pending provider checkout/payment was created for the old amount.
   * Do not leave that stale provider session active after an admin price change.
   * Completed payment rows are never modified.
   */
  const { data: pendingPayments, error: pendingPaymentsError } = await admin
    .from("order_payments")
    .select("id,status")
    .eq("order_id", order.id)
    .eq("status", "PENDING");

  if (pendingPaymentsError) {
    throw new Error(
      `Order price changed, but pending payment records could not be refreshed: ${pendingPaymentsError.message}`,
    );
  }

  for (const payment of pendingPayments ?? []) {
    const { error: pendingUpdateError } = await admin
      .from("order_payments")
      .update({
        amount: balanceDue,
        currency: "PHP",
        provider: null,
        paypal_order_id: null,
        paypal_capture_id: null,
        paymongo_checkout_session_id: null,
        paymongo_payment_id: null,
        paymongo_checkout_url: null,
        updated_at: now,
      })
      .eq("id", payment.id)
      .eq("order_id", order.id);

    if (pendingUpdateError) {
      throw new Error(
        `Order price changed, but a pending payment record could not be refreshed: ${pendingUpdateError.message}`,
      );
    }
  }

  const discountText =
    discountType === "NONE"
      ? ""
      : discountType === "PERCENT"
        ? ` Discount: ${discountValue}% (${new Intl.NumberFormat("en-PH", {
            style: "currency",
            currency: "PHP",
          }).format(discountAmount)}).`
        : ` Discount: ${new Intl.NumberFormat("en-PH", {
            style: "currency",
            currency: "PHP",
          }).format(discountAmount)}.`;

  await addActivityNote(
    order.id,
    `Regular order price adjusted from ${new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(moneyNumber(order.base_price))} to ${new Intl.NumberFormat(
      "en-PH",
      {
        style: "currency",
        currency: "PHP",
      },
    ).format(normalizedBasePrice)} before processing fee.${discountText} New total: ${new Intl.NumberFormat(
      "en-PH",
      {
        style: "currency",
        currency: "PHP",
      },
    ).format(newTotal)}. Successful payments kept: ${new Intl.NumberFormat(
      "en-PH",
      {
        style: "currency",
        currency: "PHP",
      },
    ).format(amountPaid)}. Remaining balance: ${new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(balanceDue)}. Reason: ${reason}`,
    user.email || "Admin",
  );

  revalidatePath(`/admin/orders/${order.id}`);
  revalidatePath("/admin/orders");
  revalidatePath("/admin");
  revalidatePath("/admin/customers");

  redirect(`/admin/orders/${order.id}?regular_price_updated=1`);
}

export async function requestCustomProjectPayment(formData: FormData) {
  const user = await requireAdmin();

  const orderId = String(formData.get("order_id") ?? "").trim();

  if (!orderId) throw new Error("Missing order ID.");

  const admin = createAdminSupabaseClient();

  const { data: order, error: orderError } = await admin
    .from("orders")
    .select(
      "id,order_number,total_amount,currency,payment_terms,amount_paid,balance_due,payment_status,order_status,final_payment_requested_at",
    )
    .eq("id", orderId)
    .maybeSingle();

  if (orderError || !order) throw new Error("Order not found.");

  if (!order.payment_terms) {
    throw new Error(
      "Only custom quotation orders can request an additional payment.",
    );
  }

  if (order.order_status === "CANCELLED") {
    throw new Error("A cancelled order cannot request another payment.");
  }

  const totalAmount = moneyNumber(order.total_amount);

  /*
   * Recalculate from completed payment history every time the admin requests
   * the remaining balance. This protects against stale order summary values.
   */
  const successfulAmountPaid = await getSuccessfulPaymentTotal(admin, order.id);
  const amountPaid = Math.min(totalAmount, successfulAmountPaid);
  const balanceDue = Math.max(
    0,
    Number((totalAmount - amountPaid).toFixed(2)),
  );

  if (amountPaid <= 0) {
    throw new Error(
      "The initial payment must be completed before requesting the final or additional balance.",
    );
  }

  if (!Number.isFinite(balanceDue) || balanceDue <= 0.005) {
    throw new Error("There is no remaining balance to request.");
  }

  const now = new Date().toISOString();
  const currency = String(order.currency || "PHP").trim().toUpperCase() || "PHP";

  /*
   * First synchronize the order summary with actual successful payments.
   * This never edits any completed order_payments row.
   */
  const { error: syncOrderError } = await admin
    .from("orders")
    .update({
      amount_paid: amountPaid,
      balance_due: balanceDue,
      payment_status: "PENDING",
      paid_at: null,
      updated_at: now,
    })
    .eq("id", order.id);

  if (syncOrderError) {
    throw new Error(
      `Unable to refresh the order balance: ${syncOrderError.message}`,
    );
  }

  const { data: pendingFinals, error: pendingFinalsError } = await admin
    .from("order_payments")
    .select("id,amount,status,created_at")
    .eq("order_id", order.id)
    .eq("payment_stage", "FINAL")
    .eq("status", "PENDING")
    .order("created_at", { ascending: false });

  if (pendingFinalsError) {
    throw new Error(
      `Unable to check the current pending balance payment: ${pendingFinalsError.message}`,
    );
  }

  const pendingFinal = pendingFinals?.[0] ?? null;
  const obsoletePendingFinals = (pendingFinals ?? []).slice(1);

  /*
   * Keep at most one active pending FINAL request. Older pending requests may
   * contain stale amounts/provider sessions after a scope change.
   */
  for (const obsolete of obsoletePendingFinals) {
    const { error: cancelError } = await admin
      .from("order_payments")
      .update({
        status: "CANCELLED",
        provider: null,
        paypal_order_id: null,
        paypal_capture_id: null,
        paymongo_checkout_session_id: null,
        paymongo_payment_id: null,
        paymongo_checkout_url: null,
        updated_at: now,
      })
      .eq("id", obsolete.id);

    if (cancelError) {
      throw new Error(
        `Unable to cancel an obsolete balance payment request: ${cancelError.message}`,
      );
    }
  }

  if (pendingFinal) {
    const { error: refreshError } = await admin
      .from("order_payments")
      .update({
        amount: balanceDue,
        currency,
        provider: null,
        status: "PENDING",
        paypal_order_id: null,
        paypal_capture_id: null,
        paymongo_checkout_session_id: null,
        paymongo_payment_id: null,
        paymongo_checkout_url: null,
        updated_at: now,
      })
      .eq("id", pendingFinal.id);

    if (refreshError) {
      throw new Error(
        `Unable to refresh the pending balance payment: ${refreshError.message}`,
      );
    }
  } else {
    const { error: insertError } = await admin
      .from("order_payments")
      .insert({
        order_id: order.id,
        payment_stage: "FINAL",
        amount: balanceDue,
        currency,
        provider: null,
        status: "PENDING",
      });

    if (insertError) {
      throw new Error(
        `Unable to create the balance payment request: ${insertError.message}`,
      );
    }
  }

  const { error: orderUpdateError } = await admin
    .from("orders")
    .update({
      final_payment_requested_at: now,
      amount_paid: amountPaid,
      balance_due: balanceDue,
      payment_status: "PENDING",
      paid_at: null,
      updated_at: now,
    })
    .eq("id", order.id);

  if (orderUpdateError) {
    throw new Error(
      `Payment request was prepared, but the order could not be updated: ${orderUpdateError.message}`,
    );
  }

  const formattedBalance = new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency,
  }).format(balanceDue);

  const formattedPaid = new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency,
  }).format(amountPaid);

  await addActivityNote(
    order.id,
    `${pendingFinal ? "Existing pending" : "New"} remaining-balance payment request activated for ${formattedBalance}. Successful payments remain recorded at ${formattedPaid}. The customer's existing private custom checkout link can now be used for this balance.`,
    user.email || "Admin",
  );

  await addQuotationActivityLogsForOrder(
    admin,
    order.id,
    [
      {
        actionType: "BALANCE_RECALCULATED",
        summary: `Remaining balance confirmed at ${formattedBalance} before requesting payment.`,
        details: {
          changed_by: user.email || "Admin",
          current_customer_total: totalAmount,
          successful_payments: amountPaid,
          remaining_balance: balanceDue,
          currency,
        },
      },
      {
        actionType: "FINAL_PAYMENT_REQUESTED",
        summary: `Remaining balance payment requested for ${formattedBalance}.`,
        details: {
          changed_by: user.email || "Admin",
          current_customer_total: totalAmount,
          successful_payments: amountPaid,
          remaining_balance: balanceDue,
          requested_amount: balanceDue,
          currency,
          request_type: pendingFinal ? "REFRESHED" : "CREATED",
          customer_checkout_link_reused: true,
        },
      },
    ],
  );

  revalidatePath(`/admin/orders/${order.id}`);
  revalidatePath("/admin/orders");
  revalidatePath("/admin");

  redirect(`/admin/orders/${order.id}?payment_requested=1`);
}

export async function recordManualPayment(formData: FormData) {
  const user = await requireAdmin();

  const orderId = String(formData.get("order_id") ?? "").trim();
  const amountRaw = String(formData.get("manual_amount") ?? "").trim();
  const method = String(formData.get("manual_method") ?? "").trim();
  const reference = String(formData.get("manual_reference") ?? "").trim();
  const reason = String(formData.get("manual_reason") ?? "").trim();

  if (!orderId) throw new Error("Missing order ID.");
  if (!method) throw new Error("Manual payment method is required.");
  if (!reason) throw new Error("A reason is required for a manual payment.");
  if (method.length > 100) throw new Error("Payment method is too long.");
  if (reference.length > 250) throw new Error("Payment reference is too long.");
  if (reason.length > 1000) throw new Error("Manual payment reason is too long.");

  const amount = moneyNumber(amountRaw);
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Manual payment amount must be greater than zero.");
  }

  const admin = createAdminSupabaseClient();

  const { data: order, error: orderError } = await admin
    .from("orders")
    .select(
      "id,order_number,total_amount,currency,payment_status,order_status,payment_terms,amount_paid,balance_due",
    )
    .eq("id", orderId)
    .maybeSingle();

  if (orderError || !order) throw new Error("Order not found.");
  if (order.order_status === "CANCELLED") {
    throw new Error("A cancelled order cannot receive a manual payment.");
  }

  const totalAmount = moneyNumber(order.total_amount);
  if (totalAmount <= 0) throw new Error("This order has an invalid total.");

  // Completed payment rows are the accounting source of truth.
  const successfulBefore = await getSuccessfulPaymentTotal(admin, order.id);
  const balanceBefore = Math.max(
    0,
    Number((totalAmount - successfulBefore).toFixed(2)),
  );

  if (balanceBefore <= 0.005) {
    throw new Error("This order is already fully paid.");
  }

  if (amount > balanceBefore + 0.005) {
    throw new Error(
      `Manual payment cannot exceed the remaining balance of ${balanceBefore.toFixed(2)}.`,
    );
  }

  const normalizedAmount = Math.min(amount, balanceBefore);
  const now = new Date().toISOString();
  const currency =
    String(order.currency || "PHP").trim().toUpperCase() || "PHP";

  const { data: linkedQuotation, error: quotationError } = await admin
    .from("quotation_requests")
    .select("id")
    .eq("order_id", order.id)
    .maybeSingle();

  if (quotationError) {
    throw new Error(
      `Unable to verify whether this is a quotation order: ${quotationError.message}`,
    );
  }

  const isCustomQuotationOrder = Boolean(linkedQuotation?.id);
  const paymentStage =
    isCustomQuotationOrder && order.payment_terms === "DEPOSIT_50"
      ? successfulBefore <= 0.005
        ? "DEPOSIT"
        : "FINAL"
      : successfulBefore <= 0.005 && normalizedAmount >= totalAmount - 0.005
        ? "FULL"
        : "FINAL";

  const { data: manualPayment, error: insertError } = await admin
    .from("order_payments")
    .insert({
      order_id: order.id,
      payment_stage: paymentStage,
      amount: normalizedAmount,
      currency,
      provider: "MANUAL",
      status: "COMPLETED",
      paid_at: now,
      updated_at: now,
    })
    .select("id")
    .single();

  if (insertError || !manualPayment) {
    throw new Error(
      `Unable to record the manual payment${insertError?.message ? `: ${insertError.message}` : "."}`,
    );
  }

  const successfulAfter = Number(
    (successfulBefore + normalizedAmount).toFixed(2),
  );
  const amountPaid = Math.min(totalAmount, successfulAfter);
  const balanceDue = Math.max(
    0,
    Number((totalAmount - amountPaid).toFixed(2)),
  );
  const fullyPaid = balanceDue <= 0.005;

  const orderUpdate: Record<string, unknown> = {
    payment_provider: "MANUAL",
    payment_status: fullyPaid ? "COMPLETED" : "PENDING",
    amount_paid: amountPaid,
    balance_due: balanceDue,
    updated_at: now,
  };

  if (fullyPaid) orderUpdate.paid_at = now;

  const { error: updateError } = await admin
    .from("orders")
    .update(orderUpdate)
    .eq("id", order.id);

  if (updateError) {
    // Avoid leaving a successful payment row behind if the order summary failed.
    await admin
      .from("order_payments")
      .delete()
      .eq("id", manualPayment.id)
      .eq("order_id", order.id);

    throw new Error(
      `Manual payment was not saved because the order could not be updated: ${updateError.message}`,
    );
  }

  const formattedAmount = new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency,
  }).format(normalizedAmount);

  const formattedBalance = new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency,
  }).format(balanceDue);

  await addActivityNote(
    order.id,
    `Emergency manual payment recorded: ${formattedAmount} via ${method}${reference ? ` · Ref: ${reference}` : ""}. Remaining balance: ${formattedBalance}. Reason: ${reason}`,
    user.email || "Admin",
  );

  if (isCustomQuotationOrder) {
    await addQuotationActivityLogsForOrder(admin, order.id, [
      {
        actionType: "MANUAL_PAYMENT_RECORDED",
        summary: `Manual payment of ${formattedAmount} recorded by Admin.`,
        details: {
          changed_by: user.email || "Admin",
          method,
          reference: reference || null,
          reason,
          amount: normalizedAmount,
          currency,
          successful_payments: amountPaid,
          remaining_balance: balanceDue,
          payment_status: fullyPaid ? "COMPLETED" : "PENDING",
        },
      },
    ]);

    revalidatePath(`/admin/quotation-requests/${linkedQuotation!.id}`);
  }

  revalidatePath(`/admin/orders/${order.id}`);
  revalidatePath("/admin/orders");
  revalidatePath("/admin");
  revalidatePath("/admin/customers");

  redirect(`/admin/orders/${order.id}?manual_payment=1`);
}


function normalizeProvider(value: string | null) {
  return (value || "").trim().toUpperCase();
}

async function loadRefundableOrder(orderId: string) {
  const admin = createAdminSupabaseClient();
  const { data: order, error } = await admin.from("orders").select(
    "id,order_number,payment_provider,payment_status,total_amount,currency,paypal_capture_id,paymongo_payment_id,refund_status,refunded_amount",
  ).eq("id", orderId).maybeSingle();
  if (error || !order) throw new Error("Order not found.");
  if (order.payment_status !== "COMPLETED") throw new Error("Only completed payments can be refunded.");
  if (order.refund_status === "REFUNDED") throw new Error("This order is already fully refunded.");
  return { admin, order };
}

function validateRefundAmount(amountRaw: string, totalAmount: number, alreadyRefunded: number) {
  const amount = Number(amountRaw);
  const remaining = Math.max(0, totalAmount - alreadyRefunded);
  if (!Number.isFinite(amount) || amount <= 0) throw new Error("Refund amount must be greater than zero.");
  if (amount > remaining + 0.00001) throw new Error("Refund amount exceeds the remaining refundable amount.");
  return { amount: Number(amount.toFixed(2)), remaining };
}

async function saveSuccessfulRefund({
  admin, order, amount, reason, provider, providerRefundId, providerStatus, refundType, createdBy,
}: {
  admin: ReturnType<typeof createAdminSupabaseClient>;
  order: { id: string; total_amount: number | string | null; refunded_amount: number | string | null; currency: string | null };
  amount: number; reason: string; provider: string; providerRefundId: string | null; providerStatus: string;
  refundType: "PROVIDER" | "EXTERNAL"; createdBy: string;
}) {
  const total = Number(order.total_amount ?? 0);
  const previous = Number(order.refunded_amount ?? 0);
  const next = Number((previous + amount).toFixed(2));
  const full = next >= total - 0.00001;
  const now = new Date().toISOString();

  const { error: historyError } = await admin.from("order_refunds").insert({
    order_id: order.id, provider, provider_refund_id: providerRefundId, amount,
    currency: order.currency || "PHP", reason, provider_status: providerStatus,
    refund_type: refundType, created_by: createdBy,
  });
  if (historyError) throw new Error("The provider refund succeeded, but TCL could not save the refund history. Do not refund again.");

  const { error: updateError } = await admin.from("orders").update({
    refund_status: full ? "REFUNDED" : "PARTIALLY_REFUNDED",
    refunded_amount: full ? total : next, refunded_at: now, refund_note: reason, updated_at: now,
  }).eq("id", order.id);
  if (updateError) throw new Error("The refund succeeded and was saved to refund history, but the order summary could not be updated.");

  await admin.from("order_notes").insert({
    order_id: order.id,
    note: `${full ? "Full" : "Partial"} refund ${refundType === "PROVIDER" ? "processed" : "recorded"}: ${new Intl.NumberFormat("en-PH", { style: "currency", currency: order.currency || "PHP" }).format(amount)} via ${provider}. Status: ${providerStatus}.${providerRefundId ? ` Refund ID: ${providerRefundId}.` : ""} Reason: ${reason}`,
    created_by: createdBy,
  });
  revalidatePath(`/admin/orders/${order.id}`);
  revalidatePath("/admin/orders");
  revalidatePath("/admin");
  revalidatePath("/admin/customers");
}

export async function processProviderRefund(formData: FormData) {
  const user = await requireAdmin();
  const orderId = String(formData.get("order_id") ?? "").trim();
  const amountRaw = String(formData.get("refund_amount") ?? "").trim();
  const reason = String(formData.get("refund_reason") ?? "").trim();
  if (!orderId) throw new Error("Missing order ID.");
  if (!reason) throw new Error("Refund reason is required.");

  const { admin, order } = await loadRefundableOrder(orderId);
  const total = Number(order.total_amount ?? 0);
  const alreadyRefunded = Number(order.refunded_amount ?? 0);
  const { amount } = validateRefundAmount(amountRaw, total, alreadyRefunded);
  const provider = normalizeProvider(order.payment_provider);
  let result: { id: string; status: string; amount: number; currency: string };

  if (provider === "PAYPAL") {
    if (!order.paypal_capture_id) throw new Error("This order is missing its PayPal capture ID.");
    result = await refundPayPalCapture({
      captureId: order.paypal_capture_id, amount, currency: order.currency || "PHP", note: reason,
      requestId: `refund-${order.id}-${alreadyRefunded.toFixed(2)}-${amount.toFixed(2)}`.slice(0, 78),
    });
    if (result.status !== "COMPLETED") throw new Error(`PayPal refund status is ${result.status}. Check PayPal before retrying.`);
  } else if (provider === "PAYMONGO") {
    if (!order.paymongo_payment_id) throw new Error("This order is missing its PayMongo payment ID.");
    result = await refundPayMongoPayment({ paymentId: order.paymongo_payment_id, amount, note: reason });
    if (result.status !== "SUCCEEDED") throw new Error(`PayMongo refund status is ${result.status}. Check PayMongo before retrying.`);
  } else {
    throw new Error("This payment provider does not support automatic refunds.");
  }

  await saveSuccessfulRefund({
    admin, order, amount: result.amount, reason, provider, providerRefundId: result.id,
    providerStatus: result.status, refundType: "PROVIDER", createdBy: user.email || "Admin",
  });
  redirect(`/admin/orders/${order.id}?refund_processed=1`);
}

export async function recordExternalRefund(formData: FormData) {
  const user = await requireAdmin();
  const orderId = String(formData.get("order_id") ?? "").trim();
  const amountRaw = String(formData.get("refund_amount") ?? "").trim();
  const reason = String(formData.get("refund_reason") ?? "").trim();
  if (!orderId) throw new Error("Missing order ID.");
  if (!reason) throw new Error("Refund reason is required.");

  const { admin, order } = await loadRefundableOrder(orderId);
  const total = Number(order.total_amount ?? 0);
  const alreadyRefunded = Number(order.refunded_amount ?? 0);
  const { amount } = validateRefundAmount(amountRaw, total, alreadyRefunded);
  await saveSuccessfulRefund({
    admin, order, amount, reason, provider: normalizeProvider(order.payment_provider) || "EXTERNAL",
    providerRefundId: null, providerStatus: "RECORDED", refundType: "EXTERNAL", createdBy: user.email || "Admin",
  });
  redirect(`/admin/orders/${order.id}?refund_recorded=1`);
}

export async function deleteOrder(formData: FormData) {
  await requireAdmin();
  const orderId = String(formData.get("order_id") ?? "").trim();
  const confirmation = String(formData.get("confirmation") ?? "").trim();
  if (!orderId) redirect("/admin/orders?deleteError=missing-order");
  if (confirmation !== "DELETE") redirect(`/admin/orders/${encodeURIComponent(orderId)}?deleteError=confirmation`);

  const admin = createAdminSupabaseClient();
  const tables = ["download_logs", "order_downloads", "order_refunds", "order_notes", "delivery_requests"];
  for (const table of tables) {
    const { error } = await admin.from(table).delete().eq("order_id", orderId);
    if (error) {
      console.error(`Delete ${table} error:`, error);
      redirect(`/admin/orders/${encodeURIComponent(orderId)}?deleteError=${encodeURIComponent(table)}`);
    }
  }

  const { error: invitationsError } = await admin.from("review_invitations").update({ order_id: null }).eq("order_id", orderId);
  if (invitationsError) redirect(`/admin/orders/${encodeURIComponent(orderId)}?deleteError=reviews`);

  const { error: orderError } = await admin.from("orders").delete().eq("id", orderId);
  if (orderError) redirect(`/admin/orders/${encodeURIComponent(orderId)}?deleteError=order`);

  revalidatePath("/admin");
  revalidatePath("/admin/orders");
  revalidatePath("/admin/customers");
  revalidatePath("/admin/deliveries");
  revalidatePath("/admin/reviews");
  redirect("/admin/orders?deleted=1");
}


export async function verifyBpiTransferProof(formData: FormData) {
  const user = await requireAdmin();
  const proofId = String(formData.get("proof_id") ?? "").trim();
  const orderId = String(formData.get("order_id") ?? "").trim();

  if (!proofId || !orderId) throw new Error("BPI proof verification details are incomplete.");

  const admin = createAdminSupabaseClient();
  const { data: proof, error } = await admin
    .from("bank_transfer_proofs")
    .select("id,order_id,payment_id,status,reference_number")
    .eq("id", proofId)
    .eq("order_id", orderId)
    .maybeSingle();

  if (error || !proof) throw new Error("BPI proof of payment was not found.");
  if (proof.status === "VERIFIED") {
    redirect(`/admin/orders/${orderId}?bpi_verified=1`);
  }
  if (proof.status !== "PENDING") throw new Error("Only a pending BPI proof can be verified.");

  const { data: order, error: orderError } = await admin
    .from("orders")
    .select(
      "id,order_number,customer_name,customer_email,product_name,total_amount,currency,payment_terms,payment_provider,payment_status",
    )
    .eq("id", orderId)
    .maybeSingle();

  if (orderError || !order) throw new Error("Order was not found.");

  const { data: linkedQuotation, error: linkedQuotationError } = await admin
    .from("quotation_requests")
    .select("id")
    .eq("order_id", orderId)
    .maybeSingle();

  if (linkedQuotationError) {
    throw new Error(
      `Unable to verify the order type: ${linkedQuotationError.message}`,
    );
  }

  const isCustomQuotationOrder = Boolean(linkedQuotation?.id);

  if (isCustomQuotationOrder) {
    /*
     * Preserve the existing quotation/custom-checkout accounting flow.
     * Deposits, final balances, quotation activity logs, and custom receipts
     * continue to be handled by completeCustomOrderPayment().
     */
    await completeCustomOrderPayment({
      paymentId: proof.payment_id,
      provider: "BPI",
    });
  } else {
    /*
     * Regular storefront BPI orders do not belong to the quotation system.
     * Complete their own payment row and order directly so they never trigger
     * custom-project pricing, quotation logs, or custom-payment receipts.
     */
    const { data: payment, error: paymentError } = await admin
      .from("order_payments")
      .select("id,order_id,amount,currency,provider,status")
      .eq("id", proof.payment_id)
      .eq("order_id", orderId)
      .maybeSingle();

    if (paymentError || !payment) {
      throw new Error("The BPI payment record for this order was not found.");
    }

    if (
      payment.provider &&
      String(payment.provider).trim().toUpperCase() !== "BPI"
    ) {
      throw new Error("This payment record is not a Direct BPI payment.");
    }

    const totalAmount = moneyNumber(order.total_amount);
    const paymentAmount = moneyNumber(payment.amount);

    if (totalAmount <= 0 || paymentAmount <= 0) {
      throw new Error("The BPI payment amount is invalid.");
    }

    if (Math.abs(totalAmount - paymentAmount) > 0.005) {
      throw new Error(
        "The submitted BPI payment does not match the regular order total.",
      );
    }

    const now = new Date().toISOString();

    if (payment.status !== "COMPLETED") {
      const { data: completedPayment, error: paymentUpdateError } = await admin
        .from("order_payments")
        .update({
          provider: "BPI",
          status: "COMPLETED",
          paid_at: now,
          updated_at: now,
        })
        .eq("id", payment.id)
        .eq("order_id", orderId)
        .neq("status", "COMPLETED")
        .select("id")
        .maybeSingle();

      if (paymentUpdateError) {
        throw new Error(
          `Unable to complete the BPI payment record: ${paymentUpdateError.message}`,
        );
      }

      /*
       * If another request completed the same payment first, continue safely.
       * The order synchronization below is idempotent.
       */
      if (!completedPayment) {
        const { data: refreshedPayment, error: refreshedPaymentError } =
          await admin
            .from("order_payments")
            .select("status")
            .eq("id", payment.id)
            .eq("order_id", orderId)
            .maybeSingle();

        if (
          refreshedPaymentError ||
          refreshedPayment?.status !== "COMPLETED"
        ) {
          throw new Error("The BPI payment could not be marked as completed.");
        }
      }
    }

    const { error: orderUpdateError } = await admin
      .from("orders")
      .update({
        payment_provider: "BPI",
        payment_status: "COMPLETED",
        amount_paid: totalAmount,
        balance_due: 0,
        paid_at: now,
        updated_at: now,
      })
      .eq("id", orderId);

    if (orderUpdateError) {
      throw new Error(
        `The BPI payment was completed, but the order could not be marked paid: ${orderUpdateError.message}`,
      );
    }
  }

  const now = new Date().toISOString();
  const { error: proofUpdateError } = await admin
    .from("bank_transfer_proofs")
    .update({
      status: "VERIFIED",
      reviewed_at: now,
      reviewed_by: user.email ?? user.id,
      rejection_reason: null,
      updated_at: now,
    })
    .eq("id", proof.id);

  if (proofUpdateError) throw new Error(`Payment was completed but proof status could not be updated: ${proofUpdateError.message}`);

  await addActivityNote(
    orderId,
    `BPI transfer manually verified by Admin${proof.reference_number ? ` · Ref: ${proof.reference_number}` : ""}.`,
    user.email ?? user.id,
  );

  /*
   * Send the regular-storefront BPI confirmation here only after the payment
   * and proof have both been successfully verified.
   *
   * Quotation-linked/custom orders keep their existing
   * completeCustomOrderPayment() notification flow untouched.
   */
  if (!isCustomQuotationOrder && order.customer_email) {
    try {
      const siteUrl = (
        process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://www.tclsystemsph.com"
      ).replace(/\/$/, "");

      const orderStatusUrl = `${siteUrl}/order-status`;
      const customerName = String(order.customer_name ?? "").trim();
      const firstName = customerName.split(/\s+/)[0] || "there";
      const currency =
        String(order.currency ?? "PHP").trim().toUpperCase() || "PHP";
      const totalAmount = moneyNumber(order.total_amount);
      const formattedAmount = new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency,
      }).format(totalAmount);

      const message = [
        `Hi ${firstName},`,
        "",
        "Your BPI payment has been verified and confirmed successfully.",
        "",
        "Your order is now marked as paid. We will continue processing your order and send you another update when there is meaningful progress.",
      ].join("\n");

      const html = tclEmailShell({
        eyebrow: "TCL PAYMENT NOTIFICATION",
        title: "Payment Confirmed",
        message,
        details: [
          { label: "Order Number", value: order.order_number },
          { label: "Package", value: order.product_name || "TCL Service" },
          { label: "Amount Paid", value: formattedAmount },
          { label: "Payment Method", value: "Direct BPI Bank Transfer" },
          {
            label: "Reference Number",
            value: proof.reference_number || "Not provided",
          },
          { label: "Payment Status", value: "Confirmed / Paid" },
        ],
        buttonLabel: "Check Order Status",
        buttonUrl: orderStatusUrl,
        note:
          "This is a notification-only email. Please do not reply to this message. For questions or concerns, contact TCL Systems & Digitals PH on Telegram: @tclsystemsanddigitalsph.",
      });

      const text = [
        "Payment Confirmed",
        "",
        message,
        "",
        `Order Number: ${order.order_number}`,
        `Package: ${order.product_name || "TCL Service"}`,
        `Amount Paid: ${formattedAmount}`,
        "Payment Method: Direct BPI Bank Transfer",
        `Reference Number: ${proof.reference_number || "Not provided"}`,
        "Payment Status: Confirmed / Paid",
        "",
        `Check Order Status: ${orderStatusUrl}`,
        "",
        "This is a notification-only email. Please do not reply.",
        "Questions or concerns: Telegram @tclsystemsanddigitalsph",
      ].join("\n");

      const emailResult = await sendTclEmail({
        to: order.customer_email,
        subject: "TCL Systems & Digitals PH - Payment Confirmed",
        html,
        text,
      });

      if (!emailResult.ok) {
        console.error(
          "BPI payment was verified but the customer confirmation email was not sent:",
          emailResult,
        );
      }
    } catch (emailError) {
      /*
       * Email delivery must never undo or invalidate a successfully verified
       * payment. Keep the payment/proof state authoritative.
       */
      console.error(
        "BPI payment was verified but customer email processing failed:",
        emailError,
      );
    }
  }

  revalidatePath(`/admin/orders/${orderId}`);
  redirect(`/admin/orders/${orderId}?bpi_verified=1`);
}

export async function rejectBpiTransferProof(formData: FormData) {
  const user = await requireAdmin();
  const proofId = String(formData.get("proof_id") ?? "").trim();
  const orderId = String(formData.get("order_id") ?? "").trim();
  const reason = String(formData.get("rejection_reason") ?? "").trim();

  if (!proofId || !orderId) throw new Error("BPI proof rejection details are incomplete.");
  if (!reason) throw new Error("Please enter a reason so the client knows what to correct.");

  const admin = createAdminSupabaseClient();
  const now = new Date().toISOString();

  const { data: proof, error } = await admin
    .from("bank_transfer_proofs")
    .update({
      status: "REJECTED",
      reviewed_at: now,
      reviewed_by: user.email ?? user.id,
      rejection_reason: reason,
      updated_at: now,
    })
    .eq("id", proofId)
    .eq("order_id", orderId)
    .eq("status", "PENDING")
    .select("id")
    .maybeSingle();

  if (error || !proof) throw new Error("Pending BPI proof could not be rejected.");

  await addActivityNote(orderId, `BPI proof rejected. Reason: ${reason}`, user.email ?? user.id);
  revalidatePath(`/admin/orders/${orderId}`);
  redirect(`/admin/orders/${orderId}?bpi_rejected=1`);
}
