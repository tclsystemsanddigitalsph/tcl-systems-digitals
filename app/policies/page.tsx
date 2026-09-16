import type { Metadata } from "next";
import Link from "next/link";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import styles from "./policies.module.css";

export const metadata: Metadata = {
  title: "Policies | TCL Systems & Digitals PH",
  description:
    "Purchase, payment, project scope, maintenance, licensing, delivery, refund, privacy, and support policies for TCL Systems & Digitals PH.",
};

type PolicySection = {
  title: string;
  intro?: string;
  items: string[];
};

const sections: PolicySection[] = [
  {
    title: "Products, Services & Scope",
    intro:
      "TCL Systems & Digitals PH provides fixed-price website packages, digital products, booking systems, online shops, and custom website/system development.",
    items: [
      "The exact inclusions of an order are determined by the applicable product page, quotation, invoice, written project scope, and other written terms presented for that purchase.",
      "TCL's current fixed-price website/service lineup includes Starter Website, Simple Business Website, Basic Online Shop, and Standard Booking Website/System. Custom Business Website/System projects are quotation-based.",
      "Features, pages, workflows, integrations, administrative tools, or services that are not expressly listed as included should not be assumed to be part of the purchase.",
      "Demo websites, screenshots, previews, sample services, sample products, sample bookings, sample transactions, and other demonstration content are for reference only unless expressly included.",
      "For custom work, the accepted quotation and written scope control what TCL is required to build and deliver. Requests outside that scope may require additional pricing and time.",
    ],
  },
  {
    title: "Current Website & System Packages",
    items: [
      "Starter Website — ₱999: a one-page business website with a business name/logo area, short About section, services or products section, contact section, responsive design, and standard deployment. It does not include an admin dashboard or self-editing system.",
      "Simple Business Website — ₱2,999: a four-page business website consisting of Home, Services, About, and Contact, with customization, responsive design, and deployment/domain options. It does not include an admin dashboard or self-editing system unless separately scoped.",
      "Basic Online Shop — ₱5,999: a basic multi-page shop with up to 10 initial products, shop/product display, cart, basic checkout or order submission, manual payment instructions, About, and Contact. Automated payment gateways, customer accounts, automated inventory, and an admin dashboard are not included unless separately quoted.",
      "Standard Booking Website/System — ₱7,999: a customer-facing website with services, online booking, applicable variations/add-ons, date and available-time selection, customer information, booking confirmation/reference, booking statuses, and an admin dashboard for bookings, services, availability, schedules, and basic business settings.",
      "Custom Business Website/System — Custom Quote: pages, workflows, dashboards, integrations, roles, automation, and other requirements are defined through an approved written quotation and scope.",
      "TCL may revise package names, prices, or inclusions for future purchases. The terms applicable to an existing order are based on the product information and written agreement presented for that transaction.",
    ],
  },
  {
    title: "Pricing, Currency & Processing Fees",
    items: [
      "Prices are shown in Philippine pesos (PHP) unless another currency is expressly stated.",
      "The checkout total may include TCL's disclosed processing fee. The fee amount shown before payment forms part of the customer's total payable amount.",
      "The checkout may identify the processing charge according to the selected provider, such as PayPal Processing Fee or PayMongo Processing Fee. Changing the payment provider does not alter an already disclosed TCL processing-fee calculation unless the checkout itself displays a different amount.",
      "Payment providers, card issuers, banks, or e-wallet providers may separately apply currency conversion, international transaction, transfer, or account-specific charges that are outside TCL's checkout total and outside TCL's control.",
      "Customizations, add-ons, upgrades, scope changes, or third-party services may carry separate charges when applicable.",
      "Prices, promotions, and availability may change for future purchases. A future price change does not normally alter a completed transaction or an already accepted quotation unless the parties agree to a scope or price change in writing.",
    ],
  },
  {
    title: "Payments, Verification & Order Status",
    items: [
      "An order is not considered successfully paid merely because payment was initiated. Payment must be completed and verified by the applicable payment provider or TCL's order system.",
      "Orders may remain pending while payment confirmation is being received or reviewed.",
      "For eligible custom projects, the accepted quotation may provide a full-payment option, a deposit arrangement, or another written payment schedule.",
      "Where a deposit is used, the remaining balance becomes payable according to the accepted quotation or when TCL activates or requests the final payment under the agreed project flow.",
      "A cancelled order and a refunded payment are separate statuses. Cancellation does not automatically mean funds have been returned.",
      "TCL may request reasonable transaction details to investigate a payment issue. Customers should never send passwords, full card credentials, security codes, private keys, or other sensitive account credentials.",
    ],
  },
  {
    title: "Digital Delivery & Download Access",
    items: [
      "Eligible automatic digital products are made available after successful payment verification.",
      "For products using TCL's protected delivery system, download access is normally available for 7 days from the applicable purchase/access date and is limited to a maximum of 3 successful download claims per product file, unless the product page or written agreement states otherwise.",
      "Customers are responsible for downloading and safely storing purchased files during the available access period.",
      "A legitimate delivery problem should be reported to TCL before repeatedly attempting a download. TCL may review order and download records when troubleshooting.",
      "Expiration or exhaustion of a download allowance does not automatically create a right to a refund or unlimited replacement downloads.",
      "TCL may restore or extend access when a legitimate technical or delivery issue is confirmed.",
    ],
  },
  {
    title: "License & Permitted Use",
    items: [
      "Unless a product page or written agreement grants different rights, a purchased reusable template, downloadable system, or source-code product is licensed to the purchaser for one business, brand, organization, or project.",
      "The purchaser may customize the licensed working copy for the authorized business or project and may use the resulting website or system commercially for that authorized business.",
      "A license does not transfer ownership of TCL's pre-existing reusable templates, frameworks, reusable components, documentation, product design systems, development methods, or other pre-existing intellectual property.",
      "A separate license or agreement may be required to reuse the same TCL product for another unrelated client, business, brand, organization, or project.",
      "Order-specific licensed packages may include purchase or licensing information used to identify the authorized purchase.",
    ],
  },
  {
    title: "Prohibited Sharing & Redistribution",
    items: [
      "Purchased digital products may not be resold, sublicensed, redistributed, gifted, shared, uploaded for public download, or supplied to another person or business as a reusable TCL template or source product unless the applicable license expressly permits it.",
      "Customers may not publish TCL's original or substantially reusable source package in a public repository or other public location where others can copy or download it.",
      "Customers may not claim authorship or ownership of TCL's original reusable product and sell or distribute it as their own.",
      "Modification of a licensed product does not by itself remove the applicable license restrictions.",
      "Removing, falsifying, or intentionally circumventing order-specific licensing or purchase-identification information for unauthorized redistribution is prohibited.",
    ],
  },
  {
    title: "Intellectual Property & TCL Attribution",
    items: [
      "TCL retains ownership of its pre-existing intellectual property, reusable systems, templates, frameworks, reusable components, original documentation, design assets created by TCL, and general development methods except where a written agreement expressly states otherwise.",
      "Customers retain ownership of their own business names, logos, photographs, written content, trademarks, and other materials they lawfully provide.",
      "Third-party software, libraries, fonts, platforms, and services remain subject to their respective owners' licenses and terms.",
      "A delivered website or system may display a small 'Powered by TCL Systems & Digitals PH' or equivalent developer attribution where disclosed as part of the product or project.",
      "Removal of TCL attribution is not automatically included merely because the project has been paid. Where removal is permitted, it may be offered as a separately priced add-on or may be governed by the applicable written project agreement.",
    ],
  },
  {
    title: "Cancellations & Refunds",
    items: [
      "Because digital products can be accessed, copied, downloaded, or delivered shortly after payment, completed digital-product purchases are generally final and non-refundable after access, files, credentials, licensed packages, or other digital deliverables have been provided, except where required by applicable law or expressly approved by TCL.",
      "A change of mind, failure to review the product description, purchasing the wrong package, or deciding not to use a successfully delivered product does not automatically qualify for a refund.",
      "For services and custom projects, amounts attributable to work already completed, reserved project time, delivered materials, or non-recoverable third-party costs may be non-refundable when a project is cancelled after work has begun, subject to the applicable written agreement and law.",
      "Technical issues should first be reported so TCL has a reasonable opportunity to investigate and, where covered, correct the problem.",
      "If a refund is approved, the amount and method may depend on the circumstances, work already completed, payment provider, and non-recoverable third-party charges, subject to applicable law.",
    ],
  },
  {
    title: "Custom Projects, Deposits & Scope",
    items: [
      "Custom websites, systems, shops, integrations, redesigns, and other client-specific services follow the accepted quotation, written project scope, and agreed payment arrangement.",
      "Work may not begin until the required deposit or payment has been received and required client materials, information, or account access have been provided.",
      "An accepted quotation covers only the written scope included in that quotation. New pages, workflows, integrations, roles, automations, redesigns, or system behavior requested later may require a revised or additional quotation.",
      "A deposit reserves and starts work under the agreed project arrangement; it should not be treated as payment for unlimited additions or revisions.",
      "Any remaining deliverables following cancellation depend on the amount paid, work completed, applicable licensing terms, and the written project agreement.",
    ],
  },
  {
    title: "Revisions, Changes & Additional Work",
    items: [
      "Included revisions are limited to the number, type, and stage stated in the applicable product description, quotation, or project agreement.",
      "A revision adjusts work already included in the agreed scope. A new page, feature, workflow, integration, major redesign, different system behavior, or other functionality outside the original scope is additional work.",
      "Additional work may require additional payment and a revised delivery schedule.",
      "Approval of a completed stage may limit later requests to redo that stage without an additional fee.",
      "Future content edits or changes to fixed-price websites that do not include customer self-editing may be performed by TCL for a separate editing fee.",
    ],
  },
  {
    title: "Client Content & Responsibilities",
    items: [
      "Customers are responsible for providing accurate business details, services, products, prices, schedules, policies, branding, photographs, written content, contact information, and other materials required for the project.",
      "Customers must have the legal right to use any logo, image, text, trademark, media, data, or other content they provide.",
      "TCL is not responsible for claims caused by customer-supplied material that infringes another party's rights or is inaccurate, unlawful, misleading, or unauthorized.",
      "Delays in required information, approvals, credentials, content, or feedback may move the delivery schedule.",
      "The customer is responsible for reviewing business information and testing the delivered website or system before relying on it for live operations.",
    ],
  },
  {
    title: "Communication, Consultations & Written Records",
    items: [
      "TCL primarily handles quotations, project requirements, scope, pricing, revisions, approvals, and project changes through written communication so there is a clear record of what was requested and agreed.",
      "TCL does not require in-person appointments for normal website or system projects.",
      "A short introductory call may be accommodated when scheduling permits for general inquiries or legitimacy concerns, but a call does not replace TCL's quotation/request process or written project requirements.",
      "Scope, pricing, revisions, approvals, feature changes, and other material project decisions discussed verbally must be confirmed in writing before TCL treats them as part of the project record.",
      "Customers should use TCL's designated contact channels and private project or quotation pages where applicable.",
    ],
  },
  {
    title: "Third-Party Accounts, Domains, Hosting & Services",
    items: [
      "Websites and systems may depend on third-party services for hosting, databases, domains, repositories, transactional email, payments, analytics, authentication, file storage, or other infrastructure.",
      "A free vercel.app subdomain may be used where included. A custom domain is separate unless the product page, quotation, or written agreement expressly includes it.",
      "Third-party companies control their own pricing, free-plan limits, account verification, security requirements, terms, outages, API changes, feature changes, and service availability.",
      "Unless expressly included, domain registration or renewal, hosting upgrades, database/storage upgrades, email usage, payment-provider charges, paid APIs, and other third-party costs are the customer's responsibility.",
      "TCL may assist with setup when included, but TCL cannot guarantee that a third-party provider will permanently maintain its current pricing, limits, features, or availability.",
    ],
  },
  {
    title: "Accounts, Ownership, Credentials & Handover",
    items: [
      "Where practical, production accounts used for a customer's live business should ultimately be owned or controlled by the customer.",
      "TCL may temporarily access customer-authorized accounts for setup, configuration, deployment, troubleshooting, or agreed support.",
      "After handover, customers should change temporary passwords where applicable, enable available security protections, protect recovery methods, and limit administrative access to trusted persons.",
      "Customers must not place passwords, private keys, payment secrets, database service-role keys, or other confidential credentials in public repositories, public posts, screenshots, or unsecured documents.",
      "Applicable projects may include setup instructions, user documentation, credentials handover information, or other documentation appropriate to the purchased product.",
    ],
  },
  {
    title: "Maintenance & Bug-Fix Coverage",
    intro:
      "Included maintenance is limited post-delivery coverage for the delivered scope. It is not unlimited editing or ongoing development.",
    items: [
      "Starter Website — 1 month of included maintenance from completed delivery/turnover.",
      "Simple Business Website — 1 month of included maintenance from completed delivery/turnover.",
      "Basic Online Shop — 2 months of included maintenance from completed delivery/turnover.",
      "Standard Booking Website/System — 2 months of included maintenance from completed delivery/turnover.",
      "Custom Business Website/System — 6 months of included maintenance from completed delivery/turnover unless the accepted quotation states a different project-specific term.",
      "Included maintenance covers bugs or errors in features TCL delivered within the original agreed scope and reasonable technical assistance directly related to that delivered project.",
      "Included maintenance does not cover new features, new pages, redesigns, major content changes, new integrations, new workflows, ongoing administration, or other out-of-scope development.",
      "The website or system does not expire when the included maintenance period ends. Future TCL maintenance, edits, troubleshooting, upgrades, or development may be separately quoted.",
      "Third-party fees, plan limits, policy changes, outages, platform changes, or required third-party upgrades are outside TCL's control and are not automatically covered by included maintenance.",
    ],
  },
  {
    title: "Customer Modifications & Third-Party Developers",
    items: [
      "Where source access is provided, customers may modify their licensed working copy within the permitted license and project scope.",
      "TCL cannot guarantee functionality after source code, database structures, configuration, dependencies, integrations, or deployment settings have been changed outside the delivered setup.",
      "Issues caused by customer changes, deleted files, changed credentials, unsupported modifications, or another developer's work are not automatically treated as bugs in TCL's delivered work and may require paid troubleshooting.",
      "Giving another developer legitimate access to work on the customer's licensed business does not grant that developer permission to retain, reuse, resell, or redistribute TCL's reusable template or framework.",
    ],
  },
  {
    title: "Backups & Data",
    items: [
      "Customers are responsible for maintaining appropriate copies of delivered source files, business content, exported records, and other important data after handover unless an ongoing backup service is expressly included.",
      "TCL does not guarantee indefinite retention of customer project files or the ability to recreate customer data that is deleted after delivery.",
      "Database and platform backup capabilities depend on the applicable third-party provider and plan.",
      "Before deleting records, changing configurations, importing data, or making major modifications, customers should confirm that an appropriate recovery option exists.",
    ],
  },
  {
    title: "Privacy & Information Collected",
    items: [
      "TCL may collect information reasonably necessary to process purchases, provide services, deliver products, respond to support requests, maintain transaction records, and protect digital-product access.",
      "Depending on the transaction, this may include customer name, email address, business information, order details, payment status or reference information supplied by the payment provider, support communications, and delivery/download activity.",
      "Protected delivery systems may record technical information associated with download attempts, such as date/time, product file, result, browser or user-agent information, approximate device/operating-system information, and IP address where available, for security, troubleshooting, and access-control purposes.",
      "TCL does not require a customer's full payment-card number or card security code to operate the normal storefront checkout; payment-sensitive information is handled by the applicable payment provider according to its own processes.",
      "Customers operating their own websites or systems are responsible for determining and complying with privacy, consent, record-retention, and data-protection obligations applicable to their own business and users.",
    ],
  },
  {
    title: "Security",
    items: [
      "TCL uses reasonable access controls and delivery measures, but no website, database, hosting platform, repository, payment integration, or internet transmission can be guaranteed to be completely risk-free.",
      "Customers are responsible for securing accounts under their control, using appropriate passwords and recovery methods, limiting administrative access, and keeping secret environment variables confidential.",
      "Customers should promptly rotate exposed credentials and contact the relevant provider if they believe an account or secret has been compromised.",
      "Security protections do not grant permission to bypass authentication, licensing measures, protected delivery controls, download restrictions, or other access controls.",
    ],
  },
  {
    title: "Demo Websites & Sample Data",
    items: [
      "TCL may provide live demos so customers can understand how a product or feature generally looks or works before purchasing.",
      "Demo environments may contain fictional businesses, customers, bookings, orders, payments, services, products, and other sample information.",
      "Demo environments are not customer production systems and should not be used to submit confidential, payment, or sensitive personal information unless TCL expressly identifies a form as intended for that purpose.",
      "TCL may reset, change, restrict, or remove demo content or demo access at any time.",
      "The presence of a feature in a demo does not mean that feature is included in every TCL package.",
    ],
  },
  {
    title: "Availability & Service Interruptions",
    items: [
      "TCL aims to deliver functional products according to the applicable written scope but does not guarantee uninterrupted operation of third-party hosting, databases, email services, payment providers, domain providers, internet services, or other external platforms.",
      "Provider outages, maintenance, DNS changes, payment-provider reviews, API changes, internet problems, or other external events may temporarily affect a live system.",
      "TCL may assist with investigation when appropriate, but a third-party incident is not automatically a defect in TCL's delivered work.",
    ],
  },
  {
    title: "Chargebacks & Payment Disputes",
    items: [
      "Customers should contact TCL first when they believe there is a problem with an order, delivery, duplicate payment, or refund so the transaction can be reviewed.",
      "TCL may provide relevant order, payment-status, delivery, download, communication, licensing, and project records to the applicable payment provider when responding to a legitimate dispute or chargeback.",
      "A payment dispute does not automatically cancel applicable licensing restrictions or authorize continued use of a product if payment is ultimately reversed.",
      "Nothing in this section limits rights that cannot legally be waived.",
    ],
  },
  {
    title: "No Guaranteed Business Results",
    items: [
      "Websites, booking systems, online shops, and digital tools are intended to support business presentation, operations, and workflow.",
      "TCL does not guarantee a particular level of sales, bookings, traffic, search ranking, revenue, customer growth, conversion rate, or other business outcome.",
      "Results depend on factors outside the delivered website or system, including the customer's offer, pricing, marketing, operations, content, customer service, market conditions, and third-party platforms.",
    ],
  },
  {
    title: "Limitation of Responsibility",
    items: [
      "To the extent permitted by applicable law, TCL is not responsible for losses caused solely by customer misuse, unauthorized modifications, lost or exposed credentials, inaccurate customer-supplied content, failure to maintain backups, third-party outages, or circumstances outside TCL's reasonable control.",
      "Customers remain responsible for reviewing their live business information, prices, policies, availability, legal notices, taxes, regulatory obligations, and operational decisions.",
      "Nothing in these policies excludes or limits liability, remedies, or consumer rights where doing so is prohibited by applicable law.",
    ],
  },
  {
    title: "Policy Acceptance & Order-Specific Terms",
    items: [
      "By completing a purchase or approving a custom project, the customer acknowledges the product information, price, applicable license, and policies reasonably presented for that transaction.",
      "A product page, accepted quotation, invoice, license file, purchase record, checkout disclosure, or written project agreement may contain additional terms specific to that purchase.",
      "Where valid project-specific written terms differ from these general policies, the more specific written terms apply to that project to the extent of the stated difference, subject to applicable law.",
    ],
  },
  {
    title: "Policy Updates",
    items: [
      "TCL may update these general policies as products, services, delivery systems, security measures, business processes, or third-party integrations change.",
      "Updates apply prospectively unless otherwise stated or required by law.",
      "For an existing transaction, TCL will consider the product terms, quotation, license, written project agreement, and policy version reasonably presented or agreed to for that purchase, subject to applicable law.",
    ],
  },
];

export default function PoliciesPage() {
  return (
    <>
      <SiteHeader />

      <main className={styles.page}>
        <section className={styles.hero}>
          <div className={styles.shell}>
            <span className={styles.eyebrow}>TCL SYSTEMS &amp; DIGITALS PH</span>
            <h1>Policies</h1>
            <p>
              Clear terms for purchases, custom projects, payments, delivery,
              maintenance, licensing, support, and the use of TCL websites,
              systems, and digital products.
            </p>

            <div className={styles.heroActions}>
              <Link className={styles.back} href="/">
                ← Back to Home
              </Link>

              <a className={styles.jump} href="#policy-sections">
                Read Policies ↓
              </a>
            </div>
          </div>
        </section>

        <section className={styles.content} id="policy-sections">
          <div className={styles.shell}>
            <div className={styles.notice}>
              <span>IMPORTANT</span>
              <div>
                <strong>Please read before purchasing.</strong>
                <p>
                  Your product page, accepted quotation, invoice, license,
                  checkout disclosure, purchase record, and written project
                  scope may contain additional terms specific to your order.
                  If a feature is not clearly listed as included, please ask TCL
                  before purchasing or approving the project.
                </p>
              </div>
            </div>

            <div className={styles.quickFacts}>
              <div>
                <strong>Written Scope</strong>
                <span>Quoted projects follow the accepted written inclusions</span>
              </div>
              <div>
                <strong>1–6 Months</strong>
                <span>Included maintenance depends on the purchased package</span>
              </div>
              <div>
                <strong>1 License</strong>
                <span>Reusable products are for one business/project unless stated otherwise</span>
              </div>
              <div>
                <strong>Third-Party Costs</strong>
                <span>Domains, upgrades, provider fees, and paid services may be separate</span>
              </div>
            </div>

            <div className={styles.toc}>
              <div className={styles.tocHeading}>
                <span>POLICY DIRECTORY</span>
                <h2>What&apos;s covered</h2>
                <p>
                  Select a topic below or continue scrolling to read the complete
                  policy.
                </p>
              </div>

              <div className={styles.tocLinks}>
                {sections.map((section, index) => (
                  <a key={section.title} href={`#policy-${index + 1}`}>
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    {section.title}
                  </a>
                ))}
              </div>
            </div>

            <div className={styles.grid}>
              {sections.map((section, index) => (
                <article
                  className={styles.card}
                  id={`policy-${index + 1}`}
                  key={section.title}
                >
                  <div className={styles.cardNumber}>
                    {String(index + 1).padStart(2, "0")}
                  </div>

                  <div className={styles.cardContent}>
                    <h2>{section.title}</h2>

                    {section.intro ? (
                      <p className={styles.cardIntro}>{section.intro}</p>
                    ) : null}

                    <ul>
                      {section.items.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>

                    <a className={styles.toTop} href="#policy-sections">
                      Back to policy directory ↑
                    </a>
                  </div>
                </article>
              ))}
            </div>

            <div className={styles.legalNote}>
              <strong>A note about your rights</strong>
              <p>
                These policies are intended to clearly explain TCL&apos;s
                business terms and are not intended to remove rights or remedies
                that cannot legally be waived under applicable law.
              </p>
            </div>

            <div className={styles.footerNote}>
              <span>STILL HAVE A QUESTION?</span>
              <h2>Ask before you purchase.</h2>
              <p>
                If you need clarification about a package, license,
                customization, maintenance coverage, payment, or project
                inclusion, contact TCL Systems &amp; Digitals PH before checkout.
              </p>

              <div className={styles.footerActions}>
                <Link className={styles.contact} href="/contact">
                  Contact TCL →
                </Link>

                <Link className={styles.shop} href="/shop">
                  View Products →
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
