"use client";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { SCENARIOS, type Scenario } from "@/lib/core/scenarios";
import { ArrowRight, Plane, ShieldAlert } from "lucide-react";

export function ScenarioBar({
  activeId,
  onPick,
}: {
  activeId?: number;
  onPick: (s: Scenario) => void;
}) {
  return (
    <div className="grid gap-2 md:grid-cols-3">
      {SCENARIOS.map((s) => (
        <Tooltip key={s.id}>
          <TooltipTrigger
            render={(props) => (
              <Button
                {...props}
                size="lg"
                variant={activeId === s.id ? "default" : "outline"}
                onClick={() => onPick(s)}
                className="h-auto min-h-16 w-full justify-start gap-3 rounded-2xl px-3 py-2 text-left"
              >
                <span className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${activeId === s.id ? "bg-white/15" : "bg-primary/10 text-primary"}`}>
                  {s.id === 1 ? <ShieldAlert className="size-4" /> : <Plane className="size-4" />}
                </span>
                <span className="min-w-0 flex-1"><span className="block text-xs font-semibold">Scenario {s.id} · {s.customer}</span><span className={`mt-0.5 block truncate text-[10px] ${activeId === s.id ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{s.headline}</span></span>
                <ArrowRight className="size-3.5 shrink-0 opacity-60" />
              </Button>
            )}
          />
          <TooltipContent className="max-w-xs text-xs">{s.headline}</TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
}
