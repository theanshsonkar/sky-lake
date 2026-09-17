import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { primaryBooking, RULES } from "../src/lib/core/data";
import { evaluate } from "../src/lib/core/policy-engine";
import type { AgentProposal, RequestedAction } from "../src/lib/core/types";
import { DeterministicReasoner } from "../src/lib/reasoner";
import { composeReply } from "../src/lib/reply";

function proposal(pnr: string, requestedActions: RequestedAction[], legalThreat = false): AgentProposal {
  return { pnr, requestedActions, legalThreat, sentiment: "calm" };
}

describe("the three supplied disruption scenarios", () => {
  it("offers Priya cancellation choices while guarding refund method, upgrades, and legal threats", () => {
    const choice = evaluate(proposal("SK4821X", [{ type: "info" }]));
    assert.deepEqual(choice.entitlements, [
      "Free rebooking on the next available flight within 24 hours, OR a full refund — your choice.",
    ]);
    assert.match(choice.missingInfo[0], /rebooking.*refund/i);

    const guarded = evaluate(proposal("SK4821X", [
      { type: "refund_cash_other_method" },
      { type: "class_upgrade", free: true },
    ], true));
    assert.equal(guarded.items[0].verdict, "ESCALATE");
    assert.equal(guarded.items[0].rule, RULES.refundProcessing);
    assert.equal(guarded.items[1].verdict, "DENY");
    assert.equal(guarded.items[1].rule, RULES.loyaltyTier);
    assert.equal(guarded.escalate, true);
    assert.match(guarded.escalationReasons.join(" "), /legal action/i);

    const forgedDifferentMethod = evaluate(proposal("SK4821X", [
      { type: "refund", toOriginalMethod: false },
    ]));
    assert.equal(forgedDifferentMethod.items[0].verdict, "ESCALATE");
    assert.equal(forgedDifferentMethod.items[0].rule, RULES.refundProcessing);
  });

  it("grants Arvind meal and lounge at four hours, but denies a hotel", () => {
    const decision = evaluate(proposal("TR1190B", [{ type: "hotel", fullNight: false }]));
    assert.deepEqual(decision.entitlements, ["Meal voucher + lounge access."]);
    assert.equal(decision.items[0].verdict, "DENY");
    assert.equal(decision.items[0].rule, RULES.delayOver5h);
  });

  it("applies the literal six-hour tier: meal plus hotel, with no lounge", () => {
    const decision = evaluate(proposal("WL7742", [
      { type: "lounge_access" },
      { type: "hotel", fullNight: true },
      { type: "voluntary_rebook_higher_fare", fareDifference: 2_000 },
    ]));

    assert.deepEqual(decision.entitlements, [
      "Meal voucher + hotel accommodation for the delayed hours only (not a full night).",
    ]);
    assert.equal(decision.items[0].verdict, "DENY");
    assert.equal(decision.items[0].rule, RULES.delayOver5h);
    assert.match(decision.items[0].explanation, /does not include lounge/i);
    assert.equal(decision.items[1].verdict, "DENY");
    assert.equal(decision.items[2].verdict, "ESCALATE");
    assert.equal(decision.escalate, true);

    const meal = evaluate(proposal("WL7742", [{ type: "meal_voucher" }]));
    assert.equal(meal.items[0].verdict, "ALLOW");
    assert.equal(meal.items[0].rule, RULES.delayOver5h);
  });
});

describe("intent and policy guardrails", () => {
  const reasoner = new DeterministicReasoner();

  it("asks a necessary question for an ambiguous request instead of pretending it is info", () => {
    const parsed = reasoner.parse("Hello, can you help me?", "TR1190B");
    assert.deepEqual(parsed.requestedActions, [{ type: "unknown" }]);

    const decision = evaluate(parsed);
    assert.deepEqual(decision.items, []);
    assert.equal(decision.escalate, false);
    assert.equal(decision.missingInfo.length, 1);
    assert.match(decision.missingInfo[0], /what would you like help with/i);
    assert.match(composeReply(parsed, decision), /what would you like help with/i);
  });

  it("still recognizes an explicit flight-status question as information", () => {
    const parsed = reasoner.parse("What is the status of my flight?", "TR1190B");
    assert.deepEqual(parsed.requestedActions, [{ type: "info" }]);
  });

  it("treats a concrete disruption report as an inquiry, not an ambiguous greeting", () => {
    const parsed = reasoner.parse(
      "Flight SK-305 Delhi to Hyderabad (WL7742) is delayed 6 hours. This is unacceptable.",
    );
    assert.deepEqual(parsed.requestedActions, [{ type: "info" }]);
  });

  it("requires a valid PNR before returning customer data", () => {
    const decision = evaluate(proposal("NOTREAL", [{ type: "info" }]));
    assert.equal(decision.booking, undefined);
    assert.equal(decision.customer, undefined);
    assert.match(decision.missingInfo[0], /valid booking reference/i);
  });

  it("enforces the fare authority boundary at ₹1,500", () => {
    const atCap = evaluate(proposal("WL7742", [
      { type: "voluntary_rebook_higher_fare", fareDifference: 1_500 },
    ]));
    const overCap = evaluate(proposal("WL7742", [
      { type: "voluntary_rebook_higher_fare", fareDifference: 1_501 },
    ]));
    assert.equal(atCap.items[0].verdict, "ALLOW");
    assert.equal(overCap.items[0].verdict, "ESCALATE");
  });

  it("keeps Priya's unaffected return leg out of the disrupted-booking decision path", () => {
    const booking = primaryBooking("SK4821X");
    assert.equal(booking?.flight, "SK-204");
    assert.equal(booking?.status.kind, "cancelled");
  });
});
