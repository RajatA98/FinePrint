// The golden run: one full case from the shelf to the Case Report with every
// scored item answered right. Every answer is read from the lesson file at run
// time, so this spec holds no story text and no answer key of its own.
import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import { UI } from "../../src/ui-strings.js";

const lesson = JSON.parse(readFileSync("public/lesson.open-window.json", "utf8"));
const SESSION_KEY = "fineprint.session.v1";

const byId = (id) => lesson.challenges[id];
const ofType = (excerpt, type) => excerpt.challenges.filter((id) => byId(id).type === type);

async function onScreen(page, screen) {
  await page.waitForFunction((s) => document.body.dataset.screen === s, screen);
}

async function next(page, label = UI.next) {
  await page.getByRole("button", { name: label, exact: true }).first().click();
}

/** Answer one challenge inside its own article, then wait for the solved mark. */
async function solve(page, challengeId) {
  const challenge = byId(challengeId);
  const article = page.locator(`[data-challenge="${challengeId}"]`);
  await expect(article).toBeVisible();
  for (const choiceId of challenge.answer) {
    await article.locator(`.choice-slot[data-choice="${choiceId}"] button.choice`).click();
  }
  await article.locator(".challenge__act button").click();
  // A solved stage either shows its solved line or gives way to a settled card.
  await expect(
    page.locator(`.settled[data-challenge="${challengeId}"], [data-challenge="${challengeId}"] .outcome[data-outcome="solved"]`).first()
  ).toBeVisible();
}

async function firstAttempts(page) {
  return page.evaluate((key) => JSON.parse(localStorage.getItem(key) ?? "{}").firstAttempts ?? {}, SESSION_KEY);
}

test("a full case with every answer right ends as Master Detective", async ({ page }) => {
  // The coach is not part of the golden path: answer as the server does with no key.
  await page.route("**/api/coach", (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ source: "fallback-deterministic", message: null }) })
  );

  await page.goto("/");
  await onScreen(page, "study");
  await expect(page.locator("#app")).not.toContainText(lesson.title);
  await next(page, UI.openCase);

  for (const [i, excerpt] of lesson.excerpts.entries()) {
    const n = i + 1;
    await onScreen(page, "vocabulary");
    await expect(page.locator("#app")).toContainText(UI.nothingScored);
    await next(page, UI.readExcerpt);

    await onScreen(page, "read");
    await page.getByRole("button", { name: UI.closeBook, exact: true }).click();

    await onScreen(page, "lock");
    for (const id of ofType(excerpt, "lock")) {
      await solve(page, id);
    }
    await next(page);

    await onScreen(page, "search");
    for (const id of ofType(excerpt, "search")) {
      await solve(page, id);
    }
    await next(page);

    await onScreen(page, "cite");
    for (const id of ofType(excerpt, "cite")) {
      await solve(page, id);
    }

    const record = await firstAttempts(page);
    for (const id of excerpt.challenges) {
      expect(record[id]?.correct, `${id} first attempt on excerpt ${n}`).toBe(true);
    }
    await next(page);
  }

  // Reconstruct the case on the board.
  await onScreen(page, "reconstruct");
  const { people, clues, culprit } = lesson.finale.reconstruct;
  for (const [i, prompt] of people.entries()) {
    await page.locator("ul.cameos .cameo-card__pick").nth(i).click();
    await page.locator("button.name-plate", { hasText: lesson.people[prompt.answer].name }).click();
  }
  for (const [i, clue] of clues.entries()) {
    if (clue.proving) {
      await page.locator("button.slip__pick").nth(i).click();
    }
  }
  await page.locator("ul.suspects .suspect__pick", { hasText: lesson.people[culprit.answer].name }).click();
  await page.locator("button.seal").click();
  await expect(page.locator('.stamp[data-state="closed"]')).toBeVisible();
  await next(page);

  // Set the words into the line.
  await onScreen(page, "statement");
  for (const [i, slot] of lesson.finale.statement.slots.entries()) {
    const right = slot.options.find((option) => option.true === true);
    await page.locator("button.blank").nth(i).click();
    await page.locator("button.tile", { hasText: lesson.vocabulary[right.vocabulary].word }).first().click();
  }
  await page.getByRole("button", { name: UI.signStatement, exact: true }).click();
  await expect(page.locator("#app")).toContainText(UI.statementSigned);
  await next(page);

  // The Case Report.
  await onScreen(page, "report");
  const scoredTotal = Object.values(lesson.challenges).filter((c) => c.scored !== false).length + 2;
  await expect(page.locator("h1.verdict__word")).toHaveText(lesson.strings["s-verdict-master"]);
  await expect(page.locator("#app")).toContainText(UI.correctOfTotal(scoredTotal, scoredTotal));
  await expect(page.locator("#app")).toContainText(UI.reviewedCount(0));
  const meters = await page.locator(".meter__count").allTextContents();
  const perSkill = {};
  for (const c of Object.values(lesson.challenges)) {
    perSkill[c.skill] = (perSkill[c.skill] ?? 0) + 1;
  }
  for (const [skill, count] of Object.entries(perSkill)) {
    expect(meters, `meter for ${skill}`).toContain(`${count} ${UI.of} ${count}`);
  }
  await expect(page.locator(".coach__message")).toHaveText(lesson.strings[lesson.coach.deterministic.clean]);
  await expect(page.locator("#app")).toContainText(UI.paceShown);
  await expect(page.locator(`a[href="${lesson.source.url}"]`)).toBeVisible();

  const finalRecord = await firstAttempts(page);
  expect(Object.keys(finalRecord)).toHaveLength(scoredTotal);
  expect(Object.values(finalRecord).every((a) => a.correct)).toBe(true);
});
