"use client";

import { useMemo, useState } from "react";

type Item = {
  key: string;
  name: string;
  description: string;
  amount: string;
};

function createKey() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export default function ManualQuotationItemsEditor() {
  const [items, setItems] = useState<Item[]>([
    { key: createKey(), name: "", description: "", amount: "" },
  ]);

  const total = useMemo(
    () =>
      items.reduce((sum, item) => {
        const amount = Number(item.amount);
        return sum + (Number.isFinite(amount) && amount >= 0 ? amount : 0);
      }, 0),
    [items],
  );

  function updateItem(
    index: number,
    field: "name" | "description" | "amount",
    value: string,
  ) {
    setItems((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item,
      ),
    );
  }

  function addItem() {
    setItems((current) => [
      ...current,
      { key: createKey(), name: "", description: "", amount: "" },
    ]);
  }

  function removeItem(index: number) {
    setItems((current) => {
      const next = current.filter((_, itemIndex) => itemIndex !== index);
      return next.length
        ? next
        : [{ key: createKey(), name: "", description: "", amount: "" }];
    });
  }

  return (
    <div className="manual-quote-items">
      <div className="manual-quote-items-labels" aria-hidden="true">
        <span />
        <span>Feature / service</span>
        <span>Description</span>
        <span>Amount</span>
        <span />
      </div>

      <div className="manual-quote-item-list">
        {items.map((item, index) => (
          <div className="manual-quote-item" key={item.key}>
            <span className="manual-quote-item-number">
              {String(index + 1).padStart(2, "0")}
            </span>

            <label>
              <span>Feature / service</span>
              <input
                name="item_name"
                value={item.name}
                onChange={(event) =>
                  updateItem(index, "name", event.target.value)
                }
                placeholder="Feature or service"
              />
            </label>

            <label>
              <span>Description</span>
              <textarea
                name="item_description"
                rows={1}
                value={item.description}
                onChange={(event) =>
                  updateItem(index, "description", event.target.value)
                }
                placeholder="What is included?"
              />
            </label>

            <label>
              <span>Amount</span>
              <div className="manual-quote-money-field">
                <span>₱</span>
                <input
                  name="item_amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={item.amount}
                  onChange={(event) =>
                    updateItem(index, "amount", event.target.value)
                  }
                  placeholder="0.00"
                />
              </div>
            </label>

            <button
              className="manual-quote-remove-item"
              type="button"
              onClick={() => removeItem(index)}
              aria-label={`Remove item ${index + 1}`}
              title="Remove item"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <div className="manual-quote-item-footer">
        <button
          className="manual-quote-add-item"
          type="button"
          onClick={addItem}
        >
          + Add item
        </button>

        <div className="manual-quote-total">
          <span>QUOTATION TOTAL</span>
          <strong>{formatMoney(total)}</strong>
        </div>
      </div>
    </div>
  );
}
