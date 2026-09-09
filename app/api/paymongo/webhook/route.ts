import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase-admin";
import {
  completeCustomOrderPayment,
} from "@/lib/custom-order-payments";
import { verifyPayMongoWebhookSignature } from "@/lib/paymongo";

export const dynamic = "force-dynamic";

type PayMongoResource = {
  id?: string;
  type?: string;
  attributes?: Record<string, unknown>;
};

type PayMongoPayment = {
  id?: string;
  type?: string;
  attributes?: {
    amount?: number;
    currency?: string;
    status?: string;
    [key: string]: unknown;
  };
};

function isCheckoutSession(value: unknown): value is PayMongoResource {
  if (!value || typeof value !== "object") return false;

  const resource = value as PayMongoResource;

  return (
    typeof resource.id === "string" &&
    resource.id.startsWith("cs_") &&
    resource.type === "checkout_session" &&
    !!resource.attributes &&
    typeof resource.attributes === "object"
  );
}

function extractPaidCheckoutSession(
  payload: unknown,
): PayMongoResource | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const root = payload as Record<string, unknown>;

  if (isCheckoutSession(root)) {
    return root;
  }

  const rootData =
    root.data && typeof root.data === "object"
      ? (root.data as Record<string, unknown>)
      : null;

  if (!rootData) {
    return null;
  }

  if (
    rootData.type === "checkout_session.payment.paid" &&
    isCheckoutSession(rootData.data)
  ) {
    return rootData.data;
  }

  const eventAttributes =
    rootData.attributes &&
    typeof rootData.attributes === "object"
      ? (rootData.attributes as Record<string, unknown>)
      : null;

  if (
    rootData.type === "event" &&
    eventAttributes?.type === "checkout_session.payment.paid" &&
    isCheckoutSession(eventAttributes.data)
  ) {
    return eventAttributes.data;
  }

  if (
    root.type === "checkout_session.payment.paid" &&
    isCheckoutSession(root.data)
  ) {
    return root.data;
  }

  return null;
}

function getString(
  object: Record<string, unknown>,
  key: string,
) {
  const value = object[key];
  return typeof value === "string" ? value : null;
}

function getPayments(
  attributes: Record<string, unknown>,
): PayMongoPayment[] {
  const payments = attributes.payments;

  if (!Array.isArray(payments)) {
    return [];
  }

  return payments.filter(
    (payment): payment is PayMongoPayment =>
      !!payment && typeof payment === "object",
  );
}

function getPaidPayment(
  attributes: Record<string, unknown>,
) {
  const payments = getPayments(attributes);

  return (
    payments.find(
      (payment) =>
        payment.attributes?.status?.toLowerCase() === "paid",
    ) ??
    payments[0] ??
    null
  );
}

function getLineItemsTotalCentavos(
  attributes: Record<string, unknown>,
) {
  const lineItems = attributes.line_items;

  if (!Array.isArray(lineItems)) {
    return null;
  }

  let total = 0;
  let foundAmount = false;

  for (const item of lineItems) {
    if (!item || typeof item !== "object") continue;

    const record = item as Record<string, unknown>;
    const amount = Number(record.amount);
    const quantity = Number(record.quantity ?? 1);

    if (
      !Number.isFinite(amount) ||
      !Number.isFinite(quantity) ||
      amount < 0 ||
      quantity <= 0
    ) {
      continue;
    }

    total += Math.round(amount) * Math.round(quantity);
    foundAmount = true;
  }

  return foundAmount ? total : null;
}

function validatePaidAmount({
  attributes,
  expectedCentavos,
  currency,
}: {
  attributes: Record<string, unknown>;
  expectedCentavos: number;
  currency: string;
}) {
  const paidPayment = getPaidPayment(attributes);
  const paymentAmount = paidPayment?.attributes?.amount;
  const paymentCurrency = paidPayment?.attributes?.currency;
  const lineItemsTotal = getLineItemsTotalCentavos(attributes);

  if (
    typeof paymentAmount === "number" &&
    paymentAmount !== expectedCentavos
  ) {
    return { ok: false, paidPayment };
  }

  if (
    typeof paymentAmount !== "number" &&
    typeof lineItemsTotal === "number" &&
    lineItemsTotal !== expectedCentavos
  ) {
    return { ok: false, paidPayment };
  }

  if (
    paymentCurrency &&
    paymentCurrency.toUpperCase() !== currency.toUpperCase()
  ) {
    return { ok: false, paidPayment };
  }

  return { ok: true, paidPayment };
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signatureHeader = request.headers.get("paymongo-signature");

  if (
    !verifyPayMongoWebhookSignature(
      rawBody,
      signatureHeader,
    )
  ) {
    console.error(
      "Rejected PayMongo webhook: invalid signature.",
    );

    return NextResponse.json(
      { error: "Invalid webhook signature." },
      { status: 401 },
    );
  }

  let payload: unknown;

  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json(
      { error: "Invalid webhook payload." },
      { status: 400 },
    );
  }

  const session = extractPaidCheckoutSession(payload);

  if (!session || !session.id || !session.attributes) {
    return NextResponse.json({
      received: true,
      ignored: true,
    });
  }

  const attributes = session.attributes;
  const supabase = createAdminSupabaseClient();

  // ---------------------------------------------------------
  // CUSTOM PROJECT / INSTALLMENT PAYMENT
  // ---------------------------------------------------------
  const { data: customPayment, error: customPaymentError } =
    await supabase
      .from("order_payments")
      .select(
        "id,order_id,amount,currency,status,paymongo_checkout_session_id,paymongo_payment_id",
      )
      .eq("paymongo_checkout_session_id", session.id)
      .maybeSingle();

  if (customPaymentError) {
    console.error(
      "Unable to check custom PayMongo payment:",
      customPaymentError,
    );

    return NextResponse.json(
      { error: "Unable to verify custom payment." },
      { status: 500 },
    );
  }

  if (customPayment) {
    if (customPayment.status === "COMPLETED") {
      return NextResponse.json({
        received: true,
        completed: true,
        alreadyCompleted: true,
        customPayment: true,
      });
    }

    const validation = validatePaidAmount({
      attributes,
      expectedCentavos: Math.round(Number(customPayment.amount) * 100),
      currency: String(customPayment.currency),
    });

    if (!validation.ok) {
      return NextResponse.json(
        { error: "Custom payment amount or currency mismatch." },
        { status: 409 },
      );
    }

    await completeCustomOrderPayment({
      paymentId: customPayment.id,
      provider: "PAYMONGO",
      paymongoPaymentId: validation.paidPayment?.id ?? null,
    });

    return NextResponse.json({
      received: true,
      completed: true,
      customPayment: true,
    });
  }

  // ---------------------------------------------------------
  // EXISTING NORMAL STOREFRONT PAYMONGO FLOW
  // ---------------------------------------------------------
  const referenceNumber = getString(
    attributes,
    "reference_number",
  );

  let {
    data: order,
    error: orderError,
  } = await supabase
    .from("orders")
    .select(
      "id,order_number,total_amount,currency,payment_status,paymongo_checkout_session_id,paymongo_payment_id",
    )
    .eq("payment_provider", "PAYMONGO")
    .eq("paymongo_checkout_session_id", session.id)
    .maybeSingle();

  if (!order && referenceNumber) {
    const fallback = await supabase
      .from("orders")
      .select(
        "id,order_number,total_amount,currency,payment_status,paymongo_checkout_session_id,paymongo_payment_id",
      )
      .eq("payment_provider", "PAYMONGO")
      .eq("order_number", referenceNumber)
      .maybeSingle();

    order = fallback.data;
    orderError = fallback.error;
  }

  if (orderError) {
    console.error(
      "Unable to load PayMongo order:",
      orderError,
    );

    return NextResponse.json(
      { error: "Unable to verify local order." },
      { status: 500 },
    );
  }

  if (!order) {
    console.error(
      "PayMongo webhook order not found:",
      session.id,
      referenceNumber,
    );

    return NextResponse.json(
      { error: "Order not found." },
      { status: 404 },
    );
  }

  if (
    order.paymongo_checkout_session_id &&
    order.paymongo_checkout_session_id !== session.id
  ) {
    return NextResponse.json(
      { error: "Checkout session mismatch." },
      { status: 409 },
    );
  }

  if (
    referenceNumber &&
    referenceNumber !== order.order_number
  ) {
    return NextResponse.json(
      { error: "Reference number mismatch." },
      { status: 409 },
    );
  }

  if (order.payment_status === "COMPLETED") {
    return NextResponse.json({
      received: true,
      completed: true,
      alreadyCompleted: true,
    });
  }

  const expectedCentavos = Math.round(
    Number(order.total_amount) * 100,
  );

  const validation = validatePaidAmount({
    attributes,
    expectedCentavos,
    currency: String(order.currency),
  });

  if (!validation.ok) {
    return NextResponse.json(
      { error: "Payment amount or currency mismatch." },
      { status: 409 },
    );
  }

  const now = new Date().toISOString();

  const update: Record<string, unknown> = {
    payment_status: "COMPLETED",
    paid_at: now,
    updated_at: now,
  };

  if (validation.paidPayment?.id) {
    update.paymongo_payment_id = validation.paidPayment.id;
  }

  const {
    data: completedOrder,
    error: updateError,
  } = await supabase
    .from("orders")
    .update(update)
    .eq("id", order.id)
    .eq("payment_status", "PENDING")
    .select("id,payment_status,paymongo_payment_id,paid_at")
    .maybeSingle();

  if (updateError) {
    console.error(
      "Unable to complete PayMongo order:",
      updateError,
    );

    return NextResponse.json(
      { error: "Unable to complete order." },
      { status: 500 },
    );
  }

  if (!completedOrder) {
    const { data: currentOrder } = await supabase
      .from("orders")
      .select("payment_status")
      .eq("id", order.id)
      .maybeSingle();

    if (currentOrder?.payment_status === "COMPLETED") {
      return NextResponse.json({
        received: true,
        completed: true,
        alreadyCompleted: true,
      });
    }

    return NextResponse.json(
      { error: "Order could not be completed." },
      { status: 409 },
    );
  }

  return NextResponse.json({
    received: true,
    completed: true,
  });
}
