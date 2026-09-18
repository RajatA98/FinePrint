// Every word the interface says on its own. Story wording comes from the lesson
// through quote() or line(); no narrative phrase belongs in this file.

export const UI = {
  wordmark: "Fine Print",
  openCase: "Open the case",
  startOver: "Start over",
  next: "Next",
  readExcerpt: "Read the excerpt",
  closeBook: "Close the book",
  resumeReading: "Resume reading",
  resumeNote: "Your place is kept. The clock was not restarted.",
  submit: "Submit",
  solved: "Solved",
  notYet: "Not yet — try again",
  excerpt: "Excerpt",
  of: "of",
  line: "Line",
  lines: "Lines",
  caseNumber: "Case",
  excerpts: "excerpts",
  takeItDown: "Take the lit case down from the shelf.",
  nothingScored: "Nothing on this page is scored.",
  choose: "Choose",
  narration: "Narration",
  whoseWords: "Whose words",
  score: "Score",
  skills: "Skills",
  pace: "Words per minute",
  evidenceReview: "Evidence review",
  coachNote: "Coaching note",
  coachSource: "Source"
};

/** Difficulty bands, the only thing a spine says about a case besides its number. */
export const BAND = {
  first: { shelf: "First cases", spine: "First" },
  longer: { shelf: "Longer cases", spine: "Longer" },
  difficult: { shelf: "Difficult cases", spine: "Difficult" }
};

/** What the chrome calls each screen. The route id is never shown to a reader. */
export const SCREEN_LABEL = {
  study: "The study",
  vocabulary: "The vocabulary key",
  read: "The read",
  lock: "The word lock",
  search: "Search the room",
  cite: "Cite the line",
  reconstruct: "Reconstruct the case",
  statement: "The statement",
  report: "The case report"
};
