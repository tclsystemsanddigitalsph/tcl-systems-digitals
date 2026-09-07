import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase-admin";
import { createPayMongoCheckoutSession } from "@/lib/paymongo";

export const dynamic = "force-dynamic";

type CheckoutBody = {
  productSlug?: string;
  customerName?: string;
  customerEmail?: string;
};

function moneyToCentavos(value: number) {
  return Math.round((value + Number.EPSILON) * 100);
}

function createOrderNumber() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random()
    .toString(36)
    .slice(2, 8)
    .toUpperCase();

  return `TCL-${timestamp}-${random}`;
}

function getSiteUrl(request: Request) {
  const configured =
    process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (configured) {
    return configured.replace(/\/+$/, "");
  }

  return new URL(request.url).origin;
}

export async function POST(request: Request) {
  let body: CheckoutBody;

  try {
    body = (await request.json()) as CheckoutBody;
  } catch {
    return NextResponse.json(
      { error: "Invalid checkout request." },
      { status: 400 },
    );
  }

  const productSlug = body.productSlug?.trim();
  const customerName = body.customerName?.trim();
  const customerEmail = body.customerEmail
    ?.trim()
    .toLowerCase();

  if (
    !productSlug ||
    !customerName ||
    !customerEmail
  ) {
    return NextResponse.json(
      {
        error:
          "Product, full name, and email address are required.",
      },
      { status: 400 },
    );
  }

  const supabase = createAdminSupabaseClient();

  const { data: product, error: productError } =
    await supabase
      .from("products")
      .select(
        "id,slug,name,price,sale_price,processing_fee_percent,is_active",
      )
      .eq("slug", productSlug)
      .eq("is_active", true)
      .maybeSingle();

  if (productError) {
    console.error(
      "Unable to load PayMongo product:",
      productError,
    );

    return NextResponse.json(
      { error: "Unable to load this product." },
      { status: 500 },
    );
  }

  if (!product) {
    return NextResponse.json(
      { error: "This product is unavailable." },
      { status: 404 },
    );
  }

  const basePrice = Number(
    product.sale_price ?? product.price,
  );

  const processingFeePercent = Number(
    product.processing_fee_percent ?? 0,
  );

  const baseCentavos = moneyToCentavos(basePrice);

  const processingFeeCentavos = Math.round(
    (baseCentavos * processingFeePercent) /
      100,
  );

  const totalCentavos =
    baseCentavos + processingFeeCentavos;

  const processingFee =
    processingFeeCentavos / 100;

  const totalAmount = totalCentavos / 100;

  if (
    !Number.isFinite(basePrice) ||
    basePrice <= 0 ||
    totalCentavos <= 0
  ) {
    return NextResponse.json(
      { error: "This product has an invalid price." },
      { status: 400 },
    );
  }

  const orderNumber = createOrderNumber();

  const {
    data: order,
    error: orderInsertError,
  } = await supabase
    .from("orders")
    .insert({
      order_number: orderNumber,
      customer_name: customerName,
      customer_email: customerEmail,
      product_id: product.id,
      product_name: product.name,
      base_price: basePrice,
      processing_fee_percent:
        processingFeePercent,
      processing_fee: processingFee,
      total_amount: totalAmount,
      currency: "PHP",
      payment_provider: "PAYMONGO",
      payment_status: "PENDING",
      delivery_status: "NOT_STARTED",
    })
    .select(
      "id,order_number,receipt_token",
    )
    .single();

  if (orderInsertError || !order) {
    console.error(
      "Unable to create local PayMongo order:",
      orderInsertError,
    );

    return NextResponse.json(
      {
        error:
          "Unable to prepare your PayMongo order.",
      },
      { status: 500 },
    );
  }

  const siteUrl = getSiteUrl(request);

  const successUrl =
    `${siteUrl}/checkout/paymongo-processing` +
    `?receipt=${encodeURIComponent(
      order.receipt_token,
    )}`;

  const cancelUrl =
    `${siteUrl}/checkout` +
    `?product=${encodeURIComponent(
      product.slug,
    )}` +
    "&payment_cancelled=1";

  const lineItems = [
    {
      name: product.name,
      amount: baseCentavos,
      currency: "PHP",
      quantity: 1,
    },
  ];

  if (processingFeeCentavos > 0) {
    lineItems.push({
      name: "Processing fee",
      amount: processingFeeCentavos,
      currency: "PHP",
      quantity: 1,
    });
  }

  try {
    const paymongo =
      await createPayMongoCheckoutSession({
        data: {
          attributes: {
            billing: {
              name: customerName,
              email: customerEmail,
            },
            line_items: lineItems,
            payment_method_types: [
              "card",
              "gcash",
              "paymaya",
            ],
            success_url: successUrl,
            cancel_url: cancelUrl,
            reference_number:
              order.order_number,
            send_email_receipt: true,
            show_description: true,
            show_line_items: true,
            description: `Purchase from TCL Systems & Digitals PH: ${product.name}`,
            metadata: {
              local_order_id: order.id,
              product_slug: product.slug,
              receipt_token:
                order.receipt_token,
            },
          },
        },
      });

    const sessionId =
      paymongo?.data?.id;

    const checkoutUrl =
      paymongo?.data?.attributes?.checkout_url;

    if (!sessionId || !checkoutUrl) {
      throw new Error(
        "PayMongo did not return a checkout URL.",
      );
    }

    const { error: updateError } =
      await supabase
        .from("orders")
        .update({
          paymongo_checkout_session_id:
            sessionId,
        })
        .eq("id", order.id);

    if (updateError) {
      console.error(
        "Unable to save PayMongo session ID:",
        updateError,
      );

      throw new Error(
        "Unable to save the PayMongo checkout session.",
      );
    }

    return NextResponse.json({
      orderNumber: order.order_number,
      checkoutSessionId: sessionId,
      checkoutUrl,
    });
  } catch (error) {
    console.error(
      "Unable to start PayMongo checkout:",
      error,
    );

    await supabase
      .from("orders")
      .delete()
      .eq("id", order.id)
      .eq("payment_status", "PENDING");

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to start PayMongo checkout.",
      },
      { status: 500 },
    );
  }
}
