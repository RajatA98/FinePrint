// The citation: the line that proves what the search found. Last screen of an
// excerpt, so it hands on to the next excerpt or to the reconstruction.

import { renderChallengeScreen } from "./challenge.js";

export function render(root, ctx) {
  const count = ctx.lesson.excerpts?.length ?? 1;
  renderChallengeScreen(root, ctx, {
    type: "cite",
    nextRoute: (index) =>
      index < count
        ? { screen: "vocabulary", excerpt: index + 1 }
        : { screen: "reconstruct", excerpt: index }
  });
}
