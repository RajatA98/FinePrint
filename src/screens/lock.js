// The word locks for this excerpt: apply first, then define.

import { renderChallengeScreen } from "./challenge.js";

export function render(root, ctx) {
  renderChallengeScreen(root, ctx, {
    type: "lock",
    nextRoute: (index) => ({ screen: "search", excerpt: index })
  });
}
