import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { createAdminSupabaseClient } from "@/lib/supabase-admin";
import { getCustomCheckoutState } from "@/lib/custom-order-payments";
import { sendTclEmail } from "@/lib/resend";
import { tclEmailShell } from "@/lib/tcl-email-template";

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

function money(value: number, currency = "PHP") {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(value);
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
      return NextResponse.json(
        { error: "Payment link is incomplete." },
        { status: 400 },
      );
    }

    if (!(proof instanceof File) || proof.size <= 0) {
      return NextResponse.json(
        { error: "Please choose a proof of payment file." },
        { status: 400 },
      );
    }

    if (!ALLOWED_TYPES.has(proof.type)) {
      return NextResponse.json(
        { error: "Use a JPG, PNG, WEBP, or PDF file." },
        { status: 400 },
      );
    }

    if (proof.size > MAX_BYTES) {
      return NextResponse.json(
        { error: "Proof of payment must be 4 MB or smaller." },
        { status: 400 },
      );
    }

    const checkout = await getCustomCheckoutState(token);

    if (!checkout || !checkout.currentPayment) {
      return NextResponse.json(
        { error: "There is no active payment request for this link." },
        { status: 400 },
      );
    }

    const supabase = createAdminSupabaseClient();

    const { data: pricing, error: pricingError } = await supabase
      .from("orders")
      .select(
        "id,order_number,customer_name,customer_email,product_name,total_amount,currency,payment_terms,processing_fee_percent,payment_status,order_status",
      )
      .eq("id", checkout.order.id)
      .maybeSingle();

    if (pricingError || !pricing) {
      return NextResponse.json(
        { error: "Unable to load the order." },
        { status: 400 },
      );
    }

    const isBpiDirect =
      pricing.payment_terms === "FULL" &&
      Number(pricing.processing_fee_percent ?? 0) <= 0.005;

    if (!isBpiDirect) {
      return NextResponse.json(
        { error: "This order is not using direct BPI transfer." },
        { status: 400 },
      );
    }

    if (
      pricing.payment_status === "COMPLETED" ||
      pricing.order_status === "CANCELLED"
    ) {
      return NextResponse.json(
        { error: "This payment request is no longer active." },
        { status: 400 },
      );
    }

    if (
      checkout.currentPayment.id !== paymentId ||
      checkout.currentPayment.status !== "PENDING"
    ) {
      return NextResponse.json(
        { error: "This payment request is no longer active." },
        { status: 400 },
      );
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
      return NextResponse.json(
        { error: "A proof of payment is already pending verification." },
        { status: 409 },
      );
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

      return NextResponse.json(
        { error: "Unable to upload the proof of payment." },
        { status: 500 },
      );
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

      return NextResponse.json(
        { error: "Unable to save the proof of payment." },
        { status: 500 },
      );
    }

    // The proof is only pending verification here.
    // Do not mark the payment or order as paid.
    try {
      const siteUrl = (
        process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
        new URL(request.url).origin
      ).replace(/\/$/, "");

      const orderStatusUrl = `${siteUrl}/order-status`;
      const customerName = String(pricing.customer_name ?? "").trim();
      const customerEmail = String(pricing.customer_email ?? "").trim();
      const orderNumber = String(pricing.order_number ?? "").trim();
      const productName = String(pricing.product_name ?? "").trim();
      const currency = String(pricing.currency ?? "PHP").trim() || "PHP";
      const totalAmount = Number(pricing.total_amount ?? 0);

      if (customerEmail) {
        const customerMessage = [
          `Hi ${customerName ? customerName.split(/\s+/)[0] : "there"},`,
          "",
          "We received your BPI proof of payment and it has been submitted for verification.",
          "",
          "Your payment is not yet marked as paid. We will review the submitted proof and send you another email once the payment has been confirmed.",
        ].join("\n");

        const customerHtml = tclEmailShell({
          eyebrow: "TCL PAYMENT NOTIFICATION",
          title: "Payment Proof Received",
          message: customerMessage,
          details: [
            { label: "Order Number", value: orderNumber },
            { label: "Package", value: productName },
            { label: "Amount", value: money(totalAmount, currency) },
            { label: "Payment Method", value: "Direct BPI Bank Transfer" },
            {
              label: "Reference Number",
              value: referenceNumber || "Not provided",
            },
            { label: "Payment Status", value: "Pending Verification" },
          ],
          buttonLabel: "Check Order Status",
          buttonUrl: orderStatusUrl,
          note:
            "This is a notification-only email. Please do not reply to this message. For questions or concerns, contact TCL Systems & Digitals PH on Telegram: @tclsystemsanddigitalsph.",
        });

        const customerText = [
          "Payment Proof Received",
          "",
          customerMessage,
          "",
          `Order Number: ${orderNumber}`,
          `Package: ${productName}`,
          `Amount: ${money(totalAmount, currency)}`,
          "Payment Method: Direct BPI Bank Transfer",
          `Reference Number: ${referenceNumber || "Not provided"}`,
          "Payment Status: Pending Verification",
          "",
          `Check Order Status: ${orderStatusUrl}`,
          "",
          "This is a notification-only email. Please do not reply.",
          "Questions or concerns: Telegram @tclsystemsanddigitalsph",
        ].join("\n");

        const customerResult = await sendTclEmail({
          to: customerEmail,
          subject: "TCL Systems & Digitals PH - Payment Proof Received",
          html: customerHtml,
          text: customerText,
        });

        if (!customerResult.ok) {
          console.error(
            "BPI proof saved but customer notification was not sent:",
            customerResult,
          );
        }
      }

      const tclContactEmail = process.env.TCL_CONTACT_EMAIL?.trim();

      if (tclContactEmail) {
        const adminMessage = [
          "A customer has submitted a BPI proof of payment.",
          "",
          "The proof is pending verification. Review the submitted payment proof in the admin area before marking the payment as paid.",
        ].join("\n");

        const adminHtml = tclEmailShell({
          eyebrow: "TCL ADMIN NOTIFICATION",
          title: "BPI Payment Proof Submitted",
          message: adminMessage,
          details: [
            { label: "Order Number", value: orderNumber },
            { label: "Customer", value: customerName || "Not provided" },
            { label: "Customer Email", value: customerEmail || "Not provided" },
            { label: "Package", value: productName },
            { label: "Amount", value: money(totalAmount, currency) },
            {
              label: "Reference Number",
              value: referenceNumber || "Not provided",
            },
            { label: "Proof Status", value: "Pending Verification" },
          ],
          note:
            "This is an internal TCL notification. Verify the submitted proof before confirming payment.",
        });

        const adminText = [
          "BPI Payment Proof Submitted",
          "",
          adminMessage,
          "",
          `Order Number: ${orderNumber}`,
          `Customer: ${customerName || "Not provided"}`,
          `Customer Email: ${customerEmail || "Not provided"}`,
          `Package: ${productName}`,
          `Amount: ${money(totalAmount, currency)}`,
          `Reference Number: ${referenceNumber || "Not provided"}`,
          "Proof Status: Pending Verification",
        ].join("\n");

        const adminResult = await sendTclEmail({
          to: tclContactEmail,
          subject: `TCL Systems & Digitals PH - BPI Payment Proof Submitted - ${orderNumber}`,
          html: adminHtml,
          text: adminText,
        });

        if (!adminResult.ok) {
          console.error(
            "BPI proof saved but TCL notification was not sent:",
            adminResult,
          );
        }
      } else {
        console.error(
          "BPI proof saved but TCL_CONTACT_EMAIL is not configured.",
        );
      }
    } catch (emailError) {
      // Never fail a valid proof submission because email delivery failed.
      console.error(
        "BPI proof saved but email notification processing failed:",
        emailError,
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("BPI proof submission error:", error);

    return NextResponse.json(
      { error: "Unable to submit proof of payment." },
      { status: 500 },
    );
  }
}
