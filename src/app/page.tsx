"use client";

import { useRef, useState } from "react";
import { ScenarioCards } from "@/components/scenario-cards";
import { ContextCard } from "@/components/context-card";
import { DecisionTrace } from "@/components/decision-trace";
import { ChatPanel, type ChatMessage } from "@/components/chat-panel";
import { SCENARIOS, type Scenario } from "@/lib/core/scenarios";
import type { LedgerEntry } from "@/lib/core/audit";
import { ShieldAlert, RotateCcw } from "lucide-react";

export default function Home() {
  const [activePnr, setActivePnr] = useState<string | undefined>();
  const [activeId, setActiveId] = useState<number | undefined>();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [escalated, setEscalated] = useState(false);
  const turnRef = useRef(0);

  async function send(text: string, pnr?: string) {
    setMessages((m) => [...m, { role: "customer", text }]);
    setSuggestions((s) => s.filter((x) => x !== text));
    setLoading(true);
    turnRef.current += 1;
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ message: text, pnr, turn: turnRef.current }),
      });
      const data = await res.json();
      setMessages((m) => [...m, { role: "agent", text: data.reply }]);
      if (data.ledgerEntry) setLedger((l) => [...l, data.ledgerEntry]);
      if (data.decision?.escalate) setEscalated(true);
      if (data.proposal?.pnr && !pnr) setActivePnr(data.proposal.pnr);
    } catch {
      setMessages((m) => [...m, { role: "agent", text: "Sorry, something went wrong on our side." }]);
    } finally {
      setLoading(false);
    }
  }

  function pickScenario(s: Scenario) {
    setActivePnr(s.pnr);
    setActiveId(s.id);
    setMessages([]);
    setLedger([]);
    setEscalated(false);
    setSuggestions(s.suggestions);
    turnRef.current = 0;
    send(s.opening, s.pnr);
  }

  function reset() {
    setActivePnr(undefined);
    setActiveId(undefined);
    setMessages([]);
    setLedger([]);
    setEscalated(false);
    setSuggestions([]);
    turnRef.current = 0;
  }

  const allowed = ledger.reduce((a, e) => a + e.decisions.filter((d) => d.verdict === "ALLOW").length, 0);
  const denied = ledger.reduce((a, e) => a + e.decisions.filter((d) => d.verdict === "DENY").length, 0);
  const escalations = ledger.filter((e) => e.escalated).length;

  return (
    <div className="flex h-screen flex-col bg-background text-foreground">
      {/* Top bar */}
      <header className="flex shrink-0 items-center justify-between border-b px-6 py-3.5">
        <div className="flex items-center gap-3">
          <div className="flex size-8 items-center justify-center border border-foreground/25 font-serif text-sm font-semibold leading-none tracking-tight">
            SL
          </div>
          <div className="flex items-baseline gap-3">
            <span className="font-serif text-[24px] font-semibold leading-none tracking-tight">Sky Lake</span>
            <span className="hidden font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground sm:inline">
              Airline Disruption Desk
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="mr-1 hidden items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground lg:flex">
            <span className="status-dot size-1.5 rounded-full bg-foreground" />
            Engine ready
          </span>
          <nav className="mr-1 hidden items-center gap-1 md:flex">
            {SCENARIOS.map((s) => (
              <button
                key={s.id}
                onClick={() => pickScenario(s)}
                className={`border px-2.5 py-1 font-mono text-[11px] uppercase tracking-wider transition-colors ${
                  activeId === s.id
                    ? "border-foreground bg-foreground text-background"
                    : "border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground"
                }`}
              >
                {String(s.id).padStart(2, "0")} · {s.customer.split(" ")[0]}
              </button>
            ))}
          </nav>
          {activeId && (
            <button
              onClick={reset}
              title="Reset"
              className="flex items-center gap-1.5 border border-border px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground transition-colors hover:border-foreground/40 hover:text-foreground"
            >
              <RotateCcw className="size-3" /> Reset
            </button>
          )}
          <span className="border border-border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
            No key · Offline
          </span>
        </div>
      </header>

      {escalated && (
        <div className="flex shrink-0 animate-in fade-in-0 slide-in-from-top-1 items-center gap-2.5 border-b border-foreground/20 bg-foreground/[0.04] px-6 py-2.5">
          <ShieldAlert className="size-4 shrink-0" />
          <span className="font-mono text-[11px] uppercase tracking-wider">
            Escalated — a request exceeded agent authority and was routed to a human specialist
          </span>
        </div>
      )}

      {/* Body */}
      <main className="grid min-h-0 flex-1 lg:grid-cols-[1fr_384px]">
        <div className="flex min-h-0 flex-col bg-dotgrid">
          <ChatPanel
            messages={messages}
            onSend={(t) => send(t, activePnr)}
            onSuggestion={(t) => send(t, activePnr)}
            loading={loading}
            suggestions={suggestions}
            emptyState={<ScenarioCards onPick={pickScenario} />}
          />
        </div>
        <aside className="hidden min-h-0 flex-col gap-4 overflow-y-auto border-l bg-card/30 p-4 lg:flex">
          {activeId && (
            <section className="border border-border">
              <div className="border-b border-border px-4 py-2.5">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  Resolution
                </span>
              </div>
              <div className="grid grid-cols-4 divide-x divide-border">
                {[
                  { n: ledger.length, l: "Turns" },
                  { n: allowed, l: "Allowed" },
                  { n: denied, l: "Denied" },
                  { n: escalations, l: "Escal." },
                ].map((s) => (
                  <div key={s.l} className="px-2 py-3 text-center">
                    <div className="font-serif text-2xl leading-none">{s.n}</div>
                    <div className="mt-1 font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
                      {s.l}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
          <ContextCard pnr={activePnr} />
          <DecisionTrace ledger={ledger} />
        </aside>
      </main>

      {/* Meta footer */}
      <footer className="flex shrink-0 items-center justify-between border-t px-6 py-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
        <span>Deterministic policy engine · 6 rules · no external calls</span>
        <span className="hidden sm:inline">Exercise clock · Wed 23 Sep 2026</span>
      </footer>
    </div>
  );
}
