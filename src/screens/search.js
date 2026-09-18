// The search of the room: the book is shut, and the reader lays out what they
// remember was carried in. The decoys are real things from the story carried by
// the wrong people, so recognising a thing is not enough — it has to be placed.

import { renderChallengeScreen } from "./challenge.js";
import { UI } from "../ui-strings.js";

export function render(root, ctx) {
  renderChallengeScreen(root, ctx, {
    type: "search",
    submitLabel: UI.reportTheFind,
    nextRoute: (index) => ({ screen: "cite", excerpt: index })
  });
}
