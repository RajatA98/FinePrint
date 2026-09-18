// The page, opened again.
//
// One panel serves three needs, because to the reader they are one gesture: the
// book comes back. `reread` opens it with nothing marked, always available and
// never scored. `rewind` opens it after a wrong answer with the proving line
// under the lamp. `nudge` opens it with the paragraph that holds the answer lit,
// never the line itself. It renders the same numbered lines as the read screen
// and reuses its classes, so the reader is looking at the page they read.
//
// Nothing here dispatches. Opening, reading and closing this panel cannot change
// the score, the clock or the first-attempt record.

import { excerptLines, quote } from "../lesson.js";
import { UI } from "../ui-strings.js";
import { el, button, label } from "./chrome.js";
import { litLines } from "./challenge-view.js";
import { revealedLines } from "./challenge-session.js";

const TITLE = {
  reread: "pageReread",
  rewind: "pageRewind",
  nudge: "pageNudge"
};

/**
 * renderPagePanel(ctx, {challengeId, challenge, excerpt, mode, choiceId, onClose})
 * -> the panel element, a modal page over the challenge at every width. Over,
 * not beside: two pages side by side on the citation screen would read as a
 * fault rather than as the book coming back (styles/challenge.css).
 */
export function renderPagePanel(ctx, { challengeId, challenge, excerpt, mode, choiceId, onClose }) {
  const { lesson } = ctx;
  const evidence = Number.isInteger(challenge?.evidence) ? challenge.evidence : null;
  const [lineLit, regionLit] = litSets({ lesson, challengeId, excerpt, mode, evidence });
  const noteAt = marginLineFor({ challenge, choiceId, evidence, excerpt });

  const passage = el("div", { class: "passage" });
  for (const { n, text, startsParagraph } of excerptLines(excerpt.id)) {
    const lit = lineLit.has(n) ? "line" : regionLit.has(n) ? "region" : null;
    const row = el(
      "p",
      {
        class: "line",
        dataset: {
          paragraph: startsParagraph ? "start" : "run",
          lit,
          mark: mode === "rewind" && n === refusedLine(challenge, choiceId) ? "refused" : null
        }
      },
      [
        el("span", { class: "line-number", text: String(n) }),
        el("span", { class: "line-text", text })
      ]
    );
    passage.append(row);
    if (n === noteAt) {
      passage.append(marginNote(challenge, choiceId, mode));
    }
  }

  const page = el("article", { class: "page page--panel", dataset: { mode } }, [
    el("header", { class: "page-head" }, [
      el("h2", {
        class: "page-head__excerpt",
        text: `${UI.excerpt} ${excerpt.roman}`
      }),
      el("div", { class: "page-head__meta" }, [
        el("p", { class: "page-head__book" }, [label(UI[TITLE[mode]] ?? UI.pageReread)])
      ])
    ]),
    passage
  ]);

  const panel = el(
    "aside",
    {
      class: "page-panel",
      dataset: { mode },
      role: "dialog",
      "aria-modal": "true",
      "aria-label": UI[TITLE[mode]] ?? UI.pageReread,
      tabindex: "-1"
    },
    [
      page,
      el("nav", { class: "page-panel__foot" }, [
        button(UI.backToChallenge, onClose, { class: "page-close" }),
        el("p", { class: "page-panel__note", text: UI.pageNothingScored })
      ])
    ]
  );
  // The page is shut the way any held-open thing is: Escape closes it, and the
  // close is the same one the control runs, so it still dispatches nothing.
  panel.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      onClose();
    }
  });
  return panel;
}

/**
 * Two sets of line numbers: the ones under the lamp and the ones in the lit
 * region. What this opening lights is added to everything earlier openings lit,
 * so revealed evidence never goes back into the dark.
 */
function litSets({ lesson, challengeId, excerpt, mode, evidence }) {
  const lineLit = new Set();
  const regionLit = new Set();
  const where = {
    evidence,
    paragraphStarts: lesson.paragraphStarts ?? [],
    range: excerpt.lines
  };

  for (const n of litLines({ ...where, mode })) {
    (mode === "rewind" ? lineLit : regionLit).add(n);
  }
  const shown = revealedLines(challengeId);
  for (const n of shown.line) {
    lineLit.add(n);
  }
  for (const n of shown.region) {
    regionLit.add(n);
  }
  // A line the reader has already been shown outright stays shown outright; a
  // region never gives the line away, even when the line is inside it.
  for (const n of lineLit) {
    regionLit.delete(n);
  }
  return [lineLit, regionLit];
}

/** The line the reader wrongly reached for, when their choice was a line at all. */
function refusedLine(challenge, choiceId) {
  const choice = (challenge?.choices ?? []).find((candidate) => candidate.id === choiceId);
  return Number.isInteger(choice?.line) ? choice.line : null;
}

/** Inkwell writes in the margin beside whichever line the reader argued from. */
function marginLineFor({ challenge, choiceId, evidence, excerpt }) {
  if (!choiceId) {
    return null;
  }
  const refused = refusedLine(challenge, choiceId);
  const [first, last] = excerpt.lines;
  const at = refused ?? evidence;
  return Number.isInteger(at) && at >= first && at <= last ? at : null;
}

function marginNote(challenge, choiceId, mode) {
  const authored = challenge?.margin?.[choiceId];
  return el("p", { class: "margin-note", dataset: { mode } }, [
    authored ? quote(authored) : UI.notThisOne
  ]);
}
