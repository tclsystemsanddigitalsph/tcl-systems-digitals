import type { Metadata } from "next";
import Link from "next/link";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import FAQSearchClient from "@/components/FAQSearchClient";
import styles from "./faqs.module.css";

export const metadata: Metadata = {
  title: "FAQs | TCL Systems & Digitals PH",
  description:
    "Easy-to-understand answers about TCL Systems & Digitals PH products, payments, delivery, support, customization, policies, booking systems, and websites.",
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
            <span className={styles.eyebrow}>TCL Help Center ♡</span>
            <h1>
              Questions before you buy?
              <span>Everything is right here.</span>
            </h1>
            <p>
              Simple answers about TCL products, payments, delivery, support,
              customization, policies, booking systems, websites, and more.
            </p>

            <div className={styles.heroActions}>
              <Link className="button button-primary" href="/shop">
                Browse Products
                <span>→</span>
              </Link>
              <Link className="button button-secondary" href="/policies">
                View Policies
              </Link>
            </div>
          </div>
        </section>

        <FAQSearchClient />

        <section className={styles.bottomCta}>
          <div className={`container ${styles.bottomCtaInner}`}>
            <div>
              <span className={styles.ctaKicker}>Still have a question?</span>
              <h2>
                Tell me what you need.
                <span>I&apos;ll help you figure it out.</span>
              </h2>
              <p>
                If you are not sure which product fits your business, you can
                message TCL before buying.
              </p>
            </div>

            <div className={styles.ctaActions}>
              <a
                className="button button-white"
                href="https://t.me/tclsystemsanddigitalsph"
                target="_blank"
                rel="noreferrer"
              >
                Contact TCL
                <span>→</span>
              </a>
              <Link className="button button-outline-light" href="/shop">
                Shop Products
              </Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
