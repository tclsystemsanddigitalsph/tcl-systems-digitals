"use client";

import { useMemo, useState } from "react";
import styles from "./quotation-detail.module.css";

const FULL_PAYMENT_FEE_PERCENT = 4;
const DEPOSIT_PAYMENT_FEE_PERCENT = 6;

type InitialItem = {
  id: string;
  item_name: string;
  item_description: string | null;
  amount: number | string;
};

type EditorItem = {
  key: string;
  id: string;
  item_name: string;
  item_description: string;
  amount: string;
};

function createKey() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function money(value: number) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function toCentavos(value: number) {
  return Math.round((value + Number.EPSILON) * 100);
}

export default function QuotationItemsEditor({
  initialItems,
  fallbackQuotedAmount,
}: {
  initialItems: InitialItem[];
  fallbackQuotedAmount: number | string | null;
}) {
  const [items, setItems] = useState<EditorItem[]>(() => {
    if (initialItems.length > 0) {
      return initialItems.map((item) => ({
        key: item.id,
        id: item.id,
        item_name: item.item_name,
        item_description: item.item_description ?? "",
        amount: String(item.amount ?? ""),
      }));
    }

    if (
      fallbackQuotedAmount !== null &&
      fallbackQuotedAmount !== "" &&
      Number(fallbackQuotedAmount) > 0
    ) {
      return [
        {
          key: createKey(),
          id: "",
          item_name: "Base project / agreed scope",
          item_description: "",
          amount: String(fallbackQuotedAmount),
        },
      ];
    }

    return [
      {
        key: createKey(),
        id: "",
        item_name: "",
        item_description: "",
        amount: "",
      },
    ];
  });

  const subtotal = useMemo(
    () =>
      items.reduce((sum, item) => {
        const parsed = Number(item.amount);
        return sum + (Number.isFinite(parsed) && parsed >= 0 ? parsed : 0);
      }, 0),
    [items],
  );

  const pricing = useMemo(() => {
    const subtotalCentavos = toCentavos(subtotal);
    const fullFeeCentavos = Math.round(
      (subtotalCentavos * FULL_PAYMENT_FEE_PERCENT) / 100,
    );
    const depositFeeCentavos = Math.round(
      (subtotalCentavos * DEPOSIT_PAYMENT_FEE_PERCENT) / 100,
    );

    return {
      fullTotal: (subtotalCentavos + fullFeeCentavos) / 100,
      depositTotal: (subtotalCentavos + depositFeeCentavos) / 100,
    };
  }, [subtotal]);

  function updateItem(
    key: string,
    field: "item_name" | "item_description" | "amount",
    value: string,
  ) {
    setItems((current) =>
      current.map((item) =>
        item.key === key ? { ...item, [field]: value } : item,
      ),
    );
  }

  function addItem() {
    setItems((current) => [
      ...current,
      {
        key: createKey(),
        id: "",
        item_name: "",
        item_description: "",
        amount: "",
      },
    ]);
  }

  function removeItem(key: string) {
    setItems((current) => {
      const next = current.filter((item) => item.key !== key);
      return next.length > 0
        ? next
        : [
            {
              key: createKey(),
              id: "",
              item_name: "",
              item_description: "",
              amount: "",
            },
          ];
    });
  }

  return (
    <div className={styles.itemsEditor}>
      <div className={styles.itemsEditorHeading}>
        <div>
          <span>QUOTATION ITEMS</span>
          <strong>Scope & pricing</strong>
        </div>
        <small>{items.length} item{items.length === 1 ? "" : "s"}</small>
      </div>

      <div className={styles.itemColumnLabels} aria-hidden="true">
        <span>Feature / service</span>
        <span>Description</span>
        <span>Amount</span>
        <span />
      </div>

      <div className={styles.compactItemList}>
        {items.map((item, index) => (
          <div className={styles.quoteItem} key={item.key}>
            <input type="hidden" name="item_id" value={item.id} />

            <div className={styles.itemNumber}>
              {String(index + 1).padStart(2, "0")}
            </div>

            <label className={styles.compactField}>
              <span>Feature / service</span>
              <input
                type="text"
                name="item_name"
                value={item.item_name}
                onChange={(event) =>
                  updateItem(item.key, "item_name", event.target.value)
                }
                placeholder="Feature or service"
              />
            </label>

            <label className={styles.compactField}>
              <span>Description</span>
              <textarea
                name="item_description"
                rows={1}
                value={item.item_description}
                onChange={(event) =>
                  updateItem(item.key, "item_description", event.target.value)
                }
                placeholder="What is included?"
              />
            </label>

            <label className={styles.compactField}>
              <span>Amount</span>
              <div className={styles.moneyInput}>
                <span>₱</span>
                <input
                  type="number"
                  name="item_amount"
                  min="0"
                  step="0.01"
                  value={item.amount}
                  onChange={(event) =>
                    updateItem(item.key, "amount", event.target.value)
                  }
                  placeholder="0.00"
                />
              </div>
            </label>

            <button
              className={styles.removeItemButton}
              type="button"
              onClick={() => removeItem(item.key)}
              aria-label={`Remove item ${index + 1}`}
              title="Remove item"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <button className={styles.addItemButton} type="button" onClick={addItem}>
        + Add item
      </button>

      <div className={styles.pricingSummary}>
        <div className={styles.pricingPrimary}>
          <span>QUOTATION SUBTOTAL</span>
          <strong>{money(subtotal)}</strong>
        </div>
        <div>
          <span>ONLINE FULL · +4%</span>
          <strong>{money(pricing.fullTotal)}</strong>
        </div>
        <div>
          <span>50% DOWN · +6%</span>
          <strong>{money(pricing.depositTotal)}</strong>
        </div>
        <div>
          <span>DIRECT BPI</span>
          <strong>{money(subtotal)}</strong>
        </div>
      </div>

      <p className={styles.paymentNote}>
        Client selects the payment option on the private quotation link. The
        selected processing-fee rate is locked after acceptance.
      </p>

      <input type="hidden" name="quoted_amount" value={String(subtotal)} />
    </div>
  );
}
