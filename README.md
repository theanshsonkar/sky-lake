# Sky Lake — Airline Disruption Resolution Agent

> AIONOS Agentic AI Factory · **Assignment 3 — Customer-Facing Resolution Agent (Airline Disruption)**

A customer-facing AI agent that resolves airline disruptions (cancellations & delays). A
passenger describes what happened; the agent works out what they are **actually entitled
to**, gives it to them, stays empathetic even when they are angry, and **escalates to a
human the moment a request exceeds its authority** — logging every decision with the exact
policy rule it applied.

Runs **fully offline with no API key**.

---

## The core idea — the LLM proposes, a policy engine disposes

The assignment tests **judgment, not coding**. The failure mode to beat is an agent that
*sounds* right but hands out compensation it shouldn't under emotional pressure. Sky Lake
makes that structurally impossible by splitting the agent into two parts:

```
Passenger message
      │
      ▼
[ Reasoner ]  → intent · requested actions · sentiment · legal-threat     (language only)
      │  produces a structured proposal — it can never grant anything
      ▼
[ Policy Engine ]  → deterministic rulebook encoded from the data pack
      │  per action: ALLOW · DENY · ESCALATE  (+ the exact cited rule)
      ▼
[ Reply + Audit Ledger ]  → empathetic wording, every decision logged
```

The reasoner can only *suggest* actions. The **deterministic policy engine** decides
entitlement and authority, so the agent physically cannot do something against policy —
e.g. grant a furious Gold customer a free business-class upgrade — because there is no code
path to allow it. Every decision is traceable to a rule, which is exactly what makes it
defensible in a live walkthrough.

## The three scenarios (and the traps)

| Scenario | Passenger asks | Correct behaviour (engine-enforced) |
|---|---|---|
| **1 — Priya (Gold, cancelled)** | Full **cash** refund + free business upgrade "for the trouble" | Free rebook ≤24h **or** full refund **to original method only**; upgrade → **refuse** (comp beyond policy); legal threat → **escalate immediately**; Gold = priority seat, no extra comp |
| **2 — Arvind (Silver, 4h delay)** | Hotel "for the long delay" | 3–5h → **meal voucher + lounge only**; hotel needs **>5h** → decline politely |
| **3 — Meher (Platinum, 6h delay)** | Full-night hotel + higher-fare flight (₹2,000 diff) | >5h → meal + hotel for **delayed hours only** (full night → refuse); voluntary rebook → pays difference; ₹2,000 **> ₹1,500 cap → escalate to supervisor** |

## Run it (one command, no key)

```bash
pnpm install
pnpm dev
# open http://localhost:3000
```

Or build for production:

```bash
pnpm build && pnpm start
```

There is **nothing to configure** — the reasoner is deterministic and runs locally. Use the
scenario tiles / header switcher to replay the three exercise cases, or type any passenger
message.

## Tech stack

- **Next.js 16** (App Router) · **React 19** · **TypeScript**
- **shadcn/ui** (Base UI + Tailwind v4) components — no hand-written HTML/CSS pages
- **Space Grotesk** / **Space Mono** — editorial black-and-white design
- Deterministic **policy engine in plain TypeScript** (`src/lib/core`) — portable & testable

## Project structure

```
src/
  app/
    page.tsx            UI shell (chat + evidence rail + decision trace)
    api/chat/route.ts   stateless endpoint: reasoner → engine → reply → ledger
    layout.tsx, globals.css
  lib/
    reasoner.ts         pluggable language layer (deterministic; LLM-swappable)
    reply.ts            composes the empathetic, policy-firm reply
    core/
      data.ts           the data pack, encoded verbatim (customers, bookings, rules)
      policy-engine.ts  the deterministic ALLOW / DENY / ESCALATE decider
      types.ts          domain + proposal/decision types
      scenarios.ts      the three exercise seeds
      audit.ts          append-only decision ledger
  components/           chat panel, scenario cards, context card, decision trace
PRODUCT.md              full product/architecture write-up
ARCHITECTURE.md         architecture & process flow
```

## Inputs, sources & assumptions

**Sources** (used verbatim from the data pack): 3 customer profiles, the booking table, the
Service Rules, and the Allowed-vs-Prohibited action list. Nothing outside the pack is
invented.

**Assumptions** (documented, not invented policy):
1. Original payment method is a card, not cash → a cash-to-other-method demand is out of policy and escalates.
2. "Current time" = **Wed 23 Sep 2026** (the pack's clock).
3. "Next available flight within 24h" is presented abstractly (the pack gives no inventory).
4. Sample prior conversations are tone references only, never a source of policy or fact.

## AI tools used (mandatory disclosure)

- **Kiro (KiroCrew agent)** — architecture, product reasoning, code generation, UI design, and review of this project.
- **Deterministic policy engine** — the *judgment* (what is correct) is encoded by the builder in `policy-engine.ts`; the language layer does not decide policy.
- **Optional LLM reasoner** — the `Reasoner` interface (`src/lib/reasoner.ts`) is swappable, so an LLM can be plugged in for language parsing without changing the engine. Not required to run.

## License

MIT — see [LICENSE](./LICENSE).
