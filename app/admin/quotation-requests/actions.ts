"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@supabase/supabase-js";

const allowedStatuses = [
  "NEW",
  "REVIEWING",
  "QUOTED",
  "ACCEPTED",
  "DECLINED",
  "CLOSED",
] as const;

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

export async function updateQuotationRequest(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim();
  const status = String(formData.get("status") ?? "").trim();
  const adminNotes = String(formData.get("admin_notes") ?? "").trim();
  const quotedAmountRaw = String(formData.get("quoted_amount") ?? "").trim();

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

  const supabase = getAdminClient();

  const payload: {
    status: string;
    admin_notes: string | null;
    quoted_amount: number | null;
    quoted_at?: string | null;
  } = {
    status,
    admin_notes: adminNotes || null,
    quoted_amount: quotedAmount,
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
