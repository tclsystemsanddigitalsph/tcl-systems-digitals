"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminSupabaseClient } from "@/lib/supabase-admin";
import { createServerSupabaseClient } from "@/lib/supabase-server";

const allowedStatuses = new Set([
  "PENDING",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
]);

async function requireAdmin() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }
}

export async function updateDeliveryRequest(
  formData: FormData,
) {
  await requireAdmin();

  const requestId = String(
    formData.get("request_id") ?? "",
  ).trim();

  const orderId = String(
    formData.get("order_id") ?? "",
  ).trim();

  const requestedStatus = String(
    formData.get("status") ?? "PENDING",
  ).toUpperCase();

  const adminNotes = String(
    formData.get("admin_notes") ?? "",
  ).trim();

  if (!requestId || !orderId) {
    throw new Error("Missing delivery request information.");
  }

  if (!allowedStatuses.has(requestedStatus)) {
    throw new Error("Invalid delivery status.");
  }

  const adminSupabase = createAdminSupabaseClient();
  const now = new Date().toISOString();

  const deliveryUpdate = {
    status: requestedStatus,
    admin_notes: adminNotes || null,
    delivered_at:
      requestedStatus === "COMPLETED" ? now : null,
    updated_at: now,
  };

  const { error: deliveryError } = await adminSupabase
    .from("delivery_requests")
    .update(deliveryUpdate)
    .eq("id", requestId)
    .eq("order_id", orderId);

  if (deliveryError) {
    console.error(
      "Unable to update delivery request:",
      deliveryError,
    );
    throw new Error("Unable to update delivery request.");
  }

  let orderDeliveryStatus = "NOT_STARTED";

  if (requestedStatus === "IN_PROGRESS") {
    orderDeliveryStatus = "IN_PROGRESS";
  } else if (requestedStatus === "COMPLETED") {
    orderDeliveryStatus = "DELIVERED";
  } else if (requestedStatus === "CANCELLED") {
    orderDeliveryStatus = "CANCELLED";
  }

  const { error: orderError } = await adminSupabase
    .from("orders")
    .update({
      delivery_status: orderDeliveryStatus,
      delivered_at:
        requestedStatus === "COMPLETED" ? now : null,
      updated_at: now,
    })
    .eq("id", orderId);

  if (orderError) {
    console.error(
      "Unable to update order delivery status:",
      orderError,
    );
    throw new Error(
      "Delivery request saved, but the order status could not be updated.",
    );
  }

  revalidatePath("/admin/deliveries");
  revalidatePath("/admin");
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
}
