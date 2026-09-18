// The only server-side code in Fine Print, and the only place a model key may exist.
// Phase 1.5 stub: always 200, never live. Slice S13 adds the live Gemini call behind USE_LIVE_AI.
export default async function handler(req, res) {
  res.setHeader("Content-Type", "application/json");
  if (req.method !== "POST") {
    res.status(200).json({ source: "fallback-generic", message: null });
    return;
  }
  const debug = process.env.VERCEL_ENV !== "production" ? { reason: "stub", live: false } : undefined;
  res.status(200).json({ source: "fallback-deterministic", message: null, ...(debug && { debug }) });
}
