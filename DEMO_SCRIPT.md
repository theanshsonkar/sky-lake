# Sky Lake — Demo Video Script (~4 minutes)

Record at 1440×900, dark UI, `pnpm dev` running. Speak plainly. Aim ≤ 5 min.

---

### 0:00 — What it is (15s)
> "This is **Sky Lake**, a customer-facing agent for airline disruptions. A passenger says
> their flight is cancelled or delayed; the agent figures out exactly what they're owed,
> stays polite under pressure, and escalates anything it isn't allowed to do — and it logs
> every decision with the rule behind it."

### 0:15 — The one design idea (25s)  *(show the empty screen: hero + How-it-works)*
> "The important design choice is that I split the agent in two. One part **reads** the
> message — intent, tone, what they're asking for. The other part is a **deterministic
> policy engine** that actually **decides**, using airline policy encoded from the data
> pack. The language side can only *suggest*; the engine decides and cites the rule. So the
> agent literally can't hand out something against policy, no matter how the customer
> pushes. And it needs no API key — it runs offline."

### 0:40 — Scenario 1 · Priya, Gold, cancelled (55s)  *(click 01 · Priya)*
> "Priya's flight to Goa is cancelled. The agent immediately offers the two things policy
> allows — a free rebooking within 24 hours, or a full refund — and asks her to choose."

*(click the chip: "I'm furious — full cash refund AND a free business-class upgrade")*
> "Now she's furious and asks for a cash refund to another method **and** a free upgrade.
> Watch the decision trace on the right: the **upgrade is denied** — it's compensation beyond
> policy, and Gold only gets priority seating. The **cash-to-another-method is escalated** —
> refunds only go to the original method, which is beyond the agent's authority. It stays
> empathetic but doesn't cave."

*(click the chip: "…formal complaint and legal action")*
> "And the moment she mentions a formal complaint, it escalates immediately — see the banner."

### 1:35 — Scenario 2 · Arvind, Silver, 4h delay (35s)  *(click 02 · Arvind)*
> "Arvind's flight is delayed four hours. He's entitled to a meal voucher and lounge access,
> and the agent gives exactly that."

*(click the chip: "I'd like a hotel")*
> "He asks for a hotel — but a hotel needs a delay over five hours, so the agent politely
> declines and explains why. It gives what's owed, nothing more."

### 2:10 — Scenario 3 · Meher, Platinum, 6h delay (50s)  *(click 03 · Meher)*
> "Meher's delay is six hours, so she does get a hotel — but only for the delayed hours."

*(click the chip: "full night + higher-fare flight, ₹2,000 difference")*
> "She asks for a full night's stay — denied, policy covers only the delayed hours. And she
> wants to move to a higher-fare flight; that's a voluntary change, so she pays the
> difference — but ₹2,000 is over the ₹1,500 agent cap, so that piece is **escalated to a
> supervisor**. One message, three correct judgments."

### 3:00 — The record (25s)  *(point at the Decision Trace + Resolution summary)*
> "Everything is logged: each turn, the sentiment, what policy allowed, denied, or escalated,
> and the exact rule — hover any verdict to see it. That's the audit trail, and it's what
> makes the agent's judgment defensible."

### 3:25 — Close (15s)
> "So Sky Lake turns a messy, emotional disruption into the correct, policy-grounded outcome —
> empathy in the conversation, authority in the policy engine. Code's on GitHub, runs with one
> command, no API key. Thanks."

---

## Live-defence cheat-sheet (for the technical round)

- **Why deterministic, not just an LLM?** Judgment lives in a rulebook you can point to, so it
  can't hallucinate policy and is 100% reproducible. The LLM is an optional, swappable
  language layer (the `Reasoner` interface).
- **Cancellation vs delay** are different rule families — rebook/refund vs delay-tier comp.
- **Delay tiers are cumulative:** >3h adds lounge; >5h adds hotel (delayed hours only).
- **Loyalty tier = priority access, never extra money.**
- **Refund → original method only;** cash-to-other-method → escalate.
- **Fare difference > ₹1,500 → supervisor;** ≤ ₹1,500 the agent can process.
- **Legal threat / formal complaint → immediate escalation.**
- **Priya's return leg is Unaffected** — the agent never touches it.
- **Assumptions** are explicit (payment method, clock, next-available inventory, sample
  conversations are tone-only) — nothing outside the data pack is invented.
