import Link from "next/link";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import ReviewsSliderClient from "@/components/ReviewsSliderClient";
import BackToTop from "@/components/BackToTop";
import "./home-redesign.css";

const websiteSolutions = [
  [
    "STARTER",
    "Starter Website",
    "₱999",
    "A clean one-page website for a simple, professional online presence.",
    "/shop",
    "Simple Start",
  ],
  [
    "BUSINESS",
    "Simple Business Website",
    "₱2,999",
    "A polished 4-page website for your brand, services, story, and contact details.",
    "/shop",
    "Popular",
  ],
  [
    "E-COMMERCE",
    "Basic Online Shop",
    "₱5,999",
    "A straightforward product storefront with cart and basic order checkout.",
    "/shop",
    "Sell Online",
  ],
  [
    "CUSTOM DEVELOPMENT",
    "Custom Business Website",
    "Custom Quote",
    "For dashboards, accounts, automation, integrations, and advanced functionality.",
    "/shop/custom-business-website",
    "Made For You",
  ],
] as const;

const stack = [
  "Next.js",
  "React",
  "TypeScript",
  "JavaScript",
  "HTML",
  "CSS",
  "Supabase",
  "PostgreSQL",
  "Vercel",
  "GitHub",
  "PayPal",
  "PayMongo",
  "Resend",
];

const solutionAreas = [
  [
    "01",
    "Business Websites",
    "Professional websites built to give businesses a stronger and more credible online presence.",
  ],
  [
    "02",
    "Booking Systems",
    "Booking experiences with services, schedules, availability, and management tools.",
  ],
  [
    "03",
    "Online Shops",
    "From simple product storefronts to more advanced custom e-commerce workflows.",
  ],
  [
    "04",
    "Custom Web Systems",
    "Dashboards, portals, management tools, reviewers, and purpose-built web applications.",
  ],
] as const;

export default async function Home() {
  const { createAdminSupabaseClient } = await import(
    "@/lib/supabase-admin"
  );

  const supabase = createAdminSupabaseClient();

  const { data: approvedReviews, error: reviewsError } = await supabase
    .from("reviews")
    .select(
      "id,customer_name,business_name,product_name,rating,review_text,is_featured,display_order,created_at"
    )
    .eq("status", "APPROVED")
    .order("is_featured", { ascending: false })
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (reviewsError) {
    console.error("Homepage reviews load error:", reviewsError);
  }

  const reviews = approvedReviews ?? [];

  return (
    <>
      <SiteHeader />

      <main>
        {/* =====================================================
            HERO
        ===================================================== */}

        <section className="hero">
          <div className="hero-decoration hero-decoration-one" />
          <div className="hero-decoration hero-decoration-two" />

          <div className="container hero-grid">
            <div className="hero-copy">
              <div className="eyebrow">
                <span className="eyebrow-dot" />
                Custom-coded digital solutions
              </div>

              <h1>
                Built for your business.
                <span>Not from a template.</span>
              </h1>

              <p className="hero-description">
                Websites, business systems, e-commerce, booking solutions, and
                custom web applications designed and developed around how your
                business actually works.
              </p>

              <div className="hero-actions">
                <Link className="button button-primary" href="/shop">
                  Explore Solutions
                  <span>→</span>
                </Link>

                <Link
                  className="button button-secondary"
                  href="/shop/custom-business-website"
                >
                  Request a Quote
                </Link>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  alignItems: "stretch",
                  width: "100%",
                  maxWidth: "540px",
                  margin: "20px auto 0",
                  paddingTop: "16px",
                  borderTop: "1px solid #eadde2",
                }}
              >
                {[
                  ["100%", "custom coded"],
                  ["1:1", "business-focused"],
                  ["Web-based", "modern solutions"],
                ].map(([value, label], index) => (
                  <div
                    key={value}
                    style={{
                      position: "relative",
                      display: "grid",
                      gridTemplateRows: "auto auto",
                      alignContent: "start",
                      justifyItems: "center",
                      boxSizing: "border-box",
                      minWidth: 0,
                      padding: "0 8px",
                    }}
                  >
                    {index > 0 && (
                      <span
                        aria-hidden="true"
                        style={{
                          position: "absolute",
                          top: 0,
                          bottom: 0,
                          left: 0,
                          width: "1px",
                          background: "#eadde2",
                        }}
                      />
                    )}

                    <strong
                      style={{
                        display: "block",
                        width: "100%",
                        margin: 0,
                        padding: 0,
                        color: "#3b2d32",
                        fontSize: "12px",
                        fontWeight: 800,
                        lineHeight: "16px",
                        textAlign: "center",
                      }}
                    >
                      {value}
                    </strong>

                    <span
                      style={{
                        display: "block",
                        width: "100%",
                        margin: "4px 0 0",
                        padding: 0,
                        color: "#88767d",
                        fontSize: "9px",
                        fontWeight: 500,
                        lineHeight: "13px",
                        textAlign: "center",
                      }}
                    >
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            ABOUT TCL
        ===================================================== */}

        <section className="section tcl-intro-section">
          <div className="container tcl-intro-grid">
            <div className="tcl-intro-copy">
              <span className="section-kicker">About TCL</span>

              <h2>Built around your business, not a template.</h2>

              <p className="tcl-intro-lead">
                TCL Systems &amp; Digitals PH creates custom-coded websites,
                business systems, and digital solutions for businesses that
                need more than a generic online presence.
              </p>

              <p>
                Every project starts with what the business needs, how the
                customer should experience it, and what should happen behind
                the scenes.
              </p>

              <Link className="text-link" href="/about">
                About TCL &amp; the Developer
                <span>→</span>
              </Link>
            </div>

            <div className="developer-stat-panel">
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                  alignItems: "stretch",
                  width: "100%",
                }}
              >
                {[
                  ["2026", "Established"],
                  ["100%", "Custom Coded"],
                  ["1:1", "Built for Your Business"],
                ].map(([value, label], index) => (
                  <div
                    key={value}
                    style={{
                      position: "relative",
                      display: "grid",
                      gridTemplateRows: "auto auto",
                      alignContent: "start",
                      justifyItems: "center",
                      boxSizing: "border-box",
                      width: "100%",
                      minWidth: 0,
                      padding: "12px 6px",
                      textAlign: "center",
                    }}
                  >
                    {index > 0 && (
                      <span
                        aria-hidden="true"
                        style={{
                          position: "absolute",
                          top: "8px",
                          bottom: "8px",
                          left: 0,
                          width: "1px",
                          background: "rgba(255,255,255,.16)",
                        }}
                      />
                    )}

                    <strong
                      style={{
                        display: "block",
                        width: "100%",
                        margin: 0,
                        padding: 0,
                        textAlign: "center",
                      }}
                    >
                      {value}
                    </strong>

                    <span
                      style={{
                        display: "block",
                        width: "100%",
                        margin: "5px 0 0",
                        padding: 0,
                        textAlign: "center",
                        fontSize: "9px",
                        lineHeight: "1.2",
                        fontWeight: 500,
                        color: "#9a8f93",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {label}
                    </span>
                  </div>
                ))}
              </div>

              <div className="developer-stack">
                <small>TOOLS &amp; TECHNOLOGIES</small>

                <div className="developer-stack-list">
                  {stack.map((item) => (
                    <span key={item}>{item}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            WEBSITE PACKAGES
        ===================================================== */}

        <section className="section section-white" id="websites">
          <div className="container">
            <div className="section-heading section-heading-row">
              <div>
                <span className="section-kicker">Website solutions</span>

                <h2>
                  Start simple. Build up when your business needs more.
                </h2>

                <p>
                  Choose a straightforward website package or request a custom
                  build for advanced functionality.
                </p>
              </div>

              <Link className="text-link" href="/shop">
                View Shop
                <span>→</span>
              </Link>
            </div>

            <div
              className="website-solution-grid"
              style={{
                display: "grid",
                gap: "12px",
                width: "100%",
              }}
            >
              {websiteSolutions.map(
                ([eyebrow, title, price, description, href, tag]) => (
                  <article
                    className="website-solution-card"
                    key={title}
                    style={{
                      boxSizing: "border-box",
                      width: "100%",
                      minWidth: 0,
                      display: "flex",
                      flexDirection: "column",
                      height: "100%",
                    }}
                  >
                    <div className="website-solution-top">
                      <span className="website-solution-eyebrow">
                        {eyebrow}
                      </span>

                      <span
                        className="website-solution-tag"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          width: "max-content",
                          minWidth: "max-content",
                          maxWidth: "none",
                          whiteSpace: "nowrap",
                          wordBreak: "normal",
                          overflowWrap: "normal",
                          paddingLeft: "10px",
                          paddingRight: "10px",
                        }}
                      >
                        {tag}
                      </span>
                    </div>

                    <h3
                      style={{
                        minHeight: "3.1em",
                        marginBottom: "10px",
                      }}
                    >
                      {title}
                    </h3>

                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        flex: "1 1 auto",
                      }}
                    >
                      <strong className="website-solution-price">
                        {price}
                      </strong>

                      <p>{description}</p>
                    </div>

                    <Link
                      className="website-solution-link"
                      href={href}
                    >
                      Learn More
                      <span>→</span>
                    </Link>
                  </article>
                )
              )}
            </div>

            <div className="website-solution-note">
              <span>♡</span>

              <p>
                Starter, Simple Business Website, and Basic Online Shop
                packages do not include a self-managed admin dashboard unless
                stated otherwise. Custom domains and additional features can
                be quoted separately.
              </p>
            </div>
          </div>
        </section>

        {/* =====================================================
            DIGITAL SOLUTIONS
        ===================================================== */}

        <section className="section solutions-section">
          <div className="container">
            <div className="section-heading centered-heading">
              <span className="section-kicker">More than websites</span>

              <h2>Digital solutions built for real workflows.</h2>

              <p>
                TCL also develops systems and web applications for bookings,
                customers, orders, information, and day-to-day processes.
              </p>
            </div>

            <div className="category-grid">
              {solutionAreas.map(([number, title, description]) => (
                <article className="category-card" key={number}>
                  <span className="category-number">{number}</span>

                  <div>
                    <h3>{title}</h3>
                    <p>{description}</p>
                  </div>

                  <span className="category-arrow">↗</span>
                </article>
              ))}
            </div>

            <div className="solutions-actions">
              <Link className="button button-primary" href="/shop">
                Browse Solutions
                <span>→</span>
              </Link>

              <Link
                className="button button-secondary"
                href="/portfolio"
              >
                View Portfolio
              </Link>
            </div>
          </div>
        </section>

        {/* =====================================================
            HOW IT WORKS
        ===================================================== */}

        <section className="section section-white home-process-section">
          <div className="container">
            <div className="section-heading section-heading-row">
              <div>
                <span className="section-kicker">How it works</span>
                <h2>A clear process from idea to launch.</h2>
              </div>

              <Link className="text-link" href="/how-it-works">
                See Full Process
                <span>→</span>
              </Link>
            </div>

            <div className="home-process-grid">
              <article>
                <span>01</span>
                <h3>Choose or Request</h3>
                <p>
                  Pick an existing solution or tell TCL what you need for a
                  custom project.
                </p>
              </article>

              <article>
                <span>02</span>
                <h3>Confirm &amp; Pay</h3>
                <p>
                  Review the inclusions or quotation, confirm the project, and
                  complete the applicable payment.
                </p>
              </article>

              <article>
                <span>03</span>
                <h3>Build &amp; Review</h3>
                <p>
                  Your website or system is developed and reviewed based on
                  the agreed scope.
                </p>
              </article>

              <article>
                <span>04</span>
                <h3>Launch</h3>
                <p>
                  Once everything is ready, your project is prepared for
                  delivery, setup, or launch.
                </p>
              </article>
            </div>
          </div>
        </section>

        {/* Reviews */}
<section className="section section-soft reviews-section">
  <div className="container">
    <div className="reviews-heading">
      <span className="eyebrow">CLIENT LOVE ♡</span>

      <h2>What clients say about working with TCL.</h2>

      <p>
        Feedback from clients and business owners who trusted TCL with their
        digital projects.
      </p>
    </div>

    {reviews.length > 0 ? (
      <ReviewsSliderClient reviews={reviews} />
    ) : (
      <div className="empty-state">
        <p>Client reviews will appear here soon.</p>
      </div>
    )}
  </div>
</section>

        {/* =====================================================
            FINAL CTA
        ===================================================== */}

        <section className="final-cta" id="contact">
          <div className="container final-cta-inner">
            <div>
              <span className="final-cta-kicker">
                Have something specific in mind?
              </span>

              <h2>
                Let&apos;s build around
                <span>what your business actually needs.</span>
              </h2>

              <p>
                Start with a TCL solution or request a custom quotation for a
                more advanced website, system, or web application.
              </p>
            </div>

            <div className="final-cta-actions">
              <Link className="button button-white" href="/shop">
                Explore Solutions
                <span>→</span>
              </Link>

              <Link
                className="button button-outline-light"
                href="/shop/custom-business-website"
              >
                Request a Custom Quote
              </Link>
            </div>
          </div>
        </section>
      </main>

      <BackToTop />
      <SiteFooter />
    </>
  );
}