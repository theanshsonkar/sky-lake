"use client";

import { CUSTOMERS, BOOKINGS } from "@/lib/core/data";
import { AlertTriangle, CheckCircle2, Clock } from "lucide-react";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
      <span className="text-sm">{value}</span>
    </div>
  );
}

export function ContextCard({ pnr }: { pnr?: string }) {
  if (!pnr || !CUSTOMERS[pnr]) {
    return (
      <section className="border border-dashed border-border p-6 text-center">
        <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          Passenger
        </p>
        <p className="mt-2 text-xs text-muted-foreground">Select a disruption to load booking evidence.</p>
      </section>
    );
  }
  const c = CUSTOMERS[pnr];
  const rows = BOOKINGS.filter((b) => b.pnr === pnr);

  return (
    <section className="border border-border">
      <div className="flex items-baseline justify-between border-b border-border px-4 py-3">
        <span className="font-serif text-xl leading-none">{c.name}</span>
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{c.tier}</span>
      </div>
      <div className="px-4 py-2">
        <Row label="PNR" value={c.bookingRef} />
        <Row label="Flights / 12m" value={String(c.flightsLast12m)} />
        <Row label="Prior complaints" value={String(c.priorComplaints)} />
        {c.priorComplaintNote && (
          <p className="mt-1 text-[11px] italic text-muted-foreground">“{c.priorComplaintNote}”</p>
        )}
      </div>
      <div className="border-t border-border">
        {rows.map((b, i) => (
          <div key={i} className="border-b border-border px-4 py-3 last:border-b-0">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs tracking-wide">{b.flight}</span>
              <span className="text-[11px] text-muted-foreground">{b.route}</span>
            </div>
            <div className="mt-1.5 flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                {b.date} · {b.scheduledDeparture}
              </span>
              {b.status.kind === "cancelled" && (
                <span className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider">
                  <AlertTriangle className="size-3" /> Cancelled
                </span>
              )}
              {b.status.kind === "delayed" && (
                <span className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider">
                  <Clock className="size-3" /> Delayed {b.status.hours}h → {b.status.newDeparture}
                </span>
              )}
              {b.status.kind === "unaffected" && (
                <span className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  <CheckCircle2 className="size-3" /> Unaffected
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
