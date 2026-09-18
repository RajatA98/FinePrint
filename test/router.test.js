import test from "node:test";
import assert from "node:assert/strict";

import { parseHash, buildHash, SCREENS } from "../src/router.js";

const STUDY = { screen: "study", excerpt: 1 };

test("an empty, bare or malformed hash is the study", () => {
  assert.deepEqual(parseHash(""), STUDY);
  assert.deepEqual(parseHash("#"), STUDY);
  assert.deepEqual(parseHash("#/"), STUDY);
  assert.deepEqual(parseHash(undefined), STUDY);
  assert.deepEqual(parseHash(null), STUDY);
  assert.deepEqual(parseHash("#/nowhere"), STUDY);
  assert.deepEqual(parseHash("#/read/2/extra"), STUDY);
});

test("a known screen parses, with its excerpt when it has one", () => {
  assert.deepEqual(parseHash("#/study"), STUDY);
  assert.deepEqual(parseHash("#/read/3"), { screen: "read", excerpt: 3 });
  assert.deepEqual(parseHash("#/search/12"), { screen: "search", excerpt: 12 });
  assert.deepEqual(parseHash("#/cite/1"), { screen: "cite", excerpt: 1 });
});

test("a missing or nonsense excerpt falls back to the first", () => {
  assert.deepEqual(parseHash("#/read"), { screen: "read", excerpt: 1 });
  assert.deepEqual(parseHash("#/read/0"), { screen: "read", excerpt: 1 });
  assert.deepEqual(parseHash("#/read/-2"), { screen: "read", excerpt: 1 });
  assert.deepEqual(parseHash("#/read/two"), { screen: "read", excerpt: 1 });
  assert.deepEqual(parseHash("#/read/1.5"), { screen: "read", excerpt: 1 });
});

test("screens without excerpts ignore one that is offered", () => {
  assert.deepEqual(parseHash("#/reconstruct"), { screen: "reconstruct", excerpt: 1 });
  assert.deepEqual(parseHash("#/reconstruct/4"), { screen: "reconstruct", excerpt: 1 });
  assert.deepEqual(parseHash("#/statement"), { screen: "statement", excerpt: 1 });
  assert.deepEqual(parseHash("#/report"), { screen: "report", excerpt: 1 });
});

test("case and a leading slash do not matter", () => {
  assert.deepEqual(parseHash("#/READ/2"), { screen: "read", excerpt: 2 });
  assert.deepEqual(parseHash("/read/2"), { screen: "read", excerpt: 2 });
  assert.deepEqual(parseHash("read/2"), { screen: "read", excerpt: 2 });
});

test("buildHash writes the excerpt only where the screen has one", () => {
  assert.equal(buildHash({ screen: "study", excerpt: 1 }), "#/study");
  assert.equal(buildHash({ screen: "read", excerpt: 3 }), "#/read/3");
  assert.equal(buildHash({ screen: "read" }), "#/read/1");
  assert.equal(buildHash({ screen: "reconstruct", excerpt: 2 }), "#/reconstruct");
  assert.equal(buildHash({ screen: "report" }), "#/report");
});

test("buildHash refuses an unknown screen and offers the study", () => {
  assert.equal(buildHash({ screen: "nowhere", excerpt: 3 }), "#/study");
  assert.equal(buildHash({}), "#/study");
  assert.equal(buildHash(), "#/study");
});

test("every screen round-trips through a hash", () => {
  assert.deepEqual(SCREENS, [
    "study",
    "vocabulary",
    "read",
    "lock",
    "search",
    "cite",
    "reconstruct",
    "statement",
    "report"
  ]);
  for (const screen of SCREENS) {
    const route = parseHash(buildHash({ screen, excerpt: 2 }));
    assert.equal(route.screen, screen);
    assert.equal(Number.isInteger(route.excerpt) && route.excerpt >= 1, true);
  }
});
