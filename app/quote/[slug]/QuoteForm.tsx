"use client";

import { FormEvent, useMemo, useState } from "react";
import styles from "./quote.module.css";

type Props = {
  productName: string;
  productSlug: string;
  category: string;
};

const featureOptions = [
  "Booking / appointment system",
  "Online payments",
  "Down payment workflow",
  "Customer database",
  "Email notifications",
  "Admin dashboard",
  "Reports / analytics",
  "Promo or discount tools",
  "Staff accounts",
  "Multiple staff schedules",
  "Multiple business locations",
  "Online shop / cart",
  "Digital product delivery",
  "Inventory tracking",
  "Product variants",
  "Shipping / delivery options",
  "Customer accounts",
  "Custom forms",
  "Custom dashboard workflow",
  "Third-party integrations",
];

const budgetOptions = [
  "Below ₱5,000",
  "₱5,000 – ₱10,000",
  "₱10,000 – ₱20,000",
  "₱20,000 – ₱40,000",
  "₱40,000+",
  "Not sure yet",
];

const timelineOptions = [
  "As soon as possible",
  "Within 1–2 weeks",
  "Within 2–4 weeks",
  "Within 1–2 months",
  "Flexible / no fixed deadline",
];

export default function QuoteForm({
  productName,
  productSlug,
  category,
}: Props) {
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const isShop =
    category.toLowerCase().includes("shop") ||
    productName.toLowerCase().includes("shop");

  const isBooking =
    category.toLowerCase().includes("booking") ||
    productName.toLowerCase().includes("booking");

  const isWebsite =
    category.toLowerCase().includes("website") ||
    productName.toLowerCase().includes("website");

  const introText = useMemo(() => {
    if (isBooking) {
      return "Tell us how you currently handle appointments and how you want your booking process to work.";
    }

    if (isShop) {
      return "Tell us what you sell, how you currently accept orders, and what your ideal online shop should handle.";
    }

    if (isWebsite) {
      return "Tell us about your business, your current online presence, and what you want the website to accomplish.";
    }

    return "Tell us about your business and the system or setup you need.";
  }, [isBooking, isShop, isWebsite]);

  function toggleFeature(feature: string) {
    setSelectedFeatures((current) =>
      current.includes(feature)
        ? current.filter((item) => item !== feature)
        : [...current, feature],
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (submitting) {
      return;
    }

    setSubmitting(true);
    setSubmitError("");
    setSubmitted(false);

    const form = new FormData(event.currentTarget);

    const value = (key: string) =>
      String(form.get(key) ?? "").trim();

    const payload = {
      productSlug,
      productName,
      category,
      fullName: value("full_name"),
      businessName: value("business_name"),
      email: value("email"),
      contactNumber: value("contact_number"),
      preferredContact: value("preferred_contact"),
      businessType: value("business_type"),
      businessLocation: value("business_location"),
      businessAge: value("business_age"),
      staffCount: value("staff_count"),
      locationCount: value("location_count"),
      currentLink: value("current_link"),
      offerings: value("offerings"),
      currentProcess: value("current_process"),
      mainProblems: value("main_problems"),
      selectedFeatures,
      mainGoal: value("main_goal"),
      expectedVolume: value("expected_volume"),
      paymentMethods: value("payment_methods"),
      deliveryNeeds: value("delivery_needs"),
      adminAccess: value("admin_access"),
      integrations: value("integrations"),
      logoReady: value("logo_ready"),
      brandingReady: value("branding_ready"),
      contentReady: value("content_ready"),
      domainStatus: value("domain_status"),
      budget: value("budget"),
      timeline: value("timeline"),
      notes: value("notes"),
    };

    try {
      const response = await fetch("/api/quotation-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = (await response.json()) as {
        success?: boolean;
        requestId?: string;
        error?: string;
      };

      if (!response.ok || !result.success) {
        throw new Error(
          result.error || "Unable to submit your quotation request.",
        );
      }

      const displayValue = (field: string) =>
        field || "Not provided";

      const featureText =
        selectedFeatures.length > 0
          ? selectedFeatures.map((item) => `• ${item}`).join("\n")
          : "• No specific features selected yet";

      const message = [
        "TCL QUOTATION REQUEST",
        "",
        `Request ID: ${result.requestId ?? "Saved"}`,
        `Service: ${productName}`,
        `Category: ${category}`,
        "",
        "CONTACT DETAILS",
        `Name: ${displayValue(payload.fullName)}`,
        `Business name: ${displayValue(payload.businessName)}`,
        `Email: ${displayValue(payload.email)}`,
        `Mobile / Telegram: ${displayValue(payload.contactNumber)}`,
        `Preferred contact: ${displayValue(payload.preferredContact)}`,
        "",
        "BUSINESS DETAILS",
        `Business type: ${displayValue(payload.businessType)}`,
        `Business location: ${displayValue(payload.businessLocation)}`,
        `How long in business: ${displayValue(payload.businessAge)}`,
        `Staff / team size: ${displayValue(payload.staffCount)}`,
        `Number of locations: ${displayValue(payload.locationCount)}`,
        `Website / social link: ${displayValue(payload.currentLink)}`,
        "",
        "CURRENT SETUP",
        `Current process/system: ${displayValue(payload.currentProcess)}`,
        `Main problems: ${displayValue(payload.mainProblems)}`,
        "",
        "PROJECT REQUIREMENTS",
        featureText,
        "",
        `Main goal: ${displayValue(payload.mainGoal)}`,
        `Products / services offered: ${displayValue(payload.offerings)}`,
        `Expected customers / bookings / orders: ${displayValue(
          payload.expectedVolume,
        )}`,
        `Payment methods needed: ${displayValue(
          payload.paymentMethods,
        )}`,
        `Delivery / fulfillment needs: ${displayValue(
          payload.deliveryNeeds,
        )}`,
        `Admin / staff access needs: ${displayValue(
          payload.adminAccess,
        )}`,
        `Other integrations: ${displayValue(payload.integrations)}`,
        "",
        "BRANDING & CONTENT",
        `Logo ready: ${displayValue(payload.logoReady)}`,
        `Brand colors / style ready: ${displayValue(
          payload.brandingReady,
        )}`,
        `Photos / content ready: ${displayValue(payload.contentReady)}`,
        `Domain status: ${displayValue(payload.domainStatus)}`,
        "",
        "BUDGET & TIMELINE",
        `Budget: ${displayValue(payload.budget)}`,
        `Timeline: ${displayValue(payload.timeline)}`,
        "",
        "ADDITIONAL NOTES",
        displayValue(payload.notes),
      ].join("\n");

      setSubmitted(true);

      window.open(
        `https://t.me/tclsystemsanddigitalsph?text=${encodeURIComponent(
          message,
        )}`,
        "_blank",
        "noopener,noreferrer",
      );
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Unable to submit your quotation request.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <section className={styles.formCard}>
        <div className={styles.sectionHeading}>
          <span>01</span>
          <div>
            <h2>Your contact details</h2>
            <p>Who should TCL contact about this quotation?</p>
          </div>
        </div>

        <div className={styles.gridTwo}>
          <label>
            Full name *
            <input name="full_name" required placeholder="Your full name" />
          </label>

          <label>
            Business name *
            <input
              name="business_name"
              required
              placeholder="Your business name"
            />
          </label>

          <label>
            Email address *
            <input
              name="email"
              type="email"
              required
              placeholder="you@example.com"
            />
          </label>

          <label>
            Mobile / Telegram *
            <input
              name="contact_number"
              required
              placeholder="09xx... or @username"
            />
          </label>

          <label>
            Preferred contact method
            <select name="preferred_contact" defaultValue="Telegram">
              <option>Telegram</option>
              <option>Email</option>
              <option>Mobile</option>
            </select>
          </label>
        </div>
      </section>

      <section className={styles.formCard}>
        <div className={styles.sectionHeading}>
          <span>02</span>
          <div>
            <h2>About your business</h2>
            <p>{introText}</p>
          </div>
        </div>

        <div className={styles.gridTwo}>
          <label>
            Type of business *
            <input
              name="business_type"
              required
              placeholder="Nail salon, clinic, retail shop, etc."
            />
          </label>

          <label>
            Business location
            <input
              name="business_location"
              placeholder="City / country or online only"
            />
          </label>

          <label>
            How long have you been operating?
            <select name="business_age" defaultValue="">
              <option value="">Select</option>
              <option>Not launched yet</option>
              <option>Less than 1 year</option>
              <option>1–3 years</option>
              <option>3–5 years</option>
              <option>5+ years</option>
            </select>
          </label>

          <label>
            Number of staff / team members
            <input
              name="staff_count"
              placeholder="Example: Solo / 3 staff / 10 staff"
            />
          </label>

          <label>
            Number of locations
            <input
              name="location_count"
              placeholder="Example: 1 location"
            />
          </label>

          <label>
            Website or social page
            <input
              name="current_link"
              placeholder="Facebook, Instagram, website, etc."
            />
          </label>
        </div>

        <label>
          What products or services do you offer? *
          <textarea
            name="offerings"
            required
            rows={4}
            placeholder="List your main services, products, packages, or offerings."
          />
        </label>
      </section>

      <section className={styles.formCard}>
        <div className={styles.sectionHeading}>
          <span>03</span>
          <div>
            <h2>Your current setup</h2>
            <p>
              This helps us understand what needs to be improved or replaced.
            </p>
          </div>
        </div>

        <label>
          How do you currently handle this part of your business?
          <textarea
            name="current_process"
            rows={4}
            placeholder="Example: I accept bookings through Messenger and track them manually in Google Sheets."
          />
        </label>

        <label>
          What problems are you trying to solve? *
          <textarea
            name="main_problems"
            required
            rows={4}
            placeholder="Tell us what is difficult, repetitive, confusing, or taking too much time."
          />
        </label>
      </section>

      <section className={styles.formCard}>
        <div className={styles.sectionHeading}>
          <span>04</span>
          <div>
            <h2>Features you may need</h2>
            <p>
              Select everything that sounds useful. You do not need to know the
              technical terms.
            </p>
          </div>
        </div>

        <div className={styles.featureGrid}>
          {featureOptions.map((feature) => (
            <label
              className={`${styles.featureOption} ${
                selectedFeatures.includes(feature)
                  ? styles.featureSelected
                  : ""
              }`}
              key={feature}
            >
              <input
                type="checkbox"
                checked={selectedFeatures.includes(feature)}
                onChange={() => toggleFeature(feature)}
              />
              <span>{feature}</span>
            </label>
          ))}
        </div>

        <label>
          Main goal for the project *
          <textarea
            name="main_goal"
            required
            rows={3}
            placeholder="What would make this project successful for your business?"
          />
        </label>
      </section>

      <section className={styles.formCard}>
        <div className={styles.sectionHeading}>
          <span>05</span>
          <div>
            <h2>Operations & workflow</h2>
            <p>
              These details help us estimate the right setup and package level.
            </p>
          </div>
        </div>

        <div className={styles.gridTwo}>
          <label>
            Expected monthly volume
            <input
              name="expected_volume"
              placeholder="Example: 100 bookings / 300 orders"
            />
          </label>

          <label>
            Payment methods needed
            <input
              name="payment_methods"
              placeholder="GCash, Maya, cards, PayPal, cash, etc."
            />
          </label>

          <label>
            Delivery / fulfillment needs
            <input
              name="delivery_needs"
              placeholder="Digital download, shipping, pickup, service only, etc."
            />
          </label>

          <label>
            Admin / staff access
            <input
              name="admin_access"
              placeholder="Who needs access and what should they manage?"
            />
          </label>
        </div>

        <label>
          Integrations or other tools you currently use
          <textarea
            name="integrations"
            rows={3}
            placeholder="Example: Google Calendar, Gmail, Facebook, existing payment provider, spreadsheets, etc."
          />
        </label>
      </section>

      <section className={styles.formCard}>
        <div className={styles.sectionHeading}>
          <span>06</span>
          <div>
            <h2>Branding & content</h2>
            <p>
              It is okay if these are not ready yet. This only helps us plan.
            </p>
          </div>
        </div>

        <div className={styles.gridTwo}>
          <label>
            Do you already have a logo?
            <select name="logo_ready" defaultValue="Yes">
              <option>Yes</option>
              <option>No</option>
              <option>Still being made</option>
            </select>
          </label>

          <label>
            Brand colors / visual style ready?
            <select name="branding_ready" defaultValue="Yes">
              <option>Yes</option>
              <option>No</option>
              <option>Need help choosing</option>
            </select>
          </label>

          <label>
            Photos / written content ready?
            <select name="content_ready" defaultValue="Some">
              <option>Yes</option>
              <option>Some</option>
              <option>No</option>
            </select>
          </label>

          <label>
            Domain status
            <select name="domain_status" defaultValue="No domain yet">
              <option>No domain yet</option>
              <option>Already have a domain</option>
              <option>Need help choosing a domain</option>
              <option>Not applicable</option>
            </select>
          </label>
        </div>
      </section>

      <section className={styles.formCard}>
        <div className={styles.sectionHeading}>
          <span>07</span>
          <div>
            <h2>Budget & timeline</h2>
            <p>
              This helps us recommend a realistic scope instead of quoting
              features you do not need.
            </p>
          </div>
        </div>

        <div className={styles.gridTwo}>
          <label>
            Estimated budget *
            <select name="budget" required defaultValue="">
              <option value="" disabled>
                Select your budget
              </option>
              {budgetOptions.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </label>

          <label>
            Preferred timeline *
            <select name="timeline" required defaultValue="">
              <option value="" disabled>
                Select timeline
              </option>
              {timelineOptions.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </label>
        </div>

        <label>
          Anything else we should know?
          <textarea
            name="notes"
            rows={5}
            placeholder="Special requests, examples you like, specific workflow requirements, questions, etc."
          />
        </label>
      </section>

      {submitError ? (
        <div
          role="alert"
          style={{
            padding: "14px 16px",
            border: "1px solid #efb2b2",
            borderRadius: 12,
            background: "#fff7f7",
          }}
        >
          {submitError}
        </div>
      ) : null}

      {submitted ? (
        <div
          role="status"
          style={{
            padding: "14px 16px",
            border: "1px solid #b9dec7",
            borderRadius: 12,
            background: "#f6fff9",
          }}
        >
          Your quotation request was saved successfully. Telegram should open
          with a copy of your request ready to send.
        </div>
      ) : null}

      <section className={styles.submitCard}>
        <div>
          <small>Ready?</small>
          <h2>Send your quotation request.</h2>
          <p>
            Your request will be saved securely first, then Telegram will open
            with the same details so you can message TCL directly.
          </p>
        </div>

        <button
          className="button button-primary"
          type="submit"
          disabled={submitting}
        >
          {submitting ? "Saving request..." : "Submit Request →"}
        </button>
      </section>
    </form>
  );
}
