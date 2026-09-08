"use client";

import Link from "next/link";
import {
  FormEvent,
  MouseEvent,
  UIEvent,
  useEffect,
  useRef,
  useState,
} from "react";

type PaymentMethod = "PAYPAL" | "PAYMONGO";

const POLICY_VERSION = "September 2026";

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
  const [policyOpen, setPolicyOpen] = useState(false);
  const [policyAccepted, setPolicyAccepted] = useState(false);
  const [policyBottomReached, setPolicyBottomReached] = useState(false);
  const policyBodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!policyOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setPolicyOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    requestAnimationFrame(() => {
      const body = policyBodyRef.current;
      if (!body) return;

      body.scrollTop = 0;
      setPolicyBottomReached(
        body.scrollHeight <= body.clientHeight + 8,
      );
    });

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [policyOpen]);

  function openPolicy(event?: MouseEvent) {
    event?.preventDefault();

    if (submitting) return;

    setPolicyBottomReached(false);
    setPolicyOpen(true);
  }

  function closePolicy() {
    setPolicyOpen(false);
  }

  function handlePolicyScroll(event: UIEvent<HTMLDivElement>) {
    const target = event.currentTarget;
    const distanceFromBottom =
      target.scrollHeight - target.scrollTop - target.clientHeight;

    if (distanceFromBottom <= 12) {
      setPolicyBottomReached(true);
    }
  }

  function acceptPolicy() {
    if (!policyBottomReached) return;

    setPolicyAccepted(true);
    setPolicyOpen(false);
    setError("");
  }

  function revokePolicyAcceptance() {
    if (submitting) return;
    setPolicyAccepted(false);
  }

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

    if (!policyAccepted) {
      setError("Please read and accept the TCL Policies before continuing.");
      setPolicyBottomReached(false);
      setPolicyOpen(true);
      return;
    }

    setSubmitting(true);

    try {
      const policyConsent = {
        accepted: true,
        version: POLICY_VERSION,
        acceptedAt: new Date().toISOString(),
      };

      if (paymentMethod === "PAYPAL") {
        const response = await fetch("/api/paypal/create-order", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-store",
          },
          body: JSON.stringify({
            productSlug,
            customerName,
            customerEmail,
            policyConsent,
          }),
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
        body: JSON.stringify({
          productSlug,
          customerName,
          customerEmail,
          policyConsent,
        }),
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
    <>
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
                <p>
                  You must review the TCL Policies before you can accept them
                  and continue to payment.
                </p>
              </div>

              <div
                className={`tcl-checkout-policy ${
                  policyAccepted ? "is-accepted" : ""
                }`}
              >
                <button
                  type="button"
                  className="tcl-policy-check-button"
                  onClick={policyAccepted ? revokePolicyAcceptance : openPolicy}
                  disabled={submitting}
                  aria-pressed={policyAccepted}
                  aria-label={
                    policyAccepted
                      ? "Policy accepted. Click to remove acceptance."
                      : "Read and accept TCL Policies"
                  }
                >
                  <span
                    className="tcl-policy-fake-checkbox"
                    aria-hidden="true"
                  >
                    {policyAccepted ? "✓" : ""}
                  </span>
                </button>

                <span className="tcl-policy-consent-copy">
                  {policyAccepted ? (
                    <>
                      I have read and agree to the{" "}
                      <button
                        type="button"
                        className="tcl-policy-inline-link"
                        onClick={openPolicy}
                        disabled={submitting}
                      >
                        TCL Policies
                      </button>
                      , including the digital delivery, licensing, cancellation,
                      and refund terms.
                    </>
                  ) : (
                    <>
                      I have read and agree to the{" "}
                      <button
                        type="button"
                        className="tcl-policy-inline-link"
                        onClick={openPolicy}
                        disabled={submitting}
                      >
                        TCL Policies
                      </button>
                      . Click here to review them before accepting.
                    </>
                  )}
                </span>

                <input
                  className="tcl-checkout-sr-only"
                  type="checkbox"
                  name="policy_consent"
                  checked={policyAccepted}
                  onChange={() => undefined}
                  tabIndex={-1}
                  aria-hidden="true"
                />
              </div>

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

      {policyOpen ? (
        <div
          className="tcl-policy-modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) {
              closePolicy();
            }
          }}
        >
          <section
            className="tcl-policy-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="tcl-policy-modal-title"
          >
            <div className="tcl-policy-modal-header">
              <div>
                <span>TCL SYSTEMS &amp; DIGITALS PH</span>
                <h2 id="tcl-policy-modal-title">Purchase Policies</h2>
                <p>
                  Please read the policies below. The Accept button will unlock
                  after you reach the bottom.
                </p>
              </div>

              <button
                type="button"
                className="tcl-policy-modal-close"
                onClick={closePolicy}
                aria-label="Close policies"
              >
                ×
              </button>
            </div>

            <div
              ref={policyBodyRef}
              className="tcl-policy-modal-body"
              onScroll={handlePolicyScroll}
              tabIndex={0}
            >
              <div className="tcl-policy-modal-notice">
                <strong>Before purchasing</strong>
                <p>
                  Your product page, selected tier, quotation, invoice, license,
                  purchase record, and written project scope may contain
                  additional terms specific to your order.
                </p>
              </div>

              <PolicyBlock title="1. Products, Services & Scope">
                TCL products may include downloadable templates, booking
                systems, websites, online stores, business resources, source
                files, customized systems, and related digital services. Your
                exact inclusions are based on the product page, selected tier,
                quotation, invoice, or agreed written project scope. Features
                that are not stated as included should not be assumed to be
                included.
              </PolicyBlock>

              <PolicyBlock title="2. Product Tiers">
                Solo, Pro, Business, Enterprise, and other product-specific
                packages may contain different pages, workflows, admin tools,
                integrations, limits, automation, and features. Purchasing one
                tier does not include features advertised under another tier
                unless expressly stated.
              </PolicyBlock>

              <PolicyBlock title="3. Payments & Processing">
                Prices are shown in Philippine pesos unless otherwise stated.
                Disclosed processing fees, customizations, upgrades, or add-ons
                may be added to the total. An order is considered paid only
                after payment has been successfully completed and verified by
                the applicable payment provider or TCL order system.
              </PolicyBlock>

              <PolicyBlock title="4. Digital Delivery">
                Eligible automatic digital products are delivered after
                successful payment verification. Protected product access is
                normally available for 7 days and is limited to a maximum of 3
                successful download claims per product file unless your product
                terms state otherwise. You are responsible for downloading and
                safely storing your purchased files during the access period.
              </PolicyBlock>

              <PolicyBlock title="5. Licensed Product Packages">
                Certain source-code and template products are delivered as
                order-specific licensed packages. A package may contain a
                license, purchase record, documentation, and order-specific
                identification. Removing or falsifying this information for
                unauthorized redistribution is prohibited.
              </PolicyBlock>

              <PolicyBlock title="6. License & Permitted Use">
                Unless expressly stated otherwise, a purchased template or
                system is licensed to the purchaser for one business, brand,
                organization, or project. You may customize and commercially use
                the working copy for that authorized business and may keep it in
                your own private repository. A separate license may be required
                for another unrelated business, client, brand, or project.
              </PolicyBlock>

              <PolicyBlock title="7. Prohibited Sharing & Redistribution">
                TCL digital products may not be resold, sublicensed,
                redistributed, gifted, publicly uploaded, shared as reusable
                source products, or represented as your own template for
                commercial redistribution. Modification does not automatically
                remove these license restrictions. Original or substantially
                reusable TCL source should not be placed in a public repository.
              </PolicyBlock>

              <PolicyBlock title="8. Intellectual Property">
                TCL retains ownership of its pre-existing templates, reusable
                systems, frameworks, documentation, reusable components, and
                other pre-existing intellectual property unless a written
                agreement expressly states otherwise. You retain ownership of
                your own lawful business content, branding, logos, and materials
                supplied to TCL. Third-party materials remain subject to their
                respective licenses.
              </PolicyBlock>

              <PolicyBlock title="9. Cancellations & Refunds">
                Because digital products can be delivered or copied immediately,
                completed digital purchases are generally final and
                non-refundable after files, access, credentials, licensed
                packages, or other digital deliverables have been provided,
                except where required by applicable law or expressly approved by
                TCL. Cancelling an order does not automatically mean a payment
                has been refunded.
              </PolicyBlock>

              <PolicyBlock title="10. Custom Projects & Revisions">
                Custom work is limited to the approved scope. A revision adjusts
                work already included in that scope. New pages, workflows,
                integrations, features, major redesigns, or functionality outside
                the original scope may require a separate quotation, additional
                payment, and revised delivery schedule.
              </PolicyBlock>

              <PolicyBlock title="11. Client Responsibilities">
                Customers are responsible for providing accurate business
                information, content, prices, schedules, policies, branding,
                approvals, and required account access. Customers must have the
                right to use materials they provide. Delayed content, access, or
                approvals may delay delivery. Customers should review and test
                their live information before relying on it for business
                operations.
              </PolicyBlock>

              <PolicyBlock title="12. Third-Party Services">
                Products may depend on third-party hosting, databases, domains,
                repositories, transactional email, payment providers, analytics,
                storage, or other services. Those providers control their own
                pricing, limits, verification, outages, policies, APIs, and
                future changes. Unless expressly included, recurring third-party
                costs remain the customer&apos;s responsibility.
              </PolicyBlock>

              <PolicyBlock title="13. Accounts, Credentials & Handover">
                Production accounts should generally be owned or controlled by
                the customer. TCL may have temporary authorized access during
                setup or support. After handover, customers should secure their
                accounts, change temporary passwords where applicable, protect
                recovery methods, and never publicly expose private keys,
                passwords, payment secrets, or database credentials.
              </PolicyBlock>

              <PolicyBlock title="14. Support, Bugs & Additional Work">
                Included support depends on the purchased product or project
                agreement. A confirmed bug generally means an included feature
                does not function as delivered under the supported setup due to
                TCL&apos;s delivered work. New features, redesigns, content
                updates, customer modifications, third-party changes, or
                unrelated maintenance may be quoted separately.
              </PolicyBlock>

              <PolicyBlock title="15. Maintenance & Compatibility">
                A one-time purchase does not automatically include indefinite
                maintenance, lifetime development support, future redesigns,
                migrations, or dependency upgrades unless expressly stated.
                Technologies and third-party platforms change over time, and
                future maintenance may require additional work.
              </PolicyBlock>

              <PolicyBlock title="16. Customer Modifications & Backups">
                You may modify your licensed working copy within the permitted
                license scope, but TCL cannot guarantee functionality after
                unsupported changes to source code, configuration, databases,
                dependencies, integrations, or deployment settings. Customers
                should maintain safe copies of delivered source files, important
                business data, and appropriate backups.
              </PolicyBlock>

              <PolicyBlock title="17. Privacy & Download Records">
                TCL may collect information reasonably necessary to process and
                deliver orders, provide support, maintain transaction records,
                and protect digital products. Protected delivery may record
                download date/time, file, result, browser or user-agent
                information, approximate device/operating-system information,
                and IP address where available for security, troubleshooting,
                and access control.
              </PolicyBlock>

              <PolicyBlock title="18. Security">
                No internet-based system can be guaranteed completely risk-free.
                Customers are responsible for securing accounts and confidential
                credentials under their control. Attempting to bypass
                authentication, licensing, download restrictions, or other
                protective controls is prohibited.
              </PolicyBlock>

              <PolicyBlock title="19. Demo Websites & Sample Data">
                TCL demos may contain fictional businesses, customers, bookings,
                orders, payments, products, or other sample data. Demos are not
                customer production systems. The presence of a feature in one
                demo or tier does not mean it is included in every product.
              </PolicyBlock>

              <PolicyBlock title="20. Availability & Third-Party Outages">
                TCL does not guarantee uninterrupted operation of third-party
                hosting, database, email, payment, domain, internet, or other
                external services. A third-party outage or provider change is
                not automatically considered a defect in TCL&apos;s delivered
                work.
              </PolicyBlock>

              <PolicyBlock title="21. Payment Disputes & Chargebacks">
                Customers should contact TCL first about delivery, duplicate
                payment, or refund concerns. TCL may provide relevant order,
                payment-status, delivery, download, communication, licensing,
                and project records to the applicable payment provider when
                responding to a legitimate dispute.
              </PolicyBlock>

              <PolicyBlock title="22. Access Restriction">
                Temporary delivery access ends when its stated access period or
                download allowance expires. Remaining delivery access may also
                be restricted where reasonably necessary to address fraud,
                unauthorized redistribution, abuse, payment reversal, or a
                material license violation, subject to applicable law.
              </PolicyBlock>

              <PolicyBlock title="23. No Guaranteed Business Results">
                A TCL website, booking system, store, or digital tool does not
                guarantee sales, bookings, traffic, search ranking, revenue,
                conversion rates, or other business results. Results depend on
                factors beyond the delivered system, including your offer,
                marketing, operations, content, pricing, and market conditions.
              </PolicyBlock>

              <PolicyBlock title="24. Policy Acceptance">
                By accepting these policies and continuing with your purchase,
                you acknowledge the product information, selected tier, price,
                applicable license, delivery terms, and policies presented for
                the transaction. Order-specific written terms may supplement
                these general policies. Nothing in these policies removes rights
                that cannot legally be waived under applicable law.
              </PolicyBlock>

              <div className="tcl-policy-end-marker">
                <span>END OF CHECKOUT POLICY SUMMARY</span>
                <strong>You&apos;ve reached the bottom.</strong>
                <p>
                  You may now accept these policies to continue with checkout.
                  For the complete detailed policy, you can also open the full
                  Policies page below.
                </p>

                <Link href="/policies" target="_blank" rel="noreferrer">
                  Open Full TCL Policies ↗
                </Link>
              </div>
            </div>

            <div className="tcl-policy-scroll-status" aria-live="polite">
              {policyBottomReached ? (
                <span className="is-ready">✓ Policy review complete</span>
              ) : (
                <span>↓ Scroll to the bottom to enable Accept</span>
              )}
            </div>

            <div className="tcl-policy-modal-actions">
              <button
                type="button"
                className="tcl-policy-cancel"
                onClick={closePolicy}
              >
                Cancel
              </button>

              <button
                type="button"
                className="tcl-policy-accept"
                onClick={acceptPolicy}
                disabled={!policyBottomReached}
              >
                {policyBottomReached
                  ? "Accept & Continue"
                  : "Read to Continue"}
              </button>
            </div>
          </section>
        </div>
      ) : null}

      <style jsx global>{`
        .tcl-checkout-policy {
          display: grid;
          grid-template-columns: 26px 1fr;
          gap: 12px;
          align-items: start;
        }

        .tcl-policy-check-button {
          width: 24px;
          height: 24px;
          margin: 1px 0 0;
          padding: 0;
          border: 0;
          background: transparent;
          cursor: pointer;
        }

        .tcl-policy-check-button:disabled {
          cursor: not-allowed;
          opacity: 0.65;
        }

        .tcl-policy-fake-checkbox {
          display: flex;
          width: 22px;
          height: 22px;
          align-items: center;
          justify-content: center;
          border: 1.5px solid #d8a9bb;
          border-radius: 6px;
          background: #fff;
          color: #fff;
          font-size: 14px;
          font-weight: 900;
          transition:
            background 150ms ease,
            border-color 150ms ease;
        }

        .tcl-checkout-policy.is-accepted .tcl-policy-fake-checkbox {
          border-color: #b84e77;
          background: #b84e77;
        }

        .tcl-policy-consent-copy {
          color: #6f5963;
          font-size: 0.9rem;
          line-height: 1.65;
        }

        .tcl-policy-inline-link {
          display: inline;
          padding: 0;
          border: 0;
          background: transparent;
          color: #ad456d;
          font: inherit;
          font-weight: 800;
          text-decoration: underline;
          text-underline-offset: 2px;
          cursor: pointer;
        }

        .tcl-policy-inline-link:disabled {
          cursor: not-allowed;
        }

        .tcl-policy-modal-backdrop {
          position: fixed;
          top: 0;
          right: 0;
          bottom: 0;
          left: 0;
          z-index: 2147483647;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 22px;
          background: rgba(35, 24, 29, 0.72);
          -webkit-backdrop-filter: blur(6px);
          backdrop-filter: blur(6px);
        }

        .tcl-policy-modal {
          display: grid;
          grid-template-rows: auto minmax(0, 1fr) auto auto;
          width: min(820px, 100%);
          max-height: min(88vh, 900px);
          overflow: hidden;
          border: 1px solid #eed1dc;
          border-radius: 26px;
          background: #fff;
          box-shadow: 0 28px 90px rgba(31, 17, 23, 0.3);
        }

        .tcl-policy-modal-header {
          display: flex;
          gap: 20px;
          align-items: flex-start;
          justify-content: space-between;
          padding: 26px 28px 22px;
          border-bottom: 1px solid #f1dce4;
          background:
            radial-gradient(
              circle at 90% 0%,
              rgba(239, 164, 191, 0.22),
              transparent 32%
            ),
            #fff9fb;
        }

        .tcl-policy-modal-header span {
          display: block;
          margin-bottom: 7px;
          color: #b34f77;
          font-size: 0.67rem;
          font-weight: 900;
          letter-spacing: 0.13em;
        }

        .tcl-policy-modal-header h2 {
          margin: 0;
          color: #34262d;
          font-size: 1.65rem;
          letter-spacing: -0.035em;
        }

        .tcl-policy-modal-header p {
          max-width: 600px;
          margin: 7px 0 0;
          color: #79636d;
          font-size: 0.86rem;
          line-height: 1.55;
        }

        .tcl-policy-modal-close {
          display: flex;
          flex: 0 0 auto;
          width: 36px;
          height: 36px;
          align-items: center;
          justify-content: center;
          padding: 0;
          border: 1px solid #ebcbd7;
          border-radius: 50%;
          background: #fff;
          color: #754f5e;
          font-size: 23px;
          line-height: 1;
          cursor: pointer;
        }

        .tcl-policy-modal-body {
          min-height: 0;
          overflow-y: auto;
          overscroll-behavior: contain;
          padding: 25px 28px 34px;
          scroll-behavior: smooth;
        }

        .tcl-policy-modal-notice {
          margin-bottom: 24px;
          padding: 18px;
          border: 1px solid #efceda;
          border-radius: 15px;
          background: #fff8fb;
        }

        .tcl-policy-modal-notice strong {
          display: block;
          margin-bottom: 5px;
          color: #9e3f64;
          font-size: 0.9rem;
        }

        .tcl-policy-modal-notice p {
          margin: 0;
          color: #725d66;
          font-size: 0.84rem;
          line-height: 1.65;
        }

        .tcl-policy-modal-block {
          padding: 0 0 21px;
          margin: 0 0 21px;
          border-bottom: 1px solid #f2e3e8;
        }

        .tcl-policy-modal-block h3 {
          margin: 0 0 8px;
          color: #3b2b32;
          font-size: 1rem;
        }

        .tcl-policy-modal-block p {
          margin: 0;
          color: #6f5a64;
          font-size: 0.86rem;
          line-height: 1.72;
        }

        .tcl-policy-end-marker {
          padding: 24px;
          border-radius: 18px;
          background: #f9e8ee;
          text-align: center;
        }

        .tcl-policy-end-marker > span {
          display: block;
          margin-bottom: 8px;
          color: #a54268;
          font-size: 0.65rem;
          font-weight: 900;
          letter-spacing: 0.12em;
        }

        .tcl-policy-end-marker strong {
          display: block;
          color: #392830;
          font-size: 1.1rem;
        }

        .tcl-policy-end-marker p {
          max-width: 560px;
          margin: 8px auto 14px;
          color: #715b65;
          font-size: 0.84rem;
          line-height: 1.65;
        }

        .tcl-policy-end-marker a {
          color: #a23e64;
          font-size: 0.82rem;
          font-weight: 900;
        }

        .tcl-policy-scroll-status {
          padding: 10px 28px;
          border-top: 1px solid #f0dbe3;
          background: #fffafc;
          color: #856a75;
          font-size: 0.76rem;
          font-weight: 800;
          text-align: center;
        }

        .tcl-policy-scroll-status .is-ready {
          color: #8c3657;
        }

        .tcl-policy-modal-actions {
          display: grid;
          grid-template-columns: 1fr 1.35fr;
          gap: 10px;
          padding: 16px 28px 22px;
          background: #fff;
        }

        .tcl-policy-cancel,
        .tcl-policy-accept {
          min-height: 48px;
          padding: 0 18px;
          border-radius: 999px;
          font-size: 0.86rem;
          font-weight: 900;
          cursor: pointer;
        }

        .tcl-policy-cancel {
          border: 1px solid #e6c5d1;
          background: #fff;
          color: #9e4567;
        }

        .tcl-policy-accept {
          border: 1px solid #b84e77;
          background: #b84e77;
          color: #fff;
        }

        .tcl-policy-accept:disabled {
          border-color: #e7d5dc;
          background: #eee5e9;
          color: #a9979f;
          cursor: not-allowed;
        }

        @media (max-width: 650px) {
          .tcl-policy-modal-backdrop {
            display: block;
            overflow: hidden;
            padding: 0;
            background: rgba(35, 24, 29, 0.78);
          }

          .tcl-policy-modal {
            position: absolute;
            top: 4vh;
            right: 10px;
            bottom: 4vh;
            left: 10px;
            width: auto;
            height: auto;
            max-height: none;
            border: 1px solid #eed1dc;
            border-radius: 20px;
          }

          .tcl-policy-modal-header {
            padding: 20px 18px 16px;
          }

          .tcl-policy-modal-header h2 {
            font-size: 1.35rem;
          }

          .tcl-policy-modal-header p {
            font-size: 0.78rem;
          }

          .tcl-policy-modal-close {
            width: 34px;
            height: 34px;
          }

          .tcl-policy-modal-body {
            padding: 20px 18px 28px;
          }

          .tcl-policy-scroll-status {
            padding: 9px 18px;
          }

          .tcl-policy-modal-actions {
            padding: 13px 18px calc(16px + env(safe-area-inset-bottom));
          }

          .tcl-policy-cancel,
          .tcl-policy-accept {
            min-height: 46px;
            padding: 0 12px;
            font-size: 0.8rem;
          }
        }
      `}</style>
    </>
  );
}

function PolicyBlock({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="tcl-policy-modal-block">
      <h3>{title}</h3>
      <p>{children}</p>
    </section>
  );
}
