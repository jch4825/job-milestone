"""Render a higher-detail 2x-grid SD sprite sample for Yeonwoo."""

from __future__ import annotations

import argparse
import json
from pathlib import Path

from PIL import Image, ImageDraw


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "assets" / "sd" / "v2"
W, H = 160, 200
SCALE = 2
SIZE = (W * SCALE, H * SCALE)

P = {
    "ink": "#19151C",
    "ink_soft": "#4A2E35",
    "hair_dark": "#3C272A",
    "hair": "#684033",
    "hair_light": "#A66A4D",
    "skin": "#F4B995",
    "skin_light": "#FFD7B6",
    "skin_shadow": "#BD6C60",
    "cheek": "#E88783",
    "cream": "#FFF7E8",
    "shirt": "#FFF9EF",
    "shirt_shadow": "#D8D9DE",
    "red": "#C92738",
    "red_light": "#E43C46",
    "red_dark": "#7D1E2C",
    "red_deep": "#551926",
    "crimson_dark": "#7D1E2C",
    "pants": "#252735",
    "pants_light": "#3B4052",
    "shoe": "#563225",
    "shoe_light": "#86543A",
    "gold": "#E4AD38",
    "yellow": "#FFD43B",
    "orange": "#E9853E",
    "wood": "#B86E3C",
    "wood_dark": "#653923",
    "paper": "#FFEED0",
    "foam": "#E9FAF3",
    "water": "#73C6E8",
    "teal": "#4CA99F",
    "grey": "#87909B",
    "transparent": (0, 0, 0, 0),
    "shadow": (25, 21, 28, 65),
}


def c(name: str | tuple[int, int, int, int]) -> tuple[int, int, int, int]:
    value = P[name] if isinstance(name, str) else name
    if isinstance(value, tuple):
        return value
    value = value.lstrip("#")
    return tuple(int(value[i : i + 2], 16) for i in (0, 2, 4)) + (255,)


def blank() -> Image.Image:
    return Image.new("RGBA", (W, H), c("transparent"))


def rect(d: ImageDraw.ImageDraw, box: tuple[int, int, int, int], fill: str | tuple[int, int, int, int]) -> None:
    d.rectangle(box, fill=c(fill))


def poly(d: ImageDraw.ImageDraw, points: list[tuple[int, int]], fill: str | tuple[int, int, int, int]) -> None:
    d.polygon(points, fill=c(fill))


def line(d: ImageDraw.ImageDraw, points: list[tuple[int, int]], fill: str, width: int = 1) -> None:
    d.line(points, fill=c(fill), width=width, joint="curve")


def ellipse(d: ImageDraw.ImageDraw, box: tuple[int, int, int, int], fill: str | tuple[int, int, int, int], outline: str | None = None, width: int = 1) -> None:
    d.ellipse(box, fill=c(fill), outline=c(outline) if outline else None, width=width)


def outlined(d: ImageDraw.ImageDraw, outer: list[tuple[int, int]], inner: list[tuple[int, int]], fill: str) -> None:
    poly(d, outer, "ink")
    poly(d, inner, fill)


def draw_shadow(d: ImageDraw.ImageDraw) -> None:
    ellipse(d, (23, 184, 136, 198), "shadow")


def draw_face(d: ImageDraw.ImageDraw, pose: str, head_y: int = 8) -> None:
    # Hair silhouette: a short, rounded bob with distinct ends and layered highlights.
    outlined(
        d,
        [(35, head_y + 24), (39, head_y + 13), (49, head_y + 5), (64, head_y), (85, head_y), (103, head_y + 7), (115, head_y + 19), (121, head_y + 38), (120, head_y + 58), (113, head_y + 69), (103, head_y + 76), (91, head_y + 71), (73, head_y + 73), (52, head_y + 76), (40, head_y + 67), (34, head_y + 50)],
        [(40, head_y + 24), (44, head_y + 14), (52, head_y + 9), (66, head_y + 5), (83, head_y + 5), (99, head_y + 12), (109, head_y + 22), (114, head_y + 40), (112, head_y + 57), (105, head_y + 66), (97, head_y + 68), (88, head_y + 63), (72, head_y + 66), (55, head_y + 69), (44, head_y + 61), (39, head_y + 48)],
        "hair",
    )

    # Face, ears, neck.
    ellipse(d, (43, head_y + 17, 112, head_y + 78), "skin", "ink", 2)
    rect(d, (38, head_y + 36, 45, head_y + 51), "skin")
    rect(d, (110, head_y + 36, 117, head_y + 51), "skin")
    rect(d, (66, head_y + 73, 88, head_y + 87), "skin_shadow")
    rect(d, (70, head_y + 69, 84, head_y + 81), "skin")

    # Layered fringe follows the bob instead of the generic cap used in v1.
    poly(d, [(42, head_y + 21), (47, head_y + 12), (62, head_y + 7), (78, head_y + 8), (94, head_y + 12), (108, head_y + 22), (100, head_y + 29), (92, head_y + 22), (83, head_y + 31), (74, head_y + 22), (64, head_y + 31), (56, head_y + 22), (48, head_y + 33)], "hair_dark")
    line(d, [(50, head_y + 15), (56, head_y + 10), (61, head_y + 10)], "hair_light", 2)
    line(d, [(72, head_y + 10), (78, head_y + 7), (84, head_y + 9)], "hair_light", 2)
    line(d, [(92, head_y + 13), (98, head_y + 18), (102, head_y + 23)], "hair_light", 2)
    line(d, [(40, head_y + 31), (39, head_y + 53)], "hair_dark", 3)
    line(d, [(111, head_y + 31), (114, head_y + 53)], "hair_dark", 3)

    # Large readable eyes and a small soft expression.
    if pose == "breathe":
        line(d, [(56, head_y + 45), (64, head_y + 48), (71, head_y + 45)], "ink", 2)
        line(d, [(85, head_y + 45), (92, head_y + 48), (99, head_y + 45)], "ink", 2)
    elif pose == "happy":
        line(d, [(55, head_y + 47), (62, head_y + 43), (70, head_y + 47)], "ink", 2)
        line(d, [(84, head_y + 47), (92, head_y + 43), (100, head_y + 47)], "ink", 2)
    else:
        ellipse(d, (53, head_y + 40, 72, head_y + 55), "cream", "ink", 2)
        ellipse(d, (83, head_y + 40, 102, head_y + 55), "cream", "ink", 2)
        ellipse(d, (59, head_y + 44, 68, head_y + 53), "hair_light", "ink", 1)
        ellipse(d, (89, head_y + 44, 98, head_y + 53), "hair_light", "ink", 1)
        rect(d, (62, head_y + 45, 65, head_y + 50), "ink")
        rect(d, (92, head_y + 45, 95, head_y + 50), "ink")
        rect(d, (64, head_y + 44, 66, head_y + 46), "cream")
        rect(d, (94, head_y + 44, 96, head_y + 46), "cream")
    rect(d, (76, head_y + 55, 79, head_y + 57), "skin_shadow")
    if pose in ("panic",):
        line(d, [(69, head_y + 65), (78, head_y + 62), (87, head_y + 65)], "ink", 2)
    elif pose == "happy":
        poly(d, [(70, head_y + 60), (86, head_y + 60), (82, head_y + 68), (74, head_y + 68)], "crimson_dark")
        rect(d, (74, head_y + 61, 82, head_y + 63), "cream")
    else:
        line(d, [(71, head_y + 64), (78, head_y + 66), (85, head_y + 64)], "crimson_dark", 2)
    rect(d, (48, head_y + 57, 54, head_y + 60), "cheek")
    rect(d, (101, head_y + 57, 107, head_y + 60), "cheek")


def draw_collar_and_apron(d: ImageDraw.ImageDraw) -> None:
    # White collared shirt with rolled sleeves.
    outlined(d, [(40, 72), (66, 69), (94, 69), (120, 73), (132, 111), (28, 111)], [(43, 75), (65, 73), (92, 73), (117, 76), (125, 106), (35, 106)], "shirt")
    rect(d, (32, 81, 46, 108), "shirt_shadow")
    rect(d, (114, 82, 128, 108), "shirt_shadow")
    rect(d, (37, 105, 48, 124), "skin")
    rect(d, (112, 105, 123, 124), "skin")
    poly(d, [(65, 70), (79, 85), (94, 70), (99, 95), (61, 95)], "shirt_shadow")
    poly(d, [(67, 71), (79, 82), (91, 71), (87, 93), (70, 93)], "shirt")

    # Apron bib, waist, pockets and blank nameplate.
    outlined(d, [(53, 81), (107, 81), (116, 142), (43, 142)], [(58, 85), (102, 85), (110, 138), (49, 138)], "red")
    rect(d, (58, 87, 102, 98), "red_light")
    line(d, [(51, 113), (111, 113)], "red_dark", 3)
    rect(d, (49, 120, 67, 137), "red_dark")
    rect(d, (92, 120, 110, 137), "red_dark")
    rect(d, (52, 122, 64, 134), "red")
    rect(d, (95, 122, 107, 134), "red")
    rect(d, (85, 87, 104, 97), "gold")
    rect(d, (87, 89, 102, 95), "paper")
    # Apron tie is a key silhouette cue.
    rect(d, (69, 133, 91, 141), "red_deep")
    poly(d, [(72, 136), (59, 146), (50, 140), (68, 131)], "red_light")
    poly(d, [(88, 136), (101, 146), (110, 140), (92, 131)], "red_light")
    rect(d, (71, 140, 77, 157), "red_light")
    rect(d, (83, 140, 89, 157), "red_light")


def draw_legs(d: ImageDraw.ImageDraw, pose: str, frame: int) -> None:
    stride = [-8, -3, 8, 3][frame % 4] if pose == "walk" else 0
    rect(d, (52, 137, 75, 179 + max(stride, 0)), "pants")
    rect(d, (85, 137 - max(stride, 0), 108, 179), "pants")
    rect(d, (56, 153, 72, 178 + max(stride, 0)), "pants_light")
    rect(d, (89, 153 - max(stride, 0), 104, 178), "pants_light")
    rect(d, (48, 176 + max(stride, 0), 77, 188 + max(stride, 0)), "shoe")
    rect(d, (86, 176, 113, 188), "shoe")
    rect(d, (51, 176 + max(stride, 0), 72, 180 + max(stride, 0)), "shoe_light")
    rect(d, (89, 176, 108, 180), "shoe_light")


def draw_arms(d: ImageDraw.ImageDraw, pose: str, frame: int) -> None:
    if pose == "idle":
        rect(d, (32, 99, 49, 128), "shirt")
        rect(d, (111, 99, 128, 128), "shirt")
        rect(d, (36, 122, 50, 140), "skin")
        rect(d, (110, 122, 124, 140), "skin")
        ellipse(d, (42, 133, 61, 147), "skin", "ink", 2)
        ellipse(d, (99, 133, 118, 147), "skin", "ink", 2)
        line(d, [(52, 136), (79, 148), (107, 136)], "skin_shadow", 2)
    elif pose == "walk":
        swing = [-6, -2, 6, 2][frame % 4]
        rect(d, (26, 91, 43, 117 + swing), "shirt")
        rect(d, (117, 91, 134, 117 - swing), "shirt")
        rect(d, (27, 113 + swing, 42, 128 + swing), "skin")
        rect(d, (119, 113 - swing, 135, 128 - swing), "skin")
        line(d, [(31, 125 + swing), (39, 128 + swing)], "skin_shadow", 2)
        line(d, [(122, 125 - swing), (130, 128 - swing)], "skin_shadow", 2)
    elif pose == "wash":
        rect(d, (25, 92, 52, 108), "shirt")
        rect(d, (108, 92, 135, 108), "shirt")
        rect(d, (48, 98, 70, 113), "skin")
        rect(d, (90, 98, 112, 113), "skin")
        ellipse(d, (60, 98, 101, 123), "foam", "teal", 2)
        rect(d, (75, 116, 79, 137), "water")
        rect(d, (88, 119, 92, 139), "water")
        rect(d, (117, 102, 130, 107), "teal")
        rect(d, (120, 94, 124, 103), "grey")
        line(d, [(58, 119), (52, 124)], "water", 2)
        line(d, [(100, 121), (106, 125)], "water", 2)
    elif pose == "carry":
        rect(d, (22, 95, 45, 112), "shirt")
        rect(d, (115, 95, 138, 112), "shirt")
        rect(d, (35, 105, 57, 117), "skin")
        rect(d, (103, 105, 125, 117), "skin")
        rect(d, (42, 114, 119, 122), "wood_dark")
        rect(d, (47, 110, 114, 116), "wood")
        # Latte and salt-bread roll: two readable payloads.
        rect(d, (55, 100, 75, 112), "shirt")
        rect(d, (57, 99, 73, 103), "paper")
        ellipse(d, (58, 102, 72, 113), "orange", "wood_dark", 1)
        line(d, [(61, 104), (65, 108), (69, 104)], "gold", 2)
        ellipse(d, (87, 102, 108, 114), "orange", "wood_dark", 2)
        line(d, [(92, 104), (96, 110), (101, 104)], "gold", 2)
    elif pose == "sweep":
        rect(d, (25, 93, 49, 111), "shirt")
        rect(d, (101, 90, 127, 108), "shirt")
        rect(d, (37, 107, 59, 119), "skin")
        rect(d, (96, 102, 119, 115), "skin")
        # Diagonal broom with a broad yellow head.
        line(d, [(104, 73), (136, 178)], "wood_dark", 8)
        line(d, [(105, 74), (137, 178)], "wood", 3)
        poly(d, [(127, 173), (151, 179), (153, 191), (118, 190)], "yellow")
        line(d, [(123, 181), (149, 185)], "orange", 2)
        line(d, [(25, 177), (14, 183)], "paper", 2)
        line(d, [(29, 185), (16, 191)], "paper", 2)


def render(pose: str, frame: int = 0) -> Image.Image:
    image = blank()
    d = ImageDraw.Draw(image)
    draw_shadow(d)
    draw_legs(d, pose, frame)
    draw_collar_and_apron(d)
    draw_arms(d, pose, frame)
    head_y = 5 if pose != "walk" else [5, 2, 5, 7][frame % 4]
    draw_face(d, pose, head_y)
    # Red string bracelet from the reference design.
    rect(d, (34, 124, 39, 126), "red")
    # Small motion accents, kept sparse so the cutout remains readable.
    if pose == "wash":
        ellipse(d, (52, 87, 58, 93), "foam", "teal", 1)
        ellipse(d, (105, 88, 112, 95), "foam", "teal", 1)
    if pose == "sweep":
        line(d, [(12, 170), (22, 166)], "paper", 2)
        line(d, [(16, 194), (27, 190)], "paper", 2)
    if pose == "walk":
        line(d, [(15, 145), (24, 145)], "paper", 1)
        line(d, [(130, 143), (140, 143)], "paper", 1)
    return image.resize(SIZE, Image.Resampling.NEAREST)


def save_png(image: Image.Image, path: Path, force: bool) -> None:
    if path.exists() and not force:
        raise FileExistsError(f"Refusing to overwrite existing asset: {path}")
    path.parent.mkdir(parents=True, exist_ok=True)
    image.save(path, "PNG", optimize=True)


def save_json(data: dict, path: Path, force: bool) -> None:
    if path.exists() and not force:
        raise FileExistsError(f"Refusing to overwrite existing metadata: {path}")
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--force", action="store_true")
    args = parser.parse_args()
    OUT.mkdir(parents=True, exist_ok=True)
    poses = ["idle", "walk", "wash", "carry", "sweep"]
    files = []
    for pose in poses:
        filename = f"sd_yeonwoo_{pose}.png"
        save_png(render(pose), OUT / filename, args.force)
        files.append({"id": f"sd_yeonwoo_{pose}", "file": filename, "size": list(SIZE), "transparent": True})

    walk_sheet = Image.new("RGBA", (SIZE[0] * 4, SIZE[1]), c("transparent"))
    for frame in range(4):
        walk_sheet.alpha_composite(render("walk", frame), (frame * SIZE[0], 0))
    save_png(walk_sheet, OUT / "sd_yeonwoo_walk_sheet.png", args.force)
    files.append({"id": "sd_yeonwoo_walk_sheet", "file": "sd_yeonwoo_walk_sheet.png", "size": list(walk_sheet.size), "frame_size": list(SIZE), "frames": 4, "transparent": True})

    save_json(
        {"version": 2, "source_reference": "assets/stand/yeonwoo_normal.png", "logical_size": [W, H], "output_size": list(SIZE), "scale": SCALE, "filter": "nearest", "files": files},
        OUT / "sd_yeonwoo_manifest.json",
        args.force,
    )

    cards = []
    for pose in poses:
        image = Image.open(OUT / f"sd_yeonwoo_{pose}.png").convert("RGBA")
        card = Image.new("RGBA", (SIZE[0], SIZE[1] + 28), c("cream"))
        card.alpha_composite(image, (0, 0))
        ImageDraw.Draw(card).text((8, SIZE[1] + 8), pose, fill=c("ink"))
        cards.append(card)
    preview = Image.new("RGBA", (SIZE[0] * len(cards), cards[0].height), c("cream"))
    for index, card in enumerate(cards):
        preview.alpha_composite(card, (index * SIZE[0], 0))
    save_png(preview.convert("RGB"), OUT / "sd_yeonwoo_preview.png", args.force)
    print(f"Generated Yeonwoo SD v2 sample in {OUT}")


if __name__ == "__main__":
    main()
