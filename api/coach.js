// The only server-side code in Fine Print, and the only place a model key may
// exist. Always responds 200; never throws out of the handler. The player is
// never shown "AI unavailable" — degradation between the three source tiers
// (live -> fallback-deterministic -> fallback-generic) is invisible to them.
//
// This function never sees story text. It receives only the performance-data
// payload the client built in src/coach/payload.js, and it re-validates that
// shape itself (whitelisted keys, bounded string lengths) because trusting the
// client here would be trusting whatever a browser sent us.

import { buildCoachPrompt } from "./coach-prompt.js";

const MODEL = process.env.GEMINI_MODEL || "gemini-flash-lite-latest";
const TIMEOUT_MS = 4000;
const MAX_WORDS = 90;
const BANNED_WORDS = ["fail", "wrong"]; // catches "fail" and "failed" too

const TOP_LEVEL_KEYS = [
  "lessonId",
  "verdict",
  "score",
  "missed",
  "clusters",
  "pace",
  "evidenceReview",
  "nudgesUsed"
];
const SCORE_KEYS = ["correct", "total"];
const MISSED_KEYS = ["challengeId", "skill", "excerpt", "position"];
const PACE_KEYS = ["overallWpm", "shownNotGraded"];
const MAX_STRING_LEN = 40;

export default async function handler(req, res, deps = {}) {
  res.setHeader("Content-Type", "application/json");

  if (req.method !== "POST") {
    res.status(200).json({ source: "fallback-generic", message: null });
    return;
  }

  const nonProduction = process.env.VERCEL_ENV !== "production";
  const fetchImpl = deps.fetch || globalThis.fetch;

  let payload;
  try {
    payload = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  } catch {
    payload = null;
  }

  if (!validatePayload(payload)) {
    respondFallback(res, "fallback-deterministic", nonProduction, { reason: "malformed-payload" });
    return;
  }

  const useLive = process.env.USE_LIVE_AI === "1";
  const apiKey = process.env.GEMINI_API_KEY;

  if (!useLive || !apiKey) {
    respondFallback(res, "fallback-deterministic", nonProduction, {
      reason: !useLive ? "flag-off" : "no-key"
    });
    return;
  }

  try {
    const message = await callGemini(payload, apiKey, fetchImpl);
    if (!isAcceptableMessage(message)) {
      respondFallback(res, "fallback-deterministic", nonProduction, { reason: "unacceptable-message", model: MODEL });
      return;
    }
    res.status(200).json({
      source: "live",
      message,
      ...(nonProduction ? { debug: { reason: "live", status: 200, model: MODEL } } : {})
    });
  } catch (error) {
    respondFallback(res, "fallback-deterministic", nonProduction, {
      reason: error?.name === "AbortError" ? "timeout" : "fetch-failed",
      model: MODEL
    });
  }
}

function respondFallback(res, source, nonProduction, debug) {
  res.status(200).json({
    source,
    message: null,
    ...(nonProduction ? { debug } : {})
  });
}

async function callGemini(payload, apiKey, fetchImpl) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetchImpl(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey
        },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: buildCoachPrompt(payload) }] }],
          generationConfig: {
            responseMimeType: "application/json",
            responseSchema: {
              type: "object",
              properties: { message: { type: "string" } },
              required: ["message"]
            },
            maxOutputTokens: 200,
            temperature: 0.7
          }
        }),
        signal: controller.signal
      }
    );
    const body = await response.json();
    const text = body?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (typeof text !== "string") {
      return null;
    }
    const parsed = JSON.parse(text);
    return typeof parsed?.message === "string" ? parsed.message : null;
  } finally {
    clearTimeout(timer);
  }
}

function isAcceptableMessage(message) {
  if (typeof message !== "string") {
    return false;
  }
  const trimmed = message.trim();
  if (trimmed === "") {
    return false;
  }
  const wordCount = (trimmed.match(/\S+/g) ?? []).length;
  if (wordCount > MAX_WORDS) {
    return false;
  }
  const lower = trimmed.toLowerCase();
  return !BANNED_WORDS.some((word) => lower.includes(word));
}

// --- Shape guard -----------------------------------------------------------
// The function cannot see the lesson, so it enforces the contract's shape
// instead: only these keys, only these sub-shapes, no string over 40 chars.
// This is a product guarantee (story text must never reach the model), not
// hygiene, so it fails closed on anything it does not recognize.

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function onlyKeys(object, allowed) {
  return Object.keys(object).every((key) => allowed.includes(key));
}

function isBoundedString(value, { nullable = false } = {}) {
  if (value === null) {
    return nullable;
  }
  return typeof value === "string" && value.length <= MAX_STRING_LEN;
}

function isFiniteNumber(value) {
  return typeof value === "number" && Number.isFinite(value);
}

function validatePayload(payload) {
  if (!isPlainObject(payload)) {
    return false;
  }
  if (!onlyKeys(payload, TOP_LEVEL_KEYS)) {
    return false;
  }
  return (
    isBoundedString(payload.lessonId, { nullable: true }) &&
    isBoundedString(payload.verdict) &&
    validateScore(payload.score) &&
    validateMissed(payload.missed) &&
    validateClusters(payload.clusters) &&
    validatePace(payload.pace) &&
    isFiniteNumber(payload.evidenceReview) &&
    isFiniteNumber(payload.nudgesUsed)
  );
}

function validateScore(score) {
  return (
    isPlainObject(score) &&
    onlyKeys(score, SCORE_KEYS) &&
    isFiniteNumber(score.correct) &&
    isFiniteNumber(score.total)
  );
}

function validateMissed(missed) {
  if (!Array.isArray(missed)) {
    return false;
  }
  return missed.every(
    (item) =>
      isPlainObject(item) &&
      onlyKeys(item, MISSED_KEYS) &&
      isBoundedString(item.challengeId) &&
      isBoundedString(item.skill, { nullable: true }) &&
      isFiniteNumber(item.excerpt) &&
      isBoundedString(item.position)
  );
}

function validateClusters(clusters) {
  if (!isPlainObject(clusters)) {
    return false;
  }
  return Object.entries(clusters).every(
    ([skill, value]) =>
      skill.length <= MAX_STRING_LEN &&
      isPlainObject(value) &&
      onlyKeys(value, SCORE_KEYS) &&
      isFiniteNumber(value.correct) &&
      isFiniteNumber(value.total)
  );
}

function validatePace(pace) {
  return (
    isPlainObject(pace) &&
    onlyKeys(pace, PACE_KEYS) &&
    isFiniteNumber(pace.overallWpm) &&
    typeof pace.shownNotGraded === "boolean"
  );
}
