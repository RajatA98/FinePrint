// The book is open. Nothing is asked here; the clock starts and stops, once each.

import { excerptLines } from "../lesson.js";
import { UI } from "../ui-strings.js";
import { el, button, screenShell, currentExcerpt } from "./chrome.js";

export function render(root, ctx) {
  const { index, excerpt } = currentExcerpt(ctx);
  const { state, dispatch, navigate } = ctx;

  if (!state.reading[excerpt.id]?.startedAt) {
    dispatch({ type: "READ_START", excerptId: excerpt.id, at: Date.now() });
  }

  const section = screenShell(root, ctx, { heading: `${UI.excerpt} ${excerpt.roman}` });
  const passage = el("div", { class: "measure passage" });
  for (const { n, text, startsParagraph } of excerptLines(excerpt.id)) {
    passage.append(
      el("p", { class: "line", dataset: { paragraph: startsParagraph ? "start" : "run" } }, [
        el("span", { class: "line-number", text: String(n) }),
        el("span", { class: "line-text", text })
      ])
    );
  }

  section.append(
    passage,
    button(
      UI.closeBook,
      () => {
        dispatch({ type: "READ_END", excerptId: excerpt.id, at: Date.now() });
        navigate({ screen: "lock", excerpt: index });
      },
      { class: "close-book" }
    )
  );
}
