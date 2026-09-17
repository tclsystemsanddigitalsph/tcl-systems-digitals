import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

type SendSupportBody = {
  customerToken?: string;
  message?: string;
};

function cleanMessage(value: unknown) {
  if (typeof value !== "string") return null;
  const cleaned = value.trim();
  return cleaned ? cleaned.slice(0, 4000) : null;
}

function escapeTelegramHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SendSupportBody;
    const customerToken = body.customerToken?.trim();
    const message = cleanMessage(body.message);

    if (!customerToken || !message) {
      return NextResponse.json(
        { error: "Support session and message are required." },
        { status: 400 },
      );
    }

    const supabase = createAdminSupabaseClient();

    const { data: conversation, error: conversationError } =
      await supabase
        .from("support_conversations")
        .select(
          "id,support_reference,status,telegram_chat_id,telegram_root_message_id",
        )
        .eq("customer_token", customerToken)
        .maybeSingle();

    if (conversationError) {
      console.error("Unable to load support conversation:", conversationError);

      return NextResponse.json(
        { error: "Unable to load support conversation." },
        { status: 500 },
      );
    }

    if (!conversation) {
      return NextResponse.json(
        { error: "Support conversation not found." },
        { status: 404 },
      );
    }

    if (conversation.status === "CLOSED") {
      return NextResponse.json(
        { error: "This support conversation is already closed." },
        { status: 409 },
      );
    }

    const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN?.trim();
    const configuredChatId = process.env.TELEGRAM_CHAT_ID?.trim();

    if (
      !telegramBotToken ||
      !configuredChatId ||
      !conversation.telegram_root_message_id
    ) {
      return NextResponse.json(
        { error: "Live support is temporarily unavailable." },
        { status: 503 },
      );
    }

    const telegramChatId =
      conversation.telegram_chat_id?.trim() || configuredChatId;

    if (telegramChatId !== configuredChatId) {
      console.error(
        "Support conversation Telegram chat ID does not match configuration.",
      );

      return NextResponse.json(
        { error: "Live support is temporarily unavailable." },
        { status: 503 },
      );
    }

    const { data: savedMessage, error: insertError } = await supabase
      .from("support_messages")
      .insert({
        conversation_id: conversation.id,
        sender: "CUSTOMER",
        message,
      })
      .select("id,sender,message,created_at")
      .single();

    if (insertError || !savedMessage) {
      console.error("Unable to save customer support message:", insertError);

      return NextResponse.json(
        { error: "Unable to send your message." },
        { status: 500 },
      );
    }

    const telegramText = [
      `<b>💬 ${escapeTelegramHtml(conversation.support_reference)}</b>`,
      "<b>Customer:</b>",
      escapeTelegramHtml(message),
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
          reply_parameters: {
            message_id: conversation.telegram_root_message_id,
          },
        }),
        cache: "no-store",
      },
    );

    const telegramData = (await telegramResponse.json()) as {
      ok?: boolean;
      description?: string;
    };

    if (!telegramResponse.ok || !telegramData.ok) {
      console.error(
        "Unable to forward customer support message to Telegram:",
        telegramData,
      );

      await supabase
        .from("support_messages")
        .delete()
        .eq("id", savedMessage.id);

      return NextResponse.json(
        { error: "Unable to send your message to TCL right now." },
        { status: 502 },
      );
    }

    const { error: updateError } = await supabase
      .from("support_conversations")
      .update({
        status: "WAITING_FOR_TCL",
        last_customer_message_at: new Date().toISOString(),
      })
      .eq("id", conversation.id);

    if (updateError) {
      console.error(
        "Unable to update support conversation status:",
        updateError,
      );
    }

    return NextResponse.json({
      ok: true,
      status: "WAITING_FOR_TCL",
      message: savedMessage,
    });
  } catch (error) {
    console.error("Customer support send API error:", error);

    return NextResponse.json(
      { error: "Unable to send your message." },
      { status: 500 },
    );
  }
}
