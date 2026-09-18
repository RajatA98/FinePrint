// What the read screen is doing right now, decided from state alone (plus the
// two session marks). Pure on purpose: this is the one piece of the reading
// screen worth testing without a DOM.
//
//   opening  the book has not been opened yet and the title card is owed
//   reading  the excerpt is on the page and the clock is running
//   resume   the clock was started, then the tab was reloaded: offer to resume
//   done     this excerpt was read to the end already; re-reading is allowed
//   closing  the book-closes transition is playing

export const OPENING = "opening";
export const READING = "reading";
export const RESUME = "resume";
export const DONE = "done";
export const CLOSING = "closing";

/**
 * @param {object} options
 * @param {{startedAt?: number, endedAt?: number}} [options.reading] state.reading[excerptId]
 * @param {boolean} [options.isFirstExcerpt] the title card belongs to excerpt one alone
 * @param {boolean} [options.begunThisSession] this tab has already opened this excerpt
 * @param {boolean} [options.closing] the close transition is running
 * @param {boolean} [options.reducedMotion] the reader asked for no animation
 */
export function readPhase({
  reading,
  isFirstExcerpt = false,
  begunThisSession = false,
  closing = false,
  reducedMotion = false
} = {}) {
  if (closing) {
    return CLOSING;
  }

  const startedAt = Number(reading?.startedAt) || 0;
  const endedAt = Number(reading?.endedAt) || 0;

  if (startedAt === 0) {
    // Never started. The first excerpt earns the title card unless motion is off,
    // in which case the clock starts at once and the title rides the running head.
    return isFirstExcerpt && !reducedMotion ? OPENING : READING;
  }
  if (begunThisSession) {
    return READING;
  }
  if (endedAt === 0) {
    return RESUME; // started, never finished, and this tab did not start it
  }
  return DONE;
}

/**
 * The book cannot close before it has opened. Without this the title card's
 * "Close the book" — still in the DOM under the overlay, and reachable by Tab —
 * could stop a clock that has not started, and the card's own READ_START would
 * then land after READ_END, leaving endedAt < startedAt and this excerpt's pace
 * wrong for the rest of the case.
 *
 * @param {{startedAt?: number}} [reading] state.reading[excerptId]
 */
export function canCloseBook(reading) {
  return (Number(reading?.startedAt) || 0) > 0;
}
