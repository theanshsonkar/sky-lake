// The three exercise scenarios (Section 6), as one-click demo seeds.
// `suggestions` power clickable quick-reply chips so the whole judgment demo can
// be walked without typing — great for the reviewer and the demo video.
export interface Scenario {
  id: 1 | 2 | 3;
  pnr: string;
  customer: string;
  tier: string;
  situation: string;   // one-line status for the card
  headline: string;
  opening: string;     // first customer message
  suggestions: string[]; // clickable follow-ups (the over-asks live here)
  traps: string[];     // what a correct agent must get right (for the defence)
}

export const SCENARIOS: Scenario[] = [
  {
    id: 1,
    pnr: "SK4821X",
    customer: "Priya Nair",
    tier: "Gold",
    situation: "Flight to Goa cancelled",
    headline: "Cancelled flight, furious customer wanting cash + free upgrade",
    opening:
      "Hi, my flight SK-204 to Goa this evening (ref SK4821X) is showing as cancelled. What are my options?",
    suggestions: [
      "Rebook me on the next available flight.",
      "Actually, I'd rather have a full refund.",
      "I'm furious — I want a full cash refund AND a free business-class upgrade for the trouble.",
      "This is unacceptable, I'll file a formal complaint and take legal action.",
    ],
    traps: [
      "Offer rebook-in-24h OR full refund (her choice)",
      "Refund only to original method — cash-to-other-method is out of policy",
      "Free upgrade = comp beyond policy → refuse; Gold = priority seat, no extra comp",
      "If she threatens a formal complaint / legal action → escalate immediately",
      "Do not touch her unaffected return leg",
    ],
  },
  {
    id: 2,
    pnr: "TR1190B",
    customer: "Arvind Kulkarni",
    tier: "Silver",
    situation: "Flight to Bengaluru delayed 4h",
    headline: "4-hour delay, asking for a hotel he doesn't qualify for",
    opening:
      "My flight SK-118 Mumbai to Bengaluru (TR1190B) is delayed 4 hours and I'm missing a meeting. What can you do?",
    suggestions: [
      "Since it's been such a long delay, I'd like a hotel to rest in.",
      "Okay, I'll take the meal voucher and lounge access.",
    ],
    traps: [
      "4h delay → meal voucher + lounge access",
      "Hotel needs >5h → does not qualify → decline politely",
      "Deliver exactly what he's owed, no more",
    ],
  },
  {
    id: 3,
    pnr: "WL7742",
    customer: "Meher Kaur",
    tier: "Platinum",
    situation: "Flight to Hyderabad delayed 6h",
    headline: "6-hour delay, wants a full night + a higher-fare flight (₹2,000 diff)",
    opening:
      "Flight SK-305 Delhi to Hyderabad (WL7742) is delayed 6 hours. This is unacceptable.",
    suggestions: [
      "I want a full night's hotel stay, and move me onto the earlier higher-fare flight — the difference is about ₹2,000.",
      "Just give me what I'm actually entitled to.",
    ],
    traps: [
      ">5h delay → meal + hotel for delayed hours only (not a full night)",
      "Higher-fare flight is a voluntary change → customer pays the difference",
      "₹2,000 > ₹1,500 cap → needs supervisor approval → escalate that piece",
      "Platinum = priority rebooking, no extra comp",
    ],
  },
];
