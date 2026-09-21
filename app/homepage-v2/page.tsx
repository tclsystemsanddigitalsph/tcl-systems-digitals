import Link from "next/link";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import BackToTop from "@/components/BackToTop";
import { createAdminSupabaseClient } from "@/lib/supabase-admin";
import FeaturedProjects from "./FeaturedProjects";
import "./homepage-v2.css";

const solutions = [
  ["001", "Custom Business Website", "For Quotation", "A fully customized business website built around your goals, features, and workflow.", "/shop/custom-business-website", "CUSTOM DEVELOPMENT"],
  ["002", "Starter Website", "₱999", "A clean one-page website for small businesses, freelancers, and personal brands.", "/shop", "WEBSITE"],
  ["003", "Simple Business Website", "₱2,999", "A customized four-page business website for a more complete professional online presence.", "/shop", "WEBSITE"],
  ["004", "Basic Booking System", "₱5,999", "A simple online booking system with customer booking and basic appointment management.", "/shop", "BOOKING"],
  ["005", "Standard Booking Website/System", "₱7,999", "A more complete booking experience with structured services, availability, and admin management.", "/shop", "BOOKING"],
  ["006", "Basic Online Shop", "₱5,999", "A simple online shop for showcasing products, accepting orders, and providing payment instructions.", "/shop", "E-COMMERCE"],
  ["007", "Basic Online Shop + Admin", "₱8,999", "A complete storefront with an admin dashboard for products, orders, payment verification, and statuses.", "/shop", "E-COMMERCE"],
] as const;

const capabilities = [
  "WEBSITES",
  "ONLINE SHOPS",
  "BOOKING SYSTEMS",
  "BUSINESS SYSTEMS",
  "CUSTOM BUILDS",
  "WEB APPLICATIONS",
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
  "Cloudflare",
  "Resend",
] as const;

const stackIcons: Record<string, string> = {
  "Next.js": "https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/nextdotjs.svg",
  "React": "https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/react.svg",
  "TypeScript": "https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/typescript.svg",
  "JavaScript": "https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/javascript.svg",
  "HTML": "https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/html5.svg",
  "CSS": "https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/css.svg",
  "Supabase": "https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/supabase.svg",
  "PostgreSQL": "https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/postgresql.svg",
  "Vercel": "https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/vercel.svg",
  "GitHub": "https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/github.svg",
  "Cloudflare": "https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/cloudflare.svg",
  "Resend": "https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/resend.svg",
};

export default async function HomepageV2() {
  const admin = createAdminSupabaseClient();
  const { data: reviewRows } = await admin
    .from("reviews")
    .select("id,customer_name,business_name,product_name,rating,review_text,social_url,is_featured,display_order,created_at")
    .eq("status", "APPROVED")
    .order("is_featured", { ascending: false })
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false })
    .limit(6);

  const reviews = reviewRows ?? [];

  return (
    <>
      <SiteHeader />

      <main className="v2">
        <section className="v2-hero v2-hero-tech v2-hero-wow">
          <div className="v2-grid" aria-hidden="true" />
          <div className="v2-wow-beam" aria-hidden="true" />
          <div className="v2-wow-halo v2-wow-halo-one" aria-hidden="true" />
          <div className="v2-wow-halo v2-wow-halo-two" aria-hidden="true" />
          <div className="v2-tech-noise" aria-hidden="true" />
          <div className="v2-scanline" aria-hidden="true" />

          <div className="v2-shell v2-hero-inner">
            <div className="v2-system-line v2-reveal v2-delay-1">
              <span><i /> TCL SYSTEMS &amp; DIGITALS PH</span>
              <span>DESIGN / DEVELOPMENT / DIGITAL SYSTEMS</span>
            </div>

            <div className="v2-wow-stage">
              <div className="v2-wow-copy">
                <div className="v2-wow-eyebrow v2-reveal v2-delay-2">
                  <span>INDEPENDENT DIGITAL STUDIO</span>
                  <b>PH / 2026</b>
                </div>

                <h1 className="v2-wow-title v2-reveal v2-delay-3">
                  <span className="v2-wow-line v2-wow-line-one">DIGITAL</span>
                  <span className="v2-wow-line v2-wow-line-two">THAT <em>WORKS.</em></span>
                  <span className="v2-wow-line v2-wow-line-three">BEAUTIFULLY.</span>
                </h1>

                <div className="v2-wow-copy-bottom v2-reveal v2-delay-4">
                  <p>
                    TCL turns business ideas and workflows into websites, shops,
                    booking experiences, and custom systems built to be used.
                  </p>

                  <div className="v2-actions">
                    <Link href="/portfolio" className="v2-button v2-button-dark">
                      Explore our work <span className="v2-line-arrow" aria-hidden="true" />
                    </Link>
                    <Link href="/shop" className="v2-button v2-button-light">
                      View solutions <span className="v2-mini-arrow" aria-hidden="true" />
                    </Link>
                  </div>
                </div>
              </div>

              <div className="v2-wow-engine v2-reveal v2-delay-4" aria-hidden="true">
                <div className="v2-wow-engine-label v2-wow-engine-label-top">
                  <span>BUSINESS INPUT</span><b>01</b>
                </div>
                <div className="v2-wow-engine-label v2-wow-engine-label-bottom">
                  <span>DIGITAL OUTPUT</span><b>04</b>
                </div>

                <div className="v2-wow-orbit v2-wow-orbit-outer">
                  <i /><i /><i /><i />
                </div>
                <div className="v2-wow-orbit v2-wow-orbit-mid" />
                <div className="v2-wow-orbit v2-wow-orbit-inner" />

                <svg className="v2-wow-network" viewBox="0 0 500 500">
                  <path d="M250 250 L78 128" />
                  <path d="M250 250 L422 128" />
                  <path d="M250 250 L78 372" />
                  <path d="M250 250 L422 372" />
                  <path d="M78 128 L422 128" />
                  <path d="M78 372 L422 372" />
                </svg>

                <div className="v2-wow-core">
                  <small>TCL</small>
                  <strong>BUILD</strong>
                  <span>ENGINE</span>
                </div>

                <div className="v2-wow-node v2-wow-node-a"><small>01</small><b>WEB</b><span>INTERFACE</span></div>
                <div className="v2-wow-node v2-wow-node-b"><small>02</small><b>SHOP</b><span>COMMERCE</span></div>
                <div className="v2-wow-node v2-wow-node-c"><small>03</small><b>BOOK</b><span>WORKFLOW</span></div>
                <div className="v2-wow-node v2-wow-node-d"><small>04</small><b>SYS</b><span>LOGIC</span></div>

                <div className="v2-wow-sweep" />
              </div>

              <div className="v2-wow-side-note v2-reveal v2-delay-5">
                <span>SCROLL</span><i />
                <small>DESIGN / CODE / CONNECT / LAUNCH</small>
              </div>
            </div>

            <div className="v2-wow-footer-rail v2-reveal v2-delay-5">
              <span>WEB DESIGN</span><i />
              <span>E-COMMERCE</span><i />
              <span>BOOKING</span><i />
              <span>CUSTOM SYSTEMS</span>
              <b>BUILDING DIGITAL EXPERIENCES FROM THE PHILIPPINES</b>
            </div>
          </div>
        </section>

        <section className="v2-marquee" aria-label="TCL capabilities">
          <div className="v2-marquee-track">
            {[...capabilities, ...capabilities].map((item, index) => (
              <span key={`${item}-${index}`}>{item}<i>✦</i></span>
            ))}
          </div>
        </section>

        <section className="v2-statement">
          <div className="v2-shell">
            <div className="v2-section-index">
              <span>01 / APPROACH</span>
              <span>MORE THAN A TEMPLATE</span>
            </div>

            <div className="v2-statement-grid">
              <div className="v2-approach-title">
                <p>BUILD / CONNECT / LAUNCH</p>
                <h2>
                  NOT JUST
                  <span>A PRETTY</span>
                  WEBSITE<b>.</b>
                </h2>
              </div>

              <div className="v2-statement-copy">
                <p className="v2-lead">
                  Your digital presence should look good — but it should also
                  make sense for your business.
                </p>
                <p>
                  TCL creates custom-coded digital experiences with the customer
                  journey, business workflow, responsiveness, and real-world use
                  considered from the start.
                </p>
                <Link href="/about" className="v2-text-link">
                  About TCL &amp; the developer <span className="v2-line-arrow" aria-hidden="true" />
                </Link>
              </div>
            </div>

            <div className="v2-metrics">
              <div><strong>100%</strong><span>Custom coded</span></div>
              <div><strong>1:1</strong><span>Business focused</span></div>
              <div><strong>WEB</strong><span>Modern solutions</span></div>
              <div><strong>PH</strong><span>Built from the Philippines</span></div>
            </div>
          </div>
        </section>

        <section className="v2-work">
          <div className="v2-shell">
            <div className="v2-section-index v2-section-index-light">
              <span>02 / SELECTED BUILDS</span>
              <span>LIVE PROJECTS / BUILT BY TCL</span>
            </div>

            <div className="v2-work-heading">
              <div>
                <p className="v2-kicker">FEATURED PROJECTS</p>
                <h2>REAL BUILDS.<br /><span>REAL WORK.</span></h2>
              </div>
              <p>
                A rotating look at websites and systems built by TCL — from
                business websites and booking experiences to custom reviewer systems.
              </p>
            </div>

            <FeaturedProjects />
          </div>
        </section>

        <section className="v2-solutions">
          <div className="v2-shell">
            <div className="v2-section-index">
              <span>03 / SOLUTIONS</span>
              <span>START SMALL / SCALE WHEN READY</span>
            </div>

            <div className="v2-solutions-heading">
              <h2>SEVEN WAYS TO<br /><span>START BUILDING.</span></h2>
              <p>
                Straightforward packages for common business needs, with custom
                development available when your workflow needs something more.
              </p>
            </div>

            <div className="v2-solution-list">
              {solutions.map(([number, title, price, description, href, category]) => (
                <Link href={href} className="v2-solution-row" key={number}>
                  <span className="v2-solution-number">{number}</span>
                  <div className="v2-solution-title">
                    <small>{category}</small>
                    <h3>{title}</h3>
                  </div>
                  <p>{description}</p>
                  <strong>{price}</strong>
                  <span className="v2-solution-arrow" aria-hidden="true"><i /></span>
                </Link>
              ))}
            </div>

            <div className="v2-solutions-bottom">
              <p>
                Need dashboards, customer accounts, automation, integrations, or
                a workflow that doesn&apos;t fit a standard package?
              </p>
              <Link href="/shop/custom-business-website" className="v2-button v2-button-dark">
                Request a custom quote <span className="v2-line-arrow" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>

        <section className="v2-process">
          <div className="v2-shell">
            <div className="v2-section-index v2-section-index-light">
              <span>04 / PROCESS</span>
              <span>FROM IDEA  ONLINE</span>
            </div>

            <div className="v2-process-heading">
              <h2>HOW WE<br /><span>GET IT LIVE.</span></h2>
            </div>

            <div className="v2-process-grid">
              {[
                ["01", "DEFINE", "Choose a solution or tell TCL what your business needs."],
                ["02", "ALIGN", "Confirm the scope, inclusions, quotation, and project direction."],
                ["03", "BUILD", "Your website or system is developed and reviewed around the agreed scope."],
                ["04", "LAUNCH", "Final checks, delivery, setup, and deployment get your project online."],
              ].map(([number, title, text]) => (
                <article key={number}>
                  <span>{number}</span>
                  <div className="v2-process-node"><i /></div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </article>
              ))}
            </div>

            <Link href="/how-it-works" className="v2-text-link v2-text-link-light">
              View the full process <span className="v2-line-arrow" aria-hidden="true" />
            </Link>
          </div>
        </section>

        <section className="v2-stack">
          <div className="v2-shell">
            <div className="v2-section-index">
              <span>05 / BUILD STACK</span>
              <span>TOOLS BEHIND THE WORK</span>
            </div>

            <div className="v2-stack-layout">
              <div className="v2-stack-heading">
                <p className="v2-kicker">TOOLS &amp; TECHNOLOGIES</p>
                <h2>DESIGNED.<br />DEVELOPED.<br /><span>DEPLOYED.</span></h2>
                <p className="v2-stack-copy">
                  The platforms, frameworks, services, and infrastructure used
                  across TCL websites, online shops, booking systems, and custom builds.
                </p>
              </div>

              <div className="v2-stack-cloud" aria-label="Tools and technologies used by TCL">
                {stack.map((item) => (
                  <span key={item}>
                    <i className="v2-stack-icon" aria-hidden="true">
                      <img src={stackIcons[item]} alt="" />
                    </i>
                    <b>{item}</b>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>


        <section className="v2-reviews">
          <div className="v2-reviews-art" aria-hidden="true">“</div>
          <div className="v2-shell">
            <div className="v2-section-index">
              <span>06 / CLIENT REVIEWS</span>
              <span>REAL PROJECTS / REAL FEEDBACK</span>
            </div>
            <div className="v2-reviews-heading">
              <p className="v2-kicker">CLIENT FEEDBACK</p>
              <h2>REAL RESULTS.<br /><span>REAL PEOPLE.</span></h2>
              <p>Kind words from clients who trusted TCL with their digital projects.</p>
            </div>
            {reviews.length > 0 ? (
              <div className={`v2-review-cards ${reviews.length === 1 ? "single" : ""}`}>
                {reviews.map((review) => (
                  <article className={`v2-feedback-card ${review.is_featured ? "featured" : ""}`} key={review.id}>
                    <div className="v2-feedback-top">
                      <span aria-label={`${review.rating} out of 5 stars`}>{"★".repeat(Math.max(0, Math.min(5, Number(review.rating) || 0)))}</span>
                      {review.is_featured ? <small>FEATURED</small> : null}
                    </div>
                    <div className="v2-feedback-quote" aria-hidden="true">“</div>
                    <blockquote>{review.review_text}</blockquote>
                    <div className="v2-feedback-client">
                      <div className="v2-feedback-avatar">
                        {(review.customer_name || "TCL").split(" ").filter(Boolean).slice(0, 2).map((part: string) => part[0]).join("").toUpperCase()}
                      </div>
                      <div>
                        <strong>{review.customer_name}</strong>
                        {review.business_name ? <span>{review.business_name}</span> : null}
                      </div>
                      {review.product_name ? <small>{review.product_name}</small> : null}
                    </div>
                    {review.social_url ? (
                      <a href={review.social_url} target="_blank" rel="noreferrer">
                        VISIT PROJECT <span className="v2-line-arrow" aria-hidden="true" />
                      </a>
                    ) : null}
                  </article>
                ))}
              </div>
            ) : (
              <div className="v2-reviews-empty"><span>CLIENT REVIEWS</span><p>Approved client feedback will appear here.</p></div>
            )}
          </div>
        </section>

        <section className="v2-final">
          <div className="v2-final-grid" aria-hidden="true" />
          <div className="v2-shell v2-final-inner">
            <div className="v2-section-index v2-section-index-light">
              <span>07 / START A PROJECT</span>
              <span>TCL SYSTEMS &amp; DIGITALS PH</span>
            </div>

            <p className="v2-kicker">HAVE AN IDEA?</p>
            <h2>YOU HAVE THE IDEA.<br /><span>WE&apos;LL BUILD THE</span><br />DIGITAL PART.</h2>

            <div className="v2-final-bottom">
              <p>
                Start with an existing TCL solution or tell us what you need for
                a custom website, system, or web application.
              </p>
              <div>
                <Link href="/shop/custom-business-website" className="v2-button v2-button-pink">
                  Request a quote <span className="v2-line-arrow" aria-hidden="true" />
                </Link>
                <Link href="/shop" className="v2-button v2-button-ghost">
                  Explore solutions <span className="v2-mini-arrow" aria-hidden="true" />
                </Link>
              </div>
            </div>

            <div className="v2-big-mark" aria-hidden="true">TCL</div>
          </div>
        </section>
      </main>

      <BackToTop />
      <SiteFooter />
    </>
  );
}
