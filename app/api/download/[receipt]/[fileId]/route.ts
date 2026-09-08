import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase-admin";
import { getSiteSettings } from "@/lib/site-settings";

export const dynamic = "force-dynamic";

const MAX_DOWNLOADS = 3;
const ACCESS_DAYS = 7;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ receipt: string; fileId: string }> },
) {
  const { receipt, fileId } = await params;
  const receiptToken = receipt.trim();
  const productFileId = fileId.trim();

  const fallback = new URL(
    `/checkout/success?receipt=${encodeURIComponent(receiptToken)}`,
    request.url,
  );

  if (!receiptToken || !productFileId) {
    return NextResponse.redirect(fallback);
  }

  const admin = createAdminSupabaseClient();

  const { data: order } = await admin
    .from("orders")
    .select(
      "id,product_id,payment_status,order_status,paid_at,created_at,download_access_expires_at",
    )
    .eq("receipt_token", receiptToken)
    .eq("payment_status", "COMPLETED")
    .maybeSingle();

  if (!order || !order.product_id || order.order_status === "CANCELLED") {
    fallback.searchParams.set("download", "unavailable");
    return NextResponse.redirect(fallback);
  }

  let accessExpiresAt = order.download_access_expires_at as string | null;

  if (!accessExpiresAt) {
    const base = new Date(order.paid_at || order.created_at || Date.now());
    const expires = new Date(base.getTime() + ACCESS_DAYS * 24 * 60 * 60 * 1000);
    accessExpiresAt = expires.toISOString();

    await admin
      .from("orders")
      .update({
        download_access_expires_at: accessExpiresAt,
        updated_at: new Date().toISOString(),
      })
      .eq("id", order.id)
      .is("download_access_expires_at", null);
  }

  if (Date.now() >= new Date(accessExpiresAt).getTime()) {
    fallback.searchParams.set("download", "expired");
    return NextResponse.redirect(fallback);
  }

  const { data: file } = await admin
    .from("product_files")
    .select("id,product_id,storage_path,is_active")
    .eq("id", productFileId)
    .eq("product_id", order.product_id)
    .eq("is_active", true)
    .maybeSingle();

  if (!file) {
    fallback.searchParams.set("download", "unavailable");
    return NextResponse.redirect(fallback);
  }

  const { data: counter } = await admin
    .from("order_downloads")
    .select("id,download_count")
    .eq("order_id", order.id)
    .eq("product_file_id", file.id)
    .maybeSingle();

  const currentCount = Number(counter?.download_count ?? 0);

  if (currentCount >= MAX_DOWNLOADS) {
    fallback.searchParams.set("download", "limit");
    return NextResponse.redirect(fallback);
  }

  let expiryMinutes = 30;
  try {
    const settings = await getSiteSettings();
    expiryMinutes = Math.max(1, settings.download_link_expiry_minutes);
  } catch (error) {
    console.error("Unable to load signed URL expiry setting:", error);
  }

  const { data: signed, error: signedError } = await admin.storage
    .from("product-files")
    .createSignedUrl(file.storage_path, expiryMinutes * 60);

  if (signedError || !signed?.signedUrl) {
    console.error("Unable to create protected download URL:", signedError);
    fallback.searchParams.set("download", "error");
    return NextResponse.redirect(fallback);
  }

  const now = new Date().toISOString();

  if (counter) {
    const { error } = await admin
      .from("order_downloads")
      .update({
        download_count: currentCount + 1,
        last_downloaded_at: now,
        updated_at: now,
      })
      .eq("id", counter.id)
      .eq("download_count", currentCount);

    if (error) {
      console.error("Unable to update download counter:", error);
      fallback.searchParams.set("download", "error");
      return NextResponse.redirect(fallback);
    }
  } else {
    const { error } = await admin.from("order_downloads").insert({
      order_id: order.id,
      product_file_id: file.id,
      download_count: 1,
      last_downloaded_at: now,
      updated_at: now,
    });

    if (error) {
      console.error("Unable to create download counter:", error);
      fallback.searchParams.set("download", "error");
      return NextResponse.redirect(fallback);
    }
  }

  return NextResponse.redirect(signed.signedUrl);
}
