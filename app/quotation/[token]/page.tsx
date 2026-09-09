import Link from "next/link";
import { notFound } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { createAdminSupabaseClient } from "@/lib/supabase-admin";
import { acceptQuotation, decideLater } from "./actions";
import styles from "./quotation.module.css";

export const dynamic = "force-dynamic";

function money(value: number | string | null | undefined) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value ?? 0));
}

function termsLabel(value: string | null) {
  return value === "DEPOSIT_50"
    ? "50% Deposit + 50% Before Handover"
    : "Full Payment";
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
      "id,secure_token,status,quoted_amount,quoted_at,payment_terms,accepted_at,order_id,product_name,full_name,business_name,email,business_type,main_goal,selected_features,admin_notes",
    )
    .eq("secure_token", token)
    .maybeSingle();

  if (error) {
    console.error("Client quotation load error:", error);
  }

  if (!quotation) {
    notFound();
  }

  let processingFeePercent = 0;

  const { data: product } = await supabase
    .from("products")
    .select("processing_fee_percent")
    .eq("slug", "custom-business-website")
    .maybeSingle();

  processingFeePercent = Number(product?.processing_fee_percent ?? 0);

  const base = Number(quotation.quoted_amount ?? 0);
  const fee = Number(((base * processingFeePercent) / 100).toFixed(2));
  const total = Number((base + fee).toFixed(2));
  const dueNow =
    quotation.payment_terms === "DEPOSIT_50"
      ? Number((total / 2).toFixed(2))
      : total;

  const features = Array.isArray(quotation.selected_features)
    ? quotation.selected_features.filter((item): item is string => typeof item === "string")
    : [];

  const isReviewable =
    quotation.status === "QUOTED" &&
    base > 0 &&
    (quotation.payment_terms === "FULL" ||
      quotation.payment_terms === "DEPOSIT_50");

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
              <h1>Your custom project quotation.</h1>
              <p>
                Review the project details, pricing, and payment terms before
                deciding whether to continue.
              </p>
            </div>

            <div className={styles.status}>
              <small>Quotation status</small>
              <strong>{quotation.status}</strong>
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
                  contact TCL Systems &amp; Digitals PH so we can check it for you.
                </div>
              ) : null}

              <section className={styles.card}>
                <span className={styles.sectionLabel}>PROJECT</span>
                <h2>{quotation.product_name || "Custom Business Website"}</h2>

                <div className={styles.details}>
                  <div>
                    <small>Prepared for</small>
                    <strong>{quotation.full_name || "Client"}</strong>
                  </div>
                  <div>
                    <small>Business</small>
                    <strong>{quotation.business_name || "—"}</strong>
                  </div>
                  <div>
                    <small>Business type</small>
                    <strong>{quotation.business_type || "—"}</strong>
                  </div>
                </div>

                {quotation.main_goal ? (
                  <div className={styles.block}>
                    <small>Project goal</small>
                    <p>{quotation.main_goal}</p>
                  </div>
                ) : null}

                {features.length ? (
                  <div className={styles.block}>
                    <small>Requested features</small>
                    <div className={styles.features}>
                      {features.map((feature) => (
                        <span key={feature}>✓ {feature}</span>
                      ))}
                    </div>
                  </div>
                ) : null}

                {quotation.admin_notes ? (
                  <div className={styles.block}>
                    <small>Quotation / scope notes</small>
                    <p>{quotation.admin_notes}</p>
                  </div>
                ) : null}
              </section>

              <section className={styles.card}>
                <span className={styles.sectionLabel}>PAYMENT TERMS</span>
                <h2>{termsLabel(quotation.payment_terms)}</h2>
                <p className={styles.muted}>
                  {quotation.payment_terms === "DEPOSIT_50"
                    ? "The first 50% is due after accepting this quotation. The remaining project balance is due before final handover."
                    : "The full project amount is due after accepting this quotation."}
                </p>
              </section>
            </div>

            <aside className={styles.side}>
              <section className={styles.priceCard}>
                <span className={styles.sectionLabel}>QUOTATION SUMMARY</span>

                <div className={styles.priceRow}>
                  <span>Project price</span>
                  <strong>{money(base)}</strong>
                </div>

                <div className={styles.priceRow}>
                  <span>Processing fee ({processingFeePercent}%)</span>
                  <strong>{money(fee)}</strong>
                </div>

                <div className={`${styles.priceRow} ${styles.total}`}>
                  <span>Project total</span>
                  <strong>{money(total)}</strong>
                </div>

                <div className={styles.due}>
                  <small>Amount due after acceptance</small>
                  <strong>{money(dueNow)}</strong>
                  {quotation.payment_terms === "DEPOSIT_50" ? (
                    <span>Remaining balance after deposit: {money(total - dueNow)}</span>
                  ) : null}
                </div>

                {isReviewable ? (
                  <div className={styles.actions}>
                    <form action={acceptQuotation}>
                      <input type="hidden" name="token" value={token} />
                      <button className={styles.accept} type="submit">
                        Accept Quotation →
                      </button>
                    </form>

                    <form action={decideLater}>
                      <input type="hidden" name="token" value={token} />
                      <button className={styles.later} type="submit">
                        Decide Later
                      </button>
                    </form>

                    <p className={styles.finePrint}>
                      Accepting creates your project order and takes you to the
                      secure custom checkout. No payment is made by simply
                      viewing this page.
                    </p>
                  </div>
                ) : quotation.status === "ACCEPTED" && quotation.order_id ? (
                  <div className={styles.acceptedBox}>
                    <strong>Quotation accepted</strong>
                    <p>
                      Your project order has already been created. If you need
                      your checkout link again, please contact TCL.
                    </p>
                  </div>
                ) : (
                  <div className={styles.unavailable}>
                    This quotation is not currently available for acceptance.
                    Please contact TCL if you need an updated quotation.
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
