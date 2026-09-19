// The frame every screen shares: element helpers, the Start over control, and the
// heading block. Screens build DOM through here so the markup stays consistent.

import { UI, SCREEN_LABEL } from "../ui-strings.js";
import { demoEnabled, skipAhead } from "./demo.js";
import { hasExcerpt } from "../router.js";
import { forgetReadSession } from "./read-session.js";
import { forgetChallengeSession } from "./challenge-session.js";
import { progressMarks } from "./challenge-view.js";

export function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (value === null || value === undefined || value === false) {
      continue;
    }
    if (key === "class") {
      node.className = value;
    } else if (key === "text") {
      node.textContent = String(value);
    } else if (key === "dataset") {
      // An absent data attribute is absent, not the string "null": CSS reads
      // these as state, and [data-lit] must not match a line that is unlit.
      for (const [name, item] of Object.entries(value)) {
        if (item !== null && item !== undefined && item !== false) {
          node.dataset[name] = String(item);
        }
      }
    } else if (key === "onclick" || key === "onchange") {
      node.addEventListener(key.slice(2), value);
    } else if (value === true) {
      node.setAttribute(key, "");
    } else {
      node.setAttribute(key, String(value));
    }
  }
  append(node, children);
  return node;
}

export function append(node, children) {
  for (const child of [].concat(children)) {
    if (child === null || child === undefined || child === false) {
      continue;
    }
    node.append(child instanceof Node ? child : document.createTextNode(String(child)));
  }
  return node;
}

export function button(label, onClick, attrs = {}) {
  return el("button", { type: "button", ...attrs, onclick: onClick }, [label]);
}

/** A letterpress label: small, tracked, set in the label face by CSS. */
export function label(text, attrs = {}) {
  return el("span", { ...attrs, class: ["label", attrs.class].filter(Boolean).join(" "), text });
}

/**
 * Clear the root, draw the chrome, return the section a screen fills.
 * The Start over control is on every screen: there is always a way back.
 */
export function screenShell(root, ctx, { heading, label: screenName, mark } = {}) {
  root.replaceChildren();
  const screen = ctx.state.route.screen;
  const header = el("header", { class: "chrome" }, [
    el("p", { class: "wordmark", text: UI.wordmark }),
    el("p", { class: "chrome-label", text: screenName ?? SCREEN_LABEL[screen] ?? "" }),
    mark ?? null,
    hasExcerpt(screen) ? progressStrip(ctx, screen) : null,
    demoEnabled() && hasExcerpt(screen)
      ? button(UI.skipAhead, () => skipAhead(ctx), { class: "start-over demo-skip" })
      : null,
    startOverButton(ctx, { label: UI.startOver, class: "start-over" })
  ]);
  const section = el("section", { class: `screen screen--${screen}` });
  if (heading !== undefined && heading !== null) {
    section.append(el("h1", { class: "screen-heading", text: heading }));
  }
  root.append(header, section);
  return section;
}

/**
 * Back to the shelf, with the session scratch forgotten first. One implementation
 * so the chrome's control and the report's "revisit" are the same gesture, and
 * the only state either writes is the reducer's own START_OVER.
 */
export function startOverButton(ctx, { label: text, class: className } = {}) {
  return button(
    text ?? UI.startOver,
    () => {
      forgetReadSession();
      forgetChallengeSession();
      ctx.dispatch({ type: "START_OVER" });
      ctx.navigate({ screen: "study", excerpt: 1 });
    },
    { class: className ?? "start-over" }
  );
}

/**
 * The shut book, for the screens the reader works from memory. It is a sign in
 * the chrome, never a control: there is no page to open here.
 */
export function closedBookMark() {
  const mark = el("span", { class: "shut-book" });
  const glyph = el("span", { class: "shut-book__glyph", "aria-hidden": "true" });
  glyph.innerHTML =
    '<svg viewBox="0 0 30 22" focusable="false">' +
    '<path class="shut-book__board" d="M3.6 2.4 h20.2 a2.6 2.6 0 0 1 2.6 2.6 v12 a2.6 2.6 0 0 1 -2.6 2.6 H3.6 z"/>' +
    '<path class="shut-book__spine" d="M3.6 2.4 a2.1 2.1 0 0 0 0 17.2 z"/>' +
    '<path class="shut-book__edge" d="M23.6 5.6 v10.8 M25 6.6 v8.8"/></svg>';
  mark.append(glyph, label(UI.bookShut, { class: "shut-book__label" }));
  return mark;
}

/**
 * Where the reader is in the ten excerpts, as roman numerals with the current
 * one lit. It appears on the excerpt-scoped screens only, and it is a sign, not
 * a control: no numeral is clickable, because the case is read in order.
 */
function progressStrip(ctx, screen) {
  const { index } = currentExcerpt(ctx);
  const strip = el("ol", { class: "progress", "aria-label": UI.progressLabel });
  for (const mark of progressMarks(ctx.lesson.excerpts ?? [], index)) {
    strip.append(
      el("li", {
        class: "progress__mark",
        dataset: { state: mark.state, screen },
        text: mark.roman,
        "aria-current": mark.state === "current" ? "step" : false
      })
    );
  }
  return strip;
}

/** The forward control. Screens decide when it exists; it is never a dead end. */
export function nextButton(ctx, route, label = UI.next) {
  return el("nav", { class: "onward" }, [
    button(label, () => ctx.navigate(route), { class: "next" })
  ]);
}

/** The excerpt this route is about, clamped to one the lesson actually has. */
export function currentExcerpt(ctx) {
  const excerpts = ctx.lesson.excerpts ?? [];
  const asked = Number.isInteger(ctx.state.route.excerpt) ? ctx.state.route.excerpt : 1;
  const index = Math.min(Math.max(asked, 1), excerpts.length || 1);
  const last = excerpts[excerpts.length - 1];
  return { index, excerpt: excerpts[index - 1], count: excerpts.length, lastRoman: last?.roman ?? String(excerpts.length) };
}

/** Honour the system setting; every transition in the app checks this first. */
export function prefersReducedMotion() {
  try {
    return globalThis.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches === true;
  } catch {
    return false;
  }
}

/* ------------------------------------------------------------- the cameos */
/*
 * Paper-cut silhouettes in gilt ovals. The guide has his homburg — never a
 * deerstalker, and never a pipe. The other three are the story's own people, and
 * they are the reason this file holds four silhouettes instead of one: a naming
 * task whose portraits are identical has no subject to name. They are told
 * apart the way a Victorian bust is, by the hair and the shoulder line — a
 * bobbed girl, a woman with her hair up in a knot, a man in a collar.
 *
 * All four share the same viewBox and the same `translate(0,6)` wrapper, so the
 * oval, its gilt rim and every size in the stylesheet are unchanged. Path data
 * only: a cameo says nothing.
 */

const CAMEO_PATHS =
  '<path d="M22 40 C22 28, 32 21, 45 21 C58 21, 66 28, 66 38 L70 40 ' +
  'C72 41, 72 44, 69 44 L20 44 C17 44, 17 41, 22 40 Z"/>' +
  '<path d="M31 44 C29 52, 29 58, 31 63 L37 65 L33 69 C32 73, 34 76, 38 77 ' +
  'L36 81 C36 85, 40 88, 45 89 L45 96 C36 98, 26 103, 22 112 L68 112 ' +
  'C66 100, 58 93, 52 90 C55 83, 56 72, 55 63 C54 52, 48 44, 40 43 Z"/>';

// One profile under three heads of hair, so the three read as one household.
const HEAD_PATH =
  '<path d="M56 30 C63 33, 67 42, 66 51 C65 59, 61 66, 55 69 ' +
  'C50 72, 43 72, 39 69 C36 67, 35 65, 35 63 C34 61, 33 60, 33 58 ' +
  'C33 56, 30 55, 28 53 C30 51, 33 50, 34 48 ' +
  'C34 43, 36 36, 42 32 C46 29, 52 28, 56 30 Z"/>';

const FIGURE_PATHS = {
  // bobbed hair to the shoulder, narrow shoulders, a high collar
  girl:
    '<path d="M36 41 C35 28, 45 20, 56 22 C68 24, 74 36, 73 51 ' +
    'C72 62, 69 73, 65 89 L55 89 C59 73, 61 57, 59 47 ' +
    'C57 38, 50 34, 43 37 C40 38, 37 40, 36 41 Z"/>' +
    HEAD_PATH +
    '<path d="M39 64 L53 64 C53 71, 54 76, 57 79 ' +
    'C63 82, 67 92, 68 112 L22 112 C23 92, 27 82, 33 79 ' +
    'C36 76, 39 71, 39 64 Z"/>',

  // hair swept up into a knot at the back, a wider shoulder line
  woman:
    '<circle cx="71" cy="33" r="11"/>' +
    '<path d="M36 45 C34 32, 43 22, 55 23 C66 24, 73 34, 71 46 ' +
    'C70 52, 68 56, 66 59 L57 55 C60 47, 59 39, 55 35 ' +
    'C50 30, 42 33, 38 40 C37 42, 36 44, 36 45 Z"/>' +
    HEAD_PATH +
    '<path d="M39 64 L53 64 C53 71, 54 77, 57 80 ' +
    'C66 84, 72 94, 73 112 L17 112 C18 94, 24 84, 33 80 ' +
    'C36 77, 39 71, 39 64 Z"/>',

  // short hair, broad shoulders, and a collar open at the throat
  man:
    '<path d="M36 46 C34 34, 43 27, 53 28 C64 29, 70 37, 69 48 ' +
    'C68 53, 67 56, 66 59 C65 49, 61 41, 54 38 ' +
    'C47 35, 40 39, 37 46 C37 47, 36 48, 36 46 Z"/>' +
    HEAD_PATH +
    '<path d="M40 63 L52 63 C52 70, 53 75, 55 78 L45 92 L35 78 ' +
    'C38 75, 40 70, 40 63 Z"/>' +
    '<path d="M30 83 L45 97 L60 83 C71 87, 78 97, 79 112 L11 112 ' +
    'C12 97, 19 87, 30 83 Z"/>'
};

/**
 * cameo(figure) — the oval. An unknown figure, or none asked for, is the guide,
 * so a portrait can never come out empty.
 */
export function cameo(figure) {
  const oval = el("span", { class: "cameo", "aria-hidden": "true" });
  const paths = FIGURE_PATHS[figure] ?? CAMEO_PATHS;
  oval.innerHTML = `<svg viewBox="0 0 90 118" focusable="false"><g transform="translate(0,6)">${paths}</g></svg>`;
  return oval;
}
