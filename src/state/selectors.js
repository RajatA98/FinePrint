// Read-only views over state. The score reads `firstAttempts` and nothing else.

export function score(state) {
  const attempts = Object.values(state.firstAttempts);
  const total = attempts.length;
  const correct = attempts.filter((attempt) => attempt.correct).length;
  return { correct, total, ratio: total === 0 ? 0 : correct / total };
}

export function verdict(state, lesson) {
  if (!state.finale.solved) {
    return "reopened";
  }
  const { ratio } = score(state);
  if (ratio >= 0.9 && allProvingCluesChosen(state, lesson)) {
    return "master";
  }
  if (ratio >= 0.7) {
    return "closed";
  }
  return "review";
}

export function clusters(state, lesson) {
  const bySkill = {};
  for (const [challengeId, attempt] of Object.entries(state.firstAttempts)) {
    const skill = lesson?.challenges?.[challengeId]?.skill;
    if (!skill) {
      continue; // the finale items are scored but belong to no skill
    }
    const cluster = bySkill[skill] ?? { correct: 0, total: 0 };
    bySkill[skill] = {
      correct: cluster.correct + (attempt.correct ? 1 : 0),
      total: cluster.total + 1
    };
  }
  return bySkill;
}

export function pace(state, lesson) {
  const perExcerpt = [];
  let words = 0;
  let elapsed = 0;

  for (const excerpt of lesson.excerpts ?? []) {
    const reading = state.reading[excerpt.id];
    if (!reading?.startedAt || !reading?.endedAt || reading.endedAt <= reading.startedAt) {
      continue;
    }
    const excerptWords = wordsInExcerpt(lesson, excerpt);
    const excerptElapsed = reading.endedAt - reading.startedAt;
    perExcerpt.push({ excerptId: excerpt.id, wpm: wpm(excerptWords, excerptElapsed) });
    words += excerptWords;
    elapsed += excerptElapsed;
  }

  return { perExcerpt, overallWpm: wpm(words, elapsed) };
}

function allProvingCluesChosen(state, lesson) {
  const chosen = new Set(state.finale.clues);
  return (lesson?.finale?.reconstruct?.clues ?? [])
    .filter((clue) => clue.proving)
    .every((clue) => chosen.has(clue.id));
}

function wpm(words, elapsedMs) {
  return elapsedMs <= 0 ? 0 : Math.round(words / (elapsedMs / 60000));
}

function wordsInExcerpt(lesson, excerpt) {
  const [first, last] = excerpt.lines;
  let words = 0;
  for (let n = first; n <= last; n += 1) {
    words += (String(lesson.lines[n - 1] ?? "").match(/\S+/g) ?? []).length;
  }
  return words;
}
