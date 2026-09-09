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
  paymentTerms: string | null;
  balanceDue: number;
};

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export default function ProjectWorkflowForm({
  id,
  requirementsStatus,
  projectStatus,
  deliveryStatus,
  adminNotes,
  customerUpdateNote,
  paymentTerms,
  balanceDue,
}: Props) {
  const [requirements, setRequirements] = useState(requirementsStatus);
  const [project, setProject] = useState(projectStatus);
  const [delivery, setDelivery] = useState(
    deliveryStatus || "NOT_STARTED",
  );

  const needsMoreInfo = requirements === "NEED_MORE_INFO";
  const isCustomPaymentOrder =
    paymentTerms === "FULL" || paymentTerms === "DEPOSIT_50";
  const handoverLocked = isCustomPaymentOrder && balanceDue > 0.005;

  return (
    <form action={updateProjectRequirements} className={styles.workflowCard}>
      <input type="hidden" name="id" value={id} />

      <div className={styles.workflowHeader}>
        <span>MANAGE PROJECT</span>
        <h2>Workflow</h2>
        <p>Update the current review and build stage.</p>
      </div>

      {handoverLocked ? (
        <div
          style={{
            marginBottom: "14px",
            padding: "12px 13px",
            border: "1px solid #efd3df",
            borderRadius: "12px",
            background: "#fff7fa",
          }}
        >
          <span
            style={{
              display: "block",
              marginBottom: "4px",
              color: "#a4476b",
              fontSize: ".54rem",
              fontWeight: 900,
              letterSpacing: ".08em",
            }}
          >
            FINAL PAYMENT REQUIRED
          </span>
          <strong
            style={{
              display: "block",
              color: "#4a343e",
              fontSize: ".72rem",
              marginBottom: "4px",
            }}
          >
            {formatMoney(balanceDue)} remaining
          </strong>
          <p
            style={{
              margin: 0,
              color: "#8a737d",
              fontSize: ".59rem",
              lineHeight: 1.5,
            }}
          >
            You can continue working on the project and mark it Ready for
            Handover, but Completed and Delivered stay locked until the balance
            is fully paid.
          </p>
        </div>
      ) : null}

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
        <select
          name="project_status"
          value={project}
          onChange={(event) => setProject(event.target.value)}
        >
          <option value="WAITING_REQUIREMENTS">Waiting Requirements</option>
          <option value="REVIEWING">Reviewing</option>
          <option value="NEED_MORE_INFO">Need More Info</option>
          <option value="READY_TO_BUILD">Ready to Build</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="QA_REVIEW">QA Review</option>
          <option value="READY_FOR_HANDOVER">Ready for Handover</option>
          <option value="COMPLETED" disabled={handoverLocked}>
            {handoverLocked
              ? "Completed — final payment required"
              : "Completed"}
          </option>
          <option value="CANCELLED">Cancelled</option>
        </select>

        {handoverLocked ? (
          <small>
            Ready for Handover is allowed. Completed unlocks after the remaining
            balance is paid.
          </small>
        ) : null}
      </label>

      <label>
        <span>Delivery status</span>
        <select
          name="delivery_status"
          value={delivery}
          onChange={(event) => setDelivery(event.target.value)}
        >
          <option value="NOT_STARTED">Not Started</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="DELIVERED" disabled={handoverLocked}>
            {handoverLocked
              ? "Delivered — final payment required"
              : "Delivered"}
          </option>
          <option value="CANCELLED">Cancelled</option>
        </select>

        <small>
          {handoverLocked
            ? "Delivery can be prepared, but it cannot be marked Delivered until the remaining balance is fully paid."
            : "This controls the Delivery step on the customer's Order Status page. “Not Started” stays blank there until you update it."}
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

      <button
        type="submit"
        disabled={
          handoverLocked &&
          (project === "COMPLETED" || delivery === "DELIVERED")
        }
      >
        Save Changes
      </button>
    </form>
  );
}
