// Two marks that belong to this page load, not to the case.
//
// These module-level Sets are the ONE deliberate exception to "every screen
// renders from state alone": they are page-load-scoped markers, never persisted
// and never written to the store, and their whole job is to tell live reading
// apart from a reload mid-read. Re-rendering a screen twice in one tab gives
// the same screen; a reload is meant to forget them. The controller ruled this
// acceptable.
//
// The persisted state cannot tell "I am reading this right now" from "I opened
// this excerpt, then refreshed the tab": both look like a startedAt with no
// endedAt. These sets carry that difference for as long as the page lives, so a
// refresh mid-read offers to resume instead of pretending the read is running.
// They are deliberately NOT persisted: a reload should forget them.

const begun = new Set();
const closing = new Set();

export function markBegun(excerptId) {
  begun.add(excerptId);
}

export function hasBegun(excerptId) {
  return begun.has(excerptId);
}

export function markClosing(excerptId) {
  closing.add(excerptId);
}

export function isClosing(excerptId) {
  return closing.has(excerptId);
}

export function clearClosing(excerptId) {
  closing.delete(excerptId);
}

/** Start over throws the case away; these marks go with it. */
export function forgetReadSession() {
  begun.clear();
  closing.clear();
}
