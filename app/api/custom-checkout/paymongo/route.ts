import { NextResponse } from "next/server";
import { getCustomCheckoutState } from "@/lib/custom-order-payments";
import { createAdminSupabaseClient } from "@/lib/supabase-admin";
import { createPayMongoCheckoutSession } from "@/lib/paymongo";

export const dynamic = "force-dynamic";

type Body = {
  token?: string;
};

function moneyToCentavos(value: number) {
  return Math.round((value + Number.EPSILON) * 100);
}

function getSiteUrl(request: Request) {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (configured) {
    return configured.replace(/\/+$/, "");
  }

  return new URL(request.url).origin;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Body;
    const token = body.token?.trim() ?? "";

    const checkout = await getCustomCheckoutState(token);

    if (
      !checkout ||
      checkout.state !== "PAYMENT_DUE" ||
      !checkout.currentPayment
    ) {
      return NextResponse.json(
        { error: "No custom project payment is currently due." },
        { status: 409 },
      );
    }

    const payment = checkout.currentPayment;
    const amount = Number(payment.amount);
    const amountCentavos = moneyToCentavos(amount);

    if (!Number.isFinite(amount) || amountCentavos <= 0) {
      return NextResponse.json(
        { error: "Invalid payment amount." },
        { status: 400 },
      );
    }

    const siteUrl = getSiteUrl(request);

    const successUrl =
      `${siteUrl}/checkout/custom/${encodeURIComponent(token)}` +
      "?payment_processing=1";

    const cancelUrl =
      `${siteUrl}/checkout/custom/${encodeURIComponent(token)}` +
      "?payment_cancelled=1";

    const paymongo = await createPayMongoCheckoutSession({
      data: {
        attributes: {
          billing: {
            name: checkout.order.customer_name,
            email: checkout.order.customer_email,
          },
          line_items: [
            {
              name: `${checkout.order.product_name} - ${payment.payment_stage}`,
              amount: amountCentavos,
              currency: payment.currency,
              quantity: 1,
            },
          ],
          payment_method_types: ["qrph"],
          success_url: successUrl,
          cancel_url: cancelUrl,
          reference_number: checkout.order.order_number,
          send_email_receipt: true,
          show_description: true,
          show_line_items: true,
          description: `Custom project payment for TCL Systems & Digitals PH`,
          metadata: {
            local_order_id: checkout.order.id,
            order_payment_id: payment.id,
            payment_stage: payment.payment_stage,
            receipt_token: token,
            custom_checkout: "true",
          },
        },
      },
    });

    const sessionId = paymongo?.data?.id;
    const checkoutUrl = paymongo?.data?.attributes?.checkout_url;

    if (!sessionId || !checkoutUrl) {
      throw new Error("PayMongo did not return a checkout URL.");
    }

    const supabase = createAdminSupabaseClient();
    const now = new Date().toISOString();

    const { error: paymentUpdateError } = await supabase
      .from("order_payments")
      .update({
        provider: "PAYMONGO",
        status: "PENDING",
        paymongo_checkout_session_id: sessionId,
        paymongo_checkout_url: checkoutUrl,
        paymongo_payment_id: null,
        updated_at: now,
      })
      .eq("id", payment.id)
      .neq("status", "COMPLETED");

    if (paymentUpdateError) {
      throw new Error(paymentUpdateError.message);
    }

    await supabase
      .from("orders")
      .update({
        payment_provider: "PAYMONGO",
        paymongo_checkout_session_id: sessionId,
        paymongo_checkout_url: checkoutUrl,
        updated_at: now,
      })
      .eq("id", checkout.order.id);

    return NextResponse.json({
      checkoutUrl,
      checkoutSessionId: sessionId,
    });
  } catch (error) {
    console.error("Custom PayMongo checkout failed:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to start QR Ph checkout.",
      },
      { status: 500 },
    );
  }
}
