import test from "node:test";
import assert from "node:assert/strict";

import {
  readPhase,
  canCloseBook,
  OPENING,
  READING,
  RESUME,
  DONE,
  CLOSING
} from "../src/screens/read-phase.js";
import { createReducer, initialState } from "../src/state/reducer.js";
import { pace } from "../src/state/selectors.js";
import { readFileSync } from "node:fs";

const lesson = JSON.parse(
  readFileSync(new URL("./fixtures/lesson.mini.json", import.meta.url), "utf8")
);

test("the first excerpt, never opened, owes a title card", () => {
  assert.equal(readPhase({ reading: undefined, isFirstExcerpt: true }), OPENING);
  assert.equal(readPhase({ reading: {}, isFirstExcerpt: true }), OPENING);
  assert.equal(readPhase({ reading: { startedAt: 0, endedAt: 0 }, isFirstExcerpt: true }), OPENING);
});

test("later excerpts never open the book again; they just start reading", () => {
  assert.equal(readPhase({ reading: undefined, isFirstExcerpt: false }), READING);
});

test("reduced motion skips the card and starts the clock at once", () => {
  assert.equal(
    readPhase({ reading: undefined, isFirstExcerpt: true, reducedMotion: true }),
    READING
  );
});

test("an excerpt this tab opened is being read, card or no card", () => {
  const reading = { startedAt: 1000, endedAt: 0 };
  assert.equal(readPhase({ reading, begunThisSession: true }), READING);
  assert.equal(
    readPhase({ reading, isFirstExcerpt: true, begunThisSession: true }),
    READING
  );
});

test("a started, unfinished read this tab did not begin is a resume", () => {
  assert.equal(readPhase({ reading: { startedAt: 1000, endedAt: 0 } }), RESUME);
  assert.equal(readPhase({ reading: { startedAt: 1000 } }), RESUME);
  // even for the first excerpt: a reload must not replay the title card and
  // must not imply the clock is starting over
  assert.equal(readPhase({ reading: { startedAt: 1000 }, isFirstExcerpt: true }), RESUME);
});

test("an excerpt read to the end is done, and re-reading it is allowed", () => {
  assert.equal(readPhase({ reading: { startedAt: 1000, endedAt: 4000 } }), DONE);
});

test("the closing transition outranks every other phase", () => {
  assert.equal(readPhase({ reading: undefined, isFirstExcerpt: true, closing: true }), CLOSING);
  assert.equal(
    readPhase({ reading: { startedAt: 1, endedAt: 2 }, closing: true, begunThisSession: true }),
    CLOSING
  );
});

test("no arguments at all still yields a renderable phase", () => {
  assert.equal(readPhase(), READING);
});

test("a full read of one excerpt yields a words-per-minute figure", () => {
  const reduce = createReducer(lesson);
  let state = initialState();
  state = reduce(state, { type: "READ_START", excerptId: "ex1", at: 60_000 });
  state = reduce(state, { type: "READ_END", excerptId: "ex1", at: 120_000 });

  const measured = pace(state, lesson);
  assert.equal(measured.perExcerpt.length, 1);
  assert.equal(measured.perExcerpt[0].excerptId, "ex1");
  assert.ok(measured.perExcerpt[0].wpm > 0);
  assert.ok(measured.overallWpm > 0);
});

test("the book cannot close before it has opened", () => {
  assert.equal(canCloseBook(undefined), false);
  assert.equal(canCloseBook({}), false);
  assert.equal(canCloseBook({ startedAt: 0 }), false);
  assert.equal(canCloseBook({ startedAt: 1000 }), true);
  assert.equal(canCloseBook({ startedAt: 1000, endedAt: 4000 }), true);
});

test("a close during the title card cannot invert the clock", () => {
  // The exact sequence the guard exists for: Close the book is reachable under
  // the overlay, is activated first, and the card's READ_START lands after it.
  const reduce = createReducer(lesson);
  let state = initialState();

  if (canCloseBook(state.reading.ex1)) {
    state = reduce(state, { type: "READ_END", excerptId: "ex1", at: 1000 });
  }
  state = reduce(state, { type: "READ_START", excerptId: "ex1", at: 2000 });
  state = reduce(state, { type: "READ_END", excerptId: "ex1", at: 5000 });

  assert.equal(state.reading.ex1.startedAt, 2000);
  assert.equal(state.reading.ex1.endedAt, 5000);
  assert.ok(state.reading.ex1.endedAt > state.reading.ex1.startedAt);
  assert.equal(pace(state, lesson).perExcerpt.length, 1); // the excerpt still has a pace
});

test("without the guard that sequence would strand the excerpt", () => {
  // Proves the test above is testing something: the same clicks, unguarded.
  const reduce = createReducer(lesson);
  let state = initialState();
  state = reduce(state, { type: "READ_END", excerptId: "ex1", at: 1000 });
  state = reduce(state, { type: "READ_START", excerptId: "ex1", at: 2000 });
  state = reduce(state, { type: "READ_END", excerptId: "ex1", at: 5000 });

  assert.ok(state.reading.ex1.endedAt < state.reading.ex1.startedAt);
  assert.equal(pace(state, lesson).perExcerpt.length, 0); // pace silently lost
});

test("resuming never restarts the clock: startedAt is written once", () => {
  const reduce = createReducer(lesson);
  let state = initialState();
  state = reduce(state, { type: "READ_START", excerptId: "ex1", at: 1000 });
  state = reduce(state, { type: "READ_START", excerptId: "ex1", at: 9999 });
  assert.equal(state.reading.ex1.startedAt, 1000);
});
