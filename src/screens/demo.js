// The demo skip. Only offered when the page was opened with ?demo=1 in the
// address, so a reader never sees it. Each press completes one step with the
// right answers, as if the reader had played it, and moves on: from the
// vocabulary or the read it completes the whole excerpt; from a lock, search
// or cite it completes that one game. The case state is the same one a real
// playthrough writes, so the board, the statement and the report all read it.

const ORDER = ["vocabulary", "read", "lock", "search", "cite"];
const WORDS_A_MINUTE = 170;

export function demoEnabled(win = globalThis) {
  try {
    return new URLSearchParams(win.location?.search ?? "").get("demo") === "1";
  } catch {
    return false;
  }
}

/** Where a press on `screen` in excerpt `index` lands: the next game, the next excerpt, or the board. */
export function skipTarget(lesson, { screen, excerpt }) {
  const total = lesson.excerpts?.length ?? 0;
  const games = screen === "lock" ? ["lock"] : screen === "search" ? ["search"] : screen === "cite" ? ["cite"] : ["lock", "search", "cite"];
  const at = ORDER.indexOf(screen);
  const next = at >= 0 && at < ORDER.indexOf("cite") && games.length === 1 ? ORDER[at + 1] : null;
  if (next) {
    return { games, route: { screen: next, excerpt } };
  }
  if (excerpt < total) {
    return { games, route: { screen: "vocabulary", excerpt: excerpt + 1 } };
  }
  return { games, route: { screen: "reconstruct", excerpt } };
}

export function skipAhead({ lesson, state, dispatch, navigate }) {
  const { screen, excerpt: index } = state.route;
  if (!ORDER.includes(screen)) {
    return;
  }
  const excerpt = lesson.excerpts[index - 1];
  const now = Date.now();
  if (state.startedAt === 0) {
    dispatch({ type: "START_CASE", at: now });
  }
  const { games, route } = skipTarget(lesson, { screen, excerpt: index });
  if (!state.reading?.[excerpt.id]?.endedAt) {
    const [first, last] = excerpt.lines;
    const words = (lesson.lines ?? []).slice(first - 1, last).join(" ").split(/\s+/).filter(Boolean).length;
    const spent = Math.round((words / WORDS_A_MINUTE) * 60_000);
    dispatch({ type: "READ_START", excerptId: excerpt.id, at: now - spent });
    dispatch({ type: "READ_END", excerptId: excerpt.id, at: now });
  }
  for (const id of excerpt.challenges) {
    const challenge = lesson.challenges[id];
    if (games.includes(challenge.type) && !state.solved[id]) {
      dispatch({ type: "SUBMIT_ATTEMPT", challengeId: id, choiceIds: [...challenge.answer], at: now });
    }
  }
  navigate(route);
}
