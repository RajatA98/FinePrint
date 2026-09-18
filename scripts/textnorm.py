#!/usr/bin/env python3
"""Shared text normalisation for lesson validation and source scanning.

Behaviour: lowercase, straighten curly quotes and apostrophes, turn an em
dash into "---", and collapse whitespace runs to a single space. Both
scripts/validate_lesson.py and scripts/scan_sources.py must use this same
function so a phrase that matches under one matches under the other.
"""

import pathlib
import re
import sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
import source  # noqa: E402


def normalize(text):
    return re.sub(r"\s+", " ", source._plain(str(text))).strip()
