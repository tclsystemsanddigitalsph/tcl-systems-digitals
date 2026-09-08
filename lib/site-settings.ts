import "server-only";

import { createAdminSupabaseClient } from "@/lib/supabase-admin";

export type SiteSettings = {
  id: string;
  business_name: string;
  support_email: string | null;
  telegram_username: string;
  currency: string;
  default_processing_fee_percent: number;
  order_number_prefix: string;
  store_enabled: boolean;
  maintenance_mode: boolean;
  paypal_enabled: boolean;
  paymongo_enabled: boolean;
  download_link_expiry_minutes: number;
  default_delivery_message: string | null;
  email_sender_name: string;
  email_reply_to: string | null;
  customer_payment_email_enabled: boolean;
  admin_order_email_enabled: boolean;
  admin_notification_email: string | null;
  updated_at: string;
};

export async function getSiteSettings(): Promise<SiteSettings> {
  const { data, error } = await createAdminSupabaseClient()
    .from("site_settings")
    .select("*")
    .eq("id", "main")
    .single();

  if (error || !data) {
    throw new Error("Unable to load site settings.");
  }

  return data as SiteSettings;
}
