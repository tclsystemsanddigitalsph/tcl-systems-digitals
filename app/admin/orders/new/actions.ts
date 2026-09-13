"use server";

import { redirect } from "next/navigation";
import { createAdminSupabaseClient } from "@/lib/supabase-admin";
import { createServerSupabaseClient } from "@/lib/supabase-server";

const paymentStatuses = new Set([
  "COMPLETED",
  "PENDING",
  "CANCELLED",
  "FAILED",
]);

const deliveryStatuses = new Set([
  "NOT_STARTED",
  "IN_PROGRESS",
  "DELIVERED",
  "CANCELLED",
]);

const sources = new Set([
  "MANUAL",
  "FACEBOOK",
  "INSTAGRAM",
  "TELEGRAM",
  "ETSY",
  "RAKET.PH",
  "OTHER",
]);

function money(value: FormDataEntryValue | null) {
  const parsed = Number(String(value ?? "0"));

  return Number.isFinite(parsed) && parsed >= 0
    ? Math.round((parsed + Number.EPSILON) * 100) / 100
    : 0;
}

function makeOrderNumber() {
  const time = Date.now().toString(36).toUpperCase();
  const random = crypto.randomUUID().replace(/-/g, "").slice(0, 6).toUpperCase();

  return `TCL-MAN-${time}-${random}`;
}

function processingPercent(basePrice: number, processingFee: number) {
  if (basePrice <= 0 || processingFee <= 0) return 0;

  return Math.round(
    (((processingFee / basePrice) * 100) + Number.EPSILON) * 100,
  ) / 100;
}

export async function createManualOrder(formData: FormData) {
  const authSupabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await authSupabase.auth.getUser();

  if (!user) redirect("/admin/login");

  const customerName = String(formData.get("customer_name") ?? "").trim();
  const customerEmail = String(formData.get("customer_email") ?? "")
    .trim()
    .toLowerCase();

  const productId = String(formData.get("product_id") ?? "").trim();
  const productName = String(formData.get("product_name") ?? "").trim();
  const orderSource = String(
    formData.get("order_source") ?? "MANUAL",
  ).toUpperCase();

  const customDescription = String(
    formData.get("custom_description") ?? "",
  ).trim();

  const externalReference = String(
    formData.get("external_reference") ?? "",
  ).trim();

  const notes = String(formData.get("notes") ?? "").trim();

  const basePrice = money(formData.get("base_price"));
  const processingFee = money(formData.get("processing_fee"));

  const requestedPaymentStatus = String(
    formData.get("payment_status") ?? "COMPLETED",
  ).toUpperCase();

  const requestedPaymentProvider = String(
    formData.get("payment_provider") ?? "MANUAL",
  ).toUpperCase();

  const deliveryStatus = String(
    formData.get("delivery_status") ?? "NOT_STARTED",
  ).toUpperCase();

  const generateCheckout =
    String(formData.get("generate_checkout") ?? "") === "1";

  if (!customerName || !customerEmail || !productName) {
    throw new Error("Customer name, email, and order title are required.");
  }

  if (!customerEmail.includes("@")) {
    throw new Error("Please enter a valid customer email.");
  }

  if (basePrice <= 0) {
    throw new Error("Base price must be greater than zero.");
  }

  if (!paymentStatuses.has(requestedPaymentStatus)) {
    throw new Error("Invalid payment status.");
  }

  if (!deliveryStatuses.has(deliveryStatus)) {
    throw new Error("Invalid delivery status.");
  }

  if (!sources.has(orderSource)) {
    throw new Error("Invalid order source.");
  }

  const adminSupabase = createAdminSupabaseClient();

  let linkedProductId: string | null = null;

  if (productId) {
    const { data: product, error: productError } = await adminSupabase
      .from("products")
      .select("id")
      .eq("id", productId)
      .maybeSingle();

    if (productError) {
      console.error("Unable to load selected product:", productError);
      throw new Error("Unable to load the selected product.");
    }

    if (!product) {
      throw new Error("The selected product no longer exists.");
    }

    linkedProductId = product.id;
  }

  const totalAmount =
    Math.round((basePrice + processingFee + Number.EPSILON) * 100) / 100;

  const feePercent = processingPercent(basePrice, processingFee);
  const now = new Date().toISOString();

  const paymentStatus = generateCheckout
    ? "PENDING"
    : requestedPaymentStatus;

  const paymentProvider = generateCheckout
    ? null
    : requestedPaymentProvider;

  const amountPaid =
    paymentStatus === "COMPLETED" ? totalAmount : 0;

  const balanceDue =
    paymentStatus === "COMPLETED" ? 0 : totalAmount;

  const orderNumber = makeOrderNumber();

  const { data: order, error: orderError } = await adminSupabase
    .from("orders")
    .insert({
      order_number: orderNumber,
      customer_name: customerName,
      customer_email: customerEmail,
      product_id: linkedProductId,
      product_name: productName,
      base_price: basePrice,
      processing_fee_percent: feePercent,
      processing_fee: processingFee,
      total_amount: totalAmount,
      currency: "PHP",
      payment_provider: paymentProvider,
      payment_status: paymentStatus,
      payment_terms: generateCheckout ? "FULL" : null,
      amount_paid: amountPaid,
      balance_due: balanceDue,
      delivery_status: deliveryStatus,
      notes: notes || null,
      paid_at: paymentStatus === "COMPLETED" ? now : null,
      delivered_at: deliveryStatus === "DELIVERED" ? now : null,
      order_source: orderSource,
      custom_description: customDescription || null,
      external_reference: externalReference || null,
      updated_at: now,
    })
    .select("id,receipt_token")
    .single();

  if (orderError || !order) {
    console.error("Manual order creation error:", orderError);

    throw new Error(
      orderError?.message
        ? `Unable to create the manual order: ${orderError.message}`
        : "Unable to create the manual order.",
    );
  }

  if (generateCheckout) {
    const { error: paymentError } = await adminSupabase
      .from("order_payments")
      .insert({
        order_id: order.id,
        payment_stage: "FULL",
        amount: totalAmount,
        currency: "PHP",
        provider: null,
        status: "PENDING",
      });

    if (paymentError) {
      console.error("Manual checkout payment creation error:", paymentError);

      const { error: rollbackError } = await adminSupabase
        .from("orders")
        .delete()
        .eq("id", order.id);

      if (rollbackError) {
        console.error(
          "Unable to roll back manual order after payment-row failure:",
          rollbackError,
        );
      }

      throw new Error(
        `Unable to create the private checkout payment: ${paymentError.message}`,
      );
    }
  }

  if (notes) {
    const { error: noteError } = await adminSupabase
      .from("order_notes")
      .insert({
        order_id: order.id,
        note: notes,
        created_by: user.email || "Admin",
      });

    if (noteError) {
      console.error("Unable to create initial order log note:", noteError);
    }
  }

  if (generateCheckout) {
    redirect(`/admin/orders/${order.id}?checkout_created=1`);
  }

  redirect(`/admin/orders/${order.id}`);
}
