"use server";

import { redirect } from "next/navigation";
import { createAdminSupabaseClient } from "@/lib/supabase-admin";

function clean(value: FormDataEntryValue | null, max = 5000) {
  return String(value ?? "").trim().slice(0, max);
}

function safeSocialUrl(value: string) {
  if (!value) return null;

  try {
    const url = new URL(value);
    if (!["https:", "http:"].includes(url.protocol)) return null;
    return url.href;
  } catch {
    return null;
  }
}

function isExpired(expiresAt: string | null) {
  return Boolean(expiresAt && new Date(expiresAt).getTime() < Date.now());
}

export async function submitInvitedReview(formData: FormData) {
  const token = clean(formData.get("token"), 100);
  const businessName = clean(formData.get("business_name"), 150);
  const reviewText = clean(formData.get("review_text"), 3000);
  const socialInput = clean(formData.get("social_url"), 500);
  const rating = Number(clean(formData.get("rating"), 2));

  if (!token) throw new Error("Invalid review invitation.");
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new Error("Please select a rating from 1 to 5.");
  }
  if (reviewText.length < 10) {
    throw new Error("Please write a little more about your experience.");
  }

  const socialUrl = socialInput ? safeSocialUrl(socialInput) : null;
  if (socialInput && !socialUrl) {
    throw new Error("Please enter a valid website or social media link.");
  }

  const admin = createAdminSupabaseClient();

  const { data: invite, error: inviteError } = await admin
    .from("review_invitations")
    .select(
      "id,token,order_id,product_id,customer_name,product_name,status,expires_at,review_id",
    )
    .eq("token", token)
    .maybeSingle();

  if (inviteError || !invite) {
    throw new Error("This review invitation is invalid.");
  }

  if (invite.status !== "ACTIVE") {
    throw new Error("This review invitation has already been used or is no longer active.");
  }

  if (isExpired(invite.expires_at)) {
    await admin
      .from("review_invitations")
      .update({
        status: "EXPIRED",
        updated_at: new Date().toISOString(),
      })
      .eq("id", invite.id)
      .eq("status", "ACTIVE");

    throw new Error("This review invitation has expired.");
  }

  const { data: review, error: reviewError } = await admin
    .from("reviews")
    .insert({
      customer_name: invite.customer_name,
      business_name: businessName || null,
      product_id: invite.product_id,
      product_name: invite.product_name,
      rating,
      review_text: reviewText,
      social_url: socialUrl,
      status: "PENDING",
      is_featured: false,
      display_order: 0,
    })
    .select("id")
    .single();

  if (reviewError || !review) {
    console.error("Review submission error:", reviewError);
    throw new Error("Unable to submit your review right now.");
  }

  const now = new Date().toISOString();

  const { data: updatedInvite, error: updateError } = await admin
    .from("review_invitations")
    .update({
      status: "USED",
      used_at: now,
      review_id: review.id,
      updated_at: now,
    })
    .eq("id", invite.id)
    .eq("status", "ACTIVE")
    .select("id")
    .maybeSingle();

  if (updateError || !updatedInvite) {
    await admin.from("reviews").delete().eq("id", review.id);
    throw new Error("This review invitation was already used.");
  }

  redirect(`/review/${token}?submitted=1`);
}
