# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Undecided for the production build — deferred to the project's Presearch phase (`factory/artifacts/`). This session's deliverable is **approval comps, not the shipping front end**: the user chose "pictures to approve, rebuild later," so comps are authored as self-contained static HTML/CSS frames for fidelity and are explicitly not the production codebase. No framework or scaffold exists in the repo yet.

## Users

**Primary user: a student in grades 6–12, working alone, voluntarily.** They are a competent decoder who struggles with comprehension, inference, and pace — not a beginning reader. Comfortable with a game-like interface. Because play is voluntary, the experience must earn attention rather than assume it.

The Case Report is written **for the student**, never for a teacher or parent. No roster, no assignment flow, no teacher dashboard. Institutional use is describable but unbuilt.

## Product Purpose

**Fine Print** turns a real public-domain short story into a **case to be solved**. The story is sliced into SAT-length excerpts (~80–150 words) presented with **numbered lines**. Per excerpt: the reader previews the vocabulary, reads silently while timed, **then the book closes** and they act from memory in a scene. After the last excerpt, a multi-stage finale reassembles the whole story from the clues they cited. It ends in a graded verdict plus an AI coach.

Success for this build: a Nerdy AI Hackathon submission (English Reading Game prompt) and a portfolio piece — one complete playthrough of "The Open Window," excellent end to end.

## Positioning

*Fine Print does not replace reading with AI. It uses AI to make a reader prove meaning from the actual text.*

Most AI reading tools generate the passage alongside the questions and inherit every hallucination. Fine Print inverts it: the text is real, public-domain and immovable; AI's entire job is asking good questions *about* it. The grounding, not the scale, is the claim.

Two mechanics no neighboring product has fused:
1. **Numbered lines are the evidence citation system** — the SAT convention and the lesson's sentence IDs are the same mechanism, so "cite your evidence" needs no invention.
2. **Ruling out is simultaneously the SAT strategy and the detective's method** — the tested skill and the game verb are one thing.

## Operating Context

A solo session at a screen, played once through, roughly the length of a class period. The lesson is authored **offline** and ships as a static asset the app loads and plays; there is no upload, no in-app generation, no job queue, no quota. Exactly one live model call exists in the running product: the coach.

The demo artifact is a 2–3 minute video of a single playthrough — briefing, vocab, timed read, the book closing, the challenges, a wrong answer and a rewind, then the finale, the verdict and the coach responding to that specific session. Ingestion is never shown.

## Capabilities and Constraints

**The lesson flow (confirmed this session):**
select a case → title reveal → learn the vocabulary → read the excerpt → **3 challenges from memory** → repeat per excerpt → full-story interactive finale → Case Report.

**Challenge presentation (decided this session, supersedes both prior shapes):** underneath, each challenge is multiple choice — one correct answer, real distractors, scorable. It is **never presented as lettered A/B/C/D text options.** The reader is shown *things and people from the passage* — objects on the desk, suspects' portraits, the window itself — and picks from memory. **Distractors are real story elements in the wrong role,** never invented content. The four detective verbs (word lock, rule it out, search the room, cite the line) are the vocabulary for these challenges.

**The room is continuous and there is only one of it.** The study is six parallax depth layers behind a single CSS perspective: far wall and window; shelf and mantel; chair and globe; the desk; the objects on the desk; blurred near clutter. Every screen is a **camera position on that one stage**, not a separate painting. This is load-bearing, not decorative: it is why the object and character challenges work — the decoys sit on shelves the reader already walked past.

**Case selection:** spines show a case number and a difficulty band, **never a title.** The title is revealed when the book opens and the lesson begins.

**Scoring:** comprehension only — first-attempt-correct over first-attempt-total. Four graded outcomes: Master Detective (solved + 90% + strong evidence chain), Case Closed (solved + 70%), Case Solved — Evidence Review (solved, under 70%), Case Reopened (unsolved). Every reader reaches an ending; retrying is "revisiting the case," never retaking a test. Reading speed is measured and shown but **never graded and never prominent.**

**The AI coach** speaks once, unprompted, at the Case Report. It sees **performance data only** — missed items, their skill clusters, where in the excerpt the evidence sat, pace, "right answer / wrong evidence" counts. It **never sees or discusses the story**, which is what makes a live model call safe inside a product that bans AI-written content. Not chat: no text box, no follow-up.

**Hard constraints:** deadline Friday 18 Sep 2026, 23:59 CDT. Team of one. Nothing unreviewed is ever shown to a child. Assets must be CC0 or CC-BY with attribution recorded.

**Pre-committed cut order:** witnesses stage → 3D avatar down to 2D → voice down to captions. **Never cut:** the reading step, the challenges, the finale solve stage, the content integrity guarantees.

**Undecided product facts:** the exact comprehension bar (70% assumed, tune after a real playthrough); whether striking out a *correct* answer costs a mark; whether nudges cost marks or are merely limited; what the three difficulty bands concretely mean; the final pitch wording. Names "Fine Print" and "Inspector Inkwell" are working names, trademark unchecked.

## Brand Commitments

**The content integrity rule is the founding constraint:**

> Every word the reader reads is from the book. No AI-written reading passages, ever. Questions, vocabulary and detective narration may be AI-generated — but only from the ingested text, and every one must trace to specific line numbers in it.

Consequences that bind design: concatenating a lesson's excerpts must reproduce the source exactly; every generated item cites line numbers, not quoted strings; **no image generation of story content**, because an invented visual detail is AI content entering the reader's evidence and could mark a careful reader wrong.

**Voice:** case language is "what really happened," not "who is the criminal" — not every story contains a crime. A reader who solves it but misread their way there is told their evidence needs review, never that they failed.

**Guide character:** a Victorian detective, working name **Inspector Inkwell**, rendered as a paper-cut silhouette cameo in a gilt oval. **Never called Sherlock Holmes. No pipe.** He is silent and minimized while the reader is reading.

**Binding visual constraints the user has already fixed** (recorded, not expanded): warm Victorian, explicitly overriding any default warm-parchment caution — a cool dark-slate attempt was rejected as AI slop. Palette: mahogany `#3A2416`, brass `#C9A227`, gilt `#E0C478`, lamplight `#F5CF86`, aged paper `#EDE1C4`, ink `#2A2017`, oxblood `#6E2433` for evidence marks. Type: Bodoni Moda (display), EB Garamond (reading), IM Fell English SC (letterpress labels) — deliberately not Inter, Fraunces or Instrument Serif.

## Evidence on Hand

| Asset | Path / location |
|---|---|
| Source story, plain text | `factory/reference/the-open-window.txt` — "The Open Window" by Saki, 1,208 words, ~10 excerpts |
| Source collection EPUB | `/Users/rajatarora/Downloads/pg269-images-3.epub` — Gutenberg #269, 36 stories, verified |
| Original build spec | `factory/reference/FINE_PRINT_SPEC.md` — sections 2, 5, 6, 7, 10 superseded |
| Prior mockups (incumbent visual truth) | `factory/reference/mockups/*.dc.html`, 8 screens, generated by `gen2.py` |
| Phase 1 product record | `factory/artifacts/PROBLEM_SUMMARY.md`, `factory/artifacts/HANDOFF.md` |
| Prior mockup artifact | https://claude.ai/artifact/SLRfvUG9pFVNCunaM85261 |
| Depth studies | https://claude.ai/artifact/169FoCruxxQLCkF6VS4rPa |

**Absences future work must not fabricate:** no users, no usage data, no learning-gain measurements, no testimonials, no press, no pricing. No lesson JSON authored yet. No API keys in the environment. **No image-generation tool in this environment** — everything in the comps is CSS and SVG; painted art or textures must be produced elsewhere and dropped in. Claims of measured learning gains are an explicit non-goal: two days cannot demonstrate them.

## Product Principles

Design law, not preferences:

1. **The answers are remembered, not looked up.** The book closes before the reader acts. Rereading is always allowed and a wrong answer rewinds with the evidence region lit — but the first attempt is made from memory, and only first attempts score.
2. **Cited clues must visibly matter later.** A case board that only collects clues is decoration. A case board whose exact clues become the material of the finale is the spine of the game. This is the difference between the product and a worksheet with a skin.
3. **Nothing competes with the text.** The detective is silent and minimized during reading. Questions are untimed so thinking is never penalised.
4. **Apply before define.** Ask what a word *does* in context before asking what it means; score the two separately. Vocabulary is a key, not a quiz — at least one word per excerpt is load-bearing in the challenge that follows, and no reader ever dead-ends on it.
5. **Every reader reaches the ending, and the number stays honest.** Graded outcomes, not pass/fail; retries always allowed; comprehension-only scoring.

## Accessibility & Inclusion

The audience is defined by reading difficulty, so text legibility is a functional requirement, not a preference: generous reading measure and line height in the excerpt view, and revealed text stays on screen. Regressions are never suppressed — most repair a comprehension failure, and blocking them harms the thing being taught.

For 6th–12th graders who already experience reading difficulty as identity failure, **failure framing is an accessibility concern.** The graded-verdict model exists for this reason.

Voice/TTS is planned with captions as the pre-committed fallback. No specific conformance standard has been established by the user.
