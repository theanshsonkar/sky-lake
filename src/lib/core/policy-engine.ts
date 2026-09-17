// The deterministic policy + authority engine.
// Given a structured AgentProposal (from the LLM) it returns a Decision with a
// verdict + cited rule per requested action. The LLM cannot bypass this: guarded
// tools only run on an ALLOW verdict, and prohibited asks yield ESCALATE.
import {
  CUSTOMERS,
  FARE_DIFF_AGENT_CAP,
  RULES,
  primaryBooking,
} from "./data";
import type {
  AgentProposal,
  Booking,
  Decision,
  DecisionItem,
  RequestedAction,
} from "./types";

// Standard entitlements a disruption grants, independent of what the customer asked.
function baseEntitlements(booking: Booking): string[] {
  const s = booking.status;
  if (s.kind === "cancelled") {
    return [
      "Free rebooking on the next available flight within 24 hours, OR a full refund — your choice.",
    ];
  }
  if (s.kind === "delayed") {
    const out: string[] = [];
    if (s.hours < 3) out.push("₹500 meal voucher.");
    if (s.hours > 5) {
      // The >5h rule is a distinct, literal tier. It grants a meal voucher and
      // delayed-hours hotel accommodation; it does not carry lounge access over
      // from the >3h tier.
      out.push("Meal voucher + hotel accommodation for the delayed hours only (not a full night).");
    } else if (s.hours > 3) {
      out.push("Meal voucher + lounge access.");
    }
    return out;
  }
  return [];
}

function decideAction(action: RequestedAction, booking: Booking): DecisionItem {
  const s = booking.status;

  switch (action.type) {
    case "rebook_next_available":
      if (s.kind === "cancelled")
        return {
          action, verdict: "ALLOW", rule: RULES.cancellationRebook,
          explanation: "Airline-cancelled flight — free rebooking on the next available flight within 24h.",
        };
      return {
        action, verdict: "DENY", rule: RULES.cancellationRebook,
        explanation: "Free rebooking applies to airline cancellations. This flight is delayed, not cancelled.",
      };

    case "refund":
      if (s.kind === "cancelled" && action.toOriginalMethod)
        return {
          action, verdict: "ALLOW", rule: RULES.refundProcessing,
          explanation: "Full refund to the original payment method, processed within 7 business days.",
        };
      if (s.kind === "cancelled")
        return {
          action, verdict: "ESCALATE", rule: RULES.refundProcessing,
          explanation: "Refunds can only be issued to the original payment method. A different destination is beyond agent authority.",
        };
      return {
        action, verdict: "DENY", rule: RULES.cancellationRebook,
        explanation: "A full refund is offered for airline cancellations, not for a delay.",
      };

    case "refund_cash_other_method":
      return {
        action, verdict: "ESCALATE", rule: RULES.refundProcessing,
        explanation: "Refunds are issued only to the original payment method. Paying out cash to a different method is beyond agent authority.",
      };

    case "meal_voucher":
      if (s.kind === "delayed")
        return {
          action,
          verdict: "ALLOW",
          rule: s.hours > 5
            ? RULES.delayOver5h
            : s.hours > 3
              ? RULES.delayOver3h
              : RULES.delayUnder3h,
          explanation: "Meal voucher applies for this delay.",
        };
      return {
        action, verdict: "DENY", rule: RULES.delayOver3h,
        explanation: "Meal vouchers apply to delays.",
      };

    case "lounge_access":
      if (s.kind === "delayed" && s.hours > 5)
        return {
          action, verdict: "DENY", rule: RULES.delayOver5h,
          explanation: "The more-than-5-hours rule grants a meal voucher and hotel accommodation for the delayed hours; it does not include lounge access.",
        };
      if (s.kind === "delayed" && s.hours > 3)
        return {
          action, verdict: "ALLOW", rule: RULES.delayOver3h,
          explanation: "Delay exceeds 3 hours — lounge access applies.",
        };
      return {
        action, verdict: "DENY", rule: RULES.delayOver3h,
        explanation: "Lounge access requires a delay of more than 3 hours.",
      };

    case "hotel": {
      const qualifies = s.kind === "delayed" && s.hours > 5;
      if (!qualifies)
        return {
          action, verdict: "DENY", rule: RULES.delayOver5h,
          explanation: "Hotel accommodation requires a delay of more than 5 hours.",
        };
      if (action.fullNight)
        return {
          action, verdict: "DENY", rule: RULES.delayOver5h,
          explanation: "Hotel covers only the delayed hours, not a full night's stay.",
        };
      return {
        action, verdict: "ALLOW", rule: RULES.delayOver5h,
        explanation: "Delay exceeds 5 hours — hotel for the delayed hours is covered.",
      };
    }

    case "voluntary_rebook_higher_fare":
      if (action.fareDifference > FARE_DIFF_AGENT_CAP)
        return {
          action, verdict: "ESCALATE", rule: RULES.fareDifference,
          explanation: `Voluntary change to a higher-fare flight. The ₹${action.fareDifference} fare difference exceeds the ₹${FARE_DIFF_AGENT_CAP} agent cap and needs supervisor approval.`,
        };
      return {
        action, verdict: "ALLOW", rule: RULES.fareDifference,
        explanation: `Voluntary higher-fare change — you'd pay the ₹${action.fareDifference} fare difference, which is within the agent limit.`,
      };

    case "class_upgrade":
      return {
        action, verdict: "DENY", rule: RULES.loyaltyTier,
        explanation: "A free class upgrade is compensation beyond policy. Loyalty tier grants priority rebooking, not extra compensation.",
      };

    case "info":
      return {
        action, verdict: "ALLOW", rule: "Provide the customer's own booking and flight status information.",
        explanation: "Sharing your booking and flight status.",
      };

    case "unknown":
      // Unknown intent is handled as missing information in evaluate(). It must
      // never be silently treated as an information request or as an escalation.
      return {
        action, verdict: "DENY", rule: "A clear customer request is required before applying policy.",
        explanation: "I need to understand what help you want before I can apply the correct policy.",
      };

    default:
      return {
        action, verdict: "ESCALATE", rule: "Unrecognised request.",
        explanation: "I couldn't map this to a policy — routing to a human specialist.",
      };
  }
}

export function evaluate(proposal: AgentProposal): Decision {
  const booking = proposal.pnr ? primaryBooking(proposal.pnr) : undefined;
  const customer = proposal.pnr ? CUSTOMERS[proposal.pnr] : undefined;

  if (!booking || !customer) {
    return {
      entitlements: [], items: [], escalate: false, escalationReasons: [],
      missingInfo: ["I need a valid booking reference (PNR) to look up your flight."],
    };
  }

  const hasUnknownRequest = proposal.requestedActions.some((a) => a.type === "unknown");
  const items = proposal.requestedActions
    .filter((a) => a.type !== "unknown")
    .map((a) => decideAction(a, booking));
  const escalationReasons: string[] = [];

  // Prohibited: legal threats / formal complaints must escalate immediately.
  if (proposal.legalThreat) {
    escalationReasons.push(
      "Formal complaint / legal action mentioned — escalated immediately per policy.",
    );
  }
  for (const it of items) {
    if (it.verdict === "ESCALATE") escalationReasons.push(it.explanation);
  }

  // For a cancellation, the customer must choose rebook vs refund if they haven't.
  const missingInfo: string[] = [];
  if (hasUnknownRequest) {
    missingInfo.push(
      "What would you like help with — your flight status, rebooking, a refund, or disruption support?",
    );
  } else if (booking.status.kind === "cancelled") {
    const chose = proposal.requestedActions.some(
      (a) => a.type === "rebook_next_available" || a.type === "refund" || a.type === "refund_cash_other_method",
    );
    if (!chose)
      missingInfo.push("Would you prefer a free rebooking on the next flight within 24h, or a full refund?");
  }

  return {
    booking,
    customer,
    entitlements: baseEntitlements(booking),
    items,
    escalate: escalationReasons.length > 0,
    escalationReasons,
    missingInfo,
  };
}
