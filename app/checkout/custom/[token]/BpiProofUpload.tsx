"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function BpiProofUpload({
  token,
  paymentId,
  existingStatus,
  rejectionReason,
}: {
  token: string;
  paymentId: string;
  existingStatus: "PENDING" | "VERIFIED" | "REJECTED" | null;
  rejectionReason?: string | null;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(existingStatus);
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setStatus(existingStatus);
  }, [existingStatus]);

  useEffect(() => {
    if (status !== "PENDING") return;

    const interval = window.setInterval(() => {
      router.refresh();
    }, 8000);

    return () => window.clearInterval(interval);
  }, [router, status]);

  if (status === "VERIFIED") {
    return (
      <div
        style={{
          marginTop: 16,
          padding: 14,
          border: "1px solid #cfe5d3",
          borderRadius: 12,
          background: "#f5fff7",
        }}
      >
        <strong style={{ display: "block", marginBottom: 4 }}>
          Payment verified ✓
        </strong>
        <span>Your BPI transfer has been verified by TCL.</span>
      </div>
    );
  }

  if (status === "PENDING") {
    return (
      <div
        style={{
          marginTop: 16,
          padding: 14,
          border: "1px solid #ead8b9",
          borderRadius: 12,
          background: "#fffaf0",
        }}
      >
        <strong style={{ display: "block", marginBottom: 4 }}>
          Payment verification pending
        </strong>
        <span>
          Your proof of payment has been submitted. TCL will verify the transfer
          before your order is marked as paid.
        </span>
      </div>
    );
  }

  return (
    <form
      style={{ marginTop: 16, display: "grid", gap: 12 }}
      onSubmit={async (event) => {
        event.preventDefault();
        setSubmitting(true);
        setMessage(null);

        try {
          const form = new FormData(event.currentTarget);
          form.set("token", token);
          form.set("payment_id", paymentId);

          const response = await fetch("/api/custom-checkout/bpi-proof", {
            method: "POST",
            body: form,
          });

          const payload = (await response.json().catch(() => null)) as
            | { ok?: boolean; error?: string }
            | null;

          if (!response.ok || !payload?.ok) {
            throw new Error(
              payload?.error || "Unable to submit proof of payment.",
            );
          }

          setStatus("PENDING");
          setMessage("Proof of payment submitted successfully.");
          window.location.reload();
        } catch (error) {
          setMessage(
            error instanceof Error
              ? error.message
              : "Unable to submit proof of payment.",
          );
        } finally {
          setSubmitting(false);
        }
      }}
    >
      {status === "REJECTED" ? (
        <div
          style={{
            padding: 12,
            border: "1px solid #efc7c7",
            borderRadius: 10,
            background: "#fff7f7",
          }}
        >
          <strong style={{ display: "block", marginBottom: 4 }}>
            Previous proof needs replacement
          </strong>
          <span>
            {rejectionReason || "Please upload a new proof of payment."}
          </span>
        </div>
      ) : null}

      <label style={{ display: "grid", gap: 6 }}>
        <span style={{ fontWeight: 800 }}>Proof of payment *</span>
        <input
          type="file"
          name="proof"
          accept="image/jpeg,image/png,image/webp,application/pdf"
          required
        />
        <small>JPG, PNG, WEBP, or PDF. Maximum 4 MB.</small>
      </label>

      <label style={{ display: "grid", gap: 6 }}>
        <span style={{ fontWeight: 800 }}>Transfer reference number</span>
        <input
          type="text"
          name="reference_number"
          maxLength={120}
          placeholder="Optional"
        />
      </label>

      <label style={{ display: "grid", gap: 6 }}>
        <span style={{ fontWeight: 800 }}>Notes</span>
        <textarea
          name="customer_notes"
          rows={3}
          maxLength={500}
          placeholder="Optional"
        />
      </label>

      <button
        type="submit"
        disabled={submitting}
        style={{
          minHeight: 44,
          border: 0,
          borderRadius: 11,
          background: "#2f2529",
          color: "#fff",
          fontWeight: 900,
          cursor: submitting ? "wait" : "pointer",
        }}
      >
        {submitting ? "Uploading…" : "Submit Proof of Payment →"}
      </button>

      {message ? (
        <p style={{ margin: 0, fontSize: ".86rem" }}>{message}</p>
      ) : null}
    </form>
  );
}
