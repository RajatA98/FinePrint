// Boot: load the lesson, make the store, wire the hash, and draw whichever screen
// the route names. Nothing else lives here.

import { loadLesson } from "./lesson.js";
import { createReducer } from "./state/reducer.js";
import { createStore } from "./state/store.js";
import { startRouter, navigate } from "./router.js";

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

async function lessonForThisRun() {
  try {
    return await loadLesson(LESSON_URL);
  } catch {
    // No authored lesson yet: run the harness fixture and say so on screen.
    const placeholder = await loadLesson(PLACEHOLDER_URL);
    document.body.dataset.placeholder = "1";
    return placeholder;
  }
}

async function boot() {
  const lesson = await lessonForThisRun();
  const store = createStore(createReducer(lesson), {
    key: STORAGE_KEY,
    storage: globalThis.localStorage
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

boot();
