/**
 * 미니게임: 컵·빨대 채우기 (분류)
 * 규칙(도현): 종이컵은 왼쪽, 투명한 아이스컵은 오른쪽, 빨대는 빨대 통, 뚜껑은 뚜껑 칸.
 * 3번 섞이면 '보관대가 뒤죽박죽' → 되감기.
 */

import { h, sleep, dur } from '../../core/dom.js';
import { ICON } from '../../data/icons.js';
import { artHTML, itemOf } from '../../data/items.js';
import { audio } from '../../av/audio.js';
import { tts } from '../../av/tts.js';
import { dialogue } from '../../ui/dialogue.js';
import { showOops } from '../../core/oops.js';
import { pixel } from '../../ui/pixel.js';
import { frame, shake, line, abortGeneration } from './frame.js';

const BINS = [
  { id: 'paper', icon: 'cup', label: '종이컵', where: '왼쪽' },
  { id: 'straw', icon: 'straw', label: '빨대 통', where: '' },
  { id: 'lid', icon: 'lid', label: '뚜껑 칸', where: '' },
  { id: 'ice', icon: 'icecup', label: '아이스컵', where: '오른쪽' },
];

const ITEMS = [
  { bin: 'paper', icon: 'cup', label: '종이컵 한 줄' },
  { bin: 'ice', icon: 'icecup', label: '투명한 아이스컵 한 줄' },
  { bin: 'straw', icon: 'straw', label: '빨대 한 묶음' },
  { bin: 'lid', icon: 'lid', label: '뚜껑 한 묶음' },
  { bin: 'ice', icon: 'icecup', label: '투명한 아이스컵 한 줄' },
  { bin: 'paper', icon: 'cup', label: '종이컵 한 줄' },
  { bin: 'lid', icon: 'lid', label: '뚜껑 한 묶음' },
  { bin: 'straw', icon: 'straw', label: '빨대 한 묶음' },
];

const HINT = {
  paper: '종이컵은 따뜻한 음료용이에요. 왼쪽 칸이에요.',
  ice: '투명한 컵은 아이스컵이에요. 오른쪽 칸이에요.',
  straw: '빨대는 빨대 통에 꽂아요.',
  lid: '뚜껑은 뚜껑 칸에 넣어요.',
};
const TITLE = '컵·빨대 채우기';
const HOWTO = '상자에서 나온 물건을 알맞은 칸에 넣어요. 종이컵은 왼쪽, 아이스컵은 오른쪽!';
const SAY = {
  fail: '아이스 라테 주문했는데… 왜 종이컵에 담겨 나와요?',
  retry: '다시 해 봐요. 투명한 컵은 오른쪽, 종이컵은 왼쪽이에요.',
};
const OOPS = { id: 'd2_cups', title: '컵 보관대가 뒤죽박죽', lesson: '칸이 섞이면 바쁠 때 엉뚱한 컵을 쓰게 돼요. 종이컵은 왼쪽, 아이스컵은 오른쪽!', icon: 'icecup' };

/** 읽어 주는 문장 목록 (음성 파일 미리 만들기용) */
export function cupsLines(opts = {}) {
  return [
    ...line.intro(TITLE, HOWTO), ...[...new Set(ITEMS.map((it) => it.label))].map(line.sys),
    ...Object.values(HINT).map((t) => line.say('dohyun', t)),
    line.say('customer', SAY.fail), line.say('dohyun', SAY.retry), line.oops(opts.oops || OOPS),
  ];
}

// 픽셀 소품(assets/pixel/props) ← 아이콘 이름. 없으면 픽토그램
const PROP = { cup: 'paper_cup', icecup: 'ice_cup', straw: 'straw', lid: 'lid' };
// 소품 그림(assets/items) → 픽셀 소품 → 픽토그램. 크기는 픽셀 소품과 같게(16px × 배율)
const ITEM = { cup: 'item_papercup', icecup: 'item_icecup', straw: 'item_straw', lid: 'item_lid' };
const pic = (icon, scale) => (itemOf(ITEM[icon])
  ? h('i', { class: 'mg-art', style: { width: `${16 * scale}px`, height: `${16 * scale}px` }, html: artHTML(ITEM[icon]) })
  : pixel.icon('props', PROP[icon], scale) || h('i', { html: ICON(icon) }));

async function round(stopped = () => false) {
  await pixel.ready();
  const f = frame({ title: TITLE, instruction: HOWTO, icon: 'cup', cls: 'mg-cups' });
  const counts = {};
  const binEls = BINS.map((b) => {
    counts[b.id] = 0;
    return h('button', { class: `cup-bin bin-${b.id}`, 'data-bin': b.id, 'aria-label': `${b.label}${b.where ? `, ${b.where}` : ''}` },
      h('span', { class: 'bin-stack' }),
      pic(b.icon, 5),
      h('b', { text: b.label }),
      b.where ? h('em', { text: b.where }) : null);
  });
  const shelf = h('div', { class: 'cup-shelf' }, ...binEls);
  const itemEl = h('div', { class: 'cup-item' });
  const progress = h('p', { class: 'cup-progress' });
  const box = h('div', { class: 'cup-box' }, h('div', { class: 'cup-box-label', text: '비품 상자' }), itemEl, progress);
  f.body.append(shelf, box);

  let idx = 0;
  let mistakes = 0;
  let busy = false;
  const showItem = () => {
    const it = ITEMS[idx];
    itemEl.replaceChildren(pic(it.icon, 6), h('span', { text: it.label }));
    itemEl.classList.remove('drop');
    progress.textContent = `${idx + 1} / ${ITEMS.length}`;
    tts.speak(it.label, 'sys');
  };
  showItem();
  binEls[0].focus({ preventScroll: true });

  const result = await new Promise((resolve) => {
    f.onAbort(() => resolve({ ok: false, aborted: true, mistakes }));
    shelf.addEventListener('click', async (e) => {
      const btn = e.target.closest('.cup-bin');
      if (!btn || busy) return;
      e.stopPropagation();
      busy = true;
      const it = ITEMS[idx];
      if (btn.dataset.bin === it.bin) {
        counts[it.bin] += 1;
        const stack = btn.querySelector('.bin-stack');
        stack.append(h('i', { class: 'stk' }));
        itemEl.classList.add('drop');
        audio.sfx('stack');
        btn.classList.add('ok');
        pixel.burst(btn, ['sparkle_0', 'sparkle_1'], { x: btn.clientWidth / 2, y: btn.clientHeight * 0.45 });
        setTimeout(() => btn.classList.remove('ok'), 400);
        await sleep(dur(380));
        if (stopped()) { resolve({ ok: false, aborted: true, mistakes }); return; }
        idx += 1;
        if (idx >= ITEMS.length) { resolve({ ok: true, mistakes }); return; }
        showItem();
      } else {
        mistakes += 1;
        shake(itemEl);
        audio.sfx('clink');
        if (mistakes >= 3) { resolve({ ok: false, mistakes }); return; }
        dialogue.line({ kind: 'say', who: 'dohyun', face: 'teach', text: HINT[it.bin], noWait: true });
      }
      busy = false;
    });
  });

  if (result.ok) {
    progress.textContent = '보관대가 가득 찼어요!';
    audio.sfx('great');
    await sleep(dur(900));
  }
  f.close();
  await sleep(dur(150));
  return result;
}

export async function cups(opts = {}) {
  const t0 = performance.now();
  const gen = abortGeneration();
  const stopped = () => abortGeneration() !== gen;
  let attempts = 0;
  let mistakes = 0;
  for (;;) {
    attempts += 1;
    const r = await round(stopped);
    mistakes += r.mistakes;
    if (r.aborted || stopped()) return { ok: false, attempts, mistakes, ms: performance.now() - t0 };
    if (r.ok) return { ok: true, attempts, mistakes, ms: performance.now() - t0 };
    audio.sfx('crash_small');
    await dialogue.line({ kind: 'say', who: 'customer', face: 'surprised', text: SAY.fail });
    if (stopped()) return { ok: false, attempts, mistakes, ms: performance.now() - t0 };
    await showOops(opts.oops || OOPS);
    if (stopped()) return { ok: false, attempts, mistakes, ms: performance.now() - t0 };
    dialogue.line({ kind: 'say', who: 'dohyun', face: 'teach', text: SAY.retry, noWait: true });
  }
}
