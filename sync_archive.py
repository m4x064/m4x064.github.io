#!/usr/bin/env python3
"""Sync the embedded archive fallback in index.html from materials.json."""

from __future__ import annotations

import json
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parent
MATERIALS = ROOT / "materials.json"
INDEX = ROOT / "index.html"
PDF_ROOT = ROOT / "pdf"


def main() -> None:
    materials = json.loads(MATERIALS.read_text(encoding="utf-8"))

    missing = []
    for section in materials:
        for item in section.get("items", []):
            for link in item.get("links", []):
                href = link.get("href", "")
                if href.startswith("./pdf/") and not (ROOT / href[2:]).is_file():
                    missing.append(href)

    payload = json.dumps(materials, ensure_ascii=False, separators=(",", ":"))
    html = INDEX.read_text(encoding="utf-8")
    pattern = re.compile(
        r'(<script type="application/json" id="materials-fallback">)(.*?)(</script>)',
        re.S,
    )
    html, replacements = pattern.subn(rf"\1{payload}\3", html, count=1)
    if replacements != 1:
        raise SystemExit("materials-fallback script tag was not found exactly once")

    INDEX.write_text(html, encoding="utf-8")

    item_count = sum(len(section.get("items", [])) for section in materials)
    link_count = sum(
        len(item.get("links", []))
        for section in materials
        for item in section.get("items", [])
    )
    print(f"synced {len(materials)} sections, {item_count} items, {link_count} links")
    if missing:
        print("missing links:")
        for href in missing:
            print(f"- {href}")
        raise SystemExit(1)


if __name__ == "__main__":
    main()
