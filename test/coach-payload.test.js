import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { createReducer, initialState } from "../src/state/reducer.js";
import { buildCoachPayload } from "../src/coach/payload.js";

const FIXTURE = JSON.parse(
  readFileSync(new URL("./fixtures/lesson.mini.json", import.meta.url), "utf8")
);

function lessonCopy() {
  return structuredClone(FIXTURE);
}

/** Drive the real reducer so the payload is built from a state the app can reach. */
function play(lesson, actions) {
  const reducer = createReducer(lesson);
  let state = initialState();
  for (const action of actions) {
    state = reducer(state, action);
  }
  return state;
}

function attempt(challengeId, choiceIds, at) {
  return { type: "SUBMIT_ATTEMPT", challengeId, choiceIds, at };
}

function normalize(text) {
  return String(text).replace(/\s+/g, " ").trim().toLowerCase();
}

function windows(text, size) {
  const out = new Set();
  for (let i = 0; i + size <= text.length; i += 1) {
    out.add(text.slice(i, i + size));
  }
  return out;
}

test("the payload carries performance data and no story text", () => {
  const lesson = lessonCopy();
  const state = play(lesson, [
    { type: "START_CASE", at: 1000 },
    { type: "READ_START", excerptId: "ex1", at: 1000 },
    { type: "READ_END", excerptId: "ex1", at: 61000 },
    attempt("c1-lock-apply", ["a"], 62000),
    attempt("c1-lock-define", ["a"], 63000),
    attempt("c1-search", ["o-lamp", "o-key"], 64000),
    attempt("c1-cite", ["L5"], 65000),
    { type: "NUDGE", challengeId: "c1-cite" },
    { type: "FINALE_CULPRIT", personId: "cora" },
    { type: "FINALE_CLUE", clueId: "k1" },
    { type: "FINALE_SUBMIT", at: 70000 }
  ]);

  const payload = buildCoachPayload(state, lesson);

  assert.equal(payload.lessonId, "mini");
  assert.equal(payload.verdict, "reopened");
  assert.deepEqual(payload.score, { correct: 2, total: 5 });
  assert.equal(payload.pace.shownNotGraded, true);
  assert.equal(typeof payload.pace.overallWpm, "number");
  assert.equal(payload.nudgesUsed, 1);
  assert.equal(payload.evidenceReview, 1);
  assert.deepEqual(payload.clusters, {
    vocabulary: { correct: 1, total: 2 },
    detail: { correct: 1, total: 1 },
    evidence: { correct: 0, total: 1 }
  });

  const story = windows(normalize(lesson.lines.join(" ")), 13);
  const serialized = normalize(JSON.stringify(payload));
  for (const chunk of windows(serialized, 13)) {
    assert.equal(story.has(chunk), false, `payload contains story text: ${chunk}`);
  }
});

test("missed items name the skill, the excerpt and where the evidence sits", () => {
  const lesson = lessonCopy();
  // ex1 is lines 1..6: first third 1-2, middle third 3-4, last third 5-6.
  lesson.challenges["c1-lock-apply"].evidence = 1;
  lesson.challenges["c1-lock-define"].evidence = 4;
  lesson.challenges["c1-search"].evidence = 6;

  const state = play(lesson, [
    { type: "START_CASE", at: 1 },
    attempt("c1-lock-apply", ["b"], 2),
    attempt("c1-lock-define", ["c"], 3),
    attempt("c1-search", ["o-ledger", "o-glove"], 4),
    attempt("c1-cite", ["L4"], 5)
  ]);

  const payload = buildCoachPayload(state, lesson);

  assert.deepEqual(payload.missed, [
    { challengeId: "c1-lock-apply", skill: "vocabulary", excerpt: 1, position: "early" },
    { challengeId: "c1-lock-define", skill: "vocabulary", excerpt: 1, position: "middle" },
    { challengeId: "c1-search", skill: "detail", excerpt: 1, position: "late" }
  ]);
});

test("a second excerpt reports its own number", () => {
  const lesson = lessonCopy();
  lesson.challenges["c2-search"].evidence = 12;
  const state = play(lesson, [
    { type: "START_CASE", at: 1 },
    attempt("c2-search", ["o-lamp", "o-key"], 2)
  ]);
  assert.deepEqual(buildCoachPayload(state, lesson).missed, [
    { challengeId: "c2-search", skill: "detail", excerpt: 2, position: "late" }
  ]);
});

test("only first attempts count as missed, and the finale items are not listed", () => {
  const lesson = lessonCopy();
  const state = play(lesson, [
    { type: "START_CASE", at: 1 },
    attempt("c1-lock-apply", ["b"], 2),
    attempt("c1-lock-apply", ["a"], 3),
    attempt("c1-search", ["o-lamp", "o-key"], 4),
    { type: "FINALE_SUBMIT", at: 5 },
    { type: "STATEMENT_SUBMIT", at: 6 }
  ]);

  const payload = buildCoachPayload(state, lesson);
  assert.deepEqual(payload.missed.map((item) => item.challengeId), ["c1-lock-apply"]);
  assert.deepEqual(payload.score, { correct: 1, total: 4 });
});

test("a run with nothing missed reports an empty list", () => {
  const lesson = lessonCopy();
  const state = play(lesson, [
    { type: "START_CASE", at: 1 },
    attempt("c1-lock-apply", ["a"], 2),
    attempt("c1-search", ["o-lamp", "o-key"], 3)
  ]);
  assert.deepEqual(buildCoachPayload(state, lesson).missed, []);
});
