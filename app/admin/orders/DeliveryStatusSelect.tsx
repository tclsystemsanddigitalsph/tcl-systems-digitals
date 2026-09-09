"use client";

import { useRef, useState } from "react";
import { updateDeliveryStatus } from "./actions";

type Props = {
  orderId: string;
  orderNumber: string;
  returnTo: string;
  value: string;
  label: string;
};

export default function DeliveryStatusSelect({
  orderId,
  orderNumber,
  returnTo,
  value,
  label,
}: Props) {
  const formRef = useRef<HTMLFormElement>(null);
  const [saving, setSaving] = useState(false);

  return (
    <form
      ref={formRef}
      action={updateDeliveryStatus}
      style={{
        display: "flex",
        alignItems: "center",
        minWidth: "132px",
      }}
    >
      <input type="hidden" name="order_id" value={orderId} />
      <input type="hidden" name="return_to" value={returnTo} />

      <select
        name="delivery_status"
        defaultValue={value}
        aria-label={`Delivery status for ${orderNumber}`}
        title={`Current: ${label}`}
        disabled={saving}
        onChange={() => {
          setSaving(true);
          formRef.current?.requestSubmit();
        }}
        style={{
          width: "100%",
          minWidth: "126px",
          padding: "8px 10px",
          border: "1px solid rgba(128, 75, 94, 0.2)",
          borderRadius: "999px",
          background: "#fff8fa",
          color: "#8f5a6b",
          fontSize: "12px",
          fontWeight: 800,
          letterSpacing: "0.01em",
          cursor: saving ? "wait" : "pointer",
          opacity: saving ? 0.65 : 1,
        }}
      >
        <option value="NOT_STARTED">Not Started</option>
        <option value="IN_PROGRESS">In Progress</option>
        <option value="DELIVERED">Delivered</option>
        <option value="CANCELLED">Cancelled</option>
      </select>
    </form>
  );
}
