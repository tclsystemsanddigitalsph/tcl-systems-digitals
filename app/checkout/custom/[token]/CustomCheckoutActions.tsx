"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./custom-checkout.module.css";

type Provider = "PAYPAL" | "PAYMONGO";

export default function CustomCheckoutActions({
  token,
}: {
  token: string;
}) {
  const [loading, setLoading] = useState<Provider | null>(null);
  const [error, setError] = useState("");
  const popupRef = useRef<Window | null>(null);
  const closeWatcherRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (closeWatcherRef.current !== null) {
        window.clearInterval(closeWatcherRef.current);
      }
    };
  }, []);

  function openCenteredPaymentWindow() {
    const width = Math.min(560, Math.max(420, window.innerWidth - 80));
    const height = Math.min(760, Math.max(620, window.innerHeight - 100));

    const left = Math.max(
      0,
      window.screenX + Math.round((window.outerWidth - width) / 2),
    );

    const top = Math.max(
      0,
      window.screenY + Math.round((window.outerHeight - height) / 2),
    );

    return window.open(
      "about:blank",
      "tcl-custom-payment",
      [
        `width=${width}`,
        `height=${height}`,
        `left=${left}`,
        `top=${top}`,
        "resizable=yes",
        "scrollbars=yes",
        "status=no",
        "toolbar=no",
        "menubar=no",
        "location=yes",
      ].join(","),
    );
  }

  function watchForPopupClose(popup: Window) {
    if (closeWatcherRef.current !== null) {
      window.clearInterval(closeWatcherRef.current);
    }

    closeWatcherRef.current = window.setInterval(() => {
      if (popup.closed) {
        if (closeWatcherRef.current !== null) {
          window.clearInterval(closeWatcherRef.current);
          closeWatcherRef.current = null;
        }

        popupRef.current = null;
        setLoading(null);
        window.location.reload();
      }
    }, 700);
  }

  async function startPayment(provider: Provider) {
    setLoading(provider);
    setError("");

    const popup = openCenteredPaymentWindow();

    if (!popup) {
      setLoading(null);
      setError(
        "Your browser blocked the payment window. Please allow pop-ups for this site and try again.",
      );
      return;
    }

    popupRef.current = popup;

    try {
      popup.document.title = "Secure Payment | TCL Systems & Digitals PH";
      popup.document.body.innerHTML = `
        <div style="
          min-height:100vh;
          display:grid;
          place-items:center;
          margin:0;
          padding:24px;
          box-sizing:border-box;
          background:#fff8fb;
          color:#2e2228;
          font-family:Arial,Helvetica,sans-serif;
          text-align:center;
        ">
          <div>
            <div style="
              margin-bottom:10px;
              font-size:12px;
              font-weight:800;
              letter-spacing:.12em;
              color:#b05d83;
            ">SECURE PAYMENT</div>
            <div style="
              font-size:18px;
              font-weight:800;
            ">Preparing your checkout…</div>
          </div>
        </div>
      `;
    } catch {
      // Continue even if the temporary loading screen cannot be written.
    }

    watchForPopupClose(popup);

    try {
      const endpoint =
        provider === "PAYPAL"
          ? "/api/custom-checkout/paypal/create"
          : "/api/custom-checkout/paymongo";

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.error || "Unable to start payment.");
      }

      const destination =
        provider === "PAYPAL" ? result?.approvalUrl : result?.checkoutUrl;

      if (!destination || typeof destination !== "string") {
        throw new Error("Payment provider did not return a checkout link.");
      }

      if (popup.closed) {
        throw new Error(
          "The payment window was closed before checkout could open.",
        );
      }

      popup.location.href = destination;
      popup.focus();
    } catch (paymentError) {
      if (!popup.closed) {
        popup.close();
      }

      if (closeWatcherRef.current !== null) {
        window.clearInterval(closeWatcherRef.current);
        closeWatcherRef.current = null;
      }

      popupRef.current = null;
      setLoading(null);

      setError(
        paymentError instanceof Error
          ? paymentError.message
          : "Unable to start payment.",
      );
    }
  }

  return (
    <div className={styles.paymentSection}>
      <div className={styles.paymentExplanations}>
        <button
          type="button"
          className={styles.paymentExplanationCard}
          onClick={() => startPayment("PAYPAL")}
          disabled={loading !== null}
          style={{
            background: "#fff4f8",
            border: "1.5px solid #d77da3",
            color: "#2f1f27",
            boxShadow: "0 8px 22px rgba(176, 93, 131, 0.10)",
          }}
        >
          <strong style={{ color: "#8f365e" }}>
            PayPal / Debit or Credit Card
          </strong>
          <p style={{ color: "#5f4b55" }}>
            Pay using your PayPal account, or continue as a guest using a
            supported debit or credit card when the guest card option is
            available on PayPal.
          </p>
          <span
            className={styles.paymentCardAction}
            style={{ color: "#a93f70", fontWeight: 800 }}
          >
            {loading === "PAYPAL"
              ? "Opening PayPal / Card…"
              : "Continue with PayPal / Card →"}
          </span>
        </button>

        <button
          type="button"
          className={styles.paymentExplanationCard}
          onClick={() => startPayment("PAYMONGO")}
          disabled={loading !== null}
          style={{
            background: "#f7f2ff",
            border: "1.5px solid #9b7fd0",
            color: "#2b2333",
            boxShadow: "0 8px 22px rgba(94, 72, 133, 0.10)",
          }}
        >
          <strong style={{ color: "#674b9f" }}>QR Ph</strong>
          <p style={{ color: "#5b5068" }}>
            Scan the QR code using a supported e-wallet or mobile banking app to
            complete your payment.
          </p>
          <span
            className={styles.paymentCardAction}
            style={{ color: "#6b4baa", fontWeight: 800 }}
          >
            {loading === "PAYMONGO"
              ? "Opening QR Ph…"
              : "Continue with QR Ph →"}
          </span>
        </button>
      </div>

      {loading ? (
        <p className={styles.paymentPopupNote}>
          Complete your payment in the separate payment window. When you close
          it, this page will refresh your payment status automatically.
        </p>
      ) : null}

      {error ? <p className={styles.error}>{error}</p> : null}
    </div>
  );
}
