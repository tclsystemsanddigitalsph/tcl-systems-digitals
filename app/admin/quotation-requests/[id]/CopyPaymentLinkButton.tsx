"use client";

import { useState } from "react";

export default function CopyPaymentLinkButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button type="button" onClick={copyLink}>
      {copied ? "Copied!" : "Copy Payment Link"}
    </button>
  );
}
