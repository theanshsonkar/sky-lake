// Turns a Decision into the customer-facing reply: empathetic in tone, firm on
// policy. Deterministic and template-based so the wording is reproducible.
import type { AgentProposal, Decision } from "./core/types";

function empathy(sentiment: AgentProposal["sentiment"]): string {
  switch (sentiment) {
    case "angry":
      return "I completely understand how frustrating this is, and I'm sorry for the disruption.";
    case "frustrated":
      return "I'm sorry this has thrown off your plans — let me sort out what I can for you.";
    default:
      return "Thanks for reaching out — let me pull up your booking.";
  }
}

export function composeReply(proposal: AgentProposal, decision: Decision): string {
  if (!decision.booking || !decision.customer) {
    return "I couldn't find a booking for that reference. Could you share your PNR so I can look it up?";
  }

  const lines: string[] = [empathy(proposal.sentiment)];
  const b = decision.booking;
  const c = decision.customer;

  // Ground the customer in what actually happened.
  if (b.status.kind === "cancelled") {
    lines.push(`I can see flight ${b.flight} (${b.route}) is cancelled due to ${b.status.reason}.`);
  } else if (b.status.kind === "delayed") {
    lines.push(`I can see flight ${b.flight} (${b.route}) is delayed ${b.status.hours} hours, now departing ${b.status.newDeparture}.`);
  }

  // What policy grants, unprompted.
  if (decision.entitlements.length) {
    lines.push("Here's what you're entitled to: " + decision.entitlements.join(" "));
  }

  // Per-request verdicts.
  const allowed = decision.items.filter((i) => i.verdict === "ALLOW" && i.action.type !== "info");
  const denied = decision.items.filter((i) => i.verdict === "DENY");
  const escalated = decision.items.filter((i) => i.verdict === "ESCALATE");

  for (const a of allowed) lines.push("✓ " + a.explanation);
  for (const d of denied) lines.push("I'm not able to do that — " + d.explanation);

  // Escalations (per-item + legal threat).
  if (decision.escalate) {
    if (proposal.legalThreat) {
      lines.push("Because you've mentioned a formal complaint, I'm escalating this to our specialist support team right now so it gets the right attention.");
    }
    for (const e of escalated) lines.push("This needs a human colleague: " + e.explanation);
  }

  // Priority note for Gold/Platinum on a rebook.
  if ((c.tier === "Gold" || c.tier === "Platinum") &&
      decision.items.some((i) => i.action.type === "rebook_next_available" && i.verdict === "ALLOW")) {
    lines.push(`As a ${c.tier} member you get priority access to the next-available seats.`);
  }

  // Ask only what's still needed.
  for (const q of decision.missingInfo) lines.push(q);

  return lines.join("\n");
}
