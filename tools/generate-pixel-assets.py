"""Generate the first pixel-art asset pack described in docs/asset_requests.md.

The artwork is intentionally small, deterministic, and palette constrained so the
game can scale it with nearest-neighbour filtering without introducing blur.
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont, ImageOps


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "assets" / "pixel"

P = {
    "ink": "#17141C",
    "ink_soft": "#3B2930",
    "cream": "#FFF7E8",
    "paper": "#FFEED0",
    "warm": "#F5D7A6",
    "shadow": "#C78B68",
    "skin": "#F3B58E",
    "skin_shadow": "#C97965",
    "hair": "#2A1C1E",
    "hair_brown": "#5B352B",
    "hair_hi": "#8A5540",
    "crimson": "#E3262E",
    "crimson_dark": "#9E1F2A",
    "wine": "#762C3A",
    "charcoal": "#3D414B",
    "blue": "#5D8FD6",
    "blue_dark": "#355B91",
    "teal": "#4CA99F",
    "green": "#78B45C",
    "green_dark": "#3E7B51",
    "yellow": "#FFD43B",
    "gold": "#E4AD38",
    "orange": "#E9853E",
    "brown": "#8B4A2C",
    "brown_dark": "#5B3426",
    "wood": "#B86E3C",
    "glass": "#BCE5E6",
    "water": "#73C6E8",
    "foam": "#E9FAF3",
    "lavender": "#A18AC2",
    "grey": "#87909B",
    "white": "#FFFFFF",
    "transparent": (0, 0, 0, 0),
}


def rgba(color: str | tuple[int, int, int, int]) -> tuple[int, int, int, int]:
    if isinstance(color, tuple):
        return color
    value = color.lstrip("#")
    return tuple(int(value[index : index + 2], 16) for index in (0, 2, 4)) + (255,)


def blank(size: tuple[int, int]) -> Image.Image:
    return Image.new("RGBA", size, rgba(P["transparent"]))


def fill(draw: ImageDraw.ImageDraw, box: tuple[int, int, int, int], color: str) -> None:
    draw.rectangle(box, fill=rgba(P[color]))


def poly(draw: ImageDraw.ImageDraw, points: list[tuple[int, int]], color: str) -> None:
    draw.polygon(points, fill=rgba(P[color]))


def line(draw: ImageDraw.ImageDraw, points: list[tuple[int, int]], color: str, width: int = 1) -> None:
    draw.line(points, fill=rgba(P[color]), width=width, joint="curve")


def save_png(image: Image.Image, path: Path, force: bool) -> None:
    if path.exists() and not force:
        raise FileExistsError(f"Refusing to overwrite existing asset: {path}")
    path.parent.mkdir(parents=True, exist_ok=True)
    image.save(path, "PNG", optimize=True)


def save_json(data: dict, path: Path, force: bool) -> None:
    if path.exists() and not force:
        raise FileExistsError(f"Refusing to overwrite existing metadata: {path}")
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def draw_head(draw: ImageDraw.ImageDraw, character: str, direction: str, y: int = 4) -> None:
    hair = "hair_brown" if character == "yeonwoo" else "hair"
    if character == "sora":
        hair = "hair_brown"

    if direction == "up":
        poly(draw, [(5, y + 4), (7, y + 1), (16, y + 1), (19, y + 5), (18, y + 13), (6, y + 13)], hair)
        fill(draw, (7, y + 3, 16, y + 6), "hair_hi")
        fill(draw, (5, y + 8, 7, y + 14), hair)
        fill(draw, (17, y + 7, 19, y + 14), hair)
        return

    if direction in ("left", "right"):
        poly(draw, [(7, y + 3), (10, y + 1), (17, y + 3), (18, y + 8), (16, y + 13), (8, y + 13)], "skin")
        poly(draw, [(5, y + 4), (8, y + 1), (17, y + 2), (19, y + 7), (16, y + 7), (14, y + 4), (8, y + 6), (7, y + 13), (5, y + 12)], hair)
        fill(draw, (9, y + 7, 10, y + 8), "ink")
        fill(draw, (16, y + 8, 17, y + 9), "skin_shadow")
        if direction == "right":
            fill(draw, (6, y + 4, 8, y + 10), hair)
        else:
            fill(draw, (16, y + 4, 18, y + 10), hair)
        return

    poly(draw, [(7, y + 3), (9, y + 1), (16, y + 2), (18, y + 6), (17, y + 13), (7, y + 13)], "skin")
    poly(draw, [(5, y + 5), (7, y + 2), (10, y), (17, y + 2), (19, y + 6), (17, y + 8), (16, y + 5), (13, y + 6), (10, y + 5), (8, y + 8), (7, y + 14), (5, y + 12)], hair)
    fill(draw, (9, y + 8, 10, y + 9), "ink")
    fill(draw, (14, y + 8, 15, y + 9), "ink")
    fill(draw, (11, y + 11, 13, y + 11), "skin_shadow")
    if character == "dohyun":
        line(draw, [(8, y + 7), (11, y + 7), (12, y + 8), (15, y + 7), (17, y + 7)], "ink", 1)
    if character == "sora":
        fill(draw, (8, y + 7, 10, y + 9), "ink_soft")
        fill(draw, (14, y + 7, 16, y + 9), "ink_soft")


def draw_ponytail(draw: ImageDraw.ImageDraw, direction: str, frame: int) -> None:
    side = 17 if direction != "left" else 5
    sway = (frame % 3) - 1
    poly(draw, [(side, 5), (side + sway, 4), (side + 4, 7), (side + 3, 13), (side, 15)], "hair_brown")
    fill(draw, (side + 1, 7, side + 2, 8), "hair_hi")


def draw_legs(draw: ImageDraw.ImageDraw, frame: int, direction: str, shoe: str = "brown_dark") -> None:
    stride = ((frame % 4) - 1) * 2
    if direction == "up":
        stride = -stride
    if direction in ("left", "right"):
        fill(draw, (8, 27, 13, 36 + stride), "charcoal")
        fill(draw, (12, 28 - stride, 17, 37), "charcoal")
    else:
        fill(draw, (7, 27, 11, 36 + stride), "charcoal")
        fill(draw, (13, 27 - stride, 17, 36), "charcoal")
    fill(draw, (6, 35 + stride, 11, 38 + stride), shoe)
    fill(draw, (13, 35, 18, 38), shoe)


def draw_torso(draw: ImageDraw.ImageDraw, character: str, direction: str) -> None:
    if direction in ("left", "right"):
        fill(draw, (8, 15, 17, 28), "cream")
        if character == "yeonwoo" or character == "sora":
            poly(draw, [(9, 18), (16, 17), (17, 29), (8, 29)], "crimson")
        elif character == "dohyun":
            poly(draw, [(10, 16), (17, 16), (17, 28), (9, 28)], "charcoal")
            fill(draw, (13, 16, 14, 22), "wine")
        return

    fill(draw, (6, 15, 17, 28), "cream")
    if character in ("yeonwoo", "sora"):
        poly(draw, [(7, 17), (16, 17), (18, 29), (5, 29)], "crimson")
        fill(draw, (8, 18, 15, 20), "crimson_dark")
        fill(draw, (7, 26, 17, 28), "crimson_dark")
        fill(draw, (6, 22, 7, 24), "gold")
    else:
        poly(draw, [(7, 16), (16, 16), (18, 28), (5, 28)], "charcoal")
        fill(draw, (11, 16, 12, 22), "wine")
        fill(draw, (12, 16, 13, 21), "cream")


def draw_arms(draw: ImageDraw.ImageDraw, character: str, direction: str, pose: str, frame: int) -> None:
    sleeve = "cream"
    if pose == "wash":
        fill(draw, (2, 18, 7, 21), sleeve)
        fill(draw, (16, 18, 21, 21), sleeve)
        fill(draw, (6, 19, 10, 22), "skin")
        fill(draw, (14, 19, 18, 22), "skin")
        fill(draw, (8, 21, 15, 23), "foam")
        fill(draw, (10 + frame % 2, 24, 11 + frame % 2, 25), "water")
        fill(draw, (14 - frame % 2, 24, 15 - frame % 2, 25), "water")
        return
    if pose == "carry":
        fill(draw, (2, 18, 7, 21), sleeve)
        fill(draw, (17, 18, 22, 21), sleeve)
        fill(draw, (6, 20, 9, 22), "skin")
        fill(draw, (15, 20, 18, 22), "skin")
        return
    if pose == "wipe":
        fill(draw, (6, 18, 10, 21), sleeve)
        fill(draw, (15, 18, 20, 21), sleeve)
        fill(draw, (7, 20, 11, 23), "skin")
        fill(draw, (16, 20, 20, 23), "skin")
        fill(draw, (18, 22, 22, 23), "yellow")
        return
    if pose == "point":
        fill(draw, (4, 17, 8, 21), sleeve)
        fill(draw, (15, 17, 19, 21), sleeve)
        fill(draw, (18, 17, 22, 18), "skin")
        fill(draw, (20, 16, 22, 17), "skin")
        return
    if pose == "bow":
        fill(draw, (6, 19, 9, 27), sleeve)
        fill(draw, (14, 19, 17, 27), sleeve)
        fill(draw, (7, 26, 9, 28), "skin")
        fill(draw, (14, 26, 16, 28), "skin")
        return
    if pose == "panic":
        fill(draw, (2, 15, 6, 22), sleeve)
        fill(draw, (18, 15, 22, 22), sleeve)
        fill(draw, (3, 14, 6, 16), "skin")
        fill(draw, (18, 14, 21, 16), "skin")
        return
    if pose == "happy":
        fill(draw, (2, 13, 6, 19), sleeve)
        fill(draw, (18, 13, 22, 19), sleeve)
        fill(draw, (2, 12, 5, 14), "skin")
        fill(draw, (19, 12, 22, 14), "skin")
        return

    if direction in ("left", "right"):
        fill(draw, (4, 18, 9, 26), sleeve)
        fill(draw, (16, 18, 20, 26), sleeve)
        fill(draw, (4, 25, 8, 27), "skin")
        fill(draw, (16, 25, 20, 27), "skin")
    else:
        fill(draw, (2, 18, 6, 26), sleeve)
        fill(draw, (17, 18, 21, 26), sleeve)
        fill(draw, (3, 25, 7, 27), "skin")
        fill(draw, (16, 25, 20, 27), "skin")


def render_character(character: str, pose: str, frame: int, direction: str = "down") -> Image.Image:
    actual_direction = "right" if direction == "left" else direction
    image = blank((24, 40))
    draw = ImageDraw.Draw(image)
    bob = -1 if pose == "walk" and frame % 4 == 1 else 0
    head_y = 4 + bob
    draw_legs(draw, frame, actual_direction)
    draw_torso(draw, character, actual_direction)
    draw_arms(draw, character, actual_direction, pose, frame)
    draw_head(draw, character, actual_direction, head_y)
    if character == "sora":
        draw_ponytail(draw, actual_direction, frame)
        line(draw, [(7, 17), (17, 23)], "ink_soft", 1)
        fill(draw, (16, 21, 18, 24), "charcoal")
        fill(draw, (17, 21, 18, 22), "gold")
    if character == "yeonwoo":
        fill(draw, (7, 24, 7, 25), "crimson")
        fill(draw, (7, 25, 8, 25), "gold")
    if character == "dohyun":
        fill(draw, (11, 23, 12, 25), "wine")
    if pose == "carry":
        fill(draw, (5, 21, 18, 22), "brown_dark")
        fill(draw, (6, 20, 17, 21), "wood")
        fill(draw, (8, 18, 10, 20), "cream")
        fill(draw, (13, 18, 15, 20), "glass")
        fill(draw, (9, 18, 9, 18), "crimson")
    if pose == "panic":
        fill(draw, (20, 7, 21, 8), "water")
        fill(draw, (21, 9, 22, 10), "water")
    if pose == "happy":
        fill(draw, (1, 9, 2, 10), "yellow")
        fill(draw, (21, 8, 22, 9), "yellow")
    if pose == "bow":
        fill(draw, (7, 29, 17, 30), "crimson_dark" if character in ("yeonwoo", "sora") else "charcoal")
    if direction == "left":
        image = ImageOps.mirror(image)
    return image


def make_sprite_sheet(character: str, layouts: list[tuple[str, int]], force: bool) -> None:
    cell_w, cell_h, cols = 24, 40, 8
    total = sum(count for _, count in layouts)
    rows = (total + cols - 1) // cols
    sheet = blank((cell_w * cols, cell_h * rows))
    frames: dict[str, dict] = {}
    tags: dict[str, list[str]] = {}
    slot = 0

    for tag, count in layouts:
        tags.setdefault(tag, [])
        for frame in range(count):
            direction = "down"
            pose = tag
            if tag.startswith("walk_"):
                pose = "walk"
                direction = tag.split("_", 1)[1]
            elif tag in {"idle", "wash", "carry", "wipe", "bow", "panic", "happy", "point"}:
                direction = "down"
            x = (slot % cols) * cell_w
            y = (slot // cols) * cell_h
            sheet.alpha_composite(render_character(character, pose, frame, direction), (x, y))
            name = f"{tag}_{frame}"
            frames[name] = {"x": x, "y": y, "w": cell_w, "h": cell_h, "duration": 140}
            tags[tag].append(name)
            slot += 1

    image_name = f"{character}.png"
    save_png(sheet, OUT / image_name, force)
    save_json(
        {
            "version": 1,
            "image": image_name,
            "cell": {"width": cell_w, "height": cell_h},
            "scale": 4,
            "filter": "nearest",
            "frames": frames,
            "tags": tags,
        },
        OUT / f"{character}.json",
        force,
    )


TILE_NAMES = [
    "floor_cream", "floor_checker", "floor_shadow", "wall_cream", "wall_brick", "wall_trim",
    "counter_top", "counter_front", "counter_corner", "showcase_empty", "showcase_bread", "glass_highlight",
    "cup_rack", "paper_cup_slot", "ice_cup_slot", "straw_cup", "sink_basin", "sink_faucet", "sink_soap", "wash_poster",
    "warning_sign", "open_sign", "chair_seat", "chair_leg", "shelf", "shelf_bread", "plant_pot", "plant_leaf",
    "pendant_light", "window_day", "window_glow", "door_frame", "door_glass", "tile_crimson", "tile_cream",
]


def tile_image(kind: str) -> Image.Image:
    image = Image.new("RGBA", (16, 16), rgba(P["transparent"]))
    draw = ImageDraw.Draw(image)
    if kind == "floor_cream":
        fill(draw, (0, 0, 15, 15), "warm")
        line(draw, [(0, 15), (15, 15)], "paper")
    elif kind == "floor_checker":
        fill(draw, (0, 0, 15, 15), "paper")
        fill(draw, (0, 0, 7, 7), "warm")
        fill(draw, (8, 8, 15, 15), "warm")
    elif kind == "floor_shadow":
        fill(draw, (0, 0, 15, 15), "warm")
        fill(draw, (0, 12, 15, 15), "shadow")
    elif kind == "wall_cream":
        fill(draw, (0, 0, 15, 15), "cream")
        line(draw, [(0, 3), (15, 3)], "paper")
    elif kind == "wall_brick":
        fill(draw, (0, 0, 15, 15), "brown_dark")
        for y in (3, 8, 13):
            line(draw, [(0, y), (15, y)], "brown")
        line(draw, [(5, 0), (5, 3)], "brown")
        line(draw, [(12, 3), (12, 8)], "brown")
        line(draw, [(3, 8), (3, 13)], "brown")
    elif kind == "wall_trim":
        fill(draw, (0, 0, 15, 15), "cream")
        fill(draw, (0, 12, 15, 15), "wood")
        fill(draw, (0, 12, 15, 12), "brown_dark")
    elif kind == "counter_top":
        fill(draw, (0, 0, 15, 15), "wood")
        fill(draw, (0, 0, 15, 2), "brown_dark")
        line(draw, [(2, 5), (13, 5)], "brown")
        line(draw, [(5, 9), (15, 9)], "brown")
    elif kind == "counter_front":
        fill(draw, (0, 0, 15, 15), "brown")
        fill(draw, (0, 0, 15, 2), "brown_dark")
        fill(draw, (2, 5, 13, 6), "wood")
        fill(draw, (2, 10, 13, 11), "wood")
    elif kind == "counter_corner":
        fill(draw, (0, 0, 15, 15), "wood")
        fill(draw, (0, 0, 15, 3), "brown_dark")
        fill(draw, (0, 3, 3, 15), "brown")
    elif kind == "showcase_empty":
        fill(draw, (0, 0, 15, 15), "brown_dark")
        fill(draw, (2, 2, 13, 11), "glass")
        fill(draw, (3, 3, 12, 10), "teal")
        fill(draw, (4, 4, 11, 9), "cream")
        fill(draw, (0, 12, 15, 15), "wood")
    elif kind == "showcase_bread":
        image = tile_image("showcase_empty")
        draw = ImageDraw.Draw(image)
        fill(draw, (5, 7, 8, 8), "orange")
        fill(draw, (9, 6, 12, 8), "gold")
        fill(draw, (6, 7, 7, 7), "cream")
    elif kind == "glass_highlight":
        fill(draw, (0, 0, 15, 15), "glass")
        fill(draw, (2, 2, 3, 10), "white")
        fill(draw, (5, 3, 6, 6), "white")
    elif kind == "cup_rack":
        fill(draw, (0, 0, 15, 15), "brown_dark")
        fill(draw, (2, 2, 13, 3), "wood")
        fill(draw, (2, 12, 13, 13), "wood")
        for x in (3, 7, 11):
            fill(draw, (x, 5, x + 2, 10), "cream")
            fill(draw, (x, 5, x + 2, 6), "crimson")
    elif kind == "paper_cup_slot":
        fill(draw, (0, 0, 15, 15), "wood")
        fill(draw, (3, 3, 11, 13), "cream")
        fill(draw, (3, 7, 11, 8), "crimson")
        fill(draw, (5, 2, 9, 3), "paper")
    elif kind == "ice_cup_slot":
        fill(draw, (0, 0, 15, 15), "wood")
        fill(draw, (3, 3, 12, 13), "glass")
        fill(draw, (5, 5, 10, 12), "water")
        fill(draw, (5, 3, 10, 4), "paper")
    elif kind == "straw_cup":
        fill(draw, (0, 0, 15, 15), "wood")
        fill(draw, (5, 7, 10, 13), "cream")
        line(draw, [(7, 7), (10, 2)], "crimson", 1)
    elif kind == "sink_basin":
        fill(draw, (0, 0, 15, 15), "cream")
        fill(draw, (2, 6, 13, 12), "grey")
        fill(draw, (3, 7, 12, 10), "water")
        fill(draw, (5, 9, 10, 11), "blue")
    elif kind == "sink_faucet":
        fill(draw, (0, 0, 15, 15), "cream")
        fill(draw, (7, 2, 9, 7), "grey")
        fill(draw, (7, 2, 12, 3), "grey")
        fill(draw, (11, 2, 12, 6), "grey")
        fill(draw, (10, 6, 11, 8), "water")
    elif kind == "sink_soap":
        fill(draw, (0, 0, 15, 15), "cream")
        fill(draw, (5, 6, 10, 12), "teal")
        fill(draw, (6, 5, 9, 6), "foam")
        fill(draw, (7, 3, 8, 5), "brown_dark")
    elif kind == "wash_poster":
        fill(draw, (0, 0, 15, 15), "paper")
        fill(draw, (2, 2, 13, 13), "cream")
        for x, y, c in ((3, 3, "water"), (8, 3, "foam"), (3, 8, "green"), (8, 8, "yellow")):
            fill(draw, (x, y, x + 3, y + 3), c)
        line(draw, [(4, 12), (11, 12)], "crimson", 1)
    elif kind in ("warning_sign", "open_sign"):
        fill(draw, (0, 0, 15, 15), "cream")
        fill(draw, (3, 2, 12, 10), "yellow" if kind == "warning_sign" else "crimson")
        fill(draw, (6, 11, 9, 14), "brown_dark")
        if kind == "warning_sign":
            poly(draw, [(7, 4), (5, 8), (9, 8)], "crimson_dark")
        else:
            fill(draw, (5, 5, 10, 7), "cream")
    elif kind == "chair_seat":
        fill(draw, (2, 3, 13, 6), "wood")
        fill(draw, (3, 2, 12, 3), "brown_dark")
        fill(draw, (4, 7, 5, 14), "brown_dark")
        fill(draw, (10, 7, 11, 14), "brown_dark")
    elif kind == "chair_leg":
        fill(draw, (5, 2, 10, 4), "wood")
        fill(draw, (6, 4, 7, 14), "brown_dark")
        fill(draw, (9, 4, 10, 14), "brown_dark")
    elif kind == "shelf":
        fill(draw, (1, 2, 14, 4), "wood")
        fill(draw, (1, 11, 14, 13), "wood")
        fill(draw, (2, 4, 3, 12), "brown_dark")
        fill(draw, (12, 4, 13, 12), "brown_dark")
    elif kind == "shelf_bread":
        image = tile_image("shelf")
        draw = ImageDraw.Draw(image)
        fill(draw, (4, 7, 7, 9), "orange")
        fill(draw, (8, 6, 11, 9), "gold")
    elif kind == "plant_pot":
        fill(draw, (4, 9, 11, 14), "orange")
        fill(draw, (3, 8, 12, 10), "brown")
    elif kind == "plant_leaf":
        fill(draw, (7, 8, 8, 14), "green_dark")
        fill(draw, (4, 5, 9, 9), "green")
        fill(draw, (8, 3, 12, 8), "green")
    elif kind == "pendant_light":
        fill(draw, (7, 0, 8, 6), "ink_soft")
        poly(draw, [(3, 6), (12, 6), (10, 10), (5, 10)], "gold")
        fill(draw, (6, 8, 9, 9), "yellow")
    elif kind == "window_day":
        fill(draw, (0, 0, 15, 15), "blue")
        fill(draw, (2, 2, 13, 13), "glass")
        fill(draw, (7, 2, 8, 13), "cream")
        fill(draw, (2, 7, 13, 8), "cream")
        fill(draw, (3, 3, 5, 4), "white")
    elif kind == "window_glow":
        fill(draw, (0, 0, 15, 15), "orange")
        fill(draw, (2, 2, 13, 13), "yellow")
        fill(draw, (7, 2, 8, 13), "cream")
        fill(draw, (2, 7, 13, 8), "cream")
    elif kind == "door_frame":
        fill(draw, (0, 0, 15, 15), "brown_dark")
        fill(draw, (3, 0, 12, 15), "wood")
        fill(draw, (5, 2, 10, 13), "glass")
    elif kind == "door_glass":
        fill(draw, (0, 0, 15, 15), "glass")
        line(draw, [(3, 0), (3, 15)], "cream")
        line(draw, [(12, 0), (12, 15)], "cream")
        fill(draw, (8, 7, 9, 8), "gold")
    elif kind == "tile_crimson":
        fill(draw, (0, 0, 15, 15), "crimson")
        fill(draw, (1, 1, 14, 14), "crimson_dark")
        fill(draw, (2, 2, 13, 13), "crimson")
    elif kind == "tile_cream":
        fill(draw, (0, 0, 15, 15), "cream")
        fill(draw, (1, 1, 14, 14), "paper")
    return image


def make_tileset(force: bool) -> None:
    cols = 16
    sheet = blank((cols * 16, ((len(TILE_NAMES) + cols - 1) // cols) * 16))
    frames = {}
    for index, name in enumerate(TILE_NAMES):
        x, y = (index % cols) * 16, (index // cols) * 16
        sheet.alpha_composite(tile_image(name), (x, y))
        frames[name] = {"x": x, "y": y, "w": 16, "h": 16}
    save_png(sheet, OUT / "cafe_tileset.png", force)
    save_json(
        {"version": 1, "image": "cafe_tileset.png", "tile": {"width": 16, "height": 16}, "frames": frames},
        OUT / "cafe_tileset.json",
        force,
    )


PROP_NAMES = [
    "paper_cup", "ice_cup", "straw", "lid", "salt_bread", "croissant", "muffin", "americano",
    "latte", "milk", "juice", "dishcloth", "trash_bin", "chair", "light_switch", "badge",
]


def prop_image(name: str) -> Image.Image:
    image = blank((16, 16))
    draw = ImageDraw.Draw(image)
    if name == "paper_cup":
        fill(draw, (4, 4, 11, 13), "cream")
        fill(draw, (4, 7, 11, 8), "crimson")
        fill(draw, (3, 3, 12, 4), "paper")
        fill(draw, (6, 13, 9, 14), "brown_dark")
    elif name == "ice_cup":
        fill(draw, (3, 3, 12, 4), "paper")
        poly(draw, [(4, 4), (11, 4), (10, 13), (5, 13)], "glass")
        fill(draw, (5, 8, 10, 12), "water")
        fill(draw, (6, 6, 7, 7), "white")
    elif name == "straw":
        line(draw, [(7, 14), (7, 4), (11, 2)], "crimson", 2)
        fill(draw, (10, 1, 12, 2), "crimson")
    elif name == "lid":
        fill(draw, (2, 6, 13, 8), "cream")
        fill(draw, (4, 4, 11, 6), "paper")
        fill(draw, (6, 3, 9, 4), "ink_soft")
    elif name in ("salt_bread", "croissant", "muffin"):
        fill(draw, (2, 11, 13, 13), "paper")
        if name == "salt_bread":
            poly(draw, [(3, 10), (5, 6), (11, 5), (13, 10)], "orange")
            fill(draw, (6, 6, 7, 7), "cream")
            fill(draw, (9, 6, 10, 7), "cream")
        elif name == "croissant":
            poly(draw, [(3, 8), (5, 5), (8, 7), (10, 5), (13, 8), (11, 12), (5, 12)], "gold")
            line(draw, [(6, 7), (5, 10)], "brown", 1)
            line(draw, [(9, 7), (10, 10)], "brown", 1)
        else:
            fill(draw, (4, 5, 11, 11), "brown")
            fill(draw, (3, 7, 12, 9), "orange")
            fill(draw, (5, 4, 10, 5), "cream")
    elif name in ("americano", "latte", "milk", "juice"):
        fill(draw, (4, 5, 11, 13), "cream" if name != "juice" else "orange")
        fill(draw, (5, 6, 10, 11), "brown_dark" if name == "americano" else ("warm" if name == "latte" else ("white" if name == "milk" else "orange")))
        fill(draw, (5, 4, 10, 5), "paper")
        if name == "latte":
            fill(draw, (7, 7, 8, 8), "cream")
            fill(draw, (6, 8, 9, 9), "cream")
        if name == "juice":
            fill(draw, (5, 5, 10, 6), "yellow")
    elif name == "dishcloth":
        poly(draw, [(2, 5), (13, 3), (14, 11), (4, 13)], "yellow")
        line(draw, [(4, 6), (12, 5)], "orange", 1)
        line(draw, [(5, 9), (13, 8)], "orange", 1)
    elif name == "trash_bin":
        fill(draw, (3, 5, 12, 14), "teal")
        fill(draw, (2, 3, 13, 5), "green_dark")
        fill(draw, (6, 1, 9, 3), "ink_soft")
        line(draw, [(5, 7), (5, 12)], "green_dark")
        line(draw, [(9, 7), (9, 12)], "green_dark")
    elif name == "chair":
        fill(draw, (3, 3, 12, 6), "wood")
        fill(draw, (4, 7, 5, 14), "brown_dark")
        fill(draw, (10, 7, 11, 14), "brown_dark")
        fill(draw, (4, 6, 11, 8), "wood")
    elif name == "light_switch":
        fill(draw, (4, 2, 11, 13), "cream")
        fill(draw, (6, 5, 9, 10), "gold")
        fill(draw, (7, 6, 8, 9), "yellow")
    elif name == "badge":
        poly(draw, [(8, 2), (12, 6), (10, 12), (6, 12), (4, 6)], "gold")
        fill(draw, (7, 5, 9, 8), "yellow")
        fill(draw, (7, 9, 9, 10), "cream")
    return image


def make_props(force: bool) -> None:
    cols = 8
    sheet = blank((cols * 16, ((len(PROP_NAMES) + cols - 1) // cols) * 16))
    frames = {}
    for index, name in enumerate(PROP_NAMES):
        x, y = (index % cols) * 16, (index // cols) * 16
        sheet.alpha_composite(prop_image(name), (x, y))
        frames[name] = {"x": x, "y": y, "w": 16, "h": 16}
    save_png(sheet, OUT / "props.png", force)
    save_json({"version": 1, "image": "props.png", "cell": {"width": 16, "height": 16}, "frames": frames}, OUT / "props.json", force)


EFFECT_NAMES = ["bubble_small", "bubble_large", "droplet_left", "droplet_right", "sparkle", "sparkle_big", "germ_happy", "germ_worried", "steam", "heart", "star", "dust"]


def effect_image(name: str, frame: int) -> Image.Image:
    image = blank((16, 16))
    draw = ImageDraw.Draw(image)
    if name.startswith("bubble"):
        size = 3 if name == "bubble_small" else 5
        x = 6 + (frame % 2)
        y = 8 - (frame % 3)
        line(draw, [(x, y), (x + size, y), (x + size + 1, y + 2), (x + size, y + size), (x, y + size), (x - 1, y + 2), (x, y)], "foam", 1)
    elif name.startswith("droplet"):
        x = 5 if name.endswith("left") else 10
        y = 4 + (frame % 3)
        poly(draw, [(x, y), (x - 2, y + 4), (x, y + 7), (x + 2, y + 4)], "water")
        fill(draw, (x, y + 2, x, y + 3), "white")
    elif name == "sparkle":
        fill(draw, (7, 3, 8, 12), "yellow")
        fill(draw, (3, 7, 12, 8), "yellow")
        fill(draw, (6, 6, 9, 9), "cream")
    elif name == "sparkle_big":
        fill(draw, (7, 1, 8, 14), "yellow")
        fill(draw, (1, 7, 14, 8), "yellow")
        fill(draw, (5, 5, 10, 10), "cream")
    elif name.startswith("germ"):
        body = "green" if name.endswith("happy") else "lavender"
        fill(draw, (5, 5, 10, 11), body)
        for x, y in ((4, 6), (11, 6), (4, 10), (11, 10)):
            fill(draw, (x, y, x + 1, y + 1), body)
        fill(draw, (6, 7, 6, 8), "ink")
        fill(draw, (9, 7, 9, 8), "ink")
        if name.endswith("happy"):
            line(draw, [(7, 9), (8, 10), (9, 9)], "ink", 1)
        else:
            line(draw, [(7, 10), (8, 9), (9, 10)], "ink", 1)
    elif name == "steam":
        line(draw, [(5, 12), (4, 9), (6, 6), (5, 3)], "foam", 1)
        line(draw, [(10, 12), (11, 9), (9, 6), (10, 3)], "foam", 1)
    elif name == "heart":
        fill(draw, (5, 5, 7, 8), "crimson")
        fill(draw, (9, 5, 11, 8), "crimson")
        poly(draw, [(4, 7), (12, 7), (8, 13)], "crimson")
    elif name == "star":
        poly(draw, [(8, 2), (10, 6), (14, 6), (11, 9), (12, 13), (8, 10), (4, 13), (5, 9), (2, 6), (6, 6)], "yellow")
    elif name == "dust":
        for x, y in ((4, 8), (8, 5), (11, 10), (6, 12)):
            fill(draw, (x, y, x + 1, y + 1), "paper")
    return image


def make_effects(force: bool) -> None:
    cols, frames_per_effect = 8, 2
    sheet = blank((cols * 16, ((len(EFFECT_NAMES) * frames_per_effect + cols - 1) // cols) * 16))
    frames = {}
    for index, name in enumerate(EFFECT_NAMES):
        for frame in range(frames_per_effect):
            slot = index * frames_per_effect + frame
            x, y = (slot % cols) * 16, (slot // cols) * 16
            sheet.alpha_composite(effect_image(name, frame), (x, y))
            frames[f"{name}_{frame}"] = {"x": x, "y": y, "w": 16, "h": 16, "duration": 120}
    save_png(sheet, OUT / "effects.png", force)
    save_json({"version": 1, "image": "effects.png", "cell": {"width": 16, "height": 16}, "frames": frames}, OUT / "effects.json", force)

    bubble = blank((64, 32))
    bd = ImageDraw.Draw(bubble)
    poly(bd, [(3, 4), (58, 4), (61, 7), (61, 23), (56, 27), (18, 27), (12, 31), (13, 27), (7, 27), (3, 23)], "cream")
    line(bd, [(3, 4), (58, 4), (61, 7), (61, 23), (56, 27), (18, 27), (12, 31), (13, 27), (7, 27), (3, 23), (3, 4)], "ink", 2)
    font_path = Path("C:/Windows/Fonts/malgun.ttf")
    if font_path.exists():
        font = ImageFont.truetype(str(font_path), 15)
        bd.text((16, 7), "아차!", font=font, fill=rgba(P["crimson"]), stroke_width=1, stroke_fill=rgba(P["ink"]))
    else:
        fill(bd, (20, 10, 43, 20), "crimson")
    save_png(bubble, OUT / "acha_bubble.png", force)


def make_preview(force: bool) -> None:
    names = ["dohyun.png", "sora.png", "cafe_tileset.png", "props.png", "effects.png", "acha_bubble.png"]
    source = [Image.open(OUT / name).convert("RGBA") for name in names]
    scale = 4
    cards = []
    for name, image in zip(names, source):
        scaled = image.resize((image.width * scale, image.height * scale), Image.Resampling.NEAREST)
        card = Image.new("RGBA", (max(scaled.width, 1024), scaled.height + 48), rgba(P["cream"]))
        card.alpha_composite(scaled, ((card.width - scaled.width) // 2, 40))
        d = ImageDraw.Draw(card)
        d.text((16, 12), name, fill=rgba(P["ink"]))
        cards.append(card)
    width = max(card.width for card in cards)
    height = sum(card.height for card in cards)
    preview = Image.new("RGBA", (width, height), rgba(P["cream"]))
    y = 0
    for card in cards:
        preview.alpha_composite(card, (0, y))
        y += card.height
    save_png(preview.convert("RGB"), OUT / "preview.png", force)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--force", action="store_true", help="allow replacing generated files")
    args = parser.parse_args()
    OUT.mkdir(parents=True, exist_ok=True)

    # 연우는 2026-10-25부터 Flow로 만든 SD 시트를 씀(tools/import-pixel-sheet.py). 여기서 만들면 그 시트를 덮어써서 뺌.
    make_sprite_sheet("dohyun", [("idle", 4), ("walk_down", 4), ("walk_left", 4), ("walk_right", 4), ("walk_up", 4), ("point", 4)], args.force)
    make_sprite_sheet("sora", [("idle", 4), ("walk_down", 4), ("walk_left", 4), ("walk_right", 4), ("walk_up", 4), ("point", 4)], args.force)
    make_tileset(args.force)
    make_props(args.force)
    make_effects(args.force)
    make_preview(args.force)
    print(f"Generated pixel assets in {OUT}")


if __name__ == "__main__":
    main()
