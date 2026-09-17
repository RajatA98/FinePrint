"""Split a Project Gutenberg EPUB collection into one plain-text file per story.

Usage: python split_collection.py book.epub out_dir
Requires: pandoc (or the `extract-text` CLI) on PATH.
"""
import json, re, subprocess, sys
from pathlib import Path

SKIP = {"AUTHOR'S NOTE", "AUTHOR’S NOTE", "CONTENTS"}

def epub_to_markdown(path: str) -> str:
    return subprocess.run(["pandoc", path, "-t", "markdown", "--wrap=none"],
                          capture_output=True, text=True, check=True).stdout

def strip_gutenberg(md: str) -> str:
    # Markers may be escaped by pandoc (\\*\\*\\*), so match 3 optional-escaped asterisks.
    start = re.search(r"(?:\\?\*){3}\s*START OF.*$", md, re.I | re.M)
    end = re.search(r"(?:\\?\*){3}\s*END OF.*$", md, re.I | re.M)
    return md[start.end() if start else 0 : end.start() if end else len(md)]

def clean(text: str) -> str:
    text = re.sub(r"\{[^}]*\}", "", text)              # pandoc attributes
    text = re.sub(r"!\[[^\]]*\]\([^)]*\)", "", text)    # images
    text = re.sub(r"\[([^\]]*)\]\([^)]*\)", r"\1", text)  # links -> text
    text = re.sub(r"[*_]{1,2}([^*_]+)[*_]{1,2}", r"\1", text)  # emphasis
    text = re.sub(r"^:::.*$", "", text, flags=re.M)     # pandoc divs
    return re.sub(r"\n{3,}", "\n\n", text).strip()

def split_stories(md: str):
    parts = re.split(r"^#{1,2}\s+(.+)$", md, flags=re.M)
    for title, body in zip(parts[1::2], parts[2::2]):
        title = clean(title).strip()
        body = clean(body)
        if title.upper() in SKIP or "GUTENBERG" in title.upper() or len(body.split()) < 200:
            continue
        yield title, body

def slug(s: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")

if __name__ == "__main__":
    src, out = sys.argv[1], Path(sys.argv[2])
    out.mkdir(parents=True, exist_ok=True)
    manifest = []
    for title, body in split_stories(strip_gutenberg(epub_to_markdown(src))):
        f = out / f"{slug(title)}.txt"
        f.write_text(f"{title.title()}\n\n{body}\n")
        manifest.append({"title": title.title(), "file": f.name, "words": len(body.split())})
    (out / "manifest.json").write_text(json.dumps(manifest, indent=2))
    for m in manifest:
        print(f"{m['words']:>6}  {m['title']}")
