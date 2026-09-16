"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./SiteHeader.module.css";

const mainNavItems = [
  { label: "Shop", href: "/shop" },
  { label: "Portfolio", href: "/portfolio" },
  { label: "About", href: "/about" },
];

const helpItems = [
  { label: "How It Works", href: "/how-it-works" },
  { label: "FAQ", href: "/faqs" },
  { label: "Order Status", href: "/order-status" },
  { label: "Policies", href: "/policies" },
];

export default function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [mobileHelpOpen, setMobileHelpOpen] = useState(false);

  const closeMenu = () => {
    setMenuOpen(false);
    setMobileHelpOpen(false);
  };

  return (
    <>
      <header className="site-header">
        <div className="container nav-shell">
          <Link className="brand" href="/" onClick={closeMenu}>
            <span className="brand-logo-shell">
              <Image
                src="/tcl-logo.jpg"
                alt="TCL Systems & Digitals PH"
                width={64}
                height={64}
                className="brand-logo-image"
                priority
              />
            </span>

            <span className="brand-copy">
              <strong>TCL Systems</strong>
              <small>& Digitals PH</small>
            </span>
          </Link>

          <nav className="desktop-nav" aria-label="Main navigation">
            {mainNavItems.map((item) => (
              <Link href={item.href} key={item.href}>
                {item.label}
              </Link>
            ))}

            <div
              className={styles.helpMenu}
              onMouseEnter={() => setHelpOpen(true)}
              onMouseLeave={() => setHelpOpen(false)}
            >
              <button
                type="button"
                className={styles.helpTrigger}
                aria-expanded={helpOpen}
                onClick={() => setHelpOpen((current) => !current)}
              >
                Help
                <span
                  className={`${styles.chevron} ${
                    helpOpen ? styles.chevronOpen : ""
                  }`}
                  aria-hidden="true"
                >
                  ▾
                </span>
              </button>

              {helpOpen && (
                <div className={styles.helpDropdown}>
                  {helpItems.map((item) => (
                    <Link
                      href={item.href}
                      key={item.href}
                      onClick={() => setHelpOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </nav>

          <div className={styles.desktopActions}>
            <a
              href="https://t.me/tclsystemsanddigitalsph"
              target="_blank"
              rel="noreferrer"
              className={`${styles.actionButton} ${styles.contactButton}`}
            >
              Contact TCL
            </a>
          </div>

          <button
            type="button"
            className={styles.mobileMenuButton}
            aria-label="Open menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(true)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </header>

      {menuOpen && (
        <>
          <button
            type="button"
            className={styles.mobileOverlay}
            aria-label="Close menu"
            onClick={closeMenu}
          />

          <aside className={styles.mobileDrawer}>
            <div className={styles.drawerTop}>
              <div>
                <span className={styles.drawerEyebrow}>TCL STOREFRONT</span>
                <h2>Menu</h2>
              </div>

              <button
                type="button"
                className={styles.closeButton}
                onClick={closeMenu}
                aria-label="Close menu"
              >
                ×
              </button>
            </div>

            <nav
              className={styles.mobileNavigation}
              aria-label="Mobile navigation"
            >
              {mainNavItems.map((item) => (
                <Link href={item.href} key={item.href} onClick={closeMenu}>
                  <span>{item.label}</span>
                  <span aria-hidden="true">›</span>
                </Link>
              ))}

              <button
                type="button"
                className={styles.mobileHelpTrigger}
                aria-expanded={mobileHelpOpen}
                onClick={() => setMobileHelpOpen((current) => !current)}
              >
                <span>Help</span>
                <span
                  className={`${styles.mobileHelpChevron} ${
                    mobileHelpOpen ? styles.mobileHelpChevronOpen : ""
                  }`}
                  aria-hidden="true"
                >
                  ›
                </span>
              </button>

              {mobileHelpOpen && (
                <div className={styles.mobileHelpLinks}>
                  {helpItems.map((item) => (
                    <Link href={item.href} key={item.href} onClick={closeMenu}>
                      <span>{item.label}</span>
                      <span aria-hidden="true">›</span>
                    </Link>
                  ))}
                </div>
              )}
            </nav>

            <div className={styles.mobileBottom}>
              <a
                href="https://t.me/tclsystemsanddigitalsph"
                target="_blank"
                rel="noreferrer"
                className={styles.mobileContact}
                onClick={closeMenu}
              >
                <span>
                  <small>NEED HELP?</small>
                  <strong>Contact TCL</strong>
                </span>

                <span aria-hidden="true">↗</span>
              </a>
            </div>

            <p className={styles.drawerFooter}>
              TCL Systems & Digitals PH
            </p>
          </aside>
        </>
      )}
    </>
  );
}
