#!/usr/bin/env python3
"""Generate the starter lesson JSON from the canonical source lines."""

import json
import sys

sys.path.insert(0, "scripts")
import source  # noqa: E402


ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"]


def paragraph_spans():
    starts = [n for n, _, starts in source.LINES if starts]
    spans = []
    for i, start in enumerate(starts):
        end = starts[i + 1] - 1 if i + 1 < len(starts) else source.TOTAL
        words = sum(len(source.BY_NO[n].split()) for n in range(start, end + 1))
        spans.append({"start": start, "end": end, "words": words})
    return spans


def split_paragraphs(count=10):
    paras = paragraph_spans()
    n = len(paras)
    prefix = [0]
    for para in paras:
        prefix.append(prefix[-1] + para["words"])

    def group_words(i, j):
        return prefix[j] - prefix[i]

    dp = {}
    parent = {}
    for i in range(1, n + 1):
        dp[(1, i)] = group_words(0, i)

    for groups in range(2, count + 1):
        for i in range(groups, n + 1):
            best = None
            best_cut = None
            for cut in range(groups - 1, i):
                cost = max(dp[(groups - 1, cut)], group_words(cut, i))
                if best is None or cost < best:
                    best = cost
                    best_cut = cut
            dp[(groups, i)] = best
            parent[(groups, i)] = best_cut

    cuts = []
    groups, i = count, n
    while groups > 1:
        cut = parent[(groups, i)]
        cuts.append(cut)
        groups -= 1
        i = cut
    cuts = list(reversed(cuts)) + [n]

    excerpts = []
    start_index = 0
    for idx, cut in enumerate(cuts):
        start = paras[start_index]["start"]
        end = paras[cut - 1]["end"]
        excerpts.append(
            {
                "id": "ex%s" % (idx + 1),
                "roman": ROMAN[idx],
                "lines": [start, end],
                "vocabulary": [],
                "challenges": [],
            }
        )
        start_index = cut
    return excerpts


def build_skeleton():
    return {
        "schema": 1,
        "id": "open-window",
        "title": "The Open Window",
        "author": "Saki (H. H. Munro)",
        "source": {"gutenberg": 269, "url": "https://www.gutenberg.org/ebooks/269"},
        "difficulty": "first",
        "lines": [text for _, text, _ in source.LINES],
        "paragraphStarts": [n for n, _, starts in source.LINES if starts],
        "excerpts": split_paragraphs(10),
        "vocabulary": {},
        "people": {},
        "objects": {},
        "challenges": {},
        "finale": {"reconstruct": {}, "statement": {}},
        "strings": {},
        "coach": {},
    }


def main():
    print(json.dumps(build_skeleton(), ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
