import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

const ALLOWED_PLATFORMS = new Set(["etsy", "raketph", "other"]);
const ALLOWED_PRODUCTS = new Set([
  "starter-website",
  "simple-business-website",
  "basic-online-shop",
  "online-shop-with-admin",
  "basic-booking-system",
  "standard-booking-system",
  "other",
]);

type SubmissionBody = {
  platform?: unknown;
  platformName?: unknown;
  marketplaceOrderId?: unknown;
  buyerName?: unknown;
  buyerEmail?: unknown;
  productSlug?: unknown;
  productName?: unknown;
  requirements?: unknown;
};

function cleanText(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SubmissionBody;

    const platform = cleanText(body.platform, 30);
    const platformName = cleanText(body.platformName, 120);
    const marketplaceOrderId = cleanText(body.marketplaceOrderId, 200);
    const buyerName = cleanText(body.buyerName, 200);
    const buyerEmail = cleanText(body.buyerEmail, 320).toLowerCase();
    const productSlug = cleanText(body.productSlug, 120);
    const productName = cleanText(body.productName, 200);

    if (!ALLOWED_PLATFORMS.has(platform)) {
      return NextResponse.json(
        { ok: false, error: "Please select a valid marketplace." },
        { status: 400 },
      );
    }

    if (platform === "other" && !platformName) {
      return NextResponse.json(
        { ok: false, error: "Please enter the marketplace name." },
        { status: 400 },
      );
    }

    if (!marketplaceOrderId || !buyerName || !buyerEmail) {
      return NextResponse.json(
        { ok: false, error: "Purchase details are incomplete." },
        { status: 400 },
      );
    }

    if (!buyerEmail.includes("@")) {
      return NextResponse.json(
        { ok: false, error: "Please enter a valid purchase email." },
        { status: 400 },
      );
    }

    if (!ALLOWED_PRODUCTS.has(productSlug) || !productName) {
      return NextResponse.json(
        { ok: false, error: "Please select a valid TCL product." },
        { status: 400 },
      );
    }

    if (
      !body.requirements ||
      typeof body.requirements !== "object" ||
      Array.isArray(body.requirements)
    ) {
      return NextResponse.json(
        { ok: false, error: "Project requirements are missing." },
        { status: 400 },
      );
    }

    const requirements = body.requirements as Record<string, unknown>;

    if (requirements.project_assets_confirmed !== "yes") {
      return NextResponse.json(
        { ok: false, error: "Please confirm your project file access." },
        { status: 400 },
      );
    }

    if (requirements.scope_confirmation !== "yes") {
      return NextResponse.json(
        { ok: false, error: "Please confirm the project acknowledgement." },
        { status: 400 },
      );
    }

    const dbPlatform =
      platform === "etsy" ? "ETSY" : platform === "raketph" ? "RAKETPH" : "OTHER";

    const supabase = createAdminSupabaseClient();

    const { error } = await supabase
      .from("external_requirement_submissions")
      .insert({
        platform: dbPlatform,
        platform_name: platform === "other" ? platformName : null,
        marketplace_order_id: marketplaceOrderId,
        buyer_name: buyerName,
        buyer_email: buyerEmail,
        product_slug: productSlug,
        product_name: productName,
        requirements,
        requirements_status: "SUBMITTED",
        project_status: "REVIEWING",
      });

    if (error) {
      console.error("External requirements submission failed:", error);
      return NextResponse.json(
        {
          ok: false,
          error: "We couldn't save your requirements. Please try again.",
        },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("External requirements request failed:", error);

    return NextResponse.json(
      {
        ok: false,
        error: "We couldn't submit your requirements. Please try again.",
      },
      { status: 500 },
    );
  }
}
