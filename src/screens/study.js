// The study: the case is on the desk, unopened.

import { UI } from "../ui-strings.js";
import { el, button, screenShell } from "./chrome.js";

export function render(root, ctx) {
  const section = screenShell(root, ctx, { heading: ctx.lesson.title });
  section.append(el("p", { class: "byline", text: ctx.lesson.author }));
  section.append(
    button(
      UI.openCase,
      () => {
        ctx.dispatch({ type: "START_CASE", at: Date.now() });
        ctx.navigate({ screen: "vocabulary", excerpt: 1 });
      },
      { class: "open-case" }
    )
  );
}
