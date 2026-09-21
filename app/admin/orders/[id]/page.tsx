import { notFound, redirect } from "next/navigation";
import { createAdminSupabaseClient } from "@/lib/supabase-admin";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import AdminNav from "@/app/admin/AdminNav";
import styles from "./order.module.css";
import {
  addOrderNote,
  cancelOrder,
  deleteOrder,
  processProviderRefund,
  recordExternalRefund,
  recordManualPayment,
  requestCustomProjectPayment,
  updateCustomProjectAmount,
  updateRegularOrderAmount,
  updateOrderStatus,
} from "./actions";
import CopyPaymentLinkButton from "./CopyPaymentLinkButton";
import DigitalAccessPanel from "./DigitalAccessPanel";
import BpiTransferVerificationPanel from "./BpiTransferVerificationPanel";

type OrderDetailsPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    checkout_created?: string;
    cancelled?: string;
    refund_recorded?: string;
    refund_processed?: string;
    amount_updated?: string;
    payment_requested?: string;
    bpi_verified?: string;
    bpi_rejected?: string;
    manual_payment?: string;
    regular_price_updated?: string;
    order_status_updated?: string;
  }>;
};

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(value);
}

function formatDateTime(value: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function statusClass(status: string | null) {
  if (status === "COMPLETED") return styles.completed;
  if (status === "PENDING" || status === "PARTIALLY_PAID") return styles.pending;
  if (status === "FAILED" || status === "CANCELLED") return styles.failed;
  return styles.muted;
}

export default async function OrderDetailsPage({
  params,
  searchParams,
}: OrderDetailsPageProps) {
  const authSupabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await authSupabase.auth.getUser();

  if (!user) redirect("/admin/login");

  const { id } = await params;
  const query = await searchParams;
  const adminSupabase = createAdminSupabaseClient();

  const { data: order, error } = await adminSupabase
    .from("orders")
    .select(
      "id,order_number,customer_id,customer_name,customer_email,product_id,product_name,selected_design_slug,selected_design_name,base_price,processing_fee_percent,processing_fee,total_amount,currency,payment_provider,payment_status,payment_terms,amount_paid,balance_due,deposit_percent,deposit_paid_at,final_payment_requested_at,order_status,cancellation_reason,cancelled_at,refund_status,refunded_amount,refunded_at,refund_note,paypal_order_id,paypal_capture_id,paymongo_checkout_session_id,paymongo_payment_id,paymongo_checkout_url,delivery_status,notes,paid_at,delivered_at,created_at,updated_at,receipt_token,download_access_expires_at",
    )
    .eq("id", id)
    .maybeSingle();

  if (error) console.error("Admin order details load error:", error);
  if (!order) notFound();

  /*
   * payment_terms is also used by regular BPI orders, so it cannot reliably
   * identify a custom quotation order. A real custom order must be linked to
   * quotation_requests.
   */
  const { data: linkedQuotation, error: linkedQuotationError } =
    await adminSupabase
      .from("quotation_requests")
      .select("id")
      .eq("order_id", order.id)
      .maybeSingle();

  if (linkedQuotationError) {
    console.error(
      "Admin order quotation link load error:",
      linkedQuotationError,
    );
  }

  const [deliveryResult, notesResult, refundsResult] = await Promise.all([
    adminSupabase
      .from("delivery_requests")
      .select(
        "id,delivery_type,github_username,status,customer_message,admin_notes,requested_at,delivered_at,created_at",
      )
      .eq("order_id", order.id)
      .order("created_at", { ascending: false }),
    adminSupabase
      .from("order_notes")
      .select("id,note,created_by,created_at")
      .eq("order_id", order.id)
      .order("created_at", { ascending: false }),
    adminSupabase
      .from("order_refunds")
      .select(
        "id,provider,provider_refund_id,amount,currency,reason,provider_status,refund_type,created_by,created_at",
      )
      .eq("order_id", order.id)
      .order("created_at", { ascending: false }),
  ]);

  if (deliveryResult.error)
    console.error("Admin order delivery requests load error:", deliveryResult.error);
  if (notesResult.error)
    console.error("Admin order notes load error:", notesResult.error);
  if (refundsResult.error)
    console.error("Admin order refund history load error:", refundsResult.error);

  const deliveries = deliveryResult.data ?? [];
  const noteEntries = notesResult.data ?? [];
  const refunds = refundsResult.data ?? [];

  const totalAmount = Number(order.total_amount ?? 0);
  const isCustomQuotationOrder = Boolean(linkedQuotation?.id);
  const isCustomBpiDirectOrder =
    isCustomQuotationOrder &&
    order.payment_terms === "FULL" &&
    Number(order.processing_fee_percent ?? 0) <= 0.005;
  const isRegularBpiDirectOrder =
    !isCustomQuotationOrder &&
    String(order.payment_provider ?? "").trim().toUpperCase() === "BPI";
  const isBpiDirectOrder =
    isCustomBpiDirectOrder || isRegularBpiDirectOrder;

  type BpiProofRecord = {
    id: string;
    status: string;
    original_filename: string | null;
    reference_number: string | null;
    customer_notes: string | null;
    submitted_at: string;
    rejection_reason: string | null;
    file_path: string | null;
    storage_path: string | null;
    file_name: string | null;
  };

  let bpiProof: BpiProofRecord | null = null;
  let bpiProofSignedUrl: string | null = null;

  if (isBpiDirectOrder) {
    const { data, error: proofError } = await adminSupabase
      .from("bank_transfer_proofs")
      .select(
        "id,status,original_filename,reference_number,customer_notes,submitted_at,rejection_reason,file_path,storage_path,file_name",
      )
      .eq("order_id", order.id)
      .order("submitted_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (proofError) {
      console.error("Admin BPI proof load error:", proofError);
    } else if (data) {
      const proofRecord = data as BpiProofRecord;
      bpiProof = {
        ...proofRecord,
        original_filename:
          proofRecord.original_filename || proofRecord.file_name || null,
      };

      const proofPath =
        proofRecord.storage_path || proofRecord.file_path || null;
      const proofBucket = proofRecord.storage_path
        ? "bank-transfer-proofs"
        : "payment-proofs";

      if (proofPath) {
        const { data: signed, error: signedUrlError } =
          await adminSupabase.storage
            .from(proofBucket)
            .createSignedUrl(proofPath, 60 * 15);

        if (signedUrlError) {
          console.error("Admin BPI proof signed URL error:", signedUrlError);
        } else {
          bpiProofSignedUrl = signed?.signedUrl ?? null;
        }
      }
    }
  }
  const amountPaid = Number(order.amount_paid ?? 0);
  const balanceDue = Number(
    order.balance_due ?? Math.max(0, totalAmount - amountPaid),
  );
  const refundedAmount = Number(order.refunded_amount ?? 0);
  const netRevenue =
    order.payment_status === "COMPLETED"
      ? Math.max(0, totalAmount - refundedAmount)
      : 0;
  const remainingRefundable =
    order.payment_status === "COMPLETED"
      ? Math.max(0, totalAmount - refundedAmount)
      : 0;

  return (
    <main className="store-admin-dashboard">
      <div className="store-admin-dashboard-shell">
        <AdminNav active="orders" email={user.email} />

        <section className="store-admin-main">
          <div style={{ maxWidth: 1240, margin: "0 auto", paddingBottom: 36 }}>
            <header
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: 20,
                padding: "4px 0 18px",
                borderBottom: "1px solid #eadfe3",
              }}
            >
              <div style={{ minWidth: 0 }}>
                <span className="store-admin-eyebrow">ORDER MANAGEMENT</span>
                <h1
                  style={{
                    margin: "5px 0 5px",
                    color: "#261f22",
                    fontSize: "clamp(1.35rem, 2.3vw, 2rem)",
                    lineHeight: 1.05,
                    letterSpacing: "-.035em",
                  }}
                >
                  {order.order_number}
                </h1>
                <p
                  style={{
                    margin: 0,
                    color: "#817278",
                    fontSize: ".66rem",
                    lineHeight: 1.5,
                  }}
                >
                  {order.customer_name} · {order.customer_email} · Ordered{" "}
                  {formatDateTime(order.created_at)}
                </p>
              </div>

              <a
                href="/admin/orders"
                style={{
                  minHeight: 36,
                  padding: "0 12px",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  border: "1px solid #dfd2d7",
                  borderRadius: 9,
                  background: "#fff",
                  color: "#4b3e43",
                  fontSize: ".59rem",
                  fontWeight: 850,
                  textDecoration: "none",
                }}
              >
                ← All Orders
              </a>
            </header>

            {(query.amount_updated === "1" ||
              query.payment_requested === "1" ||
              query.cancelled === "1" ||
              query.refund_processed === "1" ||
              query.refund_recorded === "1" ||
              query.bpi_verified === "1" ||
              query.bpi_rejected === "1" ||
              query.manual_payment === "1" ||
              query.regular_price_updated === "1" ||
              query.order_status_updated === "1") && (
              <div
                style={{
                  marginTop: 12,
                  padding: "9px 11px",
                  border: "1px solid #ead9df",
                  borderRadius: 9,
                  background: "#fffafb",
                  color: "#74545f",
                  fontSize: ".59rem",
                  fontWeight: 750,
                  lineHeight: 1.5,
                }}
              >
                {query.order_status_updated === "1"
                  ? "Order progress updated successfully."
                  : query.regular_price_updated === "1"
                    ? "Regular order price updated and remaining balance recalculated."
                    : query.manual_payment === "1"
                    ? "Manual payment recorded and remaining balance updated."
                    : query.bpi_verified === "1"
                  ? "BPI transfer verified and payment marked as paid."
                  : query.bpi_rejected === "1"
                    ? "Proof rejected. The customer can submit a replacement proof."
                    : query.amount_updated === "1"
                      ? "Custom project amount updated and remaining balance recalculated."
                      : query.payment_requested === "1"
                        ? "Remaining balance payment has been activated."
                        : query.cancelled === "1"
                          ? "Order cancelled successfully."
                          : query.refund_processed === "1"
                            ? "Provider refund processed and recorded."
                            : "Refund recorded successfully."}
              </div>
            )}

            <section
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
                marginTop: 16,
                border: "1px solid #e8dde1",
                borderRadius: 12,
                background: "#fff",
                overflow: "hidden",
              }}
            >
              {[
                {
                  label: "TOTAL",
                  value: formatMoney(totalAmount),
                  sub: `${Number(order.processing_fee_percent ?? 0)}% fee included`,
                },
                {
                  label: "PAID",
                  value: formatMoney(amountPaid),
                  sub:
                    balanceDue > 0.005
                      ? `${formatMoney(balanceDue)} remaining`
                      : "No balance due",
                },
                {
                  label: "PAYMENT",
                  value: order.payment_status,
                  sub: order.payment_provider || "No provider",
                },
                {
                  label: "DELIVERY",
                  value: order.delivery_status,
                  sub: order.delivered_at
                    ? formatDateTime(order.delivered_at)
                    : "Not delivered yet",
                },
              ].map((item, index) => (
                <div
                  key={item.label}
                  style={{
                    padding: "13px 15px",
                    borderRight:
                      index < 3 ? "1px solid #eee4e8" : undefined,
                  }}
                >
                  <span
                    style={{
                      display: "block",
                      color: "#a38f97",
                      fontSize: ".49rem",
                      fontWeight: 900,
                      letterSpacing: ".09em",
                    }}
                  >
                    {item.label}
                  </span>
                  <strong
                    style={{
                      display: "block",
                      marginTop: 4,
                      color: "#2e2529",
                      fontSize: ".78rem",
                      lineHeight: 1.25,
                    }}
                  >
                    {item.value}
                  </strong>
                  <small
                    style={{
                      display: "block",
                      marginTop: 3,
                      color: "#8a7b81",
                      fontSize: ".52rem",
                    }}
                  >
                    {item.sub}
                  </small>
                </div>
              ))}
            </section>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(0, 1.55fr) minmax(300px, .75fr)",
                gap: 16,
                alignItems: "start",
                marginTop: 16,
              }}
            >
              <div style={{ display: "grid", gap: 16 }}>
                <section
                  style={{
                    border: "1px solid #e8dde1",
                    borderRadius: 12,
                    background: "#fff",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      padding: "12px 15px",
                      borderBottom: "1px solid #eee4e8",
                    }}
                  >
                    <span className="store-admin-eyebrow">ORDER DETAILS</span>
                    <h2
                      style={{
                        margin: "3px 0 0",
                        color: "#2e2529",
                        fontSize: ".9rem",
                      }}
                    >
                      Customer & purchase
                    </h2>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                    }}
                  >
                    <div
                      style={{
                        padding: 15,
                        borderRight: "1px solid #eee4e8",
                      }}
                    >
                      <span
                        style={{
                          color: "#a38f97",
                          fontSize: ".49rem",
                          fontWeight: 900,
                          letterSpacing: ".08em",
                        }}
                      >
                        CUSTOMER
                      </span>
                      <strong
                        style={{
                          display: "block",
                          marginTop: 6,
                          color: "#2e2529",
                          fontSize: ".72rem",
                        }}
                      >
                        {order.customer_name}
                      </strong>
                      <span
                        style={{
                          display: "block",
                          marginTop: 3,
                          color: "#786970",
                          fontSize: ".59rem",
                          overflowWrap: "anywhere",
                        }}
                      >
                        {order.customer_email}
                      </span>
                      {order.customer_id ? (
                        <span
                          style={{
                            display: "block",
                            marginTop: 8,
                            color: "#a08f96",
                            fontSize: ".49rem",
                          }}
                        >
                          Customer ID · {order.customer_id}
                        </span>
                      ) : null}
                    </div>

                    <div style={{ padding: 15 }}>
                      <span
                        style={{
                          color: "#a38f97",
                          fontSize: ".49rem",
                          fontWeight: 900,
                          letterSpacing: ".08em",
                        }}
                      >
                        PRODUCT
                      </span>
                      <strong
                        style={{
                          display: "block",
                          marginTop: 6,
                          color: "#2e2529",
                          fontSize: ".72rem",
                        }}
                      >
                        {order.product_name}
                      </strong>
                      {order.selected_design_name ? (
                        <span
                          style={{
                            display: "block",
                            marginTop: 3,
                            color: "#786970",
                            fontSize: ".59rem",
                          }}
                        >
                          Design · {order.selected_design_name}
                        </span>
                      ) : null}
                      {order.product_id ? (
                        <a
                          href={`/admin/products/${order.product_id}`}
                          style={{
                            display: "inline-flex",
                            marginTop: 8,
                            color: "#b64072",
                            fontSize: ".53rem",
                            fontWeight: 850,
                            textDecoration: "none",
                          }}
                        >
                          Open product →
                        </a>
                      ) : null}
                    </div>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                      borderTop: "1px solid #eee4e8",
                      background: "#fcfafb",
                    }}
                  >
                    <div style={{ padding: "11px 15px" }}>
                      <span style={{ color: "#99888f", fontSize: ".5rem" }}>
                        Base price
                      </span>
                      <strong
                        style={{
                          display: "block",
                          marginTop: 3,
                          fontSize: ".67rem",
                        }}
                      >
                        {formatMoney(Number(order.base_price ?? 0))}
                      </strong>
                    </div>
                    <div style={{ padding: "11px 15px" }}>
                      <span style={{ color: "#99888f", fontSize: ".5rem" }}>
                        Processing fee
                      </span>
                      <strong
                        style={{
                          display: "block",
                          marginTop: 3,
                          fontSize: ".67rem",
                        }}
                      >
                        {formatMoney(Number(order.processing_fee ?? 0))}
                      </strong>
                    </div>
                    <div style={{ padding: "11px 15px" }}>
                      <span style={{ color: "#99888f", fontSize: ".5rem" }}>
                        Order total
                      </span>
                      <strong
                        style={{
                          display: "block",
                          marginTop: 3,
                          color: "#b64072",
                          fontSize: ".7rem",
                        }}
                      >
                        {formatMoney(totalAmount)}
                      </strong>
                    </div>
                  </div>
                </section>

                {isCustomQuotationOrder &&
                order.order_status !== "CANCELLED" ? (
                  <section
                    style={{
                      border: "1px solid #e8dde1",
                      borderRadius: 12,
                      background: "#fff",
                      overflow: "hidden",
                    }}
                  >
                    <details>
                      <summary
                        style={{
                          minHeight: 45,
                          padding: "0 15px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          cursor: "pointer",
                          color: "#4a3b41",
                          fontSize: ".6rem",
                          fontWeight: 900,
                          listStyle: "none",
                        }}
                      >
                        <span>Custom project controls</span>
                        <span style={{ color: "#b64072" }}>Manage +</span>
                      </summary>

                      <div
                        style={{
                          padding: 15,
                          borderTop: "1px solid #eee4e8",
                          display: "grid",
                          gap: 16,
                        }}
                      >
                        <form
                          action={updateCustomProjectAmount}
                          style={{ display: "grid", gap: 9 }}
                        >
                          <strong style={{ fontSize: ".66rem" }}>
                            Update project amount
                          </strong>
                          <input type="hidden" name="order_id" value={order.id} />
                          <input
                            name="base_price"
                            type="number"
                            min="0.01"
                            step="0.01"
                            inputMode="decimal"
                            defaultValue={Number(order.base_price ?? 0).toFixed(2)}
                            required
                            style={{
                              minHeight: 38,
                              padding: "0 10px",
                              border: "1px solid #dfd2d7",
                              borderRadius: 8,
                              font: "inherit",
                              fontSize: ".62rem",
                            }}
                          />
                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns: "1fr 1fr",
                              gap: 8,
                            }}
                          >
                            <select
                              name="discount_type"
                              defaultValue="NONE"
                              style={{
                                minHeight: 38,
                                padding: "0 10px",
                                border: "1px solid #dfd2d7",
                                borderRadius: 8,
                                background: "#fff",
                                font: "inherit",
                                fontSize: ".6rem",
                              }}
                            >
                              <option value="NONE">No discount</option>
                              <option value="FIXED">Fixed ₱ discount</option>
                              <option value="PERCENT">Percentage discount</option>
                            </select>
                            <input
                              name="discount_value"
                              type="number"
                              min="0"
                              step="0.01"
                              inputMode="decimal"
                              placeholder="Discount value"
                              style={{
                                minHeight: 38,
                                padding: "0 10px",
                                border: "1px solid #dfd2d7",
                                borderRadius: 8,
                                font: "inherit",
                                fontSize: ".62rem",
                              }}
                            />
                          </div>
                          <small
                            style={{
                              color: "#918087",
                              fontSize: ".49rem",
                              lineHeight: 1.45,
                            }}
                          >
                            Enter the project amount before discount. The final subtotal, processing fee, total, paid amount, and remaining balance will be recalculated automatically.
                          </small>

                          <textarea
                            name="reason"
                            rows={2}
                            maxLength={1000}
                            placeholder="Reason for adjustment"
                            required
                            style={{
                              padding: 10,
                              border: "1px solid #dfd2d7",
                              borderRadius: 8,
                              font: "inherit",
                              fontSize: ".6rem",
                              resize: "vertical",
                            }}
                          />
                          <button
                            type="submit"
                            style={{
                              minHeight: 37,
                              border: 0,
                              borderRadius: 8,
                              background: "#3a3034",
                              color: "#fff",
                              font: "inherit",
                              fontSize: ".59rem",
                              fontWeight: 900,
                              cursor: "pointer",
                            }}
                          >
                            Update amount
                          </button>
                        </form>

                        {amountPaid > 0 && balanceDue > 0.005 ? (
                          <form
                            action={requestCustomProjectPayment}
                            style={{
                              paddingTop: 14,
                              borderTop: "1px solid #eee4e8",
                            }}
                          >
                            <input
                              type="hidden"
                              name="order_id"
                              value={order.id}
                            />
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                gap: 12,
                              }}
                            >
                              <div>
                                <span
                                  style={{
                                    display: "block",
                                    color: "#96858c",
                                    fontSize: ".5rem",
                                  }}
                                >
                                  REMAINING BALANCE
                                </span>
                                <strong
                                  style={{
                                    display: "block",
                                    marginTop: 3,
                                    fontSize: ".75rem",
                                  }}
                                >
                                  {formatMoney(balanceDue)}
                                </strong>
                              </div>
                              <button
                                type="submit"
                                style={{
                                  minHeight: 36,
                                  padding: "0 12px",
                                  border: "1px solid #d8bdc7",
                                  borderRadius: 8,
                                  background: "#fff8fa",
                                  color: "#a44267",
                                  font: "inherit",
                                  fontSize: ".56rem",
                                  fontWeight: 900,
                                  cursor: "pointer",
                                }}
                              >
                                Request payment
                              </button>
                            </div>
                          </form>
                        ) : null}
                      </div>
                    </details>
                  </section>
                ) : null}

                {!isCustomQuotationOrder &&
                order.order_status !== "CANCELLED" ? (
                  <section
                    style={{
                      border: "1px solid #e8dde1",
                      borderRadius: 12,
                      background: "#fff",
                      overflow: "hidden",
                    }}
                  >
                    <details>
                      <summary
                        style={{
                          minHeight: 45,
                          padding: "0 15px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          cursor: "pointer",
                          color: "#4a3b41",
                          fontSize: ".6rem",
                          fontWeight: 900,
                          listStyle: "none",
                        }}
                      >
                        <span>Regular order price controls</span>
                        <span style={{ color: "#b64072" }}>Manage +</span>
                      </summary>

                      <div
                        style={{
                          padding: 15,
                          borderTop: "1px solid #eee4e8",
                        }}
                      >
                        <form
                          action={updateRegularOrderAmount}
                          style={{ display: "grid", gap: 9 }}
                        >
                          <strong style={{ fontSize: ".66rem" }}>
                            Update order price
                          </strong>

                          <input
                            type="hidden"
                            name="order_id"
                            value={order.id}
                          />

                          <input
                            name="base_price"
                            type="number"
                            min="0.01"
                            step="0.01"
                            inputMode="decimal"
                            defaultValue={Number(order.base_price ?? 0).toFixed(2)}
                            required
                            style={{
                              minHeight: 38,
                              padding: "0 10px",
                              border: "1px solid #dfd2d7",
                              borderRadius: 8,
                              font: "inherit",
                              fontSize: ".62rem",
                            }}
                          />

                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns: "1fr 1fr",
                              gap: 8,
                            }}
                          >
                            <select
                              name="discount_type"
                              defaultValue="NONE"
                              style={{
                                minHeight: 38,
                                padding: "0 10px",
                                border: "1px solid #dfd2d7",
                                borderRadius: 8,
                                background: "#fff",
                                font: "inherit",
                                fontSize: ".6rem",
                              }}
                            >
                              <option value="NONE">No discount</option>
                              <option value="FIXED">Fixed ₱ discount</option>
                              <option value="PERCENT">% discount</option>
                            </select>

                            <input
                              name="discount_value"
                              type="number"
                              min="0"
                              step="0.01"
                              inputMode="decimal"
                              placeholder="Discount value"
                              style={{
                                minHeight: 38,
                                padding: "0 10px",
                                border: "1px solid #dfd2d7",
                                borderRadius: 8,
                                font: "inherit",
                                fontSize: ".6rem",
                              }}
                            />
                          </div>

                          <small
                            style={{
                              color: "#918087",
                              fontSize: ".49rem",
                              lineHeight: 1.45,
                            }}
                          >
                            Enter the price before discount. The existing
                            processing-fee percentage is preserved, completed
                            payments stay credited, and the remaining balance is
                            recalculated automatically.
                          </small>

                          <textarea
                            name="reason"
                            rows={2}
                            maxLength={1000}
                            placeholder="Reason for price adjustment"
                            required
                            style={{
                              padding: 10,
                              border: "1px solid #dfd2d7",
                              borderRadius: 8,
                              font: "inherit",
                              fontSize: ".6rem",
                              resize: "vertical",
                            }}
                          />

                          <button
                            type="submit"
                            style={{
                              minHeight: 37,
                              border: 0,
                              borderRadius: 8,
                              background: "#3a3034",
                              color: "#fff",
                              font: "inherit",
                              fontSize: ".59rem",
                              fontWeight: 900,
                              cursor: "pointer",
                            }}
                          >
                            Update price
                          </button>
                        </form>
                      </div>
                    </details>
                  </section>
                ) : null}

                <DigitalAccessPanel
                  orderId={order.id}
                  orderNumber={order.order_number}
                  productId={order.product_id}
                  paymentStatus={order.payment_status}
                  orderStatus={order.order_status}
                  paidAt={order.paid_at}
                  createdAt={order.created_at}
                  accessExpiresAt={order.download_access_expires_at}
                  isCustomProject={isCustomQuotationOrder}
                />

                <section
                  style={{
                    border: "1px solid #e8dde1",
                    borderRadius: 12,
                    background: "#fff",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      padding: "12px 15px",
                      borderBottom: "1px solid #eee4e8",
                    }}
                  >
                    <span className="store-admin-eyebrow">FULFILLMENT</span>
                    <h2
                      style={{
                        margin: "3px 0 0",
                        fontSize: ".82rem",
                        color: "#2e2529",
                      }}
                    >
                      Delivery requests
                    </h2>
                  </div>
                  <div style={{ padding: 15 }}>
                    {deliveries.length ? (
                      <div style={{ display: "grid", gap: 8 }}>
                        {deliveries.map((delivery) => (
                          <article
                            key={delivery.id}
                            style={{
                              padding: 11,
                              border: "1px solid #eee4e8",
                              borderRadius: 9,
                              background: "#fcfafb",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                gap: 10,
                              }}
                            >
                              <strong style={{ fontSize: ".61rem" }}>
                                {delivery.delivery_type}
                              </strong>
                              <span
                                style={{
                                  color: "#9a6b7c",
                                  fontSize: ".5rem",
                                  fontWeight: 850,
                                }}
                              >
                                {delivery.status}
                              </span>
                            </div>
                            <small
                              style={{
                                display: "block",
                                marginTop: 3,
                                color: "#93838a",
                                fontSize: ".5rem",
                              }}
                            >
                              {formatDateTime(
                                delivery.requested_at || delivery.created_at,
                              )}
                            </small>
                            {delivery.github_username ? (
                              <p
                                style={{
                                  margin: "7px 0 0",
                                  fontSize: ".56rem",
                                }}
                              >
                                GitHub: {delivery.github_username}
                              </p>
                            ) : null}
                            {delivery.customer_message ? (
                              <p
                                style={{
                                  margin: "5px 0 0",
                                  fontSize: ".56rem",
                                  color: "#74666c",
                                }}
                              >
                                {delivery.customer_message}
                              </p>
                            ) : null}
                          </article>
                        ))}
                      </div>
                    ) : (
                      <p
                        style={{
                          margin: 0,
                          color: "#8d7e84",
                          fontSize: ".58rem",
                        }}
                      >
                        No manual delivery request for this order.
                      </p>
                    )}
                  </div>
                </section>
              </div>

              <aside style={{ display: "grid", gap: 16 }}>
                <section
                  style={{
                    border: "1px solid #e8dde1",
                    borderRadius: 12,
                    background: "#fff",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      padding: "12px 14px",
                      borderBottom: "1px solid #eee4e8",
                    }}
                  >
                    <span className="store-admin-eyebrow">ORDER PROGRESS</span>
                    <h2
                      style={{
                        margin: "3px 0 0",
                        color: "#2e2529",
                        fontSize: ".78rem",
                      }}
                    >
                      Fulfillment status
                    </h2>
                  </div>

                  <div style={{ padding: 14 }}>
                    {order.order_status !== "CANCELLED" ? (
                      <form
                        action={updateOrderStatus}
                        style={{ display: "grid", gap: 9 }}
                      >
                        <input type="hidden" name="order_id" value={order.id} />

                        <label
                          style={{
                            display: "grid",
                            gap: 5,
                            color: "#75666c",
                            fontSize: ".51rem",
                            fontWeight: 800,
                          }}
                        >
                          Current stage
                          <select
                            name="order_status"
                            defaultValue={order.order_status || "PENDING"}
                            style={{
                              minHeight: 38,
                              padding: "0 10px",
                              border: "1px solid #dfd2d7",
                              borderRadius: 8,
                              background: "#fff",
                              color: "#4b3e43",
                              font: "inherit",
                              fontSize: ".59rem",
                            }}
                          >
                            <option value="PENDING">Pending</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="READY_FOR_DELIVERY">
                              Ready for Delivery
                            </option>
                            <option value="COMPLETED">Completed</option>
                          </select>
                        </label>

                        <button
                          type="submit"
                          style={{
                            minHeight: 36,
                            border: 0,
                            borderRadius: 8,
                            background: "#3a3034",
                            color: "#fff",
                            font: "inherit",
                            fontSize: ".56rem",
                            fontWeight: 900,
                            cursor: "pointer",
                          }}
                        >
                          Update progress
                        </button>

                        <p
                          style={{
                            margin: 0,
                            color: "#96858c",
                            fontSize: ".49rem",
                            lineHeight: 1.5,
                          }}
                        >
                          Tracks project fulfillment only. Payment status and
                          payment history are not changed.
                        </p>
                      </form>
                    ) : (
                      <div
                        style={{
                          padding: "9px 10px",
                          border: "1px solid #ecd9dd",
                          borderRadius: 8,
                          background: "#fff8f9",
                          color: "#8c5963",
                          fontSize: ".54rem",
                          lineHeight: 1.5,
                        }}
                      >
                        This order is cancelled. Its fulfillment status can no
                        longer be changed.
                      </div>
                    )}
                  </div>
                </section>
                {isBpiDirectOrder ? (
                  <BpiTransferVerificationPanel
                    orderId={order.id}
                    proof={bpiProof}
                    signedUrl={bpiProofSignedUrl}
                  />
                ) : null}

                    <section
                      style={{
                    border: "1px solid #e8dde1",
                    borderRadius: 12,
                    background: "#fff",
                    overflow: "hidden",
                  }}
                >
                  <details>
                    <summary
                      style={{
                        minHeight: 47,
                        padding: "0 15px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        cursor: "pointer",
                        listStyle: "none",
                        color: "#4b3e43",
                        fontSize: ".59rem",
                        fontWeight: 900,
                      }}
                    >
                      <span>Order management</span>
                      <span style={{ color: "#9c8991", fontWeight: 700 }}>
                        Manual · Refund · Cancel · Delete +
                      </span>
                    </summary>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr",
                        gap: 10,
                        padding: 14,
                        borderTop: "1px solid #eee4e8",
                        background: "#fcfafb",
                      }}
                    >
                      {order.payment_status !== "COMPLETED" &&
                      order.order_status !== "CANCELLED" ? (
                        <details
                          style={{
                            border: "1px solid #e5d9dd",
                            borderRadius: 9,
                            background: "#fff",
                          }}
                        >
                          <summary
                            style={{
                              minHeight: 38,
                              padding: "0 11px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              cursor: "pointer",
                              listStyle: "none",
                              color: "#65545b",
                              fontSize: ".56rem",
                              fontWeight: 850,
                            }}
                          >
                            <span>Emergency manual payment</span>
                            <span style={{ color: "#b64072" }}>+</span>
                          </summary>

                          <form
                            action={recordManualPayment}
                            style={{
                              display: "grid",
                              gap: 8,
                              padding: 11,
                              borderTop: "1px solid #eee4e8",
                            }}
                          >
                            <input
                              type="hidden"
                              name="order_id"
                              value={order.id}
                            />

                            <label
                              style={{
                                display: "grid",
                                gap: 4,
                                color: "#75666c",
                                fontSize: ".51rem",
                                fontWeight: 800,
                              }}
                            >
                              Amount received
                              <input
                                name="manual_amount"
                                type="number"
                                min="0.01"
                                max={Math.max(0, balanceDue).toFixed(2)}
                                step="0.01"
                                defaultValue={Math.max(0, balanceDue).toFixed(2)}
                                required
                                style={{
                                  minHeight: 34,
                                  padding: "0 8px",
                                  border: "1px solid #dfd2d7",
                                  borderRadius: 7,
                                  font: "inherit",
                                  fontSize: ".56rem",
                                }}
                              />
                            </label>

                            <input
                              name="manual_method"
                              placeholder="Method, e.g. cash / bank transfer"
                              maxLength={100}
                              required
                              style={{
                                minHeight: 34,
                                padding: "0 8px",
                                border: "1px solid #dfd2d7",
                                borderRadius: 7,
                                font: "inherit",
                                fontSize: ".55rem",
                              }}
                            />

                            <input
                              name="manual_reference"
                              placeholder="Reference (optional)"
                              maxLength={250}
                              style={{
                                minHeight: 34,
                                padding: "0 8px",
                                border: "1px solid #dfd2d7",
                                borderRadius: 7,
                                font: "inherit",
                                fontSize: ".55rem",
                              }}
                            />

                            <textarea
                              name="manual_reason"
                              rows={2}
                              maxLength={1000}
                              placeholder="Required reason for manual recording"
                              required
                              style={{
                                padding: 8,
                                border: "1px solid #dfd2d7",
                                borderRadius: 7,
                                font: "inherit",
                                fontSize: ".55rem",
                                resize: "vertical",
                              }}
                            />

                            <button
                              type="submit"
                              style={{
                                minHeight: 34,
                                border: "1px solid #d8c8ce",
                                borderRadius: 7,
                                background: "#332a2e",
                                color: "#fff",
                                font: "inherit",
                                fontSize: ".54rem",
                                fontWeight: 900,
                                cursor: "pointer",
                              }}
                            >
                              Record manual payment
                            </button>

                            <p
                              style={{
                                margin: 0,
                                color: "#9a8990",
                                fontSize: ".48rem",
                                lineHeight: 1.5,
                              }}
                            >
                              Admin-only emergency override. This records a real
                              completed payment entry and updates the remaining
                              balance.
                            </p>
                          </form>
                        </details>
                      ) : null}

                      <details
                        style={{
                          border: "1px solid #e5d9dd",
                          borderRadius: 9,
                          background: "#fff",
                        }}
                      >
                        <summary
                          style={{
                            minHeight: 38,
                            padding: "0 11px",
                            display: "flex",
                            alignItems: "center",
                            cursor:
                              order.payment_status === "COMPLETED"
                                ? "pointer"
                                : "default",
                            listStyle: "none",
                            color: "#65545b",
                            fontSize: ".56rem",
                            fontWeight: 850,
                          }}
                        >
                          Refund
                        </summary>
                        {order.payment_status === "COMPLETED" &&
                        order.refund_status !== "REFUNDED" ? (
                          <div
                            style={{
                              padding: 11,
                              borderTop: "1px solid #eee4e8",
                            }}
                          >
                            <p
                              style={{
                                margin: "0 0 8px",
                                color: "#85757c",
                                fontSize: ".53rem",
                                lineHeight: 1.5,
                              }}
                            >
                              Refundable: {formatMoney(remainingRefundable)}
                            </p>
                            {(order.payment_provider === "PAYPAL" &&
                              order.paypal_capture_id) ||
                            (order.payment_provider === "PAYMONGO" &&
                              order.paymongo_payment_id) ? (
                              <form
                                action={processProviderRefund}
                                style={{ display: "grid", gap: 7 }}
                              >
                                <input
                                  type="hidden"
                                  name="order_id"
                                  value={order.id}
                                />
                                <input
                                  name="refund_amount"
                                  type="number"
                                  min="0.01"
                                  max={remainingRefundable.toFixed(2)}
                                  step="0.01"
                                  defaultValue={remainingRefundable.toFixed(2)}
                                  required
                                  style={{
                                    minHeight: 34,
                                    padding: "0 8px",
                                    border: "1px solid #dfd2d7",
                                    borderRadius: 7,
                                    font: "inherit",
                                    fontSize: ".56rem",
                                  }}
                                />
                                <textarea
                                  name="refund_reason"
                                  rows={2}
                                  maxLength={255}
                                  placeholder="Reason"
                                  required
                                  style={{
                                    padding: 8,
                                    border: "1px solid #dfd2d7",
                                    borderRadius: 7,
                                    font: "inherit",
                                    fontSize: ".55rem",
                                  }}
                                />
                                <button
                                  type="submit"
                                  style={{
                                    minHeight: 34,
                                    border: 0,
                                    borderRadius: 7,
                                    background: "#3b3034",
                                    color: "#fff",
                                    font: "inherit",
                                    fontSize: ".54rem",
                                    fontWeight: 900,
                                  }}
                                >
                                  Process refund
                                </button>
                              </form>
                            ) : (
                              <form
                                action={recordExternalRefund}
                                style={{ display: "grid", gap: 7 }}
                              >
                                <input
                                  type="hidden"
                                  name="order_id"
                                  value={order.id}
                                />
                                <input
                                  name="refund_amount"
                                  type="number"
                                  min="0.01"
                                  max={remainingRefundable.toFixed(2)}
                                  step="0.01"
                                  defaultValue={remainingRefundable.toFixed(2)}
                                  required
                                  style={{
                                    minHeight: 34,
                                    padding: "0 8px",
                                    border: "1px solid #dfd2d7",
                                    borderRadius: 7,
                                    font: "inherit",
                                    fontSize: ".56rem",
                                  }}
                                />
                                <textarea
                                  name="refund_reason"
                                  rows={2}
                                  maxLength={1000}
                                  placeholder="Reason / reference"
                                  required
                                  style={{
                                    padding: 8,
                                    border: "1px solid #dfd2d7",
                                    borderRadius: 7,
                                    font: "inherit",
                                    fontSize: ".55rem",
                                  }}
                                />
                                <button
                                  type="submit"
                                  style={{
                                    minHeight: 34,
                                    border: 0,
                                    borderRadius: 7,
                                    background: "#3b3034",
                                    color: "#fff",
                                    font: "inherit",
                                    fontSize: ".54rem",
                                    fontWeight: 900,
                                  }}
                                >
                                  Record refund
                                </button>
                              </form>
                            )}
                          </div>
                        ) : null}
                      </details>

                      <details
                        style={{
                          border: "1px solid #e5d9dd",
                          borderRadius: 9,
                          background: "#fff",
                        }}
                      >
                        <summary
                          style={{
                            minHeight: 38,
                            padding: "0 11px",
                            display: "flex",
                            alignItems: "center",
                            cursor: "pointer",
                            listStyle: "none",
                            color: "#8c4d59",
                            fontSize: ".56rem",
                            fontWeight: 850,
                          }}
                        >
                          Cancel order
                        </summary>
                        {order.order_status !== "CANCELLED" ? (
                          <form
                            action={cancelOrder}
                            style={{
                              display: "grid",
                              gap: 7,
                              padding: 11,
                              borderTop: "1px solid #eee4e8",
                            }}
                          >
                            <input
                              type="hidden"
                              name="order_id"
                              value={order.id}
                            />
                            <textarea
                              name="reason"
                              rows={2}
                              maxLength={1000}
                              required
                              placeholder="Cancellation reason"
                              style={{
                                padding: 8,
                                border: "1px solid #e1cfd3",
                                borderRadius: 7,
                                font: "inherit",
                                fontSize: ".55rem",
                              }}
                            />
                            <button
                              type="submit"
                              style={{
                                minHeight: 34,
                                border: "1px solid #e0bfc6",
                                borderRadius: 7,
                                background: "#fff7f8",
                                color: "#954a59",
                                font: "inherit",
                                fontSize: ".54rem",
                                fontWeight: 900,
                              }}
                            >
                              Confirm cancellation
                            </button>
                          </form>
                        ) : null}
                      </details>

                      <details
                        style={{
                          border: "1px solid #e5d9dd",
                          borderRadius: 9,
                          background: "#fff",
                        }}
                      >
                        <summary
                          style={{
                            minHeight: 38,
                            padding: "0 11px",
                            display: "flex",
                            alignItems: "center",
                            cursor: "pointer",
                            listStyle: "none",
                            color: "#9b4545",
                            fontSize: ".56rem",
                            fontWeight: 850,
                          }}
                        >
                          Delete order
                        </summary>
                        <form
                          action={deleteOrder}
                          style={{
                            display: "grid",
                            gap: 7,
                            padding: 11,
                            borderTop: "1px solid #eee4e8",
                          }}
                        >
                          <input
                            type="hidden"
                            name="order_id"
                            value={order.id}
                          />
                          <input
                            name="confirmation"
                            placeholder="Type DELETE"
                            autoComplete="off"
                            required
                            pattern="DELETE"
                            title="Type DELETE exactly to continue."
                            style={{
                              minHeight: 34,
                              padding: "0 8px",
                              border: "1px solid #e1caca",
                              borderRadius: 7,
                              font: "inherit",
                              fontSize: ".55rem",
                            }}
                          />
                          <button
                            type="submit"
                            style={{
                              minHeight: 34,
                              border: "1px solid #dcbcbc",
                              borderRadius: 7,
                              background: "#fff6f6",
                              color: "#9b4545",
                              font: "inherit",
                              fontSize: ".54rem",
                              fontWeight: 900,
                            }}
                          >
                            Delete permanently
                          </button>
                        </form>
                      </details>
                    </div>
                  </details>
                </section>

                {isCustomQuotationOrder &&
                order.payment_status !== "COMPLETED" &&
                order.order_status !== "CANCELLED" ? (
                  <section
                    style={{
                      border: "1px solid #e8dde1",
                      borderRadius: 12,
                      background: "#fff",
                      overflow: "hidden",
                    }}
                  >
                    <div style={{ padding: "12px 14px" }}>
                      <span className="store-admin-eyebrow">
                        PRIVATE CHECKOUT
                      </span>
                      <h2
                        style={{
                          margin: "3px 0 7px",
                          color: "#2e2529",
                          fontSize: ".78rem",
                        }}
                      >
                        Customer payment link
                      </h2>
                      <code
                        style={{
                          display: "block",
                          padding: "8px 9px",
                          borderRadius: 7,
                          background: "#f8f5f6",
                          color: "#75656b",
                          fontSize: ".51rem",
                          overflowWrap: "anywhere",
                        }}
                      >
                        /checkout/custom/{order.receipt_token}
                      </code>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: 7,
                          marginTop: 8,
                        }}
                      >
                        <CopyPaymentLinkButton
                          path={`/checkout/custom/${order.receipt_token}`}
                        />
                        <a
                          href={`/checkout/custom/${order.receipt_token}`}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            height: 36,
                            marginTop: 0,
                            marginBottom: 0,
                            padding: "0 12px",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            alignSelf: "start",
                            borderRadius: 8,
                            background: "#332a2e",
                            color: "#fff",
                            fontSize: ".55rem",
                            fontWeight: 900,
                            lineHeight: 1,
                            textDecoration: "none",
                          }}
                        >
                          Open →
                        </a>
                      </div>
                    </div>
                  </section>
                ) : null}

                <section
                  style={{
                    border: "1px solid #e8dde1",
                    borderRadius: 12,
                    background: "#fff",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      padding: "12px 14px",
                      borderBottom: "1px solid #eee4e8",
                    }}
                  >
                    <span className="store-admin-eyebrow">INTERNAL ACTIVITY</span>
                    <h2
                      style={{
                        margin: "3px 0 0",
                        color: "#2e2529",
                        fontSize: ".78rem",
                      }}
                    >
                      Notes
                    </h2>
                  </div>
                  <div style={{ padding: 14 }}>
                    <form
                      action={addOrderNote}
                      style={{ display: "grid", gap: 7 }}
                    >
                      <input type="hidden" name="order_id" value={order.id} />
                      <textarea
                        name="note"
                        rows={2}
                        placeholder="Add an internal note..."
                        required
                        style={{
                          minHeight: 62,
                          padding: 9,
                          border: "1px solid #dfd2d7",
                          borderRadius: 8,
                          font: "inherit",
                          fontSize: ".58rem",
                          resize: "vertical",
                        }}
                      />
                      <button
                        type="submit"
                        style={{
                          minHeight: 34,
                          border: "1px solid #d8c8ce",
                          borderRadius: 8,
                          background: "#fff",
                          color: "#4b3e43",
                          font: "inherit",
                          fontSize: ".55rem",
                          fontWeight: 900,
                          cursor: "pointer",
                        }}
                      >
                        Add note
                      </button>
                    </form>

                    {noteEntries.length ? (
                      <div
                        style={{
                          display: "grid",
                          gap: 8,
                          maxHeight: 240,
                          overflowY: "auto",
                          marginTop: 12,
                          paddingTop: 12,
                          borderTop: "1px solid #eee4e8",
                        }}
                      >
                        {noteEntries.map((entry) => (
                          <article
                            key={entry.id}
                            style={{
                              paddingLeft: 9,
                              borderLeft: "2px solid #e9cbd6",
                            }}
                          >
                            <p
                              style={{
                                margin: 0,
                                color: "#594b50",
                                fontSize: ".56rem",
                                lineHeight: 1.5,
                              }}
                            >
                              {entry.note}
                            </p>
                            <small
                              style={{
                                display: "block",
                                marginTop: 4,
                                color: "#a08f96",
                                fontSize: ".47rem",
                              }}
                            >
                              {entry.created_by || "Admin"} ·{" "}
                              {formatDateTime(entry.created_at)}
                            </small>
                          </article>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </section>

                <details
                  style={{
                    border: "1px solid #e8dde1",
                    borderRadius: 12,
                    background: "#fff",
                    overflow: "hidden",
                  }}
                >
                  <summary
                    style={{
                      minHeight: 44,
                      padding: "0 14px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      cursor: "pointer",
                      listStyle: "none",
                      color: "#4b3e43",
                      fontSize: ".58rem",
                      fontWeight: 900,
                    }}
                  >
                    <span>Transaction & system details</span>
                    <span style={{ color: "#b64072" }}>+</span>
                  </summary>
                  <div
                    style={{
                      padding: "12px 14px",
                      borderTop: "1px solid #eee4e8",
                      display: "grid",
                      gap: 8,
                      color: "#75666c",
                      fontSize: ".53rem",
                    }}
                  >
                    <div>
                      <strong>Provider:</strong>{" "}
                      {order.payment_provider || "—"}
                    </div>
                    <div>
                      <strong>PayPal Order:</strong>{" "}
                      <code>{order.paypal_order_id || "—"}</code>
                    </div>
                    <div>
                      <strong>PayPal Capture:</strong>{" "}
                      <code>{order.paypal_capture_id || "—"}</code>
                    </div>
                    <div>
                      <strong>PayMongo Session:</strong>{" "}
                      <code>{order.paymongo_checkout_session_id || "—"}</code>
                    </div>
                    <div>
                      <strong>PayMongo Payment:</strong>{" "}
                      <code>{order.paymongo_payment_id || "—"}</code>
                    </div>
                    <div>
                      <strong>Receipt token:</strong>{" "}
                      <code style={{ overflowWrap: "anywhere" }}>
                        {order.receipt_token}
                      </code>
                    </div>
                    <div>
                      <strong>Paid at:</strong> {formatDateTime(order.paid_at)}
                    </div>
                    <div>
                      <strong>Last updated:</strong>{" "}
                      {formatDateTime(order.updated_at)}
                    </div>
                  </div>
                </details>

                {refunds.length ? (
                  <details
                    style={{
                      border: "1px solid #e8dde1",
                      borderRadius: 12,
                      background: "#fff",
                      overflow: "hidden",
                    }}
                  >
                    <summary
                      style={{
                        minHeight: 44,
                        padding: "0 14px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        cursor: "pointer",
                        listStyle: "none",
                        color: "#4b3e43",
                        fontSize: ".58rem",
                        fontWeight: 900,
                      }}
                    >
                      <span>Refund history ({refunds.length})</span>
                      <span style={{ color: "#b64072" }}>+</span>
                    </summary>
                    <div
                      style={{
                        padding: 12,
                        borderTop: "1px solid #eee4e8",
                        display: "grid",
                        gap: 8,
                      }}
                    >
                      {refunds.map((refund) => (
                        <div
                          key={refund.id}
                          style={{
                            padding: 9,
                            border: "1px solid #eee4e8",
                            borderRadius: 8,
                            fontSize: ".53rem",
                          }}
                        >
                          <strong>
                            {formatMoney(Number(refund.amount ?? 0))}
                          </strong>{" "}
                          · {refund.provider} · {refund.provider_status}
                          <div
                            style={{
                              marginTop: 3,
                              color: "#8d7e84",
                            }}
                          >
                            {refund.reason}
                          </div>
                        </div>
                      ))}
                    </div>
                  </details>
                ) : null}
              </aside>
            </div>


          </div>
        </section>
      </div>
    </main>
  );
}
