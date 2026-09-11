import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import styles from "./portfolio.module.css";

export const metadata: Metadata = {
  title: "Portfolio | TCL Systems & Digitals PH",
  description:
    "Recent client projects built by TCL Systems & Digitals PH, including custom websites and booking systems.",
};

const recentWorks = [
  {
    name: "Point ZR Studio",
    type: "Custom Booking System",
    description:
      "A custom booking website and admin system designed for a solo service business, with booking management, services, schedules, and a responsive customer experience.",
    features: [
      "Customer booking experience",
      "Service & schedule management",
      "Admin dashboard",
      "Booking management workflow",
      "Responsive website",
    ],
    href: "https://pointzrstudio.vercel.app",
  },
  {
    name: "TheClawLabMNL",
    type: "Business Website",
    description:
      "A business website created for TheClawLabMNL, designed with a clean branded layout to present the business professionally online.",
    features: [
      "Branded business website",
      "Responsive layout",
      "Service-focused presentation",
      "Mobile-friendly experience",
      "Custom visual direction",
    ],
    href: "https://theclawlabmnl.vercel.app",
  },
];

export default function PortfolioPage() {
  return (
    <>
      <SiteHeader />

      <main className={styles.main}>
        <section className={styles.hero}>
          <div className={styles.heroInner}>
            <span className={styles.kicker}>Recent Work</span>
            <h1>Projects I&apos;ve built for real businesses.</h1>
            <p>
              A selection of recent client projects created by TCL Systems &amp;
              Digitals PH.
            </p>
          </div>
        </section>

        <section className={styles.portfolioSection}>
          <div className={styles.container}>
            <div className={styles.intro}>
              <span className={styles.kicker}>Portfolio</span>
              <h2>Recent client projects</h2>
              <p>
                This TCL Systems &amp; Digitals PH website and the live demo
                websites you see across the shop were also designed and built
                by me. I keep this portfolio focused on recent business
                projects.
              </p>
            </div>

            <div className={styles.grid}>
              {recentWorks.map((project) => (
                <article className={styles.card} key={project.name}>
                  <div className={styles.preview} aria-hidden="true">
                    <div className={styles.browserBar}>
                      <span />
                      <span />
                      <span />
                    </div>
                    <div className={styles.previewBody}>
                      <div className={styles.previewLabel}>{project.name}</div>
                      <div className={styles.previewLineLarge} />
                      <div className={styles.previewLine} />
                      <div className={styles.previewLineShort} />
                    </div>
                  </div>

                  <div className={styles.cardBody}>
                    <span className={styles.projectType}>{project.type}</span>
                    <h3>{project.name}</h3>
                    <p>{project.description}</p>

                    <div className={styles.featureList}>
                      {project.features.map((feature) => (
                        <span key={feature}>✓ {feature}</span>
                      ))}
                    </div>

                    <a
                      className={styles.projectButton}
                      href={project.href}
                      target="_blank"
                      rel="noreferrer"
                    >
                      View Project
                    </a>
                  </div>
                </article>
              ))}
            </div>

            <div className={styles.cta}>
              <div>
                <span className={styles.kicker}>Have a project in mind?</span>
                <h2>Let&apos;s build something for your business.</h2>
              </div>
              <Link href="/shop/custom-business-website">
                View Custom Website
              </Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
