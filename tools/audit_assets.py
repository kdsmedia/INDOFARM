#!/usr/bin/env python3
"""Audit the imported game asset packs without third-party dependencies.

The check is intentionally read-only. It reports file counts, common formats,
duplicate content hashes, and basic PNG/JPEG/SVG/glTF/GLB validity.
"""

from __future__ import annotations

import hashlib
import json
import struct
from collections import Counter, defaultdict
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
PACKS = [
    "BoxesBanners",
    "ButtonsIcons",
    "ButtonsText",
    "Icons",
    "Sliders",
    "KayKit_Adventurers_2.0_FREE",
    "Medieval_Village_MegaKit",
    "Modular Character Outfits - Fantasy[Standard]",
    "Stylized_Nature_MegaKit",
]
ASSET_EXTENSIONS = {
    ".png",
    ".jpg",
    ".jpeg",
    ".svg",
    ".glb",
    ".gltf",
    ".bin",
    ".fbx",
    ".obj",
    ".mtl",
}


def rel(path: Path) -> str:
    return path.relative_to(ROOT).as_posix()


def is_valid_image(path: Path) -> bool:
    data = path.read_bytes()
    if path.suffix.lower() == ".png":
        return data.startswith(b"\x89PNG\r\n\x1a\n")
    if path.suffix.lower() in {".jpg", ".jpeg"}:
        return data[:3] == b"\xff\xd8\xff"
    return True


def is_valid_svg(path: Path) -> bool:
    text = path.read_text(encoding="utf-8", errors="replace").lstrip()
    return text.startswith("<?xml") or "<svg" in text[:500]


def is_valid_gltf(path: Path) -> bool:
    try:
        payload = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, UnicodeDecodeError, json.JSONDecodeError):
        return False
    return isinstance(payload, dict) and payload.get("asset", {}).get("version") is not None


def is_valid_glb(path: Path) -> bool:
    try:
        header = path.read_bytes()[:12]
    except OSError:
        return False
    if len(header) != 12:
        return False
    magic, version, length = struct.unpack("<4sII", header)
    return magic == b"glTF" and version in {1, 2} and length <= path.stat().st_size


def main() -> int:
    files = [
        path
        for pack in PACKS
        for path in (ROOT / pack).rglob("*")
        if path.is_file() and path.suffix.lower() in ASSET_EXTENSIONS
    ]
    by_pack = Counter()
    by_extension = Counter()
    hashes: defaultdict[str, list[str]] = defaultdict(list)
    invalid: list[str] = []

    for path in files:
        by_pack[path.relative_to(ROOT).parts[0]] += 1
        by_extension[path.suffix.lower() or "[no extension]"] += 1
        hashes[hashlib.sha256(path.read_bytes()).hexdigest()].append(rel(path))

        suffix = path.suffix.lower()
        valid = True
        if suffix in {".png", ".jpg", ".jpeg"}:
            valid = is_valid_image(path)
        elif suffix == ".svg":
            valid = is_valid_svg(path)
        elif suffix == ".gltf":
            valid = is_valid_gltf(path)
        elif suffix == ".glb":
            valid = is_valid_glb(path)
        if not valid:
            invalid.append(rel(path))

    duplicate_groups = [
        sorted(paths) for paths in hashes.values() if len(paths) > 1
    ]
    duplicate_groups.sort(key=lambda group: (-len(group), group[0]))

    print(f"Asset files checked: {len(files)}")
    print("Files by pack:")
    for pack in PACKS:
        print(f"  {pack}: {by_pack[pack]}")
    print("Files by extension:")
    for extension, count in sorted(by_extension.items()):
        print(f"  {extension}: {count}")
    print(f"Duplicate content groups: {len(duplicate_groups)}")
    print(f"Invalid files: {len(invalid)}")
    if invalid:
        print("Invalid paths:")
        for path in invalid:
            print(f"  {path}")

    report = {
        "asset_files_checked": len(files),
        "files_by_pack": dict(sorted(by_pack.items())),
        "files_by_extension": dict(sorted(by_extension.items())),
        "duplicate_content_groups": duplicate_groups,
        "invalid_files": invalid,
        "canonical_aliases": {
            "BoxesBanners/Banner_WhiteOutline": "legacy typo: Banner_WhiteOutine",
            "ButtonsText/ButtonText_Green_OnOffButton": "legacy typo: ButtonText_Geen_OnOffButton",
            "ButtonsText/ButtonText_Small_Round": "legacy typo: ButtonText_Small_ROund",
            "Icons/Icon_Large_StarGrey_SeethroughOutline": "legacy typo: Icon_Large_StarSrey_SeethroughOutline",
        },
    }
    output = ROOT / "asset-audit.json"
    output.write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"Report written: {rel(output)}")
    return 1 if invalid else 0


if __name__ == "__main__":
    raise SystemExit(main())