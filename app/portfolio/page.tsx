import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import styles from "./portfolio.module.css";

export const metadata: Metadata = {
  title: "Portfolio | TCL Systems & Digitals PH",
  description:
    "A selection of recent websites and business systems created by TCL Systems & Digitals PH.",
};

const recentWorks = [
  {
    name: "Point ZR Studio",
    type: "Custom Booking Website & System",
    description:
      "A custom booking website and admin system created for Point ZR Studio, built around their actual appointment workflow and business needs.",
    features: [
      "Customer booking experience",
      "Service and schedule management",
      "Admin dashboard",
      "Booking management workflow",
      "Responsive website",
    ],
    href: "https://pointzrstudio.vercel.app",
  },
];

export default function PortfolioPage() {
  return (
    <>
      <SiteHeader />

      <main className={styles.page}>
        <section className={styles.hero}>
          <div className="container">
            <div className={styles.heroInner}>
              <span className="section-kicker">Recent Work</span>
              <h1>Projects I&apos;ve built for real businesses.</h1>
              <p>
                A look at some of my recent client work — websites and systems
                designed around each business&apos;s actual needs, workflow, and
                customer experience.
              </p>

              <div className={styles.heroNote}>
                <span>♡</span>
                <p>
                  This TCL Systems &amp; Digitals PH website and the live demo
                  websites you see across the shop were also designed and built
                  by me. I keep this portfolio focused only on recent client
                  projects.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.workSection}>
          <div className="container">
            <div className={styles.sectionHeading}>
              <span className="section-kicker">Selected Projects</span>
              <h2>Recent client work</h2>
              <p>
                Each project is created based on the client&apos;s business,
                required features, and workflow rather than simply changing the
                name on one fixed design.
              </p>
            </div>

            <div className={styles.workGrid}>
              {recentWorks.map((work, index) => (
                <article className={styles.workCard} key={work.name}>
                  <div className={styles.preview}>
                    <div className={styles.browserBar}>
                      <span />
                      <span />
                      <span />
                    </div>

                    <div className={styles.previewBody}>
                      <small>{String(index + 1).padStart(2, "0")}</small>
                      <span>{work.type}</span>
                      <strong>{work.name}</strong>
                      <div className={styles.previewLine} />
                      <div className={`${styles.previewLine} ${styles.short}`} />
                    </div>
                  </div>

                  <div className={styles.cardContent}>
                    <span className={styles.type}>{work.type}</span>
                    <h3>{work.name}</h3>
                    <p>{work.description}</p>

                    <div className={styles.features}>
                      {work.features.map((feature) => (
                        <span key={feature}>✓ {feature}</span>
                      ))}
                    </div>

                    <a
                      href={work.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.viewButton}
                    >
                      View Project <span>↗</span>
                    </a>
                  </div>
                </article>
              ))}
            </div>

            <div className={styles.customCta}>
              <div>
                <span className="section-kicker">Have Something In Mind?</span>
                <h2>Want something built for your business?</h2>
                <p>
                  View the customized business website service first to see how
                  custom projects work, what can be included, and how to request
                  your quotation.
                </p>
              </div>

              <Link
                href="/shop/custom-business-website"
                className={styles.ctaButton}
              >
                View Custom Business Website →
              </Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
