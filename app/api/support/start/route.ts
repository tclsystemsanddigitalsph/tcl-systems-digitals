import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

type StartSupportBody = {
  customerName?: string;
  customerEmail?: string;
  message?: string;
  currentPage?: string;
};

function makeSupportReference() {
  return `TCL-SUPPORT-${randomUUID()
    .replace(/-/g, "")
    .slice(0, 6)
    .toUpperCase()}`;
}

function cleanOptional(value: unknown, maxLength: number) {
  if (typeof value !== "string") return null;
  const cleaned = value.trim();
  return cleaned ? cleaned.slice(0, maxLength) : null;
}

function escapeTelegramHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as StartSupportBody;

    const customerName = cleanOptional(body.customerName, 120);
    const customerEmail = cleanOptional(body.customerEmail, 254)?.toLowerCase() ?? null;
    const currentPage = cleanOptional(body.currentPage, 500);
    const message = cleanOptional(body.message, 4000);

    if (!message) {
      return NextResponse.json(
        { error: "Please enter a message." },
        { status: 400 },
      );
    }

    if (customerEmail && !customerEmail.includes("@")) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 },
      );
    }

    const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN?.trim();
    const telegramChatId = process.env.TELEGRAM_CHAT_ID?.trim();

    if (!telegramBotToken || !telegramChatId) {
      console.error("Telegram support configuration is missing.");

      return NextResponse.json(
        { error: "Live support is temporarily unavailable." },
        { status: 503 },
      );
    }

    const supabase = createAdminSupabaseClient();
    const supportReference = makeSupportReference();

    const { data: conversation, error: conversationError } =
      await supabase
        .from("support_conversations")
        .insert({
          support_reference: supportReference,
          customer_name: customerName,
          customer_email: customerEmail,
          current_page: currentPage,
          status: "WAITING_FOR_TCL",
          telegram_chat_id: telegramChatId,
          last_customer_message_at: new Date().toISOString(),
        })
        .select("id,support_reference,customer_token")
        .single();

    if (conversationError || !conversation) {
      console.error(
        "Unable to create support conversation:",
        conversationError,
      );

      return NextResponse.json(
        { error: "Unable to start the support conversation." },
        { status: 500 },
      );
    }

    const { error: messageError } = await supabase
      .from("support_messages")
      .insert({
        conversation_id: conversation.id,
        sender: "CUSTOMER",
        message,
      });

    if (messageError) {
      console.error("Unable to save support message:", messageError);

      await supabase
        .from("support_conversations")
        .delete()
        .eq("id", conversation.id);

      return NextResponse.json(
        { error: "Unable to save your support message." },
        { status: 500 },
      );
    }

    const telegramText = [
      "<b>💬 New TCL Support Chat</b>",
      "",
      `<b>Support ID:</b> ${escapeTelegramHtml(conversation.support_reference)}`,
      `<b>Customer:</b> ${escapeTelegramHtml(customerName ?? "Not provided")}`,
      `<b>Email:</b> ${escapeTelegramHtml(customerEmail ?? "Not provided")}`,
      `<b>Page:</b> ${escapeTelegramHtml(currentPage ?? "Not provided")}`,
      "",
      "<b>Message:</b>",
      escapeTelegramHtml(message),
      "",
      "<i>Reply directly to this Telegram message to answer this customer.</i>",
    ].join("\n");

    const telegramResponse = await fetch(
      `https://api.telegram.org/bot${telegramBotToken}/sendMessage`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: telegramChatId,
          text: telegramText,
          parse_mode: "HTML",
          disable_web_page_preview: true,
        }),
        cache: "no-store",
      },
    );

    const telegramData = (await telegramResponse.json()) as {
      ok?: boolean;
      result?: {
        message_id?: number;
      };
      description?: string;
    };

    const telegramMessageId = telegramData.result?.message_id;

    if (!telegramResponse.ok || !telegramData.ok || !telegramMessageId) {
      console.error(
        "Unable to send Telegram support notification:",
        telegramData,
      );

      await supabase
        .from("support_conversations")
        .delete()
        .eq("id", conversation.id);

      return NextResponse.json(
        { error: "Unable to connect to TCL live support right now." },
        { status: 502 },
      );
    }

    const { error: telegramUpdateError } = await supabase
      .from("support_conversations")
      .update({
        telegram_root_message_id: telegramMessageId,
      })
      .eq("id", conversation.id);

    if (telegramUpdateError) {
      console.error(
        "Unable to save Telegram support message ID:",
        telegramUpdateError,
      );

      return NextResponse.json(
        { error: "Unable to finish starting the support conversation." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      supportReference: conversation.support_reference,
      customerToken: conversation.customer_token,
      status: "WAITING_FOR_TCL",
    });
  } catch (error) {
    console.error("Unable to start TCL support chat:", error);

    return NextResponse.json(
      { error: "Unable to start live support." },
      { status: 500 },
    );
  }
}
