// The case board.
//
// The whole afternoon at once, and the book is shut for it. Nothing here is a
// form: three portraits wait for a brass name plate, seven paper slips wait for
// one of four pins, and a portrait is accused by running a thread round it. The
// board is one physical plane and every gesture on it is a hand movement — a
// plate seated, a pin pushed in, a seal pressed — because this is the moment the
// reader is a detective rather than a candidate.
//
// It is one scored item. This file dispatches FINALE_PERSON, FINALE_CLUE,
// FINALE_CULPRIT and FINALE_SUBMIT and writes nothing itself; the reducer grades
// the board when the seal is pressed, and a refused seal costs nothing.
//
// The reader's own work is on the board on purpose: a slip whose line they cited
// earlier carries their oxblood mark, and every line they cited during the case
// is laid out beneath the slips. Oxblood belongs to the reader — their citation,
// their thread round the accused — and the board never borrows it.

import { quote, line } from "../lesson.js";
import { UI } from "../ui-strings.js";
import { el, button, label, cameo, screenShell, nextButton, closedBookMark } from "./chrome.js";
import { attempted } from "./challenge.js";
import { citedLines, finaleOutcome, pinsLeft, openBlank } from "./challenge-view.js";

const ITEM = "finale-reconstruct";

// The portrait the reader is naming, and how many attempts had been made when
// the board was last drawn. Neither is scoring state and neither is persisted:
// the board reopens on the first portrait still without a plate, and the refused
// seal shakes once, on the draw that follows the press. A board that is merely
// reopened at a refusal — a reload, or coming back to it — does not shake: the
// board moves when the reader's hand moves, and not otherwise.
let pointedAt = null;
let drawnAfter = null;

export function render(root, ctx) {
  const { lesson, state } = ctx;
  const reconstruct = lesson.finale.reconstruct;
  const prompts = reconstruct.people ?? [];
  const clues = reconstruct.clues ?? [];
  const required = Number.isInteger(reconstruct.required) ? reconstruct.required : 4;
  const outcome = finaleOutcome(state, lesson);
  const sealed = outcome === "solved";
  const redraw = () => render(root, ctx);

  const tried = state.attempts.length;
  const justPressed = drawnAfter !== null && tried > drawnAfter;
  drawnAfter = tried;

  const section = screenShell(root, ctx, { heading: null, mark: closedBookMark() });

  const board = el("div", {
    class: "board",
    dataset: {
      outcome,
      sealed: String(sealed),
      shake: justPressed && outcome === "again" ? "once" : null
    }
  });

  board.append(
    namingRegion(ctx, { prompts, sealed, redraw }),
    slipsRegion(ctx, { clues, required, sealed }),
    culpritRegion(ctx, { culprit: reconstruct.culprit, sealed }),
    notesRegion(ctx),
    sealRegion(ctx, { outcome })
  );

  section.append(board);
  if (attempted(state, ITEM)) {
    section.append(nextButton(ctx, { screen: "statement", excerpt: 1 }));
  }
}

/* ------------------------------------------------- the portraits and plates */

/**
 * Three portraits with no names under them, and the tray of plates for whichever
 * one the reader is pointing at. The tray shows one portrait's plates at a time
 * because naming is the task: the options are the help, not the answer.
 */
function namingRegion(ctx, { prompts, sealed, redraw }) {
  const { lesson, state, dispatch } = ctx;
  const named = state.finale.people ?? {};
  const active = openBlank(
    prompts.map((prompt) => ({ id: prompt.cameo })),
    named,
    pointedAt
  );

  const row = el("ul", { class: "cameos" });
  for (const prompt of prompts) {
    const personId = named[prompt.cameo] ?? null;
    const isActive = prompt.cameo === active;
    const pick = button(
      null,
      () => {
        pointedAt = prompt.cameo;
        redraw(); // pointing at a portrait is not an answer: nothing is dispatched
      },
      {
        class: "cameo-card__pick",
        "aria-pressed": String(isActive),
        "aria-label": personId ? `${UI.nameSet}: ${lesson.people[personId].name}` : UI.whoWasHere
      }
    );
    pick.disabled = sealed;
    pick.append(cameo(), namePlate(personId ? lesson.people[personId].name : null));

    row.append(
      el(
        "li",
        {
          class: "cameo-card",
          dataset: { active: String(isActive), named: String(Boolean(personId)) }
        },
        [pick]
      )
    );
  }

  const region = el("section", { class: "board__region board__names" }, [
    el("h2", { class: "region__title" }, [label(UI.whoWasHere)]),
    row
  ]);

  const prompt = prompts.find((candidate) => candidate.cameo === active);
  if (prompt && !sealed) {
    region.append(plateTray(ctx, { prompt, chosen: named[prompt.cameo] ?? null, dispatch }));
  }
  return region;
}

/** The brass blank under a portrait, engraved once a plate is seated in it. */
function namePlate(name) {
  return el("span", { class: "plate", dataset: { set: String(Boolean(name)) } }, [
    name ? el("span", { class: "plate__name", text: name }) : null
  ]);
}

/** The small tray of plates that belongs to the portrait being named. */
function plateTray(ctx, { prompt, chosen, dispatch }) {
  const { lesson } = ctx;
  const plates = el("ul", { class: "tray__plates" });
  for (const personId of prompt.options ?? []) {
    plates.append(
      el("li", { class: "tray__slot" }, [
        button(
          lesson.people[personId].name,
          () => {
            // The next portrait without a plate is the one the tray turns to.
            pointedAt = null;
            dispatch({ type: "FINALE_PERSON", cameo: prompt.cameo, personId });
          },
          { class: "name-plate", "aria-pressed": String(chosen === personId) }
        )
      ])
    );
  }
  return el("div", { class: "tray" }, [
    el("p", { class: "tray__title" }, [label(UI.nameTray)]),
    el("p", { class: "tray__ask", text: quote(prompt.prompt) }),
    plates
  ]);
}

/* ------------------------------------------------------ the slips and pins */

/**
 * Seven slips of the afternoon's own words, and four pins in a tin. The count is
 * the tin, not a tally: when the pins are gone the remaining slips will not take
 * one, and the way to move a pin is to take it back out.
 */
function slipsRegion(ctx, { clues, required, sealed }) {
  const { lesson, state, dispatch } = ctx;
  const pinned = state.finale.clues ?? [];
  const left = pinsLeft(pinned, required);
  const yours = new Set(citedLines(state.cited));

  const list = el("ul", { class: "slips", dataset: { thread: String(sealed) } });
  for (const clue of clues) {
    const isPinned = pinned.includes(clue.id);
    const mine = yours.has(clue.line);
    const noPin = !isPinned && left === 0;

    const pick = button(null, () => dispatch({ type: "FINALE_CLUE", clueId: clue.id }), {
      class: "slip__pick",
      "aria-pressed": String(isPinned)
    });
    pick.disabled = sealed || noPin;
    pick.append(
      pinMark(),
      el("span", { class: "slip__head" }, [
        label(UI.lineNumber(clue.line), { class: "slip__line" }),
        el("span", { class: "slip__whose", text: speakerOf(lesson, clue) }),
        mine ? label(UI.inYourNotes, { class: "slip__mine" }) : null
      ]),
      el("span", { class: "slip__text", text: line(clue.line) })
    );

    list.append(
      el(
        "li",
        {
          class: "slip",
          dataset: {
            clue: clue.id,
            pinned: String(isPinned),
            mine: String(mine),
            spare: String(noPin)
          }
        },
        [pick]
      )
    );
  }

  return el("section", { class: "board__region board__slips" }, [
    el("div", { class: "region__head" }, [
      el("h2", { class: "region__title" }, [label(UI.clueSlips)]),
      pinTin(left, required)
    ]),
    list,
    left === 0 && !sealed ? el("p", { class: "slips__note", text: UI.noPinsLeft }) : null
  ]);
}

/** The pins themselves, in their tin. Four of them, and you can see them go. */
function pinTin(left, required) {
  const tin = el("p", { class: "tin", dataset: { left: String(left) } });
  const pins = el("span", { class: "tin__pins", "aria-hidden": "true" });
  for (let position = 0; position < required; position += 1) {
    pins.append(el("span", { class: "tin__pin", dataset: { spent: String(position >= left) } }));
  }
  tin.append(pins, label(UI.pinsLeft(left, required), { class: "tin__label" }));
  return tin;
}

function pinMark() {
  const mark = el("span", { class: "slip__pin", "aria-hidden": "true" });
  mark.innerHTML =
    '<svg viewBox="0 0 22 22" focusable="false">' +
    '<path class="slip__pin-shaft" d="M12.6 11.4 L18.4 19.6"/>' +
    '<circle class="slip__pin-head" cx="9.6" cy="8.4" r="6"/>' +
    '<circle class="slip__pin-shine" cx="7.6" cy="6.4" r="1.9"/></svg>';
  return mark;
}

/** Whose words a slip is: the role the story gives them, never the name. */
function speakerOf(lesson, clue) {
  return clue.speaker === "narration" ? UI.narration : quote(lesson.people[clue.speaker].role);
}

/* ------------------------------------------------------------- the accused */

/** The one loud question on the board, and a thread run round the answer. */
function culpritRegion(ctx, { culprit, sealed }) {
  const { lesson, state, dispatch } = ctx;
  const accused = state.finale.culprit ?? null;

  const row = el("ul", { class: "suspects" });
  for (const personId of culprit.options ?? []) {
    const isAccused = personId === accused;
    const pick = button(null, () => dispatch({ type: "FINALE_CULPRIT", personId }), {
      class: "suspect__pick",
      "aria-pressed": String(isAccused)
    });
    pick.disabled = sealed;
    pick.append(
      el("span", { class: "suspect__ring" }, [cameo()]),
      el("span", { class: "suspect__role", text: quote(lesson.people[personId].role) })
    );
    row.append(
      el("li", { class: "suspect", dataset: { accused: String(isAccused) } }, [pick])
    );
  }

  return el("section", { class: "board__region board__culprit" }, [
    el("p", { class: "culprit__ask", text: quote(culprit.prompt) }),
    row
  ]);
}

/* ------------------------------------------------- the reader's own lines */

/** Every line the reader put their name to during the case, brought forward. */
function notesRegion(ctx) {
  const { state } = ctx;
  const lines = citedLines(state.cited);
  const region = el("section", { class: "board__region board__notes" }, [
    el("h2", { class: "region__title" }, [label(UI.yourNotes)])
  ]);
  if (lines.length === 0) {
    region.append(el("p", { class: "board__notes-empty", text: UI.caseNotesEmpty }));
    return region;
  }
  const list = el("ol", { class: "board__cited" });
  for (const n of lines) {
    list.append(
      el("li", { class: "cited" }, [
        label(UI.lineNumber(n), { class: "cited__line" }),
        el("span", { class: "cited__text", text: line(n) })
      ])
    );
  }
  region.append(list);
  return region;
}

/* ---------------------------------------------------------------- the seal */

/**
 * The case is closed by pressing a seal, not by submitting a form. A seal that
 * will not take costs nothing and can be pressed again; a seal that takes in
 * part says so in Inkwell's hand and the way onward stays open either way.
 */
function sealRegion(ctx, { outcome }) {
  const { dispatch } = ctx;
  const region = el("section", { class: "board__region board__seal" });

  if (outcome === "solved") {
    region.append(
      el("p", { class: "stamp", dataset: { state: "closed" } }, [
        label(UI.sealClosed, { class: "stamp__word" })
      ])
    );
  } else {
    const press = button(null, () => dispatch({ type: "FINALE_SUBMIT", at: Date.now() }), {
      class: "seal"
    });
    press.append(sealMark(), el("span", { class: "seal__word", text: UI.closeTheCase }));
    region.append(press);
  }

  if (outcome === "partial" || outcome === "again") {
    region.append(
      el("p", {
        class: "seal__note",
        dataset: { outcome },
        text: outcome === "partial" ? UI.sealPartial : UI.sealAgain
      })
    );
  }
  return region;
}

function sealMark() {
  const mark = el("span", { class: "seal__wax", "aria-hidden": "true" });
  mark.innerHTML =
    '<svg viewBox="0 0 48 48" focusable="false">' +
    '<circle class="seal__disc" cx="24" cy="24" r="20"/>' +
    '<circle class="seal__rim" cx="24" cy="24" r="15.5"/>' +
    '<path class="seal__device" d="M24 13.5 L27.4 20.6 L35.2 21.7 L29.6 27.2 L30.9 35 ' +
    'L24 31.3 L17.1 35 L18.4 27.2 L12.8 21.7 L20.6 20.6 Z"/></svg>';
  return mark;
}
