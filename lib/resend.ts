import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY?.trim();
const fromEmail = process.env.RESEND_FROM_EMAIL?.trim();
const replyToEmail = process.env.RESEND_REPLY_TO_EMAIL?.trim();

const resendClient = apiKey ? new Resend(apiKey) : null;

export type SendTclEmailInput = {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
};

export async function sendTclEmail({
  to,
  subject,
  html,
  text,
  replyTo,
}: SendTclEmailInput) {
  const recipients = (Array.isArray(to) ? to : [to])
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

  if (recipients.length === 0) {
    return {
      ok: false as const,
      skipped: true as const,
      reason: "missing-recipient",
    };
  }

  if (!resendClient || !fromEmail) {
    console.warn(
      "[email] Resend is not fully configured. Set RESEND_API_KEY and RESEND_FROM_EMAIL.",
    );

    return {
      ok: false as const,
      skipped: true as const,
      reason: "resend-not-configured",
    };
  }

  try {
    const result = await resendClient.emails.send({
      from: fromEmail,
      to: recipients,
      subject,
      html,
      ...(text ? { text } : {}),
      ...(replyTo || replyToEmail
        ? { replyTo: replyTo || replyToEmail }
        : {}),
    });

    if (result.error) {
      console.error("[email] Resend error:", result.error);

      return {
        ok: false as const,
        skipped: false as const,
        error: result.error,
      };
    }

    return {
      ok: true as const,
      skipped: false as const,
      id: result.data?.id ?? null,
    };
  } catch (error) {
    console.error("[email] Unexpected Resend failure:", error);

    return {
      ok: false as const,
      skipped: false as const,
      error,
    };
  }
}
