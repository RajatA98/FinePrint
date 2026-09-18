# Implementation Log — Fine Print

**Phase:** 6 of 9 (Implement)
**Status:** Complete
**Last Updated:** 2026-09-17
**Method:** one fresh implementer per slice (Opus or Codex), TDD, an independent reviewer per slice, commit and push on green. Working ledger: `.superpowers/sdd/PROJECT_PLAN/progress.md` (git-ignored). Interfaces: `docs/CONTRACT.md`.

## Entry 1 — 2026-09-17 — Build contract

- **Phase:** pre-1
- **Goal:** fix the file layout, lesson schema, state shape, action table, selectors and coach payload so parallel agents fit together.
- **Files Changed:** `docs/CONTRACT.md`
- **Known Issues:** none.

## Entry 2 — 2026-09-17 — S1 state core (Opus)

- **Phase:** 1 (the spine)
- **Goal:** reducer, grading, selectors, persisted store, lesson access, fixture lesson, test harness.
- **Tests:** 72 node:test cases including the six locked scoring cases (wrong-then-right, right-then-wrong, strike costs nothing, refresh preserves, double submit records one first attempt, Start Over clears).
- **Files Changed:** `package.json`, `src/lesson.js`, `src/state/{reducer,grade,selectors,store}.js`, `test/*.test.js`, `test/fixtures/lesson.mini.json`
- **Summary:** pure, immutable reducer owns every scoring write; first attempts are write-once; score reads only first attempts.
- **Review:** Codex, read-only. Two spec mismatches closed by ruling (lessonId null until START_CASE; Node 22 test glob), contract amended.

## Entry 3 — 2026-09-17 — S4 validator (Codex)

- **Phase:** 2A (content gate)
- **Goal:** `validate_lesson.py`, `scan_sources.py`, `lesson_skeleton.py` around the rescued `source.py`.
- **Tests:** 11 unittest cases, each negative case asserting the rule name.
- **Summary:** skeleton emits the 132 verbatim lines and ten paragraph-aligned excerpts; validator enforces every contract rule; scanner fails the build on any 13+ character story phrase in app sources.
- **Review:** Sonnet. Approved; one should-fix (two normalisers diverge) and minors folded into S6.

## Entry 4 — 2026-09-17 — S2 shell and screens (Opus)

- **Phase:** 1 (the spine)
- **Goal:** index.html, tokens, router, nine placeholder screens, the one shared challenge renderer, coach payload/deterministic/client.
- **Tests:** 100 total; router, payload no-story-text, deterministic weakest-cluster, client fallback ladder.
- **Validation:** Playwright click-through study → report on the placeholder lesson; refresh resumes; Start Over clears; unknown hash → study.
- **Review:** Sonnet. Approved, four minors deferred.

## Entry 5 — 2026-09-17 — S3 deploy

- **Phase:** 1.5
- **Summary:** Vercel project `fineprint` created, stub `api/coach.js` (200-always, never live), auto-deploy from main. Production alias `fineprint-rajata98s-projects.vercel.app`.
- **Known Issues:** Vercel Authentication is on; the user must switch it off in project settings before the link is public. External verification pending on that.

## Entry 6 — 2026-09-17 — S5 lesson authored (Opus)

- **Phase:** 2B (content gate)
- **Goal:** the full lesson for "The Open Window": 10 excerpts, 30 vocabulary, 40 challenges, 7 finale clues, 303 authored strings.
- **Validation:** validator OK, scan OK, 110 tests. Excerpt boundaries re-cut onto other paragraph starts so every excerpt has a concrete searchable object.
- **Review:** Opus content review, read-only, against the story: fix before ship. Five wording-level defects (apply answers leaking define answers; four object labels answering their own prompt; one invented detail; one grammatical giveaway; no margin notes on searches). Fix round 1 in progress.

## Entry 7 — 2026-09-17 — S6 validator hardening (Sonnet; a Codex run hung and was replaced)

- **Phase:** 2C
- **Goal:** one shared normaliser, straddle regression test, new rules (speaker, cameo, portrait kind, required verdict/attribution strings, no fail/failed/wrong).
- **Tests:** 22 unittest cases.
- **Review:** Codex, read-only. Approved, no findings.

## Entry 8 — 2026-09-17 — S7 Phase 3 screens (Opus)

- **Phase:** 3
- **Goal:** study shelf, vocabulary cards, the read with numbered lines, book-opens title card, book-closes, resume on refresh.
- **Tests:** 10 new (read phase helper); 110 total; contrast 9.09:1 worst case.
- **Review:** in progress.

## Entry 9 — 2026-09-17 — S9 Phase 4 challenges (Opus)

- **Phase:** 4
- **Goal:** the one shared challenge renderer (dial, object, portrait, line), word lock, search the room, cite the line, the reopened page (reread / rewind / nudge), strike-outs, the excerpt loop, progress strip.
- **Tests:** 23 new pure-helper cases; 151 total; full ten-excerpt browser run.
- **Review:** Opus. Mechanics confirmed; three polish items sent back (oxblood borrowed by the interface, evidence underline on wrapped lines, lock slip revealing the evidence line). Ruling: the lock slip shows the word and line number only. Fix round in progress.

## Entry 10 — 2026-09-17 — S13 live coach (Sonnet)

- **Phase:** 6
- **Goal:** `api/coach.js` behind `USE_LIVE_AI`, schema-constrained Gemini call, 4 s abort, 200-always, three-tier fallback, payload whitelist guard, coach prompt with an isolated tone constant, smoke script.
- **Tests:** 25 in `test/api-coach.test.js`, injected fetch and env; 182 total.
- **Review:** Sonnet (a Codex run hung and was killed). Approved after one fix round: id-like fields validated against enums and an anchored pattern; banned-word check whole-word.
- **Known Issues:** the live path is untested against the real API until a key exists; `docs/COACH_SMOKE.md` documents the one-command check.

## Entry 11 — 2026-09-17 — S11 Phase 5 finale and Case Report (Opus)

- **Phase:** 5
- **Goal:** reconstruct the case as a case board (unnamed cameos, brass name plates, seven clue slips, four pins, red thread, a seal), the statement as letterpress tiles set into a handwritten line, the Case Report as a case file (verdict stamp, four-rung ladder, three scopes, skill meters, pace last, the coach's note with the story-blindness line, attribution). No select, checkbox or form Submit remains, per the user's mid-build direction.
- **Tests:** 17 new pure-helper cases; 182 total; all four verdicts and the network-down coach path verified in the browser.
- **Review:** in progress. Controller observation: all cameos share one silhouette; distinct silhouettes required.
- **Content follow-up:** only one of the ten cited lines was among the finale clues; lesson fix round 4 re-points excerpt V's citation to line 71 so all seven finale clues are lines the reader cited.

## Entry 12 — 2026-09-17 — Fix rounds and content completion

- **S9 fix round:** oxblood confined to the reader's marks, text-decoration underlines on cite slips, lock slip shows word + line number only, dead control removed, strike/selection sync, nudge attribution to the working stage.
- **S11 fix round:** distinct silhouettes (girl / woman / man) keyed by `people[id].cameo`, shake detector scoped to the finale item, h1 on every screen, cited list rows even, word tray as a type case.
- **Lesson rounds 4–5:** all seven finale clues are lines the reader cites during the case (proving 71, 106, 119, 132); excerpt V re-authored around line 71 with portrait choices; line 119 filed as narration. Content reviewer: ship as is.
- **Gates at HEAD:** 185 node tests, validator OK (132 lines / 10 excerpts / 40 challenges), scan OK (49 files).

## Entry 13 — 2026-09-17 — Final whole-branch review and fix wave

- **Review (Opus, read-only, whole branch):** the founding rule holds end to end (story text only through `line()`/`quote()`, scan covers every served file); scoring is write-once under double dispatch, refresh, Back and retry; verdicts match the PRD table; no dead ends. Verdict: with fixes.
- **Fix wave (one Opus dispatch, commit 1d687a6):** Revisit the case now navigates to the study without resetting (the note beside it is true); `localStorage` access guarded; `boot()` failure card; fixture-lesson fallback restricted to localhost; `score(state, lesson)` counts every scored item so a typed route cannot reach Master Detective on 2 of 42; validator enforces `skill` and `scored`; reduced-motion block for the finale; favicon; `.vercelignore` keeps planning docs and tests off the deploy.
- **Gates at HEAD:** 187 node tests, 24 Python tests, validator OK, scan OK. Re-review: all addressed.
- **Preserved:** `factory/artifacts/LESSON_REVIEW_NOTES.md` — the per-challenge table (answer, evidence line, why each decoy is wrong) plus all five review rounds; it is the input to the Test-QA read-through.
- **Deferred (not blocking):** router does not clamp excerpt to the lesson; store restore does not check `lessonId`; no focus move on route change; finale partial decided in the view layer; six-portrait grid leaves one card orphaned; no unit test for the report screen's controls.
