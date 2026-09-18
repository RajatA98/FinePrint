import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { setLesson, quote } from "../src/lesson.js";
import { deterministicNote } from "../src/coach/deterministic.js";

const FIXTURE = JSON.parse(
  readFileSync(new URL("./fixtures/lesson.mini.json", import.meta.url), "utf8")
);

function useFixture() {
  setLesson(structuredClone(FIXTURE));
}

function payloadWith(patch) {
  return {
    lessonId: "mini",
    verdict: "review",
    score: { correct: 1, total: 2 },
    missed: [],
    clusters: {},
    pace: { overallWpm: 0, shownNotGraded: true },
    evidenceReview: 0,
    nudgesUsed: 0,
    ...patch
  };
}

function wordCount(text) {
  return (String(text).match(/\S+/g) ?? []).length;
}

test("the weakest cluster picks the note", () => {
  useFixture();
  const note = deterministicNote(
    payloadWith({
      missed: [{ challengeId: "c1-search", skill: "detail", excerpt: 1, position: "early" }],
      clusters: { vocabulary: { correct: 1, total: 2 }, detail: { correct: 0, total: 1 } }
    })
  );
  assert.deepEqual(note, { source: "fallback-deterministic", message: quote("s-coach-detail") });
});

test("the weakest cluster is the lowest ratio, not the most misses", () => {
  useFixture();
  const note = deterministicNote(
    payloadWith({
      missed: [
        { challengeId: "c1-lock-apply", skill: "vocabulary", excerpt: 1, position: "early" },
        { challengeId: "c1-lock-define", skill: "vocabulary", excerpt: 1, position: "early" },
        { challengeId: "c1-cite", skill: "evidence", excerpt: 1, position: "late" }
      ],
      clusters: {
        vocabulary: { correct: 2, total: 4 },
        evidence: { correct: 0, total: 1 }
      }
    })
  );
  assert.equal(note.message, quote("s-coach-evidence"));
});

test("a tie is broken in a fixed order, so the same run always reads the same", () => {
  useFixture();
  const payload = payloadWith({
    missed: [
      { challengeId: "c1-lock-apply", skill: "vocabulary", excerpt: 1, position: "early" },
      { challengeId: "c1-search", skill: "detail", excerpt: 1, position: "early" }
    ],
    clusters: { detail: { correct: 0, total: 1 }, vocabulary: { correct: 0, total: 1 } }
  });
  assert.equal(deterministicNote(payload).message, quote("s-coach-vocab"));
  assert.equal(deterministicNote(payload).message, deterministicNote(payload).message);
});

test("nothing missed reads as a clean run", () => {
  useFixture();
  const note = deterministicNote(
    payloadWith({
      missed: [],
      clusters: { vocabulary: { correct: 2, total: 2 }, detail: { correct: 1, total: 1 } }
    })
  );
  assert.deepEqual(note, { source: "fallback-deterministic", message: quote("s-coach-clean") });
});

test("a miss with no cluster behind it falls back to the generic note", () => {
  useFixture();
  const note = deterministicNote(
    payloadWith({
      missed: [{ challengeId: "finale-reconstruct", skill: null, excerpt: 0, position: "late" }],
      clusters: {}
    })
  );
  assert.deepEqual(note, { source: "fallback-generic", message: quote("s-coach-generic") });
});

test("empty clusters are ignored when the weakest is chosen", () => {
  useFixture();
  const note = deterministicNote(
    payloadWith({
      missed: [{ challengeId: "c1-search", skill: "detail", excerpt: 1, position: "early" }],
      clusters: { inference: { correct: 0, total: 0 }, detail: { correct: 1, total: 2 } }
    })
  );
  assert.equal(note.message, quote("s-coach-detail"));
});

test("every note the lesson can produce is ninety words or fewer", () => {
  useFixture();
  const cases = [
    payloadWith({ missed: [], clusters: { detail: { correct: 1, total: 1 } } }),
    payloadWith({
      missed: [{ challengeId: "c1-search", skill: "detail", excerpt: 1, position: "early" }],
      clusters: { detail: { correct: 0, total: 1 } }
    }),
    payloadWith({
      missed: [{ challengeId: "c1-lock-apply", skill: "vocabulary", excerpt: 1, position: "early" }],
      clusters: { vocabulary: { correct: 0, total: 1 } }
    }),
    payloadWith({
      missed: [{ challengeId: "c1-cite", skill: "evidence", excerpt: 1, position: "late" }],
      clusters: { evidence: { correct: 0, total: 1 } }
    }),
    payloadWith({
      missed: [{ challengeId: "x", skill: "inference", excerpt: 1, position: "middle" }],
      clusters: { inference: { correct: 0, total: 1 } }
    }),
    payloadWith({ missed: [{ challengeId: "finale-reconstruct", skill: null }], clusters: {} })
  ];
  for (const payload of cases) {
    const note = deterministicNote(payload);
    assert.equal(typeof note.message, "string");
    assert.ok(note.message.length > 0);
    assert.ok(wordCount(note.message) <= 90, `note too long: ${note.message}`);
  }
});
