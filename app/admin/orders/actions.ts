"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminSupabaseClient } from "@/lib/supabase-admin";
import { createServerSupabaseClient } from "@/lib/supabase-server";

const DELIVERY_STATUSES = [
  "NOT_STARTED",
  "IN_PROGRESS",
  "DELIVERED",
  "CANCELLED",
] as const;

type DeliveryStatus = (typeof DELIVERY_STATUSES)[number];

async function requireAdmin() {
  const authSupabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await authSupabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  return user;
}

function safeOrdersReturnPath(value: FormDataEntryValue | null) {
  const raw = String(value ?? "").trim();

  if (
    raw.startsWith("/admin/orders") &&
    !raw.startsWith("//")
  ) {
    return raw;
  }

  return "/admin/orders";
}

function withQuery(path: string, key: string, value: string) {
  return `${path}${path.includes("?") ? "&" : "?"}${key}=${encodeURIComponent(value)}`;
}

export async function updateDeliveryStatus(formData: FormData) {
  await requireAdmin();

  const orderId = String(formData.get("order_id") ?? "").trim();
  const deliveryStatus = String(
    formData.get("delivery_status") ?? "",
  ).toUpperCase();
  const returnTo = safeOrdersReturnPath(formData.get("return_to"));

  if (!orderId) {
    redirect(withQuery(returnTo, "delivery_error", "missing-order"));
  }

  if (!DELIVERY_STATUSES.includes(deliveryStatus as DeliveryStatus)) {
    redirect(withQuery(returnTo, "delivery_error", "invalid-status"));
  }

  const adminSupabase = createAdminSupabaseClient();
  const now = new Date().toISOString();

  const { data: updatedOrder, error } = await adminSupabase
    .from("orders")
    .update({
      delivery_status: deliveryStatus,
      delivered_at: deliveryStatus === "DELIVERED" ? now : null,
      updated_at: now,
    })
    .eq("id", orderId)
    .select("id,delivery_status")
    .maybeSingle();

  if (error) {
    console.error("Admin delivery status update error:", error);
    redirect(withQuery(returnTo, "delivery_error", "update-failed"));
  }

  if (!updatedOrder) {
    redirect(withQuery(returnTo, "delivery_error", "order-not-found"));
  }

  revalidatePath("/admin");
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/deliveries");

  redirect(withQuery(returnTo, "delivery_saved", "1"));
}

export async function deleteOrdersBulk(formData: FormData) {
  await requireAdmin();

  const returnTo = safeOrdersReturnPath(formData.get("return_to"));
  const confirmation = String(formData.get("confirmation") ?? "").trim();

  const orderIds = Array.from(
    new Set(
      formData
        .getAll("order_ids")
        .map((value) => String(value).trim())
        .filter(Boolean),
    ),
  );

  if (orderIds.length === 0) {
    redirect(withQuery(returnTo, "bulk_delete_error", "no-selection"));
  }

  if (confirmation !== "DELETE") {
    redirect(withQuery(returnTo, "bulk_delete_error", "confirmation"));
  }

  const admin = createAdminSupabaseClient();

  const { data: existingOrders, error: loadError } = await admin
    .from("orders")
    .select("id")
    .in("id", orderIds);

  if (loadError) {
    console.error("Bulk order load error:", loadError);
    redirect(withQuery(returnTo, "bulk_delete_error", "load-failed"));
  }

  const existingIds = (existingOrders ?? []).map((order) => order.id);

  if (existingIds.length === 0) {
    redirect(withQuery(returnTo, "bulk_delete_error", "not-found"));
  }

  const cleanupResults = await Promise.all([
    admin.from("download_logs").delete().in("order_id", existingIds),
    admin.from("order_downloads").delete().in("order_id", existingIds),
    admin.from("order_refunds").delete().in("order_id", existingIds),
    admin.from("order_notes").delete().in("order_id", existingIds),
    admin.from("delivery_requests").delete().in("order_id", existingIds),
    admin
      .from("review_invitations")
      .update({ order_id: null })
      .in("order_id", existingIds),
  ]);

  const cleanupError = cleanupResults.find((result) => result.error)?.error;

  if (cleanupError) {
    console.error("Bulk order related-data cleanup error:", cleanupError);
    redirect(withQuery(returnTo, "bulk_delete_error", "cleanup-failed"));
  }

  const { error: deleteError } = await admin
    .from("orders")
    .delete()
    .in("id", existingIds);

  if (deleteError) {
    console.error("Bulk delete orders error:", deleteError);
    redirect(withQuery(returnTo, "bulk_delete_error", "delete-failed"));
  }

  revalidatePath("/admin");
  revalidatePath("/admin/orders");
  revalidatePath("/admin/customers");
  revalidatePath("/admin/deliveries");
  revalidatePath("/admin/reviews");
  revalidatePath("/admin/project-requirements");

  redirect(withQuery("/admin/orders", "bulk_deleted", String(existingIds.length)));
}
