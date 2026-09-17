"use client";

import { SCENARIOS, type Scenario } from "@/lib/core/scenarios";
import { ArrowRight } from "lucide-react";

const STATS = [
  { n: "03", label: "Test scenarios" },
  { n: "06", label: "Policy rules" },
  { n: "05", label: "Action types" },
  { n: "00", label: "Hidden actions" },
];

const STEPS = [
  { n: "01", t: "Understand", d: "Extract intent, requested actions & tone" },
  { n: "02", t: "Verify", d: "Check entitlements + authority against policy" },
  { n: "03", t: "Resolve", d: "Allow, deny, or escalate — with the cited rule" },
  { n: "04", t: "Record", d: "Append to an exportable decision ledger" },
];

export function ScenarioCards({ onPick }: { onPick: (s: Scenario) => void }) {
  return (
    <div className="flex flex-col gap-10 py-8">
      <div className="grid gap-10 lg:grid-cols-[1.5fr_1fr]">
        {/* Hero */}
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
            Policy-grounded resolution
          </p>
          <h1 className="mt-4 font-serif text-[52px] font-medium leading-[1.02] tracking-tight">
            Empathy in the conversation.
            <br />
            <span className="font-light text-muted-foreground">Authority in the policy engine.</span>
          </h1>
          <p className="mt-5 max-w-lg text-sm leading-relaxed text-muted-foreground">
            Every request is grounded in the supplied booking data, checked against airline
            policy, and logged with the exact rule that allowed, denied, or escalated it. The
            agent stays kind under pressure — and cannot act beyond its authority.
          </p>
        </div>

        {/* Info rail */}
        <div className="flex flex-col divide-y divide-border border border-border">
          <div className="grid grid-cols-2 divide-x divide-y divide-border">
            {STATS.map((s) => (
              <div key={s.label} className="p-4">
                <div className="font-serif text-3xl leading-none">{s.n}</div>
                <div className="mt-1.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
          <div className="p-4">
            <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              How it works
            </p>
            <ol className="space-y-3">
              {STEPS.map((st) => (
                <li key={st.n} className="flex gap-3">
                  <span className="font-mono text-[11px] tracking-widest text-muted-foreground">{st.n}</span>
                  <div>
                    <div className="text-sm leading-none">{st.t}</div>
                    <div className="mt-1 text-[11px] leading-snug text-muted-foreground">{st.d}</div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>

      {/* Scenario tiles */}
      <div>
        <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          Choose a live disruption
        </p>
        <div className="grid gap-px border border-border bg-border sm:grid-cols-3">
          {SCENARIOS.map((s) => (
            <button
              key={s.id}
              onClick={() => onPick(s)}
              className="group flex flex-col gap-3 bg-background p-5 text-left transition-colors hover:bg-card"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] tracking-widest text-muted-foreground">
                  {String(s.id).padStart(2, "0")}
                </span>
                <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  {s.tier}
                </span>
              </div>
              <div>
                <div className="font-serif text-2xl leading-none">{s.customer.split(" ")[0]}</div>
                <div className="mt-1.5 font-mono text-[11px] uppercase tracking-wide text-muted-foreground">
                  {s.situation}
                </div>
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground">{s.headline}</p>
              <span className="mt-1 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-foreground opacity-0 transition-opacity group-hover:opacity-100">
                Open <ArrowRight className="size-3" />
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
