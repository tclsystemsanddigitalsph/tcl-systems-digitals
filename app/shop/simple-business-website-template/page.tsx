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
    title: "Choose a design",
    text: "Open the live demos and choose the ready-made website design you like best.",
  },
  {
    number: "02",
    title: "Complete your order",
    text: "Select your chosen design and continue to checkout.",
  },
  {
    number: "03",
    title: "Add your business details",
    text: "Replace the available demo information with your own business content.",
  },
  {
    number: "04",
    title: "Launch your website",
    text: "Once your information is ready, publish and start sharing your website.",
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

      <main className="product-detail-page simple-business-template-page">
        <section className="product-detail-hero simple-template-hero">
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
              <strong>₱1,499</strong>
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

        <section className="section product-included-section">
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

        <section className="section section-white">
          <div className="container">
            <div className="section-heading centered-heading">
              <span className="section-kicker">How it works</span>
              <h2>Choose it, edit it, launch it.</h2>
              <p>
                This is the lower-cost DIY option for business owners who are
                comfortable working within a ready-made website design.
              </p>
            </div>

            <div className="product-setup-grid">
              {steps.map((item) => (
                <article className="product-setup-card" key={item.number}>
                  <span className="product-setup-number">{item.number}</span>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section product-comparison-section">
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
                  <strong>₱1,499 Template</strong>
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

        <section className="section section-white product-notes-section">
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

              <div className="product-purchase-benefits">
                <span>✓ One-time TCL template purchase</span>
                <span>✓ 6 live designs to choose from</span>
                <span>✓ Up to 4 simple website pages</span>
                <span>✓ Lifetime access to your website template</span>
              </div>

              <a className="button button-primary" href="#choose-design">
                Choose Your Design
              </a>
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
        }
      `}</style>

      <SiteFooter />
    </>
  );
}
