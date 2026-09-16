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
  selectedDesignSlug,
  selectedDesignLabel,
  cancelled,
  paymentError,
}: {
  productSlug: string;
  selectedDesignSlug?: string;
  selectedDesignLabel?: string;
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

  function choosePaymentMethod(method: PaymentMethod) {
    setPaymentMethod(method);

    const feeLabel = document.getElementById(
      "tcl-checkout-processing-fee-label",
    );

    if (feeLabel) {
      feeLabel.textContent =
        method === "PAYPAL"
          ? "PayPal Processing Fee"
          : "PayMongo Processing Fee";
    }
  }

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
            selectedDesignSlug,
            selectedDesignName: selectedDesignLabel,
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
          selectedDesignSlug,
          selectedDesignName: selectedDesignLabel,
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
          {selectedDesignSlug ? (
            <input
              type="hidden"
              name="selected_design_slug"
              value={selectedDesignSlug}
            />
          ) : null}

          {selectedDesignLabel ? (
            <input
              type="hidden"
              name="selected_design_label"
              value={selectedDesignLabel}
            />
          ) : null}
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

                {selectedDesignLabel ? (
                  <div className="tcl-checkout-form-design">
                    <span>Selected design</span>
                    <strong>{selectedDesignLabel}</strong>
                  </div>
                ) : null}
              </div>

              <fieldset className="tcl-checkout-methods" disabled={submitting}>
                <legend className="tcl-checkout-sr-only">Payment method</legend>

                <button
                  type="button"
                  className={`tcl-checkout-method ${
                    paymentMethod === "PAYPAL" ? "is-selected" : ""
                  }`}
                  onClick={() => choosePaymentMethod("PAYPAL")}
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
                  onClick={() => choosePaymentMethod("PAYMONGO")}
                  aria-pressed={paymentMethod === "PAYMONGO"}
                >
                  <span className="tcl-checkout-method-icon">PM</span>

                  <span className="tcl-checkout-method-copy">
                    <strong>PayMongo</strong>
                    <small>
                      QR Ph payments via GCash, Maya, bank apps, and other supported e-wallets.
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
                      , including payment, delivery, licensing, maintenance,
                      cancellation, and refund terms.
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
                  Your product page, accepted quotation, invoice, license,
                  checkout disclosure, purchase record, and written project
                  scope may contain additional terms specific to your order.
                  Features not clearly listed as included should not be assumed
                  to be included.
                </p>
              </div>

              <PolicyBlock title="1. Products, Packages & Scope">
                TCL offers fixed-price websites and systems, digital products,
                and quotation-based custom development. Current fixed-price
                service packages include Starter Website, Simple Business
                Website, Basic Online Shop, and Standard Booking Website/System.
                Custom Business Website/System projects follow an accepted
                written quotation. Your exact inclusions are determined by the
                applicable product page, quotation, invoice, and written scope.
              </PolicyBlock>

              <PolicyBlock title="2. Package Differences">
                Starter Website is a one-page website without an admin
                dashboard. Simple Business Website includes four core pages but
                does not include self-editing unless separately scoped. Basic
                Online Shop includes a basic shop, cart, order submission, and
                manual payment instructions but does not automatically include
                an admin dashboard, automated payment gateway, customer
                accounts, or automated inventory. Standard Booking
                Website/System includes the customer booking flow and its stated
                booking-management admin tools. Features beyond a package&apos;s
                listed scope may require a separate quotation.
              </PolicyBlock>

              <PolicyBlock title="3. Pricing, Processing Fees & Payments">
                Prices are shown in Philippine pesos unless otherwise stated.
                Your checkout total may include TCL&apos;s disclosed processing
                fee, identified according to the selected payment provider.
                Payment providers, banks, card issuers, or e-wallet providers
                may separately apply charges outside TCL&apos;s checkout total.
                An order is considered paid only after payment is successfully
                completed and verified by the applicable provider or TCL order
                system.
              </PolicyBlock>

              <PolicyBlock title="4. Digital Delivery & Download Access">
                Eligible automatic digital products are released after
                successful payment verification. Where TCL&apos;s protected
                delivery system applies, standard access is normally available
                for 7 days with a maximum of 3 successful download claims per
                product file unless your order terms state otherwise. Customers
                are responsible for downloading and safely storing delivered
                files during the access period.
              </PolicyBlock>

              <PolicyBlock title="5. Licensing & Permitted Use">
                Unless different rights are expressly granted, reusable
                templates, downloadable systems, and source-code products are
                licensed for one business, brand, organization, or project.
                You may customize and commercially use the authorized working
                copy, but the purchase does not transfer ownership of
                TCL&apos;s pre-existing reusable templates, frameworks,
                components, documentation, or development methods.
              </PolicyBlock>

              <PolicyBlock title="6. Sharing, Resale & Redistribution">
                TCL digital products may not be resold, sublicensed,
                redistributed, gifted, publicly uploaded, or supplied to
                another business as a reusable TCL template or source product
                unless the applicable license expressly allows it. Modification
                does not automatically remove license restrictions, and
                substantially reusable TCL source should not be placed in a
                public repository.
              </PolicyBlock>

              <PolicyBlock title="7. Intellectual Property & TCL Attribution">
                Customers retain ownership of their lawful business content,
                branding, logos, and materials. TCL retains its pre-existing
                reusable intellectual property unless a written agreement says
                otherwise. A delivered website or system may include a small
                Powered by TCL Systems &amp; Digitals PH developer attribution
                where disclosed. Removal is not automatically included merely
                because a project is paid and may be separately priced where
                removal is permitted.
              </PolicyBlock>

              <PolicyBlock title="8. Cancellations & Refunds">
                Completed digital-product purchases are generally final and
                non-refundable after files, access, credentials, licensed
                packages, or other digital deliverables have been provided,
                except where required by law or expressly approved by TCL. For
                service and custom projects cancelled after work begins,
                completed work, reserved project time, delivered materials, and
                non-recoverable third-party costs may be non-refundable.
                Technical issues should first be reported so TCL has a
                reasonable opportunity to investigate.
              </PolicyBlock>

              <PolicyBlock title="9. Custom Projects, Deposits & Remaining Balance">
                Custom projects follow the accepted quotation, written scope,
                and agreed payment arrangement. Work may begin only after the
                required payment or deposit and required client materials are
                received. A deposit does not cover unlimited additions or
                revisions. Where a remaining balance applies, it becomes
                payable according to the accepted quotation or when TCL
                requests or activates the final payment under the agreed flow.
              </PolicyBlock>

              <PolicyBlock title="10. Revisions, Changes & Additional Work">
                A revision adjusts work already included in the agreed scope.
                New pages, features, workflows, integrations, roles,
                automations, major redesigns, or different system behavior are
                additional work when they fall outside the original scope and
                may require additional payment and delivery time. Future edits
                to fixed-price websites without customer self-editing may also
                be charged separately.
              </PolicyBlock>

              <PolicyBlock title="11. Client Content & Responsibilities">
                Customers are responsible for providing accurate business
                information, content, prices, schedules, policies, branding,
                approvals, and required account access, and must have the legal
                right to use materials they provide. Delayed information,
                credentials, content, feedback, or approvals may delay
                delivery. Customers should review and test their live business
                information before relying on it operationally.
              </PolicyBlock>

              <PolicyBlock title="12. Communication & Written Project Records">
                TCL primarily handles quotations, requirements, scope, pricing,
                revisions, approvals, and project changes in writing so there
                is a clear project record. In-person appointments are not
                required. A short introductory call may sometimes be
                accommodated for general inquiries, but calls do not replace
                the quotation process or written confirmation of scope,
                pricing, revisions, approvals, or feature changes.
              </PolicyBlock>

              <PolicyBlock title="13. Third-Party Services, Domains & Hosting">
                Websites and systems may rely on third-party hosting,
                databases, domains, repositories, email, payment providers,
                storage, authentication, APIs, or other services. A free
                vercel.app subdomain may be used where included; custom domains
                are separate unless expressly included. Domain renewals,
                provider fees, paid plans, hosting/database upgrades, paid APIs,
                and other third-party costs are the customer&apos;s
                responsibility unless specifically included in writing.
              </PolicyBlock>

              <PolicyBlock title="14. Accounts, Credentials & Handover">
                Production accounts should generally be owned or controlled by
                the customer. TCL may temporarily access authorized accounts
                for setup, deployment, troubleshooting, or included support.
                After handover, customers are responsible for protecting
                passwords, recovery methods, private keys, payment secrets,
                database credentials, and other sensitive access information.
              </PolicyBlock>

              <PolicyBlock title="15. Included Maintenance">
                Included maintenance begins from completed delivery or turnover
                unless otherwise stated: Starter Website — 1 month; Simple
                Business Website — 1 month; Basic Online Shop — 2 months;
                Standard Booking Website/System — 2 months; Custom Business
                Website/System — 6 months unless the accepted quotation states
                a different project-specific term.
              </PolicyBlock>

              <PolicyBlock title="16. What Maintenance Covers">
                Included maintenance covers bugs or errors in features TCL
                delivered within the original agreed scope and reasonable
                technical assistance directly related to that delivered
                project. It does not include unlimited edits, new pages, new
                features, redesigns, major content changes, new integrations,
                new workflows, ongoing administration, or other out-of-scope
                development. Those services may be separately quoted.
              </PolicyBlock>

              <PolicyBlock title="17. After Maintenance Ends">
                Your website or system does not expire when the included
                maintenance period ends. It may continue operating subject to
                its hosting, domain, third-party services, and technical
                compatibility. Future TCL maintenance, edits, troubleshooting,
                upgrades, or development can be separately quoted. Third-party
                outages, plan limits, policy changes, fees, and required
                provider upgrades are not automatically covered by TCL
                maintenance.
              </PolicyBlock>

              <PolicyBlock title="18. Customer or Third-Party Modifications">
                Where source access is provided, you may modify the licensed
                working copy within the permitted scope. TCL cannot guarantee
                functionality after unsupported changes to source code,
                databases, configuration, dependencies, integrations, or
                deployment settings. Problems caused by customer changes or
                another developer&apos;s work may require paid troubleshooting.
              </PolicyBlock>

              <PolicyBlock title="19. Backups, Privacy & Security">
                Customers should maintain appropriate copies of delivered
                source files and important business data after handover unless
                an ongoing backup service is included. TCL may collect
                information reasonably necessary to process orders, provide
                services and support, maintain transaction records, and protect
                digital delivery. No internet-based system is completely
                risk-free, and customers are responsible for securing accounts
                and confidential credentials under their control.
              </PolicyBlock>

              <PolicyBlock title="20. Demo Websites & Third-Party Availability">
                Demo environments may contain fictional businesses, products,
                bookings, orders, payments, and other sample data. A feature
                shown in one demo is not automatically included in every
                package. TCL does not guarantee uninterrupted operation of
                third-party hosting, database, email, payment, domain, internet,
                or other external services, and third-party incidents are not
                automatically defects in TCL&apos;s delivered work.
              </PolicyBlock>

              <PolicyBlock title="21. Payment Disputes">
                Customers should contact TCL first regarding delivery, duplicate
                payment, cancellation, or refund concerns so the transaction
                can be reviewed. TCL may provide relevant order, payment,
                delivery, licensing, download, and project records to the
                applicable payment provider when responding to a legitimate
                dispute or chargeback.
              </PolicyBlock>

              <PolicyBlock title="22. No Guaranteed Business Results">
                TCL websites, booking systems, online shops, and digital tools
                support business presentation and operations but do not
                guarantee sales, bookings, traffic, search ranking, revenue,
                conversion rates, customer growth, or other business outcomes.
              </PolicyBlock>

              <PolicyBlock title="23. Order-Specific Terms & Acceptance">
                By accepting these policies and continuing with checkout, you
                acknowledge the product information, price, applicable license,
                payment and delivery terms, maintenance coverage, and policies
                reasonably presented for this transaction. A product page,
                accepted quotation, invoice, checkout disclosure, license, or
                written project agreement may contain additional order-specific
                terms. More specific written project terms apply to that
                project to the extent of a stated difference, subject to
                applicable law.
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
        .tcl-checkout-form-design {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-top: 11px;
          padding: 9px 11px;
          border: 1px solid #eadde2;
          border-radius: 10px;
          background: #fff8fa;
        }

        .tcl-checkout-form-design span {
          color: #9b7c88;
          font-size: 0.62rem;
          font-weight: 700;
        }

        .tcl-checkout-form-design strong {
          color: #8e5068;
          font-size: 0.68rem;
          text-align: right;
        }

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
