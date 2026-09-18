import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { setLesson, quote } from "../src/lesson.js";
import { requestCoach } from "../src/coach/client.js";

const FIXTURE = JSON.parse(
  readFileSync(new URL("./fixtures/lesson.mini.json", import.meta.url), "utf8")
);

const PAYLOAD = {
  lessonId: "mini",
  verdict: "review",
  score: { correct: 1, total: 2 },
  missed: [{ challengeId: "c1-search", skill: "detail", excerpt: 1, position: "early" }],
  clusters: { detail: { correct: 0, total: 1 } },
  pace: { overallWpm: 180, shownNotGraded: true },
  evidenceReview: 0,
  nudgesUsed: 0
};

function useFixture() {
  setLesson(structuredClone(FIXTURE));
}

/** A response whose status may not be read: the client must judge by `source`. */
function jsonResponse(body) {
  return {
    get status() {
      throw new Error("the client must not read the status code");
    },
    get ok() {
      throw new Error("the client must not read ok");
    },
    async json() {
      if (typeof body === "string") {
        throw new SyntaxError("Unexpected token < in JSON");
      }
      return body;
    }
  };
}

test("a live answer is used as it stands", async () => {
  useFixture();
  const result = await requestCoach(PAYLOAD, {
    fetch: async () => jsonResponse({ source: "live", message: "A live note from the coach." })
  });
  assert.deepEqual(result, { source: "live", message: "A live note from the coach." });
});

test("the payload is posted as JSON", async () => {
  useFixture();
  const calls = [];
  await requestCoach(PAYLOAD, {
    fetch: async (url, options) => {
      calls.push({ url, options });
      return jsonResponse({ source: "live", message: "ok" });
    }
  });
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, "/api/coach");
  assert.equal(calls[0].options.method, "POST");
  assert.deepEqual(JSON.parse(calls[0].options.body), PAYLOAD);
  assert.ok(calls[0].options.signal);
});

test("a rejected fetch falls back to the deterministic note", async () => {
  useFixture();
  const result = await requestCoach(PAYLOAD, {
    fetch: async () => {
      throw new TypeError("network down");
    }
  });
  assert.deepEqual(result, { source: "fallback-deterministic", message: quote("s-coach-detail") });
});

test("a request that never answers times out into the deterministic note", async () => {
  useFixture();
  const result = await requestCoach(PAYLOAD, {
    timeoutMs: 10,
    fetch: (url, { signal }) =>
      new Promise((resolve, reject) => {
        signal.addEventListener("abort", () => reject(new Error("aborted")));
      })
  });
  assert.deepEqual(result, { source: "fallback-deterministic", message: quote("s-coach-detail") });
});

test("a body that is not JSON falls back", async () => {
  useFixture();
  const result = await requestCoach(PAYLOAD, {
    fetch: async () => jsonResponse("<html>not json</html>")
  });
  assert.equal(result.source, "fallback-deterministic");
  assert.equal(result.message, quote("s-coach-detail"));
});

test("the server's own fallback is a signal, not content", async () => {
  useFixture();
  const stub = await requestCoach(PAYLOAD, {
    fetch: async () => jsonResponse({ source: "fallback-deterministic", message: null })
  });
  assert.deepEqual(stub, { source: "fallback-deterministic", message: quote("s-coach-detail") });

  const generic = await requestCoach(PAYLOAD, {
    fetch: async () => jsonResponse({ source: "fallback-generic", message: "server wording" })
  });
  assert.deepEqual(generic, { source: "fallback-deterministic", message: quote("s-coach-detail") });
});

test("a live answer with an empty message falls back", async () => {
  useFixture();
  for (const message of [null, "", "   ", undefined]) {
    const result = await requestCoach(PAYLOAD, {
      fetch: async () => jsonResponse({ source: "live", message })
    });
    assert.equal(result.source, "fallback-deterministic");
  }
});

test("a clean run with no missed items still gets a note", async () => {
  useFixture();
  const result = await requestCoach(
    { ...PAYLOAD, missed: [], clusters: { detail: { correct: 1, total: 1 } } },
    {
      fetch: async () => {
        throw new Error("offline");
      }
    }
  );
  assert.deepEqual(result, { source: "fallback-deterministic", message: quote("s-coach-clean") });
});
