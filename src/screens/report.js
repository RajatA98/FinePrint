// The Case Report.
//
// A file, not a scorecard. The verdict is stamped across the top, the standing is
// four rungs on a brass plate with the reader's lit, the three scopes of the case
// are read off in order, the four skills are small engraved meters, and the pace
// is a pocket-watch line at the foot — small, and said to be shown rather than
// graded. Under all of it, Inkwell's note in his own hand, and the boundary of
// what he was told, because he was never shown the story.
//
// Nothing here scores anything. The two dispatches are FINISH, once, and the
// coach's own COACH_RESULT when it answers. The verdict renders with the network
// down: the coach is asked, it gives up quickly, and the lesson's deterministic
// note takes its place with nothing on screen to say anything went missing.

import { quote, line } from "../lesson.js";
import { verdict, score, clusters, pace } from "../state/selectors.js";
import { buildCoachPayload } from "../coach/payload.js";
import { requestCoach } from "../coach/client.js";
import { UI, SKILL_LABEL } from "../ui-strings.js";
import { el, label, cameo, screenShell, startOverButton, closedBookMark } from "./chrome.js";
import { ladderMarks, finaleOutcome, citedEvidence } from "./challenge-view.js";

const SOURCE_URL = "https://www.gutenberg.org/ebooks/269";
const SKILLS = ["vocabulary", "detail", "inference", "evidence"];

// Not render state: only a guard so a re-render does not ask the coach twice.
let asking = false;

export function render(root, ctx) {
  const { state, lesson, dispatch } = ctx;

  if (!state.finishedAt) {
    dispatch({ type: "FINISH", at: Date.now() });
  }

  const standing = verdict(state, lesson);
  const section = screenShell(root, ctx, { heading: null, mark: closedBookMark() });

  const report = el("div", { class: "report", dataset: { verdict: standing } }, [
    el("div", { class: "report__top" }, [verdictStamp(standing), ladder(standing)]),
    introLine(),
    scopes(ctx),
    skillMeters(ctx),
    paceLine(ctx),
    coachBlock(state),
    foot(ctx)
  ]);

  section.append(report);
  askCoach(ctx);
}

/* ------------------------------------------------------------- the verdict */

/**
 * The verdict, stamped: the one loud thing on the page, and the page's heading.
 * The word the reader came for is the title of the file it is stamped on, so it
 * is an h1 rather than a paragraph that merely looks like one.
 */
function verdictStamp(standing) {
  return el("div", { class: "verdict", dataset: { verdict: standing } }, [
    el("h1", { class: "verdict__word", text: quote(`s-verdict-${standing}`) })
  ]);
}

/** The four standings as rungs, best at the top, with the reader's one lit. */
function ladder(standing) {
  const rungs = el("ol", { class: "ladder", "aria-label": UI.reportLadder });
  for (const mark of [...ladderMarks(standing)].reverse()) {
    rungs.append(
      el("li", { class: "rung", dataset: { state: mark.state } }, [
        el("span", { class: "rung__peg", "aria-hidden": "true" }),
        el("span", { class: "rung__name", text: quote(`s-verdict-${mark.key}`) })
      ])
    );
  }
  return el("div", { class: "ladder-plate" }, [
    el("h2", { class: "ladder__title" }, [label(UI.reportLadder)]),
    rungs
  ]);
}

function introLine() {
  const intro = maybeQuote("s-report-intro");
  return intro ? el("p", { class: "report__intro", text: intro }) : null;
}

/* -------------------------------------------------------------- the scopes */

/** Solved, the answers given, the evidence — the three scopes of the case. */
function scopes(ctx) {
  const { state, lesson } = ctx;
  const counts = score(state);
  const outcome = finaleOutcome(state, lesson);
  const percent = counts.total === 0 ? 0 : Math.round(counts.ratio * 100);

  return el("div", { class: "scopes" }, [
    scope("solved", UI.caseSolvedScope, solvedWord(state, outcome)),
    scope("answers", UI.answersGiven, UI.correctOfTotal(counts.correct, counts.total), [
      el("p", { class: "scope__aside", text: UI.percent(percent) })
    ]),
    scope("evidence", UI.evidence, UI.reviewedCount(state.evidenceReview), [citedList(ctx)])
  ]);
}

function solvedWord(state, outcome) {
  if (state.finale.solved) {
    return UI.solvedYes;
  }
  return outcome === "partial" ? UI.solvedPartial : UI.solvedNo;
}

function scope(name, title, figure, extras = []) {
  return el("section", { class: "scope", dataset: { scope: name } }, [
    el("h2", { class: "scope__title" }, [label(title)]),
    el("p", { class: "scope__figure", text: figure }),
    ...extras
  ]);
}

/** Every line the reader put their name to, with whose words it is. */
function citedList(ctx) {
  const { state, lesson } = ctx;
  const entries = citedEvidence(state, lesson);
  const block = el("div", { class: "cited-block" }, [
    el("h3", { class: "cited-block__title" }, [label(UI.citedList)])
  ]);
  if (entries.length === 0) {
    block.append(el("p", { class: "cited-block__empty", text: UI.caseNotesEmpty }));
    return block;
  }
  const list = el("ol", { class: "cited-list" });
  for (const entry of entries) {
    list.append(
      el(
        "li",
        {
          class: "cited",
          dataset: { pinned: String(entry.pinned), mine: String(entry.cited) }
        },
        [
          label(UI.lineNumber(entry.line), { class: "cited__line" }),
          el("span", { class: "cited__text", text: line(entry.line) }),
          el("span", { class: "cited__whose", text: whose(lesson, entry.speaker) })
        ]
      )
    );
  }
  block.append(list);
  return block;
}

function whose(lesson, speaker) {
  if (!speaker) {
    return "";
  }
  return speaker === "narration" ? UI.narration : quote(lesson.people[speaker].role);
}

/* -------------------------------------------------------------- the skills */

/** Four meters, engraved: how each skill held across the reader's first answers. */
function skillMeters(ctx) {
  const { state, lesson } = ctx;
  const bySkill = clusters(state, lesson);
  const meters = el("ul", { class: "meters" });
  for (const skill of SKILLS) {
    const { correct = 0, total = 0 } = bySkill[skill] ?? {};
    const filled = total === 0 ? 0 : Math.round((correct / total) * 100);
    const bar = el("span", { class: "meter__track" }, [
      el("span", { class: "meter__fill", style: `width: ${filled}%` })
    ]);
    meters.append(
      el("li", { class: "meter", dataset: { skill, empty: String(total === 0) } }, [
        label(SKILL_LABEL[skill] ?? skill, { class: "meter__name" }),
        bar,
        el("span", { class: "meter__count", text: `${correct} ${UI.of} ${total}` })
      ])
    );
  }
  return el("section", { class: "skills" }, [
    el("h2", { class: "skills__title" }, [label(UI.skills)]),
    meters
  ]);
}

/* ---------------------------------------------------------------- the pace */

/** Last, and small: a watch face and a number that is not part of the score. */
function paceLine(ctx) {
  const { state, lesson } = ctx;
  const watch = el("span", { class: "watch", "aria-hidden": "true" });
  watch.innerHTML =
    '<svg viewBox="0 0 26 30" focusable="false">' +
    '<path class="watch__bow" d="M11 4 h4 M13 1.5 v2.5"/>' +
    '<circle class="watch__case" cx="13" cy="17" r="11"/>' +
    '<path class="watch__hands" d="M13 17 V10.5 M13 17 L17.4 19.6"/></svg>';
  return el("p", { class: "pace" }, [
    watch,
    el("span", { class: "pace__figure", text: UI.wordsPerMinute(pace(state, lesson).overallWpm) }),
    el("span", { class: "pace__note", text: UI.paceShown })
  ]);
}

/* --------------------------------------------------------------- the coach */

/**
 * Inkwell's note, in his own hand, and directly under it the boundary: he was
 * told how the reader answered, and nothing of the story itself. While the request is
 * out there is a quiet line saying he is writing — never a spinner — and if no
 * answer comes back the lesson's own note simply appears in its place.
 */
/**
 * Whether the coach has answered. The source is the thing to read, not the
 * message: a deterministic note always has a source, and a live answer that
 * came back empty must not leave the reader watching Inkwell write for ever.
 * Both the card and the request guard ask this same question.
 */
function coachAnswered(state) {
  return state.coach.source !== null;
}

function coachBlock(state) {
  const answered = coachAnswered(state);
  const block = el("section", { class: "coach", dataset: { state: answered ? "written" : "writing" } }, [
    el("span", { class: "coach__cameo" }, [cameo()])
  ]);
  const body = el("div", { class: "coach__body" });

  if (answered) {
    body.append(el("p", { class: "coach__message", text: state.coach.message ?? "" }));
  } else {
    body.append(el("p", { class: "coach__writing", text: UI.coachWriting }));
  }

  const boundary = maybeQuote("s-report-coach-boundary");
  if (boundary) {
    body.append(el("p", { class: "coach__boundary", text: boundary }));
  }
  if (answered && showSource()) {
    body.append(
      el("p", { class: "coach__source" }, [label(`${UI.coachSource}: ${state.coach.source}`)])
    );
  }
  block.append(body);
  return block;
}

/** The source line is a working detail: placeholder runs and localhost only. */
function showSource() {
  return (
    document.body.dataset.placeholder === "1" || globalThis.location?.hostname === "localhost"
  );
}

function askCoach(ctx) {
  const { state, lesson, dispatch } = ctx;
  if (asking || coachAnswered(state)) {
    return;
  }
  asking = true;
  requestCoach(buildCoachPayload(state, lesson))
    .then(({ source, message }) => {
      dispatch({ type: "COACH_RESULT", source, message });
    })
    .finally(() => {
      asking = false;
    });
}

/* ----------------------------------------------------------------- the foot */

/** Whose words the whole case was, and the way back to the shelf. */
function foot(ctx) {
  const attribution = maybeQuote("s-attribution");
  const url = ctx.lesson.source?.url ?? SOURCE_URL;
  const credits = el("p", { class: "credits" });
  if (attribution) {
    credits.append(document.createTextNode(`${attribution} `));
  }
  credits.append(
    el("a", {
      class: "credits__link",
      href: url,
      target: "_blank",
      rel: "noopener noreferrer",
      text: UI.sourceText
    })
  );

  return el("footer", { class: "report__foot" }, [
    el("div", { class: "revisit" }, [
      startOverButton(ctx, { label: UI.revisitCase, class: "revisit__go" }),
      el("p", { class: "revisit__note", text: UI.revisitNote })
    ]),
    credits
  ]);
}

/** A string the lesson may or may not have authored. A miss is simply absence. */
function maybeQuote(id) {
  try {
    return quote(id);
  } catch {
    return null;
  }
}
