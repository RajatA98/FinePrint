// The frame every screen shares: element helpers, the Start over control, and the
// heading block. Screens build DOM through here so the markup stays consistent.

import { UI } from "../ui-strings.js";

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
      Object.assign(node.dataset, value);
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

/**
 * Clear the root, draw the chrome, return the section a screen fills.
 * The Start over control is on every screen: there is always a way back.
 */
export function screenShell(root, ctx, { heading, label } = {}) {
  root.replaceChildren();
  const header = el("header", { class: "chrome" }, [
    el("p", { class: "chrome-label", text: label ?? ctx.state.route.screen }),
    button(
      UI.startOver,
      () => {
        ctx.dispatch({ type: "START_OVER" });
        ctx.navigate({ screen: "study", excerpt: 1 });
      },
      { class: "start-over" }
    )
  ]);
  const section = el("section", { class: "screen" });
  if (heading !== undefined && heading !== null) {
    section.append(el("h1", { class: "screen-heading", text: heading }));
  }
  root.append(header, section);
  return section;
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
