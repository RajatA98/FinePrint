#!/usr/bin/env node
// Manual smoke test for the live coach. Not run by `npm test` or CI: it makes
// a real network call to Gemini and needs a real key. Run it yourself:
//
//   USE_LIVE_AI=1 GEMINI_API_KEY=... node scripts/coach_smoke.mjs
//
// It imports the handler in-process (no HTTP server) and injects nothing but
// environment variables, so the only thing between this script and Gemini is
// the handler's own fetch call.

import handler from "../api/coach.js";

const payload = {
  lessonId: "open-window",
  verdict: "review",
  score: { correct: 5, total: 8 },
  missed: [
    { challengeId: "c1-search", skill: "detail", excerpt: 1, position: "early" },
    { challengeId: "c2-cite", skill: "evidence", excerpt: 2, position: "late" }
  ],
  clusters: {
    vocabulary: { correct: 2, total: 2 },
    detail: { correct: 1, total: 2 },
    evidence: { correct: 1, total: 2 },
    inference: { correct: 1, total: 2 }
  },
  pace: { overallWpm: 195, shownNotGraded: true },
  evidenceReview: 1,
  nudgesUsed: 1
};

function fakeReq() {
  return { method: "POST", body: payload };
}

function fakeRes() {
  return {
    statusCode: null,
    body: null,
    setHeader() {},
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(value) {
      this.body = value;
      return this;
    }
  };
}

const req = fakeReq();
const res = fakeRes();

await handler(req, res);

console.log(`status: ${res.statusCode}`);
console.log(`source: ${res.body?.source}`);
console.log(`message: ${res.body?.message}`);
if (res.body?.debug) {
  console.log(`debug: ${JSON.stringify(res.body.debug)}`);
}

if (res.body?.source !== "live") {
  console.error("\nExpected source \"live\" — check USE_LIVE_AI and GEMINI_API_KEY are set to a working key.");
  process.exit(1);
}
