import Image from "next/image";
import Link from "next/link";
import styles from "./SiteHeader.module.css";

const navItems = [
  { label: "Shop", href: "/shop" },
  { label: "Portfolio", href: "/portfolio" },
  { label: "Order Status", href: "/order-status" },
  { label: "About Me", href: "/#about" },
  { label: "Reviews", href: "/#reviews" },
  { label: "How It Works", href: "/how-it-works" },
  { label: "FAQ", href: "/faqs" },
];

export default function SiteHeader() {
  return (
    <header className="site-header">
      <div className="container nav-shell">
        <Link className="brand" href="/">
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
          {navItems.map((item) => (
            <Link href={item.href} key={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className={styles.actions}>
          <Link
            href="/admin/login"
            className={`${styles.actionButton} ${styles.adminButton}`}
          >
            Admin Sign In
          </Link>

          <a
            className={`${styles.actionButton} ${styles.contactButton}`}
            href="https://t.me/tclsystemsanddigitalsph"
            target="_blank"
            rel="noreferrer"
          >
            Contact TCL
          </a>
        </div>
      </div>

      <nav className={styles.mobileNav} aria-label="Mobile navigation">
        <div className={styles.mobileTrack}>
          {navItems.map((item) => (
            <Link href={item.href} key={item.href} className={styles.mobilePill}>
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
