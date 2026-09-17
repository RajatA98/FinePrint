import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { initialState, createReducer } from "../src/state/reducer.js";
import { createStore } from "../src/state/store.js";
import { score } from "../src/state/selectors.js";

const lesson = JSON.parse(
  readFileSync(new URL("./fixtures/lesson.mini.json", import.meta.url), "utf8")
);
const reduce = createReducer(lesson);

function run(actions, start = initialState()) {
  return actions.reduce((state, action) => reduce(state, action), start);
}

function mapStorage(seed = new Map()) {
  return {
    getItem: (key) => (seed.has(key) ? seed.get(key) : null),
    setItem: (key, value) => {
      seed.set(key, value);
    }
  };
}

const RIGHT = { type: "SUBMIT_ATTEMPT", challengeId: "c1-lock-apply", choiceIds: ["a"], at: 10 };
const WRONG = { type: "SUBMIT_ATTEMPT", challengeId: "c1-lock-apply", choiceIds: ["b"], at: 20 };

test("initialState matches the contract's shape", () => {
  assert.deepEqual(initialState(), {
    version: 1,
    lessonId: null,
    startedAt: 0,
    finishedAt: 0,
    route: { screen: "study", excerpt: 1 },
    reading: {},
    firstAttempts: {},
    attempts: [],
    solved: {},
    struck: {},
    nudges: { used: 0, max: 2, by: {} },
    cited: {},
    evidenceReview: 0,
    finale: { people: {}, clues: [], culprit: null, statement: {}, solved: false },
    coach: { source: null, message: null }
  });
});

test("an unknown action returns the very same state object", () => {
  const state = initialState();
  assert.equal(reduce(state, { type: "NOT_AN_ACTION" }), state);
});

test("START_CASE stamps the lesson, sets startedAt once, and opens vocabulary 1", () => {
  const once = reduce(initialState(), { type: "START_CASE", at: 111 });
  assert.equal(once.lessonId, "mini");
  assert.equal(once.startedAt, 111);
  assert.deepEqual(once.route, { screen: "vocabulary", excerpt: 1 });

  const twice = reduce(once, { type: "START_CASE", at: 999 });
  assert.equal(twice.startedAt, 111, "a second START_CASE does not restart the clock");
});

test("NAVIGATE sets the route only, and keeps the excerpt when none is given", () => {
  const state = run([
    { type: "START_CASE", at: 1 },
    { type: "NAVIGATE", screen: "read", excerpt: 2 }
  ]);
  assert.deepEqual(state.route, { screen: "read", excerpt: 2 });

  const report = reduce(state, { type: "NAVIGATE", screen: "report" });
  assert.deepEqual(report.route, { screen: "report", excerpt: 2 });
  assert.equal(report.startedAt, state.startedAt);
  assert.deepEqual(report.firstAttempts, state.firstAttempts);
});

test("READ_START and READ_END are set once; re-entry does not reset them", () => {
  const state = run([
    { type: "READ_START", excerptId: "ex1", at: 100 },
    { type: "READ_START", excerptId: "ex1", at: 500 },
    { type: "READ_END", excerptId: "ex1", at: 900 },
    { type: "READ_END", excerptId: "ex1", at: 1500 }
  ]);
  assert.deepEqual(state.reading.ex1, { startedAt: 100, endedAt: 900 });
});

test("READ_END before READ_START still records the end", () => {
  const state = reduce(initialState(), { type: "READ_END", excerptId: "ex2", at: 7 });
  assert.deepEqual(state.reading.ex2, { startedAt: 0, endedAt: 7 });
});

// --- The six cases from LOCKED_DECISIONS Hole 3 ---------------------------

test("case 1 — wrong then right: the first attempt stays wrong, the item becomes solved", () => {
  const state = run([WRONG, { ...RIGHT, at: 30 }]);
  assert.equal(state.firstAttempts["c1-lock-apply"].correct, false);
  assert.equal(state.firstAttempts["c1-lock-apply"].at, 20);
  assert.equal(state.solved["c1-lock-apply"], true);
  assert.equal(state.attempts.length, 2);
  assert.deepEqual(state.attempts.map((a) => a.correct), [false, true]);
  assert.deepEqual(score(state), { correct: 0, total: 1, ratio: 0 });
});

test("case 2 — right then wrong: the first attempt stays right", () => {
  const state = run([RIGHT, { ...WRONG, at: 30 }]);
  assert.equal(state.firstAttempts["c1-lock-apply"].correct, true);
  assert.equal(state.firstAttempts["c1-lock-apply"].at, 10);
  assert.equal(state.attempts.length, 2);
  assert.deepEqual(score(state), { correct: 1, total: 1, ratio: 1 });
});

test("case 3 — striking a correct choice costs nothing", () => {
  const before = run([RIGHT]);
  const after = reduce(before, {
    type: "STRIKE",
    challengeId: "c1-lock-apply",
    choiceId: "a"
  });
  assert.deepEqual(after.struck["c1-lock-apply"], ["a"]);
  assert.deepEqual(after.firstAttempts, before.firstAttempts);
  assert.deepEqual(after.attempts, before.attempts);
  assert.deepEqual(score(after), score(before));
});

test("case 4 — a refresh preserves the immutable record", () => {
  const seed = new Map();
  const first = createStore(reduce, { key: "fineprint.session.v1", storage: mapStorage(seed) });
  first.dispatch(WRONG);
  first.dispatch({ ...RIGHT, at: 30 });

  const second = createStore(reduce, { key: "fineprint.session.v1", storage: mapStorage(seed) });
  assert.deepEqual(second.getState().firstAttempts, first.getState().firstAttempts);
  assert.equal(second.getState().firstAttempts["c1-lock-apply"].correct, false);
  assert.deepEqual(second.getState(), first.getState());
});

test("case 5 — a double-clicked submit records two attempts and one first attempt", () => {
  const state = run([RIGHT, RIGHT]);
  assert.equal(state.attempts.length, 2);
  assert.equal(Object.keys(state.firstAttempts).length, 1);
  assert.deepEqual(state.firstAttempts["c1-lock-apply"], { correct: true, at: 10 });
});

test("case 6 — START_OVER returns to the initial state", () => {
  const state = run([
    { type: "START_CASE", at: 1 },
    WRONG,
    { type: "NUDGE", challengeId: "c1-lock-apply" },
    { type: "FINALE_CLUE", clueId: "k1" },
    { type: "COACH_RESULT", source: "live", message: "anything" }
  ]);
  assert.deepEqual(reduce(state, { type: "START_OVER" }), initialState());
});

// --- Everything else the reducer owns -------------------------------------

test("SUBMIT_ATTEMPT throws on an unknown challenge", () => {
  assert.throws(
    () => reduce(initialState(), { type: "SUBMIT_ATTEMPT", challengeId: "c9", choiceIds: [], at: 1 }),
    { message: "unknown challenge: c9" }
  );
});

test("an attempt records the choices it was given, copied not shared", () => {
  const choiceIds = ["o-lamp", "o-key"];
  const state = reduce(initialState(), {
    type: "SUBMIT_ATTEMPT",
    challengeId: "c1-search",
    choiceIds,
    at: 5
  });
  assert.deepEqual(state.attempts[0], {
    challengeId: "c1-search",
    choiceIds: ["o-lamp", "o-key"],
    correct: true,
    at: 5
  });
  choiceIds.push("o-glove");
  assert.deepEqual(state.attempts[0].choiceIds, ["o-lamp", "o-key"]);
});

test("a correct citation records the cited line", () => {
  const state = reduce(initialState(), {
    type: "SUBMIT_ATTEMPT",
    challengeId: "c1-cite",
    choiceIds: ["L4"],
    at: 8
  });
  assert.equal(state.cited["c1-cite"], 4);
});

test("a wrong citation for an already solved search counts one evidence review", () => {
  const solvedSearch = reduce(initialState(), {
    type: "SUBMIT_ATTEMPT",
    challengeId: "c1-search",
    choiceIds: ["o-lamp", "o-key"],
    at: 1
  });
  const missed = reduce(solvedSearch, {
    type: "SUBMIT_ATTEMPT",
    challengeId: "c1-cite",
    choiceIds: ["L5"],
    at: 2
  });
  assert.equal(missed.evidenceReview, 1);
  assert.equal(missed.cited["c1-cite"], undefined);

  const missedAgain = reduce(missed, {
    type: "SUBMIT_ATTEMPT",
    challengeId: "c1-cite",
    choiceIds: ["L2"],
    at: 3
  });
  assert.equal(missedAgain.evidenceReview, 1, "counted once per challenge, not per attempt");

  const other = reduce(missedAgain, {
    type: "SUBMIT_ATTEMPT",
    challengeId: "c2-cite",
    choiceIds: ["L8"],
    at: 4
  });
  assert.equal(other.evidenceReview, 1, "the second search was never solved");
});

test("a wrong citation with the search unsolved does not count an evidence review", () => {
  const state = reduce(initialState(), {
    type: "SUBMIT_ATTEMPT",
    challengeId: "c1-cite",
    choiceIds: ["L5"],
    at: 2
  });
  assert.equal(state.evidenceReview, 0);
});

test("STRIKE toggles a choice in and out", () => {
  const on = reduce(initialState(), { type: "STRIKE", challengeId: "c1-search", choiceId: "o-glove" });
  const more = reduce(on, { type: "STRIKE", challengeId: "c1-search", choiceId: "o-ledger" });
  assert.deepEqual(more.struck["c1-search"], ["o-glove", "o-ledger"]);
  const off = reduce(more, { type: "STRIKE", challengeId: "c1-search", choiceId: "o-glove" });
  assert.deepEqual(off.struck["c1-search"], ["o-ledger"]);
});

test("NUDGE counts per challenge and stops at the maximum", () => {
  const state = run([
    { type: "NUDGE", challengeId: "c1-search" },
    { type: "NUDGE", challengeId: "c1-cite" },
    { type: "NUDGE", challengeId: "c2-search" }
  ]);
  assert.equal(state.nudges.used, 2);
  assert.deepEqual(state.nudges.by, { "c1-search": 1, "c1-cite": 1 });
  assert.equal(state.nudges.max, 2);
});

test("the finale selections are set and toggled", () => {
  const state = run([
    { type: "FINALE_PERSON", cameo: "ada", personId: "bram" },
    { type: "FINALE_PERSON", cameo: "ada", personId: "ada" },
    { type: "FINALE_CLUE", clueId: "k1" },
    { type: "FINALE_CLUE", clueId: "k3" },
    { type: "FINALE_CLUE", clueId: "k1" },
    { type: "FINALE_CULPRIT", personId: "cora" }
  ]);
  assert.deepEqual(state.finale.people, { ada: "ada" });
  assert.deepEqual(state.finale.clues, ["k3"]);
  assert.equal(state.finale.culprit, "cora");
  assert.equal(state.finale.solved, false);
});

test("FINALE_SUBMIT scores one item and solves the case", () => {
  const state = run([
    { type: "FINALE_PERSON", cameo: "ada", personId: "ada" },
    { type: "FINALE_PERSON", cameo: "bram", personId: "bram" },
    { type: "FINALE_CLUE", clueId: "k1" },
    { type: "FINALE_CLUE", clueId: "k3" },
    { type: "FINALE_CLUE", clueId: "k5" },
    { type: "FINALE_CLUE", clueId: "k7" },
    { type: "FINALE_CULPRIT", personId: "cora" },
    { type: "FINALE_SUBMIT", at: 50 }
  ]);
  assert.equal(state.finale.solved, true);
  assert.deepEqual(state.firstAttempts["finale-reconstruct"], { correct: true, at: 50 });
  assert.equal(state.solved["finale-reconstruct"], true);
  assert.equal(state.attempts.at(-1).challengeId, "finale-reconstruct");
  assert.deepEqual(state.attempts.at(-1).choiceIds, ["k1", "k3", "k5", "k7"]);
});

test("FINALE_SUBMIT with the culprit right but no proving clues is partial, and the first attempt sticks", () => {
  const partial = run([
    { type: "FINALE_PERSON", cameo: "ada", personId: "ada" },
    { type: "FINALE_PERSON", cameo: "bram", personId: "bram" },
    { type: "FINALE_CULPRIT", personId: "cora" },
    { type: "FINALE_SUBMIT", at: 60 }
  ]);
  assert.equal(partial.finale.solved, false);
  assert.equal(partial.firstAttempts["finale-reconstruct"].correct, false);

  const retried = run(
    [
      { type: "FINALE_CLUE", clueId: "k1" },
      { type: "FINALE_CLUE", clueId: "k3" },
      { type: "FINALE_CLUE", clueId: "k5" },
      { type: "FINALE_CLUE", clueId: "k7" },
      { type: "FINALE_SUBMIT", at: 70 }
    ],
    partial
  );
  assert.equal(retried.finale.solved, true, "the case can still be solved on a retry");
  assert.equal(
    retried.firstAttempts["finale-reconstruct"].correct,
    false,
    "the retry never rewrites the score"
  );
  assert.equal(retried.attempts.length, 2);
});

test("STATEMENT_SET and STATEMENT_SUBMIT score the closing statement", () => {
  const wrong = run([
    { type: "STATEMENT_SET", slotId: "slot1", vocabularyId: "v-alpha" },
    { type: "STATEMENT_SET", slotId: "slot2", vocabularyId: "v-gamma" },
    { type: "STATEMENT_SUBMIT", at: 80 }
  ]);
  assert.deepEqual(wrong.finale.statement, { slot1: "v-alpha", slot2: "v-gamma" });
  assert.equal(wrong.firstAttempts["finale-statement"].correct, false);
  assert.deepEqual(wrong.attempts.at(-1).choiceIds, ["v-alpha", "v-gamma"]);

  const fixed = run(
    [
      { type: "STATEMENT_SET", slotId: "slot2", vocabularyId: "v-delta" },
      { type: "STATEMENT_SUBMIT", at: 90 }
    ],
    wrong
  );
  assert.equal(fixed.solved["finale-statement"], true);
  assert.equal(fixed.firstAttempts["finale-statement"].correct, false);
});

test("COACH_RESULT and FINISH record their one thing each", () => {
  const coached = reduce(initialState(), {
    type: "COACH_RESULT",
    source: "fallback-deterministic",
    message: "a note"
  });
  assert.deepEqual(coached.coach, { source: "fallback-deterministic", message: "a note" });

  const finished = reduce(coached, { type: "FINISH", at: 500 });
  assert.equal(finished.finishedAt, 500);
  assert.equal(reduce(finished, { type: "FINISH", at: 900 }).finishedAt, 500);
});

test("no action mutates the state it was given", () => {
  const actions = [
    { type: "START_CASE", at: 1 },
    { type: "NAVIGATE", screen: "read", excerpt: 1 },
    { type: "READ_START", excerptId: "ex1", at: 2 },
    { type: "READ_END", excerptId: "ex1", at: 3 },
    WRONG,
    RIGHT,
    { type: "STRIKE", challengeId: "c1-search", choiceId: "o-glove" },
    { type: "NUDGE", challengeId: "c1-search" },
    { type: "SUBMIT_ATTEMPT", challengeId: "c1-search", choiceIds: ["o-lamp", "o-key"], at: 4 },
    { type: "SUBMIT_ATTEMPT", challengeId: "c1-cite", choiceIds: ["L5"], at: 5 },
    { type: "FINALE_PERSON", cameo: "ada", personId: "ada" },
    { type: "FINALE_CLUE", clueId: "k1" },
    { type: "FINALE_CULPRIT", personId: "cora" },
    { type: "FINALE_SUBMIT", at: 6 },
    { type: "STATEMENT_SET", slotId: "slot1", vocabularyId: "v-alpha" },
    { type: "STATEMENT_SUBMIT", at: 7 },
    { type: "COACH_RESULT", source: "live", message: "a note" },
    { type: "FINISH", at: 8 }
  ];
  let state = initialState();
  for (const action of actions) {
    const before = structuredClone(state);
    const next = reduce(state, action);
    assert.deepEqual(state, before, `${action.type} mutated the state it was given`);
    assert.notEqual(next, state, `${action.type} returned the same object`);
    state = next;
  }
});
