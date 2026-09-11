"use server";

import crypto from "node:crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createAdminSupabaseClient } from "@/lib/supabase-admin";
import { createServerSupabaseClient } from "@/lib/supabase-server";

const PRODUCT_FILES_BUCKET = "product-files";
const SIMPLE_WEBSITE_SLUG = "simple-business-website-template";

const MAX_FILE_SIZE = 50 * 1024 * 1024;
const ACCESS_DAYS = 7;

function getString(formData: FormData, key: string) {
  const value = formData.get(key);

  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

function sanitizeFileName(name: string) {
  const cleaned = name
    .normalize("NFKD")
    .replace(/[^\w.\-() ]+/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^\.+/, "")
    .slice(0, 140);

  return cleaned || "website-package.zip";
}

function buildStoragePath(orderId: string, fileName: string) {
  const safeName = sanitizeFileName(fileName);
  const unique = crypto.randomUUID();

  return `orders/${orderId}/${unique}-${safeName}`;
}

async function requireAdmin() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/admin/login");
  }

  return user;
}

async function addActivityNote(
  orderId: string,
  note: string,
  createdBy: string,
) {
  const admin = createAdminSupabaseClient();

  const { error } = await admin.from("order_notes").insert({
    order_id: orderId,
    note,
    created_by: createdBy,
  });

  if (error) {
    console.error("Unable to add website delivery activity note:", error);
  }
}

export async function uploadWebsiteOrderFile(formData: FormData) {
  const user = await requireAdmin();

  const orderId = getString(formData, "order_id");
  const requestedDisplayName = getString(formData, "display_name");
  const file = formData.get("file");

  if (!orderId) {
    redirect("/admin/orders");
  }

  const orderUrl = `/admin/orders/${orderId}`;

  if (!(file instanceof File) || file.size <= 0) {
    redirect(
      `${orderUrl}?website_file_error=missing-file#website-delivery`,
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    redirect(
      `${orderUrl}?website_file_error=file-too-large#website-delivery`,
    );
  }

  const lowerFileName = file.name.toLowerCase();

  if (!lowerFileName.endsWith(".zip")) {
    redirect(
      `${orderUrl}?website_file_error=invalid-file-type#website-delivery`,
    );
  }

  const displayName =
    requestedDisplayName || "Website Package";

  const admin = createAdminSupabaseClient();

  /*
   * Confirm that:
   * 1. the order exists,
   * 2. payment is completed,
   * 3. the order is not cancelled,
   * 4. this is specifically the Simple Business Website Template.
   */
  const { data: order, error: orderError } = await admin
    .from("orders")
    .select(
      "id,order_number,product_id,payment_status,order_status,customer_email,selected_design_name",
    )
    .eq("id", orderId)
    .maybeSingle();

  if (orderError || !order) {
    redirect(`${orderUrl}?website_file_error=order-not-found`);
  }

  if (order.payment_status !== "COMPLETED") {
    redirect(
      `${orderUrl}?website_file_error=payment-not-completed#website-delivery`,
    );
  }

  if (order.order_status === "CANCELLED") {
    redirect(
      `${orderUrl}?website_file_error=order-cancelled#website-delivery`,
    );
  }

  if (!order.product_id) {
    redirect(
      `${orderUrl}?website_file_error=wrong-product#website-delivery`,
    );
  }

  const { data: product, error: productError } = await admin
    .from("products")
    .select("id,slug,name")
    .eq("id", order.product_id)
    .maybeSingle();

  if (
    productError ||
    !product ||
    product.slug !== SIMPLE_WEBSITE_SLUG
  ) {
    redirect(
      `${orderUrl}?website_file_error=wrong-product#website-delivery`,
    );
  }

  /*
   * Load the currently active personalized package first.
   * We do not delete it until the new package has been uploaded
   * and successfully saved.
   */
  const { data: previousFiles, error: previousFilesError } = await admin
    .from("order_files")
    .select("id,storage_path,display_name")
    .eq("order_id", orderId)
    .eq("is_active", true);

  if (previousFilesError) {
    console.error(
      "Unable to check existing order files:",
      previousFilesError,
    );

    redirect(
      `${orderUrl}?website_file_error=load-failed#website-delivery`,
    );
  }

  /*
   * Upload the new customer-specific ZIP to the existing
   * private Supabase bucket.
   */
  const storagePath = buildStoragePath(orderId, file.name);
  const bytes = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await admin.storage
    .from(PRODUCT_FILES_BUCKET)
    .upload(storagePath, bytes, {
      contentType: file.type || "application/zip",
      upsert: false,
      cacheControl: "3600",
    });

  if (uploadError) {
    console.error("Website order file upload error:", uploadError);

    redirect(
      `${orderUrl}?website_file_error=upload-failed#website-delivery`,
    );
  }

  /*
   * Create the new order-specific file record.
   *
   * It starts with zero downloads because this package is unique
   * to this order.
   */
  const now = new Date();

  const expiresAt = new Date(
    now.getTime() + ACCESS_DAYS * 24 * 60 * 60 * 1000,
  );

  const { data: newOrderFile, error: insertError } = await admin
    .from("order_files")
    .insert({
      order_id: orderId,
      display_name: displayName,
      storage_path: storagePath,
      download_count: 0,
      last_downloaded_at: null,
      is_active: true,
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    })
    .select("id")
    .single();

  if (insertError || !newOrderFile) {
    console.error(
      "Website order file record error:",
      insertError,
    );

    await admin.storage
      .from(PRODUCT_FILES_BUCKET)
      .remove([storagePath]);

    redirect(
      `${orderUrl}?website_file_error=save-failed#website-delivery`,
    );
  }

  /*
   * The 7-day access starts NOW — when the personalized ZIP is
   * actually ready — not when the customer originally paid.
   *
   * DELIVERED means the personalized package is ready for the
   * customer to access.
   */
  const { error: orderUpdateError } = await admin
    .from("orders")
    .update({
      delivery_status: "DELIVERED",
      delivered_at: now.toISOString(),
      download_access_expires_at: expiresAt.toISOString(),
      updated_at: now.toISOString(),
    })
    .eq("id", orderId);

  if (orderUpdateError) {
    console.error(
      "Unable to activate website order delivery:",
      orderUpdateError,
    );

    await admin
      .from("order_files")
      .delete()
      .eq("id", newOrderFile.id);

    await admin.storage
      .from(PRODUCT_FILES_BUCKET)
      .remove([storagePath]);

    redirect(
      `${orderUrl}?website_file_error=activate-failed#website-delivery`,
    );
  }

  /*
   * Now that the replacement is safely ready, deactivate previous
   * packages for this order.
   */
  const previousIds = (previousFiles ?? [])
    .map((item) => item.id)
    .filter((id) => id !== newOrderFile.id);

  if (previousIds.length > 0) {
    const { error: deactivateError } = await admin
      .from("order_files")
      .update({
        is_active: false,
        updated_at: now.toISOString(),
      })
      .in("id", previousIds);

    if (deactivateError) {
      console.error(
        "Unable to deactivate previous website packages:",
        deactivateError,
      );
    }
  }

  /*
   * Remove replaced ZIPs from private storage.
   *
   * Their database records remain inactive as a small delivery
   * history, but the actual old package is removed.
   */
  const previousStoragePaths = (previousFiles ?? [])
    .filter((item) => item.id !== newOrderFile.id)
    .map((item) => item.storage_path)
    .filter(Boolean);

  if (previousStoragePaths.length > 0) {
    const { error: cleanupError } = await admin.storage
      .from(PRODUCT_FILES_BUCKET)
      .remove(previousStoragePaths);

    if (cleanupError) {
      console.error(
        "Unable to remove previous website package files:",
        cleanupError,
      );
    }
  }

  const designText = order.selected_design_name
    ? ` Selected design: ${order.selected_design_name}.`
    : "";

  await addActivityNote(
    orderId,
    `Personalized website package uploaded and marked ready for download.${designText} Customer access is available for ${ACCESS_DAYS} days, through ${expiresAt.toISOString()}.`,
    user.email || "Admin",
  );

  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");
  revalidatePath("/admin");
  revalidatePath("/order-status");
  revalidatePath("/checkout/success/simple-business-website");

  redirect(
    `${orderUrl}?website_file_uploaded=1#website-delivery`,
  );
}