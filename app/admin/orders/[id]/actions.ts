"use server";

import { refundPayMongoPayment, refundPayPalCapture } from "@/lib/refunds";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminSupabaseClient } from "@/lib/supabase-admin";
import { createServerSupabaseClient } from "@/lib/supabase-server";

async function requireAdmin() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  return user;
}

export async function addOrderNote(formData: FormData) {
  const user = await requireAdmin();

  const orderId = String(formData.get("order_id") ?? "").trim();
  const note = String(formData.get("note") ?? "").trim();

  if (!orderId) {
    throw new Error("Missing order ID.");
  }

  if (!note) {
    throw new Error("Note cannot be empty.");
  }

  if (note.length > 5000) {
    throw new Error("Note is too long.");
  }

  const adminSupabase = createAdminSupabaseClient();

  const { data: order, error: orderError } = await adminSupabase
    .from("orders")
    .select("id")
    .eq("id", orderId)
    .maybeSingle();

  if (orderError || !order) {
    console.error("Unable to verify order before adding note:", orderError);
    throw new Error("Order not found.");
  }

  const { error } = await adminSupabase
    .from("order_notes")
    .insert({
      order_id: orderId,
      note,
      created_by: user.email || "Admin",
    });

  if (error) {
    console.error("Unable to add order note:", error);
    throw new Error("Unable to add order note.");
  }

  revalidatePath(`/admin/orders/${orderId}`);
}

export async function cancelOrder(formData: FormData) {
  const user = await requireAdmin();

  const orderId = String(formData.get("order_id") ?? "").trim();
  const reason = String(formData.get("reason") ?? "").trim();

  if (!orderId) throw new Error("Missing order ID.");
  if (!reason) throw new Error("Cancellation reason is required.");
  if (reason.length > 1000) throw new Error("Cancellation reason is too long.");

  const adminSupabase = createAdminSupabaseClient();

  const { data: order, error: orderError } = await adminSupabase
    .from("orders")
    .select("id,order_number,payment_status,order_status")
    .eq("id", orderId)
    .maybeSingle();

  if (orderError || !order) {
    console.error("Unable to load order before cancellation:", orderError);
    throw new Error("Order not found.");
  }

  if (order.order_status === "CANCELLED") {
    redirect(`/admin/orders/${orderId}`);
  }

  const now = new Date().toISOString();

  const { data: cancelledOrder, error: cancelError } = await adminSupabase
    .from("orders")
    .update({
      order_status: "CANCELLED",
      cancellation_reason: reason,
      cancelled_at: now,
      updated_at: now,
    })
    .eq("id", orderId)
    .select("id")
    .maybeSingle();

  if (cancelError || !cancelledOrder) {
    console.error("Unable to cancel order:", cancelError);
    throw new Error("Unable to cancel this order.");
  }

  const paidNote =
    order.payment_status === "COMPLETED"
      ? " Payment remains COMPLETED; no automatic refund was issued."
      : "";

  const { error: noteError } = await adminSupabase.from("order_notes").insert({
    order_id: orderId,
    note: `Order ${order.order_number} was cancelled by admin. Reason: ${reason}.${paidNote}`,
    created_by: user.email || "Admin",
  });

  if (noteError) {
    console.error("Unable to add cancellation activity note:", noteError);
  }

  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");
  revalidatePath("/admin");

  redirect(`/admin/orders/${orderId}?cancelled=1`);
}



function normalizeProvider(value: string | null) {
  return (value || "").trim().toUpperCase();
}

async function loadRefundableOrder(orderId: string) {
  const admin = createAdminSupabaseClient();
  const { data: order, error } = await admin
    .from("orders")
    .select(
      "id,order_number,payment_provider,payment_status,total_amount,currency,paypal_capture_id,paymongo_payment_id,refund_status,refunded_amount",
    )
    .eq("id", orderId)
    .maybeSingle();

  if (error || !order) throw new Error("Order not found.");
  if (order.payment_status !== "COMPLETED") {
    throw new Error("Only completed payments can be refunded.");
  }
  if (order.refund_status === "REFUNDED") {
    throw new Error("This order is already fully refunded.");
  }

  return { admin, order };
}

function validateRefundAmount(
  amountRaw: string,
  totalAmount: number,
  alreadyRefunded: number,
) {
  const amount = Number(amountRaw);
  const remaining = Math.max(0, totalAmount - alreadyRefunded);

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Refund amount must be greater than zero.");
  }
  if (amount > remaining + 0.00001) {
    throw new Error("Refund amount exceeds the remaining refundable amount.");
  }
  return { amount: Number(amount.toFixed(2)), remaining };
}

async function saveSuccessfulRefund({
  admin,
  order,
  amount,
  reason,
  provider,
  providerRefundId,
  providerStatus,
  refundType,
  createdBy,
}: {
  admin: ReturnType<typeof createAdminSupabaseClient>;
  order: {
    id: string;
    total_amount: number | string | null;
    refunded_amount: number | string | null;
    currency: string | null;
  };
  amount: number;
  reason: string;
  provider: string;
  providerRefundId: string | null;
  providerStatus: string;
  refundType: "PROVIDER" | "EXTERNAL";
  createdBy: string;
}) {
  const total = Number(order.total_amount ?? 0);
  const previous = Number(order.refunded_amount ?? 0);
  const next = Number((previous + amount).toFixed(2));
  const full = next >= total - 0.00001;
  const now = new Date().toISOString();

  const { error: historyError } = await admin.from("order_refunds").insert({
    order_id: order.id,
    provider,
    provider_refund_id: providerRefundId,
    amount,
    currency: order.currency || "PHP",
    reason,
    provider_status: providerStatus,
    refund_type: refundType,
    created_by: createdBy,
  });
  if (historyError) {
    console.error("Refund history insert error:", historyError);
    throw new Error(
      "The provider refund succeeded, but TCL could not save the refund history. Do not refund again. Check the provider dashboard and reconcile this order.",
    );
  }

  const { error: updateError } = await admin
    .from("orders")
    .update({
      refund_status: full ? "REFUNDED" : "PARTIALLY_REFUNDED",
      refunded_amount: full ? total : next,
      refunded_at: now,
      refund_note: reason,
      updated_at: now,
    })
    .eq("id", order.id);

  if (updateError) {
    console.error("Order refund summary update error:", updateError);
    throw new Error(
      "The refund succeeded and was saved to refund history, but the order summary could not be updated. Do not refund again.",
    );
  }

  await admin.from("order_notes").insert({
    order_id: order.id,
    note: `${full ? "Full" : "Partial"} refund ${refundType === "PROVIDER" ? "processed" : "recorded"}: ${new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: order.currency || "PHP",
    }).format(amount)} via ${provider}. Status: ${providerStatus}.${providerRefundId ? ` Refund ID: ${providerRefundId}.` : ""} Reason: ${reason}`,
    created_by: createdBy,
  });

  revalidatePath(`/admin/orders/${order.id}`);
  revalidatePath("/admin/orders");
  revalidatePath("/admin");
  revalidatePath("/admin/customers");
}

export async function processProviderRefund(formData: FormData) {
  const user = await requireAdmin();
  const orderId = String(formData.get("order_id") ?? "").trim();
  const amountRaw = String(formData.get("refund_amount") ?? "").trim();
  const reason = String(formData.get("refund_reason") ?? "").trim();

  if (!orderId) throw new Error("Missing order ID.");
  if (!reason) throw new Error("Refund reason is required.");

  const { admin, order } = await loadRefundableOrder(orderId);
  const total = Number(order.total_amount ?? 0);
  const alreadyRefunded = Number(order.refunded_amount ?? 0);
  const { amount } = validateRefundAmount(amountRaw, total, alreadyRefunded);
  const provider = normalizeProvider(order.payment_provider);

  let result: { id: string; status: string; amount: number; currency: string };

  if (provider === "PAYPAL") {
    if (!order.paypal_capture_id) {
      throw new Error("This order is missing its PayPal capture ID.");
    }
    result = await refundPayPalCapture({
      captureId: order.paypal_capture_id,
      amount,
      currency: order.currency || "PHP",
      note: reason,
      requestId: `refund-${order.id}-${alreadyRefunded.toFixed(2)}-${amount.toFixed(2)}`.slice(0, 78),
    });
    if (result.status !== "COMPLETED") {
      throw new Error(`PayPal refund status is ${result.status}. Check PayPal before retrying.`);
    }
  } else if (provider === "PAYMONGO") {
    if (!order.paymongo_payment_id) {
      throw new Error("This order is missing its PayMongo payment ID.");
    }
    result = await refundPayMongoPayment({
      paymentId: order.paymongo_payment_id,
      amount,
      note: reason,
    });
    if (result.status !== "SUCCEEDED") {
      throw new Error(
        `PayMongo refund status is ${result.status}. Check PayMongo before retrying.`,
      );
    }
  } else {
    throw new Error("This payment provider does not support automatic refunds.");
  }

  await saveSuccessfulRefund({
    admin,
    order,
    amount: result.amount,
    reason,
    provider,
    providerRefundId: result.id,
    providerStatus: result.status,
    refundType: "PROVIDER",
    createdBy: user.email || "Admin",
  });

  redirect(`/admin/orders/${order.id}?refund_processed=1`);
}

export async function recordExternalRefund(formData: FormData) {
  const user = await requireAdmin();
  const orderId = String(formData.get("order_id") ?? "").trim();
  const amountRaw = String(formData.get("refund_amount") ?? "").trim();
  const reason = String(formData.get("refund_reason") ?? "").trim();

  if (!orderId) throw new Error("Missing order ID.");
  if (!reason) throw new Error("Refund reason is required.");

  const { admin, order } = await loadRefundableOrder(orderId);
  const total = Number(order.total_amount ?? 0);
  const alreadyRefunded = Number(order.refunded_amount ?? 0);
  const { amount } = validateRefundAmount(amountRaw, total, alreadyRefunded);

  await saveSuccessfulRefund({
    admin,
    order,
    amount,
    reason,
    provider: normalizeProvider(order.payment_provider) || "EXTERNAL",
    providerRefundId: null,
    providerStatus: "RECORDED",
    refundType: "EXTERNAL",
    createdBy: user.email || "Admin",
  });

  redirect(`/admin/orders/${order.id}?refund_recorded=1`);
}

export async function deleteOrder(formData: FormData) {
  await requireAdmin();

  const orderId = String(formData.get("order_id") ?? "").trim();
  const confirmation = String(formData.get("confirmation") ?? "").trim();

  if (!orderId) {
    redirect("/admin/orders?deleteError=missing-order");
  }

  if (confirmation !== "DELETE") {
    redirect(`/admin/orders/${encodeURIComponent(orderId)}?deleteError=confirmation`);
  }

  const admin = createAdminSupabaseClient();

  // Delete dependent records first. These are safe to remove with the local order.
  const { error: notesError } = await admin
    .from("order_notes")
    .delete()
    .eq("order_id", orderId);

  if (notesError) {
    console.error("Delete order notes error:", notesError);
    redirect(`/admin/orders/${encodeURIComponent(orderId)}?deleteError=notes`);
  }

  const { error: deliveriesError } = await admin
    .from("delivery_requests")
    .delete()
    .eq("order_id", orderId);

  if (deliveriesError) {
    console.error("Delete delivery requests error:", deliveriesError);
    redirect(`/admin/orders/${encodeURIComponent(orderId)}?deleteError=deliveries`);
  }

  // Keep submitted reviews, but detach invitations from the order before deletion.
  const { error: invitationsError } = await admin
    .from("review_invitations")
    .update({ order_id: null })
    .eq("order_id", orderId);

  if (invitationsError) {
    console.error("Detach review invitations error:", invitationsError);
    redirect(`/admin/orders/${encodeURIComponent(orderId)}?deleteError=reviews`);
  }

  const { error: orderError } = await admin
    .from("orders")
    .delete()
    .eq("id", orderId);

  if (orderError) {
    console.error("Delete order error:", orderError);
    redirect(`/admin/orders/${encodeURIComponent(orderId)}?deleteError=order`);
  }

  revalidatePath("/admin");
  revalidatePath("/admin/orders");
  revalidatePath("/admin/customers");
  revalidatePath("/admin/deliveries");
  revalidatePath("/admin/reviews");

  redirect("/admin/orders?deleted=1");
}
