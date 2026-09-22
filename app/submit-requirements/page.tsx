import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import SubmitRequirementsForm from "./SubmitRequirementsForm";
import styles from "./submit-requirements.module.css";

export const metadata: Metadata = {
  title: "Submit Requirements | TCL Systems & Digitals PH",
  description:
    "Submit your project requirements for a TCL Systems & Digitals PH purchase made through Etsy, RaketPH, or another external marketplace.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function SubmitRequirementsPage() {
  return (
    <>
      <SiteHeader />

      <main className={styles.page}>
        <section className={styles.hero}>
          <div className={styles.heroGlow} aria-hidden="true" />

          <div className={`container ${styles.heroInner}`}>
            <div className={styles.eyebrow}>
              <span className={styles.eyebrowDot} />
              EXTERNAL MARKETPLACE ORDERS
            </div>

            <h1>
              Let&apos;s get your
              <span> project started.</span>
            </h1>

            <p className={styles.heroCopy}>
              Purchased a TCL website or system through Etsy, RaketPH, or
              another marketplace? Submit your order details, project content,
              and brand assets here so we can prepare your build.
            </p>

            <div className={styles.heroNotes}>
              <div>
                <strong>01</strong>
                <span>Verify your purchase details</span>
              </div>

              <div>
                <strong>02</strong>
                <span>Tell us about your project</span>
              </div>

              <div>
                <strong>03</strong>
                <span>Review &amp; submit</span>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.formArea}>
          <div className="container">
            <div className={styles.formIntro}>
              <div>
                <span>PROJECT ONBOARDING</span>
                <h2>Submit your requirements</h2>
              </div>

              <p>
                You&apos;ll only be asked for information relevant to the
                product you purchased. You can review everything before your
                final submission.
              </p>
            </div>

            <SubmitRequirementsForm />
          </div>
        </section>

        <section className={styles.noticeSection}>
          <div className={`container ${styles.noticeInner}`}>
            <div className={styles.noticeIcon} aria-hidden="true">
              ✓
            </div>

            <div>
              <span>BEFORE WE BEGIN</span>
              <h2>Your marketplace purchase will be verified.</h2>
              <p>
                The product and package selected in this form must match your
                marketplace order. Requests outside the purchased package may
                require a separate quotation or additional fee.
              </p>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
