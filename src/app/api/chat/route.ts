import { NextRequest, NextResponse } from "next/server";
import { reasoner } from "@/lib/reasoner";
import { evaluate } from "@/lib/core/policy-engine";
import { composeReply } from "@/lib/reply";
import { buildLedgerEntry } from "@/lib/core/audit";

const MAX_MESSAGE_LENGTH = 4_000;
const MAX_PNR_LENGTH = 32;

type ChatRequestBody = {
  message: string;
  pnr?: string;
  turn: number;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function parseChatRequestBody(value: unknown):
  | { ok: true; data: ChatRequestBody }
  | { ok: false; error: string } {
  if (!isRecord(value)) {
    return { ok: false, error: "request body must be a JSON object" };
  }

  if (typeof value.message !== "string") {
    return { ok: false, error: "message must be a string" };
  }

  const message = value.message.trim();
  if (!message) return { ok: false, error: "message is required" };
  if (message.length > MAX_MESSAGE_LENGTH) {
    return { ok: false, error: `message must be at most ${MAX_MESSAGE_LENGTH} characters` };
  }

  let pnr: string | undefined;
  if (value.pnr !== undefined && value.pnr !== null) {
    if (typeof value.pnr !== "string") {
      return { ok: false, error: "pnr must be a string" };
    }
    pnr = value.pnr.trim().toUpperCase();
    if (!pnr || pnr.length > MAX_PNR_LENGTH) {
      return { ok: false, error: `pnr must be between 1 and ${MAX_PNR_LENGTH} characters` };
    }
  }

  const turn = value.turn === undefined ? 0 : value.turn;
  if (typeof turn !== "number" || !Number.isSafeInteger(turn) || turn < 0) {
    return { ok: false, error: "turn must be a non-negative integer" };
  }

  return { ok: true, data: { message, pnr, turn } };
}

// Stateless resolution endpoint: message + known PNR + turn index in,
// full decision trace out. No API key required — the reasoner is deterministic.
export async function POST(req: NextRequest) {
  let rawBody: unknown;
  try {
    rawBody = await req.json();
  } catch {
    return NextResponse.json({ error: "request body must be valid JSON" }, { status: 400 });
  }

  const parsed = parseChatRequestBody(rawBody);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  try {
    const { message, pnr, turn } = parsed.data;

    const proposal = reasoner.parse(message, pnr);
    const decision = evaluate(proposal);
    const reply = composeReply(proposal, decision);
    const ledgerEntry = buildLedgerEntry({
      turn,
      customerMessage: message,
      sentiment: proposal.sentiment,
      legalThreat: proposal.legalThreat,
      decision,
      agentReply: reply,
    });

    return NextResponse.json({ proposal, decision, reply, ledgerEntry });
  } catch {
    return NextResponse.json(
      { error: "unexpected error" },
      { status: 500 },
    );
  }
}
