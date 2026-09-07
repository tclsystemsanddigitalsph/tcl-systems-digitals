"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type PaymentState =
  | "CHECKING"
  | "PENDING"
  | "ERROR";

export default function PaymentProcessing({
  receipt,
}: {
  receipt: string;
}) {
  const [state, setState] =
    useState<PaymentState>("CHECKING");
  const [message, setMessage] = useState(
    "We’re confirming your PayMongo payment.",
  );

  useEffect(() => {
    if (!receipt) {
      setState("ERROR");
      setMessage(
        "This payment confirmation link is invalid.",
      );
      return;
    }

    let cancelled = false;
    let attempts = 0;
    let timer: ReturnType<typeof setTimeout>;

    async function checkStatus() {
      attempts += 1;

      try {
        const response = await fetch(
          `/api/paymongo/status?receipt=${encodeURIComponent(
            receipt,
          )}`,
          {
            cache: "no-store",
          },
        );

        const data = (await response.json()) as {
          status?: string;
          redirectUrl?: string;
          error?: string;
        };

        if (cancelled) return;

        if (
          response.ok &&
          data.status === "COMPLETED" &&
          data.redirectUrl
        ) {
          window.location.replace(
            data.redirectUrl,
          );
          return;
        }

        if (!response.ok) {
          throw new Error(
            data.error ||
              "Unable to check the payment.",
          );
        }

        setState("PENDING");

        if (attempts >= 30) {
          setMessage(
            "Your payment is still being confirmed. Keep this page open and use Check again below.",
          );
          return;
        }

        setMessage(
          "Payment received by PayMongo. Waiting for final confirmation…",
        );

        timer = setTimeout(
          checkStatus,
          2000,
        );
      } catch (error) {
        if (cancelled) return;

        setState("ERROR");
        setMessage(
          error instanceof Error
            ? error.message
            : "Unable to confirm the payment.",
        );
      }
    }

    checkStatus();

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [receipt]);

  function retry() {
    window.location.reload();
  }

  return (
    <section
      style={{
        padding: "clamp(34px, 6vw, 60px)",
        border: "1px solid var(--border)",
        borderRadius: 24,
        background: "var(--surface, #fff)",
        boxShadow:
          "0 18px 50px rgba(49, 37, 41, 0.08)",
        textAlign: "center",
      }}
    >
      <div
        aria-hidden="true"
        style={{
          width: 72,
          height: 72,
          margin: "0 auto 22px",
          borderRadius: "50%",
          display: "grid",
          placeItems: "center",
          background:
            "rgba(217, 86, 139, 0.10)",
          fontSize: 30,
        }}
      >
        {state === "ERROR" ? "!" : "✓"}
      </div>

      <span className="section-kicker">
        PayMongo
      </span>

      <h1
        style={{
          marginTop: 12,
          marginBottom: 14,
          fontSize:
            "clamp(2rem, 5vw, 2.8rem)",
        }}
      >
        Confirming your payment
      </h1>

      <p
        style={{
          maxWidth: 560,
          margin: "0 auto",
          color: "var(--text-soft)",
          lineHeight: 1.7,
        }}
      >
        {message}
      </p>

      {state !== "CHECKING" && (
        <div
          style={{
            marginTop: 28,
            display: "flex",
            flexWrap: "wrap",
            gap: 12,
            justifyContent: "center",
          }}
        >
          <button
            type="button"
            className="button button-primary"
            onClick={retry}
          >
            Check again
          </button>

          <Link href="/shop">
            Back to Shop
          </Link>
        </div>
      )}
    </section>
  );
}
