"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

type PaymentMethod = "PAYPAL" | "PAYMONGO";

export default function CheckoutForm({
  productSlug,
  cancelled,
  paymentError,
}: {
  productSlug: string;
  cancelled: boolean;
  paymentError: boolean;
}) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("PAYPAL");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const formData = new FormData(event.currentTarget);
    const customerName = String(formData.get("customer_name") ?? "").trim();
    const customerEmail = String(formData.get("customer_email") ?? "").trim();

    if (!customerName || !customerEmail) {
      setError("Please enter your full name and email address.");
      return;
    }

    setSubmitting(true);

    try {
      if (paymentMethod === "PAYPAL") {
        const response = await fetch("/api/paypal/create-order", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-store",
          },
          body: JSON.stringify({ productSlug, customerName, customerEmail }),
        });

        const data = (await response.json()) as {
          approvalUrl?: string;
          error?: string;
        };

        if (!response.ok || !data.approvalUrl) {
          throw new Error(data.error || "Unable to start PayPal checkout.");
        }

        window.location.assign(data.approvalUrl);
        return;
      }

      const response = await fetch("/api/paymongo/create-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store",
        },
        body: JSON.stringify({ productSlug, customerName, customerEmail }),
      });

      const data = (await response.json()) as {
        checkoutUrl?: string;
        error?: string;
      };

      if (!response.ok || !data.checkoutUrl) {
        throw new Error(data.error || "Unable to start PayMongo checkout.");
      }

      window.location.assign(data.checkoutUrl);
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
    <section className="tcl-checkout-card" aria-labelledby="customer-heading">
      <form onSubmit={handleSubmit}>
        <div className="tcl-checkout-section">
          <div className="tcl-checkout-number">1</div>

          <div className="tcl-checkout-section-content">
            <div className="tcl-checkout-form-heading">
              <h2 id="customer-heading">Your details</h2>
              <p>We&apos;ll use this information for your order and receipt.</p>
            </div>

            <div className="tcl-checkout-fields">
              <label htmlFor="customer-name">
                <span>Full name</span>
                <input
                  id="customer-name"
                  name="customer_name"
                  autoComplete="name"
                  maxLength={120}
                  required
                  placeholder="Enter your full name"
                  disabled={submitting}
                />
              </label>

              <label htmlFor="customer-email">
                <span>Email address</span>
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
                <small>Use an email you can access for order updates.</small>
              </label>
            </div>
          </div>
        </div>

        <div className="tcl-checkout-divider" />

        <div className="tcl-checkout-section">
          <div className="tcl-checkout-number">2</div>

          <div className="tcl-checkout-section-content">
            <div className="tcl-checkout-form-heading">
              <h2>Choose how to pay</h2>
              <p>Select your preferred secure payment provider.</p>
            </div>

            <fieldset className="tcl-checkout-methods" disabled={submitting}>
              <legend className="tcl-checkout-sr-only">Payment method</legend>

              <button
                type="button"
                className={`tcl-checkout-method ${
                  paymentMethod === "PAYPAL" ? "is-selected" : ""
                }`}
                onClick={() => setPaymentMethod("PAYPAL")}
                aria-pressed={paymentMethod === "PAYPAL"}
              >
                <span className="tcl-checkout-method-icon">P</span>

                <span className="tcl-checkout-method-copy">
                  <strong>PayPal</strong>
                  <small>
                    PayPal balance, debit or credit card when available.
                  </small>
                </span>

                <span className="tcl-checkout-radio" aria-hidden="true" />
              </button>

              <button
                type="button"
                className={`tcl-checkout-method ${
                  paymentMethod === "PAYMONGO" ? "is-selected" : ""
                }`}
                onClick={() => setPaymentMethod("PAYMONGO")}
                aria-pressed={paymentMethod === "PAYMONGO"}
              >
                <span className="tcl-checkout-method-icon">PM</span>

                <span className="tcl-checkout-method-copy">
                  <strong>PayMongo</strong>
                  <small>
                    GCash, Maya, Visa and Mastercard when enabled.
                  </small>
                </span>

                <span className="tcl-checkout-radio" aria-hidden="true" />
              </button>
            </fieldset>
          </div>
        </div>

        <div className="tcl-checkout-divider" />

        <div className="tcl-checkout-section">
          <div className="tcl-checkout-number">3</div>

          <div className="tcl-checkout-section-content">
            <div className="tcl-checkout-form-heading">
              <h2>Confirm &amp; continue</h2>
              <p>Please review and accept the store policies before payment.</p>
            </div>

            <label className="tcl-checkout-policy">
              <input
                type="checkbox"
                name="policy_consent"
                required
                disabled={submitting}
              />

              <span>
                I have read and agree to the{" "}
                <Link href="/policies" target="_blank">
                  TCL Policies
                </Link>
                , including the digital delivery, cancellation, and refund terms.
              </span>
            </label>

            {cancelled && !error ? (
              <p className="tcl-checkout-status" role="status">
                Checkout was cancelled. No payment was taken.
              </p>
            ) : null}

            {paymentError && !error ? (
              <p className="tcl-checkout-status" role="alert">
                We could not confirm the payment. Please try again.
              </p>
            ) : null}

            {error ? (
              <p className="tcl-checkout-status" role="alert">
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              className="button button-primary tcl-checkout-pay"
              disabled={submitting}
            >
              <span>
                {submitting
                  ? paymentMethod === "PAYPAL"
                    ? "Opening PayPal..."
                    : "Opening PayMongo..."
                  : paymentMethod === "PAYPAL"
                    ? "Continue with PayPal"
                    : "Continue with PayMongo"}
              </span>

              {!submitting ? <span aria-hidden="true">→</span> : null}
            </button>

            <p className="tcl-checkout-footnote">
              Your payment details are entered securely on the selected
              provider&apos;s checkout.
            </p>
          </div>
        </div>
      </form>
    </section>
  );
}
