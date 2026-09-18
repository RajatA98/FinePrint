// The pure decisions behind the challenge renderer: what a click does to the
// selection, which challenge on a screen is open, what the reopened page lights,
// and what the nudge control is allowed to offer. No DOM here on purpose — these
// are the rules, and the renderer is only their drawing.

import test from "node:test";
import assert from "node:assert/strict";

import {
  selectionAfter,
  selectableIds,
  selectionComplete,
  visibleStages,
  pageModeAfterAttempt,
  paragraphRange,
  litLines,
  nudgeStatus,
  progressMarks,
  citedLines,
  dialAngles
} from "../src/screens/challenge-view.js";

// ------------------------------------------------------------------ selection

test("a single-target challenge replaces the selection on each click", () => {
  assert.deepEqual(selectionAfter([], "a", { targets: 1 }), ["a"]);
  assert.deepEqual(selectionAfter(["a"], "b", { targets: 1 }), ["b"]);
});

test("clicking the chosen one again in a single-target challenge clears it", () => {
  assert.deepEqual(selectionAfter(["a"], "a", { targets: 1 }), []);
});

test("a two-target challenge collects up to its count and no further", () => {
  let selected = selectionAfter([], "o-lamp", { targets: 2 });
  selected = selectionAfter(selected, "o-key", { targets: 2 });
  assert.deepEqual(selected, ["o-lamp", "o-key"]);
  assert.deepEqual(selectionAfter(selected, "o-glove", { targets: 2 }), ["o-lamp", "o-key"]);
});

test("a chosen one is released by clicking it again, making room for another", () => {
  const selected = selectionAfter(["o-lamp", "o-key"], "o-key", { targets: 2 });
  assert.deepEqual(selected, ["o-lamp"]);
  assert.deepEqual(selectionAfter(selected, "o-glove", { targets: 2 }), ["o-lamp", "o-glove"]);
});

test("a struck choice cannot be selected", () => {
  assert.deepEqual(selectionAfter([], "b", { targets: 1, struck: ["b"] }), []);
  assert.deepEqual(selectionAfter(["a"], "b", { targets: 1, struck: ["b"] }), ["a"]);
});

test("striking a choice that is already selected drops it from the selection", () => {
  assert.deepEqual(selectionAfter(["a", "b"], "b", { targets: 2, struck: ["b"] }), ["a"]);
});

test("selectableIds leaves out the struck choices", () => {
  const choices = [{ id: "a" }, { id: "b" }, { id: "c" }];
  assert.deepEqual(selectableIds(choices, ["b"]), ["a", "c"]);
  assert.deepEqual(selectableIds(choices, []), ["a", "b", "c"]);
});

test("a selection is complete only at the target count", () => {
  assert.equal(selectionComplete(["a"], 1), true);
  assert.equal(selectionComplete([], 1), false);
  assert.equal(selectionComplete(["a"], 2), false);
  assert.equal(selectionComplete(["a", "b"], 2), true);
});

// -------------------------------------------------------------------- staging

const LOCKS = [
  { challengeId: "c1-lock-apply", challenge: { type: "lock", stage: "apply" } },
  { challengeId: "c1-lock-define", challenge: { type: "lock", stage: "define" } }
];

function stateWith({ firstAttempts = {}, solved = {} } = {}) {
  return { firstAttempts, solved };
}

test("the second stage stays shut until the first has been attempted", () => {
  const stages = visibleStages(LOCKS, stateWith());
  assert.equal(stages.length, 1);
  assert.equal(stages[0].challengeId, "c1-lock-apply");
  assert.equal(stages[0].form, "full");
});

test("a wrong first attempt still opens the second stage, and keeps the first open", () => {
  const state = stateWith({ firstAttempts: { "c1-lock-apply": { correct: false } } });
  const stages = visibleStages(LOCKS, state);
  assert.deepEqual(
    stages.map((stage) => [stage.challengeId, stage.form]),
    [
      ["c1-lock-apply", "full"],
      ["c1-lock-define", "full"]
    ]
  );
});

test("a solved stage settles into its compact form and the next opens", () => {
  const state = stateWith({
    firstAttempts: { "c1-lock-apply": { correct: true } },
    solved: { "c1-lock-apply": true }
  });
  const stages = visibleStages(LOCKS, state);
  assert.deepEqual(
    stages.map((stage) => [stage.challengeId, stage.form]),
    [
      ["c1-lock-apply", "settled"],
      ["c1-lock-define", "full"]
    ]
  );
});

test("a one-challenge screen always shows its challenge", () => {
  const single = [{ challengeId: "c1-search", challenge: { type: "search" } }];
  assert.equal(visibleStages(single, stateWith())[0].form, "full");
});

test("the last stage stays open once solved: the reader looks at what they won", () => {
  const single = [{ challengeId: "c1-cite", challenge: { type: "cite" } }];
  const state = stateWith({
    firstAttempts: { "c1-cite": { correct: true } },
    solved: { "c1-cite": true }
  });
  assert.equal(visibleStages(single, state)[0].form, "full");

  const bothSolved = stateWith({
    firstAttempts: { "c1-lock-apply": { correct: true }, "c1-lock-define": { correct: true } },
    solved: { "c1-lock-apply": true, "c1-lock-define": true }
  });
  assert.deepEqual(
    visibleStages(LOCKS, bothSolved).map((stage) => stage.form),
    ["settled", "full"]
  );
});

// ------------------------------------------------------------------ page mode

test("a wrong attempt reopens the page; a right one does not", () => {
  assert.equal(pageModeAfterAttempt({ correct: false }), "rewind");
  assert.equal(pageModeAfterAttempt({ correct: true }), null);
});

// --------------------------------------------------------------- lit evidence

const STARTS = [1, 4, 11, 18, 21];

test("paragraphRange finds the paragraph holding a line, clamped to the excerpt", () => {
  assert.deepEqual(paragraphRange(STARTS, [1, 17], 15), [11, 17]);
  assert.deepEqual(paragraphRange(STARTS, [1, 17], 2), [1, 3]);
  assert.deepEqual(paragraphRange(STARTS, [1, 17], 4), [4, 10]);
  assert.deepEqual(paragraphRange(STARTS, [18, 27], 19), [18, 20]);
});

test("paragraphRange falls back to the excerpt when no paragraph start is known", () => {
  assert.deepEqual(paragraphRange([], [1, 17], 9), [1, 17]);
});

test("rewind lights exactly the proving line; nudge lights its paragraph", () => {
  const where = { paragraphStarts: STARTS, range: [1, 17], evidence: 15 };
  assert.deepEqual(litLines({ ...where, mode: "rewind" }), [15]);
  assert.deepEqual(litLines({ ...where, mode: "nudge" }), [11, 12, 13, 14, 15, 16, 17]);
  assert.deepEqual(litLines({ ...where, mode: "reread" }), []);
});

test("a nudge never lights the single line on its own", () => {
  const lit = litLines({ paragraphStarts: STARTS, range: [1, 17], evidence: 15, mode: "nudge" });
  assert.ok(lit.length > 1, "the nudge is a region, not the answer");
});

// --------------------------------------------------------------------- nudges

test("nudges count against the case, not the challenge", () => {
  const fresh = nudgeStatus({ used: 0, max: 2, by: {} }, "c1-search");
  assert.deepEqual(fresh, { used: 0, max: 2, remaining: 2, available: true, atLimit: false });

  const one = nudgeStatus({ used: 1, max: 2, by: { "c1-search": 1 } }, "c1-cite");
  assert.equal(one.available, true);
  assert.equal(one.remaining, 1);
});

test("the third ask is refused, and refusing costs nothing", () => {
  const spent = nudgeStatus({ used: 2, max: 2, by: { "c1-search": 2 } }, "c1-cite");
  assert.equal(spent.available, false);
  assert.equal(spent.atLimit, true);
  assert.equal(spent.remaining, 0);
});

// -------------------------------------------------------------------- chrome

test("the progress strip marks the excerpt being worked", () => {
  const excerpts = [{ roman: "I" }, { roman: "II" }, { roman: "III" }];
  assert.deepEqual(progressMarks(excerpts, 2), [
    { index: 1, roman: "I", state: "done" },
    { index: 2, roman: "II", state: "current" },
    { index: 3, roman: "III", state: "ahead" }
  ]);
});

test("cited lines come out in reading order, without repeats", () => {
  assert.deepEqual(citedLines({ "c2-cite": 22, "c1-cite": 15, "c3-cite": 22 }), [15, 22]);
  assert.deepEqual(citedLines({}), []);
});

// ----------------------------------------------------------------------- dial

test("dial positions divide the ring evenly, starting at the top", () => {
  assert.deepEqual(dialAngles(4), [-90, 0, 90, 180]);
  assert.deepEqual(dialAngles(3), [-90, 30, 150]);
  assert.deepEqual(dialAngles(1), [-90]);
  assert.deepEqual(dialAngles(0), []);
});
