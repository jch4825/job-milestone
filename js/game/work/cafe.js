/**
 * 픽셀 매장: 근무 시간 동안 연우가 근무판대로 일하는 모습 (docs/v3_design.md 6장)
 *  - 매장은 Flow로 만든 매장 그림 한 장(cafe_room, 2026-10-25)을 캔버스에 깔고, 연우(픽셀)·손님(얼굴 토큰)을 그 위에 움직입니다
 *    자리(계산대·세면대·테이블…)는 그 그림에서 잰 발 위치(cafe_room.json 의 spots, tools/import-pixel-sheet.py ROOM). 그림이 없으면 옛 타일 매장
 *  - 위: 시간 띠 + 상태 막대(컵·얼음·빵·청결·기운) / 아래: 지금 칸의 할 일 + [다음]
 *  - 시간은 [다음]을 누를 때만 흐릅니다(시간 제한 없음). 움직임 줄이기에서는 이동 연출 없이 바로 바뀜
 */

import { $, h, sleep, dur, isReducedMotion } from '../../core/dom.js';
import { ICON } from '../../data/icons.js';
import { audio } from '../../av/audio.js';
import { input } from '../../core/input.js';
import { pixel } from '../../ui/pixel.js';
import { portraitHTML } from '../../data/characters.js';
import { TASKS, BLOCKS, METERS, MAX, HANDS, handsSpeech } from '../../data/work/tasks.js';
import { tts } from '../../av/tts.js';

const T = 64; // 타일 한 칸(16px × 4)
const COLS = 20;
const ROWS = 7;

// 매장 배치: [타일, 열, 행] (위에 그린 것이 앞)
const ROOM = (() => {
  const L = [];
  for (let c = 0; c < COLS; c++) { L.push(['wall_cream', c, 0]); L.push(['wall_trim', c, 1]); }
  for (let r = 2; r < ROWS; r++) for (let c = 0; c < COLS; c++) L.push([(r + c) % 2 ? 'floor_checker' : 'floor_cream', c, r]);
  for (let c = 11; c < COLS; c++) { L.push(['counter_top', c, 2]); L.push(['counter_front', c, 3]); L.push(['floor_shadow', c, 4]); }
  L.push(['counter_corner', 11, 3]);
  L.push(['showcase_bread', 11, 2], ['showcase_bread', 12, 2], ['glass_highlight', 12, 2]);
  L.push(['cup_rack', 14, 2], ['paper_cup_slot', 15, 2], ['ice_cup_slot', 16, 2], ['straw_cup', 17, 2]);
  L.push(['window_day', 3, 0], ['window_day', 4, 0], ['window_day', 7, 0], ['window_day', 8, 0]);
  L.push(['pendant_light', 5, 0], ['pendant_light', 10, 0], ['pendant_light', 15, 0]);
  L.push(['shelf_bread', 9, 1], ['shelf', 10, 1], ['wash_poster', 18, 0], ['sink_faucet', 19, 0], ['sink_basin', 19, 1]);
  L.push(['door_frame', 0, 2], ['door_glass', 0, 3], ['open_sign', 1, 1]);
  L.push(['chair_leg', 2, 5], ['chair_seat', 3, 5], ['chair_leg', 4, 5], ['chair_leg', 6, 5], ['chair_seat', 7, 5], ['chair_leg', 8, 5]);
  L.push(['plant_leaf', 9, 4], ['plant_pot', 9, 5], ['plant_leaf', 1, 5], ['plant_pot', 1, 6]);
  return L;
})();

/** 일하는 자리 [열, 행](발 위치) · enter 손님이 나타나는 곳 · queue 손님 줄 · mark 바닥 사건 — 매장 그림이 없을 때(옛 타일 매장) */
const TILE_SPOTS = {
  counter: [13, 4], rack: [15, 4], bar: [16, 4], showcase: [12, 4], sink: [18, 4],
  tables: [5, 6], floor: [8, 6], door: [2, 6], staff: [19, 5],
  enter: [0, 5], queue: [11, 5], mark: [6, 6],
};
// 지금 매장의 자리 [x, y](매장 px, 발 위치): 새 매장 그림이 있으면 그 그림에서 잰 자리(cafe_room.json 의 spots)
let SPOT = {};
function layout() {
  const art = pixel.info('cafe_room')?.spots;
  SPOT = art || Object.fromEntries(Object.entries(TILE_SPOTS).map(([k, [c, r]]) => [k, [c * T + T / 2, (r + 1) * T]]));
}
const ANIM_OF = { carry: 'carry', wash: 'wash', wipe: 'wipe', sweep: 'sweep', bow: 'bow', idle: 'idle' };
const GUEST_FACES = ['customer', 'student', 'auntie', 'daeri', 'customer', 'student'];

let el = null;
let room = null;
let yeon = null;
let yeonEl = null;
let meterEls = {};
let timeEl = null;
let marker = null;
let nowEl = null;
let barEl = null;
let shown = { cups: 0, ice: 0, bread: 0, clean: 0, energy: 0 };
let pos = [0, 0];
let autoOn = false;
let blockIdx = -1;

async function drawRoom(canvas) {
  const g = canvas.getContext('2d');
  g.imageSmoothingEnabled = false;
  g.fillStyle = '#F3E3CC';
  g.fillRect(0, 0, canvas.width, canvas.height);
  const art = await pixel.image('cafe_room'); // 새 매장 그림 한 장(2026-10-25)
  if (art) { g.drawImage(art, 0, 0, canvas.width, canvas.height); return; }
  const img = await pixel.image('cafe_tileset');
  if (!img) return;
  for (const [name, c, r] of ROOM) {
    const f = pixel.frameOf('cafe_tileset', name);
    if (f) g.drawImage(img, f.x, f.y, f.w, f.h, c * T, r * T, T, T);
  }
}

function meterRow() {
  return h('div', { class: 'wk-meters' }, ...METERS.map((m) => {
    const cells = h('span', { class: 'wk-cells4' }, ...Array.from({ length: MAX }, () => h('i')));
    const box = h('div', { class: `wk-meter m-${m.id}`, 'aria-label': m.name }, h('i', { class: 'wk-m-ico', html: ICON(m.icon) }), h('b', { text: m.name }), cells);
    meterEls[m.id] = box;
    return box;
  }));
}

function timeline() {
  marker = h('i', { class: 'wk-tl-marker' });
  timeEl = h('div', { class: 'wk-tl' }, ...BLOCKS.map((b) => h('span', { class: `wk-tl-seg ${b.peak ? 'peak' : ''}`, 'data-block': b.id, style: { flexGrow: String(minutes(b)) } }, h('b', { text: b.time }), h('small', { text: b.name }))), marker);
  return timeEl;
}

function minutes(b) {
  const m = (t) => { const [hh, mm] = t.split(':').map(Number); return hh * 60 + mm; };
  return m(b.end) - m(b.time);
}

function placeSprite(x, y) {
  if (!yeonEl) return;
  yeonEl.style.left = `${x - yeon.foot.x}px`;
  yeonEl.style.top = `${y - yeon.foot.y}px`;
  yeonEl.style.zIndex = String(10 + Math.round(y / T));
}

async function walkTo([x, y]) {
  if (!yeon) return;
  const [x0, y0] = pos;
  if (x0 === x && y0 === y) return;
  const dist = Math.hypot(x - x0, y - y0) / T;
  const ms = isReducedMotion() ? 0 : Math.min(1300, 260 + dist * 120);
  // 더 많이 움직이는 쪽으로 걷는 모습
  yeon.play(Math.abs(x - x0) >= Math.abs(y - y0) ? (x < x0 ? 'walk_left' : 'walk_right') : (y > y0 ? 'walk_down' : 'walk_up'));
  yeonEl.style.transition = ms ? `left ${ms}ms linear, top ${ms}ms linear` : 'none';
  placeSprite(x, y);
  pos = [x, y];
  await sleep(ms);
  yeon.play('idle');
}

function bubble(text, ms = 1400) {
  if (!yeonEl) return;
  const b = h('span', { class: 'wk-say-bubble', text });
  yeonEl.append(b);
  setTimeout(() => b.remove(), dur(ms));
}

function floatDelta(id, d) {
  const box = meterEls[id];
  if (!box || !d) return;
  const f = h('span', { class: `wk-delta ${d > 0 ? 'up' : 'down'}`, text: d > 0 ? `+${d}` : String(d) });
  box.append(f);
  setTimeout(() => f.remove(), dur(1100));
}

export const cafe = {
  isOn() { return Boolean(el); },

  async mount() {
    if (el) return;
    await pixel.ready();
    layout();
    const canvas = h('canvas', { class: 'wk-room-canvas', width: String(COLS * T), height: String(ROWS * T), 'aria-hidden': 'true' });
    room = h('div', { class: 'wk-room', role: 'img', 'aria-label': '카페 매장' }, canvas);
    yeon = pixel.sprite('yeonwoo', 'idle', { scale: 4, cls: 'wk-yeon' });
    yeonEl = yeon?.el || null;
    if (yeonEl) room.append(yeonEl);
    pos = [...SPOT.counter];
    placeSprite(...SPOT.counter);
    meterEls = {};
    nowEl = h('div', { class: 'wk-now' });
    barEl = h('div', { class: 'wk-bar' }, nowEl);
    el = h('section', { class: 'wk-view', 'aria-label': '근무 중' }, h('div', { class: 'wk-top' }, timeline(), meterRow()), room, barEl);
    $('#layer-work').replaceChildren(el);
    document.body.classList.add('working');
    requestAnimationFrame(() => el?.classList.add('is-in'));
    await drawRoom(canvas);
  },

  unmount() {
    if (!el) return;
    const e = el;
    el = null;
    yeon = null;
    yeonEl = null;
    document.body.classList.remove('working');
    e.classList.remove('is-in');
    setTimeout(() => e.remove(), dur(240));
  },

  getState() { return el ? { on: true, block: blockIdx } : null; },

  async restore(st, work) {
    if (!st) { cafe.unmount(); return; }
    if (!el) await cafe.mount();
    cafe.setBlock(st.block);
    cafe.setMeters(work || {}, { quiet: true });
    pos = [...SPOT.counter];
    if (yeonEl) { yeonEl.style.transition = 'none'; placeSprite(...SPOT.counter); yeon.play('idle'); }
  },

  setBlock(i) {
    blockIdx = i;
    if (!timeEl) return;
    timeEl.querySelectorAll('.wk-tl-seg').forEach((s, k) => { s.classList.toggle('now', k === i); s.classList.toggle('past', k < i); });
    const seg = timeEl.querySelectorAll('.wk-tl-seg')[Math.max(0, i)];
    if (seg && marker) { marker.style.left = `${seg.offsetLeft + (i < 0 ? 0 : seg.offsetWidth / 2)}px`; }
  },

  /** 상태 막대 그리기. quiet 가 아니면 바뀐 만큼 +/- 가 떠오름 */
  setMeters(state, { quiet = false } = {}) {
    for (const m of METERS) {
      const v = Math.max(0, Math.min(MAX, Number(state[m.id] ?? 0)));
      const box = meterEls[m.id];
      if (!box) continue;
      if (!quiet && v !== shown[m.id]) floatDelta(m.id, v - shown[m.id]);
      shown[m.id] = v;
      box.classList.toggle('low', v <= 1);
      box.querySelectorAll('.wk-cells4 i').forEach((c, k) => c.classList.toggle('on', k < v));
      box.setAttribute('aria-label', `${m.name} ${v}칸`);
    }
  },

  /** 지금 칸 안내 + [다음]/[자동]. 자동이면 잠깐 보여 주고 넘어감 */
  async waitNext(block, tasks) {
    if (!el) return;
    const next = h('button', { class: 'btn btn-big btn-red wk-next' }, h('span', { text: '다음' }), h('i', { html: ICON('arrow_right') }));
    const auto = h('button', { class: `btn btn-soft wk-auto ${autoOn ? 'on' : ''}`, 'aria-pressed': String(autoOn) }, h('i', { html: ICON('play') }), h('span', { text: '자동' }));
    nowEl.replaceChildren(
      h('div', { class: 'wk-now-time' }, h('b', { text: block.time }), h('span', { text: block.name })),
      h('div', { class: 'wk-now-tasks' }, ...tasks.map((id) => h('span', { class: 'wk-chip' }, h('i', { html: ICON(TASKS[id].icon) }), h('span', { text: TASKS[id].label })))),
      auto, next);
    input.pushScope(barEl);
    await new Promise((resolve) => {
      let t = null;
      const go = () => { clearTimeout(t); resolve(); };
      next.addEventListener('click', (e) => { e.stopPropagation(); audio.sfx('tap'); go(); }, { once: true });
      auto.addEventListener('click', (e) => {
        e.stopPropagation();
        autoOn = !autoOn;
        auto.classList.toggle('on', autoOn);
        auto.setAttribute('aria-pressed', String(autoOn));
        if (autoOn) t = setTimeout(go, dur(900));
      });
      if (autoOn) t = setTimeout(go, dur(1400));
      else next.focus({ preventScroll: true });
    });
    input.popScope(barEl);
    next.disabled = true;
    auto.disabled = true;
  },

  /** '직접 하기 / 보기' 고르기 (미니게임이 있는 자석). 쉬는 시간은 '게임하기 / 그냥 쉬기' */
  async askHands(id) {
    if (!el) return 'watch';
    const t = TASKS[id];
    const ask = t.hands || HANDS;
    const doIt = h('button', { class: 'btn btn-big btn-red wk-hand do' }, h('i', { html: ICON(t.rest ? 'phone' : 'hand') }), h('span', { text: ask.yes }));
    const watch = h('button', { class: 'btn btn-soft wk-hand watch' }, h('i', { html: ICON(t.rest ? 'tea' : 'play') }), h('span', { text: ask.no }));
    nowEl.replaceChildren(h('div', { class: 'wk-now-ask' }, h('i', { html: ICON(t.icon) }), h('b', { text: t.label }), h('span', { text: ask.q })), watch, doIt);
    input.pushScope(barEl);
    doIt.focus({ preventScroll: true });
    tts.speak(handsSpeech(id), 'sys');
    const r = await new Promise((resolve) => {
      doIt.addEventListener('click', (e) => { e.stopPropagation(); audio.sfx('tap'); resolve('hands'); }, { once: true });
      watch.addEventListener('click', (e) => { e.stopPropagation(); audio.sfx('tap'); resolve('watch'); }, { once: true });
    });
    input.popScope(barEl);
    nowEl.replaceChildren();
    return r;
  },

  /** 자석 하나: 자리로 걸어가 일하고, 상태가 바뀜 */
  async doTask(id, stateAfter) {
    const t = TASKS[id];
    if (!t || !el) return;
    const at = SPOT[t.station] || SPOT.counter;
    await walkTo(at);
    if (t.rest) {
      bubble('쉬는 중', 1800);
      yeonEl?.classList.add('resting');
      await sleep(dur(1500));
      yeonEl?.classList.remove('resting');
    } else {
      yeon?.play(ANIM_OF[t.anim] || 'idle');
      bubble(t.label);
      audio.sfx(t.anim === 'wash' ? 'water' : t.anim === 'wipe' ? 'wipe' : t.anim === 'sweep' ? 'sweep' : 'tap');
      await sleep(dur(1100));
      if (t.fill || t.add) pixel.burst(room, ['sparkle_0', 'sparkle_1'], { x: at[0], y: at[1] - 80, count: 3, spread: 50 });
      yeon?.play('idle');
    }
    if (stateAfter) cafe.setMeters(stateAfter);
  },

  /** 손님 n명이 들어와 주문하고 나감. short 명은 기다림(땀) */
  async guests(n, short, stateAfter) {
    if (!el || !n) { if (stateAfter) cafe.setMeters(stateAfter); return; }
    await walkTo(SPOT.counter);
    const reduced = isReducedMotion();
    const [doorX, doorY] = SPOT.enter;
    const [queueX] = SPOT.queue;
    const tokens = [];
    for (let k = 0; k < n; k++) {
      const face = GUEST_FACES[(blockIdx * 3 + k) % GUEST_FACES.length];
      const tok = h('span', { class: `wk-guest ${k >= n - short ? 'waiting' : ''}`, html: portraitHTML(face, k >= n - short ? 'worried' : 'smile') });
      tok.style.left = `${doorX - 34}px`;
      tok.style.top = `${doorY - 90 - (k % 2) * 30}px`;
      room.append(tok);
      tokens.push(tok);
    }
    if (reduced) {
      await sleep(400);
    } else {
      for (let k = 0; k < tokens.length; k++) {
        const tok = tokens[k];
        setTimeout(() => {
          tok.style.transition = 'left .8s ease-in-out, top .8s ease-in-out, opacity .3s';
          tok.style.left = `${queueX - 34 - (k % 3) * 46}px`;
          tok.classList.add('in');
        }, k * 220);
      }
      await sleep(Math.min(2400, n * 220 + 900));
      yeon?.play('bow');
      audio.sfx('bell');
      await sleep(500);
      for (let k = 0; k < tokens.length; k++) {
        const tok = tokens[k];
        setTimeout(() => {
          tok.style.left = `${doorX - 34}px`;
          tok.classList.add('out');
        }, k * 120);
      }
      await sleep(Math.min(1800, n * 120 + 800));
      yeon?.play('idle');
    }
    tokens.forEach((t) => t.remove());
    if (stateAfter) cafe.setMeters(stateAfter);
  },

  /** 바닥 사건 표시(쏟음 등): 매장 위에 작은 표시. 지울 때 다시 부름 */
  mark(kind, on = true) {
    if (!room) return;
    room.querySelectorAll(`.wk-mark.${kind}`).forEach((m) => m.remove());
    if (!on) return;
    const [x, y] = SPOT.mark;
    room.append(h('span', { class: `wk-mark ${kind}`, style: { left: `${x - 60}px`, top: `${y - 40}px` } }));
  },
};
