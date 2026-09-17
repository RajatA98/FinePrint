// A tiny store: state in memory, a copy in storage. Storage is injectable so the
// tests can hand it a Map and the browser can hand it localStorage.

import { initialState } from "./reducer.js";

export function createStore(reducer, { key, storage } = {}) {
  let state = restore(key, storage) ?? initialState();
  const listeners = new Set();

  function persist() {
    try {
      storage?.setItem(key, JSON.stringify(state));
    } catch {
      // Quota, private mode, a blocked origin: the run continues on memory alone.
    }
  }

  return {
    getState() {
      return state;
    },
    dispatch(action) {
      state = reducer(state, action);
      persist();
      for (const listener of [...listeners]) {
        listener(state);
      }
      return state;
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    }
  };
}

function restore(key, storage) {
  try {
    const raw = storage?.getItem(key);
    if (!raw) {
      return null;
    }
    const saved = JSON.parse(raw);
    return saved?.version === 1 ? saved : null;
  } catch {
    // Unreadable or unparsable: start the case fresh rather than fail to boot.
    return null;
  }
}
