"""Validate dimensions, alpha channels, and JSON frame counts for pixel assets."""

from __future__ import annotations

import json
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1] / "assets" / "pixel"
EXPECTED = {
    # tools/import-pixel-sheet.py 가 Flow 그림에서 자른 것(2026-10-25)
    "yeonwoo.png": ((960, 1113), 50),
    "props.png": ((896, 336), 22),
    "effects.png": ((768, 288), 24),
    "cafe_objects.png": ((951, 350), 18),
    "cafe_room.png": ((1280, 448), 1),
    "people.png": ((1136, 696), 30),     # 미니게임 손님·점장님·민재(G-4, 2026-10-26)
    "mg_objects.png": ((1019, 330), 25), # 미니게임 물건·얼룩·먼지(G-4, 먼지 세 크기 2026-11-19)
    # tools/generate-pixel-assets.py (옛 그림: 도현·소라는 쓰지 않음, 타일셋은 매장 그림이 없을 때만)
    "dohyun.png": ((192, 120), 24),
    "sora.png": ((192, 120), 24),
    "cafe_tileset.png": ((256, 48), 35),
    "acha_bubble.png": ((64, 32), None),
}
OPAQUE = {"cafe_room.png"}  # 배경 그림: 투명한 곳이 없음


def main() -> None:
    errors: list[str] = []
    for name, (size, frame_count) in EXPECTED.items():
        path = ROOT / name
        if not path.exists():
            errors.append(f"missing: {name}")
            continue
        image = Image.open(path)
        print(f"{name}: size={image.size} mode={image.mode}")
        if image.size != size:
            errors.append(f"{name}: expected size {size}, got {image.size}")
        if name != "acha_bubble.png":
            # 팔레트 PNG(투명색 포함)도 됨: yeonwoo.png 는 128색으로 줄여 저장
            if name in OPAQUE:
                pass
            elif image.mode not in ("RGBA", "P"):
                errors.append(f"{name}: expected RGBA transparency")
            else:
                alpha_min, alpha_max = image.convert("RGBA").getchannel("A").getextrema()
                if alpha_min != 0 or alpha_max != 255:
                    errors.append(f"{name}: alpha range should include 0 and 255, got {alpha_min}..{alpha_max}")
            metadata = json.loads(path.with_suffix(".json").read_text(encoding="utf-8"))
            actual_count = len(metadata["frames"])
            if actual_count != frame_count:
                errors.append(f"{name}: expected {frame_count} frames, got {actual_count}")

    if errors:
        print("VALIDATION: FAIL")
        for error in errors:
            print(f"- {error}")
        raise SystemExit(1)
    print("VALIDATION: PASS")


if __name__ == "__main__":
    main()
