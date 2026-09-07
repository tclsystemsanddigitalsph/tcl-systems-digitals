import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase-admin";
import { verifyPayMongoWebhookSignature } from "@/lib/paymongo";

export const dynamic = "force-dynamic";

type PayMongoPayment = {
  id?: string;
  attributes?: {
    amount?: number;
    currency?: string;
    status?: string;
  };
};

type PayMongoCheckoutSession = {
  id?: string;
  attributes?: {
    reference_number?: string;
    metadata?: Record<string, string>;
    payments?: PayMongoPayment[];
  };
};

type PayMongoWebhookPayload = {
  data?: {
    type?: string;
    data?: PayMongoCheckoutSession;
  };
};

function moneyToCentavos(value: number) {
  return Math.round((value + Number.EPSILON) * 100);
}

export async function POST(request: Request) {
  const rawBody = await request.text();

  const signatureHeader =
    request.headers.get("paymongo-signature");

  if (
    !verifyPayMongoWebhookSignature(
      rawBody,
      signatureHeader,
    )
  ) {
    return NextResponse.json(
      { error: "Invalid webhook signature." },
      { status: 401 },
    );
  }

  let payload: PayMongoWebhookPayload;

  try {
    payload = JSON.parse(
      rawBody,
    ) as PayMongoWebhookPayload;
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON payload." },
      { status: 400 },
    );
  }

  const event = payload.data;

  if (
    event?.type !==
    "checkout_session.payment.paid"
  ) {
    return NextResponse.json({
      received: true,
      ignored: true,
    });
  }

  const session = event.data;
  const sessionId = session?.id;
  const referenceNumber =
    session?.attributes?.reference_number;

  if (!sessionId || !referenceNumber) {
    return NextResponse.json(
      {
        error:
          "Webhook is missing the checkout session reference.",
      },
      { status: 400 },
    );
  }

  const supabase = createAdminSupabaseClient();

  const {
    data: order,
    error: orderError,
  } = await supabase
    .from("orders")
    .select(
      "id,order_number,total_amount,currency,payment_status,payment_provider,paymongo_checkout_session_id",
    )
    .eq("order_number", referenceNumber)
    .eq("payment_provider", "PAYMONGO")
    .maybeSingle();

  if (orderError) {
    console.error(
      "Unable to load PayMongo webhook order:",
      orderError,
    );

    return NextResponse.json(
      { error: "Unable to load order." },
      { status: 500 },
    );
  }

  if (!order) {
    return NextResponse.json(
      { error: "Order not found." },
      { status: 404 },
    );
  }

  if (
    order.paymongo_checkout_session_id !==
    sessionId
  ) {
    return NextResponse.json(
      { error: "Checkout session mismatch." },
      { status: 400 },
    );
  }

  if (order.payment_status === "COMPLETED") {
    return NextResponse.json({
      received: true,
      alreadyProcessed: true,
    });
  }

  const paidPayment =
    session?.attributes?.payments?.find(
      (payment) =>
        payment?.attributes?.status === "paid",
    );

  const paymentId = paidPayment?.id;
  const paidAmount =
    paidPayment?.attributes?.amount;
  const paidCurrency =
    paidPayment?.attributes?.currency;

  const expectedCentavos = moneyToCentavos(
    Number(order.total_amount),
  );

  if (
    !paymentId ||
    typeof paidAmount !== "number" ||
    paidAmount !== expectedCentavos ||
    paidCurrency !== order.currency
  ) {
    console.error(
      "PayMongo webhook payment validation failed:",
      {
        orderNumber: order.order_number,
        expectedCentavos,
        paidAmount,
        expectedCurrency: order.currency,
        paidCurrency,
      },
    );

    return NextResponse.json(
      {
        error:
          "PayMongo payment details do not match the order.",
      },
      { status: 400 },
    );
  }

  const paidAt = new Date().toISOString();

  const { error: updateError } =
    await supabase
      .from("orders")
      .update({
        payment_status: "COMPLETED",
        paymongo_payment_id: paymentId,
        paid_at: paidAt,
        updated_at: paidAt,
      })
      .eq("id", order.id)
      .eq("payment_status", "PENDING");

  if (updateError) {
    console.error(
      "Unable to complete PayMongo order:",
      updateError,
    );

    return NextResponse.json(
      { error: "Unable to update order." },
      { status: 500 },
    );
  }

  return NextResponse.json({
    received: true,
  });
}
