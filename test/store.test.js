import test from "node:test";
import assert from "node:assert/strict";

import { createStore } from "../src/state/store.js";
import { initialState } from "../src/state/reducer.js";

const KEY = "fineprint.session.v1";

function mapStorage(seed = new Map()) {
  return {
    seed,
    getItem: (key) => (seed.has(key) ? seed.get(key) : null),
    setItem: (key, value) => {
      seed.set(key, value);
    }
  };
}

// A stand-in reducer: the store must not care what the reducer does.
const bump = (state, action) =>
  action.type === "BUMP" ? { ...state, evidenceReview: state.evidenceReview + 1 } : state;

test("a store with empty storage starts from the initial state", () => {
  const store = createStore(bump, { key: KEY, storage: mapStorage() });
  assert.deepEqual(store.getState(), initialState());
});

test("a store restores a persisted version 1 state", () => {
  const saved = { ...initialState(), evidenceReview: 3, lessonId: "mini" };
  const storage = mapStorage(new Map([[KEY, JSON.stringify(saved)]]));
  assert.deepEqual(createStore(bump, { key: KEY, storage }).getState(), saved);
});

test("a store ignores persisted state from another version", () => {
  const stale = { ...initialState(), version: 0, evidenceReview: 3 };
  const storage = mapStorage(new Map([[KEY, JSON.stringify(stale)]]));
  assert.deepEqual(createStore(bump, { key: KEY, storage }).getState(), initialState());
});

test("a store ignores unreadable persisted state", () => {
  const storage = mapStorage(new Map([[KEY, "{not json"]]));
  assert.deepEqual(createStore(bump, { key: KEY, storage }).getState(), initialState());
});

test("a store survives storage that refuses to be read", () => {
  const storage = {
    getItem: () => {
      throw new Error("private mode");
    },
    setItem: () => {}
  };
  assert.deepEqual(createStore(bump, { key: KEY, storage }).getState(), initialState());
});

test("dispatch runs the reducer, persists, and returns the new state", () => {
  const storage = mapStorage();
  const store = createStore(bump, { key: KEY, storage });
  const next = store.dispatch({ type: "BUMP" });
  assert.equal(next.evidenceReview, 1);
  assert.equal(store.getState(), next);
  assert.deepEqual(JSON.parse(storage.seed.get(KEY)), next);
});

test("a persist failure is swallowed and the in-memory state stays authoritative", () => {
  const storage = {
    getItem: () => null,
    setItem: () => {
      throw new Error("quota exceeded");
    }
  };
  const store = createStore(bump, { key: KEY, storage });
  assert.doesNotThrow(() => store.dispatch({ type: "BUMP" }));
  assert.equal(store.getState().evidenceReview, 1);
});

test("subscribers are notified with the new state, and unsubscribe stops them", () => {
  const store = createStore(bump, { key: KEY, storage: mapStorage() });
  const seen = [];
  const unsubscribe = store.subscribe((state) => seen.push(state.evidenceReview));
  store.dispatch({ type: "BUMP" });
  store.dispatch({ type: "BUMP" });
  unsubscribe();
  store.dispatch({ type: "BUMP" });
  assert.deepEqual(seen, [1, 2]);
  assert.equal(store.getState().evidenceReview, 3);
});

test("every subscriber is notified once per dispatch", () => {
  const store = createStore(bump, { key: KEY, storage: mapStorage() });
  let a = 0;
  let b = 0;
  store.subscribe(() => { a += 1; });
  store.subscribe(() => { b += 1; });
  store.dispatch({ type: "BUMP" });
  assert.deepEqual([a, b], [1, 1]);
});

test("a store works without any storage at all", () => {
  const store = createStore(bump, { key: KEY });
  assert.doesNotThrow(() => store.dispatch({ type: "BUMP" }));
  assert.equal(store.getState().evidenceReview, 1);
});
