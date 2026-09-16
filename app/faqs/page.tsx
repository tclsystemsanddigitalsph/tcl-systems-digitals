import type { Metadata } from "next";
import Link from "next/link";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import FAQSearchClient from "@/components/FAQSearchClient";
import styles from "./faqs.module.css";

export const metadata: Metadata = {
  title: "FAQs | TCL Systems & Digitals PH",
  description:
    "Answers about TCL websites, booking systems, custom development, quotations, payments, maintenance support, domains, delivery, and project policies.",
};

export default function FAQsPage() {
  return (
    <>
      <SiteHeader />

      <main className={styles.page}>
        <section className={styles.hero}>
          <div className={styles.heroGlowOne} />
          <div className={styles.heroGlowTwo} />

          <div className={`container ${styles.heroInner}`}>
            <span className={styles.eyebrow}>TCL HELP CENTER ♡</span>

            <h1>
              Questions?
              <span>Start here.</span>
            </h1>

            <p>
              Clear answers about TCL website packages, custom development,
              quotations, payments, maintenance support, domains, delivery,
              project communication, and what happens after your purchase.
            </p>

            <div className={styles.heroActions}>
              <Link className="button button-primary" href="/shop">
                Browse Solutions
                <span>→</span>
              </Link>

              <Link
                className="button button-secondary"
                href="/how-it-works"
              >
                How It Works
              </Link>
            </div>

            <div className={styles.heroQuickLinks}>
              <a href="#faq-02">
                <strong>Quotation</strong>
                <span>Custom project pricing</span>
              </a>

              <a href="#faq-03">
                <strong>Communication</strong>
                <span>Calls & project discussions</span>
              </a>

              <a href="#faq-04">
                <strong>Payments</strong>
                <span>Fees & payment options</span>
              </a>

              <a href="#faq-09">
                <strong>Support</strong>
                <span>Maintenance periods</span>
              </a>
            </div>
          </div>
        </section>

        <FAQSearchClient />

        <section className={styles.bottomCta}>
          <div className={`container ${styles.bottomCtaInner}`}>
            <div>
              <span className={styles.ctaKicker}>NEED SOMETHING CUSTOM?</span>

              <h2>
                Your project starts
                <span>with your requirements.</span>
              </h2>

              <p>
                For custom websites or systems, submit your requirements through
                the quotation form. There is no commitment to purchase just for
                requesting a quote.
              </p>
            </div>

            <div className={styles.ctaActions}>
              <Link
                className="button button-white"
                href="/shop/custom-business-website"
              >
                Request a Quote
                <span>→</span>
              </Link>

              <Link
                className="button button-outline-light"
                href="/shop"
              >
                Browse Solutions
              </Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}