import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type QuotePayload = {
  productSlug?: unknown;
  productName?: unknown;
  category?: unknown;
  fullName?: unknown;
  businessName?: unknown;
  email?: unknown;
  contactNumber?: unknown;
  preferredContact?: unknown;
  businessType?: unknown;
  businessLocation?: unknown;
  businessAge?: unknown;
  staffCount?: unknown;
  locationCount?: unknown;
  currentLink?: unknown;
  offerings?: unknown;
  currentProcess?: unknown;
  mainProblems?: unknown;
  selectedFeatures?: unknown;
  mainGoal?: unknown;
  expectedVolume?: unknown;
  paymentMethods?: unknown;
  deliveryNeeds?: unknown;
  adminAccess?: unknown;
  integrations?: unknown;
  logoReady?: unknown;
  brandingReady?: unknown;
  contentReady?: unknown;
  domainStatus?: unknown;
  budget?: unknown;
  timeline?: unknown;
  notes?: unknown;
};

const CUSTOM_BUSINESS_WEBSITE_SLUG = "custom-business-website";

function cleanString(value: unknown, maxLength = 4000) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim().slice(0, maxLength);
}

function requiredString(
  value: unknown,
  fieldName: string,
  maxLength = 4000,
) {
  const cleaned = cleanString(value, maxLength);

  if (!cleaned) {
    throw new Error(`${fieldName} is required.`);
  }

  return cleaned;
}

function cleanFeatures(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 50)
    .map((item) => item.slice(0, 200));
}

function getAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Supabase server environment variables are missing.");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as QuotePayload;

    const productSlug = requiredString(body.productSlug, "Product", 200);
    const supabase = getAdminClient();

    const { data: catalogProduct, error: productError } = await supabase
      .from("products")
      .select("slug,name,category,price,sale_price,product_type,is_active")
      .eq("slug", productSlug)
      .eq("is_active", true)
      .maybeSingle();

    if (productError) {
      console.error("Quotation product lookup failed:", productError);
      return NextResponse.json(
        { error: "Unable to verify this service right now." },
        { status: 500 },
      );
    }

    const isCustomBusinessWebsite =
      productSlug === CUSTOM_BUSINESS_WEBSITE_SLUG;

    if (!catalogProduct && !isCustomBusinessWebsite) {
      return NextResponse.json(
        { error: "This service could not be found." },
        { status: 404 },
      );
    }

    if (catalogProduct && !isCustomBusinessWebsite) {
      const effectivePrice = Number(
        catalogProduct.sale_price ?? catalogProduct.price ?? 0,
      );

      const isQuotationOnly =
        catalogProduct.product_type === "SERVICE" &&
        Number.isFinite(effectivePrice) &&
        effectivePrice === 0;

      if (!isQuotationOnly) {
        return NextResponse.json(
          { error: "This product does not use quotation requests." },
          { status: 400 },
        );
      }
    }

    const product = {
      slug: catalogProduct?.slug ?? CUSTOM_BUSINESS_WEBSITE_SLUG,
      name:
        catalogProduct?.name?.trim() ||
        cleanString(body.productName, 200) ||
        "Custom Business Website",
      category:
        catalogProduct?.category?.trim() ||
        cleanString(body.category, 200) ||
        "Websites",
    };

    const fullName = requiredString(body.fullName, "Full name", 200);
    const businessName = requiredString(
      body.businessName,
      "Business name",
      200,
    );
    const email = requiredString(body.email, "Email", 320);
    const contactNumber = requiredString(
      body.contactNumber,
      "Contact number",
      200,
    );
    const businessType = requiredString(
      body.businessType,
      "Business type",
      300,
    );
    const offerings = requiredString(
      body.offerings,
      "Products or services",
    );
    const mainProblems = requiredString(
      body.mainProblems,
      "Business problems",
    );
    const mainGoal = requiredString(body.mainGoal, "Project goal");
    const budget = requiredString(body.budget, "Budget", 200);
    const timeline = requiredString(body.timeline, "Timeline", 200);

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 },
      );
    }

    const { data: savedRequest, error: insertError } = await supabase
      .from("quotation_requests")
      .insert({
        product_slug: product.slug,
        product_name: product.name,
        category: product.category,
        full_name: fullName,
        business_name: businessName,
        email,
        contact_number: contactNumber,
        preferred_contact: cleanString(body.preferredContact, 100),
        business_type: businessType,
        business_location: cleanString(body.businessLocation, 300),
        business_age: cleanString(body.businessAge, 100),
        staff_count: cleanString(body.staffCount, 100),
        location_count: cleanString(body.locationCount, 100),
        current_link: cleanString(body.currentLink, 1000),
        offerings,
        current_process: cleanString(body.currentProcess),
        main_problems: mainProblems,
        selected_features: cleanFeatures(body.selectedFeatures),
        main_goal: mainGoal,
        expected_volume: cleanString(body.expectedVolume, 300),
        payment_methods: cleanString(body.paymentMethods, 500),
        delivery_needs: cleanString(body.deliveryNeeds, 1000),
        admin_access: cleanString(body.adminAccess, 1000),
        integrations: cleanString(body.integrations),
        logo_ready: cleanString(body.logoReady, 100),
        branding_ready: cleanString(body.brandingReady, 100),
        content_ready: cleanString(body.contentReady, 100),
        domain_status: cleanString(body.domainStatus, 200),
        budget,
        timeline,
        notes: cleanString(body.notes),
        status: "NEW",
      })
      .select("id")
      .single();

    if (insertError) {
      console.error("Quotation request insert failed:", insertError);
      return NextResponse.json(
        { error: "Unable to save your quotation request." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      requestId: savedRequest.id,
    });
  } catch (error) {
    console.error("Quotation request error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to submit your quotation request.",
      },
      { status: 400 },
    );
  }
}
