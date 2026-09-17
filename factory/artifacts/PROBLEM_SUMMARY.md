# Problem Summary — Fine Print

**Status:** Complete
**Last Updated:** 2026-09-16 (revised after the mockup session)
**Phase:** 1 of 9 (Understand)

> **Revision note.** The per-excerpt mini-game was originally a three-question multiple-choice triplet (Decode / Deduce / Pin). The mockup session replaced it with detective actions that measure the same skills. This document has been reconciled against that design; see `HANDOFF.md` for the session that produced it.

---

## What is being built

**Fine Print** is a reading-comprehension game for students in grades 6–12. A real short story is turned into a **case** to be solved.

The story is sliced into SAT-length excerpts of roughly 80–150 words, presented with **numbered lines** — the same convention SAT passages use. For each excerpt the reader previews a vocabulary word, then reads silently while being timed.

**Then the book closes.** The answers are not looked up, they are *remembered*. The reader acts from memory in a scene, and this is the turn that makes the product a game rather than a worksheet. Rereading is still always allowed — a wrong answer reopens the page — but the first attempt is made from memory.

Each excerpt is followed by detective actions, which cover the same comprehension skills the multiple-choice triplet did:

| Action | What the reader does | Skill measured |
|---|---|---|
| **The word lock** | Turns a brass lock on an evidence box to the word's meaning in context. The box will not open otherwise | Vocabulary — apply, then define, scored separately |
| **Rule it out** | Strikes out the answers the page cannot support; the inkwell writes the reason in the margin | Inference, and the SAT elimination strategy |
| **Search the room** | From memory, finds the objects the text said were carried. Decoys are real story objects carried by the wrong people | Recall of key detail |
| **Cite the line** | Taps the numbered line that proves the answer. It is underlined in red ink and written into the case notes | Command of evidence |

Two mechanics carry the design:

1. **Numbered lines are the evidence citation system.** SAT passages have numbered lines and the lesson schema wanted sentence IDs; they turn out to be the same mechanism, so evidence works with no extra invention.
2. **Ruling out is both the SAT strategy and the detective's method.** Eliminating the impossible is literally how the genre works, so the test skill and the game verb are one thing.

After the last excerpt comes **Reconstruct the Case**, a four-stage finale over the whole story: rebuild the timeline from cited clues, question the witnesses, catch the lie, then name what really happened and back it with an evidence chain. Naming the culprit is never enough on its own — the reader must produce the clue that proves it.

A Victorian detective avatar — working name **Inspector Inkwell** — guides the lesson. He never speaks while the reader is reading. At the end, a **Case Report** delivers a graded verdict — from *Case Reopened* to *Master Detective* — followed by an **AI coach** who reads the session and tells the reader how to read better next time.

Said plainly: **one story, cut into excerpts. Read an excerpt, play a small detective game on it, repeat. At the end, assemble the clues you collected into the solution. Pass or fail, plus a score.** Comprehension is what is being tested the whole way through — the detective framing is how that is made fun, not a separate system bolted on top.

**The demo build is one lesson: "The Open Window" by Saki**, ingested from Project Gutenberg #269 (*Beasts and Super-Beasts*, 36 stories, verified present in the source EPUB). The app opens in **the study** — a Victorian room at night, where a case is taken off a bookshelf. Spines show a case number and a difficulty band, **never a title** — you choose a case by difficulty, not by whether you have heard of the story. The title is revealed **when the book opens and the lesson begins**, on its title page; it is not withheld to the end. The shelf is built so additional pre-generated stories can be dropped in if time allows.

Eight screens are mocked up and the visual direction is settled — a place, not a set of screens. Mockups: <https://claude.ai/artifact/SLRfvUG9pFVNCunaM85261>

**The room is continuous, and there is only one of it.** The study is built as six parallax depth layers behind a single CSS perspective — far wall and window, shelf and mantel, chair and globe, the desk, the objects on the desk, and blurred clutter close to the eye. Every screen in the game is a camera position on that one stage rather than a separate painting, so moving through the lesson is moving through a room. Depth studies: <https://claude.ai/artifact/169FoCruxxQLCkF6VS4rPa>

This is what makes **Search the room** work. The reader has been standing in that room the whole lesson, so when the game asks which objects were carried, the decoys are sitting on shelves they have already walked past — the task is looking around a room they know, not recalling a list.

---

## The content integrity rule

This is the product's founding constraint and the reason it exists in this shape:

> **Every word the reader reads is from the book. No AI-written reading passages, ever.**
> Questions, vocabulary items, and detective narration may be AI-generated — but only from the ingested text, and every one must be traceable to specific sentences in it.

Most AI reading tools generate the passage alongside the questions and inherit every hallucination the model produces. Fine Print inverts that. The text is real, public-domain, and immovable — sliced verbatim from the source, never paraphrased, summarised, or regenerated. The AI's entire job is asking good questions *about* that text.

Two consequences follow directly:

- **Excerpts must reconstruct exactly to the source.** Concatenating a lesson's excerpts must reproduce the original story text. This is mechanically checkable and should be checked.
- **Every generated item cites line numbers**, not quoted strings. An item whose evidence IDs do not resolve, or whose cited line sits outside its own excerpt, is not shippable.

This rule also explains a non-goal that would otherwise look arbitrary: **no image generation.** An invented visual detail is AI-written content entering the reader's evidence, and could mark a careful reader wrong.

---

## Scoring and the verdict

The lesson ends in a **verdict, not a report card** — but the verdict is graded, not binary.

Two things are measured:

1. **Did you solve the case?** In the final stage the reader names what really happened and backs it with an evidence chain of two to three cited clues. Naming it correctly without the supporting clues is a partial solve, not a solve.
2. **Did you read carefully?** The comprehension score: first-attempt-correct over first-attempt-total, across every scored item in the lesson.

### The four outcomes

| Outcome | Condition | What it says to the reader |
|---|---|---|
| **Master Detective** | Solved + 90%+ comprehension + strong evidence chain | You read it and you proved it |
| **Case Closed** | Solved + 70%+ comprehension | Case solved, evidence holds up |
| **Case Solved — Evidence Review** | Solved, under 70% | You got there, but your evidence file has gaps |
| **Case Reopened** | Case not solved | The case is still open — here is where to look again |

**Every reader reaches the ending.** Retrying is framed as revisiting the case, never as retaking a test. A reader who solves the mystery but misread their way there is told their evidence needs review — not that they failed.

This replaces an earlier binary model where passing required solving the case *and* clearing the bar. That model punished exactly the reader this product targets: solve the mystery, miss the bar, and the payoff moment converts into a failure notice. For 6th–12th graders who already experience reading difficulty as identity failure, that is the wrong message. The graded model keeps the same rigor and removes the humiliation.

**The score is comprehension only.** Reading speed is measured and shown, but never graded and never prominent — presented as neutral reflection after the comprehension result, not as a headline number. A slow, careful reader who understood everything earns Case Closed.

---

## Where AI is used

The content integrity rule says what AI may not touch. This says what it does.

| Surface | When it runs | What it is grounded in |
|---|---|---|
| **Lesson authoring** — questions, distractors, vocabulary items, detective lines | Offline, before the app ships | The source text; every item cites sentence IDs and is human-reviewed |
| **The AI Coach** | Live, at the Case Report | The reader's own session data |
| **Detective voice lines** | Offline (TTS) | Pre-written, pre-reviewed script |

### The AI Coach

After the verdict, an AI coach tells the reader **what they did well and how to read better** — the one moment in the lesson where a struggling reader most wants an answer, right after the effort.

**It sees performance data only:** which items were missed on first attempt, which skills they cluster in (inference vs. key detail vs. vocabulary), which distractor types fooled them, where in the excerpt the evidence sat for the ones they missed, pace per excerpt, and how often they answered correctly but cited the wrong line.

**It never sees or discusses the story.** This is deliberate and it is what makes a live model call safe inside a product whose founding rule bans AI-written content. The coach makes claims about *the reader's behaviour*, not about Saki — so there is no literary content it could get wrong. It can say:

> "You missed three inference questions, and in every one the evidence was in the last two sentences of the excerpt. You are deciding what a passage means before you have finished reading it."

It cannot say anything about what happens in "The Open Window," because it was never told.

**It runs as a live API call**, not a lookup table — real generation, on the reader's actual session, visible in the demo. This is the answer to "where is the AI?" and it is a better answer than a static rigor overlay, because it serves the student rather than the judge.

**This is not chat.** The coach speaks once, unprompted, about performance. There is no conversation, no follow-up questions, no text box. The non-goal banning open-ended chat with the detective stands.

---

## Why it is being built

The origin is personal. The author was a slow reader with weak comprehension, and built the tool he needed and could not find.

---

## The problem it solves

Students in grades 6–12 are asked to read silently and are then assessed on comprehension, but they get almost nothing in between:

- **No feedback on the act of reading itself.** Speed and comprehension are measured separately, if at all. A student who skims fast looks the same as one who reads well. Fine Print times the silent read and reports **effective reading rate = WPM × comprehension** alongside the score, so a reader can see that speed without understanding is worth nothing — without being graded down for reading carefully.
- **Right answers hide weak reasoning.** Multiple-choice comprehension rewards lucky guesses. Citing a line for every inference exposes the gap between *correct answer* and *correct reasoning* — the "right answer, wrong evidence" count is a first-class metric in the report.
- **Practice material is generic.** Worksheets come pre-made for a fixed canon, disconnected from what a reader actually wants to read.
- **Existing read-aloud tools address a different problem.** Products like Amira and Readability assess oral fluency for younger readers. Silent-reading efficiency for older students is comparatively unserved.

---

## Who it is for

**Primary user: a student in grades 6–12, working on their own.** They play solo, and the Case Report is written for them — not for a teacher or a parent. There is no roster, no assignment flow, and no teacher dashboard.

The classroom case is *visible but not built*: because a lesson is authored once and then replayed by any number of readers at near-zero marginal cost, the economics of institutional use are easy to describe without building a single teacher-facing feature.

**Reader assumptions:** a competent decoder who struggles with comprehension, inference, and pace — not a beginning reader. Comfortable with a game-like interface. Playing voluntarily, so the experience has to earn attention rather than assume it.

---

## Direction and success

**What this is:** a submission to the Nerdy AI Hackathon (English Reading Game prompt) and a portfolio piece. Success is the submission itself plus a build worth showing people. Not a product with users to serve after Friday — shortcuts are acceptable **where they never surface in the demo**, and nowhere else.

**Scope of play: one case, end to end, excellent.** A single complete playthrough of "The Open Window" is the deliverable. Between-lesson adaptation (pace targets, weakest-skill targeting, spaced vocabulary review) is designed and documented but not built as live cross-session state. Where progression is shown, it is labelled as illustrative. No fabricated learning-gain charts — two days cannot demonstrate learning gains, and claiming otherwise would undercut the product's own honesty.

**The demo video is the lesson.** Three minutes of a reader playing the case — briefing, vocab preview, timed read, the book closing, a word lock, a rule-it-out with a wrong answer and a rewind, a cite-the-line, then Reconstruct, the verdict, and the AI coach responding to that specific playthrough. Book ingestion is not shown.

**The pitch is grounding, not scale.** The old line — "any book in, a verified reading case out" — describes the authoring step, not the product, and centering it would invite exactly the question the build no longer answers. The claim to make instead: *Fine Print does not replace reading with AI. It uses AI to make a reader prove meaning from the actual text.*

---

## Major scope reduction (decided during this phase)

The original spec described a full ten-stage ingestion pipeline running inside the product, with readers uploading their own EPUBs. **That is out.** Specifically removed:

| Removed | Was |
|---|---|
| In-app book upload | Upload screen, file drop, `POST /api/uploads` |
| Collection story picker | Pick one of 36 stories from an uploaded collection |
| In-app generation | Job queue, `POST /api/lessons`, stage progress UI, per-stage counts |
| Plans and quota | Free/Pro/Unlimited tiers, generation counter, word caps, upgrade blocks |
| Live pipeline in the demo | The 0:15–0:45 upload-and-generate beat of the video |

The lesson is **produced offline, before the app runs**, and ships as a static asset the app loads and plays. "The Open Window" is ingested once from the EPUB; its excerpts are sliced verbatim from that text; its questions, vocabulary and detective lines are AI-authored against those excerpts and verified before they ship.

**What this buys:** the entire backend surface collapses. No job orchestration, no upload handling, no quota enforcement, no provider keys needed at runtime, no generation latency in the demo. Effort moves to the thing a judge actually plays.

**What it costs, stated plainly:** "any book in, a verified reading case out" is no longer literally true of the running product — it is true of the authoring step. The pitch line needs rewording.

---

## Constraints

**Hard deadline: Friday, September 18, 2026, 11:59 PM CDT.** Work begins the evening of Wednesday, September 16 — roughly 54 hours, including sleep. Submission is a project link plus a 2–3 minute demo video; the target is to submit Friday afternoon, not at the buzzer.

**Team of one.**

**Scope posture: build the full remaining spec; ask before cutting.** The ordered cut list is **witnesses stage → 3D avatar down to 2D → voice down to captions** (see the risks section). Never cut: the reading step, the detective actions, the Reconstruct solve stage, and the content integrity guarantees.

**Source text:** "The Open Window" by Saki, from Project Gutenberg #269 — public domain in the US, 1,208 words, roughly 10 excerpts. The source EPUB is present locally and confirmed to contain all 36 stories with clean story headings.

**Nothing unreviewed is ever shown to a child.** Every question and every detective line is generated and reviewed before it ships. There is no live model output in front of a reader at any point.

**Assets must be legally usable.** Avatar and prop assets CC0 or CC-BY only, with attribution recorded.

---

## Non-goals

These are deliberate exclusions, not omissions:

1. **AI-written reading passages.** The founding rule. Text comes from the book or it does not appear.
2. **In-app book upload or content generation.** Removed this phase. The one live model call in the product is the coach, which generates coaching from session data — never lesson content.
3. **Plans, quota, and payments.** No tiers, no counters, no billing.
4. **Oral reading fluency.** Silent reading efficiency only. Accuracy and prosody require read-aloud assessment and a different product.
5. **Image generation.** An invented visual detail is AI content entering the reader's evidence.
6. **Open-ended chat.** Every detective line is pre-generated and validated. The AI coach speaks once, unprompted, about the reader's performance — there is no text box, no follow-up, no conversation.
7. **Speed-reading techniques.** No RSVP, no suppression of regressions. Rereading is explicitly allowed and revealed sentences stay on screen — most regressions repair a comprehension failure, and blocking them harms the thing being taught.
8. **Timed questions.** Speed is measured during reading only. Questions are untimed so thinking is never penalised.
9. **Teacher or parent accounts**, rosters, assignment flows, or classroom management.
10. **Whole-collection lessons.** One story is one case.
11. **Claims of measured learning gains.** Not demonstrable in two days.
12. **Crime framing as a default.** Case language is "what really happened," not "who is the criminal." Not every story contains a crime.

---

## Product principles (non-negotiable interaction rules)

Design law, not preferences:

- The detective is **silent and minimized during reading.** Nothing competes with the text.
- **Rereading is always allowed.** Revealed sentences stay visible.
- **A wrong answer rewinds** — highlight the evidence region and let the reader try again.
- **Only first attempts are scored.** Retries exist so every reader can finish; scoring stays honest.
- **Apply before define.** Ask what a word *does* in context before asking what it means, and score the two separately.
- **Vocabulary is a key, not a quiz.** Each excerpt's words are taught before the reading, and at least one of them is load-bearing in the detective action that follows — the correct answer is only reachable by someone who knows what the word meant. The gate is soft and the feel is hard: the lock will not turn on the wrong meaning, but a wrong attempt reopens the page with that word's sentence lit, and only the first attempt scores. No reader dead-ends on vocabulary.
- **Tell the reader how many items to find** whenever a task has multiple targets.

---

## Central risks

**1. Does it feel like a game or like a worksheet?** This is the highest-risk assumption in the entire product, and it is not technical. If citing a line reads as "select the supporting quote," the detective theme is decoration and the council's warning lands — a nice reading worksheet with a detective skin. If it reads as "prove the motive," "catch the contradiction," "build your case," the product works. Everything else is downstream of this. The structural mitigation is **closing the book**: acting from memory in a scene is a different act from scanning a passage for a quote. The rest is craft — the language on the button, the weight of the ink, and above all whether cited clues visibly *matter later*. A case board that only collects clues is decorative. A case board whose exact clues become the material of the finale is the spine of the game.

**2. Lesson content quality.** There is one lesson, and everything a judge sees runs through it. A single bad distractor, an unanswerable inference, or a cited line that does not support its claim is now visible in the demo rather than buried in a drop log. Mitigations, both cheap: mechanical verification of the lesson JSON (excerpts reconstruct exactly to source, evidence IDs resolve, cited lines sit inside their own excerpt, options unique, indices valid) and a full human read-through of the story and all ~30 items, roughly an hour, the highest-value quality action available.

**3. Scope was increased twice after the deadline was known** — the four-stage finale was kept against advice to compress it, and a live AI coach was added. Both are defensible and both cost hours that do not exist elsewhere. The mitigation is that the cut order is now **pre-committed rather than decided at 2 AM Friday**:

| Order | Item | Trigger |
|---|---|---|
| 1st | **Witnesses stage** of the finale | Build timeline, lie, and solve first; witnesses only if time remains |
| 2nd | **3D avatar → 2D** | Not solid by Thursday evening |
| 3rd | **Voice → captions only** | TTS or timings not working by Friday morning |

**4. The coach is a live call in a demo.** It is the one runtime dependency on an external service, and it runs at the emotional high point of the video. A failed call at the Case Report is the worst possible moment for one. A pre-computed fallback path was offered and not taken; if the live call proves flaky during Thursday testing, adding one is the obvious insurance.

---

## Open questions

### Product
- **Pitch line.** Direction agreed — grounding over scale — but the exact demo line is not final.
- **Naming.** "Fine Print" and "Inspector Inkwell" are working names pending trademark and app-store checks. Low risk for a hackathon submission; unresolved.
- **Content read-through.** "The Open Window" needs a full personal read before the demo, so no item is defended without knowing the story cold.
- **Shelf framing.** With one case present, what the study's bookshelf says about the absent others — "more coming," empty slots, or nothing at all.
- **Does striking out a *correct* answer in Rule it out cost a mark?** Unsettled.
- **Are hint nudges free but limited, or do they cost marks?** Unsettled.
- **What the difficulty bands mean concretely** — the spines show First / Longer / Difficult cases, but not what separates them.
- **How the finale's four stages map onto the mocked-up "Name the culprit" screen.** The four-stage Reconstruct is locked and the witnesses stage is cut candidate #1; the mockups show one culprit-naming screen. Whether that screen *is* the solve stage or the whole finale needs settling in the PRD.
- **Where the comprehension bar sits.** 70% is the starting assumption; needs tuning against a real playthrough so that solving the case and then failing is rare.
- **How a near-miss is presented** — "case solved, evidence shaky" rather than a flat fail.

- **Coach tone.** How direct it is allowed to be about weak performance, given the reader it is written for.
- **How "strong evidence chain" is defined** for the Master Detective outcome.

### Deferred to Presearch `[for Presearch]`
- **The coach needs a live model call, so the app cannot be purely static** — an API key cannot ship in browser code. Something server-side must hold it, which changes the deployment shape `[for Presearch]`
- Whether a pre-computed coaching fallback is built as insurance against a failed live call during the demo `[for Presearch]`
- How the lesson JSON is authored: directly against the schema with a standalone validator, versus one collapsed offline generate script that takes a story and emits validated JSON `[for Presearch]`
- LLM provider and model selection for authoring the questions; no API keys currently in the environment `[for Presearch]`
- Text-to-speech provider, and whether it returns the word timings the avatar needs for lip sync `[for Presearch]`
- 3D avatar library and model availability, plus licensing of avatar and props `[for Presearch]`
- Frontend framework and deployment target; whether any backend is needed at all now that generation is offline `[for Presearch]`
- Where session data (reading events, answers) lives, given there are no accounts `[for Presearch]`
- EPUB text extraction approach — the source parses cleanly from XHTML headings, so pandoc may be unnecessary `[for Presearch]`
- Local toolchain gaps: system Python 3.9 only, no pandoc, no uv `[for Presearch]`
- Project Gutenberg terms regarding redistribution of derived lesson content `[for Presearch]`
