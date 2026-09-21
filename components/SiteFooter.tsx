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
                src="/tcl-monogram.png"
                alt="TCL Systems & Digitals PH"
                width={64}
                height={64}
                className="brand-logo-image"
              />
            </span>
            <span className="brand-copy">
              <strong>TCL Systems & Digitals PH</strong>
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
            <Link href="/admin">Admin Sign In</Link>
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

        .site-footer .brand-logo-shell {
          background: transparent !important;
          border: 0 !important;
          border-radius: 0 !important;
          box-shadow: none !important;
          overflow: visible !important;
        }

        .site-footer .brand-logo-image {
          object-fit: contain !important;
          background: transparent !important;
          filter:
            grayscale(1)
            saturate(0)
            brightness(2.15)
            contrast(.88)
            drop-shadow(0 4px 7px rgba(0, 0, 0, .16))
            drop-shadow(0 0 10px rgba(229, 169, 191, .13));
          transform: translateY(-2px) scale(1.08);
        }

        @media (max-width: 640px) {
          .site-footer .footer-grid {
            display: grid !important;
            grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
            column-gap: 12px !important;
            row-gap: 0 !important;
            align-items: start !important;
          }

          .site-footer .footer-brand {
            grid-column: 1 / -1 !important;
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
            display: contents !important;
          }

          .site-footer .footer-column {
            display: flex !important;
            min-width: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            flex-direction: column !important;
            align-items: center !important;
            gap: 7px !important;
            text-align: center !important;
          }

          .site-footer .footer-column:nth-of-type(1) {
            grid-column: 1 !important;
          }

          .site-footer .footer-column:nth-of-type(2) {
            grid-column: 2 !important;
          }

          .site-footer .footer-column:nth-of-type(3) {
            grid-column: 3 !important;
          }

          .site-footer .footer-column > strong {
            margin: 0 0 5px !important;
            white-space: nowrap !important;
            font-size: .67rem !important;
          }

          .site-footer .footer-column a {
            display: block !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            font-size: .53rem !important;
            line-height: 1.3 !important;
            text-align: center !important;
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
