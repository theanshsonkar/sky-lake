# Sky Lake — Airline Disruption Resolution Agent
**AIONOS Agentic AI Factory · Assignment 3 (Customer-Facing Resolution Agent)**

> A customer-facing AI agent that resolves airline disruptions (cancellations & delays)
> by grounding **every** decision in encoded airline policy — it talks like a human but
> cannot act beyond its authority.

---

## 1. The problem, honestly framed

A disrupted passenger is angry, confused, and often asking for more than policy allows.
A support agent must: understand what actually happened, apply the right rule, give the
customer exactly what they're entitled to (no less, no more), stay empathetic under
pressure, and hand off to a human the moment the request exceeds its authority — while
leaving a clean record of what it decided and why.

The assignment grades **judgment, not coding**. So the risk to beat is an LLM that
*sounds* right but hands out compensation it shouldn't. Emotional pressure ("I'm furious,
I want a free upgrade", "legal action") is the exact failure surface.

## 2. Core design principle — LLM proposes, policy engine disposes

```
Customer message
      │
      ▼
[ LLM: intent + tone + requested actions ]   ← language & empathy ONLY
      │  (structured proposal, never a final grant)
      ▼
[ Policy Engine: deterministic ]             ← the source of truth
      │   • classify disruption (cancelled vs delayed)
      │   • compute entitlements from Service Rules
      │   • check requested action against Allowed/Prohibited
      │   • verdict: ALLOW · DENY · ESCALATE  (+ cited rule)
      ▼
[ Guarded tools ] — a tool runs ONLY if the engine returned ALLOW
      │   prohibited/over-authority requests expose only escalate_to_human()
      ▼
[ Action + Audit Ledger ]  → reply to customer
```

The LLM never decides entitlement. It cannot invent a policy because it has no code path
to grant one — the only executable actions are the ones the engine authorised. This is
what makes the agent **defensible in a live walkthrough**: every output traces to a rule.

## 3. Capabilities (mapped to the brief)

| Brief requirement | How Sky Lake meets it |
|---|---|
| Understand the customer's intent | LLM intent parse → typed `Intent` + extracted requested actions |
| Ask only necessary questions | Engine reports missing inputs; agent asks *only* those (e.g. rebook vs refund choice) |
| Use the supplied data & policies | Booking lookup by PNR + encoded Service Rules; nothing invented |
| Recommend/execute the correct next action | Guarded tools: rebook, refund, meal voucher, lounge, hotel |
| Handle an angry/confused customer | Tone detection → empathetic phrasing, but policy stays firm |
| Escalate when authority is missing | Prohibited-action guard + supervisor threshold (fare diff > ₹1,500) + legal-threat trigger |
| Preserve a clear conversation & action record | Append-only Audit Ledger: message → intent → rule → verdict → action |

## 4. The three scenarios — expected correct behaviour

**Scenario 1 — Priya Nair (Gold, SK4821X, Delhi→Goa CANCELLED)**
- Entitlement: free rebook on next flight within 24h **OR** full refund — customer's choice.
- Refund is to the **original payment method only**. A demand for *cash* to another method → out of policy → refuse/escalate.
- Free business-class upgrade "for the trouble" → compensation beyond policy → **refuse**. Gold = priority rebooking, **no extra comp**.
- If she threatens a formal complaint / legal action → **escalate immediately** (prohibited to handle).
- Her return leg (Goa→Delhi, Fri) is **Unaffected** — do not touch or offer anything on it.

**Scenario 2 — Arvind Kulkarni (Silver, TR1190B, Mumbai→Bengaluru DELAYED 4h)**
- Delay 4h is in the **>3h and ≤5h** band → **meal voucher + lounge access**.
- Hotel requires **>5h** → does not qualify → politely decline, deliver voucher + lounge.

**Scenario 3 — Meher Kaur (Platinum, WL7742, Delhi→Hyderabad DELAYED 6h)**
- Delay >5h → meal voucher + **hotel for the delayed hours only** (not a full night). This literal tier does not include lounge access; an explicit lounge request is declined with the >5h rule cited. Full-night request → refuse the excess.
- Wants a different, **higher-fare** flight — this is a **voluntary** change (her flight is delayed, not cancelled), so she pays the fare difference.
- Fare difference ₹2,000 **> ₹1,500 cap** → agent cannot waive/approve → **escalate to supervisor** for that piece.
- Platinum = priority rebooking, **no extra comp**.

## 5. Inputs, sources & assumptions

**Sources (from the data pack, used verbatim):** 3 customer profiles, booking/transaction
table, Service Rules (cancellation, delay tiers, refund, fare difference, loyalty tier),
Allowed-vs-Prohibited action list, sample-tone conversations.

**Explicit assumptions (documented, not invented policy):**
1. **"Current time" = Wed 23 Sep 2026**, used to reason about which flights are today's disruptions.
2. **Next-available inventory** is presented abstractly ("next available flight within 24h") rather than fabricating specific flight numbers, since the pack gives none. A minimal, clearly-labelled placeholder is used only to make the rebooking action concrete in the demo.
3. Sample prior conversations are **tone references only**, never a source of policy or customer fact (the pack says so).

## 6. Tech stack

- **Frontend:** Next.js 15 (App Router) · React · **shadcn/ui** (Radix + Tailwind) · lucide icons — no hand-written HTML/CSS pages, all composed from OSS components.
- **Backend:** Next.js Route Handler (`/api/chat`) — one deployable repo, Vercel-ready for a public reviewer link.
- **Agent core:** OpenAI (tool-calling) for language/tone; the **deterministic policy engine is plain TypeScript** (`src/lib/core`) — portable, unit-testable, and the reason the agent can't go off-policy.
- **State/record:** per-conversation append-only Audit Ledger rendered live in the UI.

## 7. What the reviewer sees (demo shape)

A chat UI with three **"Replay scenario"** buttons (Priya / Arvind / Meher) so the
reviewer can trigger each trap instantly, a **customer + booking context card**, and a
live **Decision Trace / Action Record** panel showing, per turn: detected intent → rule
applied → verdict (ALLOW/DENY/ESCALATE) → action taken. This is both the "action record"
requirement and the most convincing thing to defend live.

## 8. AI tools used (for the mandatory disclosure)

- **KiroCrew / Kiro (this agent):** architecture, product reasoning, code generation, review.
- **OpenAI API:** runtime intent + tone parsing and reply generation inside Sky Lake.
- Judgment on *what is correct* is encoded by the builder in the deterministic engine — the LLM does not decide policy.
