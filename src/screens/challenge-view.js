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

/**
 * What the selection becomes when a choice is ruled out or brought back.
 *
 * Ruling a choice out takes it off the desk, so it cannot still be one of the
 * marks waiting to be submitted — and because the rule-out is reversible, the
 * mark must not come back with it when the reader changes their mind.
 */
export function selectionAfterStrike(selected, choiceId) {
  return (selected ?? []).filter((id) => id !== choiceId);
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

/**
 * The stage the page tools belong to: the last one still open.
 *
 * The tools ask about one challenge at a time, and the nudge they spend is
 * recorded against that challenge's id. The reader works down the desk, so the
 * newest thing still unanswered is what they are looking at — not the first
 * thing on the screen, which may be a retry they have already set aside. With
 * nothing left open, the tools stay with whichever stage came last rather than
 * vanishing.
 */
export function workingStage(stages) {
  const list = stages ?? [];
  for (let position = list.length - 1; position >= 0; position -= 1) {
    if (list[position].form === "full") {
      return list[position];
    }
  }
  return list.length > 0 ? list[list.length - 1] : null;
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

/* ------------------------------------------------------------- the finale */

/**
 * The four standings, worst to best. The report draws them as a ladder and lights
 * the one the reader is standing on; nothing here decides which that is — the
 * verdict selector does, and this only fixes the order.
 */
export const LADDER = ["reopened", "review", "closed", "master"];

/** Which rung a verdict is. An unknown verdict stands on the bottom one. */
export function ladderRung(verdict) {
  const rung = LADDER.indexOf(verdict);
  return rung < 0 ? 0 : rung;
}

/** The ladder to draw: the rungs passed, the rung stood on, the rungs above. */
export function ladderMarks(verdict) {
  const rung = ladderRung(verdict);
  return LADDER.map((key, position) => ({
    key,
    state: position === rung ? "lit" : position < rung ? "passed" : "ahead"
  }));
}

/**
 * What the seal did, once the reader has pressed it: `solved` when the board
 * holds, `partial` when they named the right person but the lines behind the
 * name are not the four that prove it, `again` otherwise, and null before the
 * seal has been tried at all. Naming the person is never nothing.
 */
export function finaleOutcome(state, lesson) {
  if (!isAttempted(state, "finale-reconstruct")) {
    return null;
  }
  if (state?.finale?.solved === true) {
    return "solved";
  }
  const answer = lesson?.finale?.reconstruct?.culprit?.answer;
  return state?.finale?.culprit === answer ? "partial" : "again";
}

/** Pins left in the tin: the count the board shows as pins, not as a number. */
export function pinsLeft(chosen, required) {
  return Math.max(0, (required ?? 0) - (chosen ?? []).length);
}

/**
 * Every line the reader has put their name to, in reading order: the ones they
 * cited during the case and the ones they pinned to the board, each with whose
 * words they are where the lesson says. A line that is both appears once.
 */
export function citedEvidence(state, lesson) {
  const clues = lesson?.finale?.reconstruct?.clues ?? [];
  const speakerOfLine = new Map(clues.map((clue) => [clue.line, clue.speaker]));
  const cited = new Set(citedLines(state?.cited));
  const pinned = new Set();
  for (const clueId of state?.finale?.clues ?? []) {
    const clue = clues.find((candidate) => candidate.id === clueId);
    if (clue) {
      pinned.add(clue.line);
    }
  }
  return [...new Set([...cited, ...pinned])]
    .sort((a, b) => a - b)
    .map((line) => ({
      line,
      speaker: speakerOfLine.has(line) ? speakerOfLine.get(line) : null,
      pinned: pinned.has(line),
      cited: cited.has(line)
    }));
}

/* ---------------------------------------------------------- the statement */

/** How many blanks in the closing line are still empty. */
export function blanksLeft(slots, chosen) {
  return (slots ?? []).filter((slot) => !(chosen ?? {})[slot.id]).length;
}

/**
 * The blank whose words are on offer: the one the reader pointed at, or else the
 * first one still empty, or else the first. There is always one, so the tray of
 * words is never empty while there is a line to fill.
 */
export function openBlank(slots, chosen, pointedAt) {
  const all = slots ?? [];
  if (all.some((slot) => slot.id === pointedAt)) {
    return pointedAt;
  }
  const empty = all.find((slot) => !(chosen ?? {})[slot.id]);
  return (empty ?? all[0])?.id ?? null;
}
