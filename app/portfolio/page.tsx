import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import styles from "./portfolio.module.css";

export const metadata: Metadata = {
  title: "Portfolio | TCL Systems & Digitals PH",
  description:
    "Selected websites and custom web systems built by TCL Systems & Digitals PH for real businesses.",
};

const recentWorks = [
  {
    number: "01",
    name: "Point ZR Studio",
    type: "Custom Booking System",
    urlLabel: "pointzrstudio.vercel.app",
    description:
      "A custom booking website and management system designed around the day-to-day needs of a solo service business.",
    features: [
      "Online Booking",
      "Services & Variations",
      "Availability",
      "Booking Management",
      "Admin Dashboard",
      "Mobile-Friendly",
    ],
    technologies: ["Next.js", "Supabase", "Vercel"],
    href: "https://pointzrstudio.vercel.app",
    preview: "booking",
  },
  {
    number: "02",
    name: "TheClawLabMNL",
    type: "Business Website",
    urlLabel: "theclawlabmnl.vercel.app",
    description:
      "A branded business website created for TheClawLabMNL with a clean customer-facing experience and a visual direction built around the brand.",
    features: [
      "Business Website",
      "Service Presentation",
      "Branded Design",
      "Responsive Layout",
      "Mobile-Friendly",
    ],
    technologies: ["Next.js", "React", "Vercel"],
    href: "https://theclawlabmnl.vercel.app",
    preview: "business",
  },
];

export default function PortfolioPage() {
  return (
    <>
      <SiteHeader />

      <main className={styles.main}>
        {/* HERO */}
        <section className={styles.hero}>
          <div className={styles.heroInner}>
            <span className={styles.heroKicker}>SELECTED WORK</span>

            <h1>
              Built for real
              <span>business needs.</span>
            </h1>

            <p>
              A growing collection of websites and web-based systems designed
              and developed by TCL Systems &amp; Digitals PH.
            </p>

            <div className={styles.heroStats}>
              <div>
                <strong>100%</strong>
                <span>Custom Coded</span>
              </div>

              <div>
                <strong>1:1</strong>
                <span>Business-Focused</span>
              </div>

              <div>
                <strong>Web</strong>
                <span>Modern Solutions</span>
              </div>
            </div>
          </div>
        </section>

        {/* PORTFOLIO INTRO */}
        <section className={styles.portfolioSection}>
          <div className={styles.container}>
            <div className={styles.intro}>
              <span className={styles.kicker}>PORTFOLIO</span>

              <h2>Selected client projects.</h2>

              <p className={styles.introDescription}>
                Each project is developed around the business it belongs to —
                from how customers interact with the website to the tools needed
                behind it.
              </p>

              <div className={styles.tclNote}>
                <span className={styles.noteHeart}>♡</span>

                <p>
                  This TCL Systems &amp; Digitals PH storefront and the live
                  demo websites across the shop were also designed and built by
                  me. This portfolio is kept focused on selected business and
                  client projects.
                </p>
              </div>
            </div>

            {/* PROJECTS */}
            <div className={styles.grid}>
              {recentWorks.map((project) => (
                <article className={styles.card} key={project.name}>
                  {/* BROWSER PREVIEW */}
                  <div className={styles.preview}>
                    <div className={styles.browserTop}>
                      <div className={styles.browserDots}>
                        <span />
                        <span />
                        <span />
                      </div>

                      <div className={styles.browserAddress}>
                        <span className={styles.lock}>●</span>
                        <span>{project.urlLabel}</span>
                      </div>

                      <div className={styles.browserSpacer} />
                    </div>

                    {project.preview === "booking" ? (
                      <div className={styles.bookingPreview}>
                        <div className={styles.previewNav}>
                          <div className={styles.fakeLogo}>PZ</div>

                          <div className={styles.fakeNav}>
                            <span />
                            <span />
                            <span />
                          </div>
                        </div>

                        <div className={styles.bookingHero}>
                          <div className={styles.bookingCopy}>
                            <span className={styles.fakeEyebrow}>
                              POINT ZR STUDIO
                            </span>

                            <div className={styles.fakeHeading}>
                              <span />
                              <span />
                            </div>

                            <div className={styles.fakeText}>
                              <span />
                              <span />
                            </div>

                            <div className={styles.fakeButton} />
                          </div>

                          <div className={styles.bookingPanel}>
                            <div className={styles.panelHeading}>
                              Book an Appointment
                            </div>

                            <div className={styles.panelRow}>
                              <span />
                              <strong />
                            </div>

                            <div className={styles.panelRow}>
                              <span />
                              <strong />
                            </div>

                            <div className={styles.panelButton} />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className={styles.businessPreview}>
                        <div className={styles.previewNav}>
                          <div className={styles.clawLogo}>TCL</div>

                          <div className={styles.fakeNav}>
                            <span />
                            <span />
                            <span />
                          </div>
                        </div>

                        <div className={styles.businessHero}>
                          <div className={styles.businessCopy}>
                            <span className={styles.fakeEyebrow}>
                              THECLAWLABMNL
                            </span>

                            <div className={styles.fakeHeading}>
                              <span />
                              <span />
                            </div>

                            <div className={styles.fakeText}>
                              <span />
                              <span />
                            </div>

                            <div className={styles.fakeButtonPink} />
                          </div>

                          <div className={styles.nailVisual}>
                            <span className={styles.sparkle}>♡</span>
                            <div className={styles.visualCard}>
                              <div />
                              <div />
                              <div />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* PROJECT CONTENT */}
                  <div className={styles.cardBody}>
                    <div className={styles.projectTop}>
                      <span className={styles.projectNumber}>
                        PROJECT {project.number}
                      </span>

                      <span className={styles.projectType}>
                        {project.type}
                      </span>
                    </div>

                    <h3>{project.name}</h3>

                    <p className={styles.description}>
                      {project.description}
                    </p>

                    <div className={styles.featureList}>
                      {project.features.map((feature) => (
                        <span key={feature}>{feature}</span>
                      ))}
                    </div>

                    <div className={styles.techSection}>
                      <span className={styles.techLabel}>BUILT WITH</span>

                      <div className={styles.techList}>
                        {project.technologies.map((technology) => (
                          <span key={technology}>{technology}</span>
                        ))}
                      </div>
                    </div>

                    <div className={styles.projectActions}>
                      <a
                        className={styles.projectButton}
                        href={project.href}
                        target="_blank"
                        rel="noreferrer"
                      >
                        View Live Project <span>↗</span>
                      </a>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* APPROACH */}
        <section className={styles.approachSection}>
          <div className={styles.container}>
            <div className={styles.approachGrid}>
              <div className={styles.approachHeading}>
                <span className={styles.lightKicker}>THE APPROACH</span>

                <h2>
                  Every project starts
                  <span>with what the business needs.</span>
                </h2>
              </div>

              <div className={styles.approachItems}>
                <div>
                  <span>01</span>

                  <div>
                    <strong>Understand</strong>
                    <p>
                      Start with the business, its customers, and what the
                      website or system actually needs to accomplish.
                    </p>
                  </div>
                </div>

                <div>
                  <span>02</span>

                  <div>
                    <strong>Design &amp; Build</strong>
                    <p>
                      Create the customer experience and develop the
                      functionality needed behind it.
                    </p>
                  </div>
                </div>

                <div>
                  <span>03</span>

                  <div>
                    <strong>Deliver</strong>
                    <p>
                      Test the experience across devices and prepare the project
                      for its final launch and turnover.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className={styles.ctaSection}>
          <div className={styles.container}>
            <div className={styles.cta}>
              <div>
                <span className={styles.kicker}>HAVE A PROJECT IN MIND?</span>

                <h2>
                  Your business could be
                  <span>the next project.</span>
                </h2>

                <p>
                  Tell TCL what you need and request a quotation for a website
                  or custom web-based solution built around your business.
                </p>
              </div>

              <div className={styles.ctaActions}>
                <Link
                  href="/shop/custom-business-website"
                  className={styles.ctaPrimary}
                >
                  Request a Quote <span>→</span>
                </Link>

                <Link href="/shop" className={styles.ctaSecondary}>
                  Browse Solutions
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}