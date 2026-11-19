"""
Flow로 만든 SD 픽셀 그림 → 게임용 픽셀 시트 (assets/pixel/*.png + *.json)

  python tools/import-pixel-sheet.py                    # 모두 다시 만듦 (npm run pixel)
  python tools/import-pixel-sheet.py yeonwoo room       # 일부만 (yeonwoo · room · objects)
  python tools/import-pixel-sheet.py --check            # assets/_src/_check/ 에 자른 결과(어두운 바탕·이름)만

원본: assets/_src/pixel/ (프롬프트는 docs/image_requests.md G-2·G-3, 원래 파일 이름은 assets/_src/SOURCES.md)
  yeonwoo  px_yeonwoo_sheet.jpg  8칸 × 6줄 연우 동작 → yeonwoo.png/json
    - 초록과 칸 선을 지우고, 초록 기운이 도는 테두리는 초록만 덜어 냅니다.
    - 동작마다 칸을 모아 머리 가운데와 발끝을 맞춥니다(생성 그림이라 칸마다 1~3px 흔들림).
      점프처럼 발이 뜬 칸(LAYOUT 의 air)은 그 동작의 발끝 높이를 기준으로 원래 높이를 그대로 둡니다.
    - 생성 그림은 픽셀 격자가 고르지 않아 작게 줄이지 않고 원본 크기 그대로 씁니다.
      JSON 의 unit = 이 그림 1px 이 옛 24×40 시트의 몇 px 인지. 부르는 쪽의 scale 값(3~6)은 그대로 둡니다(js/ui/pixel.js).
    - 오른쪽으로 걷기를 뒤집어 왼쪽으로 걷기를 만듭니다. 마지막 칸(상자)은 Gemini 표시를 얹을 버리는 칸이라 쓰지 않습니다.
  room     px_cafe_room.jpg  16:9 매장 그림 → cafe_room.png/json (4장 근무판 매장, 1280×448)
    - 가운데 20:7 띠(ROOM 의 y0부터)를 잘라 매장 크기로 줄입니다. 오른쪽 아래 Gemini 표시는 잘려 나가는 바닥에 있음.
    - 연우가 일하는 자리·손님이 들어오는 문·줄 서는 곳(ROOM 의 spots, 원본 좌표 = 발 위치)을 매장 좌표로 바꿔 JSON 에 넣습니다(js/game/work/cafe.js).
  objects  px_cafe_objects.jpg  8칸 × 7줄 가구·소품·효과 → props.png/json · effects.png/json · cafe_objects.png/json
    - 소품·효과는 옛 시트와 같은 이름(paper_cup·sparkle_big_0…)이라 부르는 코드는 그대로입니다(unit 으로 옛 16px 크기).
    - 소품은 칸마다 물건만 꼭 맞게 잘라 같은 크기로, 효과는 두 프레임을 같은 상자로 잘라 움직임(작아짐·내려감)을 살립니다.
    - 가구(cafe_objects)는 물건만 꼭 맞게 원본 크기로 잘라 둡니다(미니게임 방에서 원하는 크기로 그림).
    - 반투명한 김·거품·유리는 초록을 걷어 내 흰색 반투명으로(unmix). 원래 초록인 화분·세균은 초록이 지워지지 않게 따로.
  minigame px_minigame_sheet.jpg  8칸 × 7줄 미니게임 사람·물건·얼룩 → people.png/json · mg_objects.png/json (G-4)
    - 줄 높이가 고르지 않아 그림마다 상자(원본 좌표)를 적고, 상자 안에 가운데가 있는 조각만 모읍니다(팔·물웅덩이가 넘쳐도 됨).
    - 사람(people)은 연우처럼 같은 크기의 칸에 머리 가운데·발끝(앉은 사람은 의자 다리 끝)을 맞추고, unit 도 연우와 같은 키 기준.
    - 물건(mg_objects)은 원본 크기 그대로(unit 1).
    - 두 가지만 다른 그림에서 가져옵니다(MG_OTHER): 먼지(이 시트의 먼지는 토끼처럼 그려져서, 이 시트를 Flow 고치기로
      먼지 세 칸만 다시 그린 2K 그림 px_minigame_dust.jpg 를 반으로 줄여) · 빈 양동이(이 시트의 양동이는 얼음이 담겨 있어
      같은 프롬프트로 만든 다른 그림 px_minigame_bucket.jpg).
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
SRC_DIR = ROOT / 'assets' / '_src' / 'pixel'
OUT = ROOT / 'assets' / 'pixel'
CHECK_DIR = ROOT / 'assets' / '_src' / '_check'

# ---------------------------------------------------------------- 연우
SRC = SRC_DIR / 'px_yeonwoo_sheet.jpg'
CHECK = CHECK_DIR / 'px_yeonwoo.png'
COLS, ROWS = 8, 6
INSET = 4          # 칸 선(2~4px)을 피해 안쪽만
KEY = 48           # 초록 - max(빨강, 파랑) 이 이보다 크면 배경
SPILL = 10         # 이보다 크면 초록 기운만 덜어 냄
SPECK = 6          # 이보다 작은 조각은 지움(JPEG 얼룩)
PAD = 3            # 프레임 둘레 빈칸(이웃 프레임이 번지지 않게)
BODY_UNITS = 37    # 옛 시트에서 머리끝~발끝(24×40 칸 안의 키)
PER_ROW = 8        # 결과 시트 한 줄의 프레임 수

# tag: 코드의 동작 이름 · row/cols: 원본의 줄·칸 · ms: 프레임마다 보여 줄 시간
# air: 발이 뜬 프레임(점프) · order: 재생 순서(같은 프레임을 다시 써도 됨, 없으면 차례대로)
LAYOUT = [
    dict(tag='walk_down', row=0, cols=[0, 1, 2, 3], ms=[150] * 4),
    dict(tag='walk_up', row=0, cols=[4, 5, 6, 7], ms=[150] * 4),
    dict(tag='walk_right', row=1, cols=[0, 1, 2, 3], ms=[150] * 4),
    # 6칸(가슴 앞에서 손 모음)은 손 모양이 달라 빼고, 가만히 서 있다가 가끔 눈을 깜빡임
    dict(tag='idle', row=1, cols=[4, 6, 7], ms=[1000, 700, 150], order=[0, 1, 0, 2]),
    dict(tag='carry', row=2, cols=[0, 1, 2, 3], ms=[180] * 4),
    dict(tag='wash', row=2, cols=[4, 5, 6, 7], ms=[200] * 4),
    dict(tag='wipe', row=3, cols=[0, 1, 2, 3], ms=[180] * 4),
    dict(tag='sweep', row=3, cols=[4, 5, 6, 7], ms=[180] * 4),
    dict(tag='bow', row=4, cols=[0, 1, 2, 3], ms=[420, 220, 520, 220]),
    dict(tag='happy', row=4, cols=[4, 5, 6, 7], ms=[260, 200, 260, 320], air=[1, 2]),
    dict(tag='panic', row=5, cols=[0, 1, 2, 3], ms=[240] * 4),
    dict(tag='memo', row=5, cols=[4], ms=[400]),
    dict(tag='point', row=5, cols=[5], ms=[400]),
    dict(tag='wave', row=5, cols=[6], ms=[400]),
]
MIRROR = {'walk_left': 'walk_right'}

# ---------------------------------------------------------------- 매장
# 원본 1376×768 에서 y0 부터 20:7 띠를 잘라 1280×448 로. spots = 발 위치(원본 좌표)
ROOM = dict(
    src='px_cafe_room.jpg', y0=165, size=(1280, 448),
    spots={
        'counter': (1100, 598),   # 계산대(손님 받기) 왼쪽 앞
        'rack': (1170, 622),      # 컵·빨대: 계산대 앞(그림에 컵 선반이 따로 없어 계산대 옆)
        'bar': (1235, 622),       # 얼음: 계산대와 진열대 사이
        'showcase': (1300, 622),  # 빵 진열대 앞
        'sink': (1065, 472),      # 벽 세면대 앞
        'tables': (855, 512),     # 안쪽 줄 오른쪽 테이블 앞
        'floor': (965, 605),      # 계산대 앞 빈 바닥
        'door': (150, 600),       # 출입문 앞
        'staff': (1298, 452),     # 직원 문 앞(출근·퇴근 기록)
        'enter': (95, 585),       # 손님이 나타나는 곳
        'queue': (1060, 610),     # 손님이 줄 서는 곳(여기서 왼쪽으로)
        'mark': (880, 620),       # 바닥 사건 표시(쏟음)
    },
)

# ---------------------------------------------------------------- 가구·소품·효과
OBJ_COLS, OBJ_ROWS = 8, 7   # 줄 높이는 생성 그림마다 고르지 않아, 물건 사이 빈 줄을 찾아 나눔(row_bands)
PROP_SIZE = 112    # 소품 한 칸(옛 16px → unit 16/112)
FX_SIZE = 96       # 효과 한 칸(옛 16px → unit 16/96)
GREEN_OK = {(0, 4), (0, 5), (5, 2), (5, 3)}   # 원래 초록인 칸: 큰 화분·작은 화분·세균 두 칸
FURNITURE = {
    'door': (0, 0), 'table_square': (0, 1), 'table_round': (0, 2), 'chair': (0, 3), 'plant_tall': (0, 4),
    'plant_small': (0, 5), 'counter': (0, 6), 'wet_sign': (0, 7), 'trash_bin': (1, 0), 'mop_bucket': (1, 1),
    'broom_dustpan': (1, 2), 'sink': (1, 3), 'window': (1, 4), 'lamp': (1, 5), 'shelf_bread': (1, 6),
    'showcase': (1, 7), 'cup_stack': (3, 4), 'tray': (6, 4),
}
PROPS = {
    # 옛 props 16가지(같은 이름)
    'paper_cup': (2, 0), 'ice_cup': (2, 1), 'straw': (2, 2), 'lid': (2, 3), 'salt_bread': (2, 4), 'croissant': (2, 5),
    'muffin': (2, 6), 'americano': (2, 7), 'latte': (3, 0), 'milk': (3, 1), 'juice': (3, 2), 'dishcloth': (3, 3),
    'trash_bin': (1, 0), 'chair': (0, 3), 'light_switch': (3, 5), 'badge': (3, 6),
    # 새로
    'cup_stack': (3, 4), 'ice_cube': (3, 7), 'wet_sign': (0, 7), 'tray': (6, 4), 'glass': (6, 5), 'tongs': (6, 6),
}
EFFECTS = {   # 이름: (첫 프레임 칸, 둘째 프레임 칸) → 이름_0, 이름_1
    'bubble_small': ((4, 0), (4, 1)), 'bubble_large': ((4, 2), (4, 3)), 'droplet_left': ((4, 4), (4, 5)),
    'sparkle': ((4, 6), (4, 7)), 'sparkle_big': ((5, 0), (5, 1)), 'germ_worried': ((5, 2), (5, 3)),
    'heart': ((5, 4), (5, 5)), 'star': ((5, 6), (5, 7)), 'dust': ((6, 0), (6, 1)), 'steam': ((6, 2), (6, 3)),
}
FX_MIRROR = {'droplet_right': 'droplet_left'}   # 오른쪽 물방울 = 왼쪽을 뒤집어서
FX_ALIAS = {'germ_happy': 'germ_worried'}       # 옛 이름(쓰는 곳 없음)도 남겨 둠

# ---------------------------------------------------------------- 미니게임 사람·물건·얼룩 (G-4)
# 손님 id 는 게임의 인물 id 그대로: customer(손님 A) · student · auntie · daeri(회사원) · hiker · grandma · manager · minjae(제빵사)
MG_MARGIN = 40     # 상자 둘레로 더 보는 폭(이웃 칸으로 넘친 팔·진열장 끝)


def row8(y0: int, y1: int, names: list) -> dict:
    """한 줄을 8칸(128px)으로: 이름 → 상자. None 칸은 건너뜀"""
    return {n: (c * 128, y0, (c + 1) * 128, y1) for c, n in enumerate(names) if n}


MG_PEOPLE = {
    **row8(10, 188, ['sit_customer', 'sit_student', 'sit_auntie', 'sit_daeri', 'sit_hiker', 'sit_grandma', 'manager_idle', 'minjae_idle']),
    **row8(188, 361, ['grumble_customer', 'grumble_student', 'grumble_auntie', 'grumble_daeri', 'grumble_hiker', 'grumble_grandma', 'manager_cup', 'minjae_tray']),
    **row8(361, 521, ['walk_customer_0', 'walk_customer_1', 'walk_student_0', 'walk_student_1', 'walk_auntie_0', 'walk_auntie_1', 'walk_daeri_0', 'walk_daeri_1']),
    # 4줄: 미끄러지는 손님이 넓어서 칸을 따로
    'slip_daeri': (0, 521, 165, 684), 'search_customer': (165, 521, 300, 684), 'wait_customer': (300, 521, 412, 684),
    'wait_student': (412, 521, 522, 684), 'wait_daeri': (522, 521, 640, 684), 'manager_stop': (640, 521, 790, 684),
}
MG_WIDE = {'slip_daeri'}   # 머리 대신 그림 가운데를 맞춤(누운 자세)
MG_OBJECTS = {
    'tissue': (790, 521, 896, 684), 'straw_wrapper': (896, 521, 1024, 684),
    **row8(684, 828, ['ice_machine', 'glass', None, 'cup_box', 'ice_bin', 'cup_rack', 'showcase', 'kitchen_window']),   # 3칸 양동이는 얼음이 담겨 있어 MG_OTHER 로
    **row8(828, 918, ['crumbs', 'coffee_ring', 'syrup', None, None, None, 'juice_small', 'juice_big']),   # 4~6칸 먼지(토끼 모양)는 다시 그린 그림에서(MG_OTHER)
    **row8(918, 1024, ['phone', 'plate', 'coffee_cup', 'bag_tied', 'bag_open', 'soap', 'towels', None]),  # 8칸은 버리는 칸
}
# 다른 그림에서 가져오는 것: 이름 → (원본, 상자)
#  - 먼지: 이 시트의 먼지는 토끼처럼 그려져서, 이 시트를 Flow 고치기로 먼지 세 칸만 다시 그린 그림(2048×2048, 2026-11-19).
#    칸 자리가 이 시트와 같아 상자도 이 시트 좌표(MG_HALF 로 반으로 줄여 같은 픽셀 크기로)
#  - 양동이: 이 시트의 양동이는 얼음이 담겨 있어, 받는 얼음이 쌓여 보이게 같은 프롬프트로 만든 다른 시트(1376×768)의 빈 양동이
MG_OTHER = {
    **{n: ('px_minigame_dust.jpg', box) for n, box in row8(828, 918, [None, None, None, 'dust_small', 'dust_mid', 'dust_big']).items()},
    'ice_bucket': ('px_minigame_bucket.jpg', (405, 588, 512, 690)),
}
MG_HALF = {'px_minigame_dust.jpg'}   # 2K 로 받은 그림: 반으로 줄여 이 시트(1024)와 같은 픽셀 크기로


def cell_box(r: int, c: int, W: int, H: int) -> tuple[int, int, int, int]:
    return (round(c * W / COLS) + INSET, round(r * H / ROWS) + INSET,
            round((c + 1) * W / COLS) - INSET, round((r + 1) * H / ROWS) - INSET)


def components(mask: np.ndarray) -> np.ndarray:
    """8방향으로 이어진 덩어리 번호(0 = 없음)"""
    lab = np.zeros(mask.shape, np.int32)
    n = 0
    H, W = mask.shape
    for y0, x0 in zip(*np.nonzero(mask)):
        if lab[y0, x0]:
            continue
        n += 1
        stack = [(y0, x0)]
        lab[y0, x0] = n
        while stack:
            y, x = stack.pop()
            for dy in (-1, 0, 1):
                for dx in (-1, 0, 1):
                    yy, xx = y + dy, x + dx
                    if 0 <= yy < H and 0 <= xx < W and mask[yy, xx] and not lab[yy, xx]:
                        lab[yy, xx] = n
                        stack.append((yy, xx))
    return lab


def key_cell(rgb: np.ndarray) -> tuple[np.ndarray, np.ndarray]:
    """초록 배경 지우기 → (RGBA, 몸통 덩어리 마스크)"""
    a = rgb.astype(np.int32)
    R, G, B = a[..., 0], a[..., 1], a[..., 2]
    d = G - np.maximum(R, B)
    alpha = d <= KEY
    lab = components(alpha)
    sizes = np.bincount(lab.ravel())
    sizes[0] = 0
    keep = sizes >= SPECK
    alpha = keep[lab]
    body = lab == int(np.argmax(sizes))
    spill = alpha & (d > SPILL)
    a[..., 1] = np.where(spill, np.maximum(R, B) + SPILL, G)
    out = np.dstack([np.clip(a, 0, 255), np.where(alpha, 255, 0)]).astype(np.uint8)
    return out, body


def anchor(body: np.ndarray) -> tuple[float, int, int]:
    """(머리 가운데 x, 머리끝 y, 발끝 y): 머리는 몸통 위쪽 30%"""
    ys, xs = np.nonzero(body)
    top, bot = int(ys.min()), int(ys.max())
    head = ys <= top + (bot - top) * 0.3
    return float((xs[head].min() + xs[head].max()) / 2), top, bot


def save_png(im: Image.Image, path: Path, colors: int = 128) -> None:
    """팔레트로 줄여 저장(눈으로는 같고 파일은 작게, 웹판에서 빨리 뜨게)"""
    im.quantize(colors=colors, method=Image.Quantize.FASTOCTREE, dither=Image.Dither.NONE).save(path, optimize=True)


def build_yeonwoo(check: bool = False) -> int:
    if not SRC.exists():
        print(f'원본이 없어요: {SRC.relative_to(ROOT)}')
        return 1
    sheet = np.asarray(Image.open(SRC).convert('RGB'))
    H, W = sheet.shape[:2]
    cells: dict[tuple[int, int], tuple[np.ndarray, np.ndarray]] = {}
    for a in LAYOUT:
        for c in a['cols']:
            x0, y0, x1, y1 = cell_box(a['row'], c, W, H)
            cells[(a['row'], c)] = key_cell(sheet[y0:y1, x0:x1])

    # 동작마다: 발이 닿은 프레임의 발끝 높이(가운데값)를 기준선으로, 프레임마다 머리 가운데를 맞춤
    placed = []   # (태그, 번호, RGBA, 머리 가운데 x, 발끝 y)
    heights = []
    for a in LAYOUT:
        tag, r, cols, air = a['tag'], a['row'], a['cols'], a.get('air', [])
        info = [anchor(cells[(r, c)][1]) for c in cols]
        ground = [k for k in range(len(cols)) if k not in air]
        base = int(np.median([info[k][2] for k in ground]))
        for k, c in enumerate(cols):
            cx, top, bot = info[k]
            by = base if k in air else bot
            placed.append((tag, k, cells[(r, c)][0], cx, by))
            if k not in air and tag != 'bow':
                heights.append(bot - top)

    # 모든 프레임을 담는 같은 크기의 칸(가운데 = 머리, 아래 = 발끝)
    left = right = up = down = 0
    for _, _, im, cx, by in placed:
        ys, xs = np.nonzero(im[..., 3])
        left = max(left, cx - xs.min())
        right = max(right, xs.max() + 1 - cx)
        up = max(up, by - ys.min())
        down = max(down, ys.max() + 1 - by)
    half = int(np.ceil(max(left, right))) + PAD
    fw, fh = half * 2, int(up + down) + PAD * 2
    foot = PAD + int(up)

    frames: dict[str, Image.Image] = {}
    for tag, k, im, cx, by in placed:
        f = Image.new('RGBA', (fw, fh), (0, 0, 0, 0))
        f.alpha_composite(Image.fromarray(im), (int(round(half - cx)), foot - by))
        frames[f'{tag}_{k}'] = f
    for tag, src in MIRROR.items():
        for name in [n for n in frames if n.startswith(f'{src}_')]:
            frames[name.replace(src, tag)] = frames[name].transpose(Image.Transpose.FLIP_LEFT_RIGHT)

    dur = {f'{a["tag"]}_{k}': ms for a in LAYOUT for k, ms in enumerate(a['ms'])}
    tags = {a['tag']: [f'{a["tag"]}_{k}' for k in a.get('order', range(len(a['cols'])))] for a in LAYOUT}
    for tag, src in MIRROR.items():
        dur.update({n.replace(src, tag): v for n, v in list(dur.items()) if n.startswith(f'{src}_')})
        tags[tag] = [n.replace(src, tag) for n in tags[src]]
    order = list(frames)
    n_rows = (len(order) + PER_ROW - 1) // PER_ROW
    out = Image.new('RGBA', (fw * PER_ROW, fh * n_rows), (0, 0, 0, 0))
    meta_frames = {}
    for i, name in enumerate(order):
        x, y = (i % PER_ROW) * fw, (i // PER_ROW) * fh
        out.alpha_composite(frames[name], (x, y))
        meta_frames[name] = {'x': x, 'y': y, 'w': fw, 'h': fh, 'duration': dur[name]}
    body = float(np.median(heights))
    meta = {
        'image': 'yeonwoo.png',
        'unit': round(BODY_UNITS / body, 4),
        'foot': {'x': half, 'y': foot},
        'source': 'assets/_src/pixel/px_yeonwoo_sheet.jpg (tools/import-pixel-sheet.py)',
        'frames': meta_frames,
        'tags': tags,
    }

    if check:
        print(f'frame {fw}×{fh} · 몸 키 가운데값 {body:.0f}px (최소 {min(heights)}, 최대 {max(heights)}) · unit {meta["unit"]}')
        for a in LAYOUT:
            info = [anchor(cells[(a['row'], c)][1]) for c in a['cols']]
            print(f'  {a["tag"]:<10} 키 ' + ' '.join(f'{bot - top:>3}' for _, top, bot in info) + (f'  (뜸 {a["air"]})' if a.get('air') else ''))
        board = Image.new('RGBA', out.size, (40, 40, 48, 255))
        board.alpha_composite(out)
        d = ImageDraw.Draw(board)
        for i, name in enumerate(order):
            x, y = (i % PER_ROW) * fw, (i // PER_ROW) * fh
            d.rectangle((x, y, x + fw - 1, y + fh - 1), outline=(90, 90, 110))
            d.line((x, y + foot, x + fw - 1, y + foot), fill=(255, 80, 160))
            d.text((x + 3, y + 2), name, fill=(255, 255, 120))
        CHECK.parent.mkdir(parents=True, exist_ok=True)
        board.save(CHECK)
        print(f'→ {CHECK.relative_to(ROOT)}')
        return 0

    save_png(out, OUT / 'yeonwoo.png')
    (OUT / 'yeonwoo.json').write_text(json.dumps(meta, ensure_ascii=False, indent=1) + '\n', encoding='utf-8')
    print(f'yeonwoo.png {out.size[0]}×{out.size[1]} · 프레임 {len(order)}개 {fw}×{fh} · unit {meta["unit"]}')
    return 0


def build_room(check: bool = False) -> int:
    src = SRC_DIR / ROOM['src']
    if not src.exists():
        print(f'원본이 없어요: {src.relative_to(ROOT)}')
        return 1
    im = Image.open(src).convert('RGB')
    W, H = im.size
    ow, oh = ROOM['size']
    y0 = ROOM['y0']
    band = round(W * oh / ow)
    s = ow / W
    room = im.crop((0, y0, W, y0 + band)).resize((ow, oh), Image.LANCZOS)
    spots = {k: [round(x * s), round((y - y0) * s)] for k, (x, y) in ROOM['spots'].items()}
    if check:
        board = room.convert('RGBA')
        d = ImageDraw.Draw(board)
        for k, (x, y) in spots.items():
            d.ellipse((x - 6, y - 6, x + 6, y + 6), outline=(255, 0, 160), width=3)
            d.text((x + 8, y - 6), k, fill=(255, 0, 160))
        path = CHECK_DIR / 'px_cafe_room.png'
        board.save(path)
        print(f'매장 {W}×{H} → y {y0}~{y0 + band} 띠 → {ow}×{oh} · 자리 {len(spots)}곳 → {path.relative_to(ROOT)}')
        return 0
    save_png(room, OUT / 'cafe_room.png', colors=256)   # 배경이라 투명 없음
    meta = {
        'image': 'cafe_room.png',
        'source': f'assets/_src/pixel/{ROOM["src"]} (tools/import-pixel-sheet.py)',
        'frames': {'room': {'x': 0, 'y': 0, 'w': ow, 'h': oh}},
        'spots': spots,
    }
    (OUT / 'cafe_room.json').write_text(json.dumps(meta, ensure_ascii=False, indent=1) + '\n', encoding='utf-8')
    print(f'cafe_room.png {ow}×{oh} · 자리 {len(spots)}곳')
    return 0


def key_objects(rgb: np.ndarray, green_ok: bool, bg: np.ndarray) -> np.ndarray:
    """가구·소품 칸의 초록 배경 지우기 → RGBA(float, 0~255). 반투명한 김·유리는 초록을 걷어 내 본래 색으로"""
    a = rgb.astype(np.float32)
    R, G, B = a[..., 0], a[..., 1], a[..., 2]
    d = G - np.maximum(R, B)
    if green_ok:
        # 원래 초록(화분·세균): 배경처럼 아주 진한 초록만 지우고, 가장자리만 초록 기운을 덜어 냄
        alpha = ~((G > 150) & (R < 110) & (B < 110) & (d > 90))
        lab = components(alpha)
        sizes = np.bincount(lab.ravel())
        sizes[0] = 0
        alpha = (sizes >= SPECK)[lab]
        p = np.pad(alpha, 1)
        edge = alpha & ~(p[2:, 1:-1] & p[:-2, 1:-1] & p[1:-1, 2:] & p[1:-1, :-2])   # 바깥(배경)과 닿은 픽셀
        g = np.where(edge & (d > SPILL), np.maximum(R, B) + SPILL, G)
        return np.dstack([R, g, B, alpha * 255.0])
    kb = bg[1] - max(bg[0], bg[2])
    al = 1 - np.clip((d - 10) / max(kb - 10, 1), 0, 1)
    al[al < 0.1] = 0
    rgb2 = np.clip((a - (1 - al)[..., None] * bg) / np.maximum(al, 1e-3)[..., None], 0, 255)
    soft = al < 0.95
    mx = np.maximum(rgb2[..., 0], rgb2[..., 2])
    rgb2[..., 1] = np.where(soft, np.minimum(rgb2[..., 1], mx + 20), rgb2[..., 1])
    return np.dstack([rgb2, al * 255.0])


def strict_fg(rgb: np.ndarray) -> np.ndarray:
    """아주 진한 배경 초록만 뺀 곳(화분·세균·연한 김도 들어감): 물건 찾기용"""
    a = rgb.astype(np.int32)
    R, G, B = a[..., 0], a[..., 1], a[..., 2]
    return ~((G > 150) & (R < 110) & (B < 110) & (G - np.maximum(R, B) > 90))


def row_bands(fg: np.ndarray, gap: int = 3) -> list[tuple[int, int]]:
    """물건이 하나도 없는 가로줄(gap px 넘게)로 나눈 줄들"""
    empty = fg.sum(1) <= 2
    bands, start = [], None
    for y, e in enumerate(list(empty) + [True]):
        if not e and start is None:
            start = y
        elif e and start is not None:
            if y - start >= 20:
                bands.append((start, y - 1))
            start = None
    merged = []   # 줄 안의 얇은 틈(물건 위아래 사이)은 이어 붙임
    for b in bands:
        if merged and b[0] - merged[-1][1] <= gap:
            merged[-1] = (merged[-1][0], b[1])
        else:
            merged.append(b)
    return merged


def dilate(m: np.ndarray, r: int = 1) -> np.ndarray:
    out = m.copy()
    for _ in range(r):
        p = np.pad(out, 1)
        out = out | p[2:, 1:-1] | p[:-2, 1:-1] | p[1:-1, 2:] | p[1:-1, :-2]
    return out


def bbox(alpha: np.ndarray, thr: float = 64) -> tuple[int, int, int, int]:
    ys, xs = np.nonzero(alpha > thr)
    return int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1


def to_rgba(arr: np.ndarray) -> Image.Image:
    return Image.fromarray(arr.round().clip(0, 255).astype(np.uint8), 'RGBA')


def square_fit(im: Image.Image, box: tuple[int, int, int, int], size: int, margin: float = 1.12) -> Image.Image:
    """box 를 가운데 두고 정사각형으로 잘라(넘치면 투명) size 로 — 미리 곱한 알파로 줄여 가장자리가 어두워지지 않게"""
    x0, y0, x1, y1 = box
    side = max(x1 - x0, y1 - y0) * margin + 4
    cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
    crop = im.crop((round(cx - side / 2), round(cy - side / 2), round(cx + side / 2), round(cy + side / 2)))
    return crop.convert('RGBa').resize((size, size), Image.LANCZOS).convert('RGBA')


def pack(frames: dict[str, Image.Image], per_row: int | None = None, width: int = 1024) -> tuple[Image.Image, dict]:
    """프레임을 줄줄이 붙임: 같은 크기면 per_row 칸씩, 크기가 다르면 width 안에서 줄을 바꿔 가며"""
    meta, x, y, row_h, places = {}, 0, 0, 0, []
    for i, (name, f) in enumerate(frames.items()):
        if per_row:
            x, y = (i % per_row) * f.width, (i // per_row) * f.height
        elif x + f.width > width:
            x, y, row_h = 0, y + row_h, 0
        places.append((name, f, x, y))
        meta[name] = {'x': x, 'y': y, 'w': f.width, 'h': f.height, 'duration': 160}
        if not per_row:
            x += f.width
            row_h = max(row_h, f.height)
    W = max(x + f.width for _, f, x, _ in places)
    H = max(y + f.height for _, f, _, y in places)
    out = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    for _, f, x, y in places:
        out.alpha_composite(f, (x, y))
    return out, meta


def build_objects(check: bool = False) -> int:
    src = SRC_DIR / 'px_cafe_objects.jpg'
    if not src.exists():
        print(f'원본이 없어요: {src.relative_to(ROOT)}')
        return 1
    sheet = np.asarray(Image.open(src).convert('RGB'))
    H, W = sheet.shape[:2]
    border = np.concatenate([sheet[:6].reshape(-1, 3), sheet[:, :6].reshape(-1, 3), sheet[:, -6:].reshape(-1, 3)])
    bg = np.median(border, axis=0).astype(np.float32)   # 배경 초록(아래·오른쪽 아래 Gemini 표시는 빼고)

    # 칸 찾기: 빈 가로줄로 줄을 나누고, 줄 안의 조각마다 가운데 x 로 몇째 칸인지 정함(조각 여럿이 한 칸 = 거품·유리 조각)
    fg = strict_fg(sheet)
    bands = row_bands(fg)
    if len(bands) != OBJ_ROWS:
        print(f'줄을 {len(bands)}개 찾았어요({OBJ_ROWS}개여야 함): 물건 사이에 빈 줄이 있는지 확인')
        return 1
    masks: dict[tuple[int, int], np.ndarray] = {}
    for r, (y0, y1) in enumerate(bands):
        lab = components(fg[y0:y1 + 1])
        sizes = np.bincount(lab.ravel())
        for i in range(1, len(sizes)):
            if sizes[i] < 20:
                continue
            piece = lab == i
            col = min(OBJ_COLS - 1, int(np.nonzero(piece)[1].mean() // (W / OBJ_COLS)))
            full = np.zeros((H, W), bool)
            full[y0:y1 + 1] = piece
            masks[(r, col)] = masks.get((r, col), np.zeros((H, W), bool)) | full
    cw = W / OBJ_COLS

    def cut(rc: tuple[int, int], x0: int, y0: int, x1: int, y1: int) -> np.ndarray:
        """원본의 그 상자를 배경을 지운 RGBA 로(그 칸 물건이 아닌 이웃 조각은 지움)"""
        x0, y0, x1, y1 = max(0, x0), max(0, y0), min(W, x1), min(H, y1)
        arr = key_objects(sheet[y0:y1, x0:x1], rc in GREEN_OK, bg)
        arr[..., 3] *= dilate(masks[rc][y0:y1, x0:x1], 2)
        return arr

    def cell(rc: tuple[int, int]) -> np.ndarray:
        """그 칸 물건만 꼭 맞게"""
        ys, xs = np.nonzero(masks[rc])
        return cut(rc, xs.min() - 3, ys.min() - 3, xs.max() + 4, ys.max() + 4)

    furn = {}
    for name, rc in FURNITURE.items():
        arr = cell(rc)
        x0, y0, x1, y1 = bbox(arr[..., 3])
        furn[name] = to_rgba(arr).crop((max(0, x0 - 2), max(0, y0 - 2), x1 + 2, y1 + 2))
    props = {}
    for name, rc in PROPS.items():
        arr = cell(rc)
        props[name] = square_fit(to_rgba(arr), bbox(arr[..., 3]), PROP_SIZE)
    fx = {}
    for name, pair in EFFECTS.items():
        # 두 프레임을 같은 상자로(칸 왼쪽 끝 기준): 둘째 프레임이 작아지거나 내려간 움직임이 그대로 남게
        boxes = []
        for rc in pair:
            ys, xs = np.nonzero(masks[rc])
            boxes.append((xs.min() - rc[1] * cw, ys.min(), xs.max() + 1 - rc[1] * cw, ys.max() + 1))
        bx0, by0 = min(b[0] for b in boxes), min(b[1] for b in boxes)
        bx1, by1 = max(b[2] for b in boxes), max(b[3] for b in boxes)
        for k, rc in enumerate(pair):
            arr = cut(rc, round(rc[1] * cw + bx0) - 3, by0 - 3, round(rc[1] * cw + bx1) + 3, by1 + 3)
            fx[f'{name}_{k}'] = square_fit(to_rgba(arr), (0, 0, arr.shape[1], arr.shape[0]), FX_SIZE, margin=1.0)
    for tag, src_name in FX_MIRROR.items():
        for k in (0, 1):
            fx[f'{tag}_{k}'] = fx[f'{src_name}_{k}'].transpose(Image.Transpose.FLIP_LEFT_RIGHT)

    sheets = {
        'props': (*pack(props, per_row=8), round(16 / PROP_SIZE, 4)),
        'effects': (*pack(fx, per_row=8), round(16 / FX_SIZE, 4)),
        'cafe_objects': (*pack(furn), 1),
    }
    for alias, src_name in FX_ALIAS.items():   # 같은 그림을 옛 이름으로도
        for k in (0, 1):
            sheets['effects'][1][f'{alias}_{k}'] = dict(sheets['effects'][1][f'{src_name}_{k}'])

    if check:
        for name, (im, meta, _) in sheets.items():
            board = Image.new('RGBA', im.size, (40, 40, 48, 255))
            board.alpha_composite(im)
            d = ImageDraw.Draw(board)
            for fname, f in meta.items():
                d.rectangle((f['x'], f['y'], f['x'] + f['w'] - 1, f['y'] + f['h'] - 1), outline=(90, 90, 110))
                d.text((f['x'] + 2, f['y'] + 1), fname, fill=(255, 255, 120))
            path = CHECK_DIR / f'px_{name}.png'
            board.save(path)
            print(f'{name}: 프레임 {len(meta)}개 → {path.relative_to(ROOT)}')
        return 0
    for name, (im, meta, unit) in sheets.items():
        save_png(im, OUT / f'{name}.png', colors=256)
        data = {'image': f'{name}.png', 'unit': unit, 'source': 'assets/_src/pixel/px_cafe_objects.jpg (tools/import-pixel-sheet.py)', 'frames': meta}
        (OUT / f'{name}.json').write_text(json.dumps(data, ensure_ascii=False, indent=1) + '\n', encoding='utf-8')
        print(f'{name}.png {im.size[0]}×{im.size[1]} · 프레임 {len(meta)}개 · unit {unit}')
    return 0


def mg_pick(sheet: np.ndarray, box: tuple[int, int, int, int]) -> tuple[int, int, np.ndarray, np.ndarray]:
    """상자 둘레를 잘라, 상자 안에 가운데가 있는 조각만 → (자른 자리 x, y, RGB, 그 조각 마스크).
    20px 보다 작은 얼룩과 초록빛 조각(오른쪽 아래 Gemini 표시)은 뺌"""
    H, W = sheet.shape[:2]
    x0, y0, x1, y1 = box
    cx, cy = max(0, x0 - MG_MARGIN), max(0, y0 - MG_MARGIN)
    rgb = sheet[cy:min(H, y1 + MG_MARGIN), cx:min(W, x1 + MG_MARGIN)]
    lab = components(strict_fg(rgb)).ravel()
    a = rgb.astype(np.int32)
    ys, xs = np.indices(rgb.shape[:2])
    cnt = np.bincount(lab)
    mx = np.bincount(lab, weights=xs.ravel()) / np.maximum(cnt, 1) + cx
    my = np.bincount(lab, weights=ys.ravel()) / np.maximum(cnt, 1) + cy
    green = np.bincount(lab, weights=(a[..., 1] - np.maximum(a[..., 0], a[..., 2])).ravel()) / np.maximum(cnt, 1)
    ok = (cnt >= 20) & (mx >= x0) & (mx < x1) & (my >= y0) & (my < y1) & (green <= 40)
    ok[0] = False
    return cx, cy, rgb, ok[lab].reshape(rgb.shape[:2])


def key_person(rgb: np.ndarray, keep: np.ndarray) -> np.ndarray:
    """사람: 연우처럼 또렷한 테두리(알파 0/255)로 초록 지우기 + 초록 기운 덜기"""
    a = rgb.astype(np.int32)
    R, G, B = a[..., 0], a[..., 1], a[..., 2]
    d = G - np.maximum(R, B)
    alpha = (d <= KEY) & dilate(keep, 2)
    a[..., 1] = np.where(alpha & (d > SPILL), np.maximum(R, B) + SPILL, G)
    return np.dstack([np.clip(a, 0, 255), np.where(alpha, 255, 0)]).astype(np.uint8)


def head_x(alpha: np.ndarray) -> tuple[float, int, int]:
    """(머리 가운데 x, 맨 위 y, 맨 아래 y): 머리는 맨 위 18%(손에 든 컵·쟁반이 섞이지 않게)"""
    ys, xs = np.nonzero(alpha)
    top, bot = int(ys.min()), int(ys.max())
    head = ys <= top + (bot - top) * 0.18
    return float((xs[head].min() + xs[head].max()) / 2), top, bot


def build_minigame(check: bool = False) -> int:
    srcs = {}   # 원본 이름 → (RGB, 배경 초록)
    for name in ['px_minigame_sheet.jpg', *sorted({f for f, _ in MG_OTHER.values()})]:
        p = SRC_DIR / name
        if not p.exists():
            print(f'원본이 없어요: {p.relative_to(ROOT)}')
            return 1
        im = Image.open(p).convert('RGB')
        if name in MG_HALF:
            im = im.resize((im.width // 2, im.height // 2), Image.BOX)
        rgb = np.asarray(im)
        border = np.concatenate([rgb[:6].reshape(-1, 3), rgb[:, :6].reshape(-1, 3)])   # 위·왼쪽(오른쪽 아래 Gemini 표시는 빼고)
        srcs[name] = (rgb, np.median(border, axis=0).astype(np.float32))
    sheet, bg = srcs['px_minigame_sheet.jpg']

    # ---- 사람: 같은 크기 칸에 머리 가운데·발끝을 맞춤
    cut = {}
    for name, box in MG_PEOPLE.items():
        _, _, rgb, keep = mg_pick(sheet, box)
        im = key_person(rgb, keep)
        x0, y0, x1, y1 = bbox(im[..., 3])
        im = im[y0:y1, x0:x1]
        cx, top, bot = head_x(im[..., 3] > 0)
        if name in MG_WIDE:
            cx = im.shape[1] / 2
        cut[name] = (im, cx, top, bot)
    left = max(cx for _, cx, _, _ in cut.values())
    right = max(im.shape[1] - cx for im, cx, _, _ in cut.values())
    half = int(np.ceil(max(left, right))) + PAD
    up = max(bot for _, _, _, bot in cut.values()) + 1
    fw, fh = half * 2, up + PAD * 2
    foot = PAD + up
    frames = {}
    for name, (im, cx, top, bot) in cut.items():
        f = Image.new('RGBA', (fw, fh), (0, 0, 0, 0))
        f.alpha_composite(Image.fromarray(im), (int(round(half - cx)), foot - bot - 1))
        frames[name] = f
    standing = [bot - top for n, (_, _, top, bot) in cut.items() if n.startswith(('walk_', 'wait_', 'search_')) or n.endswith('_idle')]
    people, pmeta = pack(frames, per_row=8)
    for n in pmeta:
        pmeta[n]['duration'] = 260 if n.startswith('walk_') else 400
    tags = {n: [n] for n in frames}
    for n in [n for n in frames if n.endswith('_0')]:
        tags[n[:-2]] = [n, n[:-2] + '_1']

    # ---- 물건: 원본 크기 그대로(unit 1)
    objs = {}
    todo = [(n, 'px_minigame_sheet.jpg', box) for n, box in MG_OBJECTS.items()] + [(n, *v) for n, v in MG_OTHER.items()]
    for name, src_name, box in todo:
        rgb_all, bgc = srcs[src_name]
        _, _, rgb, keep = mg_pick(rgb_all, box)
        arr = key_objects(rgb, False, bgc)
        arr[..., 3] *= dilate(keep, 2)
        x0, y0, x1, y1 = bbox(arr[..., 3])
        objs[name] = to_rgba(arr).crop((max(0, x0 - 2), max(0, y0 - 2), x1 + 2, y1 + 2))
    things, ometa = pack(objs, width=1024)

    body = float(np.median(standing))
    sheets = {
        'people': (people, {'unit': round(BODY_UNITS / body, 4), 'foot': {'x': half, 'y': foot}, 'frames': pmeta, 'tags': tags}),
        'mg_objects': (things, {'unit': 1, 'frames': ometa}),
    }
    if check:
        print(f'사람 칸 {fw}×{fh} · 선 키 가운데값 {body:.0f}px (최소 {min(standing)}, 최대 {max(standing)}) · unit {sheets["people"][1]["unit"]}')
        for name, (im, meta) in sheets.items():
            board = Image.new('RGBA', im.size, (40, 40, 48, 255))
            board.alpha_composite(im)
            d = ImageDraw.Draw(board)
            for fname, f in meta['frames'].items():
                d.rectangle((f['x'], f['y'], f['x'] + f['w'] - 1, f['y'] + f['h'] - 1), outline=(90, 90, 110))
                if name == 'people':
                    d.line((f['x'], f['y'] + foot, f['x'] + f['w'] - 1, f['y'] + foot), fill=(255, 80, 160))
                d.text((f['x'] + 2, f['y'] + 1), fname, fill=(255, 255, 120))
            path = CHECK_DIR / f'px_{name}.png'
            board.save(path)
            print(f'{name}: 프레임 {len(meta["frames"])}개 → {path.relative_to(ROOT)}')
        return 0
    for name, (im, meta) in sheets.items():
        save_png(im, OUT / f'{name}.png', colors=256)
        data = {'image': f'{name}.png', **{k: v for k, v in meta.items() if k != 'frames' and k != 'tags'},
                'source': 'assets/_src/pixel/px_minigame_sheet.jpg + px_minigame_dust·bucket.jpg (tools/import-pixel-sheet.py)', 'frames': meta['frames']}
        if 'tags' in meta:
            data['tags'] = meta['tags']
        (OUT / f'{name}.json').write_text(json.dumps(data, ensure_ascii=False, indent=1) + '\n', encoding='utf-8')
        print(f'{name}.png {im.size[0]}×{im.size[1]} · 프레임 {len(meta["frames"])}개 · unit {meta["unit"]}')
    return 0


BUILDERS = {'yeonwoo': build_yeonwoo, 'room': build_room, 'objects': build_objects, 'minigame': build_minigame}

if __name__ == '__main__':
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    check = '--check' in sys.argv
    names = args or list(BUILDERS)
    sys.exit(max(BUILDERS[n](check) for n in names))
