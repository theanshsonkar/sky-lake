import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { BookOpen, CircleAlert, LockKeyhole, ShieldCheck } from "lucide-react";

const policies = [
  { id: "CXL-01", title: "Airline cancellation", text: "Free rebooking on the next available flight within 24 hours, or a full refund — customer’s choice." },
  { id: "DLY-03", title: "Delay over 3 hours", text: "Meal voucher and lounge access." },
  { id: "DLY-05", title: "Delay over 5 hours", text: "Meal voucher and hotel accommodation for delayed hours only — not a full night." },
  { id: "REF-01", title: "Refund processing", text: "Full refund within 7 business days, issued only to the original payment method." },
  { id: "FAR-15", title: "Fare difference authority", text: "Voluntary higher-fare changes are paid by the customer. Waivers above ₹1,500 need supervisor approval." },
];

export function PolicyViewer() {
  return (
    <Card className="h-full border-0 bg-transparent shadow-none">
      <CardHeader className="px-3 pb-3 pt-4">
        <div className="flex items-start justify-between gap-3">
          <div><CardTitle className="flex items-center gap-2 text-base"><BookOpen className="size-4 text-primary" aria-hidden="true" /> Policy source</CardTitle><p className="mt-1 text-xs leading-5 text-muted-foreground">Only rules supplied in the Assignment 3 data pack are executable.</p></div>
          <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">v1.0 locked</Badge>
        </div>
      </CardHeader>
      <CardContent className="h-[570px] px-3 pb-3">
        <ScrollArea className="h-full pr-3">
          <div className="space-y-3">
            {policies.map((policy) => (
              <article key={policy.id} className="rounded-2xl border bg-background/70 p-4">
                <div className="mb-2 flex items-center justify-between gap-2"><h3 className="text-sm font-semibold">{policy.title}</h3><Badge variant="secondary" className="font-mono text-[10px]">{policy.id}</Badge></div>
                <p className="text-xs leading-5 text-muted-foreground">{policy.text}</p>
              </article>
            ))}
            <Separator />
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-950"><div className="flex items-center gap-2 text-sm font-semibold"><CircleAlert className="size-4" aria-hidden="true" /> Policy gap handling</div><p className="mt-1.5 text-xs leading-5 text-amber-900/80">Exact 3-hour thresholds are not defined. The agent must ask or escalate instead of inventing a rule.</p></div>
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-2xl border bg-emerald-50 p-3 text-emerald-900"><ShieldCheck className="mb-2 size-4" aria-hidden="true" /><p className="text-xs font-semibold">Allowed tools</p><p className="mt-1 text-[11px] leading-4 text-emerald-800/80">Only actions with an ALLOW verdict can execute.</p></div>
              <div className="rounded-2xl border bg-rose-50 p-3 text-rose-900"><LockKeyhole className="mb-2 size-4" aria-hidden="true" /><p className="text-xs font-semibold">Hard boundary</p><p className="mt-1 text-[11px] leading-4 text-rose-800/80">Extra compensation and legal threats go to a human.</p></div>
            </div>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
