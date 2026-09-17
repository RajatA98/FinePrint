# Project Plan — Fine Print

**Phase:** 5 of 9 (Plan)
**Status:** Complete
**Last Updated:** 2026-09-17
**Deadline:** Fri 18 Sep 2026, 23:59 CDT. Target submission 18:00 CDT. ~29 hours at time of writing.
**Inputs:** `PRD.md` (Complete, approved), `LOCKED_DECISIONS.md` (Complete, locked)
**Council review:** Codex (gpt-5.5), 17 Sep. Cached at `.claude/council-cache/council-1789687891.md`. Amendments applied below are marked *(council)*.

> This plan turns the locked build order into six build phases, each of which
> ends with something a person can click through or a test suite can prove.
> `LOCKED_DECISIONS.md` remains the authority on *how*; this document only
> sequences the work and states how each phase is known to be done.

---

## Time budget, stated honestly

| Phase | Budget | Cumulative |
|---|---|---|
| 1. The spine | 2 h | 2 h |
| 1.5. Empty shell deployed *(council)* | 0.5 h | 2.5 h |
| 2. The content gate | 4 h *(council: was 3)* | 6.5 h |
| 3. Study, vocabulary, the read | 3 h | 9.5 h |
| 4. The challenges | 4 h | 13.5 h |
| 5. Finale and Case Report | 3 h | 16.5 h |
| 6. Live coach on the deployed shell | 1 h *(council: was 1.5)* | 17.5 h |
| Review, QA read-through, video, submit (Factory phases 7–9) | 3 h | 20.5 h |

Twenty-nine hours remain to the hard deadline and about twenty-three to the
18:00 target. The build budget leaves roughly three hours of slack before the
target, which is sleep. **Every budget above is a ceiling, not an estimate.**

### The hour-8 tripwire, made operational *(council)*

The locked cut order (re-read, voice, lamp) still governs P1 items, but those
are already outside this build, so cutting them at hour 8 buys nothing. If all
nine screens are not navigable by hour 8 of building, the action is:

1. Stop all styling and visual polish. No parallax, no room depth, no shelf
   polish, no lock animation. Only the book-open and book-close transitions stay.
2. Force all nine routes to exist as plain panels with Next buttons.
3. Make the shared renderer support only three choice modes: single choice,
   multi choice, line choice.
4. Deterministic coach only until a full production playthrough exists.
5. Deploy the moment the mechanical flow works.
6. Keep the demo path narrow: one wrong-answer rewind, one cite-the-line, the
   finale, the report.

Never cut: the read, the three challenge types, the validator, the finale, the
Case Report. Cut presentation first, integration novelty second, live AI third.

**Two things are done by the user in parallel with Phase 1, not by the build:**
get the Gemini API key from Google AI Studio, and decide coach tone in one
sentence. The key gates Phase 6. Tone gates the coach prompt in Phase 6.

---

## Phase 1 — The spine

**Objective.** Stand up the whole game end to end as a skeleton: the state
layer, the scoring core with its immutability rules, and all nine screens
reachable in order with placeholder content. Nothing is styled. Everything is
navigable.

**Deliverables**
- A static project skeleton that serves locally with no build step
- The reducer that owns every scoring write, with the write-once first-attempt
  record and the append-only attempt history from Locked Decision 3
- Session persistence in browser storage under the versioned key, with an
  in-memory mirror and a visible Start Over
- Hash-based routing across the nine screens, so any screen can be reached
  by URL for testing and for the demo
- Nine placeholder screens in flow order: study, vocabulary, read, word lock,
  search the room, cite the line, reconstruct, set the words, Case Report
- The test harness for the scoring core, runnable from the command line
- The first attempt at a coach payload shape (performance data only), so
  later phases fill it rather than invent it

**Acceptance criteria**
- A person can click from the study to the Case Report through all nine
  screens with no dead end and no outside instruction
- The six scoring cases from Locked Decision 3 pass as automated tests:
  wrong-then-right stays wrong; right-then-wrong stays right; striking a
  correct answer costs nothing; a refresh preserves the record; a double
  submit records one first attempt; Start Over clears everything
- A refresh on any screen returns to that screen with state intact
- No screen module contains a write to scoring state; only the reducer does
- The tripwire clock starts when this phase starts

**Test method for "no outside instruction"** *(council)*: one cold click-through
by the developer with the comps closed, recorded as pass or fail with the
screen where it stalled.

**Risk notes.** The temptation is to style the study while building it. Do
not. This phase is ugly on purpose; its only job is to make hour 20 with five
beautiful screens and no finale impossible.

---

## Phase 1.5 — Empty shell deployed *(council)*

**Objective.** Discover deployment failures at hour 2, not hour 17. Deploy the
Phase 1 skeleton to Vercel with a stub coach function, so Phase 6 becomes
"turn on the live call" rather than "find out whether deployment works".

**Deliverables**
- The Vercel project, deploying from git
- The static shell live at a production URL
- A stub coach function returning HTTP 200 with `source: "fallback-deterministic"`
  and a placeholder message
- The environment flag present and off

**Acceptance criteria**
- Hash routing across all nine placeholder screens works on the production URL
- Start Over and storage persistence work on the production URL
- The stub function answers from the production URL with a 200 and the
  expected body shape
- The page loads on a phone without a horizontal scroll

**Risk notes.** Function path shape, static routing rules and flag visibility
are the usual surprises. Half an hour here is cheap insurance against the
1.5-hour final phase the council called "not credible".

---

## Phase 2 — The content gate

**Objective.** Make the founding rule mechanical. Build the validator around
the rescued line-numbering module, author the full lesson for "The Open
Window", and get it passing. Every later phase renders only from this file.

**Internal order** *(council)*: 2A schema, validator, and one complete excerpt
fixture (1 h). 2B the full lesson (2 h, the slow part). 2C negative tests and
the source-file scan (1 h). 2A gates Phase 3. 2C must pass before Ship but
must not block screen wiring if 2A and 2B are sound.

**Deliverables**
- The lesson validator, built around `scripts/source.py`, asserting every
  point in Locked Decision 7: excerpts reconstruct the source exactly; every
  cited line resolves and sits inside its own excerpt; numbering is
  continuous 1–132 and identical everywhere; a phrase resolves to the line it
  starts on, including across a line break; no authored item embeds paraphrase
  as source text; no story phrase over ~12 characters appears in any app
  source file
- The lesson file for "The Open Window": ten contiguous excerpts closing on
  sentences; per-excerpt vocabulary with apply-before-define items; word lock,
  search the room, and cite the line items with real story elements as
  decoys; the reconstruct set of seven clues with four proving; the closing
  statement with its vocabulary slots; the whose-words column for every cited
  line
- The client-side lesson loader whose quote-by-ID function throws on a
  missing ID
- The validator wired into the build so a violation fails it

**Acceptance criteria**
- The validator passes on the authored lesson
- Each of the following deliberately broken lessons fails with a named
  reason: one character changed in an excerpt; a citation pointing outside
  its excerpt; a phrase that straddles a line break cited to the wrong line;
  a story sentence planted in a JS file
- Every scored item has exactly one correct answer and every distractor is a
  real story element in the wrong role
- Every target object or person is identifiable in isolation by its label or
  image, without relying on hidden title text or the author's memory, checked
  item by item in the read-through *(council, PRD P0-4)*
- The closing statement carries authored truth labels per vocabulary slot, so
  "the wrong word makes the sentence untrue" is a data check, not a judgement
  *(council)*
- Concatenating the ten excerpts reproduces the story text character for
  character

**Risk notes.** Authoring is the slow part, not the validator. A bad
distractor here is in the demo, not a log. Budget the authoring at two of the
three hours. The Bertie repetition and the narration-versus-dialogue bug are
known traps; the whose-words column exists because of the second.

---

## Phase 3 — Study, vocabulary, and the read

**Objective.** Style and wire the first three screens in flow order with the
pinned palette and type: the shelf, the vocabulary key, and the timed silent
read with the book-opens and book-closes transitions on either side.

**Deliverables**
- The study: spines showing case number and difficulty band, never a title;
  one playable case, remaining spines present but inert
- The book-opens transition carrying the title reveal
- The vocabulary screen, unscored, teaching the excerpt's words before the read
- The reading screen at a real reading measure (65–75ch, fluid) with the
  numbered lines, the timer running silently, and a static lit state for the
  lamp (the moving lamp is P1)
- The book-closes transition, about one second, before the first challenge
- Pace captured per excerpt into state, never displayed here
- Resume-reading handling on refresh mid-read, so the timer is not silently
  restarted

**Acceptance criteria**
- Every screen is readable at 1440×900 with no clipped text or overlapping
  panels
- No title appears anywhere before the book opens
- Nothing on the vocabulary screen writes to the score
- The read timer produces a per-excerpt words-per-minute figure in state
- A refresh mid-read offers to resume rather than restarting
- The reading text passes a contrast check
- No story phrase over ~12 characters exists in the HTML or JS; the build scan passes *(council: locked wording, not "not one word")*

**Risk notes.** The comps are absolutely positioned at a fixed size. Rebuild
in Grid and Flex from them as pictures; do not port their markup. The
parallax room is P1-4 and stays shallow if it costs more than thirty minutes.

---

## Phase 4 — The challenges

**Objective.** Build the one shared challenge renderer and drive the three
per-excerpt challenges through it: word lock, search the room, cite the line.
Wire first-attempt scoring, the rewind on a wrong answer, and the nudges.

**Deliverables**
- The shared challenge renderer taking objects, portraits, dial positions or
  numbered lines as choice types from lesson JSON, never lettered options
- Word lock: the brass dial turned to the word's meaning in context, apply
  then define, scored separately, box refusing to open on a wrong turn
- Search the room: recall from memory of carried objects, with the count of
  targets stated, decoys being real objects carried by the wrong people
- Cite the line: the numbered line tapped with the page open, the red-ink
  underline, the margin explanation when a cited line does not support the
  claim, and the right-answer-wrong-evidence count
- The rewind: a wrong answer reopens the page with the evidence region lit,
  and revealed text stays on screen
- Nudges: no cost, limited to two per case, with the limit visible
- The excerpt loop: after the third challenge, the next excerpt's vocabulary
  begins, through all ten excerpts

**Acceptance criteria**
- No screen presents lettered A/B/C/D options anywhere
- A wrong answer visibly reopens the page with the proving line lit, and the
  reader can retry without the recorded score changing
- The six scoring tests from Phase 1 still pass with the real screens
  dispatching
- Right-answer-wrong-evidence is counted separately in state
- A third nudge request is refused without penalty
- Every challenge has a visible reread action; using it changes no score,
  timer or first-attempt record, and previously revealed evidence stays
  visible on return *(council, PRD P0-3)*
- Every challenge item renders from the lesson by ID; the build scan passes
- A full run through ten excerpts reaches the finale

**Risk notes.** This is the largest phase and the one where the tripwire is
most likely to fire. If it runs past four hours, the fix is not to drop a
challenge type (never cut) but to leave polish for after Phase 6.

---

## Phase 5 — Finale and Case Report

**Objective.** Build the two-stage finale over the reader's own cited clues,
then the Case Report with the verdict ladder and the deterministic coach
working before any live call exists.

**Deliverables**
- Reconstruct the case: the book shut, the people named from memory with no
  names on the portraits, seven candidate clues drawn from across all ten
  excerpts of which four prove the solve, naming the culprit without the
  proving clues counted as a partial solve
- Set the words into the line: the closing statement composed from collected
  vocabulary, the wrong word making the sentence untrue
- The Case Report: verdict at its own scope (solved, comprehension, evidence),
  the four outcomes shown as a ladder, pace shown after the result and never
  as a headline, the cited-clue list with its whose-words column
- The deterministic coach tier, keyed off skill clusters, good enough to be
  the normal experience, which means *(council)*: under 90 words, names the
  one weakest skill cluster, gives one concrete next action, contains no
  story text
- The generic last-resort note
- The line on screen stating the coach never sees the story
- The attribution and no-affiliation note for Project Gutenberg #269

**Acceptance criteria**
- Scripted runs reach all four verdicts: Master Detective, Case Closed,
  Evidence Review, Case Reopened
- No ending uses the words "fail", "failed" or "wrong" as a verdict
- The clues offered in reconstruct are the ones the reader cited earlier
- With the network disabled, the verdict and a deterministic coaching note
  still render, with no error visible to the reader
- The Case Report shows pace below the comprehension result
- The attribution note is present and links the ebook landing page

**Risk notes.** The product's biggest risk (game or worksheet?) is decided
here: if the finale's clues are not visibly the reader's own, the case board
was decoration. Check that before styling anything.

---

## Phase 6 — Live coach on the deployed shell

**Objective.** Replace the Phase 1.5 stub with the real coach function, put
the live call behind the environment flag with the three-tier fallback, and
prove the full game from a clean browser and a phone on the production URL.

**Deliverables**
- The coach function: plain fetch to Gemini Flash-Lite, schema-constrained
  JSON, ~90-word cap, HTTP 200 always, body carrying `source`, `message` and
  a non-production `debug` field
- The client call with a 4.5 s abort and the same fallback ladder mirrored
  locally
- The `USE_LIVE_AI` flag, off by default; one schema smoke test, one
  post-deploy verification
- The coach prompt, written to the agreed tone, receiving performance data
  only
- The key added as a Vercel environment variable to the project from Phase 1.5
- Tests asserting `source === "live"` on the smoke test, never the status code

**Acceptance criteria**
- The smoke test returns `source: "live"` with a note under the word cap
- With the key removed, the function still returns 200 and the reader sees a
  deterministic note with no visible error
- The payload sent to the function contains no story text, verified by a test
  that greps the payload against the source
- The deployed link plays start to finish from a clean browser and from a phone
- The key does not appear in the repo or in any client asset

**Risk notes.** Free-tier caps vary by source. The flag exists so development
never spends live calls. If the key is not in hand when this phase starts, the
phase still completes with tiers two and three; only the smoke test waits.

---

## After the build (Factory phases 7–9)

Not build phases, listed so the clock is honest:

1. **Review** (`/review`), short
2. **Test-QA** (`/test-qa`): the one-hour human read-through of the story and
   every item, the highest-value quality action available, plus the
   clean-browser click-through
3. **Ship** (`/ship`): the 2–3 minute demo video of one playthrough, gameplay
   only, then submit before 18:00 CDT

If time remains after submission, and only then: the re-read (P1-1), the
moving lamp (P1-3), the full parallax room (P1-4).

---

## Dependencies

```
Phase 1 (spine) ──► 1.5 (shell deployed) ──► Phase 2 (content gate) ──► Phase 3 (read) ──► Phase 4 (challenges) ──► Phase 5 (finale, report) ──► Phase 6 (live coach)
                                                                                                                          ▲
User: Gemini key + coach tone (parallel with Phase 1) ─────────────────────────────────────────────────────────────────────┘
```

No phase depends on a later one. Phase 2 gates every screen because nothing
renders story text except through the validated lesson. Phase 6 is the only
phase with an external dependency, and it degrades gracefully without it.

---

## Council recommendation not adopted, recorded

Codex recommended reordering so the plain challenge renderer (Phase 4) is
built before the read and vocabulary styling (Phase 3), protecting the
submission at the cost of the user's chosen flow-order styling. Not adopted:
the user chose flow order in Decide, and the hour-1 spine plus the
operational tripwire above are the agreed guard. If Phase 3 runs past three
hours, that reorder is the first thing to reconsider.

---

## Traceability

| PRD requirement | Delivered in |
|---|---|
| P0-1 nine screens, eleven moments | 1 (navigable), 3, 4, 5 (styled) |
| P0-2 content integrity | 2 |
| P0-3 answers remembered | 3 (book closes), 4 (rewind) |
| P0-4 things and people, never A/B/C/D | 4 |
| P0-5 vocabulary is a key | 3, 4 (word lock) |
| P0-6 timed, never graded | 3 (timer), 5 (display) |
| P0-7 scoring and four verdicts | 1 (core), 4 (wired), 5 (verdicts) |
| P0-8 whole-passage finale | 5 |
| P0-9 Case Report and coach | 5 (deterministic), 6 (live) |
| P0-10 nothing unreviewed | 2 (offline authoring), Test-QA (read-through) |
| P0-11 the submission | Ship |
| P1-1 re-read | after submission only |
| P1-2 voice | cut to captions |
| P1-3 moving lamp | after submission only |
| P1-4 full parallax | after submission only |
| P1-5 pre-computed coach fallback | 5 (deterministic tier) |
