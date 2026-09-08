import { deleteOrder } from "./actions";
import styles from "./OrderActionButton.module.css";

export default function DeleteOrderButton({ orderId }: { orderId: string }) {
  return (
    <details className={styles.inlineAction}>
      <summary className={`${styles.inlineTrigger} ${styles.deleteTrigger}`}>
        <span>Delete Order</span>
        <span className={styles.inlineIndicator} aria-hidden="true" />
      </summary>

      <div className={styles.inlinePanel}>
        <div className={styles.inlineEyebrow}>DELETE ORDER</div>
        <h3>Delete this order?</h3>
        <p>
          This permanently removes the TCL order and its internal records.
          PayPal or PayMongo transactions are not refunded.
        </p>

        <form action={deleteOrder} className={styles.inlineForm}>
          <input type="hidden" name="order_id" value={orderId} />

          <label htmlFor={`delete-confirmation-${orderId}`}>
            Type <strong>DELETE</strong> to confirm
          </label>

          <input
            id={`delete-confirmation-${orderId}`}
            name="confirmation"
            placeholder="DELETE"
            autoComplete="off"
            required
            pattern="DELETE"
            title="Type DELETE exactly to continue."
          />

          <button className={styles.deleteSubmit} type="submit">
            Delete Permanently
          </button>
        </form>
      </div>
    </details>
  );
}
