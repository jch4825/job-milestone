/**
 * 미니게임: 빵 진열하기 (타이밍 맞춰 누르기) — 4장 '진열대 빵 채우기', 2026-10-15
 *  - 연우가 빵을 집게로 들고 쟁반 위를 왔다 갔다 해요. 빈 칸 위에 왔을 때 [놓기]를 누르면 빵이 그 칸에 놓여요.
 *    가운데에 맞으면 '딱!'(반짝), 조금 비켜도 '좋아요'. 빈 칸이 아니거나 칸 사이면 빵이 집게로 돌아와요(벌 없음).
 *  - 쟁반 하나(5칸)를 다 채우면 진열대로 들어가고 새 쟁반이 와요. 쟁반 3개 = 빵 15개(사용자 의견: 4개는 너무 적다).
 *    쟁반이 바뀔 때마다 조금씩 빨라져요.
 *  - 탄 빵은 넣지 않습니다(사용자 의견: 지금 그림으로는 알아보기 어려움). 정답 고르기·아차 없음, 손맛만.
 *  - 빠르기: 설정 '시간 제한'(arcade.js). 끄기·자동 스캔이면 턴 방식([옆으로 가기]로 한 칸씩, [놓기]는 그 칸에)
 *  - 픽셀 그림(2026-10-26): 왼쪽 위 주방 창 너머로 빵 쟁반을 든 민재, 오른쪽 위 빈 진열장(쟁반을 다 채울 때마다 선반 한 칸에 빵),
 *    아래는 계산대 위 긴 쟁반(쟁반 그림의 가운데를 늘림)
 */

import { h, sleep, dur } from '../../core/dom.js';
import { ICON } from '../../data/icons.js';
import { audio } from '../../av/audio.js';
import { tts } from '../../av/tts.js';
import { dialogue } from '../../ui/dialogue.js';
import { pixel } from '../../ui/pixel.js';
import { faceHTML } from '../../data/characters.js';
import { frame, line, shake, abortGeneration } from './frame.js';
import { pace, loop, startGate, arrowKeys, popText, isDebug } from './arcade.js';

const N = 5;               // 쟁반 한 판의 칸
const TRAYS = 3;           // 쟁반 수 → 빵 15개
const SLOT_W = 170;
const X0 = 120;            // 첫 칸 왼쪽
const SHELF_Y = 400;       // 칸의 윗면
const HOLD_Y = 250;        // 들고 있는 빵의 높이
const PERIOD = 2800;       // 한쪽 끝에서 다른 쪽 끝까지(ms, 보통)
const BREADS = ['salt_bread', 'croissant', 'muffin'];
const slotX = (i) => X0 + SLOT_W / 2 + i * SLOT_W;
// 진열장 그림(showcase, 1.25배) 안의 선반: 위→아래 선반 위 빵 밑면 높이, 첫 빵 가운데와 빵 사이(그림 좌표 px)
const CASE = { scale: 1.25, shelves: [47, 83, 116], x0: 34, gap: 30 };
const TRAY_Y = 446; // 계산대 위 쟁반 윗면(빵 밑면 486 이 쟁반 안쪽에 오게)

const TITLE = '빵 진열하기';
const HOWTO = '연우가 빵을 들고 왔다 갔다 해요. 빈 칸 위에 왔을 때 [놓기]를 눌러요.';
const SAY = {
  tray: '쟁반 하나를 다 채웠어요. 진열대에 넣었어요.',
  done: '진열대가 가득 찼어요!',
};

const speechOf = (opts) => opts.speech || `${opts.title || TITLE}. ${HOWTO}`;

export function timingLines(opts = {}) {
  return [line.sys(speechOf(opts)), line.sys(HOWTO), line.sys(SAY.tray), line.sys(SAY.done)];
}

function breadArt(kind, scale = 4) {
  return pixel.icon('props', kind, scale) || h('i', { class: 'tg-ico', html: ICON(kind === 'salt_bread' ? 'bread' : kind) });
}

export async function timing(opts = {}) {
  const t0 = performance.now();
  const gen = abortGeneration();
  const stopped = () => abortGeneration() !== gen;
  await pixel.ready();
  const { turn, k } = pace();
  const f = frame({ title: opts.title || TITLE, instruction: HOWTO, icon: 'croissant', cls: 'mg-timing mg-arcade', speech: speechOf(opts), quit: Boolean(opts.quit) });
  f.el.dataset.arcade = 'timing';
  document.body.classList.add('mg-arcade');

  let started = false;
  let busy = false;
  let over = false;
  let speed = 1;
  let auto = false;

  const GOAL = N * TRAYS;
  let s = { slots: Array(N).fill(null), tray: 0, placed: 0, no: 0, held: BREADS[0], x: 0, dir: 1, combo: 0, done: [] };
  const periodMs = () => PERIOD * k * Math.pow(0.9, s.tray);

  // ---- 뷰 ----
  const field = h('div', { class: 'tg-field' });
  // 주방: 창 그림이 있으면 창 너머(창 구멍)로 빵 쟁반을 든 민재가 보임. 없으면 옛 얼굴 상자
  const winImg = pixel.art('kitchen_window', 1.3);
  const chef = winImg && pixel.person('minjae_tray', 77, 116, { scale: 2.7, cls: 'tg-chef-px' }); // 쟁반이 창턱에 오게
  const kitchen = winImg
    ? h('div', { class: 'tg-kitchen has-art', 'aria-hidden': 'true' }, chef?.el, winImg, h('b', { text: '주방' }))
    : h('div', { class: 'tg-kitchen', 'aria-hidden': 'true' }, h('span', { class: 'tg-chef', html: faceHTML('minjae', 'smile') }), h('b', { text: '주방' }));
  // 아래: 계산대 위 긴 쟁반(캔버스, 아래에서 그림). 그림이 없으면 옛 유리 진열장 CSS
  const counter = h('canvas', { class: 'tg-counter', width: '1100', height: '140', 'aria-hidden': 'true' });
  const shelfEl = pixel.has('cafe_objects', 'tray') ? counter : h('div', { class: 'tg-case', 'aria-hidden': 'true' }, h('span', { class: 'tg-glass' }), h('span', { class: 'tg-base' }));
  const slotEls = Array.from({ length: N }, (_, i) => h('span', { class: 'tg-slot', style: { left: `${X0 + i * SLOT_W + 8}px`, width: `${SLOT_W - 16}px` } }));
  const yeon = pixel.sprite('yeonwoo', 'carry', { scale: 3, cls: 'tg-yeon' });
  const heldEl = h('span', { class: 'tg-held' });
  const tongs = h('i', { class: 'tg-tongs', 'aria-hidden': 'true' });
  const pal = h('div', { class: 'tg-pal', 'aria-hidden': 'true' }, yeon?.el || h('span', { class: 'tg-yeon-fallback', html: faceHTML('yeonwoo', 'normal') }), tongs, heldEl);
  const aim = h('i', { class: 'tg-aim', 'aria-hidden': 'true' });
  // 진열대: 빈 진열장 그림의 선반에 다 채운 쟁반의 빵이 한 줄씩. 그림이 없으면 옛 막대 셋
  const caseImg = pixel.art('showcase', CASE.scale);
  const caseBreads = h('span', { class: 'tg-case-breads' });
  const traysEl = caseImg
    ? h('div', { class: 'tg-trays has-art', 'aria-hidden': 'true' }, h('span', { class: 'tg-case-art' }, caseImg, caseBreads), h('b', { text: '진열대' }))
    : h('div', { class: 'tg-trays', 'aria-hidden': 'true' }, h('b', { text: '진열대' }), h('span', { class: 'tg-trays-in' }, ...Array.from({ length: TRAYS }, () => h('i'))));
  field.append(kitchen, shelfEl, ...slotEls, aim, pal, traysEl);
  field.classList.toggle('has-art', shelfEl === counter);
  if (shelfEl === counter) {
    (async () => {
      const g = counter.getContext('2d');
      // 계산대(매장 그림의 나무 색): 윗면 · 앞면 · 테두리. 캔버스 위쪽 = 필드 420px
      g.fillStyle = '#4A3226'; g.fillRect(0, 60, 1100, 80);
      g.fillStyle = '#E3AE72'; g.fillRect(0, 64, 1100, 22);
      g.fillStyle = '#B9814F'; g.fillRect(0, 90, 1100, 50);
      g.fillStyle = '#9C6A3E'; for (let x = 70; x < 1100; x += 180) g.fillRect(x, 96, 6, 44);
      const img = await pixel.image('cafe_objects');
      const f = pixel.frameOf('cafe_objects', 'tray');
      if (!img || !f) return;
      // 쟁반: 양 끝(24px)은 그대로, 가운데를 늘려 다섯 칸 길이로
      const cap = 24;
      const ty = TRAY_Y - 420;
      const th = 62;
      const cw = (cap * th) / f.h;
      const x0 = X0 - 14;
      const w = N * SLOT_W + 28;
      g.imageSmoothingEnabled = false;
      g.drawImage(img, f.x, f.y, cap, f.h, x0, ty, cw, th);
      g.drawImage(img, f.x + cap, f.y, f.w - cap * 2, f.h, x0 + cw, ty, w - cw * 2, th);
      g.drawImage(img, f.x + f.w - cap, f.y, cap, f.h, x0 + w - cw, ty, cw, th);
    })();
  }

  const meter = h('span', { class: 'ct-meter' }, ...Array.from({ length: GOAL }, () => h('i')));
  const meterN = h('b', { class: 'ct-meter-n' });
  const trayText = h('span', { class: 'tg-tray-n' });
  const dropB = h('button', { class: 'btn btn-big btn-red tg-drop' }, h('i', { html: ICON('croissant') }), h('span', { text: '놓기' }));
  const stepB = turn ? h('button', { class: 'btn btn-soft tg-step' }, h('i', { html: ICON('arrow_right') }), h('span', { text: '옆으로 가기' })) : null;
  const status = h('p', { class: 'ct-status', role: 'status' });
  const panel = h('div', { class: 'ct-panel' },
    h('div', { class: 'ct-card' }, h('h3', {}, h('i', { html: ICON('bread') }), '진열한 빵'), meter, meterN, trayText),
    stepB, dropB, status);
  f.body.append(h('div', { class: 'ct-stage' }, field), panel);

  /* ---- 위치 ---- */
  const posX = () => slotX(0) + s.x * (slotX(N - 1) - slotX(0));
  const nearest = () => {
    const f2 = s.x * (N - 1);
    const i = Math.round(f2);
    return { i, off: Math.abs(f2 - i) };
  };

  let lastUi = '';
  function render() {
    pal.style.transform = `translateX(${posX()}px)`;
    const { i, off } = nearest();
    aim.style.transform = `translateX(${slotX(i)}px)`;
    aim.classList.toggle('on', off < 0.32 && !s.slots[i] && started && !busy);
    const ui = `${s.slots.join()}|${s.held}|${s.tray}|${busy}|${over}|${started}`;
    if (ui === lastUi) return;
    lastUi = ui;
    slotEls.forEach((el, n) => {
      el.replaceChildren(...(s.slots[n] ? [breadArt(s.slots[n], 4)] : []));
      el.classList.toggle('empty', !s.slots[n]);
    });
    heldEl.replaceChildren(...(s.held ? [breadArt(s.held, 4)] : []));
    meter.querySelectorAll('i').forEach((c, n) => c.classList.toggle('on', n < s.placed));
    meterN.textContent = `${s.placed} / ${GOAL}`;
    trayText.textContent = `쟁반 ${Math.min(s.tray + 1, TRAYS)} / ${TRAYS}`;
    traysEl.querySelectorAll('.tg-trays-in i').forEach((c, n) => c.classList.toggle('on', n < s.tray));
    // 진열장 선반: 다 채운 쟁반마다 빵 다섯 개를 한 줄씩(위 선반부터)
    caseBreads.replaceChildren(...s.done.flatMap((kinds, r) => kinds.map((kind, n) => {
      const el = breadArt(kind, 1.5);
      el.style.left = `${CASE.x0 + n * CASE.gap}px`;
      el.style.top = `${CASE.shelves[r]}px`;
      return el;
    })));
    dropB.disabled = !started || busy || over || !s.held;
    if (stepB) stepB.disabled = !started || busy || over;
    status.textContent = `진열한 빵 ${s.placed}/${GOAL}개 · 쟁반 ${Math.min(s.tray + 1, TRAYS)}/${TRAYS}`;
  }

  /* ---- 움직임 ---- */
  function move(dt) {
    if (turn) return;
    let x = s.x + s.dir * (dt / periodMs());
    if (x > 1) { x = 2 - x; s.dir = -1; yeon?.play('walk_left'); }
    if (x < 0) { x = -x; s.dir = 1; yeon?.play('walk_right'); }
    s.x = x;
  }
  function stepOnce() {
    // 턴 방식: 칸 가운데에서 다음 칸 가운데로(끝에서 돌아섬)
    const i = nearest().i;
    if (i + s.dir > N - 1 || i + s.dir < 0) s.dir = -s.dir;
    s.x = (i + s.dir) / (N - 1);
    audio.sfx('focus');
    render();
  }

  async function drop() {
    if (!started || busy || over || !s.held) return;
    busy = true;
    const { i, off } = nearest();
    const x = slotX(i);
    if (s.slots[i] || off > 0.32) {
      audio.sfx('bump');
      shake(heldEl);
      popText(field, '앗!', posX(), HOLD_Y - 40);
      s.combo = 0;
      busy = false;
      render();
      return;
    }
    s.slots[i] = s.held;
    s.held = null;
    s.placed += 1;
    const perfect = off <= 0.12;
    s.combo = perfect ? s.combo + 1 : 0;
    audio.sfx(perfect ? 'catch' : 'tray');
    popText(field, perfect ? (s.combo >= 3 ? '딱딱딱!' : '딱!') : '좋아요', x, SHELF_Y - 30, perfect ? 'big' : '');
    pixel.burst(field, perfect ? ['sparkle_big_0', 'sparkle_big_1'] : ['sparkle_0', 'sparkle_1'], { x, y: SHELF_Y + 20, count: perfect ? 3 : 2, spread: 40 });
    render();
    await sleep(dur(240));
    if (s.slots.every(Boolean)) {
      // 쟁반 하나 끝: 진열대로
      s.tray += 1;
      s.done.push([...s.slots]);
      pixel.burst(field, ['sparkle_big_0', 'sparkle_big_1'], { x: 990, y: 90, count: 3, spread: 60 }); // 진열장에 들어감
      audio.sfx('stack');
      pixel.burst(field, ['sparkle_big_0', 'sparkle_big_1'], { x: 550, y: SHELF_Y, count: 4, spread: 260 });
      if (s.tray >= TRAYS) { busy = false; await finish(); return; }
      tts.speak(SAY.tray, 'sys');
      await sleep(dur(500));
      s.slots = Array(N).fill(null);
    }
    s.no += 1;
    s.held = BREADS[s.no % BREADS.length];
    busy = false;
    render();
  }

  let resolveDone;
  const doneP = new Promise((r) => { resolveDone = r; });
  f.onAbort(() => resolveDone()); // 되감기·나가기·[그만하기]: 아래 정리(고리·방향키)가 그대로 돎
  async function finish() {
    if (over) return;
    over = true;
    render();
    audio.sfx('great');
    yeon?.play('happy');
    pixel.burst(field, ['sparkle_big_0', 'sparkle_big_1'], { x: 550, y: SHELF_Y, count: 6, spread: 300 });
    if (stopped()) { resolveDone(); return; }
    await dialogue.line({ kind: 'sys', text: SAY.done, noWait: true, waitVoice: true });
    await sleep(dur(400));
    resolveDone();
  }

  dropB.addEventListener('click', (e) => { e.stopPropagation(); drop(); });
  stepB?.addEventListener('click', (e) => { e.stopPropagation(); if (started && !busy && !over) stepOnce(); });

  // 자동 플레이(?debug): 실수할 것이 없는 게임이라 __mgBad 는 칸 사이에서 한 번 놓아 봄(벌 없음 확인)
  if (isDebug()) {
    const go = async () => { if (!started) { f.el.querySelector('.mg-go')?.click(); await sleep(80); } };
    window.__mgBad = async () => { await go(); if (over) return; s.x = 0.5 / (N - 1); render(); drop(); };
    window.__mgAuto = async () => { await go(); auto = true; speed = 3; await doneP; };
  }
  const autoAct = () => {
    if (!auto || busy || over || !s.held) return;
    const { i, off } = nearest();
    if (!s.slots[i] && off < 0.08) drop();
    else if (turn) stepOnce();
  };

  render();
  await startGate(field, { note: turn ? '[옆으로 가기]를 누를 때마다 한 칸씩 움직여요.' : '' });
  started = true;
  lastUi = '';
  yeon?.play('walk_right');
  render();
  dropB.focus({ preventScroll: true });
  const offKeys = arrowKeys((d) => { if (d === 'down') drop(); else if (turn && (d === 'left' || d === 'right')) stepOnce(); });
  const lp = loop((dt) => { if (over) return; if (!busy) move(dt); autoAct(); render(); }, () => speed);

  await doneP;
  lp.stop();
  offKeys();
  delete window.__mgAuto;
  delete window.__mgBad;
  document.body.classList.remove('mg-arcade');
  f.close();
  await sleep(dur(150));
  return { ok: true, attempts: 1, mistakes: 0, ms: performance.now() - t0 };
}
