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
  const status = proof?.status?.toUpperCase() ?? "";
  const isPending = status === "PENDING";
  const isVerified = status === "VERIFIED";
  const isRejected = status === "REJECTED";

  return (
    <section
      style={{
        border: "1px solid #eadde2",
        borderRadius: 14,
        background: "#fff",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          minHeight: 48,
          padding: "10px 14px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          borderBottom: "1px solid #f1e6ea",
        }}
      >
        <div>
          <span
            style={{
              display: "block",
              color: "#b24d76",
              fontSize: ".52rem",
              fontWeight: 900,
              letterSpacing: ".09em",
            }}
          >
            BPI PAYMENT
          </span>
          <strong
            style={{
              display: "block",
              marginTop: 2,
              color: "#2f2529",
              fontSize: ".78rem",
            }}
          >
            Transfer verification
          </strong>
        </div>

        {proof ? (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              minHeight: 25,
              padding: "0 9px",
              borderRadius: 999,
              border: `1px solid ${
                isVerified ? "#bcdac4" : isRejected ? "#e8c5c5" : "#ead2a7"
              }`,
              background: isVerified
                ? "#f3fbf5"
                : isRejected
                  ? "#fff6f6"
                  : "#fffaf0",
              color: isVerified
                ? "#327047"
                : isRejected
                  ? "#984747"
                  : "#916a28",
              fontSize: ".51rem",
              fontWeight: 900,
              letterSpacing: ".04em",
            }}
          >
            {status}
          </span>
        ) : null}
      </div>

      <div style={{ padding: "12px 14px" }}>
        {!proof ? (
          <p
            style={{
              margin: 0,
              color: "#817278",
              fontSize: ".62rem",
              lineHeight: 1.5,
            }}
          >
            No proof of payment has been submitted yet.
          </p>
        ) : (
          <div style={{ display: "grid", gap: 11 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "7px 18px",
                flexWrap: "wrap",
                color: "#75666c",
                fontSize: ".58rem",
                lineHeight: 1.45,
              }}
            >
              <span>
                <strong style={{ color: "#3b3034" }}>Submitted:</strong>{" "}
                {new Date(proof.submitted_at).toLocaleString("en-PH")}
              </span>

              {proof.reference_number ? (
                <span>
                  <strong style={{ color: "#3b3034" }}>Reference:</strong>{" "}
                  {proof.reference_number}
                </span>
              ) : null}

              {proof.original_filename ? (
                <span>
                  <strong style={{ color: "#3b3034" }}>File:</strong>{" "}
                  {proof.original_filename}
                </span>
              ) : null}
            </div>

            {proof.customer_notes ? (
              <div
                style={{
                  padding: "8px 10px",
                  border: "1px solid #f0e4e8",
                  borderRadius: 8,
                  background: "#fcfafb",
                  color: "#66585e",
                  fontSize: ".58rem",
                  lineHeight: 1.5,
                }}
              >
                <strong style={{ color: "#3b3034" }}>Client note:</strong>{" "}
                {proof.customer_notes}
              </div>
            ) : null}

            {proof.rejection_reason ? (
              <div
                style={{
                  padding: "8px 10px",
                  border: "1px solid #efd1d1",
                  borderRadius: 8,
                  background: "#fff8f8",
                  color: "#914646",
                  fontSize: ".58rem",
                  lineHeight: 1.5,
                }}
              >
                <strong>Rejection reason:</strong> {proof.rejection_reason}
              </div>
            ) : null}

            <div
              style={{
                display: "flex",
                alignItems: "stretch",
                gap: 8,
                flexWrap: "wrap",
              }}
            >
              {signedUrl ? (
                <a
                  href={signedUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    minHeight: 36,
                    padding: "0 12px",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "1px solid #ddcbd2",
                    borderRadius: 9,
                    background: "#fff",
                    color: "#4a3b41",
                    fontSize: ".58rem",
                    fontWeight: 850,
                    textDecoration: "none",
                  }}
                >
                  View proof ↗
                </a>
              ) : null}

              {isPending ? (
                <form action={verifyBpiTransferProof} style={{ flex: "1 1 170px" }}>
                  <input type="hidden" name="order_id" value={orderId} />
                  <input type="hidden" name="proof_id" value={proof.id} />
                  <button
                    type="submit"
                    style={{
                      width: "100%",
                      minHeight: 36,
                      padding: "0 13px",
                      border: "1px solid #347a4a",
                      borderRadius: 9,
                      background: "#347a4a",
                      color: "#fff",
                      font: "inherit",
                      fontSize: ".58rem",
                      fontWeight: 900,
                      cursor: "pointer",
                    }}
                  >
                    ✓ Verify payment
                  </button>
                </form>
              ) : null}
            </div>

            {isPending ? (
              <details
                style={{
                  borderTop: "1px solid #f1e6ea",
                  paddingTop: 9,
                }}
              >
                <summary
                  style={{
                    width: "fit-content",
                    cursor: "pointer",
                    color: "#9b4b4b",
                    fontSize: ".56rem",
                    fontWeight: 850,
                  }}
                >
                  Reject / request new proof
                </summary>

                <form
                  action={rejectBpiTransferProof}
                  style={{
                    display: "grid",
                    gap: 8,
                    marginTop: 9,
                  }}
                >
                  <input type="hidden" name="order_id" value={orderId} />
                  <input type="hidden" name="proof_id" value={proof.id} />
                  <textarea
                    name="rejection_reason"
                    rows={2}
                    required
                    maxLength={500}
                    placeholder="Reason for rejection / what the client needs to re-upload"
                    style={{
                      width: "100%",
                      minHeight: 62,
                      padding: "9px 10px",
                      border: "1px solid #dfc8c8",
                      borderRadius: 8,
                      background: "#fff",
                      color: "#3b3034",
                      font: "inherit",
                      fontSize: ".6rem",
                      lineHeight: 1.45,
                      resize: "vertical",
                      outline: "none",
                    }}
                  />
                  <button
                    type="submit"
                    style={{
                      minHeight: 35,
                      border: "1px solid #d9bcbc",
                      borderRadius: 8,
                      background: "#fff7f7",
                      color: "#984747",
                      font: "inherit",
                      fontSize: ".57rem",
                      fontWeight: 900,
                      cursor: "pointer",
                    }}
                  >
                    Reject proof
                  </button>
                </form>
              </details>
            ) : null}
          </div>
        )}
      </div>
    </section>
  );
}
