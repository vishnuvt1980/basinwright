"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUp, Loader2, Sparkles, X } from "lucide-react";

import { cn } from "@/components/ui/primitives";

type Message = { id: string; role: "user" | "assistant"; content: string };

let messageCounter = 0;
const nextId = () => `m${++messageCounter}`;

export function ChatWidget({
  title,
  greeting,
  suggestions,
}: {
  title: string;
  greeting: string;
  suggestions: string[];
}) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const conversationId = useRef<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Keep the transcript pinned to the newest token.
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, streaming]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  // Close on Escape; abort any in-flight stream on unmount.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      abortRef.current?.abort();
    };
  }, []);

  async function send(text: string) {
    const content = text.trim();
    if (!content || streaming) return;

    setError(null);
    setInput("");

    const userMessage: Message = { id: nextId(), role: "user", content };
    const assistantId = nextId();

    const history = [...messages, userMessage];
    setMessages([...history, { id: assistantId, role: "assistant", content: "" }]);
    setStreaming(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          conversationId: conversationId.current,
          messages: history.map(({ role, content }) => ({ role, content })),
        }),
      });

      if (!response.ok) {
        const detail = await response.json().catch(() => null);
        throw new Error(detail?.error ?? "The assistant is unavailable right now.");
      }
      if (!response.body) throw new Error("No response stream.");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const frames = buffer.split("\n\n");
        buffer = frames.pop() ?? "";

        for (const frame of frames) {
          const event = frame.match(/^event: (.+)$/m)?.[1];
          const dataLine = frame.match(/^data: (.+)$/m)?.[1];
          if (!event || !dataLine) continue;

          const data = JSON.parse(dataLine);

          if (event === "meta" && data.conversationId) {
            conversationId.current = data.conversationId;
          } else if (event === "delta") {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId ? { ...m, content: m.content + data.text } : m,
              ),
            );
          } else if (event === "error") {
            setError(data.message);
          }
        }
      }
    } catch (e) {
      if ((e as Error).name !== "AbortError") {
        setError((e as Error).message);
        // Drop the empty assistant bubble so the error stands alone.
        setMessages((prev) => prev.filter((m) => m.id !== assistantId || m.content));
      }
    } finally {
      setStreaming(false);
      abortRef.current = null;
    }
  }

  return (
    <>
      {/* Launcher */}
      <motion.button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "group fixed right-5 bottom-5 z-50 inline-flex items-center gap-2.5 rounded-full",
          "border border-brass-600/50 bg-basin-900/90 py-3 pr-5 pl-4 backdrop-blur-xl",
          "shadow-[0_20px_50px_-20px_rgba(0,0,0,0.9)] transition-colors hover:border-brass-500",
        )}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.6, duration: 0.6 }}
        aria-expanded={open}
        aria-controls="bw-chat-panel"
      >
        {open ? (
          <X className="size-5 text-brass-300" />
        ) : (
          <Sparkles className="size-5 animate-shimmer text-brass-300" />
        )}
        <span className="text-sm font-medium text-parchment-100">
          {open ? "Close" : "Ask BasinWright"}
        </span>
      </motion.button>

      <AnimatePresence>
        {open ? (
          <motion.div
            id="bw-chat-panel"
            role="dialog"
            aria-label={title}
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              "fixed right-5 bottom-24 z-50 flex w-[min(26rem,calc(100vw-2.5rem))] flex-col",
              "h-[min(34rem,calc(100dvh-9rem))] overflow-hidden rounded-2xl",
              "border border-basin-600/70 bg-basin-900/95 backdrop-blur-2xl",
              "shadow-[0_40px_100px_-30px_rgba(0,0,0,0.95)]",
            )}
          >
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-basin-700/70 px-5 py-4">
              <span className="inline-flex size-8 items-center justify-center rounded-full border border-brass-600/50 bg-brass-500/10">
                <Sparkles className="size-4 text-brass-300" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-parchment-50">{title}</p>
                <p className="text-xs text-basin-400">
                  {streaming ? "Thinking…" : "Grounded in this site's content"}
                </p>
              </div>
            </div>

            {/* Transcript */}
            <div ref={scrollRef} className="no-scrollbar flex-1 overflow-y-auto px-5 py-5">
              {messages.length === 0 ? (
                <div className="flex flex-col gap-5">
                  <p className="text-sm leading-relaxed text-basin-300">{greeting}</p>
                  <div className="flex flex-col gap-2">
                    {suggestions.map((suggestion) => (
                      <button
                        key={suggestion}
                        type="button"
                        onClick={() => send(suggestion)}
                        className="rounded-xl border border-basin-700 bg-basin-850/60 px-4 py-2.5 text-left text-sm text-basin-200 transition-colors hover:border-brass-600/60 hover:text-brass-200"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap",
                        message.role === "user"
                          ? "self-end bg-brass-500/15 text-parchment-50"
                          : "self-start bg-basin-800/80 text-basin-200",
                      )}
                    >
                      {message.content ||
                        (streaming ? (
                          <Loader2 className="size-4 animate-spin text-basin-400" />
                        ) : null)}
                    </div>
                  ))}
                </div>
              )}

              {error ? (
                <p className="mt-4 rounded-xl border border-ember-400/40 bg-ember-500/10 px-4 py-3 text-sm text-ember-300">
                  {error}
                </p>
              ) : null}
            </div>

            {/* Composer */}
            <form
              className="border-t border-basin-700/70 p-3"
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
            >
              <div className="flex items-end gap-2 rounded-xl border border-basin-600/70 bg-basin-850/80 p-2 focus-within:border-brass-600/60">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      send(input);
                    }
                  }}
                  rows={1}
                  placeholder="Ask about deployment, agents, GPUs…"
                  aria-label="Message"
                  className="max-h-28 flex-1 resize-none bg-transparent px-2 py-1.5 text-sm text-parchment-100 placeholder:text-basin-500 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={streaming || !input.trim()}
                  aria-label="Send message"
                  className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-brass-500 text-basin-950 transition-colors hover:bg-brass-400 disabled:opacity-35"
                >
                  {streaming ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <ArrowUp className="size-4" strokeWidth={2.5} />
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
