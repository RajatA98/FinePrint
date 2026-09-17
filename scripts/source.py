# The single source of truth for text and line numbers.
#
# Product law: every word the reader reads is verbatim Saki, excerpts are
# contiguous slices, and one numbering runs across the whole story so a line
# number means the same thing on every frame. Nothing here is authored - it is
# the Gutenberg text, wrapped and numbered.

import pathlib, re

SRC = pathlib.Path(__file__).resolve().parent.parent / "factory/reference/the-open-window.txt"
MEASURE = 58  # characters per numbered line, as an SAT passage is set

_raw = SRC.read_text()
_body = _raw.split("\n", 1)[1]


def _curl(s):
    """Saki's straight quotes set as type, resolved over the whole text at once."""
    s = s.replace("---", "\u2014")
    out, open_q = [], True
    for ch in s:
        if ch == '"':
            out.append("\u201c" if open_q else "\u201d")
            open_q = not open_q
        else:
            out.append(ch)
    s = "".join(out)
    return re.sub(r"(?<=[A-Za-z])'(?=[A-Za-z])", "\u2019", s)


_body = _curl(_body)
_paras = [re.sub(r"\s+", " ", p).strip() for p in re.split(r"\n\s*\n", _body) if p.strip()]

LINES = []  # (number, text, starts_paragraph)
_n = 0
for _p in _paras:
    _cur, _first = "", True
    for _w in _p.split(" "):
        _trial = (_cur + " " + _w).strip()
        if len(_trial) > MEASURE and _cur:
            _n += 1
            LINES.append((_n, _cur, _first))
            _first, _cur = False, _w
        else:
            _cur = _trial
    if _cur:
        _n += 1
        LINES.append((_n, _cur, _first))

TOTAL = _n
BY_NO = {n: t for n, t, _ in LINES}


def typeset(s):
    """Saki's straight quotes and triple dashes, set as type. No words change."""
    s = s.replace("---", "—")
    out, open_q = [], True
    for ch in s:
        if ch == '"':
            out.append("“" if open_q else "”")
            open_q = not open_q
        else:
            out.append(ch)
    s = "".join(out)
    s = re.sub(r"(?<=[A-Za-z])'(?=[A-Za-z])", "’", s)
    return (s.replace("&", "&amp;")
             .replace("“", "&ldquo;").replace("”", "&rdquo;")
             .replace("’", "&rsquo;").replace("—", "&mdash;"))


def _plain(s):
    return (s.replace("\u201c", '"').replace("\u201d", '"')
             .replace("\u2019", "'").replace("\u2014", "---").lower())


def span(a, b, stop_after=None):
    """A contiguous excerpt: [(number, typeset text, starts_paragraph), ...]

    stop_after trims the final line at the end of that phrase, so an excerpt can
    close on a sentence even though the wrap does not fall there. SAT passages
    end on a partial line the same way.
    """
    rows = [(n, t, p) for n, t, p in LINES if a <= n <= b]
    if stop_after and rows:
        n, t, p = rows[-1]
        i = t.lower().find(stop_after.lower())
        if i >= 0:
            rows[-1] = (n, t[:i + len(stop_after)], p)
    return [(n, typeset(t), p) for n, t, p in rows]


# a char-offset map over the joined story, so a phrase that straddles a line
# break still resolves to the line it STARTS on. Matching on a leading word was
# a real defect: it attached a citation to the wrong line.
_JOINED = ""
_OFFSETS = []          # (start_char, end_char, line_number)
for _n, _t, _p in LINES:
    _start = len(_JOINED)
    _JOINED += _t + " "
    _OFFSETS.append((_start, len(_JOINED), _n))
_PLAIN_JOINED = (_JOINED.replace("\u201c", '"').replace("\u201d", '"')
                        .replace("\u2019", "'").replace("\u2014", "---").lower())


def find(phrase):
    """The number of the line this phrase STARTS on. Raises if not in the source."""
    i = _PLAIN_JOINED.find(_plain(phrase))
    if i < 0:
        raise KeyError(f"not in source: {phrase!r}")
    for start, end, n in _OFFSETS:
        if start <= i < end:
            return n
    raise KeyError(f"not in source: {phrase!r}")


def spans_lines(phrase):
    """Every line number this phrase touches."""
    p = _plain(phrase)
    i = _PLAIN_JOINED.find(p)
    if i < 0:
        raise KeyError(f"not in source: {phrase!r}")
    j = i + len(p)
    return [n for start, end, n in _OFFSETS if start < j and end > i]


def quote(phrase, elide=False):
    """A quotation, verified present in the source before it is ever shown."""
    joined = _plain(" ".join(t for _, t, _ in LINES))
    if _plain(phrase) not in joined:
        raise KeyError(f"not in source: {phrase!r}")
    lead = "&hellip;" if elide else ""
    return f"&ldquo;{lead}{typeset(phrase)}&rdquo;"


# --- provenance -----------------------------------------------------------
# A lesson is cut into ten excerpts. Which excerpt a line belongs to is derived
# from its position in the story, never hand-assigned - the same reason line
# numbers are derived. Two excerpts are shown in these comps, and each is an
# explicit contiguous span that closes on a sentence, the way an author cuts one.
N_EXCERPTS = 10
_ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"]


def excerpt_of(line):
    """1-based excerpt number for a line."""
    i = int((line - 1) * N_EXCERPTS / TOTAL) + 1
    return min(i, N_EXCERPTS)


def excerpt_roman(line):
    return _ROMAN[excerpt_of(line) - 1]


def excerpt_of_phrase(phrase):
    return excerpt_of(find(phrase))


def roman_of_phrase(phrase):
    return excerpt_roman(find(phrase))


# The read excerpt: closes on her own sentence, and carries the lock's word,
# the vocabulary, and the line the reader is asked to cite.
READ_A = find("Out through that window")
READ_B = find("part of it")
READ_STOP = "part of it.\u201d"
READ_NO = excerpt_of(READ_A)

# The re-read excerpt: closes on a sentence, and carries all three of her tells.
TELL_A = find("Do you know many of the people round here")
TELL_B = find("the self-possessed young lady")
TELL_NO = excerpt_of(TELL_A)

if __name__ == "__main__":
    print(f"{TOTAL} lines, {N_EXCERPTS} excerpts")
    print(f"read excerpt {_ROMAN[READ_NO-1]}: lines {READ_A}-{READ_B}")
    for n, x, p in span(READ_A, READ_B, READ_STOP):
        print(f"  {n:>3} {x}")
    print(f"re-read excerpt {_ROMAN[TELL_NO-1]}: lines {TELL_A}-{TELL_B}")
    for n, x, p in span(TELL_A, TELL_B):
        print(f"  {n:>3} {x}")
    print()
    for ph in ("self-possessed young lady of fifteen", "treacherous piece of bog",
               "engulfed", "Their bodies were never recovered", "widespread delusion",
               "endeavoured", "imminent", "infirmities", "discounting",
               "chanted out of the dusk", "when she judged",
               "Then you know practically nothing about my aunt",
               "Romance at short notice"):
        n = find(ph)
        print(f"  line {n:>3}  excerpt {excerpt_roman(n):<5} {ph}")
