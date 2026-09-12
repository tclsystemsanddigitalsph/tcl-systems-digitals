import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createAdminSupabaseClient } from "@/lib/supabase-admin";
import { getCustomCheckoutState } from "@/lib/custom-order-payments";
import CustomCheckoutActions from "./CustomCheckoutActions";
import PaymentSuccessCloser from "./PaymentSuccessCloser";
import BpiProofUpload from "./BpiProofUpload";
import AccountNumberCopyButton from "./AccountNumberCopyButton";
import styles from "./custom-checkout.module.css";

export const dynamic = "force-dynamic";


function money(value: number | string | null | undefined) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value ?? 0));
}

function stageLabel(stage: string) {
  if (stage === "DEPOSIT") return "50% Deposit";
  if (stage === "FINAL") return "Remaining Balance";
  return "Full Payment";
}

export default async function CustomProjectCheckoutPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { token } = await params;
  const query = await searchParams;

  const checkout = await getCustomCheckoutState(token);

  if (!checkout) {
    notFound();
  }

  const supabase = createAdminSupabaseClient();

  const [{ data: quotation }, { data: orderPricing, error: orderPricingError }] =
    await Promise.all([
      supabase
        .from("quotation_requests")
        .select("business_name,id")
        .eq("order_id", checkout.order.id)
        .maybeSingle(),
      supabase
        .from("orders")
        .select(
          "id,base_price,processing_fee_percent,processing_fee,total_amount",
        )
        .eq("id", checkout.order.id)
        .maybeSingle(),
    ]);

  if (orderPricingError) {
    console.error("Custom checkout pricing load error:", orderPricingError);
  }

  const paymentSuccess = query.payment_success === "1";
  const paymentProcessing = query.payment_processing === "1";
  const paymentCancelled = query.payment_cancelled === "1";
  const paymentError = query.payment_error === "1";

  const amountDue = checkout.currentPayment
    ? Number(checkout.currentPayment.amount)
    : 0;

  const paid = Number(checkout.order.amount_paid ?? 0);
  const balance = Number(
    checkout.order.balance_due ?? checkout.order.total_amount,
  );

  const projectTotal = Number(
    orderPricing?.total_amount ?? checkout.order.total_amount ?? 0,
  );

  const storedSubtotal = Number(orderPricing?.base_price ?? 0);
  const storedFeePercent = Number(orderPricing?.processing_fee_percent ?? 0);
  const storedFee = Number(orderPricing?.processing_fee ?? 0);

  const hasStoredFeePercent =
    orderPricing?.processing_fee_percent !== null &&
    orderPricing?.processing_fee_percent !== undefined &&
    Number.isFinite(Number(orderPricing.processing_fee_percent));

  const processingFeePercent = hasStoredFeePercent
    ? storedFeePercent
    : checkout.order.payment_terms === "DEPOSIT_50"
      ? 6
      : 4;

  const fallbackSubtotal =
    projectTotal > 0
      ? Number((projectTotal / (1 + processingFeePercent / 100)).toFixed(2))
      : 0;

  const quotationSubtotal =
    storedSubtotal > 0 ? storedSubtotal : fallbackSubtotal;

  const processingFee =
    storedFee >= 0 && orderPricing
      ? storedFee
      : Number(
          ((quotationSubtotal * processingFeePercent) / 100).toFixed(2),
        );

  const isBpiDirect =
    checkout.order.payment_terms === "FULL" && processingFeePercent <= 0.005;

  let bpiProof: {
    status: "PENDING" | "VERIFIED" | "REJECTED";
    rejection_reason: string | null;
  } | null = null;

  if (isBpiDirect && checkout.currentPayment) {
    const { data, error: proofError } = await supabase
      .from("bank_transfer_proofs")
      .select("status,rejection_reason")
      .eq("payment_id", checkout.currentPayment.id)
      .order("submitted_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (proofError) {
      console.error("BPI proof status load error:", proofError);
    } else {
      bpiProof = data as typeof bpiProof;
    }
  }

  const bpiAccountName = process.env.BPI_ACCOUNT_NAME?.trim() || "";
  const bpiAccountNumber = process.env.BPI_ACCOUNT_NUMBER?.trim() || "";
  const bpiDetailsReady = Boolean(bpiAccountName && bpiAccountNumber);

  /*
   * This URL is opened inside the payment popup after a confirmed payment.
   * Do not render the checkout/success page in that popup. Close it immediately
   * and refresh the original checkout window so the latest paid/balance state
   * appears there.
   */
  if (paymentSuccess) {
    return <PaymentSuccessCloser token={token} />;
  }

  /*
   * A completed custom-project payment should no longer leave the customer on
   * the payment form. Once the main checkout window refreshes after PayPal /
   * PayMongo, or once a manually reviewed BPI transfer is verified, send the
   * customer to the verified-payment success page.
   *
   * Keep this AFTER paymentSuccess so provider popups can still close normally.
   */
  if (checkout.state === "FULLY_PAID") {
    redirect(`/checkout/custom/${token}/success`);
  }

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <header className={styles.header}>
          <Link href="/" className={styles.brand}>
            TCL Systems &amp; Digitals PH
          </Link>
          <span>Secure Custom Project Checkout</span>
        </header>

        <section className={styles.hero}>
          <span className={styles.eyebrow}>CUSTOM PROJECT CHECKOUT</span>
          <h1>Payment prepared for your project</h1>
          <p>
            This payment page was prepared specifically for your project based
            on your accepted quotation. Please review the current project total,
            successful payments, and amount due before proceeding.
          </p>
        </section>

        {paymentProcessing ? (
          <div className={styles.notice}>
            Your QR Ph payment is being verified. This page will reflect the
            updated status once PayMongo confirms the payment.
          </div>
        ) : null}

        {paymentCancelled ? (
          <div className={styles.notice}>
            Payment was cancelled. No completed payment was recorded.
          </div>
        ) : null}

        {paymentError ? (
          <div className={styles.errorBox}>
            We could not confirm that payment. Please try again or contact us.
          </div>
        ) : null}

        <div className={styles.grid}>
          <section className={styles.card}>
            <div className={styles.cardHeading}>
              <span>PROJECT</span>
              <h2>Project summary</h2>
            </div>

            <div className={styles.rows}>
              <div>
                <span>Client / Project</span>
                <strong>
                  {quotation?.business_name || checkout.order.customer_name}
                </strong>
              </div>

              <div>
                <span>Project</span>
                <strong>{checkout.order.product_name}</strong>
              </div>

              <div>
                <span>Order Reference</span>
                <strong>{checkout.order.order_number}</strong>
              </div>

              <div>
                <span>Payment Terms</span>
                <strong>
                  {checkout.order.payment_terms === "DEPOSIT_50"
                    ? "50% Deposit + Remaining Balance"
                    : isBpiDirect
                      ? "Full Payment · Direct BPI Transfer"
                      : "Full Payment · Online Provider"}
                </strong>
              </div>
            </div>
          </section>

          <section className={styles.card}>
            <div className={styles.cardHeading}>
              <span>PAYMENT</span>
              <h2>Payment details</h2>
            </div>

            <div className={styles.moneyRows}>
              <section
                style={{
                  padding: "0 0 16px",
                  borderBottom: "1px solid rgba(27, 22, 24, 0.10)",
                }}
              >
                <div
                  style={{
                    marginBottom: 10,
                    fontSize: ".78rem",
                    fontWeight: 800,
                    letterSpacing: ".06em",
                    color: "#4b4045",
                  }}
                >
                  PROJECT PRICE
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "minmax(0, 1fr) auto",
                    columnGap: 20,
                    rowGap: 9,
                    alignItems: "center",
                  }}
                >
                  <span>Quotation subtotal</span>
                  <strong style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                    {money(quotationSubtotal)}
                  </strong>

                  <span>
                    {isBpiDirect
                      ? "Processing fee (Direct BPI)"
                      : `Payment provider fee (${processingFeePercent}%)`}
                  </span>
                  <strong style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                    {money(processingFee)}
                  </strong>

                  <span style={{ fontWeight: 700 }}>Project total</span>
                  <strong style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                    {money(projectTotal)}
                  </strong>
                </div>
              </section>

              <section
                style={{
                  padding: "16px 0",
                  borderBottom: checkout.currentPayment
                    ? "1px solid rgba(27, 22, 24, 0.10)"
                    : "none",
                }}
              >
                <div
                  style={{
                    marginBottom: 10,
                    fontSize: ".78rem",
                    fontWeight: 800,
                    letterSpacing: ".06em",
                    color: "#4b4045",
                  }}
                >
                  PAYMENT PROGRESS
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "minmax(0, 1fr) auto",
                    columnGap: 20,
                    rowGap: 9,
                    alignItems: "center",
                  }}
                >
                  <span>Paid</span>
                  <strong style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                    {money(paid)}
                  </strong>

                  <span>Remaining</span>
                  <strong style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                    {money(balance)}
                  </strong>
                </div>
              </section>

              {checkout.currentPayment ? (
                <div
                  className={styles.amountDue}
                  style={{
                    marginTop: 10,
                    display: "grid",
                    gridTemplateColumns: "minmax(0, 1fr) auto",
                    gap: 20,
                    alignItems: "center",
                  }}
                >
                  <span>{stageLabel(checkout.currentPayment.payment_stage)}</span>
                  <strong style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                    {money(amountDue)}
                  </strong>
                </div>
              ) : null}
            </div>

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
              <strong style={{ display: "block", marginBottom: 4 }}>
                {isBpiDirect ? "Direct BPI transfer" : "Payment provider fee"}
              </strong>
              {isBpiDirect
                ? "Direct BPI bank transfer is full-payment only and has no processing fee. Your payment remains pending until TCL manually verifies the transfer."
                : `A ${processingFeePercent}% payment-provider processing fee is included in the current project total. If the agreed project scope changes later, the same selected fee rate applies to the updated quotation subtotal. Successful payments already made remain credited toward the updated total.`}
            </div>

            {checkout.state === "PAYMENT_DUE" && checkout.currentPayment ? (
              isBpiDirect ? (
                <div className={styles.stateBox}>
                  <strong>Direct BPI Bank Transfer</strong>
                  <p>
                    Transfer the exact full amount below. Direct BPI transfer has
                    no processing fee and is manually verified by TCL.
                  </p>

                  <div
                    style={{
                      marginTop: 14,
                      display: "grid",
                      gap: 8,
                      padding: 14,
                      border: "1px solid #eadde2",
                      borderRadius: 12,
                      background: "#fff",
                    }}
                  >
                    <div><small>Amount to transfer</small><strong style={{ display: "block" }}>{money(amountDue)}</strong></div>
                    <div><small>Bank</small><strong style={{ display: "block" }}>BPI</strong></div>
                    <div><small>Account name</small><strong style={{ display: "block" }}>{bpiAccountName || "Not configured"}</strong></div>
                    <div>
                      <small>Account number</small>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          flexWrap: "wrap",
                          marginTop: 2,
                        }}
                      >
                        <strong>{bpiAccountNumber || "Not configured"}</strong>
                        {bpiAccountNumber ? (
                          <AccountNumberCopyButton
                            accountNumber={bpiAccountNumber}
                          />
                        ) : null}
                      </div>
                    </div>
                  </div>

                  {bpiDetailsReady ? (
                    <BpiProofUpload
                      token={token}
                      paymentId={checkout.currentPayment.id}
                      existingStatus={bpiProof?.status ?? null}
                      rejectionReason={bpiProof?.rejection_reason ?? null}
                    />
                  ) : (
                    <p style={{ marginTop: 14 }}>
                      BPI account details have not been configured yet. Please
                      contact TCL before sending payment.
                    </p>
                  )}
                </div>
              ) : (
                <>
                  <p
                    className={styles.paymentNote}
                    style={{ textAlign: "center" }}
                  >
                    Choose your preferred payment provider below. Previous
                    successful payments remain recorded and are not charged again.
                  </p>

                  <CustomCheckoutActions token={token} />
                </>
              )
            ) : null}

            {checkout.state === "WAITING_FOR_FINAL" ? (
              <div className={styles.stateBox}>
                <strong>
                  {checkout.order.payment_terms === "DEPOSIT_50"
                    ? "Deposit received."
                    : "Previous payment received."}
                </strong>
                <p>
                  A remaining project balance exists, but it has not been
                  requested yet. TCL Systems &amp; Digitals PH will activate the
                  next payment when it is due.
                </p>
              </div>
            ) : null}

            {checkout.state === "FULLY_PAID" ? (
              <div className={styles.stateBox}>
                <strong>Fully paid ✓</strong>
                <p>No balance is currently due for this project.</p>
              </div>
            ) : null}

            {checkout.state === "CANCELLED" ? (
              <div className={styles.errorBox}>
                This project order has been cancelled and can no longer accept
                payment.
              </div>
            ) : null}
          </section>
        </div>

        <footer className={styles.footer}>
          <span>Powered by TCL Systems &amp; Digitals PH</span>
          <span>
            Payment details are based on the current agreed project total and
            successful payments already recorded.
          </span>
        </footer>
      </div>
    </main>
  );
}
