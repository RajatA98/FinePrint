#!/usr/bin/env python3
"""Validate a Fine Print lesson JSON file."""

import json
import re
import sys

sys.path.insert(0, "scripts")
import source  # noqa: E402
from textnorm import normalize  # noqa: E402


SKILLS = {"vocabulary", "detail", "inference", "evidence"}
LOCK_STAGES = {"apply", "define"}
COACH_KEYS = {"vocabulary", "detail", "inference", "evidence", "clean"}
STRING_REF_KEYS = {
    "gloss",
    "role",
    "label",
    "prompt",
    "template",
    "generic",
}
CHOICE_KINDS = {"dial", "object", "portrait", "line"}
REQUIRED_STRINGS = {
    "s-verdict-master",
    "s-verdict-closed",
    "s-verdict-review",
    "s-verdict-reopened",
    "s-attribution",
}
FORBIDDEN_WORDS = re.compile(r"\b(fail|failed|wrong)\b", re.IGNORECASE)


def fail(rule, detail):
    return "%s: %s" % (rule, detail)


def windows(text, size):
    return {text[i : i + size] for i in range(0, max(0, len(text) - size + 1))}


def line_count(lesson):
    return len(lesson.get("lines", []))


def excerpt_count(lesson):
    return len(lesson.get("excerpts", []))


def challenge_count(lesson):
    return len(lesson.get("challenges", {}))


def index_excerpts(lesson):
    owners = {}
    for excerpt in lesson.get("excerpts", []):
        for cid in excerpt.get("challenges", []):
            owners.setdefault(cid, []).append(excerpt)
    return owners


def excerpt_for_line(lesson, line):
    for excerpt in lesson.get("excerpts", []):
        lines = excerpt.get("lines", [None, None])
        if not isinstance(lines, list) or len(lines) != 2:
            continue
        start, end = lines
        if isinstance(line, int) and isinstance(start, int) and isinstance(end, int) and start <= line <= end:
            return excerpt
    return None


def line_inside(excerpt, line):
    if not excerpt or not isinstance(line, int):
        return False
    start, end = excerpt.get("lines", [None, None])
    return isinstance(start, int) and isinstance(end, int) and start <= line <= end


def choice_ids(challenge):
    return [choice.get("id") for choice in challenge.get("choices", [])]


def check_schema(lesson):
    failures = []
    if lesson.get("schema") != 1:
        failures.append(fail("schema", "schema must equal 1"))
    if lesson.get("difficulty") not in {"first", "longer", "difficult"}:
        failures.append(fail("schema", "difficulty must be first, longer, or difficult"))
    return failures


def check_lines(lesson):
    expected = [text for _, text, _ in source.LINES]
    if lesson.get("lines") != expected:
        return [fail("lines", "lesson lines must exactly match scripts/source.py")]
    expected_starts = [n for n, _, starts in source.LINES if starts]
    if lesson.get("paragraphStarts") != expected_starts:
        return [fail("lines", "paragraphStarts must match source paragraph starts")]
    return []


def check_excerpts(lesson):
    failures = []
    excerpts = lesson.get("excerpts", [])
    starts = set(lesson.get("paragraphStarts", []))
    expected_next = 1
    seen = set()
    for excerpt in excerpts:
        eid = excerpt.get("id")
        if eid in seen:
            failures.append(fail("excerpts", "duplicate excerpt id %r" % eid))
        seen.add(eid)
        lines = excerpt.get("lines")
        if not isinstance(lines, list) or len(lines) != 2:
            failures.append(fail("excerpts", "%r lines must be [start, end]" % eid))
            continue
        start, end = lines
        if start != expected_next:
            failures.append(fail("excerpts", "%r must start at line %s" % (eid, expected_next)))
        if not isinstance(start, int) or not isinstance(end, int) or start > end:
            failures.append(fail("excerpts", "%r has invalid line range" % eid))
            continue
        if start not in starts:
            failures.append(fail("excerpts", "%r must start on a paragraph boundary" % eid))
        if end != source.TOTAL and end + 1 not in starts:
            failures.append(fail("excerpts", "%r must end on a paragraph boundary" % eid))
        expected_next = end + 1
    if expected_next != source.TOTAL + 1:
        failures.append(fail("excerpts", "excerpts must cover 1..%s" % source.TOTAL))
    return failures


def check_references(lesson):
    failures = []
    strings = lesson.get("strings", {})
    vocabulary = lesson.get("vocabulary", {})
    people = lesson.get("people", {})
    objects = lesson.get("objects", {})
    challenges = lesson.get("challenges", {})

    for excerpt in lesson.get("excerpts", []):
        for vid in excerpt.get("vocabulary", []):
            if vid not in vocabulary:
                failures.append(fail("refs", "excerpt %s vocabulary %s is missing" % (excerpt.get("id"), vid)))
        for cid in excerpt.get("challenges", []):
            if cid not in challenges:
                failures.append(fail("refs", "excerpt %s challenge %s is missing" % (excerpt.get("id"), cid)))

    for oid, obj in objects.items():
        if obj.get("carriedBy") and obj.get("carriedBy") not in people:
            failures.append(fail("refs", "object %s carriedBy is missing" % oid))

    def walk(value, path="root"):
        if isinstance(value, dict):
            for key, child in value.items():
                child_path = "%s.%s" % (path, key)
                if key in STRING_REF_KEYS and child not in strings:
                    failures.append(fail("strings", "%s references missing string %s" % (child_path, child)))
                if key == "margin" and isinstance(child, dict):
                    for margin_key, sid in child.items():
                        if sid not in strings:
                            failures.append(fail("strings", "%s.%s references missing string %s" % (child_path, margin_key, sid)))
                walk(child, child_path)
        elif isinstance(value, list):
            for i, child in enumerate(value):
                walk(child, "%s[%s]" % (path, i))

    walk(lesson)

    coach = lesson.get("coach", {}).get("deterministic", {})
    if set(coach) != COACH_KEYS:
        failures.append(fail("coach", "deterministic must have keys %s" % sorted(COACH_KEYS)))
    for key, sid in coach.items():
        if sid not in strings:
            failures.append(fail("coach", "deterministic.%s references missing string %s" % (key, sid)))
    generic = lesson.get("coach", {}).get("generic")
    if generic is not None and generic not in strings:
        failures.append(fail("coach", "generic references missing string %s" % generic))

    return failures


def check_line_scope(lesson):
    failures = []
    owners = index_excerpts(lesson)
    challenges = lesson.get("challenges", {})
    vocabulary = lesson.get("vocabulary", {})

    for excerpt in lesson.get("excerpts", []):
        for vid in excerpt.get("vocabulary", []):
            item = vocabulary.get(vid, {})
            if not line_inside(excerpt, item.get("line")):
                failures.append(fail("line-scope", "vocabulary %s line must be inside %s" % (vid, excerpt.get("id"))))

    for cid, challenge in challenges.items():
        owner_list = owners.get(cid, [])
        owner = owner_list[0] if owner_list else None
        if not line_inside(owner, challenge.get("evidence")):
            failures.append(fail("line-scope", "challenge %s evidence must be inside its excerpt" % cid))
        if challenge.get("type") == "cite":
            for choice in challenge.get("choices", []):
                if not line_inside(owner, choice.get("line")):
                    failures.append(fail("line-scope", "cite choice %s must be inside its excerpt" % choice.get("id")))

    for clue in lesson.get("finale", {}).get("reconstruct", {}).get("clues", []):
        if excerpt_for_line(lesson, clue.get("line")) is None:
            failures.append(fail("line-scope", "finale clue %s line must resolve" % clue.get("id")))
    return failures


def check_challenges(lesson):
    failures = []
    challenges = lesson.get("challenges", {})
    owners = index_excerpts(lesson)
    vocabulary = lesson.get("vocabulary", {})
    people = lesson.get("people", {})
    objects = lesson.get("objects", {})

    for cid in challenges:
        if len(owners.get(cid, [])) != 1:
            failures.append(fail("challenge-listing", "challenge %s must be listed in exactly one excerpt" % cid))

    for cid, challenge in challenges.items():
        answers = challenge.get("answer", [])
        ids = choice_ids(challenge)
        if challenge.get("skill") not in SKILLS:
            failures.append(
                fail("challenges", "challenge %s skill must be one of %s" % (cid, sorted(SKILLS)))
            )
        # Scored is the report's denominator: an item either counts, or says so
        # by leaving the key out. Anything else (false, "true", 1) is a typo.
        if "scored" in challenge and challenge["scored"] is not True:
            failures.append(fail("challenges", "challenge %s scored must be true when present" % cid))
        if not answers:
            failures.append(fail("answers", "challenge %s answer must be non-empty" % cid))
        for answer in answers:
            if answer not in ids:
                failures.append(fail("answers", "challenge %s answer %s is not a choice" % (cid, answer)))
        if challenge.get("type") == "search" and challenge.get("targets") != len(answers):
            failures.append(fail("answers", "search %s targets must equal answer count" % cid))
        if challenge.get("type") == "lock":
            if challenge.get("stage") not in LOCK_STAGES:
                failures.append(fail("lock", "lock %s stage must be apply or define" % cid))
            if challenge.get("vocabulary") not in vocabulary:
                failures.append(fail("lock", "lock %s vocabulary ref is missing" % cid))
        if challenge.get("type") == "cite":
            owner = owners.get(cid, [None])[0]
            proves = challenge.get("proves")
            if proves not in challenges:
                failures.append(fail("cite", "cite %s proves missing challenge %s" % (cid, proves)))
            elif owner not in owners.get(proves, []):
                failures.append(fail("cite", "cite %s proves challenge outside its excerpt" % cid))

        for choice in challenge.get("choices", []):
            kind = choice.get("kind")
            if kind not in CHOICE_KINDS:
                failures.append(fail("challenges", "choice %s has unknown kind %s" % (choice.get("id"), kind)))
            elif kind == "object" and choice.get("ref") not in objects:
                failures.append(fail("challenges", "choice %s object ref is missing" % choice.get("id")))
            elif kind == "portrait" and choice.get("ref") not in people:
                failures.append(fail("challenges", "choice %s portrait ref is missing" % choice.get("id")))
            elif kind == "line" and excerpt_for_line(lesson, choice.get("line")) is None:
                failures.append(fail("refs", "choice %s line ref is missing" % choice.get("id")))
            # dial's label is checked generically in check_references' walk
            # (its "label" key), so it isn't duplicated here (see item 3).
    return failures


def check_finale(lesson):
    failures = []
    finale = lesson.get("finale", {})
    reconstruct = finale.get("reconstruct", {})
    people = lesson.get("people", {})
    vocabulary = lesson.get("vocabulary", {})
    strings = lesson.get("strings", {})

    clues = reconstruct.get("clues", [])
    if len(clues) != 7:
        failures.append(fail("finale", "reconstruct must have seven clues"))
    if sum(1 for clue in clues if clue.get("proving") is True) != 4:
        failures.append(fail("finale", "reconstruct must have exactly four proving clues"))
    if reconstruct.get("required") != 4:
        failures.append(fail("finale", "reconstruct.required must be 4"))

    for item in reconstruct.get("people", []):
        answer = item.get("answer")
        if answer not in item.get("options", []) or answer not in people:
            failures.append(fail("finale", "person answer %s must be an option and a person" % answer))
        cameo = item.get("cameo")
        if cameo not in people:
            failures.append(fail("finale", "reconstruct person cameo %s must be a person" % cameo))
    culprit = reconstruct.get("culprit", {})
    answer = culprit.get("answer")
    if answer not in culprit.get("options", []) or answer not in people:
        failures.append(fail("finale", "culprit answer %s must be an option and a person" % answer))

    for clue in clues:
        speaker = clue.get("speaker")
        if speaker is not None and speaker != "narration" and speaker not in people:
            failures.append(fail("finale", "clue %s speaker must be narration or a person" % clue.get("id")))

    statement = finale.get("statement", {})
    template_id = statement.get("template")
    template = strings.get(template_id, "")
    for slot in statement.get("slots", []):
        sid = slot.get("id")
        if template.count("{%s}" % sid) != 1:
            failures.append(fail("statement", "template must reference slot %s exactly once" % sid))
        true_count = sum(1 for option in slot.get("options", []) if option.get("true") is True)
        if true_count != 1:
            failures.append(fail("statement", "slot %s must have exactly one true option" % sid))
        for option in slot.get("options", []):
            if option.get("vocabulary") not in vocabulary:
                failures.append(fail("refs", "statement slot %s vocabulary ref is missing" % sid))
    return failures


def check_required_strings(lesson):
    failures = []
    strings = lesson.get("strings", {})
    missing = REQUIRED_STRINGS - set(strings)
    for sid in sorted(missing):
        failures.append(fail("strings", "strings must include %s" % sid))
    for sid, text in strings.items():
        if FORBIDDEN_WORDS.search(str(text)):
            failures.append(fail("strings", "string %s must not contain fail/failed/wrong" % sid))
    return failures


def check_source_phrases(lesson):
    source_text = normalize(" ".join(text for _, text, _ in source.LINES))
    source_set = windows(source_text, 20)
    failures = []
    for sid, text in lesson.get("strings", {}).items():
        norm = normalize(text)
        for chunk in windows(norm, 20):
            if chunk in source_set:
                failures.append(fail("source-phrase", "string %s contains source text" % sid))
                break
    return failures


def validate(lesson):
    checks = [
        check_schema,
        check_lines,
        check_excerpts,
        check_references,
        check_line_scope,
        check_challenges,
        check_finale,
        check_required_strings,
        check_source_phrases,
    ]
    failures = []
    for check in checks:
        failures.extend(check(lesson))
    # The same underlying problem can be flagged by more than one check (a
    # generic walk plus a more specific per-item check); de-duplicate the
    # printed failures while preserving the order they were found in.
    seen = set()
    deduped = []
    for failure in failures:
        if failure not in seen:
            seen.add(failure)
            deduped.append(failure)
    return deduped


def load(path):
    with open(path, encoding="utf-8") as handle:
        return json.load(handle)


def main(argv=None):
    argv = argv or sys.argv[1:]
    if len(argv) != 1:
        print("usage: validate_lesson.py PATH", file=sys.stderr)
        return 2
    lesson = load(argv[0])
    failures = validate(lesson)
    if failures:
        for failure in failures:
            print("FAIL: %s" % failure)
        return 1
    print(
        "OK: %s lines, %s excerpts, %s challenges"
        % (line_count(lesson), excerpt_count(lesson), challenge_count(lesson))
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
