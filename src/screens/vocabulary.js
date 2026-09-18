// The words this excerpt turns on, before the excerpt is read.

import { quote } from "../lesson.js";
import { UI } from "../ui-strings.js";
import { el, screenShell, nextButton, currentExcerpt } from "./chrome.js";

export function render(root, ctx) {
  const { index, excerpt } = currentExcerpt(ctx);
  const section = screenShell(root, ctx, { heading: `${UI.excerpt} ${excerpt.roman}` });

  const list = el("ul", { class: "vocabulary" });
  for (const vocabularyId of excerpt.vocabulary ?? []) {
    const entry = ctx.lesson.vocabulary[vocabularyId];
    list.append(
      el("li", { dataset: { vocabulary: vocabularyId } }, [
        el("span", { class: "word", text: entry.word }),
        el("span", { class: "gloss", text: quote(entry.gloss) })
      ])
    );
  }
  section.append(list, nextButton(ctx, { screen: "read", excerpt: index }));
}
