import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCustomCheckoutState } from "@/lib/custom-order-payments";
import styles from "../custom-checkout.module.css";

export const dynamic = "force-dynamic";

function money(value: number | string | null | undefined) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value ?? 0));
}

export default async function CustomPaymentSuccessPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const checkout = await getCustomCheckoutState(token);

  if (!checkout) {
    notFound();
  }

  /*
   * This page is only for genuinely completed payments. A customer cannot use
   * the success URL to make an unpaid / unverified order appear paid.
   */
  if (checkout.state !== "FULLY_PAID") {
    redirect(`/checkout/custom/${token}`);
  }

  const order = checkout.order;
  const totalPaid = Number(order.amount_paid ?? order.total_amount ?? 0);

  const instagramUrl =
    process.env.TCL_INSTAGRAM_URL?.trim() ||
    "https://www.instagram.com/theclawlabmnl.systems/";

  const telegramUrl =
    process.env.TCL_TELEGRAM_URL?.trim() ||
    "https://t.me/tclsystemsanddigitalsph";

  const contactEmail = process.env.TCL_CONTACT_EMAIL?.trim() || "";
  const emailHref = contactEmail ? `mailto:${contactEmail}` : "/contact";

  return (
    <main className={styles.page}>
      <div
        className={styles.shell}
        style={{
          maxWidth: 920,
          minHeight: "100vh",
          display: "grid",
          alignContent: "center",
          paddingTop: 36,
          paddingBottom: 36,
        }}
      >
        <header className={styles.header}>
          <Link href="/" className={styles.brand}>
            TCL Systems &amp; Digitals PH
          </Link>
          <span>Payment Confirmed</span>
        </header>

        <section
          className={styles.card}
          style={{
            marginTop: 28,
            textAlign: "center",
            padding: "clamp(26px, 5vw, 52px)",
          }}
        >
          <div
            aria-hidden="true"
            style={{
              width: 68,
              height: 68,
              margin: "0 auto 18px",
              borderRadius: "50%",
              display: "grid",
              placeItems: "center",
              background: "#f3e5eb",
              fontSize: 30,
              fontWeight: 900,
            }}
          >
            ✓
          </div>

          <span className={styles.eyebrow}>PAYMENT VERIFIED</span>

          <h1
            style={{
              margin: "10px auto 10px",
              maxWidth: 650,
              fontSize: "clamp(2rem, 6vw, 3.6rem)",
              lineHeight: 1.05,
            }}
          >
            Thank you! Your payment is confirmed.
          </h1>

          <p
            style={{
              maxWidth: 660,
              margin: "0 auto",
              lineHeight: 1.75,
              opacity: 0.78,
            }}
          >
            Your payment has been successfully verified and your project is now
            fully paid. Please contact TCL Systems &amp; Digitals PH so we can
            continue with the next steps for your project.
          </p>

          <div
            style={{
              maxWidth: 560,
              margin: "28px auto 0",
              padding: 18,
              borderRadius: 16,
              background: "rgba(0,0,0,.035)",
              textAlign: "left",
              display: "grid",
              gap: 10,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 20,
              }}
            >
              <span>Order reference</span>
              <strong>{order.order_number}</strong>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 20,
              }}
            >
              <span>Payment status</span>
              <strong>Fully Paid ✓</strong>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 20,
              }}
            >
              <span>Total paid</span>
              <strong>{money(totalPaid)}</strong>
            </div>
          </div>

          <div style={{ marginTop: 30 }}>
            <strong style={{ display: "block", fontSize: "1.05rem" }}>
              What happens next?
            </strong>
            <p
              style={{
                maxWidth: 650,
                margin: "8px auto 0",
                lineHeight: 1.7,
                opacity: 0.76,
              }}
            >
              Message us through any of the channels below and include your
              order reference. We&apos;ll use it to confirm your project and
              continue the requirements, communication, and next steps.
            </p>
          </div>

          <div
            style={{
              marginTop: 22,
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
              gap: 10,
            }}
          >
            <a
              href={instagramUrl}
              target="_blank"
              rel="noreferrer"
              style={{
                minHeight: 48,
                borderRadius: 12,
                display: "grid",
                placeItems: "center",
                padding: "11px 16px",
                textDecoration: "none",
                fontWeight: 900,
                border: "1px solid #ead7df",
                background: "#fff7fa",
                color: "#2f2529",
              }}
            >
              Instagram / Social Media
            </a>

            <a
              href={telegramUrl}
              target="_blank"
              rel="noreferrer"
              style={{
                minHeight: 48,
                borderRadius: 12,
                display: "grid",
                placeItems: "center",
                padding: "11px 16px",
                textDecoration: "none",
                fontWeight: 900,
                border: "1px solid #d9dce9",
                background: "#f7f8ff",
                color: "#2f2529",
              }}
            >
              Telegram
            </a>

            <a
              href={emailHref}
              style={{
                minHeight: 48,
                borderRadius: 12,
                display: "grid",
                placeItems: "center",
                padding: "11px 16px",
                textDecoration: "none",
                fontWeight: 900,
                background: "#2f2529",
                color: "#fff",
              }}
            >
              Email TCL
            </a>
          </div>

          <p
            style={{
              margin: "18px 0 0",
              fontSize: ".82rem",
              lineHeight: 1.6,
              opacity: 0.64,
            }}
          >
            Telegram: @tclsystemsanddigitalsph
            {contactEmail ? (
              <>
                <br />
                Email: {contactEmail}
              </>
            ) : null}
          </p>

          <Link
            href="/"
            style={{
              display: "inline-block",
              marginTop: 26,
              color: "inherit",
              fontWeight: 800,
            }}
          >
            Return Home →
          </Link>
        </section>

        <footer className={styles.footer}>
          <span>Powered by TCL Systems &amp; Digitals PH</span>
          <span>Keep your order reference for future communication.</span>
        </footer>
      </div>
    </main>
  );
}
