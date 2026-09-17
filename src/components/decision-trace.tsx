"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { LedgerEntry } from "@/lib/core/audit";
import { Check, X, ArrowUpRight } from "lucide-react";

// Monochrome verdict chips — differentiated by FILL/WEIGHT, not colour.
function VerdictChip({ verdict }: { verdict: string }) {
  const base = "inline-flex items-center gap-1 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider cursor-help";
  if (verdict === "ALLOW")
    return <span className={`${base} bg-foreground text-background`}><Check className="size-3" />Allow</span>;
  if (verdict === "DENY")
    return <span className={`${base} border border-border text-muted-foreground`}><X className="size-3" />Deny</span>;
  return <span className={`${base} border border-foreground text-foreground`}><ArrowUpRight className="size-3" />Escalate</span>;
}

const actionLabel: Record<string, string> = {
  rebook_next_available: "Rebook · free ≤24h",
  refund: "Full refund",
  refund_cash_other_method: "Cash refund · other method",
  meal_voucher: "Meal voucher",
  lounge_access: "Lounge access",
  hotel: "Hotel accommodation",
  voluntary_rebook_higher_fare: "Voluntary higher-fare rebook",
  class_upgrade: "Class upgrade",
  info: "Booking / status info",
  unknown: "Unrecognised request",
};

export function DecisionTrace({ ledger }: { ledger: LedgerEntry[] }) {
  return (
    <section className="flex min-h-0 flex-1 flex-col border border-border">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          Decision Trace
        </span>
        <span className="font-mono text-[10px] text-muted-foreground">{ledger.length} turns</span>
      </div>
      <ScrollArea className="min-h-0 flex-1">
        <div className="p-3">
          {ledger.length === 0 ? (
            <p className="px-1 py-8 text-center text-xs text-muted-foreground">
              Each decision is logged here with the exact policy rule applied.
            </p>
          ) : (
            <ol className="space-y-3">
              {ledger.map((e, i) => (
                <li key={i} className="border border-border">
                  <div className="flex items-center gap-2 border-b border-border px-3 py-1.5">
                    <span className="font-mono text-[10px] tracking-widest text-muted-foreground">
                      T{String(e.turn).padStart(2, "0")}
                    </span>
                    <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                      · {e.sentiment}
                    </span>
                    {e.legalThreat && (
                      <span className="ml-auto border border-foreground px-1.5 font-mono text-[9px] uppercase tracking-wider">
                        Legal threat
                      </span>
                    )}
                  </div>

                  <div className="px-3 py-2">
                    <p className="mb-2 line-clamp-2 text-[11px] italic text-muted-foreground">
                      “{e.customerMessage}”
                    </p>

                    {e.entitlements.length > 0 && (
                      <div className="mb-2 border-l-2 border-foreground/40 pl-2">
                        <p className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">Entitled</p>
                        <p className="text-[11px] leading-relaxed">{e.entitlements.join(" ")}</p>
                      </div>
                    )}

                    <div className="space-y-1.5">
                      {e.decisions.map((d, j) => (
                        <div key={j} className="flex items-center justify-between gap-2">
                          <span className="text-[12px]">{actionLabel[d.action] ?? d.action}</span>
                          <Tooltip>
                            <TooltipTrigger render={(props) => <span {...props}><VerdictChip verdict={d.verdict} /></span>} />
                            <TooltipContent className="max-w-xs text-xs">{d.rule}</TooltipContent>
                          </Tooltip>
                        </div>
                      ))}
                    </div>

                    {e.escalated && e.escalationReasons.length > 0 && (
                      <div className="mt-2 border-l-2 border-foreground pl-2">
                        <p className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">Escalated</p>
                        <p className="text-[11px] leading-relaxed">{e.escalationReasons.join(" ")}</p>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>
      </ScrollArea>
    </section>
  );
}
