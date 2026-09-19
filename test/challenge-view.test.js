// The pure decisions behind the challenge renderer: what a click does to the
// selection, which challenge on a screen is open, what the reopened page lights,
// and what the nudge control is allowed to offer. No DOM here on purpose — these
// are the rules, and the renderer is only their drawing.

import test from "node:test";
import assert from "node:assert/strict";

import {
  selectionAfter,
  selectionAfterStrike,
  selectableIds,
  selectionComplete,
  visibleStages,
  workingStage,
  paragraphRange,
  dealt,
  litLines,
  nudgeStatus,
  progressMarks,
  citedLines,
  dialAngles,
  LADDER,
  ladderRung,
  ladderMarks,
  finaleOutcome,
  pinsLeft,
  citedEvidence,
  blanksLeft,
  openBlank,
  cameoFigure
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

test("ruling out a chosen one takes the mark off with it", () => {
  assert.deepEqual(selectionAfterStrike(["o-lamp", "o-key"], "o-key"), ["o-lamp"]);
  assert.deepEqual(selectionAfterStrike(["a"], "a"), []);
});

test("bringing a ruled-out choice back does not bring its mark back", () => {
  // Strike it while it is chosen, then strike again to un-rule it: the mark the
  // first strike took away must not reappear on the second.
  const afterStrike = selectionAfterStrike(["a"], "a");
  assert.deepEqual(afterStrike, []);
  assert.deepEqual(selectionAfterStrike(afterStrike, "a"), []);
});

test("ruling out something that was never chosen leaves the marks alone", () => {
  assert.deepEqual(selectionAfterStrike(["o-lamp"], "o-key"), ["o-lamp"]);
  assert.deepEqual(selectionAfterStrike([], "o-key"), []);
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

// ------------------------------------------------- which stage the tools serve

test("the page tools follow the newest stage still open, not the first", () => {
  // A wrong apply leaves both lock stages on the desk. The tools belong to the
  // define stage the reader has just been handed, so a nudge is recorded
  // against that challenge and not against the one being retried above it.
  const afterWrongApply = stateWith({ firstAttempts: { "c1-lock-apply": { correct: false } } });
  assert.equal(workingStage(visibleStages(LOCKS, afterWrongApply)).challengeId, "c1-lock-define");
});

test("with only one stage open the tools serve that one", () => {
  assert.equal(workingStage(visibleStages(LOCKS, stateWith())).challengeId, "c1-lock-apply");

  const applySolved = stateWith({
    firstAttempts: { "c1-lock-apply": { correct: true } },
    solved: { "c1-lock-apply": true }
  });
  assert.equal(workingStage(visibleStages(LOCKS, applySolved)).challengeId, "c1-lock-define");
});

test("with everything solved the tools stay with whichever stage came last", () => {
  const bothSolved = stateWith({
    firstAttempts: { "c1-lock-apply": { correct: true }, "c1-lock-define": { correct: true } },
    solved: { "c1-lock-apply": true, "c1-lock-define": true }
  });
  assert.equal(workingStage(visibleStages(LOCKS, bothSolved)).challengeId, "c1-lock-define");
});

test("a screen with no challenges has no working stage", () => {
  assert.equal(workingStage([]), null);
  assert.equal(workingStage(undefined), null);
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

// ---------------------------------------------------------------- the finale

test("the ladder runs reopened, review, closed, master", () => {
  assert.deepEqual(LADDER, ["reopened", "review", "closed", "master"]);
});

test("the rung the reader stands on is the index of their verdict", () => {
  assert.equal(ladderRung("reopened"), 0);
  assert.equal(ladderRung("review"), 1);
  assert.equal(ladderRung("closed"), 2);
  assert.equal(ladderRung("master"), 3);
});

test("an unknown verdict stands on the bottom rung rather than nowhere", () => {
  assert.equal(ladderRung(undefined), 0);
  assert.equal(ladderRung("nonsense"), 0);
});

test("the rungs below the reader's are marked passed and the ones above ahead", () => {
  assert.deepEqual(ladderMarks("closed"), [
    { key: "reopened", state: "passed" },
    { key: "review", state: "passed" },
    { key: "closed", state: "lit" },
    { key: "master", state: "ahead" }
  ]);
  assert.deepEqual(
    ladderMarks("reopened").map((mark) => mark.state),
    ["lit", "ahead", "ahead", "ahead"]
  );
});

// ------------------------------------------------------------ the case board

const BOARD_LESSON = {
  finale: {
    reconstruct: {
      clues: [
        { id: "k1", line: 2, proving: true, speaker: "ada" },
        { id: "k2", line: 3, proving: false, speaker: "narration" },
        { id: "k3", line: 4, proving: true, speaker: "bram" }
      ],
      required: 4,
      culprit: { answer: "cora" }
    }
  }
};

function boardState(patch = {}) {
  return {
    firstAttempts: {},
    cited: {},
    finale: { people: {}, clues: [], culprit: null, statement: {}, solved: false },
    ...patch
  };
}

test("the board stays quiet on the outcome until the seal is tried", () => {
  assert.equal(finaleOutcome(boardState(), BOARD_LESSON), null);
});

test("a solved board is solved", () => {
  const state = boardState({
    firstAttempts: { "finale-reconstruct": { correct: true, at: 1 } },
    finale: { people: {}, clues: ["k1", "k3"], culprit: "cora", solved: true }
  });
  assert.equal(finaleOutcome(state, BOARD_LESSON), "solved");
});

test("the right name without the lines is a partial seal, never a refusal", () => {
  const state = boardState({
    firstAttempts: { "finale-reconstruct": { correct: false, at: 1 } },
    finale: { people: {}, clues: ["k2"], culprit: "cora", solved: false }
  });
  assert.equal(finaleOutcome(state, BOARD_LESSON), "partial");
});

test("a board that names someone else is tried again", () => {
  const state = boardState({
    firstAttempts: { "finale-reconstruct": { correct: false, at: 1 } },
    finale: { people: {}, clues: [], culprit: "ada", solved: false }
  });
  assert.equal(finaleOutcome(state, BOARD_LESSON), "again");
});

test("the tin holds four pins and empties as clues are pinned", () => {
  assert.equal(pinsLeft([], 4), 4);
  assert.equal(pinsLeft(["k1", "k2"], 4), 2);
  assert.equal(pinsLeft(["k1", "k2", "k3", "k4"], 4), 0);
  assert.equal(pinsLeft(["k1", "k2", "k3", "k4", "k5"], 4), 0);
});

// ----------------------------------------------- the reader's own evidence

test("the evidence list merges the lines cited earlier with the clues pinned", () => {
  const state = boardState({
    cited: { "c1-cite": 3, "c2-cite": 9 },
    finale: { people: {}, clues: ["k1"], culprit: null, solved: false }
  });
  assert.deepEqual(citedEvidence(state, BOARD_LESSON), [
    { line: 2, speaker: "ada", pinned: true, cited: false },
    { line: 3, speaker: "narration", pinned: false, cited: true },
    { line: 9, speaker: null, pinned: false, cited: true }
  ]);
});

test("a line both cited and pinned appears once, marked as both", () => {
  const state = boardState({
    cited: { "c1-cite": 2 },
    finale: { people: {}, clues: ["k1"], culprit: null, solved: false }
  });
  assert.deepEqual(citedEvidence(state, BOARD_LESSON), [
    { line: 2, speaker: "ada", pinned: true, cited: true }
  ]);
});

test("nothing cited and nothing pinned is an empty list, not a throw", () => {
  assert.deepEqual(citedEvidence(boardState(), BOARD_LESSON), []);
  assert.deepEqual(citedEvidence(undefined, undefined), []);
});

// ------------------------------------------------------------ the statement

test("the statement counts the blanks still to be set", () => {
  const slots = [{ id: "slot1" }, { id: "slot2" }, { id: "slot3" }];
  assert.equal(blanksLeft(slots, {}), 3);
  assert.equal(blanksLeft(slots, { slot1: "v-alpha" }), 2);
  assert.equal(blanksLeft(slots, { slot1: "v-alpha", slot2: "v-beta", slot3: "v-gamma" }), 0);
  assert.equal(blanksLeft([], {}), 0);
});

test("the blank the reader is filling is the first one still empty", () => {
  const slots = [{ id: "slot1" }, { id: "slot2" }, { id: "slot3" }];
  assert.equal(openBlank(slots, {}, null), "slot1");
  assert.equal(openBlank(slots, { slot1: "v-alpha" }, null), "slot2");
  assert.equal(openBlank(slots, { slot1: "a", slot2: "b", slot3: "c" }, null), "slot1");
  // a blank the reader points at stays open, filled or not
  assert.equal(openBlank(slots, {}, "slot3"), "slot3");
  assert.equal(openBlank(slots, {}, "nonsense"), "slot1");
  assert.equal(openBlank([], {}, null), null);
});

// ---------------------------------------------------------------- the cameos

test("each person in the house gets the silhouette that belongs to them", () => {
  assert.equal(cameoFigure("vera"), "girl");
  assert.equal(cameoFigure("mrs-sappleton"), "woman");
  assert.equal(cameoFigure("sister"), "woman");
  assert.equal(cameoFigure("mr-sappleton"), "man");
  assert.equal(cameoFigure("framton"), "man");
  assert.equal(cameoFigure("ronnie"), "man");
  assert.equal(cameoFigure("second-brother"), "man");
  assert.equal(cameoFigure("cyclist"), "man");
});

test("a cameo key the lesson does not name falls back to the guide", () => {
  assert.equal(cameoFigure("nobody"), "guide");
  assert.equal(cameoFigure(undefined), "guide");
  assert.equal(cameoFigure(null), "guide");
  assert.equal(cameoFigure(""), "guide");
});

test("only the three cuts are ever asked for by a portrait", () => {
  const asked = new Set(
    ["vera", "mrs-sappleton", "sister", "mr-sappleton", "framton", "ronnie", "second-brother", "cyclist"]
      .map(cameoFigure)
  );
  assert.deepEqual([...asked].sort(), ["girl", "man", "woman"]);
});

// ------------------------------------------------------------------ the deal

test("dealt keeps the items, fixes the order per seed, and moves the first one", () => {
  const items = ["a", "b", "c", "d"];
  const once = dealt(items, "s-c1-lock-apply-prompt");
  assert.deepEqual([...once].sort(), items);
  assert.deepEqual(dealt(items, "s-c1-lock-apply-prompt"), once);
  assert.notDeepEqual(dealt(items, "s-c2-lock-apply-prompt"), once);
  assert.deepEqual(dealt(undefined, "x"), []);
  assert.deepEqual(items, ["a", "b", "c", "d"]);
});
