/**
 * 미니게임: 주문서 확인 (주문서와 트레이 맞추기)
 * 전략: 주문서를 손가락으로 하나씩 짚으며(✓) 확인하기.
 * 잘못 내면 손님이 "제가 시킨 게 아닌데요" → 아차! → 그 주문부터 다시.
 * 트레이에 담긴 물건을 누르면 하나씩 빠집니다(터치에서도 보이게 '− 빼기' 표시, 2026-10-14).
 * 정해진 수보다 더 담는 것은 막지 않습니다(정답을 미리 알려 주지 않음: 절대 원칙 1).
 * 급한 장면(옵션 timer, 예: 3장 피크의 단체 손님): 손님마다 시간 제한 막대. 시간이 다 되면 손님이 기다리다 지침 → 아차! → 그 주문부터 다시.
 *   timer: { label, say(손님 말), oops, sec(없으면 18초 + 물건 하나에 3초, 상한 45초) } · 한 번 실패한 손님은 1.5배, 두 번 넘으면 막대 없이
 *   상한(MAX_SEC)은 기본 시간에만: 설정 '넉넉히'(2배)와 실패 뒤 1.5배는 상한 다음에 곱함(배려는 그대로)
 */

import { h, sleep, dur } from '../../core/dom.js';
import { ICON } from '../../data/icons.js';
import { audio } from '../../av/audio.js';
import { tts } from '../../av/tts.js';
import { dialogue } from '../../ui/dialogue.js';
import { showOops } from '../../core/oops.js';
import { pixel } from '../../ui/pixel.js';
import { artHTML, itemOf } from '../../data/items.js';
import { frame, shake, line, abortGeneration } from './frame.js';
import { timerBar, timerFactor } from '../../ui/timer.js';

export const MENU = {
  ice_ame: { icon: 'icecup', name: '아이스 아메리카노' },
  hot_ame: { icon: 'coffee', name: '따뜻한 아메리카노' },
  latte: { icon: 'coffee', name: '카페라테' },
  milk: { icon: 'milk', name: '따뜻한 우유' },
  juice: { icon: 'juice', name: '오렌지주스' },
  saltbread: { icon: 'bread', name: '소금빵' },
  croissant: { icon: 'croissant', name: '크루아상' },
  muffin: { icon: 'muffin', name: '초코 머핀' },
};

export const DEFAULT_ORDERS = [
  { who: '봉순 할머니', items: { milk: 1, saltbread: 1 } },
  { who: '회사원 손님', items: { ice_ame: 2, croissant: 1 } },
  { who: '학생 손님', items: { latte: 1, juice: 1, muffin: 2 } },
];

const TITLE = '주문서 확인';
const MAX_SEC = 45; // 시간 제한 상한(2026-10-16 사용자): 큰 단체 주문(20개 넘음)도 보통 설정에서 45초
const HOWTO = '주문서를 한 줄씩 짚으면서 트레이에 담아요. 잘못 담으면 트레이에서 눌러 빼고, 다 담으면 [다 담았어요]를 눌러요.';
const SAY = {
  serve: '주문하신 것 나왔습니다. 맛있게 드세요!',
  fail: '어? 이거 제가 시킨 게 아닌데요…',
  retry: '다시 해 봐요. 주문서 한 줄을 짚고, 담고, ✓ 표시하고. 그다음 줄!',
  slow: '저기요, 아직이에요? 너무 오래 기다렸어요.', // 시간 제한이 다 됐을 때(timer.say 가 없으면)
};
const OOPS = { id: 'd3_order', title: '주문을 잘못 드렸어요', lesson: '주문서를 손가락으로 한 줄씩 짚으면서 담으면 빠뜨리지 않아요.', icon: 'order_check' };
export const introLine = (o, n, total) => `${TITLE}. ${total}개 중 ${n}번째, ${o.who}의 주문이에요. ${HOWTO}`;
export const tickLine = (k, q) => `${MENU[k].name} ${q}개`;

/** 읽어 주는 문장 목록 (음성 파일 미리 만들기용) */
export function orderLines(opts = {}) {
  const orders = opts.orders || DEFAULT_ORDERS;
  return [
    ...orders.flatMap((o, i) => [line.sys(introLine(o, i + 1, orders.length)), ...Object.entries(o.items).map(([k, q]) => line.sys(tickLine(k, q)))]),
    line.sys(HOWTO), line.say('yeonwoo', SAY.serve), line.say('customer', SAY.fail), line.say(opts.mentor || 'dohyun', SAY.retry), line.oops(opts.oops || OOPS),
    ...(opts.timer ? [line.say('customer', opts.timer.say || SAY.slow), line.oops(opts.timer.oops)] : []),
  ];
}

function same(a, b) {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  for (const k of keys) if ((a[k] || 0) !== (b[k] || 0)) return false;
  return true;
}

function firstWrongLine(order, tray) {
  const keys = Object.keys(order);
  for (let i = 0; i < keys.length; i++) if ((tray[keys[i]] || 0) !== order[keys[i]]) return i;
  return -1;
}

// 픽셀 소품(assets/pixel/props) ← 메뉴. 없으면 픽토그램
const PROP = { ice_ame: 'ice_cup', hot_ame: 'americano', latte: 'latte', milk: 'milk', juice: 'juice', saltbread: 'salt_bread', croissant: 'croissant', muffin: 'muffin' };
// 소품 그림(assets/items, 주문서의 물건) → 픽셀 소품 → 픽토그램. 크기는 픽셀 소품과 같게(16px × 배율)
const ITEM = { ice_ame: 'item_iced_americano', hot_ame: 'item_americano', latte: 'item_latte', milk: 'item_milk', juice: 'item_juice', saltbread: 'item_saltbread', croissant: 'item_croissant', muffin: 'item_muffin' };
const pic = (k, scale) => (itemOf(ITEM[k])
  ? h('i', { class: 'mg-art', style: { width: `${16 * scale}px`, height: `${16 * scale}px` }, html: artHTML(ITEM[k]) })
  : pixel.icon('props', PROP[k], scale) || h('i', { html: ICON(MENU[k].icon) }));

/** timing: { sec, label } 이면 시간 제한 막대(배율은 이미 곱한 초) */
async function oneOrder(order, n, total, timing = null, quit = false) {
  await pixel.ready();
  const f = frame({ title: `${TITLE} (${n}/${total})`, instruction: HOWTO, icon: 'order_check', cls: 'mg-order', speech: introLine(order, n, total), quit });
  const tray = {};
  const lines = Object.entries(order.items).map(([k, q]) => {
    const li = h('li', {},
      h('button', { class: 'tick', 'aria-label': `${MENU[k].name} 짚기` }, '✓'),
      pic(k, 3), h('span', { text: MENU[k].name }), h('b', { text: `× ${q}` }));
    li.querySelector('.tick').addEventListener('click', (e) => { e.stopPropagation(); li.classList.toggle('checked'); audio.sfx('tap'); tts.speak(tickLine(k, q), 'sys', { force: true }); });
    return li;
  });
  // 단체 주문처럼 줄이 많으면(4줄 이상) 촘촘하게: 주문서·트레이가 틀 밖으로 넘치지 않게
  const many = Object.keys(order.items).length >= 4 ? 'many' : '';
  const ticket = h('div', { class: `od-ticket ${many}` }, h('h3', { text: '주문서' }), h('p', { class: 'od-who', text: order.who }), h('ol', {}, ...lines));
  const shelfBtns = Object.entries(MENU).map(([k, m]) => h('button', { class: 'od-item', 'data-k': k, 'aria-label': `${m.name} 담기` }, pic(k, 4), h('span', { text: m.name })));
  const shelf = h('div', { class: 'od-shelf' }, ...shelfBtns);
  const trayList = h('div', { class: 'od-tray-list' });
  const done = h('button', { class: 'btn btn-big btn-red od-done' }, h('i', { html: ICON('tray') }), h('span', { text: '다 담았어요' }));
  const trayEl = h('div', { class: `od-tray ${many}` }, h('h3', { text: '트레이' }), trayList, done);
  f.body.append(ticket, shelf, trayEl);

  // 트레이의 물건 = 누르면 하나 빼는 버튼. 터치에는 마우스처럼 올려 보는 안내가 없으므로 '− 빼기'를 늘 보여 줌
  const renderTray = (changed = null) => {
    trayList.replaceChildren(...Object.entries(tray).filter(([, q]) => q > 0).map(([k, q]) => h('button', {
      class: `od-in ${k === changed ? 'is-out' : ''}`, 'data-k': k, 'aria-label': `${MENU[k].name} ${q}개 담음. 누르면 하나 빼기`,
      onclick: (e) => {
        e.stopPropagation();
        tray[k] -= 1;
        audio.sfx('tap');
        renderTray(k);
        // 키보드·스캔으로 눌렀으면(e.detail 0) 초점을 같은 물건(다 빠졌으면 선반의 그 물건)에 둠
        if (e.detail === 0) (trayList.querySelector(`.od-in[data-k="${k}"]`) || shelfBtns.find((b) => b.dataset.k === k))?.focus({ preventScroll: true });
      },
    }, pic(k, 3), h('span', { class: 'od-in-name', text: MENU[k].name }), h('b', { class: 'od-in-q', text: `× ${q}` }),
    h('span', { class: 'od-out', 'aria-hidden': 'true' }, h('i', { text: '−' }), '빼기'))));
    if (!trayList.children.length) trayList.append(h('p', { class: 'od-empty', text: '비어 있어요' }));
  };
  renderTray();
  shelf.addEventListener('click', (e) => {
    const b = e.target.closest('.od-item');
    if (!b) return;
    e.stopPropagation();
    tray[b.dataset.k] = (tray[b.dataset.k] || 0) + 1;
    audio.sfx('tray');
    renderTray();
  });
  shelfBtns[0].focus({ preventScroll: true });

  // 시간 제한 막대: 머리글 아래. 설명을 듣기 시작한 뒤부터 줄어듦
  const tm = timing ? timerBar(timing) : null;
  if (tm) {
    f.el.insertBefore(tm.el, f.body);
    setTimeout(() => tm.start(), 1200);
  }
  // 되감기·나가기·[그만하기]로 정리되면 막대를 멈추고 이 주문을 끝냄(손님 말·아차 없이)
  let abortRes;
  const aborted = new Promise((r) => { abortRes = r; });
  f.onAbort(() => { tm?.stop(); abortRes('abort'); });
  const how = await Promise.race([
    new Promise((r) => done.addEventListener('click', (e) => { e.stopPropagation(); r('done'); }, { once: true })),
    tm ? tm.done : new Promise(() => {}),
    aborted,
  ]);
  tm?.stop();
  if (how === 'abort') return { ok: false, aborted: true, tray };
  if (how === 'timeout') {
    done.disabled = true;
    shake(trayEl);
    await sleep(1000); // '시간이 다 됐어요!'를 보여 주고 읽어 줌
    f.close();
    await sleep(dur(150));
    return { ok: false, timeout: true, tray };
  }
  const ok = same(order.items, tray);
  if (ok) pixel.burst(trayEl, ['sparkle_big_0', 'sparkle_big_1'], { x: trayEl.clientWidth / 2, y: trayEl.clientHeight * 0.4, count: 3, spread: 90 });
  if (!ok) {
    const bad = firstWrongLine(order.items, tray);
    if (bad >= 0) lines[bad].classList.add('wrong');
    shake(trayEl);
  }
  await sleep(dur(ok ? 300 : 700));
  f.close();
  await sleep(dur(150));
  return { ok, tray };
}

export async function order(opts = {}) {
  const orders = opts.orders || DEFAULT_ORDERS;
  const t0 = performance.now();
  const gen = abortGeneration(); // 이 번호가 바뀌면 도중에 정리된 것: 남은 손님 말·아차 없이 끝냄
  let attempts = 0;
  let mistakes = 0;
  let timeouts = 0;
  const fails = {}; // 손님(주문)마다 실패한 횟수: 시간 제한을 늘리거나 없앰
  const stopped = () => abortGeneration() !== gen;
  const quit = () => ({ ok: false, aborted: true, attempts, mistakes, timeouts, ms: performance.now() - t0 });
  for (let i = 0; i < orders.length; i++) {
    attempts += 1;
    const o = orders[i];
    const factor = opts.timer ? timerFactor() : 0;
    const f = fails[i] || 0;
    const qty = Object.values(o.items).reduce((a, q) => a + q, 0);
    const base = Math.min(MAX_SEC, opts.timer?.sec || 18 + 3 * qty);
    const timing = factor && f < 2 ? { sec: base * factor * (f ? 1.5 : 1), label: opts.timer.label || '손님이 기다려요' } : null;
    const r = await oneOrder(o, i + 1, orders.length, timing, Boolean(opts.quit));
    if (r.aborted || stopped()) return quit();
    if (r.ok) {
      audio.sfx('good');
      await dialogue.line({ kind: 'say', who: 'yeonwoo', face: 'smile', text: SAY.serve });
      if (stopped()) return quit();
      continue;
    }
    mistakes += 1;
    fails[i] = f + 1;
    audio.sfx('crowd_angry');
    if (r.timeout) {
      timeouts += 1;
      await dialogue.line({ kind: 'say', who: 'customer', face: 'angry', text: opts.timer.say || SAY.slow });
      if (stopped()) return quit();
      await showOops(opts.timer.oops);
    } else {
      await dialogue.line({ kind: 'say', who: 'customer', face: 'surprised', text: SAY.fail });
      if (stopped()) return quit();
      await showOops(opts.oops || OOPS);
    }
    if (stopped()) return quit();
    dialogue.line({ kind: 'say', who: opts.mentor || 'dohyun', face: (opts.mentor || 'dohyun') === 'dohyun' ? 'teach' : 'front', text: SAY.retry, noWait: true });
    i -= 1;
  }
  return { ok: true, attempts, mistakes, timeouts, ms: performance.now() - t0 };
}
