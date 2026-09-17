// Domain types for Sky Lake — the deterministic core.
// The LLM produces an `AgentProposal`; the policy engine returns a `Decision`.
// Nothing here depends on the web framework, so the engine is portable + testable.

export type LoyaltyTier = "Silver" | "Gold" | "Platinum";

export interface Customer {
  name: string;
  tier: LoyaltyTier;
  bookingRef: string;
  contact: string;
  flightsLast12m: number;
  priorComplaints: number;
  priorComplaintNote?: string;
}

export type FlightStatus =
  | { kind: "cancelled"; reason: string }
  | { kind: "delayed"; hours: number; newDeparture: string }
  | { kind: "unaffected" };

export interface Booking {
  customer: string;
  pnr: string;
  flight: string;
  route: string;
  date: string;
  scheduledDeparture: string;
  status: FlightStatus;
}

// What the customer is asking for, extracted by the LLM into a structured shape.
export type RequestedAction =
  | { type: "rebook_next_available" }              // free rebook after airline disruption
  | { type: "refund"; toOriginalMethod: boolean }  // full refund
  | { type: "refund_cash_other_method" }           // out of policy by construction
  | { type: "meal_voucher" }
  | { type: "lounge_access" }
  | { type: "hotel"; fullNight: boolean }           // fullNight=true is the over-ask
  | { type: "voluntary_rebook_higher_fare"; fareDifference: number }
  | { type: "class_upgrade"; free: boolean }        // "free upgrade for the trouble"
  | { type: "info" }                                // just wants status/booking info
  | { type: "unknown" };

export type Sentiment = "calm" | "frustrated" | "angry";

export interface AgentProposal {
  pnr?: string;
  sentiment: Sentiment;
  legalThreat: boolean;          // formal complaint / legal action mentioned
  requestedActions: RequestedAction[];
}

export type Verdict = "ALLOW" | "DENY" | "ESCALATE";

export interface DecisionItem {
  action: RequestedAction;
  verdict: Verdict;
  rule: string;                  // the cited policy that produced this verdict
  explanation: string;           // customer-facing rationale
}

export interface Decision {
  booking?: Booking;
  customer?: Customer;
  entitlements: string[];        // what policy grants for this disruption, unprompted
  items: DecisionItem[];         // verdict per requested action
  escalate: boolean;             // any item escalated, or a legal threat
  escalationReasons: string[];
  missingInfo: string[];         // questions the agent should ask (e.g. rebook vs refund)
}
