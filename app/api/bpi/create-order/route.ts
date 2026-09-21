import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type CreateBpiOrderBody = {
  product?: string;
  productSlug?: string;
  slug?: string;
  name?: string;
  customerName?: string;
  email?: string;
  customerEmail?: string;
  selectedDesignSlug?: string;
  selectedDesignName?: string;
};

const SIMPLE_WEBSITE_TEMPLATE_SLUG = "simple-business-website-template";

const SIMPLE_WEBSITE_DESIGNS: Record<string, string> = {
  "aesthetic-soft": "Aesthetic & Soft",
  "clean-minimal": "Clean & Minimal",
  "professional-business": "Professional Business",
  "bold-creative": "Bold & Creative",
  "modern-monochrome": "Modern Monochrome",
  "modern-refined": "Modern & Refined",
};

function money(value: number) {
  return Number(value.toFixed(2));
}

function makeOrderNumber() {
  const stamp = new Date()
    .toISOString()
    .replace(/[-:TZ.]/g, "")
    .slice(0, 14);

  const suffix = randomUUID().replace(/-/g, "").slice(0, 6).toUpperCase();

  return `TCL-${stamp}-${suffix}`;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CreateBpiOrderBody;

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

    const requestedDesignSlug = body.selectedDesignSlug?.trim() || "";

    if (!productSlug) {
      return NextResponse.json({ error: "Missing product." }, { status: 400 });
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

    let selectedDesignSlug: string | null = null;
    let selectedDesignName: string | null = null;

    if (productSlug === SIMPLE_WEBSITE_TEMPLATE_SLUG) {
      const validatedDesignName = SIMPLE_WEBSITE_DESIGNS[requestedDesignSlug];

      if (!requestedDesignSlug || !validatedDesignName) {
        return NextResponse.json(
          { error: "Please choose a valid website design before checkout." },
          { status: 400 },
        );
      }

      selectedDesignSlug = requestedDesignSlug;
      selectedDesignName = validatedDesignName;
    }

    const supabase = createAdminSupabaseClient();

    const { data: product, error: productError } = await supabase
      .from("products")
      .select("id,name,slug,price,sale_price,is_active")
      .eq("slug", productSlug)
      .eq("is_active", true)
      .maybeSingle();

    if (productError) {
      console.error("Unable to load product for BPI order:", productError);
      return NextResponse.json(
        { error: "Unable to load this product." },
        { status: 500 },
      );
    }

    if (!product) {
      return NextResponse.json({ error: "Product not found." }, { status: 404 });
    }

    const basePrice = money(Number(product.sale_price ?? product.price));

    if (!Number.isFinite(basePrice) || basePrice <= 0) {
      return NextResponse.json(
        { error: "Invalid product total." },
        { status: 400 },
      );
    }

    // Direct BPI uses the regular product price only.
    // No payment processing fee is added.
    const processingFeePercent = 0;
    const processingFee = 0;
    const totalAmount = basePrice;

    const orderNumber = makeOrderNumber();
    const receiptToken = randomUUID();

    const { data: order, error: orderError } = await supabase
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
        payment_provider: "BPI",
        payment_status: "PENDING",
        payment_terms: "FULL",
        amount_paid: 0,
        balance_due: totalAmount,
        receipt_token: receiptToken,
        delivery_status: "NOT_STARTED",
        selected_design_slug: selectedDesignSlug,
        selected_design_name: selectedDesignName,
      })
      .select("id,order_number,receipt_token")
      .single();

    if (orderError || !order) {
      console.error("Unable to create BPI order:", orderError);
      return NextResponse.json(
        { error: "Unable to create your order record." },
        { status: 500 },
      );
    }

    const { data: payment, error: paymentError } = await supabase
      .from("order_payments")
      .insert({
        order_id: order.id,
        payment_stage: "FULL",
        amount: totalAmount,
        currency: "PHP",
        provider: "BPI",
        status: "PENDING",
      })
      .select("id")
      .single();

    if (paymentError || !payment) {
      console.error("Unable to create BPI payment request:", paymentError);

      // Do not leave an unusable pending order if its payment row failed.
      const { error: cleanupError } = await supabase
        .from("orders")
        .delete()
        .eq("id", order.id);

      if (cleanupError) {
        console.error("Unable to clean up incomplete BPI order:", cleanupError);
      }

      return NextResponse.json(
        { error: "Unable to prepare the BPI payment request." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      ok: true,
      orderId: order.id,
      orderNumber: order.order_number,
      paymentId: payment.id,
      receiptToken: order.receipt_token,
      amount: totalAmount,
      processingFee: 0,
      processingFeePercent: 0,
      checkoutUrl: `/checkout/bpi/${encodeURIComponent(order.receipt_token)}`,
    });
  } catch (error) {
    console.error("BPI order creation failed:", error);
    return NextResponse.json(
      { error: "Unable to start BPI checkout." },
      { status: 500 },
    );
  }
}
