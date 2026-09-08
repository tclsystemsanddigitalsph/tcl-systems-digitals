"use client";

import { useState } from "react";

export default function CopyReceiptLinkButton() {
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={copyLink}
      className="button"
      style={{
        minHeight: 48,
        paddingInline: 16,
        border: "1px solid var(--border)",
        background: "#fff",
        cursor: "pointer",
      }}
    >
      {copied ? "Receipt Link Copied ✓" : "Copy Receipt Link"}
    </button>
  );
}
