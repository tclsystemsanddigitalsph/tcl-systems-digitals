import Link from "next/link";
import { notFound } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { createAdminSupabaseClient } from "@/lib/supabase-admin";
import { getCustomCheckoutState } from "@/lib/custom-order-payments";
import { acceptQuotation, decideLater } from "./actions";
import styles from "./quotation.module.css";

export const dynamic = "force-dynamic";


type ClientQuotationRow = {
  id: string;
  secure_token: string;
  status: string;
  quoted_amount: number | string | null;
  quoted_at: string | null;
  payment_terms: string | null;
  accepted_at: string | null;
  order_id: string | null;
  product_slug: string | null;
  product_name: string | null;
  full_name: string | null;
  business_name: string | null;
  email: string | null;
  project_context: string | null;
  business_type: string | null;
  main_goal: string | null;
  selected_features: unknown;
  admin_notes: string | null;
};

type QuotationItemRow = {
  id: string;
  item_name: string | null;
  item_description: string | null;
  amount: number | string | null;
  display_order: number | null;
  created_at: string | null;
};

type LinkedOrderRow = {
  id: string;
  receipt_token: string | null;
  payment_status: string | null;
  payment_terms: string | null;
  amount_paid: number | string | null;
  balance_due: number | string | null;
  total_amount: number | string | null;
  order_status: string | null;
};

function money(value: number | string | null | undefined) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value ?? 0));
}

function statusLabel(value: string) {
  switch (value) {
    case "NEW":
      return "New";
    case "REVIEWING":
      return "Under Review";
    case "QUOTED":
      return "Ready for Review";
    case "ACCEPTED":
      return "Accepted";
    case "DECLINED":
      return "Declined";
    case "CLOSED":
      return "Closed";
    default:
      return value;
  }
}

export default async function ClientQuotationPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { token } = await params;
  const query = await searchParams;
  const supabase = createAdminSupabaseClient();

  const { data: quotationData, error } = await supabase
    .from("quotation_requests")
    .select(
      [
        "id",
        "secure_token",
        "status",
        "quoted_amount",
        "quoted_at",
        "payment_terms",
        "accepted_at",
        "order_id",
        "product_slug",
        "product_name",
        "full_name",
        "business_name",
        "email",
        "project_context",
        "business_type",
        "main_goal",
        "selected_features",
        "admin_notes",
      ].join(","),
    )
    .eq("secure_token", token)
    .maybeSingle();

  if (error) {
    console.error("Client quotation load error:", error);
  }

  const quotation = quotationData as unknown as ClientQuotationRow | null;

  if (!quotation) {
    notFound();
  }

  const { data: quotationItemsData, error: quotationItemsError } =
    await supabase
      .from("quotation_items")
      .select("id,item_name,item_description,amount,display_order,created_at")
      .eq("quotation_request_id", quotation.id)
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: true });

  if (quotationItemsError) {
    console.error(
      "Client quotation items load error:",
      quotationItemsError,
    );
  }

  const quotationItems = ((quotationItemsData ?? []) as unknown as QuotationItemRow[]).map((item) => ({
    id: String(item.id),
    name: String(item.item_name ?? ""),
    description: item.item_description
      ? String(item.item_description)
      : "",
    amount: Number(item.amount ?? 0),
  }));

  let linkedOrder: LinkedOrderRow | null = null;

  if (quotation.order_id) {
    const { data: orderData, error: orderError } = await supabase
      .from("orders")
      .select(
        "id,receipt_token,payment_status,payment_terms,amount_paid,balance_due,total_amount,order_status",
      )
      .eq("id", quotation.order_id)
      .maybeSingle();

    if (orderError) {
      console.error("Client quotation linked order load error:", orderError);
    } else {
      linkedOrder = orderData as unknown as LinkedOrderRow | null;
    }
  }

  const customCheckoutState = linkedOrder?.receipt_token
    ? await getCustomCheckoutState(linkedOrder.receipt_token)
    : null;

  const checkoutHref = linkedOrder?.receipt_token
    ? `/checkout/custom/${linkedOrder.receipt_token}`
    : null;

  const successfulPayments = Number(
    customCheckoutState?.order.amount_paid ?? linkedOrder?.amount_paid ?? 0,
  );

  const currentOrderTotal = Number(
    customCheckoutState?.order.total_amount ?? linkedOrder?.total_amount ?? 0,
  );

  const currentBalance = Number(
    customCheckoutState?.order.balance_due ?? linkedOrder?.balance_due ?? 0,
  );

  const currentPayment = customCheckoutState?.currentPayment ?? null;

  const base = Number(quotation.quoted_amount ?? 0);

  // Payment terms are chosen by the client at acceptance, not by Admin.
  const providerFullFee = Number((base * 0.04).toFixed(2));
  const providerFullTotal = Number((base + providerFullFee).toFixed(2));

  const providerDepositFee = Number((base * 0.06).toFixed(2));
  const providerDepositTotal = Number((base + providerDepositFee).toFixed(2));
  const providerDepositDueNow = Number((providerDepositTotal / 2).toFixed(2));

  const bpiTotal = base;

  const requestedFeatures = Array.isArray(quotation.selected_features)
    ? quotation.selected_features.filter(
        (item): item is string => typeof item === "string",
      )
    : [];

  const hasItemizedScope = quotationItems.length > 0;

  const isReviewable = quotation.status === "QUOTED" && base > 0;

  const later = query.later === "1";
  const hasError = typeof query.error === "string";

  return (
    <>
      <SiteHeader />

      <main className={styles.page}>
        <section className={styles.hero}>
          <div className={`container ${styles.heroInner}`}>
            <div>
              <span className={styles.kicker}>PRIVATE QUOTATION</span>
              <h1>Your project quotation.</h1>
              <p>
                Review the latest agreed scope, pricing, and payment terms
                below. If everything looks correct, you can accept the
                quotation and continue to checkout.
              </p>
            </div>

            <div className={styles.status}>
              <small>Quotation status</small>
              <strong>{statusLabel(quotation.status)}</strong>
            </div>
          </div>
        </section>

        <section className={styles.content}>
          <div className={`container ${styles.grid}`}>
            <div className={styles.main}>
              {later ? (
                <div className={styles.notice}>
                  No problem. Your quotation has not been accepted or charged.
                  You can return to this private link whenever you&apos;re ready.
                </div>
              ) : null}

              {hasError ? (
                <div className={styles.error}>
                  We couldn&apos;t continue with the quotation right now. Please
                  contact TCL Systems &amp; Digitals PH so we can check it for
                  you.
                  {typeof query.error === "string" ? (
                    <><br /><small>Error reference: {query.error}</small></>
                  ) : null}
                </div>
              ) : null}

              <section className={styles.card}>
                <span className={styles.sectionLabel}>PROJECT SUMMARY</span>
                <h2>
                  {quotation.business_name ||
                    quotation.product_name ||
                    "Custom Project"}
                </h2>

                <div className={styles.details}>
                  <div>
                    <small>Prepared for</small>
                    <strong>{quotation.full_name || "Client"}</strong>
                  </div>

                  <div>
                    <small>Project type</small>
                    <strong>{quotation.business_type || "—"}</strong>
                  </div>

                  <div>
                    <small>Project context</small>
                    <strong>{quotation.project_context || "—"}</strong>
                  </div>
                </div>

                {quotation.main_goal ? (
                  <div className={styles.block}>
                    <small>Project goal</small>
                    <p>{quotation.main_goal}</p>
                  </div>
                ) : null}
              </section>

              <section className={styles.card}>
                <span className={styles.sectionLabel}>AGREED SCOPE</span>
                <h2>Items included in this quotation</h2>

                {hasItemizedScope ? (
                  <div
                    style={{
                      display: "grid",
                      gap: 12,
                      marginTop: 18,
                    }}
                  >
                    {quotationItems.map((item, index) => (
                      <article
                        key={item.id}
                        style={{
                          display: "grid",
                          gridTemplateColumns: "minmax(0, 1fr) auto",
                          gap: 18,
                          alignItems: "start",
                          padding: 16,
                          border: "1px solid rgba(27, 22, 24, 0.10)",
                          borderRadius: 14,
                          background: "#fff",
                        }}
                      >
                        <div style={{ minWidth: 0 }}>
                          <small
                            style={{
                              display: "block",
                              marginBottom: 5,
                              opacity: 0.6,
                              fontWeight: 800,
                              letterSpacing: ".08em",
                            }}
                          >
                            ITEM {String(index + 1).padStart(2, "0")}
                          </small>

                          <strong
                            style={{
                              display: "block",
                              lineHeight: 1.4,
                            }}
                          >
                            {item.name}
                          </strong>

                          {item.description ? (
                            <p
                              style={{
                                margin: "7px 0 0",
                                whiteSpace: "pre-wrap",
                                lineHeight: 1.6,
                                opacity: 0.78,
                              }}
                            >
                              {item.description}
                            </p>
                          ) : null}
                        </div>

                        <strong
                          style={{
                            whiteSpace: "nowrap",
                            fontSize: "1rem",
                          }}
                        >
                          {money(item.amount)}
                        </strong>
                      </article>
                    ))}

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 16,
                        alignItems: "center",
                        marginTop: 3,
                        padding: "16px 2px 2px",
                        borderTop: "1px solid rgba(27, 22, 24, 0.10)",
                      }}
                    >
                      <strong>Quotation total</strong>
                      <strong style={{ fontSize: "1.15rem" }}>
                        {money(base)}
                      </strong>
                    </div>
                  </div>
                ) : requestedFeatures.length > 0 ? (
                  <div className={styles.block}>
                    <small>Requested / included features</small>
                    <div className={styles.features}>
                      {requestedFeatures.map((feature) => (
                        <span key={feature}>✓ {feature}</span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div
                    style={{
                      marginTop: 16,
                      padding: 15,
                      borderRadius: 13,
                      background: "rgba(0,0,0,.035)",
                      lineHeight: 1.6,
                    }}
                  >
                    Please review the quotation notes and total. Contact TCL if
                    you need clarification about the included scope before
                    accepting.
                  </div>
                )}

                {quotation.admin_notes ? (
                  <div className={styles.block}>
                    <small>Quotation / scope notes</small>
                    <p>{quotation.admin_notes}</p>
                  </div>
                ) : null}
              </section>

              <section className={styles.card}>
                <span className={styles.sectionLabel}>PAYMENT OPTIONS</span>
                <h2>Choose your payment option when you accept.</h2>
                <p className={styles.muted}>
                  The quotation amount below is the agreed project subtotal.
                  Payment-provider fees depend on the option you choose.
                </p>

                <div
                  style={{
                    marginTop: 16,
                    padding: 14,
                    borderRadius: 13,
                    background: "rgba(0,0,0,.035)",
                    fontSize: ".88rem",
                    lineHeight: 1.6,
                  }}
                >
                  If the project scope changes later, TCL may update the
                  quotation. Any successful payment already made remains
                  recorded and is not replaced by a new quotation amount.
                </div>
              </section>
            </div>

            <aside className={styles.side}>
              <section className={styles.priceCard}>
                <span className={styles.sectionLabel}>
                  QUOTATION SUMMARY
                </span>

                <div className={styles.priceRow}>
                  <span>Agreed project price</span>
                  <strong>{money(base)}</strong>
                </div>

                {quotation.status === "ACCEPTED" && linkedOrder ? (
                  <div className={`${styles.priceRow} ${styles.total}`}>
                    <span>Current order total</span>
                    <strong>{money(currentOrderTotal)}</strong>
                  </div>
                ) : (
                  <div className={`${styles.priceRow} ${styles.total}`}>
                    <span>Agreed quotation subtotal</span>
                    <strong>{money(base)}</strong>
                  </div>
                )}

                {quotation.status === "ACCEPTED" && linkedOrder ? (
                  <div className={styles.due}>
                    <small>Current payment status</small>

                    {customCheckoutState?.state === "PAYMENT_DUE" &&
                    currentPayment ? (
                      <>
                        <strong>{money(currentPayment.amount)}</strong>
                        <span>
                          {currentPayment.payment_stage === "DEPOSIT"
                            ? "50% deposit currently due"
                            : currentPayment.payment_stage === "FINAL"
                              ? "Remaining balance currently due"
                              : "Full payment currently due"}
                        </span>
                      </>
                    ) : customCheckoutState?.state === "WAITING_FOR_FINAL" ? (
                      <>
                        <strong>{money(currentBalance)}</strong>
                        <span>
                          Deposit received. The remaining balance has not been
                          activated for payment yet.
                        </span>
                      </>
                    ) : customCheckoutState?.state === "FULLY_PAID" ? (
                      <>
                        <strong>{money(0)}</strong>
                        <span>Project is fully paid.</span>
                      </>
                    ) : (
                      <>
                        <strong>{money(currentBalance)}</strong>
                        <span>Current remaining project balance.</span>
                      </>
                    )}
                  </div>
                ) : (
                  <div className={styles.due}>
                    <small>Payment option is selected below</small>
                    <strong>{money(base)}</strong>
                    <span>Agreed project subtotal before any provider fee.</span>
                  </div>
                )}

                {isReviewable ? (
                  <div className={styles.actions}>
                    <form action={acceptQuotation}>
                      <input type="hidden" name="token" value={token} />

                      <label
                        style={{
                          display: "grid",
                          gap: 7,
                          marginBottom: 16,
                          color: "#4d3f45",
                          fontSize: ".82rem",
                          fontWeight: 800,
                        }}
                      >
                        Email for this order
                        <input
                          type="email"
                          name="customer_email"
                          defaultValue={quotation.email ?? ""}
                          placeholder="you@example.com"
                          autoComplete="email"
                          required
                          style={{
                            width: "100%",
                            minHeight: 44,
                            padding: "0 12px",
                            border: "1px solid rgba(27,22,24,.14)",
                            borderRadius: 12,
                            background: "#fff",
                            color: "inherit",
                            font: "inherit",
                          }}
                        />
                        <span
                          style={{
                            color: "rgba(27,22,24,.58)",
                            fontSize: ".72rem",
                            fontWeight: 600,
                            lineHeight: 1.5,
                          }}
                        >
                          We&apos;ll use this for your order and payment record.
                        </span>
                      </label>

                      <div style={{ display: "grid", gap: 12, marginBottom: 16 }}>
                        <label style={{ display: "block", padding: 14, border: "1px solid rgba(27,22,24,.12)", borderRadius: 14, cursor: "pointer" }}>
                          <input type="radio" name="payment_choice" value="PROVIDER_FULL" required />
                          <strong style={{ display: "block", marginTop: 6 }}>Pay in Full — Online Provider</strong>
                          <span style={{ display: "block", marginTop: 4, opacity: .75 }}>4% processing fee · Total due now: {money(providerFullTotal)}</span>
                        </label>

                        <label style={{ display: "block", padding: 14, border: "1px solid rgba(27,22,24,.12)", borderRadius: 14, cursor: "pointer" }}>
                          <input type="radio" name="payment_choice" value="PROVIDER_DEPOSIT" required />
                          <strong style={{ display: "block", marginTop: 6 }}>50% Down Payment — Online Provider</strong>
                          <span style={{ display: "block", marginTop: 4, opacity: .75 }}>6% processing fee · Due now: {money(providerDepositDueNow)} · Remaining later: {money(providerDepositTotal - providerDepositDueNow)}</span>
                        </label>

                        <label style={{ display: "block", padding: 14, border: "1px solid rgba(27,22,24,.12)", borderRadius: 14, cursor: "pointer" }}>
                          <input type="radio" name="payment_choice" value="BPI_FULL" required />
                          <strong style={{ display: "block", marginTop: 6 }}>Pay in Full — Direct BPI Bank Transfer</strong>
                          <span style={{ display: "block", marginTop: 4, opacity: .75 }}>0% processing fee · Total due now: {money(bpiTotal)}</span>
                        </label>
                      </div>

                      <button className={styles.accept} type="submit">
                        Accept &amp; Continue to Payment →
                      </button>
                    </form>

                    <form action={decideLater}>
                      <input type="hidden" name="token" value={token} />

                      <button className={styles.later} type="submit">
                        Decide Later
                      </button>
                    </form>

                    <p className={styles.finePrint}>
                      By accepting, you confirm the latest scope and quotation
                      subtotal. Your selected payment option and its processing
                      fee are locked when the quotation is accepted.
                    </p>
                  </div>
                ) : quotation.status === "ACCEPTED" &&
                  quotation.order_id ? (
                  <div className={styles.acceptedBox}>
                    {customCheckoutState?.state === "PAYMENT_DUE" &&
                    currentPayment &&
                    checkoutHref ? (
                      <>
                        <strong>
                          {currentPayment.payment_stage === "FINAL"
                            ? "Remaining balance is ready for payment"
                            : currentPayment.payment_stage === "DEPOSIT"
                              ? "Quotation accepted — deposit is ready"
                              : "Quotation accepted — payment is ready"}
                        </strong>
                        <p>
                          Successful payments: {money(successfulPayments)}
                          <br />
                          Remaining balance: {money(currentBalance)}
                        </p>
                        <Link
                          className={styles.accept}
                          href={checkoutHref}
                          style={{ textDecoration: "none" }}
                        >
                          {currentPayment.payment_stage === "FINAL"
                            ? "Pay Remaining Balance →"
                            : currentPayment.payment_stage === "DEPOSIT"
                              ? "Continue to Deposit Payment →"
                              : "Continue to Payment →"}
                        </Link>
                      </>
                    ) : customCheckoutState?.state === "WAITING_FOR_FINAL" ? (
                      <>
                        <strong>Deposit received ✓</strong>
                        <p>
                          Successful payments: {money(successfulPayments)}
                          <br />
                          Remaining balance: {money(currentBalance)}
                        </p>
                        <p>
                          Your remaining balance is not due yet. TCL Systems
                          &amp; Digitals PH will activate the final payment when
                          it is ready.
                        </p>
                      </>
                    ) : customCheckoutState?.state === "FULLY_PAID" ? (
                      <>
                        <strong>Fully paid ✓</strong>
                        <p>
                          Your quotation has been accepted and there is no
                          remaining balance due.
                        </p>
                      </>
                    ) : customCheckoutState?.state === "CANCELLED" ? (
                      <>
                        <strong>Project order cancelled</strong>
                        <p>
                          This order can no longer accept payment. Please contact
                          TCL Systems &amp; Digitals PH if you need assistance.
                        </p>
                      </>
                    ) : checkoutHref ? (
                      <>
                        <strong>Quotation accepted</strong>
                        <p>
                          Your project order has been created. You can return to
                          the secure checkout anytime to review the current
                          payment status.
                        </p>
                        <Link
                          className={styles.accept}
                          href={checkoutHref}
                          style={{ textDecoration: "none" }}
                        >
                          Continue to Payment →
                        </Link>
                      </>
                    ) : (
                      <>
                        <strong>Quotation accepted</strong>
                        <p>
                          This quotation has already been accepted and your
                          project order has been created.
                        </p>
                      </>
                    )}
                  </div>
                ) : quotation.status === "DECLINED" ? (
                  <div className={styles.unavailable}>
                    This quotation is marked as declined. Contact TCL if you
                    would like the project to be reviewed again.
                  </div>
                ) : quotation.status === "CLOSED" ? (
                  <div className={styles.unavailable}>
                    This quotation has been closed. Contact TCL if you need a
                    new or updated quotation.
                  </div>
                ) : (
                  <div className={styles.unavailable}>
                    This quotation is not ready for acceptance yet. TCL may
                    still be reviewing the scope or pricing.
                  </div>
                )}
              </section>

              <Link className={styles.homeLink} href="/">
                ← Back to TCL Systems &amp; Digitals PH
              </Link>
            </aside>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
