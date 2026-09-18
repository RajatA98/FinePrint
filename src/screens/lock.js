// The word locks for this excerpt. Apply first, then define: the second turn of
// the key only appears once the first has been tried, because they are two turns
// of one lock and not two questions asked at once.
//
// The heading is the word itself, in display type. The word is the key.

import { renderChallengeScreen } from "./challenge.js";
import { UI } from "../ui-strings.js";

export function render(root, ctx) {
  renderChallengeScreen(root, ctx, {
    type: "lock",
    submitLabel: UI.turnTheKey,
    heading: (context, excerpt, entries) => wordOf(context, entries),
    nextRoute: (index) => ({ screen: "search", excerpt: index })
  });
}

/** The word on the lock being turned: the first one not yet opened. */
function wordOf(ctx, entries) {
  const open = entries.find((entry) => !ctx.state.solved[entry.challengeId]) ?? entries.at(-1);
  const vocabulary = ctx.lesson.vocabulary?.[open?.challenge?.vocabulary];
  return vocabulary?.word ?? null;
}
