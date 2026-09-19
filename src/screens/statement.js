// The closing statement.
//
// The conclusion is already written out in the reading face, with the load-bearing
// words left out of it. Each gap is a brass-edged blank; pointing at one brings
// its words up in the tray as letterpress tiles, and clicking a tile sets it into
// the line. Nothing is typed and nothing is chosen from a list — the reader is
// setting words into a sentence, which is the thing the sentence is testing.
//
// One scored item. This file dispatches STATEMENT_SET and STATEMENT_SUBMIT and
// nothing else; a sentence that does not hold can be reset and signed again, and
// the way to the report is open as soon as the reader has signed once.

import { quote } from "../lesson.js";
import { UI } from "../ui-strings.js";
import { el, button, label, screenShell, nextButton, closedBookMark } from "./chrome.js";
import { attempted } from "./challenge.js";
import { FINALE_STATEMENT as ITEM } from "../state/grade.js";
import { blanksLeft, openBlank, dealt } from "./challenge-view.js";

const SLOT = /\{([^{}]+)\}/g;

// The blank the reader is filling. Not scoring state, never persisted: the page
// opens on the first blank still empty.
let pointedAt = null;

export function render(root, ctx) {
  const { lesson, state, dispatch } = ctx;
  const closing = lesson.finale.statement;
  const slots = closing.slots ?? [];
  const chosen = state.finale.statement ?? {};
  const signed = Boolean(state.solved[ITEM]);
  const tried = attempted(state, ITEM);
  const left = blanksLeft(slots, chosen);
  const active = signed ? null : openBlank(slots, chosen, pointedAt);
  const redraw = () => render(root, ctx);

  const section = screenShell(root, ctx, { heading: null, mark: closedBookMark() });

  const sentence = el("p", { class: "statement__line" });
  const template = quote(closing.template);
  let cursor = 0;
  let position = 0;
  for (const match of template.matchAll(SLOT)) {
    if (match.index > cursor) {
      sentence.append(document.createTextNode(template.slice(cursor, match.index)));
    }
    position += 1;
    sentence.append(
      blank(ctx, { slots, slotId: match[1], chosen, active, signed, position, redraw })
    );
    cursor = match.index + match[0].length;
  }
  if (cursor < template.length) {
    sentence.append(document.createTextNode(template.slice(cursor)));
  }

  const paper = el("article", { class: "statement", dataset: { signed: String(signed) } }, [
    el("header", { class: "statement__head" }, [
      el("h1", { class: "statement__title", text: UI.setTheWords })
    ]),
    sentence,
    signingLine(ctx, { left, signed, tried })
  ]);

  const desk = el("div", { class: "statement-desk" }, [
    paper,
    wordTray(ctx, { slots, active, chosen, signed })
  ]);

  section.append(desk);
  if (tried) {
    section.append(nextButton(ctx, { screen: "report", excerpt: 1 }));
  }
}

/* --------------------------------------------------------------- the blank */

/** A gap in the line: brass-edged and empty, or the word the reader set in it. */
function blank(ctx, { slots, slotId, chosen, active, signed, position, redraw }) {
  const { lesson } = ctx;
  const slot = slots.find((candidate) => candidate.id === slotId);
  if (!slot) {
    return document.createTextNode(`{${slotId}}`);
  }
  const vocabularyId = chosen[slotId] ?? null;
  const word = vocabularyId ? lesson.vocabulary[vocabularyId].word : null;

  const control = button(
    null,
    () => {
      pointedAt = slotId;
      redraw(); // pointing at a blank is not an answer: nothing is dispatched
    },
    {
      class: "blank",
      "aria-pressed": String(slotId === active),
      "aria-label": word ? `${UI.blankAria(position)}: ${word}` : UI.blankAria(position)
    }
  );
  control.disabled = signed;
  control.dataset.set = String(Boolean(word));
  control.dataset.open = String(slotId === active);
  control.append(
    word
      ? el("span", { class: "blank__word", text: word })
      : el("span", { class: "blank__rule", "aria-hidden": "true" })
  );
  return control;
}

/* ----------------------------------------------------------- the word tray */

/** The type case: the words that belong to the blank the reader is filling. */
function wordTray(ctx, { slots, active, chosen, signed }) {
  const { lesson, dispatch } = ctx;
  const tray = el("aside", { class: "words" }, [
    el("h2", { class: "words__title" }, [label(UI.wordTray)])
  ]);

  // Signed: the type stays in the stick, set and no longer loose in the case.
  if (signed) {
    const set = el("ul", { class: "words__tiles" });
    for (const slot of slots) {
      const vocabularyId = chosen[slot.id];
      if (!vocabularyId) {
        continue;
      }
      const tile = button(lesson.vocabulary[vocabularyId].word, () => {}, {
        class: "tile",
        "aria-pressed": "true"
      });
      tile.disabled = true;
      set.append(el("li", { class: "words__slot" }, [tile]));
    }
    tray.append(set, el("p", { class: "words__note", text: UI.wordsSet }));
    return tray;
  }

  const slot = slots.find((candidate) => candidate.id === active);
  if (!slot) {
    tray.append(el("p", { class: "words__note", text: UI.chooseBlank }));
    return tray;
  }

  const tiles = el("ul", { class: "words__tiles" });
  for (const option of dealt(slot.options, slot.id)) {
    const set = chosen[slot.id] === option.vocabulary;
    const tile = button(
      lesson.vocabulary[option.vocabulary].word,
      () => {
        // The next blank still open is the one the tray turns to.
        pointedAt = null;
        dispatch({ type: "STATEMENT_SET", slotId: slot.id, vocabularyId: option.vocabulary });
      },
      { class: "tile", "aria-pressed": String(set) }
    );
    tile.disabled = signed;
    tiles.append(el("li", { class: "words__slot" }, [tile]));
  }

  tray.append(tiles, el("p", { class: "words__note", text: UI.chooseBlank }));
  return tray;
}

/* ----------------------------------------------------------- the signature */

/**
 * The foot of the page: a ruled line to sign on. The line is signed when every
 * blank is set; until then the rule says what is still out, and a sentence that
 * does not hold gets Inkwell's note in the margin and can be signed again.
 */
function signingLine(ctx, { left, signed, tried }) {
  const { dispatch } = ctx;
  const foot = el("div", { class: "statement__foot" });

  if (signed) {
    foot.append(
      el("p", { class: "signature", dataset: { state: "signed" } }, [
        el("span", { class: "signature__rule", "aria-hidden": "true" }),
        label(UI.statementSigned, { class: "signature__word" })
      ])
    );
    return foot;
  }

  const sign = button(UI.signStatement, () => dispatch({ type: "STATEMENT_SUBMIT", at: Date.now() }), {
    class: "sign"
  });
  sign.disabled = left > 0;
  foot.append(
    el("p", { class: "signature", dataset: { state: left > 0 ? "open" : "ready" } }, [
      el("span", { class: "signature__rule", "aria-hidden": "true" }),
      sign
    ])
  );
  if (left > 0) {
    foot.append(el("p", { class: "statement__margin", text: UI.blanksLeft(left) }));
  } else if (tried) {
    foot.append(
      el("p", { class: "statement__margin", dataset: { note: "again" }, text: UI.statementAgain })
    );
  }
  return foot;
}
