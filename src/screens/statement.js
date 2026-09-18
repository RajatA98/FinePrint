// The closing statement: the authored sentence with its words left out, filled from
// the case vocabulary. One scored item.

import { quote } from "../lesson.js";
import { UI } from "../ui-strings.js";
import { el, button, screenShell, nextButton } from "./chrome.js";
import { attempted } from "./challenge.js";

const ITEM = "finale-statement";
const SLOT = /\{([^{}]+)\}/g;

export function render(root, ctx) {
  const { lesson, state, dispatch } = ctx;
  const closing = lesson.finale.statement;
  const section = screenShell(root, ctx, { heading: null });

  const sentence = el("p", { class: "measure statement" });
  const template = quote(closing.template);
  let cursor = 0;
  for (const match of template.matchAll(SLOT)) {
    if (match.index > cursor) {
      sentence.append(document.createTextNode(template.slice(cursor, match.index)));
    }
    sentence.append(slotPicker(lesson, closing, match[1], state, dispatch));
    cursor = match.index + match[0].length;
  }
  if (cursor < template.length) {
    sentence.append(document.createTextNode(template.slice(cursor)));
  }

  section.append(
    sentence,
    button(UI.submit, () => dispatch({ type: "STATEMENT_SUBMIT", at: Date.now() }), {
      class: "submit"
    })
  );

  if (attempted(state, ITEM)) {
    section.append(
      el("p", {
        class: "outcome",
        dataset: { outcome: state.solved[ITEM] ? "solved" : "again" },
        text: state.solved[ITEM] ? UI.solved : UI.notYet
      }),
      nextButton(ctx, { screen: "report", excerpt: 1 })
    );
  }
}

function slotPicker(lesson, closing, slotId, state, dispatch) {
  const slot = (closing.slots ?? []).find((candidate) => candidate.id === slotId);
  if (!slot) {
    return document.createTextNode(`{${slotId}}`);
  }
  const select = el("select", {
    class: "slot",
    dataset: { slot: slotId },
    onchange: (event) =>
      dispatch({ type: "STATEMENT_SET", slotId, vocabularyId: event.target.value })
  });
  select.append(el("option", { value: "", text: UI.choose }));
  for (const option of slot.options ?? []) {
    select.append(
      el("option", { value: option.vocabulary, text: lesson.vocabulary[option.vocabulary].word })
    );
  }
  select.value = state.finale.statement[slotId] ?? "";
  return select;
}
