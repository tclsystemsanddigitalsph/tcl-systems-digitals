import Link from "next/link";
import { notFound } from "next/navigation";
import { getCatalogProduct } from "@/lib/catalog";
import { formatPrice, productPrice, safeWebUrl } from "@/lib/products";
export const dynamic = "force-dynamic";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";

const features = [
  {
    number: "01",
    title: "Online Booking",
    description:
      "Give clients a clean, professional way to choose a service, date, and available appointment time.",
  },
  {
    number: "02",
    title: "Admin Dashboard",
    description:
      "Manage your booking system from a private dashboard without editing the website code.",
  },
  {
    number: "03",
    title: "Services & Pricing",
    description:
      "Add, edit, remove, and organize the services you offer, including pricing and service details.",
  },
  {
    number: "04",
    title: "Availability Management",
    description:
      "Set your regular schedule and control when clients can actually book appointments.",
  },
  {
    number: "05",
    title: "Booking Management",
    description:
      "Review appointments and update booking statuses as Pending, Confirmed, Canceled, or Completed.",
  },
  {
    number: "06",
    title: "Business Customization",
    description:
      "Update your business information, homepage content, booking policy, confirmation messages, and website colors.",
  },
];

const included = [
  "Responsive booking website",
  "Private admin dashboard",
  "Service management",
  "Service variations & add-ons",
  "Weekly availability settings",
  "Blocked dates & times",
  "Booking management",
  "Booking status controls",
  "Business information settings",
  "Editable homepage content",
  "About & contact settings",
  "Booking policy editor",
  "Booking confirmation settings",
  "Website color customization",
  "Gallery management",
  "Hero image management",
  "Booking notifications",
  "First-time setup wizard",
  "Factory reset tools",
  "Setup documentation",
];

const idealFor = [
  "Solo nail technicians",
  "Lash & brow artists",
  "Hair stylists",
  "Makeup artists",
  "Tattoo artists",
  "Beauty professionals",
  "Freelancers",
  "Appointment-based service providers",
];

const setupItems = [
  {
    step: "01",
    title: "Purchase",
    text: "Complete your purchase securely and receive your access instructions.",
  },
  {
    step: "02",
    title: "Set Up",
    text: "Follow the included guide to create and connect the required accounts for your booking system.",
  },
  {
    step: "03",
    title: "Customize",
    text: "Use the setup wizard and Admin dashboard to add your own business information, services, schedule, policies, images, and colors.",
  },
  {
    step: "04",
    title: "Launch",
    text: "Once everything looks right, your own booking website is ready to share with clients.",
  },
];

const comparison = [
  {
    feature: "Complete booking website",
    editable: true,
    custom: true,
  },
  {
    feature: "Admin dashboard",
    editable: true,
    custom: true,
  },
  {
    feature: "Manage services & availability",
    editable: true,
    custom: true,
  },
  {
    feature: "Change business content without coding",
    editable: true,
    custom: true,
  },
  {
    feature: "Choose your own colors & images",
    editable: true,
    custom: true,
  },
  {
    feature: "You complete the initial setup",
    editable: true,
    custom: false,
  },
  {
    feature: "TCL sets everything up for you",
    editable: false,
    custom: true,
  },
  {
    feature: "Customized features & workflow",
    editable: false,
    custom: true,
  },
  {
    feature: "Customized design around your brand",
    editable: false,
    custom: true,
  },
];

export default async function EditableBookingSystemPage() {
  const product = await getCatalogProduct("editable-booking-system");
  if (!product) notFound();
  const hasSale = product.sale_price !== null && product.sale_price < product.price;
  const basePrice = productPrice(product);
  const feePercent = product.processing_fee_percent ?? 0;
  const processingFee = Math.round(basePrice * feePercent) / 100;
  const demoUrl = safeWebUrl(product.demo_url);
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

          <nav className="container" aria-label="Back navigation" style={{ display: "flex", justifyContent: "flex-end", position: "relative", zIndex: 1, marginBottom: 24 }}>
            <Link className="product-detail-back" href="/shop" style={{ marginBottom: 0, minHeight: 44, display: "inline-flex", alignItems: "center" }}>← Back to Shop</Link>
          </nav>
          <div className="container product-detail-hero-grid">
            <div className="product-detail-copy">

              <div className="product-detail-labels">
                <span className="product-detail-category">
                  {product.category}
                </span>

                <span className="product-detail-intro-label">
                  {product.badge || product.category}
                </span>
              </div>

              <h1>
                {product.name}
              </h1>

              <p className="product-detail-lead">
                {product.short_description}
              </p>

              <div className="product-detail-price-row">
                <div className="product-detail-price">
                  <small>{hasSale ? "Sale price" : "Price"}</small>
                  {hasSale && (
                    <span style={{ display: "block", margin: "6px 0", fontSize: 16, color: "var(--text-soft)" }}>
                      Regular price: <del>{formatPrice(product.price)}</del>
                    </span>
                  )}
                  <strong>{formatPrice(productPrice(product))}</strong>
                </div>

                <div className="product-detail-price-note">
                  <strong>One-time purchase</strong>
                  <span>No monthly TCL template fee</span>
                </div>
              </div>

              <div className="product-detail-actions">
                <a
                  className="button button-primary"
                  href="#purchase"
                >
                  Buy Now
                  <span>→</span>
                </a>

                <a
                  className="button button-secondary"
                  href="#live-demo"
                >
                  View Live Demo
                </a>
              </div>

              <div className="product-detail-mini-notes">
                <span>
                  <i>✓</i>
                  Editable
                </span>

                <span>
                  <i>✓</i>
                  Mobile-friendly
                </span>

                <span>
                  <i>✓</i>
                  Admin dashboard
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
                    <small>BOOK YOUR APPOINTMENT</small>

                    <strong>
                      Booking made
                      <span>simple.</span>
                    </strong>

                    <p>
                      A polished booking experience made for your business.
                    </p>

                    <div className="product-detail-demo-button">
                      Book Appointment
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
                  <small>YOUR ADMIN</small>
                  <strong>Manage it yourself</strong>
                  <span>Services • Schedule • Bookings</span>
                </div>
              </div>

              <div className="product-detail-edit-card">
                <span>✦</span>

                <div>
                  <small>MAKE IT YOURS</small>
                  <strong>Editable from Admin</strong>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="product-detail-trust-strip">
          <div className="container">
            <div>
              <strong>One-time</strong>
              <span>purchase</span>
            </div>

            <i />

            <div>
              <strong>No coding</strong>
              <span>for normal edits</span>
            </div>

            <i />

            <div>
              <strong>Responsive</strong>
              <span>desktop to mobile</span>
            </div>

            <i />

            <div>
              <strong>Your business</strong>
              <span>your branding</span>
            </div>
          </div>
        </section>

        <section className="section section-white">
          <div className="container">
            <div className="section-heading centered-heading">
              <span className="section-kicker">
                More than a booking form
              </span>

              <h2>A complete system you can actually manage.</h2>

              <p>
                Built for small business owners who want a professional booking
                experience without needing to manually edit their website every
                time something changes.
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
              <span className="section-kicker">
                What&apos;s included
              </span>

              <h2>Everything you need to start taking bookings.</h2>

              <p>
                The Editable Booking System comes with the core tools needed to
                run an appointment-based business online, while keeping normal
                updates manageable from your Admin dashboard.
              </p>

              <div className="product-included-note">
                <span>♡</span>

                <div>
                  <strong>Made to be edited by you.</strong>
                  <p>
                    Change your services, schedule, business details, policies,
                    colors, gallery, and more without going back into the
                    source code for everyday updates.
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
              <div className="product-demo-dashboard">
                <div className="product-demo-sidebar">
                  <strong>TCL</strong>

                  <div className="active">
                    <span />
                    Dashboard
                  </div>

                  <div>
                    <span />
                    Bookings
                  </div>

                  <div>
                    <span />
                    Services
                  </div>

                  <div>
                    <span />
                    Availability
                  </div>

                  <div>
                    <span />
                    Gallery
                  </div>

                  <div>
                    <span />
                    Settings
                  </div>
                </div>

                <div className="product-demo-dashboard-main">
                  <small>ADMIN DASHBOARD</small>
                  <strong>Good morning ♡</strong>

                  <div className="product-demo-stats">
                    <div>
                      <small>Bookings</small>
                      <strong>12</strong>
                    </div>

                    <div>
                      <small>Pending</small>
                      <strong>04</strong>
                    </div>

                    <div>
                      <small>Confirmed</small>
                      <strong>08</strong>
                    </div>
                  </div>

                  <div className="product-demo-table">
                    <span />
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
              </div>
            </div>

            <div className="product-demo-copy">
              <span className="section-kicker">
                Try before you buy
              </span>

              <h2>Explore the live demo yourself.</h2>

              <p>
                You don&apos;t have to rely only on screenshots. Explore the
                actual booking website and take a look around the demo Admin
                dashboard to understand how the system works.
              </p>

              <div className="product-demo-points">
                <div>
                  <span>✓</span>
                  Explore the customer booking experience
                </div>

                <div>
                  <span>✓</span>
                  Look around the Admin dashboard
                </div>

                <div>
                  <span>✓</span>
                  See how services and schedules are managed
                </div>

                <div>
                  <span>✓</span>
                  Test the responsive website
                </div>
              </div>

              {demoUrl ? (
                <a className="button button-primary" href={demoUrl}
                  target="_blank" rel="noopener noreferrer">
                  Open Live Demo <span>↗</span>
                </a>
              ) : <p>The live demo will be available soon.</p>}

              <small className="product-demo-disclaimer">
                The public demo may be read-only in areas that could modify
                system data.
              </small>
            </div>
          </div>
        </section>

        <section className="section product-audience-section">
          <div className="container">
            <div className="section-heading centered-heading narrow-heading">
              <span className="section-kicker">
                Is this for you?
              </span>

              <h2>Made for solo artists &amp; service providers.</h2>

              <p>
                If your clients need to choose a service and appointment time,
                this system can give your business a more organized way to
                handle bookings.
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
              <span className="section-kicker">
                How it works
              </span>

              <h2>From purchase to your own booking site.</h2>

              <p>
                This is the editable DIY option. You&apos;ll receive the system
                and instructions, then customize it for your own business.
              </p>
            </div>

            <div className="product-setup-grid">
              {setupItems.map((item) => (
                <article
                  className="product-setup-card"
                  key={item.step}
                >
                  <span className="product-setup-number">
                    {item.step}
                  </span>

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
              <span className="section-kicker">
                Choose what works for you
              </span>

              <h2>Editable DIY or customized for you?</h2>

              <p>
                The Editable Booking System is the lower-cost option for
                business owners comfortable following setup instructions. If
                you&apos;d rather have TCL customize and prepare your system,
                the customized service is available separately.
              </p>
            </div>

            <div className="product-comparison-table">
              <div className="product-comparison-header">
                <div>Feature</div>

                <div>
                  <small>DIY OPTION</small>
                  <strong>Editable System</strong>
                </div>

                <div>
                  <small>SERVICE</small>
                  <strong>Customized</strong>
                </div>
              </div>

              {comparison.map((item) => (
                <div
                  className="product-comparison-row"
                  key={item.feature}
                >
                  <div>{item.feature}</div>

                  <div>
                    <span
                      className={
                        item.editable
                          ? "comparison-yes"
                          : "comparison-no"
                      }
                    >
                      {item.editable ? "✓" : "—"}
                    </span>
                  </div>

                  <div>
                    <span
                      className={
                        item.custom
                          ? "comparison-yes"
                          : "comparison-no"
                      }
                    >
                      {item.custom ? "✓" : "—"}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="product-comparison-cta">
              <div>
                <span>Want TCL to do the setup?</span>
                <strong>
                  Ask about the customized Basic Tier.
                </strong>
              </div>

              <a
                className="button button-secondary"
                href="https://t.me/tclsystemsanddigitalsph"
                target="_blank"
                rel="noreferrer"
              >
                Ask About Customization
                <span>→</span>
              </a>
            </div>
          </div>
        </section>

        <section className="section section-white product-notes-section">
          <div className="container product-notes-grid">
            <div>
              <span className="section-kicker">
                Before purchasing
              </span>

              <h2>A few important things to know.</h2>

              <p>
                We want you to know exactly what you&apos;re purchasing before
                checkout.
              </p>
            </div>

            <div className="product-note-cards">
              <article>
                <span>01</span>
                <div>
                  <strong>Digital product</strong>
                  <p>
                    This is a digital booking system. No physical product will
                    be shipped.
                  </p>
                </div>
              </article>

              <article>
                <span>02</span>
                <div>
                  <strong>Some setup is required</strong>
                  <p>
                    The editable version is a DIY product. You&apos;ll need to
                    follow the included setup instructions and create the
                    required third-party accounts.
                  </p>
                </div>
              </article>

              <article>
                <span>03</span>
                <div>
                  <strong>Third-party services</strong>
                  <p>
                    While TCL does not charge a monthly template fee, hosting,
                    databases, email, domains, or other third-party services
                    may have their own limits or charges.
                  </p>
                </div>
              </article>

              <article>
                <span>04</span>
                <div>
                  <strong>Extra customization</strong>
                  <p>
                    Features or changes outside the included editable system
                    may require a separate customization fee.
                  </p>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section
          className="product-purchase-section"
          id="purchase"
        >
          <div className="container product-purchase-grid">
            <div className="product-purchase-copy">
              <span className="section-kicker">
                Limited intro price
              </span>

              <h2>Ready to make booking easier?</h2>

              <p>
                Get the Editable Booking System and turn your appointment
                process into a cleaner, more professional experience for both
                you and your clients.
              </p>

              <div className="product-purchase-benefits">
                <span>✓ One-time TCL product purchase</span> 
                <span>✓ Admin dashboard included</span>
                <span>✓ Setup instructions included</span>
                <span>✓ Customize it for your business</span>
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
                  <span>{hasSale ? "Sale price" : "Product price"}</span>
                  <strong>
                    {hasSale && <del style={{ display: "block", fontSize: 14, fontWeight: 400, color: "var(--text-soft)", marginBottom: 4 }} aria-label={`Regular price ${money.format(product.price)}`}>{money.format(product.price)}</del>}
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
                Buy Now
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
                product terms and digital-product policy.
              </small>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}