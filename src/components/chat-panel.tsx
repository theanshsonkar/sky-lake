"use client";

import { useEffect, useRef, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowUp } from "lucide-react";

export interface ChatMessage {
  role: "customer" | "agent";
  text: string;
}

export function ChatPanel({
  messages,
  onSend,
  loading,
  suggestions,
  onSuggestion,
  emptyState,
}: {
  messages: ChatMessage[];
  onSend: (text: string) => void;
  loading: boolean;
  suggestions: string[];
  onSuggestion: (text: string) => void;
  emptyState?: React.ReactNode;
}) {
  const [draft, setDraft] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, suggestions]);

  const submit = () => {
    const t = draft.trim();
    if (!t || loading) return;
    onSend(t);
    setDraft("");
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-transparent">
      <ScrollArea className="min-h-0 flex-1">
        <div className="mx-auto w-full max-w-3xl px-6 py-6">
          {messages.length === 0 ? (
            emptyState
          ) : (
            <div className="space-y-5">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex animate-in fade-in-0 slide-in-from-bottom-1 gap-3 duration-300 ${
                    m.role === "customer" ? "flex-row-reverse" : ""
                  }`}
                >
                  <div
                    className={`flex size-7 shrink-0 items-center justify-center border font-mono text-[10px] uppercase ${
                      m.role === "agent"
                        ? "border-foreground/25 text-foreground"
                        : "border-transparent bg-foreground text-background"
                    }`}
                  >
                    {m.role === "agent" ? "AI" : "PAX"}
                  </div>
                  <div
                    className={`max-w-[82%] whitespace-pre-line px-4 py-2.5 text-sm leading-relaxed ${
                      m.role === "agent"
                        ? "border border-border bg-card text-foreground"
                        : "bg-foreground text-background"
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex animate-in fade-in-0 gap-3">
                  <div className="flex size-7 shrink-0 items-center justify-center border border-foreground/25 font-mono text-[10px]">
                    AI
                  </div>
                  <div className="border border-border bg-card px-4 py-3">
                    <span className="inline-flex gap-1">
                      <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.3s]" />
                      <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.15s]" />
                      <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground" />
                    </span>
                  </div>
                </div>
              )}
              <div ref={endRef} />
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="mx-auto w-full max-w-3xl px-6 pb-6">
        {suggestions.length > 0 && !loading && (
          <div className="mb-3 flex flex-wrap gap-2">
            {suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => onSuggestion(s)}
                className="border border-border px-3 py-1.5 text-left text-xs text-muted-foreground transition-colors hover:border-foreground/50 hover:text-foreground"
              >
                {s}
              </button>
            ))}
          </div>
        )}
        <div className="flex items-center gap-0 border border-border bg-card focus-within:border-foreground/50">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="Type a passenger message…"
            disabled={loading}
            className="flex-1 bg-transparent px-4 py-3 text-sm outline-none placeholder:text-muted-foreground"
          />
          <button
            onClick={submit}
            disabled={loading || !draft.trim()}
            className="m-1 flex size-9 items-center justify-center bg-foreground text-background transition-opacity disabled:opacity-30"
          >
            <ArrowUp className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
