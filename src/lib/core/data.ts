// Data pack — Assignment 3, encoded verbatim from the supplied PDF.
// "Use only the material below as the source data. Do not invent information."
import type { Booking, Customer } from "./types";

// Exercise clock: the pack sets this on Wednesday, 23 September 2026.
export const NOW = new Date("2026-09-23T12:00:00+05:30");

export const CUSTOMERS: Record<string, Customer> = {
  SK4821X: {
    name: "Priya Nair",
    tier: "Gold",
    bookingRef: "SK4821X",
    contact: "priya.nair@example.com, +91-98xxxxxxx1",
    flightsLast12m: 6,
    priorComplaints: 1,
    priorComplaintNote: "delayed baggage, resolved with voucher",
  },
  TR1190B: {
    name: "Arvind Kulkarni",
    tier: "Silver",
    bookingRef: "TR1190B",
    contact: "arvind.kulkarni@example.com, +91-98xxxxxxx2",
    flightsLast12m: 3,
    priorComplaints: 0,
  },
  WL7742: {
    name: "Meher Kaur",
    tier: "Platinum",
    bookingRef: "WL7742",
    contact: "meher.kaur@example.com, +91-98xxxxxxx3",
    flightsLast12m: 10,
    priorComplaints: 1,
    priorComplaintNote: "overbooking, resolved with a tier-status upgrade",
  },
};

export const BOOKINGS: Booking[] = [
  {
    customer: "Priya Nair", pnr: "SK4821X", flight: "SK-204",
    route: "Delhi → Goa", date: "Wed 23 Sep 2026", scheduledDeparture: "18:40",
    status: { kind: "cancelled", reason: "operational reasons" },
  },
  {
    customer: "Priya Nair", pnr: "SK4821X", flight: "Return",
    route: "Goa → Delhi", date: "Fri 25 Sep 2026", scheduledDeparture: "16:20",
    status: { kind: "unaffected" },
  },
  {
    customer: "Arvind Kulkarni", pnr: "TR1190B", flight: "SK-118",
    route: "Mumbai → Bengaluru", date: "Wed 23 Sep 2026", scheduledDeparture: "07:10",
    status: { kind: "delayed", hours: 4, newDeparture: "11:10" },
  },
  {
    customer: "Meher Kaur", pnr: "WL7742", flight: "SK-305",
    route: "Delhi → Hyderabad", date: "Wed 23 Sep 2026", scheduledDeparture: "14:00",
    status: { kind: "delayed", hours: 6, newDeparture: "20:00" },
  },
];

// The primary disrupted booking per PNR (the return leg is a secondary, unaffected row).
export function primaryBooking(pnr: string): Booking | undefined {
  const rows = BOOKINGS.filter((b) => b.pnr === pnr);
  return rows.find((b) => b.status.kind !== "unaffected") ?? rows[0];
}

// Service Rules (Section 3) as constants the engine reasons over.
export const RULES = {
  cancellationRebook:
    "Cancellation Rebooking Rule: airline-cancelled flight → free rebooking on the next available flight within 24h, OR a full refund — customer's choice.",
  delayUnder3h: "Delay under 3 hours: ₹500 meal voucher.",
  delayOver3h: "Delay more than 3 hours: meal voucher + lounge access.",
  delayOver5h:
    "Delay more than 5 hours: meal voucher + hotel accommodation covering only the delayed hours (not a full night's stay).",
  refundProcessing:
    "Refund Processing Rule: airline-caused cancellation refunds are processed in full within 7 business days, to the original payment method only.",
  fareDifference:
    "Fare Difference Rule: a voluntary rebook onto a higher-fare flight requires the customer to pay the difference. Agents cannot waive fare differences above ₹1,500 without supervisor approval.",
  loyaltyTier:
    "Loyalty Tier Rule: Gold and Platinum get priority rebooking (first access to next-available seats) but no additional compensation beyond standard policy.",
} as const;

export const FARE_DIFF_AGENT_CAP = 1500; // ₹ — above this needs supervisor approval

// Section 4 — the authority boundary.
export const ALLOWED_ACTIONS = [
  "Rebook on the next available flight within 24h at no charge (airline-caused disruption)",
  "Issue meal vouchers and lounge access per the delay compensation rule",
  "Arrange hotel accommodation for the delayed-hours portion, where the delay qualifies",
  "Initiate a refund request for airline-caused cancellations (original payment method)",
  "Provide the customer's own booking and flight status information",
];

export const PROHIBITED_ACTIONS = [
  "Approving any compensation beyond the stated policy amounts",
  "Waiving a fare difference above ₹1,500",
  "Making exceptions for non-airline-caused disruptions",
  "Handling threats of legal action or formal complaints — escalate immediately",
  "Processing refunds to a different payment method than the original",
];
