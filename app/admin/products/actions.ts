"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createAdminSupabaseClient } from "@/lib/supabase-admin";
import { createServerSupabaseClient } from "@/lib/supabase-server";

const allowedTypes = [
  "DOWNLOAD",
  "GITHUB",
  "SERVICE",
  "MANUAL",
];

function getString(formData: FormData, key: string) {
  const value = formData.get(key);

  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

function getOptionalString(formData: FormData, key: string) {
  const value = getString(formData, key);
  return value.length > 0 ? value : null;
}

function getNumber(
  formData: FormData,
  key: string,
  fallback = 0
) {
  const value = getString(formData, key);

  if (!value) {
    return fallback;
  }

  const number = Number(value);

  return Number.isFinite(number) ? number : fallback;
}

function getOptionalNumber(
  formData: FormData,
  key: string
) {
  const value = getString(formData, key);

  if (!value) {
    return null;
  }

  const number = Number(value);

  return Number.isFinite(number) ? number : null;
}

async function requireAdmin() {
  const authSupabase =
    await createServerSupabaseClient();

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
  const slug = getString(formData, "slug");

  const productType = getString(
    formData,
    "product_type"
  );

  const deliveryMethod = getString(
    formData,
    "delivery_method"
  );

  const price = getNumber(
    formData,
    "price",
    0
  );

  const salePrice = getOptionalNumber(
    formData,
    "sale_price"
  );

  const processingFeePercent = getNumber(
    formData,
    "processing_fee_percent",
    10
  );

  const displayOrder = getNumber(
    formData,
    "display_order",
    0
  );

  return {
    name,
    slug,
    productType,
    deliveryMethod,
    price,
    salePrice,
    processingFeePercent,
    displayOrder,
  };
}

function getProductPayload(formData: FormData) {
  const fields = validateProductFields(formData);

  return {
    name: fields.name,
    slug: fields.slug,

    short_description: getOptionalString(
      formData,
      "short_description"
    ),

    description: getOptionalString(
      formData,
      "description"
    ),

    category:
      getString(formData, "category") ||
      "Digital Products",

    product_type: fields.productType,

    price: fields.price,

    sale_price: fields.salePrice,

    processing_fee_percent:
      fields.processingFeePercent,

    badge: getOptionalString(
      formData,
      "badge"
    ),

    image_url: getOptionalString(
      formData,
      "image_url"
    ),

    demo_url: getOptionalString(
      formData,
      "demo_url"
    ),

    delivery_method:
      fields.deliveryMethod,

    is_active:
      formData.get("is_active") === "on",

    is_featured:
      formData.get("is_featured") === "on",

    display_order:
      fields.displayOrder,
  };
}

function validateProduct(
  formData: FormData,
  errorBaseUrl: string
) {
  const fields = validateProductFields(formData);

  if (!fields.name || !fields.slug) {
    redirect(
      `${errorBaseUrl}?error=missing-required-fields`
    );
  }

  if (!allowedTypes.includes(fields.productType)) {
    redirect(
      `${errorBaseUrl}?error=invalid-product-type`
    );
  }

  if (
    !allowedTypes.includes(
      fields.deliveryMethod
    )
  ) {
    redirect(
      `${errorBaseUrl}?error=invalid-delivery-method`
    );
  }

  if (
    fields.price < 0 ||
    fields.processingFeePercent < 0 ||
    fields.displayOrder < 0 ||
    (fields.salePrice !== null &&
      fields.salePrice < 0)
  ) {
    redirect(
      `${errorBaseUrl}?error=invalid-number`
    );
  }
}

export async function createProduct(
  formData: FormData
) {
  await requireAdmin();

  validateProduct(
    formData,
    "/admin/products/new"
  );

  const adminSupabase =
    createAdminSupabaseClient();

  const { error } = await adminSupabase
    .from("products")
    .insert(getProductPayload(formData));

  if (error) {
    console.error(
      "Create product error:",
      error
    );

    if (error.code === "23505") {
      redirect(
        "/admin/products/new?error=duplicate-slug"
      );
    }

    redirect(
      "/admin/products/new?error=save-failed"
    );
  }

  revalidatePath("/admin");
  revalidatePath("/admin/products");
  revalidatePath("/shop");

  redirect(
    "/admin/products?created=1"
  );
}

export async function updateProduct(
  formData: FormData
) {
  await requireAdmin();

  const productId = getString(
    formData,
    "product_id"
  );

  if (!productId) {
    redirect("/admin/products");
  }

  const editUrl =
    `/admin/products/${productId}`;

  validateProduct(
    formData,
    editUrl
  );

  const adminSupabase =
    createAdminSupabaseClient();

  const { error } = await adminSupabase
    .from("products")
    .update(getProductPayload(formData))
    .eq("id", productId);

  if (error) {
    console.error(
      "Update product error:",
      error
    );

    if (error.code === "23505") {
      redirect(
        `${editUrl}?error=duplicate-slug`
      );
    }

    redirect(
      `${editUrl}?error=save-failed`
    );
  }

  revalidatePath("/admin");
  revalidatePath("/admin/products");
  revalidatePath(editUrl);
  revalidatePath("/shop");

  redirect(
    `${editUrl}?updated=1`
  );
}

export async function deleteProduct(
  formData: FormData
) {
  await requireAdmin();

  const productId = getString(
    formData,
    "product_id"
  );

  if (!productId) {
    redirect("/admin/products");
  }

  const adminSupabase =
    createAdminSupabaseClient();

  const { error } = await adminSupabase
    .from("products")
    .delete()
    .eq("id", productId);

  if (error) {
    console.error(
      "Delete product error:",
      error
    );

    redirect(
      `/admin/products/${productId}?error=delete-failed`
    );
  }

  revalidatePath("/admin");
  revalidatePath("/admin/products");
  revalidatePath("/shop");

  redirect(
    "/admin/products?deleted=1"
  );
}