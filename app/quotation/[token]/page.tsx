import Link from "next/link";
import { notFound } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { createAdminSupabaseClient } from "@/lib/supabase-admin";
import { getCustomCheckoutState } from "@/lib/custom-order-payments";
import { acceptQuotation, decideLater } from "./actions";
import styles from "./quotation.module.css";

export const dynamic = "force-dynamic";

const FULL_PAYMENT_FEE_PERCENT = 4;
const DEPOSIT_PAYMENT_FEE_PERCENT = 6;

function money(value: number | string | null | undefined) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value ?? 0));
}

function termsLabel(value: string | null) {
  if (value === "DEPOSIT_50") {
    return "50% Deposit + Remaining Balance";
  }

  if (value === "FULL") {
    return "Full Payment";
  }

  return "Not set";
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

  const { data: quotation, error } = await supabase
    .from("quotation_requests")
    .select(
      "id,secure_token,status,quoted_amount,quoted_at,payment_terms,accepted_at,order_id,product_slug,product_name,full_name,business_name,email,project_context,business_type,main_goal,selected_features,admin_notes",
    )
    .eq("secure_token", token)
    .maybeSingle();

  if (error) {
    console.error("Client quotation load error:", error);
  }

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

  const quotationItems = (quotationItemsData ?? []).map((item) => ({
    id: String(item.id),
    name: String(item.item_name ?? ""),
    description: item.item_description
      ? String(item.item_description)
      : "",
    amount: Number(item.amount ?? 0),
  }));

  let linkedOrder: {
    id: string;
    receipt_token: string | null;
    payment_status: string | null;
    payment_terms: string | null;
    base_price: number | string | null;
    processing_fee_percent: number | string | null;
    processing_fee: number | string | null;
    amount_paid: number | string | null;
    balance_due: number | string | null;
    total_amount: number | string | null;
    order_status: string | null;
  } | null = null;

  if (quotation.order_id) {
    const { data: orderData, error: orderError } = await supabase
      .from("orders")
      .select(
        "id,receipt_token,payment_status,payment_terms,base_price,processing_fee_percent,processing_fee,amount_paid,balance_due,total_amount,order_status",
      )
      .eq("id", quotation.order_id)
      .maybeSingle();

    if (orderError) {
      console.error("Client quotation linked order load error:", orderError);
    } else {
      linkedOrder = orderData;
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

  const fullFee = Number(((base * FULL_PAYMENT_FEE_PERCENT) / 100).toFixed(2));
  const fullTotal = Number((base + fullFee).toFixed(2));

  const depositFee = Number(((base * DEPOSIT_PAYMENT_FEE_PERCENT) / 100).toFixed(2));
  const depositTotal = Number((base + depositFee).toFixed(2));
  const depositDueNow = Number((depositTotal / 2).toFixed(2));
  const depositRemaining = Number((depositTotal - depositDueNow).toFixed(2));
  const bpiTotal = base;

  const acceptedFeePercent = Number(
    linkedOrder?.processing_fee_percent ??
      (quotation.payment_terms === "FULL"
        ? FULL_PAYMENT_FEE_PERCENT
        : DEPOSIT_PAYMENT_FEE_PERCENT),
  );
  const acceptedFee = Number(linkedOrder?.processing_fee ?? 0);
  const acceptedTotal = Number(linkedOrder?.total_amount ?? 0);
  const isAcceptedBpiDirect =
    quotation.status === "ACCEPTED" &&
    quotation.payment_terms === "FULL" &&
    linkedOrder !== null &&
    acceptedFeePercent <= 0.005;

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
                      <strong>Quotation subtotal</strong>
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
                <h2>Choose how you want to pay</h2>

                {quotation.status === "QUOTED" ? (
                  <>
                    <p className={styles.muted}>
                      Your quotation subtotal stays the same. The processing fee
                      depends on the payment option you choose when accepting.
                    </p>

                    <div
                      style={{
                        display: "grid",
                        gap: 12,
                        marginTop: 16,
                      }}
                    >
                      <div
                        style={{
                          padding: 16,
                          border: "1px solid rgba(27, 22, 24, 0.10)",
                          borderRadius: 14,
                          background: "#fff",
                        }}
                      >
                        <strong>Pay in Full — Online / Card Payment · 4% provider fee</strong>
                        <p style={{ margin: "7px 0 0", lineHeight: 1.6 }}>
                          Pay through PayPal / Card or QR Ph. Project total: {money(fullTotal)}.
                          The full amount is due after acceptance.
                        </p>
                      </div>

                      <div
                        style={{
                          padding: 16,
                          border: "1px solid rgba(27, 22, 24, 0.10)",
                          borderRadius: 14,
                          background: "#fff",
                        }}
                      >
                        <strong>50% Down Payment — Online / Card Payment · 6% provider fee</strong>
                        <p style={{ margin: "7px 0 0", lineHeight: 1.6 }}>
                          Pay through PayPal / Card or QR Ph. Project total: {money(depositTotal)}.
                          Pay {money(depositDueNow)} now, then {money(depositRemaining)} when TCL
                          activates the remaining balance.
                        </p>
                      </div>

                      <div
                        style={{
                          padding: 16,
                          border: "1px solid rgba(27, 22, 24, 0.10)",
                          borderRadius: 14,
                          background: "#fff",
                        }}
                      >
                        <strong>Pay in Full — Direct BPI Transfer · No processing fee</strong>
                        <p style={{ margin: "7px 0 0", lineHeight: 1.6 }}>
                          Full payment only. Project total: {money(bpiTotal)}. Direct BPI
                          transfers are manually verified by TCL after payment.
                        </p>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <h3 style={{ marginTop: 12 }}>
                      {termsLabel(quotation.payment_terms)}
                    </h3>
                    <p className={styles.muted}>
                      {quotation.payment_terms === "DEPOSIT_50"
                        ? "You selected the 50% down payment option through an online payment provider with a 6% processing fee. Successful payments remain credited toward the current project total if the scope changes later."
                        : isAcceptedBpiDirect
                          ? "You selected full payment through direct BPI bank transfer with no processing fee. Payment is manually verified by TCL."
                          : "You selected full payment through an online payment provider with a 4% processing fee."}
                    </p>
                  </>
                )}

                <div
                  style={{
                    marginTop: 14,
                    padding: 14,
                    borderRadius: 13,
                    background: "rgba(0,0,0,.035)",
                    fontSize: ".88rem",
                    lineHeight: 1.6,
                  }}
                >
                  Online payment processing fees apply only when using the supported
                  payment providers. Direct BPI bank transfer is full-payment only
                  and has no processing fee. Your selected payment option and fee
                  rate are locked when the quotation is accepted. If the scope changes
                  later, the same selected rate applies to the updated subtotal.
                </div>
              </section>
            </div>

            <aside className={styles.side}>
              <section className={styles.priceCard}>
                <span className={styles.sectionLabel}>QUOTATION SUMMARY</span>

                <div className={styles.priceRow}>
                  <span>Quotation subtotal</span>
                  <strong>{money(base)}</strong>
                </div>

                {quotation.status === "ACCEPTED" && linkedOrder ? (
                  <>
                    <div className={styles.priceRow}>
                      <span>
                        {isAcceptedBpiDirect
                          ? "Processing fee (Direct BPI)"
                          : `Payment provider fee (${acceptedFeePercent}%)`}
                      </span>
                      <strong>{money(acceptedFee)}</strong>
                    </div>

                    <div className={`${styles.priceRow} ${styles.total}`}>
                      <span>Current project total</span>
                      <strong>{money(acceptedTotal || currentOrderTotal)}</strong>
                    </div>

                    <div className={styles.due}>
                      <small>Current payment status</small>

                      {customCheckoutState?.state === "PAYMENT_DUE" &&
                      currentPayment ? (
                        <>
                          <strong>{money(currentPayment.amount)}</strong>
                          <span>
                            {currentPayment.payment_stage === "DEPOSIT"
                              ? "50% down payment currently due"
                              : currentPayment.payment_stage === "FINAL"
                                ? "Remaining balance currently due"
                                : isAcceptedBpiDirect
                                  ? "Direct BPI full payment currently due"
                                  : "Full payment currently due"}
                          </span>
                        </>
                      ) : customCheckoutState?.state === "WAITING_FOR_FINAL" ? (
                        <>
                          <strong>{money(currentBalance)}</strong>
                          <span>
                            Down payment received. The remaining balance has not
                            been activated for payment yet.
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
                  </>
                ) : (
                  <>
                    <div
                      style={{
                        marginTop: 16,
                        padding: 14,
                        borderRadius: 13,
                        background: "rgba(0,0,0,.035)",
                        fontSize: ".88rem",
                        lineHeight: 1.55,
                      }}
                    >
                      Choose your payment option below. Online provider payments include
                      the applicable processing fee. Direct BPI transfer requires full
                      payment and has no processing fee.
                    </div>
                  </>
                )}

                {isReviewable ? (
                  <div className={styles.actions}>
                    <form action={acceptQuotation}>
                      <input type="hidden" name="token" value={token} />

                      <div
                        style={{
                          display: "grid",
                          gap: 10,
                          marginBottom: 14,
                        }}
                      >
                        <label
                          style={{
                            display: "grid",
                            gridTemplateColumns: "auto 1fr",
                            gap: 10,
                            alignItems: "start",
                            padding: 13,
                            border: "1px solid rgba(27, 22, 24, 0.12)",
                            borderRadius: 13,
                            cursor: "pointer",
                          }}
                        >
                          <input
                            type="radio"
                            name="payment_choice"
                            value="PROVIDER_FULL"
                            required
                            style={{ marginTop: 3 }}
                          />
                          <span>
                            <strong style={{ display: "block" }}>
                              Pay in Full · Online / Card Payment· 4% fee
                            </strong>
                            <small>Due now: {money(fullTotal)}</small>
                          </span>
                        </label>

                        <label
                          style={{
                            display: "grid",
                            gridTemplateColumns: "auto 1fr",
                            gap: 10,
                            alignItems: "start",
                            padding: 13,
                            border: "1px solid rgba(27, 22, 24, 0.12)",
                            borderRadius: 13,
                            cursor: "pointer",
                          }}
                        >
                          <input
                            type="radio"
                            name="payment_choice"
                            value="PROVIDER_DEPOSIT"
                            required
                            style={{ marginTop: 3 }}
                          />
                          <span>
                            <strong style={{ display: "block" }}>
                              50% Down Payment · Online / Card Payment · 6% fee
                            </strong>
                            <small>Due now: {money(depositDueNow)}</small>
                          </span>
                        </label>

                        <label
                          style={{
                            display: "grid",
                            gridTemplateColumns: "auto 1fr",
                            gap: 10,
                            alignItems: "start",
                            padding: 13,
                            border: "1px solid rgba(27, 22, 24, 0.12)",
                            borderRadius: 13,
                            cursor: "pointer",
                          }}
                        >
                          <input
                            type="radio"
                            name="payment_choice"
                            value="BPI_FULL"
                            required
                            style={{ marginTop: 3 }}
                          />
                          <span>
                            <strong style={{ display: "block" }}>
                              Pay in Full · Direct BPI · No fee
                            </strong>
                            <small>Due now: {money(bpiTotal)}</small>
                          </span>
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
                      subtotal and choose the payment method/plan shown above. Online
                      provider fees apply only to provider payments; direct BPI full
                      payment has no processing fee. Your selection is locked to this project.
                    </p>
                  </div>
                ) : quotation.status === "ACCEPTED" && quotation.order_id ? (
                  <div className={styles.acceptedBox}>
                    {customCheckoutState?.state === "PAYMENT_DUE" &&
                    currentPayment &&
                    checkoutHref ? (
                      <>
                        <strong>
                          {currentPayment.payment_stage === "FINAL"
                            ? "Remaining balance is ready for payment"
                            : currentPayment.payment_stage === "DEPOSIT"
                              ? "Quotation accepted — down payment is ready"
                              : isAcceptedBpiDirect
                                ? "Quotation accepted — BPI transfer is ready"
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
                              ? "Continue to Down Payment →"
                              : isAcceptedBpiDirect
                                ? "View BPI Transfer Instructions →"
                                : "Continue to Payment →"}
                        </Link>
                      </>
                    ) : customCheckoutState?.state === "WAITING_FOR_FINAL" ? (
                      <>
                        <strong>Down payment received ✓</strong>
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
