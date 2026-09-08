import Image from "next/image";
import Link from "next/link";

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
            <strong>TCL Systems & Digitals</strong>
            <small>PH</small>
          </span>
        </Link>

        <nav className="desktop-nav" aria-label="Main navigation">
          <Link href="/shop">Shop</Link>
          <Link href="/#categories">Categories</Link>
          <Link href="/#about">About Me</Link>
          <Link href="/#reviews">Reviews</Link>
          <Link href="/#how-it-works">How It Works</Link>
          <Link href="/#faq">FAQ</Link>
        </nav>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            flexShrink: 0,
          }}
        >
          <Link
            href="/admin/login"
            className="nav-button"
            aria-label="Admin sign in"
            style={{
              background: "#ffffff",
              color: "var(--pink-700)",
              border: "1px solid var(--border-strong)",
            }}
          >
            Admin Sign In
          </Link>

          <a
            className="nav-button"
            href="https://t.me/tclsystemsanddigitalsph"
            target="_blank"
            rel="noreferrer"
            aria-label="Contact TCL Systems & Digitals PH on Telegram"
          >
            Contact TCL
          </a>
        </div>
      </div>
    </header>
  );
}
