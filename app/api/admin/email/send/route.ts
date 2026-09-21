import { NextResponse } from "next/server";

import { createAdminSupabaseClient } from "@/lib/supabase-admin";

import { createServerSupabaseClient } from "@/lib/supabase-server";

import { sendTclEmail } from "@/lib/resend";

import { tclEmailShell } from "@/lib/tcl-email-template";

export const runtime = "nodejs";

export const dynamic = "force-dynamic";

function clean(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function emailPurpose(subject: string) {
  const cleaned = subject
    .replace(/^TCL Systems & Digitals PH\s*[-–—:]\s*/i, "")
    .trim();

  return cleaned || subject;
}

export async function POST(request: Request) {
  try {
    const auth = await createServerSupabaseClient();

    const {
      data: { user },
    } = await auth.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const body = await request.json();

    const name = clean(body.name, 120);
    const to = clean(body.to, 254);
    const subject = clean(body.subject, 180);
    const emailHeading = clean(body.emailHeading, 180);
    const message = clean(body.message, 5000);
    const templateType = clean(body.templateType, 80) || "CUSTOM";
    const buttonLabel = clean(body.buttonLabel, 80);
    const buttonUrl = clean(body.buttonUrl, 1000);
    const relatedType = clean(body.relatedType, 30) || null;
    const relatedId = clean(body.relatedId, 100) || null;
    const relatedReference = clean(body.relatedReference, 200) || null;

    if (!to || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
      return NextResponse.json(
        { error: "Enter a valid recipient email." },
        { status: 400 },
      );
    }

    if (!subject || !message) {
      return NextResponse.json(
        { error: "Subject and message are required." },
        { status: 400 },
      );
    }

    if (templateType === "CUSTOM" && !emailHeading) {
      return NextResponse.json(
        { error: "Email heading is required for a custom message." },
        { status: 400 },
      );
    }

    if ((buttonLabel && !buttonUrl) || (!buttonLabel && buttonUrl)) {
      return NextResponse.json(
        { error: "CTA text and URL must be provided together." },
        { status: 400 },
      );
    }

    if (buttonUrl && !/^https?:\/\//i.test(buttonUrl)) {
      return NextResponse.json(
        { error: "CTA URL must begin with http:// or https://." },
        { status: 400 },
      );
    }

    const displayHeading =
      templateType === "CUSTOM" ? emailHeading : emailPurpose(subject);

    const html = tclEmailShell({
      eyebrow: "TCL CLIENT NOTIFICATION",
      title: displayHeading,
      message,
      ...(buttonLabel && buttonUrl ? { buttonLabel, buttonUrl } : {}),
      note:
        "This is a notification-only email. Please do not reply to this message. For questions or concerns, contact TCL Systems & Digitals PH on Telegram: @tclsystemsanddigitalsph.",
    });

    const text = [
      displayHeading,
      "",
      message,
      "",
      ...(buttonLabel && buttonUrl
        ? [`${buttonLabel}: ${buttonUrl}`, ""]
        : []),
      "This is a notification-only email. Please do not reply.",
      "Questions or concerns: Telegram @tclsystemsanddigitalsph",
    ].join("\n");

    const sent = await sendTclEmail({
      to,
      subject,
      html,
      text,
    });

    if (!sent.ok) {
      console.error("Manual admin email send failed:", sent);

      try {
        const admin = createAdminSupabaseClient();

        await admin.from("email_history").insert({
          recipient_email: to,
          recipient_name: name || null,
          subject,
          message,
          template_type: templateType,
          button_label: buttonLabel || null,
          button_url: buttonUrl || null,
          related_type: relatedType,
          related_id: relatedId,
          related_reference: relatedReference,
          send_status: "FAILED",
          resend_email_id: null,
          error_message: sent.reason || "Email delivery failed.",
        });
      } catch (historyError) {
        console.error("Failed to record unsuccessful email:", historyError);
      }

      return NextResponse.json(
        { error: sent.reason || "Unable to send email." },
        { status: 500 },
      );
    }

    const resendEmailId = sent.id ? String(sent.id) : "";

    let history = null;

    try {
      const admin = createAdminSupabaseClient();

      const { data, error } = await admin
        .from("email_history")
        .insert({
          recipient_email: to,
          recipient_name: name || null,
          subject,
          message,
          template_type: templateType,
          button_label: buttonLabel || null,
          button_url: buttonUrl || null,
          related_type: relatedType,
          related_id: relatedId,
          related_reference: relatedReference,
          send_status: "SENT",
          resend_email_id: resendEmailId || null,
          error_message: null,
        })
        .select(
          "id,recipient_email,recipient_name,subject,message,template_type,button_label,button_url,related_type,related_id,related_reference,send_status,resend_email_id,error_message,sent_at",
        )
        .single();

      if (error) {
        console.error("Email history save error:", error);
      } else {
        history = data;
      }
    } catch (historyError) {
      console.error("Email history save exception:", historyError);
    }

    return NextResponse.json({
      ok: true,
      history,
    });
  } catch (error) {
    console.error("Admin email send error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to send email.",
      },
      { status: 500 },
    );
  }
}
