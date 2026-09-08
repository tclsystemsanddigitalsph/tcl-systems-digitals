"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminSupabaseClient } from "@/lib/supabase-admin";
import { createServerSupabaseClient } from "@/lib/supabase-server";

async function requireAdmin() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");
  return user;
}

export async function resetDownloadAccess(formData: FormData) {
  const user = await requireAdmin();
  const orderId = String(formData.get("order_id") ?? "").trim();
  if (!orderId) throw new Error("Missing order ID.");

  const admin = createAdminSupabaseClient();
  const { data: order, error } = await admin
    .from("orders")
    .select("id,order_number,payment_status")
    .eq("id", orderId)
    .maybeSingle();

  if (error || !order) throw new Error("Order not found.");
  if (order.payment_status !== "COMPLETED") {
    throw new Error("Download access can only be restored for a completed order.");
  }

  const now = new Date();
  const expires = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();

  const { error: resetError } = await admin
    .from("order_downloads")
    .delete()
    .eq("order_id", orderId);

  if (resetError) throw new Error("Unable to reset download counts.");

  const { error: orderError } = await admin
    .from("orders")
    .update({
      download_access_expires_at: expires,
      updated_at: now.toISOString(),
    })
    .eq("id", orderId);

  if (orderError) throw new Error("Unable to restore download access.");

  await admin.from("order_notes").insert({
    order_id: orderId,
    note: `Digital download access restored by admin. Download counts reset to 0 and access extended for 7 days.`,
    created_by: user.email || "Admin",
  });

  revalidatePath(`/admin/orders/${orderId}`);
  redirect(`/admin/orders/${orderId}?downloads_reset=1`);
}
