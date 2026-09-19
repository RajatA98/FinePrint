import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { createReducer, initialState } from "../src/state/reducer.js";
import { skipAhead, skipTarget, demoEnabled } from "../src/screens/demo.js";

const lesson = JSON.parse(readFileSync(new URL("../public/lesson.open-window.json", import.meta.url), "utf8"));
const reduce = createReducer(lesson);

function harness(route) {
  let state = reduce({ ...initialState(), route }, {});
  const routes = [];
  const ctx = {
    lesson,
    get state() {
      return state;
    },
    dispatch: (action) => {
      state = reduce(state, action);
    },
    navigate: (r) => {
      routes.push(r);
      state = reduce(state, { type: "NAVIGATE", ...r });
    }
  };
  return { ctx, routes, state: () => state };
}

test("demoEnabled reads ?demo=1 and nothing else", () => {
  assert.equal(demoEnabled({ location: { search: "?demo=1" } }), true);
  assert.equal(demoEnabled({ location: { search: "?demo=0" } }), false);
  assert.equal(demoEnabled({ location: { search: "" } }), false);
  assert.equal(demoEnabled({}), false);
});

test("skipTarget: a game moves to the next game, the read moves to the next excerpt, the last lands on the board", () => {
  assert.deepEqual(skipTarget(lesson, { screen: "lock", excerpt: 1 }), { games: ["lock"], route: { screen: "search", excerpt: 1 } });
  assert.deepEqual(skipTarget(lesson, { screen: "search", excerpt: 1 }).route, { screen: "cite", excerpt: 1 });
  assert.deepEqual(skipTarget(lesson, { screen: "cite", excerpt: 1 }).route, { screen: "vocabulary", excerpt: 2 });
  assert.deepEqual(skipTarget(lesson, { screen: "read", excerpt: 3 }), { games: ["lock", "search", "cite"], route: { screen: "vocabulary", excerpt: 4 } });
  assert.deepEqual(skipTarget(lesson, { screen: "cite", excerpt: 10 }).route, { screen: "reconstruct", excerpt: 10 });
});

test("skipAhead from the vocabulary completes the excerpt with every answer right", () => {
  const { ctx, routes, state } = harness({ screen: "vocabulary", excerpt: 1 });
  skipAhead(ctx);
  const first = lesson.excerpts[0];
  for (const id of first.challenges) {
    assert.equal(state().solved[id], true, id);
    assert.equal(state().firstAttempts[id].correct, true, id);
  }
  assert.ok(state().reading[first.id].endedAt > state().reading[first.id].startedAt);
  assert.ok(state().startedAt > 0);
  assert.deepEqual(routes, [{ screen: "vocabulary", excerpt: 2 }]);
});

test("skipAhead from a lock completes only the lock and moves to the search", () => {
  const { ctx, routes, state } = harness({ screen: "lock", excerpt: 2 });
  skipAhead(ctx);
  const second = lesson.excerpts[1];
  for (const id of second.challenges) {
    assert.equal(Boolean(state().solved[id]), lesson.challenges[id].type === "lock", id);
  }
  assert.deepEqual(routes, [{ screen: "search", excerpt: 2 }]);
});

test("ten skips from the first vocabulary reach the board with every line cited", () => {
  const { ctx, state } = harness({ screen: "vocabulary", excerpt: 1 });
  for (let i = 0; i < 10; i += 1) {
    skipAhead(ctx);
  }
  assert.equal(state().route.screen, "reconstruct");
  assert.equal(Object.keys(state().cited).length, 10);
  assert.equal(Object.keys(state().solved).length, 40);
});
