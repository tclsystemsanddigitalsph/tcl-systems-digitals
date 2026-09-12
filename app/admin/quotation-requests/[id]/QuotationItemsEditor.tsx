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
      fullFee: fullFeeCentavos / 100,
      fullTotal: (subtotalCentavos + fullFeeCentavos) / 100,
      depositFee: depositFeeCentavos / 100,
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
          <strong>Features, services & scope</strong>
        </div>
        <small>
          The client chooses Online Full Payment (4%), Online 50% Down Payment (6%), or Direct BPI Full Payment (0%) on the quotation link.
        </small>
      </div>

      {items.map((item, index) => (
        <article className={styles.quoteItem} key={item.key}>
          <input type="hidden" name="item_id" value={item.id} />

          <div className={styles.quoteItemTop}>
            <div>
              <span>ITEM {String(index + 1).padStart(2, "0")}</span>
              <strong>
                {item.item_name.trim() || `Quotation Item ${index + 1}`}
              </strong>
            </div>

            <button
              className={styles.removeItemButton}
              type="button"
              onClick={() => removeItem(item.key)}
            >
              Remove
            </button>
          </div>

          <div className={styles.quoteItemGrid}>
            <label>
              <span>Feature / service</span>
              <input
                type="text"
                name="item_name"
                value={item.item_name}
                onChange={(event) =>
                  updateItem(item.key, "item_name", event.target.value)
                }
                placeholder="e.g. Student account restriction"
              />
            </label>

            <label>
              <span>Description</span>
              <textarea
                name="item_description"
                value={item.item_description}
                onChange={(event) =>
                  updateItem(item.key, "item_description", event.target.value)
                }
                placeholder="What is included?"
              />
            </label>

            <label>
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
          </div>
        </article>
      ))}

      <button
        className={styles.addItemButton}
        type="button"
        onClick={addItem}
      >
        + Add Another Item
      </button>

      <div className={styles.quoteTotal}>
        <div>
          <span>QUOTATION SUBTOTAL</span>
          <small>Current agreed scope before processing fee</small>
        </div>
        <strong>{money(subtotal)}</strong>
      </div>

      <div className={styles.quoteTotal}>
        <div>
          <span>FULL PAYMENT OPTION</span>
          <small>4% processing fee · full amount due after acceptance</small>
        </div>
        <strong>{money(pricing.fullTotal)}</strong>
      </div>

      <div className={styles.quoteTotal}>
        <div>
          <span>50% DOWN PAYMENT OPTION</span>
          <small>6% processing fee · half of the fee-inclusive total due first</small>
        </div>
        <strong>{money(pricing.depositTotal)}</strong>
      </div>

      <div
        style={{
          marginTop: 12,
          padding: 14,
          borderRadius: 13,
          background: "rgba(0,0,0,.035)",
          fontSize: ".84rem",
          lineHeight: 1.6,
        }}
      >
        <strong style={{ display: "block", marginBottom: 4 }}>
          Payment option note
        </strong>
        The quotation stores the scope subtotal only. The client selects the
        payment plan on the private quotation link. Full Payment uses a 4%
        processing fee; 50% Down Payment uses a 6% processing fee. Once
        accepted, that selected fee rate stays locked to the project.
      </div>

      {/*
        quoted_amount intentionally stores the quotation-item SUBTOTAL.
        The server-side acceptance action adds the fee selected by the client
        (4% for Full Payment or 6% for 50% Down Payment). Keeping the subtotal
        here prevents the processing fee from being applied twice.
      */}
      <input type="hidden" name="quoted_amount" value={String(subtotal)} />
    </div>
  );
}
