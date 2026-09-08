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

        <div className="footer-column">
          <strong>Explore</strong>

          <Link href="/shop">Shop</Link>
          <Link href="/#categories">Categories</Link>
          <Link href="/#about">About Me</Link>
          <Link href="/#reviews">Reviews</Link>
          <Link href="/#how-it-works">How It Works</Link>
          <Link href="/#faq">FAQ</Link>
        </div>

        <div className="footer-column">
          <strong>Products</strong>

          <Link href="/shop/editable-booking-system">
            Editable Booking System
          </Link>

          <Link href="/shop">Website Solutions</Link>
          <Link href="/shop">Digital Products</Link>
          <Link href="/shop">Business Resources</Link>
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

  <a href="mailto:tclsystemsanddigitalsph@gmail.com">
    Email Us
  </a>

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

      <div className="container footer-bottom">
        <span>
          © {new Date().getFullYear()} TCL Systems &amp; Digitals PH. All
          rights reserved.
        </span>

        <div>
          <a href="#">Terms</a>
          <a href="#">Privacy</a>
        </div>
      </div>
    </footer>
  );
}