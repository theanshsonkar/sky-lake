import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { NextRequest } from "next/server";

import { POST, parseChatRequestBody } from "../src/app/api/chat/route";

describe("chat request validation", () => {
  it("normalizes a safe request body", () => {
    assert.deepEqual(parseChatRequestBody({
      message: "  What is my flight status?  ",
      pnr: " tr1190b ",
      turn: 2,
    }), {
      ok: true,
      data: { message: "What is my flight status?", pnr: "TR1190B", turn: 2 },
    });
  });

  it("rejects non-object, invalid field types, empty/oversized messages, and invalid turns", () => {
    const invalidBodies: unknown[] = [
      null,
      [],
      { message: 42 },
      { message: "   " },
      { message: "x".repeat(4_001) },
      { message: "hello", pnr: { value: "TR1190B" } },
      { message: "hello", turn: -1 },
      { message: "hello", turn: 1.5 },
    ];

    for (const body of invalidBodies) {
      assert.equal(parseChatRequestBody(body).ok, false);
    }
  });

  it("returns 400 for malformed JSON instead of leaking an exception", async () => {
    const request = new NextRequest("http://localhost/api/chat", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "{not json",
    });
    const response = await POST(request);
    assert.equal(response.status, 400);
    assert.deepEqual(await response.json(), { error: "request body must be valid JSON" });
  });

  it("returns 400 for a structurally invalid JSON body", async () => {
    const request = new NextRequest("http://localhost/api/chat", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ message: "hello", pnr: 123 }),
    });
    const response = await POST(request);
    assert.equal(response.status, 400);
    assert.deepEqual(await response.json(), { error: "pnr must be a string" });
  });
});
