import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import {
  loadLesson,
  setLesson,
  quote,
  line,
  excerpt,
  excerptLines,
  challenge,
  wordsIn
} from "../src/lesson.js";

const FIXTURE = JSON.parse(
  readFileSync(new URL("./fixtures/lesson.mini.json", import.meta.url), "utf8")
);

function useFixture() {
  setLesson(structuredClone(FIXTURE));
}

test("loadLesson fetches the url and stores the lesson", async () => {
  const originalFetch = globalThis.fetch;
  const seen = [];
  globalThis.fetch = async (url) => {
    seen.push(url);
    return { ok: true, status: 200, json: async () => structuredClone(FIXTURE) };
  };
  try {
    const loaded = await loadLesson("/fixtures/mini.json");
    assert.deepEqual(seen, ["/fixtures/mini.json"]);
    assert.equal(loaded.id, "mini");
    assert.equal(quote("s-coach-generic"), FIXTURE.strings["s-coach-generic"]);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("loadLesson throws when the response is not ok", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => ({ ok: false, status: 404, json: async () => ({}) });
  try {
    await assert.rejects(() => loadLesson("/missing.json"), /404/);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("quote returns the authored string", () => {
  useFixture();
  assert.equal(quote("s-c1-search-prompt"), FIXTURE.strings["s-c1-search-prompt"]);
});

test("quote throws the contract message on a miss", () => {
  useFixture();
  assert.throws(() => quote("s-nope"), { message: "missing string: s-nope" });
});

test("line is 1-based", () => {
  useFixture();
  assert.equal(line(1), FIXTURE.lines[0]);
  assert.equal(line(12), FIXTURE.lines[11]);
});

test("line throws out of range at both ends and on non-integers", () => {
  useFixture();
  assert.throws(() => line(0), /0/);
  assert.throws(() => line(13), /13/);
  assert.throws(() => line(2.5), /2\.5/);
});

test("excerpt resolves by id and by 1-based index", () => {
  useFixture();
  assert.equal(excerpt("ex2").roman, "II");
  assert.equal(excerpt(1).id, "ex1");
  assert.equal(excerpt(2).id, "ex2");
});

test("excerpt throws on a miss", () => {
  useFixture();
  assert.throws(() => excerpt("ex9"), /ex9/);
  assert.throws(() => excerpt(3), /3/);
});

test("excerptLines returns every line with its number and paragraph flag", () => {
  useFixture();
  const lines = excerptLines("ex1");
  assert.equal(lines.length, 6);
  assert.deepEqual(lines[0], { n: 1, text: FIXTURE.lines[0], startsParagraph: true });
  assert.deepEqual(lines[1], { n: 2, text: FIXTURE.lines[1], startsParagraph: false });
  assert.equal(lines[3].startsParagraph, true, "line 4 begins a paragraph");
  assert.deepEqual(lines.map((l) => l.n), [1, 2, 3, 4, 5, 6]);
});

test("challenge resolves and throws on a miss", () => {
  useFixture();
  assert.equal(challenge("c1-cite").proves, "c1-search");
  assert.throws(() => challenge("c9-cite"), { message: "unknown challenge: c9-cite" });
});

test("wordsIn counts whitespace-separated tokens across the excerpt", () => {
  useFixture();
  assert.equal(wordsIn("ex1"), 60);
  assert.equal(wordsIn("ex2"), 60);
});

test("accessors throw before a lesson is loaded", () => {
  setLesson(null);
  assert.throws(() => quote("s-c1-cite-prompt"), /lesson/);
  assert.throws(() => line(1), /lesson/);
});
