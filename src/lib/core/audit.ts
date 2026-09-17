// Append-only audit ledger — the "clear conversation and action record" the brief
// requires. One entry per agent turn, capturing the full reasoning trace.
import type { Decision, Sentiment } from "./types";

export interface LedgerEntry {
  ts: string;                 // ISO timestamp
  turn: number;
  customerMessage: string;
  sentiment: Sentiment;
  legalThreat: boolean;
  entitlements: string[];
  decisions: {
    action: string;
    verdict: string;
    rule: string;
  }[];
  escalated: boolean;
  escalationReasons: string[];
  agentReply: string;
}

export function buildLedgerEntry(args: {
  turn: number;
  customerMessage: string;
  sentiment: Sentiment;
  legalThreat: boolean;
  decision: Decision;
  agentReply: string;
}): LedgerEntry {
  return {
    ts: new Date().toISOString(),
    turn: args.turn,
    customerMessage: args.customerMessage,
    sentiment: args.sentiment,
    legalThreat: args.legalThreat,
    entitlements: args.decision.entitlements,
    decisions: args.decision.items.map((i) => ({
      action: i.action.type,
      verdict: i.verdict,
      rule: i.rule,
    })),
    escalated: args.decision.escalate,
    escalationReasons: args.decision.escalationReasons,
    agentReply: args.agentReply,
  };
}
