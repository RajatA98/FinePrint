// Asks the serverless coach for a note and gives up quickly. The status code is
// never read: only `source: "live"` with words in it counts as an answer, and
// anything else — a refusal, a stub, a timeout, a page of HTML — becomes the
// lesson's own deterministic note.

import { deterministicNote } from "./deterministic.js";

const ENDPOINT = "/api/coach";
const TIMEOUT_MS = 4500;

export async function requestCoach(payload, options = {}) {
  const {
    fetch: fetchImpl = globalThis.fetch,
    timeoutMs = TIMEOUT_MS,
    url = ENDPOINT
  } = options;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetchImpl(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal
    });
    const body = await response.json();
    if (body?.source === "live" && typeof body.message === "string" && body.message.trim() !== "") {
      return { source: "live", message: body.message };
    }
    return deterministicNote(payload);
  } catch {
    return deterministicNote(payload);
  } finally {
    clearTimeout(timer);
  }
}
