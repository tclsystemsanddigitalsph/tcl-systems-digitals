import { createAdminSupabaseClient } from "@/lib/supabase-admin";

type ProjectRequirementsRecord = {
  id: string;
  secure_token: string;
  requirements_status: string;
  project_status: string;
};

type ProjectRequirementsResult = {
  id: string;
  secureToken: string;
  requirementsStatus: string;
  projectStatus: string;
};

type OrderRow = {
  id: string;
  order_number: string;
  customer_name: string | null;
  customer_email: string;
  product_id: string | null;
  product_name: string;
  payment_status: string;
  payment_terms: string | null;
  amount_paid: number | string | null;
  order_status: string | null;
};

type ProductRow = {
  id: string;
  slug: string;
  name: string;
  category: string | null;
  badge: string | null;
  price: number | string | null;
  sale_price: number | string | null;
  product_type: string | null;
  is_active: boolean | null;
};

const CUSTOM_PRODUCT_SLUG = "custom-business-website";

const PRODUCT_PACKAGE_LABELS: Record<string, string> = {
  "starter-website": "Starter Website",
  "simple-business-website": "Simple Business Website",
  "basic-online-shop": "Basic Online Shop",
  "standard-booking-system": "Standard Booking Website/System",
  "custom-business-website": "Custom Business Website/System",
};

function getPackageLabel(product: ProductRow) {
  const slug = product.slug.trim().toLowerCase();

  return PRODUCT_PACKAGE_LABELS[slug] ?? product.name.trim() ?? null;
}

function effectivePrice(product: ProductRow) {
  const salePrice =
    product.sale_price === null || product.sale_price === undefined
      ? null
      : Number(product.sale_price);

  if (salePrice !== null && Number.isFinite(salePrice) && salePrice > 0) {
    return salePrice;
  }

  const regularPrice = Number(product.price ?? 0);

  return Number.isFinite(regularPrice) ? regularPrice : 0;
}

function hasRequiredPayment(order: OrderRow, product: ProductRow) {
  const isCustomQuotation =
    product.slug.trim().toLowerCase() === CUSTOM_PRODUCT_SLUG;

  if (isCustomQuotation) {
    const amountPaid = Number(order.amount_paid ?? 0);

    if (!Number.isFinite(amountPaid) || amountPaid <= 0) {
      return false;
    }

    if (order.payment_terms === "DEPOSIT_50") {
      return (
        order.payment_status === "PARTIALLY_PAID" ||
        order.payment_status === "COMPLETED"
      );
    }

    if (order.payment_terms === "FULL") {
      return order.payment_status === "COMPLETED";
    }

    return false;
  }

  return order.payment_status === "COMPLETED";
}

export async function ensureProjectRequirementsForPaidOrder(
  orderId: string,
): Promise<ProjectRequirementsResult | null> {
  const normalizedOrderId = orderId.trim();

  if (!normalizedOrderId) {
    return null;
  }

  const supabase = createAdminSupabaseClient();

  const { data: orderData, error: orderError } = await supabase
    .from("orders")
    .select(
      "id,order_number,customer_name,customer_email,product_id,product_name,payment_status,payment_terms,amount_paid,order_status",
    )
    .eq("id", normalizedOrderId)
    .maybeSingle<OrderRow>();

  if (orderError) {
    console.error(
      "Unable to load order for project requirements:",
      orderError,
    );
    throw new Error("Unable to verify paid order.");
  }

  if (!orderData || orderData.order_status === "CANCELLED") {
    return null;
  }

  const { data: existingData, error: existingError } = await supabase
    .from("project_requirements")
    .select(
      "id,secure_token,requirements_status,project_status",
    )
    .eq("order_id", orderData.id)
    .maybeSingle<ProjectRequirementsRecord>();

  if (existingError) {
    console.error(
      "Unable to check existing project requirements:",
      existingError,
    );
    throw new Error("Unable to prepare project requirements.");
  }

  if (existingData) {
    return {
      id: existingData.id,
      secureToken: existingData.secure_token,
      requirementsStatus: existingData.requirements_status,
      projectStatus: existingData.project_status,
    };
  }

  if (!orderData.product_id) {
    return null;
  }

  const { data: productData, error: productError } = await supabase
    .from("products")
    .select(
      "id,slug,name,category,badge,price,sale_price,product_type,is_active",
    )
    .eq("id", orderData.product_id)
    .maybeSingle<ProductRow>();

  if (productError) {
    console.error(
      "Unable to load product for project requirements:",
      productError,
    );
    throw new Error("Unable to verify purchased product.");
  }

  if (!productData) {
    return null;
  }

  const isCustomQuotation =
    productData.slug.trim().toLowerCase() === CUSTOM_PRODUCT_SLUG;

  const isPaidCustomizedService =
    productData.product_type === "SERVICE" &&
    (isCustomQuotation || effectivePrice(productData) > 0);

  if (!isPaidCustomizedService) {
    return null;
  }

  if (!hasRequiredPayment(orderData, productData)) {
    return null;
  }

  /*
   * product_tier is retained for database compatibility, but it now stores
   * the current storefront package label instead of the retired
   * Solo / Pro / Business / Enterprise tier structure.
   */
  const productPackage = getPackageLabel(productData);

  const { data: createdData, error: createError } = await supabase
    .from("project_requirements")
    .insert({
      order_id: orderData.id,
      order_number: orderData.order_number,
      customer_name: orderData.customer_name,
      customer_email: orderData.customer_email,
      product_id: productData.id,
      product_slug: productData.slug,
      product_name: productData.name,
      product_category: productData.category,
      product_tier: productPackage,
      requirements_status: "NOT_STARTED",
      project_status: "WAITING_REQUIREMENTS",
    })
    .select(
      "id,secure_token,requirements_status,project_status",
    )
    .single<ProjectRequirementsRecord>();

  if (!createError && createdData) {
    return {
      id: createdData.id,
      secureToken: createdData.secure_token,
      requirementsStatus: createdData.requirements_status,
      projectStatus: createdData.project_status,
    };
  }

  /*
   * The order_id column is unique. If two requests reach this helper at
   * nearly the same time, one insert may lose the race. In that case,
   * simply load the record created by the other request.
   */
  const { data: recoveredData, error: recoveredError } = await supabase
    .from("project_requirements")
    .select(
      "id,secure_token,requirements_status,project_status",
    )
    .eq("order_id", orderData.id)
    .maybeSingle<ProjectRequirementsRecord>();

  if (recoveredError || !recoveredData) {
    console.error(
      "Unable to create project requirements:",
      createError ?? recoveredError,
    );
    throw new Error("Unable to prepare project requirements.");
  }

  return {
    id: recoveredData.id,
    secureToken: recoveredData.secure_token,
    requirementsStatus: recoveredData.requirements_status,
    projectStatus: recoveredData.project_status,
  };
}
