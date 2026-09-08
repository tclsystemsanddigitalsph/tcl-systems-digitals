import type { Metadata } from "next";
import Link from "next/link";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import styles from "./policies.module.css";

export const metadata: Metadata = {
  title: "Policies | TCL Systems & Digitals PH",
  description:
    "Purchase, delivery, refund, customization, support, and digital product policies for TCL Systems & Digitals PH.",
};

const sections = [
  {
    title: "Digital Products & Systems",
    body: "Our products may include downloadable files, templates, booking systems, websites, business resources, or customized digital solutions. Product inclusions are based on the description, quotation, invoice, or agreed project scope at the time of purchase.",
  },
  {
    title: "Payments & Processing Fees",
    body: "Prices are shown in Philippine pesos unless stated otherwise. Payment processing fees may be added where disclosed at checkout or in a quotation. Third-party payment providers may have their own terms, availability, and processing rules.",
  },
  {
    title: "Digital Delivery",
    body: "Automatic digital products are delivered through the website after a successfully verified payment when available. Download links may expire for security. Customized products and services are delivered according to the agreed project scope and timeline.",
  },
  {
    title: "Cancellations & Refunds",
    body: "Cancelling an order does not automatically mean a payment has been refunded. Because digital products can be accessed or delivered immediately, completed digital purchases are generally non-refundable once files, credentials, access, or substantial work have been provided, except where required by applicable law or where TCL Systems & Digitals PH agrees otherwise. Approved refunds are recorded separately from order cancellation.",
  },
  {
    title: "Customized Projects & Revisions",
    body: "Customized websites, booking systems, shops, and other client work are limited to the features and revisions included in the agreed scope. Requests outside that scope, additional revisions, new features, integrations, redesigns, or major changes may require an additional fee and revised delivery schedule.",
  },
  {
    title: "Client Responsibilities",
    body: "Clients are responsible for providing accurate business information, content, branding materials, approvals, and any accounts or access needed to complete the project. Delays in providing these items may affect the delivery schedule.",
  },
  {
    title: "Third-Party Services",
    body: "Some systems may use third-party services such as hosting, databases, email delivery, payment providers, domains, repositories, or other platforms. Their availability, pricing, policies, outages, account reviews, and future changes are outside our direct control. Any recurring third-party costs not expressly included in the purchase remain the client's responsibility.",
  },
  {
    title: "Accounts, Credentials & Handover",
    body: "Where applicable, production accounts should ultimately be owned by the client. Temporary setup access may be used during development. Clients should change passwords and secure their accounts after handover. Sensitive credentials should not be shared publicly.",
  },
  {
    title: "Support, Bugs & Additional Work",
    body: "Support for confirmed bugs or issues attributable to the delivered work may be provided according to the agreed support terms. New features, content updates, third-party changes, client-caused issues, redesigns, maintenance, or work outside the original scope may be quoted separately.",
  },
  {
    title: "License & Intellectual Property",
    body: "Unless a different written agreement applies, purchased digital products are for the purchaser's permitted business or personal use and may not be resold, redistributed, copied for resale, or represented as the purchaser's own product for commercial redistribution. Custom project ownership and reusable development components may be governed by the applicable project agreement.",
  },
  {
    title: "Policy Updates",
    body: "These policies may be updated as our products, services, and payment or delivery processes change. The policy applicable to a transaction is the version reasonably presented or agreed to at the time of purchase, subject to applicable law.",
  },
];

export default function PoliciesPage() {
  return (
    <>
      <SiteHeader />
      <main className={styles.page}>
        <section className={styles.hero}>
          <div className={styles.shell}>
            <span className={styles.eyebrow}>TCL SYSTEMS & DIGITALS PH</span>
            <h1>Policies</h1>
            <p>
              Clear guidelines for purchases, digital delivery, customized
              projects, cancellations, refunds, support, and handover.
            </p>
            <Link className={styles.back} href="/">
              ← Back to Home
            </Link>
          </div>
        </section>

        <section className={styles.content}>
          <div className={styles.shell}>
            <div className={styles.notice}>
              <strong>Before purchasing</strong>
              <p>
                Please review the product description and these policies. For
                customized work, your approved quotation or written project
                scope may include additional project-specific terms.
              </p>
            </div>

            <div className={styles.grid}>
              {sections.map((section, index) => (
                <article className={styles.card} key={section.title}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <div>
                    <h2>{section.title}</h2>
                    <p>{section.body}</p>
                  </div>
                </article>
              ))}
            </div>

            <div className={styles.footerNote}>
              <h2>Questions before purchasing?</h2>
              <p>
                Contact TCL Systems & Digitals PH before checkout if you need
                clarification about product inclusions or a customized project.
              </p>
              <Link className={styles.shop} href="/shop">
                View Products →
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
