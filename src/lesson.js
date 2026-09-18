// Lesson access. Every quote, line and prompt in the app comes through here, so a
// missing ID is a loud error instead of a blank in the interface.

let lesson = null;

const DEFAULT_URL = "/public/lesson.open-window.json";

/** Fetch the authored lesson and keep it as module state. */
export async function loadLesson(url = DEFAULT_URL) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`lesson fetch failed: ${response.status}`);
  }
  lesson = await response.json();
  return lesson;
}

/** Install a lesson object directly. Tests use this instead of fetching. */
export function setLesson(object) {
  lesson = object;
  return lesson;
}

function loaded() {
  if (!lesson) {
    throw new Error("lesson not loaded");
  }
  return lesson;
}

export function quote(id) {
  const strings = loaded().strings ?? {};
  if (!Object.hasOwn(strings, id)) {
    throw new Error(`missing string: ${id}`);
  }
  return strings[id];
}

export function line(n) {
  const lines = loaded().lines ?? [];
  if (!Number.isInteger(n) || n < 1 || n > lines.length) {
    throw new Error(`line out of range: ${n}`);
  }
  return lines[n - 1];
}

/** An excerpt by its id, or by 1-based position in reading order. */
export function excerpt(idOrIndex) {
  const excerpts = loaded().excerpts ?? [];
  const found =
    typeof idOrIndex === "number"
      ? excerpts[idOrIndex - 1]
      : excerpts.find((candidate) => candidate.id === idOrIndex);
  if (!found) {
    throw new Error(`unknown excerpt: ${idOrIndex}`);
  }
  return found;
}

export function excerptLines(id) {
  const [first, last] = excerpt(id).lines;
  const paragraphStarts = new Set(loaded().paragraphStarts ?? []);
  const out = [];
  for (let n = first; n <= last; n += 1) {
    out.push({ n, text: line(n), startsParagraph: paragraphStarts.has(n) });
  }
  return out;
}

/** The coach block: {deterministic: {skill: stringId}, generic: stringId}. */
export function coach() {
  return loaded().coach ?? {};
}

export function challenge(id) {
  const found = loaded().challenges?.[id];
  if (!found) {
    throw new Error(`unknown challenge: ${id}`);
  }
  return found;
}

/** Whitespace-separated token count across an excerpt, for words-per-minute. */
export function wordsIn(excerptId) {
  const [first, last] = excerpt(excerptId).lines;
  let words = 0;
  for (let n = first; n <= last; n += 1) {
    words += countWords(line(n));
  }
  return words;
}

function countWords(text) {
  return (String(text).match(/\S+/g) ?? []).length;
}
