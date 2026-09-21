"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminSupabaseClient } from "@/lib/supabase-admin";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { sendTclEmail } from "@/lib/resend";
import { tclEmailShell } from "@/lib/tcl-email-template";

const REVIEW_STATUSES = new Set(["PENDING", "APPROVED", "REJECTED"]);

async function requireAdmin() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/admin/login");
  return user;
}

function optional(value: FormDataEntryValue | null) {
  const result = String(value ?? "").trim();
  return result || null;
}

export async function createReviewInvitation(formData: FormData) {
  const user = await requireAdmin();
  const admin = createAdminSupabaseClient();

  const orderId = optional(formData.get("order_id"));
  let productId = optional(formData.get("product_id"));
  let customerName = String(formData.get("customer_name") ?? "").trim();
  let customerEmail = optional(formData.get("customer_email"));
  let productName = optional(formData.get("product_name"));
  const expiresDate = optional(formData.get("expires_at"));

  if (orderId) {
    const { data: order, error } = await admin
      .from("orders")
      .select("id,customer_name,customer_email,product_id,product_name")
      .eq("id", orderId)
      .maybeSingle();

    if (error || !order) {
      throw new Error("Selected order could not be found.");
    }

    customerName = order.customer_name;
    customerEmail = order.customer_email;
    productId = order.product_id;
    productName = order.product_name;
  }

  if (!customerName) {
    throw new Error("Customer name is required.");
  }

  let expiresAt: string | null = null;

  if (expiresDate) {
    const parsed = new Date(`${expiresDate}T23:59:59`);

    if (Number.isNaN(parsed.getTime())) {
      throw new Error("Invalid expiration date.");
    }

    expiresAt = parsed.toISOString();
  }

  const { data: invitation, error } = await admin
    .from("review_invitations")
    .insert({
      order_id: orderId,
      product_id: productId,
      customer_name: customerName,
      customer_email: customerEmail,
      product_name: productName,
      expires_at: expiresAt,
      created_by: user.email || "Admin",
    })
    .select("id,token")
    .single();

  if (error || !invitation) {
    console.error("Create review invitation error:", error);
    throw new Error("Unable to create review invitation.");
  }

  /*
   * Send the invitation only after the database has successfully created it,
   * so the email always uses the actual database-generated review token.
   *
   * Email delivery is intentionally non-blocking. If Resend fails, the review
   * invitation remains valid and Admin can still copy/open its link manually.
   */
  if (customerEmail && invitation.token) {
    try {
      const siteUrl = (
        process.env.NEXT_PUBLIC_SITE_URL ||
        process.env.SITE_URL ||
        "http://localhost:3000"
      ).replace(/\/+$/, "");

      const reviewUrl = `${siteUrl}/review/${invitation.token}`;

      const message = tclEmailShell({
        eyebrow: "CLIENT REVIEW",
        title: "We’d Love Your Feedback",
        message: `Hi ${customerName},

Thank you for choosing TCL Systems & Digitals PH${productName ? ` for your ${productName}` : ""}.

We’d love to hear about your experience. Your feedback helps us improve our services and also helps future clients learn more about working with TCL.

You can leave your review using the private link below.`,
        details: [
          ...(productName
            ? [{ label: "Project / Service", value: productName }]
            : []),
          {
            label: "Review Invitation",
            value: expiresAt
              ? `Available until ${new Intl.DateTimeFormat("en-PH", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  timeZone: "Asia/Manila",
                }).format(new Date(expiresAt))}`
              : "Active until used or revoked",
          },
        ],
        buttonLabel: "Leave a Review",
        buttonUrl: reviewUrl,
        note: "This is an automated notification email. For questions, please contact TCL Systems & Digitals PH through Telegram: @tclsystemsanddigitalsph.",
      });

      await sendTclEmail({
        to: customerEmail,
        subject: "TCL Systems & Digitals PH - We’d Love Your Feedback",
        html: message.html,
        text: message.text,
      });
    } catch (emailError) {
      console.error("Review invitation customer email error:", emailError);
    }
  }

  revalidatePath("/admin/reviews");
}

export async function revokeReviewInvitation(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("invitation_id") ?? "").trim();

  if (!id) {
    throw new Error("Missing invitation ID.");
  }

  const admin = createAdminSupabaseClient();

  const { error } = await admin
    .from("review_invitations")
    .delete()
    .eq("id", id)
    .eq("status", "ACTIVE");

  if (error) {
    throw new Error("Unable to revoke invitation.");
  }

  revalidatePath("/admin/reviews");
}

export async function updateReviewStatus(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("review_id") ?? "").trim();
  const status = String(formData.get("status") ?? "")
    .trim()
    .toUpperCase();

  if (!id || !REVIEW_STATUSES.has(status)) {
    throw new Error("Invalid review update.");
  }

  const admin = createAdminSupabaseClient();

  const { error } = await admin
    .from("reviews")
    .update({
      status,
      approved_at: status === "APPROVED" ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    throw new Error("Unable to update review.");
  }

  revalidatePath("/admin/reviews");
  revalidatePath("/");
}

export async function toggleFeaturedReview(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("review_id") ?? "").trim();
  const featured = String(formData.get("featured") ?? "") === "true";

  if (!id) {
    throw new Error("Missing review ID.");
  }

  const admin = createAdminSupabaseClient();

  const { error } = await admin
    .from("reviews")
    .update({
      is_featured: featured,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    throw new Error("Unable to update featured status.");
  }

  revalidatePath("/admin/reviews");
  revalidatePath("/");
}

export async function deleteReview(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("review_id") ?? "").trim();

  if (!id) {
    throw new Error("Missing review ID.");
  }

  const admin = createAdminSupabaseClient();

  await admin
    .from("review_invitations")
    .update({
      review_id: null,
      updated_at: new Date().toISOString(),
    })
    .eq("review_id", id);

  const { error } = await admin
    .from("reviews")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error("Unable to delete review.");
  }

  revalidatePath("/admin/reviews");
  revalidatePath("/");
}
