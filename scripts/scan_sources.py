#!/usr/bin/env python3
"""Scan app sources for copied story phrases."""

import pathlib
import re
import sys

sys.path.insert(0, "scripts")
import source  # noqa: E402


DEFAULT_ROOTS = ["index.html", "src", "api", "styles", "test"]
WINDOW = 13


def normalize(text):
    text = source._plain(text)
    text = text.replace("---", "-")
    return re.sub(r"\s+", " ", text).strip()


def windows(text, size):
    return {text[i : i + size] for i in range(0, max(0, len(text) - size + 1))}


def source_windows(size=WINDOW):
    joined = normalize(" ".join(text for _, text, _ in source.LINES))
    return windows(joined, size)


def iter_files(paths):
    for raw in paths:
        path = pathlib.Path(raw)
        if not path.exists():
            continue
        if path.is_file():
            yield path
            continue
        for child in sorted(path.rglob("*")):
            if not child.is_file():
                continue
            parts = child.parts
            if "test" in parts and "fixtures" in parts:
                continue
            yield child


def first_line_for_match(original, match):
    normalized_so_far = ""
    for line_no, line in enumerate(original.splitlines(), 1):
        normalized_so_far = normalize((normalized_so_far + " " + line).strip())
        if match in normalized_so_far:
            return line_no
    return 1


def display_match(original, match):
    norm = normalize(original)
    index = norm.find(match)
    if index < 0:
        return match
    return norm[index : index + max(WINDOW, min(60, len(match)))]


def scan_paths(paths):
    source_set = source_windows(WINDOW)
    failures = []
    for path in iter_files(paths):
        try:
            text = path.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            continue
        norm = normalize(text)
        found = None
        for i in range(0, max(0, len(norm) - WINDOW + 1)):
            chunk = norm[i : i + WINDOW]
            if chunk in source_set:
                found = chunk
                break
        if found:
            line = first_line_for_match(text, found)
            failures.append("%s:%s: %s" % (path, line, display_match(text, found)))
    return failures


def main(argv=None):
    argv = argv or sys.argv[1:]
    paths = argv if argv else DEFAULT_ROOTS
    failures = scan_paths(paths)
    if failures:
        for failure in failures:
            print("FAIL: %s" % failure)
        return 1
    count = sum(1 for _ in iter_files(paths))
    print("OK: scanned %s files" % count)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
