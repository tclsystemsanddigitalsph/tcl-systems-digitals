"use server";

import { redirect } from "next/navigation";
import { createAdminSupabaseClient } from "@/lib/supabase-admin";

const CUSTOM_PRODUCT_SLUG = "custom-business-website";

function moneyToCentavos(value: number) {
  return Math.round((value + Number.EPSILON) * 100);
}

function createOrderNumber() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `TCL-${timestamp}-${random}`;
}

function reviewPath(token: string, query?: string) {
  const base = `/quotation/${encodeURIComponent(token)}`;
  return query ? `${base}?${query}` : base;
}

export async function acceptQuotation(formData: FormData) {
  const token = String(formData.get("token") ?? "").trim();

  if (!token) {
    redirect("/");
  }

  const supabase = createAdminSupabaseClient();

  const { data: quotation, error: quotationError } = await supabase
    .from("quotation_requests")
    .select(
      "id,secure_token,status,order_id,quoted_amount,payment_terms,full_name,business_name,email,product_name,product_slug",
    )
    .eq("secure_token", token)
    .maybeSingle();

  if (quotationError || !quotation) {
    redirect(reviewPath(token, "error=quotation"));
  }

  if (quotation.order_id) {
    const { data: existingOrder } = await supabase
      .from("orders")
      .select("receipt_token")
      .eq("id", quotation.order_id)
      .maybeSingle();

    if (existingOrder?.receipt_token) {
      redirect(`/checkout/custom/${existingOrder.receipt_token}`);
    }

    redirect(reviewPath(token, "error=order"));
  }

  if (quotation.status !== "QUOTED") {
    redirect(reviewPath(token, "error=not-available"));
  }

  const quotedAmount = Number(quotation.quoted_amount ?? 0);
  const paymentTerms = String(quotation.payment_terms ?? "").trim();

  if (!Number.isFinite(quotedAmount) || quotedAmount <= 0) {
    redirect(reviewPath(token, "error=amount"));
  }

  if (paymentTerms !== "FULL" && paymentTerms !== "DEPOSIT_50") {
    redirect(reviewPath(token, "error=terms"));
  }

  const productSlug =
    String(quotation.product_slug ?? "").trim() || CUSTOM_PRODUCT_SLUG;

  const { data: product, error: productError } = await supabase
    .from("products")
    .select("id,slug,name,processing_fee_percent,product_type,is_active")
    .eq("slug", productSlug)
    .eq("is_active", true)
    .maybeSingle();

  if (productError || !product || product.product_type !== "SERVICE") {
    redirect(reviewPath(token, "error=product"));
  }

  const customerName =
    String(quotation.full_name ?? "").trim() ||
    String(quotation.business_name ?? "").trim() ||
    "Customer";
  const customerEmail = String(quotation.email ?? "").trim().toLowerCase();

  if (!customerEmail) {
    redirect(reviewPath(token, "error=email"));
  }

  const processingFeePercent = Number(product.processing_fee_percent ?? 0);
  const baseCentavos = moneyToCentavos(quotedAmount);
  const feeCentavos = Math.round(
    (baseCentavos * processingFeePercent) / 100,
  );
  const totalCentavos = baseCentavos + feeCentavos;
  const processingFee = feeCentavos / 100;
  const totalAmount = totalCentavos / 100;
  const amountDueNow =
    paymentTerms === "DEPOSIT_50" ? Math.round(totalCentavos / 2) / 100 : totalAmount;

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      order_number: createOrderNumber(),
      customer_name: customerName,
      customer_email: customerEmail,
      product_id: product.id,
      product_name: product.name || quotation.product_name,
      base_price: quotedAmount,
      processing_fee_percent: processingFeePercent,
      processing_fee: processingFee,
      total_amount: totalAmount,
      currency: "PHP",
      payment_provider: null,
      payment_status: "PENDING",
      delivery_status: "NOT_STARTED",
      payment_terms: paymentTerms,
      amount_paid: 0,
      balance_due: totalAmount,
      deposit_percent: paymentTerms === "DEPOSIT_50" ? 50 : null,
    })
    .select("id,receipt_token")
    .single();

  if (orderError || !order) {
    console.error("Client quotation order creation error:", orderError);
    redirect(reviewPath(token, "error=order-create"));
  }

  const { error: paymentError } = await supabase
    .from("order_payments")
    .insert({
      order_id: order.id,
      payment_stage: paymentTerms === "DEPOSIT_50" ? "DEPOSIT" : "FULL",
      amount: amountDueNow,
      currency: "PHP",
      provider: null,
      status: "PENDING",
    });

  if (paymentError) {
    console.error("Client quotation payment record error:", paymentError);
    await supabase.from("orders").delete().eq("id", order.id);
    redirect(reviewPath(token, "error=payment"));
  }

  const now = new Date().toISOString();

  const { data: claimed, error: claimError } = await supabase
    .from("quotation_requests")
    .update({
      status: "ACCEPTED",
      accepted_at: now,
      order_id: order.id,
      updated_at: now,
    })
    .eq("id", quotation.id)
    .eq("status", "QUOTED")
    .is("order_id", null)
    .select("id")
    .maybeSingle();

  if (claimError || !claimed) {
    console.error("Client quotation acceptance claim error:", claimError);
    await supabase.from("orders").delete().eq("id", order.id);

    const { data: latestQuotation } = await supabase
      .from("quotation_requests")
      .select("order_id")
      .eq("id", quotation.id)
      .maybeSingle();

    if (latestQuotation?.order_id) {
      const { data: existingOrder } = await supabase
        .from("orders")
        .select("receipt_token")
        .eq("id", latestQuotation.order_id)
        .maybeSingle();

      if (existingOrder?.receipt_token) {
        redirect(`/checkout/custom/${existingOrder.receipt_token}`);
      }
    }

    redirect(reviewPath(token, "error=accept"));
  }

  redirect(`/checkout/custom/${order.receipt_token}`);
}

export async function decideLater(formData: FormData) {
  const token = String(formData.get("token") ?? "").trim();

  if (!token) {
    redirect("/");
  }

  // Intentionally no database change. The quotation remains QUOTED and
  // the same private link can be opened again whenever the client is ready.
  redirect(reviewPath(token, "later=1"));
}
