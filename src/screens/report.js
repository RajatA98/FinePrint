// The Case Report: the verdict, the numbers behind it, and one coaching note. The
// coach is asked once per run; if it cannot answer, the lesson's own note stands in.

import { quote } from "../lesson.js";
import { verdict, score, clusters, pace } from "../state/selectors.js";
import { buildCoachPayload } from "../coach/payload.js";
import { requestCoach } from "../coach/client.js";
import { UI } from "../ui-strings.js";
import { el, screenShell } from "./chrome.js";

// Not render state: only a guard so a re-render does not ask the coach twice.
let asking = false;

export function render(root, ctx) {
  const { state, lesson, dispatch } = ctx;

  if (!state.finishedAt) {
    dispatch({ type: "FINISH", at: Date.now() });
  }

  const standing = verdict(state, lesson);
  const section = screenShell(root, ctx, { heading: quote(`s-verdict-${standing}`) });
  const counts = score(state);

  section.append(
    row(UI.score, `${counts.correct} / ${counts.total}`),
    row(UI.pace, String(pace(state, lesson).overallWpm)),
    row(UI.evidenceReview, String(state.evidenceReview))
  );

  const skills = el("ul", { class: "clusters" });
  for (const [skill, cluster] of Object.entries(clusters(state, lesson))) {
    skills.append(
      el("li", { dataset: { skill } }, [
        el("span", { class: "label", text: skill }),
        el("span", { class: "value", text: `${cluster.correct} / ${cluster.total}` })
      ])
    );
  }
  section.append(el("section", { class: "skills" }, [el("h2", { text: UI.skills }), skills]));

  section.append(coachBlock(state));
  askCoach(ctx);
}

function coachBlock(state) {
  const block = el("section", { class: "coach" }, [el("h2", { text: UI.coachNote })]);
  if (state.coach.message) {
    block.append(el("p", { class: "measure coach-message", text: state.coach.message }));
  }
  if (state.coach.source && showSource()) {
    block.append(el("p", { class: "coach-source", text: `${UI.coachSource}: ${state.coach.source}` }));
  }
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
  if (asking || state.coach.message !== null) {
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

function row(label, value) {
  return el("p", { class: "figure" }, [
    el("span", { class: "label", text: label }),
    el("span", { class: "value", text: value })
  ]);
}
