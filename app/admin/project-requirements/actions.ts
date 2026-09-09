"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { createAdminSupabaseClient } from "@/lib/supabase-admin";

const PROJECT_STATUSES = new Set([
  "WAITING_REQUIREMENTS",
  "REVIEWING",
  "NEED_MORE_INFO",
  "READY_TO_BUILD",
  "IN_PROGRESS",
  "QA_REVIEW",
  "READY_FOR_HANDOVER",
  "COMPLETED",
  "CANCELLED",
]);

const REQUIREMENT_STATUSES = new Set([
  "NOT_STARTED",
  "IN_PROGRESS",
  "SUBMITTED",
  "NEED_MORE_INFO",
  "RESUBMITTED",
  "APPROVED",
]);

const DELIVERY_STATUSES = new Set([
  "NOT_STARTED",
  "IN_PROGRESS",
  "DELIVERED",
  "CANCELLED",
]);

const CUSTOM_PAYMENT_TERMS = new Set(["FULL", "DEPOSIT_50"]);

async function requireAdmin() {
  const auth = await createServerSupabaseClient();

  const {
    data: { user },
  } = await auth.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  return user;
}

export async function updateProjectRequirements(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") || "").trim();
  let projectStatus = String(formData.get("project_status") || "").trim();
  const requirementsStatus = String(
    formData.get("requirements_status") || "",
  ).trim();
  const deliveryStatus = String(
    formData.get("delivery_status") || "",
  ).trim();
  const adminNotes = String(formData.get("admin_notes") || "").trim();
  const customerUpdateNote = String(
    formData.get("customer_update_note") || "",
  ).trim();

  if (!id) {
    throw new Error("Missing project requirements ID.");
  }

  if (!PROJECT_STATUSES.has(projectStatus)) {
    throw new Error("Invalid project status.");
  }

  if (!REQUIREMENT_STATUSES.has(requirementsStatus)) {
    throw new Error("Invalid requirements status.");
  }

  if (!DELIVERY_STATUSES.has(deliveryStatus)) {
    throw new Error("Invalid delivery status.");
  }

  if (requirementsStatus === "NEED_MORE_INFO" && !customerUpdateNote) {
    throw new Error(
      "Please tell the customer what information they need to update.",
    );
  }

  const supabase = createAdminSupabaseClient();
  const now = new Date().toISOString();

  const { data: currentRequest, error: currentRequestError } = await supabase
    .from("project_requirements")
    .select("id,order_id")
    .eq("id", id)
    .maybeSingle();

  if (currentRequestError || !currentRequest) {
    console.error(
      "Unable to load project requirements before update:",
      currentRequestError,
    );
    throw new Error("Project requirements record was not found.");
  }

  const { data: linkedOrder, error: linkedOrderError } = await supabase
    .from("orders")
    .select("id,payment_terms,balance_due,order_status")
    .eq("id", currentRequest.order_id)
    .maybeSingle();

  if (linkedOrderError || !linkedOrder) {
    console.error(
      "Unable to load linked order before project update:",
      linkedOrderError,
    );
    throw new Error("The linked order could not be loaded.");
  }

  const paymentTerms =
    typeof linkedOrder.payment_terms === "string"
      ? linkedOrder.payment_terms
      : null;

  const balanceDue = Number(linkedOrder.balance_due || 0);
  const isCustomPaymentOrder =
    paymentTerms !== null && CUSTOM_PAYMENT_TERMS.has(paymentTerms);
  const hasOutstandingBalance = balanceDue > 0.005;

  if (
    isCustomPaymentOrder &&
    hasOutstandingBalance &&
    (projectStatus === "COMPLETED" || deliveryStatus === "DELIVERED")
  ) {
    throw new Error(
      `Final payment is required before this project can be completed or delivered. Remaining balance: ₱${balanceDue.toLocaleString(
        "en-PH",
        {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        },
      )}.`,
    );
  }

  if (requirementsStatus === "NEED_MORE_INFO") {
    projectStatus = "NEED_MORE_INFO";
  }

  const payload: Record<string, unknown> = {
    project_status: projectStatus,
    requirements_status: requirementsStatus,
    admin_notes: adminNotes || null,
    customer_update_note:
      requirementsStatus === "NEED_MORE_INFO" ? customerUpdateNote : null,
    updated_at: now,
  };

  if (requirementsStatus === "NEED_MORE_INFO") {
    payload.more_info_requested_at = now;
  }

  if (requirementsStatus === "APPROVED") {
    payload.approved_at = now;
  }

  if (projectStatus === "COMPLETED") {
    payload.completed_at = now;
  }

  const { data: updated, error } = await supabase
    .from("project_requirements")
    .update(payload)
    .eq("id", id)
    .select(
      "id,requirements_status,project_status,admin_notes,customer_update_note,updated_at",
    )
    .maybeSingle();

  if (error) {
    console.error("Unable to update project requirements:", error);
    throw new Error("Unable to save project requirements.");
  }

  if (!updated) {
    throw new Error(
      "Project requirements record was not found or could not be updated.",
    );
  }

  const { data: updatedOrder, error: orderError } = await supabase
    .from("orders")
    .update({
      delivery_status: deliveryStatus,
      delivered_at: deliveryStatus === "DELIVERED" ? now : null,
      updated_at: now,
    })
    .eq("id", currentRequest.order_id)
    .select("id,delivery_status")
    .maybeSingle();

  if (orderError || !updatedOrder) {
    console.error("Unable to update linked order delivery status:", orderError);
    throw new Error(
      "Project changes were saved, but the delivery status could not be updated.",
    );
  }

  revalidatePath("/admin");
  revalidatePath("/admin/project-requirements");
  revalidatePath(`/admin/project-requirements/${id}`);
  revalidatePath(`/admin/orders/${currentRequest.order_id}`);
  revalidatePath("/admin/orders");
  revalidatePath("/admin/deliveries");
  revalidatePath("/order-status");

  redirect(`/admin/project-requirements/${id}?saved=1`);
}
