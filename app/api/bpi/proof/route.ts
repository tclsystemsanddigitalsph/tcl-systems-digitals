import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_FILE_SIZE = 4 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
]);

function safeExtension(file: File) {
  const byType: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "application/pdf": "pdf",
  };

  return byType[file.type] ?? "bin";
}

function cleanOptional(value: FormDataEntryValue | null, max: number) {
  if (typeof value !== "string") return null;
  const cleaned = value.trim();
  return cleaned ? cleaned.slice(0, max) : null;
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const token = String(formData.get("token") ?? "").trim();
    const paymentId = String(formData.get("payment_id") ?? "").trim();
    const proof = formData.get("proof");

    const referenceNumber = cleanOptional(
      formData.get("reference_number"),
      120,
    );
    const customerNotes = cleanOptional(formData.get("customer_notes"), 500);

    if (!token || !paymentId) {
      return NextResponse.json(
        { error: "Missing BPI payment information." },
        { status: 400 },
      );
    }

    if (!(proof instanceof File) || proof.size <= 0) {
      return NextResponse.json(
        { error: "Please select your proof of payment." },
        { status: 400 },
      );
    }

    if (!ALLOWED_TYPES.has(proof.type)) {
      return NextResponse.json(
        { error: "Proof must be a JPG, PNG, WEBP, or PDF file." },
        { status: 400 },
      );
    }

    if (proof.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "Proof of payment must be 4 MB or smaller." },
        { status: 400 },
      );
    }

    const supabase = createAdminSupabaseClient();

    const { data: orderData, error: orderError } = await supabase
      .from("orders")
      .select(
        "id,receipt_token,payment_provider,payment_status,payment_terms,processing_fee_percent,total_amount",
      )
      .eq("receipt_token", token)
      .maybeSingle();

    if (orderError) {
      console.error("Regular BPI proof order lookup error:", orderError);
      return NextResponse.json(
        { error: "Unable to verify this BPI order." },
        { status: 500 },
      );
    }

    if (!orderData) {
      return NextResponse.json(
        { error: "BPI order not found." },
        { status: 404 },
      );
    }

    if (
      String(orderData.payment_provider ?? "").toUpperCase() !== "BPI" ||
      String(orderData.payment_terms ?? "").toUpperCase() !== "FULL"
    ) {
      return NextResponse.json(
        { error: "This order is not a Direct BPI payment." },
        { status: 400 },
      );
    }

    if (Number(orderData.processing_fee_percent ?? 0) > 0.005) {
      return NextResponse.json(
        { error: "Invalid Direct BPI order pricing." },
        { status: 400 },
      );
    }

    if (String(orderData.payment_status ?? "").toUpperCase() === "COMPLETED") {
      return NextResponse.json(
        { error: "This order has already been paid." },
        { status: 409 },
      );
    }

    const { data: paymentData, error: paymentError } = await supabase
      .from("order_payments")
      .select("id,order_id,provider,status,payment_stage,amount,currency")
      .eq("id", paymentId)
      .eq("order_id", orderData.id)
      .maybeSingle();

    if (paymentError) {
      console.error("Regular BPI proof payment lookup error:", paymentError);
      return NextResponse.json(
        { error: "Unable to verify this BPI payment." },
        { status: 500 },
      );
    }

    if (!paymentData) {
      return NextResponse.json(
        { error: "BPI payment record not found." },
        { status: 404 },
      );
    }

    if (
      String(paymentData.provider ?? "").toUpperCase() !== "BPI" ||
      String(paymentData.status ?? "").toUpperCase() !== "PENDING"
    ) {
      return NextResponse.json(
        { error: "This BPI payment is no longer awaiting proof." },
        { status: 409 },
      );
    }

    const { data: existingProof, error: existingProofError } = await supabase
      .from("bank_transfer_proofs")
      .select("id,status")
      .eq("payment_id", paymentId)
      .in("status", ["PENDING", "VERIFIED"])
      .order("submitted_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existingProofError) {
      console.error(
        "Regular BPI existing proof lookup error:",
        existingProofError,
      );
      return NextResponse.json(
        { error: "Unable to check the current proof status." },
        { status: 500 },
      );
    }

    if (existingProof) {
      return NextResponse.json(
        {
          error:
            String(existingProof.status).toUpperCase() === "VERIFIED"
              ? "This BPI payment has already been verified."
              : "A proof of payment is already pending verification.",
        },
        { status: 409 },
      );
    }

    const extension = safeExtension(proof);
    const storagePath = `regular/${orderData.id}/${paymentId}/${crypto.randomUUID()}.${extension}`;
    const bytes = new Uint8Array(await proof.arrayBuffer());

    const { error: uploadError } = await supabase.storage
      .from("bank-transfer-proofs")
      .upload(storagePath, bytes, {
        contentType: proof.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("Regular BPI proof storage upload error:", uploadError);
      return NextResponse.json(
        {
          error:
            "Unable to upload the proof. Please make sure the bank-transfer-proofs storage bucket exists.",
        },
        { status: 500 },
      );
    }

    const proofRow: Record<string, unknown> = {
      order_id: orderData.id,
      payment_id: paymentId,
      storage_path: storagePath,
      file_name: proof.name.slice(0, 255),
      mime_type: proof.type,
      file_size: proof.size,
      status: "PENDING",
      submitted_at: new Date().toISOString(),
    };

    if (referenceNumber) {
      proofRow.reference_number = referenceNumber;
    }

    if (customerNotes) {
      proofRow.customer_notes = customerNotes;
    }

    const { error: insertError } = await supabase
      .from("bank_transfer_proofs")
      .insert(proofRow);

    if (insertError) {
      console.error("Regular BPI proof database insert error:", insertError);

      await supabase.storage
        .from("bank-transfer-proofs")
        .remove([storagePath]);

      return NextResponse.json(
        { error: "Unable to save the proof of payment." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      ok: true,
      status: "PENDING",
      message: "Proof submitted and pending verification.",
    });
  } catch (error) {
    console.error("Regular BPI proof upload error:", error);

    return NextResponse.json(
      { error: "Unable to submit proof of payment." },
      { status: 500 },
    );
  }
}
