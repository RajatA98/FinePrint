# Fine Print — Handoff

**Written:** Wed 16 Sep 2026, 22:22 CDT
**Deadline:** Fri 18 Sep 2026, 23:59 CDT (~49 hours left at time of writing)
**Working dir:** `/Users/rajatarora/Projects/FinePrint`
**Phase reached:** 4 of 9 (Decide) complete. Decisions are LOCKED. Phase 5 (Plan) next, then build.

---

## Resume with this

> Read `factory/artifacts/HANDOFF.md`, `factory/artifacts/LOCKED_DECISIONS.md`, `factory/artifacts/PRD.md` and `/PRODUCT.md`, then continue Project Factory at Phase 5 (Plan). **`LOCKED_DECISIONS.md` is the authority** — it amends the PRD's screen count and closes three holes the audit found.
>
> **Blocking first action: get a Gemini API key from Google AI Studio.** Nothing downstream finishes without it.

---

## START HERE — Phase 5 (Plan), fresh session

**Read in this order.** `LOCKED_DECISIONS.md` is the authority and it amends the PRD.

1. `factory/artifacts/LOCKED_DECISIONS.md` — the locked stack, the three holes the audit closed, the build order and the tripwire
2. `factory/artifacts/PRD.md` — requirements, P0/P1/P2 with acceptance criteria
3. `factory/artifacts/PRESEARCH.md` — why each technology was chosen and what was rejected
4. `/PRODUCT.md` — confirmed product record, brand commitments, pinned palette and type

### Blocking before any code

**Get a Gemini API key from Google AI Studio.** Free, no credit card, instant. Neither
OpenAI nor Anthropic has a free tier, and there is no key for any provider yet. Nothing
downstream finishes without one. Any key already in hand overrides the model choice.

### Three rules that are easy to break by accident

1. **No story text in HTML or JS. Only IDs.** Every quote, citation and evidence string
   renders from validated `lesson.json` through `quote(id)`, which throws on a miss. The
   build scans app sources for source phrases and fails on a hit. This is what makes the
   content guarantee real rather than nominal — it was found to be nominal in the Phase 4
   audit.
2. **The comps are LAYOUT REFERENCE ONLY.** `factory/reference/comps/` holds the twelve
   built frames and their generator. They have Saki's text baked in, and copying that text
   into the app is precisely the integrity bypass rule 1 exists to stop.
3. **No screen writes scoring state.** Screens dispatch; the reducer owns every scoring
   write. `firstAttempts{}` is write-once, `attempts[]` is append-only, and the score reads
   only from `firstAttempts`. The named bug to avoid: one object serving as both the current
   answer and the scored answer, so a retry silently overwrites the first attempt.

### Already in the repo, do not reinvent

- `scripts/source.py` — 1–132 line numbering, contiguous `span()`, `find()` by character
  offset, `quote()` that raises on any absent phrase, derived excerpt provenance. **This is
  the substrate of P0-2.** `validate_lesson.py` gets built around it. It has already caught
  two real bugs: an excerpt that was stitched from non-contiguous sentences, and a phrase
  lookup that silently resolved to the wrong line.
- `factory/reference/comps/` — the generator (`world.py`, `source.py`, `objects.py`,
  `frames_a/b/c.py`, `build.py`) and the built `.dc.html` frames.
- `factory/reference/the-open-window.txt` — the source text.

### Comps

Twelve artboards, clickable in Play: <https://claude.ai/artifact/7qF3bDvBibTNuWEfypUTz7>

Nine get built. "The book opens" and "the book closes" are CSS transitions on entering and
leaving the read, not screens. The re-read is P1 and first in the cut order.

### Hour 1, and the tripwire

Hour 1 is the reducer, the state layer, the scoring core, and **all nine screens navigable
with placeholder content**. Styling then fills in in flow order, which is the user's
chosen build order.

**Tripwire:** if all nine are not navigable by the end of hour 8, invoke the cut order
immediately — re-read, then voice to captions, then the moving lamp — rather than
negotiating with it at 2am.

### Open questions, and which one blocks

- **Coach tone — BLOCKING.** How blunt Inspector Inkwell may be with a struggling reader.
  The coach prompt cannot be written without it.
- Difficulty bands: what separates First / Longer / Difficult. Shelf labels only.
- The pitch line. Submission copy only. Working: *"Fine Print does not replace reading with
  AI. It uses AI to make a reader prove meaning from the actual text."*

### Design residue, accepted and unfixed

From the finish review of the comps, recorded so it is not rediscovered as new: frame 01's
lamp cone does not reach the shelf it lights; letterpress deboss is real on one surface and
claimed on every letterpress label; Nuttel's cameo does not read as distinct at 64px; frame
12's right rail has an empty region; and on Open and Vocabulary the shallow room treatment
exists in the build but does not resolve visibly at the rendered size. All craft, none
blocking.

### Git

The repo has **zero commits**. Everything is on disk and survives a session change, but
nothing is under version control yet.

---

## What Fine Print is now

A reading comprehension game for grades 6 to 12, dressed as Victorian detective work.

**The loop, in the user's own words:** take one full story, break it into excerpts. After each excerpt a small detective game. At the end, put everything together by assembling the right clues. Comprehension is what is tested throughout. You get a pass and a score.

**The founding rule, restated and confirmed twice:**

> Every word the reader reads is verbatim from the book. No AI-written reading passages, ever. Questions, vocabulary and detective narration may be AI-generated, but only from the ingested text, and every item must trace to specific lines in it.

**The critical design turn:** the answers are not looked up, they are **remembered**. You read the excerpt, the book closes, and then you act from memory in a scene. That is what makes it a game rather than a worksheet.

---

## Phase status

| Phase | Status | Artifact |
|---|---|---|
| 1. Understand | Complete | `PROBLEM_SUMMARY.md` |
| 2. PRD | Complete, approved | `PRD.md` |
| 3. Presearch | Complete | `PRESEARCH.md` |
| 4. Decide | Complete, LOCKED | `LOCKED_DECISIONS.md` |
| 5. Plan | **Next** | |
| 6 to 9 | not started | |

**Also written this session:** `/PRODUCT.md` (confirmed product record) and
twelve approved comps at <https://claude.ai/artifact/7qF3bDvBibTNuWEfypUTz7>.

**Rescued out of the session scratchpad and into the repo** (it would otherwise
have been lost):
- `scripts/source.py` — the 1–132 line numbering, contiguous `span()`,
  `find()` by character offset, `quote()` that raises on any phrase absent from
  the source, and derived excerpt provenance. **This is the substrate of the
  PRD's P0-2 content-integrity guarantees** and it has already caught two real
  bugs. `validate_lesson.py` should be built around it, not reinvented.
- `factory/reference/comps/` — the comp generator and the built `.dc.html`
  frames, so the twelve comps are reproducible without the artifact.

**The architecture question is settled:** static site plus exactly one
serverless function (`api/coach.js`) which is the only place the model API key
exists. Everything else is a static asset. See `PRESEARCH.md`.

**Reading order.** `PRD.md` is now the authority on requirements and it records, in its closing section, every point on which it supersedes `PROBLEM_SUMMARY.md` and the "Game mechanics" table below. Read the PRD first; treat both older documents as history.

---

## Decisions locked so far

| Decision | Detail | Why |
|---|---|---|
| Primary user | A student in grades 6 to 12, on their own | No roster, no teacher view. Classroom case is visible but unbuilt. |
| Project status | Hackathon submission and portfolio piece | Nerdy AI Hackathon, English Reading Game prompt |
| Scope posture | Full spec, ask before cutting | User's explicit choice |
| Scope of play | One case end to end. Progression shown but clearly simulated | No fabricated learning-gain charts |
| Verdict model | Four graded outcomes, not binary pass/fail | Master Detective (solved + 90%), Case Closed (solved + 70%), Case Solved / Evidence Review (solved, under 70%), Case Reopened (unsolved) |
| Score | Comprehension only, first attempts only, retries always allowed | Everyone finishes; the number stays honest |
| Reading speed | Measured and shown, never graded, never prominent | A slow careful reader should pass cleanly |
| Ingestion pipeline | **Cut entirely** | 10-stage pipeline, upload, job queue, quota, plans all removed |
| Lesson delivery | Authored offline, ships as a static asset | No generation at runtime |
| Demo video | Gameplay only, no ingestion shown | |
| AI at runtime | One live call: the coach | See below |
| Source | Gutenberg #269 EPUB, verified locally: 36 stories, "THE OPEN WINDOW" present | `/Users/rajatarora/Downloads/pg269-images-3.epub` |

### The AI coach

Speaks once at the Case Report, unprompted. **Sees performance data only** (which items missed on first try, which skills they cluster in, where in the excerpt the proving line sat, pace per excerpt). **Never sees or discusses the story**, which is what makes a live model call safe inside a product that bans AI-written content. Not chat: no text box, no follow-up. Runs as a live API call, not a lookup table. User declined a pre-computed fallback; revisit if it proves flaky in testing.

---

## Game mechanics as designed in the mockups

The original Decode / Deduce / Pin multiple-choice triplet is **superseded**. Same comprehension skills, delivered as detective actions:

| Screen | What the player does | Skill measured |
|---|---|---|
| The study | Takes a case off a bookshelf. Spines show a case number and a difficulty band, **never a title**. The title appears when the book opens and the lesson begins | Level select and difficulty |
| The book opens | Reads the excerpt. Unread text sits in shadow; the lamp moves down the page | Timed silent reading |
| The word lock | Turns a brass lock on an evidence box to the right meaning of a word, in context. Box will not open otherwise | Vocabulary, apply then define, scored separately |
| Rule it out | Strikes out answers the page cannot support. Inkwell writes the reason in the margin | Inference, plus SAT elimination strategy |
| Search the room | From memory, finds the objects the text said were carried. Decoys are real story objects carried by the wrong people | Recall of key detail |
| Cite the line | Taps the numbered line that proves the answer. Underlined in red ink, written into the case notes | Command of evidence |
| Name the culprit | Picks a suspect from cameo portraits, then must produce the clue that proves it | Character tracking and motive |
| Case closed | Verdict, then the coach speaks (the title was already revealed at the lesson's start) | Report |

**Two mechanics carry the design:**

1. **Line numbers are the evidence citation system.** SAT passages have numbered lines; the spec wanted sentence IDs. They turn out to be the same mechanism, so evidence works with no extra invention.
2. **Ruling out is both the SAT strategy and the detective's method.** Eliminating the impossible is literally how the genre works, so the test skill and the game verb are one thing.

**Both open rules are now settled in the PRD (P0-7):** striking out a correct answer costs no mark, and nudges cost no mark but are limited to two per case.

---

## Visual direction

Mockups: **https://claude.ai/artifact/7qF3bDvBibTNuWEfypUTz7** (twelve artboards, clickable in Play).
The earlier eight-screen canvas at `SLRfvUG9pFVNCunaM85261` is superseded; local copies of it sit in `factory/reference/mockups/`.

- **Concept:** a place, not a set of screens. A Victorian study at night. Room, shelf, desk, book, lamp.
- **A first attempt at a cool dark-slate UI was rejected as AI slop.** Warm Victorian is now explicitly briefed and overrides the usual "avoid warm parchment" guidance.
- **Palette:** mahogany `#3A2416`, brass `#C9A227`, gilt `#E0C478`, lamplight `#F5CF86`, aged paper `#EDE1C4`, ink `#2A2017`, oxblood `#6E2433` for evidence marks.
- **Type:** Bodoni Moda (display, the Victorian title-page Didone), EB Garamond (reading), IM Fell English SC (letterpress labels). Deliberately not Inter, Fraunces, or Instrument Serif.
- **The avatar** is a Victorian paper-cut silhouette cameo in a gilt oval. A real period form, reads as a character, and is the 2D fallback the spec already planned for. No pipe. Never called Sherlock Holmes.
- **Source files** for the current comps: the generator in the session scratchpad at `scratchpad/gen/` (`world.py`, `source.py`, `objects.py`, `frames_a/b/c.py`, `build.py`). **Scratchpad is session-scoped and will not survive** — `source.py` in particular is worth copying into the repo, because it holds the line numbering, excerpt provenance and verbatim guarantees the lesson file's verification suite should reuse.

**Constraint worth knowing:** there is **no image generation tool in this environment**. Everything in the mockups is CSS and SVG. Painted art, textures, or a 3D avatar must be generated elsewhere and dropped in.

---

## Environment facts (already checked, do not re-verify)

| | |
|---|---|
| Node 22.22.2, npm 10.9.7, pnpm 10.33.0 | present |
| Python | **3.9.6 system only**, no Homebrew Python |
| pandoc | **missing** |
| uv | **missing** |
| API keys | **none** in environment |
| EPUB parsing | The Gutenberg EPUB has clean `<h2>` story headings and parses directly from XHTML. **pandoc is not needed.** |
| git | clean repo on `main`, no commits yet |
| Council providers | only `codex` configured |

---

## Open questions

**For the PRD (product):**
- Exact demo pitch line. Direction agreed: grounding over scale, not "any book in". Working claim: *Fine Print does not replace reading with AI. It uses AI to make a reader prove meaning from the actual text.*
- Where the comprehension bar sits (70% is the assumption, tune after a real playthrough)
- Whether ruling out a correct answer costs a mark; whether nudges cost marks or are merely limited
- What the difficulty bands mean concretely (First / Longer / Difficult cases)
- Naming: "Fine Print" and "Inspector Inkwell" are working names, trademark unchecked
- A full personal read of "The Open Window" before the demo

**Parked for Presearch (12 items, tagged `[for Presearch]` in PROBLEM_SUMMARY.md):**
- How the lesson JSON is authored: directly against a schema with a standalone validator, or one collapsed offline generate script
- LLM provider and model choice; no keys present
- **The coach needs a live model call, so the app cannot be purely static.** A key cannot ship in browser code, so something server-side must hold it. This changes the deployment shape.
- Whether a pre-computed coaching fallback is built as demo insurance
- TTS provider and whether it returns word timings
- Frontend framework and deployment target
- Where session data lives given there are no accounts
- Project Gutenberg terms for redistributing derived lesson content
- Local toolchain gaps (Python 3.9, no uv)

---

## Council review (Codex, single provider)

Full text saved at `.claude/council-cache/council-1789598445.md`. Endorsed cutting the pipeline. Its sharpest point, which shaped the redesign:

> The highest-risk assumption is that students will experience evidence selection as detective gameplay rather than school assessment.

It also recommended compressing the four-stage finale to three (**user chose to keep all four**) and replacing binary pass/fail with graded outcomes (**adopted**).

---

## Risks, in order

1. **Does it feel like a game or a worksheet?** Not technical. Everything is downstream of this. The tell: a case board that only collects clues is decoration; one whose exact clues become the finale's input is the spine.
2. **Lesson content quality.** One lesson, so a bad distractor is in the demo, not a log. Mitigations: mechanical verification of the lesson file, plus an hour of human read-through of all items.
3. **Scope grew twice** after the deadline was known (four-stage finale kept, live coach added). Pre-committed cut order: **witnesses stage → 3D avatar to 2D → voice to captions.**
4. **The coach is a live call at the demo's emotional peak.** Only runtime external dependency.

**Never cut:** the reading step, the mini-games, the final assembly stage, the content integrity guarantees.

---

## Working agreements

- **Project Factory phase boundaries** were corrected by the user and are now encoded in `~/.claude/commands/{understand,prd,presearch,decide,start-project}.md` under "Phase Boundary" headings. Understand = product direction only. PRD = requirements written up. Presearch = all tech stack talk. Decide = a double-check audit. Backups saved as `*.md.bak-2026-09-16`.
- **No per-phase teaching blocks** (global CLAUDE.md rule). Save artifact, brief summary, ask approval, move on.
- Memory written: `factory-phase-boundaries.md` in this project's memory dir.
- Never add `Co-Authored-By` lines to commits.

---

## Reference files

| File | What |
|---|---|
| `factory/reference/FINE_PRINT_SPEC.md` | Original build spec. **Sections 2, 5, 6, 7, 10 are superseded** (mini-game shape, lesson schema, pipeline, screens, quota). Sections 3, 8, 9, 11, 13, 14 still useful. |
| `factory/reference/the-open-window.txt` | The story, plain text |
| `factory/reference/split_collection.py` | Original Stage 1 EPUB splitter. Needs pandoc, which is not installed and not needed. |
| `factory/artifacts/PROBLEM_SUMMARY.md` | Phase 1 output |
| `/Users/rajatarora/Downloads/pg269-images-3.epub` | Source collection |
