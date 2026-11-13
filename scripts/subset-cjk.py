"""Cuts a Chinese typeface down to the characters the site uses. Called by build-fonts.ts.

Fontsource ships each Chinese face as ~100 slices split by character range. This keeps, from every
slice, only the glyphs for the requested characters and merges what is left into one small WOFF2.

    python3 scripts/subset-cjk.py <out.woff2> <text-file> <slice.woff2>...

Prints the code points the new file actually covers, as JSON, for the @font-face unicode-range.
Needs fontTools and brotli (`pip install fonttools brotli`).
"""

import json
import sys
import tempfile
from pathlib import Path

from fontTools import subset
from fontTools.merge import Merger, Options
from fontTools.ttLib import TTFont

# Vertical metrics are for vertical writing, which the site never uses; the kerning in Long Cang's
# slices has no script list and cannot be merged (its Latin keeps kerning in its own file).
DROPPED_TABLES = ["vmtx", "vhea", "VORG", "GSUB", "GPOS"]


def main() -> None:
    out, text_file, *slices = sys.argv[1:]
    wanted = {ord(char) for char in Path(text_file).read_text(encoding="utf-8")}
    covered: set[int] = set()
    with tempfile.TemporaryDirectory() as tmp:
        parts = []
        for index, path in enumerate(slices):
            font = TTFont(path)
            hit = set(font.getBestCmap()) & wanted
            if not hit:
                continue
            options = subset.Options()
            options.notdef_outline = True
            subsetter = subset.Subsetter(options)
            subsetter.populate(unicodes=hit)
            subsetter.subset(font)
            font.flavor = None
            part = Path(tmp) / f"{index}.ttf"
            font.save(part)
            parts.append(str(part))
            covered |= hit
        if not parts:
            raise SystemExit(f"None of the requested characters are in {slices[0]}…")
        merged = Merger(options=Options(drop_tables=DROPPED_TABLES)).merge(parts)
        merged.flavor = "woff2"
        merged.save(out)
    print(json.dumps(sorted(covered)))


if __name__ == "__main__":
    main()
