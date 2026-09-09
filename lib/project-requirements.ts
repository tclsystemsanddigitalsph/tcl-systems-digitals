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

const KNOWN_TIERS = [
  "Enterprise",
  "Starter",
  "Basic",
  "Solo",
  "Pro",
  "Business",
] as const;

function normalizeTier(value: string | null | undefined) {
  const normalized = value?.trim().toLowerCase();

  if (!normalized) return null;

  const match = KNOWN_TIERS.find(
    (tier) => tier.toLowerCase() === normalized,
  );

  return match ?? null;
}

function inferTier(
  slug: string,
  productName: string,
  badge: string | null,
) {
  const normalizedSlug = slug.trim().toLowerCase();

  const slugTierMap: Array<[string, string]> = [
    ["-enterprise", "Enterprise"],
    ["-starter", "Starter"],
    ["-basic", "Basic"],
    ["-solo", "Solo"],
    ["-pro", "Pro"],
    ["-business", "Business"],
  ];

  for (const [suffix, tier] of slugTierMap) {
    if (normalizedSlug.endsWith(suffix)) {
      return tier;
    }
  }

  const badgeTier = normalizeTier(badge);

  if (badgeTier) {
    return badgeTier;
  }

  const normalizedName = productName.trim().toLowerCase();

  const namePatterns: Array<[RegExp, string]> = [
    [/\benterprise\b/, "Enterprise"],
    [/\bstarter\b/, "Starter"],
    [/\bbasic\b/, "Basic"],
    [/\bsolo\b/, "Solo"],
    [/\bpro\b/, "Pro"],
    [/\bbusiness\b/, "Business"],
  ];

  for (const [pattern, tier] of namePatterns) {
    if (pattern.test(normalizedName)) {
      return tier;
    }
  }

  return null;
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
      "id,order_number,customer_name,customer_email,product_id,product_name,payment_status,order_status",
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

  if (!orderData) {
    return null;
  }

  if (
    orderData.payment_status !== "COMPLETED" ||
    orderData.order_status === "CANCELLED"
  ) {
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

  const isPaidCustomizedService =
    productData.product_type === "SERVICE" &&
    effectivePrice(productData) > 0;

  if (!isPaidCustomizedService) {
    return null;
  }

  const productTier = inferTier(
    productData.slug,
    productData.name,
    productData.badge,
  );

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
      product_tier: productTier,
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
