import { NextResponse } from "next/server";
import { getCustomCheckoutState } from "@/lib/custom-order-payments";
import { createAdminSupabaseClient } from "@/lib/supabase-admin";
import {
  getPayPalAccessToken,
  getPayPalBaseUrl,
} from "@/lib/paypal";

export const dynamic = "force-dynamic";

type Body = {
  token?: string;
};

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

    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json(
        { error: "Invalid payment amount." },
        { status: 400 },
      );
    }

    const accessToken = await getPayPalAccessToken();
    const origin = new URL(request.url).origin;

    const returnUrl = new URL(
      "/api/custom-checkout/paypal/capture",
      origin,
    );
    returnUrl.searchParams.set("receipt", token);

    const cancelUrl = new URL(
      `/checkout/custom/${encodeURIComponent(token)}`,
      origin,
    );
    cancelUrl.searchParams.set("payment_cancelled", "1");

    const paypalResponse = await fetch(
      `${getPayPalBaseUrl()}/v2/checkout/orders`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          Prefer: "return=representation",
        },
        body: JSON.stringify({
          intent: "CAPTURE",
          purchase_units: [
            {
              custom_id: payment.id,
              description: `${checkout.order.product_name} - ${payment.payment_stage}`,
              amount: {
                currency_code: payment.currency,
                value: amount.toFixed(2),
              },
            },
          ],
          payment_source: {
            paypal: {
              experience_context: {
                user_action: "PAY_NOW",
                return_url: returnUrl.toString(),
                cancel_url: cancelUrl.toString(),
              },
            },
          },
        }),
        cache: "no-store",
      },
    );

    const paypalOrder = await paypalResponse.json();

    if (!paypalResponse.ok) {
      console.error(
        "Custom checkout PayPal create error:",
        paypalResponse.status,
        paypalOrder,
      );

      return NextResponse.json(
        { error: "Unable to create PayPal payment." },
        { status: 502 },
      );
    }

    const paypalOrderId =
      typeof paypalOrder.id === "string" ? paypalOrder.id : "";

    const approvalUrl =
      paypalOrder.links?.find(
        (link: { rel?: string; href?: string }) =>
          link.rel === "payer-action" || link.rel === "approve",
      )?.href ?? null;

    if (!paypalOrderId || !approvalUrl) {
      return NextResponse.json(
        { error: "PayPal did not return a checkout link." },
        { status: 502 },
      );
    }

    const supabase = createAdminSupabaseClient();
    const now = new Date().toISOString();

    const { error: paymentUpdateError } = await supabase
      .from("order_payments")
      .update({
        provider: "PAYPAL",
        status: "PENDING",
        paypal_order_id: paypalOrderId,
        paypal_capture_id: null,
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
        payment_provider: "PAYPAL",
        paypal_order_id: paypalOrderId,
        updated_at: now,
      })
      .eq("id", checkout.order.id);

    return NextResponse.json({
      approvalUrl,
    });
  } catch (error) {
    console.error("Custom PayPal checkout failed:", error);

    return NextResponse.json(
      { error: "Unable to start PayPal checkout." },
      { status: 500 },
    );
  }
}
