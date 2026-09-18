// Boot: load the lesson, make the store, wire the hash, and draw whichever screen
// the route names. Nothing else lives here.

import { loadLesson } from "./lesson.js";
import { createReducer } from "./state/reducer.js";
import { createStore } from "./state/store.js";
import { startRouter, navigate } from "./router.js";
import { el, button } from "./screens/chrome.js";
import { UI } from "./ui-strings.js";

import * as study from "./screens/study.js";
import * as vocabulary from "./screens/vocabulary.js";
import * as read from "./screens/read.js";
import * as lock from "./screens/lock.js";
import * as search from "./screens/search.js";
import * as cite from "./screens/cite.js";
import * as reconstruct from "./screens/reconstruct.js";
import * as statement from "./screens/statement.js";
import * as report from "./screens/report.js";

const LESSON_URL = "/public/lesson.open-window.json";
const PLACEHOLDER_URL = "/test/fixtures/lesson.mini.json";
const STORAGE_KEY = "fineprint.session.v1";

const SCREENS = {
  study,
  vocabulary,
  read,
  lock,
  search,
  cite,
  reconstruct,
  statement,
  report
};

/** The harness fixture is a workbench convenience; it never ships to a reader. */
function onTheWorkbench() {
  const host = globalThis.location?.hostname ?? "";
  return host === "localhost" || host === "127.0.0.1";
}

async function lessonForThisRun() {
  try {
    return await loadLesson(LESSON_URL);
  } catch (error) {
    if (!onTheWorkbench()) {
      throw error; // in the world, a missing case file is a failure, not a fixture
    }
    // No authored lesson yet: run the harness fixture and say so on screen.
    const placeholder = await loadLesson(PLACEHOLDER_URL);
    document.body.dataset.placeholder = "1";
    return placeholder;
  }
}

/**
 * Reading `localStorage` is itself allowed to throw when a browser has site data
 * blocked. The store already runs with no storage at all, so the answer to a
 * throw is simply nothing: the case is played, it is just not remembered.
 */
function safeStorage() {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

async function boot() {
  const lesson = await lessonForThisRun();
  const store = createStore(createReducer(lesson), {
    key: STORAGE_KEY,
    storage: safeStorage()
  });
  const app = document.getElementById("app");

  let drawing = false;
  function draw() {
    if (drawing) {
      return; // a screen dispatched while rendering; the outer pass finishes the job
    }
    drawing = true;
    try {
      const state = store.getState();
      const screen = SCREENS[state.route.screen] ?? SCREENS.study;
      screen.render(app, {
        state,
        lesson,
        dispatch: store.dispatch,
        navigate: (route) => navigate(store, route)
      });
    } finally {
      drawing = false;
    }
  }

  store.subscribe(draw);
  startRouter({ store, onRoute: draw });
}

/**
 * If the boot itself fails there is no store, no router and no screen to say so:
 * the reader would be left looking at an empty page. This is the one card drawn
 * without any of that — an authored line and a way to ask again.
 */
function renderFailure() {
  const app = document.getElementById("app");
  if (!app) {
    return;
  }
  app.replaceChildren(
    el("section", { class: "screen screen--failure" }, [
      el("h1", { class: "screen-heading", text: UI.bootFailedTitle }),
      el("p", { class: "screen-note", text: UI.bootFailedNote }),
      button(UI.tryAgain, () => globalThis.location.reload(), { class: "try-again" })
    ])
  );
}

boot().catch(renderFailure);
