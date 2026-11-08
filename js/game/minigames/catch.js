/**
 * 미니게임: 떨어지는 것 받기 — 4장의 '옮기기' 일(얼음·컵). 2026-10-15 얼음 채우기(버튼만 누르는 나르기)를 바꿈
 *  - 빵 진열은 받기 게임이 셋이나 되어 지루하다는 의견으로 타이밍 게임(timing.js)으로 옮김(2026-10-15)
 *  - 위에서 떨어지는 것을 ◀ ▶(또는 그 자리를 눌러) 움직여 받고, [갖다 놓기]로 목표(얼음통·컵 보관대)를 채우면 끝.
 *  - 다음에 떨어질 자리는 제빙기 입구·사람이 미리 보여 줘요. 놓친 것은 바닥에 떨어질 뿐(벌 없음).
 *  - 빠르기: 설정 '시간 제한'(arcade.js). 끄기·자동 스캔이면 턴 방식(◀ ▶ [기다리기] 한 번에 한 칸씩 떨어짐)
 *  - 실수는 자연스러운 결과 → 아차 → 그 일이 생기기 바로 앞으로 되감기(정답 버튼 없음)
 *      얼음: 선반의 유리컵이 떨어져 양동이에 들어감 · 모두: 가득 찬 데 더 받아 쏟아짐
 *  - skin: 'ice' | 'cups' · rush: 손님이 기다리는 급한 때(4장 1화 얼음 부족 사건)
 *  - 빠르기(보통): 떨어지는 데 3.3초, 1.75초마다 하나(2026-10-15 사용자 '조금 빠르다' → 약 15% 늦춤)
 *  - 제빙기·유리컵·양동이·상자·얼음통·컵 보관대·컵을 든 점장님·기다리는 손님은 픽셀 그림(people·mg_objects, 2026-10-26).
 *    제빙기(얼음)·점장님(컵)이 다음에 떨어질 자리로 움직여 미리 보여 줌
 */

import { h, sleep, dur, isReducedMotion } from '../../core/dom.js';
import { ICON } from '../../data/icons.js';
import { audio } from '../../av/audio.js';
import { tts } from '../../av/tts.js';
import { dialogue } from '../../ui/dialogue.js';
import { pixel } from '../../ui/pixel.js';
import { faceHTML } from '../../data/characters.js';
import { showOops } from '../../core/oops.js';
import { frame, line, shake, abortGeneration } from './frame.js';
import { pace, loop, startGate, arrowKeys, popText, clone, rand, isDebug } from './arcade.js';

const N = 5;            // 자리(줄) 수
const LANE_W = 176;
const X0 = 40;
const TOP = 118;        // 떨어지기 시작하는 높이
const CATCH_Y = 392;    // 받는 높이(그릇 윗면)
const FLOOR_Y = 512;
const CAP = 4;          // 그릇에 담기는 수
const GOAL = 12;        // 채울 수(그릇 세 번)
const ROWS = 4;         // 턴 방식: 떨어지는 칸 수
const laneX = (i) => X0 + LANE_W / 2 + i * LANE_W;

export const CATCH_OOPS = {
  glass: { id: 'mg_ice_glass', title: '얼음에 유리가 들어갔어요', lesson: '유리가 섞인 얼음은 모두 버려야 해요. 유리가 떨어지면 피하고, 바로 알려요.', icon: 'ice' },
  full: { id: 'mg_catch_full', title: '너무 많이 담아 쏟아졌어요', lesson: '바닥에 쏟아진 것은 쓸 수 없어요. 가득 차면 먼저 갖다 놓고 다시 와요.', icon: 'tray' },
};

const SKINS = {
  ice: {
    title: '얼음 받기', icon: 'ice', holder: '양동이', goal: '얼음통', place: '얼음통에 붓기', placeIcon: 'ice', placeSfx: 'pour',
    holderArt: ['ice_bucket', 0.56], goalArt: ['ice_bin', 0.95],
    source: { kind: 'machine', name: '제빙기' }, items: ['ice'], hazard: 'glass', hazAt: [6, 14],
    howto: '왼쪽·오른쪽 버튼으로 양동이를 옮겨서 얼음을 받아요. [얼음통에 붓기]를 누르면 얼음통이 차요.',
    say: { full: '양동이가 가득 찼어요.', place: '얼음통에 부었어요.', done: '얼음통이 가득 찼어요!', warn: '앗, 선반의 유리컵이 흔들려요!', report: '점장님, 유리컵이 떨어져 깨졌어요. 조심하세요!' },
  },
  cups: {
    title: '컵 받기', icon: 'icecup', holder: '상자', goal: '컵 보관대', place: '보관대에 채우기', placeIcon: 'icecup', placeSfx: 'stack',
    holderArt: ['cup_box', 0.47], goalArt: ['cup_rack', 0.95],
    source: { kind: 'person', who: 'manager', face: 'smile', name: '점장님' }, items: ['paper_cup', 'ice_cup', 'straw', 'lid'], hazard: null, hazAt: [],
    howto: '왼쪽·오른쪽 버튼으로 상자를 옮겨서, 점장님이 선반에서 내려 주는 컵을 받아요. [보관대에 채우기]를 누르면 보관대가 차요.',
    say: { full: '상자가 가득 찼어요.', place: '보관대에 채웠어요.', done: '컵 보관대가 가득 찼어요!' },
  },
};
const RUSH = '손님이 기다리고 있어요. 그래도 안전하게 해요.';
const LABEL = { left: '왼쪽으로', right: '오른쪽으로', wait: '기다리기' };

const skinOf = (opts) => SKINS[opts.skin] || SKINS.ice;
const speechOf = (opts, sk) => opts.speech || `${opts.title || sk.title}. ${sk.howto}`;

/** 읽어 주는 문장 (tools/export-lines.mjs) */
export function catchLines(opts = {}) {
  const sk = skinOf(opts);
  const out = [line.sys(speechOf(opts, sk)), line.sys(sk.howto), ...['full', 'place', 'done'].map((k) => line.sys(sk.say[k])), line.oops(CATCH_OOPS.full)];
  if (sk.hazard === 'glass') out.push(line.think(sk.say.warn), line.say('yeonwoo', sk.say.report), line.oops(CATCH_OOPS.glass));
  if (opts.rush) out.push(line.sys(RUSH));
  return out;
}

/* ---------------- 그림 ---------------- */
// 방 배경(2026-10-26 사용자: 배경이 느낌과 안 어울림): 다른 미니게임 방처럼 픽셀 타일 벽 · 걸레받이 · 매장과 같은 체크무늬 바닥.
// 떨어지는 것이 잘 보이게 벽은 옅은 한 가지 색 타일만, 가운데(떨어지는 길)에는 꾸밈을 두지 않음
const WALL_Y = 403;   // 벽과 바닥 경계(필드 높이의 72%)
const SHELF_X = [24, 936]; // 선반이 걸치는 폭(다섯 자리 + 양쪽 여유)
const ROOM = {
  ice: { wall: '#FBF5EA', grout: '#EBDFCB' },   // 바 뒤쪽 크림색 타일
  cups: { wall: '#EEF2EC', grout: '#DCE3D9' },  // 창고의 연한 회녹색 타일
};

function paintRoom(g, skin) {
  const W = 1100;
  const H = 560;
  const c = ROOM[skin] || ROOM.ice;
  g.fillStyle = c.wall;
  g.fillRect(0, 0, W, WALL_Y);
  g.fillStyle = c.grout; // 지하철 타일(64×32, 줄마다 반 칸 엇갈림)
  for (let r = 0, y = 0; y < WALL_Y; r++, y += 32) {
    g.fillRect(0, y, W, 2);
    for (let x = (r % 2) * 32; x < W; x += 64) g.fillRect(x, y, 2, 32);
  }
  g.save();
  g.translate(0, WALL_Y);
  pixel.floor(g, W, H - WALL_Y, 64);
  g.restore();
  // 걸레받이
  g.fillStyle = '#7A5134'; g.fillRect(0, WALL_Y - 10, W, 10);
  g.fillStyle = '#A8754C'; g.fillRect(0, WALL_Y - 10, W, 3);
  g.fillStyle = '#3B2A1E'; g.fillRect(0, WALL_Y, W, 2);
  if (skin === 'cups') return; // 컵: 점장님 앞의 높은 선반은 점장님 위에 그려야 해서 따로(.ct-board)
  const [x0, x1] = SHELF_X;
  // 얼음: 위 나무 선반(유리컵) + 아래 스테인리스 조리대(제빙기가 올라앉음)
  g.fillStyle = '#4A3226'; g.fillRect(x0, 31, x1 - x0, 13);
  g.fillStyle = '#E0A96F'; g.fillRect(x0 + 2, 32, x1 - x0 - 4, 4);
  g.fillStyle = '#B47A48'; g.fillRect(x0 + 2, 36, x1 - x0 - 4, 6);
  for (let x = x0 + 60; x < x1; x += 220) { g.fillStyle = '#7A5134'; g.fillRect(x, 44, 6, 14); g.fillRect(x, 44, 14, 5); }
  g.fillStyle = '#3D4650'; g.fillRect(x0, 117, x1 - x0, 24);
  g.fillStyle = '#E3E8EC'; g.fillRect(x0 + 2, 118, x1 - x0 - 4, 6);
  g.fillStyle = '#AEB8C1'; g.fillRect(x0 + 2, 124, x1 - x0 - 4, 14);
  g.fillStyle = '#C9D1D8'; for (let x = x0 + 40; x < x1; x += 160) g.fillRect(x, 127, 50, 2);
}

const PROP = { paper_cup: 'paper_cup', ice_cup: 'ice_cup', straw: 'straw', lid: 'lid', ice: 'ice_cube' };
const FALLBACK_ICON = { paper_cup: 'cup', ice_cup: 'icecup', straw: 'straw', lid: 'lid', glass: 'cup', ice: 'ice' };

function art(kind, scale = 4) {
  if (kind === 'glass') return h('span', { class: 'ct-glass', 'aria-hidden': 'true' }, pixel.art('glass', 0.62) || h('i', { html: ICON('cup') }));
  const px = PROP[kind] && pixel.icon('props', PROP[kind], scale);
  if (px) return px;
  if (kind === 'ice') return h('span', { class: 'ct-cube', 'aria-hidden': 'true' }, h('i'));
  return h('i', { class: 'ct-ico', 'aria-hidden': 'true', html: ICON(FALLBACK_ICON[kind] || 'star') });
}

export async function catchGame(opts = {}) {
  const t0 = performance.now();
  const gen = abortGeneration();
  const stopped = () => abortGeneration() !== gen;
  await pixel.ready();
  const sk = skinOf(opts);
  const { turn, k } = pace();
  const f = frame({ title: opts.title || sk.title, instruction: sk.howto, icon: sk.icon, cls: `mg-catch mg-arcade ct-${opts.skin || 'ice'}`, speech: speechOf(opts, sk), quit: Boolean(opts.quit) });
  f.el.dataset.arcade = 'catch';
  document.body.classList.add('mg-arcade');

  let mistakes = 0;
  let attempts = 1;
  let busy = false;      // 갖다 놓는 중(세상이 멈춤)
  let over = false;
  let reported = false;  // 유리컵이 깨졌다고 알렸는지(한 번만 말함)
  let speed = 1;         // 자동 플레이에서 빠르게
  let auto = false;
  let uid = 0;

  // 마지막 판(세 번째 그릇)은 확 빨라짐(2026-10-15 사용자: 마지막 4개는 속도를 높이기)
  const lastRound = () => s.bin >= GOAL - CAP; // 얼음통에 8개가 찬 뒤(마지막 4개)
  const fallMs = () => 3300 * k * Math.pow(0.95, s.pours) * (lastRound() ? 0.72 : 1);
  const spawnMs = () => 1750 * k * Math.pow(0.95, s.pours) * (lastRound() ? 0.68 : 1);
  const warnMs = () => 1000 * k;

  const firstKind = () => sk.items[rand(sk.items.length)];
  let started = false;
  let s = {
    lane: 2, held: 0, bag: [], bin: 0, pours: 0, combo: 0, spawned: 0, missed: 0,
    items: [], next: { lane: 1 + rand(3), kind: firstKind() }, wait: turn ? 1 : 900, warn: 0,
    snap: null, fullSnap: null,
  };
  const bare = () => clone({ ...s, snap: null, fullSnap: null });

  // ---- 뷰 ----
  const field = h('div', { class: 'ct-field has-bg' });
  const room = h('canvas', { class: 'ct-bg', width: '1100', height: '560', 'aria-hidden': 'true' });
  field.append(room);
  paintRoom(room.getContext('2d'), opts.skin || 'ice');
  const shelf = sk.hazard === 'glass'
    ? h('div', { class: 'ct-shelf', 'aria-hidden': 'true' }, ...Array.from({ length: N }, (_, i) => h('span', { class: 'ct-shelf-glass', style: { left: `${laneX(i) - 22}px` } }, pixel.art('glass', 0.36) || h('i', { html: ICON('cup') }))))
    : null;
  // 다음에 떨어질 자리를 미리 보여 주는 것: 레일을 따라 움직이는 제빙기 / 컵을 든 점장님(그림이 없으면 옛 CSS 입구·얼굴)
  let sourceEl;
  if (sk.source.kind === 'machine') {
    const img = pixel.art('ice_machine', 0.6);
    if (img) sourceEl = h('div', { class: 'ct-machine-px', 'aria-hidden': 'true' }, img, h('i', { class: 'ct-drip' }));
    else {
      sourceEl = h('div', { class: 'ct-nozzle', 'aria-hidden': 'true' }, h('i'));
      field.append(h('div', { class: 'ct-machine', 'aria-hidden': 'true' }, h('b', { text: sk.source.name }), h('span', { class: 'ct-machine-win' })));
    }
  } else {
    const boss = pixel.sprite('people', 'manager_cup', { scale: 2.6 });
    if (boss) {
      // 컵을 든 손(그림 왼쪽)이 떨어질 자리 위에 오게 오른쪽으로 비켜 세움. 높은 선반(.ct-board) 뒤에 서서 허리 아래는 가려짐
      boss.el.style.left = `${32 - boss.foot.x}px`;
      boss.el.style.top = `${98 - boss.foot.y}px`;
      sourceEl = h('div', { class: 'ct-boss', 'aria-hidden': 'true' }, boss.el);
    } else sourceEl = h('div', { class: 'ct-person', 'aria-hidden': 'true' }, h('span', { class: 'ct-person-face', html: faceHTML(sk.source.who, sk.source.face) }), h('i', { class: 'ct-hand', html: ICON('hand') }));
  }
  if (shelf) field.append(shelf);
  field.append(sourceEl);
  // 컵: 점장님 앞의 높은 나무 선반(양 끝에 컵 더미 하나씩만, 가운데는 비워 둠)
  if (sk.source.kind === 'person') {
    const stack = (side) => { const el = pixel.icon('props', 'cup_stack', 2.6, 'ct-board-stack'); if (el) el.style[side] = '14px'; return el; };
    field.append(h('div', { class: 'ct-board', 'aria-hidden': 'true' }, stack('left'), stack('right')));
  }
  const layer = h('div', { class: 'ct-items', 'aria-hidden': 'true' });
  const goalFill = h('i', { class: 'ct-goal-fill' });
  // 목표(얼음통·컵 보관대) 그림 + 옆의 막대가 차오름
  const goalImg = pixel.art(...sk.goalArt);
  const goalEl = goalImg
    ? h('div', { class: 'ct-goal has-art', 'aria-hidden': 'true' }, goalImg, h('span', { class: 'ct-goal-bar' }, goalFill), h('b', { text: sk.goal }))
    : h('div', { class: 'ct-goal', 'aria-hidden': 'true' }, h('span', { class: 'ct-goal-box' }, goalFill, h('i', { class: 'ct-goal-ico', html: ICON(sk.placeIcon) })), h('b', { text: sk.goal }));
  const holdCells = h('span', { class: 'ct-hold-in' });
  const holdImg = pixel.art(...sk.holderArt);
  const holderEl = h('div', { class: `ct-holder ${holdImg ? 'has-art' : ''}`, 'aria-hidden': 'true' }, holdImg, holdCells, h('b', { class: 'ct-full-tag', text: '가득!' }));
  // 두 손을 앞에 모은 모습(idle) 앞에 그릇(양동이·상자)을 두어 그릇을 든 것처럼 보이게
  const yeon = pixel.sprite('yeonwoo', 'idle', { scale: 3, cls: 'ct-yeon' });
  const pal = h('div', { class: `ct-pal ${holdImg ? 'has-art' : ''}`, 'aria-hidden': 'true' }, yeon?.el || h('span', { class: 'ct-yeon-fallback', html: faceHTML('yeonwoo', 'normal') }), holderEl);
  const waiting = opts.rush ? h('div', { class: 'ct-wait', 'aria-hidden': 'true' }, ...['customer', 'student', 'daeri'].map((fc) => pixel.sprite('people', `wait_${fc}`, { scale: 2.2 })?.el || h('span', { class: 'ct-guest', html: faceHTML(fc, 'worried') }))) : null;
  const laneBtns = Array.from({ length: N }, (_, i) => h('button', { class: 'ct-lane', 'data-lane': String(i), 'aria-label': `${i + 1}번 자리로 가기`, style: { left: `${X0 + i * LANE_W}px`, width: `${LANE_W}px` }, disabled: turn }));
  field.append(layer, goalEl, pal, ...laneBtns);
  if (waiting) field.append(waiting);

  // 오른쪽: 목표 · 그릇 · 조작 버튼
  const goalCells = h('span', { class: 'ct-meter' }, ...Array.from({ length: GOAL }, () => h('i')));
  const goalText = h('b', { class: 'ct-meter-n' });
  const holdMeter = h('span', { class: 'ct-meter small' }, ...Array.from({ length: CAP }, () => h('i')));
  const moveBtn = (d) => h('button', { class: `btn btn-soft ct-move ct-${d}`, 'data-dir': d, 'aria-label': LABEL[d] }, h('i', { html: ICON('arrow_right') }), h('span', { text: d === 'left' ? '왼쪽' : '오른쪽' }));
  const leftB = moveBtn('left');
  const rightB = moveBtn('right');
  const waitB = turn ? h('button', { class: 'btn btn-soft ct-wait-btn' }, h('i', { html: ICON('hourglass') }), h('span', { text: LABEL.wait })) : null;
  const placeB = h('button', { class: 'btn btn-big btn-red ct-place' }, h('i', { html: ICON(sk.placeIcon) }), h('span', { text: sk.place }));
  const status = h('p', { class: 'ct-status', role: 'status' });
  const panel = h('div', { class: 'ct-panel' },
    h('div', { class: 'ct-card' }, h('h3', {}, h('i', { html: ICON(sk.placeIcon) }), sk.goal), goalCells, goalText),
    h('div', { class: 'ct-card' }, h('h3', { text: sk.holder }), holdMeter),
    h('div', { class: 'ct-moves' }, leftB, rightB),
    waitB, placeB, status);
  f.body.append(h('div', { class: 'ct-stage' }, field), panel);

  const itemEls = new Map();
  function itemEl(it) {
    let el = itemEls.get(it.id);
    if (!el) {
      el = h('span', { class: `ct-item k-${it.kind} ${it.haz ? 'haz' : ''}` }, art(it.kind));
      if (turn) el.classList.add('step');
      layer.append(el);
      itemEls.set(it.id, el);
    }
    return el;
  }
  const yOf = (p) => TOP + Math.min(1, p) * (CATCH_Y - TOP);
  let lastUi = '';

  function render() {
    // 떨어지는 것
    const alive = new Set(s.items.map((it) => it.id));
    for (const [id, el] of itemEls) if (!alive.has(id)) { el.remove(); itemEls.delete(id); }
    for (const it of s.items) {
      const el = itemEl(it);
      el.style.transform = `translate(${laneX(it.lane) - 32}px, ${yOf(it.p) - 32}px)`;
    }
    // 다음에 떨어질 자리
    const warnGlass = s.warn > 0 && s.next.kind === 'glass';
    sourceEl.style.transform = `translateX(${laneX(s.next.lane)}px)`;
    sourceEl.classList.toggle('ready', !warnGlass);
    shelf?.querySelectorAll('.ct-shelf-glass').forEach((g, i) => {
      g.classList.toggle('wobble', warnGlass && i === s.next.lane);
      g.classList.toggle('gone', s.items.some((it) => it.kind === 'glass' && it.lane === i));
    });
    // 연우와 그릇
    pal.style.transform = `translateX(${busy ? laneX(N) + 40 : laneX(s.lane)}px)`;
    const ui = `${s.bag.join()}|${s.bin}|${busy}|${over}|${s.lane}|${started}`;
    if (ui === lastUi) return;
    lastUi = ui;
    holdCells.replaceChildren(...s.bag.map((kind) => art(kind, holdImg ? 1.25 : 1.6)));
    holderEl.classList.toggle('full', s.held >= CAP);
    holdMeter.querySelectorAll('i').forEach((c, i) => c.classList.toggle('on', i < s.held));
    goalCells.querySelectorAll('i').forEach((c, i) => c.classList.toggle('on', i < s.bin));
    goalFill.style.height = `${Math.min(100, (s.bin / GOAL) * 100)}%`;
    goalText.textContent = `${s.bin} / ${GOAL}`;
    placeB.disabled = !started || busy || over || s.held === 0;
    placeB.classList.toggle('ready', s.held >= CAP);
    leftB.disabled = !started || busy || over || s.lane === 0;
    rightB.disabled = !started || busy || over || s.lane === N - 1;
    if (waitB) waitB.disabled = !started || busy || over;
    status.textContent = `${sk.holder} ${s.held}/${CAP} · ${sk.goal} ${s.bin}/${GOAL}`;
  }

  /* ---- 세상 ---- */
  function spawn() {
    const n = s.next;
    s.spawned += 1;
    const it = { id: ++uid, lane: n.lane, p: 0, kind: n.kind, haz: n.kind === 'glass' };
    s.items.push(it);
    if (n.kind === 'glass') audio.sfx('clink');
    // 다음 것: 위험한 것은 정해진 차례에, 자리는 너무 멀지 않게
    const nextNo = s.spawned + 1;
    const kind = sk.hazAt.includes(nextNo) ? sk.hazard : firstKind();
    // 다음 자리: 늘 지금과 다른 칸(1~2칸 옆). 끝 칸으로 붙이면 같은 자리가 연달아 나와서(2026-10-15 사용자: 점장님이 한 자리에서만 내려보냄)
    const near = Array.from({ length: N }, (_, i) => i).filter((i) => i !== n.lane && Math.abs(i - n.lane) <= 2);
    const lane = near[rand(near.length)];
    s.next = { lane, kind };
    s.wait = turn ? 2 : spawnMs();
    s.warn = kind === 'glass' ? (turn ? 1 : warnMs()) : 0;
    if (kind === 'glass') s.snap = bare(); // 되감기 지점: 위험한 것이 다음 차례가 된 순간(경고부터 다시)
    if (kind === 'glass') dialogue.line({ kind: 'think', text: sk.say.warn, noWait: true });
  }

  /** 다 떨어진 것 처리. 실수가 있으면 그 종류를 돌려줌 */
  function land() {
    let fault = null;
    const keep = [];
    for (const it of s.items) {
      if (it.p < 1) { keep.push(it); continue; }
      const caught = it.lane === s.lane;
      if (caught && it.haz) { fault = it.kind; continue; }
      if (caught && s.held >= CAP) { fault = fault || 'full'; continue; }
      if (caught) {
        s.held += 1;
        s.bag.push(it.kind);
        s.combo += 1;
        audio.sfx('catch');
        const msg = s.combo >= 5 ? '멋져요!' : s.combo >= 3 ? '착착착!' : s.combo >= 2 ? '착착!' : '착!';
        popText(field, msg, laneX(s.lane), CATCH_Y - 110, s.combo >= 3 ? 'big' : ''); // 연우 머리 위(얼굴을 가리지 않게)
        pixel.burst(field, ['sparkle_0', 'sparkle_1'], { x: laneX(s.lane), y: CATCH_Y - 10, count: 2, spread: 30, scale: 3 });
        if (s.held >= CAP) {
          s.fullSnap = bare();
          dialogue.line({ kind: 'sys', text: sk.say.full, noWait: true });
        }
      } else {
        s.combo = 0;
        s.missed += 1;
        dropToFloor(it);
        if (it.kind === 'glass' && !reported) {
          reported = true;
          audio.sfx('glass_break');
          dialogue.line({ kind: 'say', who: 'yeonwoo', face: 'surprised', text: sk.say.report, noWait: true });
        }
      }
    }
    s.items = keep;
    return fault;
  }

  function dropToFloor(it) {
    // 깨진 유리컵: 유리 조각 그림(없으면 CSS 조각)
    const shards = it.kind === 'glass' && pixel.icon('props', 'glass', 4);
    const el = h('span', { class: `ct-item k-${it.kind} drop`, 'aria-hidden': 'true', style: { transform: `translate(${laneX(it.lane) - 32}px, ${FLOOR_Y - 32}px)` } }, shards || art(it.kind));
    if (it.kind === 'glass') el.classList.add(shards ? 'shards' : 'broken');
    layer.append(el);
    setTimeout(() => el.remove(), dur(it.kind === 'glass' ? 1400 : 700));
    if (it.kind === 'ice') pixel.burst(field, ['droplet_left_0', 'droplet_right_0'], { x: laneX(it.lane), y: FLOOR_Y - 10, count: 2, spread: 20, scale: 3 });
  }

  /** 세상이 dt 만큼(턴이면 한 칸) 움직임 */
  function advance(dt) {
    if (s.held >= CAP && !s.items.length) return null; // 가득 차면 다음 것은 기다려 줌(갖다 놓을 때까지)
    const df = turn ? 1 / ROWS : dt / fallMs();
    for (const it of s.items) it.p += df;
    if (s.held < CAP) {
      if (s.warn > 0) s.warn -= turn ? 1 : dt;
      s.wait -= turn ? 1 : dt;
      if (s.wait <= 0 && s.warn <= 0) spawn();
    }
    return land();
  }

  async function fault(kind) {
    over = true;
    mistakes += 1;
    yeon?.play('panic');
    if (kind === 'full') { audio.sfx('spill'); shake(holderEl); } else if (kind === 'glass') audio.sfx('glass_break'); else audio.sfx('hint');
    render();
    await sleep(dur(600));
    if (stopped()) return;
    await showOops(CATCH_OOPS[kind === 'full' ? 'full' : kind]);
    if (stopped()) return;
    attempts += 1;
    // 되감기: 위험한 것이 떨어지기 시작한 순간 / 가득 찬 순간(떨어지던 것은 기다려 줌)
    const back = kind === 'full' ? s.fullSnap : s.snap;
    if (back) {
      s = clone(back);
      if (kind === 'full') { s.items = []; s.fullSnap = clone(back); } else s.snap = clone(back); // 또 실수해도 같은 곳으로
    } else {
      s.items = s.items.filter((it) => !it.haz);
    }
    lastUi = '';
    if (!turn && s.warn <= 0 && s.wait < 600) s.wait = 600; // 되감은 뒤 숨 돌릴 틈
    yeon?.play('idle');
    over = false;
    render();
  }

  async function step(dt) {
    if (busy || over) return;
    const kind = advance(dt);
    render();
    if (kind) await fault(kind);
  }

  /* ---- 조작 ---- */
  function move(d) {
    if (!started || busy || over) return;
    const to = Math.max(0, Math.min(N - 1, s.lane + (d === 'left' ? -1 : 1)));
    if (to === s.lane) { shake(pal); return; }
    s.lane = to;
    audio.sfx('focus');
    if (turn) step(0); else render();
  }

  async function place() {
    if (!started || busy || over || s.held === 0) return;
    busy = true;
    yeon?.play('walk_right');
    render();
    await sleep(dur(isReducedMotion() ? 120 : 420));
    audio.sfx(sk.placeSfx);
    const wasLast = lastRound();
    s.bin = Math.min(GOAL, s.bin + s.held);
    s.held = 0;
    s.bag = [];
    s.pours += 1;
    s.fullSnap = null;
    pixel.burst(field, ['sparkle_big_0', 'sparkle_big_1'], { x: laneX(N) + 40, y: 420, count: 3, spread: 50 });
    tts.speak(sk.say.place, 'sys');
    if (!wasLast && lastRound() && s.bin < GOAL) popText(field, '마지막! 빨라져요!', 520, 250, 'big');
    await sleep(dur(360));
    busy = false;
    if (s.bin >= GOAL) { render(); finish(); return; }
    yeon?.play('walk_left');
    render();
    await sleep(dur(isReducedMotion() ? 80 : 380));
    yeon?.play('idle');
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
    pixel.burst(field, ['sparkle_big_0', 'sparkle_big_1'], { x: 520, y: 260, count: 6, spread: 200 });
    if (stopped()) { resolveDone(); return; }
    await dialogue.line({ kind: 'sys', text: sk.say.done, noWait: true, waitVoice: true });
    await sleep(dur(400));
    resolveDone();
  }

  leftB.addEventListener('click', (e) => { e.stopPropagation(); move('left'); });
  rightB.addEventListener('click', (e) => { e.stopPropagation(); move('right'); });
  waitB?.addEventListener('click', (e) => { e.stopPropagation(); if (started && !busy && !over) { audio.sfx('tap'); step(0); } });
  placeB.addEventListener('click', (e) => { e.stopPropagation(); place(); });
  laneBtns.forEach((b) => b.addEventListener('click', (e) => {
    e.stopPropagation();
    if (!started || busy || over) return;
    const to = Number(b.dataset.lane);
    if (to !== s.lane) { s.lane = to; audio.sfx('focus'); render(); }
  }));

  render();
  if (opts.rush) dialogue.line({ kind: 'sys', text: RUSH, noWait: true });

  // 자동 플레이(?debug): __mgBad 는 실수 한 번(아차 → 되감기 검사), __mgAuto 는 빠르게 끝까지
  if (isDebug()) {
    const go = async () => { if (!started) { f.el.querySelector('.mg-go')?.click(); await sleep(80); } };
    window.__mgBad = async () => {
      await go();
      if (over || busy) return;
      if (sk.hazard) {
        s.snap = bare();
        s.items.push({ id: ++uid, lane: s.lane, p: 0.97, kind: sk.hazard, haz: true });
      } else {
        while (s.bag.length < CAP) { s.bag.push(firstKind()); s.held = s.bag.length; }
        s.fullSnap = bare();
        s.items.push({ id: ++uid, lane: s.lane, p: 0.97, kind: firstKind(), haz: false });
      }
      await step(turn ? 0 : 60);
    };
    window.__mgAuto = async () => { await go(); auto = true; speed = 5; await doneP; };
  }
  const autoMove = () => {
    if (!auto || busy || over) return;
    if (s.held >= CAP - 1 || (s.held && s.bin + s.held >= GOAL)) { place(); return; } // 두 개가 한꺼번에 떨어져도 넘치지 않게 일찍
    const target = [...s.items].filter((it) => !it.haz).sort((a, b) => b.p - a.p)[0];
    const danger = s.items.find((it) => it.haz && it.lane === s.lane && it.p > 0.4);
    let want = target ? target.lane : s.next.lane;
    if (danger && want === s.lane) want = s.lane > 0 ? s.lane - 1 : s.lane + 1;
    if (want !== s.lane) { s.lane = want; if (turn) step(0); else render(); } else if (turn) step(0);
  };

  await startGate(field, { note: turn ? '왼쪽·오른쪽이나 [기다리기]를 누를 때마다 한 칸씩 떨어져요.' : '' });
  started = true;
  lastUi = '';
  render();
  const offKeys = arrowKeys((d) => { if (d === 'left' || d === 'right') move(d); else if (d === 'down' && turn) step(0); });
  const lp = turn
    ? loop(() => autoMove())
    : loop((dt) => { autoMove(); step(dt); }, () => speed);
  (turn ? leftB : rightB).focus({ preventScroll: true });

  await doneP;
  lp.stop();
  offKeys();
  delete window.__mgAuto;
  delete window.__mgBad;
  document.body.classList.remove('mg-arcade');
  f.close();
  await sleep(dur(150));
  return { ok: true, attempts, mistakes, ms: performance.now() - t0 };
}
