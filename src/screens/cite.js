// The citation: the line that proves what the search found. This is the one
// action the PRD lets the page stay open for (P0-3) — the claim is restated at
// the top and the excerpt is laid out whole, the candidate lines being the slips
// the reader points at. Last screen of an excerpt, so it hands on to the next
// excerpt or to the reconstruction.

import { renderChallengeScreen } from "./challenge.js";
import { UI } from "../ui-strings.js";

export function render(root, ctx) {
  const count = ctx.lesson.excerpts?.length ?? 1;
  renderChallengeScreen(root, ctx, {
    type: "cite",
    submitLabel: UI.citeThisLine,
    nextRoute: (index) =>
      index < count
        ? { screen: "vocabulary", excerpt: index + 1 }
        : { screen: "reconstruct", excerpt: index }
  });
}
