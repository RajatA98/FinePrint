# PRD — Fine Print

**Phase:** 2 of 9 (PRD)
**Status:** Complete (approved 17 Sep 2026)
**Written:** Thu 17 Sep 2026, 21:45 CDT
**Deadline:** Fri 18 Sep 2026, 23:59 CDT — **26 hours at time of writing**
**Inputs:** `PROBLEM_SUMMARY.md` (Phase 1), `HANDOFF.md`, `/PRODUCT.md`, twelve approved comps
**Comps:** <https://claude.ai/artifact/7qF3bDvBibTNuWEfypUTz7> (v10, twelve artboards, clickable in Play)

> **Phase boundary.** This document states *what must be true*. Every technology
> choice — framework, hosting, model provider, TTS, where session data lives,
> authoring tooling — is deferred to Presearch (Phase 3) and is marked
> `[for Presearch]` where it touches a requirement.

---

## Problem Statement

Students in grades 6–12 are asked to read silently and are then assessed on comprehension, and they get almost nothing in between. Speed and understanding are measured separately if at all, so a student who skims fast looks the same as one who reads well; multiple-choice comprehension rewards lucky guesses, so a right answer hides weak reasoning; and practice material is generic worksheet content disconnected from anything a reader wants to read.

The cost of not solving it is specific and personal: a reader who struggles with comprehension experiences every assessment as a verdict on themselves, learns nothing actionable from it, and stops reading. The author of this product was that reader and built the tool he could not find.

**Evidence on hand is thin and stated as such.** There is no user research, no usage data, and no measured learning outcome. The problem statement rests on the author's own experience and on the observable structure of existing tools (read-aloud fluency products such as Amira and Readability address oral fluency for younger readers; silent-reading efficiency for older students is comparatively unserved). Nothing in this document may be presented as a measured finding.

---

## Goals

1. **A reader must be unable to pass by guessing.** Every scored item requires either an answer produced from memory or a line citation that resolves to the text. Measured by: the "right answer, wrong evidence" count is non-zero and visible in the Case Report.
2. **A reader who solves the case but read carelessly learns which of the two happened.** Measured by: the four graded outcomes resolve distinctly on a real playthrough, and the Evidence Review outcome is reachable.
3. **The product's central claim is demonstrable, not asserted.** A judge can verify that every word read is verbatim Saki. Measured by: the mechanical verification suite passes on the shipped lesson (see P0-9).
4. **The lesson reads as detective work rather than assessment.** Measured by: a first-time player reaches the finale without being told the rules, and no screen presents lettered A/B/C/D options.
5. **Submit on Friday afternoon, not at the buzzer.** Measured by: project link and demo video submitted before 18:00 CDT.

Goals 1–4 are product outcomes. Goal 5 is the delivery outcome and it outranks the others on conflict.

---

## Non-Goals

1. **AI-written reading passages.** The founding rule. Text comes from the book or it does not appear. Out of scope permanently, not for v1.
2. **In-app book upload or runtime lesson generation.** Cut in Phase 1. The lesson is authored offline and ships as a static asset. Removes the entire job-queue, quota and upload surface.
3. **Teacher or parent accounts, rosters, assignment flows.** The primary user plays alone and the Case Report is written for them. Institutional use is describable without building a teacher-facing feature.
4. **Plans, quota, payments.** No tiers, no counters, no billing.
5. **Oral reading fluency.** Silent-reading efficiency only. Accuracy and prosody need read-aloud assessment and a different product.
6. **Image generation of story content.** An invented visual detail is AI content entering the reader's evidence and could mark a careful reader wrong.
7. **Open-ended chat with the detective.** The coach speaks once, unprompted, about performance. No text box, no follow-up.
8. **Claims of measured learning gains.** Not demonstrable in two days; claiming it would undercut the product's own honesty argument.
9. **Cross-session progression as live state.** Between-lesson adaptation is designed and documented but not built. Where progression appears it is labelled illustrative.

---

## User Stories

### The reader (grades 6–12, alone, voluntary)

1. As a reader, I want to choose a case by how hard it is rather than by whether I have heard of it, so that I am not pre-judging my own reading.
2. As a reader, I want the words I will trip over taught to me *before* I read, so that unfamiliar vocabulary does not cost me the passage.
3. As a reader, I want to read the excerpt without anything competing for my attention, so that I can actually concentrate.
4. As a reader, I want to be asked what I held rather than what I can find, so that the game is about understanding rather than scanning.
5. As a reader, I want to answer by pointing at the room's own objects and faces, so that it feels like detective work rather than a quiz.
6. As a reader, I want a wrong answer to reopen the page with the relevant line lit, so that I learn the thing I missed instead of just losing a point.
7. As a reader, I want to prove my answers by citing the line, so that being right for the wrong reason is visible to me.
8. As a reader, I want the clues I cited to be the material of the finale, so that the work I did earlier obviously mattered.
9. As a reader, I want the ending to tell me *how* to read better next time, not just what I scored.
10. As a reader who read slowly and carefully, I want to reach a good ending, so that care is not punished.
11. As a reader, I want to retry without my score changing, so that finishing is always possible and the number stays honest.

### Edge and empty cases

12. As a reader who gets the vocabulary wrong, I want the lock to refuse and the page to reopen with that word's line lit, so that I never dead-end on a word.
13. As a reader who cites a line that does not support the claim, I want the margin to tell me why it does not, so that the correction teaches the distinction.
14. As a reader who fails to solve the case, I want the ending to say where to look again, so that "Case Reopened" is an invitation rather than a fail screen.
15. As a reader on a slow connection or with the coach call failing, I want the Case Report to still deliver my verdict, so that the ending is never blocked on a network call.

### The judge (Nerdy AI Hackathon)

16. As a judge, I want to see where the AI is and what it is grounded in, so that I can distinguish this from a wrapper.
17. As a judge, I want to verify that the reading text is real, so that the product's central claim is checkable rather than asserted.

---

## Requirements

### Must-Have (P0) — the submission is not viable without these

**P0-1 · The eleven-moment playable flow.**
Study → book opens (title reveal) → vocabulary → timed read → the book closes → word lock → search the room → cite the line → reconstruct the case → set the words into the line → Case Report.

> **Amended by `LOCKED_DECISIONS.md` (Phase 4, 17 Sep):** eleven *moments*, **nine
> built screens**. "The book opens" and "the book closes" are CSS transitions on
> entering and leaving the read, not separate screens. No gameplay is lost.

- [ ] All eleven moments reachable in order without a dead end
- [ ] Every screen readable at 1440×900; no clipped text, no overlapping panels
- [ ] The reader can complete the flow start to finish without instruction from outside the product
- [ ] No screen presents lettered A/B/C/D options anywhere

*The re-read (frame 12) is **P1**, not cut — see P1-1.*

**P0-2 · Content integrity, mechanically enforced.**
- [ ] Concatenating the lesson's excerpts reproduces the source text exactly
- [ ] Every excerpt is a contiguous slice that closes on a sentence
- [ ] Every generated item cites line numbers, not quoted strings
- [ ] Every cited line resolves, and sits inside its own excerpt
- [ ] One line numbering runs across the whole story; a line number means the same thing on every screen
- [ ] A phrase lookup resolves to the line the phrase *starts* on, including when it straddles a line break
- [ ] No invented story content appears anywhere a reader could take it for source text

Given a lesson file, when the verification suite runs, then any violation fails the build rather than reaching a reader.

**P0-3 · The answers are remembered, not looked up.**
- [ ] The book visibly closes before the word lock, search and reconstruct
- [ ] Rereading is always permitted; revealed text stays on screen
- [ ] A wrong answer reopens the page with the evidence region lit
- [ ] Only first attempts score; retries are always available
- [ ] The citation step (cite the line) is the one action where the page is open, because citing evidence requires the text

**P0-4 · Challenges are presented as things and people, never as lettered options.**
- [ ] Underneath, each challenge is single-correct-answer and scorable
- [ ] The reader chooses among objects, portraits, engraved dial positions or numbered lines
- [ ] Every distractor is a real element of the story in the wrong role — never invented content
- [ ] Every target object is identifiable in isolation by a reader who has read the passage once
- [ ] Tasks with multiple targets state how many to find

**P0-5 · Vocabulary is a key, not a quiz.**
- [ ] The excerpt's words are taught before the read, and nothing on that screen is scored
- [ ] At least one word is load-bearing in the challenge that follows
- [ ] Apply before define: what the word does in context is asked before what it means, scored separately
- [ ] A wrong lock attempt reopens the page with that word's line lit
- [ ] No reader can dead-end on vocabulary

**P0-6 · Reading is timed, shown, and never graded.**
- [ ] The silent read is timed
- [ ] Pace is reported after the comprehension result, never as a headline
- [ ] Pace contributes nothing to the score
- [ ] Questions are untimed

**P0-7 · Scoring and the four verdicts.**
Comprehension score = first-attempt-correct ÷ first-attempt-total, across every scored item.

| Outcome | Condition |
|---|---|
| **Master Detective** | Solved **and** ≥90% **and** all four proving clues found |
| **Case Closed** | Solved **and** ≥70% |
| **Case Solved — Evidence Review** | Solved, under 70% |
| **Case Reopened** | Not solved |

- [ ] Striking out a correct answer in rule-it-out costs **no** mark
- [ ] Hint nudges cost **no** mark and are limited to two per case
- [ ] Only the first attempt at a scored item counts
- [ ] Retrying never changes a recorded score
- [ ] "Right answer, wrong evidence" is counted and reported separately
- [ ] Every reader reaches an ending; retrying is framed as revisiting the case
- [ ] No ending uses the words "fail", "failed" or "wrong" as a verdict

**P0-8 · Reconstruct the case tests the whole passage.**
- [ ] Clues are drawn from across all ten excerpts, not one
- [ ] The reader names the people from memory; names are not shown on the portraits
- [ ] Seven candidate clues, four of which prove the solve; the three decoys are true lines that do not prove it
- [ ] Naming the culprit without the supporting clues is a partial solve, not a solve
- [ ] The clues the reader cited earlier are the material of this screen
- [ ] The book stays shut for this screen

**P0-9 · The Case Report and the coach.**
- [ ] The verdict is delivered at its own scope: solved, comprehension, evidence
- [ ] The four outcomes are shown as a ladder so the reader sees where they landed without being failed
- [ ] The coach speaks once, unprompted, about the reader's performance only
- [ ] The coach is never given the story text, and the screen says so to the reader
- [ ] The coach runs as a live model call `[for Presearch]`
- [ ] **If the coach call fails, the verdict still renders.** The ending is never blocked on a network call

**P0-10 · Nothing unreviewed reaches a child.**
- [ ] Every question, distractor, vocabulary item and detective line is generated offline and human-reviewed before shipping
- [ ] No live model output is shown to a reader at any point except the coach, which sees performance data only
- [ ] A full human read-through of the story and every item is completed before submission

**P0-11 · The submission itself.**
- [ ] Project link live and reachable
- [ ] Demo video, 2–3 minutes, showing one playthrough: briefing, vocabulary, timed read, the book closing, a word lock, a wrong answer and its rewind, a cite-the-line, the finale, the verdict, the coach responding to that specific run
- [ ] Ingestion is not shown in the video
- [ ] Submitted before 18:00 CDT Friday

### Nice-to-Have (P1) — improves it materially, core works without

**P1-1 · The re-read (frame 12).** The reader is sent back to the excerpt carrying the niece's three tells, now marked, with their two reading rates side by side and effective rate (WPM × comprehension). Reuses the read screen, so it is cheap to add back.
- [ ] Same excerpt, unchanged text, tells marked in the reader's own ink
- [ ] Both rates shown with "neither number is your score"

**P1-2 · Voice.** Detective lines as pre-generated TTS `[for Presearch]`. Captions are the pre-committed fallback.

**P1-3 · The moving lamp.** The lamp travels down the page as the reader reads, with unread text in shadow. Currently a static state.

**P1-4 · The full six-layer parallax stage on every screen.** Eight of twelve comps carry the room; four carry a shallow treatment by explicit user decision (17 Sep). Closing the gap is a fast-follow, not a launch blocker.

**P1-5 · A pre-computed coaching fallback.** Insurance against the live call failing at the demo's emotional peak. Offered in Phase 1 and declined; revisit if the call proves flaky in testing.

### Future Considerations (P2) — not built, but do not design them out

**P2-1 · More cases on the shelf.** The shelf is built for additional pre-generated stories to drop in. Do not hard-code a single lesson path.

**P2-2 · Cross-session adaptation.** Pace targets, weakest-skill targeting, spaced vocabulary review. The vocabulary type case already derives which excerpt each word came from, which is the substrate for spaced review.

**P2-3 · The classroom case.** A lesson authored once and replayed at near-zero marginal cost. Do not build teacher features; do not make the lesson format assume a single player.

**P2-4 · The Bertie repetition as a clue class.** "Bertie, why do you bound?" appears twice — once as Vera's invented detail, once from the real man on the lawn. Generalising "the same line appears twice" into an authorable clue type is a strong future item.

---

## Success Metrics

**Stated honestly: this product has no users.** There is no adoption, retention or satisfaction data to report, and none may be fabricated. The metrics below split into what is verifiable before submission and what would only become measurable if the product ever reached readers.

### Verifiable before submission (these are the real bar)

| Metric | Target | Method |
|---|---|---|
| Excerpt reconstruction | 100% exact against Gutenberg #269 | Verification suite |
| Cited lines resolving inside their own excerpt | 100% | Verification suite |
| Line-number consistency across screens | 100% | Verification suite |
| Items surviving human read-through | 100% reviewed, 0 unanswerable | One-hour read-through |
| Playthrough completion without outside instruction | 1 of 1 testers | Observed run |
| Screens with lettered A/B/C/D options | 0 | Inspection |
| Contrast failures on reading text | 0 | Detector |
| Flow dead ends | 0 | Click-through of all eleven screens |

### Leading indicators — **unmeasured, definitions only**

Recorded so the product knows what it would watch, not as claims: activation (reaches the finale), task completion per challenge type, "right answer / wrong evidence" rate, first-attempt accuracy by skill cluster (inference vs. key detail vs. vocabulary), retry rate, drop-off point.

### Lagging indicators — **unmeasured, and explicitly not claimed**

Retention, comprehension improvement over time, effective-reading-rate change. **Two days cannot demonstrate learning gains and this document does not claim any.**

---

## Open Questions

### Blocking — answer before or during implementation

- **Difficulty bands.** The spines show First / Longer / Difficult cases; what concretely separates them is unsettled. *Owner: product.* Blocking only for the shelf's labels, not the playable path.
- **Coach tone.** How direct the coach may be about weak performance, given the reader it is written for. *Owner: product.* Blocking, because the coach prompt cannot be written without it.
- **The exact pitch line.** Direction agreed — grounding over scale. Working claim: *"Fine Print does not replace reading with AI. It uses AI to make a reader prove meaning from the actual text."* *Owner: product.* Blocking for the submission copy only.

### Non-blocking — resolve during implementation

- **Shelf framing** with one case present: "more coming", empty slots, or nothing at all. *Owner: design.*
- **Naming.** "Fine Print" and "Inspector Inkwell" are working names; trademark and app-store checks not done. Low risk for a hackathon submission. *Owner: product.*
- **Nuttel's cameo** does not read as distinct at 64px. *Owner: design.*
- **Letterpress deboss** is real on one surface and claimed on every letterpress label. *Owner: design.*
- **Two frames' shallow room** does not resolve visibly at the rendered size. *Owner: design.*
- Whether the comprehension bar at 90/70 survives a real playthrough. *Owner: product, after the first end-to-end run.*

### Deferred to Presearch (Phase 3) — do not answer here

Frontend framework and deployment target · how the lesson file is authored and validated · model provider and model for the coach · **where the coach's API key lives, since a key cannot ship in browser code and this changes the deployment shape** · TTS provider and whether it returns word timings · where session data lives given there are no accounts · Project Gutenberg terms for redistributing derived lesson content · local toolchain gaps (Python 3.9, no `uv`, no pandoc).

---

## Timeline Considerations

**Hard deadline: Friday 18 September 2026, 23:59 CDT.** 26 hours from this document. Target submission Friday afternoon. Team of one.

**Phasing for the remaining hours:**

1. Presearch and Decide — short. The one question with real consequence is where the coach's key lives, because it decides whether this is a static deploy or not.
2. Lesson file for "The Open Window" — authored and passing the verification suite. This gates everything downstream.
3. The eleven-screen flow, in flow order, so a partial build is still a demonstrable partial.
4. Human read-through of the story and all items — one hour, the highest-value quality action available.
5. Demo video and submission.

**Pre-committed cut order, in order, decided now rather than at 2 a.m.:**
1. The re-read (P1-1)
2. Voice down to captions (P1-2)
3. The moving lamp down to a static lit state (P1-3)

**Never cut:** the reading step, the challenges, the finale solve stage, the content-integrity guarantees, the Case Report.

**The one runtime dependency** is the coach's live model call, and it lands at the demo's emotional peak. P0-9 requires the verdict to render without it.

---

## Changes from Phase 1 recorded here

These were decided after `PROBLEM_SUMMARY.md` was written and this document supersedes it on each:

- **Challenge presentation.** Neither the original Decode/Deduce/Pin triplet nor plain multiple choice. Single-correct-answer underneath, presented as things and people from the passage. *(17 Sep, user)*
- **The finale is two stages, not four.** Witnesses and the timeline-ordering stage are gone. Reconstruct now tests the whole passage — naming the people from memory and collecting the right clues — and the closing statement is composed from collected vocabulary. *(17 Sep, user)*
- **The vocabulary returns at the close.** The conclusion is written by setting collected words into the sentence; the wrong word makes the sentence untrue. *(17 Sep, user)*
- **A re-read beat exists** as the fluency lever, at P1. *(17 Sep, user)*
- **Dialogue versus narration is now taught content.** The Case Report's cited-clue list carries a whose-words column. This came out of a real content bug: a line of Saki's narration had been filed as part of a character's lie. *(17 Sep)*
- **Scoring penalties settled:** neither strike-outs nor nudges cost marks; nudges limited to two. *(17 Sep, user)*
- **Verdict bar settled:** 90/70, with Master Detective requiring all four proving clues. *(17 Sep, user)*
- **P0 scope settled:** eleven screens; the re-read is P1. *(17 Sep, user)*
