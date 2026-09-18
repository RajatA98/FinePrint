// What the coach is allowed to know: how the run went, never what the story said.
// Every field here is a number, an id, or a word this file invented.

import { score, verdict, clusters, pace } from "../state/selectors.js";

export function buildCoachPayload(state, lesson) {
  const { correct, total } = score(state, lesson);
  return {
    lessonId: state.lessonId ?? lesson?.id ?? null,
    verdict: verdict(state, lesson),
    score: { correct, total },
    missed: missedItems(state, lesson),
    clusters: clusters(state, lesson),
    pace: { overallWpm: pace(state, lesson).overallWpm, shownNotGraded: true },
    evidenceReview: state.evidenceReview,
    nudgesUsed: state.nudges.used
  };
}

/** First-attempt misses, in the order they happened. Finale items have no skill and are left out. */
function missedItems(state, lesson) {
  const missed = [];
  for (const [challengeId, attempt] of Object.entries(state.firstAttempts)) {
    if (attempt.correct) {
      continue;
    }
    const challenge = lesson?.challenges?.[challengeId];
    if (!challenge) {
      continue;
    }
    const index = excerptIndexOf(lesson, challengeId);
    missed.push({
      challengeId,
      skill: challenge.skill ?? null,
      excerpt: index,
      position: positionOf(lesson, index, challenge.evidence)
    });
  }
  return missed;
}

function excerptIndexOf(lesson, challengeId) {
  const excerpts = lesson?.excerpts ?? [];
  const index = excerpts.findIndex((excerpt) => (excerpt.challenges ?? []).includes(challengeId));
  return index < 0 ? 0 : index + 1;
}

/** Where the evidence line sits in its excerpt, by thirds. */
function positionOf(lesson, excerptIndex, evidenceLine) {
  const excerpt = (lesson?.excerpts ?? [])[excerptIndex - 1];
  if (!excerpt || !Number.isInteger(evidenceLine)) {
    return "middle";
  }
  const [first, last] = excerpt.lines;
  const span = last - first + 1;
  if (span <= 0) {
    return "middle";
  }
  const through = (evidenceLine - first) / span;
  if (through < 1 / 3) {
    return "early";
  }
  return through < 2 / 3 ? "middle" : "late";
}
