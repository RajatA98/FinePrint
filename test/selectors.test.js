import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { initialState } from "../src/state/reducer.js";
import { score, verdict, clusters, pace } from "../src/state/selectors.js";

const lesson = JSON.parse(
  readFileSync(new URL("./fixtures/lesson.mini.json", import.meta.url), "utf8")
);

function stateWith(patch) {
  return { ...initialState(), ...patch };
}

function firstAttemptsFrom(results) {
  const firstAttempts = {};
  let at = 0;
  for (const [challengeId, correct] of Object.entries(results)) {
    at += 1;
    firstAttempts[challengeId] = { correct, at };
  }
  return firstAttempts;
}

const ALL_RIGHT = firstAttemptsFrom({
  "c1-lock-apply": true,
  "c1-lock-define": true,
  "c1-search": true,
  "c1-cite": true,
  "c2-lock-apply": true,
  "c2-lock-define": true,
  "c2-search": true,
  "c2-cite": true,
  "finale-reconstruct": true,
  "finale-statement": true
});

const SOLVED_FINALE = { ...initialState().finale, clues: ["k1", "k3", "k5", "k7"], culprit: "cora", solved: true };

// The fixture has eight scored challenges; the two finale items make ten.
const SCORED_ITEMS = 10;

const authoredLesson = JSON.parse(
  readFileSync(new URL("../public/lesson.open-window.json", import.meta.url), "utf8")
);

test("score is nothing out of the whole lesson before anything is attempted", () => {
  assert.deepEqual(score(initialState(), lesson), {
    correct: 0,
    total: SCORED_ITEMS,
    ratio: 0
  });
});

test("score counts first attempts only and ignores the attempt history", () => {
  const state = stateWith({
    firstAttempts: firstAttemptsFrom({ "c1-lock-apply": false, "c1-search": true }),
    attempts: [
      { challengeId: "c1-lock-apply", choiceIds: ["b"], correct: false, at: 1 },
      { challengeId: "c1-lock-apply", choiceIds: ["a"], correct: true, at: 2 },
      { challengeId: "c1-search", choiceIds: ["o-lamp", "o-key"], correct: true, at: 3 }
    ],
    solved: { "c1-lock-apply": true, "c1-search": true }
  });
  assert.deepEqual(score(state, lesson), { correct: 1, total: SCORED_ITEMS, ratio: 0.1 });
});

// The validator forbids `scored: false` in an authored lesson; the selector
// still honours it, so a lesson that ever drops an item cannot inflate a score.
test("the denominator is every scored item in the lesson, not what was attempted", () => {
  const unscored = structuredClone(lesson);
  unscored.challenges["c2-cite"].scored = false;
  const state = stateWith({ firstAttempts: firstAttemptsFrom({ "c1-lock-apply": true }) });
  assert.deepEqual(score(state, unscored), {
    correct: 1,
    total: SCORED_ITEMS - 1,
    ratio: 1 / (SCORED_ITEMS - 1)
  });
});

test("sealing and signing with nothing else attempted is two of forty-two, never master", () => {
  const proving = authoredLesson.finale.reconstruct.clues
    .filter((clue) => clue.proving)
    .map((clue) => clue.id);
  const state = stateWith({
    firstAttempts: firstAttemptsFrom({ "finale-reconstruct": true, "finale-statement": true }),
    finale: {
      ...initialState().finale,
      clues: proving,
      culprit: authoredLesson.finale.reconstruct.culprit.answer,
      solved: true
    }
  });
  const counts = score(state, authoredLesson);
  assert.equal(counts.correct, 2);
  assert.equal(counts.total, 42);
  assert.notEqual(verdict(state, authoredLesson), "master");
  assert.equal(verdict(state, authoredLesson), "review");
});

test("verdict is reopened whenever the finale is unsolved, however good the score", () => {
  assert.equal(verdict(stateWith({ firstAttempts: ALL_RIGHT }), lesson), "reopened");
});

test("verdict is master on a solved finale with every proving clue and a high ratio", () => {
  const state = stateWith({ firstAttempts: ALL_RIGHT, finale: SOLVED_FINALE });
  assert.equal(verdict(state, lesson), "master");
});

test("verdict is closed when the ratio is good but not master-high", () => {
  const state = stateWith({
    firstAttempts: firstAttemptsFrom({
      "c1-lock-apply": true,
      "c1-lock-define": true,
      "c1-search": true,
      "c1-cite": false,
      "c2-lock-apply": true,
      "c2-lock-define": true,
      "c2-search": true,
      "c2-cite": false,
      "finale-reconstruct": true,
      "finale-statement": true
    }),
    finale: SOLVED_FINALE
  });
  assert.equal(verdict(state, lesson), "closed");
});

test("verdict is closed, not master, when a proving clue is missing", () => {
  const state = stateWith({
    firstAttempts: ALL_RIGHT,
    finale: { ...SOLVED_FINALE, clues: ["k1", "k3", "k5"] }
  });
  assert.equal(verdict(state, lesson), "closed");
});

test("verdict is review when the finale is solved but the ratio is low", () => {
  const state = stateWith({
    firstAttempts: firstAttemptsFrom({
      "c1-lock-apply": true,
      "c1-lock-define": false,
      "c1-search": true,
      "c1-cite": false
    }),
    finale: SOLVED_FINALE
  });
  assert.equal(verdict(state, lesson), "review");
});

test("clusters group first attempts by skill and skip items outside the lesson", () => {
  const state = stateWith({
    firstAttempts: firstAttemptsFrom({
      "c1-lock-apply": true,
      "c1-lock-define": false,
      "c1-search": true,
      "c2-search": true,
      "c1-cite": false,
      "finale-reconstruct": true
    })
  });
  assert.deepEqual(clusters(state, lesson), {
    vocabulary: { correct: 1, total: 2 },
    detail: { correct: 2, total: 2 },
    evidence: { correct: 0, total: 1 }
  });
});

test("clusters are empty before anything is attempted", () => {
  assert.deepEqual(clusters(initialState(), lesson), {});
});

test("pace reports words per minute per excerpt and overall", () => {
  const state = stateWith({
    reading: {
      ex1: { startedAt: 1000, endedAt: 61000 },
      ex2: { startedAt: 100000, endedAt: 130000 }
    }
  });
  assert.deepEqual(pace(state, lesson), {
    perExcerpt: [
      { excerptId: "ex1", wpm: 60 },
      { excerptId: "ex2", wpm: 120 }
    ],
    overallWpm: 80
  });
});

test("pace omits excerpts without both timestamps", () => {
  const state = stateWith({
    reading: {
      ex1: { startedAt: 1000, endedAt: 61000 },
      ex2: { startedAt: 100000, endedAt: 0 }
    }
  });
  assert.deepEqual(pace(state, lesson), {
    perExcerpt: [{ excerptId: "ex1", wpm: 60 }],
    overallWpm: 60
  });
});

test("pace omits an excerpt that recorded no elapsed time instead of dividing by zero", () => {
  const state = stateWith({ reading: { ex1: { startedAt: 500, endedAt: 500 } } });
  assert.deepEqual(pace(state, lesson), { perExcerpt: [], overallWpm: 0 });
});

test("pace on a fresh state is empty", () => {
  assert.deepEqual(pace(initialState(), lesson), { perExcerpt: [], overallWpm: 0 });
});
