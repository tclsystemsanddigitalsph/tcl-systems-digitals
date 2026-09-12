"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminSupabaseClient } from "@/lib/supabase-admin";
import { createServerSupabaseClient } from "@/lib/supabase-server";

const FULL_PAYMENT_FEE_PERCENT = 4;
const DEPOSIT_PAYMENT_FEE_PERCENT = 6;
const BPI_DIRECT_FEE_PERCENT = 0;

const allowedStatuses = [
  "NEW",
  "REVIEWING",
  "QUOTED",
  "ACCEPTED",
  "DECLINED",
  "CLOSED",
] as const;

type AllowedStatus = (typeof allowedStatuses)[number];
type PaymentTerms = "FULL" | "DEPOSIT_50" | null;

type QuotationItem = {
  id: string;
  item_name: string;
  item_description: string | null;
  amount: number;
  display_order: number;
};

type SubmittedItem = {
  id: string | null;
  item_name: string;
  item_description: string | null;
  amount: number;
  display_order: number;
};

async function requireAdmin() {
  const authSupabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await authSupabase.auth.getUser();

  if (!user) redirect("/admin/login");
  return user;
}

function toMoneyNumber(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === "") return 0;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function moneyToCentavos(value: number) {
  return Math.round((value + Number.EPSILON) * 100);
}

function calculateCustomPricing(subtotal: number, feePercent: number) {
  const subtotalCentavos = moneyToCentavos(subtotal);
  const safeFeePercent = Number.isFinite(feePercent) ? feePercent : 0;
  const feeCentavos = Math.round(
    (subtotalCentavos * safeFeePercent) / 100,
  );
  const totalCentavos = subtotalCentavos + feeCentavos;

  return {
    subtotal: subtotalCentavos / 100,
    processingFeePercent: safeFeePercent,
    processingFee: feeCentavos / 100,
    total: totalCentavos / 100,
  };
}

function money(value: number) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function paymentTermsLabel(value: PaymentTerms) {
  if (value === "DEPOSIT_50") return "50% Deposit + Remaining Balance";
  if (value === "FULL") return "Full Payment";
  return "Not set";
}

function statusLabel(value: string) {
  switch (value) {
    case "NEW": return "New";
    case "REVIEWING": return "Reviewing";
    case "QUOTED": return "Quoted";
    case "ACCEPTED": return "Accepted";
    case "DECLINED": return "Declined";
    case "CLOSED": return "Closed";
    default: return value;
  }
}

function cleanText(value: FormDataEntryValue | null) {
  return String(value ?? "").trim();
}

function readQuotationItems(formData: FormData): SubmittedItem[] {
  const ids = formData.getAll("item_id");
  const names = formData.getAll("item_name");
  const descriptions = formData.getAll("item_description");
  const amounts = formData.getAll("item_amount");

  const length = Math.max(ids.length, names.length, descriptions.length, amounts.length);
  const items: SubmittedItem[] = [];

  for (let index = 0; index < length; index += 1) {
    const id = cleanText(ids[index] ?? null) || null;
    const itemName = cleanText(names[index] ?? null);
    const description = cleanText(descriptions[index] ?? null);
    const amountRaw = cleanText(amounts[index] ?? null);

    // Completely blank rows are ignored.
    if (!itemName && !description && !amountRaw) continue;

    const amount = Number(amountRaw || "0");

    if (!Number.isFinite(amount) || amount < 0) {
      throw new Error(
        `Quotation item ${index + 1} has an invalid amount.`,
      );
    }

    /*
     * Keep saving resilient for older/manual quotations that may have an
     * amount or description but no item name yet. Instead of crashing the
     * whole quotation update, preserve the row with a neutral fallback name.
     * The Admin can rename it anytime later.
     */
    const safeItemName =
      itemName || `Quotation Item ${items.length + 1}`;

    items.push({
      id,
      item_name: safeItemName,
      item_description: description || null,
      amount,
      display_order: items.length,
    });
  }

  return items;
}

function normalized(value: string | null | undefined) {
  return String(value ?? "").trim();
}

export async function updateQuotationRequest(formData: FormData) {
  const adminUser = await requireAdmin();

  const id = cleanText(formData.get("id"));
  const status = cleanText(formData.get("status"));
  const adminNotes = cleanText(formData.get("admin_notes"));
  const quotedAmountRaw = cleanText(formData.get("quoted_amount"));
  const paymentTermsRaw = cleanText(formData.get("payment_terms"));
  const submittedItems = readQuotationItems(formData);

  if (!id) throw new Error("Quotation request ID is missing.");

  if (!allowedStatuses.includes(status as AllowedStatus)) {
    throw new Error("Invalid quotation status.");
  }

  let manualQuotedAmount: number | null = null;

  if (quotedAmountRaw) {
    const parsed = Number(quotedAmountRaw);
    if (!Number.isFinite(parsed) || parsed < 0) {
      throw new Error("Quoted amount must be a valid positive number.");
    }
    manualQuotedAmount = parsed;
  }

  let paymentTerms: PaymentTerms = null;

  if (paymentTermsRaw) {
    if (paymentTermsRaw !== "FULL" && paymentTermsRaw !== "DEPOSIT_50") {
      throw new Error("Invalid payment terms.");
    }
    paymentTerms = paymentTermsRaw;
  }

  // Once itemized scope exists, its sum becomes the agreed quotation total.
  const itemizedTotal =
    submittedItems.length > 0
      ? submittedItems.reduce((sum, item) => sum + item.amount, 0)
      : null;

  const quotedAmount = itemizedTotal ?? manualQuotedAmount;

  if (status === "QUOTED") {
    if (!quotedAmount || quotedAmount <= 0) {
      throw new Error(
        "Add quotation items with a total greater than ₱0 before marking this as Quoted.",
      );
    }

  }

  const supabase = createAdminSupabaseClient();

  const { data: previousRequest, error: previousRequestError } = await supabase
    .from("quotation_requests")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (previousRequestError) {
    throw new Error(
      `Unable to load the current quotation: ${previousRequestError.message}`,
    );
  }

  if (!previousRequest) throw new Error("Quotation request was not found.");

  const { data: existingItemsData, error: existingItemsError } = await supabase
    .from("quotation_items")
    .select("*")
    .eq("quotation_request_id", id)
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (existingItemsError) {
    throw new Error(
      `Unable to load quotation items: ${existingItemsError.message}`,
    );
  }

  const existingItems: QuotationItem[] = (existingItemsData ?? []).map((item) => ({
    id: String(item.id),
    item_name: String(item.item_name ?? ""),
    item_description: item.item_description ? String(item.item_description) : null,
    amount: toMoneyNumber(item.amount),
    display_order: Number(item.display_order ?? 0),
  }));

  const existingById = new Map(existingItems.map((item) => [item.id, item]));

  // Reject any submitted existing ID that does not belong to this quotation.
  for (const item of submittedItems) {
    if (item.id && !existingById.has(item.id)) {
      throw new Error("One of the quotation items is invalid for this quotation.");
    }
  }

  const oldStatus = String(previousRequest.status ?? "");
  const oldNotes = normalized(previousRequest.admin_notes);
  const oldQuotedAmount =
    previousRequest.quoted_amount === null
      ? null
      : toMoneyNumber(previousRequest.quoted_amount);
  const oldPaymentTerms = (previousRequest.payment_terms ?? null) as PaymentTerms;

  const now = new Date().toISOString();

  const payload: {
    status: string;
    admin_notes: string | null;
    quoted_amount: number | null;
    payment_terms: PaymentTerms;
    quoted_at?: string | null;
  } = {
    status,
    admin_notes: adminNotes || null,
    quoted_amount: quotedAmount,
    payment_terms: paymentTerms,
  };

  if (status === "QUOTED" && quotedAmount !== null) {
    payload.quoted_at =
      oldStatus === "QUOTED" && previousRequest.quoted_at
        ? previousRequest.quoted_at
        : now;
  }

  if (status !== "QUOTED" && quotedAmount === null) {
    payload.quoted_at = null;
  }

  const { error: requestUpdateError } = await supabase
    .from("quotation_requests")
    .update(payload)
    .eq("id", id);

  if (requestUpdateError) {
    throw new Error(
      `Unable to update quotation request: ${requestUpdateError.message}`,
    );
  }

  /*
   * Synchronize quotation_items.
   * Existing IDs are updated, omitted IDs are removed, blank-ID rows are inserted.
   */
  const submittedExistingIds = new Set(
    submittedItems.filter((item) => item.id).map((item) => item.id as string),
  );

  const removedItems = existingItems.filter(
    (item) => !submittedExistingIds.has(item.id),
  );

  if (removedItems.length > 0) {
    const { error: deleteError } = await supabase
      .from("quotation_items")
      .delete()
      .eq("quotation_request_id", id)
      .in(
        "id",
        removedItems.map((item) => item.id),
      );

    if (deleteError) {
      throw new Error(`Unable to remove quotation items: ${deleteError.message}`);
    }
  }

  for (const item of submittedItems) {
    if (item.id) {
      const { error: itemUpdateError } = await supabase
        .from("quotation_items")
        .update({
          item_name: item.item_name,
          item_description: item.item_description,
          amount: item.amount,
          display_order: item.display_order,
          updated_at: now,
        })
        .eq("quotation_request_id", id)
        .eq("id", item.id);

      if (itemUpdateError) {
        throw new Error(
          `Unable to update quotation item "${item.item_name}": ${itemUpdateError.message}`,
        );
      }
    } else {
      const { error: itemInsertError } = await supabase
        .from("quotation_items")
        .insert({
          quotation_request_id: id,
          item_name: item.item_name,
          item_description: item.item_description,
          amount: item.amount,
          display_order: item.display_order,
        });

      if (itemInsertError) {
        throw new Error(
          `Unable to add quotation item "${item.item_name}": ${itemInsertError.message}`,
        );
      }
    }
  }

  let oldOrderTotal: number | null = null;
  let newOrderTotal: number | null = null;
  let oldProcessingFee: number | null = null;
  let newProcessingFee: number | null = null;
  let oldBalance: number | null = null;
  let newBalance: number | null = null;
  let amountPaid: number | null = null;
  let linkedReceiptToken: string | null = null;
  let acceptedLockedFeePercent: number | null = null;

  /*
   * Accepted quotation pricing rule:
   * - quotation_requests.quoted_amount stays the scope SUBTOTAL.
   * - the client's accepted fee rate is locked on the linked order:
   *     online full = 4%, online 50% DP = 6%, direct BPI full = 0%.
   * - orders.total_amount is subtotal + the locked payment-provider fee.
   * - successful COMPLETED order_payments are the source of truth.
   * - past successful payments are NEVER changed when scope changes.
   * - remaining balance = current fee-inclusive order total - successful payments.
   */
  if (previousRequest.order_id && quotedAmount !== null) {
    const { data: order, error: orderLoadError } = await supabase
      .from("orders")
      .select(
        "id,receipt_token,payment_terms,base_price,processing_fee_percent,processing_fee,total_amount,amount_paid,balance_due,payment_status,paid_at",
      )
      .eq("id", previousRequest.order_id)
      .maybeSingle();

    if (orderLoadError) {
      throw new Error(
        `Quotation was updated, but the linked order could not be loaded: ${orderLoadError.message}`,
      );
    }

    if (order) {
      linkedReceiptToken = order.receipt_token
        ? String(order.receipt_token)
        : null;
      oldOrderTotal = toMoneyNumber(order.total_amount);
      oldProcessingFee = toMoneyNumber(order.processing_fee);
      oldBalance = toMoneyNumber(order.balance_due);

      const { data: completedPaymentsData, error: completedPaymentsError } =
        await supabase
          .from("order_payments")
          .select("amount")
          .eq("order_id", order.id)
          .eq("status", "COMPLETED");

      if (completedPaymentsError) {
        throw new Error(
          `Quotation was updated, but successful payments could not be recalculated: ${completedPaymentsError.message}`,
        );
      }

      const successfulPayments = Number(
        (completedPaymentsData ?? [])
          .reduce(
            (sum, payment) => sum + toMoneyNumber(payment.amount),
            0,
          )
          .toFixed(2),
      );

      const rawLockedFeePercent = order.processing_fee_percent;
      const hasLockedFeePercent =
        rawLockedFeePercent !== null &&
        rawLockedFeePercent !== undefined &&
        Number.isFinite(Number(rawLockedFeePercent));
      const fallbackFeePercent =
        order.payment_terms === "FULL"
          ? FULL_PAYMENT_FEE_PERCENT
          : DEPOSIT_PAYMENT_FEE_PERCENT;
      const lockedFeePercent = hasLockedFeePercent
        ? toMoneyNumber(rawLockedFeePercent)
        : fallbackFeePercent;
      acceptedLockedFeePercent = lockedFeePercent;
      const pricing = calculateCustomPricing(
        quotedAmount,
        lockedFeePercent,
      );

      newProcessingFee = pricing.processingFee;
      newOrderTotal = pricing.total;

      /*
       * Keep the actual successful payment rows untouched. The order summary
       * amount is capped at the current total so balance/status remain valid if
       * an item is later removed and the new total drops below what was paid.
       */
      amountPaid = Math.min(newOrderTotal, successfulPayments);
      newBalance = Math.max(
        0,
        Number((newOrderTotal - amountPaid).toFixed(2)),
      );

      const nextPaymentStatus =
        newBalance <= 0.005 ? "COMPLETED" : "PENDING";

      const orderUpdate: Record<string, unknown> = {
        base_price: pricing.subtotal,
        processing_fee_percent: pricing.processingFeePercent,
        processing_fee: pricing.processingFee,
        total_amount: pricing.total,
        amount_paid: amountPaid,
        balance_due: newBalance,
        payment_status: nextPaymentStatus,
        updated_at: now,
      };

      /*
       * If an added item creates a new balance on a previously fully-paid
       * order, it must no longer stay marked as paid. If an edited quotation
       * reduces the current balance to zero, preserve an existing paid_at
       * timestamp or mark the recalculated completion time.
       */
      if (nextPaymentStatus === "COMPLETED") {
        orderUpdate.paid_at = order.paid_at ?? now;
      } else {
        orderUpdate.paid_at = null;
      }

      const { error: orderUpdateError } = await supabase
        .from("orders")
        .update(orderUpdate)
        .eq("id", order.id);

      if (orderUpdateError) {
        throw new Error(
          `Quotation was updated, but linked order pricing/balance could not be updated: ${orderUpdateError.message}`,
        );
      }
    }
  }

  const activityRows: Array<{
    quotation_request_id: string;
    action_type: string;
    summary: string;
    details: Record<string, unknown>;
  }> = [];

  const automaticNoteRows: Array<{
    quotation_request_id: string;
    note_type: "AUTOMATIC";
    title: string;
    note: string;
    details: Record<string, unknown>;
  }> = [];

  const selectedFeePercent = previousRequest.order_id
    ? acceptedLockedFeePercent
    : null;

  const oldPricing =
    oldQuotedAmount === null || selectedFeePercent === null
      ? null
      : calculateCustomPricing(oldQuotedAmount, selectedFeePercent);
  const newPricing =
    quotedAmount === null || selectedFeePercent === null
      ? null
      : calculateCustomPricing(quotedAmount, selectedFeePercent);

  const commonTotals = {
    quotation_subtotal_before: oldQuotedAmount,
    quotation_subtotal_after: quotedAmount,
    processing_fee_percent: selectedFeePercent,
    processing_fee_before:
      oldProcessingFee ?? oldPricing?.processingFee ?? null,
    processing_fee_after:
      newProcessingFee ?? newPricing?.processingFee ?? null,
    order_total_before: oldOrderTotal ?? oldPricing?.total ?? null,
    order_total_after: newOrderTotal ?? newPricing?.total ?? null,
    successful_payments: amountPaid,
    balance_before: oldBalance,
    balance_after: newBalance,
    admin_email: adminUser.email ?? null,
  };

  /*
   * EXACT item tracking:
   * - Added
   * - Removed
   * - Updated name / description / amount
   */
  for (const removed of removedItems) {
    automaticNoteRows.push({
      quotation_request_id: id,
      note_type: "AUTOMATIC",
      title: `Removed: ${removed.item_name}`,
      note: `Removed "${removed.item_name}" (${money(removed.amount)}) from the quotation.`,
      details: {
        change_type: "REMOVED_ITEM",
        item_before: removed,
        ...commonTotals,
      },
    });
  }

  for (const item of submittedItems) {
    if (!item.id) {
      automaticNoteRows.push({
        quotation_request_id: id,
        note_type: "AUTOMATIC",
        title: `Added: ${item.item_name}`,
        note: `Added "${item.item_name}" — ${money(item.amount)}.${
          item.item_description ? ` ${item.item_description}` : ""
        }`,
        details: {
          change_type: "ADDED_ITEM",
          item_after: item,
          ...commonTotals,
        },
      });
      continue;
    }

    const oldItem = existingById.get(item.id);
    if (!oldItem) continue;

    const nameChanged = normalized(oldItem.item_name) !== normalized(item.item_name);
    const descriptionChanged =
      normalized(oldItem.item_description) !== normalized(item.item_description);
    const amountChanged = oldItem.amount !== item.amount;

    if (nameChanged || descriptionChanged || amountChanged) {
      const changes: string[] = [];

      if (nameChanged) {
        changes.push(`name: "${oldItem.item_name}" → "${item.item_name}"`);
      }

      if (amountChanged) {
        changes.push(`amount: ${money(oldItem.amount)} → ${money(item.amount)}`);
      }

      if (descriptionChanged) {
        changes.push(
          `description: "${normalized(oldItem.item_description) || "None"}" → "${
            normalized(item.item_description) || "None"
          }"`,
        );
      }

      automaticNoteRows.push({
        quotation_request_id: id,
        note_type: "AUTOMATIC",
        title: `Updated: ${item.item_name}`,
        note: `Updated "${item.item_name}" — ${changes.join("; ")}.`,
        details: {
          change_type: "UPDATED_ITEM",
          item_before: oldItem,
          item_after: item,
          ...commonTotals,
        },
      });
    }
  }

  const itemChangesCount = automaticNoteRows.length;

  if (itemChangesCount > 0) {
    activityRows.push({
      quotation_request_id: id,
      action_type: "QUOTATION_ITEMS_CHANGED",
      summary: `${itemChangesCount} quotation item change${
        itemChangesCount === 1 ? "" : "s"
      } saved.`,
      details: {
        item_changes: itemChangesCount,
        ...commonTotals,
      },
    });
  }

  if (oldStatus !== status) {
    activityRows.push({
      quotation_request_id: id,
      action_type: "STATUS_CHANGED",
      summary: `Status changed from ${statusLabel(oldStatus)} to ${statusLabel(status)}.`,
      details: {
        from: oldStatus,
        to: status,
        admin_email: adminUser.email ?? null,
      },
    });
  }

  if (oldStatus !== "QUOTED" && status === "QUOTED") {
    activityRows.push({
      quotation_request_id: id,
      action_type: "QUOTATION_MARKED_QUOTED",
      summary: "Quotation was finalized and marked as Quoted.",
      details: {
        quotation_subtotal: quotedAmount,
        payment_options: {
          full_payment: {
            processing_fee_percent: FULL_PAYMENT_FEE_PERCENT,
            project_total:
              quotedAmount === null
                ? null
                : calculateCustomPricing(
                    quotedAmount,
                    FULL_PAYMENT_FEE_PERCENT,
                  ).total,
          },
          deposit_50: {
            processing_fee_percent: DEPOSIT_PAYMENT_FEE_PERCENT,
            project_total:
              quotedAmount === null
                ? null
                : calculateCustomPricing(
                    quotedAmount,
                    DEPOSIT_PAYMENT_FEE_PERCENT,
                  ).total,
          },
          bpi_full: {
            processing_fee_percent: BPI_DIRECT_FEE_PERCENT,
            project_total:
              quotedAmount === null
                ? null
                : calculateCustomPricing(
                    quotedAmount,
                    BPI_DIRECT_FEE_PERCENT,
                  ).total,
            manual_verification: true,
          },
        },
        payment_terms: "CLIENT_SELECTS_ON_QUOTATION_LINK",
        quoted_at: payload.quoted_at ?? now,
        admin_email: adminUser.email ?? null,
      },
    });
  }

  if (oldQuotedAmount !== quotedAmount) {
    const oldAmountText =
      oldQuotedAmount === null ? "Not set" : money(oldQuotedAmount);
    const newAmountText =
      quotedAmount === null ? "Not set" : money(quotedAmount);

    activityRows.push({
      quotation_request_id: id,
      action_type: "QUOTATION_AMOUNT_CHANGED",
      summary: `Quotation subtotal changed from ${oldAmountText} to ${newAmountText}.`,
      details: commonTotals,
    });

    let note = `Quotation subtotal changed from ${oldAmountText} to ${newAmountText}.`;

    if (oldBalance !== null && newBalance !== null && oldBalance !== newBalance) {
      note += ` Remaining balance changed from ${money(oldBalance)} to ${money(newBalance)}.`;
    }

    automaticNoteRows.push({
      quotation_request_id: id,
      note_type: "AUTOMATIC",
      title: "Quotation pricing updated",
      note,
      details: {
        change_type: "TOTAL_CHANGED",
        ...commonTotals,
      },
    });

    if (
      oldBalance !== null &&
      newBalance !== null &&
      oldBalance !== newBalance
    ) {
      activityRows.push({
        quotation_request_id: id,
        action_type: "BALANCE_RECALCULATED",
        summary: `Remaining balance changed from ${money(oldBalance)} to ${money(newBalance)}.`,
        details: {
          order_total_before: oldOrderTotal,
          order_total_after: newOrderTotal,
          amount_paid: amountPaid,
          balance_before: oldBalance,
          balance_after: newBalance,
          admin_email: adminUser.email ?? null,
        },
      });
    }
  }

  if (oldPaymentTerms !== paymentTerms) {
    const note = `Payment terms changed from ${paymentTermsLabel(
      oldPaymentTerms,
    )} to ${paymentTermsLabel(paymentTerms)}.`;

    activityRows.push({
      quotation_request_id: id,
      action_type: "PAYMENT_TERMS_CHANGED",
      summary: note,
      details: {
        from: oldPaymentTerms,
        to: paymentTerms,
        admin_email: adminUser.email ?? null,
      },
    });

    automaticNoteRows.push({
      quotation_request_id: id,
      note_type: "AUTOMATIC",
      title: "Payment terms updated",
      note,
      details: {
        change_type: "PAYMENT_TERMS_CHANGED",
        from: oldPaymentTerms,
        to: paymentTerms,
        admin_email: adminUser.email ?? null,
      },
    });
  }

  if (oldNotes !== adminNotes) {
    activityRows.push({
      quotation_request_id: id,
      action_type: "SCOPE_NOTES_CHANGED",
      summary: oldNotes
        ? "Quotation / scope notes were updated."
        : "Quotation / scope notes were added.",
      details: {
        previous_text: oldNotes || null,
        new_text: adminNotes || null,
        admin_email: adminUser.email ?? null,
      },
    });

    automaticNoteRows.push({
      quotation_request_id: id,
      note_type: "AUTOMATIC",
      title: oldNotes
        ? "Quotation / scope notes updated"
        : "Quotation / scope notes added",
      note: adminNotes
        ? `Latest scope note: ${adminNotes}`
        : "Quotation / scope notes were cleared.",
      details: {
        change_type: "SCOPE_NOTES_CHANGED",
        previous_text: oldNotes || null,
        new_text: adminNotes || null,
        admin_email: adminUser.email ?? null,
      },
    });
  }

  if (activityRows.length > 0) {
    const { error: activityError } = await supabase
      .from("quotation_activity_logs")
      .insert(activityRows);

    if (activityError) {
      console.error("Unable to save quotation activity log:", activityError);
    }
  }

  if (automaticNoteRows.length > 0) {
    const { error: noteError } = await supabase
      .from("quotation_note_logs")
      .insert(automaticNoteRows);

    if (noteError) {
      console.error("Unable to save quotation note log:", noteError);
    }
  }

  revalidatePath("/admin/quotation-requests");
  revalidatePath(`/admin/quotation-requests/${id}`);

  if (previousRequest.secure_token) {
    revalidatePath(`/quotation/${previousRequest.secure_token}`);
  }

  if (previousRequest.order_id) {
    revalidatePath(`/admin/orders/${previousRequest.order_id}`);
  }

  if (linkedReceiptToken) {
    revalidatePath(`/checkout/custom/${linkedReceiptToken}`);
  }
}

export async function addManualQuotationNote(formData: FormData) {
  const adminUser = await requireAdmin();

  const id =
    cleanText(formData.get("id")) ||
    cleanText(formData.get("quotation_request_id"));
  const title = cleanText(formData.get("title"));
  const note = cleanText(formData.get("note"));

  if (!id) {
    throw new Error("Quotation request ID is missing.");
  }

  if (!note) {
    throw new Error("Write a note before saving.");
  }

  const supabase = createAdminSupabaseClient();

  const { data: request, error: requestError } = await supabase
    .from("quotation_requests")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (requestError) {
    throw new Error(
      `Unable to verify quotation request: ${requestError.message}`,
    );
  }

  if (!request) {
    throw new Error("Quotation request was not found.");
  }

  const { error: noteError } = await supabase
    .from("quotation_note_logs")
    .insert({
      quotation_request_id: id,
      note_type: "MANUAL",
      title: title || "Manual note",
      note,
      details: {
        admin_email: adminUser.email ?? null,
      },
    });

  if (noteError) {
    throw new Error(`Unable to save manual note: ${noteError.message}`);
  }

  const { error: activityError } = await supabase
    .from("quotation_activity_logs")
    .insert({
      quotation_request_id: id,
      action_type: "MANUAL_NOTE_ADDED",
      summary: title
        ? `Manual note added: ${title}`
        : "Manual note added.",
      details: {
        admin_email: adminUser.email ?? null,
      },
    });

  if (activityError) {
    console.error(
      "Unable to save manual note activity log:",
      activityError,
    );
  }

  revalidatePath(`/admin/quotation-requests/${id}`);
}

export async function deleteQuotationRequest(formData: FormData) {
  await requireAdmin();

  const id = cleanText(formData.get("id"));
  const confirmation = cleanText(formData.get("confirmation"));

  if (!id) {
    throw new Error("Quotation request ID is missing.");
  }

  if (confirmation !== "DELETE") {
    throw new Error('Type "DELETE" to confirm quotation deletion.');
  }

  const supabase = createAdminSupabaseClient();

  const { data: requestData, error: requestError } = await supabase
    .from("quotation_requests")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  const request = requestData as unknown as {
    id: string;
    order_id: string | null;
    full_name: string | null;
    business_name: string | null;
  } | null;

  if (requestError) {
    throw new Error(
      `Unable to verify quotation before deletion: ${requestError.message}`,
    );
  }

  if (!request) {
    throw new Error("Quotation request was not found.");
  }

  /*
   * Do not let Admin delete a quotation that already owns/links to an order.
   * At that point it is part of payment/accounting history.
   */
  if (request.order_id) {
    throw new Error(
      "This quotation is already linked to an order and cannot be deleted from the quotation page.",
    );
  }

  const { error: deleteError } = await supabase
    .from("quotation_requests")
    .delete()
    .eq("id", id)
    .is("order_id", null);

  if (deleteError) {
    throw new Error(`Unable to delete quotation: ${deleteError.message}`);
  }

  revalidatePath("/admin/quotation-requests");
  redirect("/admin/quotation-requests?deleted=1");
}

