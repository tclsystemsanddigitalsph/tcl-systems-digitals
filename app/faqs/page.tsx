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
          <div className={`container ${styles.heroInner}`}>
            <span className={styles.eyebrow}>TCL / HELP CENTER / 2026</span>

            <h1>
              FREQUENTLY
              <span>ASKED.</span>
            </h1>

            <p>
              Quick answers about websites, custom development, payments,
              domains, delivery, support, and working with TCL.
            </p>

            <div className={styles.heroActions}>
              <Link className="button button-primary" href="/shop">
                Browse Solutions <span>→</span>
              </Link>

              <Link className="button button-secondary" href="/how-it-works">
                How It Works
              </Link>
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
                Tell TCL what you need through the quotation form. Requesting a
                quote does not commit you to a purchase.
              </p>
            </div>

            <div className={styles.ctaActions}>
              <Link
                className="button button-white"
                href="/shop/custom-business-website"
              >
                Request a Quote <span>→</span>
              </Link>
              <Link className="button button-outline-light" href="/shop">
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
