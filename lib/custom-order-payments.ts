import "server-only";

import { createAdminSupabaseClient } from "@/lib/supabase-admin";

export type CustomPaymentStage = "FULL" | "DEPOSIT" | "FINAL";

type OrderRow = {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  product_name: string;
  base_price: number | string | null;
  processing_fee_percent: number | string | null;
  processing_fee: number | string | null;
  total_amount: number | string;
  currency: string;
  payment_status: string;
  payment_terms: string | null;
  amount_paid: number | string | null;
  balance_due: number | string | null;
  order_status: string | null;
  receipt_token: string;
};

type PaymentRow = {
  id: string;
  order_id: string;
  payment_stage: CustomPaymentStage;
  amount: number | string;
  currency: string;
  provider: string | null;
  status: string;
  paypal_order_id: string | null;
  paypal_capture_id: string | null;
  paymongo_checkout_session_id: string | null;
  paymongo_payment_id: string | null;
  paymongo_checkout_url: string | null;
  paid_at: string | null;
  created_at: string;
};

type QuotationLinkRow = {
  id: string;
};

export type CustomCheckoutState = {
  order: OrderRow;
  payments: PaymentRow[];
  currentPayment: PaymentRow | null;
  state:
    | "PAYMENT_DUE"
    | "WAITING_FOR_FINAL"
    | "FULLY_PAID"
    | "CANCELLED";
};

function asMoney(value: number | string | null | undefined) {
  const number = Number(value ?? 0);
  return Number.isFinite(number) ? Number(number.toFixed(2)) : 0;
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

function sumCompletedPayments(payments: PaymentRow[]) {
  return Number(
    payments
      .filter((payment) => payment.status === "COMPLETED")
      .reduce((sum, payment) => sum + asMoney(payment.amount), 0)
      .toFixed(2),
  );
}

function latestPendingPayment(
  payments: PaymentRow[],
  stage: CustomPaymentStage,
) {
  return [...payments]
    .reverse()
    .find(
      (payment) =>
        payment.payment_stage === stage && payment.status === "PENDING",
    );
}

async function addQuotationPaymentActivityLogs({
  supabase,
  orderId,
  paymentId,
  paymentStage,
  paymentAmount,
  currency,
  provider,
  orderTotal,
  successfulPayments,
  remainingBalance,
  fullyPaid,
}: {
  supabase: ReturnType<typeof createAdminSupabaseClient>;
  orderId: string;
  paymentId: string;
  paymentStage: CustomPaymentStage;
  paymentAmount: number;
  currency: string;
  provider: "PAYPAL" | "PAYMONGO" | "BPI";
  orderTotal: number;
  successfulPayments: number;
  remainingBalance: number;
  fullyPaid: boolean;
}) {
  const { data: quotationData, error: quotationError } = await supabase
    .from("quotation_requests")
    .select("*")
    .eq("order_id", orderId)
    .maybeSingle();

  if (quotationError) {
    console.error(
      "Unable to find linked quotation for payment activity log:",
      quotationError,
    );
    return;
  }

  const quotation = quotationData as unknown as QuotationLinkRow | null;

  if (!quotation?.id) {
    return;
  }

  const logs: Array<{
    quotation_request_id: string;
    action_type: string;
    summary: string;
    details: Record<string, unknown>;
  }> = [];

  const baseDetails = {
    order_id: orderId,
    payment_id: paymentId,
    payment_stage: paymentStage,
    payment_amount: paymentAmount,
    currency,
    provider,
    current_order_total: orderTotal,
    successful_payments: successfulPayments,
    remaining_balance: remainingBalance,
  };

  if (paymentStage === "DEPOSIT") {
    logs.push({
      quotation_request_id: quotation.id,
      action_type: "DEPOSIT_PAID",
      summary: "50% deposit received.",
      details: baseDetails,
    });
  } else if (paymentStage === "FINAL") {
    logs.push({
      quotation_request_id: quotation.id,
      action_type: "REMAINING_BALANCE_PAID",
      summary: "Remaining balance payment received.",
      details: baseDetails,
    });
  } else {
    logs.push({
      quotation_request_id: quotation.id,
      action_type: "FULL_PAYMENT_RECEIVED",
      summary: "Full payment received.",
      details: baseDetails,
    });
  }

  if (fullyPaid) {
    logs.push({
      quotation_request_id: quotation.id,
      action_type: "PROJECT_FULLY_PAID",
      summary: "Project is fully paid.",
      details: baseDetails,
    });
  } else {
    logs.push({
      quotation_request_id: quotation.id,
      action_type: "BALANCE_RECALCULATED",
      summary: "Remaining balance recalculated after payment.",
      details: baseDetails,
    });
  }

  const { error: logError } = await supabase
    .from("quotation_activity_logs")
    .insert(logs);

  if (logError) {
    /*
     * Activity logging must never block a successful provider callback
     * or webhook. The payment remains completed even if log insertion fails.
     */
    console.error("Quotation payment activity log insert error:", logError);
  }
}

export async function getCustomCheckoutState(
  receiptToken: string,
): Promise<CustomCheckoutState | null> {
  const token = receiptToken.trim();

  if (!token) return null;

  const supabase = createAdminSupabaseClient();

  const { data: initialOrderData, error: orderError } = await supabase
    .from("orders")
    .select("*")
    .eq("receipt_token", token)
    .maybeSingle();

  if (orderError) {
    throw new Error(
      `Unable to load custom checkout order: ${orderError.message}`,
    );
  }

  let order = initialOrderData as unknown as OrderRow | null;

  if (!order || !order.payment_terms) {
    return null;
  }

  const { data: initialPaymentData, error: paymentError } = await supabase
    .from("order_payments")
    .select("*")
    .eq("order_id", order.id)
    .order("created_at", { ascending: true });

  if (paymentError) {
    throw new Error(
      `Unable to load custom checkout payments: ${paymentError.message}`,
    );
  }

  let payments = (initialPaymentData ?? []) as unknown as PaymentRow[];

  /*
   * Keep the linked custom order synchronized with the accepted quotation.
   *
   * The accepted order stores the payment plan and its locked fee rate:
   *   FULL via online provider = 4% processing fee
   *   DEPOSIT_50 via online provider = 6% processing fee
   *   FULL via direct BPI = 0% processing fee
   *
   * Future quotation/scope updates keep that same accepted fee percentage.
   * Completed payment rows are historical records and are NEVER changed.
   * Remaining balance is always:
   *   current fee-inclusive project total - all successful payments
   */
  const { data: quotationData, error: quotationError } = await supabase
    .from("quotation_requests")
    .select("id,quoted_amount")
    .eq("order_id", order.id)
    .maybeSingle();

  if (quotationError) {
    throw new Error(
      `Unable to load linked quotation pricing: ${quotationError.message}`,
    );
  }

  const quotationSubtotal = asMoney(quotationData?.quoted_amount);

  if (quotationData?.id && quotationSubtotal > 0) {
    const rawLockedFeePercent = order.processing_fee_percent;
    const hasLockedFeePercent =
      rawLockedFeePercent !== null &&
      rawLockedFeePercent !== undefined &&
      Number.isFinite(Number(rawLockedFeePercent));
    const fallbackFeePercent = order.payment_terms === "FULL" ? 4 : 6;
    const lockedFeePercent = hasLockedFeePercent
      ? asMoney(rawLockedFeePercent)
      : fallbackFeePercent;
    const pricing = calculateCustomPricing(
      quotationSubtotal,
      lockedFeePercent,
    );
    const successfulPaidRaw = sumCompletedPayments(payments);
    const amountPaid = Math.min(pricing.total, successfulPaidRaw);
    const balanceDue = Math.max(
      0,
      Number((pricing.total - amountPaid).toFixed(2)),
    );

    /*
     * The orders table only uses its existing coarse payment status values.
     * Partial/deposit progress is tracked by amount_paid, balance_due, and
     * order_payments. Keep payment_status PENDING until the project is fully paid.
     */
    const nextPaymentStatus =
      balanceDue <= 0.005 ? "COMPLETED" : "PENDING";

    const currentTotal = asMoney(order.total_amount);
    const currentPaid = asMoney(order.amount_paid);
    const currentBalance = asMoney(order.balance_due);

    const orderNeedsSync =
      Math.abs(currentTotal - pricing.total) > 0.005 ||
      Math.abs(currentPaid - amountPaid) > 0.005 ||
      Math.abs(currentBalance - balanceDue) > 0.005 ||
      order.payment_status !== nextPaymentStatus;

    if (orderNeedsSync) {
      const { error: orderSyncError } = await supabase
        .from("orders")
        .update({
          base_price: pricing.subtotal,
          processing_fee_percent: pricing.processingFeePercent,
          processing_fee: pricing.processingFee,
          total_amount: pricing.total,
          amount_paid: amountPaid,
          balance_due: balanceDue,
          payment_status: nextPaymentStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", order.id);

      if (orderSyncError) {
        throw new Error(
          `Unable to synchronize custom project pricing: ${orderSyncError.message}`,
        );
      }
    }

    const completedDeposit = payments.some(
      (payment) =>
        payment.payment_stage === "DEPOSIT" &&
        payment.status === "COMPLETED",
    );

    const completedFull = payments.some(
      (payment) =>
        payment.payment_stage === "FULL" &&
        payment.status === "COMPLETED",
    );

    const now = new Date().toISOString();

    for (const payment of payments) {
      if (payment.status !== "PENDING") continue;

      let correctedAmount: number | null = null;

      if (
        order.payment_terms === "DEPOSIT_50" &&
        payment.payment_stage === "DEPOSIT" &&
        !completedDeposit &&
        successfulPaidRaw <= 0
      ) {
        correctedAmount =
          Math.round(moneyToCentavos(pricing.total) / 2) / 100;
      } else if (
        order.payment_terms === "FULL" &&
        payment.payment_stage === "FULL" &&
        !completedFull &&
        successfulPaidRaw <= 0
      ) {
        correctedAmount = pricing.total;
      } else if (payment.payment_stage === "FINAL") {
        correctedAmount = balanceDue;
      }

      if (correctedAmount === null) continue;

      if (correctedAmount <= 0.005) {
        const { error: cancelError } = await supabase
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

        if (cancelError) {
          throw new Error(
            `Unable to cancel an obsolete payment request: ${cancelError.message}`,
          );
        }

        continue;
      }

      if (Math.abs(asMoney(payment.amount) - correctedAmount) <= 0.005) {
        continue;
      }

      /*
       * If the amount changes, clear any provider session created for the old
       * amount so the next click always opens a checkout for the corrected sum.
       */
      const { error: paymentSyncError } = await supabase
        .from("order_payments")
        .update({
          amount: correctedAmount,
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

      if (paymentSyncError) {
        throw new Error(
          `Unable to synchronize the current payment amount: ${paymentSyncError.message}`,
        );
      }
    }

    /*
     * Reload after synchronization so every caller — quotation page,
     * checkout page, PayPal, and PayMongo — receives the same current values.
     */
    const [
      { data: refreshedOrderData, error: refreshedOrderError },
      { data: refreshedPaymentData, error: refreshedPaymentError },
    ] = await Promise.all([
      supabase
        .from("orders")
        .select("*")
        .eq("id", order.id)
        .single(),
      supabase
        .from("order_payments")
        .select("*")
        .eq("order_id", order.id)
        .order("created_at", { ascending: true }),
    ]);

    if (refreshedOrderError) {
      throw new Error(
        `Unable to reload synchronized custom order: ${refreshedOrderError.message}`,
      );
    }

    if (refreshedPaymentError) {
      throw new Error(
        `Unable to reload synchronized payments: ${refreshedPaymentError.message}`,
      );
    }

    order = refreshedOrderData as unknown as OrderRow;
    payments = (refreshedPaymentData ?? []) as unknown as PaymentRow[];
  }

  if (order.order_status === "CANCELLED") {
    return {
      order,
      payments,
      currentPayment: null,
      state: "CANCELLED",
    };
  }

  const total = asMoney(order.total_amount);

  /*
   * Successful payment rows are the source of truth.
   * Do not rely on a possibly stale orders.amount_paid value when deciding
   * whether the order still has a balance after a quotation/scope change.
   */
  const successfulPaid = sumCompletedPayments(payments);
  const paid = Math.min(total, successfulPaid);
  const remaining = Math.max(
    0,
    Number((total - paid).toFixed(2)),
  );

  if (total <= 0 || remaining <= 0.005) {
    return {
      order: {
        ...order,
        amount_paid: paid,
        balance_due: 0,
      },
      payments,
      currentPayment: null,
      state: "FULLY_PAID",
    };
  }

  const checkoutOrder: OrderRow = {
    ...order,
    amount_paid: paid,
    balance_due: remaining,
  };

  const pendingFinal = latestPendingPayment(payments, "FINAL");

  if (order.payment_terms === "FULL") {
    const completedFull = payments.some(
      (payment) =>
        payment.payment_stage === "FULL" &&
        payment.status === "COMPLETED",
    );

    if (!completedFull && paid <= 0) {
      const pendingFull = latestPendingPayment(payments, "FULL");

      return {
        order: checkoutOrder,
        payments,
        currentPayment: pendingFull ?? null,
        state: pendingFull ? "PAYMENT_DUE" : "WAITING_FOR_FINAL",
      };
    }

    if (pendingFinal) {
      return {
        order: checkoutOrder,
        payments,
        currentPayment: pendingFinal,
        state: "PAYMENT_DUE",
      };
    }

    return {
      order: checkoutOrder,
      payments,
      currentPayment: null,
      state: "WAITING_FOR_FINAL",
    };
  }

  if (order.payment_terms === "DEPOSIT_50") {
    const completedDeposit = payments.some(
      (payment) =>
        payment.payment_stage === "DEPOSIT" &&
        payment.status === "COMPLETED",
    );

    if (!completedDeposit) {
      const pendingDeposit = latestPendingPayment(payments, "DEPOSIT");

      return {
        order: checkoutOrder,
        payments,
        currentPayment: pendingDeposit ?? null,
        state: pendingDeposit ? "PAYMENT_DUE" : "WAITING_FOR_FINAL",
      };
    }

    /*
     * Once the deposit succeeds, never recalculate or replace it.
     * Future scope/fee changes affect only the remaining balance:
     * current project total - all successful payments.
     */
    if (pendingFinal) {
      return {
        order: checkoutOrder,
        payments,
        currentPayment: pendingFinal,
        state: "PAYMENT_DUE",
      };
    }

    return {
      order: checkoutOrder,
      payments,
      currentPayment: null,
      state: "WAITING_FOR_FINAL",
    };
  }

  return null;
}

export async function completeCustomOrderPayment({
  paymentId,
  provider,
  paypalCaptureId,
  paymongoPaymentId,
}: {
  paymentId: string;
  provider: "PAYPAL" | "PAYMONGO" | "BPI";
  paypalCaptureId?: string | null;
  paymongoPaymentId?: string | null;
}) {
  const supabase = createAdminSupabaseClient();

  const { data: paymentData, error: paymentError } = await supabase
    .from("order_payments")
    .select("*")
    .eq("id", paymentId)
    .maybeSingle();

  if (paymentError) {
    throw new Error(
      `Unable to load payment record: ${paymentError.message}`,
    );
  }

  const payment = paymentData as unknown as PaymentRow | null;

  if (!payment) {
    throw new Error("Payment record not found.");
  }

  const now = new Date().toISOString();

  /*
   * Only the request that actually changes this row from non-completed to
   * COMPLETED is allowed to create quotation payment activity logs.
   * Repeated PayPal callbacks / PayMongo webhooks stay idempotent.
   */
  let completedByThisCall = false;

  if (payment.status !== "COMPLETED") {
    const paymentUpdate: Record<string, unknown> = {
      provider,
      status: "COMPLETED",
      paid_at: now,
      updated_at: now,
    };

    if (paypalCaptureId) {
      paymentUpdate.paypal_capture_id = paypalCaptureId;
    }

    if (paymongoPaymentId) {
      paymentUpdate.paymongo_payment_id = paymongoPaymentId;
    }

    const { data: transitionedPayment, error: updatePaymentError } =
      await supabase
        .from("order_payments")
        .update(paymentUpdate)
        .eq("id", payment.id)
        .neq("status", "COMPLETED")
        .select("*")
        .maybeSingle();

    if (updatePaymentError) {
      throw new Error(
        `Unable to complete payment record: ${updatePaymentError.message}`,
      );
    }

    completedByThisCall = Boolean(transitionedPayment);
  }

  const { data: orderData, error: orderError } = await supabase
    .from("orders")
    .select("*")
    .eq("id", payment.order_id)
    .single();

  if (orderError) {
    throw new Error(
      `Unable to load payment order: ${orderError.message}`,
    );
  }

  const order = orderData as unknown as (OrderRow & {
    deposit_paid_at?: string | null;
    paypal_capture_id?: string | null;
    paymongo_payment_id?: string | null;
  });

  const { data: completedPaymentsData, error: completedPaymentsError } =
    await supabase
      .from("order_payments")
      .select("*")
      .eq("order_id", order.id)
      .eq("status", "COMPLETED");

  if (completedPaymentsError) {
    throw new Error(
      `Unable to calculate paid amount: ${completedPaymentsError.message}`,
    );
  }

  const completedPayments =
    (completedPaymentsData ?? []) as unknown as PaymentRow[];

  const totalAmount = asMoney(order.total_amount);

  /*
   * Successful order_payments are the source of truth for amount paid.
   * Existing successful payments are never edited because the quotation
   * changes later.
   */
  const successfulAmountPaid = Number(
    completedPayments
      .reduce((sum, row) => sum + asMoney(row.amount), 0)
      .toFixed(2),
  );

  const amountPaid = Math.min(totalAmount, successfulAmountPaid);
  const balanceDue = Math.max(
    0,
    Number((totalAmount - amountPaid).toFixed(2)),
  );
  const fullyPaid = balanceDue <= 0.005;

  const orderUpdate: Record<string, unknown> = {
    payment_provider: provider,
    payment_status: fullyPaid ? "COMPLETED" : "PENDING",
    amount_paid: amountPaid,
    balance_due: balanceDue,
    updated_at: now,
  };

  if (fullyPaid) {
    orderUpdate.paid_at = now;
  } else {
    /*
     * Important when an already-paid quotation later increases:
     * the order must no longer remain marked fully paid.
     */
    orderUpdate.paid_at = null;
  }

  if (
    payment.payment_stage === "DEPOSIT" &&
    !order.deposit_paid_at
  ) {
    orderUpdate.deposit_paid_at = now;
  }

  if (paypalCaptureId) {
    orderUpdate.paypal_capture_id = paypalCaptureId;
  }

  if (paymongoPaymentId) {
    orderUpdate.paymongo_payment_id = paymongoPaymentId;
  }

  const { error: orderUpdateError } = await supabase
    .from("orders")
    .update(orderUpdate)
    .eq("id", order.id);

  if (orderUpdateError) {
    throw new Error(
      `Unable to update order payment totals: ${orderUpdateError.message}`,
    );
  }

  if (completedByThisCall) {
    await addQuotationPaymentActivityLogs({
      supabase,
      orderId: order.id,
      paymentId: payment.id,
      paymentStage: payment.payment_stage,
      paymentAmount: asMoney(payment.amount),
      currency: payment.currency || order.currency || "PHP",
      provider,
      orderTotal: totalAmount,
      successfulPayments: amountPaid,
      remainingBalance: balanceDue,
      fullyPaid,
    });
  }

  return {
    orderId: order.id,
    paymentStage: payment.payment_stage,
    amountPaid,
    balanceDue,
    fullyPaid,
  };
}
