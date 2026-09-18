// The study: one shelf, lit at one spine. Nothing here says what the case is
// called — a spine carries a number and a band, and the title stays shut inside
// the book until it opens on the reading screen.

import { quote } from "../lesson.js";
import { UI, BAND } from "../ui-strings.js";
import { el, button, label, cameo, screenShell } from "./chrome.js";

// Eight books stand on the shelf. The lit one is third, far enough in that the
// shelf reads as a shelf and near enough that it is on screen at phone width.
const NUMERALS = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"];
const LIVE = 2;
const CLOTH = [1, 6, 3, 4, 9, 2, 7, 5]; // book-cloth swatches, defined in app.css
const HEIGHTS = [2, 1, 3, 2, 1, 3, 1, 2];

export function render(root, ctx) {
  const section = screenShell(root, ctx, { heading: null });
  const band = BAND[ctx.lesson.difficulty] ?? BAND.first;

  section.append(shelf(ctx, band), plaque(ctx, band));
}

function shelf(ctx, band) {
  const books = el("div", { class: "shelf__books" });
  for (let i = 0; i < NUMERALS.length; i += 1) {
    books.append(
      i === LIVE ? liveSpine(ctx, band, i) : inertSpine(i, band)
    );
  }
  return el("div", { class: "shelf" }, [books, el("div", { class: "shelf__board" })]);
}

function liveSpine(ctx, band, i) {
  return el(
    "button",
    {
      type: "button",
      class: "spine spine--live",
      "aria-label": UI.openCase,
      dataset: { cloth: String(CLOTH[i]), height: String(HEIGHTS[i]) },
      onclick: () => openCase(ctx)
    },
    spineFace(i, band.spine)
  );
}

// The rest of the shelf is scenery: dimmer, inert, and hidden from screen
// readers so nobody tabs through seven cases that cannot be opened.
function inertSpine(i, band) {
  return el(
    "div",
    {
      class: "spine spine--inert",
      "aria-hidden": "true",
      dataset: { cloth: String(CLOTH[i]), height: String(HEIGHTS[i]) }
    },
    spineFace(i, band.spine)
  );
}

function spineFace(i, bandWord) {
  return [
    el("span", { class: "spine__rule" }),
    el("span", { class: "spine__number", text: NUMERALS[i] }),
    label(bandWord, { class: "spine__band" })
  ];
}

function plaque(ctx, band) {
  const count = (ctx.lesson.excerpts ?? []).length;
  const body = el("div", { class: "plaque__body" }, [
    el("h1", { class: "plaque__case", text: `${UI.caseNumber} ${NUMERALS[LIVE]}` }),
    el("p", { class: "plaque__meta" }, [
      label(band.shelf),
      el("span", { class: "plaque__divider", "aria-hidden": "true" }),
      label(`${count} ${UI.excerpts}`)
    ]),
    el("p", { class: "plaque__intro", text: introLine(ctx) })
  ]);
  return el("div", { class: "plaque" }, [
    cameo(),
    body,
    button(UI.openCase, () => openCase(ctx), { class: "open-case" })
  ]);
}

// The detective speaks once here, if the lesson gave him a line. The fixture
// lesson has no such string, and a missing string must not blank the screen.
function introLine(ctx) {
  try {
    return quote("s-study-intro");
  } catch {
    return UI.takeItDown;
  }
}

function openCase(ctx) {
  ctx.dispatch({ type: "START_CASE", at: Date.now() });
  ctx.navigate({ screen: "vocabulary", excerpt: 1 });
}
