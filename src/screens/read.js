// The book is open. Nothing is asked here; the clock starts and stops, once each.
// The two transitions on either side of this screen live here too: the book
// opens on the title card, and the book closes before the first challenge.

import { excerptLines } from "../lesson.js";
import { UI } from "../ui-strings.js";
import {
  el,
  button,
  label,
  screenShell,
  currentExcerpt,
  prefersReducedMotion
} from "./chrome.js";
import { readPhase, canCloseBook, OPENING, READING, RESUME, CLOSING } from "./read-phase.js";
import { markBegun, hasBegun, markClosing, isClosing, clearClosing } from "./read-session.js";

const OPEN_MS = 1200;
const CLOSE_MS = 1000;
const SETTLE_GRACE = 400; // if animationend never fires, the flow still moves on

export function render(root, ctx) {
  const { index, excerpt, count, lastRoman } = currentExcerpt(ctx);
  const { state, dispatch } = ctx;
  const reading = state.reading?.[excerpt.id];
  const reducedMotion = prefersReducedMotion();

  const phase = readPhase({
    reading,
    isFirstExcerpt: index === 1,
    begunThisSession: hasBegun(excerpt.id),
    closing: isClosing(excerpt.id),
    reducedMotion
  });

  const section = screenShell(root, ctx, { heading: null });
  const page = el("article", { class: "page", dataset: { phase } }, [
    runningHead(ctx, excerpt, lastRoman)
  ]);

  if (phase === RESUME) {
    page.append(resumeBlock(ctx, excerpt, index));
  } else {
    if (phase === READING && !reading?.startedAt) {
      // No title card is owed and the clock has not started: start it now.
      markBegun(excerpt.id);
      dispatch({ type: "READ_START", excerptId: excerpt.id, at: Date.now() });
    }
    page.append(passage(excerpt));
  }

  section.append(page);

  if (phase !== RESUME) {
    // While an overlay is up, the page beneath stays on screen (that is the
    // point of the fade) but must not be reachable: inert takes the nav out of
    // the tab order so nobody can close a book that has not opened yet.
    const sealed = phase === OPENING || phase === CLOSING;
    section.append(
      el("nav", { class: "onward", inert: sealed }, [
        button(UI.closeBook, () => closeBook(ctx, excerpt, index, reducedMotion), {
          class: "close-book",
          tabindex: sealed ? "-1" : false
        })
      ])
    );
  }

  if (phase === OPENING) {
    section.append(titleCard(ctx, excerpt));
  }
  if (phase === CLOSING) {
    section.append(closingCover(ctx, excerpt, index));
  }
}

function runningHead(ctx, excerpt, lastRoman) {
  const [first, last] = excerpt.lines ?? [];
  return el("header", { class: "page-head" }, [
    el("h1", {
      class: "page-head__excerpt",
      text: `${UI.excerpt} ${excerpt.roman} ${UI.of} ${lastRoman}`
    }),
    el("div", { class: "page-head__meta" }, [
      el("p", { class: "page-head__book" }, [label(ctx.lesson.title)]),
      el("p", { class: "page-head__lines" }, [label(`${UI.lines} ${first}–${last}`)])
    ])
  ]);
}

function passage(excerpt) {
  const block = el("div", { class: "passage" });
  for (const { n, text, startsParagraph } of excerptLines(excerpt.id)) {
    block.append(
      el("p", { class: "line", dataset: { paragraph: startsParagraph ? "start" : "run" } }, [
        // The number is read out too: citing lines is the game's whole mechanic.
        el("span", { class: "line-number", text: String(n) }),
        el("span", { class: "line-text", text })
      ])
    );
  }
  return block;
}

// A reload mid-read. The clock was never stopped and must not be restarted, so
// the page stays shut until the reader picks it back up.
function resumeBlock(ctx, excerpt, index) {
  return el("div", { class: "page-shut" }, [
    el("p", { class: "page-shut__note", text: UI.resumeNote }),
    button(
      UI.resumeReading,
      () => {
        markBegun(excerpt.id);
        ctx.navigate({ screen: "read", excerpt: index });
      },
      { class: "resume" }
    )
  ]);
}

// The book opens: the title and the author, held for a beat over paper. The
// clock starts when the card is gone, so the card is never part of the read.
function titleCard(ctx, excerpt) {
  const overlay = el("div", { class: "book-open" }, [
    el("div", { class: "book-open__card" }, [
      el("h2", { class: "book-open__title", text: ctx.lesson.title }),
      el("span", { class: "book-open__rule", "aria-hidden": "true" }),
      el("p", { class: "book-open__author" }, [label(ctx.lesson.author)])
    ])
  ]);

  const settle = once(() => {
    markBegun(excerpt.id);
    ctx.dispatch({ type: "READ_START", excerptId: excerpt.id, at: Date.now() });
  });

  overlay.addEventListener("animationend", (event) => {
    if (event.target === overlay) {
      settle();
    }
  });
  setTimeout(settle, OPEN_MS + SETTLE_GRACE);
  return overlay;
}

function closeBook(ctx, excerpt, index, reducedMotion) {
  // The second half of the guard above: inert keeps the control out of reach,
  // this keeps a stray activation from writing an endedAt before any startedAt.
  if (!canCloseBook(ctx.state.reading?.[excerpt.id])) {
    return;
  }
  if (reducedMotion) {
    ctx.dispatch({ type: "READ_END", excerptId: excerpt.id, at: Date.now() });
    ctx.navigate({ screen: "lock", excerpt: index });
    return;
  }
  // Mark first: the READ_END dispatch redraws this screen, and it should redraw
  // into the closing transition rather than back into the open page.
  markClosing(excerpt.id);
  ctx.dispatch({ type: "READ_END", excerptId: excerpt.id, at: Date.now() });
}

// The book closes: the page darkens and the cover swings shut over it.
function closingCover(ctx, excerpt, index) {
  const cover = el("div", { class: "book-close__cover" }, [
    el("span", { class: "book-close__frame", "aria-hidden": "true" }),
    el("span", { class: "book-close__mark", "aria-hidden": "true", text: excerpt.roman })
  ]);
  const overlay = el("div", { class: "book-close" }, [cover]);

  const settle = once(() => {
    if (!isClosing(excerpt.id) || document.body.dataset.screen !== "read") {
      return; // Start over, or a hash change, got here first
    }
    clearClosing(excerpt.id);
    ctx.navigate({ screen: "lock", excerpt: index });
  });

  cover.addEventListener("animationend", settle);
  setTimeout(settle, CLOSE_MS + SETTLE_GRACE);
  return overlay;
}

function once(fn) {
  let done = false;
  return () => {
    if (done) {
      return;
    }
    done = true;
    fn();
  };
}
