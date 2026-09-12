import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { getCatalogProduct } from "@/lib/catalog";
import { formatPrice, productPrice } from "@/lib/products";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Simple Business Website Template | TCL Systems & Digitals PH",
  description:
    "Choose from six ready-made simple business website designs. Editable, responsive, and available as a one-time TCL template purchase.",
};

const templates = [
  {
    slug: "aesthetic-soft",
    name: "Aesthetic & Soft",
    label: "SOFT & ELEGANT",
    idealFor: "Salons, nail/lash artists, beauty, wellness & boutiques",
    description:
      "A soft, warm and elegant layout with a feminine feel. Great for businesses that want something polished without looking too corporate.",
    demoUrl: "https://tcl-aesthetic-and-soft-preview.vercel.app/",
    accent: "soft",
  },
  {
    slug: "clean-minimal",
    name: "Clean & Minimal",
    label: "CLEAN & SIMPLE",
    idealFor: "Freelancers, clinics, professionals & consultants",
    description:
      "A spacious and organized design with clean typography and lots of breathing room. Simple, professional and easy to browse.",
    demoUrl: "https://tcl-clean-and-minimal-demo.vercel.app/",
    accent: "minimal",
  },
  {
    slug: "professional-business",
    name: "Professional Business",
    label: "POLISHED & TRUSTED",
    idealFor: "Agencies, local businesses & service companies",
    description:
      "A structured and trustworthy business layout made for service-based companies that want a polished and professional online presence.",
    demoUrl: "https://tcl-professional-business-demo.vercel.app/",
    accent: "business",
  },
  {
    slug: "bold-creative",
    name: "Bold & Creative",
    label: "BOLD & EXPRESSIVE",
    idealFor: "Artists, photographers, designers & creators",
    description:
      "A more expressive layout for creative businesses and personal brands while still keeping the website clean, practical and easy to use.",
    demoUrl: "https://tcl-bold-and-creative-demo.vercel.app/",
    accent: "creative",
  },
  {
    slug: "modern-monochrome",
    name: "Modern Monochrome",
    label: "EDITORIAL & MODERN",
    idealFor: "Fashion, studios, premium services & personal brands",
    description:
      "A black, white and neutral editorial-inspired design with a premium feel. Best for brands that prefer a clean, strong visual style.",
    demoUrl: "https://tcl-modern-monochrome-demo.vercel.app/",
    accent: "monochrome",
  },
  {
    slug: "modern-refined",
    name: "Modern & Refined",
    label: "BALANCED & VERSATILE",
    idealFor: "General businesses, cafés, shops & service providers",
    description:
      "A contemporary and balanced design that works well for many types of businesses. Clean, versatile and easy to personalize.",
    demoUrl: "https://tcl-modern-and-refined-demo.vercel.app/",
    accent: "refined",
  },
];

const included = [
  "Up to 4 website pages",
  "Home, About, Services / Products & Contact",
  "Editable business information",
  "Mobile, tablet & desktop friendly",
  "Services or products showcase",
  "Business information & operating hours",
  "Contact & social media links",
  "Click-to-message buttons",
  "Google Maps location",
  "Gallery section",
  "Contact or inquiry form",
  "SSL / HTTPS secured",
  "Lifetime access to your website template",
  "No monthly TCL website fee",
];

const comparison = [
  {
    feature: "One-time purchase",
    template: true,
    custom: true,
  },
  {
    feature: "4-page simple business website",
    template: true,
    custom: true,
  },
  {
    feature: "Mobile, tablet & desktop friendly",
    template: true,
    custom: true,
  },
  {
    feature: "Choose from 6 ready-made designs",
    template: true,
    custom: false,
  },
  {
    feature: "Edit your available content yourself",
    template: true,
    custom: false,
  },
  {
    feature: "TCL prepares the website for you",
    template: false,
    custom: true,
  },
  {
    feature: "Design personalized around your business",
    template: false,
    custom: true,
  },
  {
    feature: "Future edits done by TCL may have a fee",
    template: false,
    custom: true,
  },
];

const steps = [
  {
    number: "01",
    title: "Choose Your Design",
    text: "Open the six live demos and choose the ready-made website design you like best.",
  },
  {
    number: "02",
    title: "Purchase",
    text: "Choose your design, continue to checkout, and complete your payment.",
  },
  {
    number: "03",
    title: "Payment Confirmed",
    text: "After successful payment, you’ll receive your order number and access to your purchase status.",
  },
  {
    number: "04",
    title: "Optional: Prepare Ahead",
    text: "If you want, use the Getting Ready Guide to prepare your business details, photos, services, content, and required accounts while you wait. This is completely optional — you can also wait until your final package is delivered and do everything together.",
  },
  {
    number: "05",
    title: "Package Processing",
    text: "TCL prepares your buyer-specific copy of the selected website template. Please allow up to 24 hours.",
  },
  {
    number: "06",
    title: "Check Order Status",
    text: "Please check your Order Status from time to time using your order number and purchase email. This is where your finished website package will be delivered.",
  },
  {
    number: "07",
    title: "Ready for Download",
    text: "Once your package is ready, your status changes to Ready for Download and the download option appears in your Order Status page.",
  },
  {
    number: "08",
    title: "Download Your Package",
    text: "Download and save your personalized website package. Your final files include the Full Setup & User Manual.",
  },
  {
    number: "09",
    title: "One-Time Setup",
    text: "Use a computer or laptop for the one-time setup. After setup, everyday website management through Admin can be done from your phone, tablet, laptop, or computer.",
  },
];

export default async function SimpleBusinessWebsiteTemplatePage() {
  const product = await getCatalogProduct("simple-business-website-template");
  if (!product) notFound();

  const hasSale =
    product.sale_price !== null && product.sale_price < product.price;
  const basePrice = productPrice(product);
  const feePercent = product.processing_fee_percent ?? 0;
  const processingFee = Math.round(basePrice * feePercent) / 100;
  const total = Math.round((basePrice + processingFee) * 100) / 100;

  const money = new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
  });

  return (
    <>
      <SiteHeader />

      {/* Mobile product navigation: always visible directly under SiteHeader */}
      <nav className="template-mobile-nav" aria-label="Product navigation">
        <a href="#overview">Overview</a>
        <a href="#choose-design">Choose Design</a>
        <a href="#included">What&apos;s Included</a>
        <a href="#how-it-works">How It Works</a>
        <a href="#compare">Compare</a>
        <a href="#before-purchasing">Before Purchasing</a>
        <a href="#purchase">Ready to Choose</a>
      </nav>

      {/* Desktop/tablet side navigation */}
      <details className="template-side-nav">
        <summary aria-label="Open page navigation">
          <span className="template-side-nav-icon">☰</span>
          <span className="template-side-nav-summary-text">On this page</span>
        </summary>

        <nav className="template-side-nav-panel" aria-label="On this page">
          <span className="template-side-nav-label">ON THIS PAGE</span>
          <a href="#overview">Overview</a>
          <a href="#choose-design">Choose Design</a>
          <a href="#included">What&apos;s Included</a>
          <a href="#how-it-works">How It Works</a>
          <a href="#compare">Compare</a>
          <a href="#before-purchasing">Before Purchasing</a>
          <a href="#purchase">Ready to Choose</a>
        </nav>
      </details>

      <main className="product-detail-page simple-business-template-page">
        <section className="product-detail-hero simple-template-hero" id="overview">
          <div className="product-detail-glow product-detail-glow-one" />
          <div className="product-detail-glow product-detail-glow-two" />

          <div className="container product-detail-hero-grid">
            <div className="product-detail-copy">
              <span className="product-detail-eyebrow">
                SIMPLE BUSINESS WEBSITE TEMPLATE
              </span>

              <h1>
                Your business deserves a <span>clean website.</span>
              </h1>

              <p className="product-detail-lead">
                Choose from 6 ready-made website designs and personalize the
                available content for your own business. A simple, affordable
                DIY website without a monthly TCL website fee.
              </p>

              <div className="product-detail-price-row simple-template-price-row">
                <div className="simple-template-price-box">
                  <small>ONE-TIME PAYMENT</small>

                  <div className="simple-template-price-main">
                    <strong>{formatPrice(basePrice)}</strong>

                    {hasSale && (
                      <del>{formatPrice(product.price)}</del>
                    )}
                  </div>
                </div>

                <span className="product-detail-price-pill">
                  Lifetime template access
                </span>
              </div>

              <div className="product-detail-actions">
                <a className="button button-primary" href="#choose-design">
                  Choose Your Design
                </a>

                <a className="button button-secondary" href="#choose-design">
                  View Live Demos
                </a>
              </div>

              <div className="product-detail-mini-notes">
                <span>
                  <i>✓</i>
                  6 ready-made designs
                </span>
                <span>
                  <i>✓</i>
                  Editable / DIY
                </span>
                <span>
                  <i>✓</i>
                  Responsive
                </span>
              </div>
            </div>

            <div className="product-detail-visual">
              <div className="product-detail-browser">
                <div className="product-detail-browser-top">
                  <div>
                    <span />
                    <span />
                    <span />
                  </div>
                  <small>yourbusiness.vercel.app</small>
                </div>

                <div className="product-detail-browser-body">
                  <div className="product-detail-demo-nav">
                    <div className="product-detail-demo-logo">
                      YOUR
                      <span>LOGO</span>
                    </div>

                    <div>
                      <span />
                      <span />
                      <span />
                    </div>
                  </div>

                  <div className="product-detail-demo-hero">
                    <small>WELCOME TO YOUR BUSINESS</small>
                    <strong>
                      Simple website.
                      <span>Professional presence.</span>
                    </strong>
                    <p>
                      Replace the demo content with your own business details.
                    </p>
                    <div className="product-detail-demo-button">
                      Explore Services
                    </div>
                  </div>

                  <div className="product-detail-demo-services">
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
              </div>

              <div className="product-detail-admin-card">
                <div className="product-detail-admin-icon">6</div>
                <div>
                  <small>READY-MADE DESIGNS</small>
                  <strong>Choose your favorite</strong>
                  <span>Different layouts • Different styles</span>
                </div>
              </div>

              <div className="product-detail-edit-card">
                <span>✦</span>
                <div>
                  <small>DIY TEMPLATE</small>
                  <strong>Edit your own content</strong>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="product-detail-trust-strip">
          <div className="container">
            <div>
              <strong>{formatPrice(basePrice)}</strong>
              <span>one-time</span>
            </div>
            <i />
            <div>
              <strong>6 designs</strong>
              <span>to choose from</span>
            </div>
            <i />
            <div>
              <strong>4 pages</strong>
              <span>simple business site</span>
            </div>
            <i />
            <div>
              <strong>Responsive</strong>
              <span>desktop to mobile</span>
            </div>
          </div>
        </section>

        <section className="section section-white" id="choose-design">
          <div className="container">
            <div className="section-heading centered-heading">
              <span className="section-kicker">Choose your website</span>
              <h2>6 ready-made designs. Pick the one that fits you.</h2>
              <p>
                Open any live demo to explore the full website before choosing.
                Each option has its own layout and visual style — not just a
                different color palette.
              </p>
            </div>

            <div className="simple-template-grid">
              {templates.map((template, index) => (
                <article
                  className={`simple-template-card simple-template-card-${template.accent}`}
                  key={template.slug}
                >
                  <div className="simple-template-card-top">
                    <span className="simple-template-number">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <small>{template.label}</small>
                  </div>

                  <div className="simple-template-card-copy">
                    <h3>{template.name}</h3>

                    <div className="simple-template-best-for">
                      <span>Best for</span>
                      <p>{template.idealFor}</p>
                    </div>

                    <p className="simple-template-description">
                      {template.description}
                    </p>
                  </div>

                  <div className="simple-template-card-actions">
                    <a
                      href={template.demoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="button button-secondary"
                    >
                      View Live Demo ↗
                    </a>

                    <Link
                      href={`/checkout?product=${product.slug}&design=${template.slug}`}
                      className="button button-primary"
                    >
                      Choose This Design
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section product-included-section" id="included">
          <div className="container product-included-grid">
            <div className="product-included-copy">
              <span className="section-kicker">What&apos;s included</span>
              <h2>A simple website with the essentials already included.</h2>
              <p>
                This product is intentionally simple. You get the core pages and
                sections most small businesses need, without paying for a fully
                custom website.
              </p>

              <div className="product-included-note">
                <span>♡</span>
                <div>
                  <strong>Made for DIY editing.</strong>
                  <p>
                    You can replace the information available inside your chosen
                    template. The design, page structure and included sections
                    stay within the selected template.
                  </p>
                </div>
              </div>
            </div>

            <div className="product-included-list">
              {included.map((item) => (
                <div key={item}>
                  <span>✓</span>
                  <p>{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="template-process-section" id="how-it-works">
          <div className="container">
            <div className="template-process-heading">
              <span className="section-kicker">How it works</span>
              <h2>Your website journey, step by step.</h2>
              <p>
                From choosing your design to downloading and setting up your
                website, here&apos;s exactly what happens after you purchase.
              </p>
            </div>

            <div className="template-progress">
              {steps.map((step, index) => (
                <div className="template-progress-step" key={step.number}>
                  <div className="template-progress-marker">
                    <div className="template-progress-circle">
                      <span>{step.number}</span>
                    </div>

                    {index < steps.length - 1 && (
                      <div className="template-progress-line" />
                    )}
                  </div>

                  <div className="template-progress-content">
                    <span className="template-progress-label">
                      STEP {step.number}
                    </span>

                    <h3>{step.title}</h3>
                    <p>{step.text}</p>

                    {step.number === "04" && (
                      <div className="template-progress-note">
                        <strong>Optional</strong>
                        <span>
                          You don&apos;t have to prepare anything yet. You can
                          wait for your complete website package and follow the
                          Full Setup &amp; User Manual later.
                        </span>
                      </div>
                    )}

                    {step.number === "05" && (
                      <div className="template-progress-note">
                        <strong>Processing time</strong>
                        <span>
                          Please allow up to 24 hours while your buyer-specific
                          website package is being prepared.
                        </span>
                      </div>
                    )}

                    {step.number === "06" && (
                      <div className="template-progress-note">
                        <strong>Important</strong>
                        <span>
                          Check your Order Status from time to time. Your website
                          package and download button will appear there once ready.
                        </span>
                      </div>
                    )}

                    {step.number === "09" && (
                      <div className="template-progress-note">
                        <strong>Computer needed for setup only</strong>
                        <span>
                          After the one-time setup, you can manage your website
                          Admin using your phone, tablet, laptop, or computer.
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="template-progress-summary">
              <div className="template-progress-summary-step">
                <span>1</span>
                <strong>Choose</strong>
              </div>
              <i>→</i>
              <div className="template-progress-summary-step">
                <span>2</span>
                <strong>Pay</strong>
              </div>
              <i>→</i>
              <div className="template-progress-summary-step">
                <span>3</span>
                <strong>Processing</strong>
              </div>
              <i>→</i>
              <div className="template-progress-summary-step">
                <span>4</span>
                <strong>Order Status</strong>
              </div>
              <i>→</i>
              <div className="template-progress-summary-step">
                <span>5</span>
                <strong>Download</strong>
              </div>
              <i>→</i>
              <div className="template-progress-summary-step">
                <span>6</span>
                <strong>Setup</strong>
              </div>
            </div>
          </div>
        </section>

        <section className="section product-comparison-section" id="compare">
          <div className="container">
            <div className="section-heading centered-heading">
              <span className="section-kicker">Choose what works for you</span>
              <h2>DIY Template or Customized Simple Website?</h2>
              <p>
                Both are simple business websites. The difference is whether you
                want to edit a ready-made template yourself or have TCL prepare
                the website for you.
              </p>
            </div>

            <div className="product-comparison-wrap">
              <div className="product-comparison-header">
                <div>
                  <span>FEATURE</span>
                </div>
                <div className="active">
                  <small>DIY OPTION</small>
                  <strong>{formatPrice(basePrice)} Template</strong>
                </div>
                <div>
                  <small>DONE FOR YOU</small>
                  <strong>₱1,999 Customized Simple Website</strong>
                </div>
              </div>

              <div className="product-comparison-body">
                {comparison.map((row) => (
                  <div className="product-comparison-row" key={row.feature}>
                    <div>
                      <span>{row.feature}</span>
                    </div>
                    <div className="active">
                      <strong>{row.template ? "✓" : "—"}</strong>
                    </div>
                    <div>
                      <strong>{row.custom ? "✓" : "—"}</strong>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="product-comparison-notes">
              <article>
                <span>DIY TEMPLATE</span>
                <h3>More editing freedom.</h3>
                <p>
                  You can update the available content yourself, but the design,
                  sections and layout remain limited to the template you choose.
                </p>
              </article>

              <article>
                <span>CUSTOMIZED SIMPLE WEBSITE</span>
                <h3>More design freedom.</h3>
                <p>
                  TCL prepares the website around your business, branding,
                  preferred palette and content. It remains a simple business
                  website, not unlimited custom development. Future requested
                  changes may have a service fee.
                </p>
              </article>
            </div>
          </div>
        </section>

        <section className="section section-white product-notes-section" id="before-purchasing">
          <div className="container product-notes-grid">
            <div>
              <span className="section-kicker">Before purchasing</span>
              <h2>A few important things to know.</h2>
              <p>
                This is an affordable ready-made website template, so make sure
                its limits match what you need before purchasing.
              </p>
            </div>

            <div className="product-note-cards">
              <article>
                <span>01</span>
                <div>
                  <strong>Template / DIY product</strong>
                  <p>
                    This is not a fully custom website. You choose one of the six
                    available designs and work within its existing pages and
                    sections.
                  </p>
                </div>
              </article>

              <article>
                <span>02</span>
                <div>
                  <strong>Limited design freedom</strong>
                  <p>
                    You can edit the available business information, but you
                    cannot freely redesign the template or create arbitrary new
                    layouts and sections.
                  </p>
                </div>
              </article>

              <article>
                <span>03</span>
                <div>
                  <strong>30-day technical assistance</strong>
                  <p>
                    TCL can assist for 30 days after purchase with
                    template-related technical issues or bugs. This does not
                    include content editing, redesign, new sections, custom
                    features or website management.
                  </p>
                </div>
              </article>

              <article>
                <span>04</span>
                <div>
                  <strong>Third-party costs</strong>
                  <p>
                    There is no monthly TCL website fee. Domains, paid hosting
                    plans or other third-party services may have their own costs
                    if you choose to use them.
                  </p>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section className="product-purchase-section" id="purchase">
          <div className="container product-purchase-grid">
            <div className="product-purchase-copy">
              <span className="section-kicker">Ready to choose?</span>
              <h2>Start with the design you like best.</h2>
              <p>
                Explore all six live demos first. Once you find the one you want,
                choose that design and continue to checkout.
              </p>

              <div
                className="simple-template-compact-process"
                aria-label="Purchase and delivery process"
              >
                <div>
                  <span>1</span>
                  <strong>Choose</strong>
                </div>
                <i>→</i>
                <div>
                  <span>2</span>
                  <strong>Pay</strong>
                </div>
                <i>→</i>
                <div>
                  <span>3</span>
                  <strong>Processing</strong>
                </div>
                <i>→</i>
                <div>
                  <span>4</span>
                  <strong>Order Status</strong>
                </div>
                <i>→</i>
                <div>
                  <span>5</span>
                  <strong>Download</strong>
                </div>
                <i>→</i>
                <div>
                  <span>6</span>
                  <strong>Setup</strong>
                </div>
              </div>

              <div className="simple-template-purchase-alert">
                <strong>How delivery works</strong>
                <p>
                  Your buyer-specific website package is prepared after payment and
                  may take up to <strong>24 hours</strong>. Please check your
                  <strong> Order Status from time to time</strong> — this is where your
                  finished website package and download option will appear.
                </p>
              </div>

              <div className="product-purchase-benefits">
                <span>✓ One-time TCL template purchase</span>
                <span>✓ 6 live designs to choose from</span>
                <span>✓ Up to 4 simple website pages</span>
                <span>✓ Lifetime access to your website template</span>
                <span>✓ Optional Getting Ready Guide while you wait</span>
                <span>✓ Computer needed for one-time setup only</span>
              </div>

            </div>

            <div className="product-checkout-card">
              <div className="product-checkout-heading">
                <div>
                  <small>{product.name}</small>
                  <strong>Pricing</strong>
                </div>
                <span>♡</span>
              </div>

              <div className="product-checkout-lines">
                <div>
                  <span>{hasSale ? "Sale price" : "Product price"}</span>
                  <strong>
                    {hasSale && (
                      <del
                        style={{
                          display: "block",
                          fontSize: 14,
                          fontWeight: 400,
                          color: "var(--text-soft)",
                          marginBottom: 4,
                        }}
                        aria-label={`Regular price ${money.format(
                          product.price
                        )}`}
                      >
                        {money.format(product.price)}
                      </del>
                    )}
                    {money.format(basePrice)}
                  </strong>
                </div>

                <div>
                  <span>Processing fee ({feePercent}%)</span>
                  <strong>{money.format(processingFee)}</strong>
                </div>
              </div>

              <div className="product-checkout-total">
                <span>Total</span>
                <strong>{money.format(total)}</strong>
              </div>

              <p className="product-checkout-note">
                Your chosen design is selected before checkout so it can be
                included with your order.
              </p>

              <a className="button button-primary" href="#choose-design">
                Select a Design First
              </a>
            </div>
          </div>
        </section>
      </main>

      <style>{`
        .simple-business-template-page {
          overflow: hidden;
        }

        .simple-template-hero {
          position: relative;
          background:
            radial-gradient(circle at 88% 18%, rgba(185, 104, 132, 0.10), transparent 30%),
            linear-gradient(135deg, #fff8fa 0%, #f9edf1 58%, #f4e4ea 100%);
        }

        .simple-template-hero .product-detail-copy h1 {
          color: #2f2428 !important;
          text-shadow: none;
        }

        .simple-template-hero .product-detail-copy h1 span {
          color: #a95774 !important;
        }

        .simple-template-hero .product-detail-lead {
          color: #6d5c63 !important;
          text-shadow: none;
        }

        .simple-template-hero .product-detail-eyebrow {
          display: inline-flex;
          margin-bottom: 18px;
          padding: 7px 11px;
          border: 1px solid #e3c9d2;
          border-radius: 999px;
          background: #fff;
          color: #9b5870 !important;
          font-size: 0.68rem;
          font-weight: 900;
          letter-spacing: 0.12em;
          box-shadow: 0 5px 16px rgba(88, 57, 68, 0.05);
        }

        .simple-template-price-row {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 14px;
          margin-top: 24px;
        }

        .simple-template-price-box {
          display: inline-flex;
          align-items: center;
          gap: 16px;
          padding: 13px 18px;
          border: 1px solid #b96884;
          border-radius: 16px;
          background: #b96884;
          box-shadow: 0 12px 28px rgba(185, 104, 132, 0.20);
        }

        .simple-template-price-box > small {
          max-width: 82px;
          color: #fff !important;
          font-size: 0.58rem;
          font-weight: 900;
          line-height: 1.35;
          letter-spacing: 0.11em;
        }

        .simple-template-price-main {
          display: flex;
          align-items: baseline;
          flex-wrap: wrap;
          gap: 8px;
        }

        .simple-template-price-main > strong {
          color: #fff !important;
          font-size: clamp(2rem, 4vw, 2.6rem);
          line-height: 1;
          letter-spacing: -0.045em;
        }

        .simple-template-price-main > del {
          color: rgba(255, 255, 255, 0.72) !important;
          font-size: 0.75rem;
          font-weight: 700;
        }

        .simple-template-price-row .product-detail-price-pill {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 48px;
          padding: 11px 16px;
          border: 1px solid #dfc5cf;
          border-radius: 14px;
          background: #fff;
          color: #7c5664 !important;
          font-size: 0.68rem;
          font-weight: 850;
          text-align: center;
          box-shadow: 0 8px 20px rgba(88, 57, 68, 0.06);
        }

        .simple-template-hero .product-detail-actions {
          margin-top: 22px;
        }

        .simple-template-hero .button-primary {
          border-color: #a95774;
          background: #a95774;
          color: #fff;
        }

        .simple-template-hero .button-primary:hover {
          background: #934963;
        }

        .simple-template-hero .button-secondary {
          border-color: #d8bcc6;
          background: #fff;
          color: #7d5564;
        }

        .simple-template-hero .button-secondary:hover {
          background: #fff9fb;
        }

        .simple-template-hero .product-detail-mini-notes span,
        .simple-template-hero .product-detail-mini-notes i {
          color: #66545b !important;
        }

        .simple-template-hero .product-detail-mini-notes i {
          color: #a95774 !important;
        }

        .simple-template-hero .product-detail-browser {
          background: #fff;
          color: var(--text);
          border: 1px solid #eadde2;
          box-shadow: 0 22px 45px rgba(89, 60, 70, 0.12);
        }

        .simple-template-hero .product-detail-browser *,
        .simple-template-hero .product-detail-admin-card *,
        .simple-template-hero .product-detail-edit-card * {
          color: inherit;
        }

        .simple-template-hero .product-detail-browser-top small,
        .simple-template-hero .product-detail-demo-nav,
        .simple-template-hero .product-detail-demo-hero p,
        .simple-template-hero .product-detail-admin-card span,
        .simple-template-hero .product-detail-edit-card small {
          color: var(--text-soft);
        }

        .simple-template-hero .product-detail-demo-logo,
        .simple-template-hero .product-detail-demo-hero strong,
        .simple-template-hero .product-detail-admin-card strong,
        .simple-template-hero .product-detail-edit-card strong {
          color: var(--text);
        }

        .simple-template-hero .product-detail-demo-logo span,
        .simple-template-hero .product-detail-demo-hero strong span {
          color: #b96884;
        }

        .simple-template-hero .product-detail-admin-card,
        .simple-template-hero .product-detail-edit-card {
          background: #fff;
          border: 1px solid #eadde2;
          box-shadow: 0 10px 26px rgba(89, 60, 70, 0.08);
        }

        @media (max-width: 640px) {
          .simple-template-price-row {
            display: grid;
            grid-template-columns: 1fr;
          }

          .simple-template-price-box {
            width: 100%;
            justify-content: space-between;
          }

          .simple-template-price-row .product-detail-price-pill {
            width: 100%;
          }
        }

        .simple-template-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 18px;
          margin-top: 34px;
        }

        .simple-template-card {
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 18px;
          min-height: 100%;
          padding: 24px;
          border: 1px solid #eadde2;
          border-radius: 20px;
          background: #fff;
          box-shadow: 0 10px 30px rgba(69, 46, 54, 0.06);
        }

        .simple-template-card-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding-bottom: 14px;
          border-bottom: 1px solid #f0e4e8;
        }

        .simple-template-number {
          display: grid;
          place-items: center;
          width: 34px;
          height: 34px;
          flex: 0 0 34px;
          border-radius: 50%;
          background: #f7e8ed;
          color: #9e5871;
          font-size: 0.72rem;
          font-weight: 900;
        }

        .simple-template-card-top small {
          color: #a1697c;
          font-size: 0.62rem;
          font-weight: 850;
          letter-spacing: 0.1em;
          text-align: right;
        }

        .simple-template-card-copy {
          display: grid;
          gap: 14px;
        }

        .simple-template-card-copy h3 {
          margin: 0;
          color: var(--text);
          font-size: 1.15rem;
        }

        .simple-template-best-for {
          display: grid;
          gap: 5px;
        }

        .simple-template-best-for span {
          color: #ad7086;
          font-size: 0.61rem;
          font-weight: 900;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .simple-template-best-for p,
        .simple-template-description {
          margin: 0;
          color: var(--text-soft);
          font-size: 0.73rem;
          line-height: 1.65;
        }

        .simple-template-card-actions {
          display: grid;
          grid-template-columns: 1fr;
          gap: 10px;
          margin-top: auto;
        }

        .simple-template-card-actions .button {
          width: 100%;
          min-height: 44px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          text-align: center;
        }

        .product-comparison-wrap {
          overflow: hidden;
          margin-top: 30px;
          border: 1px solid #eadde2;
          border-radius: 20px;
          background: #fff;
        }

        .product-comparison-header,
        .product-comparison-row {
          display: grid;
          grid-template-columns: 1.35fr 1fr 1fr;
        }

        .product-comparison-header > div,
        .product-comparison-row > div {
          min-width: 0;
          padding: 16px 18px;
          border-right: 1px solid #eee3e7;
        }

        .product-comparison-header > div:last-child,
        .product-comparison-row > div:last-child {
          border-right: 0;
        }

        .product-comparison-header {
          background: #faf5f7;
          border-bottom: 1px solid #eadde2;
        }

        .product-comparison-header small {
          display: block;
          margin-bottom: 5px;
          color: #a16a7e;
          font-size: 0.58rem;
          font-weight: 900;
          letter-spacing: 0.08em;
        }

        .product-comparison-header strong {
          color: var(--text);
          font-size: 0.76rem;
        }

        .product-comparison-header .active,
        .product-comparison-row .active {
          background: #fff8fa;
        }

        .product-comparison-row {
          border-bottom: 1px solid #f0e6ea;
        }

        .product-comparison-row:last-child {
          border-bottom: 0;
        }

        .product-comparison-row > div:not(:first-child) {
          display: grid;
          place-items: center;
          text-align: center;
        }

        .product-comparison-row span {
          color: var(--text-soft);
          font-size: 0.7rem;
          line-height: 1.5;
        }

        .product-comparison-row strong {
          color: #a85874;
          font-size: 0.94rem;
        }

        .product-comparison-notes {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 14px;
          margin-top: 18px;
        }

        .product-comparison-notes article {
          padding: 20px;
          border: 1px solid #eadde2;
          border-radius: 16px;
          background: #fff;
        }

        .product-comparison-notes article > span {
          color: #a35e76;
          font-size: 0.6rem;
          font-weight: 900;
          letter-spacing: 0.08em;
        }

        .product-comparison-notes h3 {
          margin: 7px 0;
          color: var(--text);
          font-size: 0.95rem;
        }

        .product-comparison-notes p {
          margin: 0;
          color: var(--text-soft);
          font-size: 0.7rem;
          line-height: 1.6;
        }

        .product-checkout-total {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          margin-top: 14px;
          padding-top: 14px;
          border-top: 1px solid #eadde2;
        }

        .product-checkout-total span {
          color: var(--text-soft);
          font-size: 0.72rem;
          font-weight: 800;
        }

        .product-checkout-total strong {
          color: var(--text);
          font-size: 1.1rem;
        }

        .product-checkout-note {
          margin: 14px 0;
          color: var(--text-soft);
          font-size: 0.66rem;
          line-height: 1.55;
        }

        .simple-template-delivery-notes {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 14px;
          margin-top: 24px;
        }

        .simple-template-delivery-notes article {
          padding: 20px;
          border: 1px solid #eadde2;
          border-radius: 16px;
          background: #fff8fa;
        }

        .simple-template-delivery-notes article > span {
          display: inline-block;
          margin-bottom: 8px;
          color: #a35e76;
          font-size: 0.58rem;
          font-weight: 900;
          letter-spacing: 0.09em;
        }

        .simple-template-delivery-notes h3 {
          margin: 0 0 8px;
          color: var(--text);
          font-size: 0.95rem;
          line-height: 1.35;
        }

        .simple-template-delivery-notes p {
          margin: 0;
          color: var(--text-soft);
          font-size: 0.7rem;
          line-height: 1.65;
        }

        .simple-template-compact-process {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 7px;
          margin: 20px 0 16px;
          padding: 14px;
          border: 1px solid #eadde2;
          border-radius: 14px;
          background: #fff;
        }

        .simple-template-compact-process span {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 30px;
          padding: 6px 9px;
          border-radius: 999px;
          background: #f7e8ed;
          color: #855669;
          font-size: 0.62rem;
          font-weight: 850;
          white-space: nowrap;
        }

        .simple-template-compact-process i {
          color: #b96884;
          font-size: 0.68rem;
          font-style: normal;
          font-weight: 900;
        }

        .simple-template-purchase-alert {
          margin: 0 0 18px;
          padding: 16px;
          border: 1px solid rgba(185, 104, 132, 0.24);
          border-radius: 14px;
          background: rgba(185, 104, 132, 0.065);
        }

        .simple-template-purchase-alert > strong {
          display: block;
          margin-bottom: 6px;
          color: #7e4e60;
          font-size: 0.82rem;
        }

        .simple-template-purchase-alert p {
          margin: 0;
          color: var(--text-soft);
          font-size: 0.7rem;
          line-height: 1.65;
        }

        @media (max-width: 1000px) {
          .simple-template-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 760px) {
          .simple-template-grid {
            grid-template-columns: 1fr;
            gap: 14px;
          }

          .simple-template-card {
            padding: 20px;
          }

          .product-comparison-wrap {
            overflow-x: auto;
          }

          .product-comparison-header,
          .product-comparison-row {
            min-width: 650px;
          }

          .product-comparison-notes {
            grid-template-columns: 1fr;
          }

          .simple-template-delivery-notes {
            grid-template-columns: 1fr;
          }

          .simple-template-compact-process {
            gap: 6px;
            padding: 12px;
          }

          .simple-template-compact-process span {
            font-size: 0.58rem;
            padding: 6px 8px;
          }
        }

        /* Mobile product-page polish */
        @media (max-width: 760px) {
          .simple-business-template-page {
            overflow-x: hidden;
          }

          .simple-template-hero {
            padding-top: 34px !important;
            padding-bottom: 40px !important;
          }

          .simple-template-hero .product-detail-hero-grid {
            display: block !important;
          }

          .simple-template-hero .product-detail-copy {
            width: 100% !important;
            max-width: none !important;
          }

          .simple-template-hero .product-detail-eyebrow {
            max-width: 100%;
            margin-bottom: 16px;
            padding: 8px 12px;
            font-size: 0.58rem;
            line-height: 1.3;
            letter-spacing: 0.09em;
            white-space: normal;
          }

          .simple-template-hero .product-detail-copy h1 {
            max-width: 12ch;
            margin-bottom: 16px !important;
            font-size: clamp(2.25rem, 10vw, 3rem) !important;
            line-height: 0.98 !important;
            letter-spacing: -0.055em !important;
          }

          .simple-template-hero .product-detail-lead {
            max-width: 36rem;
            margin-bottom: 0 !important;
            font-size: 1rem !important;
            line-height: 1.65 !important;
          }

          .simple-template-price-row {
            display: grid !important;
            grid-template-columns: 1fr !important;
            gap: 10px !important;
            margin-top: 22px !important;
          }

          .simple-template-price-box {
            width: 100% !important;
            min-width: 0 !important;
            display: grid !important;
            grid-template-columns: auto 1fr !important;
            align-items: center !important;
            gap: 12px !important;
            padding: 15px 16px !important;
            border-radius: 15px !important;
          }

          .simple-template-price-box > small {
            max-width: 72px !important;
            font-size: 0.55rem !important;
            line-height: 1.3 !important;
          }

          .simple-template-price-main {
            min-width: 0;
            display: flex !important;
            justify-content: flex-end !important;
            align-items: baseline !important;
            gap: 8px !important;
          }

          .simple-template-price-main > strong {
            font-size: clamp(1.8rem, 9vw, 2.35rem) !important;
            white-space: nowrap;
          }

          .simple-template-price-main > del {
            font-size: 0.67rem !important;
            white-space: nowrap;
          }

          .simple-template-price-row .product-detail-price-pill {
            width: 100% !important;
            min-width: 0 !important;
            min-height: 48px !important;
            border-radius: 14px !important;
            font-size: 0.72rem !important;
          }

          .simple-template-hero .product-detail-actions {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            gap: 9px !important;
            margin-top: 14px !important;
          }

          .simple-template-hero .product-detail-actions .button {
            width: 100% !important;
            min-width: 0 !important;
            min-height: 46px !important;
            padding: 10px 8px !important;
            font-size: 0.7rem !important;
            text-align: center;
          }

          .simple-template-hero .product-detail-mini-notes {
            display: grid !important;
            grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
            gap: 8px !important;
            margin-top: 16px !important;
          }

          .simple-template-hero .product-detail-mini-notes span {
            min-width: 0;
            display: flex !important;
            align-items: flex-start !important;
            gap: 5px !important;
            font-size: 0.62rem !important;
            line-height: 1.3 !important;
          }

          .simple-template-hero .product-detail-visual {
            width: 100% !important;
            max-width: none !important;
            margin-top: 28px !important;
          }

          .simple-template-hero .product-detail-browser {
            width: 100% !important;
            max-width: none !important;
            min-height: 0 !important;
            border-radius: 16px !important;
          }

          .simple-template-hero .product-detail-browser-body {
            min-height: 270px !important;
            padding: 18px !important;
          }

          .simple-template-hero .product-detail-admin-card,
          .simple-template-hero .product-detail-edit-card {
            position: static !important;
            width: 100% !important;
            max-width: none !important;
            margin-top: 10px !important;
            transform: none !important;
          }

          .product-detail-trust-strip .container {
            display: grid !important;
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 0 !important;
          }

          .product-detail-trust-strip .container > i {
            display: none !important;
          }

          .product-detail-trust-strip .container > div {
            min-width: 0;
            padding: 14px 8px !important;
            text-align: center;
          }

          .product-detail-trust-strip strong {
            font-size: 0.78rem !important;
          }

          .product-detail-trust-strip span {
            font-size: 0.6rem !important;
          }

          #choose-design .section-heading {
            margin-bottom: 22px !important;
          }

          #choose-design .section-heading h2 {
            font-size: clamp(1.75rem, 8vw, 2.2rem) !important;
            line-height: 1.08 !important;
          }

          .simple-template-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 10px !important;
            margin-top: 24px !important;
          }

          .simple-template-card {
            min-width: 0 !important;
            gap: 11px !important;
            padding: 13px !important;
            border-radius: 15px !important;
          }

          .simple-template-card-top {
            align-items: flex-start !important;
            gap: 6px !important;
            padding-bottom: 10px !important;
          }

          .simple-template-number {
            width: 27px !important;
            height: 27px !important;
            flex-basis: 27px !important;
            font-size: 0.58rem !important;
          }

          .simple-template-card-top small {
            font-size: 0.48rem !important;
            line-height: 1.25 !important;
            letter-spacing: 0.06em !important;
          }

          .simple-template-card-copy {
            gap: 9px !important;
          }

          .simple-template-card-copy h3 {
            font-size: 0.93rem !important;
            line-height: 1.15 !important;
          }

          .simple-template-best-for {
            gap: 3px !important;
          }

          .simple-template-best-for span {
            font-size: 0.5rem !important;
          }

          .simple-template-best-for p,
          .simple-template-description {
            font-size: 0.61rem !important;
            line-height: 1.45 !important;
          }

          .simple-template-card-actions {
            gap: 7px !important;
          }

          .simple-template-card-actions .button {
            min-height: 38px !important;
            padding: 8px 5px !important;
            font-size: 0.57rem !important;
            line-height: 1.2 !important;
          }

          .product-included-grid,
          .product-notes-grid,
          .product-purchase-grid {
            grid-template-columns: 1fr !important;
            gap: 24px !important;
          }

          .product-setup-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 10px !important;
          }

          .product-setup-card {
            min-width: 0;
            padding: 16px !important;
          }

          .product-comparison-wrap {
            overflow-x: auto !important;
            -webkit-overflow-scrolling: touch;
          }

          .product-comparison-header,
          .product-comparison-row {
            min-width: 560px !important;
          }

          .product-comparison-notes {
            grid-template-columns: 1fr !important;
          }

          .product-checkout-card {
            width: 100% !important;
          }
        }

        @media (max-width: 390px) {
          .simple-template-hero .product-detail-actions {
            grid-template-columns: 1fr !important;
          }

          .simple-template-price-box {
            grid-template-columns: 1fr !important;
          }

          .simple-template-price-main {
            justify-content: flex-start !important;
          }

          .simple-template-hero .product-detail-mini-notes {
            grid-template-columns: 1fr 1fr !important;
          }

          .simple-template-card {
            padding: 11px !important;
          }

          .simple-template-card-copy h3 {
            font-size: 0.86rem !important;
          }

          .simple-template-description {
            font-size: 0.58rem !important;
          }
        }


        /* Final mobile corrections: hero visual + comparison table */
        @media (max-width: 760px) {
          .simple-template-hero .product-detail-visual {
            display: grid !important;
            grid-template-columns: 1fr !important;
            gap: 10px !important;
            margin-top: 26px !important;
          }

          .simple-template-hero .product-detail-browser {
            position: relative !important;
            width: 100% !important;
            max-width: 100% !important;
            height: auto !important;
            min-height: 0 !important;
            overflow: hidden !important;
          }

          .simple-template-hero .product-detail-browser-top {
            min-width: 0 !important;
          }

          .simple-template-hero .product-detail-browser-top small {
            max-width: 68% !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
            white-space: nowrap !important;
          }

          .simple-template-hero .product-detail-browser-body {
            min-height: 0 !important;
            height: auto !important;
            padding: 18px !important;
          }

          .simple-template-hero .product-detail-demo-nav {
            width: 100% !important;
          }

          .simple-template-hero .product-detail-demo-hero {
            width: 100% !important;
            max-width: 100% !important;
            padding: 30px 0 22px !important;
          }

          .simple-template-hero .product-detail-demo-hero strong {
            max-width: 100% !important;
            font-size: clamp(1.55rem, 7vw, 2.15rem) !important;
            line-height: 1.02 !important;
            overflow-wrap: anywhere !important;
          }

          .simple-template-hero .product-detail-demo-hero p {
            max-width: 100% !important;
            font-size: 0.76rem !important;
            line-height: 1.55 !important;
          }

          .simple-template-hero .product-detail-demo-services {
            width: 100% !important;
            grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
          }

          .simple-template-hero .product-detail-admin-card,
          .simple-template-hero .product-detail-edit-card {
            position: relative !important;
            inset: auto !important;
            right: auto !important;
            left: auto !important;
            top: auto !important;
            bottom: auto !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            transform: none !important;
          }

          .simple-template-hero .product-detail-admin-card {
            order: 2;
          }

          .simple-template-hero .product-detail-edit-card {
            order: 3;
          }

          .product-comparison-wrap {
            width: 100% !important;
            overflow: hidden !important;
            border-radius: 14px !important;
          }

          .product-comparison-header,
          .product-comparison-row {
            width: 100% !important;
            min-width: 0 !important;
            grid-template-columns: minmax(0, 1.25fr) minmax(0, .72fr) minmax(0, .9fr) !important;
          }

          .product-comparison-header > div,
          .product-comparison-row > div {
            min-width: 0 !important;
            padding: 9px 6px !important;
          }

          .product-comparison-header > div:first-child,
          .product-comparison-row > div:first-child {
            padding-left: 9px !important;
          }

          .product-comparison-header span,
          .product-comparison-header small {
            font-size: 0.43rem !important;
            line-height: 1.15 !important;
            letter-spacing: 0.035em !important;
          }

          .product-comparison-header strong {
            display: block !important;
            font-size: 0.52rem !important;
            line-height: 1.22 !important;
            overflow-wrap: anywhere !important;
          }

          .product-comparison-row span {
            display: block !important;
            font-size: 0.5rem !important;
            line-height: 1.25 !important;
            overflow-wrap: anywhere !important;
          }

          .product-comparison-row strong {
            font-size: 0.72rem !important;
          }

          .product-comparison-notes {
            gap: 10px !important;
            margin-top: 12px !important;
          }

          .product-comparison-notes article {
            padding: 15px !important;
          }
        }

        @media (max-width: 390px) {
          .product-comparison-header > div,
          .product-comparison-row > div {
            padding: 8px 4px !important;
          }

          .product-comparison-header > div:first-child,
          .product-comparison-row > div:first-child {
            padding-left: 6px !important;
          }

          .product-comparison-header strong {
            font-size: 0.47rem !important;
          }

          .product-comparison-row span {
            font-size: 0.46rem !important;
          }
        }


        /* Mobile cleanup: prevent decorative layers covering text,
           separate trust boxes, and make hero preview behave like a real mobile card */
        @media (max-width: 760px) {
          /* HERO PREVIEW */
          .simple-template-hero .product-detail-visual {
            position: relative !important;
            display: flex !important;
            flex-direction: column !important;
            gap: 12px !important;
            width: 100% !important;
            max-width: 100% !important;
            margin-top: 28px !important;
            padding: 0 !important;
          }

          .simple-template-hero .product-detail-browser {
            position: relative !important;
            inset: auto !important;
            width: 100% !important;
            max-width: 100% !important;
            height: auto !important;
            min-height: 0 !important;
            margin: 0 !important;
            transform: none !important;
            overflow: hidden !important;
          }

          .simple-template-hero .product-detail-browser-body,
          .simple-template-hero .product-detail-demo-nav,
          .simple-template-hero .product-detail-demo-hero,
          .simple-template-hero .product-detail-demo-services {
            width: 100% !important;
            max-width: 100% !important;
            min-width: 0 !important;
          }

          .simple-template-hero .product-detail-demo-hero {
            position: relative !important;
            z-index: 2 !important;
            padding: 26px 0 20px !important;
          }

          .simple-template-hero .product-detail-demo-hero > * {
            position: relative !important;
            z-index: 3 !important;
          }

          .simple-template-hero .product-detail-demo-hero strong {
            display: block !important;
            max-width: 100% !important;
            font-size: clamp(1.45rem, 7vw, 2rem) !important;
            line-height: 1.04 !important;
            overflow-wrap: break-word !important;
            word-break: normal !important;
          }

          .simple-template-hero .product-detail-demo-hero p {
            max-width: 100% !important;
          }

          .simple-template-hero .product-detail-admin-card,
          .simple-template-hero .product-detail-edit-card {
            position: relative !important;
            inset: auto !important;
            top: auto !important;
            right: auto !important;
            bottom: auto !important;
            left: auto !important;
            z-index: 1 !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            transform: none !important;
          }

          /* TRUST STRIP — 2 x 2 with visible spacing */
          .product-detail-trust-strip {
            padding: 28px 0 !important;
          }

          .product-detail-trust-strip .container {
            display: grid !important;
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 10px !important;
          }

          .product-detail-trust-strip .container > i {
            display: none !important;
          }

          .product-detail-trust-strip .container > div {
            min-width: 0 !important;
            min-height: 82px !important;
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            justify-content: center !important;
            gap: 4px !important;
            padding: 14px 10px !important;
            border: 1px solid #ecd5de !important;
            border-radius: 14px !important;
            background: #fff !important;
          }

          /* HOW IT WORKS — keep decorative shapes behind all text */
          .product-setup-card {
            position: relative !important;
            isolation: isolate !important;
            overflow: hidden !important;
          }

          .product-setup-card::before,
          .product-setup-card::after {
            z-index: 0 !important;
            pointer-events: none !important;
          }

          .product-setup-card > * {
            position: relative !important;
            z-index: 2 !important;
          }

          .product-setup-card h3,
          .product-setup-card p,
          .product-setup-card .product-setup-number {
            position: relative !important;
            z-index: 3 !important;
          }

          /* If a large decorative number/circle is created by nested spans,
             ensure the actual copy stays above it. */
          .product-setup-card h3 {
            margin-top: 18px !important;
          }

          /* Keep 2 cards per row but give text enough room */
          .product-setup-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 12px !important;
          }

          .product-setup-card {
            padding: 16px 14px !important;
          }

          .product-setup-card h3 {
            font-size: 0.92rem !important;
            line-height: 1.2 !important;
            overflow-wrap: break-word !important;
          }

          .product-setup-card p {
            font-size: 0.68rem !important;
            line-height: 1.5 !important;
            overflow-wrap: break-word !important;
          }

          /* COMPARISON — fit entirely on screen, no horizontal scroll */
          .product-comparison-wrap {
            width: 100% !important;
            max-width: 100% !important;
            overflow: hidden !important;
          }

          .product-comparison-header,
          .product-comparison-row {
            width: 100% !important;
            min-width: 0 !important;
            max-width: 100% !important;
            grid-template-columns: minmax(0, 1.2fr) minmax(0, .68fr) minmax(0, .92fr) !important;
          }

          .product-comparison-header > div,
          .product-comparison-row > div {
            min-width: 0 !important;
            padding: 8px 5px !important;
            overflow: hidden !important;
          }

          .product-comparison-header strong {
            font-size: 0.49rem !important;
            line-height: 1.18 !important;
          }

          .product-comparison-header small,
          .product-comparison-header span {
            font-size: 0.40rem !important;
            line-height: 1.1 !important;
          }

          .product-comparison-row span {
            font-size: 0.47rem !important;
            line-height: 1.22 !important;
          }

          .product-comparison-row strong {
            font-size: 0.7rem !important;
          }
        }

        @media (max-width: 390px) {
          .product-detail-trust-strip .container {
            gap: 8px !important;
          }

          .product-setup-grid {
            gap: 8px !important;
          }

          .product-setup-card {
            padding: 14px 11px !important;
          }

          .product-setup-card h3 {
            font-size: 0.84rem !important;
          }

          .product-setup-card p {
            font-size: 0.63rem !important;
          }

          .product-comparison-header > div,
          .product-comparison-row > div {
            padding: 7px 4px !important;
          }

          .product-comparison-header strong {
            font-size: 0.45rem !important;
          }

          .product-comparison-row span {
            font-size: 0.43rem !important;
          }
        }


        /* =========================================================
           HOW IT WORKS — literal step-by-step progress timeline
           ========================================================= */

        .template-process-section {
          padding: 88px 0;
          background:
            radial-gradient(circle at top left, rgba(241, 214, 224, 0.34), transparent 28%),
            #fffafb;
        }

        .template-process-heading {
          max-width: 720px;
          margin: 0 auto 54px;
          text-align: center;
        }

        .template-process-heading h2 {
          margin: 10px 0 14px;
          color: var(--text);
          font-size: clamp(2rem, 4vw, 3.2rem);
          line-height: 1.08;
          letter-spacing: -0.04em;
        }

        .template-process-heading p {
          max-width: 610px;
          margin: 0 auto;
          color: var(--text-soft);
          font-size: 0.9rem;
          line-height: 1.75;
        }

        .template-progress {
          width: min(860px, 100%);
          margin: 0 auto;
        }

        .template-progress-step {
          display: grid;
          grid-template-columns: 74px minmax(0, 1fr);
          gap: 24px;
        }

        .template-progress-marker {
          position: relative;
          display: flex;
          min-height: 100%;
          flex-direction: column;
          align-items: center;
        }

        .template-progress-circle {
          position: relative;
          z-index: 3;
          display: grid;
          width: 54px;
          height: 54px;
          flex: 0 0 54px;
          place-items: center;
          border: 2px solid #d79cb1;
          border-radius: 999px;
          background: #fff;
          box-shadow: 0 8px 22px rgba(128, 76, 96, 0.1);
        }

        .template-progress-circle span {
          display: flex;
          width: 100%;
          height: 100%;
          align-items: center;
          justify-content: center;
          color: #995c72;
          font-size: 0.74rem;
          font-weight: 900;
          line-height: 1;
          text-align: center;
          letter-spacing: 0.03em;
        }

        .template-progress-line {
          width: 2px;
          min-height: 42px;
          flex: 1 1 auto;
          background: linear-gradient(
            to bottom,
            #d79cb1 0%,
            #e5becb 50%,
            #efdde3 100%
          );
        }

        .template-progress-content {
          padding: 4px 0 48px;
        }

        .template-progress-label {
          display: inline-block;
          margin-bottom: 7px;
          color: #ae6b83;
          font-size: 0.58rem;
          font-weight: 900;
          letter-spacing: 0.12em;
        }

        .template-progress-content h3 {
          margin: 0 0 8px;
          color: var(--text);
          font-size: 1.24rem;
          line-height: 1.28;
        }

        .template-progress-content > p {
          max-width: 670px;
          margin: 0;
          color: var(--text-soft);
          font-size: 0.82rem;
          line-height: 1.72;
        }

        .template-progress-note {
          display: grid;
          gap: 4px;
          max-width: 670px;
          margin-top: 14px;
          padding: 13px 15px;
          border: 1px solid #ecd7df;
          border-radius: 12px;
          background: #fff;
        }

        .template-progress-note strong {
          color: #94586e;
          font-size: 0.68rem;
        }

        .template-progress-note span {
          color: var(--text-soft);
          font-size: 0.7rem;
          line-height: 1.58;
        }

        .template-progress-summary {
          display: flex;
          width: min(860px, 100%);
          margin: 8px auto 0;
          padding: 20px;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;
          gap: 10px;
          border: 1px solid #ead9df;
          border-radius: 18px;
          background: #fff;
          box-shadow: 0 12px 35px rgba(118, 75, 90, 0.055);
        }

        .template-progress-summary-step {
          display: flex;
          align-items: center;
          gap: 7px;
        }

        .template-progress-summary-step span {
          display: flex;
          width: 30px;
          height: 30px;
          flex: 0 0 30px;
          align-items: center;
          justify-content: center;
          border-radius: 999px;
          background: #f2dbe3;
          color: #90576b;
          font-size: 0.62rem;
          font-weight: 900;
          line-height: 1;
          text-align: center;
        }

        .template-progress-summary-step strong {
          color: #745360;
          font-size: 0.66rem;
          white-space: nowrap;
        }

        .template-progress-summary > i {
          color: #c3899e;
          font-size: 0.72rem;
          font-style: normal;
          font-weight: 900;
        }

        /* =========================================================
           READY TO CHOOSE — readable white copy
           ========================================================= */

        .product-purchase-section .product-purchase-copy .section-kicker,
        .product-purchase-section .product-purchase-copy h2,
        .product-purchase-section .product-purchase-copy > p {
          color: #fff !important;
        }

        .product-purchase-section .product-purchase-copy .section-kicker {
          opacity: 0.86;
        }

        .product-purchase-section .product-purchase-copy > p {
          opacity: 0.92;
        }

        .product-purchase-section .simple-template-purchase-alert {
          border-color: rgba(255, 255, 255, 0.2) !important;
          background: rgba(255, 255, 255, 0.1) !important;
          backdrop-filter: blur(5px);
        }

        .product-purchase-section .simple-template-purchase-alert > strong,
        .product-purchase-section .simple-template-purchase-alert p,
        .product-purchase-section .simple-template-purchase-alert p strong {
          color: #fff !important;
        }

        .product-purchase-section .product-purchase-benefits span {
          color: #fff !important;
        }

        /* Purchase progress — centered numbers inside bubbles */
        .product-purchase-section .simple-template-compact-process {
          display: flex;
          align-items: flex-start;
          justify-content: flex-start;
          flex-wrap: wrap;
          gap: 10px;
          margin: 22px 0 18px;
          padding: 16px;
          border: 1px solid rgba(255, 255, 255, 0.22);
          border-radius: 16px;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(5px);
        }

        .product-purchase-section .simple-template-compact-process > div {
          display: flex;
          min-width: 62px;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 7px;
          text-align: center;
        }

        .product-purchase-section .simple-template-compact-process > div > span {
          display: flex;
          width: 34px;
          height: 34px;
          min-height: 34px;
          padding: 0;
          align-items: center;
          justify-content: center;
          border-radius: 999px;
          background: #fff;
          color: #9b5f75;
          font-size: 0.66rem;
          font-weight: 900;
          line-height: 1;
          text-align: center;
        }

        .product-purchase-section .simple-template-compact-process > div > strong {
          color: #fff;
          font-size: 0.6rem;
          font-weight: 800;
          line-height: 1.25;
        }

        .product-purchase-section .simple-template-compact-process > i {
          align-self: center;
          margin-top: 7px;
          color: rgba(255, 255, 255, 0.78);
          font-size: 0.7rem;
          font-style: normal;
          font-weight: 900;
        }

        @media (max-width: 760px) {
          .template-process-section {
            padding: 62px 0;
          }

          .template-process-heading {
            margin-bottom: 38px;
            text-align: left;
          }

          .template-process-heading h2 {
            font-size: 2rem;
          }

          .template-process-heading p {
            margin: 0;
          }

          .template-progress-step {
            grid-template-columns: 50px minmax(0, 1fr);
            gap: 15px;
          }

          .template-progress-circle {
            width: 42px;
            height: 42px;
            flex-basis: 42px;
          }

          .template-progress-circle span {
            font-size: 0.64rem;
          }

          .template-progress-content {
            padding-bottom: 38px;
          }

          .template-progress-content h3 {
            font-size: 1.06rem;
          }

          .template-progress-content > p {
            font-size: 0.76rem;
          }

          .template-progress-note {
            padding: 12px 13px;
          }

          .template-progress-summary {
            justify-content: flex-start;
            padding: 14px;
            gap: 8px;
          }

          .template-progress-summary-step {
            gap: 5px;
          }

          .template-progress-summary-step span {
            width: 27px;
            height: 27px;
            flex-basis: 27px;
            font-size: 0.56rem;
          }

          .template-progress-summary-step strong {
            font-size: 0.58rem;
          }

          .product-purchase-section .simple-template-compact-process {
            justify-content: center;
            gap: 8px;
            padding: 14px 10px;
          }

          .product-purchase-section .simple-template-compact-process > div {
            min-width: 54px;
          }

          .product-purchase-section .simple-template-compact-process > div > span {
            width: 32px;
            height: 32px;
            min-height: 32px;
          }

          .product-purchase-section .simple-template-compact-process > div > strong {
            font-size: 0.56rem;
          }

          .product-purchase-section .simple-template-compact-process > i {
            margin-top: 6px;
            font-size: 0.62rem;
          }
        }

        @media (max-width: 430px) {
          .template-progress-summary {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .template-progress-summary > i {
            display: none;
          }

          .template-progress-summary-step {
            min-height: 44px;
            padding: 7px 9px;
            border: 1px solid #f0e0e5;
            border-radius: 12px;
          }

          .product-purchase-section .simple-template-compact-process {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }

          .product-purchase-section .simple-template-compact-process > i {
            display: none;
          }

          .product-purchase-section .simple-template-compact-process > div {
            min-width: 0;
          }
        }


        /* =========================================================
           COLLAPSIBLE SIDE "ON THIS PAGE" NAVIGATION
           ========================================================= */

        html {
          scroll-behavior: smooth;
        }

        #overview,
        #choose-design,
        #included,
        #how-it-works,
        #compare,
        #before-purchasing,
        #purchase {
          scroll-margin-top: 110px;
        }

        .template-mobile-nav {
          display: none;
        }

        .template-side-nav {
          position: fixed;
          z-index: 90;
          top: 50%;
          left: 18px;
          right: auto;
          transform: translateY(-50%);
        }

        .template-side-nav > summary {
          display: flex;
          width: 46px;
          min-height: 116px;
          padding: 10px 7px;
          align-items: center;
          justify-content: center;
          gap: 7px;
          border: 1px solid rgba(219, 178, 192, 0.8);
          border-radius: 18px;
          background: rgba(255, 250, 252, 0.95);
          box-shadow: 0 12px 32px rgba(104, 64, 79, 0.14);
          color: #8e5a6e;
          cursor: pointer;
          list-style: none;
          writing-mode: vertical-rl;
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          transition:
            background 160ms ease,
            transform 160ms ease,
            box-shadow 160ms ease;
        }

        .template-side-nav > summary::-webkit-details-marker {
          display: none;
        }

        .template-side-nav > summary:hover {
          background: #fff;
          box-shadow: 0 14px 36px rgba(104, 64, 79, 0.18);
        }

        .template-side-nav-icon {
          display: inline-flex;
          width: 26px;
          height: 26px;
          align-items: center;
          justify-content: center;
          border-radius: 999px;
          background: #f3dfe6;
          color: #945b70;
          font-size: 0.72rem;
          font-weight: 900;
          line-height: 1;
          writing-mode: horizontal-tb;
        }

        .template-side-nav-summary-text {
          font-size: 0.6rem;
          font-weight: 900;
          letter-spacing: 0.05em;
          white-space: nowrap;
        }

        .template-side-nav-panel {
          position: absolute;
          top: 50%;
          left: 58px;
          right: auto;
          display: grid;
          width: 210px;
          max-height: min(480px, calc(100vh - 40px));
          padding: 12px;
          gap: 5px;
          overflow-y: auto;
          border: 1px solid rgba(219, 178, 192, 0.8);
          border-radius: 18px;
          background: rgba(255, 250, 252, 0.98);
          box-shadow: 0 18px 44px rgba(104, 64, 79, 0.17);
          transform: translateY(-50%);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
        }

        .template-side-nav-label {
          padding: 6px 9px 8px;
          color: #a36a7f;
          font-size: 0.54rem;
          font-weight: 900;
          letter-spacing: 0.12em;
        }

        .template-side-nav-panel a {
          display: flex;
          min-height: 38px;
          align-items: center;
          padding: 9px 11px;
          border: 1px solid transparent;
          border-radius: 11px;
          color: #765462;
          font-size: 0.68rem;
          font-weight: 800;
          line-height: 1.25;
          text-decoration: none;
          transition:
            background 150ms ease,
            color 150ms ease,
            border-color 150ms ease;
        }

        .template-side-nav-panel a:hover {
          border-color: #ead2da;
          background: #f8e9ee;
          color: #925c70;
        }

        .template-side-nav-panel a:focus-visible,
        .template-side-nav > summary:focus-visible {
          outline: 2px solid #c77f99;
          outline-offset: 2px;
        }

        /* Closed by default. Clicking the small side tab opens the menu.
           Clicking it again hides the menu, so it stays out of the way. */
        .template-side-nav:not([open]) .template-side-nav-panel {
          display: none;
        }

        .template-side-nav[open] > summary {
          background: #f8e8ee;
        }

        @media (max-width: 760px) {
          #overview,
          #choose-design,
          #included,
          #how-it-works,
          #compare,
          #before-purchasing,
          #purchase {
            scroll-margin-top: 138px;
          }

          /* Hide the collapsible desktop side navigation on phones. */
          .template-side-nav {
            display: none !important;
          }

          /*
           * Always-visible product navigation directly under the main SiteHeader.
           * Horizontal scrolling keeps every section available without wrapping.
           */
          .template-mobile-nav {
            position: relative;
            z-index: 35;
            display: flex;
            width: 100%;
            padding: 8px 12px 9px;
            align-items: center;
            gap: 7px;
            overflow-x: auto;
            overflow-y: hidden;
            border-bottom: 1px solid rgba(234, 217, 223, 0.92);
            background: rgba(255, 250, 252, 0.98);
            box-shadow: 0 5px 16px rgba(104, 64, 79, 0.045);
            scrollbar-width: none;
            -ms-overflow-style: none;
            overscroll-behavior-x: contain;
            -webkit-overflow-scrolling: touch;
            backdrop-filter: blur(14px);
            -webkit-backdrop-filter: blur(14px);
          }

          .template-mobile-nav::-webkit-scrollbar {
            display: none;
          }

          .template-mobile-nav a {
            display: inline-flex;
            min-height: 34px;
            flex: 0 0 auto;
            align-items: center;
            justify-content: center;
            padding: 8px 12px;
            border: 1px solid #ead4dc;
            border-radius: 999px;
            background: #ffffff;
            color: #765462;
            font-size: 0.59rem;
            font-weight: 800;
            line-height: 1;
            text-decoration: none;
            white-space: nowrap;
            box-shadow: 0 3px 10px rgba(99, 61, 76, 0.035);
          }

          .template-mobile-nav a:first-child {
            margin-left: 2px;
          }

          .template-mobile-nav a:last-child {
            margin-right: 2px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          html {
            scroll-behavior: auto;
          }
        }

      `}</style>

      <SiteFooter />
    </>
  );
}
