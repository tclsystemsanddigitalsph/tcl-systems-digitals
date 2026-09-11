"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import styles from "./quote.module.css";

type Props = {
  productName: string;
  productSlug: string;
  category: string;
};

const featureGroups = [
  {
    title: "Pages & content",
    description: "Choose the pages or content areas you may want.",
    options: [
      "Home / landing page",
      "About page",
      "Services page",
      "Products / catalog",
      "Portfolio / projects",
      "Gallery",
      "Blog / articles",
      "Advocacy / information pages",
      "Pricing / packages",
      "FAQ page",
      "Testimonials / reviews",
      "Team / staff profiles",
      "Locations / branches",
      "Policies / legal pages",
    ],
  },
  {
    title: "Forms & visitor actions",
    description: "What should visitors be able to do on the website?",
    options: [
      "Contact form",
      "Inquiry form",
      "Request-a-quote form",
      "Booking / appointment system",
      "Reservation system",
      "Event registration",
      "Application form",
      "Custom forms",
      "Newsletter signup",
      "File uploads",
      "Search",
      "Categories / tags",
      "Social media links",
      "Telegram / Messenger / WhatsApp contact",
    ],
  },
  {
    title: "Selling & payments",
    description: "Useful for shops, paid services, digital products, and memberships.",
    options: [
      "Online shop / cart",
      "Online payments",
      "Down payment workflow",
      "Digital product delivery",
      "Inventory tracking",
      "Product variants",
      "Shipping / delivery options",
      "Pickup options",
      "Promo or discount tools",
    ],
  },
  {
    title: "Accounts & management",
    description: "For websites that need an editable backend or user access.",
    options: [
      "Admin dashboard",
      "Content management",
      "Customer accounts",
      "Member accounts",
      "Member-only content",
      "Customer database",
      "Staff accounts",
      "Multiple staff schedules",
      "Multiple business locations",
      "Reports / analytics",
      "Email notifications",
      "Automated emails",
      "Custom dashboard workflow",
    ],
  },
  {
    title: "Technical & setup",
    description: "Optional technical features and integrations.",
    options: [
      "Third-party integrations",
      "Google Calendar integration",
      "Domain setup assistance",
      "Basic SEO setup",
      "Analytics setup",
      "Custom workflow automation",
      "Multi-language website",
      "Not sure yet — recommend what I need",
    ],
  },
] as const;

const featureOptions = featureGroups.flatMap((group) => [...group.options]);

const projectTypeOptions = [
  "Business website",
  "Booking / service website",
  "Online shop / e-commerce",
  "Portfolio / professional website",
  "Personal website",
  "Blog / publication",
  "Advocacy / organization website",
  "Event website",
  "Membership / community website",
  "Landing page / campaign website",
  "Custom web system",
  "Other / not sure yet",
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
  const formRef = useRef<HTMLFormElement>(null);
  const draftReadyRef = useRef(false);

  const draftKey = useMemo(
    () => `tcl-quotation-draft:${productSlug}`,
    [productSlug],
  );

  useEffect(() => {
    const form = formRef.current;
    if (!form) return;

    try {
      const rawDraft = window.localStorage.getItem(draftKey);

      if (rawDraft) {
        const draft = JSON.parse(rawDraft) as {
          fields?: Record<string, string>;
          selectedFeatures?: string[];
        };

        if (draft.fields) {
          Object.entries(draft.fields).forEach(([name, value]) => {
            const field = form.elements.namedItem(name);

            if (
              field instanceof HTMLInputElement ||
              field instanceof HTMLTextAreaElement ||
              field instanceof HTMLSelectElement
            ) {
              field.value = value;
            }
          });
        }

        if (Array.isArray(draft.selectedFeatures)) {
          setSelectedFeatures(
            draft.selectedFeatures.filter(
              (feature): feature is string =>
                typeof feature === "string" &&
                featureOptions.includes(
                  feature as (typeof featureOptions)[number],
                ),
            ),
          );
        }
      }
    } catch (error) {
      console.warn("Unable to restore quotation draft:", error);
    } finally {
      draftReadyRef.current = true;
    }
  }, [draftKey]);

  function saveDraft(form: HTMLFormElement, features = selectedFeatures) {
    if (!draftReadyRef.current) return;

    const formData = new FormData(form);
    const fields: Record<string, string> = {};

    formData.forEach((value, key) => {
      if (typeof value === "string") {
        fields[key] = value;
      }
    });

    try {
      window.localStorage.setItem(
        draftKey,
        JSON.stringify({
          fields,
          selectedFeatures: features,
          savedAt: new Date().toISOString(),
        }),
      );
    } catch (error) {
      console.warn("Unable to save quotation draft:", error);
    }
  }

  function handleDraftChange() {
    if (formRef.current) {
      saveDraft(formRef.current);
    }
  }

  function toggleFeature(feature: string) {
    setSelectedFeatures((current) => {
      const next = current.includes(feature)
        ? current.filter((item) => item !== feature)
        : [...current, feature];

      if (formRef.current) {
        saveDraft(formRef.current, next);
      }

      return next;
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    setSubmitError("");
    setSubmitted(false);

    const form = new FormData(event.currentTarget);
    const value = (key: string) => String(form.get(key) ?? "").trim();

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
      existingWebsite: value("existing_website"),
      visitorActions: value("visitor_actions"),
      selfManage: value("self_manage"),
      userAccounts: value("user_accounts"),
      sellOnline: value("sell_online"),
      onlinePayments: value("online_payments"),
      integrationNeeded: value("integration_needed"),
      uncertaintyNotes: value("uncertainty_notes"),
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
        headers: { "Content-Type": "application/json" },
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

      const displayValue = (field: string) => field || "Not provided";
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
        `Business / project name: ${displayValue(payload.businessName)}`,
        `Email: ${displayValue(payload.email)}`,
        `Mobile / Telegram: ${displayValue(payload.contactNumber)}`,
        `Preferred contact: ${displayValue(payload.preferredContact)}`,
        "",
        "PROJECT DETAILS",
        `Project type: ${displayValue(payload.businessType)}`,
        `Location / audience area: ${displayValue(payload.businessLocation)}`,
        `Project / business stage: ${displayValue(payload.businessAge)}`,
        `Team size: ${displayValue(payload.staffCount)}`,
        `Number of locations: ${displayValue(payload.locationCount)}`,
        `Existing website / social link: ${displayValue(payload.currentLink)}`,
        `Already has a website: ${displayValue(payload.existingWebsite)}`,
        `Products, services, content, or purpose: ${displayValue(payload.offerings)}`,
        "",
        "HOW THE WEBSITE SHOULD WORK",
        `What visitors should be able to do: ${displayValue(payload.visitorActions)}`,
        `Needs to update website themselves: ${displayValue(payload.selfManage)}`,
        `Needs user/customer accounts: ${displayValue(payload.userAccounts)}`,
        `Will sell online: ${displayValue(payload.sellOnline)}`,
        `Needs online payments: ${displayValue(payload.onlinePayments)}`,
        `Needs platform integrations: ${displayValue(payload.integrationNeeded)}`,
        `Unsure / wants TCL recommendation: ${displayValue(payload.uncertaintyNotes)}`,
        "",
        "CURRENT SETUP",
        `Current process / setup: ${displayValue(payload.currentProcess)}`,
        `Main problems / needs: ${displayValue(payload.mainProblems)}`,
        "",
        "PROJECT REQUIREMENTS",
        featureText,
        "",
        `Main goal: ${displayValue(payload.mainGoal)}`,
        `Expected visitors / customers / bookings / orders: ${displayValue(
          payload.expectedVolume,
        )}`,
        `Payment methods needed: ${displayValue(payload.paymentMethods)}`,
        `Delivery / fulfillment needs: ${displayValue(payload.deliveryNeeds)}`,
        `Admin / editor access needs: ${displayValue(payload.adminAccess)}`,
        `Integrations / tools: ${displayValue(payload.integrations)}`,
        "",
        "BRANDING & CONTENT",
        `Logo ready: ${displayValue(payload.logoReady)}`,
        `Brand colors / style ready: ${displayValue(payload.brandingReady)}`,
        `Photos / written content ready: ${displayValue(payload.contentReady)}`,
        `Domain status: ${displayValue(payload.domainStatus)}`,
        "",
        "BUDGET & TIMELINE",
        `Budget: ${displayValue(payload.budget)}`,
        `Timeline: ${displayValue(payload.timeline)}`,
        "",
        "ADDITIONAL NOTES",
        displayValue(payload.notes),
      ].join("\n");

      try {
        window.localStorage.removeItem(draftKey);
      } catch (error) {
        console.warn("Unable to clear quotation draft:", error);
      }

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
    <form
      ref={formRef}
      className={styles.form}
      onSubmit={handleSubmit}
      onInput={handleDraftChange}
      onChange={handleDraftChange}
    >
      <section className={styles.formCard}>
        <div className={styles.sectionHeading}>
          <span>01</span>
          <div>
            <h2>Contact details</h2>
            <p>Who should TCL contact about this quotation?</p>
          </div>
        </div>

        <div className={styles.gridTwo}>
          <label>
            Full name *
            <input name="full_name" required placeholder="Your full name" />
          </label>

          <label>
            Business / project / brand name *
            <input
              name="business_name"
              required
              placeholder="Business, organization, blog, personal brand, etc."
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
            <h2>What are you building?</h2>
            <p>
              This form works for businesses, professionals, creators,
              organizations, blogs, portfolios, personal sites, shops, and
              custom systems.
            </p>
          </div>
        </div>

        <div className={styles.gridTwo}>
          <label>
            Project type *
            <select name="business_type" required defaultValue="">
              <option value="" disabled>
                Select a project type
              </option>
              {projectTypeOptions.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </label>

          <label>
            Location / audience area
            <input
              name="business_location"
              placeholder="City / country, worldwide, or online only"
            />
          </label>

          <label>
            Project / business stage
            <select name="business_age" defaultValue="">
              <option value="">Select</option>
              <option>Not launched yet</option>
              <option>New / under 1 year</option>
              <option>1–3 years</option>
              <option>3–5 years</option>
              <option>5+ years</option>
              <option>Personal / not a business</option>
            </select>
          </label>

          <label>
            Team size
            <input
              name="staff_count"
              placeholder="Solo, small team, organization, not applicable"
            />
          </label>

          <label>
            Number of physical locations
            <input
              name="location_count"
              placeholder="1, multiple, online only, or not applicable"
            />
          </label>

          <label>
            Existing website / social page
            <input
              name="current_link"
              placeholder="Website, Facebook, Instagram, blog, portfolio, etc."
            />
          </label>
        </div>

        <label>
          What will the website represent or contain? *
          <textarea
            name="offerings"
            required
            rows={4}
            placeholder="Tell us about your services, products, articles, advocacy, portfolio, organization, personal content, or other purpose."
          />
        </label>
      </section>

      <section className={styles.formCard}>
        <div className={styles.sectionHeading}>
          <span>03</span>
          <div>
            <h2>How should the website work?</h2>
            <p>
              These questions help TCL understand the actual experience you need,
              even if you are not sure which technical features are required.
            </p>
          </div>
        </div>

        <label>
          What should visitors be able to do on the website? *
          <textarea
            name="visitor_actions"
            required
            rows={4}
            placeholder="Example: read articles, browse services, send inquiries, book appointments, buy products, register for events, view my portfolio, download files, or simply learn more about me."
          />
        </label>

        <div className={styles.gridTwo}>
          <label>
            Do you already have an existing website?
            <select name="existing_website" defaultValue="No">
              <option>Yes</option>
              <option>No</option>
              <option>Currently being built</option>
              <option>Only social media / another platform</option>
              <option>Not sure</option>
            </select>
          </label>

          <label>
            Do you need to update the website yourself?
            <select name="self_manage" defaultValue="Not sure">
              <option>Yes — I want to manage content myself</option>
              <option>No — I can request future updates</option>
              <option>Only certain parts</option>
              <option>Not sure</option>
            </select>
          </label>

          <label>
            Do you need user / customer accounts?
            <select name="user_accounts" defaultValue="No">
              <option>Yes</option>
              <option>No</option>
              <option>Maybe / not sure</option>
            </select>
          </label>

          <label>
            Will you sell anything online?
            <select name="sell_online" defaultValue="No">
              <option>No</option>
              <option>Physical products</option>
              <option>Digital products</option>
              <option>Services</option>
              <option>Subscriptions / memberships</option>
              <option>Multiple types</option>
              <option>Maybe / not sure</option>
            </select>
          </label>

          <label>
            Do you need online payments?
            <select name="online_payments" defaultValue="No">
              <option>Yes</option>
              <option>No</option>
              <option>Maybe / not sure</option>
            </select>
          </label>

          <label>
            Do you need integrations with another platform?
            <select name="integration_needed" defaultValue="Not sure">
              <option>Yes</option>
              <option>No</option>
              <option>Not sure</option>
            </select>
          </label>
        </div>

        <label>
          Anything you&apos;re unsure about or want TCL to recommend?
          <textarea
            name="uncertainty_notes"
            rows={3}
            placeholder="Tell us what you are unsure about. TCL can recommend a simpler setup based on your goals and budget."
          />
        </label>
      </section>

      <section className={styles.formCard}>
        <div className={styles.sectionHeading}>
          <span>04</span>
          <div>
            <h2>Current setup & goals</h2>
            <p>
              Tell us what you use now, what is not working well, and what you
              want the new website to improve.
            </p>
          </div>
        </div>

        <label>
          How do you currently manage your online presence or workflow?
          <textarea
            name="current_process"
            rows={4}
            placeholder="Example: social media only, an old website, manual bookings, Google Forms, spreadsheets, a free blog, or nothing yet."
          />
        </label>

        <label>
          What problems or needs should this project solve? *
          <textarea
            name="main_problems"
            required
            rows={4}
            placeholder="Examples: look more professional, publish articles, accept bookings, sell online, organize inquiries, automate work, showcase projects, or make information easier to find."
          />
        </label>

        <label>
          Main goal for the project *
          <textarea
            name="main_goal"
            required
            rows={3}
            placeholder="What should this website help you accomplish?"
          />
        </label>
      </section>

      <section className={styles.formCard}>
        <div className={styles.sectionHeading}>
          <span>05</span>
          <div>
            <h2>Pages & features</h2>
            <p>
              Tick anything that may apply. You can choose as many as you want,
              and it is completely okay to select “Not sure yet.”
            </p>
          </div>
        </div>

        <div className={styles.selectionSummary}>
          <span>Selected</span>
          <strong>{selectedFeatures.length}</strong>
          <p>
            These choices help TCL prepare the right scope. Selecting a feature
            does not automatically add it to the final quotation.
          </p>
        </div>

        <div className={styles.featureGroups}>
          {featureGroups.map((group) => (
            <div className={styles.featureGroup} key={group.title}>
              <div className={styles.featureGroupHeading}>
                <h3>{group.title}</h3>
                <p>{group.description}</p>
              </div>

              <div className={styles.featureGrid}>
                {group.options.map((feature) => (
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
            </div>
          ))}
        </div>
      </section>

      <section className={styles.formCard}>
        <div className={styles.sectionHeading}>
          <span>06</span>
          <div>
            <h2>Visitors, workflow & management</h2>
            <p>
              Skip anything that does not apply. These details help estimate
              complexity, integrations, and ongoing management needs.
            </p>
          </div>
        </div>

        <div className={styles.gridTwo}>
          <label>
            Expected activity
            <input
              name="expected_volume"
              placeholder="Visitors, inquiries, bookings, orders, members, readers, etc."
            />
          </label>

          <label>
            Payment methods needed
            <input
              name="payment_methods"
              placeholder="GCash, Maya, cards, PayPal, cash, none, not sure"
            />
          </label>

          <label>
            Delivery / fulfillment needs
            <input
              name="delivery_needs"
              placeholder="Shipping, pickup, digital download, service only, not applicable"
            />
          </label>

          <label>
            Admin / editor access
            <input
              name="admin_access"
              placeholder="Who should be able to edit content or manage the system?"
            />
          </label>
        </div>

        <label>
          Integrations or tools you want connected
          <textarea
            name="integrations"
            rows={3}
            placeholder="Google Calendar, Gmail, social media, payment providers, spreadsheets, analytics, newsletter tools, existing platforms, etc."
          />
        </label>
      </section>

      <section className={styles.formCard}>
        <div className={styles.sectionHeading}>
          <span>07</span>
          <div>
            <h2>Branding & content</h2>
            <p>
              These do not need to be complete yet. We only use this information
              to understand what still needs to be prepared.
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
              <option>Not applicable</option>
            </select>
          </label>

          <label>
            Brand colors / visual style ready?
            <select name="branding_ready" defaultValue="Yes">
              <option>Yes</option>
              <option>No</option>
              <option>Need help choosing</option>
              <option>Not applicable</option>
            </select>
          </label>

          <label>
            Photos / written content ready?
            <select name="content_ready" defaultValue="Some">
              <option>Yes</option>
              <option>Some</option>
              <option>No</option>
              <option>Need help organizing content</option>
            </select>
          </label>

          <label>
            Domain status
            <select name="domain_status" defaultValue="No domain yet">
              <option>No domain yet</option>
              <option>Already have a domain</option>
              <option>Need help choosing a domain</option>
              <option>Free Vercel subdomain is okay</option>
              <option>Not sure yet</option>
            </select>
          </label>
        </div>
      </section>

      <section className={styles.formCard}>
        <div className={styles.sectionHeading}>
          <span>08</span>
          <div>
            <h2>Budget, timeline & final notes</h2>
            <p>
              This helps TCL recommend a realistic scope based on what matters
              most to you.
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
            placeholder="Examples you like, must-have functions, special requests, questions, accessibility needs, design preferences, or anything you are unsure about."
          />
        </label>
      </section>

      {submitError ? (
        <div className={styles.errorMessage} role="alert">
          {submitError}
        </div>
      ) : null}

      {submitted ? (
        <div className={styles.successMessage} role="status">
          Your quotation request was saved successfully. Telegram should open
          with a copy of your request ready to send.
        </div>
      ) : null}

      <section className={styles.submitCard}>
        <div>
          <small>Quotation request</small>
          <h2>Ready to send your project details?</h2>
          <p>
            TCL will review your needs first and prepare a quotation based on
            the actual scope. You are not charged by submitting this form.
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
