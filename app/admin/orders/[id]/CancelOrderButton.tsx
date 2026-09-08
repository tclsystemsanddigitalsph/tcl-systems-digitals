import { cancelOrder } from "./actions";
import styles from "./OrderActionButton.module.css";

export default function CancelOrderButton({
  orderId,
  paymentStatus,
  orderStatus,
}: {
  orderId: string;
  paymentStatus: string | null;
  orderStatus: string | null;
}) {
  if (orderStatus === "CANCELLED") return null;

  return (
    <details className={styles.inlineAction}>
      <summary className={`${styles.inlineTrigger} ${styles.cancelTrigger}`}>
        <span>Cancel Order</span>
        <span className={styles.inlineIndicator} aria-hidden="true" />
      </summary>

      <div className={styles.inlinePanel}>
        <div className={styles.inlineEyebrow}>CANCEL ORDER</div>
        <h3>Cancel this order?</h3>
        <p>
          Add a reason for the cancellation.
          {paymentStatus === "COMPLETED"
            ? " This will not automatically refund the customer."
            : " The private payment link will stop accepting payment."}
        </p>

        <form action={cancelOrder} className={styles.inlineForm}>
          <input type="hidden" name="order_id" value={orderId} />

          <label htmlFor={`cancel-reason-${orderId}`}>
            Cancellation reason
          </label>

          <textarea
            id={`cancel-reason-${orderId}`}
            name="reason"
            rows={4}
            maxLength={1000}
            required
            placeholder="Customer changed their mind, duplicate order..."
          />

          <button className={styles.cancelSubmit} type="submit">
            Confirm Cancellation
          </button>
        </form>
      </div>
    </details>
  );
}
