import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase-admin";
import {
  getPayPalAccessToken,
  getPayPalBaseUrl,
} from "@/lib/paypal";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const form = await request.formData();
    const receipt = String(form.get("receipt") ?? "").trim();

    if (!receipt) {
      return NextResponse.json({ error: "Missing checkout token." }, { status: 400 });
    }

    const supabase = createAdminSupabaseClient();

    const { data: order, error } = await supabase
      .from("orders")
      .select(
        "id,order_number,customer_name,customer_email,product_name,total_amount,currency,payment_status,order_status,receipt_token",
      )
      .eq("receipt_token", receipt)
      .maybeSingle();

    if (error || !order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    if (order.payment_status === "COMPLETED") {
      return NextResponse.redirect(
        new URL(`/checkout/custom/${receipt}?paid=1`, request.url),
        303,
      );
    }

    if (order.order_status === "CANCELLED") {
      return NextResponse.redirect(
        new URL(`/checkout/custom/${receipt}?cancelled_order=1`, request.url),
        303,
      );
    }

    if (order.payment_status !== "PENDING") {
      return NextResponse.redirect(
        new URL(`/checkout/custom/${receipt}?error=1`, request.url),
        303,
      );
    }

    const amount = Number(order.total_amount ?? 0);

    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ error: "Invalid order total." }, { status: 400 });
    }

    const origin = new URL(request.url).origin;
    const returnUrl = new URL("/api/paypal/custom-capture", origin);
    returnUrl.searchParams.set("receipt", receipt);

    const cancelUrl = new URL(`/checkout/custom/${receipt}`, origin);
    cancelUrl.searchParams.set("cancelled", "1");

    const accessToken = await getPayPalAccessToken();

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
              reference_id: order.id,
              custom_id: order.order_number,
              description: order.product_name,
              amount: {
                currency_code: order.currency || "PHP",
                value: amount.toFixed(2),
              },
            },
          ],
          payment_source: {
            paypal: {
              experience_context: {
                user_action: "PAY_NOW",
                shipping_preference: "NO_SHIPPING",
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
        "Custom PayPal order creation error:",
        paypalResponse.status,
        paypalOrder,
      );

      return NextResponse.redirect(
        new URL(`/checkout/custom/${receipt}?error=1`, origin),
        303,
      );
    }

    const approvalUrl =
      paypalOrder.links?.find(
        (link: { rel?: string; href?: string }) =>
          link.rel === "payer-action" || link.rel === "approve",
      )?.href ?? null;

    if (!approvalUrl || !paypalOrder.id) {
      console.error("Custom PayPal order missing approval URL or ID:", paypalOrder);

      return NextResponse.redirect(
        new URL(`/checkout/custom/${receipt}?error=1`, origin),
        303,
      );
    }

    const { error: updateError } = await supabase
      .from("orders")
      .update({
        paypal_order_id: paypalOrder.id,
        payment_provider: "PAYPAL",
        updated_at: new Date().toISOString(),
      })
      .eq("id", order.id)
      .eq("payment_status", "PENDING");

    if (updateError) {
      console.error("Unable to attach PayPal order to custom order:", updateError);

      return NextResponse.redirect(
        new URL(`/checkout/custom/${receipt}?error=1`, origin),
        303,
      );
    }

    return NextResponse.redirect(approvalUrl, 303);
  } catch (error) {
    console.error("Unable to create custom PayPal checkout:", error);

    return NextResponse.json(
      { error: "Unable to start payment checkout." },
      { status: 500 },
    );
  }
}
