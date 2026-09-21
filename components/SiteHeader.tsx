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
      <header className={`site-header ${styles.header}`}>
        <div className={`container nav-shell ${styles.navShell}`}>
          <Link className={`brand ${styles.brand}`} href="/" onClick={closeMenu}>
            <span
              className={`brand-logo-shell ${styles.logoShell}`}
              style={{
                background: "transparent",
                border: "0",
                boxShadow: "none",
              }}
            >
              <Image
                src="/tcl-monogram.png"
                alt="TCL Systems & Digitals PH"
                width={120}
                height={120}
                className={`brand-logo-image ${styles.logo}`}
                priority
                style={{
                  objectFit: "contain",
                  background: "transparent",
                  filter:
                    "grayscale(1) saturate(0) brightness(2.15) contrast(0.88) drop-shadow(0 2px 2px rgba(0,0,0,.34)) drop-shadow(0 5px 8px rgba(0,0,0,.22))",
                  transform: "translateY(-2px) scale(1.08)",
                }}
              />
            </span>

            <span className={`brand-copy ${styles.brandCopy}`}>
              <strong>TCL Systems</strong>
              <small>& Digitals PH</small>
            </span>
          </Link>

          <nav className={`desktop-nav ${styles.desktopNav}`} aria-label="Main navigation">
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
              <span className={styles.buttonArrow} aria-hidden="true" />
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
                <span className={styles.drawerEyebrow}>TCL / NAVIGATION</span>
                <h2>Explore.</h2>
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

            <nav className={styles.mobileNavigation} aria-label="Mobile navigation">
              {mainNavItems.map((item, index) => (
                <Link href={item.href} key={item.href} onClick={closeMenu}>
                  <small>0{index + 1}</small>
                  <span>{item.label}</span>
                  <i className={styles.navArrow} aria-hidden="true" />
                </Link>
              ))}

              <button
                type="button"
                className={styles.mobileHelpTrigger}
                aria-expanded={mobileHelpOpen}
                onClick={() => setMobileHelpOpen((current) => !current)}
              >
                <small>04</small>
                <span>Help</span>
                <i
                  className={`${styles.navArrow} ${styles.mobileHelpChevron} ${
                    mobileHelpOpen ? styles.mobileHelpChevronOpen : ""
                  }`}
                  aria-hidden="true"
                />
              </button>

              {mobileHelpOpen && (
                <div className={styles.mobileHelpLinks}>
                  {helpItems.map((item) => (
                    <Link href={item.href} key={item.href} onClick={closeMenu}>
                      <span>{item.label}</span>
                      <i className={styles.navArrow} aria-hidden="true" />
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
                  <small>START A CONVERSATION</small>
                  <strong>Contact TCL</strong>
                </span>
                <i className={styles.contactArrow} aria-hidden="true" />
              </a>
            </div>

            <div className={styles.drawerFooter}>
              <span>TCL SYSTEMS & DIGITALS PH</span>
              <span>WEB / COMMERCE / BOOKING / SYSTEMS</span>
            </div>
          </aside>
        </>
      )}
    </>
  );
}
