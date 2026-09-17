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

async function setPresence(status: "ONLINE" | "AWAY") {
  const supabase = createAdminSupabaseClient();

  const { error } = await supabase.from("support_presence").upsert(
    {
      id: "tcl_support",
      status,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" },
  );

  if (error) {
    console.error("[TCL support webhook] Presence update failed:", error);
    return false;
  }

  return true;
}

async function sendTelegramConfirmation(
  chatId: string,
  text: string,
  replyToMessageId?: number,
) {
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  if (!token) return;

  const body: Record<string, unknown> = {
    chat_id: chatId,
    text,
  };

  if (replyToMessageId) {
    body.reply_parameters = {
      message_id: replyToMessageId,
      allow_sending_without_reply: true,
    };
  }

  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });
  } catch (error) {
    console.error(
      "[TCL support webhook] Unable to send command confirmation:",
      error,
    );
  }
}

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
      !telegramMessageId
    ) {
      console.info("[TCL support webhook] Ignored non-support update.", {
        updateId: update.update_id ?? null,
        hasText: Boolean(text),
        hasMessageId: Boolean(telegramMessageId),
        chatMatches: Boolean(
          configuredChatId && incomingChatId === configuredChatId,
        ),
      });

      return NextResponse.json({ ok: true });
    }

    const command = text.toLowerCase().split(/\s+/)[0];

    // Global presence commands do not need to be replies.
    if (command === "/online") {
      const updated = await setPresence("ONLINE");

      if (updated) {
        await sendTelegramConfirmation(
          incomingChatId,
          "🟢 TCL Support is now ONLINE.",
          telegramMessageId,
        );
      }

      return NextResponse.json({ ok: true });
    }

    if (command === "/away") {
      const updated = await setPresence("AWAY");

      if (updated) {
        await sendTelegramConfirmation(
          incomingChatId,
          "⚪ TCL Support is now AWAY.",
          telegramMessageId,
        );
      }

      return NextResponse.json({ ok: true });
    }

    // Conversation-specific actions and normal replies must be replies
    // to a Telegram message that belongs to that support conversation.
    if (!replyToMessageId) {
      console.info(
        "[TCL support webhook] Ignored message without support reply target.",
        {
          updateId: update.update_id ?? null,
          telegramMessageId,
        },
      );

      return NextResponse.json({ ok: true });
    }

    const supabase = createAdminSupabaseClient();
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

    if (command === "/typing") {
      const typingUntil = new Date(Date.now() + 20_000).toISOString();

      const { error } = await supabase
        .from("support_conversations")
        .update({
          tcl_typing_until: typingUntil,
        })
        .eq("id", conversationId);

      if (error) {
        console.error(
          "[TCL support webhook] Unable to set typing state:",
          error,
        );
      } else {
        await sendTelegramConfirmation(
          incomingChatId,
          "⌨️ Customer will see “TCL is typing…” for 20 seconds.",
          telegramMessageId,
        );
      }

      return NextResponse.json({ ok: true });
    }

    if (command === "/close") {
      const closedAt = new Date().toISOString();

      const { error } = await supabase
        .from("support_conversations")
        .update({
          status: "CLOSED",
          closed_at: closedAt,
          tcl_typing_until: null,
        })
        .eq("id", conversationId);

      if (error) {
        console.error(
          "[TCL support webhook] Unable to close conversation:",
          error,
        );
      } else {
        await sendTelegramConfirmation(
          incomingChatId,
          "🔒 Support conversation closed. It will be retained for 7 days, then deleted automatically.",
          telegramMessageId,
        );
      }

      return NextResponse.json({ ok: true });
    }

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
        tcl_typing_until: null,
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
    return NextResponse.json({ ok: true });
  }
}
