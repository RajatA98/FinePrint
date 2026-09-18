// The live coach function: always 200, degrades invisibly. We inject `fetch`
// and environment variables rather than hitting the network or process.env
// directly, so these tests never make a real call.

import test from "node:test";
import assert from "node:assert/strict";

import handler from "../api/coach.js";
import { buildCoachPrompt, TONE } from "../api/coach-prompt.js";

const VALID_PAYLOAD = {
  lessonId: "open-window",
  verdict: "review",
  score: { correct: 1, total: 2 },
  missed: [{ challengeId: "c1-search", skill: "detail", excerpt: 1, position: "early" }],
  clusters: { detail: { correct: 0, total: 1 }, vocabulary: { correct: 1, total: 1 } },
  pace: { overallWpm: 180, shownNotGraded: true },
  evidenceReview: 0,
  nudgesUsed: 1
};

function req(method, body) {
  return { method, body };
}

/** A tiny res stub that records what the handler sent, mirroring Vercel's API. */
function res() {
  return {
    statusCode: null,
    headers: {},
    body: null,
    setHeader(key, value) {
      this.headers[key] = value;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    }
  };
}

function geminiBody(message) {
  return {
    candidates: [
      { content: { parts: [{ text: JSON.stringify({ message }) }] } }
    ]
  };
}

function withEnv(vars, fn) {
  const prior = {};
  for (const key of Object.keys(vars)) {
    prior[key] = process.env[key];
    if (vars[key] === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = vars[key];
    }
  }
  return Promise.resolve()
    .then(fn)
    .finally(() => {
      for (const key of Object.keys(prior)) {
        if (prior[key] === undefined) {
          delete process.env[key];
        } else {
          process.env[key] = prior[key];
        }
      }
    });
}

test("GET is rejected with the generic fallback, always 200", async () => {
  const response = res();
  await handler(req("GET"), response);
  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.body, { source: "fallback-generic", message: null });
});

test("a malformed body falls back to deterministic", async () => {
  const response = res();
  await handler(req("POST", "not an object"), response);
  assert.equal(response.statusCode, 200);
  assert.equal(response.body.source, "fallback-deterministic");
  assert.equal(response.body.message, null);
});

test("an unknown key in the payload is rejected as malformed", async () => {
  const response = res();
  await withEnv({ USE_LIVE_AI: "1", GEMINI_API_KEY: "test-key" }, async () => {
    await handler(req("POST", { ...VALID_PAYLOAD, storyQuote: "a phrase from the tale" }), response);
  });
  assert.equal(response.statusCode, 200);
  assert.equal(response.body.source, "fallback-deterministic");
  assert.equal(response.body.message, null);
});

test("a string field over 40 characters is rejected as malformed", async () => {
  const response = res();
  await withEnv({ USE_LIVE_AI: "1", GEMINI_API_KEY: "test-key" }, async () => {
    await handler(
      req("POST", { ...VALID_PAYLOAD, lessonId: "x".repeat(41) }),
      response
    );
  });
  assert.equal(response.statusCode, 200);
  assert.equal(response.body.source, "fallback-deterministic");
  assert.equal(response.body.message, null);
});

test("flag off falls back to deterministic with a debug reason", async () => {
  const response = res();
  await withEnv({ USE_LIVE_AI: undefined, GEMINI_API_KEY: undefined, VERCEL_ENV: "development" }, async () => {
    await handler(req("POST", VALID_PAYLOAD), response);
  });
  assert.equal(response.statusCode, 200);
  assert.equal(response.body.source, "fallback-deterministic");
  assert.equal(response.body.message, null);
  assert.ok(response.body.debug?.reason);
});

test("flag on but no key falls back to deterministic", async () => {
  const response = res();
  await withEnv({ USE_LIVE_AI: "1", GEMINI_API_KEY: undefined, VERCEL_ENV: "development" }, async () => {
    await handler(req("POST", VALID_PAYLOAD), response);
  });
  assert.equal(response.statusCode, 200);
  assert.equal(response.body.source, "fallback-deterministic");
});

test("debug is absent in production", async () => {
  const response = res();
  await withEnv({ USE_LIVE_AI: undefined, GEMINI_API_KEY: undefined, VERCEL_ENV: "production" }, async () => {
    await handler(req("POST", VALID_PAYLOAD), response);
  });
  assert.equal(response.statusCode, 200);
  assert.equal(response.body.debug, undefined);
  assert.equal(JSON.stringify(response.body).includes("GEMINI"), false);
});

test("a well-formed live call succeeds", async () => {
  const response = res();
  const calls = [];
  await withEnv({ USE_LIVE_AI: "1", GEMINI_API_KEY: "super-secret-key", VERCEL_ENV: "development" }, async () => {
    await handler(req("POST", VALID_PAYLOAD), response, {
      fetch: async (url, options) => {
        calls.push({ url, options });
        return {
          ok: true,
          status: 200,
          json: async () => geminiBody("You missed detail work in the first case file. Reread the room for objects next time.")
        };
      }
    });
  });
  assert.equal(response.statusCode, 200);
  assert.equal(response.body.source, "live");
  assert.equal(
    response.body.message,
    "You missed detail work in the first case file. Reread the room for objects next time."
  );
  assert.equal(calls.length, 1);
  assert.ok(String(calls[0].url).includes("generateContent"));
  assert.equal(calls[0].options.headers["x-goog-api-key"], "super-secret-key");
  assert.equal(JSON.stringify(calls[0].options).includes("super-secret-key"), true);
  // but the key never appears in the response sent to the client
  assert.equal(JSON.stringify(response.body).includes("super-secret-key"), false);
});

test("a rejected fetch falls back to deterministic", async () => {
  const response = res();
  await withEnv({ USE_LIVE_AI: "1", GEMINI_API_KEY: "test-key", VERCEL_ENV: "development" }, async () => {
    await handler(req("POST", VALID_PAYLOAD), response, {
      fetch: async () => {
        throw new TypeError("network down");
      }
    });
  });
  assert.equal(response.statusCode, 200);
  assert.equal(response.body.source, "fallback-deterministic");
});

test("a timing-out fetch falls back to deterministic", async () => {
  const response = res();
  await withEnv({ USE_LIVE_AI: "1", GEMINI_API_KEY: "test-key", VERCEL_ENV: "development" }, async () => {
    await handler(req("POST", VALID_PAYLOAD), response, {
      fetch: (url, { signal }) =>
        new Promise((resolve, reject) => {
          signal.addEventListener("abort", () => reject(new Error("aborted")));
        })
    });
  });
  assert.equal(response.statusCode, 200);
  assert.equal(response.body.source, "fallback-deterministic");
});

test("a fetch returning garbage falls back to deterministic", async () => {
  const response = res();
  await withEnv({ USE_LIVE_AI: "1", GEMINI_API_KEY: "test-key", VERCEL_ENV: "development" }, async () => {
    await handler(req("POST", VALID_PAYLOAD), response, {
      fetch: async () => ({
        ok: true,
        status: 200,
        json: async () => ({ not: "the expected shape" })
      })
    });
  });
  assert.equal(response.statusCode, 200);
  assert.equal(response.body.source, "fallback-deterministic");
});

test("a 95-word message falls back to deterministic", async () => {
  const response = res();
  const longMessage = Array.from({ length: 95 }, (_, i) => `word${i}`).join(" ");
  await withEnv({ USE_LIVE_AI: "1", GEMINI_API_KEY: "test-key", VERCEL_ENV: "development" }, async () => {
    await handler(req("POST", VALID_PAYLOAD), response, {
      fetch: async () => ({ ok: true, status: 200, json: async () => geminiBody(longMessage) })
    });
  });
  assert.equal(response.statusCode, 200);
  assert.equal(response.body.source, "fallback-deterministic");
});

test("a message containing a banned word falls back to deterministic", async () => {
  for (const bad of ["You failed the detail check.", "That answer was wrong.", "You did not fail, but it was wrong anyway."]) {
    const response = res();
    await withEnv({ USE_LIVE_AI: "1", GEMINI_API_KEY: "test-key", VERCEL_ENV: "development" }, async () => {
      await handler(req("POST", VALID_PAYLOAD), response, {
        fetch: async () => ({ ok: true, status: 200, json: async () => geminiBody(bad) })
      });
    });
    assert.equal(response.statusCode, 200);
    assert.equal(response.body.source, "fallback-deterministic", `expected fallback for: ${bad}`);
  }
});

test("the handler never throws even when res methods are hostile", async () => {
  // A body that JSON.parses fine but is a number, not an object.
  const response = res();
  await assert.doesNotReject(handler(req("POST", 42), response));
  assert.equal(response.statusCode, 200);
});

test("the built prompt names the field list and contains no story words", () => {
  const prompt = buildCoachPrompt(VALID_PAYLOAD);
  assert.match(prompt, /lessonId/);
  assert.match(prompt, /verdict/);
  assert.match(prompt, /clusters/);
  assert.match(prompt, /pace/);
  assert.match(prompt, /missed/);
  assert.match(prompt, /evidenceReview/);
  assert.match(prompt, /nudgesUsed/);
  assert.equal(prompt.toLowerCase().includes("saki"), false);
  assert.equal(prompt.toLowerCase().includes("open window"), false);
  assert.equal(/\bvera\b/.test(prompt.toLowerCase()), false);
  assert.equal(prompt.includes(TONE), true);
});
