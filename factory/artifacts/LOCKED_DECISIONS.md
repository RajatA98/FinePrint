# Locked Decisions — Fine Print

**Phase:** 4 of 9 (Decide)
**Status:** Complete
**Last Updated:** 2026-09-17
**Deadline:** Fri 18 Sep 2026, 23:59 CDT — ~24 hours at time of writing
**Inputs:** `PROBLEM_SUMMARY.md`, `PRD.md`, `PRESEARCH.md`, `/PRODUCT.md`
**Audit:** council (`codex` / gpt-5.5), adversarial pass over the consolidated set

> Decide is an audit, not a fresh debate. What follows is the consolidated set,
> the three genuine holes the audit found, and the amendments made in response.
> **These are fixed during implementation.** Changing one requires a deliberate
> pause, not a mid-build improvisation.

---

## The audit found three real holes. All three are now closed.

### Hole 1 — the content-integrity guarantee was nominal, not real

**The claim:** every word the reader reads is verbatim Saki, enforced by a build-time validator over `lesson.json`.

**The hole:** the screens are hand-built HTML/JS. Any story text typed or pasted into markup — a quote in a button label, a hint string, a citation in a heading — is displayed to the reader without the validator ever seeing it. The validator would protect the JSON while the product violated its own founding rule. **The twelve comps are the most likely vector, because they have Saki's text baked into them and copying it across would feel like progress.**

**Closed by locking a rule with teeth:**

- **No story text, quote text, citation text, or evidence text may appear in any HTML or JS file. Only IDs may appear.**
- All such text renders through `quote(id)`, which reads validated `lesson.json` and **throws on a missing ID** — a failure is loud, not silent.
- `validate_lesson.py` gains a scan over `index.html` and the JS sources that **fails the build** if any source phrase over ~12 characters appears in them.
- **The comps are layout reference only.** Their text is not a source.

This was the single most valuable finding of the audit.

### Hole 2 — eleven bespoke screens is what misses the deadline

**The audit's blunt framing:** the deadline killer is not Gemini, Vercel or localStorage. It is hand-building eleven polished interactive screens from static comps while also building validation, scoring, state and the finale. *"The comps are dangerous because they look like progress but are not app code."*

**Closed by separating named moments from implementation modules.** Eleven moments remain in the player's experience; the build has four kinds of thing:

| Module | Covers |
|---|---|
| Shell + reducer | navigation, state, scoring — owns every write |
| **One shared challenge renderer** | vocabulary, word lock, search the room, cite the line, reconstruct — same renderer, different JSON |
| Reading component | the timed silent read, with the lamp/shadow treatment |
| Conclusion component | composing the closing statement from collected vocabulary |

Plus presentation states for the study, the transitions, and the case report.

**Anti-spaghetti rule, locked:** **no screen writes scoring state directly.** Screens dispatch actions; the reducer owns all scoring. This is the structure that makes vanilla JS hold rather than collapse.

### Hole 3 — the first-attempt scoring bug, named precisely

**The expected bug:** one `answers[challengeId]` object used for both the current answer and the scored answer, so a retry silently overwrites the first attempt and the score quietly becomes dishonest.

**Closed by shape, not discipline:**

- `firstAttempts{}` — write-once per item, never mutated after creation
- `attempts[]` — append-only history, may flip `solved`
- **the score reads only from `firstAttempts`**

Six cases that must be tested: wrong-then-right stays wrong; right-then-wrong stays right; striking a correct answer costs nothing; a refresh preserves the immutable record; a double-clicked submit records one first attempt; Start Over clears everything.

---

## Amendments to the approved PRD

**PRD P0-1 is amended from eleven built screens to nine.** "The book opens" and "the book closes" are demoted from separate screens to CSS transitions on entering and leaving the read. Eleven named moments survive in the player's experience; nine screens get built.

Rationale: the title reveal folds into the read's entry, and the book closing lands as an animated one-second beat rather than a static screen — which plausibly reads *better* on video, and buys hours that the audit says are the difference between shipping and not. No gameplay is lost.

**Everything else in the PRD stands unchanged**, including the whole "never cut" list.

---

## The locked set

### 1. Product shape — a browser game

One lesson, played once, alone, no accounts. A link a judge clicks.

**Rejected:** native app (no time, no need), installable PWA (offline is not a requirement), anything multi-user.
**Wrong if:** judges expect repeatable classroom/teacher use. They do not for this prompt, and PRODUCT.md records the classroom case as describable-but-unbuilt.

### 2. Frontend — vanilla HTML / CSS / JS

No framework, no bundler unless something forces one. Semantic HTML, CSS Grid/Flex, ES modules. Screens rebuilt at a real reading measure (65–75ch, fluid), not the comps' fixed pixel values. Comps are visual reference only.

**Rejected:** React/Vue/Svelte — porting does not fix the comps' fixed-position problem, it adds a toolchain and a migration on top of it. Vite — only if something demands it.
**Wrong if:** screens get coded independently. Correct only with the shared renderer and the reducer.

### 3. Backend — one serverless function, and nothing else

`api/coach.js` on Vercel. The only server-side code in the product and the only place the model API key exists. Plain `fetch`, **no provider SDK** — avoids runtime weight and dependency risk in the function environment.

Returns **HTTP 200 always**, never a 4xx/5xx, with a body carrying:
- `source`: `"live"` | `"fallback-deterministic"` | `"fallback-generic"`
- `message`: the coaching note
- `debug`: **non-production only** — reason and provider status

**This is the audit's refinement and it matters:** 200-always protects the player, and the `source` field plus server logs stop it from hiding a broken coach for the entire build. **Tests assert `source === "live"`, never the status code.**

**Rejected:** any long-running server, container, or app framework. Nothing needs one.

### 4. Database — none

Per-session state in `localStorage` (key `fineprint.session.v1`, versioned) with an in-memory mirror and a visible **Start Over**. Chosen over `sessionStorage` specifically so an accidental refresh mid-recording does not wipe the run.

**Rejected:** any hosted database, any server persistence, any analytics backend.
**Wrong if:** cross-device continuity or tamper-proof scoring mattered. Neither does for a solo demo.

### 5. Auth — none

No login, no accounts, no rosters. The Case Report is written for the reader, not a teacher.

### 6. AI — one live call, performance data only

**Model:** Gemini Flash-Lite via Google AI Studio. Chosen on the only criteria that matter at 24 hours: a key can exist in minutes with no card (neither OpenAI nor Anthropic has a free tier), native `responseSchema` structured output, fastest latency tier, free.

**Standing override:** any key already in hand wins. This is one short structured call; the model is close to the least consequential decision in the build.

**Locked call shape:** schema-constrained JSON, ~90-word cap, 4.5s client abort via `AbortController`.

**`USE_LIVE_AI` environment flag, defaulting OFF.** Development runs the deterministic tier. Live calls are spent on exactly three things: one schema smoke test, one post-deploy verification, and the demo. This neutralises the free-tier cap, whose reported limits vary from ~20/day to ~500/day depending on model and source. If the cap is hit, Google's billing path can raise Free → Tier 1 quickly; the fallback absorbs it either way.

**Three-tier fallback:** live → deterministic note keyed off skill clusters → generic note. **The player is never shown "AI unavailable"** — degradation is invisible to them and logged for the author. The deterministic tier must be good enough to be the normal experience.

**The safety boundary, which is a product guarantee and not an implementation detail:** the coach receives missed-first-attempt items with their skill cluster and where in the excerpt the proving line sat, a skill-cluster summary, pace (flagged shown-not-graded), and the right-answer-wrong-evidence count. It **never** receives story text, excerpt text, line contents, or any explanation containing Saki's words. The Case Report tells the reader this.

**Consequence, accepted:** the coach cannot give quote-specific feedback. It writes about the reader's behaviour, not about Saki. That is the point.

### 7. Content integrity — build-time validation plus the IDs-only rule

`scripts/source.py` (already rescued into the repo) provides the 1–132 line numbering, contiguous `span()`, `find()` by character offset, `quote()` that raises on any absent phrase, and derived excerpt provenance. `scripts/validate_lesson.py` is built around it and wired into the build so a violation fails the build rather than reaching a reader.

Asserts: excerpts reconstruct exactly; every cited line resolves and sits inside its own excerpt; numbering is continuous 1–132 and identical everywhere; a phrase resolves to the line it *starts* on including across a line break; no authored question embeds paraphrase as source text; **and no story phrase appears in the app's own source files.**

Python 3.9.6, no new dependencies.

### 8. Core logic — scoring and verdicts

Comprehension only: first-attempt-correct ÷ first-attempt-total. Immutability enforced by the state shape above. Strike-outs cost nothing. Nudges cost nothing, limited to two per case. Reading speed measured and displayed, never graded. Retries always available and never alter a recorded score.

Four verdicts: Master Detective (solved + ≥90% + all four proving clues), Case Closed (solved + ≥70%), Evidence Review (solved, under 70%), Case Reopened (unsolved). No ending uses "fail" or "wrong" as a verdict.

### 9. Deployment — Vercel

Static hosting plus the one function. Key as a Vercel environment variable, never in the repo, never in client code. Git-push deploys.

**Rejected:** Cloudflare Pages + Workers (fine, slightly more config, no tooling in this session); Netlify (no advantage here).

### 10. Cut order — pre-committed, in order

1. The re-read screen
2. Voice down to captions *(already cut in Presearch)*
3. The moving lamp down to a static lit state

**Never cut:** the read step, the challenges, the finale solve, the content-integrity guarantees, the Case Report.

---

## Build order — the user's choice, with one addition

The audit recommended a deliberately ugly vertical slice first. **The user chose to build screens in flow order, styled as they go**, so that there is always something demo-ready to show.

That choice stands. The audit's specific failure mode for it — *hour 20 arrives with five beautiful screens and no finale* — is removed by one addition rather than by reversing the choice:

**Hour 1: stub all nine screens as navigable with placeholder content, plus the reducer and the state layer.** The spine then exists end-to-end from the first hour, and styling fills in progressively in flow order exactly as chosen.

Locked order:

1. **Hour 1** — reducer, state, scoring core, and all nine screens navigable with placeholders
2. Gemini API key obtained and verified *(blocking; do this before or alongside hour 1)*
3. `validate_lesson.py` around `source.py`
4. Lesson JSON authored and passing validation — **gates every screen**
5. Screens styled and wired in flow order, using the shared challenge renderer
6. Case Report with the deterministic coach working first
7. `api/coach.js` and the live call behind `USE_LIVE_AI`
8. Attribution note
9. Deploy; test from a clean browser and a phone
10. Human read-through of the story and every item — one hour, highest-value quality action available
11. Demo video; submit before 18:00 CDT

**Tripwire, locked:** if all nine screens are not navigable with placeholder content by the end of hour 8, invoke the cut order immediately rather than negotiating with it.

---

## Cross-check: does every decision still satisfy the requirement that motivated it?

| PRD requirement | Satisfied by | Verified |
|---|---|---|
| P0-1 eleven-moment flow | nine screens + two transitions | amended above, no gameplay lost |
| P0-2 content integrity | validator + IDs-only rule + build-time scan | hole found and closed |
| P0-3 answers remembered | book-closed transition before challenges; reducer holds first attempts | ok |
| P0-4 things and people, never A/B/C/D | shared challenge renderer takes objects/portraits/lines as choice types | ok |
| P0-5 vocabulary is a key | vocabulary screen unscored; lock word load-bearing | ok |
| P0-6 timed, never graded | reading component times; report displays, never scores | ok |
| P0-7 scoring and four verdicts | immutable `firstAttempts`; reducer owns writes | bug named and designed out |
| P0-8 whole-passage finale | reconstruct via shared renderer over cross-excerpt clue data | ok |
| P0-9 verdict renders without the coach | 200-always + three tiers + `USE_LIVE_AI` off by default | strengthened |
| P0-10 nothing unreviewed reaches a child | offline authoring; human read-through at step 10 | ok |
| P0-11 the submission | step 11, target 18:00 CDT | ok |

**No decision contradicts another.** The one conflict found — P0-1's screen count versus the deadline — is resolved by amendment above rather than left to be discovered at hour 18.

---

## Still open, deliberately

- **Coach tone.** Blocks writing the coach prompt. Needed before step 7.
- **Difficulty bands** — what separates First / Longer / Difficult. Affects shelf labels only, not the playable path.
- **The pitch line.** Needed for submission copy only. Working: *"Fine Print does not replace reading with AI. It uses AI to make a reader prove meaning from the actual text."*
- Whether a bundler is needed — decide if something demands it, not before.
