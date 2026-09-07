"use client";

import { FormEvent, useState } from "react";
import styles from "./checkout.module.css";

type PaymentMethod =
  | "PAYPAL"
  | "PAYMONGO";

export default function CheckoutForm({
  productSlug,
  cancelled,
  paymentError,
}: {
  productSlug: string;
  cancelled: boolean;
  paymentError: boolean;
}) {
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("PAYPAL");
  const [submitting, setSubmitting] =
    useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setError("");

    const form = event.currentTarget;
    const formData = new FormData(form);

    const customerName = String(
      formData.get("customer_name") ?? "",
    ).trim();

    const customerEmail = String(
      formData.get("customer_email") ?? "",
    ).trim();

    if (!customerName || !customerEmail) {
      setError(
        "Please enter your full name and email address.",
      );
      return;
    }

    setSubmitting(true);

    try {
      if (paymentMethod === "PAYPAL") {
        const response = await fetch(
          "/api/paypal/create-order",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
              "Cache-Control": "no-store",
            },
            body: JSON.stringify({
              productSlug,
              customerName,
              customerEmail,
            }),
          },
        );

        const data =
          (await response.json()) as {
            orderId?: string;
            orderNumber?: string;
            approvalUrl?: string;
            error?: string;
          };

        if (
          !response.ok ||
          !data.approvalUrl
        ) {
          throw new Error(
            data.error ||
              "Unable to start PayPal checkout.",
          );
        }

        window.location.assign(
          data.approvalUrl,
        );
        return;
      }

      const response = await fetch(
        "/api/paymongo/create-checkout",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
            "Cache-Control": "no-store",
          },
          body: JSON.stringify({
            productSlug,
            customerName,
            customerEmail,
          }),
        },
      );

      const data =
        (await response.json()) as {
          orderNumber?: string;
          checkoutSessionId?: string;
          checkoutUrl?: string;
          error?: string;
        };

      if (
        !response.ok ||
        !data.checkoutUrl
      ) {
        throw new Error(
          data.error ||
            "Unable to start PayMongo checkout.",
        );
      }

      window.location.assign(
        data.checkoutUrl,
      );
    } catch (checkoutError) {
      setSubmitting(false);

      setError(
        checkoutError instanceof Error
          ? checkoutError.message
          : "Unable to start checkout.",
      );
    }
  }

  return (
    <section
      className={styles.card}
      aria-labelledby="customer-heading"
    >
      <form onSubmit={handleSubmit}>
        <h2 id="customer-heading">
          Your details
        </h2>

        <p className={styles.hint}>
          Use the email address where you want
          to receive your order updates.
        </p>

        <div className={styles.fields}>
          <label htmlFor="customer-name">
            Full name
            <input
              id="customer-name"
              name="customer_name"
              autoComplete="name"
              maxLength={120}
              required
              placeholder="Your full name"
              disabled={submitting}
            />
          </label>

          <label htmlFor="customer-email">
            Email address
            <input
              id="customer-email"
              name="customer_email"
              type="email"
              autoComplete="email"
              maxLength={254}
              required
              placeholder="you@example.com"
              disabled={submitting}
            />
          </label>
        </div>

        <fieldset
          className={styles.methods}
          disabled={submitting}
        >
          <legend>Payment method</legend>

          <label className={styles.method}>
            <input
              type="radio"
              name="payment_method"
              value="PAYPAL"
              checked={
                paymentMethod === "PAYPAL"
              }
              onChange={() =>
                setPaymentMethod("PAYPAL")
              }
            />

            <span>
              <strong>PayPal</strong>
              <small>
                Log in to PayPal, or use
                debit/credit card guest checkout
                when PayPal makes it available.
              </small>
            </span>
          </label>

          <label className={styles.method}>
            <input
              type="radio"
              name="payment_method"
              value="PAYMONGO"
              checked={
                paymentMethod ===
                "PAYMONGO"
              }
              onChange={() =>
                setPaymentMethod("PAYMONGO")
              }
            />

            <span>
              <strong>PayMongo</strong>
              <small>
                GCash, Maya, and debit/credit
                cards when enabled on your
                PayMongo account.
              </small>
            </span>
          </label>
        </fieldset>

        {cancelled && !error && (
          <p
            className={styles.status}
            role="status"
          >
            Checkout was cancelled. No
            payment was taken.
          </p>
        )}

        {paymentError && !error && (
          <p
            className={styles.status}
            role="alert"
          >
            We could not confirm the
            payment.
          </p>
        )}

        {error && (
          <p
            className={styles.status}
            role="alert"
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          className={`button button-primary ${styles.pay}`}
          disabled={submitting}
        >
          {submitting
            ? paymentMethod === "PAYPAL"
              ? "Opening PayPal..."
              : "Opening PayMongo..."
            : paymentMethod === "PAYPAL"
              ? "Continue with PayPal"
              : "Continue with PayMongo"}{" "}
          {!submitting && (
            <span aria-hidden="true">→</span>
          )}
        </button>
      </form>
    </section>
  );
}
