"use client";

import Link from "next/link";
import { FormEvent, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

type Topic =
  | "packages" | "recommend" | "quote" | "order" | "payment"
  | "monthly" | "admin" | "maintenance" | "domain" | "booking"
  | "shop" | "contact" | "unknown";

type ChatMessage = {
  id: string;
  from: "tcl" | "customer";
  text: string;
};

type LiveApiMessage = {
  id: string;
  sender: "CUSTOMER" | "TCL" | "SYSTEM";
  message: string;
  created_at: string;
};

const SESSION_KEY = "tcl_support_session_v1";

const quickOptions = [
  "Website Packages",
  "Which package should I choose?",
  "Request a Quote",
  "Check my order",
  "Payment Help",
  "Talk to TCL",
];

const topicLinks: Partial<Record<Topic, { href: string; label: string }>> = {
  packages: { href: "/shop", label: "View Packages →" },
  recommend: { href: "/shop", label: "Compare Packages →" },
  quote: { href: "/quote", label: "Request a Quote →" },
  order: { href: "/order-status", label: "Check Order Status →" },
  payment: { href: "/contact", label: "Contact TCL →" },
  booking: { href: "/shop/standard-booking-system", label: "View Booking Package →" },
  shop: { href: "/shop/basic-online-shop", label: "View Online Shop →" },
  unknown: { href: "/contact", label: "Ask TCL →" },
};

function normalize(value: string) {
  return value.toLowerCase().replace(/[₱,?.!'"’]/g, " ").replace(/\s+/g, " ").trim();
}

function includesAny(text: string, words: string[]) {
  return words.some((word) => text.includes(word));
}

function looksTagalog(text: string) {
  return includesAny(text, [
    "po", "magkano", "ano", "paano", "pwede", "puwede", "gusto",
    "kailangan", "meron", "may ", "wala", "ba ", "yung", "iyong",
    "ko ", "ako", "sana", "para", "nagbayad", "bayad", "magpa",
  ]);
}

function detectTopic(raw: string): Topic {
  const text = normalize(raw);
  if (includesAny(text, ["order status", "check order", "check my order", "placed an order", "already ordered", "nag order", "nag-order", "umorder", "order ko", "status ng order"])) return "order";
  if (includesAny(text, ["payment", "paymongo", "paypal", "gcash", "qrph", "qr ph", "bayad", "nagbayad", "paid", "payment failed"])) return "payment";
  if (includesAny(text, ["monthly", "subscription", "buwan", "every month", "monthly fee"])) return "monthly";
  if (includesAny(text, ["admin dashboard", "dashboard", "self edit", "self-edit", "edit myself", "ako mag edit", "sarili mag edit"])) return "admin";
  if (includesAny(text, ["maintenance", "support period", "after delivery", "after turnover"])) return "maintenance";
  if (includesAny(text, ["domain", "hosting", "vercel", "com domain", ".com"])) return "domain";
  if (includesAny(text, ["booking", "appointment", "reservation", "schedule system"])) return "booking";
  if (includesAny(text, ["online shop", "ecommerce", "e-commerce", "cart", "sell products", "selling products", "tindahan", "products online"])) return "shop";
  if (includesAny(text, ["quote", "quotation", "custom website", "custom system", "magpa quote", "magpa-quote", "request quote"])) return "quote";
  if (includesAny(text, ["which package", "recommend", "best package", "what package", "anong package", "ano package", "alin", "choose"])) return "recommend";
  if (includesAny(text, ["package", "packages", "price", "prices", "magkano", "website cost", "website price", "how much", "starter", "simple business"])) return "packages";
  if (includesAny(text, ["contact", "talk to tcl", "talk to you", "message tcl", "tao", "human", "personal assistance"])) return "contact";
  return "unknown";
}

function replyFor(topic: Topic, tagalog: boolean) {
  const en: Record<Topic, string> = {
    packages: "Current TCL packages are: Starter Website — ₱999, Simple Business Website — ₱2,999, Basic Online Shop — ₱5,999, Standard Booking Website/System — ₱7,999, and Custom Business Website/System — Custom Quote.",
    recommend: "Starter is for a basic 1-page presence; Simple Business is a 4-page business site; Basic Online Shop is for selling products; Standard Booking is for appointments/reservations. Special workflows, dashboards, accounts, integrations, or other custom features should go through Custom Quote.",
    quote: "For custom requirements, use the Request a Quote form so TCL can review the project scope and pricing properly.",
    order: "If you've already ordered, use the Order Status page to check progress. Keep your order and receipt details private.",
    payment: "Use only the secure payment options shown in the TCL checkout. If a payment was interrupted or you're unsure whether it went through, contact TCL before paying again to avoid a duplicate payment.",
    monthly: "Standard TCL website packages are one-time development purchases with no TCL monthly development fee. Separate third-party costs may still apply, such as a custom domain, paid hosting/service upgrades, or external integrations.",
    admin: "Starter Website, Simple Business Website, and Basic Online Shop do not include a self-editing admin dashboard by default. Standard Booking includes a basic admin dashboard. Custom admin requirements can be scoped under Custom Quote.",
    maintenance: "Included maintenance is: Starter — 1 month, Simple Business — 1 month, Basic Online Shop — 2 months, Standard Booking — 2 months, and Custom — 6 months. It covers bugs/errors in delivered features within the agreed scope, not unlimited edits or new development.",
    domain: "A free vercel.app deployment option is available for applicable packages. A custom domain such as .com is a separate third-party cost. TCL can assist with setup.",
    booking: "The Standard Booking Website/System is ₱7,999. It includes the customer booking flow and a basic admin dashboard for bookings, services, availability, and business settings.",
    shop: "The Basic Online Shop is ₱5,999 and includes up to 10 initial products, shop/product pages, cart, basic checkout/order submission, and manual payment instructions. It does not include a self-editing admin dashboard by default.",
    contact: "You can switch to Talk to TCL here and continue the conversation without leaving the website.",
    unknown: "I don't want to guess about that. You can switch to Talk to TCL and send your question directly to TCL.",
  };
  const tl: Record<Topic, string> = {
    packages: "Ito po ang current TCL packages: Starter Website — ₱999, Simple Business Website — ₱2,999, Basic Online Shop — ₱5,999, Standard Booking Website/System — ₱7,999, at Custom Business Website/System — Custom Quote.",
    recommend: "Starter kung basic 1-page presence lang; Simple Business kung 4-page business site; Basic Online Shop kung magbebenta ng products; Standard Booking kung may appointments/reservations. Kung may special workflow, dashboard, accounts, integrations, o ibang custom features, Custom Quote po.",
    quote: "Para sa custom requirements, please use the Request a Quote form para ma-review nang maayos ang scope at pricing.",
    order: "Kung nakapag-order na po, gamitin ang Order Status page para ma-check ang progress. Keep your order and receipt details private.",
    payment: "Kung na-interrupt ang payment o hindi sure kung pumasok, mas okay na i-contact muna ang TCL bago magbayad ulit para maiwasan ang duplicate payment.",
    monthly: "Ang standard TCL website packages ay one-time development purchases at walang TCL monthly development fee. Pero may separate third-party costs depende sa setup, gaya ng custom domain o paid service upgrades.",
    admin: "Starter Website, Simple Business Website, at Basic Online Shop do not include a self-editing admin dashboard by default. Standard Booking includes a basic admin dashboard. Custom admin requirements can be scoped under Custom Quote.",
    maintenance: "Included maintenance: Starter — 1 month, Simple Business — 1 month, Basic Online Shop — 2 months, Standard Booking — 2 months, Custom — 6 months. Hindi ito unlimited free edits or new features.",
    domain: "May free vercel.app deployment option po sa applicable packages. Ang custom domain gaya ng .com ay separate third-party cost. TCL can assist with setup.",
    booking: "Ang Standard Booking Website/System ay ₱7,999 at kasama ang customer booking flow at basic admin dashboard for bookings, services, availability, and business settings.",
    shop: "Ang Basic Online Shop ay ₱5,999 at includes up to 10 initial products, shop/product pages, cart, basic checkout/order submission, at manual payment instructions. Wala itong self-editing admin dashboard by default.",
    contact: "Pwede po kayong mag-switch sa Talk to TCL dito mismo at magpatuloy sa chat nang hindi umaalis sa website.",
    unknown: "Ayokong manghula ng sagot tungkol diyan. Pwede po kayong mag-switch sa Talk to TCL at direktang ipadala ang question ninyo.",
  };
  return tagalog ? tl[topic] : en[topic];
}

export default function TCLSupportChat() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<"auto" | "live">("auto");
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: "welcome", from: "tcl", text: "Hi! 👋 Welcome to TCL Support. You can ask in English, Tagalog, or Taglish. Paano kita matutulungan?" },
  ]);
  const [liveMessages, setLiveMessages] = useState<ChatMessage[]>([]);
  const [customerToken, setCustomerToken] = useState<string | null>(null);
  const [supportReference, setSupportReference] = useState<string | null>(null);
  const [liveStatus, setLiveStatus] = useState<string | null>(null);
  const [presence, setPresence] = useState<"ONLINE" | "AWAY">("AWAY");
  const [isTyping, setIsTyping] = useState(false);
  const [conversationExists, setConversationExists] = useState(true);
  const [busy, setBusy] = useState(false);
  const [lastTopic, setLastTopic] = useState<Topic | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const idRef = useRef(1);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(SESSION_KEY);
      if (!stored) return;
      const parsed = JSON.parse(stored) as { customerToken?: string; supportReference?: string };
      if (parsed.customerToken) {
        setCustomerToken(parsed.customerToken);
        setSupportReference(parsed.supportReference ?? null);
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (!customerToken || mode !== "live") return;

    let active = true;
    const load = async () => {
      try {
        const response = await fetch("/api/support/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ customerToken }),
          cache: "no-store",
        });
        if (!response.ok) return;
        const data = await response.json() as {
          conversationExists?: boolean;
          supportReference?: string | null;
          status?: string;
          presence?: "ONLINE" | "AWAY";
          isTyping?: boolean;
          messages?: LiveApiMessage[];
        };
        if (!active) return;

        const exists = data.conversationExists !== false;
        setConversationExists(exists);
        setSupportReference(data.supportReference ?? null);
        setLiveStatus(data.status ?? null);
        setPresence(data.presence === "ONLINE" ? "ONLINE" : "AWAY");
        setIsTyping(Boolean(data.isTyping));

        if (!exists) {
          setLiveMessages([]);
          return;
        }

        setLiveMessages((data.messages ?? []).map((item) => ({
          id: item.id,
          from: item.sender === "CUSTOMER" ? "customer" : "tcl",
          text: item.message,
        })));
      } catch {}
    };

    load();
    const timer = window.setInterval(load, 3000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [customerToken, mode]);

  useEffect(() => {
    if (!open) return;
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    });
  }, [messages, liveMessages, open, mode]);

  if (pathname === "/admin" || pathname?.startsWith("/admin/")) return null;

  function sendAutomated(text: string) {
    const topic = detectTopic(text);
    if (topic === "contact") {
      setMode("live");
      setInput("");
      return;
    }
    const tagalog = looksTagalog(normalize(text));
    setMessages((current) => [
      ...current,
      { id: `c-${idRef.current++}`, from: "customer", text },
      { id: `a-${idRef.current++}`, from: "tcl", text: replyFor(topic, tagalog) },
    ]);
    setLastTopic(topic);
    setInput("");
  }

  async function sendLive(text: string) {
    if (busy || !text.trim()) return;
    setBusy(true);
    const clean = text.trim();
    setInput("");

    try {
      if (!customerToken) {
        const response = await fetch("/api/support/start", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: clean,
            currentPage: pathname || "/",
          }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Unable to start live support.");

        setCustomerToken(data.customerToken);
        setSupportReference(data.supportReference);
        setLiveStatus(data.status);
        setConversationExists(true);
        setIsTyping(false);
        setLiveMessages([{ id: `local-${Date.now()}`, from: "customer", text: clean }]);
        localStorage.setItem(SESSION_KEY, JSON.stringify({
          customerToken: data.customerToken,
          supportReference: data.supportReference,
        }));
      } else {
        const response = await fetch("/api/support/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ customerToken, message: clean }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Unable to send message.");
        setLiveStatus(data.status);
        setLiveMessages((current) => [
          ...current,
          { id: data.message?.id ?? `local-${Date.now()}`, from: "customer", text: clean },
        ]);
      }
    } catch (error) {
      setLiveMessages((current) => [
        ...current,
        {
          id: `error-${Date.now()}`,
          from: "tcl",
          text: error instanceof Error ? error.message : "Unable to connect to TCL support right now.",
        },
      ]);
    } finally {
      setBusy(false);
    }
  }

  function startNewConversation() {
    localStorage.removeItem(SESSION_KEY);
    setCustomerToken(null);
    setSupportReference(null);
    setLiveStatus(null);
    setLiveMessages([]);
    setConversationExists(true);
    setIsTyping(false);
    setInput("");
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = input.trim();
    if (!text) return;
    if (mode === "live") void sendLive(text);
    else sendAutomated(text);
  }

  const displayed = mode === "live" ? liveMessages : messages;
  const action = mode === "auto" && lastTopic ? topicLinks[lastTopic] : null;
  const liveClosed = mode === "live" && liveStatus === "CLOSED";
  const liveExpired = mode === "live" && customerToken !== null && !conversationExists;
  const liveUnavailable = liveClosed || liveExpired;

  return (
    <>
      {open && (
        <section aria-label="TCL customer support" style={{
          position: "fixed", right: "max(16px, env(safe-area-inset-right))",
          bottom: "calc(88px + env(safe-area-inset-bottom, 0px))", zIndex: 2147483646,
          width: "min(400px, calc(100vw - 24px))",
          height: "min(650px, calc(100dvh - 112px - env(safe-area-inset-bottom, 0px)))",
          maxHeight: "calc(100dvh - 112px - env(safe-area-inset-bottom, 0px))",
          display: "flex", flexDirection: "column", overflow: "hidden",
          border: "1px solid rgba(217,86,139,.18)", borderRadius: 24, background: "#fff",
          boxShadow: "0 22px 70px rgba(49,37,41,.18)"
        }}>
          <header style={{
            padding: "14px 16px", display: "flex", alignItems: "center",
            justifyContent: "space-between", gap: 10,
            background: "linear-gradient(135deg, rgba(217,86,139,.14), rgba(255,245,249,.96))",
            borderBottom: "1px solid rgba(217,86,139,.14)"
          }}>
            <div>
              <strong style={{ display: "block" }}>{mode === "live" ? "Talk to TCL" : "TCL Support"}</strong>
              <span style={{ fontSize: ".75rem", color: "#75656b" }}>
                {mode === "live"
                  ? liveExpired
                    ? "Previous conversation expired"
                    : supportReference
                      ? `${supportReference} • ${
                          liveClosed
                            ? "Closed"
                            : isTyping
                              ? "TCL is typing…"
                              : presence === "ONLINE"
                                ? "● Online"
                                : "● Away — replies may take a little longer"
                        }`
                      : presence === "ONLINE"
                        ? "● Online • Send a message to start"
                        : "● Away • Send a message anytime"
                  : "Automated help • English • Tagalog • Taglish"}
              </span>
            </div>
            <button type="button" aria-label="Close TCL support" onClick={() => setOpen(false)}
              style={{ width: 36, height: 36, border: 0, borderRadius: "50%", background: "#fff", cursor: "pointer", fontSize: 21 }}>×</button>
          </header>

          <div style={{ display: "flex", gap: 7, padding: "9px 12px", borderBottom: "1px solid rgba(49,37,41,.07)" }}>
            <button type="button" onClick={() => setMode("auto")} style={{
              flex: 1, padding: 8, borderRadius: 10, border: "1px solid rgba(217,86,139,.15)",
              background: mode === "auto" ? "rgba(217,86,139,.12)" : "#fff", cursor: "pointer", fontWeight: 700
            }}>Quick Help</button>
            <button type="button" onClick={() => setMode("live")} style={{
              flex: 1, padding: 8, borderRadius: 10, border: "1px solid rgba(217,86,139,.15)",
              background: mode === "live" ? "rgba(217,86,139,.12)" : "#fff", cursor: "pointer", fontWeight: 700
            }}>Talk to TCL</button>
          </div>

          <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: 15, background: "linear-gradient(180deg,#fff,rgba(255,248,251,.72))" }}>
            {mode === "live" && displayed.length === 0 && (
              <div style={{ padding: 13, borderRadius: 15, background: "#fff", border: "1px solid rgba(217,86,139,.12)", fontSize: ".86rem", lineHeight: 1.55 }}>
                Send your message here and TCL will receive it through the support inbox. You can stay on this website—no Telegram account is required.
              </div>
            )}

            <div style={{ display: "grid", gap: 9 }}>
              {displayed.map((message, index) => (
                <div key={`${message.id}-${message.from}-${index}`} style={{
                  maxWidth: "88%", justifySelf: message.from === "customer" ? "end" : "start",
                  padding: "10px 12px",
                  border: message.from === "tcl" ? "1px solid rgba(217,86,139,.12)" : "none",
                  borderRadius: message.from === "customer" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                  background: message.from === "customer" ? "rgba(217,86,139,.12)" : "#fff",
                  fontSize: ".86rem", lineHeight: 1.55
                }}>{message.text}</div>
              ))}
            </div>

            {mode === "live" && isTyping && !liveUnavailable && (
              <div style={{ marginTop: 10, maxWidth: "88%", padding: "9px 12px", borderRadius: "16px 16px 16px 4px", background: "#fff", border: "1px solid rgba(217,86,139,.12)", color: "#75656b", fontSize: ".8rem", fontStyle: "italic" }}>
                TCL is typing…
              </div>
            )}

            {mode === "live" && liveClosed && (
              <div style={{ marginTop: 12, padding: 13, borderRadius: 15, background: "#fff", border: "1px solid rgba(217,86,139,.14)", fontSize: ".84rem", lineHeight: 1.55 }}>
                <strong style={{ display: "block", marginBottom: 4 }}>This support conversation has been closed.</strong>
                It will be retained for 7 days. You can start a new conversation anytime.
                <button type="button" onClick={startNewConversation} style={{ width: "100%", minHeight: 40, marginTop: 10, border: 0, borderRadius: 11, background: "var(--accent, #d9568b)", color: "#fff", cursor: "pointer", font: "inherit", fontSize: ".8rem", fontWeight: 750 }}>
                  Start New Conversation
                </button>
              </div>
            )}

            {mode === "live" && liveExpired && (
              <div style={{ marginTop: 12, padding: 13, borderRadius: 15, background: "#fff", border: "1px solid rgba(217,86,139,.14)", fontSize: ".84rem", lineHeight: 1.55 }}>
                <strong style={{ display: "block", marginBottom: 4 }}>Your previous support conversation is no longer available.</strong>
                Start a new conversation if you still need help.
                <button type="button" onClick={startNewConversation} style={{ width: "100%", minHeight: 40, marginTop: 10, border: 0, borderRadius: 11, background: "var(--accent, #d9568b)", color: "#fff", cursor: "pointer", font: "inherit", fontSize: ".8rem", fontWeight: 750 }}>
                  Start New Conversation
                </button>
              </div>
            )}

            {action && (
              <Link href={action.href} onClick={() => setOpen(false)} style={{
                width: "100%", minHeight: 42, marginTop: 12, padding: "9px 13px",
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                borderRadius: 12, background: "var(--accent, #d9568b)", color: "#fff",
                fontSize: ".84rem", fontWeight: 750, textDecoration: "none"
              }}>{action.label}</Link>
            )}

            {mode === "auto" && (
              <div style={{ marginTop: 15, paddingTop: 12, borderTop: "1px solid rgba(49,37,41,.08)" }}>
                <small style={{ display: "block", marginBottom: 8, color: "#75656b", fontWeight: 750 }}>QUICK HELP</small>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                  {quickOptions.map((option) => (
                    <button key={option} type="button" onClick={() => sendAutomated(option)} style={{
                      minHeight: 35, padding: "7px 10px", border: "1px solid rgba(217,86,139,.18)",
                      borderRadius: 999, background: "#fff", cursor: "pointer", font: "inherit",
                      fontSize: ".74rem", fontWeight: 650
                    }}>{option}</button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <form onSubmit={submit} style={{ padding: 11, display: "flex", gap: 8, borderTop: "1px solid rgba(49,37,41,.08)", background: "#fff" }}>
            <input value={input} onChange={(e) => setInput(e.target.value)} maxLength={500}
              placeholder={
                liveClosed
                  ? "Conversation closed"
                  : liveExpired
                    ? "Start a new conversation"
                    : mode === "live"
                      ? "Message TCL..."
                      : "Ask a question... / Magtanong..."
              }
              disabled={busy || liveUnavailable}
              style={{ flex: 1, minWidth: 0, height: 44, padding: "0 12px", border: "1px solid rgba(49,37,41,.14)", borderRadius: 14, outline: "none", font: "inherit", fontSize: ".85rem" }} />
            <button type="submit" disabled={busy || liveUnavailable || !input.trim()} aria-label="Send message" style={{
              width: 44, height: 44, border: 0, borderRadius: 14, background: "var(--accent, #d9568b)",
              color: "#fff", cursor: busy || liveUnavailable || !input.trim() ? "not-allowed" : "pointer",
              opacity: busy || liveUnavailable || !input.trim() ? .5 : 1, fontSize: 18, fontWeight: 800
            }}>{busy ? "…" : "↑"}</button>
          </form>
        </section>
      )}

      <button type="button" aria-label={open ? "Close TCL support" : "Chat with TCL"} aria-expanded={open}
        onClick={() => setOpen((value) => !value)} style={{
          position: "fixed", right: "max(12px, env(safe-area-inset-right, 0px))",
          bottom: "calc(20px + env(safe-area-inset-bottom, 0px))", zIndex: 2147483647,
          minHeight: 54, height: 54, maxWidth: "calc(100vw - 24px)",
          padding: "0 10px", display: "inline-flex", alignItems: "center",
          gap: 9, border: "1px solid rgba(217,86,139,.18)", borderRadius: 999,
          background: "#fff", color: "var(--text, #312529)", boxShadow: "0 12px 34px rgba(49,37,41,.16)",
          cursor: "pointer", font: "inherit", fontWeight: 750
        }}>
        <span aria-hidden="true" style={{ width: 34, height: 34, display: "grid", placeItems: "center", borderRadius: "50%", background: "rgba(217,86,139,.12)" }}>{open ? "×" : "💬"}</span>
        {!open && <span className="tcl-support-button-label" style={{ fontSize: ".84rem" }}>Chat with TCL</span>}
        <style jsx>{`
          @media (max-width: 600px) {
            .tcl-support-button-label {
              display: none;
            }
          }
        `}</style>
      </button>
    </>
  );
}
