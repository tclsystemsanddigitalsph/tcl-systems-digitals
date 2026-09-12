import { rejectBpiTransferProof, verifyBpiTransferProof } from "./actions";

export default function BpiTransferVerificationPanel({
  orderId,
  proof,
  signedUrl,
}: {
  orderId: string;
  proof: {
    id: string;
    status: string;
    original_filename: string | null;
    reference_number: string | null;
    customer_notes: string | null;
    submitted_at: string;
    rejection_reason: string | null;
  } | null;
  signedUrl: string | null;
}) {
  return (
    <section style={{ border: "1px solid #ead8df", borderRadius: 18, background: "#fff", overflow: "hidden" }}>
      <div style={{ padding: "16px 18px", borderBottom: "1px solid #f0e4e8" }}>
        <span style={{ fontSize: ".6rem", fontWeight: 900, letterSpacing: ".08em", color: "#b24d76" }}>BPI PAYMENT VERIFICATION</span>
        <h2 style={{ margin: "5px 0 0" }}>Direct transfer proof</h2>
      </div>

      <div style={{ padding: 18 }}>
        {!proof ? (
          <p style={{ margin: 0 }}>No proof of payment has been submitted yet.</p>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            <div><strong>Status:</strong> {proof.status}</div>
            <div><strong>Submitted:</strong> {new Date(proof.submitted_at).toLocaleString("en-PH")}</div>
            <div><strong>Reference:</strong> {proof.reference_number || "—"}</div>
            <div><strong>Client notes:</strong> {proof.customer_notes || "—"}</div>
            {proof.rejection_reason ? <div><strong>Rejection reason:</strong> {proof.rejection_reason}</div> : null}

            {signedUrl ? (
              <a href={signedUrl} target="_blank" rel="noreferrer" style={{ minHeight: 42, display: "inline-flex", alignItems: "center", justifyContent: "center", borderRadius: 11, border: "1px solid #d9c6ce", textDecoration: "none", color: "#2f2529", fontWeight: 900 }}>
                View Proof of Payment →
              </a>
            ) : null}

            {proof.status === "PENDING" ? (
              <div style={{ display: "grid", gap: 10, marginTop: 4 }}>
                <form action={verifyBpiTransferProof}>
                  <input type="hidden" name="order_id" value={orderId} />
                  <input type="hidden" name="proof_id" value={proof.id} />
                  <button type="submit" style={{ width: "100%", minHeight: 44, border: 0, borderRadius: 11, background: "#2f7a46", color: "#fff", fontWeight: 900, cursor: "pointer" }}>
                    ✓ Verify & Mark Paid
                  </button>
                </form>

                <form action={rejectBpiTransferProof} style={{ display: "grid", gap: 8 }}>
                  <input type="hidden" name="order_id" value={orderId} />
                  <input type="hidden" name="proof_id" value={proof.id} />
                  <textarea name="rejection_reason" rows={3} required maxLength={500} placeholder="Reason for rejection / what the client needs to re-upload" />
                  <button type="submit" style={{ minHeight: 42, border: "1px solid #d8b8b8", borderRadius: 11, background: "#fff7f7", color: "#9b3f3f", fontWeight: 900, cursor: "pointer" }}>
                    Reject / Request New Proof
                  </button>
                </form>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </section>
  );
}
