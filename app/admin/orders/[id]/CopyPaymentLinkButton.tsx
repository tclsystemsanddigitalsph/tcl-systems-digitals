"use client";

import { useState } from "react";

export default function CopyPaymentLinkButton({
  path,
}: {
  path: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copyPaymentLink() {
    const fullUrl = `${window.location.origin}${path}`;

    try {
      await navigator.clipboard.writeText(fullUrl);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = fullUrl;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      textarea.remove();
    }

    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <button
      type="button"
      onClick={copyPaymentLink}
      style={{
        width: "100%",
        minHeight: "38px",
        marginBottom: "8px",
        border: copied
          ? "1px solid #cfe7d6"
          : "1px solid var(--border)",
        borderRadius: "10px",
        background: copied ? "#eef8f1" : "#fff",
        color: copied ? "#347247" : "var(--text-soft)",
        fontSize: "0.66rem",
        fontWeight: 850,
        cursor: "pointer",
      }}
    >
      {copied ? "Copied Payment Link ✓" : "Copy Payment Link"}
    </button>
  );
}
