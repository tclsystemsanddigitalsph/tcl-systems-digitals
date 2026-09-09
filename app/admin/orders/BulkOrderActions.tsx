"use client";

import { useEffect, useState } from "react";
import { deleteOrdersBulk } from "./actions";

type Props = {
  returnTo: string;
};

function getOrderCheckboxes() {
  return Array.from(
    document.querySelectorAll<HTMLInputElement>(
      'input[data-order-select="true"]',
    ),
  );
}

export default function BulkOrderActions({ returnTo }: Props) {
  const [selectedCount, setSelectedCount] = useState(0);

  const refreshCount = () => {
    setSelectedCount(
      getOrderCheckboxes().filter((checkbox) => checkbox.checked).length,
    );
  };

  useEffect(() => {
    const handleChange = (event: Event) => {
      const target = event.target;

      if (
        target instanceof HTMLInputElement &&
        target.dataset.orderSelect === "true"
      ) {
        refreshCount();
      }
    };

    document.addEventListener("change", handleChange);
    refreshCount();

    return () => {
      document.removeEventListener("change", handleChange);
    };
  }, []);

  const selectAll = () => {
    getOrderCheckboxes().forEach((checkbox) => {
      checkbox.checked = true;
    });
    refreshCount();
  };

  const clearAll = () => {
    getOrderCheckboxes().forEach((checkbox) => {
      checkbox.checked = false;
    });
    refreshCount();
  };

  return (
    <form
      id="bulk-delete-orders-form"
      action={deleteOrdersBulk}
      onSubmit={(event) => {
        if (selectedCount === 0) {
          event.preventDefault();
          window.alert("Select at least one order first.");
          return;
        }

        const confirmed = window.confirm(
          `Permanently delete ${selectedCount} selected order${
            selectedCount === 1 ? "" : "s"
          }? This cannot be undone and does not refund any payment.`,
        );

        if (!confirmed) {
          event.preventDefault();
        }
      }}
      style={{
        display: "flex",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "10px",
        margin: "0 0 14px",
        padding: "12px 14px",
        border: "1px solid rgba(128, 75, 94, 0.14)",
        borderRadius: "14px",
        background: "rgba(255, 250, 252, 0.8)",
      }}
    >
      <input type="hidden" name="return_to" value={returnTo} />
      <input type="hidden" name="confirmation" value="DELETE" />

      <strong
        style={{
          marginRight: "auto",
          fontSize: "12px",
          color: "#79505f",
        }}
      >
        {selectedCount > 0
          ? `${selectedCount} selected`
          : "Select orders for bulk actions"}
      </strong>

      <button
        type="button"
        onClick={selectAll}
        style={{
          border: "1px solid rgba(128, 75, 94, 0.18)",
          borderRadius: "999px",
          background: "#fff",
          padding: "8px 12px",
          fontSize: "11px",
          fontWeight: 800,
          cursor: "pointer",
        }}
      >
        Select all on page
      </button>

      {selectedCount > 0 ? (
        <button
          type="button"
          onClick={clearAll}
          style={{
            border: 0,
            background: "transparent",
            padding: "8px 4px",
            fontSize: "11px",
            fontWeight: 800,
            cursor: "pointer",
          }}
        >
          Clear
        </button>
      ) : null}

      <button
        type="submit"
        disabled={selectedCount === 0}
        style={{
          border: "1px solid rgba(148, 58, 76, 0.25)",
          borderRadius: "999px",
          background: selectedCount === 0 ? "#f5edef" : "#8f5364",
          color: selectedCount === 0 ? "#b09aa1" : "#fff",
          padding: "8px 13px",
          fontSize: "11px",
          fontWeight: 800,
          cursor: selectedCount === 0 ? "not-allowed" : "pointer",
        }}
      >
        Delete selected
      </button>
    </form>
  );
}
