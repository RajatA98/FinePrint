// The one challenge renderer. Lock, search and cite all come through here, so a
// change to how a challenge behaves happens once.
//
// Dispatch discipline: this file never writes state. A click moves a mark that
// lives in challenge-session.js until Submit; Submit dispatches SUBMIT_ATTEMPT
// and the reducer decides everything that counts. Striking dispatches STRIKE,
// asking dispatches NUDGE, and opening the page dispatches nothing at all.
//
// Nothing here says a word of the story: a dial position is quote(choice.label),
// an object is quote(objects[ref].label), a portrait is quote(people[ref].role)
// — the role, never the name — and a slip is line(n).

import { quote, line, excerptLines } from "../lesson.js";
import { grade } from "../state/grade.js";
import { UI } from "../ui-strings.js";
import {
  el,
  button,
  label,
  cameo,
  screenShell,
  currentExcerpt
} from "./chrome.js";
import {
  selectionAfter,
  selectionAfterStrike,
  selectionComplete,
  visibleStages,
  workingStage,
  pageModeAfterAttempt,
  litLines,
  nudgeStatus,
  citedLines,
  dialAngles,
  isAttempted
} from "./challenge-view.js";
import {
  selectionOf,
  setSelection,
  clearSelection,
  openPage,
  pageFor,
  closePage,
  reveal
} from "./challenge-session.js";
import { renderPagePanel } from "./page.js";

const STAGE_ORDER = { apply: 0, define: 1 };
const CENTRE = 104; // half the dial viewBox, in user units

/* ------------------------------------------------------------------ a screen */

/**
 * A whole screen of challenges of one type: the excerpt's challenges in lesson
 * order, the page tools that are always within reach, and a way onward once the
 * screen has been attempted, so no screen is ever a dead end.
 *
 * `heading` is given the excerpt and may return a display line (the word lock
 * puts the word itself there — the word is the key).
 */
export function renderChallengeScreen(root, ctx, options) {
  const { type, nextRoute, heading, submitLabel } = options;
  const { index, excerpt } = currentExcerpt(ctx);
  const entries = challengesOfType(ctx.lesson, excerpt, type);
  const stages = visibleStages(entries, ctx.state);
  const redraw = () => renderChallengeScreen(root, ctx, options);

  const section = screenShell(root, ctx, {
    heading: heading ? heading(ctx, excerpt, entries) : null
  });

  const work = el("div", { class: "work" });
  // The tools serve the stage the reader is actually working — the last one
  // still open — so a nudge spent on the define turn is recorded against define
  // and not against the apply turn still sitting above it after a wrong answer.
  const active = workingStage(stages);
  let panel = null;

  for (const stage of stages) {
    if (stage.form === "settled") {
      work.append(settledCard(ctx, stage));
      continue;
    }
    renderChallenge(work, {
      ...ctx,
      challengeId: stage.challengeId,
      challenge: stage.challenge,
      excerpt,
      submitLabel
    });
    const open = pageFor(stage.challengeId);
    if (open && !panel) {
      panel = renderPagePanel(ctx, {
        challengeId: stage.challengeId,
        challenge: stage.challenge,
        excerpt,
        mode: open.mode,
        choiceId: open.choiceId,
        onClose: () => {
          // A fresh attempt: the page closes on an empty desk, not on the marks
          // that were just refused.
          closePage(stage.challengeId);
          clearSelection(stage.challengeId);
          redraw();
        }
      });
    }
  }

  const tools = active ? pageTools(ctx, { stage: active, excerpt, redraw }) : null;
  const forward = onward(ctx, { entries, route: nextRoute(index) });
  section.append(work, tools, forward);

  if (panel) {
    // While the page is open it is the only thing on the desk: the challenge
    // beneath goes out of the tab order rather than hiding behind the scrim.
    for (const behind of [work, tools, forward]) {
      if (behind) {
        behind.inert = true;
      }
    }
    section.append(panel);
    panel.focus();
  }
  return section;
}

/** The page is always within reach, and asking for help never costs a mark. */
function pageTools(ctx, { stage, excerpt, redraw }) {
  const { challengeId, challenge } = stage;
  const status = nudgeStatus(ctx.state.nudges, challengeId);

  const reread = button(
    UI.reread,
    () => {
      openPage(challengeId, "reread");
      redraw(); // no dispatch: rereading changes nothing the case remembers
    },
    { class: "tool tool--reread" }
  );

  const ask = button(
    UI.askInkwell,
    () => {
      if (!status.available) {
        return; // refused, and refusing costs nothing
      }
      reveal(
        challengeId,
        litLines({
          mode: "nudge",
          evidence: challenge.evidence,
          paragraphStarts: ctx.lesson.paragraphStarts ?? [],
          range: excerpt.lines
        }),
        "region"
      );
      openPage(challengeId, "nudge");
      ctx.dispatch({ type: "NUDGE", challengeId });
    },
    { class: "tool tool--ask" }
  );
  ask.disabled = !status.available;

  return el("div", { class: "tools" }, [
    reread,
    el("span", { class: "tools__ask" }, [
      ask,
      el("span", { class: "tools__count" }, [label(UI.nudgeCount(status.used, status.max))])
    ])
  ]);
}

/** Onward once every challenge here has been attempted; quiet until solved. */
function onward(ctx, { entries, route }) {
  // A screen with nothing to answer is still not a dead end: the way on is open
  // from the start, and otherwise it opens once every challenge has been tried.
  const ready = entries.every((entry) => attempted(ctx.state, entry.challengeId));
  const allSolved = entries.every((entry) => ctx.state.solved[entry.challengeId]);
  const nav = el("nav", { class: "onward", dataset: { ready: String(ready) } });
  if (!ready) {
    return nav;
  }
  nav.append(
    button(UI.next, () => ctx.navigate(route), {
      class: "next",
      dataset: { weight: allSolved ? "primary" : "secondary" }
    })
  );
  return nav;
}

/** A solved challenge folds down to a strip so the desk never runs off the page. */
function settledCard(ctx, { challengeId, challenge }) {
  const chosen = (challenge.answer ?? [])
    .map((id) => (challenge.choices ?? []).find((choice) => choice.id === id))
    .filter(Boolean);
  return el("div", { class: "settled", dataset: { challenge: challengeId } }, [
    el("span", { class: "settled__seal", "aria-hidden": "true" }),
    el("div", { class: "settled__body" }, [
      el("p", { class: "settled__note" }, [label(UI.boxOpens)]),
      ...chosen.map((choice) =>
        el("p", { class: "settled__choice", text: plainLabel(choice, ctx.lesson) })
      )
    ])
  ]);
}

/* --------------------------------------------------------------- a challenge */

/**
 * renderChallenge(root, {challengeId, challenge, state, lesson, dispatch, …})
 * Draws one challenge into `root` and returns the article. `excerpt` and
 * `submitLabel` are optional: without them the challenge still renders and still
 * scores, it simply has no page of its own to open.
 */
export function renderChallenge(root, ctx) {
  const { challengeId, challenge, state, lesson, dispatch, excerpt, submitLabel } = ctx;
  const struck = state.struck[challengeId] ?? [];
  const targets = challenge.type === "search" ? challenge.targets ?? 1 : 1;
  const solved = Boolean(state.solved[challengeId]);
  // Once it is open, the marks on it are the answer: derived from the lesson so
  // that a reload still shows the reader what they got right.
  let selected = solved
    ? [...(challenge.answer ?? [])]
    : selectionOf(challengeId).filter((id) => !struck.includes(id));
  const refused = isAttempted(state, challengeId) && !solved;

  const article = el("article", {
    class: "challenge",
    dataset: {
      challenge: challengeId,
      type: challenge.type,
      state: solved ? "open" : refused ? "refused" : "shut"
    }
  });

  // A mark is not an answer: moving it repaints this challenge in place and
  // dispatches nothing. Only Submit talks to the reducer.
  const hands = {
    struck,
    targets,
    slots: new Map(),
    onRefresh: [],
    get selected() {
      return selected;
    },
    solved,
    choose(choiceId) {
      if (solved) {
        return; // an open box is not turned again
      }
      selected = selectionAfter(selected, choiceId, { targets, struck });
      setSelection(challengeId, selected);
      refresh();
    },
    strike(choiceId) {
      // Ruling a choice out takes it off the desk, so the mark goes with it —
      // otherwise bringing it back would resurrect a mark the reader never made
      // again. The session is written before the dispatch, because the dispatch
      // redraws the screen and reads the session back.
      selected = selectionAfterStrike(selected, choiceId);
      setSelection(challengeId, selected);
      // Free, reversible, never scored: the reducer's STRIKE touches nothing else.
      dispatch({ type: "STRIKE", challengeId, choiceId });
    }
  };

  function refresh() {
    for (const [choiceId, parts] of hands.slots) {
      const isSelected = selected.includes(choiceId);
      parts.slot.dataset.selected = String(isSelected);
      parts.slot.dataset.full = String(
        targets > 1 && !isSelected && selected.length >= targets && !struck.includes(choiceId)
      );
      parts.control.setAttribute("aria-pressed", String(isSelected));
    }
    for (const again of hands.onRefresh) {
      again(selected);
    }
    submit.disabled = solved || !selectionComplete(selected, targets);
  }

  const stage = stageFor(challenge, { lesson, excerpt, state, hands });
  const submit = button(
    submitLabel ?? UI.submit,
    () => {
      const choiceIds = [...selected];
      const result = grade(lesson, challengeId, choiceIds);
      const mode = pageModeAfterAttempt(result);
      if (mode) {
        // The page comes back with the proving line lit. Marked before the
        // dispatch because the dispatch redraws this screen from scratch.
        reveal(challengeId, [challenge.evidence].filter(Number.isInteger), "line");
        openPage(challengeId, mode, { choiceId: choiceIds[0] });
      }
      dispatch({ type: "SUBMIT_ATTEMPT", challengeId, choiceIds, at: Date.now() });
    },
    { class: "submit" }
  );

  article.append(promptBlock(challenge, { lesson, hands }), stage);
  if (refused) {
    article.append(el("p", { class: "outcome", dataset: { outcome: "again" }, text: UI.notYet }));
  }
  if (solved) {
    article.append(
      el("p", {
        class: "outcome",
        dataset: { outcome: "solved" },
        text: challenge.type === "lock" ? UI.boxOpens : UI.solved
      })
    );
  }
  if (!solved) {
    // A solved challenge keeps what the reader won, not a control they can no
    // longer press: the way on is the Next control, not a dead button.
    article.append(el("div", { class: "challenge__act" }, [submit]));
  }
  refresh();

  root.append(article);
  return article;
}

/** The question, and for a search the count of things to find. */
function promptBlock(challenge, { lesson, hands }) {
  const targets = hands.targets;
  const block = el("div", { class: "challenge__ask" });
  if (challenge.type === "cite" && challenge.proves) {
    const proved = lesson.challenges?.[challenge.proves];
    if (proved) {
      block.append(
        el("div", { class: "claim" }, [
          label(UI.theClaim, { class: "claim__label" }),
          el("p", { class: "claim__text", text: quote(proved.prompt) })
        ])
      );
    }
  }
  block.append(el("p", { class: "prompt", text: quote(challenge.prompt) }));
  if (challenge.type === "search") {
    const made = el("span", { class: "count__made" });
    hands.onRefresh.push((selected) => {
      made.textContent = UI.chosenCount(selected.length, targets);
    });
    block.append(
      el("p", { class: "count" }, [label(UI.findCount(targets)), made])
    );
  }
  return block;
}

/** Each kind of choice gets the furniture it belongs to. */
function stageFor(challenge, context) {
  const kind = (challenge.choices ?? [])[0]?.kind;
  switch (kind) {
    case "dial":
      return lockStage(challenge, context);
    case "line":
      return citationStage(challenge, context);
    case "portrait":
      return chooserStage(challenge, context, "portraits");
    default:
      return chooserStage(challenge, context, "objects");
  }
}

/* --------------------------------------------------------------- the lock */

function lockStage(challenge, { lesson, hands }) {
  const entry = lesson.vocabulary?.[challenge.vocabulary];
  const choices = challenge.choices ?? [];
  const angles = dialAngles(choices.length);
  const chosenAt = choices.findIndex((choice) => hands.selected.includes(choice.id));
  const pointerAt = chosenAt >= 0 ? angles[chosenAt] : -90;

  // The slip is a tag on the box, not the page: it names the word and where in
  // the excerpt it was used, and stops there. Printing the line here would hand
  // over the evidence for nothing, and a nudge would then buy what the screen
  // had already given away. Reread, rewind and a nudge remain the ways to the line.
  const box = el("div", { class: "strongbox" }, [
    keyholeMark(),
    entry && Number.isInteger(entry.line)
      ? el("div", { class: "strongbox__slip" }, [
          el("p", { class: "strongbox__from" }, [label(UI.fromLine(entry.line))]),
          el("p", { class: "strongbox__word", text: entry.word })
        ])
      : null
  ]);

  const plates = el("ul", { class: "plates", "aria-label": UI.lockPositions });
  for (const [position, choice] of choices.entries()) {
    plates.append(
      choiceSlot(choice, hands, {
        kind: "dial",
        content: [
          dialMark(angles[position]),
          el("span", { class: "choice__label", text: quote(choice.label) })
        ]
      })
    );
  }

  // The pointer turns to the position the reader picked; the ring is the same
  // element between clicks, so the turn is a movement rather than a redraw.
  const face = dialFace(angles, chosenAt, pointerAt);
  hands.onRefresh.push((selected) => {
    const at = choices.findIndex((choice) => selected.includes(choice.id));
    const pointer = face.querySelector(".dial__pointer");
    if (pointer) {
      pointer.style.transform = `rotate(${round(at >= 0 ? angles[at] : -90)}deg)`;
    }
    for (const [position, detent] of [...face.querySelectorAll(".dial__detent")].entries()) {
      detent.dataset.set = String(position === at);
    }
    face.dataset.set = String(at >= 0);
  });

  return el("div", { class: "lock" }, [box, el("div", { class: "dial" }, [face, plates])]);
}

/** A brass ring with a position for each choice, and a pointer that turns to it. */
function dialFace(angles, chosenAt, pointerAt) {
  const face = el("span", {
    class: "dial__face",
    "aria-hidden": "true",
    dataset: { set: String(chosenAt >= 0) }
  });
  // The viewBox starts at 0,0 and the ring is drawn about its middle: browsers
  // disagree about where "50% 50%" lands in a viewBox with a negative origin,
  // and the pointer has to turn about the keyhole in every one of them.
  const ticks = angles
    .map(
      (angle, position) =>
        `<circle class="dial__detent" data-set="${position === chosenAt}" ` +
        `cx="${round(CENTRE + Math.cos(rad(angle)) * 78)}" ` +
        `cy="${round(CENTRE + Math.sin(rad(angle)) * 78)}" r="10"/>`
    )
    .join("");
  face.innerHTML =
    `<svg viewBox="0 0 ${CENTRE * 2} ${CENTRE * 2}" focusable="false">` +
    `<circle class="dial__plate" cx="${CENTRE}" cy="${CENTRE}" r="100"/>` +
    `<circle class="dial__groove" cx="${CENTRE}" cy="${CENTRE}" r="86"/>` +
    ticks +
    `<g class="dial__pointer" style="transform: rotate(${round(pointerAt)}deg)">` +
    `<path d="M${CENTRE} ${CENTRE - 7} L${CENTRE + 70} ${CENTRE} L${CENTRE} ${CENTRE + 7} Z"/></g>` +
    `<circle class="dial__hub" cx="${CENTRE}" cy="${CENTRE}" r="20"/>` +
    `<path class="dial__keyway" d="M${CENTRE} ${CENTRE - 8} a6 6 0 1 1 0 12 l3 9 h-6 l3 -9 ` +
    'a6 6 0 1 1 0 -12 z"/>' +
    "</svg>";
  return face;
}

function dialMark(angle) {
  const mark = el("span", { class: "dial__mark", "aria-hidden": "true" });
  mark.innerHTML =
    '<svg viewBox="-12 -12 24 24" focusable="false"><circle class="dial__mark-ring" r="10"/>' +
    `<line class="dial__mark-arm" x1="0" y1="0" x2="${round(Math.cos(rad(angle)) * 9)}" ` +
    `y2="${round(Math.sin(rad(angle)) * 9)}"/></svg>`;
  return mark;
}

function keyholeMark() {
  const mark = el("span", { class: "strongbox__lock", "aria-hidden": "true" });
  mark.innerHTML =
    '<svg viewBox="0 0 40 46" focusable="false">' +
    '<path class="strongbox__shackle" d="M11 20 V14 a9 9 0 0 1 18 0 V20"/>' +
    '<rect class="strongbox__case" x="5" y="20" width="30" height="24" rx="2"/>' +
    '<path class="strongbox__keyway" d="M20 27 a3.4 3.4 0 1 1 0 7 l1.8 5.4h-3.6L20 34 a3.4 3.4 0 1 1 0 -7z"/>' +
    "</svg>";
  return mark;
}

/* ------------------------------------------------- objects and portraits */

function chooserStage(challenge, { lesson, hands }, className) {
  const list = el("ul", { class: className });
  for (const choice of challenge.choices ?? []) {
    const isPortrait = choice.kind === "portrait";
    list.append(
      choiceSlot(choice, hands, {
        kind: choice.kind,
        content: isPortrait
          ? [cameo(), el("span", { class: "choice__label", text: quote(lesson.people[choice.ref].role) })]
          : [tagMark(), el("span", { class: "choice__label", text: quote(lesson.objects[choice.ref].label) })]
      })
    );
  }
  return list;
}

function tagMark() {
  const mark = el("span", { class: "object__tag", "aria-hidden": "true" });
  mark.innerHTML =
    '<svg viewBox="0 0 34 24" focusable="false">' +
    '<path class="object__tag-body" d="M9 2 H31 a1.6 1.6 0 0 1 1.6 1.6 V20.4 A1.6 1.6 0 0 1 31 22 H9 L1.6 12 Z"/>' +
    '<circle class="object__tag-eye" cx="8" cy="12" r="2.1"/></svg>';
  return mark;
}

/* --------------------------------------------------------------- the lines */

/**
 * Citing happens with the page open — the one action the PRD lets the text stay
 * on screen for. The excerpt is laid out whole and the candidate lines are the
 * slips: nothing is lettered, the reader points at a line by its number.
 */
function citationStage(challenge, { lesson, excerpt, state, hands }) {
  const candidates = new Map((challenge.choices ?? []).map((choice) => [choice.line, choice]));
  const passage = el("div", { class: "passage" });

  for (const { n, text, startsParagraph } of excerptLines(excerpt.id)) {
    const choice = candidates.get(n);
    if (!choice) {
      passage.append(
        el("p", { class: "line", dataset: { paragraph: startsParagraph ? "start" : "run" } }, [
          el("span", { class: "line-number", text: String(n) }),
          el("span", { class: "line-text", text })
        ])
      );
      continue;
    }
    passage.append(
      choiceSlot(choice, hands, {
        kind: "line",
        element: "p",
        class: "line line--slip",
        dataset: { paragraph: startsParagraph ? "start" : "run" },
        content: [
          el("span", { class: "line-number", text: String(n) }),
          el("span", { class: "line-text", text })
        ]
      })
    );
  }

  const page = el("article", { class: "page page--cite" }, [
    el("header", { class: "page-head" }, [
      el("h2", { class: "page-head__excerpt", text: `${UI.excerpt} ${excerpt.roman}` }),
      el("div", { class: "page-head__meta" }, [
        el("p", { class: "page-head__lines" }, [
          label(`${UI.lines} ${excerpt.lines[0]}–${excerpt.lines[1]}`)
        ])
      ])
    ]),
    passage
  ]);

  return el("div", { class: "citation" }, [page, caseNotes(lesson, state)]);
}

/** The corner note stack: every line the reader has written into the case. */
function caseNotes(lesson, state) {
  const lines = citedLines(state.cited);
  const list = el("ol", { class: "notes__list" });
  for (const n of lines) {
    list.append(
      el("li", { class: "notes__entry" }, [
        label(UI.lineNumber(n), { class: "notes__line" }),
        el("span", { class: "notes__text", text: line(n) })
      ])
    );
  }
  return el("aside", { class: "notes" }, [
    el("h2", { class: "notes__title", text: UI.caseNotes }),
    lines.length === 0 ? el("p", { class: "notes__empty", text: UI.caseNotesEmpty }) : list
  ]);
}

/* ----------------------------------------------------------- a single choice */

/**
 * One choice: the thing itself, and a corner mark that rules it out. The rule-out
 * is a separate control beside the choice, never inside it, so a keyboard reaches
 * both and neither swallows the other's click.
 */
function choiceSlot(choice, hands, { kind, content, element = "li", class: className, dataset }) {
  const isStruck = hands.struck.includes(choice.id);
  const isSelected = hands.selected.includes(choice.id);
  // "Full" only counts when several marks are asked for: where one is wanted,
  // the next click simply moves the mark, so no choice is ever put beyond reach.
  const full = hands.targets > 1 && !isSelected && hands.selected.length >= hands.targets;

  const control = button(null, () => hands.choose(choice.id), {
    class: "choice",
    dataset: { kind },
    "aria-pressed": String(isSelected)
  });
  control.append(...content);
  control.disabled = isStruck || hands.solved === true;

  const ruleOut = button(strikeMark(), () => hands.strike(choice.id), {
    class: "strike",
    "aria-pressed": String(isStruck),
    title: isStruck ? UI.bringBack : UI.ruleOut,
    "aria-label": isStruck ? UI.bringBack : UI.ruleOut
  });
  ruleOut.disabled = hands.solved === true;
  ruleOut.hidden = hands.solved === true;

  const slot = el(
    element,
    {
      class: ["choice-slot", className].filter(Boolean).join(" "),
      dataset: {
        ...(dataset ?? {}),
        choice: choice.id,
        struck: String(isStruck),
        selected: String(isSelected),
        full: String(full && !isStruck)
      }
    },
    [control, ruleOut]
  );
  hands.slots.set(choice.id, { slot, control });
  return slot;
}

function strikeMark() {
  const mark = el("span", { class: "strike__mark", "aria-hidden": "true" });
  mark.innerHTML =
    '<svg viewBox="0 0 16 16" focusable="false"><path d="M3.4 3.4 L12.6 12.6 M12.6 3.4 L3.4 12.6"/></svg>';
  return mark;
}

/* ---------------------------------------------------------------- the shared */

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
  return isAttempted(state, challengeId);
}

/** A choice in words, for the settled strip: a dial label, an object, a role. */
function plainLabel(choice, lesson) {
  switch (choice.kind) {
    case "dial":
      return quote(choice.label);
    case "object":
      return quote(lesson.objects[choice.ref].label);
    case "portrait":
      return quote(lesson.people[choice.ref].role);
    case "line":
      return `${UI.lineNumber(choice.line)} — ${line(choice.line)}`;
    default:
      return "";
  }
}

function rad(degrees) {
  return (degrees * Math.PI) / 180;
}

function round(value) {
  return Math.round(value * 100) / 100;
}
