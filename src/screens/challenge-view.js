// The rules behind the challenge renderer, with no DOM in sight.
//
// Everything here is a pure function of what the reader has done so far. The
// renderer draws these answers; it never decides them itself, and nothing in
// this file writes to state — a struck choice, a nudge already spent, a stage
// not yet open: each one is read from the state the reducer owns.

/**
 * What the selection becomes when a choice is clicked.
 * One target: the click moves the pointer, and clicking the chosen one lets go.
 * Several targets: the click collects until the count is full. Struck choices
 * are ruled out, so a click on one changes nothing except to release it.
 */
export function selectionAfter(selected, choiceId, { targets = 1, struck = [] } = {}) {
  const current = [...(selected ?? [])].filter((id) => !struck.includes(id));
  if (struck.includes(choiceId)) {
    return current;
  }
  if (current.includes(choiceId)) {
    return current.filter((id) => id !== choiceId);
  }
  if (targets <= 1) {
    return [choiceId];
  }
  return current.length >= targets ? current : [...current, choiceId];
}

/** The choices still in play: everything the reader has not ruled out. */
export function selectableIds(choices, struck = []) {
  return (choices ?? []).map((choice) => choice.id).filter((id) => !struck.includes(id));
}

/** Submit is only meaningful when the reader has made the number of marks asked for. */
export function selectionComplete(selected, targets = 1) {
  return (selected ?? []).length === Math.max(1, targets);
}

/**
 * Which of a screen's challenges are on the desk, and in what form.
 *
 * A stage opens once the one before it has been attempted — the define stage of
 * a word lock is not a second question asked at the same time, it is the next
 * turn of the same key. A solved stage settles into a compact strip to make room
 * for the one behind it; an attempted-but-unsolved one stays open, because the
 * retry is the whole point. Whatever comes last never settles: the thing the
 * reader has just got right is the thing they came here to see.
 */
export function visibleStages(entries, state) {
  const stages = [];
  for (const [position, entry] of (entries ?? []).entries()) {
    const previous = entries[position - 1];
    if (previous && !isAttempted(state, previous.challengeId)) {
      break;
    }
    const solved = Boolean(state?.solved?.[entry.challengeId]);
    const isLast = position === entries.length - 1;
    stages.push({ ...entry, form: solved && !isLast ? "settled" : "full" });
  }
  return stages;
}

export function isAttempted(state, challengeId) {
  return Object.hasOwn(state?.firstAttempts ?? {}, challengeId);
}

/** A wrong answer reopens the page; a right one leaves the reader with the win. */
export function pageModeAfterAttempt({ correct } = {}) {
  return correct ? null : "rewind";
}

/**
 * The paragraph a line belongs to, clamped to the excerpt on screen. With no
 * paragraph marks to go on, the whole excerpt is the region: a nudge that lights
 * too much is still honest, one that lights the line itself would be the answer.
 */
export function paragraphRange(paragraphStarts, range, lineNumber) {
  const [first, last] = range;
  const starts = (paragraphStarts ?? [])
    .filter((n) => n >= first && n <= last)
    .sort((a, b) => a - b);
  if (starts.length === 0) {
    return [first, last];
  }
  let openAt = first;
  let closeAt = last;
  for (const [position, start] of starts.entries()) {
    if (start <= lineNumber) {
      openAt = start;
      closeAt = position + 1 < starts.length ? starts[position + 1] - 1 : last;
    }
  }
  return [Math.max(openAt, first), Math.min(closeAt, last)];
}

/** What the reopened page lights: the proving line, its paragraph, or nothing. */
export function litLines({ mode, evidence, paragraphStarts, range }) {
  if (mode === "rewind" && Number.isInteger(evidence)) {
    return [evidence];
  }
  if (mode === "nudge" && Number.isInteger(evidence)) {
    const [first, last] = paragraphRange(paragraphStarts, range, evidence);
    const lines = [];
    for (let n = first; n <= last; n += 1) {
      lines.push(n);
    }
    return lines;
  }
  return [];
}

/** Nudges belong to the case, not to one challenge, and cost nothing either way. */
export function nudgeStatus(nudges, challengeId) {
  const used = nudges?.used ?? 0;
  const max = nudges?.max ?? 0;
  const remaining = Math.max(0, max - used);
  return {
    used,
    max,
    remaining,
    available: remaining > 0,
    atLimit: remaining === 0
  };
}

/** The ten excerpts as a strip: what is behind, what is open, what is ahead. */
export function progressMarks(excerpts, currentIndex) {
  return (excerpts ?? []).map((excerpt, position) => {
    const index = position + 1;
    return {
      index,
      roman: excerpt.roman,
      state: index === currentIndex ? "current" : index < currentIndex ? "done" : "ahead"
    };
  });
}

/** Every line the reader has written into the case notes, in reading order. */
export function citedLines(cited) {
  return [...new Set(Object.values(cited ?? []))]
    .filter((n) => Number.isInteger(n))
    .sort((a, b) => a - b);
}

/** Positions on the lock ring, evenly spaced, the first one straight up. */
export function dialAngles(count) {
  const positions = [];
  for (let i = 0; i < count; i += 1) {
    positions.push(-90 + (i * 360) / count);
  }
  return positions;
}
