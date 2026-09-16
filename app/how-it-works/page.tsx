import type { Metadata } from "next";
import Link from "next/link";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import styles from "./how-it-works.module.css";

export const metadata: Metadata = {
  title: "How It Works | TCL Systems & Digitals PH",
  description:
    "Learn how TCL purchases, quotations, custom projects, payments, project communication, delivery, and support work.",
};

const shopSteps = [
  {
    number: "01",
    title: "Choose",
    description:
      "Browse the shop, compare the available solutions, and read the product details and inclusions before purchasing.",
  },
  {
    number: "02",
    title: "Purchase",
    description:
      "Complete checkout using an available payment option and wait for payment confirmation.",
  },
  {
    number: "03",
    title: "Receive",
    description:
      "Receive your digital access, files, instructions, or the next setup steps included with your purchase.",
  },
  {
    number: "04",
    title: "Set Up & Use",
    description:
      "Follow the provided instructions and begin preparing or using the solution for your business.",
  },
];

const customSteps = [
  {
    number: "01",
    title: "Submit your requirements",
    description:
      "Complete the Request a Quote form with as much information as possible about your business, required features, workflow, and project goals.",
  },
  {
    number: "02",
    title: "Requirements are reviewed",
    description:
      "TCL reviews the information you submitted. Additional questions may be sent through written communication if something needs clarification.",
  },
  {
    number: "03",
    title: "Receive your quotation",
    description:
      "A private quotation is prepared based on the reviewed requirements and proposed project scope.",
  },
  {
    number: "04",
    title: "Review & accept",
    description:
      "Review the scope, pricing, and project details carefully. If everything looks right, accept the quotation and select the available payment option.",
  },
  {
    number: "05",
    title: "Development begins",
    description:
      "Once the required payment and project materials are received, development can proceed according to the accepted scope.",
  },
  {
    number: "06",
    title: "Review & feedback",
    description:
      "When your project reaches the review stage, you can check the website or system and provide the required feedback in writing.",
  },
  {
    number: "07",
    title: "Final payment",
    description:
      "If your project uses a down payment arrangement, the remaining balance is requested when it becomes due according to the project process.",
  },
  {
    number: "08",
    title: "Completion & turnover",
    description:
      "After completion and settlement of the required balance, final access, files, instructions, or account handover are provided as applicable.",
  },
];

const purchaseTypes = [
  {
    number: "01",
    title: "Digital Products",
    description:
      "Templates, guides, files, and other ready-to-download resources with access provided according to the product's delivery setup.",
  },
  {
    number: "02",
    title: "Fixed-Price Solutions",
    description:
      "Website or system packages with an established price and clearly defined inclusions. Check the product page to see exactly what is included.",
  },
  {
    number: "03",
    title: "Custom Development",
    description:
      "Websites and web-based systems that require individual review because the features, workflow, integrations, and development requirements vary by project.",
  },
];

const quoteReasons = [
  {
    title: "Project type is not enough",
    text: 'Terms such as "website," "online shop," or "booking system" describe a category, but they do not tell TCL how much development the actual project requires.',
  },
  {
    title: "Features affect the scope",
    text: "Customer accounts, dashboards, automated payments, booking rules, memberships, databases, integrations, inventory, and other functionality can significantly change the work required.",
  },
  {
    title: "Every business works differently",
    text: "Two businesses requesting the same type of website may have completely different workflows, content, features, users, and management requirements.",
  },
  {
    title: "Pricing should match the actual request",
    text: "Reviewing your requirements first helps TCL prepare pricing based on what you actually need instead of giving a number that may later be inaccurate or misleading.",
  },
];

const quoteRules = [
  "The Request a Quote form is required for projects that do not have a fixed published price.",
  "Submitting the form is only a request for review. It does not obligate you to accept the quotation or proceed with the project.",
  "Please provide as much information as possible about the project and the features you need.",
  "If you do not know the technical term for a feature, simply explain what you want your customer, staff, or admin to be able to do.",
  "TCL may ask written follow-up questions before a quotation is prepared if the requirements are incomplete or unclear.",
  "The quotation is based on the requirements and scope available at the time it is prepared.",
  "The client is responsible for reviewing the quotation and scope before accepting it.",
  "Requests added or changed after quotation or acceptance may require a scope and pricing review.",
  "Third-party expenses such as domains, paid services, hosting upgrades, external APIs, payment provider charges, or other services may be separate when applicable.",
  "An introductory call does not replace the Request a Quote form or written project requirements.",
];

const communicationRules = [
  {
    title: "Written communication is the standard",
    text: "Project requirements, quotations, scope, pricing discussions, approvals, revisions, feature requests, and other important project matters are handled through chat or another written communication channel.",
  },
  {
    title: "No in-person appointments",
    text: "TCL does not currently offer in-person meetings or consultations. This allows project work and communication to be managed around a limited development schedule.",
  },
  {
    title: "Short introductory calls may be available",
    text: "A brief introductory call may be accommodated when scheduling permits for clients who want to verify that they are speaking with a real person, introduce themselves, or ask general questions about TCL and its services.",
  },
  {
    title: "Calls are not project consultations",
    text: "Introductory calls are not used to determine project scope, provide custom quotations, finalize requirements, approve changes, or replace written project communication.",
  },
];

const prepare = [
  "Business or project name",
  "Logo and brand colors, if available",
  "Services, prices, or product information",
  "Photos, text, and other business content",
  "Requested features or business workflow",
  "An active email address you can access",
];

const reminders = [
  {
    number: "01",
    title: "Keep your files",
    description:
      "Save and back up the files, guides, and other materials delivered with your purchase or project.",
  },
  {
    number: "02",
    title: "Read the instructions",
    description:
      "Check the included guide or handover information before changing important settings.",
  },
  {
    number: "03",
    title: "Protect private access",
    description:
      "Keep admin credentials, private project links, and customer information secure.",
  },
  {
    number: "04",
    title: "Know your support scope",
    description:
      "Included support follows the terms provided with your product or project. Future changes or additional features may require a separate fee.",
  },
];

export default function HowItWorksPage() {
  return (
    <>
      <SiteHeader />

      <main className={styles.page}>
        {/* HERO */}
        <section className={styles.hero}>
          <div className={styles.heroInner}>
            <span className={styles.heroKicker}>HOW IT WORKS</span>

            <h1>
              Clear from the
              <span>very beginning.</span>
            </h1>

            <p>
              Whether you&apos;re buying a fixed-price solution or having
              something custom built, you&apos;ll know what happens before,
              during, and after your purchase.
            </p>

            <div className={styles.heroActions}>
              <Link href="/shop" className={styles.primaryButton}>
                Browse Solutions <span>→</span>
              </Link>

              <Link href="/faqs" className={styles.secondaryButton}>
                Read FAQs
              </Link>
            </div>

            <div className={styles.heroRoutes}>
              <div>
                <strong>Shop</strong>
                <span>Choose → Pay → Receive</span>
              </div>

              <div>
                <strong>Custom</strong>
                <span>Request → Quote → Build</span>
              </div>
            </div>
          </div>
        </section>

        {/* PURCHASE TYPES */}
        <section className={styles.typesSection}>
          <div className={styles.container}>
            <div className={styles.sectionHeading}>
              <span className={styles.kicker}>START HERE</span>
              <h2>What are you getting?</h2>
              <p>
                Some TCL solutions already have a fixed price. Custom
                development follows a quotation process because the scope
                depends on your requirements.
              </p>
            </div>

            <div className={styles.typesGrid}>
              {purchaseTypes.map((type) => (
                <article className={styles.typeCard} key={type.title}>
                  <span className={styles.typeNumber}>{type.number}</span>
                  <div className={styles.typeHeart}>♡</div>
                  <h3>{type.title}</h3>
                  <p>{type.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* SHOP FLOW */}
        <section className={styles.shopSection}>
          <div className={styles.container}>
            <div className={styles.flowHeader}>
              <div>
                <span className={styles.kicker}>FIXED-PRICE PURCHASES</span>

                <h2>
                  See it. Choose it.
                  <span>Make it yours.</span>
                </h2>
              </div>

              <p>
                For products and solutions that already have a published price
                and defined inclusions, you can review the details and purchase
                directly through the shop.
              </p>
            </div>

            <div className={styles.flowGrid}>
              {shopSteps.map((step, index) => (
                <article className={styles.flowStep} key={step.number}>
                  <div className={styles.flowTop}>
                    <span>{step.number}</span>

                    {index < shopSteps.length - 1 && (
                      <div className={styles.flowLine} />
                    )}
                  </div>

                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </article>
              ))}
            </div>

            <div className={styles.flowAction}>
              <Link href="/shop">
                Browse the Shop <span>→</span>
              </Link>
            </div>
          </div>
        </section>

        {/* QUOTATION POLICY */}
        <section className={styles.quoteSection}>
          <div className={styles.container}>
            <div className={styles.quoteHeader}>
              <div>
                <span className={styles.kicker}>CUSTOM PROJECT QUOTATIONS</span>

                <h2>
                  Why do I need to
                  <span>fill out the quote form?</span>
                </h2>
              </div>

              <div className={styles.quoteHeaderCopy}>
                <strong>
                  Custom development is priced by scope, not just by the type of
                  website.
                </strong>

                <p>
                  TCL does not provide random custom-project estimates based
                  only on a short message such as &quot;How much is a
                  website?&quot; or &quot;How much for an online shop?&quot;
                </p>

                <p>
                  The Request a Quote form provides the information needed to
                  understand what you actually want built before a price is
                  prepared.
                </p>
              </div>
            </div>

            <div className={styles.quoteExample}>
              <div className={styles.quoteExampleIcon}>♡</div>

              <div>
                <span>FOR EXAMPLE</span>
                <h3>Two &quot;online shops&quot; can be very different.</h3>
                <p>
                  One business may only need products, a cart, and manual
                  payment instructions. Another may need customer accounts,
                  automated payments, inventory management, memberships,
                  dashboards, rewards, or other custom functionality. They may
                  both be called an online shop, but they are not the same
                  development scope.
                </p>
              </div>
            </div>

            <div className={styles.quoteReasons}>
              {quoteReasons.map((reason, index) => (
                <article className={styles.quoteReason} key={reason.title}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <h3>{reason.title}</h3>
                  <p>{reason.text}</p>
                </article>
              ))}
            </div>

            <div className={styles.quoteRulesBox}>
              <div className={styles.quoteRulesHeading}>
                <span>QUOTATION RULES</span>
                <h3>Before requesting custom pricing</h3>

                <p>
                  These rules help keep quotations clear and based on the
                  project being requested.
                </p>
              </div>

              <div className={styles.quoteRulesList}>
                {quoteRules.map((rule, index) => (
                  <div key={rule}>
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <p>{rule}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.quoteImportant}>
              <div>
                <span className={styles.importantLabel}>IMPORTANT</span>

                <h3>Submitting a quotation request is not a commitment.</h3>

                <p>
                  Filling out the form does not require you to purchase or
                  accept the project. It simply gives TCL enough information to
                  review your request and prepare the appropriate scope and
                  quotation.
                </p>
              </div>

              <Link href="/shop/custom-business-website">
                Request a Quote <span>→</span>
              </Link>
            </div>
          </div>
        </section>

        {/* COMMUNICATION POLICY */}
        <section className={styles.communicationSection}>
          <div className={styles.container}>
            <div className={styles.communicationHeader}>
              <span className={styles.lightKicker}>
                COMMUNICATION &amp; CONSULTATION
              </span>

              <h2>
                Project details stay
                <span>clear and in writing.</span>
              </h2>

              <p>
                TCL primarily handles project communication through written
                channels. This keeps important requirements, approvals, and
                project decisions documented and easy for both sides to
                reference.
              </p>
            </div>

            <div className={styles.communicationGrid}>
              {communicationRules.map((rule, index) => (
                <article className={styles.communicationCard} key={rule.title}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <h3>{rule.title}</h3>
                  <p>{rule.text}</p>
                </article>
              ))}
            </div>

            <div className={styles.writtenReason}>
              <div>
                <span className={styles.writtenIcon}>✦</span>
              </div>

              <div>
                <span className={styles.writtenLabel}>
                  WHY WRITTEN COMMUNICATION?
                </span>

                <h3>
                  Because &quot;napag-usapan natin sa call&quot; is not enough
                  for project scope.
                </h3>

                <p>
                  Websites and systems can involve many small requirements that
                  directly affect development work, pricing, and delivery.
                  Keeping important discussions in writing creates a clear
                  record of what was requested, quoted, approved, changed, and
                  delivered.
                </p>
              </div>
            </div>

            <div className={styles.callPolicy}>
              <div className={styles.callBadge}>SHORT CALLS</div>

              <div className={styles.callContent}>
                <h3>What can an introductory call be used for?</h3>

                <div className={styles.callColumns}>
                  <div>
                    <strong>✓ Okay for a short call</strong>
                    <p>Brief introduction</p>
                    <p>General questions about TCL</p>
                    <p>Verifying that you&apos;re speaking with a real person</p>
                    <p>General questions about available services</p>
                  </div>

                  <div>
                    <strong>× Keep these in writing</strong>
                    <p>Custom quotation and pricing</p>
                    <p>Project requirements and scope</p>
                    <p>Feature requests or scope changes</p>
                    <p>Revisions, approvals, and project decisions</p>
                  </div>
                </div>

                <p className={styles.callFootnote}>
                  Short introductory calls are subject to availability and
                  TCL&apos;s schedule. In-person appointments are not currently
                  offered.
                </p>
              </div>
            </div>

            <div className={styles.communicationNotice}>
              <strong>A call does not replace the quotation process.</strong>

              <p>
                If your project requires custom pricing, the Request a Quote
                form must still be completed. Any information discussed
                verbally that affects the project must also be provided or
                confirmed through written communication.
              </p>
            </div>
          </div>
        </section>

        {/* CUSTOM PROJECT FLOW */}
        <section className={styles.customSection}>
          <div className={styles.container}>
            <div className={styles.customHeader}>
              <div>
                <span className={styles.darkKicker}>CUSTOM DEVELOPMENT</span>

                <h2>
                  From request
                  <span>to project turnover.</span>
                </h2>
              </div>

              <p>
                Once your requirements are submitted, custom projects follow a
                structured process so the scope, pricing, payment, development,
                and final delivery remain clear.
              </p>
            </div>

            <div className={styles.customSteps}>
              {customSteps.map((step) => (
                <article className={styles.customStep} key={step.number}>
                  <span className={styles.customNumber}>{step.number}</span>

                  <div>
                    <h3>{step.title}</h3>
                    <p>{step.description}</p>
                  </div>
                </article>
              ))}
            </div>

            <div className={styles.customAction}>
              <Link href="/shop/custom-business-website">
                Request a Quote <span>→</span>
              </Link>
            </div>
          </div>
        </section>

        {/* PREPARE */}
        <section className={styles.prepareSection}>
          <div className={`${styles.container} ${styles.prepareGrid}`}>
            <div className={styles.prepareCopy}>
              <span className={styles.kicker}>BEFORE CUSTOM DEVELOPMENT</span>

              <h2>
                What should
                <span>you prepare?</span>
              </h2>

              <p>
                You don&apos;t need to have everything perfectly prepared
                before requesting a quotation. Having these details available
                can make the review and project process much smoother.
              </p>

              <div className={styles.prepareNote}>
                <span>♡</span>

                <p>
                  Don&apos;t know the technical term? Just explain what you want
                  your customer, staff, or admin to be able to do. TCL can
                  review the requested workflow from there.
                </p>
              </div>
            </div>

            <div className={styles.prepareList}>
              {prepare.map((item, index) => (
                <div key={item}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <p>{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* AFTER DELIVERY */}
        <section className={styles.afterSection}>
          <div className={styles.container}>
            <div className={styles.sectionHeading}>
              <span className={styles.kicker}>AFTER DELIVERY</span>

              <h2>A few things worth remembering.</h2>

              <p>
                Keep your delivered project, files, instructions, and account
                access safe after turnover.
              </p>
            </div>

            <div className={styles.afterGrid}>
              {reminders.map((item) => (
                <article className={styles.afterCard} key={item.number}>
                  <span>{item.number}</span>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className={styles.bottomCta}>
          <div className={`${styles.container} ${styles.bottomCtaInner}`}>
            <div>
              <span className={styles.ctaKicker}>
                NOT SURE WHERE TO START?
              </span>

              <h2>
                Tell TCL what
                <span>your business needs.</span>
              </h2>

              <p>
                If you&apos;re unsure whether an existing solution fits or you
                need custom development, you can contact TCL before purchasing.
                Custom pricing still requires a completed quotation request.
              </p>
            </div>

            <div className={styles.ctaActions}>
              <a
                href="https://t.me/tclsystemsanddigitalsph"
                target="_blank"
                rel="noreferrer"
                className={styles.ctaPrimary}
              >
                Contact TCL <span>→</span>
              </a>

              <Link href="/shop" className={styles.ctaSecondary}>
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