# Coach smoke test

A manual, one-off check that the live Gemini call actually works end to end.
This is **not** part of `npm test` or CI — it makes a real network call and
needs a real API key. Spend it deliberately: this call, one post-deploy
verification, and the demo are the only three live calls this build should
need before the free-tier cap becomes a concern (see
`factory/artifacts/LOCKED_DECISIONS.md` §6).

## Running it

From the repo root:

```
USE_LIVE_AI=1 GEMINI_API_KEY=your-key-here node scripts/coach_smoke.mjs
```

Optional: set `GEMINI_MODEL` to override the default
(`gemini-flash-lite-latest`).

## What it does

`scripts/coach_smoke.mjs` imports `api/coach.js`'s handler directly (in
process, no HTTP server) and calls it with a small stub `req`/`res` and a
realistic sample performance payload. It injects nothing but the environment
variables above — the handler's own `fetch` call goes out for real. It then
prints:

```
status: 200
source: live
message: <the coach's note>
```

## Pass / fail

- **Pass:** `source: live` and a `message` under 90 words, in Inspector
  Inkwell's voice, naming a weakest skill and one next action, with no
  "fail"/"failed"/"wrong" and no story text (it was never given any).
- **Fail:** the script exits with status 1 and prints a reminder to check
  `USE_LIVE_AI` and `GEMINI_API_KEY`. This happens whenever the handler falls
  back — bad key, network trouble, quota, or a response that failed the
  handler's own acceptability checks (word count, banned words, schema). Read
  the console output; in non-production (`VERCEL_ENV !== "production"`) the
  response also carries a `debug: {reason, status, model}` field explaining
  why.

A failing smoke run does not mean the product is broken: the three-tier
fallback means a player would still see a deterministic coaching note, never
an error. It just means the live tier isn't reachable right now.
