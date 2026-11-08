/**
 * 미니게임: 쏟은 음료 수습 (문제 맞추기 없음, 턴 방식) — docs/v3_design.md 7.2의 1번
 *  - 도구를 고르고 바닥 칸을 누릅니다. 내가 한 번 할 때마다 손님이 한 걸음 걷습니다(시간 제한 없음).
 *  - 주의 표지판이 있으면 손님이 젖은 곳을 돌아갑니다. 없으면 젖은 바닥을 밟고 "앗!" → 아차 → 몇 수 앞으로 되감기
 *  - 대걸레로 젖은 칸을 여러 번 문질러 다 말리면 끝. 점장님을 부르면 손님을 잠깐 문 앞에서 기다리게 해 줍니다.
 *  - 주스 웅덩이·걷는 손님·미끄러지는 손님·팔을 뻗어 막는 점장님은 픽셀 그림(people·mg_objects, 2026-10-26)
 */

import { h, sleep, dur, isReducedMotion } from '../../core/dom.js';
import { ICON } from '../../data/icons.js';
import { audio } from '../../av/audio.js';
import { tts } from '../../av/tts.js';
import { dialogue } from '../../ui/dialogue.js';
import { pixel } from '../../ui/pixel.js';
import { portraitHTML } from '../../data/characters.js';
import { showOops } from '../../core/oops.js';
import { frame, line, abortGeneration } from './frame.js';

const COLS = 9;
const ROWS = 5;
const T = 80; // 칸 크기(16px × 5)
const DOOR = [0, 2];
const GOAL = [8, 2];
const TABLES = [[3, 0], [6, 4]];
const COUNTER = [[8, 0], [8, 1], [8, 3], [8, 4]]; // 카운터(가운데 (8,2)가 주문하는 자리)
// 웅덩이는 문 가까이: 걸레질만으로는 첫 손님이 오기 전에 다 못 닦음 → 표지판(또는 점장님 부르기)이 필요
const PUDDLE = [[2, 2, 3], [3, 2, 3], [3, 1, 2], [2, 3, 2]];
const ARRIVE = [1, 6, 11, 16]; // 몇 번째 행동 뒤에 손님이 문에 나타나는지
// 손님 차례: 처음 오는 회사원은 미끄러지는 그림이 있어(slip_daeri) 가장 먼저. 다른 손님은 걷는 그림이 흔들림
const GUESTS = ['daeri', 'customer', 'student', 'auntie'];
const WET_ART = [null, ['juice_small', 0.8], ['juice_big', 0.55], ['juice_big', 0.7]]; // 젖은 정도 → 웅덩이 그림·배율

const TITLE = '쏟은 음료 수습';
const HOWTO = '도구를 고르고 바닥 칸을 눌러요. 내가 한 번 할 때마다 손님이 한 걸음 걸어요.';
const SAY = {
  sign: '주의 표지판을 세웠어요.',
  mop: '쓱쓱, 문질렀어요.',
  call: '점장님, 바닥이 젖었어요. 손님을 잠깐만 기다리게 해 주세요.',
  callReply: '알겠어요. 손님, 잠시만 기다려 주세요!',
  help: '젖은 바닥은 미끄러워요. 손님이 그쪽으로 걷지 않게 하려면 무엇이 필요할까요?',
  pickTool: '먼저 아래에서 도구를 골라요.',
  done: '바닥이 다 말랐어요. 표지판을 치웠어요.',
};
export const SPILL_OOPS = { id: 'mg_spill_slip', title: '손님이 미끄러질 뻔했어요', lesson: '젖은 바닥에는 주의 표지판을 먼저 세워요. 그다음에 닦아요.', icon: 'caution' };

export function spillLines(opts = {}) {
  return [...line.intro(opts.title || TITLE, HOWTO, opts.speech), line.sys('주의 표지판'), line.sys('대걸레'), ...Object.entries(SAY).map(([k, text]) => (k === 'call' ? line.say('yeonwoo', text) : k === 'callReply' || k === 'help' ? line.say('manager', text) : line.sys(text))), line.oops(SPILL_OOPS)];
}

const key = (c, r) => `${c},${r}`;
const same = (a, b) => a[0] === b[0] && a[1] === b[1];

function freshState() {
  return {
    wet: Object.fromEntries(PUDDLE.map(([c, r, w]) => [key(c, r), w])),
    signs: [],
    guests: [],
    yeon: [7, 3],
    turn: 0,
    hold: 0,
    called: false,
    served: 0,
  };
}

const clone = (s) => JSON.parse(JSON.stringify(s));
const isWet = (s, c, r) => (s.wet[key(c, r)] || 0) > 0;
const blockedStatic = (c, r) => c < 0 || r < 0 || c >= COLS || r >= ROWS || TABLES.some((t) => same(t, [c, r])) || COUNTER.some((t) => same(t, [c, r]));

/** 손님 길 찾기: 표지판 칸은 못 지나가고, 표지판이 하나라도 있으면 젖은 곳을 피함 */
function nextStep(s, from) {
  const avoidWet = s.signs.length > 0;
  const blocked = (c, r) => blockedStatic(c, r) || s.signs.some((p) => same(p, [c, r])) || (avoidWet && isWet(s, c, r));
  const q = [from];
  const prev = new Map([[key(...from), null]]);
  while (q.length) {
    const cur = q.shift();
    if (same(cur, GOAL)) break;
    for (const [dc, dr] of [[1, 0], [0, 1], [0, -1], [-1, 0]]) {
      const n = [cur[0] + dc, cur[1] + dr];
      if (blocked(...n) || prev.has(key(...n))) continue;
      prev.set(key(...n), cur);
      q.push(n);
    }
  }
  if (!prev.has(key(...GOAL))) return null; // 길이 막힘 → 기다림
  let step = GOAL;
  while (prev.get(key(...step)) && !same(prev.get(key(...step)), from)) step = prev.get(key(...step));
  return same(step, from) ? null : step;
}

export async function spill(opts = {}) {
  const t0 = performance.now();
  await pixel.ready();
  const f = frame({ title: opts.title || TITLE, instruction: HOWTO, icon: 'caution', cls: 'mg-spill', speech: opts.speech, quit: Boolean(opts.quit) });
  let s = freshState();
  const history = [];
  let tool = null;
  let mistakes = 0;
  let attempts = 1;
  let busy = false;

  // ---- 뷰 ----
  const floor = h('canvas', { class: 'sp-floor', width: String(COLS * T), height: String(ROWS * T), 'aria-hidden': 'true' });
  const layer = h('div', { class: 'sp-ents', 'aria-hidden': 'true' });
  const tiles = h('div', { class: 'sp-tiles', role: 'grid', 'aria-label': '매장 바닥' });
  const grid = h('div', { class: 'sp-grid', style: { width: `${COLS * T}px`, height: `${ROWS * T}px` } }, floor, layer, tiles);
  const yeon = pixel.sprite('yeonwoo', 'idle', { scale: 3, cls: 'sp-yeon' });
  const status = h('p', { class: 'sp-status', role: 'status' });
  const tools = [
    { id: 'sign', icon: 'caution', label: '주의 표지판' },
    { id: 'mop', icon: 'mop', label: '대걸레' },
  ];
  const toolBtns = tools.map((t) => h('button', { class: 'sp-tool', 'data-tool': t.id, 'aria-pressed': 'false' }, h('i', { html: ICON(t.icon) }), h('span', { text: t.label })));
  const callBtn = h('button', { class: 'btn btn-soft sp-call' }, h('i', { html: ICON('bell_call') }), h('span', { text: '점장님 부르기' }));
  const helpBtn = h('button', { class: 'btn btn-soft' }, h('i', { html: ICON('hand') }), h('span', { text: '도움' }));
  const side = h('div', { class: 'sp-side' }, h('h3', { text: '도구' }), h('div', { class: 'sp-tools' }, ...toolBtns), callBtn, helpBtn, status);
  f.body.append(h('div', { class: 'sp-wrap' }, grid, side));

  // 바닥 그리기: 매장 그림과 같은 체크무늬 + 가구(cafe_objects, 2026-10-25)
  (async () => {
    const g = floor.getContext('2d');
    pixel.floor(g, floor.width, floor.height, T);
    // 카운터 앞 주문하는 자리: 연한 매트
    g.fillStyle = 'rgba(255, 255, 255, .6)';
    g.fillRect(GOAL[0] * T + 6, GOAL[1] * T + 6, T - 12, T - 12);
    const img = await pixel.image('cafe_objects');
    if (!img) return;
    pixel.paint(g, img, 'cafe_objects', 'door', T / 2, (DOOR[1] + 0.5) * T, T, { mid: true });
    COUNTER.forEach(([c, r]) => pixel.paint(g, img, 'cafe_objects', 'counter', (c + 0.5) * T, (r + 1) * T, T));
    TABLES.forEach(([c, r]) => pixel.paint(g, img, 'cafe_objects', 'table_round', (c + 0.5) * T, (r + 1) * T, T * 1.3));
  })();

  function tileLabel(c, r) {
    if (TABLES.some((t) => same(t, [c, r]))) return '테이블';
    if (COUNTER.some((t) => same(t, [c, r]))) return '카운터';
    const w = s.wet[key(c, r)] || 0;
    const sign = s.signs.some((p) => same(p, [c, r]));
    return `${c + 1}번째 줄 ${r + 1}칸, ${w ? `젖은 바닥(${w})` : '마른 바닥'}${sign ? ', 표지판' : ''}`;
  }

  function canUse(c, r) {
    if (blockedStatic(c, r) || same([c, r], GOAL) || same([c, r], DOOR)) return false;
    if (tool === 'mop') return isWet(s, c, r);
    if (tool === 'sign') return !isWet(s, c, r) && !s.signs.some((p) => same(p, [c, r])) && !s.guests.some((g) => same(g.at, [c, r])) && s.signs.length < 2;
    return false;
  }

  function render() {
    // 젖은 곳·표지판·손님
    layer.replaceChildren();
    for (const [k, w] of Object.entries(s.wet)) {
      if (w <= 0) continue;
      const [c, r] = k.split(',').map(Number);
      const [name, scale] = WET_ART[Math.min(3, w)];
      const art = pixel.art(name, scale);
      layer.append(h('span', { class: `sp-wet w${w} ${art ? 'has-art' : ''}`, style: { left: `${c * T}px`, top: `${r * T}px` } }, art));
    }
    for (const [c, r] of s.signs) {
      const icon = pixel.icon('props', 'wet_sign', 5, 'sp-sign') || h('i', { class: 'sp-sign', html: ICON('caution') });
      icon.style.left = `${c * T}px`;
      icon.style.top = `${r * T}px`;
      layer.append(icon);
    }
    for (const g of s.guests) {
      // 걷는 손님은 칸 아래쪽에 발끝. 미끄러지면 회사원은 미끄러지는 그림, 다른 손님은 걷는 그림이 흔들림
      const pose = g.slip && pixel.has('people', `slip_${g.face}`);
      const sp = pixel.person(pose ? `slip_${g.face}` : `walk_${g.face}`, g.at[0] * T + T / 2, (g.at[1] + 1) * T - 6, { cls: `sp-walker ${g.slip ? 'slip' : ''} ${pose ? 'pose' : ''}` });
      layer.append(sp?.el || h('span', { class: `sp-guest ${g.slip ? 'slip' : ''}`, html: portraitHTML(g.face, g.slip ? 'surprised' : 'smile'), style: { left: `${g.at[0] * T + 8}px`, top: `${g.at[1] * T + 4}px` } }));
    }
    if (s.hold > 0) {
      // 점장님이 문 옆에서 팔을 뻗어 손님을 잠깐 기다리게 함
      const boss = pixel.person('manager_stop', 1.5 * T, (DOOR[1] + 1) * T - 4, { cls: 'sp-boss' });
      layer.append(boss?.el || h('span', { class: 'sp-hold', html: portraitHTML('manager', 'front'), style: { left: `${T}px`, top: `${DOOR[1] * T - 8}px` } }));
    }
    if (yeon) {
      yeon.el.style.left = `${s.yeon[0] * T + T / 2 - yeon.foot.x}px`;
      yeon.el.style.top = `${(s.yeon[1] + 1) * T - yeon.foot.y}px`;
      if (!yeon.el.isConnected) layer.parentElement.append(yeon.el);
    }
    // 눌러지는 칸
    tiles.replaceChildren(...Array.from({ length: ROWS * COLS }, (_, i) => {
      const c = i % COLS;
      const r = Math.floor(i / COLS);
      const ok = Boolean(tool) && canUse(c, r);
      return h('button', { class: `sp-tile ${ok ? 'can' : ''}`, disabled: !ok, 'data-c': String(c), 'data-r': String(r), 'aria-label': tileLabel(c, r), style: { left: `${c * T}px`, top: `${r * T}px` } });
    }));
    toolBtns.forEach((b) => { const on = b.dataset.tool === tool; b.classList.toggle('on', on); b.setAttribute('aria-pressed', String(on)); });
    callBtn.disabled = s.called;
    const wetLeft = Object.values(s.wet).filter((w) => w > 0).length;
    status.textContent = `젖은 칸 ${wetLeft}개 · 표지판 ${s.signs.length}개`;
  }

  /** 세상이 한 칸 움직임: 손님 등장·이동, 미끄러짐 확인 */
  function tick() {
    s.turn += 1;
    if (s.hold > 0) s.hold -= 1;
    const k = ARRIVE.indexOf(s.turn);
    if (k >= 0) s.guests.push({ at: [...DOOR], face: GUESTS[k % GUESTS.length], slip: false });
    let slipped = null;
    for (const g of s.guests) {
      if (same(g.at, DOOR) && s.hold > 0) continue;
      const n = nextStep(s, g.at);
      if (!n) continue;
      g.at = n;
      if (isWet(s, ...n)) { g.slip = true; slipped = g; }
    }
    const before = s.guests.length;
    s.guests = s.guests.filter((g) => !same(g.at, GOAL) || g.slip);
    s.served += before - s.guests.length;
    return slipped;
  }

  async function act(c, r) {
    if (busy) return;
    if (!tool) { status.textContent = SAY.pickTool; tts.speak(SAY.pickTool, 'sys'); return; }
    if (!canUse(c, r)) return;
    busy = true;
    history.push(clone(s));
    // 연우가 그 칸 옆으로
    const near = [[c + 1, r], [c - 1, r], [c, r + 1], [c, r - 1]].find(([x, y]) => !blockedStatic(x, y) && !isWet(s, x, y)) || [c, r];
    s.yeon = near;
    if (tool === 'sign') {
      s.signs.push([c, r]);
      audio.sfx('sign');
      yeon?.play('carry');
    } else if (tool === 'mop') {
      s.wet[key(c, r)] = Math.max(0, (s.wet[key(c, r)] || 0) - 1);
      audio.sfx('mop');
      yeon?.play('wipe');
      pixel.burst(layer, ['droplet_left_0', 'droplet_right_0'], { x: c * T + T / 2, y: r * T + T / 2, count: 2, spread: 24, scale: 3 });
    }
    const slipped = tick();
    render();
    await sleep(dur(320));
    yeon?.play('idle');
    if (slipped) {
      mistakes += 1;
      audio.sfx('slip');
      await sleep(dur(700));
      if (stopped()) return null;
      await showOops(SPILL_OOPS);
      if (stopped()) return null;
      attempts += 1;
      s = history.length > 3 ? history[history.length - 3] : history[0] || freshState();
      history.length = Math.max(0, history.length - 3);
      s.guests.forEach((g) => { g.slip = false; });
      render();
    } else if (Object.values(s.wet).every((w) => w <= 0)) {
      busy = false;
      return finish();
    }
    busy = false;
    return null;
  }

  let resolveDone;
  const doneP = new Promise((r) => { resolveDone = r; });
  f.onAbort(() => resolveDone());
  const gen = abortGeneration();
  const stopped = () => abortGeneration() !== gen; // 정리된 뒤 늦게 끝난 대사는 이어 가지 않음

  async function finish() {
    s.signs = [];
    render();
    audio.sfx('great');
    yeon?.play('happy');
    pixel.burst(layer, ['sparkle_big_0', 'sparkle_big_1'], { x: 5 * T, y: 2 * T, count: 5, spread: 120 });
    if (stopped()) { resolveDone(); return; }
    await dialogue.line({ kind: 'sys', text: SAY.done, noWait: true, waitVoice: true });
    await sleep(dur(500));
    resolveDone();
  }

  tiles.addEventListener('click', (e) => {
    const b = e.target.closest('.sp-tile');
    if (!b || b.disabled) return;
    e.stopPropagation();
    act(Number(b.dataset.c), Number(b.dataset.r));
  });
  toolBtns.forEach((b) => b.addEventListener('click', (e) => {
    e.stopPropagation();
    tool = tool === b.dataset.tool ? null : b.dataset.tool;
    audio.sfx('focus');
    tts.speak(tools.find((t) => t.id === b.dataset.tool).label, 'sys');
    render();
    tiles.querySelector('.sp-tile.can')?.focus({ preventScroll: true });
  }));
  callBtn.addEventListener('click', async (e) => {
    e.stopPropagation();
    if (busy || s.called) return;
    busy = true;
    history.push(clone(s));
    s.called = true;
    s.hold = 4;
    audio.sfx('bell');
    await dialogue.line({ kind: 'say', who: 'yeonwoo', face: 'determined', text: SAY.call, noWait: true, waitVoice: true });
    if (stopped()) return;
    await dialogue.line({ kind: 'say', who: 'manager', face: 'front', text: SAY.callReply, noWait: true, waitVoice: true });
    if (stopped()) return;
    const slipped = tick();
    render();
    busy = false;
    if (slipped) { mistakes += 1; await showOops(SPILL_OOPS); attempts += 1; s = history[history.length - 1]; render(); }
  });
  helpBtn.addEventListener('click', (e) => { e.stopPropagation(); audio.sfx('hint'); dialogue.line({ kind: 'say', who: 'manager', face: 'front', text: SAY.help, noWait: true }); });

  // 자동 플레이(?debug): 표지판 → 걸레질
  if (new URLSearchParams(location.search).has('debug')) {
    window.__mgAuto = async () => {
      tool = 'sign'; render();
      if (canUse(1, 2)) await act(1, 2);
      tool = 'mop';
      for (let guard = 0; guard < 30 && Object.values(s.wet).some((w) => w > 0); guard++) {
        const [k] = Object.entries(s.wet).find(([, w]) => w > 0);
        const [c, r] = k.split(',').map(Number);
        await act(c, r);
        await sleep(30);
      }
    };
  }

  render();
  toolBtns[0].focus({ preventScroll: true });
  if (isReducedMotion()) yeon?.stop();
  await doneP;
  delete window.__mgAuto;
  f.close();
  await sleep(dur(150));
  return { ok: true, attempts, mistakes, ms: performance.now() - t0 };
}
