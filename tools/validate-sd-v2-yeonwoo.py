"""Validate the Yeonwoo SD v2 visual checkpoint."""

from __future__ import annotations

import json
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1] / "assets" / "sd" / "v2"
POSES = ["idle", "walk", "wash", "carry", "sweep"]


def main() -> None:
    errors: list[str] = []
    manifest = json.loads((ROOT / "sd_yeonwoo_manifest.json").read_text(encoding="utf-8"))
    if manifest["output_size"] != [320, 400]:
        errors.append(f"manifest output_size={manifest['output_size']}")
    for pose in POSES:
        path = ROOT / f"sd_yeonwoo_{pose}.png"
        image = Image.open(path)
        print(f"{path.name}: size={image.size} mode={image.mode}")
        if image.size != (320, 400):
            errors.append(f"{path.name}: expected 320x400")
        if image.mode != "RGBA":
            errors.append(f"{path.name}: expected RGBA")
        else:
            alpha_min, alpha_max = image.getchannel("A").getextrema()
            if alpha_min != 0 or alpha_max != 255:
                errors.append(f"{path.name}: alpha range {alpha_min}..{alpha_max}")
    walk_sheet = Image.open(ROOT / "sd_yeonwoo_walk_sheet.png")
    if walk_sheet.size != (1280, 400):
        errors.append(f"walk sheet size={walk_sheet.size}")
    print(f"sd_yeonwoo_walk_sheet.png: size={walk_sheet.size} mode={walk_sheet.mode}")
    if errors:
        print("SD V2 VALIDATION: FAIL")
        for error in errors:
            print(f"- {error}")
        raise SystemExit(1)
    print("SD V2 VALIDATION: PASS")


if __name__ == "__main__":
    main()
