/**
 * 미니게임: 테이블 닦기 (손님이 떠난 자리 치우기) — 4장 '테이블 닦기', 2026-10-15 사용자 의견으로 다시 만듦
 *  - 테이블마다 손님 1~2명이 의자에 앉아 먹다가 떠나고, 떠난 자리에 부스러기·얼룩이 생겨요 → 눌러서 닦아요(얼룩이 클수록 여러 번).
 *    손님·접시·얼룩은 픽셀 그림(people·mg_objects, 2026-10-26). 테이블 그림의 의자가 둘이라 손님도 둘까지.
 *  - 오래 두면(보통 5초) 새 손님이 더러운 테이블에 앉아서 투덜거려요(말) → 그 테이블을 닦으면 연우가 "죄송합니다" 하고 닦아 드림.
 *    투덜거린 횟수는 세 번에 실수 하나로 수습 별에 들어가요(벌이 아닌 일터의 결과).
 *  - 손님이 깨끗한 테이블에서 드시는 중에 닦으면 → 아차 → 몇 초 앞으로 되감기
 *  - 손님이 많이 오가지만 빠르게 돌아가요. 빠르기: 설정 '시간 제한'(arcade.js). 끄기·자동 스캔이면 턴 방식([기다리기])
 *  - 목표: 테이블 10번 깨끗하게
 */

import { h, sleep, dur } from '../../core/dom.js';
import { ICON } from '../../data/icons.js';
import { audio } from '../../av/audio.js';
import { dialogue } from '../../ui/dialogue.js';
import { pixel } from '../../ui/pixel.js';
import { faceHTML } from '../../data/characters.js';
import { showOops } from '../../core/oops.js';
import { frame, line, abortGeneration } from './frame.js';
import { pace, loop, startGate, popText, clone, rand, isDebug, keyed } from './arcade.js';

const FW = 1100;
const FH = 560;
const T = 64;
const GOAL = 10;
const TABLES = [[210, 160], [550, 160], [890, 160], [210, 410], [550, 410], [890, 410]];
const TABLE_W = 200;
// 테이블 그림(table_round, 너비 200px)의 왼쪽·오른쪽 의자 다리 끝 = 앉은 손님의 발끝
const SEAT = [[-72, 57], [72, 57]];
const TOP_Y = -16; // 테이블 윗면 가운데(얼룩·접시 자리)
const FACES = ['customer', 'student', 'auntie', 'daeri', 'hiker', 'grandma'];
const STAIN = ['', 'crumbs', 'coffee_ring', 'syrup']; // 얼룩 단계 그림(mg_objects)

const TITLE = '테이블 닦기';
const HOWTO = '손님이 떠난 테이블의 얼룩을 눌러서 닦아요. 늦으면 새 손님이 더러운 테이블에 앉아요.';
const SAY = {
  done: '테이블이 깨끗해졌어요!',
  sorry: '죄송합니다. 바로 닦아 드릴게요.',
};
const GRUMBLE = ['여기 좀 더럽네요.', '테이블이 끈적끈적하네.', '아, 부스러기가 있어요.'];
export const TABLES_OOPS = { id: 'mg_wipe_guest', title: '손님이 계신 테이블을 닦았어요', lesson: '드시는 중에 닦으면 손님이 불편해요. 손님이 떠나신 뒤에 닦아요.', icon: 'cloth' };

const speechOf = (opts) => opts.speech || `${opts.title || TITLE}. ${HOWTO}`;

export function tablesLines(opts = {}) {
  return [line.sys(speechOf(opts)), line.sys(HOWTO), line.sys(SAY.done), line.say('yeonwoo', SAY.sorry), ...GRUMBLE.map((t) => line.say('customer', t)), line.oops(TABLES_OOPS)];
}

export async function tables(opts = {}) {
  const t0 = performance.now();
  const gen = abortGeneration();
  const stopped = () => abortGeneration() !== gen;
  await pixel.ready();
  const { turn, k } = pace();
  const f = frame({ title: opts.title || TITLE, instruction: HOWTO, icon: 'cloth', cls: 'mg-tables mg-arcade', speech: speechOf(opts), quit: Boolean(opts.quit) });
  f.el.dataset.arcade = 'tables';
  document.body.classList.add('mg-arcade');

  // 빠르기(보통). 턴 방식은 칸 수
  const ARRIVE = turn ? 2 : 1300 * k;      // 새 손님이 오는 사이
  const EAT = () => (turn ? 3 + rand(2) : (3200 + rand(1800)) * k); // 드시는 시간
  const WAIT = turn ? 4 : 5000 * k;        // 더러운 테이블을 그냥 두면 새 손님이 앉기까지

  let mistakes = 0;
  let attempts = 1;
  let started = false;
  let over = false;
  let speed = 1;
  let auto = false;
  let lastSay = -99999;

  let s = {
    tables: TABLES.map(() => ({ n: 0, faces: [], eat: 0, dirt: 0, wait: 0, grumble: false })),
    arrive: turn ? 0 : 400, cleaned: 0, complaints: 0, grumbleNo: 0, clock: 0,
  };
  const history = [];
  let histT = 0;

  // ---- 뷰 ----
  const floor = h('canvas', { class: 'wh-floor', width: String(FW), height: String(FH), 'aria-hidden': 'true' });
  const deco = h('div', { class: 'wh-deco', 'aria-hidden': 'true' }); // 테이블은 바닥 캔버스에 그림(아래)
  const layer = h('div', { class: 'wh-ents', 'aria-hidden': 'true' });
  const spots = TABLES.map(([x, y], i) => h('button', { class: 'tb-spot', 'data-i': String(i), style: { left: `${x - 90}px`, top: `${y - 70}px` } }));
  const yeon = pixel.sprite('yeonwoo', 'idle', { scale: 3, cls: 'wh-yeon' });
  const field = h('div', { class: 'wh-field' }, floor, deco, layer, ...spots);
  if (yeon) {
    field.append(yeon.el);
    // 처음에는 두 줄 테이블 사이 통로(첫째·둘째 테이블 사이)에 서 있음(누르기 전까지 왼쪽 위 구석에 있던 것)
    yeon.el.style.transform = `translate(${380 - yeon.foot.x}px, ${FH / 2 + 20 - yeon.foot.y}px)`;
  }

  const meter = h('span', { class: 'ct-meter' }, ...Array.from({ length: GOAL }, () => h('i')));
  const meterN = h('b', { class: 'ct-meter-n' });
  const grumbleN = h('b', { class: 'tb-grumble-n' });
  const waitB = turn ? h('button', { class: 'btn btn-soft wh-wait' }, h('i', { html: ICON('hourglass') }), h('span', { text: '기다리기' })) : null;
  const status = h('p', { class: 'ct-status', role: 'status' });
  const panel = h('div', { class: 'ct-panel' },
    h('div', { class: 'ct-card' }, h('h3', {}, h('i', { html: ICON('sparkle') }), '깨끗하게 닦은 테이블'), meter, meterN),
    h('div', { class: 'ct-card tb-card' }, h('h3', {}, h('i', { html: ICON('speech') }), '투덜거린 손님'), grumbleN),
    waitB, status);
  f.body.append(h('div', { class: 'ct-stage' }, field), panel);

  // 바닥 그리기: 매장 그림과 같은 체크무늬 + 가구(cafe_objects, 2026-10-25). 테이블도 그림으로
  (async () => {
    const g = floor.getContext('2d');
    pixel.floor(g, FW, FH, T);
    const img = await pixel.image('cafe_objects');
    if (!img) return;
    pixel.paint(g, img, 'cafe_objects', 'door', T / 2, 5 * T, T);
    pixel.paint(g, img, 'cafe_objects', 'plant_tall', 16.5 * T, 2 * T, T * 1.1);
    TABLES.forEach(([x, y]) => pixel.paint(g, img, 'cafe_objects', 'table_round', x, y, TABLE_W, { mid: true }));
  })();

  /* ---- 그리기 ---- */
  // 테이블 위 그림: 얼룩(단계마다 그림) · 먹는 동안 접시와 커피잔 · 의자에 앉은 손님(먹기 / 투덜) · 말풍선
  const at = (el, x, y) => { el.style.left = `${x}px`; el.style.top = `${y}px`; return el; };
  const stainArt = (lvl) => pixel.art(STAIN[lvl], 0.62) || h('span', { class: `wh-stain l${lvl}` }, h('i'), h('i'), h('i'));
  const dish = (name, x, y, scale) => { const el = pixel.art(name, scale, 'tb-dish'); return el && at(el, x, y); };
  function guestEl(fc, n, grumble, x, y) {
    const [dx, dy] = SEAT[n];
    const sp = pixel.person(`${grumble ? 'grumble' : 'sit'}_${fc}`, x + dx, y + dy, { cls: `tb-sit ${grumble ? 'grumble' : ''}` });
    return sp?.el || h('span', { class: `tb-guest ${grumble ? 'grumble' : ''}`, style: { left: `${x + dx}px`, top: `${y + dy - 40}px` }, html: faceHTML(fc, grumble ? 'angry' : 'smile') });
  }
  const shown = new Map();
  let lastKey = '';
  function render(force = false) {
    const key = JSON.stringify([s.tables.map((t) => [t.n, t.faces, t.dirt, t.grumble]), s.cleaned, s.complaints, started, over]);
    if (key === lastKey && !force) return;
    lastKey = key;
    const want = new Map();
    s.tables.forEach((t, i) => {
      const [x, y] = TABLES[i];
      if (t.dirt) want.set(`stain${i}:${t.dirt}`, () => h('span', { class: `wh-dirt l${t.dirt}`, style: { left: `${x}px`, top: `${y + TOP_Y}px` } }, stainArt(t.dirt)));
      if (t.n && !t.grumble) {
        want.set(`plate${i}`, () => dish('plate', x - 24, y + TOP_Y + 2, 0.42));
        want.set(`cup${i}`, () => dish('coffee_cup', x + 26, y + TOP_Y - 2, 0.4));
      }
      t.faces.forEach((fc, n) => want.set(`guest${i}:${n}:${fc}:${t.grumble}`, () => guestEl(fc, n, t.grumble, x, y)));
      if (t.grumble && t.n) want.set(`bubble${i}`, () => h('span', { class: 'tb-bubble', text: '더러워요…', style: { left: `${x}px`, top: `${y - 104}px` } }));
    });
    keyed(layer, shown, want);
    spots.forEach((b, i) => {
      const t = s.tables[i];
      const what = t.n ? (t.grumble ? `손님 ${t.n}명이 더러운 테이블에서 투덜거려요` : `손님 ${t.n}명이 드시는 중`) : t.dirt ? ['', '부스러기', '커피 얼룩', '끈적한 얼룩'][t.dirt] : '깨끗해요';
      b.setAttribute('aria-label', `${i + 1}번 테이블: ${what}`);
      b.classList.toggle('dirty', Boolean(t.dirt));
      b.disabled = !started || over || (turn && !t.dirt && !t.n);
    });
    meter.querySelectorAll('i').forEach((c, i) => c.classList.toggle('on', i < s.cleaned));
    meterN.textContent = `${Math.min(s.cleaned, GOAL)} / ${GOAL}`;
    grumbleN.textContent = `${s.complaints}번`;
    if (waitB) waitB.disabled = !started || over;
    status.textContent = `닦은 테이블 ${Math.min(s.cleaned, GOAL)}/${GOAL} · 더러운 테이블 ${s.tables.filter((t) => t.dirt).length}개 · 투덜 ${s.complaints}번`;
  }

  /* ---- 세상 ---- */
  // 한 테이블에 같은 사람이 둘 앉지 않게 서로 다른 손님으로
  const groupFaces = (n) => { const a = [...FACES]; return Array.from({ length: n }, () => a.splice(rand(a.length), 1)[0]); };
  function sayGrumble() {
    // 말이 너무 잦지 않게(4초에 한 번), 문장은 돌아가며
    if (s.clock - lastSay < (turn ? 3 : 4000)) return;
    lastSay = s.clock;
    dialogue.line({ kind: 'say', who: 'customer', face: 'angry', text: GRUMBLE[s.grumbleNo % GRUMBLE.length], noWait: true });
    s.grumbleNo += 1;
  }
  function advance(dt) {
    const step = turn ? 1 : dt;
    s.clock += step;
    s.tables.forEach((t) => {
      if (t.n) {
        t.eat -= step;
        if (t.eat <= 0) {
          // 떠남: 깨끗한 자리였으면 손님 수만큼 얼룩(한 명 1~2단계, 두 명 2~3단계), 더러운 자리였으면 더 더러워짐
          t.dirt = Math.min(3, t.grumble ? t.dirt + 1 : t.n + rand(2));
          t.n = 0; t.faces = []; t.grumble = false; t.wait = 0;
        }
      } else if (t.dirt) {
        t.wait += step;
        if (t.wait >= WAIT) {
          // 더러운 테이블에 새 손님 → 투덜
          t.n = 1 + rand(SEAT.length); t.faces = groupFaces(t.n); t.eat = EAT(); t.grumble = true; t.wait = 0;
          s.complaints += 1;
          audio.sfx('hint');
          sayGrumble();
        }
      }
    });
    s.arrive -= step;
    if (s.arrive <= 0) {
      const free = s.tables.map((t, i) => i).filter((i) => !s.tables[i].n && !s.tables[i].dirt);
      if (free.length) {
        const t = s.tables[free[rand(free.length)]];
        t.n = 1 + rand(SEAT.length); t.faces = groupFaces(t.n); t.eat = EAT(); t.grumble = false;
        audio.sfx('bell');
      }
      s.arrive = ARRIVE;
    }
    histT += step;
    if (turn || histT >= 400) { histT = 0; history.push(clone(s)); if (history.length > 12) history.shift(); }
  }

  async function fault() {
    over = true;
    mistakes += 1;
    yeon?.play('panic');
    audio.sfx('hint');
    render(true);
    await sleep(dur(500));
    if (stopped()) return;
    await showOops(TABLES_OOPS);
    if (stopped()) return;
    attempts += 1;
    const n = turn ? 3 : 5;
    const back = history[Math.max(0, history.length - n)];
    if (back) s = clone(back);
    history.length = Math.max(1, history.length - (n - 1));
    yeon?.play('idle');
    over = false;
    render(true);
  }

  async function tap(i) {
    if (!started || over) return;
    const t = s.tables[i];
    const [x, y] = TABLES[i];
    // 오른쪽 의자 손님을 가리지 않게 의자 바깥에 섬
    if (yeon) yeon.el.style.transform = `translate(${x + 128 - yeon.foot.x}px, ${y + SEAT[1][1] - yeon.foot.y}px)`;
    if (t.n && !t.grumble) { await fault(); return; } // 드시는 중
    if (!t.dirt) { audio.sfx('focus'); if (turn) { advance(0); render(); } return; }
    if (t.n && t.grumble && s.clock - lastSay > (turn ? 1 : 1500)) {
      lastSay = s.clock;
      dialogue.line({ kind: 'say', who: 'yeonwoo', face: 'determined', text: SAY.sorry, noWait: true });
    }
    yeon?.play('wipe');
    setTimeout(() => yeon?.play('idle'), dur(360));
    audio.sfx('wipe');
    t.dirt -= 1;
    pixel.burst(field, ['sparkle_0', 'sparkle_1'], { x, y, count: 2, spread: 30, scale: 3 });
    if (t.dirt <= 0) {
      t.dirt = 0; t.wait = 0;
      if (t.grumble) t.grumble = false; // 닦아 드리면 기분이 풀림
      s.cleaned += 1;
      popText(field, s.cleaned >= GOAL ? '끝!' : '반짝!', x, y - 60, 'big');
      pixel.burst(field, ['sparkle_big_0', 'sparkle_big_1'], { x, y, count: 2, spread: 40 });
    } else popText(field, '쓱쓱', x, y - 50);
    if (turn) advance(0);
    render();
    if (s.cleaned >= GOAL) await finish();
  }

  let resolveDone;
  const doneP = new Promise((r) => { resolveDone = r; });
  f.onAbort(() => resolveDone()); // 되감기·나가기·[그만하기]: 아래 정리(고리·방향키)가 그대로 돎
  async function finish() {
    if (over) return;
    over = true;
    render(true);
    audio.sfx('great');
    yeon?.play('happy');
    pixel.burst(field, ['sparkle_big_0', 'sparkle_big_1'], { x: FW / 2, y: FH / 2, count: 7, spread: 260 });
    if (stopped()) { resolveDone(); return; }
    await dialogue.line({ kind: 'sys', text: SAY.done, noWait: true, waitVoice: true });
    await sleep(dur(400));
    resolveDone();
  }

  spots.forEach((b) => b.addEventListener('click', (e) => { e.stopPropagation(); tap(Number(b.dataset.i)); }));
  waitB?.addEventListener('click', (e) => { e.stopPropagation(); if (started && !over) { audio.sfx('tap'); advance(0); render(); } });

  if (isDebug()) {
    const go = async () => { if (!started) { f.el.querySelector('.mg-go')?.click(); await sleep(80); } };
    window.__mgBad = async () => {
      await go();
      if (over) return;
      history.push(clone(s));
      const t = s.tables[0];
      t.n = 2; t.faces = groupFaces(2); t.eat = EAT() * 3; t.grumble = false; t.dirt = 0;
      render(true);
      tap(0); // 아차 카드를 기다리지 않음
    };
    window.__mgAuto = async () => { await go(); auto = true; speed = 3; await doneP; };
  }
  let autoT = 0;
  const autoTap = () => {
    const i = s.tables.findIndex((t) => t.dirt && (!t.n || t.grumble));
    if (i >= 0) tap(i); else if (turn) { advance(0); render(); }
  };

  render(true);
  await startGate(field, { note: turn ? '한 번 누를 때마다 세상이 한 칸 움직여요.' : '' });
  started = true;
  render(true);
  spots[0].focus({ preventScroll: true });
  const lp = loop((dt) => {
    if (over) return;
    if (!turn) advance(dt);
    autoT += dt;
    if (auto && autoT > (turn ? 60 : 150)) { autoT = 0; autoTap(); }
    render();
  }, () => speed);

  await doneP;
  lp.stop();
  delete window.__mgAuto;
  delete window.__mgBad;
  document.body.classList.remove('mg-arcade');
  f.close();
  await sleep(dur(150));
  // 투덜거림 세 번 = 실수 하나(수습 별이 너무 쉽게 깎이지 않게)
  return { ok: true, attempts, mistakes: mistakes + Math.floor(s.complaints / 3), complaints: s.complaints, ms: performance.now() - t0 };
}
