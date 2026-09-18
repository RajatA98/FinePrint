// The whole afternoon at once: who was in the house, which lines prove it, and who
// did it. One scored item, graded by the reducer when Submit is pressed.

import { quote, line } from "../lesson.js";
import { UI } from "../ui-strings.js";
import { el, button, screenShell, nextButton } from "./chrome.js";
import { attempted } from "./challenge.js";

const ITEM = "finale-reconstruct";

export function render(root, ctx) {
  const { lesson, state, dispatch } = ctx;
  const reconstruct = lesson.finale.reconstruct;
  const section = screenShell(root, ctx, { heading: null });

  for (const prompt of reconstruct.people ?? []) {
    section.append(
      personPicker(lesson, {
        id: `cameo-${prompt.cameo}`,
        promptId: prompt.prompt,
        options: prompt.options,
        value: state.finale.people[prompt.cameo] ?? "",
        onPick: (personId) => dispatch({ type: "FINALE_PERSON", cameo: prompt.cameo, personId })
      })
    );
  }

  const clues = el("ul", { class: "clues" });
  for (const clue of reconstruct.clues ?? []) {
    const box = el("input", {
      type: "checkbox",
      id: `clue-${clue.id}`,
      onchange: () => dispatch({ type: "FINALE_CLUE", clueId: clue.id })
    });
    box.checked = state.finale.clues.includes(clue.id);
    clues.append(
      el("li", { dataset: { clue: clue.id } }, [
        box,
        el("label", { for: `clue-${clue.id}` }, [
          el("span", { class: "line-number", text: String(clue.line) }),
          el("span", { class: "line-text", text: line(clue.line) })
        ]),
        el("span", { class: "whose-words", title: UI.whoseWords, text: speakerOf(lesson, clue) })
      ])
    );
  }
  section.append(clues);

  section.append(
    personPicker(lesson, {
      id: "culprit",
      promptId: reconstruct.culprit.prompt,
      options: reconstruct.culprit.options,
      value: state.finale.culprit ?? "",
      onPick: (personId) => dispatch({ type: "FINALE_CULPRIT", personId })
    })
  );

  section.append(
    button(UI.submit, () => dispatch({ type: "FINALE_SUBMIT", at: Date.now() }), { class: "submit" })
  );

  if (attempted(state, ITEM)) {
    section.append(
      el("p", {
        class: "outcome",
        dataset: { outcome: state.finale.solved ? "solved" : "again" },
        text: state.finale.solved ? UI.solved : UI.notYet
      }),
      nextButton(ctx, { screen: "statement", excerpt: 1 })
    );
  }
}

function personPicker(lesson, { id, promptId, options, value, onPick }) {
  const select = el("select", { id, onchange: (event) => onPick(event.target.value) });
  select.append(el("option", { value: "", text: UI.choose }));
  for (const personId of options ?? []) {
    select.append(el("option", { value: personId, text: lesson.people[personId].name }));
  }
  select.value = value;
  return el("p", { class: "picker" }, [
    el("label", { for: id, text: quote(promptId) }),
    select
  ]);
}

function speakerOf(lesson, clue) {
  return clue.speaker === "narration" ? UI.narration : lesson.people[clue.speaker].name;
}
