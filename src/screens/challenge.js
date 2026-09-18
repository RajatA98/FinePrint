// The one challenge renderer. Lock, search and cite all come through here, so a
// change to how a challenge behaves happens once. It never writes state: a click
// moves a local selection, and Submit dispatches SUBMIT_ATTEMPT.

import { quote, line } from "../lesson.js";
import { UI } from "../ui-strings.js";
import { el, button, append, screenShell, nextButton, currentExcerpt } from "./chrome.js";

const STAGE_ORDER = { apply: 0, define: 1 };

export function renderChallenge(root, { challengeId, challenge, state, lesson, dispatch }) {
  const article = el("article", {
    class: "challenge",
    dataset: { challenge: challengeId, type: challenge.type }
  });
  article.append(el("p", { class: "prompt", text: quote(challenge.prompt) }));

  const targets = challenge.type === "search" ? challenge.targets ?? 1 : 1;
  const selected = new Set();
  const buttons = new Map();
  let submittedKey = null;

  const submit = button(UI.submit, () => {
    submittedKey = keyOf(selected);
    dispatch({
      type: "SUBMIT_ATTEMPT",
      challengeId,
      choiceIds: [...selected],
      at: Date.now()
    });
    refresh();
  });
  submit.className = "submit";

  function refresh() {
    for (const [choiceId, node] of buttons) {
      node.setAttribute("aria-pressed", selected.has(choiceId) ? "true" : "false");
    }
    submit.disabled = selected.size === 0 || keyOf(selected) === submittedKey;
  }

  function choose(choiceId) {
    if (targets === 1) {
      selected.clear();
      selected.add(choiceId);
    } else if (selected.has(choiceId)) {
      selected.delete(choiceId);
    } else if (selected.size < targets) {
      selected.add(choiceId);
    }
    refresh();
  }

  const list = el("ul", { class: "choices" });
  for (const choice of challenge.choices ?? []) {
    const node = button(null, () => choose(choice.id), {
      class: "choice",
      dataset: { kind: choice.kind },
      "aria-pressed": "false"
    });
    append(node, choiceContent(choice, lesson));
    buttons.set(choice.id, node);
    list.append(el("li", {}, [node]));
  }
  article.append(list, submit);

  const outcome = outcomeOf(state, challengeId);
  if (outcome) {
    article.append(el("p", { class: "outcome", dataset: { outcome }, text: outcomeLabel(outcome) }));
  }

  refresh();
  root.append(article);
  return article;
}

/**
 * A whole screen of challenges of one type: the excerpt's challenges in lesson
 * order, and a way onward once the last of them has been answered at least once.
 */
export function renderChallengeScreen(root, ctx, { type, nextRoute }) {
  const { index, excerpt } = currentExcerpt(ctx);
  const section = screenShell(root, ctx, { heading: `${UI.excerpt} ${excerpt.roman}` });
  const challenges = challengesOfType(ctx.lesson, excerpt, type);

  for (const { challengeId, challenge } of challenges) {
    renderChallenge(section, { ...ctx, challengeId, challenge });
  }

  const last = challenges[challenges.length - 1];
  if (last && attempted(ctx.state, last.challengeId)) {
    section.append(nextButton(ctx, nextRoute(index)));
  }
  return section;
}

export function challengesOfType(lesson, excerpt, type) {
  return (excerpt.challenges ?? [])
    .map((challengeId) => ({ challengeId, challenge: lesson.challenges?.[challengeId] }))
    .filter((entry) => entry.challenge?.type === type)
    .sort((a, b) => stageRank(a.challenge) - stageRank(b.challenge));
}

function stageRank(challenge) {
  return STAGE_ORDER[challenge.stage] ?? 0;
}

export function attempted(state, challengeId) {
  return Object.hasOwn(state.firstAttempts, challengeId);
}

function outcomeOf(state, challengeId) {
  if (state.solved[challengeId]) {
    return "solved";
  }
  return attempted(state, challengeId) ? "again" : null;
}

function outcomeLabel(outcome) {
  return outcome === "solved" ? UI.solved : UI.notYet;
}

/** A choice reads from the lesson: a dial label, an object, a role, or a line. */
function choiceContent(choice, lesson) {
  switch (choice.kind) {
    case "dial":
      return [quote(choice.label)];
    case "object":
      return [quote(lesson.objects[choice.ref].label)];
    case "portrait":
      return [quote(lesson.people[choice.ref].role)];
    case "line":
      return [
        el("span", { class: "line-number", text: String(choice.line) }),
        el("span", { class: "line-text", text: line(choice.line) })
      ];
    default:
      return [choice.id];
  }
}

function keyOf(selected) {
  return [...selected].sort().join(",");
}
