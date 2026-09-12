"use client";

import { useState } from "react";

export default function AccountNumberCopyButton({
  accountNumber,
}: {
  accountNumber: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copyAccountNumber() {
    try {
      await navigator.clipboard.writeText(accountNumber);
      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={copyAccountNumber}
      aria-label="Copy BPI account number"
      style={{
        minHeight: 30,
        padding: "5px 10px",
        borderRadius: 8,
        border: "1px solid #eadde2",
        background: copied ? "#f5fff7" : "#fff7fa",
        color: "#2f2529",
        fontSize: ".78rem",
        fontWeight: 800,
        cursor: "pointer",
      }}
    >
      {copied ? "Copied ✓" : "Copy"}
    </button>
  );
}
