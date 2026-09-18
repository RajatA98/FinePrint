// The hash is the only place navigation lives: a route parses out of it, the body
// carries the screen id for CSS, and the reducer is told through NAVIGATE. Nothing
// here renders; main.js does that when the route or the state changes.

export const SCREENS = [
  "study",
  "vocabulary",
  "read",
  "lock",
  "search",
  "cite",
  "reconstruct",
  "statement",
  "report"
];

const EXCERPT_SCOPED = new Set(["vocabulary", "read", "lock", "search", "cite"]);

const STUDY = { screen: "study", excerpt: 1 };

export function hasExcerpt(screen) {
  return EXCERPT_SCOPED.has(screen);
}

/** parseHash("#/read/3") -> {screen: "read", excerpt: 3}. Anything unknown is the study. */
export function parseHash(hash) {
  const parts = String(hash ?? "")
    .replace(/^#/, "")
    .split("/")
    .filter((part) => part !== "");
  if (parts.length === 0 || parts.length > 2) {
    return { ...STUDY };
  }
  const screen = parts[0].toLowerCase();
  if (!SCREENS.includes(screen)) {
    return { ...STUDY };
  }
  if (!hasExcerpt(screen)) {
    return { screen, excerpt: 1 };
  }
  return { screen, excerpt: excerptNumber(parts[1]) };
}

export function buildHash(route) {
  const screen = SCREENS.includes(route?.screen) ? route.screen : "study";
  if (!hasExcerpt(screen)) {
    return `#/${screen}`;
  }
  return `#/${screen}/${excerptNumber(route?.excerpt)}`;
}

/**
 * Wire the hash to the store. On load an empty hash yields to the persisted route,
 * so a refresh of a fresh tab resumes the case; any other hash wins over it.
 */
export function startRouter({ store, onRoute, window: win = globalThis } = {}) {
  function apply(route) {
    store.dispatch({ type: "NAVIGATE", screen: route.screen, excerpt: route.excerpt });
    const body = win.document?.body;
    if (body) {
      body.dataset.screen = route.screen;
    }
    onRoute?.(route);
  }

  function fromHash() {
    const route = parseHash(win.location.hash);
    const canonical = buildHash(route);
    if (win.location.hash !== canonical) {
      // An unknown or half-written hash is rewritten to the route it resolved to.
      win.location.hash = canonical;
      return;
    }
    apply(route);
  }

  win.addEventListener("hashchange", fromHash);

  const hash = String(win.location.hash ?? "");
  const bare = hash === "" || hash === "#" || hash === "#/";
  const route = bare ? routeOf(store.getState()) : parseHash(hash);
  const target = buildHash(route);
  if (hash !== target) {
    win.location.hash = target; // fires hashchange, which applies the same route again
  }
  apply(route);

  return function stopRouter() {
    win.removeEventListener("hashchange", fromHash);
  };
}

/** Screens navigate through here; the hashchange listener does the dispatching. */
export function navigate(store, route, win = globalThis) {
  const target = buildHash(route);
  if (win.location.hash === target) {
    // Same hash, no hashchange: tell the store anyway so the screen re-renders.
    const parsed = parseHash(target);
    store.dispatch({ type: "NAVIGATE", screen: parsed.screen, excerpt: parsed.excerpt });
    return;
  }
  win.location.hash = target;
}

function routeOf(state) {
  const route = state?.route;
  return SCREENS.includes(route?.screen)
    ? { screen: route.screen, excerpt: excerptNumber(route.excerpt) }
    : { ...STUDY };
}

function excerptNumber(value) {
  const n = Number(value);
  return Number.isInteger(n) && n >= 1 ? n : 1;
}
