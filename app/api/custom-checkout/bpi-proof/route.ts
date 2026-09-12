import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { createAdminSupabaseClient } from "@/lib/supabase-admin";
import { getCustomCheckoutState } from "@/lib/custom-order-payments";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
]);
const MAX_BYTES = 4 * 1024 * 1024;

function safeName(value: string) {
  const cleaned = value.replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/-+/g, "-");
  return cleaned.slice(-120) || "proof";
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const token = String(formData.get("token") ?? "").trim();
    const paymentId = String(formData.get("payment_id") ?? "").trim();
    const referenceNumber = String(formData.get("reference_number") ?? "").trim();
    const customerNotes = String(formData.get("customer_notes") ?? "").trim();
    const proof = formData.get("proof");

    if (!token || !paymentId) {
      return NextResponse.json({ error: "Payment link is incomplete." }, { status: 400 });
    }

    if (!(proof instanceof File) || proof.size <= 0) {
      return NextResponse.json({ error: "Please choose a proof of payment file." }, { status: 400 });
    }

    if (!ALLOWED_TYPES.has(proof.type)) {
      return NextResponse.json({ error: "Use a JPG, PNG, WEBP, or PDF file." }, { status: 400 });
    }

    if (proof.size > MAX_BYTES) {
      return NextResponse.json({ error: "Proof of payment must be 4 MB or smaller." }, { status: 400 });
    }

    const checkout = await getCustomCheckoutState(token);
    if (!checkout || !checkout.currentPayment) {
      return NextResponse.json({ error: "There is no active payment request for this link." }, { status: 400 });
    }

    const supabase = createAdminSupabaseClient();
    const { data: pricing, error: pricingError } = await supabase
      .from("orders")
      .select("id,payment_terms,processing_fee_percent,payment_status,order_status")
      .eq("id", checkout.order.id)
      .maybeSingle();

    if (pricingError || !pricing) {
      return NextResponse.json({ error: "Unable to load the order." }, { status: 400 });
    }

    const isBpiDirect =
      pricing.payment_terms === "FULL" &&
      Number(pricing.processing_fee_percent ?? 0) <= 0.005;

    if (!isBpiDirect) {
      return NextResponse.json({ error: "This order is not using direct BPI transfer." }, { status: 400 });
    }

    if (pricing.payment_status === "COMPLETED" || pricing.order_status === "CANCELLED") {
      return NextResponse.json({ error: "This payment request is no longer active." }, { status: 400 });
    }

    if (checkout.currentPayment.id !== paymentId || checkout.currentPayment.status !== "PENDING") {
      return NextResponse.json({ error: "This payment request is no longer active." }, { status: 400 });
    }

    const { data: pendingProof } = await supabase
      .from("bank_transfer_proofs")
      .select("id")
      .eq("payment_id", paymentId)
      .eq("status", "PENDING")
      .order("submitted_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (pendingProof) {
      return NextResponse.json({ error: "A proof of payment is already pending verification." }, { status: 409 });
    }

    const path = `bpi/${checkout.order.id}/${paymentId}/${randomUUID()}-${safeName(proof.name)}`;
    const bytes = Buffer.from(await proof.arrayBuffer());

    const { error: uploadError } = await supabase.storage
      .from("payment-proofs")
      .upload(path, bytes, {
        contentType: proof.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("BPI proof upload error:", uploadError);
      return NextResponse.json({ error: "Unable to upload the proof of payment." }, { status: 500 });
    }

    const { error: insertError } = await supabase
      .from("bank_transfer_proofs")
      .insert({
        order_id: checkout.order.id,
        payment_id: paymentId,
        file_path: path,
        original_filename: proof.name,
        mime_type: proof.type,
        size_bytes: proof.size,
        reference_number: referenceNumber || null,
        customer_notes: customerNotes || null,
        status: "PENDING",
      });

    if (insertError) {
      await supabase.storage.from("payment-proofs").remove([path]);
      console.error("BPI proof record error:", insertError);
      return NextResponse.json({ error: "Unable to save the proof of payment." }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("BPI proof submission error:", error);
    return NextResponse.json({ error: "Unable to submit proof of payment." }, { status: 500 });
  }
}
