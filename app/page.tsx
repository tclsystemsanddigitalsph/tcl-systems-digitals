import Image from "next/image";
import Link from "next/link";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import ReviewsSliderClient from "@/components/ReviewsSliderClient";
import "./home-redesign.css";

const featuredProducts = [
  {
    category: "Booking System",
    title: "Booking System Templates",
    description:
      "Ready-to-use digital resources designed to help small business owners organize, present, and manage their brand more professionally.",
    price: "₱2,999",
    tag: "Best Seller",
    href: "/shop/editable-booking-system",
    available: true,
  },
  {
    category: "Digital Product",
    title: "Business Starter Kits",
    description:
      "A polished online booking or online shop website with an admin dashboard, service management, scheduling tools, and a professional client experience.",
    price: "₱1,999",
    tag: "Customized Website",
    href: "#",
    available: false,
  },
  {
    category: "Website Solution",
    title: "Custom Business Website",
    description:
      "A customized website experience designed around your business, branding, services, and customer journey.",
    price: "Custom Quote",
    tag: "Made For You",
    href: "/shop/custom-business-website",
    available: true,
  },
];

const categories = [
  {
    number: "01",
    title: "Booking Systems",
    description:
      "Modern appointment systems made for solo artists, beauty professionals, service providers, and growing businesses.",
  },
  {
    number: "02",
    title: "Website Solutions",
    description:
      "Clean, responsive websites designed to help your business look established and easier to trust online.",
  },
  {
    number: "03",
    title: "Digital Products",
    description:
      "Templates, business resources, downloadable tools, and digital products made to save you time.",
  },
  {
    number: "04",
    title: "Business Resources",
    description:
      "Practical digital tools that simplify your workflow and help you run your business more smoothly.",
  },
];

const reasons = [
  "Designed for real small-business workflows",
  "Modern and mobile-friendly",
  "Easy to understand and use",
  "One-time purchase options available",
  "Built with customization in mind",
  "Support available when you need it",
];

const roles = [
  "Nutrition and Dietetics Student",
  "Virtual Assistant",
  "Property Management VA",
  "Nail Technician",
  "Nail Artist",
  "Digital Creator",
  "Web Designer",
  "MOM",
];

export default async function Home() {
  const { createAdminSupabaseClient } = await import("@/lib/supabase-admin");
  const supabase = createAdminSupabaseClient();

  const { data: approvedReviews, error: reviewsError } = await supabase
    .from("reviews")
    .select(
      "id,customer_name,business_name,product_name,rating,review_text,is_featured,display_order,created_at",
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
        <section className="hero">
          <div className="hero-decoration hero-decoration-one" />
          <div className="hero-decoration hero-decoration-two" />

          <div className="container hero-grid">
            <div className="hero-copy">
              <div className="eyebrow">
                <span className="eyebrow-dot" />
                Digital solutions for modern businesses
              </div>

              <h1>
                Smart systems.
                <span>Beautiful digital solutions.</span>
              </h1>

              <p className="hero-description">
                Booking systems, websites, digital products, and practical
                business tools created to make running your business feel
                easier, cleaner, and more professional.
              </p>

              <div className="hero-actions">
                <Link className="button button-primary" href="/shop">
                  Shop Our Products
                  <span aria-hidden="true">→</span>
                </Link>

                <a className="button button-secondary" href="#categories">
                  Explore Solutions
                </a>

                <Link className="button button-secondary" href="/policies">
                  Policies
                </Link>
              </div>

              <div className="hero-trust">
                <div>
                  <strong>One-time</strong>
                  <span>purchase options</span>
                </div>
                <div className="hero-trust-divider" />
                <div>
                  <strong>Made for</strong>
                  <span>small businesses</span>
                </div>
                <div className="hero-trust-divider" />
                <div>
                  <strong>Built to be</strong>
                  <span>easy to use</span>
                </div>
              </div>
            </div>

            <div className="hero-visual">
              <div className="hero-glow" />

              <div className="browser-card">
                <div className="browser-topbar">
                  <div className="browser-dots">
                    <span />
                    <span />
                    <span />
                  </div>
                  <div className="browser-address">tcl.systems</div>
                </div>

                <div className="browser-content">
                  <div className="mock-navigation">
                    <div className="mock-logo">TCL</div>
                    <div className="mock-links">
                      <span />
                      <span />
                      <span />
                    </div>
                  </div>

                  <div className="mock-hero">
                    <span className="mock-badge">BOOKING SYSTEM</span>
                    <div className="mock-title mock-title-large" />
                    <div className="mock-title mock-title-short" />
                    <div className="mock-copy" />
                    <div className="mock-copy mock-copy-short" />
                    <div className="mock-buttons">
                      <span />
                      <span />
                    </div>
                  </div>

                  <div className="mock-products">
                    <div />
                    <div />
                    <div />
                  </div>
                </div>
              </div>

              <div className="floating-card floating-card-sales">
                <span className="floating-icon">↗</span>
                <div>
                  <small>Digital products</small>
                  <strong>Built to sell</strong>
                </div>
              </div>

              <div className="floating-card floating-card-easy">
                <span className="floating-check">✓</span>
                <div>
                  <small>Made simple</small>
                  <strong>Easy to manage</strong>
                </div>
              </div>
            </div>
          </div>

          <div className="container brand-strip">
            <span>BOOKING SYSTEMS</span>
            <i />
            <span>WEBSITES</span>
            <i />
            <span>DIGITAL PRODUCTS</span>
            <i />
            <span>BUSINESS TOOLS</span>
          </div>
        </section>

        <section className="section section-white" id="shop">
          <div className="container">
            <div className="section-heading section-heading-row">
              <div>
                <span className="section-kicker">Featured products</span>
                <h2>Made to help your business work smarter.</h2>
              </div>

              <Link className="text-link" href="/shop">
                View all products
                <span>→</span>
              </Link>
            </div>

            <div className="product-grid">
              {featuredProducts.map((product, index) => (
                <article className="product-card" key={product.title}>
                  <div className={`product-preview product-preview-${index + 1}`}>
                    <div className="product-tag">{product.tag}</div>

                    {index === 0 && (
                      <div className="preview-window">
                        <div className="preview-window-bar">
                          <span />
                          <span />
                          <span />
                        </div>
                        <div className="preview-window-body">
                          <div className="preview-sidebar">
                            <div className="preview-mini-logo" />
                            <span />
                            <span />
                            <span />
                            <span />
                          </div>
                          <div className="preview-dashboard">
                            <div className="preview-dashboard-heading" />
                            <div className="preview-stat-row">
                              <span />
                              <span />
                              <span />
                            </div>
                            <div className="preview-chart" />
                          </div>
                        </div>
                      </div>
                    )}

                    {index === 1 && (
                      <div className="digital-preview">
                        <div className="digital-sheet digital-sheet-back">
                          <span />
                          <span />
                          <span />
                        </div>
                        <div className="digital-sheet digital-sheet-front">
                          <small>BUSINESS</small>
                          <strong>Starter Kits</strong>
                          <span />
                          <span />
                          <span />
                        </div>
                      </div>
                    )}

                    {index === 2 && (
                      <div className="website-preview">
                        <div className="website-preview-bar">
                          <span />
                          <span />
                          <span />
                        </div>
                        <div className="website-preview-nav">
                          <strong>TCL</strong>
                          <div>
                            <span />
                            <span />
                            <span />
                          </div>
                        </div>
                        <div className="website-preview-hero">
                          <small>YOUR BUSINESS</small>
                          <strong>Designed to stand out.</strong>
                          <span />
                          <div />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="product-content">
                    <span className="product-category">{product.category}</span>
                    <h3>{product.title}</h3>
                    <p>{product.description}</p>

                    <div className="product-footer">
                      <div className="product-price">
                        <small>Starts at</small>
                        <strong>{product.price}</strong>
                      </div>

                      {product.available ? (
                        <Link
                          className="product-arrow"
                          href={product.href}
                          aria-label={`View ${product.title}`}
                        >
                          →
                        </Link>
                      ) : (
                        <a
                          className="product-arrow"
                          href={product.href}
                          aria-label={
                            product.title === "Custom Business Website"
                              ? `Ask about ${product.title}`
                              : `${product.title} coming soon`
                          }
                        >
                          →
                        </a>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section reviews-section" id="reviews">
          <div className="container">
            <div className="reviews-heading">
              <div>
                <span className="section-kicker">Client love ♡</span>
                <h2>Reviews &amp; recommendations.</h2>
                <p>
                  Kind words from clients and business owners I&apos;ve had the
                  pleasure of creating for.
                </p>
              </div>

              <div className="reviews-rating-summary">
                <strong>
                  {reviews.length > 0
                    ? (
                        reviews.reduce(
                          (sum, review) => sum + Number(review.rating || 0),
                          0,
                        ) / reviews.length
                      ).toFixed(1)
                    : "5.0"}
                </strong>
                <div>
                  <span className="reviews-summary-stars">★★★★★</span>
                </div>
              </div>
            </div>

            {reviews.length > 0 ? (
              <ReviewsSliderClient reviews={reviews} />
            ) : (
              <div className="reviews-empty-state">
                Approved reviews will appear here.
              </div>
            )}

            <div className="reviews-recommendation">
              <div className="reviews-recommendation-icon">♡</div>
              <div className="reviews-recommendation-copy">
                <span>Have you worked with TCL?</span>
                <strong>Your feedback means a lot.</strong>
                <p>
                  Reviews and recommendations help other small business owners
                  feel more confident choosing the right digital solution.
                </p>
              </div>
              <a className="button button-secondary" href="#contact">
                Leave a Review
                <span>→</span>
              </a>
            </div>
          </div>
        </section>

        <section className="section categories-section" id="categories">
          <div className="container">
            <div className="section-heading centered-heading">
              <span className="section-kicker">What we create</span>
              <h2>Digital solutions for different stages of your business.</h2>
              <p>
                Whether you are just starting or already growing, choose the
                solution that matches what your business needs right now.
              </p>
            </div>

            <div className="category-grid">
              {categories.map((category) => (
                <article className="category-card" key={category.number}>
                  <span className="category-number">{category.number}</span>
                  <div>
                    <h3>{category.title}</h3>
                    <p>{category.description}</p>
                  </div>
                  <span className="category-arrow">↗</span>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section section-white">
          <div className="container custom-grid">
            <div className="custom-visual">
              <div className="custom-shape custom-shape-one" />
              <div className="custom-shape custom-shape-two" />

              <div className="custom-window">
                <div className="custom-window-header">
                  <div>
                    <span />
                    <span />
                    <span />
                  </div>
                  <small>YOUR BUSINESS</small>
                </div>

                <div className="custom-window-body">
                  <span className="custom-pill">CUSTOMIZED FOR YOU</span>
                  <div className="custom-window-title" />
                  <div className="custom-window-title custom-window-title-small" />
                  <div className="custom-window-copy" />
                  <div className="custom-window-copy custom-window-copy-short" />
                  <div className="custom-window-button" />
                  <div className="custom-window-cards">
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
              </div>
            </div>

            <div className="custom-copy">
              <span className="section-kicker">Need something more personal?</span>
              <h2>Not everything has to come straight off the shelf.</h2>
              <p>
                If your business needs a more specific workflow, branding, or
                feature set, TCL also offers customized website and system
                services.
              </p>

              <div className="custom-points">
                <div><span>✓</span>Customized around your business</div>
                <div><span>✓</span>Built for your actual workflow</div>
                <div><span>✓</span>Additional features available when needed</div>
              </div>

              <Link className="button button-primary" href="/shop/custom-business-website">
                Ask About Customization
                <span>→</span>
              </Link>
            </div>
          </div>
        </section>

        <section className="section section-white">
          <div className="container why-grid">
            <div className="why-copy">
              <span className="section-kicker">Why TCL?</span>
              <h2>Pretty is good. Functional is better. We do both.</h2>
              <p>
                TCL Systems &amp; Digitals PH focuses on digital products that
                feel polished but still make sense for the person actually
                using them.
              </p>

              <div className="why-list">
                {reasons.map((reason) => (
                  <div key={reason}>
                    <span>✓</span>
                    {reason}
                  </div>
                ))}
              </div>
            </div>

            <div className="why-stat-card">
              <div className="why-stat-top">
                <span>MADE FOR</span>
                <strong>Small Business Owners</strong>
              </div>
              <div className="why-stat-middle">
                <div><strong>01</strong><span>Professional</span></div>
                <div><strong>02</strong><span>Practical</span></div>
                <div><strong>03</strong><span>Easy to use</span></div>
              </div>
              <div className="why-stat-bottom">
                <span>Less complicated.</span>
                <strong>More business-ready.</strong>
              </div>
            </div>
          </div>
        </section>

        <section className="section about-section" id="about">
          <div className="container about-grid">
            <div className="about-photo-column">
              <div className="about-photo-decoration about-photo-decoration-one" />
              <div className="about-photo-decoration about-photo-decoration-two" />

              <div className="about-photo-frame">
                <Image
                  src="/marie-about.jpg"
                  alt="Marie, founder of TCL Systems & Digitals PH"
                  width={900}
                  height={1200}
                  className="about-photo"
                />
              </div>

              <div className="about-photo-badge">
                <span>♡</span>
                <div>
                  <small>CREATIVE GIRLY</small>
                  <strong>with big dreams</strong>
                </div>
              </div>
            </div>

            <div className="about-copy">
              <span className="section-kicker">The girl behind TCL</span>
              <h2>
                Hey, I&apos;m Marie.
                <span>A hardworking girly who wears many hats.</span>
              </h2>

              <p className="about-intro">
                I&apos;m an ND student at CEU, a Virtual Assistant, nail tech,
                artist, and the girl behind TCL Systems &amp; Digitals PH.
              </p>
              <p>
                My life is basically a mix of mommy duties, studying, working,
                creating, doing nails, building websites, and somehow finding
                another idea to work on in between. ♡
              </p>
              <p>
                I started TCL because I wanted to combine the things I genuinely
                enjoy — creativity, technology, business, and helping people. I
                love turning ideas into something beautiful, functional, and
                actually useful.
              </p>
              <p>
                Whether it&apos;s creating a booking system, designing a
                website, working on digital products, or doing a fresh set of
                nails, the goal is always the same: create something I&apos;m
                proud of and make things a little easier for the person on the
                other side.
              </p>

              <div className="about-roles">
                {roles.map((role) => (
                  <span key={role}>{role}</span>
                ))}
              </div>

              <div className="about-quote">
                <span className="about-quote-mark">“</span>
                <div>
                  <p>
                    A girl who studies, works, creates, and still makes room for
                    bigger dreams.
                  </p>
                  <strong>Same girl. Big dreams. ♡</strong>
                </div>
              </div>

              <Link className="button button-primary" href="/shop/custom-business-website">
                Let&apos;s Work Together
                <span>→</span>
              </Link>
            </div>
          </div>
        </section>

        <section className="final-cta" id="contact">
          <div className="container final-cta-inner">
            <div>
              <span className="final-cta-kicker">Ready when you are.</span>
              <h2>
                Give your business the
                <span>digital upgrade it deserves.</span>
              </h2>
              <p>
                Explore ready-made systems and digital products, or ask about a
                customized solution for your business.
              </p>
            </div>

            <div className="final-cta-actions">
              <Link className="button button-white" href="/shop">
                Browse Products
                <span>→</span>
              </Link>
              <Link className="button button-outline-light" href="/shop/custom-business-website">
                Request a Custom Quote
              </Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
