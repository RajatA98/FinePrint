import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { grade } from "../src/state/grade.js";

const lesson = JSON.parse(
  readFileSync(new URL("./fixtures/lesson.mini.json", import.meta.url), "utf8")
);

test("a single-answer lock is correct only for the exact choice", () => {
  assert.deepEqual(grade(lesson, "c1-lock-apply", ["a"]), { correct: true, evidenceLine: 2 });
  assert.equal(grade(lesson, "c1-lock-apply", ["b"]).correct, false);
  assert.equal(grade(lesson, "c1-lock-apply", []).correct, false);
});

test("a search is correct when the chosen set equals the answer set, order-independent", () => {
  assert.equal(grade(lesson, "c1-search", ["o-lamp", "o-key"]).correct, true);
  assert.equal(grade(lesson, "c1-search", ["o-key", "o-lamp"]).correct, true);
});

test("a search is wrong when under-selected, over-selected, or duplicated short", () => {
  assert.equal(grade(lesson, "c1-search", ["o-lamp"]).correct, false);
  assert.equal(grade(lesson, "c1-search", ["o-lamp", "o-key", "o-glove"]).correct, false);
  assert.equal(grade(lesson, "c1-search", ["o-lamp", "o-lamp"]).correct, false);
});

test("grade reports the evidence line of the challenge", () => {
  assert.equal(grade(lesson, "c1-cite", ["L4"]).evidenceLine, 4);
  assert.equal(grade(lesson, "c2-search", ["o-ledger", "o-glove"]).evidenceLine, 10);
});

test("grade throws on an unknown challenge", () => {
  assert.throws(() => grade(lesson, "c9-lock", ["a"]), { message: "unknown challenge: c9-lock" });
});

test("finale-reconstruct is correct with the right people, culprit, and the four proving clues", () => {
  const result = grade(lesson, "finale-reconstruct", {
    people: { ada: "ada", bram: "bram" },
    clues: ["k1", "k3", "k5", "k7"],
    culprit: "cora"
  });
  assert.equal(result.correct, true);
  assert.equal(result.solved, true);
  assert.equal(result.evidenceLine, null);
});

test("finale-reconstruct is not solved when a decoy clue is chosen", () => {
  const result = grade(lesson, "finale-reconstruct", {
    people: { ada: "ada", bram: "bram" },
    clues: ["k1", "k3", "k5", "k7", "k2"],
    culprit: "cora"
  });
  assert.equal(result.solved, false);
  assert.equal(result.correct, false);
});

test("finale-reconstruct partial: culprit right without the proving clues is not solved", () => {
  const result = grade(lesson, "finale-reconstruct", {
    people: { ada: "ada", bram: "bram" },
    clues: ["k1"],
    culprit: "cora"
  });
  assert.equal(result.culpritCorrect, true);
  assert.equal(result.solved, false);
});

test("finale-reconstruct is not solved when the culprit is wrong", () => {
  const result = grade(lesson, "finale-reconstruct", {
    people: { ada: "ada", bram: "bram" },
    clues: ["k1", "k3", "k5", "k7"],
    culprit: "ada"
  });
  assert.equal(result.solved, false);
});

test("finale-reconstruct scores the people prompts too", () => {
  const result = grade(lesson, "finale-reconstruct", {
    people: { ada: "bram", bram: "bram" },
    clues: ["k1", "k3", "k5", "k7"],
    culprit: "cora"
  });
  assert.equal(result.peopleCorrect, false);
  assert.equal(result.correct, false, "a wrong portrait costs the scored item");
  assert.equal(result.solved, true, "finale.solved is culprit plus clues only");
});

test("finale-statement is correct only when every slot holds its true option", () => {
  assert.equal(
    grade(lesson, "finale-statement", { slots: { slot1: "v-alpha", slot2: "v-delta" } }).correct,
    true
  );
  assert.equal(
    grade(lesson, "finale-statement", { slots: { slot1: "v-alpha", slot2: "v-gamma" } }).correct,
    false
  );
  assert.equal(grade(lesson, "finale-statement", { slots: { slot1: "v-alpha" } }).correct, false);
  assert.equal(grade(lesson, "finale-statement", { slots: {} }).correct, false);
});

test("grade never mutates the lesson", () => {
  const before = JSON.stringify(lesson);
  grade(lesson, "c1-search", ["o-lamp", "o-key"]);
  grade(lesson, "finale-reconstruct", { people: {}, clues: ["k1"], culprit: "cora" });
  assert.equal(JSON.stringify(lesson), before);
});
