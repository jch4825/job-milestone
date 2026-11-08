"""Validate the detailed SD cutouts and the character manifest."""

from __future__ import annotations

import json
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1] / "assets" / "sd"
EXPECTED = {
    "yeonwoo": ["idle", "walk", "happy", "panic", "bow", "tray", "carry", "wash", "wipe", "point", "think", "breathe", "sweep"],
    "dohyun": ["idle", "walk", "point", "thumb"],
    "sora": ["idle", "walk", "point", "thumb"],
}


def main() -> None:
    errors: list[str] = []
    manifest_path = ROOT / "sd_manifest.json"
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    if manifest["output_size"] != [320, 400]:
        errors.append(f"manifest output_size is {manifest['output_size']}, expected [320, 400]")

    for character, poses in EXPECTED.items():
        manifest_character = next((item for item in manifest["characters"] if item["character"] == character), None)
        if not manifest_character:
            errors.append(f"missing character: {character}")
            continue
        for pose in poses:
            filename = f"sd_{character}_{pose}.png"
            path = ROOT / filename
            if not path.exists():
                errors.append(f"missing: {filename}")
                continue
            image = Image.open(path)
            print(f"{filename}: size={image.size} mode={image.mode}")
            if image.size != (320, 400):
                errors.append(f"{filename}: expected 320x400, got {image.size}")
            if image.mode != "RGBA":
                errors.append(f"{filename}: expected RGBA")
            else:
                alpha_min, alpha_max = image.getchannel("A").getextrema()
                if alpha_min != 0 or alpha_max != 255:
                    errors.append(f"{filename}: expected transparent cutout alpha range 0..255, got {alpha_min}..{alpha_max}")

        walk_sheet = ROOT / f"sd_{character}_walk_sheet.png"
        walk_image = Image.open(walk_sheet)
        if walk_image.size != (1280, 400):
            errors.append(f"{walk_sheet.name}: expected 1280x400, got {walk_image.size}")

    if errors:
        print("SD VALIDATION: FAIL")
        for error in errors:
            print(f"- {error}")
        raise SystemExit(1)
    print("SD VALIDATION: PASS")


if __name__ == "__main__":
    main()
