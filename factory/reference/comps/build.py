import json, os, pathlib, datetime
import frames_a as A
import frames_b as B
import frames_c as C

ROOT = pathlib.Path("/private/tmp/claude-501/-Users-rajatarora-Projects-FinePrint/"
                    "3b6d15e3-4d52-4cfa-8a2b-803bfe54fa35/scratchpad/fp2")
PROJ = ROOT / "project"
PROJ.mkdir(parents=True, exist_ok=True)

FRAMES = [
    ("Main.dc.html",        A.frame_study,       "1 · The study"),
    ("Open.dc.html",        A.frame_open,        "2 · The book opens"),
    ("Vocabulary.dc.html",  A.frame_vocab,       "3 · Three words first"),
    ("Read.dc.html",        A.frame_read,        "4 · The timed read"),
    ("Close.dc.html",       A.frame_close,       "5 · The book closes"),
    ("Lock.dc.html",        B.frame_lock,        "6 · The word lock"),
    ("Search.dc.html",      B.frame_search,      "7 · Search the room"),
    ("Cite.dc.html",        B.frame_cite,        "8 · Cite the line"),
    ("Reconstruct.dc.html", B.frame_reconstruct, "9 · Reconstruct the case"),
    ("Statement.dc.html",   C.frame_statement,   "10 · Set the words into the line"),
    ("Report.dc.html",      B.frame_report,      "11 · The case report"),
    ("Reread.dc.html",      C.frame_reread,      "12 · Read it again, knowing"),
]

W, H = 1440, 900
COLS, GAP_X, GAP_Y = 4, 80, 500

boards, order = {}, []
for i, (name, fn, title) in enumerate(FRAMES):
    (PROJ / name).write_text(fn(), encoding="utf-8")
    boards[name] = {
        "x": (i % COLS) * (W + GAP_X),
        "y": (i // COLS) * (H + GAP_Y),
        "w": W, "h": H,
        "title": title,
        "is_interactive": True,
    }
    order.append(name)

now = datetime.datetime.now(datetime.timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")

index = {
    "v": 3,
    "createdOnFiles": {"v": 1, "at": now},
    "title": "Fine Print — Lesson Flow",
    "launch": {"view": "canvas"},
    "pages": [],
    "boards": boards,
    "order": order,
    "notes": {
        "r1": {"x": 0, "y": -320, "text": "Take down a case, open it, learn the words, read it",
               "kind": "title1", "maxW": 6000, "color": "orange"},
        "r2": {"x": 0, "y": 1080, "text": "The book closes — three actions, from memory",
               "kind": "title1", "maxW": 6000, "color": "orange"},
        "r3": {"x": 0, "y": 2480, "text": "Write the conclusion, hear how you read, then read it again",
               "kind": "title1", "maxW": 6000, "color": "orange"},
        "n1": {"x": 6140, "y": 40, "w": 420,
               "text": "Every word the reader reads is verbatim Saki, from Project Gutenberg #269. "
                       "The answer options are things and people from the passage — never lettered "
                       "A/B/C/D. Oxblood red is reserved for the reader's own evidence marks, so a "
                       "red stroke always means \"I claimed this\".",
               "color": "red"},
        "n2": {"x": 6140, "y": 1480, "w": 420,
               "text": "One continuous study, six depth layers, lit only by the desk lamp. Each frame "
                       "is a camera position on that one room — which is what makes Search the Room "
                       "work: the decoys are objects you already walked past.",
               "color": "red"},
    },
    "designSystems": [],
}
(PROJ / "canvas.json").write_text(json.dumps(index, indent=1), encoding="utf-8")

for p in sorted(PROJ.iterdir()):
    print(f"{p.name:24} {p.stat().st_size:>7,} bytes")
