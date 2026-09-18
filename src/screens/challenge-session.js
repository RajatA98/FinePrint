// What the reader is doing right now, as opposed to what the case remembers.
//
// The store redraws the whole screen on every dispatch, so anything that must
// survive a redraw without being scored lives here: the marks laid on a
// challenge before Submit, whether the page is open over it, and which lines
// the page has already shown. None of it is persisted and none of it is scored
// — the reducer never sees any of it. Like read-session.js, a reload forgets it.

const selections = new Map(); // challengeId -> [choiceId]
const pages = new Map(); // challengeId -> {mode, choiceId}
const revealed = new Map(); // challengeId -> {line: Set, region: Set}

/* ------------------------------------------------------- marks before Submit */

export function selectionOf(challengeId) {
  return selections.get(challengeId) ?? [];
}

export function setSelection(challengeId, choiceIds) {
  selections.set(challengeId, [...choiceIds]);
}

export function clearSelection(challengeId) {
  selections.delete(challengeId);
}

/* ------------------------------------------------------------ the open page */

export function openPage(challengeId, mode, { choiceId = null } = {}) {
  pages.set(challengeId, { mode, choiceId });
}

export function pageFor(challengeId) {
  return pages.get(challengeId) ?? null;
}

export function closePage(challengeId) {
  pages.delete(challengeId);
}

/* ---------------------------------------------------------- what was shown */
// PRD P0-3: evidence the reader has already been shown stays visible. A line lit
// by a rewind or a region lit by a nudge is lit on every later opening too, so
// rereading never takes something back.

export function reveal(challengeId, lineNumbers, kind = "region") {
  const shown = revealed.get(challengeId) ?? { line: new Set(), region: new Set() };
  for (const n of lineNumbers) {
    shown[kind].add(n);
  }
  revealed.set(challengeId, shown);
}

/**
 * What has been shown, and how. The two are kept apart on purpose: a nudge lit a
 * region and must keep lighting a region, even though the proving line is inside
 * it. Promoting it to a lit line would turn every nudge into the answer.
 */
export function revealedLines(challengeId) {
  const shown = revealed.get(challengeId);
  return { line: [...(shown?.line ?? [])], region: [...(shown?.region ?? [])] };
}

/** Start over throws the case away; these marks go with it. */
export function forgetChallengeSession() {
  selections.clear();
  pages.clear();
  revealed.clear();
}
