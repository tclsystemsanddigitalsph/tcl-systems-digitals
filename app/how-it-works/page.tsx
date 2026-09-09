import type { Metadata } from "next";
import Link from "next/link";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import styles from "./how-it-works.module.css";

export const metadata: Metadata = {
  title: "How It Works | TCL Systems & Digitals PH",
  description:
    "See how buying a TCL digital product, booking system, website, or custom solution works from choosing a product to delivery and support.",
};

const steps = [
  {
    number: "01",
    title: "Explore your options",
    description:
      "Browse the shop and check what each product is made for. Look at the features, price, delivery type, and whether it is ready-made or customized.",
  },
  {
    number: "02",
    title: "Check the details",
    description:
      "Read the product page carefully so you know exactly what is included, what is not included, and what you may need to prepare.",
  },
  {
    number: "03",
    title: "Ask before you buy",
    description:
      "If you are not sure which option fits your business, message TCL first. You can explain what you need and we can help point you in the right direction.",
  },
  {
    number: "04",
    title: "Complete your purchase",
    description:
      "Choose your available payment method and review the final amount before paying. Once payment is confirmed, your order can move to delivery or setup.",
  },
  {
    number: "05",
    title: "Receive your product",
    description:
      "Digital products may be delivered automatically. Systems or custom work may include setup instructions, a customer guide, account handover, or other next steps.",
  },
  {
    number: "06",
    title: "Use it for your business",
    description:
      "Follow the included guide and start using your product. If your system has an admin dashboard, you can manage the normal business updates from there.",
  },
];

const purchaseTypes = [
  {
    title: "Digital Downloads",
    text: "Best for templates, guides, and ready-to-download business resources. After payment is confirmed, you receive access based on the product's delivery setup.",
  },
  {
    title: "Ready-Made Systems",
    text: "Best when you want a working system without starting from zero. You choose the product, follow the setup or handover instructions, and customize the normal business details that are included.",
  },
  {
    title: "Custom Websites & Systems",
    text: "Best when your business needs something more specific. You discuss your needs with TCL first, receive the scope or quote, and the project is prepared around your business.",
  },
];

const prepare = [
  "Your business name and contact details",
  "Your logo and brand colors, if available",
  "Your services, prices, or product information",
  "Business photos or content you want to use",
  "Any special feature or workflow you need",
  "A working email address you can access",
];

const afterPurchase = [
  {
    title: "Save your files",
    text: "Download and back up anything you receive so you always have your own copy.",
  },
  {
    title: "Read your guide",
    text: "If your purchase comes with instructions or a customer manual, go through it before making major changes.",
  },
  {
    title: "Keep logins private",
    text: "Do not share admin passwords, secure links, or private customer information publicly.",
  },
  {
    title: "Ask for help when needed",
    text: "If an included feature is not working or you are unsure how to use something, check your support details and contact TCL when needed.",
  },
];

export default function HowItWorksPage() {
  return (
    <>
      <SiteHeader />

      <main className={styles.page}>
        <section className={styles.hero}>
          <div className={`container ${styles.heroInner}`}>
            <span className={styles.kicker}>Simple from the start ♡</span>
            <h1>
              From choosing a product
              <span>to actually using it.</span>
            </h1>
            <p>
              Here&apos;s what to expect when you buy a digital product, booking
              system, website, or customized solution from TCL.
            </p>

            <div className={styles.heroActions}>
              <Link className="button button-primary" href="/shop">
                Browse Products
                <span>→</span>
              </Link>
              <Link className="button button-secondary" href="/faqs">
                Read FAQs
              </Link>
            </div>
          </div>
        </section>

        <section className={styles.stepsSection}>
          <div className="container">
            <div className={styles.sectionIntro}>
              <span className={styles.kicker}>The process</span>
              <h2>How a TCL purchase works.</h2>
              <p>
                No complicated process. Just clear steps so you know what happens
                before, during, and after your purchase.
              </p>
            </div>

            <div className={styles.stepsGrid}>
              {steps.map((step) => (
                <article className={styles.stepCard} key={step.number}>
                  <span className={styles.stepNumber}>{step.number}</span>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.typesSection}>
          <div className="container">
            <div className={styles.sectionIntro}>
              <span className={styles.kicker}>Different products, different delivery</span>
              <h2>What happens depends on what you buy.</h2>
            </div>

            <div className={styles.typesGrid}>
              {purchaseTypes.map((type) => (
                <article className={styles.typeCard} key={type.title}>
                  <span>♡</span>
                  <h3>{type.title}</h3>
                  <p>{type.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.prepareSection}>
          <div className={`container ${styles.prepareGrid}`}>
            <div>
              <span className={styles.kicker}>For custom work</span>
              <h2>What should you prepare?</h2>
              <p>
                You do not need to have everything perfect, but having these
                ready can make setup much smoother.
              </p>
            </div>

            <div className={styles.prepareList}>
              {prepare.map((item) => (
                <div key={item}>
                  <span>✓</span>
                  <p>{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.afterSection}>
          <div className="container">
            <div className={styles.sectionIntro}>
              <span className={styles.kicker}>After your purchase</span>
              <h2>A few important things to remember.</h2>
            </div>

            <div className={styles.afterGrid}>
              {afterPurchase.map((item, index) => (
                <article className={styles.afterCard} key={item.title}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.bottomCta}>
          <div className={`container ${styles.bottomCtaInner}`}>
            <div>
              <span className={styles.ctaKicker}>Not sure where to start?</span>
              <h2>
                Tell TCL what your business needs.
                <span>We&apos;ll help you choose.</span>
              </h2>
              <p>
                You can ask questions before buying, especially if you are
                choosing between a ready-made product and a custom solution.
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
