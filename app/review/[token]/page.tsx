import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createAdminSupabaseClient } from "@/lib/supabase-admin";
import { submitInvitedReview } from "./actions";
import styles from "./review.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Leave a Review | TCL Systems & Digitals PH",
  robots: {
    index: false,
    follow: false,
  },
};

function expired(expiresAt: string | null) {
  return Boolean(expiresAt && new Date(expiresAt).getTime() < Date.now());
}

export default async function ReviewInvitationPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ submitted?: string }>;
}) {
  const { token } = await params;
  const { submitted } = await searchParams;

  const admin = createAdminSupabaseClient();

  const { data: invite, error } = await admin
    .from("review_invitations")
    .select(
      "id,customer_name,customer_email,product_name,status,expires_at,used_at",
    )
    .eq("token", token)
    .maybeSingle();

  if (error || !invite) notFound();

  const isExpired = expired(invite.expires_at);
  const alreadySubmitted = submitted === "1" || invite.status === "USED";
  const unavailable =
    invite.status === "REVOKED" ||
    invite.status === "EXPIRED" ||
    isExpired;

  return (
    <main className={styles.page}>
      <section className={styles.shell}>
        <a className={styles.brand} href="/">
          <span>TCL</span>
          <div>
            <strong>TCL Systems</strong>
            <small>&amp; Digitals PH</small>
          </div>
        </a>

        {alreadySubmitted ? (
          <div className={styles.stateCard}>
            <div className={styles.icon}>✓</div>
            <span className={styles.eyebrow}>REVIEW RECEIVED</span>
            <h1>Thank you, {invite.customer_name}!</h1>
            <p>
              Your review has been submitted successfully and is now waiting
              for approval before it appears on the website.
            </p>
            <a className={styles.primaryLink} href="/">
              Return to TCL Systems
            </a>
          </div>
        ) : unavailable ? (
          <div className={styles.stateCard}>
            <div className={styles.icon}>×</div>
            <span className={styles.eyebrow}>LINK UNAVAILABLE</span>
            <h1>This review link is no longer active.</h1>
            <p>
              The invitation may have expired or been revoked. Please contact
              TCL Systems &amp; Digitals PH if you need a new review link.
            </p>
            <a className={styles.primaryLink} href="/">
              Return Home
            </a>
          </div>
        ) : (
          <>
            <header className={styles.hero}>
              <span className={styles.eyebrow}>PRIVATE REVIEW INVITATION</span>
              <h1>How was your experience?</h1>
              <p>
                Hi {invite.customer_name}! We&apos;d love to hear what you
                think about your experience with TCL Systems &amp; Digitals PH.
              </p>
            </header>

            <div className={styles.productCard}>
              <span>REVIEWING</span>
              <strong>{invite.product_name || "TCL Systems & Digitals PH"}</strong>
              {invite.customer_email ? (
                <small>Invitation sent for {invite.customer_email}</small>
              ) : null}
            </div>

            <form action={submitInvitedReview} className={styles.form}>
              <input type="hidden" name="token" value={token} />

              <fieldset className={styles.ratingField}>
                <legend>Your rating</legend>
                <div className={styles.stars}>
                  {[5, 4, 3, 2, 1].map((value) => (
                    <div className={styles.starOption} key={value}>
                      <input
                        id={`rating-${value}`}
                        name="rating"
                        type="radio"
                        value={value}
                        required
                      />
                      <label htmlFor={`rating-${value}`}>★</label>
                    </div>
                  ))}
                </div>
                <small>Select 1 to 5 stars.</small>
              </fieldset>

              <div className={styles.field}>
                <label htmlFor="business_name">
                  Business name <span>Optional</span>
                </label>
                <input
                  id="business_name"
                  name="business_name"
                  maxLength={150}
                  placeholder="Your business or brand name"
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="review_text">Your review</label>
                <textarea
                  id="review_text"
                  name="review_text"
                  rows={7}
                  minLength={10}
                  maxLength={3000}
                  required
                  placeholder="Tell us what you liked, how the system helped your business, or anything you'd like others to know."
                />
                <small>Minimum 10 characters.</small>
              </div>

              <div className={styles.field}>
                <label htmlFor="social_url">
                  Website or social page <span>Optional</span>
                </label>
                <input
                  id="social_url"
                  name="social_url"
                  type="url"
                  maxLength={500}
                  placeholder="https://instagram.com/yourbusiness"
                />
              </div>

              <div className={styles.notice}>
                <strong>Before you submit</strong>
                <p>
                  Reviews are checked before being published. By submitting,
                  you allow TCL Systems &amp; Digitals PH to display your name,
                  business name, rating, and review on its website and social
                  media.
                </p>
              </div>

              <button className={styles.submit} type="submit">
                Submit My Review
              </button>
            </form>
          </>
        )}

        <footer className={styles.footer}>
          © {new Date().getFullYear()} TCL Systems &amp; Digitals PH
        </footer>
      </section>
    </main>
  );
}
