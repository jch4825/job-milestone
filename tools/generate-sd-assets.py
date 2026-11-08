"""Generate detailed, transparent SD pixel cutouts from the standee references.

The renderer works on an 80x100 logical pixel canvas and enlarges it 4x with
nearest-neighbour filtering to the 320x400 cutout size requested by the art
brief. It is deliberately palette constrained, but uses enough clusters,
shading, costume details, and held props to keep each character readable.
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path

from PIL import Image, ImageDraw


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "assets" / "sd"
LOGICAL = (80, 100)
SCALE = 4
OUTPUT_SIZE = (LOGICAL[0] * SCALE, LOGICAL[1] * SCALE)

C = {
    "ink": "#17141C",
    "ink2": "#34252D",
    "outline_warm": "#5A3031",
    "skin": "#F4B995",
    "skin_light": "#FFD7B6",
    "skin_shadow": "#C97865",
    "cheek": "#E78A86",
    "hair_brown": "#5B352B",
    "hair_dark": "#242733",
    "hair_hi": "#A56A4C",
    "hair_black_hi": "#455064",
    "cream": "#FFF7E8",
    "shirt_shadow": "#D8D9DE",
    "crimson": "#E3262E",
    "crimson_mid": "#B72B36",
    "crimson_dark": "#761E2C",
    "wine": "#762C3A",
    "charcoal": "#3D414B",
    "charcoal_hi": "#68717B",
    "black_pants": "#252735",
    "brown": "#8B4A2C",
    "brown_dark": "#563225",
    "wood": "#B86E3C",
    "gold": "#E4AD38",
    "yellow": "#FFD43B",
    "orange": "#E9853E",
    "blue": "#5D8FD6",
    "blue_dark": "#355B91",
    "grey": "#87909B",
    "teal": "#4CA99F",
    "green": "#78B45C",
    "foam": "#E9FAF3",
    "water": "#73C6E8",
    "lavender": "#A18AC2",
    "camera": "#C18A59",
    "paper": "#FFEED0",
    "transparent": (0, 0, 0, 0),
    "shadow_alpha": (23, 20, 28, 70),
}


def color(name: str | tuple[int, int, int, int]) -> tuple[int, int, int, int]:
    value = C[name] if isinstance(name, str) else name
    if isinstance(value, tuple):
        return value
    raw = value.lstrip("#")
    return tuple(int(raw[i : i + 2], 16) for i in (0, 2, 4)) + (255,)


def blank() -> Image.Image:
    return Image.new("RGBA", LOGICAL, color("transparent"))


def r(draw: ImageDraw.ImageDraw, x0: int, y0: int, x1: int, y1: int, fill: str | tuple[int, int, int, int]) -> None:
    draw.rectangle((x0, y0, x1, y1), fill=color(fill))


def p(draw: ImageDraw.ImageDraw, points: list[tuple[int, int]], fill: str | tuple[int, int, int, int]) -> None:
    draw.polygon(points, fill=color(fill))


def l(draw: ImageDraw.ImageDraw, points: list[tuple[int, int]], fill: str, width: int = 1) -> None:
    draw.line(points, fill=color(fill), width=width, joint="curve")


def e(draw: ImageDraw.ImageDraw, box: tuple[int, int, int, int], fill: str | tuple[int, int, int, int], outline: str | None = None, width: int = 1) -> None:
    draw.ellipse(box, fill=color(fill), outline=color(outline) if outline else None, width=width)


def outlined_poly(draw: ImageDraw.ImageDraw, outer: list[tuple[int, int]], inner: list[tuple[int, int]], fill: str, outline: str = "ink") -> None:
    p(draw, outer, outline)
    p(draw, inner, fill)


def pixel_text_question(draw: ImageDraw.ImageDraw, x: int, y: int, fill: str = "gold") -> None:
    r(draw, x + 3, y, x + 6, y + 1, fill)
    r(draw, x + 6, y + 2, x + 7, y + 5, fill)
    r(draw, x + 3, y + 5, x + 6, y + 6, fill)
    r(draw, x + 3, y + 8, x + 4, y + 10, fill)


def ground(draw: ImageDraw.ImageDraw) -> None:
    e(draw, (15, 91, 65, 99), "shadow_alpha")


def face_front(draw: ImageDraw.ImageDraw, hair: str, hair_hi: str, glasses: str | None = None, eyes: str = "open", ponytail: bool = False) -> None:
    # Back hair and bob/ponytail silhouette.
    if ponytail:
        outlined_poly(
            draw,
            [(50, 8), (61, 4), (69, 8), (70, 20), (65, 31), (56, 29), (54, 19)],
            [(54, 9), (61, 7), (66, 10), (66, 20), (62, 26), (57, 24), (57, 16)],
            hair,
        )
        r(draw, 58, 5, 64, 8, "crimson_mid")
        r(draw, 59, 5, 63, 6, "cheek")
    else:
        outlined_poly(
            draw,
            [(20, 18), (24, 9), (34, 4), (47, 4), (57, 10), (62, 21), (61, 34), (55, 43), (22, 43), (17, 34)],
            [(23, 17), (27, 10), (35, 7), (46, 7), (54, 12), (58, 21), (57, 33), (52, 39), (26, 39), (21, 32)],
            hair,
        )

    # Face and ears.
    e(draw, (24, 11, 57, 41), "skin", "ink", 2)
    r(draw, 21, 23, 25, 31, "skin")
    r(draw, 56, 23, 60, 31, "skin")
    r(draw, 27, 15, 52, 20, hair)
    r(draw, 24, 17, 28, 30, hair)
    r(draw, 51, 17, 57, 32, hair)
    r(draw, 28, 12, 31, 15, hair_hi)
    r(draw, 35, 9, 39, 12, hair_hi)
    r(draw, 45, 11, 49, 14, hair_hi)
    r(draw, 25, 33, 28, 39, hair)
    r(draw, 52, 32, 56, 40, hair)

    if eyes == "closed":
        l(draw, [(30, 27), (34, 28)], "ink", 2)
        l(draw, [(45, 28), (49, 27)], "ink", 2)
    elif eyes == "happy":
        l(draw, [(30, 28), (34, 26), (37, 28)], "ink", 2)
        l(draw, [(43, 28), (46, 26), (50, 28)], "ink", 2)
    else:
        e(draw, (29, 24, 37, 31), "cream", "ink", 1)
        e(draw, (43, 24, 51, 31), "cream", "ink", 1)
        r(draw, 33, 26, 35, 29, "gold")
        r(draw, 46, 26, 48, 29, "gold")
        r(draw, 34, 27, 35, 29, "ink")
        r(draw, 47, 27, 48, 29, "ink")
    r(draw, 38, 31, 41, 32, "skin_shadow")
    l(draw, [(36, 36), (40, 37), (44, 36)], "crimson_dark", 1)
    r(draw, 27, 32, 30, 34, "cheek")
    r(draw, 50, 32, 53, 34, "cheek")

    if glasses == "round":
        e(draw, (27, 22, 39, 33), "transparent", "ink", 2)
        e(draw, (41, 22, 53, 33), "transparent", "ink", 2)
        l(draw, [(39, 26), (41, 26)], "ink", 2)
        l(draw, [(27, 25), (23, 24)], "ink", 1)
        l(draw, [(53, 25), (57, 24)], "ink", 1)


def draw_yeonwoo_body(draw: ImageDraw.ImageDraw, pose: str, frame: int) -> None:
    ground(draw)
    # Legs and shoes. Walk frames make the step obvious without changing the silhouette.
    stride = [-4, -1, 4, 1][frame % 4] if pose == "walk" else 0
    r(draw, 28, 65, 38, 88 + max(stride, 0), "black_pants")
    r(draw, 43, 65 - max(stride, 0), 52, 88, "black_pants")
    r(draw, 25, 86 + max(stride, 0), 39, 92 + max(stride, 0), "brown_dark")
    r(draw, 43, 86, 56, 92, "brown_dark")
    r(draw, 27, 85 + max(stride, 0), 36, 87 + max(stride, 0), "charcoal")
    r(draw, 45, 85, 53, 87, "charcoal")

    # Shirt torso and rolled sleeves.
    outlined_poly(draw, [(22, 39), (57, 39), (63, 68), (18, 68)], [(25, 41), (54, 41), (58, 65), (22, 65)], "cream")
    r(draw, 20, 43, 26, 61, "shirt_shadow")
    r(draw, 54, 43, 60, 61, "shirt_shadow")
    r(draw, 24, 57, 29, 64, "skin")
    r(draw, 52, 57, 57, 64, "skin")

    # Bib apron, waist tie, pocket, and blank brass nameplate.
    outlined_poly(draw, [(25, 42), (54, 42), (57, 71), (21, 71)], [(28, 44), (51, 44), (54, 68), (24, 68)], "crimson")
    r(draw, 28, 45, 51, 49, "crimson_mid")
    l(draw, [(25, 58), (53, 58)], "crimson_dark", 2)
    r(draw, 25, 61, 33, 68, "crimson_mid")
    r(draw, 45, 61, 53, 68, "crimson_mid")
    r(draw, 33, 64, 45, 68, "crimson_dark")
    p(draw, [(36, 65), (29, 69), (25, 66), (33, 63)], "crimson_mid")
    p(draw, [(42, 65), (50, 69), (55, 66), (46, 63)], "crimson_mid")
    r(draw, 45, 48, 52, 52, "gold")
    r(draw, 46, 49, 51, 51, "paper")
    r(draw, 37, 41, 42, 43, "shirt_shadow")
    l(draw, [(37, 40), (39, 45), (41, 40)], "shirt_shadow", 1)

    if pose == "idle":
        r(draw, 25, 63, 31, 72, "skin")
        r(draw, 48, 63, 54, 72, "skin")
        e(draw, (27, 69, 34, 75), "skin", "ink", 1)
        e(draw, (46, 69, 53, 75), "skin", "ink", 1)
        l(draw, [(31, 70), (40, 75), (49, 70)], "skin_shadow", 1)
    elif pose == "walk":
        r(draw, 19, 48, 26, 62, "cream")
        r(draw, 54, 50, 62, 64, "cream")
        r(draw, 18, 61, 24, 66, "skin")
        r(draw, 59, 62, 65, 67, "skin")
        l(draw, [(21, 64), (26, 66)], "skin_shadow", 1)
    elif pose == "happy":
        r(draw, 16, 38, 23, 53, "cream")
        r(draw, 56, 37, 64, 52, "cream")
        r(draw, 14, 35, 20, 41, "skin")
        r(draw, 61, 34, 67, 40, "skin")
        l(draw, [(12, 33), (16, 35)], "yellow", 2)
        l(draw, [(65, 32), (68, 29)], "yellow", 2)
        l(draw, [(11, 45), (8, 47)], "gold", 1)
        l(draw, [(68, 44), (71, 46)], "gold", 1)
    elif pose == "panic":
        r(draw, 16, 46, 24, 58, "cream")
        r(draw, 55, 45, 65, 57, "cream")
        r(draw, 14, 43, 20, 49, "skin")
        r(draw, 62, 42, 68, 48, "skin")
        r(draw, 59, 23, 62, 27, "water")
        r(draw, 62, 27, 64, 30, "water")
        l(draw, [(17, 40), (13, 38)], "yellow", 1)
    elif pose == "bow":
        r(draw, 22, 51, 30, 65, "cream")
        r(draw, 49, 51, 57, 65, "cream")
        r(draw, 27, 62, 33, 68, "skin")
        r(draw, 46, 62, 52, 68, "skin")
        l(draw, [(29, 64), (36, 68), (47, 64)], "skin_shadow", 1)
    elif pose in ("tray", "carry"):
        r(draw, 16, 48, 25, 57, "cream")
        r(draw, 54, 48, 64, 57, "cream")
        r(draw, 18, 55, 28, 61, "skin")
        r(draw, 51, 55, 62, 61, "skin")
        # Tray with a latte and salt bread so both food and drink read at a glance.
        r(draw, 22, 58, 58, 62, "brown_dark")
        r(draw, 24, 56, 56, 59, "wood")
        r(draw, 27, 52, 35, 57, "cream")
        r(draw, 28, 51, 34, 53, "paper")
        r(draw, 29, 52, 33, 54, "brown")
        e(draw, (41, 52, 51, 57), "orange", "brown_dark", 1)
        l(draw, [(43, 53), (46, 55), (49, 53)], "gold", 1)
    elif pose == "wash":
        r(draw, 19, 48, 31, 55, "cream")
        r(draw, 49, 48, 61, 55, "cream")
        r(draw, 27, 51, 38, 58, "skin")
        r(draw, 42, 51, 53, 58, "skin")
        e(draw, (31, 52, 47, 62), "foam", "teal", 1)
        r(draw, 37, 59, 39, 67, "water")
        r(draw, 43, 61, 45, 68, "water")
        r(draw, 56, 56, 64, 58, "teal")
        r(draw, 58, 52, 60, 56, "grey")
    elif pose == "wipe":
        r(draw, 16, 51, 29, 58, "cream")
        r(draw, 51, 48, 64, 55, "cream")
        r(draw, 23, 55, 35, 62, "skin")
        r(draw, 46, 53, 58, 60, "skin")
        r(draw, 11, 61, 69, 65, "wood")
        r(draw, 16, 58, 30, 63, "yellow")
        l(draw, [(20, 59), (27, 61)], "orange", 1)
        l(draw, [(34, 67), (47, 67)], "water", 1)
    elif pose == "point":
        r(draw, 18, 45, 26, 58, "cream")
        r(draw, 52, 43, 62, 55, "cream")
        r(draw, 19, 56, 27, 62, "skin")
        r(draw, 59, 43, 69, 47, "skin")
        r(draw, 65, 42, 76, 44, "skin")
        r(draw, 58, 56, 69, 66, "paper")
        l(draw, [(60, 59), (67, 59)], "ink2", 1)
        l(draw, [(60, 62), (65, 62)], "ink2", 1)
    elif pose == "think":
        r(draw, 20, 50, 29, 62, "cream")
        r(draw, 50, 49, 60, 61, "cream")
        r(draw, 22, 60, 31, 66, "skin")
        r(draw, 49, 48, 57, 54, "skin")
        l(draw, [(51, 53), (48, 47)], "skin_shadow", 2)
        pixel_text_question(draw, 61, 29, "gold")
    elif pose == "breathe":
        r(draw, 19, 50, 27, 61, "cream")
        r(draw, 53, 50, 61, 61, "cream")
        r(draw, 23, 58, 30, 64, "skin")
        r(draw, 48, 58, 55, 64, "skin")
        e(draw, (35, 51, 45, 59), "skin", "skin_shadow", 1)
        l(draw, [(30, 48), (27, 45)], "water", 1)
        l(draw, [(50, 48), (53, 45)], "water", 1)
    elif pose == "sweep":
        r(draw, 19, 49, 28, 61, "cream")
        r(draw, 49, 47, 59, 59, "cream")
        r(draw, 24, 57, 34, 63, "skin")
        r(draw, 44, 54, 55, 60, "skin")
        # Long broom, red apron silhouette stays unobstructed.
        l(draw, [(52, 38), (67, 84)], "brown_dark", 3)
        l(draw, [(54, 39), (69, 84)], "wood", 1)
        p(draw, [(64, 82), (73, 84), (76, 91), (58, 91)], "yellow")
        l(draw, [(61, 87), (73, 88)], "orange", 1)
        l(draw, [(14, 89), (10, 91)], "paper", 1)
        l(draw, [(16, 93), (11, 95)], "paper", 1)

    face_front(draw, "hair_brown", "hair_hi", eyes="closed" if pose == "breathe" else ("happy" if pose == "happy" else "open"))
    # Thin red bracelet is a stable Yeonwoo identifier.
    r(draw, 22, 62, 24, 63, "crimson")


def draw_dohyun(draw: ImageDraw.ImageDraw, pose: str, frame: int) -> None:
    ground(draw)
    stride = [-4, -1, 4, 1][frame % 4] if pose == "walk" else 0
    r(draw, 27, 65, 38, 88 + max(stride, 0), "black_pants")
    r(draw, 43, 65 - max(stride, 0), 54, 88, "black_pants")
    r(draw, 24, 87 + max(stride, 0), 39, 92 + max(stride, 0), "brown_dark")
    r(draw, 43, 87, 57, 92, "brown_dark")
    outlined_poly(draw, [(21, 39), (59, 39), (63, 68), (18, 68)], [(24, 41), (56, 41), (59, 65), (22, 65)], "cream")
    r(draw, 19, 44, 25, 62, "shirt_shadow")
    r(draw, 55, 44, 61, 62, "shirt_shadow")
    r(draw, 25, 40, 55, 70, "charcoal")
    p(draw, [(27, 42), (37, 42), (40, 51), (33, 63), (27, 59)], "charcoal_hi")
    p(draw, [(53, 42), (43, 42), (40, 51), (47, 63), (53, 59)], "charcoal_hi")
    r(draw, 38, 41, 42, 58, "wine")
    p(draw, [(36, 41), (44, 41), (41, 48), (39, 48)], "wine")
    for y in (53, 59, 65):
        e(draw, (38, y, 41, y + 3), "ink")

    if pose == "idle":
        r(draw, 20, 60, 28, 73, "cream")
        r(draw, 52, 60, 60, 73, "cream")
        r(draw, 22, 70, 29, 76, "skin")
        r(draw, 51, 70, 58, 76, "skin")
    elif pose == "walk":
        r(draw, 16, 46, 25, 61, "cream")
        r(draw, 55, 48, 65, 63, "cream")
        r(draw, 14, 59, 21, 65, "skin")
        r(draw, 61, 61, 68, 67, "skin")
    elif pose == "point":
        r(draw, 17, 47, 25, 60, "cream")
        r(draw, 54, 45, 64, 58, "cream")
        r(draw, 18, 58, 26, 64, "skin")
        r(draw, 61, 44, 70, 48, "skin")
        r(draw, 68, 43, 76, 45, "skin")
        r(draw, 60, 58, 70, 66, "paper")
        l(draw, [(62, 61), (68, 61)], "ink2", 1)
    elif pose == "thumb":
        r(draw, 17, 50, 26, 63, "cream")
        r(draw, 53, 46, 64, 60, "cream")
        r(draw, 18, 61, 26, 67, "skin")
        r(draw, 60, 50, 67, 59, "skin")
        r(draw, 63, 43, 67, 53, "skin")
        r(draw, 64, 40, 67, 46, "skin")
        r(draw, 68, 44, 70, 55, "skin")

    # Do this last so the large black hair and glasses are crisp.
    face_front(draw, "hair_dark", "hair_black_hi", glasses=None, eyes="happy" if pose == "thumb" else "open")
    # Rectangular glasses with a highlight.
    r(draw, 27, 22, 39, 31, "ink")
    r(draw, 29, 24, 37, 29, "cream")
    r(draw, 41, 22, 53, 31, "ink")
    r(draw, 43, 24, 51, 29, "cream")
    l(draw, [(39, 26), (41, 26)], "ink", 2)
    r(draw, 30, 24, 31, 25, "charcoal_hi")
    r(draw, 44, 24, 45, 25, "charcoal_hi")


def draw_sora(draw: ImageDraw.ImageDraw, pose: str, frame: int) -> None:
    ground(draw)
    stride = [-4, -1, 4, 1][frame % 4] if pose == "walk" else 0
    r(draw, 27, 65, 38, 88 + max(stride, 0), "black_pants")
    r(draw, 43, 65 - max(stride, 0), 54, 88, "black_pants")
    r(draw, 24, 87 + max(stride, 0), 39, 92 + max(stride, 0), "brown_dark")
    r(draw, 43, 87, 57, 92, "brown_dark")
    outlined_poly(draw, [(21, 39), (59, 39), (63, 68), (18, 68)], [(24, 41), (56, 41), (59, 65), (22, 65)], "cream")
    r(draw, 19, 44, 25, 62, "shirt_shadow")
    r(draw, 55, 44, 61, 62, "shirt_shadow")
    outlined_poly(draw, [(25, 42), (55, 42), (58, 71), (21, 71)], [(28, 44), (52, 44), (55, 68), (24, 68)], "crimson")
    r(draw, 28, 46, 52, 49, "crimson_mid")
    r(draw, 28, 58, 37, 63, "crimson_dark")
    r(draw, 42, 58, 52, 63, "crimson_dark")
    # Camera strap and instant camera distinguish Sora even at small scale.
    l(draw, [(29, 42), (36, 63)], "camera", 2)
    l(draw, [(52, 42), (45, 63)], "camera", 2)
    r(draw, 32, 57, 48, 68, "camera")
    r(draw, 34, 58, 46, 61, "cream")
    e(draw, (37, 61, 44, 68), "ink", "brown_dark", 1)
    e(draw, (39, 63, 42, 66), "charcoal_hi")

    if pose == "idle":
        r(draw, 19, 62, 28, 72, "cream")
        r(draw, 52, 62, 61, 72, "cream")
        r(draw, 21, 70, 29, 76, "skin")
        r(draw, 50, 70, 58, 76, "skin")
    elif pose == "walk":
        r(draw, 16, 47, 25, 61, "cream")
        r(draw, 55, 49, 65, 63, "cream")
        r(draw, 14, 59, 21, 65, "skin")
        r(draw, 61, 61, 68, 67, "skin")
    elif pose == "point":
        r(draw, 17, 47, 25, 60, "cream")
        r(draw, 54, 45, 64, 58, "cream")
        r(draw, 18, 58, 26, 64, "skin")
        r(draw, 61, 44, 70, 48, "skin")
        r(draw, 68, 43, 76, 45, "skin")
        r(draw, 59, 57, 70, 66, "paper")
        l(draw, [(61, 60), (68, 60)], "ink2", 1)
    elif pose == "thumb":
        r(draw, 17, 50, 26, 63, "cream")
        r(draw, 53, 46, 64, 60, "cream")
        r(draw, 18, 61, 26, 67, "skin")
        r(draw, 60, 50, 67, 59, "skin")
        r(draw, 63, 43, 67, 53, "skin")
        r(draw, 64, 40, 67, 46, "skin")

    face_front(draw, "hair_brown", "hair_hi", glasses="round", eyes="happy" if pose == "thumb" else "open", ponytail=True)


DRAWERS = {"yeonwoo": draw_yeonwoo_body, "dohyun": draw_dohyun, "sora": draw_sora}

POSES = {
    "yeonwoo": ["idle", "walk", "happy", "panic", "bow", "tray", "carry", "wash", "wipe", "point", "think", "breathe", "sweep"],
    "dohyun": ["idle", "walk", "point", "thumb"],
    "sora": ["idle", "walk", "point", "thumb"],
}


def render(character: str, pose: str, frame: int = 0) -> Image.Image:
    logical = blank()
    DRAWERS[character](ImageDraw.Draw(logical), pose, frame)
    return logical.resize(OUTPUT_SIZE, Image.Resampling.NEAREST)


def save_png(image: Image.Image, path: Path, force: bool) -> None:
    if path.exists() and not force:
        raise FileExistsError(f"Refusing to overwrite existing asset: {path}")
    path.parent.mkdir(parents=True, exist_ok=True)
    image.save(path, "PNG", optimize=True)


def save_json(data: dict, path: Path, force: bool) -> None:
    if path.exists() and not force:
        raise FileExistsError(f"Refusing to overwrite existing metadata: {path}")
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def make_character(character: str, force: bool) -> dict:
    poses = POSES[character]
    files = []
    for pose in poses:
        name = f"sd_{character}_{pose}.png"
        save_png(render(character, pose), OUT / name, force)
        files.append({"id": f"sd_{character}_{pose}", "file": name, "size": list(OUTPUT_SIZE), "logical_size": list(LOGICAL), "transparent": True})

    # A four-frame walk strip is useful when the user wants actual motion rather than a bobbing cutout.
    walk_frames = [render(character, "walk", frame) for frame in range(4)]
    walk_sheet = Image.new("RGBA", (OUTPUT_SIZE[0] * 4, OUTPUT_SIZE[1]), color("transparent"))
    for index, frame in enumerate(walk_frames):
        walk_sheet.alpha_composite(frame, (index * OUTPUT_SIZE[0], 0))
    walk_name = f"sd_{character}_walk_sheet.png"
    save_png(walk_sheet, OUT / walk_name, force)
    files.append({"id": f"sd_{character}_walk_sheet", "file": walk_name, "size": list(walk_sheet.size), "frame_size": list(OUTPUT_SIZE), "frames": 4, "transparent": True})
    return {"character": character, "source_reference": f"assets/stand/{character}_normal.png", "files": files}


def make_preview(manifest: dict, force: bool) -> None:
    labels = []
    for character in ("yeonwoo", "dohyun", "sora"):
        for pose in POSES[character]:
            labels.append((f"sd_{character}_{pose}.png", Image.open(OUT / f"sd_{character}_{pose}.png").convert("RGBA")))
    thumb_w, thumb_h = 160, 200
    cols = 6
    rows = (len(labels) + cols - 1) // cols
    preview = Image.new("RGBA", (cols * thumb_w, rows * (thumb_h + 22)), color("cream"))
    draw = ImageDraw.Draw(preview)
    for index, (name, image) in enumerate(labels):
        x, y = (index % cols) * thumb_w, (index // cols) * (thumb_h + 22)
        thumb = image.resize((thumb_w, thumb_h), Image.Resampling.NEAREST)
        preview.alpha_composite(thumb, (x, y))
        draw.text((x + 4, y + thumb_h + 4), name.replace("sd_", "")[:24], fill=color("ink"))
    save_png(preview.convert("RGB"), OUT / "sd_preview.png", force)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--force", action="store_true", help="allow replacing existing SD assets")
    args = parser.parse_args()
    OUT.mkdir(parents=True, exist_ok=True)
    manifest = {"version": 1, "output_size": list(OUTPUT_SIZE), "logical_size": list(LOGICAL), "scale": SCALE, "filter": "nearest", "characters": []}
    for character in ("yeonwoo", "dohyun", "sora"):
        manifest["characters"].append(make_character(character, args.force))
    save_json(manifest, OUT / "sd_manifest.json", args.force)
    make_preview(manifest, args.force)
    print(f"Generated detailed SD assets in {OUT}")


if __name__ == "__main__":
    main()
