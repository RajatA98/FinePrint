# Fine Print — Build Contract

Binding interfaces for every implementer. `factory/artifacts/LOCKED_DECISIONS.md`
is the authority on *why*; this file fixes the *shapes* so parallel work fits.
Change a shape here first, never in code alone.

## Non-negotiables (from Locked Decisions)

1. **No story text in HTML or JS. Only IDs.** Every quote, line, citation,
   evidence string, prompt, margin note and detective line renders from the
   validated lesson through `quote(id)` / `line(n)`, which **throw** on a miss.
   The build scan fails if any story phrase over 12 characters appears in
   `index.html`, `src/**`, `api/**`, `styles/**`, `test/**`.
2. **No screen writes scoring state.** Screens dispatch; the reducer owns every
   write. `firstAttempts` is write-once per challenge, `attempts` is append-only,
   the score reads only from `firstAttempts`.
3. **Vanilla only.** ES modules in the browser, no bundler, no framework, no
   runtime npm dependencies. Tests use `node:test`. Python 3.9 stdlib only.
4. **The comps (`factory/reference/comps/`) are layout reference only.** Never
   copy text out of them.
5. The coach payload never contains story text, line text, or excerpt text.

## File layout

```
index.html                       shell: <body data-screen="…">, one <main id="app">
styles/tokens.css                palette + type tokens (see below)
styles/app.css                   layout and screens
src/main.js                      boot: load lesson → create store → start router → render
src/lesson.js                    loadLesson(url), quote(id), line(n), excerptLines(id), challenge(id)
src/router.js                    hash routes ↔ body[data-screen]; parse/build route
src/state/reducer.js             createReducer(lesson) → (state, action) => state; initialState()
src/state/grade.js               grade(lesson, challengeId, choiceIds) → {correct, evidenceLine}
src/state/selectors.js           score(state), verdict(state, lesson), clusters(state, lesson), pace(state, lesson)
src/state/store.js               createStore(reducer, {key, storage}) → {getState, dispatch, subscribe}
src/screens/<id>.js              export function render(root, {state, lesson, dispatch, navigate})
src/screens/challenge.js         the ONE shared challenge renderer (lock, search, cite, reconstruct)
src/coach/payload.js             buildCoachPayload(state, lesson) — performance data only
src/coach/deterministic.js       deterministicNote(payload) → {source, message}
src/coach/client.js              requestCoach(payload, {fetch, timeoutMs}) → {source, message}
api/coach.js                     Vercel serverless function (Node, plain fetch, no SDK)
public/lesson.open-window.json   the authored lesson (served statically)
scripts/source.py                line numbering (exists; do not rewrite)
scripts/validate_lesson.py       python3 scripts/validate_lesson.py public/lesson.open-window.json
scripts/scan_sources.py          python3 scripts/scan_sources.py  (story-phrase scan over app sources)
test/*.test.js                   node --test "test/*.test.js"   (a bare directory arg breaks on Node 22)
package.json                     "type": "module"; scripts: test, validate, scan, check (all three), serve
vercel.json                      static + functions config
```

`npm run check` = `node --test` + validate + scan. It must pass before any commit
that touches `src/`, `public/`, or `scripts/`.

## Screens and routes

Nine screens. Route = `#/<screen>` or `#/<screen>/<excerptIndex>` (1-based).

| id | route | excerpt-scoped |
|---|---|---|
| `study` | `#/study` | no |
| `vocabulary` | `#/vocabulary/3` | yes |
| `read` | `#/read/3` | yes |
| `lock` | `#/lock/3` | yes |
| `search` | `#/search/3` | yes |
| `cite` | `#/cite/3` | yes |
| `reconstruct` | `#/reconstruct` | no |
| `statement` | `#/statement` | no |
| `report` | `#/report` | no |

Flow: study → (vocabulary → read → lock → search → cite) × N excerpts →
reconstruct → statement → report. Book-opens (title reveal) plays on entering
`read` for excerpt 1; book-closes plays on leaving `read` every time. Both are
CSS transitions inside the read screen, not screens.

Unknown or malformed hash → `#/study`. `body[data-screen]` always equals the
current screen id. Every screen module renders into `#app` from state alone
and must be re-renderable at any time (no hidden per-screen state).

## Lesson schema (v1) — `public/lesson.open-window.json`

```jsonc
{
  "schema": 1,
  "id": "open-window",
  "title": "The Open Window",
  "author": "Saki (H. H. Munro)",
  "source": { "gutenberg": 269, "url": "https://www.gutenberg.org/ebooks/269" },
  "difficulty": "first",                       // "first" | "longer" | "difficult"
  "lines": ["…", "…"],                         // lines[n-1] is line n; verbatim typeset text (curly quotes, em dash, plain unicode, no HTML)
  "paragraphStarts": [1, 4, 9, …],             // line numbers that begin a paragraph
  "excerpts": [
    { "id": "ex1", "roman": "I", "lines": [1, 14],   // inclusive, contiguous, both ends on paragraph boundaries
      "vocabulary": ["v-self-possessed", "v-endeavoured"],
      "challenges": ["c1-lock-apply", "c1-lock-define", "c1-search", "c1-cite"] }
  ],
  "vocabulary": {
    "v-self-possessed": { "word": "self-possessed", "line": 2, "gloss": "s-gloss-self-possessed" }
  },
  "people": {                                  // portraits; name is shown only where the screen allows
    "vera":    { "name": "Vera",           "role": "s-role-vera",    "cameo": "vera" }
  },
  "objects": {
    "o-white-coat": { "label": "s-obj-white-coat", "carriedBy": "uncle" }
  },
  "challenges": {
    "c1-lock-apply": {
      "type": "lock", "stage": "apply", "skill": "vocabulary", "scored": true,
      "vocabulary": "v-self-possessed", "prompt": "s-c1-lock-apply-prompt",
      "choices": [ { "id": "a", "kind": "dial", "label": "s-c1-lock-apply-a" }, … ],
      "answer": ["a"], "evidence": 2,
      "margin": { "b": "s-c1-lock-apply-margin-b" }        // why a wrong choice fails; optional per choice
    },
    "c1-search": {
      "type": "search", "skill": "detail", "scored": true,
      "prompt": "s-c1-search-prompt", "targets": 2,
      "choices": [ { "id": "o-white-coat", "kind": "object", "ref": "o-white-coat" }, … ],
      "answer": ["o-white-coat", "o-gun"], "evidence": 7
    },
    "c1-cite": {
      "type": "cite", "skill": "evidence", "scored": true,
      "prompt": "s-c1-cite-prompt", "proves": "c1-search",   // the challenge this citation supports
      "choices": [ { "id": "L7", "kind": "line", "line": 7 }, … ],   // lines within the excerpt
      "answer": ["L7"], "evidence": 7,
      "margin": { "L9": "s-c1-cite-margin-L9" }
    }
  },
  "finale": {
    "reconstruct": {
      "people": [ { "cameo": "vera", "prompt": "s-recon-who-1", "options": ["vera", "mrs-sappleton", "framton"], "answer": "vera" } ],
      "clues":  [ { "id": "k1", "line": 42, "proving": true, "speaker": "vera" }, … ],   // seven, four proving; text is line(n); speaker = "narration" | personId (the whose-words column)
      "required": 4,
      "culprit": { "prompt": "s-recon-culprit", "options": ["vera", "framton", "mrs-sappleton"], "answer": "vera" }
    },
    "statement": {
      "template": "s-statement-template",                                // "{slot1} … {slot2} …"
      "slots": [ { "id": "slot1", "options": [ { "vocabulary": "v-self-possessed", "true": true }, { "vocabulary": "v-imminent", "true": false } ] } ]
    }
  },
  "strings": { "s-gloss-self-possessed": "…", "s-c1-search-prompt": "…" },   // every authored non-story string, by ID
  "coach": {
    "deterministic": { "vocabulary": "s-coach-vocab", "detail": "s-coach-detail", "inference": "s-coach-inference", "evidence": "s-coach-evidence", "clean": "s-coach-clean" },
    "generic": "s-coach-generic"
  }
}
```

Rules the validator enforces (`scripts/validate_lesson.py`, exit 1 on any):
- `lines` equals `scripts/source.py` `LINES` text exactly, count equals `TOTAL`.
- Excerpts are contiguous, ordered, non-overlapping, cover 1..TOTAL, and each
  starts and ends on a paragraph boundary (so concatenation reproduces the source).
- Every `evidence`, `clue.line`, `vocabulary.line`, `choice.line` resolves and
  sits inside the excerpt that owns it (finale clues: any excerpt).
- Every string reference resolves in `strings`; every ID reference resolves.
- Every challenge has exactly one correct answer set; `search.targets` equals
  `answer.length`; every choice is a real story element (object/person/line/dial
  label present in strings).
- Seven finale clues, exactly four `proving`; `required` is 4.
- Each statement slot has exactly one `true` option.
- No authored string in `strings` contains a 20+ character substring of the
  source text (names and short phrases are fine; quotations render via `line(n)`).
- `scripts/scan_sources.py` fails if any 13+ character substring of the source
  text (case-insensitive, whitespace-normalised, quotes straightened) appears in
  `index.html`, `src/**`, `api/**`, `styles/**`, or `test/**` excluding `test/fixtures/`.

Skills: `vocabulary` | `detail` | `inference` | `evidence`.

## Lesson access in the app — `src/lesson.js`

```js
export async function loadLesson(url = "/public/lesson.open-window.json")
export function quote(id)            // strings[id]; throws Error(`missing string: ${id}`)
export function line(n)              // lines[n-1]; throws on out-of-range
export function excerpt(idOrIndex)   // excerpt object; index is 1-based
export function excerptLines(id)     // [{n, text, startsParagraph}]
export function challenge(id)        // throws on miss
export function wordsIn(excerptId)   // word count, for WPM
```

## State shape (v1) — persisted at `localStorage["fineprint.session.v1"]`

```js
{
  version: 1,
  lessonId: null | "open-window",                          // null until START_CASE stamps lesson.id
  startedAt: 0 | ms,
  finishedAt: 0 | ms,
  route: { screen: "study", excerpt: 1 },
  reading:  { [excerptId]: { startedAt, endedAt } },        // endedAt set once; re-entry does not reset
  firstAttempts: { [challengeId]: { correct: bool, at } },  // WRITE-ONCE
  attempts: [ { challengeId, choiceIds, correct, at } ],    // APPEND-ONLY
  solved: { [challengeId]: true },
  struck: { [challengeId]: [choiceId] },                    // ruled-out choices, never scored
  nudges: { used: 0, max: 2, by: { [challengeId]: n } },
  cited: { [challengeId]: lineNumber },                     // last accepted citation
  evidenceReview: 0,                                        // right answer, wrong evidence count
  finale: { people: { [cameo]: personId }, clues: [clueId], culprit: personId|null, statement: { [slotId]: vocabularyId }, solved: false },
  coach: { source: null, message: null }
}
```

## Actions — `src/state/reducer.js`

| type | payload | effect |
|---|---|---|
| `START_CASE` | `{at}` | sets `startedAt` if 0, route → vocabulary/1 |
| `NAVIGATE` | `{screen, excerpt}` | sets `route` only |
| `READ_START` | `{excerptId, at}` | sets `reading[id].startedAt` if absent |
| `READ_END` | `{excerptId, at}` | sets `reading[id].endedAt` if absent |
| `SUBMIT_ATTEMPT` | `{challengeId, choiceIds, at}` | grades via `grade()`; appends to `attempts`; writes `firstAttempts[id]` **only if absent**; sets `solved[id]` if correct; for `cite`: if correct sets `cited`; if the `proves` challenge is solved and this citation is wrong on first attempt, increments `evidenceReview` once per challenge |
| `STRIKE` | `{challengeId, choiceId}` | toggles in `struck`; no scoring effect |
| `NUDGE` | `{challengeId}` | increments if `used < max`; else no-op |
| `FINALE_PERSON` | `{cameo, personId}` | sets `finale.people[cameo]` |
| `FINALE_CLUE` | `{clueId}` | toggles in `finale.clues` |
| `FINALE_CULPRIT` | `{personId}` | sets |
| `FINALE_SUBMIT` | `{at}` | grades reconstruct as one scored item `finale-reconstruct` through the same first-attempt path; `finale.solved` = culprit correct **and** all four proving clues chosen and no decoy chosen; partial = culprit right without proving clues (solved stays false) |
| `STATEMENT_SET` | `{slotId, vocabularyId}` | sets |
| `STATEMENT_SUBMIT` | `{at}` | grades `finale-statement` as one scored item (all slots true) |
| `COACH_RESULT` | `{source, message}` | sets `coach` |
| `FINISH` | `{at}` | sets `finishedAt` if 0 |
| `START_OVER` | — | returns `initialState()` |

A `SUBMIT_ATTEMPT` for an unknown challenge throws. Double-dispatch of the same
attempt within the same tick is still two attempts; first-attempt stays the
first. (The screen disables the control after submit; the reducer guarantees
the record regardless.)

## Selectors — `src/state/selectors.js`

- `score(state)` → `{correct, total, ratio}` over `firstAttempts` only.
- `verdict(state, lesson)` → `"master" | "closed" | "review" | "reopened"`:
  reopened if `!finale.solved`; master if solved ∧ ratio ≥ 0.9 ∧ all four
  proving clues chosen; closed if solved ∧ ratio ≥ 0.7; else review.
- `clusters(state, lesson)` → `{ [skill]: {correct, total} }` from first attempts.
- `pace(state, lesson)` → `{ perExcerpt: [{excerptId, wpm}], overallWpm }`;
  excerpts without both timestamps are omitted.

Verdict labels (authored strings): `s-verdict-master` "Master Detective",
`s-verdict-closed` "Case Closed", `s-verdict-review` "Case Solved — Evidence
Review", `s-verdict-reopened` "Case Reopened". No verdict says fail or wrong.

## Coach — `src/coach/*`, `api/coach.js`

Payload (`buildCoachPayload`): 
```js
{ lessonId, verdict, score: {correct, total},
  missed: [ { challengeId, skill, excerpt: 3, position: "early"|"middle"|"late" } ],  // first-attempt misses; position = where evidence line sits within its excerpt
  clusters: { vocabulary: {correct,total}, … },
  pace: { overallWpm, shownNotGraded: true },
  evidenceReview: n, nudgesUsed: n }
```
No field may contain story text. `test/coach-payload.test.js` asserts no
13+ character substring of any lesson line appears in `JSON.stringify(payload)`.

`api/coach.js`: POST, always `200`, body `{source, message, debug?}`;
`source` ∈ `"live" | "fallback-deterministic" | "fallback-generic"`. Live only
when `process.env.USE_LIVE_AI === "1"` and `GEMINI_API_KEY` is set. Model
`gemini-flash-lite-latest` unless `GEMINI_MODEL` overrides. `debug` only when
`process.env.VERCEL_ENV !== "production"`. Message ≤ 90 words.

Client: `requestCoach(payload, {timeoutMs: 4500})`, AbortController; on any
failure returns `deterministicNote(payload)`; deterministic picks the weakest
cluster's string, or `clean` if none missed; generic is the last resort.

## Design tokens — `styles/tokens.css`

```css
:root {
  --mahogany:#3A2416; --brass:#C9A227; --gilt:#E0C478; --lamplight:#F5CF86;
  --paper:#EDE1C4; --ink:#2A2017; --oxblood:#6E2433;
  --font-display:"Bodoni Moda", serif; --font-read:"EB Garamond", serif; --font-label:"IM Fell English SC", serif;
  --measure: 68ch;
}
```
Fonts via Google Fonts `<link>`. Reading text: `var(--font-read)`, fluid
`clamp(1.05rem, 1.6vw, 1.3rem)`, line-height 1.6, max-width `var(--measure)`.

## Testing

- `node --test` runs `test/*.test.js`. Reducer/selectors/grade/payload/lesson
  tests run against a small fixture lesson at `test/fixtures/lesson.mini.json`
  (two excerpts, valid against the schema; contains **no** story text, uses
  invented placeholder lines like "Line one of the fixture." so the scan can
  exclude `test/fixtures/`).
- Screen modules are tested by rendering into a minimal DOM stub only where
  cheap; otherwise manual criteria in the slice brief.
- Never test the coach's status code; test `source`.
