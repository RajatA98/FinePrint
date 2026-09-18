import pathlib
import sys
import tempfile
import unittest

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))

import lesson_skeleton
import scan_sources
import source
import validate_lesson


def valid_lesson():
    lesson = lesson_skeleton.build_skeleton()
    ex1 = lesson["excerpts"][0]
    ex2 = lesson["excerpts"][1]

    vocab_id = "v-self-possessed"
    lesson["vocabulary"] = {
        vocab_id: {"word": "self-possessed", "line": 2, "gloss": "s-gloss"}
    }
    lesson["people"] = {
        "vera": {"name": "Vera", "role": "s-role-vera", "cameo": "vera"},
        "framton": {"name": "Framton Nuttel", "role": "s-role-framton", "cameo": "framton"},
        "aunt": {"name": "Mrs. Sappleton", "role": "s-role-aunt", "cameo": "aunt"},
    }
    lesson["objects"] = {
        "o-window": {"label": "s-obj-window", "carriedBy": "aunt"},
        "o-coat": {"label": "s-obj-coat", "carriedBy": "framton"},
    }

    lock_id = "c1-lock"
    search_id = "c1-search"
    cite_id = "c1-cite"
    line_in_ex1 = ex1["lines"][0]
    line_in_ex2 = ex2["lines"][0]
    lesson["challenges"] = {
        lock_id: {
            "type": "lock",
            "stage": "apply",
            "skill": "vocabulary",
            "scored": True,
            "vocabulary": vocab_id,
            "prompt": "s-lock-prompt",
            "choices": [
                {"id": "a", "kind": "dial", "label": "s-lock-a"},
                {"id": "b", "kind": "dial", "label": "s-lock-b"},
            ],
            "answer": ["a"],
            "evidence": line_in_ex1,
            "margin": {"b": "s-lock-margin-b"},
        },
        search_id: {
            "type": "search",
            "skill": "detail",
            "scored": True,
            "prompt": "s-search-prompt",
            "targets": 1,
            "choices": [
                {"id": "o-window", "kind": "object", "ref": "o-window"},
                {"id": "o-coat", "kind": "object", "ref": "o-coat"},
            ],
            "answer": ["o-window"],
            "evidence": line_in_ex1,
        },
        cite_id: {
            "type": "cite",
            "skill": "evidence",
            "scored": True,
            "prompt": "s-cite-prompt",
            "proves": search_id,
            "choices": [
                {"id": "L%s" % line_in_ex1, "kind": "line", "line": line_in_ex1},
                {"id": "L%s" % line_in_ex2, "kind": "line", "line": line_in_ex1},
            ],
            "answer": ["L%s" % line_in_ex1],
            "evidence": line_in_ex1,
        },
    }
    ex1["vocabulary"] = [vocab_id]
    ex1["challenges"] = [lock_id, search_id, cite_id]

    clue_lines = [ex["lines"][0] for ex in lesson["excerpts"][:7]]
    lesson["finale"] = {
        "reconstruct": {
            "people": [
                {
                    "cameo": "vera",
                    "prompt": "s-recon-person",
                    "options": ["vera", "framton", "aunt"],
                    "answer": "vera",
                }
            ],
            "clues": [
                {"id": "k%s" % (i + 1), "line": line, "proving": i < 4}
                for i, line in enumerate(clue_lines)
            ],
            "required": 4,
            "culprit": {
                "prompt": "s-recon-culprit",
                "options": ["vera", "framton", "aunt"],
                "answer": "vera",
            },
        },
        "statement": {
            "template": "s-statement-template",
            "slots": [
                {
                    "id": "slot1",
                    "options": [
                        {"vocabulary": vocab_id, "true": True},
                        {"vocabulary": vocab_id, "true": False},
                    ],
                }
            ],
        },
    }
    lesson["strings"] = {
        "s-gloss": "calm and controlled",
        "s-role-vera": "young host",
        "s-role-framton": "visitor",
        "s-role-aunt": "aunt",
        "s-obj-window": "open window",
        "s-obj-coat": "white coat",
        "s-lock-prompt": "Choose the meaning that fits the moment.",
        "s-lock-a": "calm",
        "s-lock-b": "careless",
        "s-lock-margin-b": "That choice misses the social pressure.",
        "s-search-prompt": "Pick the remembered object.",
        "s-cite-prompt": "Choose the line that proves it.",
        "s-recon-person": "Who shapes the scene?",
        "s-recon-culprit": "Who made the deception work?",
        "s-statement-template": "Vera stays {slot1}.",
        "s-coach-vocab": "Review words in context.",
        "s-coach-detail": "Track concrete details.",
        "s-coach-inference": "Turn clues into claims.",
        "s-coach-evidence": "Tie answers to proof.",
        "s-coach-clean": "Clean casework.",
        "s-coach-generic": "Keep reading closely.",
        "s-verdict-master": "Master Detective",
        "s-verdict-closed": "Case Closed",
        "s-verdict-review": "Case Solved - Evidence Review",
        "s-verdict-reopened": "Case Reopened",
        "s-attribution": "Story text: The Open Window by Saki, Project Gutenberg ebook #269.",
    }
    lesson["coach"] = {
        "deterministic": {
            "vocabulary": "s-coach-vocab",
            "detail": "s-coach-detail",
            "inference": "s-coach-inference",
            "evidence": "s-coach-evidence",
            "clean": "s-coach-clean",
        },
        "generic": "s-coach-generic",
    }
    return lesson


def rule_names(lesson):
    return [failure.split(":", 1)[0] for failure in validate_lesson.validate(lesson)]


class ValidateLessonTests(unittest.TestCase):
    def test_valid_lesson_passes(self):
        self.assertEqual([], validate_lesson.validate(valid_lesson()))

    def test_changed_line_fails_lines_rule(self):
        lesson = valid_lesson()
        lesson["lines"][0] = lesson["lines"][0].replace("aunt", "uncle", 1)
        self.assertIn("lines", rule_names(lesson))

    def test_excerpt_end_must_be_paragraph_boundary(self):
        lesson = valid_lesson()
        lesson["excerpts"][0]["lines"][1] -= 1
        lesson["excerpts"][1]["lines"][0] -= 1
        self.assertIn("excerpts", rule_names(lesson))

    def test_citation_evidence_must_be_inside_excerpt(self):
        lesson = valid_lesson()
        lesson["challenges"]["c1-cite"]["evidence"] = lesson["excerpts"][1]["lines"][0]
        self.assertIn("line-scope", rule_names(lesson))

    def test_story_phrase_in_string_fails_source_phrase(self):
        lesson = valid_lesson()
        lesson["strings"]["s-lock-prompt"] = "self-possessed young lady of fifteen"
        self.assertIn("source-phrase", rule_names(lesson))

    def test_missing_string_reference_fails_strings(self):
        lesson = valid_lesson()
        del lesson["strings"]["s-lock-prompt"]
        self.assertIn("strings", rule_names(lesson))

    def test_search_targets_must_match_answer_count(self):
        lesson = valid_lesson()
        lesson["challenges"]["c1-search"]["targets"] = 2
        self.assertIn("answers", rule_names(lesson))

    def test_finale_requires_seven_clues(self):
        lesson = valid_lesson()
        lesson["finale"]["reconstruct"]["clues"] = lesson["finale"]["reconstruct"]["clues"][:6]
        self.assertIn("finale", rule_names(lesson))

        lesson = valid_lesson()
        lesson["finale"]["reconstruct"]["clues"].append(
            {"id": "k8", "line": lesson["excerpts"][7]["lines"][0], "proving": False}
        )
        self.assertIn("finale", rule_names(lesson))

    def test_statement_slot_has_exactly_one_true_option(self):
        lesson = valid_lesson()
        lesson["finale"]["statement"]["slots"][0]["options"][1]["true"] = True
        self.assertIn("statement", rule_names(lesson))

    def test_dial_choice_missing_label_produces_one_failure(self):
        lesson = valid_lesson()
        del lesson["strings"]["s-lock-b"]
        failures = validate_lesson.validate(lesson)
        self.assertEqual(1, len(failures), failures)
        self.assertTrue(failures[0].startswith("strings:"), failures[0])

    def test_finale_clue_speaker_must_be_narration_or_person(self):
        lesson = valid_lesson()
        lesson["finale"]["reconstruct"]["clues"][0]["speaker"] = "narration"
        self.assertEqual([], validate_lesson.validate(lesson))

        lesson = valid_lesson()
        lesson["finale"]["reconstruct"]["clues"][0]["speaker"] = "vera"
        self.assertEqual([], validate_lesson.validate(lesson))

        lesson = valid_lesson()
        lesson["finale"]["reconstruct"]["clues"][0]["speaker"] = "nobody"
        self.assertIn("finale", rule_names(lesson))

    def test_finale_reconstruct_person_cameo_must_be_a_person(self):
        lesson = valid_lesson()
        lesson["finale"]["reconstruct"]["people"][0]["cameo"] = "not-a-person"
        self.assertIn("finale", rule_names(lesson))

    def test_strings_must_include_verdict_and_attribution_labels(self):
        for sid in (
            "s-verdict-master",
            "s-verdict-closed",
            "s-verdict-review",
            "s-verdict-reopened",
            "s-attribution",
        ):
            lesson = valid_lesson()
            del lesson["strings"][sid]
            self.assertIn("strings", rule_names(lesson), sid)

    def test_strings_may_not_contain_forbidden_words(self):
        for word in ("fail", "failed", "wrong"):
            lesson = valid_lesson()
            lesson["strings"]["s-verdict-master"] = "You %s this time" % word
            self.assertIn("strings", rule_names(lesson), word)

    def test_choice_kind_must_be_one_of_dial_object_portrait_line(self):
        lesson = valid_lesson()
        lesson["challenges"]["c1-search"]["choices"][0]["kind"] = "person"
        self.assertIn("challenges", rule_names(lesson))

    def test_portrait_choice_ref_must_be_a_person(self):
        lesson = valid_lesson()
        lesson["challenges"]["c1-search"]["choices"][0]["kind"] = "portrait"
        lesson["challenges"]["c1-search"]["choices"][0]["ref"] = "not-a-person"
        self.assertIn("challenges", rule_names(lesson))

        lesson = valid_lesson()
        lesson["challenges"]["c1-search"]["choices"][0]["kind"] = "portrait"
        lesson["challenges"]["c1-search"]["choices"][0]["ref"] = "vera"
        self.assertNotIn("challenges", rule_names(lesson))

    def test_object_choice_ref_must_be_an_object(self):
        lesson = valid_lesson()
        lesson["challenges"]["c1-search"]["choices"][0]["ref"] = "not-an-object"
        self.assertIn("challenges", rule_names(lesson))


class NormalizeTests(unittest.TestCase):
    def test_validate_lesson_and_scan_sources_normalize_match(self):
        sample = "  “Self-Possessed”—truly   said’s  "
        self.assertEqual(validate_lesson.normalize(sample), scan_sources.normalize(sample))


class SourceStraddleTests(unittest.TestCase):
    def straddling_phrase(self):
        tail = source.LINES[0][1][-15:]
        head = source.LINES[1][1][:15]
        return tail + " " + head

    def test_straddling_phrase_caught_by_check_source_phrases(self):
        phrase = self.straddling_phrase()
        self.assertGreaterEqual(len(phrase), 20)
        lesson = valid_lesson()
        lesson["strings"]["s-lock-prompt"] = phrase
        self.assertIn("source-phrase", rule_names(lesson))

    def test_straddling_phrase_caught_by_scan_paths(self):
        phrase = self.straddling_phrase()
        self.assertGreaterEqual(len(phrase), 13)
        tail, head = phrase.split(" ", 1)
        with tempfile.TemporaryDirectory() as tmp:
            root = pathlib.Path(tmp)
            js = root / "sample.js"
            # tail ends line 1, head starts line 2: the phrase straddles a
            # physical line break in the scanned file too, so the reported
            # line must be where the match STARTS (line 1), not where it ends.
            js.write_text("alpha beta %s\n%scontinued gamma\n" % (tail, head))
            failures = scan_sources.scan_paths([root])
            self.assertEqual(1, len(failures), failures)
            self.assertIn("sample.js:1", failures[0])


class ScanSourcesTests(unittest.TestCase):
    def test_scan_sources_fails_on_planted_story_phrase(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = pathlib.Path(tmp)
            js = root / "sample.js"
            js.write_text("const x = 'self-possessed young lady';\n")
            failures = scan_sources.scan_paths([root])
            self.assertEqual(1, len(failures))
            self.assertIn("sample.js:1", failures[0])

    def test_scan_sources_passes_without_story_phrase(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = pathlib.Path(tmp)
            js = root / "sample.js"
            js.write_text("const x = 'read carefully and cite your proof';\n")
            self.assertEqual([], scan_sources.scan_paths([root]))


if __name__ == "__main__":
    unittest.main()
