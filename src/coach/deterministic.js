// The note the reader gets when no model answers: the lesson's own wording, chosen
// by the weakest skill cluster. Nothing here is written in JavaScript.

import { quote, coach } from "../lesson.js";

// Ties are broken by this order, so the same run always reads the same way.
const SKILL_ORDER = ["vocabulary", "detail", "inference", "evidence"];

export function deterministicNote(payload) {
  const { deterministic = {}, generic = null } = coach() ?? {};
  const missed = payload?.missed ?? [];

  if (missed.length === 0) {
    return note(deterministic.clean, generic);
  }
  const skill = weakestSkill(payload?.clusters ?? {});
  return note(skill ? deterministic[skill] : null, generic);
}

/** The lowest ratio among clusters the reader actually got wrong. */
function weakestSkill(clusters) {
  let weakest = null;
  let lowest = Infinity;
  for (const skill of orderedSkills(clusters)) {
    const { correct = 0, total = 0 } = clusters[skill] ?? {};
    if (total <= 0 || correct >= total) {
      continue;
    }
    const ratio = correct / total;
    if (ratio < lowest) {
      lowest = ratio;
      weakest = skill;
    }
  }
  return weakest;
}

function orderedSkills(clusters) {
  const known = SKILL_ORDER.filter((skill) => Object.hasOwn(clusters, skill));
  const rest = Object.keys(clusters)
    .filter((skill) => !SKILL_ORDER.includes(skill))
    .sort();
  return [...known, ...rest];
}

function note(stringId, genericId) {
  if (stringId) {
    return { source: "fallback-deterministic", message: quote(stringId) };
  }
  return { source: "fallback-generic", message: genericId ? quote(genericId) : "" };
}
