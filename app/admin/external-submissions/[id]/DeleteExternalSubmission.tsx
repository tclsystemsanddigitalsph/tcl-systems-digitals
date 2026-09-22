"use client";

import { useState } from "react";
import styles from "./external-submission-detail.module.css";

type Props = {
  submissionId: string;
  hasLinkedOrder: boolean;
  action: (formData: FormData) => void | Promise<void>;
};

export default function DeleteExternalSubmission({
  submissionId,
  hasLinkedOrder,
  action,
}: Props) {
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <section className={styles.deleteCard}>
        <div>
          <span>DELETE SUBMISSION</span>
          <strong>Permanently remove this submission</strong>
          <p>
            This removes only the external requirements submission.
            {hasLinkedOrder
              ? " The linked TCL Order and its revenue record will remain."
              : ""}
          </p>
        </div>

        <button type="button" onClick={() => setConfirming(true)}>
          Delete submission
        </button>
      </section>
    );
  }

  return (
    <section className={styles.deleteCard}>
      <div>
        <span>CONFIRM DELETION</span>
        <strong>Are you sure you want to delete this submission?</strong>
        <p>
          This cannot be undone.
          {hasLinkedOrder
            ? " Your linked TCL Order and revenue record will not be deleted."
            : ""}
        </p>
      </div>

      <form action={action}>
        <input type="hidden" name="submission_id" value={submissionId} />

        <div className={styles.deleteConfirmActions}>
          <button
            type="button"
            className={styles.deleteCancelButton}
            onClick={() => setConfirming(false)}
          >
            Cancel
          </button>

          <button type="submit" className={styles.deleteConfirmButton}>
            Yes, delete permanently
          </button>
        </div>
      </form>
    </section>
  );
}
