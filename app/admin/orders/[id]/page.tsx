import { notFound, redirect } from "next/navigation";
import { createAdminSupabaseClient } from "@/lib/supabase-admin";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import AdminNav from "@/app/admin/AdminNav";
import styles from "./order.module.css";
import { addOrderNote, cancelOrder, deleteOrder, processProviderRefund, recordExternalRefund } from "./actions";
import CopyPaymentLinkButton from "./CopyPaymentLinkButton";

type OrderDetailsPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    checkout_created?: string;
    cancelled?: string;
    refund_recorded?: string;
    refund_processed?: string;
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
  if (status === "PENDING") return styles.pending;
  if (status === "FAILED" || status === "CANCELLED") {
    return styles.failed;
  }
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

  if (!user) {
    redirect("/admin/login");
  }

  const { id } = await params;
  const query = await searchParams;
  const adminSupabase = createAdminSupabaseClient();

  const { data: order, error } = await adminSupabase
    .from("orders")
    .select(
      "id,order_number,customer_id,customer_name,customer_email,product_id,product_name,base_price,processing_fee_percent,processing_fee,total_amount,currency,payment_provider,payment_status,order_status,cancellation_reason,cancelled_at,refund_status,refunded_amount,refunded_at,refund_note,paypal_order_id,paypal_capture_id,paymongo_checkout_session_id,paymongo_payment_id,delivery_status,notes,paid_at,delivered_at,created_at,updated_at,receipt_token",
    )
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("Admin order details load error:", error);
  }

  if (!order) {
    notFound();
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

  if (deliveryResult.error) {
    console.error(
      "Admin order delivery requests load error:",
      deliveryResult.error,
    );
  }

  if (notesResult.error) {
    console.error("Admin order notes load error:", notesResult.error);
  }

  if (refundsResult.error) {
    console.error("Admin order refund history load error:", refundsResult.error);
  }

  const deliveries = deliveryResult.data ?? [];
  const noteEntries = notesResult.data ?? [];
  const refunds = refundsResult.data ?? [];

  const totalAmount = Number(order.total_amount ?? 0);
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
          <header className={styles.topbar}>
            <div>
              <span className="store-admin-eyebrow">
                ORDER DETAILS
              </span>

              <h1>{order.order_number}</h1>

              <p>
                Full payment and delivery information for this
                transaction.
              </p>
            </div>

            <div className={styles.orderHeaderActions}>
              <a className={styles.backButton} href="/admin/orders">
                ← Back to Orders
              </a>
            </div>
          </header>

          {query.cancelled === "1" ? (
            <div
              style={{
                marginBottom: "14px",
                padding: "10px 12px",
                border: "1px solid #efcdd5",
                borderRadius: "10px",
                background: "#fff3f5",
                color: "#8d4051",
                fontSize: "0.68rem",
                fontWeight: 750,
              }}
            >
              Order cancelled successfully. The cancellation reason was added to the activity log.
            </div>
          ) : null}

          {query.refund_processed === "1" ? (
            <div
              style={{
                marginBottom: "14px",
                padding: "10px 12px",
                border: "1px solid #ead5de",
                borderRadius: "10px",
                background: "#fff8fa",
                color: "#8b4d63",
                fontSize: "0.68rem",
                fontWeight: 750,
              }}
            >
              Refund successfully processed through the original payment provider and recorded in TCL.
              <div style={{ marginTop: "6px", fontWeight: 600, lineHeight: 1.55 }}>
                {order.payment_provider === "PAYPAL" ? (
                  <>
                    Estimated posting time: PayPal balance refunds can appear the same day.
                    Debit card or bank refunds usually take up to 5 business days, while
                    credit card refunds may take 1–2 billing cycles depending on the card issuer.
                  </>
                ) : order.payment_provider === "PAYMONGO" ? (
                  <>
                    Estimated posting time: PayMongo e-wallet refunds such as GCash,
                    GrabPay, Maya, ShopeePay, and BillEase generally reflect within 24 hours.
                    Online banking refunds may take about 3–5 banking days, while card
                    refunds can take up to 30 days depending on the issuing bank.
                  </>
                ) : (
                  <>
                    Refund posting time depends on the original payment method and the
                    customer&apos;s bank, card issuer, or e-wallet provider.
                  </>
                )}
              </div>
            </div>
          ) : null}

          {query.refund_recorded === "1" ? (
            <div
              style={{
                marginBottom: "14px",
                padding: "10px 12px",
                border: "1px solid #ead5de",
                borderRadius: "10px",
                background: "#fff8fa",
                color: "#8b4d63",
                fontSize: "0.68rem",
                fontWeight: 750,
              }}
            >
              Refund recorded successfully. Dashboard and customer revenue now use the updated net amount.
            </div>
          ) : null}

          <section className={styles.summaryGrid}>
            <article>
              <span>PAYMENT</span>
              <strong
                className={`${styles.statusPill} ${statusClass(
                  order.payment_status,
                )}`}
              >
                {order.payment_status}
              </strong>
              <small>{order.payment_provider || "No provider"}</small>
            </article>

            <article>
              <span>AMOUNT PAID</span>
              <strong>
                {formatMoney(Number(order.total_amount ?? 0))}
              </strong>
              <small>
                {order.refund_status === "REFUNDED"
                  ? `Fully refunded • ${order.currency || "PHP"}`
                  : order.refund_status === "PARTIALLY_REFUNDED"
                    ? `${formatMoney(refundedAmount)} refunded`
                    : order.currency || "PHP"}
              </small>
            </article>

            <article>
              <span>DELIVERY</span>
              <strong className={styles.deliveryValue}>
                {order.delivery_status}
              </strong>
              <small>
                {order.delivered_at
                  ? formatDateTime(order.delivered_at)
                  : "Not delivered yet"}
              </small>
            </article>

            <article>
              <span>ORDER DATE</span>
              <strong className={styles.dateValue}>
                {formatDateTime(order.created_at)}
              </strong>
              <small>
                Updated {formatDateTime(order.updated_at)}
              </small>
            </article>
          </section>

          <nav
            aria-label="Order quick links"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "7px",
              flexWrap: "wrap",
              margin: "10px 0 18px",
            }}
          >
            <span
              style={{
                marginRight: "2px",
                color: "var(--text-light)",
                fontSize: "0.52rem",
                fontWeight: 900,
                letterSpacing: "0.08em",
              }}
            >
              QUICK LINKS
            </span>

            <a
              href="/admin/orders"
              style={{
                display: "inline-flex",
                alignItems: "center",
                minHeight: "31px",
                padding: "0 10px",
                border: "1px solid var(--border)",
                borderRadius: "9px",
                background: "#fff",
                color: "var(--text-soft)",
                fontSize: "0.56rem",
                fontWeight: 850,
                textDecoration: "none",
              }}
            >
              All Orders
            </a>

            {order.product_id ? (
              <a
                href={`/admin/products/${order.product_id}`}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  minHeight: "31px",
                  padding: "0 10px",
                  border: "1px solid var(--border)",
                  borderRadius: "9px",
                  background: "#fff",
                  color: "var(--text-soft)",
                  fontSize: "0.56rem",
                  fontWeight: 850,
                  textDecoration: "none",
                }}
              >
                Open Product
              </a>
            ) : null}

            <a
              href="/admin/deliveries"
              style={{
                display: "inline-flex",
                alignItems: "center",
                minHeight: "31px",
                padding: "0 10px",
                border: "1px solid var(--border)",
                borderRadius: "9px",
                background: "#fff",
                color: "var(--text-soft)",
                fontSize: "0.56rem",
                fontWeight: 850,
                textDecoration: "none",
              }}
            >
              Deliveries
            </a>


          </nav>

          <section className={styles.orderActionsSection}>
            <div className={styles.orderActionsHeading}>
              <span>ORDER ACTIONS</span>
              <p>Tap an action to expand it. Tap it again to collapse.</p>
            </div>

            <div className={styles.orderActionsGrid}>
              {order.payment_status === "COMPLETED" &&
              order.refund_status !== "REFUNDED" ? (
                <details className={styles.orderAction}>
                  <summary className={`${styles.orderActionTrigger} ${styles.refundTrigger}`}>
                    <span>Refund</span>
                    <span className={styles.actionChevron} aria-hidden="true" />
                  </summary>

                  <div className={styles.orderActionPanel}>
                    <span className={styles.actionEyebrow}>REFUND PAYMENT</span>
                    <h3>
                      {(order.payment_provider === "PAYPAL" && order.paypal_capture_id) ||
                      (order.payment_provider === "PAYMONGO" && order.paymongo_payment_id)
                        ? `Refund through ${
                            order.payment_provider === "PAYPAL" ? "PayPal" : "PayMongo"
                          }`
                        : "Record a refund"}
                    </h3>

                    <p>
                      {(order.payment_provider === "PAYPAL" && order.paypal_capture_id) ||
                      (order.payment_provider === "PAYMONGO" && order.paymongo_payment_id)
                        ? `TCL will send the refund through ${
                            order.payment_provider === "PAYPAL" ? "PayPal" : "PayMongo"
                          } using the original payment transaction.`
                        : "No supported provider transaction reference is attached to this order. You can still record an external/manual refund."}
                    </p>

                    <div className={styles.refundAmounts}>
                      <div>
                        <span>Paid</span>
                        <strong>{formatMoney(totalAmount)}</strong>
                      </div>
                      <div>
                        <span>Refunded</span>
                        <strong>{formatMoney(refundedAmount)}</strong>
                      </div>
                      <div>
                        <span>Available</span>
                        <strong>{formatMoney(remainingRefundable)}</strong>
                      </div>
                    </div>

                    {(order.payment_provider === "PAYPAL" && order.paypal_capture_id) ||
                    (order.payment_provider === "PAYMONGO" && order.paymongo_payment_id) ? (
                      <form action={processProviderRefund} className={styles.actionForm}>
                        <input type="hidden" name="order_id" value={order.id} />

                        <label htmlFor={`provider-refund-amount-${order.id}`}>
                          Refund amount
                        </label>
                        <input
                          id={`provider-refund-amount-${order.id}`}
                          name="refund_amount"
                          type="number"
                          min="0.01"
                          max={remainingRefundable.toFixed(2)}
                          step="0.01"
                          inputMode="decimal"
                          defaultValue={remainingRefundable.toFixed(2)}
                          required
                        />

                        <label htmlFor={`provider-refund-reason-${order.id}`}>
                          Reason
                        </label>
                        <textarea
                          id={`provider-refund-reason-${order.id}`}
                          name="refund_reason"
                          rows={3}
                          maxLength={255}
                          placeholder="Customer requested a refund..."
                          required
                        />

                        <button type="submit" className={styles.refundSubmit}>
                          Refund through {order.payment_provider === "PAYPAL" ? "PayPal" : "PayMongo"}
                        </button>
                      </form>
                    ) : null}

                    <details className={styles.manualRefundDetails}>
                      <summary>Record external/manual refund</summary>

                      <form action={recordExternalRefund} className={styles.actionForm}>
                        <input type="hidden" name="order_id" value={order.id} />

                        <label htmlFor={`external-refund-amount-${order.id}`}>
                          Refund amount
                        </label>
                        <input
                          id={`external-refund-amount-${order.id}`}
                          name="refund_amount"
                          type="number"
                          min="0.01"
                          max={remainingRefundable.toFixed(2)}
                          step="0.01"
                          inputMode="decimal"
                          defaultValue={remainingRefundable.toFixed(2)}
                          required
                        />

                        <label htmlFor={`external-refund-reason-${order.id}`}>
                          Reason / reference
                        </label>
                        <textarea
                          id={`external-refund-reason-${order.id}`}
                          name="refund_reason"
                          rows={3}
                          maxLength={1000}
                          placeholder="Refunded manually via provider dashboard, bank transfer, etc."
                          required
                        />

                        <button type="submit" className={styles.refundSubmit}>
                          Save External Refund
                        </button>
                      </form>
                    </details>
                  </div>
                </details>
              ) : (
                <div className={styles.actionUnavailable}>Refund unavailable</div>
              )}

              {order.order_status !== "CANCELLED" ? (
                <details className={styles.orderAction}>
                  <summary className={`${styles.orderActionTrigger} ${styles.cancelTrigger}`}>
                    <span>Cancel Order</span>
                    <span className={styles.actionChevron} aria-hidden="true" />
                  </summary>

                  <div className={styles.orderActionPanel}>
                    <span className={styles.actionEyebrow}>CANCEL ORDER</span>
                    <h3>Cancel this order?</h3>
                    <p>
                      Add a reason for the cancellation.
                      {order.payment_status === "COMPLETED"
                        ? " This will not automatically refund the customer."
                        : " The private payment link will stop accepting payment."}
                    </p>

                    <form action={cancelOrder} className={styles.actionForm}>
                      <input type="hidden" name="order_id" value={order.id} />

                      <label htmlFor={`cancel-reason-${order.id}`}>
                        Cancellation reason
                      </label>
                      <textarea
                        id={`cancel-reason-${order.id}`}
                        name="reason"
                        rows={4}
                        maxLength={1000}
                        required
                        placeholder="Customer changed their mind, duplicate order..."
                      />

                      <button type="submit" className={styles.cancelSubmit}>
                        Confirm Cancellation
                      </button>
                    </form>
                  </div>
                </details>
              ) : (
                <div className={styles.actionUnavailable}>Order cancelled</div>
              )}

              <details className={styles.orderAction}>
                <summary className={`${styles.orderActionTrigger} ${styles.deleteTrigger}`}>
                  <span>Delete Order</span>
                  <span className={styles.actionChevron} aria-hidden="true" />
                </summary>

                <div className={styles.orderActionPanel}>
                  <span className={styles.actionEyebrow}>DELETE ORDER</span>
                  <h3>Delete this order?</h3>
                  <p>
                    This permanently removes the TCL order and its internal records.
                    PayPal or PayMongo transactions are not refunded.
                  </p>

                  <form action={deleteOrder} className={styles.actionForm}>
                    <input type="hidden" name="order_id" value={order.id} />

                    <label htmlFor={`delete-confirmation-${order.id}`}>
                      Type <strong>DELETE</strong> to confirm
                    </label>
                    <input
                      id={`delete-confirmation-${order.id}`}
                      name="confirmation"
                      placeholder="DELETE"
                      autoComplete="off"
                      required
                      pattern="DELETE"
                      title="Type DELETE exactly to continue."
                    />

                    <button type="submit" className={styles.deleteSubmit}>
                      Delete Permanently
                    </button>
                  </form>
                </div>
              </details>
            </div>
          </section>

          <section className={styles.contentGrid}>
            <div className={styles.mainColumn}>
              <section className={styles.card}>
                <div className={styles.cardHeader}>
                  <span>CUSTOMER</span>
                  <h2>Customer information</h2>
                </div>

                <div className={styles.infoGrid}>
                  <div>
                    <span>Name</span>
                    <strong>{order.customer_name}</strong>
                  </div>

                  <div>
                    <span>Email</span>
                    <strong>{order.customer_email}</strong>
                  </div>

                  <div>
                    <span>Customer ID</span>
                    <strong>{order.customer_id || "—"}</strong>
                  </div>
                </div>
              </section>

              <section className={styles.card}>
                <div className={styles.cardHeader}>
                  <span>PRODUCT</span>
                  <h2>Purchase breakdown</h2>
                </div>

                <div className={styles.productBlock}>
                  <div>
                    <strong>{order.product_name}</strong>
                    <small>{order.product_id || "No product ID"}</small>
                  </div>

                  <div className={styles.breakdown}>
                    <div>
                      <span>Base price</span>
                      <strong>
                        {formatMoney(Number(order.base_price ?? 0))}
                      </strong>
                    </div>

                    <div>
                      <span>
                        Processing fee (
                        {Number(
                          order.processing_fee_percent ?? 0,
                        )}
                        %)
                      </span>
                      <strong>
                        {formatMoney(
                          Number(order.processing_fee ?? 0),
                        )}
                      </strong>
                    </div>

                    <div className={styles.totalRow}>
                      <span>Total</span>
                      <strong>
                        {formatMoney(
                          Number(order.total_amount ?? 0),
                        )}
                      </strong>
                    </div>
                  </div>
                </div>
              </section>

              <section className={styles.card}>
                <div className={styles.cardHeader}>
                  <span>PAYMENT PROVIDER</span>
                  <h2>Transaction references</h2>
                </div>

                <div className={styles.referenceList}>
                  <div>
                    <span>Provider</span>
                    <strong>{order.payment_provider || "—"}</strong>
                  </div>

                  <div>
                    <span>PayPal order ID</span>
                    <code>{order.paypal_order_id || "—"}</code>
                  </div>

                  <div>
                    <span>PayPal capture ID</span>
                    <code>{order.paypal_capture_id || "—"}</code>
                  </div>

                  <div>
                    <span>PayMongo checkout session</span>
                    <code>
                      {order.paymongo_checkout_session_id || "—"}
                    </code>
                  </div>

                  <div>
                    <span>PayMongo payment ID</span>
                    <code>{order.paymongo_payment_id || "—"}</code>
                  </div>

                  <div>
                    <span>Paid at</span>
                    <strong>{formatDateTime(order.paid_at)}</strong>
                  </div>
                </div>
              </section>

              <section className={styles.card}>
                <div className={styles.cardHeader}>
                  <span>DELIVERY REQUESTS</span>
                  <h2>Manual fulfillment</h2>
                </div>

                {deliveries.length > 0 ? (
                  <div className={styles.deliveryList}>
                    {deliveries.map((delivery) => (
                      <article key={delivery.id}>
                        <div className={styles.deliveryTop}>
                          <div>
                            <strong>{delivery.delivery_type}</strong>
                            <small>
                              Requested{" "}
                              {formatDateTime(
                                delivery.requested_at ||
                                  delivery.created_at,
                              )}
                            </small>
                          </div>

                          <span>{delivery.status}</span>
                        </div>

                        {delivery.github_username ? (
                          <p>
                            GitHub:{" "}
                            <strong>
                              {delivery.github_username}
                            </strong>
                          </p>
                        ) : null}

                        {delivery.customer_message ? (
                          <p>{delivery.customer_message}</p>
                        ) : null}

                        {delivery.admin_notes ? (
                          <p className={styles.adminNote}>
                            Admin note: {delivery.admin_notes}
                          </p>
                        ) : null}
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className={styles.emptyDelivery}>
                    <strong>No manual delivery request</strong>
                    <p>
                      Automatic product-file delivery does not
                      require a delivery request.
                    </p>
                  </div>
                )}
              </section>
            </div>

            <aside className={styles.sideColumn}>

              {order.payment_status === "COMPLETED" ? (
                <section className={styles.card}>
                  <div className={styles.cardHeader}>
                    <span>REVENUE & REFUNDS</span>
                    <h2>Payment accounting</h2>
                  </div>

                  <div className={styles.referenceList}>
                    <div>
                      <span>Gross payment</span>
                      <strong>{formatMoney(totalAmount)}</strong>
                    </div>

                    <div>
                      <span>Refund status</span>
                      <strong>{order.refund_status || "NONE"}</strong>
                    </div>

                    <div>
                      <span>Total refunded</span>
                      <strong>{formatMoney(refundedAmount)}</strong>
                    </div>

                    <div>
                      <span>Net revenue</span>
                      <strong>{formatMoney(netRevenue)}</strong>
                    </div>

                    <div>
                      <span>Remaining refundable</span>
                      <strong>{formatMoney(remainingRefundable)}</strong>
                    </div>

                    {order.refunded_at ? (
                      <div>
                        <span>Last refund recorded</span>
                        <strong>{formatDateTime(order.refunded_at)}</strong>
                      </div>
                    ) : null}
                  </div>

                  {order.refund_note ? (
                    <div className={styles.cardBody}>
                      <p>
                        <strong>Latest refund reason:</strong>{" "}
                        {order.refund_note}
                      </p>
                      <p>
                        Provider refunds are sent through the original payment
                        provider first, then recorded in TCL. External/manual
                        refunds are accounting records only.
                      </p>
                    </div>
                  ) : (
                    <div className={styles.cardBody}>
                      <p>
                        No refund recorded. Cancelling an order does not reduce
                        revenue unless a refund is recorded separately.
                      </p>
                    </div>
                  )}
                </section>
              ) : null}

              {refunds.length > 0 ? (
                <section className={styles.card}>
                  <div className={styles.cardHeader}>
                    <span>REFUND HISTORY</span>
                    <h2>Refund transactions</h2>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gap: "9px",
                    }}
                  >
                    {refunds.map((refund) => (
                      <article
                        key={refund.id}
                        style={{
                          padding: "12px",
                          border: "1px solid var(--border)",
                          borderRadius: "11px",
                          background: "#fffafb",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "flex-start",
                            justifyContent: "space-between",
                            gap: "10px",
                            marginBottom: "8px",
                          }}
                        >
                          <div>
                            <strong
                              style={{
                                display: "block",
                                color: "var(--text)",
                                fontSize: "0.7rem",
                              }}
                            >
                              {formatMoney(Number(refund.amount ?? 0))}
                            </strong>
                            <small
                              style={{
                                display: "block",
                                marginTop: "2px",
                                color: "var(--text-light)",
                                fontSize: "0.53rem",
                              }}
                            >
                              {formatDateTime(refund.created_at)}
                            </small>
                          </div>

                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              minHeight: "23px",
                              padding: "0 8px",
                              border: "1px solid #ead7df",
                              borderRadius: "999px",
                              background: "#fff",
                              color: "#8d5267",
                              fontSize: "0.49rem",
                              fontWeight: 900,
                              letterSpacing: "0.03em",
                            }}
                          >
                            {refund.provider_status}
                          </span>
                        </div>

                        <div
                          style={{
                            display: "grid",
                            gap: "6px",
                            color: "var(--text-soft)",
                            fontSize: "0.57rem",
                            lineHeight: 1.5,
                          }}
                        >
                          <div>
                            <span style={{ color: "var(--text-light)" }}>
                              Provider:{" "}
                            </span>
                            <strong>{refund.provider}</strong>
                          </div>

                          <div>
                            <span style={{ color: "var(--text-light)" }}>
                              Type:{" "}
                            </span>
                            <strong>
                              {refund.refund_type === "PROVIDER"
                                ? "Provider refund"
                                : "External / manual"}
                            </strong>
                          </div>

                          {refund.provider_refund_id ? (
                            <div>
                              <span style={{ color: "var(--text-light)" }}>
                                Refund ID:{" "}
                              </span>
                              <code
                                style={{
                                  overflowWrap: "anywhere",
                                  fontSize: "0.54rem",
                                }}
                              >
                                {refund.provider_refund_id}
                              </code>
                            </div>
                          ) : null}

                          <div>
                            <span style={{ color: "var(--text-light)" }}>
                              Reason:{" "}
                            </span>
                            <strong>{refund.reason}</strong>
                          </div>

                          {refund.created_by ? (
                            <div>
                              <span style={{ color: "var(--text-light)" }}>
                                Recorded by:{" "}
                              </span>
                              <strong>{refund.created_by}</strong>
                            </div>
                          ) : null}
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              ) : null}

              {order.payment_status === "PENDING" && order.order_status !== "CANCELLED" ? (
                <section className={styles.checkoutCard}>
                  <span>PRIVATE PAYMENT CHECKOUT</span>
                  <h2>Customer payment link</h2>

                  {query.checkout_created === "1" ? (
                    <div className={styles.checkoutCreated}>
                      Checkout created successfully.
                    </div>
                  ) : null}

                  <p>
                    Send this private link to the customer to collect the exact
                    saved order total through PayPal.
                  </p>

                  <div className={styles.checkoutUrl}>
                    <code>
                      /checkout/custom/{order.receipt_token}
                    </code>
                  </div>

                  <CopyPaymentLinkButton
                    path={`/checkout/custom/${order.receipt_token}`}
                  />

                  <a
                    href={`/checkout/custom/${order.receipt_token}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open Payment Checkout →
                  </a>
                </section>
              ) : null}

              {order.order_status === "CANCELLED" ? (
                <section className={styles.card}>
                  <div className={styles.cardHeader}>
                    <span>ORDER STATUS</span>
                    <h2>Cancelled</h2>
                  </div>

                  <div className={styles.cardBody}>
                    <p>
                      <strong>Reason:</strong>{" "}
                      {order.cancellation_reason || "No reason recorded."}
                    </p>
                    <p>
                      <strong>Cancelled at:</strong>{" "}
                      {formatDateTime(order.cancelled_at)}
                    </p>
                    {order.payment_status === "COMPLETED" ? (
                      <p>
                        Payment remains COMPLETED. Cancelling this order does
                        not automatically refund PayPal or PayMongo.
                      </p>
                    ) : null}
                  </div>
                </section>
              ) : null}

              <section className={styles.card}>
                <div className={styles.cardHeader}>
                  <span>SECURE RECEIPT</span>
                  <h2>Receipt token</h2>
                </div>

                <div className={styles.tokenBox}>
                  <code>{order.receipt_token}</code>
                </div>

                <div className={styles.cardBody}>
                  <p>
                    This token is used for the secure post-payment
                    success page and digital delivery.
                  </p>
                </div>
              </section>

              <section className={styles.card}>
                <div className={styles.cardHeader}>
                  <span>INTERNAL ACTIVITY</span>
                  <h2>Order notes log</h2>
                </div>

                <form
                  action={addOrderNote}
                  className={styles.notesForm}
                >
                  <input
                    type="hidden"
                    name="order_id"
                    value={order.id}
                  />

                  <label htmlFor="admin_note">
                    Add a new note
                  </label>

                  <textarea
                    id="admin_note"
                    name="note"
                    placeholder="Add a new internal note..."
                    rows={4}
                    required
                  />

                  <div className={styles.notesFormBottom}>
                    <p>
                      Every entry is saved separately and is not shown
                      to the customer.
                    </p>

                    <button type="submit">
                      Add Note
                    </button>
                  </div>
                </form>

                {order.notes ? (
                  <div className={styles.legacyNote}>
                    <span>PREVIOUS NOTE</span>
                    <p>{order.notes}</p>
                    <small>
                      Saved before the activity log was enabled.
                    </small>
                  </div>
                ) : null}

                {noteEntries.length > 0 ? (
                  <div
                    className={styles.noteLog}
                    style={{
                      maxHeight: noteEntries.length > 3 ? "330px" : "none",
                      overflowY: noteEntries.length > 3 ? "auto" : "visible",
                      overscrollBehavior: "contain",
                    }}
                  >
                    {noteEntries.map((entry) => (
                      <article
                        key={entry.id}
                        className={styles.noteEntry}
                      >
                        <div className={styles.noteTimeline}>
                          <span />
                        </div>

                        <div className={styles.noteContent}>
                          <p>{entry.note}</p>

                          <div className={styles.noteMeta}>
                            <strong>
                              {entry.created_by || "Admin"}
                            </strong>

                            <span>
                              {formatDateTime(entry.created_at)}
                            </span>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className={styles.emptyNotes}>
                    <strong>No log entries yet</strong>
                    <p>
                      Add the first internal note above.
                    </p>
                  </div>
                )}
              </section>

            </aside>
          </section>
        </section>
      </div>
    </main>
  );
}
