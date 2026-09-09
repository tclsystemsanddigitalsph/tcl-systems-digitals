import Link from "next/link";
import { notFound } from "next/navigation";
import { createAdminSupabaseClient } from "@/lib/supabase-admin";
import { getCustomCheckoutState } from "@/lib/custom-order-payments";
import CustomCheckoutActions from "./CustomCheckoutActions";
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
  if (stage === "FINAL") return "Final 50% Balance";
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

  const { data: quotation } = await supabase
    .from("quotation_requests")
    .select("business_name,id")
    .eq("order_id", checkout.order.id)
    .maybeSingle();

  const paymentSuccess = query.payment_success === "1";
  const paymentProcessing = query.payment_processing === "1";
  const paymentCancelled = query.payment_cancelled === "1";
  const paymentError = query.payment_error === "1";

  const amountDue = checkout.currentPayment
    ? Number(checkout.currentPayment.amount)
    : 0;

  const paid = Number(checkout.order.amount_paid ?? 0);
  const balance = Number(checkout.order.balance_due ?? checkout.order.total_amount);

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <header className={styles.header}>
          <Link href="/" className={styles.brand}>
            TCL Systems & Digitals PH
          </Link>
          <span>Secure Custom Project Checkout</span>
        </header>

        <section className={styles.hero}>
          <span className={styles.eyebrow}>CUSTOM PROJECT CHECKOUT</span>
          <h1>Payment prepared for your project</h1>
          <p>
            This payment page was prepared specifically for your project based
            on your accepted quotation. Please review the project total and
            payment details below before proceeding.
          </p>
        </section>

        {paymentSuccess ? (
          <div className={styles.success}>
            Payment received successfully. Your project payment record has been
            updated.
          </div>
        ) : null}

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
                <span>Client / Business</span>
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
                    ? "50% Deposit + 50% Before Handover"
                    : "Full Payment"}
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
              <div>
                <span>Project total</span>
                <strong>{money(checkout.order.total_amount)}</strong>
              </div>
              <div>
                <span>Amount paid</span>
                <strong>{money(paid)}</strong>
              </div>
              <div>
                <span>Remaining balance</span>
                <strong>{money(balance)}</strong>
              </div>

              {checkout.currentPayment ? (
                <div className={styles.amountDue}>
                  <span>{stageLabel(checkout.currentPayment.payment_stage)}</span>
                  <strong>{money(amountDue)}</strong>
                </div>
              ) : null}
            </div>

            {checkout.state === "PAYMENT_DUE" && checkout.currentPayment ? (
              <>
                <p className={styles.paymentNote}>
                  Choose how you would like to pay the amount currently due.
                </p>
                <CustomCheckoutActions token={token} />
              </>
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
                  requested yet. TCL Systems & Digitals PH will activate the
                  next payment when it is due.
                </p>
              </div>
            ) : null}

            {checkout.state === "FULLY_PAID" ? (
              <div className={styles.stateBox}>
                <strong>Fully paid ✓</strong>
                <p>
                  No balance is currently due for this project.
                </p>
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
          <span>Powered by TheClawLabMNL Systems</span>
          <span>Payment details are calculated from your accepted quotation.</span>
        </footer>
      </div>
    </main>
  );
}
