/**
 * 픽셀 아트 (일하는 장면 = 미니게임 전용)
 *  - 그림: assets/pixel/{시트}.png + {시트}.json (tools/generate-pixel-assets.py 로 만듦, 규격은 docs/asset_requests.md 7장)
 *    연우만 Flow로 만든 SD 시트에서 자름(tools/import-pixel-sheet.py, 2026-10-25)
 *  - JSON: frames { 이름: {x, y, w, h, duration} } · tags { 태그: [프레임 이름…] }
 *    · unit(그림 1px 이 옛 24×40 기준 몇 px, 없으면 1) · foot(프레임 안 발끝 자리 {x, y}, 없으면 아래 가운데)
 *  - 원본 픽셀을 정수배(기본 4배)로 키워 또렷하게 보여 줍니다(image-rendering: pixelated). 줄여 보일 때만 부드럽게.
 *  - scale 은 옛 기준 배율이라, 큰 그림(unit < 1)도 부르는 쪽 숫자 그대로 비슷한 크기로 보입니다.
 *  - 그림을 못 불러오면 null 을 돌려주므로, 부르는 쪽은 지금의 SVG 아이콘을 그대로 씁니다.
 *  - 움직임 줄이기에서는 첫 프레임만, 차분 모드에서는 천천히 움직입니다. 그림은 모두 장식(aria-hidden)이고 뜻은 글자로 전합니다.
 */

import { h } from '../core/dom.js';

// cafe_objects(가구)·cafe_room(근무판 매장 한 장)은 Flow로 만든 그림에서 자름(tools/import-pixel-sheet.py, 2026-10-25)
// people(미니게임 손님·점장님·민재)·mg_objects(미니게임 물건·얼룩·먼지)도 같은 도구로(G-4, 2026-10-26)
const SHEETS = ['props', 'effects', 'yeonwoo', 'dohyun', 'sora', 'cafe_tileset', 'cafe_objects', 'cafe_room', 'people', 'mg_objects'];
const data = {};
const images = {};
let loading = null;

const reduced = () => document.body.classList.contains('reduce-motion');
const slow = () => (document.body.classList.contains('theme-calm') ? 1.5 : 1);

function frameEl(sheet, name, scale, cls) {
  const s = data[sheet];
  const f = s?.frames?.[name];
  if (!f) return null;
  const k = scale * s.unit;
  return h('span', {
    class: `px ${cls}`.trim(),
    'aria-hidden': 'true',
    style: {
      width: `${f.w * k}px`,
      height: `${f.h * k}px`,
      backgroundImage: `url("${s.url}")`,
      backgroundSize: `${s.sheetW * k}px ${s.sheetH * k}px`,
      backgroundPosition: `-${f.x * k}px -${f.y * k}px`,
      // 줄여 보일 때 가장 가까운 픽셀만 고르면 테두리가 끊겨 보여서 부드럽게
      ...(k < 1 ? { imageRendering: 'auto' } : {}),
    },
  });
}

function setFrame(el, sheet, name, scale) {
  const s = data[sheet];
  const f = s?.frames?.[name];
  if (f) el.style.backgroundPosition = `-${f.x * scale * s.unit}px -${f.y * scale * s.unit}px`;
  return f;
}

export const pixel = {
  /** 시트 목록을 한 번만 불러옵니다 (미니게임 시작 때 await) */
  ready() {
    if (!loading) {
      loading = Promise.all(SHEETS.map(async (id) => {
        try {
          const res = await fetch(`./assets/pixel/${id}.json`, { cache: 'no-store' });
          if (!res.ok) return;
          const j = await res.json();
          const fr = Object.values(j.frames || {});
          if (!fr.length) return;
          j.sheetW = Math.max(...fr.map((f) => f.x + f.w));
          j.sheetH = Math.max(...fr.map((f) => f.y + f.h));
          j.unit = j.unit || 1;
          j.url = `./assets/pixel/${j.image || `${id}.png`}`;
          data[id] = j;
        } catch (e) {
          /* 그림 없이 진행 */
        }
      }));
    }
    return loading;
  },

  has(sheet, frame) { return Boolean(data[sheet]?.frames?.[frame]); },

  /** 프레임 좌표 {x, y, w, h} (원본 PNG 기준) */
  frameOf(sheet, frame) { return data[sheet]?.frames?.[frame] || null; },

  /** 시트 JSON 의 덧붙인 값(예: cafe_room 의 spots). 시트가 없으면 null */
  info(sheet) { return data[sheet] || null; },

  /**
   * 캔버스 g 에 그림 한 장(img = await pixel.image(sheet)): 가로 w px 로, (x, y) = 그림의 아래 가운데(mid 면 한가운데).
   * 미니게임 방의 가구(cafe_objects)를 칸 자리에 놓을 때 씀. 그린 높이를 돌려줌
   */
  paint(g, img, sheet, frame, x, y, w, { mid = false } = {}) {
    const f = data[sheet]?.frames?.[frame];
    if (!img || !f) return 0;
    const hh = (f.h * w) / f.w;
    g.imageSmoothingEnabled = w < f.w; // 줄일 때만 부드럽게
    g.drawImage(img, f.x, f.y, f.w, f.h, x - w / 2, mid ? y - hh / 2 : y - hh, w, hh);
    return hh;
  },

  /** 미니게임 방 바닥: 새 매장 그림(cafe_room)과 같은 크림·베이지 체크무늬(T px 칸). 베이지는 얼룩이 잘 보이게 조금 연하게 */
  floor(g, width, height, T) {
    for (let r = 0; r * T < height; r++) {
      for (let c = 0; c * T < width; c++) {
        g.fillStyle = (r + c) % 2 ? '#E4CEAC' : '#F4E9CA';
        g.fillRect(c * T, r * T, T, T);
      }
    }
  },

  /** 모든 시트 그림을 미리 받아 둠(앱을 켤 때 뒤에서: 미니게임에서 바닥만 먼저 뜨고 가구·사람이 늦게 뜨지 않게) */
  warm() { return Promise.all(Object.keys(data).map((id) => pixel.image(id))); },

  /** 캔버스에 그릴 시트 그림(한 번만 불러옴). 없으면 null */
  image(sheet) {
    if (!data[sheet]) return Promise.resolve(null);
    if (!images[sheet]) {
      images[sheet] = new Promise((resolve) => {
        const im = new Image();
        im.onload = () => resolve(im);
        im.onerror = () => resolve(null);
        im.src = data[sheet].url;
      });
    }
    return images[sheet];
  },

  /** 멈춘 그림 한 장 (소품 등). 없으면 null */
  icon(sheet, frame, scale = 4, cls = '') {
    return frameEl(sheet, frame, scale, cls);
  },

  /** 미니게임 물건·얼룩(mg_objects, 원본 크기 = scale 1). 그림에 테두리가 있어 소품의 잉크 테두리는 안 씀. 없으면 null */
  art(frame, scale = 1, cls = '') {
    return frameEl('mg_objects', frame, scale, `px-art ${cls}`.trim());
  },

  /**
   * 미니게임 사람(people 시트)을 발끝 (x, y) 에 세움(앉은 그림은 의자 다리 끝이 발끝). 부모 안 절대 위치.
   * anim: 'walk_customer'(두 프레임)·'sit_student'(한 장) 같은 태그. scale 은 연우와 같은 기준(3 = 미니게임 연우 크기). 없으면 null
   */
  person(anim, x, y, { scale = 3, cls = '' } = {}) {
    const sp = pixel.sprite('people', anim, { scale, cls: `px-person ${cls}`.trim() });
    if (!sp) return null;
    sp.el.style.left = `${x - sp.foot.x}px`;
    sp.el.style.top = `${y - sp.foot.y}px`;
    return sp;
  },

  /**
   * 움직이는 그림: 태그 이름(인물 시트) 또는 프레임 이름 배열(효과 시트)을 반복합니다.
   * 돌려주는 값: { el, w, h, foot, play(태그), stop() } 또는 null
   *  - w·h: 화면 크기(px) · foot: 그림 안 발끝 자리 {x, y}(px). 자리를 잡을 때 이 값으로 빼 주세요.
   */
  sprite(sheet, anim, { scale = 4, cls = '' } = {}) {
    const s = data[sheet];
    if (!s) return null;
    const framesOf = (a) => (Array.isArray(a) ? a : s.tags?.[a] || []).filter((n) => s.frames[n]);
    let list = framesOf(anim);
    if (!list.length) return null;
    const el = frameEl(sheet, list[0], scale, `px-sprite ${cls}`);
    const f0 = s.frames[list[0]];
    const k = scale * s.unit;
    let i = 0;
    let timer = null;
    const tick = () => {
      if (!el.isConnected) { timer = null; return; }
      i = (i + 1) % list.length;
      const f = setFrame(el, sheet, list[i], scale);
      timer = setTimeout(tick, (f?.duration || 160) * slow());
    };
    const api = {
      el,
      w: f0.w * k,
      h: f0.h * k,
      foot: { x: (s.foot?.x ?? f0.w / 2) * k, y: (s.foot?.y ?? f0.h) * k },
      play(next) {
        const l = framesOf(next);
        if (!l.length) return api;
        list = l;
        i = 0;
        setFrame(el, sheet, list[0], scale);
        clearTimeout(timer);
        timer = null;
        if (!reduced() && list.length > 1) timer = setTimeout(tick, (data[sheet].frames[list[0]].duration || 160) * slow());
        return api;
      },
      stop() { clearTimeout(timer); timer = null; return api; },
    };
    // 화면에 붙은 뒤 움직이기 시작
    requestAnimationFrame(() => { if (!reduced() && list.length > 1 && !timer) timer = setTimeout(tick, 160 * slow()); });
    return api;
  },

  /** 짧게 터지는 효과: host 안 (x, y) 위치(px, host 기준 중심)에 프레임을 차례로 보여 주고 사라짐 */
  burst(host, frames, { x = 0, y = 0, scale = 4, count = 1, spread = 40 } = {}) {
    if (!host || reduced() || !data.effects) return;
    for (let k = 0; k < count; k++) {
      const sp = pixel.sprite('effects', frames, { scale, cls: 'px-burst' });
      if (!sp) return;
      const dx = count > 1 ? (Math.random() - 0.5) * spread * 2 : 0;
      const dy = count > 1 ? (Math.random() - 0.5) * spread : 0;
      sp.el.style.left = `${x + dx}px`;
      sp.el.style.top = `${y + dy}px`;
      sp.el.style.animationDelay = `${k * 70}ms`;
      host.append(sp.el);
      setTimeout(() => sp.el.remove(), 760 + k * 70);
    }
  },
};
