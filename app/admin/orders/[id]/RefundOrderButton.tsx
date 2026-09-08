import { processProviderRefund, recordExternalRefund } from "./actions";
import styles from "./RefundOrderButton.module.css";

function money(value: number, currency: string) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency,
  }).format(value);
}

export default function RefundOrderButton({
  orderId,
  totalAmount,
  refundedAmount,
  currency,
  paymentProvider,
  hasProviderReference,
}: {
  orderId: string;
  totalAmount: number;
  refundedAmount: number;
  currency: string;
  paymentProvider: string | null;
  hasProviderReference: boolean;
}) {
  const remaining = Math.max(0, totalAmount - refundedAmount);
  if (remaining <= 0) return null;

  const provider = (paymentProvider || "").toUpperCase();
  const providerRefundAvailable =
    hasProviderReference && (provider === "PAYPAL" || provider === "PAYMONGO");

  return (
    <details className={styles.inlineAction}>
      <summary className={styles.inlineTrigger}>
        <span>Refund</span>
        <span className={styles.inlineIndicator} aria-hidden="true" />
      </summary>

      <div className={styles.inlinePanel}>
        <span className={styles.inlineEyebrow}>REFUND PAYMENT</span>

        <h3>
          {providerRefundAvailable
            ? `Refund through ${provider === "PAYPAL" ? "PayPal" : "PayMongo"}`
            : "Record a refund"}
        </h3>

        <p>
          {providerRefundAvailable
            ? `TCL will send the refund request to ${
                provider === "PAYPAL" ? "PayPal" : "PayMongo"
              } using this order's original payment transaction.`
            : "This order does not have a supported provider transaction reference, so only an external refund can be recorded."}
        </p>

        <div className={styles.amountGrid}>
          <div>
            <span>Paid</span>
            <strong>{money(totalAmount, currency)}</strong>
          </div>
          <div>
            <span>Refunded</span>
            <strong>{money(refundedAmount, currency)}</strong>
          </div>
          <div>
            <span>Available</span>
            <strong>{money(remaining, currency)}</strong>
          </div>
        </div>

        {providerRefundAvailable ? (
          <form action={processProviderRefund} className={styles.inlineForm}>
            <input type="hidden" name="order_id" value={orderId} />

            <label htmlFor={`provider-refund-amount-${orderId}`}>
              Refund amount
            </label>
            <input
              id={`provider-refund-amount-${orderId}`}
              name="refund_amount"
              type="number"
              min="0.01"
              max={remaining.toFixed(2)}
              step="0.01"
              inputMode="decimal"
              defaultValue={remaining.toFixed(2)}
              required
            />

            <label htmlFor={`provider-refund-reason-${orderId}`}>
              Reason
            </label>
            <textarea
              id={`provider-refund-reason-${orderId}`}
              name="refund_reason"
              rows={3}
              maxLength={255}
              placeholder="Customer requested a refund..."
              required
            />

            <button type="submit">
              Refund through {provider === "PAYPAL" ? "PayPal" : "PayMongo"}
            </button>
          </form>
        ) : null}

        <details className={styles.manualRefund}>
          <summary>Record external/manual refund</summary>

          <form action={recordExternalRefund} className={styles.inlineForm}>
            <input type="hidden" name="order_id" value={orderId} />

            <label htmlFor={`external-refund-amount-${orderId}`}>
              Refund amount
            </label>
            <input
              id={`external-refund-amount-${orderId}`}
              name="refund_amount"
              type="number"
              min="0.01"
              max={remaining.toFixed(2)}
              step="0.01"
              inputMode="decimal"
              defaultValue={remaining.toFixed(2)}
              required
            />

            <label htmlFor={`external-refund-reason-${orderId}`}>
              Reason / reference
            </label>
            <textarea
              id={`external-refund-reason-${orderId}`}
              name="refund_reason"
              rows={3}
              maxLength={1000}
              placeholder="Refunded manually via provider dashboard, bank transfer, etc."
              required
            />

            <button type="submit">Save External Refund</button>
          </form>
        </details>

        <small className={styles.inlineFootnote}>
          Refunds cannot be undone from TCL Admin.
        </small>
      </div>
    </details>
  );
}
