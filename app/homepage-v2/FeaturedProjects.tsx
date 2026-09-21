"use client";

import { useCallback, useEffect, useState } from "react";

const projects = [
  {
    name: "POINT ZR STUDIO",
    category: "CUSTOM BOOKING SYSTEM",
    url: "https://pointzrstudio.vercel.app",
    displayUrl: "pointzrstudio.vercel.app",
    tags: ["BOOKING FLOW", "AVAILABILITY", "ADMIN", "RESPONSIVE"],
    brand: "pointzr",
  },
  {
    name: "MASTERYHUB REVIEW",
    category: "REVIEWER SYSTEM",
    url: "https://masteryhubreview.vercel.app",
    displayUrl: "masteryhubreview.vercel.app",
    tags: ["STUDENT ACCESS", "QUESTION BANKS", "ADMIN", "RESPONSIVE"],
    brand: "masteryhub",
  },
  {
    name: "THECLAWLABMNL",
    category: "BRAND WEBSITE",
    url: "/portfolio",
    displayUrl: "TCL / PORTFOLIO",
    tags: ["BRANDING", "BUSINESS WEBSITE", "RESPONSIVE", "TCL"],
    brand: "clawlab",
  },
] as const;

function PointZRPreview() {
  return (
    <div className="v2-brand-preview v2-pointzr-preview">
      <nav className="v2-brand-nav">
        <div className="v2-pointzr-wordmark">
          <strong>POINT ZR</strong>
          <span>STUDIO · NAILS BY LLYSA</span>
        </div>
        <div className="v2-brand-nav-lines"><i /><i /><i /></div>
      </nav>

      <div className="v2-pointzr-hero">
        <div className="v2-pointzr-copy">
          <span>NAIL ART · WITH PERSONALITY</span>
          <h3>YOUR NAILS,<br />YOUR KIND<br /><em>OF COLOR.</em></h3>
          <p>
            Thoughtfully created nail sets with careful shaping, clean details,
            and designs made to feel like you.
          </p>
          <b>BOOK AN APPOINTMENT <i className="v2-project-line-arrow" aria-hidden="true" /></b>
        </div>

        <div className="v2-pointzr-nail-stage" aria-hidden="true">
          <div className="v2-pointzr-nail-card">
            <span>✦</span>
            <div className="v2-pointzr-fingers"><i /><i /><i /><i /></div>
            <small>♥</small>
          </div>
          <div className="v2-pointzr-studio-note">
            <strong>ONE CLIENT AT A TIME</strong>
            <span>QUALITY OVER SPEED · NAILS BY LLYSA</span>
          </div>
        </div>
      </div>

      <span className="v2-brand-watermark">POINT ZR</span>
    </div>
  );
}

function MasteryHubPreview() {
  return (
    <div className="v2-brand-preview v2-mastery-preview">
      <nav className="v2-brand-nav">
        <div className="v2-mastery-brand">
          <div className="v2-mastery-logo">M</div>
          <div><strong>MasteryHub</strong><span>REVIEW SYSTEM</span></div>
        </div>
        <div className="v2-mastery-links"><i /><i /><i /></div>
      </nav>

      <div className="v2-mastery-hero">
        <div className="v2-mastery-copy">
          <span>LEARN • REVIEW • MASTER</span>
          <h3>YOUR REVIEW.<br /><em>ORGANIZED.</em></h3>
          <p>
            Subjects, reviewers, question banks, attempts, and student access
            brought together in one focused learning system.
          </p>
          <b>START REVIEWING <i className="v2-project-line-arrow" aria-hidden="true" /></b>
        </div>

        <div className="v2-mastery-dashboard">
          <div className="v2-mastery-dashboard-top">
            <span>MY SUBJECTS</span><b>3</b>
          </div>
          <article>
            <i>PC</i>
            <div><strong>Plumbing Code</strong><span>Reviewer available</span></div>
          </article>
          <article>
            <i>01</i>
            <div><strong>Practice Reviewer</strong><span>Continue review</span></div>
          </article>
          <article>
            <i>QB</i>
            <div><strong>Question Bank</strong><span>Ready to practice</span></div>
          </article>
          <div className="v2-mastery-progress"><span /></div>
        </div>
      </div>

      <span className="v2-brand-watermark">MASTERYHUB</span>
    </div>
  );
}

function ClawLabPreview() {
  return (
    <div className="v2-brand-preview v2-clawlab-preview">
      <nav className="v2-brand-nav">
        <div className="v2-clawlab-logo">THECLAWLABMNL</div>
        <div className="v2-clawlab-links"><i /><i /><i /></div>
      </nav>

      <div className="v2-clawlab-hero">
        <div className="v2-clawlab-copy">
          <span>BEAUTY • NAILS • CREATIVE BRAND</span>
          <h3>DETAILS THAT<br /><em>MAKE A STATEMENT.</em></h3>
          <p>
            A soft, feminine digital identity inspired by the original
            TheClawLabMNL brand and its creative roots.
          </p>
          <b>EXPLORE THE BRAND <i className="v2-project-line-arrow" aria-hidden="true" /></b>
        </div>

        <div className="v2-clawlab-art" aria-hidden="true">
          <span>✦</span>
          <div className="v2-nail-card">
            <i /><i /><i />
          </div>
          <small>♡</small>
        </div>
      </div>

      <span className="v2-brand-watermark">THECLAWLABMNL</span>
    </div>
  );
}

function BrandPreview({ brand }: { brand: (typeof projects)[number]["brand"] }) {
  if (brand === "pointzr") return <PointZRPreview />;
  if (brand === "masteryhub") return <MasteryHubPreview />;
  return <ClawLabPreview />;
}

export default function FeaturedProjects() {
  const [active, setActive] = useState(0);

  const next = useCallback(() => {
    setActive((current) => (current + 1) % projects.length);
  }, []);

  const previous = useCallback(() => {
    setActive((current) => (current - 1 + projects.length) % projects.length);
  }, []);

  useEffect(() => {
    const timer = window.setInterval(next, 5000);
    return () => window.clearInterval(timer);
  }, [next]);

  return (
    <div className="v2-project-slider">
      <div className="v2-project-viewport">
        <div
          className="v2-project-track"
          style={{ transform: `translateX(-${active * 100}%)` }}
        >
          {projects.map((project, index) => (
            <article className="v2-project-slide" key={project.name}>
              <div className="v2-project-browser-stage">
                <div className="v2-project-browser">
                  <div className="v2-project-browser-bar">
                    <div className="v2-dots"><i /><i /><i /></div>
                    <span>{project.displayUrl}</span>
                    <b className="v2-browser-line-arrow" aria-hidden="true" />
                  </div>

                  <BrandPreview brand={project.brand} />
                </div>
              </div>

              <div className="v2-project-meta">
                <div>
                  <small className="v2-project-brand-label">{project.category}</small>
                  <strong className="v2-project-brand-name">{project.name}</strong>
                </div>

                <div className="v2-project-tags">
                  {project.tags.map((tag) => <span key={tag}>{tag}</span>)}
                </div>

                <a
                  href={project.url}
                  target={project.url.startsWith("http") ? "_blank" : undefined}
                  rel={project.url.startsWith("http") ? "noreferrer" : undefined}
                  className="v2-project-open"
                >
                  VIEW PROJECT <i className="v2-project-line-arrow" aria-hidden="true" />
                </a>

                <span className="v2-project-counter">
                  {String(index + 1).padStart(2, "0")} / {String(projects.length).padStart(2, "0")}
                </span>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="v2-project-controls">
        <div className="v2-project-dots" aria-label="Featured project slides">
          {projects.map((project, index) => (
            <button
              key={project.name}
              type="button"
              className={`v2-project-dot ${active === index ? "active" : ""}`}
              onClick={() => setActive(index)}
              aria-label={`Show ${project.name}`}
            />
          ))}
        </div>

        <div className="v2-project-arrows">
          <button type="button" className="v2-project-arrow" onClick={previous} aria-label="Previous project"><span className="v2-mini-arrow v2-mini-arrow-left" aria-hidden="true" /></button>
          <button type="button" className="v2-project-arrow" onClick={next} aria-label="Next project"><span className="v2-mini-arrow" aria-hidden="true" /></button>
        </div>
      </div>
    </div>
  );
}
