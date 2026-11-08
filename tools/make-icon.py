"""
앱 아이콘 만들기: 픽셀 연우(쟁반에 커피를 든 모습, assets/pixel/yeonwoo.png 의 carry_0)로 (2026-10-26)

  python tools/make-icon.py

  build/icon.ico   설치용 앱(Electron) Windows 아이콘 — electron-builder 가 build/ 에서 저절로 찾음(npm run build:win)
  build/icon.png   512×512 (맥·리눅스 빌드용)
  assets/icon.png  256×256 웹판 탭 아이콘(index.html)·개발 실행(npm start) 창 아이콘

- 노란 둥근 바탕(제목의 '1' 색) + 잉크 테두리. 빨간 바탕은 쓰지 않음(욱일기 연상 금지, CLAUDE.md 절대 원칙 8).
- 큰 크기(48px 이상)는 머리~쟁반의 상반신, 작은 크기(32px 이하)는 얼굴만 크게(작으면 상반신이 뭉개져서).
- 픽셀은 정수배로 키워 또렷하게, 줄일 때만 부드럽게.
"""

from __future__ import annotations

import json
from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
SHEET = ROOT / 'assets' / 'pixel' / 'yeonwoo.png'
FRAME = 'carry_0'
BG = (255, 212, 59, 255)        # 노랑(제목 '1')
INK = (23, 20, 28, 255)
BUST = (6, 0, 120, 112)         # 프레임 안 상반신(머리~쟁반과 컵), 원본 px
FACE = (14, 0, 98, 78)          # 프레임 안 얼굴(머리카락 포함)


def frame() -> Image.Image:
    meta = json.loads((ROOT / 'assets' / 'pixel' / 'yeonwoo.json').read_text(encoding='utf-8'))
    f = meta['frames'][FRAME]
    return Image.open(SHEET).convert('RGBA').crop((f['x'], f['y'], f['x'] + f['w'], f['y'] + f['h']))


def tile(size: int, art: Image.Image) -> Image.Image:
    """둥근 노란 바탕 + 테두리 위에 그림을 아래쪽에 붙여(아래로 잘림) 얹음"""
    k = size / 256
    out = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(out)
    r = round(52 * k)
    w = max(1, round(10 * k))
    d.rounded_rectangle((0, 0, size - 1, size - 1), radius=r, fill=INK)
    d.rounded_rectangle((w, w, size - 1 - w, size - 1 - w), radius=max(1, r - w), fill=BG)
    # 그림: 바탕 안쪽 폭의 86%, 아래쪽에 붙임
    inner = size - 2 * w
    aw = round(inner * 0.86)
    ah = round(art.height * aw / art.width)
    big = art.resize((aw, ah), Image.NEAREST if aw >= art.width else Image.LANCZOS)
    layer = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    layer.alpha_composite(big, ((size - aw) // 2, size - w - ah))
    # 둥근 모서리 밖으로 나간 부분은 지움
    mask = Image.new('L', (size, size), 0)
    ImageDraw.Draw(mask).rounded_rectangle((w, w, size - 1 - w, size - 1 - w), radius=max(1, r - w), fill=255)
    out.alpha_composite(Image.composite(layer, Image.new('RGBA', (size, size), (0, 0, 0, 0)), mask))
    return out


def main() -> None:
    f = frame()
    bust = f.crop(BUST)
    face = f.crop(FACE)
    big = tile(1024, bust)   # 큰 판을 하나 만들어 크기마다 줄임(가장자리가 고르게)
    sizes = {}
    for s in (256, 128, 64, 48):
        sizes[s] = big.resize((s, s), Image.LANCZOS)
    small = tile(1024, face)
    for s in (32, 24, 16):
        sizes[s] = small.resize((s, s), Image.LANCZOS)
    out = ROOT / 'build'
    out.mkdir(exist_ok=True)
    order = [256, 128, 64, 48, 32, 24, 16]
    sizes[256].save(out / 'icon.ico', format='ICO', sizes=[(s, s) for s in order], append_images=[sizes[s] for s in order[1:]])
    big.resize((512, 512), Image.LANCZOS).save(out / 'icon.png', optimize=True)
    sizes[256].save(ROOT / 'assets' / 'icon.png', optimize=True)
    print('build/icon.ico (256·128·64·48·32·24·16) · build/icon.png 512 · assets/icon.png 256')


if __name__ == '__main__':
    main()
