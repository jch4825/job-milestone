/**
 * 미니게임: 반짝반짝 청소 (두더지 잡기처럼) — 4장의 청소 일(바닥 쓸기·테이블 닦기·쓰레기 비우기), 2026-10-15
 *  - 여기저기 생기는 먼지·얼룩·쓰레기를 눌러서 치워요. 오래 두면 커져서 여러 번 눌러야 해요(바닥·테이블). 목표만큼 치우면 끝.
 *  - 누르면 안 되는 것: 지나가는 손님의 발(바닥) · 손님이 앉아 계신 테이블 · 손님이 두고 간 휴대폰(쓰레기)
 *    → 아차 → 몇 초 앞으로 되감기(손님이 다시 보이고, 기다렸다 치울 수 있음)
 *  - 손님이 떠난 테이블에는 부스러기가 남아요(닦을 때를 몸으로 배움). 두고 간 휴대폰은 조금 뒤 주인이 찾아가요.
 *  - 빠르기: 설정 '시간 제한'(arcade.js). 끄기·자동 스캔이면 턴 방식(한 번 누를 때마다 세상이 한 칸)
 *  - skin: 'floor' | 'trash' (테이블 닦기는 2026-10-15 사용자 의견으로 손님이 앉았다 떠나는 tables.js 로 옮김)
 *  - 먼지·휴지·빨대 포장지·휴대폰·쓰레기봉투와 걷는 손님은 픽셀 그림(people·mg_objects, 2026-10-26)
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
import { pace, loop, startGate, popText, clone, rand, isDebug, keyed } from './arcade.js';

const FW = 1100;
const FH = 560;
const T = 64; // 바닥 타일(16px × 4)

export const WHACK_OOPS = {
  feet: { id: 'mg_sweep_feet', title: '손님과 부딪혔어요', lesson: '손님이 지나가는 길에 서 있으면 부딪혀요. 손님이 지나가실 때는 비켰다가 쓸어요.', icon: 'mop' },
  lost: { id: 'mg_trash_lost', title: '손님 휴대폰을 버릴 뻔했어요', lesson: '손님 물건은 쓰레기가 아니에요. 그대로 두거나 카운터에 맡겨요.', icon: 'phone' },
};

// 자리: [x, y](필드 안 가운데 좌표)
const FLOOR_SPOTS = [[190, 150], [410, 150], [630, 150], [850, 150], [300, 290], [520, 290], [740, 290], [960, 290], [190, 430], [410, 430], [630, 430], [850, 430]];
const FLOOR_ROUTES = [[0, 1, 2, 3], [4, 5, 6, 7], [8, 9, 10, 11]]; // 손님이 걸어가는 줄(왼쪽 문 → 오른쪽 카운터)
const TRASH_SPOTS = [[200, 170], [530, 170], [860, 170], [200, 410], [530, 410], [860, 410], [365, 290], [695, 290], [100, 290], [1010, 410]];
const TRASH_TABLES = [0, 1, 2, 3, 4, 5]; // 쓰레기판: 테이블 위 자리(두고 간 휴대폰이 놓이는 곳)

const SKINS = {
  floor: {
    title: '바닥 쓸기', icon: 'mop', spots: FLOOR_SPOTS, goal: 12, grow: true, avoid: 'feet', tables: false,
    howto: '여기저기 생기는 먼지를 눌러서 쓸어요. 오래 두면 먼지가 커져요.',
    say: { done: '바닥이 반짝반짝해졌어요!' }, anim: 'sweep', sfx: 'sweep',
  },
  trash: {
    title: '쓰레기 비우기', icon: 'trash', spots: TRASH_SPOTS, goal: 10, grow: false, avoid: 'lost', tables: true, bag: 5,
    howto: '여기저기 떨어진 쓰레기를 눌러서 주워요. 봉투가 차면 [봉투 묶기]를 눌러요.',
    say: { done: '쓰레기를 다 치웠어요!', full: '봉투가 가득 찼어요.', tie: '봉투를 묶어서 내놓았어요.', owner: '아, 제 휴대폰! 여기 있었네요.' }, anim: 'carry', sfx: 'pickup',
  },
};
const LEVEL_NAME = { floor: ['', '먼지 조금', '먼지 많이', '먼지 뭉치'] };
const LITTER = [['tissue', '휴지'], ['straw', '빨대 껍질'], ['cup', '빈 종이컵']];
// 먼지 단계 그림(mg_objects): [그림, 배율] — 작은 털뭉치 → 큰 털뭉치를 키워 가며
const DUST_ART = [null, ['dust_small', 1.1], ['dust_big', 0.8], ['dust_big', 1.15]];
const LITTER_ART = { tissue: 'tissue', straw: 'straw_wrapper' };

const skinOf = (opts) => SKINS[opts.skin] || SKINS.floor;
const speechOf = (opts, sk) => opts.speech || `${opts.title || sk.title}. ${sk.howto}`;

export function whackLines(opts = {}) {
  const sk = skinOf(opts);
  const out = [line.sys(speechOf(opts, sk)), line.sys(sk.howto), line.sys(sk.say.done), line.oops(WHACK_OOPS[sk.avoid])];
  if (sk.bag) out.push(line.sys(sk.say.full), line.sys(sk.say.tie), line.say('customer', sk.say.owner));
  return out;
}

export async function whack(opts = {}) {
  const t0 = performance.now();
  const gen = abortGeneration();
  const stopped = () => abortGeneration() !== gen;
  await pixel.ready();
  const sk = skinOf(opts);
  const skin = opts.skin && SKINS[opts.skin] ? opts.skin : 'floor';
  const { turn, k } = pace();
  const f = frame({ title: opts.title || sk.title, instruction: sk.howto, icon: sk.icon, cls: `mg-whack mg-arcade wh-${skin}`, speech: speechOf(opts, sk), quit: Boolean(opts.quit) });
  f.el.dataset.arcade = 'whack';
  document.body.classList.add('mg-arcade');

  const SP = sk.spots;
  let mistakes = 0;
  let attempts = 1;
  let started = false;
  let over = false;
  let busy = false;
  let speed = 1;
  let auto = false;
  let ownerSpoke = false;
  const SPAWN = turn ? 1 : 1350 * k;
  const GROW = turn ? 5 : 5200 * k;
  const STEP = turn ? 1 : 850 * k;       // 걷는 손님이 한 칸 가는 시간
  const LOST = turn ? 6 : 7500 * k;      // 휴대폰이 놓여 있는 시간
  const GAP = turn ? 3 : 3200 * k;       // 다음 손님까지
  const MAXD = turn ? 4 : 5;

  let s = {
    dirt: {}, score: 0, combo: 0, comboT: 0, bag: 0, tick: 0,
    spawnIn: turn ? 0 : 400, guest: null, nextGuest: turn ? 3 : 2600 * k, yeon: Math.floor(SP.length / 2),
  };
  const history = []; // 되감기용 상태 기록(실시간: 0.4초마다, 턴: 한 칸마다)
  let histT = 0;

  // ---- 뷰 ----
  const floor = h('canvas', { class: 'wh-floor', width: String(FW), height: String(FH), 'aria-hidden': 'true' });
  const deco = h('div', { class: 'wh-deco', 'aria-hidden': 'true' });
  const layer = h('div', { class: 'wh-ents', 'aria-hidden': 'true' });
  const yeon = pixel.sprite('yeonwoo', 'idle', { scale: 3, cls: 'wh-yeon' });
  const spotBtns = SP.map(([x, y], i) => h('button', { class: 'wh-spot', 'data-i': String(i), style: { left: `${x - 62}px`, top: `${y - 62}px` } }));
  const field = h('div', { class: 'wh-field' }, floor, deco, layer, ...spotBtns);
  if (yeon) field.append(yeon.el);
  const tableIdx = !sk.tables ? [] : skin === 'trash' ? TRASH_TABLES : SP.map((_, i) => i); // 테이블은 바닥 캔버스에 그림(아래)

  const meter = h('span', { class: 'ct-meter' }, ...Array.from({ length: sk.goal }, () => h('i')));
  const meterN = h('b', { class: 'ct-meter-n' });
  const bagMeter = sk.bag ? h('span', { class: 'ct-meter small' }, ...Array.from({ length: sk.bag }, () => h('i'))) : null;
  // 쓰레기봉투 그림: 채우는 동안 열린 봉투, [봉투 묶기]를 누르면 잠깐 묶은 봉투
  const bagOpen = sk.bag ? pixel.art('bag_open', 0.62, 'wh-bag-art') : null;
  const bagTied = sk.bag ? pixel.art('bag_tied', 0.62, 'wh-bag-art') : null;
  const tieB = sk.bag ? h('button', { class: 'btn btn-big btn-red wh-bag' }, h('i', { html: ICON('trash') }), h('span', { text: '봉투 묶기' })) : null;
  const waitB = turn ? h('button', { class: 'btn btn-soft wh-wait' }, h('i', { html: ICON('hourglass') }), h('span', { text: '기다리기' })) : null;
  const status = h('p', { class: 'ct-status', role: 'status' });
  const panel = h('div', { class: 'ct-panel' },
    h('div', { class: 'ct-card' }, h('h3', {}, h('i', { html: ICON('sparkle') }), '반짝반짝'), meter, meterN),
    sk.bag ? h('div', { class: 'ct-card wh-bag-card' }, h('h3', {}, h('i', { html: ICON('trash') }), '쓰레기봉투'), bagMeter, bagOpen) : null,
    tieB, waitB, status);
  f.body.append(h('div', { class: 'ct-stage' }, field), panel);

  // 바닥 그리기: 매장 그림과 같은 체크무늬 + 가구(cafe_objects, 2026-10-25)
  (async () => {
    const g = floor.getContext('2d');
    pixel.floor(g, FW, FH, T);
    const img = await pixel.image('cafe_objects');
    if (!img) return;
    pixel.paint(g, img, 'cafe_objects', 'door', T / 2, 5 * T, T);
    for (let r = 2; r < 7; r++) pixel.paint(g, img, 'cafe_objects', 'counter', 16.5 * T, (r + 1) * T, T);
    pixel.paint(g, img, 'cafe_objects', 'plant_tall', 16.5 * T, 2 * T, T * 1.1);
    for (const i of tableIdx) pixel.paint(g, img, 'cafe_objects', 'table_round', SP[i][0], SP[i][1], 200, { mid: true });
  })();

  /* ---- 그리기 ---- */
  const occupant = (i) => {
    const g = s.guest;
    if (!g) return null;
    if (g.kind === 'walk' && g.route[g.at] === i) return 'feet';
    if (g.kind === 'lost' && g.spot === i) return 'lost';
    return null;
  };
  function dirtArt(d) {
    // 바닥 먼지: 회색 털뭉치(오래 두면 커짐). 그림이 없으면 진한 회색 CSS 먼지(픽셀 효과의 먼지는 크림색 바닥에서 안 보여서 2026-10-15)
    if (skin === 'floor') {
      const [name, scale] = DUST_ART[d.lvl] || DUST_ART[1];
      return pixel.art(name, scale) || h('span', { class: `wh-dust-css l${d.lvl}` }, h('i'), h('i'), h('i'));
    }
    const [icon] = LITTER[d.kind] || LITTER[0];
    if (icon === 'cup') return pixel.icon('props', 'paper_cup', 4, 'wh-litter lying') || h('i', { class: 'wh-litter', html: ICON('cup') });
    return pixel.art(LITTER_ART[icon], 0.9) || h('i', { class: `wh-litter l-${icon}`, html: ICON(icon) });
  }
  // 걷는 손님(두 프레임 걷기)은 발끝을 자리 아래쪽에, 휴대폰은 테이블 윗면에
  const walker = (face, x, y) => pixel.person(`walk_${face}`, x, y + 40, { cls: 'wh-walker' })?.el
    || h('span', { class: 'wh-guest walk', style: { left: `${x}px`, top: `${y}px` }, html: faceHTML(face, 'smile') });
  const phoneArt = (x, y) => {
    const el = pixel.art('phone', 0.62, 'wh-phone-art');
    if (!el) return h('span', { class: 'wh-phone', style: { left: `${x}px`, top: `${y}px` } }, h('i', { html: ICON('phone') }));
    el.style.left = `${x}px`;
    el.style.top = `${y - 16}px`;
    return el;
  };
  const shown = new Map();
  let lastKey = '';
  function render(force = false) {
    const key = JSON.stringify([Object.entries(s.dirt).map(([i, d]) => `${i}:${d.lvl}:${d.kind}`), s.guest && { ...s.guest, t: 0 }, s.score, s.bag, s.yeon, started, over, busy]);
    if (key === lastKey && !force) return;
    lastKey = key;
    // 그대로인 먼지는 다시 만들지 않음(다른 곳이 바뀔 때마다 등장 효과가 다시 돌지 않게)
    const want = new Map();
    for (const [i, d] of Object.entries(s.dirt)) {
      const [x, y] = SP[i];
      want.set(`d${i}:${d.lvl}:${d.kind}`, () => h('span', { class: `wh-dirt l${d.lvl}`, style: { left: `${x}px`, top: `${y}px` } }, dirtArt(d)));
    }
    const g = s.guest;
    if (g?.kind === 'walk') want.set(`path${g.route[0]}`, () => h('span', { class: 'wh-path', style: { top: `${SP[g.route[0]][1]}px` } }));
    if (g) {
      const at = g.kind === 'walk' ? g.route[g.at] : g.spot;
      if (at !== undefined && SP[at]) {
        const [x, y] = SP[at];
        if (g.kind === 'lost') want.set(`phone${at}`, () => phoneArt(x, y));
        else want.set(`walk${at}:${g.face}`, () => walker(g.face, x, y));
      }
    }
    keyed(layer, shown, want);
    if (yeon) {
      const [x, y] = SP[s.yeon];
      // 테이블 자리에서는 테이블 위에 서 보이지 않게 오른쪽 의자 바깥에(테이블 닦기와 같은 자리)
      const [dx, dy] = tableIdx.includes(s.yeon) ? [128, 57] : [46, 16];
      yeon.el.style.transform = `translate(${x + dx - yeon.foot.x}px, ${y + dy - yeon.foot.y}px)`;
    }
    spotBtns.forEach((b, i) => {
      const d = s.dirt[i];
      const occ = occupant(i);
      const label = occ === 'feet' ? '손님이 지나가세요' : occ === 'lost' ? '손님 휴대폰' : d ? (skin === 'trash' ? (LITTER[d.kind] || LITTER[0])[1] : LEVEL_NAME[skin][d.lvl]) : '깨끗해요';
      b.setAttribute('aria-label', `${i + 1}번 자리: ${label}`);
      b.classList.toggle('has', Boolean(d) && !occ);
      b.disabled = !started || over || busy || (turn && !d && !occ);
    });
    meter.querySelectorAll('i').forEach((c, i) => c.classList.toggle('on', i < s.score));
    meterN.textContent = `${Math.min(s.score, sk.goal)} / ${sk.goal}`;
    bagMeter?.querySelectorAll('i').forEach((c, i) => c.classList.toggle('on', i < s.bag));
    if (tieB) { tieB.disabled = !started || over || busy || s.bag === 0; tieB.classList.toggle('ready', s.bag >= sk.bag); }
    if (waitB) waitB.disabled = !started || over || busy;
    const dirtN = Object.keys(s.dirt).length;
    status.textContent = `치운 것 ${Math.min(s.score, sk.goal)}/${sk.goal} · 남은 것 ${dirtN}개${sk.bag ? ` · 봉투 ${s.bag}/${sk.bag}` : ''}`;
  }

  /* ---- 세상 ---- */
  const freeSpots = (forTable = false) => SP.map((_, i) => i).filter((i) => !s.dirt[i] && !occupant(i) && i !== s.yeon && (!forTable || skin !== 'trash' || TRASH_TABLES.includes(i)));
  function spawnDirt() {
    const free = freeSpots();
    if (!free.length || Object.keys(s.dirt).length >= MAXD) return;
    const i = free[rand(free.length)];
    s.dirt[i] = { lvl: 1, age: 0, kind: rand(LITTER.length) };
  }
  function newGuest() {
    if (sk.avoid === 'feet') s.guest = { kind: 'walk', route: FLOOR_ROUTES[rand(FLOOR_ROUTES.length)], at: 0, t: 0, face: ['customer', 'student', 'auntie', 'daeri'][rand(4)] };
    else {
      const free = freeSpots(true).filter((i) => skin !== 'trash' || TRASH_TABLES.includes(i));
      if (!free.length) return;
      const spot = free[rand(free.length)];
      s.guest = { kind: 'lost', spot, t: 0 };
    }
  }
  /** 손님이 떠남(테이블: 부스러기를 남김 · 휴대폰: 주인이 찾아감) */
  function guestLeaves() {
    const g = s.guest;
    s.guest = null;
    s.nextGuest = GAP;
    if (g.kind === 'lost') {
      const [x, y] = SP[g.spot];
      // 주인(두리번거리던 손님)이 테이블 왼쪽으로 와서 찾아감(오른쪽은 연우가 서는 자리)
      const tok = pixel.person('search_customer', x - 125, y + 57, { cls: 'wh-owner' })?.el
        || h('span', { class: 'wh-guest owner', style: { left: `${x}px`, top: `${y}px` }, html: faceHTML('customer', 'smile'), 'aria-hidden': 'true' });
      field.append(tok);
      setTimeout(() => tok.remove(), dur(1300));
      popText(field, '고마워요!', x, y - 70);
      if (!ownerSpoke) { ownerSpoke = true; dialogue.line({ kind: 'say', who: 'customer', face: 'smile', text: sk.say.owner, noWait: true }); }
    }
  }
  function advance(dt) {
    const step = turn ? 1 : dt;
    s.tick += turn ? 1 : 0;
    // 먼지가 커짐
    if (sk.grow) for (const d of Object.values(s.dirt)) { d.age += step; if (d.age >= GROW && d.lvl < 3) { d.lvl += 1; d.age = 0; } }
    // 새 먼지
    s.spawnIn -= step;
    if (s.spawnIn <= 0) { spawnDirt(); s.spawnIn = SPAWN * (turn ? (Object.keys(s.dirt).length < 2 ? 1 : 2) : 1); }
    // 손님
    if (s.guest) {
      const g = s.guest;
      g.t += step;
      if (g.kind === 'walk' && g.t >= STEP) {
        g.t = 0; g.at += 1;
        if (g.at >= g.route.length) guestLeaves();
        else if (g.route[g.at] === s.yeon) s.bump = true; // 손님 길(일직선)에 연우가 서 있으면 부딪힘
      }
      else if (g.kind === 'lost' && g.t >= LOST) guestLeaves();
    } else {
      s.nextGuest -= step;
      if (s.nextGuest <= 0) newGuest();
    }
    if (!turn) { s.comboT -= dt; if (s.comboT <= 0) s.combo = 0; }
    // 되감기 기록
    histT += step;
    if (turn || histT >= 400) { histT = 0; history.push(clone(s)); if (history.length > 12) history.shift(); }
  }

  /** 세상이 움직인 뒤: 손님과 부딪혔으면 아차 */
  function checkBump() {
    if (!s.bump || over) return false;
    s.bump = false;
    audio.sfx('bump');
    fault('feet');
    return true;
  }

  async function fault(kind) {
    over = true;
    mistakes += 1;
    yeon?.play('panic');
    audio.sfx('hint');
    render(true);
    await sleep(dur(500));
    if (stopped()) return;
    await showOops(WHACK_OOPS[kind]);
    if (stopped()) return;
    attempts += 1;
    // 몇 초(턴: 두 칸) 앞으로
    const n = turn ? 3 : 5;
    const back = history[Math.max(0, history.length - n)];
    if (back) s = clone(back);
    history.length = Math.max(1, history.length - (n - 1));
    yeon?.play('idle');
    over = false;
    render(true);
  }

  async function tapSpot(i) {
    if (!started || over || busy) return;
    const occ = occupant(i);
    s.yeon = i;
    if (occ) { await fault(occ); return; }
    const d = s.dirt[i];
    const [x, y] = SP[i];
    if (!d) { audio.sfx('focus'); render(); if (turn) { advance(0); render(); checkBump(); } return; }
    if (sk.bag && s.bag >= sk.bag) {
      shake(tieB);
      audio.sfx('hint');
      tts.speak(sk.say.full, 'sys');
      render();
      return;
    }
    yeon?.play(sk.anim);
    setTimeout(() => yeon?.play('idle'), dur(380));
    audio.sfx(sk.sfx);
    d.lvl -= 1;
    pixel.burst(field, skin === 'floor' ? ['dust_0', 'dust_1'] : ['sparkle_0', 'sparkle_1'], { x, y, count: 2, spread: 30, scale: 3 });
    if (d.lvl <= 0) {
      delete s.dirt[i];
      s.score += 1;
      if (sk.bag) s.bag += 1;
      s.combo += 1;
      s.comboT = 1600 * k;
      const msg = s.combo >= 5 ? '최고예요!' : s.combo >= 3 ? '반짝반짝!' : '반짝!';
      popText(field, msg, x, y - 56, s.combo >= 3 ? 'big' : '');
      pixel.burst(field, ['sparkle_big_0', 'sparkle_big_1'], { x, y, count: 2, spread: 30 });
    } else {
      popText(field, '쓱쓱', x, y - 50);
    }
    if (turn) advance(0);
    render();
    if (checkBump()) return;
    if (s.score >= sk.goal) await finish();
  }

  async function tie() {
    if (!started || over || busy || !s.bag) return;
    busy = true;
    render();
    audio.sfx('stack');
    yeon?.play('carry');
    if (bagOpen && bagTied) { bagOpen.replaceWith(bagTied); setTimeout(() => bagTied.replaceWith(bagOpen), dur(1100)); }
    await sleep(dur(450));
    s.bag = 0;
    tts.speak(sk.say.tie, 'sys');
    yeon?.play('idle');
    busy = false;
    if (turn) advance(0);
    render();
    checkBump();
  }

  let resolveDone;
  const doneP = new Promise((r) => { resolveDone = r; });
  f.onAbort(() => resolveDone()); // 되감기·나가기·[그만하기]: 아래 정리(고리·방향키)가 그대로 돎
  async function finish() {
    if (over) return;
    over = true;
    s.guest = null;
    if (sk.bag && s.bag) { audio.sfx('stack'); s.bag = 0; }
    render(true);
    audio.sfx('great');
    yeon?.play('happy');
    pixel.burst(field, ['sparkle_big_0', 'sparkle_big_1'], { x: FW / 2, y: FH / 2, count: 7, spread: 260 });
    if (stopped()) { resolveDone(); return; }
    await dialogue.line({ kind: 'sys', text: sk.say.done, noWait: true, waitVoice: true });
    await sleep(dur(400));
    resolveDone();
  }

  spotBtns.forEach((b) => b.addEventListener('click', (e) => { e.stopPropagation(); tapSpot(Number(b.dataset.i)); }));
  tieB?.addEventListener('click', (e) => { e.stopPropagation(); tie(); });
  waitB?.addEventListener('click', (e) => { e.stopPropagation(); if (started && !over && !busy) { audio.sfx('tap'); advance(0); render(); checkBump(); } });

  if (isDebug()) {
    const go = async () => { if (!started) { f.el.querySelector('.mg-go')?.click(); await sleep(80); } };
    window.__mgBad = async () => {
      await go();
      if (over) return;
      // 손님을 한 자리에 두고 그 자리를 누름
      const spot = sk.avoid === 'feet' ? FLOOR_ROUTES[1][1] : (skin === 'trash' ? TRASH_TABLES[0] : 0);
      delete s.dirt[spot];
      history.push(clone(s));
      s.guest = sk.avoid === 'feet' ? { kind: 'walk', route: FLOOR_ROUTES[1], at: 1, t: 0, face: 'customer' } : { kind: 'lost', spot, t: 0 };
      render(true);
      tapSpot(spot); // 아차 카드를 기다리지 않음(자동 플레이가 카드를 닫음)
    };
    window.__mgAuto = async () => { await go(); auto = true; speed = 4; await doneP; };
  }
  const autoTap = () => {
    if (!auto || over || busy) return;
    if (sk.bag && s.bag >= sk.bag) { tie(); return; }
    const ahead = s.guest?.kind === 'walk' ? s.guest.route.slice(s.guest.at) : [];
    const i = Object.keys(s.dirt).map(Number).find((n) => !occupant(n) && !ahead.includes(n));
    if (i !== undefined) tapSpot(i);
    else if (turn) { advance(0); render(); }
  };

  render(true);
  await startGate(field, { note: turn ? '한 번 누를 때마다 세상이 한 칸 움직여요.' : '' });
  started = true;
  spawnDirt(); // 처음부터 치울 것이 보이게(턴 방식에서도)
  spawnDirt();
  render(true);
  spotBtns.find((b) => !b.disabled)?.focus({ preventScroll: true });
  let autoT = 0;
  const lp = loop((dt) => {
    if (over) return;
    if (!turn) { advance(dt); if (checkBump()) return; }
    autoT += dt;
    if (auto && autoT > (turn ? 60 : 160)) { autoT = 0; autoTap(); }
    render();
  }, () => speed);

  await doneP;
  lp.stop();
  delete window.__mgAuto;
  delete window.__mgBad;
  document.body.classList.remove('mg-arcade');
  f.close();
  await sleep(dur(150));
  return { ok: true, attempts, mistakes, ms: performance.now() - t0 };
}
