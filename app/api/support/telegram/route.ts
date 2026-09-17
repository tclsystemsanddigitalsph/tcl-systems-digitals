import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

type TelegramUpdate = {
  update_id?: number;
  message?: {
    message_id?: number;
    chat?: {
      id?: number;
    };
    text?: string;
    reply_to_message?: {
      message_id?: number;
    };
  };
};

export async function POST(request: Request) {
  try {
    const secret = process.env.TELEGRAM_SUPPORT_WEBHOOK_SECRET?.trim();
    const receivedSecret = request.headers.get(
      "x-telegram-bot-api-secret-token",
    );

    if (!secret || receivedSecret !== secret) {
      return NextResponse.json({ ok: false }, { status: 401 });
    }

    const update = (await request.json()) as TelegramUpdate;
    const telegramMessage = update.message;

    if (
      !telegramMessage?.message_id ||
      !telegramMessage.text?.trim() ||
      !telegramMessage.reply_to_message?.message_id
    ) {
      return NextResponse.json({ ok: true });
    }

    const configuredChatId = process.env.TELEGRAM_CHAT_ID?.trim();
    const incomingChatId = String(telegramMessage.chat?.id ?? "");

    if (!configuredChatId || incomingChatId !== configuredChatId) {
      return NextResponse.json({ ok: true });
    }

    const replyToMessageId =
      telegramMessage.reply_to_message.message_id;

    const supabase = createAdminSupabaseClient();

    const { data: conversation, error: conversationError } =
      await supabase
        .from("support_conversations")
        .select("id,status")
        .eq("telegram_root_message_id", replyToMessageId)
        .maybeSingle();

    if (conversationError) {
      console.error(
        "Unable to find support conversation for Telegram reply:",
        conversationError,
      );
      return NextResponse.json({ ok: true });
    }

    if (!conversation) {
      // Not a reply to a TCL website support notification.
      // Ignore it so other Telegram bot uses remain unaffected.
      return NextResponse.json({ ok: true });
    }

    const text = telegramMessage.text.trim();

    const { error: insertError } = await supabase
      .from("support_messages")
      .insert({
        conversation_id: conversation.id,
        sender: "TCL",
        message: text,
        telegram_message_id: telegramMessage.message_id,
      });

    if (insertError) {
      // Telegram may retry the same webhook update. The unique Telegram
      // message index prevents duplicate customer-facing replies.
      if (insertError.code !== "23505") {
        console.error(
          "Unable to save TCL Telegram support reply:",
          insertError,
        );
      }

      return NextResponse.json({ ok: true });
    }

    const { error: updateError } = await supabase
      .from("support_conversations")
      .update({
        status: "WAITING_FOR_CUSTOMER",
        last_tcl_message_at: new Date().toISOString(),
      })
      .eq("id", conversation.id);

    if (updateError) {
      console.error(
        "Unable to update support conversation after Telegram reply:",
        updateError,
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Telegram support webhook error:", error);

    // Return 200 so malformed/non-support Telegram updates do not create
    // an unnecessary retry loop.
    return NextResponse.json({ ok: true });
  }
}
