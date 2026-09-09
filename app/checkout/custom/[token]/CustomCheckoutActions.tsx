"use client";

import { useState } from "react";
import styles from "./custom-checkout.module.css";

export default function CustomCheckoutActions({
  token,
}: {
  token: string;
}) {
  const [loading, setLoading] = useState<"PAYPAL" | "PAYMONGO" | null>(null);
  const [error, setError] = useState("");

  async function startPayment(provider: "PAYPAL" | "PAYMONGO") {
    setLoading(provider);
    setError("");

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
        provider === "PAYPAL"
          ? result?.approvalUrl
          : result?.checkoutUrl;

      if (!destination || typeof destination !== "string") {
        throw new Error("Payment provider did not return a checkout link.");
      }

      window.location.href = destination;
    } catch (paymentError) {
      setError(
        paymentError instanceof Error
          ? paymentError.message
          : "Unable to start payment.",
      );
      setLoading(null);
    }
  }

  return (
    <div className={styles.paymentActions}>
      <button
        type="button"
        className={styles.paypalButton}
        onClick={() => startPayment("PAYPAL")}
        disabled={loading !== null}
      >
        {loading === "PAYPAL" ? "Opening PayPal…" : "Pay with PayPal"}
      </button>

      <button
        type="button"
        className={styles.qrButton}
        onClick={() => startPayment("PAYMONGO")}
        disabled={loading !== null}
      >
        {loading === "PAYMONGO" ? "Preparing QR Ph…" : "Pay with QR Ph"}
      </button>

      {error ? <p className={styles.error}>{error}</p> : null}
    </div>
  );
}
