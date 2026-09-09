import "server-only";

import { createAdminSupabaseClient } from "@/lib/supabase-admin";

export type CustomPaymentStage = "FULL" | "DEPOSIT" | "FINAL";

type OrderRow = {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  product_name: string;
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

function isCompleted(payment: PaymentRow | undefined) {
  return payment?.status === "COMPLETED";
}

export async function getCustomCheckoutState(
  receiptToken: string,
): Promise<CustomCheckoutState | null> {
  const token = receiptToken.trim();

  if (!token) return null;

  const supabase = createAdminSupabaseClient();

  const { data: orderData, error: orderError } = await supabase
    .from("orders")
    .select(
      "id,order_number,customer_name,customer_email,product_name,total_amount,currency,payment_status,payment_terms,amount_paid,balance_due,order_status,receipt_token",
    )
    .eq("receipt_token", token)
    .maybeSingle();

  if (orderError) {
    throw new Error(`Unable to load custom checkout order: ${orderError.message}`);
  }

  if (!orderData || !orderData.payment_terms) {
    return null;
  }

  const order = orderData as OrderRow;

  const { data: paymentData, error: paymentError } = await supabase
    .from("order_payments")
    .select(
      "id,order_id,payment_stage,amount,currency,provider,status,paypal_order_id,paypal_capture_id,paymongo_checkout_session_id,paymongo_payment_id,paymongo_checkout_url,paid_at,created_at",
    )
    .eq("order_id", order.id)
    .order("created_at", { ascending: true });

  if (paymentError) {
    throw new Error(
      `Unable to load custom checkout payments: ${paymentError.message}`,
    );
  }

  const payments = (paymentData ?? []) as PaymentRow[];

  if (order.order_status === "CANCELLED") {
    return {
      order,
      payments,
      currentPayment: null,
      state: "CANCELLED",
    };
  }

  const total = asMoney(order.total_amount);
  const paid = asMoney(order.amount_paid);

  if (
    order.payment_status === "COMPLETED" ||
    total <= 0 ||
    paid >= total - 0.005
  ) {
    return {
      order,
      payments,
      currentPayment: null,
      state: "FULLY_PAID",
    };
  }

  const latestPendingFinal = [...payments]
    .reverse()
    .find(
      (payment) =>
        payment.payment_stage === "FINAL" &&
        payment.status === "PENDING",
    );

  if (order.payment_terms === "FULL") {
    const completedFull = payments.find(
      (payment) =>
        payment.payment_stage === "FULL" &&
        payment.status === "COMPLETED",
    );

    if (!completedFull && paid <= 0) {
      const pendingFull = [...payments]
        .reverse()
        .find(
          (payment) =>
            payment.payment_stage === "FULL" &&
            payment.status === "PENDING",
        );

      return {
        order,
        payments,
        currentPayment: pendingFull ?? null,
        state: pendingFull ? "PAYMENT_DUE" : "WAITING_FOR_FINAL",
      };
    }

    if (latestPendingFinal) {
      return {
        order,
        payments,
        currentPayment: latestPendingFinal,
        state: "PAYMENT_DUE",
      };
    }

    return {
      order,
      payments,
      currentPayment: null,
      state: "WAITING_FOR_FINAL",
    };
  }

  if (order.payment_terms === "DEPOSIT_50") {
    const completedDeposit = payments.find(
      (payment) =>
        payment.payment_stage === "DEPOSIT" &&
        payment.status === "COMPLETED",
    );

    if (!completedDeposit) {
      const pendingDeposit = [...payments]
        .reverse()
        .find(
          (payment) =>
            payment.payment_stage === "DEPOSIT" &&
            payment.status === "PENDING",
        );

      return {
        order,
        payments,
        currentPayment: pendingDeposit ?? null,
        state: pendingDeposit ? "PAYMENT_DUE" : "WAITING_FOR_FINAL",
      };
    }

    if (latestPendingFinal) {
      return {
        order,
        payments,
        currentPayment: latestPendingFinal,
        state: "PAYMENT_DUE",
      };
    }

    return {
      order,
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
  provider: "PAYPAL" | "PAYMONGO";
  paypalCaptureId?: string | null;
  paymongoPaymentId?: string | null;
}) {
  const supabase = createAdminSupabaseClient();

  const { data: payment, error: paymentError } = await supabase
    .from("order_payments")
    .select("id,order_id,payment_stage,amount,currency,status")
    .eq("id", paymentId)
    .maybeSingle();

  if (paymentError) {
    throw new Error(`Unable to load payment record: ${paymentError.message}`);
  }

  if (!payment) {
    throw new Error("Payment record not found.");
  }

  const now = new Date().toISOString();

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

    const { error: updatePaymentError } = await supabase
      .from("order_payments")
      .update(paymentUpdate)
      .eq("id", payment.id)
      .neq("status", "COMPLETED");

    if (updatePaymentError) {
      throw new Error(
        `Unable to complete payment record: ${updatePaymentError.message}`,
      );
    }
  }

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select(
      "id,total_amount,payment_terms,payment_status,deposit_paid_at,paypal_capture_id,paymongo_payment_id",
    )
    .eq("id", payment.order_id)
    .single();

  if (orderError) {
    throw new Error(`Unable to load payment order: ${orderError.message}`);
  }

  const { data: completedPayments, error: completedPaymentsError } =
    await supabase
      .from("order_payments")
      .select("amount")
      .eq("order_id", order.id)
      .eq("status", "COMPLETED");

  if (completedPaymentsError) {
    throw new Error(
      `Unable to calculate paid amount: ${completedPaymentsError.message}`,
    );
  }

  const totalAmount = asMoney(order.total_amount);
  const amountPaid = Number(
    (completedPayments ?? [])
      .reduce((sum, row) => sum + asMoney(row.amount), 0)
      .toFixed(2),
  );
  const cappedAmountPaid = Math.min(totalAmount, amountPaid);
  const balanceDue = Math.max(
    0,
    Number((totalAmount - cappedAmountPaid).toFixed(2)),
  );
  const fullyPaid = balanceDue <= 0.005;

  const orderUpdate: Record<string, unknown> = {
    payment_provider: provider,
    payment_status: fullyPaid ? "COMPLETED" : "PARTIALLY_PAID",
    amount_paid: cappedAmountPaid,
    balance_due: balanceDue,
    updated_at: now,
  };

  if (fullyPaid) {
    orderUpdate.paid_at = now;
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

  return {
    orderId: order.id,
    paymentStage: payment.payment_stage as CustomPaymentStage,
    amountPaid: cappedAmountPaid,
    balanceDue,
    fullyPaid,
  };
}
