#!/usr/bin/env python3
"""Scan app sources for copied story phrases."""

import pathlib
import sys

sys.path.insert(0, "scripts")
import source  # noqa: E402
from textnorm import normalize  # noqa: E402


DEFAULT_ROOTS = ["index.html", "src", "api", "styles", "test"]
WINDOW = 13


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


def _normalize_with_line_map(original):
    """Normalize text and return (normalized, line_for_offset), where
    line_for_offset[i] is the 1-based line of `original` that produced the
    character at normalized[i]. Built line-by-line so a match that straddles
    a line break can still be attributed to the line it STARTS on."""
    parts = []
    line_map = []
    for line_no, line in enumerate(original.splitlines(), 1):
        chunk = normalize(line)
        if not chunk:
            continue
        if parts:
            parts.append(" ")
            line_map.append(line_no)
        parts.append(chunk)
        line_map.extend([line_no] * len(chunk))
    return "".join(parts), line_map


def first_line_for_match(original, match):
    normalized, line_map = _normalize_with_line_map(original)
    index = normalized.find(match)
    if index < 0 or index >= len(line_map):
        return 1
    return line_map[index]


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
