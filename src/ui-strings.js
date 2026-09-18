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
  coachSource: "Source",

  /* the challenges */
  turnTheKey: "Turn the key",
  reportTheFind: "Report the find",
  citeThisLine: "Cite this line",
  ruleOut: "Rule this one out",
  bringBack: "Bring this one back",
  ruledOut: "Ruled out",
  askInkwell: "Ask Inkwell",
  reread: "Reread the page",
  backToChallenge: "Back to the challenge",
  boxOpens: "The box opens.",
  boxHolds: "The box holds shut.",
  notThisOne: "Not this one. The page is open at the line that settles it.",
  theClaim: "The claim you are proving",
  caseNotes: "The case notes",
  caseNotesEmpty: "Nothing written in yet.",
  progressLabel: "Excerpt progress",
  lockPositions: "Lock positions",

  /* the reopened page */
  pageReread: "The page, as you read it",
  pageRewind: "The page, reopened",
  pageNudge: "The page, with the region lit",
  pageNothingScored: "Nothing on this page is scored or timed.",

  /* counted things */
  findCount(targets) {
    return `Find ${NUMBER_WORD[targets] ?? targets}`;
  },
  chosenCount(chosen, targets) {
    return `${chosen} of ${targets} chosen`;
  },
  nudgeCount(used, max) {
    return `${used} of ${max} used`;
  },
  fromLine(n) {
    return `From line ${n}`;
  },
  lineNumber(n) {
    return `Line ${n}`;
  }
};

/** Counts a reader meets in a sentence read better as words than as digits. */
const NUMBER_WORD = { 1: "one", 2: "two", 3: "three", 4: "four", 5: "five" };

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
