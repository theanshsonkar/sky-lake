// The language layer, behind a swappable interface.
// DeterministicReasoner needs NO API key: it maps a customer message to a
// structured AgentProposal with pattern rules. An LLMReasoner can be dropped in
// later (same interface) if a key is provided — the policy engine is unchanged
// either way, so the agent can never grant something policy forbids.
import { CUSTOMERS } from "./core/data";
import type { AgentProposal, RequestedAction, Sentiment } from "./core/types";

export interface Reasoner {
  parse(message: string, knownPnr?: string): AgentProposal;
}

const PNRS = Object.keys(CUSTOMERS);

function detectPnr(message: string, knownPnr?: string): string | undefined {
  const upper = message.toUpperCase();
  const found = PNRS.find((p) => upper.includes(p));
  return found ?? knownPnr;
}

function detectSentiment(m: string): Sentiment {
  const s = m.toLowerCase();
  if (/(furious|unacceptable|outrage|ridiculous|disgust|livid|fed up)/.test(s)) return "angry";
  if (/(frustrat|annoyed|upset|missing|ruined|not happy|disappoint)/.test(s)) return "frustrated";
  return "calm";
}

function detectLegalThreat(m: string): boolean {
  return /(legal action|lawyer|sue|court|formal complaint|consumer forum|take this further legally)/i.test(m);
}

function extractFareDifference(m: string): number | undefined {
  // Strip commas, then match a 3–6 digit amount that is NOT glued to letters
  // (the lookbehind rejects the digits inside a PNR like "WL7742").
  const cleaned = m.replace(/,/g, "");
  const match = cleaned.match(/(?<![A-Za-z0-9])(?:₹|rs\.?\s*|inr\s*)?(\d{3,6})(?:\s*(?:rupees|rs|inr))?/i);
  return match ? parseInt(match[1], 10) : undefined;
}

function extractActions(m: string): RequestedAction[] {
  const s = m.toLowerCase();
  const actions: RequestedAction[] = [];

  const wantsRefund = /(refund|money back|reimburse)/.test(s);
  const wantsCashOther = /(cash|different (?:card|account|method)|another (?:card|account|method)|to my upi|bank transfer)/.test(s);
  if (wantsRefund) {
    if (wantsCashOther) actions.push({ type: "refund_cash_other_method" });
    else actions.push({ type: "refund", toOriginalMethod: true });
  }

  if (/(rebook|re-book|next (?:available )?flight|book me on|another flight|reschedule)/.test(s) &&
      !/(higher|different flight|earlier higher|other flight)/.test(s)) {
    actions.push({ type: "rebook_next_available" });
  }

  if (/(upgrade|business class|first class)/.test(s)) {
    const free = /(free|complimentary|for (?:the|all this) trouble|no charge|at no cost)/.test(s);
    actions.push({ type: "class_upgrade", free });
  }

  if (/(hotel|accommodation|room|place to stay|stay the night|overnight)/.test(s)) {
    const fullNight = /(full night|whole night|overnight|entire night|night'?s stay)/.test(s);
    actions.push({ type: "hotel", fullNight });
  }

  if (/(meal|food|voucher|something to eat)/.test(s)) actions.push({ type: "meal_voucher" });
  if (/(lounge)/.test(s)) actions.push({ type: "lounge_access" });

  if (/(higher[- ]fare|different flight|earlier flight|move me (?:onto|to)|switch me to|other flight instead|pay the difference)/.test(s)) {
    const fareDifference = extractFareDifference(s) ?? 0;
    actions.push({ type: "voluntary_rebook_higher_fare", fareDifference });
  }

  if (actions.length === 0) {
    const asksForInfo = /(flight|booking|departure|delay|cancel).*(status|details|information|info|options)|(?:status|details|information|info|options).*(flight|booking|departure|delay|cancel)|what (?:happened|can you do|am i entitled to)|what (?:i am|i'm).*entitled to|\bflight\b.*\b(?:delayed|cancelled|canceled)\b|when (?:does|will).*(?:depart|leave)/.test(s);
    // Only map an explicit status/options inquiry to info. An ambiguous message
    // needs a clarifying question; pretending it is informational can conceal a
    // request that requires a policy decision.
    actions.push({ type: asksForInfo ? "info" : "unknown" });
  }
  return actions;
}

export class DeterministicReasoner implements Reasoner {
  parse(message: string, knownPnr?: string): AgentProposal {
    return {
      pnr: detectPnr(message, knownPnr),
      sentiment: detectSentiment(message),
      legalThreat: detectLegalThreat(message),
      requestedActions: extractActions(message),
    };
  }
}

export const reasoner: Reasoner = new DeterministicReasoner();
