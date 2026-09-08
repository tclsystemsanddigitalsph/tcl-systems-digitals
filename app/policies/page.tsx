import type { Metadata } from "next";
import Link from "next/link";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import styles from "./policies.module.css";

export const metadata: Metadata = {
  title: "Policies | TCL Systems & Digitals PH",
  description:
    "Detailed purchase, payment, delivery, licensing, refund, customization, support, handover, privacy, and digital product policies for TCL Systems & Digitals PH.",
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
      "TCL Systems & Digitals PH offers digital products and digital services that may include website templates, booking systems, online stores, business websites, downloadable resources, customized systems, and related setup or support services.",
    items: [
      "The exact inclusions of a purchase are determined by the product page, selected tier, quotation, invoice, written project scope, or other written agreement presented for that order.",
      "Product previews, screenshots, demonstrations, and demo websites are intended to help customers understand the general appearance and functionality of a product. Demo content, sample data, sample businesses, sample transactions, and other demonstration materials are not necessarily included in the purchased product unless specifically stated.",
      "Features that are not expressly listed as included should not be assumed to be included.",
      "For customized work, the approved scope controls what TCL is required to build or deliver. Additional requests may be treated as additional work.",
    ],
  },
  {
    title: "Product Tiers & Feature Differences",
    items: [
      "Products may be offered in different tiers, including Solo, Pro, Business, Enterprise, or other product-specific packages.",
      "Each tier may contain different pages, administrative tools, workflows, limits, integrations, automation, reporting, user access, or other capabilities.",
      "Purchasing one tier does not automatically include features advertised under a higher tier.",
      "Customers should review the specific product and tier description before checkout. Upgrades, added features, or conversion to another tier may require an additional fee.",
    ],
  },
  {
    title: "Pricing, Currency & Processing Fees",
    items: [
      "Prices are shown in Philippine pesos (PHP) unless another currency is expressly stated.",
      "The final amount payable may include a disclosed payment-processing fee, customization fee, add-on, upgrade, or other agreed charge.",
      "Payment providers may apply their own conversion rates, bank charges, international transaction charges, or other fees. These are outside TCL's control unless expressly included in the checkout total.",
      "Prices, promotional offers, introductory rates, and product availability may change for future purchases. A later price change does not normally change a transaction that has already been completed.",
    ],
  },
  {
    title: "Payment Verification & Order Status",
    items: [
      "An order is not considered successfully paid solely because a customer initiated a payment. Payment must be successfully completed and verified by the applicable payment provider or TCL's order system.",
      "Orders may remain pending while payment confirmation is being received or reviewed.",
      "TCL may request reasonable transaction information when necessary to investigate a payment issue, but customers should never publicly send passwords, full card credentials, security codes, or other sensitive account credentials.",
      "A cancelled order and a refunded payment are separate statuses. Cancellation does not automatically mean money has been returned.",
    ],
  },
  {
    title: "Digital Delivery & Download Access",
    items: [
      "Eligible automatic digital products are made available after successful payment verification.",
      "For products using TCL's protected delivery system, download access is normally available for 7 days from the applicable purchase/access date and is limited to a maximum of 3 successful download claims per product file, unless the product page or written agreement states otherwise.",
      "Download limits are intended to provide reasonable access to purchased files while helping protect TCL's digital products from unauthorized distribution.",
      "Customers are responsible for downloading and safely storing their purchased files during the available access period.",
      "A customer who experiences a legitimate technical delivery problem should contact TCL before repeatedly attempting the download. TCL may review available order and download records when troubleshooting.",
      "Expiration or exhaustion of the download allowance does not automatically entitle the customer to a refund or unlimited replacement downloads.",
      "TCL may restore or extend access at its discretion when a legitimate delivery or technical issue is confirmed.",
    ],
  },
  {
    title: "Licensed Product Packages",
    items: [
      "Certain downloadable website, system, or source-code products may be generated as an order-specific licensed package.",
      "The package may contain a license file, purchase record, setup documentation, and order-specific licensing information used to identify the authorized purchase.",
      "Removing, altering, falsifying, or intentionally circumventing licensing or purchase-identification information for the purpose of unauthorized redistribution is prohibited.",
      "Order-specific identification does not give TCL access to the customer's private repository, passwords, business accounts, or private deployment unless the customer separately grants access for an authorized service or support purpose.",
    ],
  },
  {
    title: "License & Permitted Use",
    items: [
      "Unless a product page or written agreement expressly grants different rights, a purchased template or system is licensed for use by the purchaser for one business, brand, organization, or project.",
      "The purchaser may customize the licensed copy for the authorized business or project and may place that working copy in a private repository controlled by the purchaser.",
      "The purchaser may use the finished website or system commercially for the authorized business.",
      "A license does not transfer ownership of TCL's original reusable template, underlying product framework, reusable components, documentation, product design system, or other pre-existing intellectual property.",
      "A separate license may be required to use the same purchased product for another unrelated business, client, brand, organization, or project.",
    ],
  },
  {
    title: "Prohibited Use, Sharing & Redistribution",
    items: [
      "Purchased digital products may not be resold, sublicensed, redistributed, gifted, shared, uploaded for public download, or provided to another person or business as a reusable template or source product.",
      "Customers may not publish the original or substantially reusable TCL source package in a public code repository or other public location where others can copy or download it.",
      "Customers may not claim authorship or ownership of TCL's original template/product and sell or distribute it as their own digital product.",
      "Customers may not use a single-business license to repeatedly build products for unrelated clients or businesses unless the applicable license expressly permits that use.",
      "Modification of a product does not by itself remove the applicable license restrictions.",
    ],
  },
  {
    title: "Intellectual Property",
    items: [
      "TCL retains ownership of its pre-existing intellectual property, reusable systems, templates, frameworks, original documentation, reusable components, design assets created by TCL, and general development methods, except where a written agreement expressly states otherwise.",
      "Customers retain ownership of their own business names, logos, photographs, written content, trademarks, and other materials they lawfully provide to TCL.",
      "Third-party software, libraries, fonts, services, platforms, and other materials remain subject to their respective owners' licenses and terms.",
      "Customizing a TCL product for a customer does not automatically transfer ownership of TCL's reusable underlying framework or grant redistribution rights.",
    ],
  },
  {
    title: "Cancellations & Digital Product Refunds",
    items: [
      "Because digital products can be delivered, copied, downloaded, or accessed shortly after payment, completed digital-product purchases are generally final and non-refundable after access, files, credentials, licensed packages, or other digital deliverables have been provided, except where required by applicable law or expressly approved by TCL.",
      "A change of mind, failure to read the product description, purchasing the wrong tier, lack of compatible equipment, or deciding not to use a successfully delivered digital product does not automatically qualify for a refund.",
      "A technical issue should first be reported so TCL has a reasonable opportunity to investigate whether the issue is with the delivered product, customer configuration, or a third-party service.",
      "If TCL approves a refund, the refund amount and processing method may depend on the circumstances, payment provider, work already completed, and any non-refundable third-party charges, subject to applicable law.",
    ],
  },
  {
    title: "Custom Projects, Deposits & Cancellation",
    items: [
      "Customized websites, systems, shops, integrations, redesigns, and other client-specific services follow the approved quotation, invoice, project scope, and payment arrangement.",
      "Where a deposit, milestone payment, or upfront payment is required, work may not begin until the required payment has been received and any required client materials have been provided.",
      "If a custom project is cancelled after work has started, amounts attributable to completed work, reserved project time, delivered materials, or non-recoverable third-party costs may be non-refundable, subject to the applicable agreement and law.",
      "Any remaining deliverables after cancellation depend on the amount paid, work completed, licensing terms, and written project agreement.",
    ],
  },
  {
    title: "Revisions, Changes & Additional Features",
    items: [
      "Included revisions are limited to the number and type stated in the applicable product/service description or project agreement.",
      "A revision adjusts work already included in the agreed scope. A request for a new page, workflow, integration, feature, major redesign, different system behavior, or other functionality not included in the original scope may be treated as additional work.",
      "Additional work may require a separate quotation, additional payment, and revised delivery schedule.",
      "Approval of a completed stage may limit later requests to redo that stage without an additional fee.",
    ],
  },
  {
    title: "Client Content & Responsibilities",
    items: [
      "Customers are responsible for providing accurate business details, services, prices, schedules, policies, branding, photographs, written content, contact information, legal notices, and other materials required for their project.",
      "Customers must have the legal right to use any logo, image, text, trademark, media, data, or other content they provide.",
      "TCL is not responsible for claims caused by customer-supplied content that infringes another party's rights or is inaccurate, unlawful, misleading, or unauthorized.",
      "Delays in providing required information, approvals, credentials, or feedback may delay the project timeline.",
      "The customer is responsible for reviewing business information and testing the delivered system before relying on it for live operations.",
    ],
  },
  {
    title: "Third-Party Accounts, Apps & Services",
    items: [
      "A website or system may depend on third-party services for functions such as hosting, databases, domains, repositories, transactional email, payments, analytics, authentication, file storage, or other infrastructure.",
      "The specific tools required depend on the purchased product and its features. Setup or handover documentation may explain what each required service is used for.",
      "Third-party companies control their own pricing, free-plan limits, terms, account verification, availability, security requirements, outages, API changes, feature changes, and service discontinuation.",
      "Unless expressly included, recurring subscriptions, domain renewals, hosting upgrades, payment-provider charges, email usage, database/storage upgrades, and other third-party costs are the customer's responsibility.",
      "TCL cannot guarantee that a third-party provider will permanently maintain its current pricing, features, limits, or availability.",
    ],
  },
  {
    title: "Accounts, Ownership & Credentials",
    items: [
      "Where practical, production accounts used for the customer's live business should ultimately be owned or controlled by the customer.",
      "TCL may temporarily access customer-authorized accounts when required for setup, configuration, troubleshooting, or agreed support.",
      "After handover, customers should change temporary passwords where applicable, enable available security protections, protect recovery methods, and restrict account access to trusted persons.",
      "Customers must not place private keys, passwords, payment secrets, database service-role keys, or other confidential credentials in public repositories, public posts, screenshots, or unsecured documents.",
      "TCL is not responsible for unauthorized access caused by credentials the customer publicly exposes, shares with unauthorized persons, or fails to secure after handover.",
    ],
  },
  {
    title: "Handover & Documentation",
    items: [
      "Applicable products or custom projects may include handover instructions, a user manual, setup guide, credentials handover information, or other documentation appropriate to the purchased product.",
      "Documentation is intended to explain normal operation, administration, setup responsibilities, and customer-facing controls. It does not grant permission to reproduce, teach, redistribute, or resell TCL's protected product or proprietary implementation.",
      "The customer should retain copies of delivered documentation and keep sensitive account information separate from publicly shared materials.",
      "Initial source-code, deployment, repository, environment-variable, and database setup is generally best completed on a laptop or desktop computer. Routine use of a finished responsive website or admin dashboard may be possible on supported mobile devices depending on the product.",
    ],
  },
  {
    title: "Support & Bug Fixes",
    items: [
      "Support terms vary by product and project. Any included support period, scope, or limitations will be stated in the applicable product information or project agreement.",
      "A bug generally means an included feature does not function as delivered under the supported setup and the issue is attributable to TCL's delivered work.",
      "Support does not automatically include new features, redesigns, content entry, business-policy changes, additional integrations, customer-requested workflow changes, or ongoing administration.",
      "Issues caused by customer code changes, deleted files, changed credentials, incorrect environment settings, unsupported modifications, third-party outages, platform changes, expired services, or unauthorized third-party work may require paid troubleshooting.",
      "TCL may need reasonable information, screenshots, error details, or temporary authorized access to investigate a reported issue.",
    ],
  },
  {
    title: "Maintenance, Updates & Future Compatibility",
    items: [
      "A one-time product purchase does not automatically include indefinite maintenance, future redesigns, platform migrations, dependency upgrades, or lifetime development support unless expressly stated.",
      "Web technologies and third-party platforms change over time. Future changes may require maintenance or updates to keep a system compatible.",
      "Optional maintenance, upgrades, migrations, or feature additions may be offered separately and may require an additional fee.",
      "Customers should avoid making untested changes to production systems and should maintain appropriate backups before significant modifications.",
    ],
  },
  {
    title: "Customer Modifications & Third-Party Developers",
    items: [
      "Customers may modify their licensed working copy within the permitted license scope.",
      "TCL cannot guarantee functionality after source code, database structures, configuration, dependencies, integrations, or deployment settings have been changed outside the delivered setup.",
      "If another developer or service provider modifies the product, subsequent investigation or repair by TCL may be treated as additional paid work.",
      "Giving a developer access for legitimate work on the customer's licensed business does not grant that developer permission to retain, reuse, resell, or redistribute TCL's template for other projects.",
    ],
  },
  {
    title: "Backups & Data",
    items: [
      "Customers are responsible for maintaining appropriate copies of their delivered source files, business content, exported records, and other important data after handover unless an ongoing backup service is expressly included.",
      "TCL does not guarantee indefinite retention of customer project files or the ability to recreate deleted customer data after delivery.",
      "Database or platform backups may depend on the capabilities and plan of the applicable third-party provider.",
      "Before deleting records, changing configurations, importing data, or making major modifications, customers should confirm that they have an appropriate recovery option.",
    ],
  },
  {
    title: "Privacy & Information Collected",
    items: [
      "TCL may collect information reasonably necessary to process purchases, provide services, deliver products, respond to support requests, maintain transaction records, and protect digital-product access.",
      "Depending on the transaction, this may include customer name, email address, business information, order details, payment status/reference information supplied by the payment provider, support communications, and delivery/download activity.",
      "TCL's protected delivery system may record technical information associated with a download attempt, such as date/time, product file, result, browser or user-agent information, approximate device/operating-system information, and IP address where available, for security, troubleshooting, and access-control purposes.",
      "TCL does not need the customer's full payment-card number or card security code to operate the normal website order system; payment-sensitive information is handled by the applicable payment provider according to its own processes.",
      "Customers operating their own website or system are responsible for determining and complying with privacy, consent, record-retention, and data-protection obligations applicable to their own business and users.",
    ],
  },
  {
    title: "Security",
    items: [
      "TCL uses reasonable access controls and delivery measures for protected digital products, but no website, database, hosting platform, repository, or internet transmission can be guaranteed to be completely risk-free.",
      "Customers are responsible for securing accounts under their control, using appropriate passwords and recovery methods, limiting administrative access, and keeping secret environment variables confidential.",
      "Customers should promptly rotate exposed credentials and contact the relevant service provider if they believe an account or secret has been compromised.",
      "Security protections are not permission to attempt to bypass access controls, download restrictions, authentication, licensing measures, or other protective mechanisms.",
    ],
  },
  {
    title: "Demo Websites & Sample Data",
    items: [
      "TCL may provide live demonstrations so customers can explore how a product or tier generally works before purchasing.",
      "Demo websites may contain explanatory notes, sample customers, sample bookings, sample orders, sample payments, sample services, sample products, or other fictional demonstration data.",
      "Demo environments are not customer production systems and should not be used to submit real confidential, payment, or sensitive personal information unless TCL expressly states that a specific form is intended for that purpose.",
      "TCL may reset, change, restrict, or remove demo data and demo access at any time.",
      "The presence of a feature in one demo or tier does not mean that feature is included in every TCL product.",
    ],
  },
  {
    title: "Availability, Hosting & Service Interruptions",
    items: [
      "TCL aims to deliver functional products according to the applicable scope but does not guarantee uninterrupted availability of third-party hosting, databases, email services, payment systems, domain providers, internet services, or other external platforms.",
      "Temporary outages, maintenance, provider incidents, internet problems, DNS changes, payment-provider reviews, or other external events may temporarily affect a live system.",
      "TCL may assist with investigation when appropriate, but third-party incidents are not automatically considered defects in TCL's delivered work.",
    ],
  },
  {
    title: "Chargebacks & Payment Disputes",
    items: [
      "Customers should contact TCL first when they believe an order, delivery, duplicate payment, or refund has a problem so the transaction can be reviewed.",
      "TCL may provide relevant order, payment-status, delivery, download, communication, licensing, and project records to the applicable payment provider when responding to a legitimate payment dispute or chargeback.",
      "Submitting a payment dispute does not automatically cancel applicable licensing restrictions or authorize continued use of a product for which payment is ultimately reversed.",
      "Nothing in this section limits rights that cannot legally be waived.",
    ],
  },
  {
    title: "Suspension or Revocation of Access",
    items: [
      "Temporary digital delivery access may end when the stated access period or download allowance expires.",
      "TCL may also restrict remaining delivery access where reasonably necessary to address fraud, unauthorized redistribution, abuse of the download system, payment reversal, or material violation of the applicable license, subject to applicable law and contractual obligations.",
      "Revoking temporary download access does not remotely disable a legitimately delivered customer website or provide TCL with control over customer-owned production accounts unless a separate managed-service agreement expressly provides otherwise.",
    ],
  },
  {
    title: "No Guaranteed Business Results",
    items: [
      "Websites, booking systems, stores, and digital tools are intended to support business operations, presentation, and workflow.",
      "TCL does not guarantee a specific level of sales, bookings, traffic, search ranking, revenue, customer growth, conversion rate, or other business result from using a product or service.",
      "Business outcomes depend on many factors outside the delivered system, including the customer's offer, pricing, marketing, operations, market conditions, content, customer service, and third-party platforms.",
    ],
  },
  {
    title: "Limitation of Responsibility",
    items: [
      "To the extent permitted by applicable law, TCL is not responsible for losses caused solely by customer misuse, unauthorized modifications, lost credentials, customer-supplied inaccurate content, failure to maintain backups, third-party service outages, or circumstances outside TCL's reasonable control.",
      "Customers remain responsible for reviewing their live business information, pricing, policies, availability, tax obligations, legal notices, and operational decisions.",
      "Nothing in these policies excludes or limits liability or consumer rights where such exclusion or limitation is prohibited by applicable law.",
    ],
  },
  {
    title: "Communication & Project Records",
    items: [
      "Customers should use TCL's designated communication channels for purchase questions, customization requests, approvals, support, and project-related instructions.",
      "Written confirmations, approved quotations, invoices, order records, and agreed project scope may be retained as part of the transaction or project record.",
      "Customers should review important approvals before confirming them because approved scope, content, or design decisions may affect later revision requests.",
    ],
  },
  {
    title: "Policy Acceptance & Order-Specific Terms",
    items: [
      "By completing a purchase or approving a custom project, the customer acknowledges the product information, price, applicable license, and policies reasonably presented for that transaction.",
      "A product page, quotation, invoice, license file, purchase record, or written project agreement may contain additional terms specific to that purchase.",
      "Where project-specific written terms validly differ from these general policies, the more specific terms apply to that project to the extent of the stated difference, subject to applicable law.",
    ],
  },
  {
    title: "Policy Updates",
    items: [
      "TCL may update these general policies as products, services, security measures, delivery systems, or third-party integrations change.",
      "Updates apply prospectively unless otherwise stated or required by law.",
      "For an existing transaction, TCL will consider the product terms, license, quotation, project agreement, and policy version reasonably presented or agreed to for that purchase, subject to applicable law.",
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
              Everything you should know about purchasing, using, downloading,
              customizing, and receiving support for TCL digital products and
              services.
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
                  Your product page, selected tier, quotation, invoice, license,
                  purchase record, and written project scope may contain
                  additional terms specific to your order. If you are unsure
                  whether a feature or service is included, please ask TCL
                  before completing your purchase.
                </p>
              </div>
            </div>

            <div className={styles.quickFacts}>
              <div>
                <strong>7 Days</strong>
                <span>Standard protected download access</span>
              </div>
              <div>
                <strong>3 / File</strong>
                <span>Standard maximum download claims</span>
              </div>
              <div>
                <strong>1 License</strong>
                <span>One business or project unless stated otherwise</span>
              </div>
              <div>
                <strong>Final Sale</strong>
                <span>Digital purchases generally non-refundable after delivery</span>
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
                If you need clarification about a product, tier, license,
                customization, support coverage, or project inclusion, contact
                TCL Systems &amp; Digitals PH before checkout.
              </p>

              <div className={styles.footerActions}>
                <a
                  className={styles.contact}
                  href="https://t.me/tclsystemsanddigitalsph"
                  target="_blank"
                  rel="noreferrer"
                >
                  Contact TCL →
                </a>

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
