/**
 * 미니게임: 쉬는 시간 지렁이 게임 (연우의 휴대폰) — 4장 '쉬는 시간' 자석, 2026-10-15
 *  - 방향 버튼(위·아래·왼쪽·오른쪽)이나 방향키로 지렁이를 움직여 빵을 먹어요. 먹을수록 꼬리가 길어져요.
 *  - 벽이나 내 꼬리에 부딪히면 그 판은 끝(벌 없음) → [한 판 더]
 *  - 쉬는 시간(30분)이 끝나면 알람: [일하러 가기] / [한 판만 더]
 *    '한 판만 더'를 고르면 점장님이 찾으러 오심 → 아차 → 알람이 울린 순간으로 되감기(쉬는 시간은 내 권리, 끝나면 제때 돌아가기)
 *  - [휴대폰 넣기]: 언제든 게임을 그만두고 남은 시간은 그냥 쉬어요.
 *  - 빠르기: 설정 '시간 제한'. 보통·넉넉히 = 지렁이가 저절로 기어감, 끄기·자동 스캔 = 누를 때 한 칸(쉬는 시간도 움직인 수로 셈)
 */

import { h, sleep, dur } from '../../core/dom.js';
import { ICON } from '../../data/icons.js';
import { audio } from '../../av/audio.js';
import { tts } from '../../av/tts.js';
import { dialogue } from '../../ui/dialogue.js';
import { pixel } from '../../ui/pixel.js';
import { faceHTML } from '../../data/characters.js';
import { showOops } from '../../core/oops.js';
import { frame, line, shake, abortGeneration } from './frame.js';
import { pace, loop, startGate, arrowKeys, popText, clone, rand, isDebug } from './arcade.js';

const COLS = 15;
const ROWS = 9;
const CELL = 44;
const STEP_MS = 430;
const BREAK_MS = 75000;   // 쉬는 시간 30분 = 실제 1분 15초(보통)
const BREAK_MOVES = 90;   // 턴 방식: 움직인 수
const FOODS = ['salt_bread', 'croissant', 'muffin'];
const DIRS = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
const OPP = { up: 'down', down: 'up', left: 'right', right: 'left' };
const DIR_NAME = { up: '위', down: '아래', left: '왼쪽', right: '오른쪽' };

const TITLE = '쉬는 시간';
const HOWTO = '방향 버튼으로 지렁이를 움직여 빵을 먹어요. 벽이나 내 꼬리에 부딪히지 않게 해요.';
const SAY = {
  crash: '콩! 한 판이 끝났어요.',
  alarm: '알람이 울려요. 쉬는 시간이 끝났어요.',
  late: '연우 씨, 쉬는 시간 끝났어요. 손님이 기다려요.',
  back: '좋아, 다시 힘내서 일하자!',
  pocket: '휴대폰을 넣었어요. 남은 시간은 눈을 감고 쉬어요.',
};
export const SNAKE_OOPS = { id: 'mg_break_late', title: '쉬는 시간이 끝났는데 게임을 했어요', lesson: '늦으면 동료가 내 일까지 해야 해요. 알람이 울리면 게임을 멈추고 일하러 가요.', icon: 'alarm' };

const speechOf = (opts) => opts.speech || `${opts.title || TITLE}. 휴대폰으로 지렁이 게임을 해요. ${HOWTO}`;

export function snakeLines(opts = {}) {
  return [line.sys(speechOf(opts)), line.sys(HOWTO), line.sys(SAY.crash), line.sys(SAY.alarm), line.say('manager', SAY.late), line.think(SAY.back), line.sys(SAY.pocket), line.oops(SNAKE_OOPS)];
}

const toMin = (t) => { const [a, b] = String(t).split(':').map(Number); return a * 60 + (b || 0); };
const hhmm = (m) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;

export async function snake(opts = {}) {
  const t0 = performance.now();
  await pixel.ready();
  const { turn, k } = pace();
  const f = frame({ title: opts.title || TITLE, instruction: HOWTO, icon: 'tea', cls: 'mg-snake mg-arcade', speech: speechOf(opts), quit: Boolean(opts.quit) });
  f.el.dataset.arcade = 'snake';
  document.body.classList.add('mg-arcade');
  const from = toMin(opts.from || '10:30');
  const breakLen = turn ? BREAK_MOVES : BREAK_MS * k;

  let mistakes = 0;
  let attempts = 1;
  let started = false;
  let phase = 'play'; // play | crash | alarm | late | done
  let best = 0;
  let acc = 0;
  let breakT = 0;
  let alarmSnap = null;
  let speed = 1;

  const fresh = () => {
    const g = { body: [[5, 4], [4, 4], [3, 4]], dir: 'right', next: 'right', eaten: 0, food: null };
    g.food = placeFood(g);
    return g;
  };
  function placeFood(g) {
    const free = [];
    for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) if (!g.body.some(([a, b]) => a === x && b === y)) free.push([x, y]);
    const [x, y] = free[rand(free.length)];
    return { x, y, kind: FOODS[rand(FOODS.length)] };
  }
  let g = fresh();

  // ---- 뷰 ----
  const board = h('div', { class: 'sn-board', style: { width: `${COLS * CELL}px`, height: `${ROWS * CELL}px` }, 'aria-hidden': 'true' });
  const clockEl = h('b', { class: 'sn-clock' });
  const scoreEl = h('span', { class: 'sn-score' });
  const cover = h('div', { class: 'sn-cover' });
  const screen = h('div', { class: 'sn-screen' }, h('div', { class: 'sn-bar' }, clockEl, h('span', { class: 'sn-name', text: '빵빵 지렁이' }), scoreEl), board, cover);
  const phone = h('div', { class: 'sn-phone' }, screen);
  const face = h('span', { class: 'sn-face', 'aria-hidden': 'true', html: faceHTML('yeonwoo', 'smile') });
  const breakFill = h('i', { class: 'sn-break-fill' });
  const breakText = h('span', { class: 'sn-break-text' });
  const padBtn = (d) => h('button', { class: `sn-dir sn-${d}`, 'data-dir': d, 'aria-label': DIR_NAME[d] }, h('i', { html: ICON('arrow_right') }), h('span', { text: DIR_NAME[d] }));
  const pad = h('div', { class: 'sn-pad' }, padBtn('up'), padBtn('left'), padBtn('right'), padBtn('down'));
  const pocketB = h('button', { class: 'btn btn-soft sn-pocket' }, h('i', { html: ICON('phone') }), h('span', { text: '휴대폰 넣기' }));
  const status = h('p', { class: 'ct-status', role: 'status' });
  const panel = h('div', { class: 'ct-panel sn-panel' },
    h('div', { class: 'ct-card sn-break' }, h('h3', {}, h('i', { html: ICON('tea') }), '쉬는 시간'), h('span', { class: 'sn-break-bar' }, breakFill), breakText),
    h('div', { class: 'sn-side' }, face, pad),
    pocketB, status);
  f.body.append(h('div', { class: 'ct-stage sn-stage' }, phone), panel);

  /* ---- 그리기 ---- */
  function drawBoard() {
    const parts = [];
    const fd = g.food;
    if (fd) {
      const art = pixel.icon('props', fd.kind, 2, 'sn-food') || h('i', { class: 'sn-food', html: ICON('bread') });
      art.style.left = `${fd.x * CELL + CELL / 2 - 16}px`;
      art.style.top = `${fd.y * CELL + CELL / 2 - 16}px`;
      parts.push(art);
    }
    g.body.forEach(([x, y], i) => {
      const head = i === 0;
      const tail = i === g.body.length - 1;
      const el = h('span', { class: `sn-seg ${head ? `head d-${g.dir}` : ''} ${tail && !head ? 'tail' : ''} ${i % 2 ? 'alt' : ''}`, style: { left: `${x * CELL}px`, top: `${y * CELL}px` } });
      if (head) el.append(h('i', { class: 'sn-eye' }), h('i', { class: 'sn-eye' }));
      parts.push(el);
    });
    board.replaceChildren(...parts);
  }
  function drawUi() {
    const p = Math.min(1, breakT / breakLen);
    const now = from + Math.min(30, Math.floor(p * 30));
    clockEl.textContent = hhmm(now);
    breakFill.style.width = `${(1 - p) * 100}%`;
    breakText.textContent = phase === 'alarm' || phase === 'late' || phase === 'done' ? `${hhmm(from + 30)} 끝` : `${hhmm(from)} ~ ${hhmm(from + 30)} · 남은 시간 ${30 - Math.floor(p * 30)}분`;
    scoreEl.textContent = `빵 ${g.eaten}${best ? ` · 최고 ${best}` : ''}`;
    const playing = started && (phase === 'play' || phase === 'late');
    pad.querySelectorAll('button').forEach((b) => { b.disabled = !playing; });
    pocketB.disabled = !started || phase === 'alarm' || phase === 'late' || phase === 'done';
    status.textContent = `빵 ${g.eaten}개 · 쉬는 시간 ${30 - Math.floor(p * 30)}분 남음`;
  }
  function setFace(name) { face.innerHTML = faceHTML('yeonwoo', name); }

  /* ---- 덮개(판 끝·알람) ---- */
  function showCover(kind) {
    cover.replaceChildren();
    cover.className = `sn-cover on ${kind}`;
    if (kind === 'crash') {
      const again = h('button', { class: 'btn btn-big btn-red sn-again' }, h('i', { html: ICON('repeat') }), h('span', { text: '한 판 더' }));
      cover.append(h('b', { class: 'sn-cover-big', text: '콩!' }), h('p', { text: `빵 ${g.eaten}개를 먹었어요` }), again);
      again.addEventListener('click', (e) => { e.stopPropagation(); audio.sfx('tap'); newRound(); }, { once: true });
      setTimeout(() => again.focus({ preventScroll: true }), 60);
    } else if (kind === 'alarm') {
      const go = h('button', { class: 'btn btn-big btn-red sn-gowork' }, h('i', { html: ICON('apron') }), h('span', { text: '일하러 가기' }));
      const more = h('button', { class: 'btn btn-big sn-more' }, h('i', { html: ICON('repeat') }), h('span', { text: '한 판만 더' }));
      cover.append(h('i', { class: 'sn-alarm-ico', html: ICON('alarm') }), h('b', { class: 'sn-cover-big', text: `${hhmm(from + 30)} 쉬는 시간 끝!` }), h('div', { class: 'sn-alarm-btns' }, more, go));
      go.addEventListener('click', (e) => { e.stopPropagation(); goWork(); }, { once: true });
      more.addEventListener('click', (e) => { e.stopPropagation(); oneMore(); }, { once: true });
      setTimeout(() => more.focus({ preventScroll: true }), 60);
    }
  }
  function hideCover() { cover.className = 'sn-cover'; cover.replaceChildren(); }

  /* ---- 게임 ---- */
  function stepWorm() {
    if (g.next !== OPP[g.dir]) g.dir = g.next;
    const [dx, dy] = DIRS[g.dir];
    const [hx, hy] = g.body[0];
    const nx = hx + dx;
    const ny = hy + dy;
    const eats = g.food && g.food.x === nx && g.food.y === ny;
    const bodyCheck = eats ? g.body : g.body.slice(0, -1);
    if (nx < 0 || ny < 0 || nx >= COLS || ny >= ROWS || bodyCheck.some(([a, b]) => a === nx && b === ny)) { crash(); return; }
    g.body.unshift([nx, ny]);
    if (eats) {
      g.eaten += 1;
      best = Math.max(best, g.eaten);
      audio.sfx('nom');
      const x = nx * CELL + CELL / 2;
      const y = ny * CELL + CELL / 2;
      popText(board, g.eaten % 5 === 0 ? '냠냠냠!' : '냠!', x, y - 30, g.eaten % 5 === 0 ? 'big' : '');
      pixel.burst(board, ['star_0', 'star_1'], { x, y, count: 2, spread: 24, scale: 2 });
      setFace('happy');
      setTimeout(() => { if (phase === 'play') setFace('smile'); }, dur(700));
      g.food = placeFood(g);
    } else g.body.pop();
    drawBoard();
  }
  function crash() {
    if (phase === 'late') { drawBoard(); return; } // 늦은 판은 점장님이 오실 때까지 그대로
    phase = 'crash';
    audio.sfx('bump');
    shake(phone);
    setFace('surprised');
    board.querySelector('.sn-seg.head')?.classList.add('dizzy');
    tts.speak(SAY.crash, 'sys');
    showCover('crash');
    drawUi();
  }
  function newRound() {
    g = fresh();
    phase = 'play';
    acc = 0;
    setFace('smile');
    hideCover();
    drawBoard();
    drawUi();
    pad.querySelector('.sn-right')?.focus({ preventScroll: true });
  }
  function turnTo(d) {
    if (!started || (phase !== 'play' && phase !== 'late')) return;
    if (d === OPP[g.dir]) { shake(pad.querySelector(`.sn-${d}`)); return; }
    g.next = d;
    if (turn) {
      stepWorm();
      if (phase === 'play') { breakT += 1; checkAlarm(); }
      drawUi();
    }
  }
  function checkAlarm() {
    if (breakT < breakLen || phase === 'alarm' || phase === 'done' || phase === 'late') return;
    phase = 'alarm';
    alarmSnap = clone({ g, breakT });
    audio.sfx('alarm');
    setFace('surprised');
    tts.speak(SAY.alarm, 'sys');
    showCover('alarm');
    drawUi();
  }

  let resolveDone;
  const doneP = new Promise((r) => { resolveDone = r; });
  f.onAbort(() => resolveDone()); // 되감기·나가기·[그만하기]: 아래 정리(고리·방향키)가 그대로 돎
  const gen = abortGeneration();
  const stopped = () => abortGeneration() !== gen; // 정리된 뒤 늦게 끝난 기다림은 이어 가지 않음
  async function goWork() {
    phase = 'done';
    hideCover();
    drawUi();
    audio.sfx('good');
    setFace('determined');
    await dialogue.line({ kind: 'think', text: SAY.back, noWait: true, waitVoice: true });
    await sleep(dur(300));
    resolveDone();
  }
  async function pocket() {
    if (!started || phase === 'alarm' || phase === 'late' || phase === 'done') return;
    phase = 'done';
    hideCover();
    drawUi();
    audio.sfx('close');
    setFace('smile');
    await dialogue.line({ kind: 'sys', text: SAY.pocket, noWait: true, waitVoice: true });
    await sleep(dur(300));
    resolveDone();
  }
  async function oneMore() {
    phase = 'late';
    hideCover();
    g = fresh();
    acc = 0;
    setFace('smile');
    drawBoard();
    drawUi();
    await sleep(dur(turn ? 900 : 2600));
    if (stopped()) return;
    // 점장님이 찾으러 오심(꾸중 없이)
    const boss = h('span', { class: 'sn-boss', 'aria-hidden': 'true', html: faceHTML('manager', 'front') });
    phone.append(boss);
    setFace('surprised');
    await dialogue.line({ kind: 'say', who: 'manager', face: 'front', text: SAY.late, noWait: true, waitVoice: true });
    if (stopped()) return;
    mistakes += 1;
    await showOops(SNAKE_OOPS);
    attempts += 1;
    boss.remove();
    // 알람이 울린 순간으로
    const back = clone(alarmSnap);
    g = back.g;
    breakT = back.breakT;
    phase = 'alarm';
    drawBoard();
    showCover('alarm');
    drawUi();
  }

  pad.querySelectorAll('button').forEach((b) => b.addEventListener('click', (e) => { e.stopPropagation(); turnTo(b.dataset.dir); }));
  pocketB.addEventListener('click', (e) => { e.stopPropagation(); pocket(); });

  if (isDebug()) {
    const go = async () => { if (!started) { f.el.querySelector('.mg-go')?.click(); await sleep(80); } };
    const toAlarm = () => { if (phase !== 'alarm') { if (phase === 'crash') newRound(); breakT = breakLen; checkAlarm(); } };
    window.__mgBad = async () => { await go(); toAlarm(); await sleep(60); cover.querySelector('.sn-more')?.click(); };
    window.__mgAuto = async () => {
      await go();
      speed = 4;
      // 빵을 몇 개 먹어 보고(가까운 쪽으로) 알람 → 일하러 가기
      for (let i = 0; i < 12 && phase === 'play'; i++) {
        const [hx, hy] = g.body[0];
        const want = g.food.x > hx ? 'right' : g.food.x < hx ? 'left' : g.food.y > hy ? 'down' : 'up';
        if (want !== OPP[g.dir]) g.next = want;
        if (turn) turnTo(g.next); else await sleep(120);
      }
      toAlarm();
      await sleep(60);
      cover.querySelector('.sn-gowork')?.click();
      await doneP;
    };
  }

  drawBoard();
  drawUi();
  await startGate(phone, { note: turn ? '방향 버튼을 누를 때마다 한 칸씩 기어가요.' : '' });
  started = true;
  drawUi();
  pad.querySelector('.sn-right')?.focus({ preventScroll: true });
  const offKeys = arrowKeys((d) => turnTo(d));
  const lp = loop((dt) => {
    if (turn || !started) return;
    if (phase === 'play' || phase === 'crash') { breakT += dt; checkAlarm(); }
    if (phase === 'play' || phase === 'late') {
      acc += dt;
      if (acc >= STEP_MS * k) { acc = 0; stepWorm(); }
    }
    drawUi();
  }, () => speed);

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
