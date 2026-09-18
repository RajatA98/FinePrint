// The words this excerpt turns on, laid out as index cards on the desk before
// the book opens. Keys, not questions: nothing on this screen is graded and
// nothing here dispatches a scoring action.

import { quote } from "../lesson.js";
import { UI } from "../ui-strings.js";
import { el, label, screenShell, nextButton, currentExcerpt } from "./chrome.js";

export function render(root, ctx) {
  const { index, excerpt, count } = currentExcerpt(ctx);
  const section = screenShell(root, ctx, {
    heading: `${UI.excerpt} ${excerpt.roman} ${UI.of} ${count}`
  });
  section.append(el("p", { class: "screen-note", text: UI.nothingScored }));

  const list = el("ul", { class: "cards" });
  for (const vocabularyId of excerpt.vocabulary ?? []) {
    const entry = ctx.lesson.vocabulary?.[vocabularyId];
    if (!entry) {
      continue;
    }
    list.append(
      el("li", { class: "card", dataset: { vocabulary: vocabularyId } }, [
        el("h2", { class: "card__word", text: entry.word }),
        el("p", { class: "card__gloss", text: quote(entry.gloss) }),
        Number.isInteger(entry.line)
          ? el("p", { class: "card__line" }, [label(`${UI.line} ${entry.line}`)])
          : null
      ])
    );
  }

  section.append(list, nextButton(ctx, { screen: "read", excerpt: index }, UI.readExcerpt));
}
