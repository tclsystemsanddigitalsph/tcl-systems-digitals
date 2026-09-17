import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

type TelegramMessage = {
  message_id?: number;
  chat?: { id?: number };
  text?: string;
  reply_to_message?: {
    message_id?: number;
    text?: string;
  };
};

type TelegramUpdate = {
  update_id?: number;
  message?: TelegramMessage;
};

export async function POST(request: Request) {
  try {
    const webhookSecret =
      process.env.TELEGRAM_SUPPORT_WEBHOOK_SECRET?.trim();
    const receivedSecret = request.headers.get(
      "x-telegram-bot-api-secret-token",
    );

    if (!webhookSecret || receivedSecret !== webhookSecret) {
      console.warn("[TCL support webhook] Rejected invalid secret.");
      return NextResponse.json({ ok: false }, { status: 401 });
    }

    const update = (await request.json()) as TelegramUpdate;
    const telegramMessage = update.message;
    const text = telegramMessage?.text?.trim();
    const telegramMessageId = telegramMessage?.message_id;
    const replyToMessageId =
      telegramMessage?.reply_to_message?.message_id;
    const incomingChatId = String(telegramMessage?.chat?.id ?? "");
    const configuredChatId = process.env.TELEGRAM_CHAT_ID?.trim();

    if (
      !configuredChatId ||
      incomingChatId !== configuredChatId ||
      !text ||
      !telegramMessageId ||
      !replyToMessageId
    ) {
      console.info("[TCL support webhook] Ignored non-support update.", {
        updateId: update.update_id ?? null,
        hasText: Boolean(text),
        hasMessageId: Boolean(telegramMessageId),
        hasReplyTarget: Boolean(replyToMessageId),
        chatMatches: Boolean(
          configuredChatId && incomingChatId === configuredChatId,
        ),
      });

      return NextResponse.json({ ok: true });
    }

    const supabase = createAdminSupabaseClient();

    // 1) Normal case: you replied directly to the original
    // "New TCL Support Chat" Telegram notification.
    let conversationId: string | null = null;

    const { data: rootConversation, error: rootError } =
      await supabase
        .from("support_conversations")
        .select("id")
        .eq("telegram_root_message_id", replyToMessageId)
        .maybeSingle();

    if (rootError) {
      console.error(
        "[TCL support webhook] Root conversation lookup failed:",
        rootError,
      );
    }

    if (rootConversation?.id) {
      conversationId = rootConversation.id;
    }

    // 2) Robust follow-up case: you replied to one of your own
    // earlier TCL Telegram replies instead of the original root.
    if (!conversationId) {
      const { data: parentSupportMessage, error: parentError } =
        await supabase
          .from("support_messages")
          .select("conversation_id")
          .eq("telegram_message_id", replyToMessageId)
          .maybeSingle();

      if (parentError) {
        console.error(
          "[TCL support webhook] Parent message lookup failed:",
          parentError,
        );
      }

      if (parentSupportMessage?.conversation_id) {
        conversationId = parentSupportMessage.conversation_id;
      }
    }

    if (!conversationId) {
      console.warn(
        "[TCL support webhook] Reply target was not mapped to a support conversation.",
        {
          updateId: update.update_id ?? null,
          telegramMessageId,
          replyToMessageId,
        },
      );

      return NextResponse.json({ ok: true });
    }

    // Telegram can retry webhook updates. Prevent the same Telegram
    // reply from being shown twice on the website.
    const { data: existingMessage, error: existingError } =
      await supabase
        .from("support_messages")
        .select("id")
        .eq("telegram_message_id", telegramMessageId)
        .maybeSingle();

    if (existingError) {
      console.error(
        "[TCL support webhook] Duplicate check failed:",
        existingError,
      );
    }

    if (existingMessage) {
      return NextResponse.json({ ok: true });
    }

    const { error: insertError } = await supabase
      .from("support_messages")
      .insert({
        conversation_id: conversationId,
        sender: "TCL",
        message: text,
        telegram_message_id: telegramMessageId,
      });

    if (insertError) {
      if (insertError.code !== "23505") {
        console.error(
          "[TCL support webhook] Unable to save TCL reply:",
          insertError,
        );
      }

      return NextResponse.json({ ok: true });
    }

    const { error: conversationUpdateError } = await supabase
      .from("support_conversations")
      .update({
        status: "WAITING_FOR_CUSTOMER",
        last_tcl_message_at: new Date().toISOString(),
      })
      .eq("id", conversationId);

    if (conversationUpdateError) {
      console.error(
        "[TCL support webhook] Conversation status update failed:",
        conversationUpdateError,
      );
    }

    console.info("[TCL support webhook] TCL reply saved.", {
      updateId: update.update_id ?? null,
      telegramMessageId,
      replyToMessageId,
      conversationId,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[TCL support webhook] Unexpected error:", error);

    // Telegram retries non-2xx responses. Once the request has passed
    // authentication, return 200 and keep diagnostics in Vercel logs.
    return NextResponse.json({ ok: true });
  }
}
