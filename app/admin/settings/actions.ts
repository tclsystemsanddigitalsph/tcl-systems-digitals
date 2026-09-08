"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminSupabaseClient } from "@/lib/supabase-admin";

function text(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function checked(formData: FormData, name: string) {
  return formData.get(name) === "on";
}

export async function saveSiteSettings(formData: FormData) {
  const processingFee = Number(text(formData, "default_processing_fee_percent"));
  const expiry = Number(text(formData, "download_link_expiry_minutes"));

  if (!Number.isFinite(processingFee) || processingFee < 0 || processingFee > 100) {
    throw new Error("Processing fee must be between 0 and 100.");
  }

  if (!Number.isInteger(expiry) || expiry < 1 || expiry > 10080) {
    throw new Error("Download link expiry must be between 1 and 10,080 minutes.");
  }

  const businessName = text(formData, "business_name");
  const telegramUsername = text(formData, "telegram_username").replace(/^@/, "");
  const currency = text(formData, "currency").toUpperCase();
  const orderPrefix = text(formData, "order_number_prefix").toUpperCase();

  if (!businessName) throw new Error("Business name is required.");
  if (!telegramUsername) throw new Error("Telegram username is required.");
  if (!/^[A-Z]{3}$/.test(currency)) throw new Error("Currency must be a 3-letter code.");
  if (!/^[A-Z0-9-]{2,12}$/.test(orderPrefix)) {
    throw new Error("Order prefix must be 2–12 letters, numbers, or hyphens.");
  }

  const { error } = await createAdminSupabaseClient()
    .from("site_settings")
    .upsert({
      id: "main",
      business_name: businessName,
      support_email: text(formData, "support_email") || null,
      telegram_username: telegramUsername,
      currency,
      default_processing_fee_percent: processingFee,
      order_number_prefix: orderPrefix,
      store_enabled: checked(formData, "store_enabled"),
      maintenance_mode: checked(formData, "maintenance_mode"),
      paypal_enabled: checked(formData, "paypal_enabled"),
      paymongo_enabled: checked(formData, "paymongo_enabled"),
      download_link_expiry_minutes: expiry,
      default_delivery_message: text(formData, "default_delivery_message") || null,
      email_sender_name: text(formData, "email_sender_name") || businessName,
      email_reply_to: text(formData, "email_reply_to") || null,
      customer_payment_email_enabled: checked(formData, "customer_payment_email_enabled"),
      admin_order_email_enabled: checked(formData, "admin_order_email_enabled"),
      admin_notification_email: text(formData, "admin_notification_email") || null,
      updated_at: new Date().toISOString(),
    });

  if (error) {
    console.error("Settings update failed:", error);
    throw new Error("Unable to save site settings.");
  }

  revalidatePath("/admin/settings");
  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath("/checkout");

  redirect("/admin/settings?saved=1");
}
