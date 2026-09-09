import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

type Body = {
  token?: string;
  productSlug?: string;
  requirements?: Record<string, unknown>;
  customerNotes?: string;
};

function jsonError(message: string, status = 500) {
  return NextResponse.json(
    { ok: false, error: message },
    { status },
  );
}

export async function POST(request: Request) {
  try {
    let body: Body;

    try {
      body = (await request.json()) as Body;
    } catch {
      return jsonError("Invalid project requirements request.", 400);
    }

    const token = body.token?.trim() ?? "";
    const productSlug = body.productSlug?.trim() ?? "";

    if (!token || !productSlug) {
      return jsonError(
        "This project requirements link is invalid.",
        400,
      );
    }

    if (
      !body.requirements ||
      typeof body.requirements !== "object" ||
      Array.isArray(body.requirements)
    ) {
      return jsonError("Project requirements are missing.", 400);
    }

    const supabase = createAdminSupabaseClient();

    const { data: record, error: recordError } = await supabase
      .from("project_requirements")
      .select(
        "id,order_id,product_slug,requirements_status",
      )
      .eq("secure_token", token)
      .maybeSingle();

    if (recordError) {
      console.error(
        "Unable to load project requirements record:",
        recordError,
      );

      return jsonError(
        "Unable to verify this project requirements link.",
        500,
      );
    }

    if (!record || record.product_slug !== productSlug) {
      return jsonError(
        "This project requirements link is invalid.",
        404,
      );
    }

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("payment_status,order_status")
      .eq("id", record.order_id)
      .maybeSingle();

    if (orderError) {
      console.error(
        "Unable to verify project requirements order:",
        orderError,
      );

      return jsonError(
        "Unable to verify your paid order.",
        500,
      );
    }

    if (
      !order ||
      order.payment_status !== "COMPLETED" ||
      order.order_status === "CANCELLED"
    ) {
      return jsonError(
        "This paid order is not eligible for project requirements.",
        403,
      );
    }

    const nextStatus =
      record.requirements_status === "SUBMITTED" ||
      record.requirements_status === "NEED_MORE_INFO" ||
      record.requirements_status === "RESUBMITTED"
        ? "RESUBMITTED"
        : "SUBMITTED";

    const now = new Date().toISOString();

    const { error: updateError } = await supabase
      .from("project_requirements")
      .update({
        requirements: body.requirements,
        customer_notes: body.customerNotes?.trim() || null,
        requirements_status: nextStatus,
        project_status: "REVIEWING",
        customer_update_note: null,
        submitted_at: now,
        updated_at: now,
      })
      .eq("id", record.id);

    if (updateError) {
      console.error(
        "Unable to save project requirements:",
        updateError,
      );

      return jsonError(
        "Unable to save your project requirements.",
        500,
      );
    }

    return NextResponse.json({
      ok: true,
      status: nextStatus,
    });
  } catch (error) {
    console.error(
      "Unexpected project requirements API error:",
      error,
    );

    return jsonError(
      "Something went wrong while saving your project requirements. Please try again.",
      500,
    );
  }
}
