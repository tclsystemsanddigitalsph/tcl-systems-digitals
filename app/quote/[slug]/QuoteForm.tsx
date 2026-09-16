"use client";

import {
  FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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
    description: "Website pages, information, media, and public-facing content.",
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
    description: "Ways users can submit information, requests, or reservations.",
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
    description: "Logins, private access, user roles, and account management.",
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
    description: "Tools for managing records, content, workflows, and reports.",
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
    title: "Quiz, reviewer & learning",
    description: "Education, training, reviewer, quiz, and assessment functions.",
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
    description: "Commerce, paid services, memberships, and order workflows.",
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
    description: "Alerts, reminders, status messages, and automatic actions.",
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
    description: "External services, domains, analytics, and technical setup.",
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

const sections = [
  "Contact",
  "Project",
  "Users",
  "Workflow",
  "Features",
  "Data",
  "Technical",
  "Branding",
  "Final",
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
  const [requestId, setRequestId] = useState("");
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

  function saveDraft(
    form: HTMLFormElement,
    features = selectedFeatures,
  ) {
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

    const formElement = event.currentTarget;

    setSubmitting(true);
    setSubmitError("");
    setSubmitted(false);
    setRequestId("");

    const form = new FormData(formElement);
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

      try {
        window.localStorage.removeItem(draftKey);
      } catch (error) {
        console.warn("Unable to clear quotation draft:", error);
      }

      formElement.reset();
      setSelectedFeatures([]);
      setRequestId(result.requestId ?? "");
      setSubmitted(true);

      window.setTimeout(() => {
        document
          .getElementById("quotation-result")
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 100);
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
      <section className={styles.formIntro}>
        <div className={styles.introTop}>
          <div>
            <span className={styles.eyebrow}>CUSTOM PROJECT REQUEST</span>
            <h2>Tell TCL what you need.</h2>
            <p>
              You do not need to know the technical terms. Describe your project
              in your own words and select anything that may apply.
            </p>
          </div>

          <div className={styles.autosaveBadge}>
            <span className={styles.autosaveDot} />
            Draft autosaves
          </div>
        </div>

        <div className={styles.introPoints}>
          <div>
            <strong>01</strong>
            <span>Complete the project details</span>
          </div>
          <div>
            <strong>02</strong>
            <span>TCL reviews the actual scope</span>
          </div>
          <div>
            <strong>03</strong>
            <span>Receive your quotation</span>
          </div>
        </div>

        <div className={styles.introNotice}>
          <strong>No commitment to purchase.</strong>
          <span>
            Submitting this form is only a request for assessment and quotation.
          </span>
        </div>
      </section>

      <nav className={styles.progressNav} aria-label="Quotation form sections">
        {sections.map((section, index) => (
          <a key={section} href={`#quote-section-${index + 1}`}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <small>{section}</small>
          </a>
        ))}
      </nav>

      <section
        className={styles.formCard}
        id="quote-section-1"
      >
        <div className={styles.sectionHeading}>
          <span>01</span>
          <div>
            <small>START HERE</small>
            <h2>Contact details</h2>
            <p>
              Tell us who this request is for and where TCL should send
              quotation-related updates.
            </p>
          </div>
        </div>

        <div className={styles.guidanceBox}>
          <strong>Written communication keeps everything clear.</strong>
          <p>
            Project scope, pricing, revisions, approvals, and changes should be
            confirmed through written communication.
          </p>
        </div>

        <div className={styles.gridTwo}>
          <label>
            <span>
              Full name <b>*</b>
            </span>
            <input
              name="full_name"
              required
              autoComplete="name"
              placeholder="Your full name"
            />
          </label>

          <label>
            <span>
              Project / business / organization name <b>*</b>
            </span>
            <input
              name="business_name"
              required
              placeholder="Business, school, project, personal brand, etc."
            />
          </label>

          <label>
            <span>
              Email address <b>*</b>
            </span>
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
            />
          </label>

          <label>
            <span>
              Contact number / Messenger / Telegram <b>*</b>
            </span>
            <input
              name="contact_number"
              required
              placeholder="09xx..., Messenger name/link, or @username"
            />
          </label>

          <label>
            <span>Preferred written contact</span>
            <select name="preferred_contact" defaultValue="">
              <option value="">Select preferred contact</option>
              <option>Email</option>
              <option>Messenger</option>
              <option>Telegram</option>
              <option>Mobile / SMS</option>
            </select>
          </label>
        </div>
      </section>

      <section
        className={styles.formCard}
        id="quote-section-2"
      >
        <div className={styles.sectionHeading}>
          <span>02</span>
          <div>
            <small>THE IDEA</small>
            <h2>Project type & purpose</h2>
            <p>
              Give us the basic context. Your project does not need to fit
              perfectly into one category.
            </p>
          </div>
        </div>

        <div className={styles.gridTwo}>
          <label>
            <span>
              This project is mainly for <b>*</b>
            </span>
            <select name="project_context" required defaultValue="">
              <option value="" disabled>
                Select project context
              </option>
              {projectContextOptions.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </label>

          <label>
            <span>
              What are you building? <b>*</b>
            </span>
            <select name="business_type" required defaultValue="">
              <option value="" disabled>
                Select project type
              </option>
              {projectTypeOptions.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </label>

          <label>
            <span>Location / audience area</span>
            <input
              name="business_location"
              placeholder="Philippines, worldwide, school only, online only..."
            />
          </label>

          <label>
            <span>Project stage</span>
            <select name="business_age" defaultValue="">
              <option value="">Select project stage</option>
              <option>Idea / planning stage</option>
              <option>Not launched yet</option>
              <option>Already using a manual process</option>
              <option>Existing system needs improvement</option>
              <option>Existing website needs replacement</option>
              <option>Already active / operating</option>
            </select>
          </label>

          <label>
            <span>People managing the project</span>
            <input
              name="staff_count"
              placeholder="Just me, 1 teacher, small team, office staff..."
            />
          </label>

          <label>
            <span>Locations / groups / branches</span>
            <input
              name="location_count"
              placeholder="1 school, several branches, one group, N/A..."
            />
          </label>

          <label>
            <span>Existing website / form / system / page</span>
            <input
              name="current_link"
              placeholder="Paste a link if available"
            />
          </label>

          <label>
            <span>Do you already have a website or system?</span>
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
          <span>
            Describe the project and what it is for <b>*</b>
          </span>
          <textarea
            name="offerings"
            required
            rows={5}
            placeholder="Example: I need a reviewer system where students can log in, choose a subject, answer quizzes, and review their results..."
          />
          <small className={styles.fieldHint}>
            A simple explanation is enough. You can describe what you want the
            finished project to do.
          </small>
        </label>
      </section>

      <section
        className={styles.formCard}
        id="quote-section-3"
      >
        <div className={styles.sectionHeading}>
          <span>03</span>
          <div>
            <small>ACCESS</small>
            <h2>Users & access</h2>
            <p>
              Tell us who will use the project and whether different people need
              different levels of access.
            </p>
          </div>
        </div>

        <label>
          <span>Who will use it?</span>
          <textarea
            name="user_types"
            rows={3}
            placeholder="Example: public visitors, customers, students, teachers, staff, members, one admin, or several user types."
          />
        </label>

        <div className={styles.gridTwo}>
          <label>
            <span>Do users need their own accounts?</span>
            <select name="user_accounts" defaultValue="No">
              <option>No</option>
              <option>Yes — individual accounts</option>
              <option>Yes — shared/group accounts</option>
              <option>Only admin accounts</option>
              <option>Maybe / not sure</option>
            </select>
          </label>

          <label>
            <span>Do you need to manage the project yourself?</span>
            <select name="self_manage" defaultValue="Not sure">
              <option>Yes — I need an admin dashboard</option>
              <option>Only certain parts</option>
              <option>No — TCL can handle future updates</option>
              <option>Not sure</option>
            </select>
          </label>
        </div>

        <label>
          <span>Explain the account / access setup you want</span>
          <textarea
            name="access_model"
            rows={4}
            placeholder="Example: one admin only, every student has an individual account, staff have different permissions, public visitors do not need to log in..."
          />
        </label>

        <label>
          <span>What should the admin or owner be able to manage?</span>
          <textarea
            name="admin_requirements"
            rows={4}
            placeholder="Example: users, bookings, products, questions, services, reports, records, settings, approvals..."
          />
        </label>

        <label>
          <span>Devices the project should work well on</span>
          <input
            name="device_requirements"
            placeholder="Phone, tablet, laptop, desktop, all devices..."
          />
        </label>
      </section>

      <section
        className={styles.formCard}
        id="quote-section-4"
      >
        <div className={styles.sectionHeading}>
          <span>04</span>
          <div>
            <small>HOW IT WORKS</small>
            <h2>Workflow & main functions</h2>
            <p>
              Walk us through what a user should be able to do from beginning to
              end.
            </p>
          </div>
        </div>

        <div className={styles.guidanceBox}>
          <strong>Think of this as a simple story.</strong>
          <p>
            Example: User signs in → chooses a service → selects a date → submits
            booking → admin reviews it → user receives confirmation.
          </p>
        </div>

        <label>
          <span>
            What should users be able to do? <b>*</b>
          </span>
          <textarea
            name="visitor_actions"
            required
            rows={5}
            placeholder="Describe the steps users should be able to take on the website or system."
          />
        </label>

        <label>
          <span>How do you currently do this?</span>
          <textarea
            name="current_process"
            rows={4}
            placeholder="Google Forms, spreadsheets, chat messages, paper records, social media, an old website, or no current system..."
          />
        </label>

        <label>
          <span>
            What problems or needs should this project solve? <b>*</b>
          </span>
          <textarea
            name="main_problems"
            required
            rows={4}
            placeholder="What is difficult, repetitive, confusing, slow, or currently missing?"
          />
        </label>

        <label>
          <span>
            Main goal for the project <b>*</b>
          </span>
          <textarea
            name="main_goal"
            required
            rows={3}
            placeholder="What should the finished project help you accomplish?"
          />
        </label>
      </section>

      <section
        className={`${styles.formCard} ${styles.featuresCard}`}
        id="quote-section-5"
      >
        <div className={styles.sectionHeading}>
          <span>05</span>
          <div>
            <small>BUILD YOUR SCOPE</small>
            <h2>Features & requirements</h2>
            <p>
              Select anything that sounds relevant. You are not locking these
              into the project yet.
            </p>
          </div>
        </div>

        <div className={styles.featureNotice}>
          <div>
            <strong>{selectedFeatures.length}</strong>
            <span>
              {selectedFeatures.length === 1
                ? "feature selected"
                : "features selected"}
            </span>
          </div>

          <p>
            These selections help TCL assess your project. They are requests for
            review and are only included once confirmed in the final quotation.
          </p>
        </div>

        <div className={styles.featureGroups}>
          {featureGroups.map((group) => (
            <div className={styles.featureGroup} key={group.title}>
              <div className={styles.featureGroupHeading}>
                <div>
                  <h3>{group.title}</h3>
                  <p>{group.description}</p>
                </div>
              </div>

              <div className={styles.featureGrid}>
                {group.options.map((feature) => {
                  const selected = selectedFeatures.includes(feature);

                  return (
                    <label
                      className={`${styles.featureOption} ${
                        selected ? styles.featureSelected : ""
                      }`}
                      key={feature}
                    >
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => toggleFeature(feature)}
                      />

                      <span className={styles.customCheck}>
                        {selected ? "✓" : ""}
                      </span>

                      <span>{feature}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className={styles.featureFooter}>
          <strong>Not sure what you need?</strong>
          <p>
            That is completely fine. Select “Not sure yet — recommend what I
            need” or explain the result you want in the next sections.
          </p>
        </div>
      </section>

      <section
        className={styles.formCard}
        id="quote-section-6"
      >
        <div className={styles.sectionHeading}>
          <span>06</span>
          <div>
            <small>CONTENT & LOGIC</small>
            <h2>Data, content & rules</h2>
            <p>
              This helps TCL understand what information the project will manage
              and whether it follows special rules.
            </p>
          </div>
        </div>

        <label>
          <span>What information, content, or records will be managed?</span>
          <textarea
            name="data_management"
            rows={4}
            placeholder="Students, questions, bookings, services, products, customers, scores, documents, applications, content, etc."
          />
        </label>

        <label>
          <span>Will this information change regularly?</span>
          <textarea
            name="recurring_changes"
            rows={3}
            placeholder="Example: students change every semester, products monthly, bookings daily, new content weekly, or rarely changes."
          />
        </label>

        <label>
          <span>Any limits, rules, permissions, or special conditions?</span>
          <textarea
            name="usage_rules"
            rows={4}
            placeholder="Example: attempt limits, approval rules, private access, one account per user, restricted records..."
          />
        </label>

        <label>
          <span>Results, reports, history, or tracking needed</span>
          <textarea
            name="results_reporting"
            rows={4}
            placeholder="Scores, history, reports, exports, analytics, progress, booking records, or no tracking needed."
          />
        </label>
      </section>

      <section
        className={styles.formCard}
        id="quote-section-7"
      >
        <div className={styles.sectionHeading}>
          <span>07</span>
          <div>
            <small>TECHNICAL SCOPE</small>
            <h2>Volume, management & integrations</h2>
            <p>
              Estimates are okay. These details help us plan database usage,
              access, payments, and external services.
            </p>
          </div>
        </div>

        <div className={styles.gridTwo}>
          <label>
            <span>Expected users / activity</span>
            <input
              name="expected_volume"
              placeholder="30 students, 500 members, 20 bookings/week..."
            />
          </label>

          <label>
            <span>Admin / editor access</span>
            <input
              name="admin_access"
              placeholder="1 admin, owner + staff, 2 teachers..."
            />
          </label>

          <label>
            <span>Will you sell anything online?</span>
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
            <span>Do you need online payments?</span>
            <select name="online_payments" defaultValue="No">
              <option>Yes</option>
              <option>No</option>
              <option>Maybe / not sure</option>
            </select>
          </label>

          <label>
            <span>Payment methods needed</span>
            <input
              name="payment_methods"
              placeholder="GCash, Maya, cards, PayPal, manual payment..."
            />
          </label>

          <label>
            <span>Delivery / fulfillment needs</span>
            <input
              name="delivery_needs"
              placeholder="Shipping, pickup, digital delivery, service only..."
            />
          </label>

          <label>
            <span>Need another platform connected?</span>
            <select name="integration_needed" defaultValue="Not sure">
              <option>Yes</option>
              <option>No</option>
              <option>Not sure</option>
            </select>
          </label>
        </div>

        <label>
          <span>Integrations or tools you want connected</span>
          <textarea
            name="integrations"
            rows={3}
            placeholder="Google Calendar, Google Sheets, Gmail, payment provider, analytics, existing platform..."
          />
        </label>

        <label>
          <span>Anything technical you are unsure about?</span>
          <textarea
            name="uncertainty_notes"
            rows={3}
            placeholder="Describe the result you want. TCL can recommend the simplest suitable setup."
          />
        </label>
      </section>

      <section
        className={styles.formCard}
        id="quote-section-8"
      >
        <div className={styles.sectionHeading}>
          <span>08</span>
          <div>
            <small>LOOK & FEEL</small>
            <h2>Branding & design</h2>
            <p>
              It is okay if these are not ready yet. Choose the closest answer.
            </p>
          </div>
        </div>

        <div className={styles.gridTwo}>
          <label>
            <span>Do you already have a logo?</span>
            <select name="logo_ready" defaultValue="Not applicable">
              <option>Yes</option>
              <option>No</option>
              <option>Still being made</option>
              <option>Not applicable</option>
            </select>
          </label>

          <label>
            <span>Colors / visual style ready?</span>
            <select name="branding_ready" defaultValue="Not applicable">
              <option>Yes</option>
              <option>No</option>
              <option>Need help choosing</option>
              <option>Not applicable</option>
            </select>
          </label>

          <label>
            <span>Photos / written content / materials ready?</span>
            <select name="content_ready" defaultValue="Some">
              <option>Yes</option>
              <option>Some</option>
              <option>No</option>
              <option>Need help organizing</option>
              <option>Not applicable</option>
            </select>
          </label>

          <label>
            <span>Domain status</span>
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

      <section
        className={`${styles.formCard} ${styles.finalCard}`}
        id="quote-section-9"
      >
        <div className={styles.sectionHeading}>
          <span>09</span>
          <div>
            <small>LAST STEP</small>
            <h2>Budget, timeline & final notes</h2>
            <p>
              This helps TCL recommend a realistic scope instead of giving you a
              generic price.
            </p>
          </div>
        </div>

        <div className={styles.gridTwo}>
          <label>
            <span>
              Estimated budget <b>*</b>
            </span>
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
            <span>
              Preferred timeline <b>*</b>
            </span>
            <select name="timeline" required defaultValue="">
              <option value="" disabled>
                Select preferred timeline
              </option>
              {timelineOptions.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </label>
        </div>

        <label>
          <span>Anything else we should know?</span>
          <textarea
            name="notes"
            rows={5}
            placeholder="Add examples, exact quantities, special rules, references, must-have functions, questions, or anything that may affect the project scope."
          />
        </label>
      </section>

      <section className={styles.beforeSubmit}>
        <div className={styles.beforeSubmitIcon}>♡</div>

        <div>
          <strong>Before you submit</strong>
          <p>
            TCL will review your requirements before preparing the quotation.
            Selected features are not automatically included until they are
            confirmed in the agreed scope.
          </p>

          <ul>
            <li>Submitting this request does not commit you to purchase.</li>
            <li>
              Pricing and turnaround depend on the final confirmed requirements.
            </li>
            <li>
              Additional features or scope changes may affect the price and
              timeline.
            </li>
            <li>
              TCL may ask follow-up questions through your preferred written
              contact method.
            </li>
          </ul>
        </div>
      </section>

      {submitError ? (
        <div
          id="quotation-result"
          className={styles.errorMessage}
          role="alert"
        >
          <strong>We couldn&apos;t submit your request.</strong>
          <span>{submitError}</span>
        </div>
      ) : null}

      {submitted ? (
        <div
          id="quotation-result"
          className={styles.successMessage}
          role="status"
        >
          <div className={styles.successIcon}>✓</div>

          <div>
            <small>REQUEST RECEIVED</small>
            <h3>Your quotation request was submitted successfully.</h3>

            {requestId ? (
              <p className={styles.requestReference}>
                Reference: <strong>{requestId}</strong>
              </p>
            ) : null}

            <p>
              TCL will review the requirements you submitted and contact you
              through your preferred written contact method if clarification is
              needed or once your quotation is ready.
            </p>

            <span>
              You do not need to submit another request for the same project.
            </span>
          </div>
        </div>
      ) : null}

      <section className={styles.submitCard}>
        <div>
          <small>READY WHEN YOU ARE</small>
          <h2>Send your project for review.</h2>
          <p>
            Your completed request will be securely saved for TCL to assess.
            There is no payment required at this stage.
          </p>
        </div>

        <button
          className="button button-primary"
          type="submit"
          disabled={submitting}
        >
          {submitting ? (
            <>
              <span className={styles.buttonSpinner} />
              Submitting...
            </>
          ) : (
            "Submit Quotation Request →"
          )}
        </button>

        <span className={styles.submitPrivacy}>
          By submitting, you confirm that the information provided is accurate
          to the best of your knowledge.
        </span>
      </section>
    </form>
  );
}