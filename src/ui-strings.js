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
  narration: "Narration",
  skills: "Skills",
  coachSource: "Source",

  /* the challenges */
  turnTheKey: "Turn the key",
  reportTheFind: "Report the find",
  citeThisLine: "Cite this line",
  ruleOut: "Rule this one out",
  bringBack: "Bring this one back",
  ruledOut: "Ruled out",
  askInkwell: "Ask Inkwell",
  askHint: "Try again from memory, or ask Inkwell for a hint.",
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

  /* the case board */
  bookShut: "The book is shut",
  whoWasHere: "Who was in the house",
  nameTray: "The names you wrote down",
  nameSet: "Named",
  clueSlips: "The slips that prove it",
  noPinsLeft: "The tin is empty. Take a pin back to move it.",
  inYourNotes: "You cited this",
  yourNotes: "Lines you cited during the case",
  closeTheCase: "Close the case",
  sealAgain: "The seal will not take. Look at the board again.",
  sealPartial: "The seal takes, in part: the name holds, the four lines do not yet.",
  sealClosed: "Case closed",

  /* the closing statement */
  setTheWords: "Set the words into the line",
  wordTray: "Your words",
  chooseBlank: "Choose a blank, then set a word into it.",
  wordsSet: "Set into the line.",
  signStatement: "Sign the statement",
  statementSigned: "Signed",
  statementAgain: "The line does not hold yet. Change a word and sign again.",

  /* the case report */
  reportLadder: "The standing",
  caseSolvedScope: "Case solved",
  solvedYes: "Yes",
  solvedPartial: "In part",
  solvedNo: "Not yet",
  answersGiven: "The answers you gave",
  evidence: "Evidence",
  citedList: "The lines you put your name to",
  paceShown: "Shown here, not graded.",
  coachWriting: "Inkwell is writing…",
  sourceText: "The source text",
  revisitCase: "Revisit the case",
  revisitNote: "Revisiting does not change your score. The first answer is the one already written down.",

  /* when the case file itself will not load */
  bootFailedTitle: "The case will not open",
  bootFailedNote: "The case file did not arrive. Check the connection and ask again.",
  tryAgain: "Try again",

  /* counted things */
  searchHow(targets) {
    const thing = targets > 1 ? "the things the question is about" : "the thing the question is about";
    return `Pick ${thing} and report the find. The × crosses off anything you can rule out; that is free and never scored.`;
  },
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
  },
  pinsLeft(left, total) {
    if (left === 0) {
      return "No pins left";
    }
    return `${NUMBER_WORD[left] ?? left} of ${NUMBER_WORD[total] ?? total} pins left`;
  },
  blanksLeft(left) {
    return left === 1 ? "One blank still open" : `${NUMBER_WORD[left] ?? left} blanks still open`;
  },
  blankAria(position) {
    return `Blank ${position}`;
  },
  correctOfTotal(correct, total) {
    return `${correct} correct of ${total}`;
  },
  percent(value) {
    return `${value}%`;
  },
  wordsPerMinute(value) {
    return `${value} words a minute`;
  },
  reviewedCount(n) {
    if (n === 0) {
      return "No lines sent back for review";
    }
    return n === 1 ? "One line sent back for review" : `${n} lines sent back for review`;
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

/** The four skills, as the report names them. The lesson's ids are never shown. */
export const SKILL_LABEL = {
  vocabulary: "Vocabulary",
  detail: "Detail",
  inference: "Inference",
  evidence: "Evidence"
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
