"use client";

import { useState } from "react";
import styles from "./reviews.module.css";

type InviteCardProps = {
  invite: {
    id: string;
    token: string;
    customerName: string;
    customerEmail: string | null;
    productName: string | null;
    status: string;
    createdLabel: string;
    expiresLabel: string;
  };
  revokeAction: (formData: FormData) => void | Promise<void>;
};

export default function InviteCard({ invite, revokeAction }: InviteCardProps) {
  const [copied, setCopied] = useState(false);
  const path = `/review/${invite.token}`;
  const statusClass = styles[invite.status.toLowerCase()] || "";

  async function copyLink() {
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
    <details className={`${styles.invite} ${styles.inviteDisclosure}`}>
      <summary className={styles.inviteNativeSummary}>
        <span className={styles.inviteIdentity}>
          <strong>{invite.customerName}</strong>
          <small>
            {invite.productName || "General review"}
            {invite.customerEmail ? ` · ${invite.customerEmail}` : ""}
          </small>
        </span>
        <span className={styles.inviteSummaryRight}>
          <span className={`${styles.status} ${statusClass}`}>{invite.status}</span>
          <span className={styles.nativeChevron}>⌄</span>
        </span>
      </summary>

      <div className={styles.inviteDetails}>
        <div className={styles.linkBox}><code>{path}</code></div>

        <div className={styles.inviteBottom}>
          <div>
            <small>Created {invite.createdLabel}</small>
            <small>{invite.expiresLabel}</small>
          </div>

          <div className={styles.actions}>
            <button
              className={copied ? styles.copyButtonDone : styles.secondary}
              type="button"
              onClick={copyLink}
            >
              {copied ? "Copied ✓" : "Copy Link"}
            </button>

            {invite.status === "ACTIVE" ? (
              <>
                <a href={path} target="_blank" rel="noreferrer">Open Link</a>
                <form action={revokeAction}>
                  <input type="hidden" name="invitation_id" value={invite.id} />
                  <button className={styles.secondary} type="submit">Revoke</button>
                </form>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </details>
  );
}
