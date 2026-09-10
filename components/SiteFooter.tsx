import Image from "next/image";
import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="site-footer" id="footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <Link className="brand" href="/">
            <span className="brand-logo-shell">
              <Image
                src="/tcl-logo.jpg"
                alt="TCL Systems & Digitals PH"
                width={64}
                height={64}
                className="brand-logo-image"
              />
            </span>
            <span className="brand-copy">
              <strong>TCL Systems & Digitals</strong>
              <small>PH</small>
            </span>
          </Link>

          <p>
            Smart systems and beautiful digital solutions for modern small
            businesses.
          </p>

          <span className="origin-label">
            From <strong>TheClawLabMNL</strong>
          </span>
        </div>

        <div className="footer-links-grid">
          <div className="footer-column">
            <strong>Explore</strong>
            <Link href="/shop">Shop</Link>
            <Link href="/portfolio">Portfolio</Link>
            <Link href="/#categories">Categories</Link>
            <Link href="/order-status">Order Status</Link>
            <Link href="/#about">About Me</Link>
            <Link href="/#reviews">Reviews</Link>
            <Link href="/how-it-works">How It Works</Link>
            <Link href="/faqs">FAQ</Link>
          </div>

          <div className="footer-column">
            <strong>Products</strong>
            <Link href="/shop/editable-booking-system">Booking System</Link>
            <Link href="/shop">Websites</Link>
            <Link href="/shop">Digital Products</Link>
            <Link href="/shop">Business Tools</Link>
          </div>

          <div className="footer-column">
            <strong>Connect</strong>
            <a
              href="https://t.me/tclsystemsanddigitalsph"
              target="_blank"
              rel="noreferrer"
            >
              Telegram
            </a>
            <a href="mailto:tclsystemsanddigitalsph@gmail.com">Email</a>
            <a
              href="https://www.facebook.com/tclsystemsanddigitalsph"
              target="_blank"
              rel="noopener noreferrer"
            >
              Facebook
            </a>
            <a
              href="https://www.instagram.com/theclawlabmnl.systems"
              target="_blank"
              rel="noopener noreferrer"
            >
              Instagram
            </a>
          </div>
        </div>
      </div>

      <div className="container footer-bottom">
        <span>
          © {new Date().getFullYear()} TCL Systems &amp; Digitals PH. All rights
          reserved.
        </span>
        <div>
          <Link href="/policies">Terms</Link>
          <Link href="/policies">Privacy</Link>
        </div>
      </div>

      <style>{`
        .site-footer .footer-links-grid {
          display: contents;
        }

        @media (max-width: 640px) {
          .site-footer .footer-grid {
            display: block !important;
          }

          .site-footer .footer-brand {
            width: 100% !important;
            margin: 0 0 22px !important;
            text-align: center !important;
          }

          .site-footer .footer-brand .brand,
          .site-footer .origin-label {
            justify-content: center !important;
          }

          .site-footer .footer-brand p {
            max-width: 290px !important;
            margin-left: auto !important;
            margin-right: auto !important;
          }

          .site-footer .footer-links-grid {
            display: grid !important;
            width: 100% !important;
            grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
            gap: 10px !important;
            align-items: start !important;
          }

          .site-footer .footer-links-grid .footer-column {
            display: flex !important;
            min-width: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 4px !important;
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 7px !important;
            text-align: left !important;
          }

          .site-footer .footer-links-grid .footer-column > strong {
            margin: 0 0 4px !important;
            font-size: .66rem !important;
          }

          .site-footer .footer-links-grid .footer-column a {
            display: block !important;
            width: auto !important;
            margin: 0 !important;
            padding: 0 !important;
            font-size: .54rem !important;
            line-height: 1.3 !important;
            overflow-wrap: anywhere !important;
          }

          .site-footer .footer-bottom {
            margin-top: 24px !important;
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            gap: 8px !important;
            text-align: center !important;
          }

          .site-footer .footer-bottom > div {
            justify-content: center !important;
          }
        }
      `}</style>
    </footer>
  );
}
