"use server";

import { redirect } from "next/navigation";
import { createAdminSupabaseClient } from "@/lib/supabase-admin";

const CUSTOM_PRODUCT_SLUG = "custom-business-website";
const FULL_PAYMENT_FEE_PERCENT = 4;
const DEPOSIT_PAYMENT_FEE_PERCENT = 6;
const BPI_DIRECT_FEE_PERCENT = 0;

type PaymentTerms = "FULL" | "DEPOSIT_50";
type PaymentChoice = "PROVIDER_FULL" | "PROVIDER_DEPOSIT" | "BPI_FULL";

type QuotationRow = {
  id: string;
  secure_token: string | null;
  status: string;
  order_id: string | null;
  quoted_amount: number | string | null;
  payment_terms: string | null;
  full_name: string | null;
  business_name: string | null;
  email: string | null;
  product_name: string | null;
  product_slug: string | null;
};

type ProductRow = {
  id: string;
  slug: string;
  name: string | null;
  product_type: string | null;
  is_active: boolean | null;
};

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

function readPaymentChoice(formData: FormData): PaymentChoice | null {
  const value = String(formData.get("payment_choice") ?? "").trim();
  return value === "PROVIDER_FULL" ||
    value === "PROVIDER_DEPOSIT" ||
    value === "BPI_FULL"
    ? value
    : null;
}

function paymentTermsForChoice(choice: PaymentChoice): PaymentTerms {
  return choice === "PROVIDER_DEPOSIT" ? "DEPOSIT_50" : "FULL";
}

function feePercentForChoice(choice: PaymentChoice) {
  if (choice === "PROVIDER_FULL") return FULL_PAYMENT_FEE_PERCENT;
  if (choice === "PROVIDER_DEPOSIT") return DEPOSIT_PAYMENT_FEE_PERCENT;
  return BPI_DIRECT_FEE_PERCENT;
}

async function addQuotationActivityLogs({
  supabase,
  quotationId,
  logs,
}: {
  supabase: ReturnType<typeof createAdminSupabaseClient>;
  quotationId: string;
  logs: Array<{
    actionType: string;
    summary: string;
    details?: Record<string, unknown>;
  }>;
}) {
  if (!logs.length) return;

  const { error } = await supabase
    .from("quotation_activity_logs")
    .insert(
      logs.map((log) => ({
        quotation_request_id: quotationId,
        action_type: log.actionType,
        summary: log.summary,
        details: log.details ?? {},
      })),
    );

  if (error) {
    console.error("Quotation activity log insert error:", error);
  }
}

export async function acceptQuotation(formData: FormData) {
  const token = String(formData.get("token") ?? "").trim();
  const paymentChoice = readPaymentChoice(formData);

  if (!token) {
    redirect("/");
  }

  if (!paymentChoice) {
    redirect(reviewPath(token, "error=payment-choice"));
  }

  const paymentTerms = paymentTermsForChoice(paymentChoice);

  const supabase = createAdminSupabaseClient();

  const { data: quotationData, error: quotationError } = await supabase
    .from("quotation_requests")
    .select("*")
    .eq("secure_token", token)
    .maybeSingle();

  const quotation = quotationData as unknown as QuotationRow | null;

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

  if (!Number.isFinite(quotedAmount) || quotedAmount <= 0) {
    redirect(reviewPath(token, "error=amount"));
  }

  const productSlug =
    String(quotation.product_slug ?? "").trim() || CUSTOM_PRODUCT_SLUG;

  let productQuery = supabase
    .from("products")
    .select("id,slug,name,product_type,is_active")
    .eq("slug", productSlug);

  // The permanent custom-quotation service may be hidden/inactive in the
  // storefront catalog while still being used as the internal order anchor.
  // Do not block quotation acceptance just because that catalog row is hidden.
  if (productSlug !== CUSTOM_PRODUCT_SLUG) {
    productQuery = productQuery.eq("is_active", true);
  }

  const { data: productData, error: productError } =
    await productQuery.maybeSingle();

  const product = productData as unknown as ProductRow | null;

  if (productError || !product) {
    console.error("Client quotation product lookup error:", productError, {
      productSlug,
    });
    redirect(reviewPath(token, "error=product"));
  }

  if (productSlug !== CUSTOM_PRODUCT_SLUG && product.product_type !== "SERVICE") {
    redirect(reviewPath(token, "error=product-type"));
  }

  const customerName =
    String(quotation.full_name ?? "").trim() ||
    String(quotation.business_name ?? "").trim() ||
    "Customer";

  const submittedEmail = String(
    formData.get("customer_email") ?? "",
  )
    .trim()
    .toLowerCase();

  const customerEmail =
    submittedEmail || String(quotation.email ?? "").trim().toLowerCase();

  const emailLooksValid =
    customerEmail.length <= 254 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail);

  if (!emailLooksValid) {
    redirect(reviewPath(token, "error=email"));
  }

  // Keep the quotation contact email in sync with what the client confirms.
  if (customerEmail !== String(quotation.email ?? "").trim().toLowerCase()) {
    const { error: emailUpdateError } = await supabase
      .from("quotation_requests")
      .update({
        email: customerEmail,
        updated_at: new Date().toISOString(),
      })
      .eq("id", quotation.id);

    if (emailUpdateError) {
      console.error("Unable to save quotation customer email:", emailUpdateError);
      redirect(reviewPath(token, "error=email-save"));
    }
  }

  // The client chooses the payment method/plan on the quotation link.
  // Online provider FULL = 4% provider processing fee.
  // Online provider 50% DP = 6% provider processing fee.
  // Direct BPI FULL = 0% processing fee and is manually verified by TCL.
  const processingFeePercent = feePercentForChoice(paymentChoice);

  const baseCentavos = moneyToCentavos(quotedAmount);
  const feeCentavos = Math.round(
    (baseCentavos * processingFeePercent) / 100,
  );
  const totalCentavos = baseCentavos + feeCentavos;

  const processingFee = feeCentavos / 100;
  const totalAmount = totalCentavos / 100;

  const amountDueNow =
    paymentTerms === "DEPOSIT_50"
      ? Math.round(totalCentavos / 2) / 100
      : totalAmount;

  const paymentStage =
    paymentTerms === "DEPOSIT_50" ? "DEPOSIT" : "FULL";

  const orderNumber = createOrderNumber();

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      order_number: orderNumber,
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
    .select("*")
    .single();

  if (orderError || !order) {
    console.error("Client quotation order creation error:", orderError);
    redirect(reviewPath(token, "error=order-create"));
  }

  const { error: paymentError } = await supabase
    .from("order_payments")
    .insert({
      order_id: order.id,
      payment_stage: paymentStage,
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
      payment_terms: paymentTerms,
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

  await addQuotationActivityLogs({
    supabase,
    quotationId: quotation.id,
    logs: [
      {
        actionType: "QUOTATION_ACCEPTED",
        summary: "Client accepted the quotation and selected a payment plan.",
        details: {
          order_id: order.id,
          order_number: order.order_number,
          quoted_amount: quotedAmount,
          processing_fee_percent: processingFeePercent,
          processing_fee: processingFee,
          order_total: totalAmount,
          payment_terms: paymentTerms,
          payment_choice: paymentChoice,
          payment_method:
            paymentChoice === "BPI_FULL" ? "BPI_DIRECT" : "ONLINE_PROVIDER",
          successful_payments: 0,
          remaining_balance: totalAmount,
        },
      },
      {
        actionType: "PAYMENT_REQUEST_CREATED",
        summary:
          paymentStage === "DEPOSIT"
            ? "50% down payment requested through an online payment provider with a 6% processing fee."
            : paymentChoice === "BPI_FULL"
              ? "Full payment requested through direct BPI bank transfer with no processing fee."
              : "Full payment requested through an online payment provider with a 4% processing fee.",
        details: {
          order_id: order.id,
          order_number: order.order_number,
          payment_stage: paymentStage,
          payment_choice: paymentChoice,
          payment_method:
            paymentChoice === "BPI_FULL" ? "BPI_DIRECT" : "ONLINE_PROVIDER",
          amount_due: amountDueNow,
          currency: "PHP",
          current_order_total: totalAmount,
          successful_payments: 0,
          remaining_balance: totalAmount,
        },
      },
    ],
  });

  redirect(`/checkout/custom/${order.receipt_token}`);
}

export async function decideLater(formData: FormData) {
  const token = String(formData.get("token") ?? "").trim();

  if (!token) {
    redirect("/");
  }

  redirect(reviewPath(token, "later=1"));
}
