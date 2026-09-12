"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import styles from "./quote.module.css";

type Props = {
  productName: string;
  productSlug: string;
  category: string;
};

const projectContextOptions = [
  "Business / commercial",
  "Personal",
  "School / education",
  "Teacher / classroom use",
  "Student project",
  "Organization / community",
  "Professional / portfolio",
  "Internal team / office use",
  "Event / campaign",
  "Other",
];

const projectTypeOptions = [
  "Business / information website",
  "Booking / appointment system",
  "Quiz / reviewer / exam system",
  "Online shop / e-commerce",
  "Admin / management system",
  "Client / customer portal",
  "Member / student portal",
  "Portfolio / professional website",
  "Personal website",
  "Blog / publication",
  "Organization / advocacy website",
  "Event / registration system",
  "Landing page / campaign website",
  "Custom web application / system",
  "Other / not sure yet",
];

const featureGroups = [
  {
    title: "Pages & content",
    description: "For websites, portals, and information-based projects.",
    options: [
      "Home / landing page",
      "About / information page",
      "Services",
      "Products / catalog",
      "Portfolio / projects",
      "Gallery / media",
      "Blog / articles",
      "Pricing / packages",
      "FAQ",
      "Testimonials / reviews",
      "Profiles / directory",
      "Policies / legal pages",
      "Custom content pages",
    ],
  },
  {
    title: "Forms, bookings & submissions",
    description: "Ways users can send information or complete actions.",
    options: [
      "Contact form",
      "Inquiry form",
      "Request-a-quote form",
      "Booking / appointment system",
      "Reservation system",
      "Event registration",
      "Application form",
      "Quiz / test / exam form",
      "Survey / assessment",
      "Custom forms",
      "File uploads",
      "Document submission",
    ],
  },
  {
    title: "Accounts, access & permissions",
    description: "For projects that need logins or different user roles.",
    options: [
      "Admin dashboard",
      "One admin only",
      "Multiple admins",
      "Individual user accounts",
      "Student accounts",
      "Teacher accounts",
      "Customer / client accounts",
      "Member accounts",
      "Staff accounts",
      "Role-based permissions",
      "Private / restricted content",
      "Account approval",
      "Password reset",
    ],
  },
  {
    title: "Management & data",
    description: "For systems where the admin creates or manages records.",
    options: [
      "Content management",
      "Create / edit / delete records",
      "Bulk import / upload",
      "CSV / spreadsheet import",
      "Search / filters",
      "Categories / tags",
      "Status management",
      "Approval workflow",
      "Data export",
      "Reports / analytics",
      "Activity / history log",
      "Custom dashboard workflow",
    ],
  },
  {
    title: "Quiz, reviewer & learning features",
    description: "Useful for education, training, assessments, or reviewer systems.",
    options: [
      "Multiple questionnaire / exam sets",
      "Question bank",
      "Manual question creation",
      "Bulk question import",
      "One question at a time",
      "Multiple-choice questions",
      "Attempt limits",
      "Unlimited attempts",
      "Instant result / score",
      "Answer review",
      "Reveal correct answer after each question",
      "Reveal correct answers after completion",
      "Randomized questions",
      "Randomized answer choices",
      "Progress tracking",
    ],
  },
  {
    title: "Selling & payments",
    description: "For shops, paid services, subscriptions, or paid access.",
    options: [
      "Online shop / cart",
      "Online payments",
      "Down payment workflow",
      "Digital product delivery",
      "Inventory tracking",
      "Product variants",
      "Shipping / delivery",
      "Pickup",
      "Promo / discount tools",
      "Subscriptions / memberships",
    ],
  },
  {
    title: "Notifications & automation",
    description: "For projects that need alerts or automatic actions.",
    options: [
      "Email notifications",
      "Automated emails",
      "Admin notifications",
      "User notifications",
      "Booking reminders",
      "Status updates",
      "Custom workflow automation",
      "Scheduled actions",
    ],
  },
  {
    title: "Technical & integrations",
    description: "Optional setup and connections with other services.",
    options: [
      "Third-party integrations",
      "Google Calendar",
      "Google Sheets",
      "Email / Gmail",
      "Payment provider integration",
      "Analytics",
      "Basic SEO",
      "Custom domain setup",
      "Multi-language",
      "Mobile-friendly responsive design",
      "Not sure yet — recommend what I need",
    ],
  },
] as const;

const featureOptions = featureGroups.flatMap((group) => [...group.options]);

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

      projectContext: value("project_context"),
      businessType: value("business_type"),
      businessLocation: value("business_location"),
      businessAge: value("business_age"),
      staffCount: value("staff_count"),
      locationCount: value("location_count"),
      currentLink: value("current_link"),
      existingWebsite: value("existing_website"),

      userTypes: value("user_types"),
      accessModel: value("access_model"),
      adminRequirements: value("admin_requirements"),
      deviceRequirements: value("device_requirements"),

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

      dataManagement: value("data_management"),
      recurringChanges: value("recurring_changes"),
      usageRules: value("usage_rules"),
      resultsReporting: value("results_reporting"),

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
        "TCL CUSTOM PROJECT QUOTATION REQUEST",
        "",
        `Request ID: ${result.requestId ?? "Saved"}`,
        `Service: ${productName}`,
        `Category: ${category}`,
        "",
        "CONTACT",
        `Name: ${displayValue(payload.fullName)}`,
        `Project / business / organization: ${displayValue(payload.businessName)}`,
        `Email: ${displayValue(payload.email)}`,
        `Mobile / Telegram: ${displayValue(payload.contactNumber)}`,
        `Preferred contact: ${displayValue(payload.preferredContact)}`,
        "",
        "PROJECT",
        `Context: ${displayValue(payload.projectContext)}`,
        `Project type: ${displayValue(payload.businessType)}`,
        `Purpose / content: ${displayValue(payload.offerings)}`,
        `Main goal: ${displayValue(payload.mainGoal)}`,
        `Problem to solve: ${displayValue(payload.mainProblems)}`,
        "",
        "USERS & ACCESS",
        `Who will use it: ${displayValue(payload.userTypes)}`,
        `Account / access setup: ${displayValue(payload.accessModel)}`,
        `Admin needs: ${displayValue(payload.adminRequirements)}`,
        `Expected users / activity: ${displayValue(payload.expectedVolume)}`,
        "",
        "WORKFLOW",
        `What users should be able to do: ${displayValue(payload.visitorActions)}`,
        `Current process: ${displayValue(payload.currentProcess)}`,
        `Data / content management: ${displayValue(payload.dataManagement)}`,
        `Recurring changes: ${displayValue(payload.recurringChanges)}`,
        `Rules / limits: ${displayValue(payload.usageRules)}`,
        `Results / reports: ${displayValue(payload.resultsReporting)}`,
        "",
        "FEATURES",
        featureText,
        "",
        "TECHNICAL / MANAGEMENT",
        `Admin / editor access: ${displayValue(payload.adminAccess)}`,
        `Devices: ${displayValue(payload.deviceRequirements)}`,
        `Integrations: ${displayValue(payload.integrations)}`,
        `Online payments: ${displayValue(payload.onlinePayments)}`,
        `Payment methods: ${displayValue(payload.paymentMethods)}`,
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
        `https://t.me/tclsystemsanddigitalsph?text=${encodeURIComponent(message)}`,
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
            Project / business / organization name *
            <input
              name="business_name"
              required
              placeholder="Project name, school, business, organization, personal brand, etc."
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
              <option>Messenger</option>
            </select>
          </label>
        </div>
      </section>

      <section className={styles.formCard}>
        <div className={styles.sectionHeading}>
          <span>02</span>
          <div>
            <h2>Project type & purpose</h2>
            <p>
              Tell us what kind of project this is. It does not have to be for a
              business.
            </p>
          </div>
        </div>

        <div className={styles.gridTwo}>
          <label>
            This project is mainly for *
            <select name="project_context" required defaultValue="">
              <option value="" disabled>
                Select
              </option>
              {projectContextOptions.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </label>

          <label>
            What are you building? *
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
              placeholder="Philippines, worldwide, school only, online only, etc."
            />
          </label>

          <label>
            Project stage
            <select name="business_age" defaultValue="">
              <option value="">Select</option>
              <option>Idea / planning stage</option>
              <option>Not launched yet</option>
              <option>Already using a manual process</option>
              <option>Existing system needs improvement</option>
              <option>Existing website needs replacement</option>
              <option>Already active / operating</option>
            </select>
          </label>

          <label>
            People managing the project
            <input
              name="staff_count"
              placeholder="Just me, 1 teacher, small team, office staff, etc."
            />
          </label>

          <label>
            Locations / groups / branches
            <input
              name="location_count"
              placeholder="1 school, multiple branches, one group, not applicable"
            />
          </label>

          <label>
            Existing website / form / system / page
            <input
              name="current_link"
              placeholder="Website, Google Form, Facebook page, existing app, etc."
            />
          </label>

          <label>
            Do you already have an existing website or system?
            <select name="existing_website" defaultValue="No">
              <option>Yes</option>
              <option>No</option>
              <option>Only social media / another platform</option>
              <option>Using Google Forms / spreadsheets / manual tools</option>
              <option>Currently being built</option>
              <option>Not sure</option>
            </select>
          </label>
        </div>

        <label>
          Describe the project and what it is for *
          <textarea
            name="offerings"
            required
            rows={4}
            placeholder="Example: a reviewer system for students, booking website for clients, internal record system, portfolio, online shop, information site, or another custom idea."
          />
        </label>
      </section>

      <section className={styles.formCard}>
        <div className={styles.sectionHeading}>
          <span>03</span>
          <div>
            <h2>Users & access</h2>
            <p>
              Who will use the project, and does anyone need a private account or
              special access?
            </p>
          </div>
        </div>

        <label>
          Who will use it?
          <textarea
            name="user_types"
            rows={3}
            placeholder="Example: only me, one teacher/admin, students, customers, staff, members, public visitors, or different types of users."
          />
        </label>

        <div className={styles.gridTwo}>
          <label>
            Do users need their own accounts?
            <select name="user_accounts" defaultValue="No">
              <option>No</option>
              <option>Yes — individual accounts</option>
              <option>Yes — shared/group accounts</option>
              <option>Only admin accounts</option>
              <option>Maybe / not sure</option>
            </select>
          </label>

          <label>
            Do you need to manage content or records yourself?
            <select name="self_manage" defaultValue="Not sure">
              <option>Yes — I need an admin dashboard</option>
              <option>Only certain parts</option>
              <option>No — TCL can handle future updates</option>
              <option>Not sure</option>
            </select>
          </label>
        </div>

        <label>
          Explain the account / access setup you want
          <textarea
            name="access_model"
            rows={4}
            placeholder="Example: 1 admin only; every student must have their own account; accounts should not be shared; staff have different permissions; public users do not need login."
          />
        </label>

        <label>
          What should the admin or owner be able to manage?
          <textarea
            name="admin_requirements"
            rows={4}
            placeholder="Example: create questionnaire sets, import questions, edit users, approve records, update services, view results, change settings, manage bookings, export data, etc."
          />
        </label>

        <label>
          Devices the project should work well on
          <input
            name="device_requirements"
            placeholder="Phone, tablet, laptop, desktop, all devices, or any special requirement"
          />
        </label>
      </section>

      <section className={styles.formCard}>
        <div className={styles.sectionHeading}>
          <span>04</span>
          <div>
            <h2>Workflow & main functions</h2>
            <p>
              Explain what happens from the moment someone opens the project
              until they finish what they need to do.
            </p>
          </div>
        </div>

        <label>
          What should users be able to do? *
          <textarea
            name="visitor_actions"
            required
            rows={5}
            placeholder="Example: log in, choose a questionnaire set, answer one question at a time, see a score, review correct answers, book an appointment, buy a product, upload a file, submit a request, or view information."
          />
        </label>

        <label>
          How do you currently do this?
          <textarea
            name="current_process"
            rows={4}
            placeholder="Example: Google Forms, spreadsheets, chat messages, manual records, social media, paper forms, old website, or no current system."
          />
        </label>

        <label>
          What problems or needs should this project solve? *
          <textarea
            name="main_problems"
            required
            rows={4}
            placeholder="What is difficult, repetitive, confusing, slow, or missing in your current process?"
          />
        </label>

        <label>
          Main goal for the project *
          <textarea
            name="main_goal"
            required
            rows={3}
            placeholder="What should the finished project help you accomplish?"
          />
        </label>
      </section>

      <section className={styles.formCard}>
        <div className={styles.sectionHeading}>
          <span>05</span>
          <div>
            <h2>Features & system requirements</h2>
            <p>
              Select anything that may apply. These are for planning only and do
              not automatically become part of the final quotation.
            </p>
          </div>
        </div>

        <div className={styles.selectionSummary}>
          <span>Selected</span>
          <strong>{selectedFeatures.length}</strong>
          <p>
            You can select several options, or choose “Not sure yet” if you want
            TCL to recommend the right setup.
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
            <h2>Data, content & rules</h2>
            <p>
              This helps TCL estimate how much data the system needs to manage
              and whether there are special rules or recurring changes.
            </p>
          </div>
        </div>

        <label>
          What information, content, or records will the admin manage?
          <textarea
            name="data_management"
            rows={4}
            placeholder="Example: questionnaire sets and questions, students, services, appointments, products, customers, documents, scores, applications, or other records. Mention whether you prefer manual entry, import, or both."
          />
        </label>

        <label>
          Will this information change regularly?
          <textarea
            name="recurring_changes"
            rows={3}
            placeholder="Example: students change every semester, new questionnaires every week, products change monthly, appointments are added daily, or data rarely changes."
          />
        </label>

        <label>
          Are there any limits, rules, permissions, or special conditions?
          <textarea
            name="usage_rules"
            rows={4}
            placeholder="Example: 3 attempts per quiz, unlimited attempts, one account per student, only admin can create sets, bookings require approval, certain users can only see certain records."
          />
        </label>

        <label>
          Results, reports, history, or tracking needed
          <textarea
            name="results_reporting"
            rows={4}
            placeholder="Example: instant score, answer review, progress history, booking history, reports, export to spreadsheet, admin analytics, or no tracking needed."
          />
        </label>
      </section>

      <section className={styles.formCard}>
        <div className={styles.sectionHeading}>
          <span>07</span>
          <div>
            <h2>Volume, management & integrations</h2>
            <p>
              These details help estimate database use, admin complexity, and
              outside services.
            </p>
          </div>
        </div>

        <div className={styles.gridTwo}>
          <label>
            Expected users / activity
            <input
              name="expected_volume"
              placeholder="Example: 30 students per class, 500 members, 20 bookings/week, not sure"
            />
          </label>

          <label>
            Admin / editor access
            <input
              name="admin_access"
              placeholder="Example: 1 admin, 2 teachers, owner + staff, different roles"
            />
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
              placeholder="Shipping, pickup, digital file, service only, not applicable"
            />
          </label>

          <label>
            Need another platform connected?
            <select name="integration_needed" defaultValue="Not sure">
              <option>Yes</option>
              <option>No</option>
              <option>Not sure</option>
            </select>
          </label>
        </div>

        <label>
          Integrations or tools you want connected
          <textarea
            name="integrations"
            rows={3}
            placeholder="Google Calendar, Sheets, Gmail, payment provider, analytics, existing school/business platform, social media, etc."
          />
        </label>

        <label>
          Anything technical you are unsure about?
          <textarea
            name="uncertainty_notes"
            rows={3}
            placeholder="You can describe the result you want even if you do not know the technical term. TCL can recommend the simplest suitable setup."
          />
        </label>
      </section>

      <section className={styles.formCard}>
        <div className={styles.sectionHeading}>
          <span>08</span>
          <div>
            <h2>Branding & design</h2>
            <p>
              Skip anything that does not apply to your project.
            </p>
          </div>
        </div>

        <div className={styles.gridTwo}>
          <label>
            Do you already have a logo?
            <select name="logo_ready" defaultValue="Not applicable">
              <option>Yes</option>
              <option>No</option>
              <option>Still being made</option>
              <option>Not applicable</option>
            </select>
          </label>

          <label>
            Colors / visual style ready?
            <select name="branding_ready" defaultValue="Not applicable">
              <option>Yes</option>
              <option>No</option>
              <option>Need help choosing</option>
              <option>Not applicable</option>
            </select>
          </label>

          <label>
            Photos / written content / materials ready?
            <select name="content_ready" defaultValue="Some">
              <option>Yes</option>
              <option>Some</option>
              <option>No</option>
              <option>Need help organizing</option>
              <option>Not applicable</option>
            </select>
          </label>

          <label>
            Domain status
            <select name="domain_status" defaultValue="Not sure yet">
              <option>No domain yet</option>
              <option>Already have a domain</option>
              <option>Need help choosing a domain</option>
              <option>Free Vercel subdomain is okay</option>
              <option>Not applicable</option>
              <option>Not sure yet</option>
            </select>
          </label>
        </div>
      </section>

      <section className={styles.formCard}>
        <div className={styles.sectionHeading}>
          <span>09</span>
          <div>
            <h2>Budget, timeline & final notes</h2>
            <p>
              TCL uses these details to recommend a realistic scope and prepare
              the quotation.
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
            placeholder="Add examples, exact quantities, special rules, must-have functions, references, questions, or any details that may affect the project scope."
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
          <small>Custom project quotation</small>
          <h2>Ready to send your project details?</h2>
          <p>
            TCL will review the actual workflow and requirements first. The
            final quotation will be based on the agreed project scope, and you
            are not charged by submitting this form.
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
