// The reducer owns every write to scoring state. Screens dispatch; nothing else
// writes. `firstAttempts` is written once per item and `attempts` only grows, so
// a retry can change what the player sees but never what the score remembers.
//
// Actions are flat objects: {type, ...payload}, e.g. {type: "NUDGE", challengeId}.

import { grade, FINALE_RECONSTRUCT, FINALE_STATEMENT } from "./grade.js";

export function initialState() {
  return {
    version: 1,
    lessonId: null,
    startedAt: 0,
    finishedAt: 0,
    route: { screen: "study", excerpt: 1 },
    reading: {},
    firstAttempts: {},
    attempts: [],
    solved: {},
    struck: {},
    nudges: { used: 0, max: 2, by: {} },
    cited: {},
    evidenceReview: 0,
    finale: { people: {}, clues: [], culprit: null, statement: {}, solved: false },
    coach: { source: null, message: null }
  };
}

export function createReducer(lesson) {
  return function reducer(state = initialState(), action = {}) {
    switch (action.type) {
      case "START_CASE":
        return {
          ...state,
          lessonId: lesson?.id ?? null,
          startedAt: state.startedAt === 0 ? action.at : state.startedAt,
          route: { screen: "vocabulary", excerpt: 1 }
        };

      case "NAVIGATE":
        return {
          ...state,
          route: {
            screen: action.screen,
            excerpt: Number.isInteger(action.excerpt) ? action.excerpt : state.route.excerpt
          }
        };

      case "READ_START":
        return markReading(state, action.excerptId, "startedAt", action.at);

      case "READ_END":
        return markReading(state, action.excerptId, "endedAt", action.at);

      case "SUBMIT_ATTEMPT":
        return submitAttempt(state, lesson, action);

      case "STRIKE": {
        const struck = state.struck[action.challengeId] ?? [];
        return {
          ...state,
          struck: { ...state.struck, [action.challengeId]: toggle(struck, action.choiceId) }
        };
      }

      case "NUDGE": {
        const { used, max, by } = state.nudges;
        if (used >= max) {
          return state;
        }
        return {
          ...state,
          nudges: {
            used: used + 1,
            max,
            by: { ...by, [action.challengeId]: (by[action.challengeId] ?? 0) + 1 }
          }
        };
      }

      case "FINALE_PERSON":
        return withFinale(state, {
          people: { ...state.finale.people, [action.cameo]: action.personId }
        });

      case "FINALE_CLUE":
        return withFinale(state, { clues: toggle(state.finale.clues, action.clueId) });

      case "FINALE_CULPRIT":
        return withFinale(state, { culprit: action.personId });

      case "FINALE_SUBMIT": {
        const { people, clues, culprit } = state.finale;
        const result = grade(lesson, FINALE_RECONSTRUCT, { people, clues, culprit });
        const scored = recordAttempt(state, {
          challengeId: FINALE_RECONSTRUCT,
          choiceIds: clues,
          correct: result.correct,
          at: action.at
        });
        return withFinale(scored.state, { solved: result.solved });
      }

      case "STATEMENT_SET":
        return withFinale(state, {
          statement: { ...state.finale.statement, [action.slotId]: action.vocabularyId }
        });

      case "STATEMENT_SUBMIT": {
        const slots = state.finale.statement;
        const result = grade(lesson, FINALE_STATEMENT, { slots });
        const choiceIds = (lesson?.finale?.statement?.slots ?? [])
          .map((slot) => slots[slot.id])
          .filter((vocabularyId) => vocabularyId != null);
        return recordAttempt(state, {
          challengeId: FINALE_STATEMENT,
          choiceIds,
          correct: result.correct,
          at: action.at
        }).state;
      }

      case "COACH_RESULT":
        return { ...state, coach: { source: action.source, message: action.message } };

      case "FINISH":
        return { ...state, finishedAt: state.finishedAt === 0 ? action.at : state.finishedAt };

      case "START_OVER":
        return initialState();

      default:
        return state;
    }
  };
}

function submitAttempt(state, lesson, action) {
  const { challengeId, choiceIds = [], at } = action;
  const challenge = lesson?.challenges?.[challengeId];
  if (!challenge) {
    throw new Error(`unknown challenge: ${challengeId}`);
  }
  const result = grade(lesson, challengeId, choiceIds);
  const { state: scored, isFirstAttempt } = recordAttempt(state, {
    challengeId,
    choiceIds,
    correct: result.correct,
    at
  });

  if (challenge.type !== "cite") {
    return scored;
  }
  if (result.correct) {
    return { ...scored, cited: { ...scored.cited, [challengeId]: citedLine(challenge, choiceIds, result) } };
  }
  // The answer was already found but the wrong line was offered to prove it:
  // worth counting, once per citation, so the report can name the habit.
  const provesSolved = Boolean(challenge.proves) && state.solved[challenge.proves] === true;
  if (isFirstAttempt && provesSolved) {
    return { ...scored, evidenceReview: scored.evidenceReview + 1 };
  }
  return scored;
}

/** Append to the history, write the first attempt if this is the first, mark solved. */
function recordAttempt(state, { challengeId, choiceIds, correct, at }) {
  const isFirstAttempt = !Object.hasOwn(state.firstAttempts, challengeId);
  return {
    isFirstAttempt,
    state: {
      ...state,
      attempts: [...state.attempts, { challengeId, choiceIds: [...choiceIds], correct, at }],
      firstAttempts: isFirstAttempt
        ? { ...state.firstAttempts, [challengeId]: { correct, at } }
        : state.firstAttempts,
      solved: correct ? { ...state.solved, [challengeId]: true } : state.solved
    }
  };
}

function citedLine(challenge, choiceIds, result) {
  const choice = (challenge.choices ?? []).find((candidate) => candidate.id === choiceIds[0]);
  return choice?.line ?? result.evidenceLine;
}

/** Reading timestamps are set once: re-entering a passage never resets them. */
function markReading(state, excerptId, field, at) {
  const entry = state.reading[excerptId] ?? { startedAt: 0, endedAt: 0 };
  if (entry[field]) {
    return state;
  }
  return {
    ...state,
    reading: { ...state.reading, [excerptId]: { ...entry, [field]: at } }
  };
}

function withFinale(state, patch) {
  return { ...state, finale: { ...state.finale, ...patch } };
}

function toggle(list, id) {
  return list.includes(id) ? list.filter((item) => item !== id) : [...list, id];
}
