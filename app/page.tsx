import Image from "next/image";
import Link from "next/link";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";

const featuredProducts = [
  {
    category: "Booking System",
    title: "Editable Booking System",
    description:
      "Ready-to-use digital resources designed to help small business owners organize, present, and manage their brand more professionally.",
    price: "₱1,999",
    tag: "Intro Price",
    href: "/shop/editable-booking-system",
    available: true,
  },
  {
    category: "Digital Product",
    title: "Business Starter Kit",
    description:
      "A polished online booking website with an admin dashboard, service management, scheduling tools, and a professional client experience.",
    price: "Coming Soon",
    tag: "New",
    href: "#",
    available: false,
  },
  {
    category: "Website Solution",
    title: "Custom Business Website",
    description:
      "A customized website experience designed around your business, branding, services, and customer journey.",
    price: "Custom Quote",
    tag: "Service",
    href: "#contact",
    available: false,
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

const reviews = [
  {
    name: "Client Name",
    business: "Beauty Business",
    product: "Booking System",
    rating: 5,
    review:
      "Add your client's review here. This space is perfect for feedback about their experience, the system, your service, or how TCL helped their business.",
  },
  {
    name: "Client Name",
    business: "Small Business Owner",
    product: "Website Solution",
    rating: 5,
    review:
      "Add another recommendation here. You can use reviews from previous clients, business owners, or people you have created systems and digital solutions for.",
  },
  {
    name: "Client Name",
    business: "Service Provider",
    product: "Digital Product",
    rating: 5,
    review:
      "Use this card for another client testimonial. Later, these reviews can be added and managed directly from your Admin dashboard.",
  },
];

const faqs = [
  {
    question: "Are these just Canva or website templates?",
    answer:
      "Not all of them. TCL offers both digital products and functional business systems. Product pages will clearly explain whether an item is editable, downloadable, a full system, or a custom service.",
  },
  {
    question: "Do I need coding experience?",
    answer:
      "No. Products intended for business owners will include clear instructions, and systems are designed so normal business updates can be handled without editing code.",
  },
  {
    question: "Are there monthly fees?",
    answer:
      "TCL products can be sold as one-time purchases, but some systems may still use third-party services such as hosting, email, payment providers, or databases depending on the product.",
  },
  {
    question: "Can I request something customized?",
    answer:
      "Yes. If the ready-made option does not fully fit your business, customized systems and website services can also be offered separately.",
  },
];

export default function Home() {
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
                  <div
                    className={`product-preview product-preview-${index + 1}`}
                  >
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
                          <strong>Starter Kit</strong>
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
                    <span className="product-category">
                      {product.category}
                    </span>

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

        <section
          className="section categories-section"
          id="categories"
        >
          <div className="container">
            <div className="section-heading centered-heading">
              <span className="section-kicker">What we create</span>

              <h2>
                Digital solutions for different stages of your business.
              </h2>

              <p>
                Whether you are just starting or already growing, choose the
                solution that matches what your business needs right now.
              </p>
            </div>

            <div className="category-grid">
              {categories.map((category) => (
                <article
                  className="category-card"
                  key={category.number}
                >
                  <span className="category-number">
                    {category.number}
                  </span>

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
                  <span className="custom-pill">
                    CUSTOMIZED FOR YOU
                  </span>

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
              <span className="section-kicker">
                Need something more personal?
              </span>

              <h2>
                Not everything has to come straight off the shelf.
              </h2>

              <p>
                If your business needs a more specific workflow, branding, or
                feature set, TCL also offers customized website and system
                services.
              </p>

              <div className="custom-points">
                <div>
                  <span>✓</span>
                  Customized around your business
                </div>

                <div>
                  <span>✓</span>
                  Built for your actual workflow
                </div>

                <div>
                  <span>✓</span>
                  Additional features available when needed
                </div>
              </div>

              <a
  className="button button-primary"
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

        <section
          className="section process-section"
          id="how-it-works"
        >
          <div className="container">
            <div className="section-heading centered-heading narrow-heading">
              <span className="section-kicker">
                Simple from the start
              </span>

              <h2>Find it. Purchase it. Make it yours.</h2>
            </div>

            <div className="process-grid">
              <article className="process-card">
                <span className="process-number">01</span>
                <div className="process-icon">⌕</div>
                <h3>Explore</h3>
                <p>
                  Browse systems, digital products, and business solutions
                  built for different needs.
                </p>
              </article>

              <div className="process-line" />

              <article className="process-card">
                <span className="process-number">02</span>
                <div className="process-icon">♡</div>
                <h3>Choose</h3>
                <p>
                  Review the features, product details, pricing, and delivery
                  method before purchasing.
                </p>
              </article>

              <div className="process-line" />

              <article className="process-card">
                <span className="process-number">03</span>
                <div className="process-icon">✓</div>
                <h3>Get Access</h3>
                <p>
                  Receive your product, setup instructions, or next steps
                  based on the item you purchased.
                </p>
              </article>
            </div>
          </div>
        </section>

        <section className="section section-white">
          <div className="container why-grid">
            <div className="why-copy">
              <span className="section-kicker">Why TCL?</span>

              <h2>
                Pretty is good. Functional is better. We do both.
              </h2>

              <p>
                TCL Systems &amp; Digitals PH focuses on digital products
                that feel polished but still make sense for the person
                actually using them.
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
                <div>
                  <strong>01</strong>
                  <span>Professional</span>
                </div>

                <div>
                  <strong>02</strong>
                  <span>Practical</span>
                </div>

                <div>
                  <strong>03</strong>
                  <span>Easy to use</span>
                </div>
              </div>

              <div className="why-stat-bottom">
                <span>Less complicated.</span>
                <strong>More business-ready.</strong>
              </div>
            </div>
          </div>
        </section>

        <section
          className="section about-section"
          id="about"
        >
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
              <span className="section-kicker">
                The girl behind TCL
              </span>

              <h2>
                Hey, I&apos;m Marie.
                <span>
                  A hardworking girly who wears many hats.
                </span>
              </h2>

              <p className="about-intro">
                I&apos;m an ND student at CEU, a Virtual Assistant, nail
                tech, artist, and the girl behind TCL Systems &amp; Digitals
                PH.
              </p>

              <p>
                My life is basically a mix of mommy duties, studying,
                working, creating, doing nails, building websites, and
                somehow finding another idea to work on in between. ♡
              </p>

              <p>
                I started TCL because I wanted to combine the things I
                genuinely enjoy — creativity, technology, business, and
                helping people. I love turning ideas into something
                beautiful, functional, and actually useful.
              </p>

              <p>
                Whether it&apos;s creating a booking system, designing a
                website, working on digital products, or doing a fresh set
                of nails, the goal is always the same: create something
                I&apos;m proud of and make things a little easier for the
                person on the other side.
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
                    A girl who studies, works, creates, and still makes room
                    for bigger dreams.
                  </p>

                  <strong>Same girl. Big dreams. ♡</strong>
                </div>
              </div>

              <a
                className="button button-primary"
                href="#contact"
              >
                Let&apos;s Work Together
                <span>→</span>
              </a>
            </div>
          </div>
        </section>

        <section
          className="section reviews-section"
          id="reviews"
        >
          <div className="container">
            <div className="reviews-heading">
              <div>
                <span className="section-kicker">
                  Client love ♡
                </span>

                <h2>Reviews &amp; recommendations.</h2>

                <p>
                  Kind words from clients and business owners I&apos;ve had
                  the pleasure of creating for.
                </p>
              </div>

              <div className="reviews-rating-summary">
                <strong>5.0</strong>

                <div>
                  <span className="reviews-summary-stars">
                    ★★★★★
                  </span>
                  <small>Client feedback</small>
                </div>
              </div>
            </div>

            <div className="reviews-grid">
              {reviews.map((review, index) => (
                <article
                  className={`review-card ${
                    index === 0 ? "review-card-featured" : ""
                  }`}
                  key={`${review.name}-${index}`}
                >
                  <div className="review-card-top">
                    <div className="review-quote-icon">“</div>

                    <div
                      className="review-stars"
                      aria-label={`${review.rating} out of 5 stars`}
                    >
                      {"★".repeat(review.rating)}
                    </div>
                  </div>

                  <p className="review-text">
                    {review.review}
                  </p>

                  <div className="review-client">
                    <div className="review-avatar">
                      {review.name.charAt(0)}
                    </div>

                    <div className="review-client-info">
                      <strong>{review.name}</strong>
                      <span>{review.business}</span>
                    </div>
                  </div>

                  <div className="review-product">
                    <span>Purchased</span>
                    <strong>{review.product}</strong>
                  </div>
                </article>
              ))}
            </div>

            <div className="reviews-recommendation">
              <div className="reviews-recommendation-icon">
                ♡
              </div>

              <div className="reviews-recommendation-copy">
                <span>Have you worked with TCL?</span>
                <strong>Your feedback means a lot.</strong>

                <p>
                  Reviews and recommendations help other small business
                  owners feel more confident choosing the right digital
                  solution.
                </p>
              </div>

              <a
                className="button button-secondary"
                href="#contact"
              >
                Leave a Review
                <span>→</span>
              </a>
            </div>
          </div>
        </section>

        <section
          className="section faq-section"
          id="faq"
        >
          <div className="container faq-grid">
            <div className="faq-heading">
              <span className="section-kicker">
                Questions, answered
              </span>

              <h2>Before you buy.</h2>

              <p>
                Every product will have its own complete details, but here
                are a few things you may want to know first.
              </p>
            </div>

            <div className="faq-list">
              {faqs.map((faq) => (
                <details key={faq.question}>
                  <summary>
                    <span>{faq.question}</span>
                    <i>+</i>
                  </summary>

                  <p>{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section
          className="final-cta"
          id="contact"
        >
          <div className="container final-cta-inner">
            <div>
              <span className="final-cta-kicker">
                Ready when you are.
              </span>

              <h2>
                Give your business the
                <span>digital upgrade it deserves.</span>
              </h2>

              <p>
                Explore ready-made systems and digital products, or ask
                about a customized solution for your business.
              </p>
            </div>

            <div className="final-cta-actions">
              <Link
                className="button button-white"
                href="/shop"
              >
                Browse Products
                <span>→</span>
              </Link>

              <a
  className="button button-outline-light"
  href="https://t.me/tclsystemsanddigitalsph"
  target="_blank"
  rel="noreferrer"
>
  Contact TCL
</a>
              
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}