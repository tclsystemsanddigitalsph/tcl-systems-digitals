"use client";

import { useState } from "react";
import { updateProjectRequirements } from "../actions";
import styles from "./project-requirements-detail.module.css";

type Props = {
  id: string;
  requirementsStatus: string;
  projectStatus: string;
  deliveryStatus: string;
  adminNotes: string;
  customerUpdateNote: string;
};

export default function ProjectWorkflowForm({
  id,
  requirementsStatus,
  projectStatus,
  deliveryStatus,
  adminNotes,
  customerUpdateNote,
}: Props) {
  const [requirements, setRequirements] = useState(requirementsStatus);
  const needsMoreInfo = requirements === "NEED_MORE_INFO";

  return (
    <form action={updateProjectRequirements} className={styles.workflowCard}>
      <input type="hidden" name="id" value={id} />

      <div className={styles.workflowHeader}>
        <span>MANAGE PROJECT</span>
        <h2>Workflow</h2>
        <p>Update the current review and build stage.</p>
      </div>

      <label>
        <span>Requirements status</span>
        <select
          name="requirements_status"
          value={requirements}
          onChange={(event) => setRequirements(event.target.value)}
        >
          <option value="NOT_STARTED">Not Started</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="SUBMITTED">Submitted</option>
          <option value="NEED_MORE_INFO">Need More Info</option>
          <option value="RESUBMITTED">Resubmitted</option>
          <option value="APPROVED">Approved</option>
        </select>
      </label>

      {needsMoreInfo ? (
        <label className={styles.customerRequestField}>
          <span>What we need from the customer *</span>
          <textarea
            name="customer_update_note"
            rows={6}
            defaultValue={customerUpdateNote}
            placeholder="Be specific about what they need to add, correct, clarify, or upload before you can continue."
            required
          />
          <small>
            This message is visible to the customer on their secure requirements
            page. Do not put private admin notes here.
          </small>
        </label>
      ) : (
        <input type="hidden" name="customer_update_note" value="" />
      )}

      <label>
        <span>Project status</span>
        <select name="project_status" defaultValue={projectStatus}>
          <option value="WAITING_REQUIREMENTS">Waiting Requirements</option>
          <option value="REVIEWING">Reviewing</option>
          <option value="NEED_MORE_INFO">Need More Info</option>
          <option value="READY_TO_BUILD">Ready to Build</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="QA_REVIEW">QA Review</option>
          <option value="READY_FOR_HANDOVER">Ready for Handover</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </label>

      <label>
        <span>Delivery status</span>
        <select name="delivery_status" defaultValue={deliveryStatus || "NOT_STARTED"}>
          <option value="NOT_STARTED">Not Started</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="DELIVERED">Delivered</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
        <small>
          This controls the Delivery step on the customer&apos;s Order Status
          page. “Not Started” stays blank there until you update it.
        </small>
      </label>

      <label>
        <span>Internal admin notes</span>
        <textarea
          name="admin_notes"
          rows={8}
          defaultValue={adminNotes}
          placeholder="Private build notes, scope reminders, internal follow-up..."
        />
        <small className={styles.privateHint}>
          Private — never shown to the customer.
        </small>
      </label>

      <button type="submit">Save Changes</button>
    </form>
  );
}
