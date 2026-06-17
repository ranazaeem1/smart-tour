"use client";

import type { KeyboardEvent, ReactNode } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import {
  AlertTriangle,
  Bot,
  ChevronDown,
  Download,
  Eraser,
  LifeBuoy,
  Loader2,
  MapPin,
  MessageCircle,
  Send,
  ShieldCheck,
  Sparkles,
  Wallet,
  X,
} from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { useLiveLocation } from "@/hooks/useLiveLocation";

type ChatRole = "user" | "bot";

type ChatMessage = {
  id: string;
  role: ChatRole;
  text: string;
  createdAt: string;
  error?: boolean;
};

type ChatPayloadMessage = Pick<ChatMessage, "role" | "text" | "createdAt">;

type ChatResponse = {
  reply?: string;
  intent?: string;
  aiUsed?: boolean;
  recommendedDestinations?: string[];
  lastTopic?: string | null;
};

type QuickAction = {
  label: string;
  prompt: string;
  icon: ReactNode;
  danger?: boolean;
};

const STORAGE_VERSION = 2;
const MAX_MESSAGE_LENGTH = 1000;
const MAX_HISTORY_MESSAGES = 20;
const CHAT_TTL_MS = 7 * 24 * 60 * 60 * 1000;

const welcomeMessage = (name?: string | null): ChatMessage => ({
  id: "welcome",
  role: "bot",
  createdAt: new Date().toISOString(),
  text: `Welcome${name ? `, ${name}` : ""}. I am **SmartTour Assistant**, your travel intelligence desk for Pakistan tours.

Share your budget, travel month, group size, and destination. I can help with recommendations, safety, budget, bookings, and SOS support.`,
});

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function formatTime(value: string) {
  try {
    return new Intl.DateTimeFormat("en", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));
  } catch {
    return "";
  }
}

function cleanStoredMessages(value: string | null): ChatMessage[] | null {
  if (!value) return null;

  try {
    const parsed = JSON.parse(value) as {
      version?: number;
      savedAt?: string;
      messages?: ChatMessage[];
    };

    if (parsed.version !== STORAGE_VERSION || !Array.isArray(parsed.messages)) return null;
    if (parsed.savedAt && Date.now() - new Date(parsed.savedAt).getTime() > CHAT_TTL_MS) return null;

    return parsed.messages.filter(
      (message) =>
        message &&
        (message.role === "user" || message.role === "bot") &&
        typeof message.text === "string" &&
        typeof message.createdAt === "string"
    );
  } catch {
    return null;
  }
}

function splitInlineMarkdown(text: string) {
  const parts: ReactNode[] = [];
  const pattern = /(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text))) {
    if (match.index > lastIndex) parts.push(text.slice(lastIndex, match.index));
    const token = match[0];

    if (token.startsWith("**")) {
      parts.push(<strong key={`${token}-${match.index}`}>{token.slice(2, -2)}</strong>);
    } else {
      const linkMatch = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (linkMatch) {
        parts.push(
          <a
            key={`${token}-${match.index}`}
            href={linkMatch[2]}
            className="font-black text-emerald-600 underline-offset-4 hover:underline"
          >
            {linkMatch[1]}
          </a>
        );
      }
    }

    lastIndex = pattern.lastIndex;
  }

  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
  return parts;
}

function renderMarkdown(text: string) {
  const lines = text.split("\n");
  const nodes: ReactNode[] = [];
  let bulletGroup: string[] = [];

  const flushBullets = () => {
    if (!bulletGroup.length) return;
    nodes.push(
      <ul key={`ul-${nodes.length}`} className="my-2 space-y-1.5 pl-4">
        {bulletGroup.map((line, index) => (
          <li key={`${line}-${index}`} className="list-disc leading-6">
            {splitInlineMarkdown(line)}
          </li>
        ))}
      </ul>
    );
    bulletGroup = [];
  };

  lines.forEach((rawLine, index) => {
    const line = rawLine.trim();
    if (!line) {
      flushBullets();
      return;
    }

    if (line.startsWith("- ")) {
      bulletGroup.push(line.slice(2));
      return;
    }

    flushBullets();
    nodes.push(
      <p key={`${line}-${index}`} className="my-1.5 leading-6">
        {splitInlineMarkdown(line)}
      </p>
    );
  });

  flushBullets();
  return nodes;
}

function LoadingBubble() {
  return (
    <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 shadow-sm">
      <Loader2 size={16} className="animate-spin text-emerald-500" />
      <span>Thinking...</span>
    </div>
  );
}

export default function SmartTourChatbot() {
  const pathname = usePathname();
  const { user, profile, session } = useAuth();
  const { location, error: locationError } = useLiveLocation();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastTopic, setLastTopic] = useState<string | null>(null);
  const [recentRecommendations, setRecentRecommendations] = useState<string[]>([]);
  const [retryPrompt, setRetryPrompt] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const storageKey = useMemo(
    () => `smarttour:chatbot:${profile?.id || user?.id || "guest"}:${profile?.role || "guest"}`,
    [profile?.id, profile?.role, user?.id]
  );

  const quickActions: QuickAction[] = useMemo(
    () => [
      { label: "Find Tour for Me", prompt: "Find a safe tour for me. Ask me any details you need first.", icon: <Sparkles size={15} /> },
      { label: "Safety Check", prompt: "Assess destination safety for me. Ask for the location if needed and include weather, terrain, and risk.", icon: <ShieldCheck size={15} /> },
      { label: "Plan Budget", prompt: "Create a professional Pakistan tour budget with accommodation, food, activities, transport, and other costs.", icon: <Wallet size={15} /> },
      { label: "Emergency", prompt: "I have an emergency. I need SOS help right now.", icon: <AlertTriangle size={15} />, danger: true },
    ],
    []
  );

  useEffect(() => {
    const saved = cleanStoredMessages(window.localStorage.getItem(storageKey));
    setMessages(saved?.length ? saved : [welcomeMessage(profile?.full_name)]);
  }, [profile?.full_name, storageKey]);

  useEffect(() => {
    if (!messages.length) return;
    window.localStorage.setItem(
      storageKey,
      JSON.stringify({
        version: STORAGE_VERSION,
        savedAt: new Date().toISOString(),
        messages: messages.slice(-60),
      })
    );
  }, [messages, storageKey]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, loading, open]);

  useEffect(() => {
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (open) {
      window.setTimeout(() => inputRef.current?.focus(), 160);
    }
  }, [open]);

  const clearChat = useCallback(() => {
    const next = [welcomeMessage(profile?.full_name)];
    setMessages(next);
    setRetryPrompt(null);
    setLastTopic(null);
    setRecentRecommendations([]);
    window.localStorage.removeItem(storageKey);
  }, [profile?.full_name, storageKey]);

  const exportChat = useCallback(() => {
    const body = messages
      .map((message) => `[${formatTime(message.createdAt)}] ${message.role.toUpperCase()}: ${message.text}`)
      .join("\n\n");
    const blob = new Blob([body], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `smarttour-chat-${new Date().toISOString().slice(0, 10)}.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
  }, [messages]);

  const sendMessage = useCallback(
    async (rawPrompt?: string) => {
      const prompt = (rawPrompt ?? input).trim();
      if (!prompt || loading) return;
      if (prompt.length > MAX_MESSAGE_LENGTH) return;

      const now = new Date().toISOString();
      const userMessage: ChatMessage = {
        id: createId("user"),
        role: "user",
        text: prompt,
        createdAt: now,
      };

      setInput("");
      setLoading(true);
      setRetryPrompt(null);
      setMessages((current) => [...current, userMessage]);

      const history: ChatPayloadMessage[] = [...messages, userMessage]
        .slice(-MAX_HISTORY_MESSAGES)
        .map(({ role, text, createdAt }) => ({ role, text, createdAt }));

      try {
        const response = await fetch("/api/chatbot", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: prompt,
            history,
            pathname,
            role: profile?.role || "user",
            userId: user?.id || profile?.id || null,
            accessToken: session?.access_token || null,
            location,
            locationError,
            recentRecommendations,
            emergencyPhone: profile?.emergency_phone || profile?.phone || null,
          }),
        });

        if (!response.ok) {
          const status = response.status === 429 ? "I am receiving too many requests right now." : "I could not reach SmartTour AI.";
          throw new Error(`${status} Please try again in a moment.`);
        }

        const data = (await response.json()) as ChatResponse;
        const botMessage: ChatMessage = {
          id: createId("bot"),
          role: "bot",
          text: data.reply || "I could not generate a response. Please try again.",
          createdAt: new Date().toISOString(),
        };

        setMessages((current) => [...current, botMessage]);
        if (data.lastTopic) setLastTopic(data.lastTopic);
        if (Array.isArray(data.recommendedDestinations) && data.recommendedDestinations.length) {
          setRecentRecommendations((current) =>
            [...current, ...data.recommendedDestinations!.map(String)].slice(-8)
          );
        }
      } catch (error) {
        const fallback = error instanceof Error ? error.message : "Something went wrong. Please try again.";
        setRetryPrompt(prompt);
        setMessages((current) => [
          ...current,
          {
            id: createId("bot-error"),
            role: "bot",
            text: `**Connection issue**\n\n${fallback}\n\nYou can retry the last message when your connection is stable.`,
            createdAt: new Date().toISOString(),
            error: true,
          },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [input, loading, location, locationError, messages, pathname, profile?.emergency_phone, profile?.id, profile?.phone, profile?.role, recentRecommendations, session?.access_token, user?.id]
  );

  const onInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void sendMessage();
    }
  };

  return (
    <section aria-label="SmartTour AI assistant">
      <button
        type="button"
        aria-label={open ? "Close SmartTour assistant" : "Open SmartTour assistant"}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className={`fixed bottom-5 right-5 z-[260] grid h-14 w-14 place-items-center rounded-2xl border text-white shadow-[0_18px_45px_rgba(15,23,42,0.22)] transition-all duration-300 hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-emerald-200 ${
          open
            ? "border-red-300 bg-red-500 hover:bg-red-600"
            : "border-emerald-300 bg-emerald-500 hover:bg-emerald-600"
        }`}
      >
        {open ? <X size={24} /> : <MessageCircle size={25} />}
      </button>

      <div
        className={`fixed z-[250] flex flex-col overflow-hidden border border-slate-200 bg-slate-50 text-slate-950 shadow-2xl transition-all duration-300 ${
          open
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none translate-y-6 opacity-0"
        } bottom-0 right-0 h-[100dvh] w-full rounded-none font-sans sm:bottom-24 sm:right-5 sm:h-[620px] sm:w-[420px] sm:rounded-[26px] sm:shadow-[0_28px_90px_rgba(15,23,42,0.28)]`}
        role="dialog"
        aria-modal="false"
        aria-label="SmartTour Assistant chat window"
      >
        <header className="relative overflow-hidden border-b border-slate-200 bg-white px-4 py-4">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-emerald-500" />
          <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl border border-emerald-200 bg-emerald-50 text-emerald-600 shadow-sm">
              <Bot size={24} />
            </div>
            <div className="min-w-0">
              <p className="truncate text-[15px] font-black text-slate-950">SmartTour Assistant</p>
              <p className="truncate text-[11px] font-semibold text-slate-500">
                {location ? "Live location ready" : locationError ? "Location unavailable" : "24/7 travel assistant"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={exportChat}
              className="grid h-9 w-9 place-items-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-950"
              aria-label="Export conversation"
              title="Export conversation"
            >
              <Download size={17} />
            </button>
            <button
              type="button"
              onClick={clearChat}
              className="grid h-9 w-9 place-items-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-950"
              aria-label="Clear chat"
              title="Clear chat"
            >
              <Eraser size={17} />
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="grid h-9 w-9 place-items-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-950"
              aria-label="Minimize chat"
              title="Minimize"
            >
              <ChevronDown size={19} />
            </button>
          </div>
          </div>
        </header>

        <div className="flex items-center gap-2 overflow-x-auto border-b border-slate-200 bg-white px-4 py-3 [scrollbar-width:none]">
          {quickActions.map((action) => (
            <button
              key={action.label}
              type="button"
              onClick={() => void sendMessage(action.prompt)}
              disabled={loading}
              className={`flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-2 text-[10px] font-black uppercase tracking-[0.12em] shadow-sm transition disabled:cursor-not-allowed disabled:opacity-50 ${
                action.danger
                  ? "border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
                  : "border-slate-200 bg-slate-50 text-slate-700 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
              }`}
            >
              {action.icon}
              {action.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto bg-[linear-gradient(180deg,#f8fafc_0%,#ffffff_55%,#f8fafc_100%)] px-4 py-5" aria-live="polite">
          <div className="space-y-5">
            {messages.map((message) => {
              const isUser = message.role === "user";
              return (
                <article key={message.id} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                  <div className={`flex max-w-[90%] flex-col gap-1.5 ${isUser ? "items-end" : "items-start"}`}>
                    <div
                      className={`rounded-[20px] px-4 py-3 text-[13px] leading-6 shadow-sm ${
                        isUser
                          ? "rounded-br-md bg-emerald-500 font-semibold text-white shadow-emerald-100"
                          : message.error
                            ? "rounded-bl-md border border-red-200 bg-red-50 font-medium text-red-900"
                            : "rounded-bl-md border border-slate-200 bg-white font-medium text-slate-800"
                      }`}
                    >
                      {isUser ? <p className="leading-relaxed">{message.text}</p> : renderMarkdown(message.text)}
                    </div>
                    <time className="px-1 text-[10px] font-semibold text-slate-400">
                      {formatTime(message.createdAt)}
                    </time>
                  </div>
                </article>
              );
            })}
            {loading && (
              <div className="flex justify-start">
                <LoadingBubble />
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        </div>

        {retryPrompt && !loading && (
          <div className="border-t border-slate-200 bg-white px-4 py-2">
            <button
              type="button"
              onClick={() => void sendMessage(retryPrompt)}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-2 text-[11px] font-black uppercase tracking-[0.12em] text-slate-700 transition hover:bg-slate-50"
            >
              <LifeBuoy size={14} />
              Retry last message
            </button>
          </div>
        )}

        <footer className="border-t border-slate-200 bg-white p-4">
          <div className="mb-2 flex items-center justify-between gap-3 text-[11px] font-semibold text-slate-500">
            <span className="inline-flex min-w-0 items-center gap-1 truncate">
              <MapPin size={13} className="text-emerald-500" />
              {location
                ? `${location.lat.toFixed(3)}, ${location.lng.toFixed(3)}`
                : "Enable location for SOS and safety context"}
            </span>
            <span>{input.length}/{MAX_MESSAGE_LENGTH}</span>
          </div>

          <div className="flex items-center gap-2 rounded-[20px] border border-slate-200 bg-slate-50 p-2 shadow-inner shadow-slate-100 focus-within:border-emerald-300 focus-within:bg-white focus-within:ring-4 focus-within:ring-emerald-100">
            <input
              ref={inputRef}
              value={input}
              onChange={(event) => setInput(event.target.value.slice(0, MAX_MESSAGE_LENGTH))}
              onKeyDown={onInputKeyDown}
              disabled={loading}
              placeholder="Ask about tours, safety, budget, bookings..."
              aria-label="Message SmartTour Assistant"
              className="min-w-0 flex-1 bg-transparent px-2 py-2 text-[13px] font-semibold text-slate-900 outline-none placeholder:font-medium placeholder:text-slate-400 disabled:cursor-not-allowed"
              maxLength={MAX_MESSAGE_LENGTH}
            />
            <button
              type="button"
              onClick={() => void sendMessage()}
              disabled={!input.trim() || loading}
              className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-200 transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
              aria-label="Send message"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            </button>
          </div>

          <p className="mt-2 text-[10px] font-semibold leading-relaxed text-slate-400">
            Press Esc to close. For emergencies, call 15 or 1122 immediately.
          </p>
        </footer>
      </div>
    </section>
  );
}
