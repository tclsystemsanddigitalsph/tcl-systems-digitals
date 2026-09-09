import Link from "next/link";
import { notFound } from "next/navigation";
import { getCatalogProduct } from "@/lib/catalog";
import { formatPrice, productPrice, safeWebUrl } from "@/lib/products";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";

export const dynamic = "force-dynamic";

const features = [
  {
    number: "01",
    title: "4 Separate Pages",
    description:
      "A proper multi-page website with dedicated Home, About, Services, and Contact pages — not everything squeezed into one long page.",
  },
  {
    number: "02",
    title: "Customized Design",
    description:
      "Your website is styled around your business using your logo, colors, content, contact details, and overall brand direction.",
  },
  {
    number: "03",
    title: "Services Showcase",
    description:
      "Present what your business offers in a clean and organized way so visitors can quickly understand your services.",
  },
  {
    number: "04",
    title: "Contact & Inquiry",
    description:
      "Give potential customers an easy way to contact your business through a dedicated contact page and inquiry form.",
  },
  {
    number: "05",
    title: "Responsive Website",
    description:
      "Designed to look polished and easy to use across desktop, tablet, and mobile devices.",
  },
  {
    number: "06",
    title: "Built & Set Up by TCL",
    description:
      "This is not a DIY template. You provide your business details and TCL prepares the website for you.",
  },
];

const included = [
  "Home page",
  "About page",
  "Services page",
  "Contact page",
  "Business logo placement",
  "Customized colors & branding",
  "Business information setup",
  "Services or offers display",
  "Contact / inquiry form",
  "Phone, email & social media links",
  "Mobile, tablet & desktop responsive design",
  "Basic on-page SEO setup",
  "Website deployment setup",
  "Initial content placement",
  "Live website handover",
];

const idealFor = [
  "Small businesses",
  "Home-based businesses",
  "Freelancers",
  "Independent professionals",
  "Beauty businesses",
  "Creative businesses",
  "Local service providers",
  "New businesses building an online presence",
];

const setupItems = [
  {
    step: "01",
    title: "Purchase",
    text: "Choose the Simple Business Website and complete your order through the TCL Storefront.",
  },
  {
    step: "02",
    title: "Send Your Details",
    text: "Provide your logo, business information, services, contact details, social links, and preferred style.",
  },
  {
    step: "03",
    title: "TCL Builds It",
    text: "We customize the four-page website around the information and branding you provide.",
  },
  {
    step: "04",
    title: "Review & Launch",
    text: "Review your website, request included initial corrections, and once approved, your site is prepared for launch.",
  },
];

const notIncluded = [
  {
    title: "No admin dashboard",
    text: "This package is designed as a simple business website and does not include a private dashboard for editing content yourself.",
  },
  {
    title: "No online booking system",
    text: "Appointment scheduling, availability management, booking statuses, and booking dashboards are available under our Booking System products.",
  },
  {
    title: "No online shop",
    text: "Cart, checkout, customer accounts, inventory, and e-commerce features are separate products or custom upgrades.",
  },
  {
    title: "No advanced custom system",
    text: "Customer portals, memberships, automated workflows, databases, and specialized business tools require a custom quotation.",
  },
];

export default async function SimpleBusinessWebsitePage() {
  const product = await getCatalogProduct("simple-business-website");
  if (!product) notFound();

  const hasSale =
    product.sale_price !== null && product.sale_price < product.price;
  const basePrice = productPrice(product);
  const feePercent = product.processing_fee_percent ?? 0;
  const processingFee = Math.round(basePrice * feePercent) / 100;
  const demoUrl =
    safeWebUrl(product.demo_url) ||
    "https://tcl-simplebusinesswebsite.vercel.app/contact";
  const total = Math.round((basePrice + processingFee) * 100) / 100;

  const money = new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
  });

  return (
    <>
      <SiteHeader />

      <main className="product-detail-page">
        <section className="product-detail-hero">
          <div className="product-detail-glow product-detail-glow-one" />
          <div className="product-detail-glow product-detail-glow-two" />

          <nav
            className="container"
            aria-label="Back navigation"
            style={{
              display: "flex",
              justifyContent: "flex-end",
              position: "relative",
              zIndex: 1,
              marginBottom: 24,
            }}
          >
            <Link
              className="product-detail-back"
              href="/shop"
              style={{
                marginBottom: 0,
                minHeight: 44,
                display: "inline-flex",
                alignItems: "center",
              }}
            >
              ← Back to Shop
            </Link>
          </nav>

          <div className="container product-detail-hero-grid">
            <div className="product-detail-copy">
              <div className="product-detail-labels">
                <span className="product-detail-category">
                  {product.category}
                </span>

                <span className="product-detail-intro-label">
                  {product.badge || "STARTER WEBSITE"}
                </span>
              </div>

              <h1>{product.name}</h1>

              <p className="product-detail-lead">
                {product.short_description ||
                  "A clean, customized four-page website for businesses that need a professional online presence without complicated systems or unnecessary features."}
              </p>

              <div className="product-detail-price-row">
                <div className="product-detail-price">
                  <small>{hasSale ? "Sale price" : "Starting price"}</small>

                  {hasSale && (
                    <span
                      style={{
                        display: "block",
                        margin: "6px 0",
                        fontSize: 16,
                        color: "var(--text-soft)",
                      }}
                    >
                      Regular price: <del>{formatPrice(product.price)}</del>
                    </span>
                  )}

                  <strong>{formatPrice(productPrice(product))}</strong>
                </div>

                <div className="product-detail-price-note">
                  <strong>One-time website service</strong>
                  <span>No monthly TCL website fee</span>
                </div>
              </div>

              <div className="product-detail-actions">
                <a className="button button-primary" href="#purchase">
                  Get Your Own Website Now
                  <span>→</span>
                </a>

                <a className="button button-secondary" href="#live-demo">
                  View Live Demo
                </a>
              </div>

              <div className="product-detail-mini-notes">
                <span>
                  <i>✓</i>
                  4 separate pages
                </span>

                <span>
                  <i>✓</i>
                  Mobile-friendly
                </span>

                <span>
                  <i>✓</i>
                  Customized for you
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

                  <small>yourbusiness.com</small>
                </div>

                <div className="product-detail-browser-body">
                  <div className="product-detail-demo-nav">
                    <div className="product-detail-demo-logo">
                      YOUR
                      <span>BUSINESS</span>
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
                      A website that feels
                      <span>like your brand.</span>
                    </strong>

                    <p>
                      A clean online home for your business, services, and contact
                      information.
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
                <div className="product-detail-admin-icon">✓</div>

                <div>
                  <small>DONE FOR YOU</small>
                  <strong>TCL handles the setup</strong>
                  <span>Content • Branding • Pages</span>
                </div>
              </div>

              <div className="product-detail-edit-card">
                <span>✦</span>

                <div>
                  <small>START SIMPLE</small>
                  <strong>Professional online presence</strong>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="product-detail-trust-strip">
          <div className="container">
            <div>
              <strong>4 pages</strong>
              <span>separate & organized</span>
            </div>

            <i />

            <div>
              <strong>Customized</strong>
              <span>for your business</span>
            </div>

            <i />

            <div>
              <strong>Responsive</strong>
              <span>desktop to mobile</span>
            </div>

            <i />

            <div>
              <strong>One-time</strong>
              <span>TCL website fee</span>
            </div>
          </div>
        </section>

        <section className="section section-white">
          <div className="container">
            <div className="section-heading centered-heading">
              <span className="section-kicker">
                A simple website that does its job
              </span>

              <h2>Your business deserves more than just a social media page.</h2>

              <p>
                Give customers one professional place to learn about your
                business, browse what you offer, and know exactly how to contact
                you.
              </p>
            </div>

            <div className="product-feature-grid">
              {features.map((feature) => (
                <article
                  className="product-feature-card"
                  key={feature.number}
                >
                  <span>{feature.number}</span>
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section product-included-section">
          <div className="container product-included-grid">
            <div className="product-included-copy">
              <span className="section-kicker">What&apos;s included</span>

              <h2>Everything needed for a clean business website.</h2>

              <p>
                The Simple Business Website is made for businesses that want a
                polished online presence without paying for features they do not
                need yet.
              </p>

              <div className="product-included-note">
                <span>♡</span>

                <div>
                  <strong>Simple does not mean generic.</strong>
                  <p>
                    Your website is customized using your own business identity,
                    information, services, contact details, and preferred visual
                    direction.
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

        <section
          className="section section-white product-demo-section"
          id="live-demo"
        >
          <div className="container product-demo-grid">
            <div className="product-demo-preview">
              <div className="product-detail-browser">
                <div className="product-detail-browser-top">
                  <div>
                    <span />
                    <span />
                    <span />
                  </div>
                  <small>simplebusiness.demo</small>
                </div>

                <div className="product-detail-browser-body">
                  <div className="product-detail-demo-nav">
                    <div className="product-detail-demo-logo">
                      DEMO
                      <span>BUSINESS</span>
                    </div>

                    <div>
                      <span />
                      <span />
                      <span />
                    </div>
                  </div>

                  <div className="product-detail-demo-hero">
                    <small>SIMPLE • CLEAN • PROFESSIONAL</small>

                    <strong>
                      Your business,
                      <span>online.</span>
                    </strong>

                    <p>
                      See how a simple four-page business website can look and
                      feel before ordering yours.
                    </p>

                    <div className="product-detail-demo-button">
                      Contact Us
                    </div>
                  </div>

                  <div className="product-detail-demo-services">
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
              </div>
            </div>

            <div className="product-demo-copy">
              <span className="section-kicker">See it before you order</span>

              <h2>Explore the live demo yourself.</h2>

              <p>
                Open the actual demo website and browse the separate pages to see
                the type of structure and experience included in this starter
                website service.
              </p>

              <div className="product-demo-points">
                <div>
                  <span>✓</span>
                  Browse the separate website pages
                </div>

                <div>
                  <span>✓</span>
                  See the customer-facing design
                </div>

                <div>
                  <span>✓</span>
                  Test it on mobile or desktop
                </div>

                <div>
                  <span>✓</span>
                  Try the contact page and layout
                </div>
              </div>

              <a
                className="button button-primary"
                href={demoUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Open Live Demo <span>↗</span>
              </a>

              <small className="product-demo-disclaimer">
                The demo is an example of the website structure and experience.
                Your final website will use your own business information and
                branding.
              </small>
            </div>
          </div>
        </section>

        <section className="section product-audience-section">
          <div className="container">
            <div className="section-heading centered-heading narrow-heading">
              <span className="section-kicker">Is this for you?</span>

              <h2>Made for businesses that simply need to get online.</h2>

              <p>
                If you mainly need a professional place to introduce your
                business, explain your services, and give customers a way to
                contact you, this package is a good starting point.
              </p>
            </div>

            <div className="product-audience-grid">
              {idealFor.map((item) => (
                <div className="product-audience-item" key={item}>
                  <span>♡</span>
                  <strong>{item}</strong>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section section-white product-setup-section">
          <div className="container">
            <div className="section-heading centered-heading">
              <span className="section-kicker">How it works</span>

              <h2>From order to your own business website.</h2>

              <p>
                This is a customized service. You send your business information
                and TCL prepares the website for you.
              </p>
            </div>

            <div className="product-setup-grid">
              {setupItems.map((item) => (
                <article className="product-setup-card" key={item.step}>
                  <span className="product-setup-number">{item.step}</span>

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
              <span className="section-kicker">Keep it simple</span>

              <h2>What this starter website does not include.</h2>

              <p>
                The ₱1,999 package is intentionally focused on a professional
                business website. More advanced functionality can be added
                through another TCL product or a custom quotation.
              </p>
            </div>

            <div className="product-note-cards">
              {notIncluded.map((item, index) => (
                <article key={item.title}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <div>
                    <strong>{item.title}</strong>
                    <p>{item.text}</p>
                  </div>
                </article>
              ))}
            </div>

            <div className="product-comparison-cta">
              <div>
                <span>Looking for something else?</span>
                <strong>
                  Explore our other websites, systems, and digital products.
                </strong>
              </div>

              <Link className="button button-secondary" href="/shop">
                Browse Other Products
                <span>→</span>
              </Link>
            </div>
          </div>
        </section>

        <section className="section section-white product-notes-section">
          <div className="container product-notes-grid">
            <div>
              <span className="section-kicker">Before purchasing</span>

              <h2>A few important things to know.</h2>

              <p>
                We want you to know exactly what the starter package covers
                before checkout.
              </p>
            </div>

            <div className="product-note-cards">
              <article>
                <span>01</span>
                <div>
                  <strong>Starting price</strong>
                  <p>
                    ₱1,999 covers the standard four-page Simple Business Website.
                    Additional pages, functions, integrations, or custom requests
                    may require an additional fee.
                  </p>
                </div>
              </article>

              <article>
                <span>02</span>
                <div>
                  <strong>You provide the content</strong>
                  <p>
                    You&apos;ll be asked to provide your logo, business details,
                    service information, contact details, social links, and other
                    content needed for your website.
                  </p>
                </div>
              </article>

              <article>
                <span>03</span>
                <div>
                  <strong>Third-party services</strong>
                  <p>
                    TCL does not charge a monthly website fee for this package,
                    but custom domains or third-party services may have their own
                    separate costs or limits.
                  </p>
                </div>
              </article>

              <article>
                <span>04</span>
                <div>
                  <strong>Future changes & upgrades</strong>
                  <p>
                    New pages, redesigns, advanced features, booking functions,
                    e-commerce, or other work requested after handover may be
                    quoted separately.
                  </p>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section className="product-purchase-section" id="purchase">
          <div className="container product-purchase-grid">
            <div className="product-purchase-copy">
              <span className="section-kicker">Start your online presence</span>

              <h2>Ready to give your business its own website?</h2>

              <p>
                Get a clean, customized four-page website that gives customers a
                professional place to learn about your business and contact you.
              </p>

              <div className="product-purchase-benefits">
                <span>✓ 4 separate website pages</span>
                <span>✓ Customized for your business</span>
                <span>✓ Responsive on desktop & mobile</span>
                <span>✓ TCL handles the initial build</span>
              </div>
            </div>

            <div className="product-checkout-card">
              <div className="product-checkout-heading">
                <div>
                  <small>{product.name}</small>
                  <strong>Order Summary</strong>
                </div>

                <span>♡</span>
              </div>

              <div className="product-checkout-lines">
                <div>
                  <span>{hasSale ? "Sale price" : "Website price"}</span>
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

                <div>
                  <strong>{money.format(total)}</strong>
                  <small>PHP</small>
                </div>
              </div>

              <Link
                className="button button-primary product-buy-button"
                href={`/checkout?product=${encodeURIComponent(product.slug)}`}
              >
                Get Yours Now
                <span>→</span>
              </Link>

              <div className="product-secure-note">
                <span>✓</span>

                <p id="payment-setup-note">
                  Online checkout is available with PayPal and PayMongo.
                </p>
              </div>

              <small className="product-checkout-fine-print">
                By purchasing, you&apos;ll be asked to agree to the applicable
                service terms, website scope, and digital-service policy.
              </small>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
