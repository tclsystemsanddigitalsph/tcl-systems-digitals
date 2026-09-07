import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase-admin";
import {
  getPayPalAccessToken,
  getPayPalBaseUrl,
} from "@/lib/paypal";

export const dynamic = "force-dynamic";

type CreateOrderBody = {
  product?: string;
  productSlug?: string;
  slug?: string;
  name?: string;
  customerName?: string;
  email?: string;
  customerEmail?: string;
};

function toCentavos(value: number) {
  return Math.round(Number(value) * 100);
}

function fromCentavos(value: number) {
  return Number((value / 100).toFixed(2));
}

function makeOrderNumber() {
  const stamp = new Date()
    .toISOString()
    .replace(/[-:TZ.]/g, "")
    .slice(0, 14);

  const suffix = randomUUID()
    .replace(/-/g, "")
    .slice(0, 6)
    .toUpperCase();

  return `TCL-${stamp}-${suffix}`;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CreateOrderBody;

    const productSlug =
      body.productSlug?.trim() ||
      body.product?.trim() ||
      body.slug?.trim() ||
      "";

    const customerName =
      body.customerName?.trim() ||
      body.name?.trim() ||
      "";

    const customerEmail =
      body.customerEmail?.trim().toLowerCase() ||
      body.email?.trim().toLowerCase() ||
      "";

    if (!productSlug) {
      return NextResponse.json(
        { error: "Missing product." },
        { status: 400 },
      );
    }

    if (!customerName) {
      return NextResponse.json(
        { error: "Please enter your name." },
        { status: 400 },
      );
    }

    if (!customerEmail || !customerEmail.includes("@")) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 },
      );
    }

    const supabase = createAdminSupabaseClient();

    const { data: product, error: productError } = await supabase
      .from("products")
      .select(
        "id,name,slug,price,sale_price,processing_fee_percent,is_active",
      )
      .eq("slug", productSlug)
      .eq("is_active", true)
      .maybeSingle();

    if (productError) {
      console.error("Unable to load product for PayPal order:", productError);

      return NextResponse.json(
        { error: "Unable to load this product." },
        { status: 500 },
      );
    }

    if (!product) {
      return NextResponse.json(
        { error: "Product not found." },
        { status: 404 },
      );
    }

    const baseCentavos = toCentavos(
      Number(product.sale_price ?? product.price),
    );

    const processingFeePercent = Number(
      product.processing_fee_percent,
    );

    const processingFeeCentavos = Math.round(
      (baseCentavos * processingFeePercent) / 100,
    );

    const totalCentavos =
      baseCentavos + processingFeeCentavos;

    if (baseCentavos < 0 || totalCentavos <= 0) {
      return NextResponse.json(
        { error: "Invalid product total." },
        { status: 400 },
      );
    }

    const basePrice = fromCentavos(baseCentavos);
    const processingFee = fromCentavos(processingFeeCentavos);
    const totalAmount = fromCentavos(totalCentavos);

    const accessToken = await getPayPalAccessToken();
    const origin = new URL(request.url).origin;

    const returnUrl = new URL("/api/paypal/capture", origin);
    returnUrl.searchParams.set("product", product.slug);

    const cancelUrl = new URL("/checkout", origin);
    cancelUrl.searchParams.set("product", product.slug);
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
              custom_id: product.slug,
              description: product.name,
              amount: {
                currency_code: "PHP",
                value: totalAmount.toFixed(2),
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
        "PayPal create-order error:",
        paypalResponse.status,
        paypalOrder,
      );

      return NextResponse.json(
        { error: "Unable to create PayPal order." },
        { status: 502 },
      );
    }

    const paypalOrderId =
      typeof paypalOrder.id === "string"
        ? paypalOrder.id
        : "";

    if (!paypalOrderId) {
      console.error("PayPal did not return an order ID:", paypalOrder);

      return NextResponse.json(
        { error: "PayPal did not return an order ID." },
        { status: 502 },
      );
    }

    const orderNumber = makeOrderNumber();

    const { error: orderError } = await supabase
      .from("orders")
      .insert({
        order_number: orderNumber,
        customer_name: customerName,
        customer_email: customerEmail,
        product_id: product.id,
        product_name: product.name,
        base_price: basePrice,
        processing_fee_percent: processingFeePercent,
        processing_fee: processingFee,
        total_amount: totalAmount,
        currency: "PHP",
        payment_provider: "PAYPAL",
        payment_status: "PENDING",
        paypal_order_id: paypalOrderId,
        delivery_status: "NOT_STARTED",
      });

    if (orderError) {
      console.error(
        "Unable to create local pending order:",
        orderError,
      );

      return NextResponse.json(
        { error: "Unable to create your order record." },
        { status: 500 },
      );
    }

    const approvalUrl =
      paypalOrder.links?.find(
        (link: { rel?: string; href?: string }) =>
          link.rel === "payer-action" ||
          link.rel === "approve",
      )?.href ?? null;

    if (!approvalUrl) {
      console.error(
        "PayPal order did not include an approval URL:",
        paypalOrder,
      );

      return NextResponse.json(
        { error: "PayPal did not return a checkout URL." },
        { status: 502 },
      );
    }

    return NextResponse.json({
      orderId: paypalOrderId,
      orderNumber,
      approvalUrl,
      approveUrl: approvalUrl,
      url: approvalUrl,
    });
  } catch (error) {
    console.error("PayPal order creation failed:", error);

    return NextResponse.json(
      { error: "Unable to start PayPal checkout." },
      { status: 500 },
    );
  }
}
