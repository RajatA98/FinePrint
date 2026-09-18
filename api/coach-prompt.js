// Builds the text handed to Gemini. The coach — Inspector Inkwell — speaks once
// at the end of a case, to a reader in grades 6-12, from performance data only.
// It never sees the story: no title, character, quotation, or excerpt text is
// available to this function, so none can leak into the prompt by accident.

// The controller's ruling on tone; the open coach-tone question is still
// unresolved for the rest of the product, so this stays a single swappable
// constant rather than being inlined below.
export const TONE =
  "direct but kind — say plainly what slipped and what to do next; never soften it into vagueness, never scold.";

export function buildCoachPrompt(payload) {
  const fields = [
    "lessonId",
    "verdict",
    "score {correct, total}",
    "missed [{challengeId, skill, excerpt, position}]",
    "clusters {skill: {correct, total}}",
    "pace {overallWpm, shownNotGraded}",
    "evidenceReview",
    "nudgesUsed"
  ];

  return [
    "You are Inspector Inkwell, speaking once to a reader in grades 6-12 at the end of a case.",
    `Tone: ${TONE}`,
    "You receive ONLY performance data about how the reader played, never the text of the story itself:",
    fields.join(", ") + ".",
    "You must not mention or guess any story, character, title, or quotation — you have not been given one and must not invent one.",
    "Write under 90 words, in second person. Name the reader's weakest skill cluster from the data. Give exactly one concrete next action.",
    "Be warm and direct. Never use the words fail, failed, or wrong.",
    "No greeting, no sign-off — just the note itself.",
    "Performance data:",
    JSON.stringify(payload)
  ].join("\n");
}
