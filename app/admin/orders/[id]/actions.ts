"use server";

import { refundPayMongoPayment, refundPayPalCapture } from "@/lib/refunds";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminSupabaseClient } from "@/lib/supabase-admin";
import { createServerSupabaseClient } from "@/lib/supabase-server";

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


export async function updateCustomProjectAmount(formData: FormData) {
  const user = await requireAdmin();

  const orderId = String(formData.get("order_id") ?? "").trim();
  const basePriceRaw = String(formData.get("base_price") ?? "").trim();
  const reason = String(formData.get("reason") ?? "").trim();

  if (!orderId) throw new Error("Missing order ID.");
  if (!reason) throw new Error("Adjustment reason is required.");
  if (reason.length > 1000) throw new Error("Adjustment reason is too long.");

  const newBasePrice = Number(basePriceRaw);

  if (!Number.isFinite(newBasePrice) || newBasePrice <= 0) {
    throw new Error("Project amount must be greater than zero.");
  }

  const admin = createAdminSupabaseClient();

  const { data: order, error: orderError } = await admin
    .from("orders")
    .select(
      "id,order_number,base_price,processing_fee_percent,processing_fee,total_amount,amount_paid,balance_due,payment_terms,payment_status,order_status",
    )
    .eq("id", orderId)
    .maybeSingle();

  if (orderError || !order) throw new Error("Order not found.");
  if (!order.payment_terms) {
    throw new Error("Only custom quotation orders can have their project amount edited here.");
  }
  if (order.order_status === "CANCELLED") {
    throw new Error("A cancelled order cannot be adjusted.");
  }

  const processingFeePercent = Number(order.processing_fee_percent ?? 0);
  const oldBasePrice = Number(order.base_price ?? 0);
  const amountPaid = Number(order.amount_paid ?? 0);

  const baseCentavos = Math.round((newBasePrice + Number.EPSILON) * 100);
  const feeCentavos = Math.round(
    (baseCentavos * processingFeePercent) / 100,
  );
  const totalCentavos = baseCentavos + feeCentavos;

  const normalizedBasePrice = baseCentavos / 100;
  const processingFee = feeCentavos / 100;
  const newTotal = totalCentavos / 100;

  if (newTotal < amountPaid - 0.005) {
    throw new Error(
      `The new project total cannot be lower than the amount already paid (${amountPaid.toFixed(2)}).`,
    );
  }

  const balanceDue = Math.max(
    0,
    Number((newTotal - amountPaid).toFixed(2)),
  );

  const nextPaymentStatus =
    balanceDue <= 0.005
      ? "COMPLETED"
      : amountPaid > 0
        ? "PARTIALLY_PAID"
        : "PENDING";

  const now = new Date().toISOString();

  const orderUpdate: Record<string, unknown> = {
    base_price: normalizedBasePrice,
    processing_fee: processingFee,
    total_amount: newTotal,
    balance_due: balanceDue,
    payment_status: nextPaymentStatus,
    updated_at: now,
  };

  if (nextPaymentStatus === "COMPLETED") {
    if (order.payment_status !== "COMPLETED") {
      orderUpdate.paid_at = now;
    }
  } else {
    orderUpdate.paid_at = null;
  }

  const { error: updateError } = await admin
    .from("orders")
    .update(orderUpdate)
    .eq("id", order.id);

  if (updateError) {
    throw new Error(`Unable to update project amount: ${updateError.message}`);
  }

  const { data: payments, error: paymentsError } = await admin
    .from("order_payments")
    .select("id,payment_stage,status")
    .eq("order_id", order.id);

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
      !depositCompleted
    ) {
      nextAmount = Number((newTotal / 2).toFixed(2));
    } else if (
      order.payment_terms === "FULL" &&
      payment.payment_stage === "FULL" &&
      amountPaid <= 0
    ) {
      nextAmount = newTotal;
    } else if (payment.payment_stage === "FINAL") {
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
    `Custom project amount adjusted from ${format(oldBasePrice)} to ${format(normalizedBasePrice)} before processing fee. New customer total: ${format(newTotal)}. Amount already paid: ${format(amountPaid)}. Remaining balance: ${format(balanceDue)}. Reason: ${reason}`,
    user.email || "Admin",
  );

  revalidatePath(`/admin/orders/${order.id}`);
  revalidatePath("/admin/orders");
  revalidatePath("/admin");

  redirect(`/admin/orders/${order.id}?amount_updated=1`);
}


export async function requestCustomProjectPayment(formData: FormData) {
  const user = await requireAdmin();

  const orderId = String(formData.get("order_id") ?? "").trim();

  if (!orderId) throw new Error("Missing order ID.");

  const admin = createAdminSupabaseClient();

  const { data: order, error: orderError } = await admin
    .from("orders")
    .select(
      "id,order_number,payment_terms,amount_paid,balance_due,payment_status,order_status,final_payment_requested_at",
    )
    .eq("id", orderId)
    .maybeSingle();

  if (orderError || !order) throw new Error("Order not found.");

  if (!order.payment_terms) {
    throw new Error("Only custom quotation orders can request an additional payment.");
  }

  if (order.order_status === "CANCELLED") {
    throw new Error("A cancelled order cannot request another payment.");
  }

  const amountPaid = Number(order.amount_paid ?? 0);
  const balanceDue = Number(order.balance_due ?? 0);

  if (amountPaid <= 0) {
    throw new Error(
      "The initial payment must be completed before requesting the final or additional balance.",
    );
  }

  if (!Number.isFinite(balanceDue) || balanceDue <= 0.005) {
    throw new Error("There is no remaining balance to request.");
  }

  const now = new Date().toISOString();

  const { data: pendingFinal, error: pendingFinalError } = await admin
    .from("order_payments")
    .select("id,amount,status,created_at")
    .eq("order_id", order.id)
    .eq("payment_stage", "FINAL")
    .eq("status", "PENDING")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (pendingFinalError) {
    throw new Error(
      `Unable to check the current pending balance payment: ${pendingFinalError.message}`,
    );
  }

  if (pendingFinal) {
    const { error: refreshError } = await admin
      .from("order_payments")
      .update({
        amount: Number(balanceDue.toFixed(2)),
        currency: "PHP",
        provider: null,
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
        amount: Number(balanceDue.toFixed(2)),
        currency: "PHP",
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
    currency: "PHP",
  }).format(balanceDue);

  await addActivityNote(
    order.id,
    `${pendingFinal ? "Existing pending" : "New"} final/additional payment request activated for ${formattedBalance}. The customer's existing private custom checkout link can now be used for this balance.`,
    user.email || "Admin",
  );

  revalidatePath(`/admin/orders/${order.id}`);
  revalidatePath("/admin/orders");
  revalidatePath("/admin");

  redirect(`/admin/orders/${order.id}?payment_requested=1`);
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
