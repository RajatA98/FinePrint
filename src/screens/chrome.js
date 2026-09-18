// The frame every screen shares: element helpers, the Start over control, and the
// heading block. Screens build DOM through here so the markup stays consistent.

import { UI, SCREEN_LABEL } from "../ui-strings.js";
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
export function screenShell(root, ctx, { heading, label: screenName } = {}) {
  root.replaceChildren();
  const screen = ctx.state.route.screen;
  const header = el("header", { class: "chrome" }, [
    el("p", { class: "wordmark", text: UI.wordmark }),
    el("p", { class: "chrome-label", text: screenName ?? SCREEN_LABEL[screen] ?? "" }),
    hasExcerpt(screen) ? progressStrip(ctx, screen) : null,
    button(
      UI.startOver,
      () => {
        forgetReadSession();
        forgetChallengeSession();
        ctx.dispatch({ type: "START_OVER" });
        ctx.navigate({ screen: "study", excerpt: 1 });
      },
      { class: "start-over" }
    )
  ]);
  const section = el("section", { class: `screen screen--${screen}` });
  if (heading !== undefined && heading !== null) {
    section.append(el("h1", { class: "screen-heading", text: heading }));
  }
  root.append(header, section);
  return section;
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
  return { index, excerpt: excerpts[index - 1], count: excerpts.length };
}

/** Honour the system setting; every transition in the app checks this first. */
export function prefersReducedMotion() {
  try {
    return globalThis.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches === true;
  } catch {
    return false;
  }
}

// The guide, as a paper-cut silhouette in a gilt oval: a homburg, never a
// deerstalker, and never a pipe. Path data only — he says nothing here.
const CAMEO_PATHS =
  '<path d="M22 40 C22 28, 32 21, 45 21 C58 21, 66 28, 66 38 L70 40 ' +
  'C72 41, 72 44, 69 44 L20 44 C17 44, 17 41, 22 40 Z"/>' +
  '<path d="M31 44 C29 52, 29 58, 31 63 L37 65 L33 69 C32 73, 34 76, 38 77 ' +
  'L36 81 C36 85, 40 88, 45 89 L45 96 C36 98, 26 103, 22 112 L68 112 ' +
  'C66 100, 58 93, 52 90 C55 83, 56 72, 55 63 C54 52, 48 44, 40 43 Z"/>';

export function cameo() {
  const oval = el("span", { class: "cameo", "aria-hidden": "true" });
  oval.innerHTML = `<svg viewBox="0 0 90 118" focusable="false"><g transform="translate(0,6)">${CAMEO_PATHS}</g></svg>`;
  return oval;
}
