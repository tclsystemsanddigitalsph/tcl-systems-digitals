"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminSupabaseClient } from "@/lib/supabase-admin";
import { createServerSupabaseClient } from "@/lib/supabase-server";

const allowedStatuses = [
  "NEW",
  "REVIEWING",
  "QUOTED",
  "DECLINED",
  "CLOSED",
] as const;

type AllowedStatus = (typeof allowedStatuses)[number];
type PaymentTerms = "FULL" | "DEPOSIT_50" | null;

async function requireAdmin() {
  const authSupabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await authSupabase.auth.getUser();

  if (!user) redirect("/admin/login");
  return user;
}

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function nullable(value: string) {
  return value || null;
}

export async function createManualQuotation(formData: FormData) {
  const adminUser = await requireAdmin();

  const fullName = text(formData, "full_name");
  const email = text(formData, "email").toLowerCase();
  const contactNumber = text(formData, "contact_number");
  const businessName = text(formData, "business_name");
  const businessType = text(formData, "business_type");
  const productName = text(formData, "product_name");
  const offerings = text(formData, "offerings");
  const mainGoal = text(formData, "main_goal");
  const adminNotes = text(formData, "admin_notes");
  const status = text(formData, "status") || "NEW";
  const paymentTermsRaw = text(formData, "payment_terms");

  if (!fullName) {
    throw new Error("Client name is required.");
  }

  if (email && !email.includes("@")) {
    throw new Error("Enter a valid email address or leave it blank.");
  }

  if (!allowedStatuses.includes(status as AllowedStatus)) {
    throw new Error("Invalid quotation status.");
  }

  let paymentTerms: PaymentTerms = null;

  if (
    paymentTermsRaw === "FULL" ||
    paymentTermsRaw === "DEPOSIT_50"
  ) {
    paymentTerms = paymentTermsRaw;
  }

  const itemNames = formData.getAll("item_name");
  const itemDescriptions = formData.getAll("item_description");
  const itemAmounts = formData.getAll("item_amount");

  const items: Array<{
    item_name: string;
    item_description: string | null;
    amount: number;
    display_order: number;
  }> = [];

  const rowCount = Math.max(
    itemNames.length,
    itemDescriptions.length,
    itemAmounts.length,
  );

  for (let i = 0; i < rowCount; i += 1) {
    const itemName = String(itemNames[i] ?? "").trim();
    const description = String(itemDescriptions[i] ?? "").trim();
    const amountRaw = String(itemAmounts[i] ?? "").trim();

    if (!itemName && !description && !amountRaw) continue;

    const amount = amountRaw ? Number(amountRaw) : 0;

    if (!Number.isFinite(amount) || amount < 0) {
      throw new Error(
        `Quotation item ${i + 1} has an invalid amount.`,
      );
    }

    items.push({
      item_name:
        itemName || `Quotation Item ${items.length + 1}`,
      item_description: description || null,
      amount,
      display_order: items.length,
    });
  }

  const quotedAmount =
    items.length > 0
      ? Number(
          items
            .reduce((sum, item) => sum + item.amount, 0)
            .toFixed(2),
        )
      : null;

  if (status === "QUOTED") {
    if (!quotedAmount || quotedAmount <= 0) {
      throw new Error(
        "Add quotation items with a total greater than ₱0 before marking this as Quoted.",
      );
    }

    if (!paymentTerms) {
      throw new Error(
        "Choose payment terms before marking this as Quoted.",
      );
    }
  }

  /*
   * quotation_requests.secure_token is a UUID column.
   * randomUUID() produces a valid UUID such as:
   * xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
   */
  const secureToken = randomUUID();
  const now = new Date().toISOString();
  const supabase = createAdminSupabaseClient();

  const payload = {
    // quotation_requests.product_slug is NOT NULL.
    // Manual/generic quotations use the existing custom service product
    // as the payment/processing configuration source.
    product_slug: "custom-business-website",
    full_name: fullName,

    /*
     * These quotation_requests columns came from the original
     * customer quotation form and some are NOT NULL in the current DB.
     * The manual Admin form intentionally keeps them optional, so use
     * harmless empty-string/fallback values instead of inserting NULL.
     *
     * Empty strings still behave as "not provided" in the UI because
     * the quotation pages already use truthy/fallback checks.
     */
    email,
    contact_number: contactNumber,
    business_name: businessName || fullName,
    business_type: businessType,
    product_name: productName || "Custom Project",
    offerings,
    main_goal: mainGoal,
    admin_notes: nullable(adminNotes),
    status,
    quoted_amount: quotedAmount,
    payment_terms: paymentTerms,
    quoted_at: status === "QUOTED" ? now : null,
    secure_token: secureToken,
  };

  const { data: requestData, error } = await supabase
    .from("quotation_requests")
    .insert(payload)
    .select("*")
    .single();

  const request = requestData as unknown as {
    id: string;
  } | null;

  if (error || !request) {
    throw new Error(
      `Unable to create manual quotation: ${
        error?.message ?? "Unknown error"
      }`,
    );
  }

  if (items.length > 0) {
    const { error: itemsError } = await supabase
      .from("quotation_items")
      .insert(
        items.map((item) => ({
          quotation_request_id: request.id,
          ...item,
        })),
      );

    if (itemsError) {
      await supabase
        .from("quotation_requests")
        .delete()
        .eq("id", request.id);

      throw new Error(
        `Unable to save quotation items: ${itemsError.message}`,
      );
    }
  }

  const activityRows: Array<{
    quotation_request_id: string;
    action_type: string;
    summary: string;
    details: Record<string, unknown>;
  }> = [
    {
      quotation_request_id: request.id,
      action_type: "MANUAL_QUOTATION_CREATED",
      summary: "Manual quotation created.",
      details: {
        admin_email: adminUser.email ?? null,
        quoted_amount: quotedAmount,
        item_count: items.length,
        status,
        payment_terms: paymentTerms,
      },
    },
  ];

  if (status === "QUOTED") {
    activityRows.push({
      quotation_request_id: request.id,
      action_type: "QUOTATION_MARKED_QUOTED",
      summary: "Quotation was finalized and marked as Quoted.",
      details: {
        admin_email: adminUser.email ?? null,
        quoted_amount: quotedAmount,
        payment_terms: paymentTerms,
        quoted_at: now,
      },
    });
  }

  const { error: activityError } = await supabase
    .from("quotation_activity_logs")
    .insert(activityRows);

  if (activityError) {
    console.error(
      "Unable to save manual quotation activity log:",
      activityError,
    );
  }

  const { error: noteError } = await supabase
    .from("quotation_note_logs")
    .insert({
      quotation_request_id: request.id,
      note_type: "AUTOMATIC",
      title: "Manual quotation created",
      note:
        items.length > 0
          ? `Created manually with ${items.length} quotation item${
              items.length === 1 ? "" : "s"
            }.`
          : "Created manually. Additional details can be completed later.",
      details: {
        admin_email: adminUser.email ?? null,
        quoted_amount: quotedAmount,
        payment_terms: paymentTerms,
      },
    });

  if (noteError) {
    console.error(
      "Unable to save manual quotation note log:",
      noteError,
    );
  }

  revalidatePath("/admin/quotation-requests");
  redirect(`/admin/quotation-requests/${request.id}`);
}
