"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createAdminSupabaseClient } from "@/lib/supabase-admin";
import { createServerSupabaseClient } from "@/lib/supabase-server";

const allowedTypes = ["DOWNLOAD", "GITHUB", "SERVICE", "MANUAL"];
const PRODUCT_FILES_BUCKET = "product-files";

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  if (typeof value !== "string") return "";
  return value.trim();
}

function getOptionalString(formData: FormData, key: string) {
  const value = getString(formData, key);
  return value.length > 0 ? value : null;
}

function getNumber(formData: FormData, key: string, fallback = 0) {
  const value = getString(formData, key);
  if (!value) return fallback;

  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function getOptionalNumber(formData: FormData, key: string) {
  const value = getString(formData, key);
  if (!value) return null;

  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function sanitizeSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function sanitizeFileName(name: string) {
  const cleaned = name
    .normalize("NFKD")
    .replace(/[^\w.\-() ]+/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^\.+/, "")
    .slice(0, 140);

  return cleaned || "file";
}

function buildStoragePath(productId: string, fileName: string) {
  const safeName = sanitizeFileName(fileName);
  const unique = crypto.randomUUID();
  return `${productId}/${unique}-${safeName}`;
}

async function requireAdmin() {
  const authSupabase = await createServerSupabaseClient();

  const {
    data: { user },
    error,
  } = await authSupabase.auth.getUser();

  if (error || !user) {
    redirect("/admin/login");
  }

  return user;
}

function validateProductFields(formData: FormData) {
  const name = getString(formData, "name");
  const slug = sanitizeSlug(getString(formData, "slug"));
  const productType = getString(formData, "product_type");
  const deliveryMethod = getString(formData, "delivery_method");
  const price = getNumber(formData, "price", 0);
  const salePrice = getOptionalNumber(formData, "sale_price");
  const processingFeePercent = getNumber(
    formData,
    "processing_fee_percent",
    10,
  );
  const displayOrder = getNumber(formData, "display_order", 0);

  const isQuotationOnly =
    productType === "SERVICE" &&
    price === 0 &&
    (salePrice === null || salePrice === 0);

  return {
    name,
    slug,
    productType,
    deliveryMethod,
    price,
    salePrice,
    processingFeePercent,
    displayOrder,
    isQuotationOnly,
  };
}

function getProductPayload(formData: FormData) {
  const fields = validateProductFields(formData);

  return {
    name: fields.name,
    slug: fields.slug,
    short_description: getOptionalString(formData, "short_description"),
    description: getOptionalString(formData, "description"),
    category:
      getString(formData, "category") || "Digital Products",
    product_type: fields.productType,
    price: fields.price,

    // Quotation-only services intentionally have no sale price.
    sale_price: fields.isQuotationOnly ? null : fields.salePrice,

    // No payment processing fee is applicable until a quotation
    // has been approved and a real payable order is created.
    processing_fee_percent: fields.isQuotationOnly
      ? 0
      : fields.processingFeePercent,

    badge:
      getOptionalString(formData, "badge") ||
      (fields.isQuotationOnly ? "For Quotation" : null),

    image_url: getOptionalString(formData, "image_url"),
    demo_url: getOptionalString(formData, "demo_url"),
    delivery_method: fields.deliveryMethod,
    post_purchase_instructions: getOptionalString(
      formData,
      "post_purchase_instructions",
    ),
    is_active: formData.get("is_active") === "on",
    is_featured: formData.get("is_featured") === "on",
    display_order: fields.displayOrder,
  };
}

function validateProduct(formData: FormData, errorBaseUrl: string) {
  const fields = validateProductFields(formData);

  if (!fields.name || !fields.slug) {
    redirect(`${errorBaseUrl}?error=missing-required-fields`);
  }

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(fields.slug)) {
    redirect(`${errorBaseUrl}?error=missing-required-fields`);
  }

  if (!allowedTypes.includes(fields.productType)) {
    redirect(`${errorBaseUrl}?error=invalid-product-type`);
  }

  if (!allowedTypes.includes(fields.deliveryMethod)) {
    redirect(`${errorBaseUrl}?error=invalid-delivery-method`);
  }

  if (
    fields.price < 0 ||
    fields.processingFeePercent < 0 ||
    fields.displayOrder < 0 ||
    (fields.salePrice !== null && fields.salePrice < 0)
  ) {
    redirect(`${errorBaseUrl}?error=invalid-number`);
  }

  if (
    fields.salePrice !== null &&
    fields.salePrice > fields.price &&
    !fields.isQuotationOnly
  ) {
    redirect(`${errorBaseUrl}?error=invalid-number`);
  }
}

function revalidateStoreProductPaths(slug?: string) {
  revalidatePath("/admin");
  revalidatePath("/admin/products");
  revalidatePath("/shop");
  revalidatePath("/");

  if (slug) {
    revalidatePath(`/shop/${slug}`);
  }
}

export async function createProduct(formData: FormData) {
  await requireAdmin();

  validateProduct(formData, "/admin/products/new");

  const payload = getProductPayload(formData);
  const adminSupabase = createAdminSupabaseClient();

  const { error } = await adminSupabase
    .from("products")
    .insert(payload);

  if (error) {
    console.error("Create product error:", error);

    if (error.code === "23505") {
      redirect("/admin/products/new?error=duplicate-slug");
    }

    redirect("/admin/products/new?error=save-failed");
  }

  revalidateStoreProductPaths(payload.slug);

  redirect("/admin/products?created=1");
}

export async function updateProduct(formData: FormData) {
  await requireAdmin();

  const productId = getString(formData, "product_id");

  if (!productId) {
    redirect("/admin/products");
  }

  const editUrl = `/admin/products/${productId}`;

  validateProduct(formData, editUrl);

  const adminSupabase = createAdminSupabaseClient();

  const { data: existingProduct } = await adminSupabase
    .from("products")
    .select("slug")
    .eq("id", productId)
    .maybeSingle();

  const payload = getProductPayload(formData);

  const { error } = await adminSupabase
    .from("products")
    .update(payload)
    .eq("id", productId);

  if (error) {
    console.error("Update product error:", error);

    if (error.code === "23505") {
      redirect(`${editUrl}?error=duplicate-slug`);
    }

    redirect(`${editUrl}?error=save-failed`);
  }

  revalidateStoreProductPaths(existingProduct?.slug || undefined);

  if (
    payload.slug &&
    payload.slug !== existingProduct?.slug
  ) {
    revalidatePath(`/shop/${payload.slug}`);
  }

  revalidatePath(editUrl);

  redirect(`${editUrl}?updated=1`);
}

export async function deleteProduct(formData: FormData) {
  await requireAdmin();

  const productId = getString(formData, "product_id");

  if (!productId) {
    redirect("/admin/products");
  }

  const adminSupabase = createAdminSupabaseClient();

  const [{ data: product }, { data: productFiles }] =
    await Promise.all([
      adminSupabase
        .from("products")
        .select("slug")
        .eq("id", productId)
        .maybeSingle(),

      adminSupabase
        .from("product_files")
        .select("storage_path")
        .eq("product_id", productId),
    ]);

  const storagePaths =
    productFiles
      ?.map((file) => file.storage_path)
      .filter(Boolean) ?? [];

  if (storagePaths.length > 0) {
    const { error: storageDeleteError } =
      await adminSupabase.storage
        .from(PRODUCT_FILES_BUCKET)
        .remove(storagePaths);

    if (storageDeleteError) {
      console.error(
        "Delete product storage cleanup error:",
        storageDeleteError,
      );
    }
  }

  const { error } = await adminSupabase
    .from("products")
    .delete()
    .eq("id", productId);

  if (error) {
    console.error("Delete product error:", error);

    redirect(
      `/admin/products/${productId}?error=delete-failed`,
    );
  }

  revalidateStoreProductPaths(product?.slug || undefined);

  redirect("/admin/products?deleted=1");
}

export async function uploadProductFile(formData: FormData) {
  await requireAdmin();

  const productId = getString(formData, "product_id");
  const displayName =
    getString(formData, "display_name") ||
    (formData.get("file") instanceof File
      ? (formData.get("file") as File).name
      : "");

  const file = formData.get("file");

  if (!productId || !(file instanceof File) || file.size <= 0) {
    redirect(
      productId
        ? `/admin/products/${productId}?file_error=missing-file#product-files`
        : "/admin/products",
    );
  }

  if (!displayName) {
    redirect(
      `/admin/products/${productId}?file_error=missing-name#product-files`,
    );
  }

  const maxBytes = 50 * 1024 * 1024;

  if (file.size > maxBytes) {
    redirect(
      `/admin/products/${productId}?file_error=file-too-large#product-files`,
    );
  }

  const adminSupabase = createAdminSupabaseClient();

  const { data: product } = await adminSupabase
    .from("products")
    .select("id")
    .eq("id", productId)
    .maybeSingle();

  if (!product) {
    redirect("/admin/products");
  }

  const { data: lastFile } = await adminSupabase
    .from("product_files")
    .select("display_order")
    .eq("product_id", productId)
    .order("display_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const storagePath = buildStoragePath(productId, file.name);
  const bytes = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await adminSupabase.storage
    .from(PRODUCT_FILES_BUCKET)
    .upload(storagePath, bytes, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
      cacheControl: "3600",
    });

  if (uploadError) {
    console.error("Product file upload error:", uploadError);

    redirect(
      `/admin/products/${productId}?file_error=upload-failed#product-files`,
    );
  }

  const { error: insertError } = await adminSupabase
    .from("product_files")
    .insert({
      product_id: productId,
      display_name: displayName,
      storage_path: storagePath,
      display_order: Number(lastFile?.display_order ?? -1) + 1,
      is_active: true,
    });

  if (insertError) {
    console.error("Product file record error:", insertError);

    await adminSupabase.storage
      .from(PRODUCT_FILES_BUCKET)
      .remove([storagePath]);

    redirect(
      `/admin/products/${productId}?file_error=save-failed#product-files`,
    );
  }

  revalidatePath(`/admin/products/${productId}`);
  revalidatePath("/admin/products");

  redirect(
    `/admin/products/${productId}?file_uploaded=1#product-files`,
  );
}

export async function updateProductFile(formData: FormData) {
  await requireAdmin();

  const productId = getString(formData, "product_id");
  const fileId = getString(formData, "file_id");
  const displayName = getString(formData, "display_name");
  const displayOrder = getNumber(formData, "display_order", 0);
  const isActive = formData.get("is_active") === "on";

  if (!productId || !fileId) {
    redirect("/admin/products");
  }

  if (!displayName || displayOrder < 0) {
    redirect(
      `/admin/products/${productId}?file_error=invalid-file-settings#product-files`,
    );
  }

  const adminSupabase = createAdminSupabaseClient();

  const { error } = await adminSupabase
    .from("product_files")
    .update({
      display_name: displayName,
      display_order: displayOrder,
      is_active: isActive,
      updated_at: new Date().toISOString(),
    })
    .eq("id", fileId)
    .eq("product_id", productId);

  if (error) {
    console.error("Product file update error:", error);

    redirect(
      `/admin/products/${productId}?file_error=update-failed#product-files`,
    );
  }

  revalidatePath(`/admin/products/${productId}`);

  redirect(
    `/admin/products/${productId}?file_updated=1#product-files`,
  );
}

export async function deleteProductFile(formData: FormData) {
  await requireAdmin();

  const productId = getString(formData, "product_id");
  const fileId = getString(formData, "file_id");

  if (!productId || !fileId) {
    redirect("/admin/products");
  }

  const adminSupabase = createAdminSupabaseClient();

  const { data: productFile, error: loadError } =
    await adminSupabase
      .from("product_files")
      .select("storage_path")
      .eq("id", fileId)
      .eq("product_id", productId)
      .maybeSingle();

  if (loadError || !productFile) {
    console.error(
      "Product file load before delete error:",
      loadError,
    );

    redirect(
      `/admin/products/${productId}?file_error=delete-failed#product-files`,
    );
  }

  const { error: storageError } =
    await adminSupabase.storage
      .from(PRODUCT_FILES_BUCKET)
      .remove([productFile.storage_path]);

  if (storageError) {
    console.error(
      "Product file storage delete error:",
      storageError,
    );

    redirect(
      `/admin/products/${productId}?file_error=delete-failed#product-files`,
    );
  }

  const { error: deleteError } = await adminSupabase
    .from("product_files")
    .delete()
    .eq("id", fileId)
    .eq("product_id", productId);

  if (deleteError) {
    console.error(
      "Product file database delete error:",
      deleteError,
    );

    redirect(
      `/admin/products/${productId}?file_error=delete-failed#product-files`,
    );
  }

  revalidatePath(`/admin/products/${productId}`);

  redirect(
    `/admin/products/${productId}?file_deleted=1#product-files`,
  );
}
