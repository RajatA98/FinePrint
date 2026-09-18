// The search of the room: find the details that matter.

import { renderChallengeScreen } from "./challenge.js";

export function render(root, ctx) {
  renderChallengeScreen(root, ctx, {
    type: "search",
    nextRoute: (index) => ({ screen: "cite", excerpt: index })
  });
}
