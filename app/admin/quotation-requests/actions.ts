"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminSupabaseClient } from "@/lib/supabase-admin";
import { createServerSupabaseClient } from "@/lib/supabase-server";

const allowedStatuses = [
  "NEW",
  "REVIEWING",
  "QUOTED",
  "ACCEPTED",
  "DECLINED",
  "CLOSED",
] as const;

async function requireAdmin() {
  const authSupabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await authSupabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }
}

export async function updateQuotationRequest(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "").trim();
  const status = String(formData.get("status") ?? "").trim();
  const adminNotes = String(formData.get("admin_notes") ?? "").trim();
  const quotedAmountRaw = String(formData.get("quoted_amount") ?? "").trim();
  const paymentTermsRaw = String(formData.get("payment_terms") ?? "").trim();

  if (!id) {
    throw new Error("Quotation request ID is missing.");
  }

  if (!allowedStatuses.includes(status as (typeof allowedStatuses)[number])) {
    throw new Error("Invalid quotation status.");
  }

  let quotedAmount: number | null = null;

  if (quotedAmountRaw) {
    const parsed = Number(quotedAmountRaw);

    if (!Number.isFinite(parsed) || parsed < 0) {
      throw new Error("Quoted amount must be a valid positive number.");
    }

    quotedAmount = parsed;
  }

  let paymentTerms: "FULL" | "DEPOSIT_50" | null = null;

  if (paymentTermsRaw) {
    if (paymentTermsRaw !== "FULL" && paymentTermsRaw !== "DEPOSIT_50") {
      throw new Error("Invalid payment terms.");
    }
    paymentTerms = paymentTermsRaw;
  }

  if (status === "QUOTED") {
    if (!quotedAmount || quotedAmount <= 0) {
      throw new Error("Set a quoted amount greater than ₱0 before marking this as Quoted.");
    }

    if (!paymentTerms) {
      throw new Error("Choose payment terms before marking this as Quoted.");
    }
  }

  const supabase = createAdminSupabaseClient();

  const payload: {
    status: string;
    admin_notes: string | null;
    quoted_amount: number | null;
    payment_terms: "FULL" | "DEPOSIT_50" | null;
    quoted_at?: string | null;
  } = {
    status,
    admin_notes: adminNotes || null,
    quoted_amount: quotedAmount,
    payment_terms: paymentTerms,
  };

  if (status === "QUOTED" && quotedAmount !== null) {
    payload.quoted_at = new Date().toISOString();
  }

  if (status !== "QUOTED" && quotedAmount === null) {
    payload.quoted_at = null;
  }

  const { error } = await supabase
    .from("quotation_requests")
    .update(payload)
    .eq("id", id);

  if (error) {
    throw new Error(`Unable to update quotation request: ${error.message}`);
  }

  revalidatePath("/admin/quotation-requests");
  revalidatePath(`/admin/quotation-requests/${id}`);
}
