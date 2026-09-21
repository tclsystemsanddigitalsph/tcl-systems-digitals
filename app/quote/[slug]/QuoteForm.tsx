"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./quote.module.css";

type Props = {
  productName: string;
  productSlug: string;
  category: string;
};

type ProjectKind =
  | "website"
  | "ecommerce"
  | "booking"
  | "reviewer"
  | "schoolLms"
  | "system"
  | "other";

type FormState = {
  projectType: ProjectKind | "";
  projectContext: string;
  businessName: string;
  projectDescription: string;
  userActions: string;
  mainProblems: string;
  mainGoal: string;

  websitePages: string;
  websitePurpose: string;
  contentManagement: string;

  productType: string;
  productCount: string;
  checkoutType: string;
  paymentMethods: string;
  deliveryNeeds: string;
  inventoryNeeds: string;

  bookingType: string;
  bookingServices: string;
  bookingSchedule: string;
  bookingApproval: string;
  bookingPayments: string;
  bookingRules: string;

  reviewerUsers: string;
  reviewerSubjects: string;
  reviewerQuestions: string;
  reviewerAttempts: string;
  reviewerResults: string;
  reviewerAccess: string;

  schoolUsers: string;
  schoolStructure: string;
  schoolAttendance: string;
  schoolGrading: string;
  schoolMaterials: string;
  schoolAccess: string;

  systemUsers: string;
  systemWorkflow: string;
  systemData: string;
  systemAdmin: string;
  systemRules: string;

  selectedFeatures: string[];
  otherFeatures: string;

  fullName: string;
  email: string;
  contactNumber: string;
  preferredContact: string;
  businessLocation: string;
  currentLink: string;
  existingWebsite: string;
  logoReady: string;
  brandingReady: string;
  contentReady: string;
  domainStatus: string;
  budget: string;
  timeline: string;
  notes: string;
};

const initialState: FormState = {
  projectType: "",
  projectContext: "",
  businessName: "",
  projectDescription: "",
  userActions: "",
  mainProblems: "",
  mainGoal: "",

  websitePages: "",
  websitePurpose: "",
  contentManagement: "",

  productType: "",
  productCount: "",
  checkoutType: "",
  paymentMethods: "",
  deliveryNeeds: "",
  inventoryNeeds: "",

  bookingType: "",
  bookingServices: "",
  bookingSchedule: "",
  bookingApproval: "",
  bookingPayments: "",
  bookingRules: "",

  reviewerUsers: "",
  reviewerSubjects: "",
  reviewerQuestions: "",
  reviewerAttempts: "",
  reviewerResults: "",
  reviewerAccess: "",

  schoolUsers: "",
  schoolStructure: "",
  schoolAttendance: "",
  schoolGrading: "",
  schoolMaterials: "",
  schoolAccess: "",

  systemUsers: "",
  systemWorkflow: "",
  systemData: "",
  systemAdmin: "",
  systemRules: "",

  selectedFeatures: [],
  otherFeatures: "",

  fullName: "",
  email: "",
  contactNumber: "",
  preferredContact: "",
  businessLocation: "",
  currentLink: "",
  existingWebsite: "",
  logoReady: "",
  brandingReady: "",
  contentReady: "",
  domainStatus: "",
  budget: "",
  timeline: "",
  notes: "",
};

const projectChoices: Array<{
  id: ProjectKind;
  number: string;
  title: string;
  description: string;
}> = [
  {
    id: "website",
    number: "01",
    title: "Website",
    description: "Business, company, portfolio, landing page, or informational website.",
  },
  {
    id: "ecommerce",
    number: "02",
    title: "E-commerce",
    description: "Online shop, product catalog, checkout, orders, payments, or inventory.",
  },
  {
    id: "booking",
    number: "03",
    title: "Booking System",
    description: "Appointments, reservations, schedules, availability, or service bookings.",
  },
  {
    id: "reviewer",
    number: "04",
    title: "Quiz / Reviewer",
    description: "Review centers, schools, quizzes, question banks, scores, or student access.",
  },
  {
    id: "schoolLms",
    number: "05",
    title: "School Tools / LMS",
    description: "Learning platforms, class tools, attendance, grading, student portals, or school workflows.",
  },
  {
    id: "system",
    number: "07",
    title: "Custom System",
    description: "Dashboards, portals, management tools, workflows, records, or automation.",
  },
  {
    id: "other",
    number: "08",
    title: "Other / Not Sure",
    description: "Something different, a mixed project, or you are not sure what category fits.",
  },
];

const featureMap: Record<ProjectKind, string[]> = {
  website: [
    "Contact / inquiry form",
    "Request-a-quote form",
    "Services / products showcase",
    "Gallery / portfolio",
    "Testimonials / reviews",
    "Blog / articles",
    "Basic SEO",
    "Multi-language",
    "Admin / content management",
    "Third-party integration",
  ],
  ecommerce: [
    "Shopping cart",
    "Online checkout",
    "Manual payment",
    "Online payment gateway",
    "Product variants",
    "Inventory tracking",
    "Shipping / delivery",
    "Pickup",
    "Promo / discount tools",
    "Customer accounts",
    "Order management dashboard",
    "Digital product delivery",
  ],
  booking: [
    "Customer booking flow",
    "Services / packages",
    "Date & time availability",
    "Booking approval",
    "Automatic confirmation",
    "Email notifications",
    "Booking reminders",
    "Down payment",
    "Online payments",
    "Add-ons / variations",
    "Admin booking dashboard",
    "Google Calendar integration",
  ],
  reviewer: [
    "Student accounts",
    "Admin dashboard",
    "Subjects / categories",
    "Question bank",
    "Bulk question import",
    "Multiple-choice questions",
    "Other question types",
    "Attempt limits",
    "Randomized questions",
    "Instant scores",
    "Answer review",
    "Progress tracking",
    "Reports / data export",
  ],
  schoolLms: [
    "Student / learner accounts",
    "Instructor / teacher accounts",
    "Admin dashboard",
    "Subjects / courses",
    "Class / section management",
    "Enrollment / access control",
    "Attendance tracking",
    "Grading / score management",
    "Assignments / activities",
    "Learning materials / resources",
    "Announcements / notifications",
    "Progress tracking",
    "Reports / CSV export",
    "Academic term / semester management",
    "Question banks / quizzes",
    "Role-based permissions",
  ],
  system: [
    "Admin dashboard",
    "User accounts",
    "Multiple user roles",
    "Approval workflow",
    "Create / edit / delete records",
    "Search / filters",
    "File uploads",
    "Bulk import",
    "Data export",
    "Reports / analytics",
    "Email notifications",
    "Third-party integrations",
    "Custom automation",
  ],
  other: [
    "Public website/pages",
    "User accounts",
    "Admin dashboard",
    "Forms / submissions",
    "Payments",
    "Bookings / scheduling",
    "Database / records",
    "File uploads",
    "Notifications",
    "Reports / exports",
    "Third-party integrations",
    "Not sure — recommend what I need",
  ],
};

const projectTypeLabel: Record<ProjectKind, string> = {
  website: "Business / information website",
  ecommerce: "Online shop / e-commerce",
  booking: "Booking / appointment system",
  reviewer: "Quiz / reviewer / exam system",
  schoolLms: "School tools / learning management system",
  system: "Custom web application / system",
  other: "Other / not sure yet",
};

const steps = ["Project", "Requirements", "Features", "Details", "Review"];

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
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>(initialState);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [stepError, setStepError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [requestId, setRequestId] = useState("");
  const [draftReady, setDraftReady] = useState(false);
  const formRef = useRef<HTMLFormElement | null>(null);

  const draftKey = useMemo(
    () => `tcl-quotation-wizard:${productSlug}`,
    [productSlug],
  );

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(draftKey);
      if (raw) {
        const saved = JSON.parse(raw) as {
          form?: Partial<FormState>;
          step?: number;
        };

        if (saved.form) {
          setForm((current) => ({ ...current, ...saved.form }));
        }

        if (
          typeof saved.step === "number" &&
          saved.step >= 1 &&
          saved.step <= 5
        ) {
          setStep(saved.step);
        }
      }
    } catch (error) {
      console.warn("Unable to restore quotation draft:", error);
    } finally {
      setDraftReady(true);
    }
  }, [draftKey]);

  useEffect(() => {
    if (!draftReady || submitted) return;

    try {
      window.localStorage.setItem(
        draftKey,
        JSON.stringify({
          form,
          step,
          savedAt: new Date().toISOString(),
        }),
      );
    } catch (error) {
      console.warn("Unable to save quotation draft:", error);
    }
  }, [draftKey, draftReady, form, step, submitted]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setStepError("");
  }

  function toggleFeature(feature: string) {
    setForm((current) => ({
      ...current,
      selectedFeatures: current.selectedFeatures.includes(feature)
        ? current.selectedFeatures.filter((item) => item !== feature)
        : [...current.selectedFeatures, feature],
    }));
  }

  function validateStep(currentStep: number) {
    if (currentStep === 1 && !form.projectType) {
      return "Choose the type of project you want TCL to review.";
    }

    if (currentStep === 2) {
      if (!form.projectDescription.trim()) {
        return "Tell us briefly what you want to build.";
      }
      if (!form.userActions.trim()) {
        return "Tell us what users should be able to do.";
      }
      if (!form.mainGoal.trim()) {
        return "Tell us the main goal of the project.";
      }
      if (!form.mainProblems.trim()) {
        return "Tell us what need or problem the project should solve.";
      }
    }

    if (currentStep === 4) {
      if (!form.businessName.trim()) {
        return "Enter the project, business, or organization name.";
      }
      if (!form.fullName.trim()) return "Enter your full name.";
      if (!form.email.trim()) return "Enter your email address.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
        return "Enter a valid email address.";
      }
      if (!form.contactNumber.trim()) {
        return "Enter a contact number, Messenger, or Telegram contact.";
      }
      if (!form.budget) return "Select a budget range.";
      if (!form.timeline) return "Select a preferred timeline.";
    }

    return "";
  }

  function keepFormInView() {
    window.requestAnimationFrame(() => {
      formRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }

  function goNext() {
    const error = validateStep(step);
    if (error) {
      setStepError(error);
      keepFormInView();
      return;
    }

    setStepError("");
    setStep((current) => Math.min(5, current + 1));
    keepFormInView();
  }

  function goBack() {
    setStepError("");
    setStep((current) => Math.max(1, current - 1));
    keepFormInView();
  }

  function branchSummary() {
    if (!form.projectType) return [];

    if (form.projectType === "website") {
      return [
        ["Pages / sections", form.websitePages],
        ["Website purpose", form.websitePurpose],
        ["Content management", form.contentManagement],
      ];
    }

    if (form.projectType === "ecommerce") {
      return [
        ["Products", form.productType],
        ["Approx. product count", form.productCount],
        ["Checkout", form.checkoutType],
        ["Payment methods", form.paymentMethods],
        ["Delivery / fulfillment", form.deliveryNeeds],
        ["Inventory", form.inventoryNeeds],
      ];
    }

    if (form.projectType === "booking") {
      return [
        ["Booking type", form.bookingType],
        ["Services / appointments", form.bookingServices],
        ["Schedule / availability", form.bookingSchedule],
        ["Approval", form.bookingApproval],
        ["Payments", form.bookingPayments],
        ["Special rules", form.bookingRules],
      ];
    }

    if (form.projectType === "reviewer") {
      return [
        ["Users", form.reviewerUsers],
        ["Subjects / categories", form.reviewerSubjects],
        ["Questions", form.reviewerQuestions],
        ["Attempts", form.reviewerAttempts],
        ["Results / review", form.reviewerResults],
        ["Access", form.reviewerAccess],
      ];
    }

    if (form.projectType === "schoolLms") {
      return [
        ["Users", form.schoolUsers],
        ["School structure", form.schoolStructure],
        ["Attendance", form.schoolAttendance],
        ["Grading", form.schoolGrading],
        ["Learning materials", form.schoolMaterials],
        ["Access", form.schoolAccess],
      ];
    }

    if (form.projectType === "system") {
      return [
        ["Users / roles", form.systemUsers],
        ["Workflow", form.systemWorkflow],
        ["Data / records", form.systemData],
        ["Admin management", form.systemAdmin],
        ["Rules / permissions", form.systemRules],
      ];
    }

    return [];
  }

  function buildOptionalPayload() {
    const common = {
      projectContext: form.projectContext,
      businessLocation: form.businessLocation,
      currentLink: form.currentLink,
      existingWebsite: form.existingWebsite,
      logoReady: form.logoReady,
      brandingReady: form.brandingReady,
      contentReady: form.contentReady,
      domainStatus: form.domainStatus,
      notes: form.notes,
    };

    if (form.projectType === "website") {
      return {
        ...common,
        userTypes: "Public visitors / website audience",
        selfManage: form.contentManagement,
        dataManagement: form.websitePages,
        recurringChanges: form.contentManagement,
        uncertaintyNotes: form.websitePurpose,
      };
    }

    if (form.projectType === "ecommerce") {
      return {
        ...common,
        userTypes: "Customers / shop visitors",
        sellOnline: "Yes — e-commerce / online shop",
        onlinePayments: form.checkoutType,
        paymentMethods: form.paymentMethods,
        deliveryNeeds: form.deliveryNeeds,
        dataManagement: `Products: ${form.productType}\nApprox. product count: ${form.productCount}\nInventory: ${form.inventoryNeeds}`,
        adminRequirements: form.inventoryNeeds,
        expectedVolume: form.productCount,
      };
    }

    if (form.projectType === "booking") {
      return {
        ...common,
        userTypes: "Customers / clients booking services",
        onlinePayments: form.bookingPayments,
        paymentMethods: form.bookingPayments,
        dataManagement: `Services / appointments: ${form.bookingServices}\nSchedule / availability: ${form.bookingSchedule}`,
        usageRules: `Approval: ${form.bookingApproval}\nSpecial rules: ${form.bookingRules}`,
        adminRequirements: "Manage bookings, services, schedules, availability, and applicable settings.",
      };
    }

    if (form.projectType === "reviewer") {
      return {
        ...common,
        userTypes: form.reviewerUsers,
        userAccounts: form.reviewerAccess,
        accessModel: form.reviewerAccess,
        dataManagement: `Subjects / categories: ${form.reviewerSubjects}\nQuestions: ${form.reviewerQuestions}`,
        usageRules: `Attempts: ${form.reviewerAttempts}`,
        resultsReporting: form.reviewerResults,
        adminRequirements: "Manage users, subjects, reviewers/question banks, results, and applicable access.",
      };
    }

    if (form.projectType === "schoolLms") {
      return {
        ...common,
        userTypes: form.schoolUsers,
        accessModel: form.schoolAccess,
        adminRequirements:
          "Manage school users, classes/sections, subjects/courses, attendance, grades, learning content, reports, and applicable settings.",
        dataManagement:
          `School structure: ${form.schoolStructure}\nAttendance: ${form.schoolAttendance}\nGrading: ${form.schoolGrading}\nLearning materials: ${form.schoolMaterials}`,
        usageRules: form.schoolAccess,
        resultsReporting: "School reporting and exports as selected in the feature list.",
      };
    }

    if (form.projectType === "system") {
      return {
        ...common,
        userTypes: form.systemUsers,
        accessModel: form.systemUsers,
        dataManagement: form.systemData,
        adminRequirements: form.systemAdmin,
        usageRules: form.systemRules,
        currentProcess: form.systemWorkflow,
      };
    }

    return {
      ...common,
      uncertaintyNotes:
        "Client selected Other / Not Sure. Review the description, requested user actions, goal, problems, and selected features.",
    };
  }

  async function submitQuoteRequest() {
    // Submission is deliberately NOT attached to the <form> submit event.
    // It can only run from the explicit button on the Review step.
    if (step !== 5 || submitting) return;

    const stepFourError = validateStep(4);
    const stepTwoError = validateStep(2);

    if (stepTwoError || stepFourError || !form.projectType) {
      setSubmitError(
        stepTwoError ||
          stepFourError ||
          "Please complete the required quotation details.",
      );
      return;
    }

    setSubmitting(true);
    setSubmitError("");
    setSubmitted(false);
    setRequestId("");

    const optional = buildOptionalPayload();

    const payload = {
      productSlug,
      productName,
      category,

      fullName: form.fullName.trim(),
      businessName: form.businessName.trim(),
      email: form.email.trim(),
      contactNumber: form.contactNumber.trim(),
      preferredContact: form.preferredContact,

      projectContext: optional.projectContext ?? "",
      businessType: projectTypeLabel[form.projectType],
      businessLocation: optional.businessLocation ?? "",
      businessAge: "",
      staffCount: "",
      locationCount: "",
      currentLink: optional.currentLink ?? "",
      existingWebsite: optional.existingWebsite ?? "",

      userTypes: "userTypes" in optional ? optional.userTypes : "",
      accessModel: "accessModel" in optional ? optional.accessModel : "",
      adminRequirements:
        "adminRequirements" in optional ? optional.adminRequirements : "",
      deviceRequirements: "All devices / responsive",

      visitorActions: form.userActions.trim(),
      selfManage: "selfManage" in optional ? optional.selfManage : "",
      userAccounts: "userAccounts" in optional ? optional.userAccounts : "",
      sellOnline: "sellOnline" in optional ? optional.sellOnline : "",
      onlinePayments:
        "onlinePayments" in optional ? optional.onlinePayments : "",
      integrationNeeded: "",
      uncertaintyNotes:
        "uncertaintyNotes" in optional ? optional.uncertaintyNotes : "",

      offerings: form.projectDescription.trim(),
      currentProcess: "currentProcess" in optional ? optional.currentProcess : "",
      mainProblems: form.mainProblems.trim(),
      selectedFeatures: [
        ...form.selectedFeatures,
        ...(form.otherFeatures.trim()
          ? [`Other requested features: ${form.otherFeatures.trim()}`]
          : []),
      ],
      mainGoal: form.mainGoal.trim(),
      expectedVolume:
        "expectedVolume" in optional ? optional.expectedVolume : "",
      paymentMethods:
        "paymentMethods" in optional ? optional.paymentMethods : "",
      deliveryNeeds:
        "deliveryNeeds" in optional ? optional.deliveryNeeds : "",
      adminAccess: "",
      integrations: "",

      dataManagement:
        "dataManagement" in optional ? optional.dataManagement : "",
      recurringChanges:
        "recurringChanges" in optional ? optional.recurringChanges : "",
      usageRules: "usageRules" in optional ? optional.usageRules : "",
      resultsReporting:
        "resultsReporting" in optional ? optional.resultsReporting : "",

      logoReady: optional.logoReady ?? "",
      brandingReady: optional.brandingReady ?? "",
      contentReady: optional.contentReady ?? "",
      domainStatus: optional.domainStatus ?? "",
      budget: form.budget,
      timeline: form.timeline,
      notes: form.notes.trim(),
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
        secureToken?: string;
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

      if (!result.secureToken) {
        throw new Error(
          "Your request was saved, but the secure quotation link could not be created. Please contact TCL.",
        );
      }

      // Send the client to the persistent quotation page instead of leaving
      // them on a one-time success message. The secure link remains usable
      // later so they can return and see updates to the quotation.
      window.location.assign(`/quotation/${encodeURIComponent(result.secureToken)}`);
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

  const selectedKind = form.projectType || null;
  const progress = ((step - 1) / (steps.length - 1)) * 100;

  return (
    <form
      ref={formRef}
      className={styles.form}
      onSubmit={(event) => event.preventDefault()}
      onKeyDown={(event) => {
        // The wizard never submits through the native form event.
        if (
          event.key === "Enter" &&
          (event.target as HTMLElement).tagName !== "TEXTAREA"
        ) {
          event.preventDefault();
        }
      }}
    >
      <div className={styles.wizardTop}>
        <div className={styles.wizardIntro}>
          <div>
            <span className={styles.eyebrow}>CUSTOM PROJECT REQUEST</span>
            <h2>Let&apos;s figure out what you need.</h2>
            <p>
              Answer a few questions about your project. We&apos;ll only show
              questions that are relevant to what you want to build.
            </p>
          </div>

          <div className={styles.autosaveBadge}>
            <span className={styles.autosaveDot} />
            Draft autosaves
          </div>
        </div>

        <div className={styles.progressHeader}>
          <span>
            Step {step} of {steps.length}
          </span>
          <strong>{steps[step - 1]}</strong>
        </div>

        <div className={styles.progressTrack} aria-hidden="true">
          <span style={{ width: `${progress}%` }} />
        </div>

        <div className={styles.stepLabels} aria-label="Quotation progress">
          {steps.map((label, index) => (
            <button
              type="button"
              key={label}
              className={index + 1 === step ? styles.stepActive : ""}
              onClick={() => {
                if (index + 1 < step) {
                  setStep(index + 1);
                  setStepError("");
                }
              }}
              disabled={index + 1 > step}
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              {label}
            </button>
          ))}
        </div>
      </div>

      {stepError && (
        <div className={styles.stepError} role="alert">
          {stepError}
        </div>
      )}

      {step === 1 && (
        <section className={styles.stepCard}>
          <div className={styles.stepHeading}>
            <span>01 / PROJECT</span>
            <h2>What do you want to build?</h2>
            <p>
              Choose the closest match. You can select Other / Not Sure if your
              project is different or combines several things.
            </p>
          </div>

          <div className={styles.projectGrid}>
            {projectChoices.map((choice) => {
              const active = form.projectType === choice.id;

              return (
                <button
                  type="button"
                  key={choice.id}
                  className={`${styles.projectChoice} ${
                    active ? styles.projectChoiceActive : ""
                  }`}
                  onClick={() => {
                    update("projectType", choice.id);
                    update("selectedFeatures", []);
                  }}
                >
                  <span>{choice.number}</span>
                  <strong>{choice.title}</strong>
                  <p>{choice.description}</p>
                  <small>{active ? "Selected ✓" : "Choose →"}</small>
                </button>
              );
            })}
          </div>

          <div className={styles.compactField}>
            <label>
              <span>This project is mainly for</span>
              <select
                value={form.projectContext}
                onChange={(e) => update("projectContext", e.target.value)}
              >
                <option value="">Select if applicable</option>
                <option>Business / commercial</option>
                <option>Personal</option>
                <option>School / education</option>
                <option>Teacher / classroom use</option>
                <option>Organization / community</option>
                <option>Professional / portfolio</option>
                <option>Internal team / office use</option>
                <option>Other</option>
              </select>
            </label>
          </div>
        </section>
      )}

      {step === 2 && selectedKind && (
        <section className={styles.stepCard}>
          <div className={styles.stepHeading}>
            <span>02 / REQUIREMENTS</span>
            <h2>
              {selectedKind === "website" && "Tell us about the website."}
              {selectedKind === "ecommerce" && "Tell us how your shop should work."}
              {selectedKind === "booking" && "Tell us how bookings should work."}
              {selectedKind === "reviewer" && "Tell us about your reviewer system."}
              {selectedKind === "schoolLms" && "Tell us about your school platform."}
              {selectedKind === "system" && "Tell us about your custom workflow."}
              {selectedKind === "other" && "Tell us what you have in mind."}
            </h2>
            <p>
              Simple answers are enough. You don&apos;t need to know technical
              terms.
            </p>
          </div>

          {selectedKind === "website" && (
            <div className={styles.questionGrid}>
              <label>
                <span>What kind of website is it?</span>
                <input
                  value={form.websitePurpose}
                  onChange={(e) => update("websitePurpose", e.target.value)}
                  placeholder="Business site, company profile, portfolio, landing page..."
                />
              </label>
              <label>
                <span>What pages or sections do you expect?</span>
                <textarea
                  value={form.websitePages}
                  onChange={(e) => update("websitePages", e.target.value)}
                  placeholder="Home, About, Services, Contact, Gallery..."
                />
              </label>
              <label>
                <span>Do you need to edit the website yourself?</span>
                <select
                  value={form.contentManagement}
                  onChange={(e) => update("contentManagement", e.target.value)}
                >
                  <option value="">Select</option>
                  <option>No — TCL can handle future edits</option>
                  <option>Yes — I need an admin/content dashboard</option>
                  <option>Only certain parts</option>
                  <option>Not sure</option>
                </select>
              </label>
            </div>
          )}

          {selectedKind === "ecommerce" && (
            <div className={styles.questionGrid}>
              <label>
                <span>What will you sell?</span>
                <input
                  value={form.productType}
                  onChange={(e) => update("productType", e.target.value)}
                  placeholder="Physical products, digital products, cosmetics, food..."
                />
              </label>
              <label>
                <span>About how many products?</span>
                <input
                  value={form.productCount}
                  onChange={(e) => update("productCount", e.target.value)}
                  placeholder="Example: 10, 50, 200+"
                />
              </label>
              <label>
                <span>How should checkout/payment work?</span>
                <select
                  value={form.checkoutType}
                  onChange={(e) => update("checkoutType", e.target.value)}
                >
                  <option value="">Select</option>
                  <option>Order submission + manual payment</option>
                  <option>Online payment gateway</option>
                  <option>Both manual and online payment</option>
                  <option>No checkout — catalog/inquiry only</option>
                  <option>Not sure yet</option>
                </select>
              </label>
              <label>
                <span>Preferred payment methods</span>
                <input
                  value={form.paymentMethods}
                  onChange={(e) => update("paymentMethods", e.target.value)}
                  placeholder="GCash, Maya, card, bank transfer, PayPal..."
                />
              </label>
              <label>
                <span>Delivery / fulfillment</span>
                <input
                  value={form.deliveryNeeds}
                  onChange={(e) => update("deliveryNeeds", e.target.value)}
                  placeholder="Shipping, pickup, digital delivery, local delivery..."
                />
              </label>
              <label>
                <span>How should inventory be managed?</span>
                <select
                  value={form.inventoryNeeds}
                  onChange={(e) => update("inventoryNeeds", e.target.value)}
                >
                  <option value="">Select</option>
                  <option>No inventory tracking needed</option>
                  <option>Basic stock tracking</option>
                  <option>Admin should manage products and stock</option>
                  <option>Advanced inventory / special rules</option>
                  <option>Not sure</option>
                </select>
              </label>
            </div>
          )}

          {selectedKind === "booking" && (
            <div className={styles.questionGrid}>
              <label>
                <span>What type of bookings?</span>
                <input
                  value={form.bookingType}
                  onChange={(e) => update("bookingType", e.target.value)}
                  placeholder="Appointments, salon services, rentals, reservations..."
                />
              </label>
              <label>
                <span>What can customers book?</span>
                <textarea
                  value={form.bookingServices}
                  onChange={(e) => update("bookingServices", e.target.value)}
                  placeholder="Services, packages, rooms, equipment, appointments..."
                />
              </label>
              <label>
                <span>How should schedule / availability work?</span>
                <textarea
                  value={form.bookingSchedule}
                  onChange={(e) => update("bookingSchedule", e.target.value)}
                  placeholder="Business hours, blocked dates, different schedules per service..."
                />
              </label>
              <label>
                <span>Should bookings be automatic or approved?</span>
                <select
                  value={form.bookingApproval}
                  onChange={(e) => update("bookingApproval", e.target.value)}
                >
                  <option value="">Select</option>
                  <option>Automatically confirmed</option>
                  <option>Admin must approve / reject</option>
                  <option>Depends on the service</option>
                  <option>Not sure</option>
                </select>
              </label>
              <label>
                <span>Do bookings require payment?</span>
                <select
                  value={form.bookingPayments}
                  onChange={(e) => update("bookingPayments", e.target.value)}
                >
                  <option value="">Select</option>
                  <option>No payment during booking</option>
                  <option>Down payment / deposit</option>
                  <option>Full online payment</option>
                  <option>Manual payment instructions</option>
                  <option>Not sure</option>
                </select>
              </label>
              <label>
                <span>Any special booking rules?</span>
                <textarea
                  value={form.bookingRules}
                  onChange={(e) => update("bookingRules", e.target.value)}
                  placeholder="Lead time, cancellation, max bookings, age rules, add-ons..."
                />
              </label>
            </div>
          )}

          {selectedKind === "reviewer" && (
            <div className={styles.questionGrid}>
              <label>
                <span>Who will use the system?</span>
                <input
                  value={form.reviewerUsers}
                  onChange={(e) => update("reviewerUsers", e.target.value)}
                  placeholder="Students, instructors, review center members..."
                />
              </label>
              <label>
                <span>How are subjects / reviewers organized?</span>
                <textarea
                  value={form.reviewerSubjects}
                  onChange={(e) => update("reviewerSubjects", e.target.value)}
                  placeholder="Subjects, categories, reviewer sets, semesters..."
                />
              </label>
              <label>
                <span>What question types do you need?</span>
                <input
                  value={form.reviewerQuestions}
                  onChange={(e) => update("reviewerQuestions", e.target.value)}
                  placeholder="Multiple choice, identification, multiple answers..."
                />
              </label>
              <label>
                <span>How should attempts work?</span>
                <input
                  value={form.reviewerAttempts}
                  onChange={(e) => update("reviewerAttempts", e.target.value)}
                  placeholder="Unlimited, 3 attempts, admin-controlled..."
                />
              </label>
              <label>
                <span>What should students see after answering?</span>
                <textarea
                  value={form.reviewerResults}
                  onChange={(e) => update("reviewerResults", e.target.value)}
                  placeholder="Score, correct answers, explanations, review page..."
                />
              </label>
              <label>
                <span>How should accounts / access work?</span>
                <textarea
                  value={form.reviewerAccess}
                  onChange={(e) => update("reviewerAccess", e.target.value)}
                  placeholder="Admin-created accounts, enrolled students only, Gmail login..."
                />
              </label>
            </div>
          )}

          {selectedKind === "schoolLms" && (
            <div className={styles.questionGrid}>
              <label>
                <span>Who will use the platform?</span>
                <input
                  value={form.schoolUsers}
                  onChange={(e) => update("schoolUsers", e.target.value)}
                  placeholder="Students, instructors, admin, staff, parents..."
                />
              </label>
              <label>
                <span>How is the school/class structure organized?</span>
                <textarea
                  value={form.schoolStructure}
                  onChange={(e) => update("schoolStructure", e.target.value)}
                  placeholder="Subjects, sections, grade levels, semesters, school years..."
                />
              </label>
              <label>
                <span>How should attendance work?</span>
                <textarea
                  value={form.schoolAttendance}
                  onChange={(e) => update("schoolAttendance", e.target.value)}
                  placeholder="Teacher records attendance, student check-in, daily/period attendance..."
                />
              </label>
              <label>
                <span>How should grading work?</span>
                <textarea
                  value={form.schoolGrading}
                  onChange={(e) => update("schoolGrading", e.target.value)}
                  placeholder="Grades, grading periods, weighted scores, remarks, reports..."
                />
              </label>
              <label>
                <span>What learning materials or activities are needed?</span>
                <textarea
                  value={form.schoolMaterials}
                  onChange={(e) => update("schoolMaterials", e.target.value)}
                  placeholder="Lessons, files, assignments, quizzes, reviewers, videos..."
                />
              </label>
              <label>
                <span>How should access and permissions work?</span>
                <textarea
                  value={form.schoolAccess}
                  onChange={(e) => update("schoolAccess", e.target.value)}
                  placeholder="Who can see/edit grades, subjects, classes, reports, materials..."
                />
              </label>
            </div>
          )}

          {selectedKind === "system" && (
            <div className={styles.questionGrid}>
              <label>
                <span>Who will use the system?</span>
                <textarea
                  value={form.systemUsers}
                  onChange={(e) => update("systemUsers", e.target.value)}
                  placeholder="Admin, staff, customers, members, different roles..."
                />
              </label>
              <label>
                <span>Describe the main workflow</span>
                <textarea
                  value={form.systemWorkflow}
                  onChange={(e) => update("systemWorkflow", e.target.value)}
                  placeholder="Example: Staff creates record → manager reviews → client receives update..."
                />
              </label>
              <label>
                <span>What information or records will it manage?</span>
                <textarea
                  value={form.systemData}
                  onChange={(e) => update("systemData", e.target.value)}
                  placeholder="Customers, records, documents, transactions, applications..."
                />
              </label>
              <label>
                <span>What should the admin manage?</span>
                <textarea
                  value={form.systemAdmin}
                  onChange={(e) => update("systemAdmin", e.target.value)}
                  placeholder="Users, records, statuses, reports, settings..."
                />
              </label>
              <label>
                <span>Any special rules or permissions?</span>
                <textarea
                  value={form.systemRules}
                  onChange={(e) => update("systemRules", e.target.value)}
                  placeholder="Approval rules, access restrictions, limits, roles..."
                />
              </label>
            </div>
          )}

          <div className={styles.coreQuestions}>
            <label>
              <span>
                Briefly describe what you want to build <b>*</b>
              </span>
              <textarea
                value={form.projectDescription}
                onChange={(e) => update("projectDescription", e.target.value)}
                placeholder="Explain the project in your own words."
              />
            </label>

            <label>
              <span>
                What should users be able to do? <b>*</b>
              </span>
              <textarea
                value={form.userActions}
                onChange={(e) => update("userActions", e.target.value)}
                placeholder="Example: browse products, book a service, log in, submit a form, manage records..."
              />
            </label>

            <div className={styles.twoColumns}>
              <label>
                <span>
                  Main goal <b>*</b>
                </span>
                <textarea
                  value={form.mainGoal}
                  onChange={(e) => update("mainGoal", e.target.value)}
                  placeholder="What should the finished project help you accomplish?"
                />
              </label>

              <label>
                <span>
                  What need or problem should it solve? <b>*</b>
                </span>
                <textarea
                  value={form.mainProblems}
                  onChange={(e) => update("mainProblems", e.target.value)}
                  placeholder="What is currently difficult, manual, missing, or inefficient?"
                />
              </label>
            </div>
          </div>
        </section>
      )}

      {step === 3 && selectedKind && (
        <section className={styles.stepCard}>
          <div className={styles.stepHeading}>
            <span>03 / FEATURES</span>
            <h2>Which features sound relevant?</h2>
            <p>
              Select anything you may need. These are requests for assessment,
              not final inclusions.
            </p>
          </div>

          <div className={styles.featureCount}>
            <strong>{form.selectedFeatures.length}</strong>
            <span>
              {form.selectedFeatures.length === 1
                ? "feature selected"
                : "features selected"}
            </span>
          </div>

          <div className={styles.featureGrid}>
            {featureMap[selectedKind].map((feature) => {
              const active = form.selectedFeatures.includes(feature);

              return (
                <button
                  type="button"
                  key={feature}
                  className={`${styles.featureOption} ${
                    active ? styles.featureSelected : ""
                  }`}
                  onClick={() => toggleFeature(feature)}
                >
                  <span>{active ? "✓" : "+"}</span>
                  {feature}
                </button>
              );
            })}
          </div>

          <label className={styles.otherFeaturesField}>
            <span>Need a feature that isn&apos;t listed above?</span>
            <textarea
              value={form.otherFeatures}
              onChange={(e) => update("otherFeatures", e.target.value)}
              placeholder="Tell us any other features or functions you need..."
            />
            <small>
              Optional — add anything you need that is not included in the choices above.
            </small>
          </label>

          <div className={styles.featureNote}>
            <strong>Not sure?</strong>
            <p>
              That&apos;s okay. TCL can recommend the appropriate setup after
              reviewing your project.
            </p>
          </div>
        </section>
      )}

      {step === 4 && (
        <section className={styles.stepCard}>
          <div className={styles.stepHeading}>
            <span>04 / YOUR DETAILS</span>
            <h2>Almost done.</h2>
            <p>
              Tell us who the project is for, how to contact you, and your basic
              project preferences.
            </p>
          </div>

          <div className={styles.twoColumns}>
            <label>
              <span>
                Project / business / organization name <b>*</b>
              </span>
              <input
                value={form.businessName}
                onChange={(e) => update("businessName", e.target.value)}
                placeholder="Business, school, project, personal brand..."
              />
            </label>

            <label>
              <span>
                Full name <b>*</b>
              </span>
              <input
                value={form.fullName}
                onChange={(e) => update("fullName", e.target.value)}
                autoComplete="name"
                placeholder="Your full name"
              />
            </label>

            <label>
              <span>
                Email address <b>*</b>
              </span>
              <input
                type="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                autoComplete="email"
                placeholder="you@example.com"
              />
            </label>

            <label>
              <span>
                Contact number / Messenger / Telegram <b>*</b>
              </span>
              <input
                value={form.contactNumber}
                onChange={(e) => update("contactNumber", e.target.value)}
                placeholder="09xx..., Messenger name/link, or @username"
              />
            </label>

            <label>
              <span>Preferred written contact</span>
              <select
                value={form.preferredContact}
                onChange={(e) => update("preferredContact", e.target.value)}
              >
                <option value="">Select</option>
                <option>Email</option>
                <option>Messenger</option>
                <option>Telegram</option>
                <option>Mobile / SMS</option>
              </select>
            </label>

            <label>
              <span>Location / audience</span>
              <input
                value={form.businessLocation}
                onChange={(e) => update("businessLocation", e.target.value)}
                placeholder="Philippines, worldwide, online only..."
              />
            </label>

            <label>
              <span>
                Budget range <b>*</b>
              </span>
              <select
                value={form.budget}
                onChange={(e) => update("budget", e.target.value)}
              >
                <option value="">Select budget</option>
                {budgetOptions.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </label>

            <label>
              <span>
                Preferred timeline <b>*</b>
              </span>
              <select
                value={form.timeline}
                onChange={(e) => update("timeline", e.target.value)}
              >
                <option value="">Select timeline</option>
                {timelineOptions.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </label>

            <label>
              <span>Existing website / page / system</span>
              <input
                value={form.currentLink}
                onChange={(e) => update("currentLink", e.target.value)}
                placeholder="Paste link if available"
              />
            </label>

            <label>
              <span>Do you already have a website/system?</span>
              <select
                value={form.existingWebsite}
                onChange={(e) => update("existingWebsite", e.target.value)}
              >
                <option value="">Select</option>
                <option>Yes</option>
                <option>No</option>
                <option>Only social media / another platform</option>
                <option>Using manual tools / spreadsheets / forms</option>
                <option>Currently being built</option>
              </select>
            </label>
          </div>

          <div className={styles.miniSection}>
            <span>PROJECT READINESS</span>
            <div className={styles.threeColumns}>
              <label>
                <span>Logo</span>
                <select
                  value={form.logoReady}
                  onChange={(e) => update("logoReady", e.target.value)}
                >
                  <option value="">Select</option>
                  <option>Ready</option>
                  <option>Needs improvement</option>
                  <option>Not yet available</option>
                </select>
              </label>

              <label>
                <span>Brand colors / style</span>
                <select
                  value={form.brandingReady}
                  onChange={(e) => update("brandingReady", e.target.value)}
                >
                  <option value="">Select</option>
                  <option>Ready</option>
                  <option>Partially ready</option>
                  <option>Need guidance</option>
                </select>
              </label>

              <label>
                <span>Website content</span>
                <select
                  value={form.contentReady}
                  onChange={(e) => update("contentReady", e.target.value)}
                >
                  <option value="">Select</option>
                  <option>Ready</option>
                  <option>Partially ready</option>
                  <option>Not ready yet</option>
                </select>
              </label>

              <label>
                <span>Domain</span>
                <select
                  value={form.domainStatus}
                  onChange={(e) => update("domainStatus", e.target.value)}
                >
                  <option value="">Select</option>
                  <option>I already own a domain</option>
                  <option>I need a new custom domain</option>
                  <option>Free subdomain is okay</option>
                  <option>Not sure yet</option>
                </select>
              </label>
            </div>
          </div>

          <label className={styles.fullField}>
            <span>Anything else TCL should know?</span>
            <textarea
              value={form.notes}
              onChange={(e) => update("notes", e.target.value)}
              placeholder="Special requests, references, questions, or additional details..."
            />
          </label>
        </section>
      )}

      {step === 5 && selectedKind && (
        <section className={styles.stepCard}>
          <div className={styles.stepHeading}>
            <span>05 / REVIEW</span>
            <h2>Review your request.</h2>
            <p>
              Check the important details before submitting. You can go back to
              any completed step if something needs changing.
            </p>
          </div>

          <div className={styles.reviewSections}>
            <article>
              <div className={styles.reviewTitle}>
                <span>PROJECT</span>
                <button type="button" onClick={() => setStep(1)}>
                  Edit
                </button>
              </div>
              <dl>
                <div>
                  <dt>Type</dt>
                  <dd>{projectTypeLabel[selectedKind]}</dd>
                </div>
                <div>
                  <dt>For</dt>
                  <dd>{form.projectContext || "—"}</dd>
                </div>
              </dl>
            </article>

            <article>
              <div className={styles.reviewTitle}>
                <span>REQUIREMENTS</span>
                <button type="button" onClick={() => setStep(2)}>
                  Edit
                </button>
              </div>
              <dl>
                <div>
                  <dt>Description</dt>
                  <dd>{form.projectDescription}</dd>
                </div>
                <div>
                  <dt>User actions</dt>
                  <dd>{form.userActions}</dd>
                </div>
                {branchSummary()
                  .filter(([, value]) => value)
                  .map(([label, value]) => (
                    <div key={label}>
                      <dt>{label}</dt>
                      <dd>{value}</dd>
                    </div>
                  ))}
              </dl>
            </article>

            <article>
              <div className={styles.reviewTitle}>
                <span>FEATURES</span>
                <button type="button" onClick={() => setStep(3)}>
                  Edit
                </button>
              </div>
              {form.selectedFeatures.length > 0 || form.otherFeatures.trim() ? (
                <>
                  {form.selectedFeatures.length > 0 ? (
                    <div className={styles.reviewFeatures}>
                      {form.selectedFeatures.map((feature) => (
                        <span key={feature}>✓ {feature}</span>
                      ))}
                    </div>
                  ) : null}

                  {form.otherFeatures.trim() ? (
                    <div className={styles.reviewCustomFeature}>
                      <small>OTHER REQUESTED FEATURES</small>
                      <p>{form.otherFeatures.trim()}</p>
                    </div>
                  ) : null}
                </>
              ) : (
                <p className={styles.emptyReview}>
                  No specific features selected — TCL can recommend what fits.
                </p>
              )}
            </article>

            <article>
              <div className={styles.reviewTitle}>
                <span>CONTACT & PROJECT</span>
                <button type="button" onClick={() => setStep(4)}>
                  Edit
                </button>
              </div>
              <dl>
                <div>
                  <dt>Project / business</dt>
                  <dd>{form.businessName}</dd>
                </div>
                <div>
                  <dt>Name</dt>
                  <dd>{form.fullName}</dd>
                </div>
                <div>
                  <dt>Email</dt>
                  <dd>{form.email}</dd>
                </div>
                <div>
                  <dt>Contact</dt>
                  <dd>{form.contactNumber}</dd>
                </div>
                <div>
                  <dt>Budget</dt>
                  <dd>{form.budget}</dd>
                </div>
                <div>
                  <dt>Timeline</dt>
                  <dd>{form.timeline}</dd>
                </div>
              </dl>
            </article>
          </div>

          <div className={styles.submitNotice}>
            <strong>No commitment to purchase.</strong>
            <p>
              Submitting this request allows TCL to review your requirements and
              prepare an appropriate quotation. Final inclusions and pricing are
              only confirmed in the quotation.
            </p>
          </div>

          {submitError && (
            <div className={styles.errorMessage} role="alert">
              <strong>Unable to submit</strong>
              <span>{submitError}</span>
            </div>
          )}
        </section>
      )}

      {!submitted && (
        <div className={styles.wizardActions}>
          <button
            type="button"
            className={styles.backButton}
            onClick={goBack}
            disabled={step === 1 || submitting}
          >
            ← Back
          </button>

          <span>
            {step < 5
              ? "Your progress is saved automatically."
              : "Ready when you are."}
          </span>

          {step < 5 ? (
            <button
              type="button"
              className={styles.nextButton}
              onClick={goNext}
            >
              Continue →
            </button>
          ) : (
            <button
              type="button"
              className={styles.nextButton}
              onClick={submitQuoteRequest}
              disabled={submitting}
            >
              {submitting ? "Submitting..." : "Submit Quote Request →"}
            </button>
          )}
        </div>
      )}

      {submitted && (
        <div
          className={styles.successMessage}
          id="quotation-result"
          role="status"
        >
          <div className={styles.successIcon}>✓</div>
          <div>
            <small>REQUEST RECEIVED</small>
            <h3>Your quotation request has been submitted.</h3>
            <p>
              TCL will review the project requirements and contact you if
              anything needs clarification before a quotation is prepared.
            </p>
            {requestId && (
              <span className={styles.requestReference}>
                Request ID: {requestId}
              </span>
            )}
          </div>
        </div>
      )}
    </form>
  );
}
