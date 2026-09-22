"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminSupabaseClient } from "@/lib/supabase-admin";
import { createServerSupabaseClient } from "@/lib/supabase-server";

const ALLOWED_PLATFORMS = new Set(["ETSY", "RAKETPH", "OTHER"]);

function cleanText(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function parseMoney(value: FormDataEntryValue | null) {
  const parsed = Number(cleanText(value));
  return Number.isFinite(parsed) ? parsed : NaN;
}

function makeOrderNumber(platform: string) {
  const prefix =
    platform === "ETSY" ? "ETSY" : platform === "RAKETPH" ? "RAKET" : "EXT";

  const stamp = new Date()
    .toISOString()
    .replace(/\D/g, "")
    .slice(2, 14);

  const random = Math.random().toString(36).slice(2, 6).toUpperCase();

  return `${prefix}-${stamp}-${random}`;
}

export async function addExternalSubmissionToOrders(formData: FormData) {
  const authSupabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await authSupabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const submissionId = cleanText(formData.get("submission_id"));
  const grossAmount = parseMoney(formData.get("gross_amount"));

  if (!submissionId) {
    throw new Error("Missing external submission.");
  }

  if (!Number.isFinite(grossAmount) || grossAmount <= 0) {
    throw new Error("Enter a valid gross sale amount.");
  }

  const supabase = createAdminSupabaseClient();

  const { data: submission, error: submissionError } = await supabase
    .from("external_requirement_submissions")
    .select(
      "id,platform,platform_name,marketplace_order_id,buyer_name,buyer_email,product_slug,product_name,linked_order_id",
    )
    .eq("id", submissionId)
    .maybeSingle();

  if (submissionError) {
    console.error("Unable to load external submission:", submissionError);
    throw new Error("Unable to load the marketplace submission.");
  }

  if (!submission) {
    throw new Error("Marketplace submission not found.");
  }

  if (submission.linked_order_id) {
    redirect(`/admin/orders/${submission.linked_order_id}`);
  }

  const platform = String(submission.platform || "").toUpperCase();

  if (!ALLOWED_PLATFORMS.has(platform)) {
    throw new Error("Unsupported marketplace.");
  }

  let productId: string | null = null;

  if (submission.product_slug && submission.product_slug !== "other") {
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("id")
      .eq("slug", submission.product_slug)
      .maybeSingle();

    if (productError) {
      console.error("Unable to match marketplace product:", productError);
      throw new Error("Unable to match the selected product.");
    }

    productId = product?.id ?? null;
  }

  const marketplaceName =
    platform === "ETSY"
      ? "Etsy"
      : platform === "RAKETPH"
        ? "RaketPH"
        : submission.platform_name?.trim() || "Other Marketplace";

  const orderNumber = makeOrderNumber(platform);
  const now = new Date().toISOString();

  const { data: createdOrder, error: orderError } = await supabase
    .from("orders")
    .insert({
      order_number: orderNumber,
      customer_name: submission.buyer_name,
      customer_email: submission.buyer_email,
      product_id: productId,
      product_name: submission.product_name,
      base_price: grossAmount,
      processing_fee_percent: 0,
      processing_fee: 0,
      total_amount: grossAmount,
      currency: "PHP",
      payment_provider: platform === "OTHER" ? "MANUAL" : platform,
      payment_status: "COMPLETED",
      delivery_status: "NOT_STARTED",
      notes: `Marketplace sale recorded from ${marketplaceName}. External submission: ${submission.id}`,
      paid_at: now,
      order_source: platform,
      custom_description:
        platform === "OTHER"
          ? `Marketplace: ${marketplaceName}`
          : null,
      external_reference: submission.marketplace_order_id,
      order_status: "ACTIVE",
      refund_status: "NONE",
      refunded_amount: 0,
      payment_terms: "FULL",
      amount_paid: grossAmount,
      balance_due: 0,
    })
    .select("id")
    .single();

  if (orderError || !createdOrder) {
    console.error("Unable to create marketplace TCL order:", orderError);
    throw new Error("Unable to add this marketplace purchase to TCL Orders.");
  }

  const { error: linkError } = await supabase
    .from("external_requirement_submissions")
    .update({
      linked_order_id: createdOrder.id,
      verified_at: now,
    })
    .eq("id", submission.id)
    .is("linked_order_id", null);

  if (linkError) {
    console.error("Unable to link marketplace order:", linkError);

    const { error: cleanupError } = await supabase
      .from("orders")
      .delete()
      .eq("id", createdOrder.id);

    if (cleanupError) {
      console.error(
        "Unable to clean up unlinked marketplace order:",
        cleanupError,
      );
    }

    throw new Error(
      "The TCL order could not be linked to the marketplace submission.",
    );
  }

  revalidatePath("/admin");
  revalidatePath("/admin/orders");
  revalidatePath("/admin/external-submissions");
  revalidatePath(`/admin/external-submissions/${submission.id}`);

  redirect(`/admin/external-submissions/${submission.id}`);
}


export async function deleteExternalSubmission(formData: FormData) {
  const authSupabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await authSupabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const submissionId = cleanText(formData.get("submission_id"));

  if (!submissionId) {
    throw new Error("Missing external submission.");
  }

  const supabase = createAdminSupabaseClient();

  /*
   * Delete only the external requirements submission.
   * A linked TCL order is intentionally left untouched so recorded sales,
   * revenue, refunds, and order history remain intact.
   */
  const { error } = await supabase
    .from("external_requirement_submissions")
    .delete()
    .eq("id", submissionId);

  if (error) {
    console.error("Unable to delete external submission:", error);
    throw new Error("Unable to delete this external submission.");
  }

  revalidatePath("/admin");
  revalidatePath("/admin/external-submissions");

  redirect("/admin/external-submissions");
}


const EXTERNAL_REQUIREMENT_STATUSES = new Set([
  "SUBMITTED",
  "NEED_MORE_INFO",
  "RESUBMITTED",
  "APPROVED",
]);

const EXTERNAL_PROJECT_STATUSES = new Set([
  "REVIEWING",
  "NEED_MORE_INFO",
  "READY_TO_BUILD",
  "IN_PROGRESS",
  "QA_REVIEW",
  "READY_FOR_HANDOVER",
  "COMPLETED",
  "CANCELLED",
]);

export async function updateExternalSubmissionProgress(formData: FormData) {
  const authSupabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await authSupabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const submissionId = cleanText(formData.get("submission_id"));
  const requirementsStatus = cleanText(formData.get("requirements_status"));
  const projectStatus = cleanText(formData.get("project_status"));
  const adminNotes = cleanText(formData.get("admin_notes"));
  const customerUpdateNote = cleanText(formData.get("customer_update_note"));

  if (!submissionId) {
    throw new Error("Missing external submission.");
  }

  if (!EXTERNAL_REQUIREMENT_STATUSES.has(requirementsStatus)) {
    throw new Error("Invalid requirements status.");
  }

  if (!EXTERNAL_PROJECT_STATUSES.has(projectStatus)) {
    throw new Error("Invalid project progress.");
  }

  const now = new Date().toISOString();

  const updates: Record<string, string | null> = {
    requirements_status: requirementsStatus,
    project_status: projectStatus,
    admin_notes: adminNotes || null,
    customer_update_note: customerUpdateNote || null,
    updated_at: now,
  };

  if (requirementsStatus === "NEED_MORE_INFO") {
    updates.more_info_requested_at = now;
  }

  if (requirementsStatus === "APPROVED") {
    updates.approved_at = now;
  }

  if (projectStatus === "COMPLETED") {
    updates.completed_at = now;
  }

  const supabase = createAdminSupabaseClient();

  const { error } = await supabase
    .from("external_requirement_submissions")
    .update(updates)
    .eq("id", submissionId);

  if (error) {
    console.error("Unable to update external submission progress:", error);
    throw new Error("Unable to update this external submission.");
  }

  revalidatePath("/admin");
  revalidatePath("/admin/external-submissions");
  revalidatePath(`/admin/external-submissions/${submissionId}`);

  redirect(`/admin/external-submissions/${submissionId}`);
}
