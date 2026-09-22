"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import styles from "./submit-requirements.module.css";

type Platform = "etsy" | "raketph" | "other" | "";
type ProductSlug =
  | "starter-website"
  | "simple-business-website"
  | "basic-online-shop"
  | "online-shop-with-admin"
  | "basic-booking-system"
  | "standard-booking-system"
  | "other"
  | "";

type Question = {
  key: string;
  label: string;
  type?: "text" | "email" | "textarea" | "select" | "checkboxes";
  placeholder?: string;
  options?: string[];
  required?: boolean;
  full?: boolean;
};

type FormValues = Record<string, string | string[]>;

const PRODUCTS: { slug: ProductSlug; name: string; note: string }[] = [
  {
    slug: "starter-website",
    name: "Starter Website",
    note: "One-page business website",
  },
  {
    slug: "simple-business-website",
    name: "Simple Business Website",
    note: "4-page business website",
  },
  {
    slug: "basic-online-shop",
    name: "Basic Online Shop",
    note: "Online shop without admin dashboard",
  },
  {
    slug: "online-shop-with-admin",
    name: "Online Shop + Admin",
    note: "Online shop with admin management",
  },
  {
    slug: "basic-booking-system",
    name: "Basic Booking System",
    note: "Simple online booking form + basic admin dashboard",
  },
  {
    slug: "standard-booking-system",
    name: "Standard Booking System",
    note: "Standard booking flow + admin management tools",
  },
  {
    slug: "other",
    name: "Other / Custom Product",
    note: "Another TCL product or custom purchase",
  },
];

const COMMON_BRANDING: Question[] = [
  {
    key: "logo_status",
    label: "Do you already have a logo?",
    type: "select",
    options: ["Yes", "No", "Still working on it"],
  },
  {
    key: "brand_colors",
    label: "Preferred brand / website colors",
    placeholder: "e.g. blush pink, black, white",
  },
  {
    key: "brand_style",
    label: "Preferred design style",
    placeholder: "e.g. clean, feminine, luxury, bold, minimal",
  },
  {
    key: "reference_links",
    label: "Design references or websites you like",
    type: "textarea",
    placeholder:
      "Paste links and tell us what you like about them. This is for design direction only.",
    full: true,
  },
];

function questionsFor(product: ProductSlug): Question[] {
  const business: Question[] = [
    {
      key: "business_name",
      label: "Business / brand name",
      required: true,
    },
    {
      key: "business_type",
      label: "Business type / industry",
      required: true,
      placeholder: "e.g. salon, travel agency, freelancer",
    },
    {
      key: "about_business",
      label: "About your business",
      type: "textarea",
      required: true,
      placeholder:
        "Tell us what your business does, who you serve, and the important details you want visitors to know.",
      full: true,
    },
    {
      key: "business_location",
      label: "Business location / service area",
      placeholder: "City, country, service area, or fully online",
    },
  ];

  if (product === "starter-website") {
    return [
      ...business,
      {
        key: "hero_content",
        label: "Main headline / introduction",
        type: "textarea",
        placeholder:
          "What should visitors see first? You may provide a headline, tagline, short introduction, or key points.",
        full: true,
      },
      {
        key: "services",
        label: "Services / products to display",
        type: "textarea",
        required: true,
        placeholder:
          "List the names, descriptions, and prices if you want prices displayed.",
        full: true,
      },
      {
        key: "contact_details",
        label: "Contact details to display",
        type: "textarea",
        required: true,
        placeholder:
          "Phone, email, address, Messenger, Instagram, Telegram, WhatsApp, etc.",
        full: true,
      },
      {
        key: "social_links",
        label: "Social media / contact links",
        type: "textarea",
        full: true,
      },
      {
        key: "domain_status",
        label: "Website address preference",
        type: "select",
        options: [
          "Use the free vercel.app address for now",
          "I already own a custom domain",
          "I want help connecting a custom domain",
        ],
      },
    ];
  }

  if (product === "simple-business-website") {
    return [
      ...business,
      {
        key: "home_content",
        label: "Home page content",
        type: "textarea",
        required: true,
        placeholder:
          "Headline/tagline, welcome message, key selling points, and the main action you want visitors to take.",
        full: true,
      },
      {
        key: "services",
        label: "Services / offers page content",
        type: "textarea",
        required: true,
        placeholder:
          "List each service or offer with descriptions and prices if applicable.",
        full: true,
      },
      {
        key: "about_page",
        label: "About page content",
        type: "textarea",
        required: true,
        placeholder:
          "Your story, background, mission, experience, or other information you want on the About page.",
        full: true,
      },
      {
        key: "contact_details",
        label: "Contact page details",
        type: "textarea",
        required: true,
        placeholder:
          "Phone, email, location, hours, inquiry destination, social links, and other contact information.",
        full: true,
      },
      {
        key: "inquiry_destination",
        label: "Where should inquiries go?",
        type: "select",
        required: true,
        options: [
          "Business email",
          "Facebook Messenger",
          "Instagram",
          "Telegram",
          "WhatsApp",
          "Phone / SMS",
          "Other",
        ],
      },
      {
        key: "domain_status",
        label: "Website address preference",
        type: "select",
        options: [
          "Use the free vercel.app address for now",
          "I already own a custom domain",
          "I want help connecting a custom domain",
        ],
      },
    ];
  }

  if (product === "basic-online-shop") {
    return [
      ...business,
      {
        key: "products",
        label: "Initial products to add",
        type: "textarea",
        required: true,
        placeholder:
          "For each product: name, price, description, category, and variations/options if applicable.",
        full: true,
      },
      {
        key: "product_categories",
        label: "Product categories / collections",
        type: "textarea",
        full: true,
      },
      {
        key: "payment_details",
        label: "Payment instructions",
        type: "textarea",
        required: true,
        placeholder:
          "Provide the payment methods and customer instructions included in your purchased package.",
        full: true,
      },
      {
        key: "delivery_details",
        label: "Delivery / pickup information",
        type: "textarea",
        full: true,
      },
      {
        key: "shop_policies",
        label: "Shop / order policies",
        type: "textarea",
        required: true,
        full: true,
      },
      {
        key: "contact_details",
        label: "Business contact details",
        type: "textarea",
        required: true,
        full: true,
      },
    ];
  }

  if (product === "online-shop-with-admin") {
    return [
      ...business,
      {
        key: "products",
        label: "Products to set up",
        type: "textarea",
        required: true,
        placeholder:
          "For each product: name, price, description, category, variations/options, and other relevant details.",
        full: true,
      },
      {
        key: "product_categories",
        label: "Product categories / collections",
        type: "textarea",
        full: true,
      },
      {
        key: "payment_details",
        label: "Payment & payment-proof instructions",
        type: "textarea",
        required: true,
        full: true,
      },
      {
        key: "checkout_details",
        label: "Customer information needed during checkout",
        type: "checkboxes",
        required: true,
        options: [
          "Full name",
          "Email",
          "Mobile number",
          "Complete address",
          "Order notes",
          "Other",
        ],
        full: true,
      },
      {
        key: "delivery_details",
        label: "Shipping / delivery / pickup information",
        type: "textarea",
        required: true,
        full: true,
      },
      {
        key: "shop_policies",
        label: "Shop / payment / cancellation / return policies",
        type: "textarea",
        required: true,
        full: true,
      },
      {
        key: "admin_preferences",
        label: "Admin setup preferences",
        type: "textarea",
        placeholder:
          "Tell us the business/store information and preferences we should use when preparing your included admin dashboard.",
        full: true,
      },
    ];
  }

  if (product === "basic-booking-system") {
    return [
      ...business,
      {
        key: "services",
        label: "Services, prices & durations",
        type: "textarea",
        required: true,
        placeholder:
          "List each service with its price and duration. Include any variations or add-ons you want available for that service.",
        full: true,
      },
      {
        key: "service_capacity",
        label: "Booking capacity per service",
        type: "textarea",
        required: true,
        placeholder:
          "Tell us how many bookings each service can accept per time slot and, if needed, the maximum bookings per service per day.",
        full: true,
      },
      {
        key: "general_availability",
        label: "General availability",
        type: "textarea",
        required: true,
        placeholder:
          "Provide your regular working days and hours, including breaks or times when bookings should not be available.",
        full: true,
      },
      {
        key: "unavailable_dates",
        label: "Unavailable / blocked dates",
        type: "textarea",
        placeholder:
          "List known dates when the business is unavailable. You can also manage unavailable dates later from the admin area.",
        full: true,
      },
      {
        key: "customer_fields",
        label: "Customer information to collect",
        type: "checkboxes",
        required: true,
        options: [
          "Full name",
          "Email",
          "Mobile number",
          "Customer notes",
          "Other",
        ],
        full: true,
      },
      {
        key: "booking_policies",
        label: "Booking, cancellation & rescheduling rules",
        type: "textarea",
        required: true,
        placeholder:
          "Provide the customer instructions and policies you want shown for bookings, cancellations, rescheduling, or no-shows.",
        full: true,
      },
      {
        key: "contact_details",
        label: "Business contact details",
        type: "textarea",
        required: true,
        placeholder: "Phone, email, address/location, social links, and other contact details.",
        full: true,
      },
    ];
  }

  if (product === "standard-booking-system") {
    return [
      ...business,
      {
        key: "services",
        label: "Services, prices & durations",
        type: "textarea",
        required: true,
        placeholder:
          "List each bookable service with its price and duration.",
        full: true,
      },
      {
        key: "service_variations",
        label: "Service variations",
        type: "textarea",
        placeholder:
          "For services with variations, list the variation names and any relevant price or duration differences.",
        full: true,
      },
      {
        key: "service_addons",
        label: "Optional service add-ons",
        type: "textarea",
        placeholder:
          "List the add-ons customers may choose and include price/duration details where applicable.",
        full: true,
      },
      {
        key: "availability",
        label: "Business availability",
        type: "textarea",
        required: true,
        placeholder:
          "Provide the working days, available hours, breaks, and other availability rules to configure.",
        full: true,
      },
      {
        key: "customer_fields",
        label: "Customer information to collect",
        type: "checkboxes",
        required: true,
        options: [
          "Full name",
          "Email",
          "Mobile number",
          "Address / location",
          "Customer notes",
          "Other",
        ],
        full: true,
      },
      {
        key: "booking_policies",
        label: "Booking, cancellation & rescheduling rules",
        type: "textarea",
        required: true,
        placeholder:
          "Provide the customer instructions and policies you want used with the booking flow.",
        full: true,
      },
      {
        key: "contact_details",
        label: "Business contact / location details",
        type: "textarea",
        required: true,
        full: true,
      },
    ];
  }

  return [
    ...business,
    {
      key: "purchased_product_name",
      label: "Exact product / package purchased",
      required: true,
      full: true,
    },
    {
      key: "project_scope",
      label: "What should be included in your project?",
      type: "textarea",
      required: true,
      placeholder:
        "Describe the pages, sections, functions, or deliverables included in your marketplace purchase.",
      full: true,
    },
    {
      key: "additional_details",
      label: "Other project details",
      type: "textarea",
      full: true,
    },
  ];
}

const STEPS = [
  { number: "01", short: "Purchase", title: "Purchase Details" },
  { number: "02", short: "Product", title: "Product Purchased" },
  { number: "03", short: "Project", title: "Project Requirements" },
  { number: "04", short: "Branding", title: "Branding & Files" },
  { number: "05", short: "Review", title: "Review & Submit" },
];

const DRAFT_STORAGE_KEY = "tcl-external-requirements-draft-v1";

type SavedDraft = {
  step: number;
  platform: Platform;
  product: ProductSlug;
  values: FormValues;
  savedAt: string;
};

export default function SubmitRequirementsForm() {
  const [step, setStep] = useState(0);
  const [platform, setPlatform] = useState<Platform>("");
  const [product, setProduct] = useState<ProductSlug>("");
  const [values, setValues] = useState<FormValues>({});
  const [message, setMessage] = useState("");
  const [draftReady, setDraftReady] = useState(false);
  const [draftStatus, setDraftStatus] = useState("Saving automatically");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formTopRef = useRef<HTMLDivElement>(null);

  const questions = useMemo(() => questionsFor(product), [product]);
  const selectedProduct = PRODUCTS.find((item) => item.slug === product);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(DRAFT_STORAGE_KEY);

      if (stored) {
        const draft = JSON.parse(stored) as Partial<SavedDraft>;

        if (
          typeof draft.step === "number" &&
          draft.step >= 0 &&
          draft.step < STEPS.length
        ) {
          setStep(draft.step);
        }

        if (typeof draft.platform === "string") {
          setPlatform(draft.platform as Platform);
        }

        if (typeof draft.product === "string") {
          setProduct(draft.product as ProductSlug);
        }

        if (draft.values && typeof draft.values === "object") {
          setValues(draft.values as FormValues);
        }

        if (typeof draft.savedAt === "string") {
          setDraftStatus("Draft restored");
        }
      }
    } catch {
      window.localStorage.removeItem(DRAFT_STORAGE_KEY);
    } finally {
      setDraftReady(true);
    }
  }, []);

  useEffect(() => {
    if (!draftReady) return;

    setDraftStatus("Saving...");

    const timer = window.setTimeout(() => {
      const draft: SavedDraft = {
        step,
        platform,
        product,
        values,
        savedAt: new Date().toISOString(),
      };

      try {
        window.localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
        setDraftStatus("Draft saved");
      } catch {
        setDraftStatus("Draft could not be saved");
      }
    }, 450);

    return () => window.clearTimeout(timer);
  }, [draftReady, step, platform, product, values]);

  function setText(key: string, value: string) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function toggleCheckbox(key: string, option: string) {
    setValues((current) => {
      const existing = Array.isArray(current[key]) ? (current[key] as string[]) : [];
      return {
        ...current,
        [key]: existing.includes(option)
          ? existing.filter((item) => item !== option)
          : [...existing, option],
      };
    });
  }

  function valueText(key: string) {
    const value = values[key];
    return typeof value === "string" ? value : "";
  }

  function stepValid(index: number) {
    if (index === 0) {
      return Boolean(
        platform &&
          valueText("order_id").trim() &&
          valueText("buyer_name").trim() &&
          valueText("buyer_email").trim() &&
          (platform !== "other" || valueText("other_platform").trim()),
      );
    }

    if (index === 1) return Boolean(product);

    if (index === 2) {
      return questions
        .filter((question) => question.required)
        .every((question) => {
          const value = values[question.key];
          return Array.isArray(value)
            ? value.length > 0
            : typeof value === "string" && value.trim().length > 0;
        });
    }

    if (index === 3) {
      return valueText("project_assets_confirmed") === "yes";
    }

    return true;
  }

  function scrollToFormTop() {
    requestAnimationFrame(() => {
      formTopRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }

  function goNext() {
    if (!stepValid(step)) {
      setMessage("Please complete the required fields before continuing.");
      return;
    }
    setMessage("");
    setStep((current) => Math.min(current + 1, STEPS.length - 1));
    scrollToFormTop();
  }

  function goBack() {
    setMessage("");
    setStep((current) => Math.max(current - 1, 0));
    scrollToFormTop();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (step !== STEPS.length - 1) {
      goNext();
      return;
    }

    if (valueText("scope_confirmation") !== "yes") {
      setMessage("Please confirm the acknowledgement before submitting.");
      return;
    }

    if (!platform || !product || !selectedProduct) {
      setMessage("Please review your purchase and product details before submitting.");
      return;
    }

    setIsSubmitting(true);
    setMessage("");

    try {
      const response = await fetch("/api/submit-requirements", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          platform,
          platformName: platform === "other" ? valueText("other_platform").trim() : null,
          marketplaceOrderId: valueText("order_id").trim(),
          buyerName: valueText("buyer_name").trim(),
          buyerEmail: valueText("buyer_email").trim(),
          productSlug: product,
          productName: selectedProduct.name,
          requirements: values,
        }),
      });

      const result = (await response.json().catch(() => null)) as
        | { ok?: boolean; error?: string }
        | null;

      if (!response.ok || !result?.ok) {
        throw new Error(
          result?.error || "We couldn't submit your requirements. Please try again.",
        );
      }

      window.localStorage.removeItem(DRAFT_STORAGE_KEY);
      setDraftStatus("Submitted");
      setMessage(
        "Requirements submitted! We've received your project information. TCL Systems & Digitals PH will verify your marketplace order and review your requirements. We'll contact you if we need any additional information.",
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "We couldn't submit your requirements. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function renderQuestion(question: Question) {
    const className = question.full ? styles.fullField : undefined;
    const label = (
      <span>
        {question.label}
        {question.required ? <b className={styles.required}>*</b> : null}
      </span>
    );

    if (question.type === "textarea") {
      return (
        <label key={question.key} className={className}>
          {label}
          <textarea
            rows={5}
            value={valueText(question.key)}
            onChange={(event) => setText(question.key, event.target.value)}
            placeholder={question.placeholder}
          />
        </label>
      );
    }

    if (question.type === "select") {
      return (
        <label key={question.key} className={className}>
          {label}
          <select
            value={valueText(question.key)}
            onChange={(event) => setText(question.key, event.target.value)}
          >
            <option value="">Select an option</option>
            {question.options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
      );
    }

    if (question.type === "checkboxes") {
      const selected = Array.isArray(values[question.key])
        ? (values[question.key] as string[])
        : [];

      return (
        <fieldset key={question.key} className={`${styles.checkboxField} ${className ?? ""}`}>
          <legend>
            {question.label}
            {question.required ? <b className={styles.required}>*</b> : null}
          </legend>
          <div className={styles.checkboxGrid}>
            {question.options?.map((option) => (
              <label key={option}>
                <input
                  type="checkbox"
                  checked={selected.includes(option)}
                  onChange={() => toggleCheckbox(question.key, option)}
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        </fieldset>
      );
    }

    return (
      <label key={question.key} className={className}>
        {label}
        <input
          type={question.type === "email" ? "email" : "text"}
          value={valueText(question.key)}
          onChange={(event) => setText(question.key, event.target.value)}
          placeholder={question.placeholder}
        />
      </label>
    );
  }

  return (
    <form className={styles.wizard} onSubmit={handleSubmit}>
      <div ref={formTopRef} className={styles.formTopAnchor} aria-hidden="true" />
      <div className={styles.progressCard}>
        <div className={styles.progressTop}>
          <div>
            <span>STEP {STEPS[step].number} OF 05</span>
            <strong>{STEPS[step].title}</strong>
          </div>
          <div className={styles.progressMeta}>
            <span className={styles.draftStatus}>{draftStatus}</span>
            <b>{Math.round(((step + 1) / STEPS.length) * 100)}%</b>
          </div>
        </div>

        <div className={styles.progressTrack}>
          <span style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
        </div>

        <div className={styles.stepLabels}>
          {STEPS.map((item, index) => (
            <button
              type="button"
              key={item.number}
              className={index === step ? styles.activeStep : index < step ? styles.doneStep : ""}
              onClick={() => {
                if (index < step) {
                  setMessage("");
                  setStep(index);
                }
              }}
            >
              <i>{index < step ? "✓" : item.number}</i>
              <span>{item.short}</span>
            </button>
          ))}
        </div>
      </div>

      <div className={styles.stage}>
        <div className={styles.stageHeader}>
          <span>{STEPS[step].number}</span>
          <div>
            <p>{STEPS[step].short.toUpperCase()}</p>
            <h3>{STEPS[step].title}</h3>
          </div>
        </div>

        {step === 0 ? (
          <>
            <div className={styles.introCopy}>
              <h4>Where did you purchase your TCL project?</h4>
              <p>
                Choose the marketplace used for your order. We&apos;ll use these
                details to match your submission with your purchase.
              </p>
            </div>

            <div className={styles.choiceGrid}>
              {[
                { value: "etsy" as Platform, name: "Etsy", tag: "Marketplace" },
                { value: "raketph" as Platform, name: "RaketPH", tag: "Marketplace" },
                { value: "other" as Platform, name: "Other", tag: "External platform" },
              ].map((item) => (
                <button
                  type="button"
                  key={item.value}
                  className={`${styles.choiceCard} ${
                    platform === item.value ? styles.selectedCard : ""
                  }`}
                  onClick={() => setPlatform(item.value)}
                >
                  <span className={styles.choiceMark}>
                    {platform === item.value ? "✓" : ""}
                  </span>
                  <small>{item.tag}</small>
                  <strong>{item.name}</strong>
                </button>
              ))}
            </div>

            <div className={styles.fieldsGrid}>
              {platform === "other" ? (
                <label className={styles.fullField}>
                  <span>
                    Platform / marketplace name <b className={styles.required}>*</b>
                  </span>
                  <input
                    value={valueText("other_platform")}
                    onChange={(event) => setText("other_platform", event.target.value)}
                    placeholder="Enter the platform where you purchased"
                  />
                </label>
              ) : null}

              <label>
                <span>
                  Order / Transaction ID <b className={styles.required}>*</b>
                </span>
                <input
                  value={valueText("order_id")}
                  onChange={(event) => setText("order_id", event.target.value)}
                  placeholder="Enter your marketplace order ID"
                />
              </label>

              <label>
                <span>
                  Buyer name <b className={styles.required}>*</b>
                </span>
                <input
                  value={valueText("buyer_name")}
                  onChange={(event) => setText("buyer_name", event.target.value)}
                  placeholder="Name used for the purchase"
                />
              </label>

              <label className={styles.fullField}>
                <span>
                  Purchase email <b className={styles.required}>*</b>
                </span>
                <input
                  type="email"
                  value={valueText("buyer_email")}
                  onChange={(event) => setText("buyer_email", event.target.value)}
                  placeholder="Email associated with your order"
                />
              </label>
            </div>
          </>
        ) : null}

        {step === 1 ? (
          <>
            <div className={styles.introCopy}>
              <h4>Which product did you purchase?</h4>
              <p>
                Select the exact TCL product from your marketplace order. Your
                next questions will automatically adjust to this selection.
              </p>
            </div>

            <div className={styles.productGrid}>
              {PRODUCTS.map((item) => (
                <button
                  type="button"
                  key={item.slug}
                  className={`${styles.productCard} ${
                    product === item.slug ? styles.selectedCard : ""
                  }`}
                  onClick={() => setProduct(item.slug)}
                >
                  <span className={styles.choiceMark}>
                    {product === item.slug ? "✓" : ""}
                  </span>
                  <strong>{item.name}</strong>
                  <small>{item.note}</small>
                </button>
              ))}
            </div>
          </>
        ) : null}

        {step === 2 ? (
          <>
            <div className={styles.introCopy}>
              <h4>Tell us about your project.</h4>
              <p>
                These questions are based on your selected{" "}
                <strong>{selectedProduct?.name}</strong> package.
              </p>
            </div>

            <div className={styles.fieldsGrid}>
              {questions.map(renderQuestion)}
            </div>
          </>
        ) : null}

        {step === 3 ? (
          <>
            <div className={styles.introCopy}>
              <h4>Show us your brand direction.</h4>
              <p>
                Share what you already have. If some assets are not ready yet,
                you can tell us below instead of delaying the rest of your
                requirements.
              </p>
            </div>

            <div className={styles.fieldsGrid}>
              {COMMON_BRANDING.map(renderQuestion)}

              <div className={`${styles.driveBox} ${styles.fullField}`}>
                <div className={styles.driveBoxHeader}>
                  <div className={styles.assetIcon}>↗</div>
                  <div>
                    <span>PROJECT FILES & ASSETS</span>
                    <strong>Share one Google Drive folder</strong>
                    <p>
                      Place all logos, photos, documents, references, menus,
                      product images, policies, and other project files inside
                      one folder.
                    </p>
                  </div>
                </div>

                <div className={styles.driveInstructions}>
                  <strong>Before you paste your link:</strong>
                  <ul>
                    <li>
                      Set the folder access to <b>Anyone with the link — Viewer</b>{" "}
                      so TCL can open your files.
                    </li>
                    <li>
                      Name each file clearly based on what it is and where it
                      should be used.
                    </li>
                    <li>
                      Use names such as <b>LOGO - Main Logo.png</b>,{" "}
                      <b>HOME - Hero Photo.jpg</b>,{" "}
                      <b>ABOUT - Owner Photo.jpg</b>,{" "}
                      <b>SERVICE - Gel Manicure.jpg</b>, or{" "}
                      <b>POLICIES - Booking Policy.pdf</b>.
                    </li>
                    <li>
                      Avoid unclear names such as <b>IMG_8273.jpg</b>,{" "}
                      <b>Screenshot123.png</b>, or <b>final-final2.png</b>.
                    </li>
                  </ul>
                </div>

                <label className={styles.driveLinkField}>
                  <span>Google Drive folder link</span>
                  <input
                    type="url"
                    value={valueText("project_assets_drive_link")}
                    onChange={(event) =>
                      setText("project_assets_drive_link", event.target.value)
                    }
                    placeholder="https://drive.google.com/..."
                  />
                </label>

                <label className={styles.driveConfirmation}>
                  <input
                    type="checkbox"
                    checked={valueText("project_assets_confirmed") === "yes"}
                    onChange={(event) =>
                      setText(
                        "project_assets_confirmed",
                        event.target.checked ? "yes" : "",
                      )
                    }
                  />
                  <span>
                    I confirm that my Google Drive folder is accessible to anyone
                    with the link and that my files are clearly named based on
                    what they are for. <b>*</b>
                  </span>
                </label>
              </div>

              <label className={styles.fullField}>
                <span>Anything else we should know?</span>
                <textarea
                  rows={5}
                  value={valueText("additional_notes")}
                  onChange={(event) => setText("additional_notes", event.target.value)}
                  placeholder="Add any final instructions, content notes, or information that may help us prepare your project."
                />
              </label>
            </div>
          </>
        ) : null}

        {step === 4 ? (
          <>
            <div className={styles.introCopy}>
              <h4>Review before submitting.</h4>
              <p>
                Check your purchase and project details. You can go back to any
                completed step if something needs to be changed.
              </p>
            </div>

            <div className={styles.reviewGrid}>
              <article>
                <span>PURCHASE</span>
                <strong>
                  {platform === "etsy"
                    ? "Etsy"
                    : platform === "raketph"
                      ? "RaketPH"
                      : valueText("other_platform") || "Other Platform"}
                </strong>
                <p>Order #{valueText("order_id")}</p>
                <p>{valueText("buyer_name")}</p>
                <p>{valueText("buyer_email")}</p>
                <button type="button" onClick={() => setStep(0)}>
                  Edit
                </button>
              </article>

              <article>
                <span>PRODUCT</span>
                <strong>{selectedProduct?.name || "Not selected"}</strong>
                <p>{selectedProduct?.note}</p>
                <button type="button" onClick={() => setStep(1)}>
                  Edit
                </button>
              </article>

              <article className={styles.reviewWide}>
                <span>PROJECT</span>
                <strong>{valueText("business_name") || "Project details"}</strong>
                <p>
                  {valueText("about_business") ||
                    valueText("project_scope") ||
                    "Your product-specific requirements have been completed."}
                </p>
                <button type="button" onClick={() => setStep(2)}>
                  Edit
                </button>
              </article>

              <article className={styles.reviewWide}>
                <span>BRANDING & FILES</span>
                <strong>
                  {valueText("brand_style") || "No specific style provided"}
                </strong>
                <p>
                  {valueText("project_assets_drive_link")
                    ? "Google Drive folder link provided."
                    : "No Google Drive folder link provided yet."}
                </p>
                <button type="button" onClick={() => setStep(3)}>
                  Edit
                </button>
              </article>
            </div>

            <label className={styles.confirmation}>
              <input
                type="checkbox"
                checked={valueText("scope_confirmation") === "yes"}
                onChange={(event) =>
                  setText("scope_confirmation", event.target.checked ? "yes" : "")
                }
              />
              <span>
                I understand that my marketplace order will be verified before
                the project begins and that requests outside my purchased
                package may require a separate quotation or additional fee.
              </span>
            </label>
          </>
        ) : null}

        {message ? <p className={styles.formMessage}>{message}</p> : null}

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.backButton}
            onClick={goBack}
            disabled={step === 0}
          >
            ← Back
          </button>

          {step < STEPS.length - 1 ? (
            <button type="submit" className={styles.nextButton}>
              Continue <span>→</span>
            </button>
          ) : (
            <button
              type="submit"
              className={styles.nextButton}
              disabled={
                valueText("scope_confirmation") !== "yes" || isSubmitting
              }
            >
              {isSubmitting ? "Submitting..." : "Submit Requirements"}{" "}
              {!isSubmitting ? <span>→</span> : null}
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
