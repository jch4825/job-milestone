/**
 * 미니게임: 손 씻기 6단계 (질병관리청 올바른 손 씻기 6단계)
 * 포스터(오픈북)를 보고 다음 단계를 고릅니다. 3번 헷갈리면 '세균이 남았어요' → 되감기.
 */

import { h, sleep, dur } from '../../core/dom.js';
import { ICON } from '../../data/icons.js';
import { audio } from '../../av/audio.js';
import { tts } from '../../av/tts.js';
import { dialogue } from '../../ui/dialogue.js';
import { showOops } from '../../core/oops.js';
import { pixel } from '../../ui/pixel.js';
import { frame, waitClick, shake, line, abortGeneration } from './frame.js';

export const HW_STEPS = [
  { icon: 'hw1', label: '손바닥끼리 문지르기' },
  { icon: 'hw2', label: '손등 문지르기' },
  { icon: 'hw3', label: '깍지 끼고 문지르기' },
  { icon: 'hw4', label: '손가락 마주 잡고 문지르기' },
  { icon: 'hw5', label: '엄지손가락 돌려 문지르기' },
  { icon: 'hw6', label: '손톱 밑 문지르기' },
];

const COUNT = ['하나', '둘', '셋', '넷', '다섯'];
// 단계마다 번갈아 보여 줄 손 씻기 프레임(0 손바닥 · 1 손등 · 2 손가락 사이 · 3 물 털기)
const SCRUB = [['wash_0', 'wash_2'], ['wash_1', 'wash_0'], ['wash_2', 'wash_1'], ['wash_0', 'wash_2'], ['wash_1', 'wash_2'], ['wash_2', 'wash_0']];
const TITLE = '손 씻기 6단계';
const HOWTO = '벽의 포스터를 보면서, 지금 할 단계를 눌러요.';
const SOAP = '물 묻히고 비누 짜기';
const FINISH = [['rinse', '물로 헹구기', 'water'], ['towel', '종이 타월로 닦기', 'towel']];
const SAY = {
  hint: (n) => `포스터의 ${n}번을 볼까요? 손가락으로 짚어 봐요.`,
  fail: '손에 아직 미끌미끌한 거품과 세균이 남아 있다. 이 손으로 컵을 만지면…',
  retry: '다시 해 봐요. 포스터를 손가락으로 짚으면서, 1번부터 차례대로요.',
};
const OOPS = { id: 'd1_handwash', title: '세균이 남았어요', lesson: '손 씻기는 포스터 순서대로 해요. 헷갈리면 포스터를 손가락으로 짚어요.', icon: 'germ' };

/** 읽어 주는 문장 목록 (음성 파일 미리 만들기용) */
export function handwashLines(opts = {}) {
  return [
    ...line.intro(TITLE, HOWTO), ...FINISH.map(([, label]) => line.sys(label)),
    ...HW_STEPS.map((s, i) => line.say(opts.mentor || 'dohyun', SAY.hint(i + 1))),
    line.narr(SAY.fail), line.say(opts.mentor || 'dohyun', SAY.retry), line.oops(opts.oops || OOPS),
  ];
}

function shuffled(n) {
  const a = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  if (a.every((v, i) => v === i)) return shuffled(n);
  return a;
}

const mentorFace = (who) => (who === 'dohyun' ? 'teach' : 'front');

async function round(mentor = 'dohyun', quit = false, stopped = () => false) {
  await pixel.ready();
  const f = frame({ title: TITLE, instruction: HOWTO, icon: 'handwash', cls: 'mg-handwash', quit });
  const posterItems = HW_STEPS.map((s, i) => h('li', { 'data-n': i },
    h('b', { text: String(i + 1) }), h('i', { html: ICON(s.icon) }), h('span', { text: s.label })));
  const poster = h('div', { class: 'hw-poster' }, h('h3', { text: '올바른 손 씻기' }), h('ol', {}, ...posterItems));
  // 픽셀 그림(연우·세균)이 있으면 쓰고, 없으면 픽토그램
  const germs = h('div', { class: 'hw-germs', 'aria-hidden': 'true' },
    ...HW_STEPS.map(() => pixel.sprite('effects', ['germ_worried_0', 'germ_worried_1'], { scale: 4 })?.el || h('i', { html: ICON('germ') })));
  const countEl = h('p', { class: 'hw-count', 'aria-live': 'polite' });
  const yeon = pixel.sprite('yeonwoo', 'idle', { scale: 6 });
  const hands = yeon ? h('div', { class: 'hw-hands' }, yeon.el) : h('div', { class: 'hw-hands', html: ICON('handwash') });
  // 꾸밈: 물비누(비누 짤 때 눌림)·종이 타월(닦을 때 한 장 뽑힘), 픽셀 그림(2026-10-26)
  const soapImg = pixel.art('soap', 1.3, 'hw-soap');
  const towelImg = pixel.art('towels', 1.2, 'hw-towels');
  const use = (el) => { if (!el) return; el.classList.remove('use'); void el.offsetWidth; el.classList.add('use'); };
  const center = h('div', { class: 'hw-center' }, soapImg, towelImg, hands, germs, countEl);
  const pop = (frames, count = 3) => pixel.burst(center, frames, { x: center.clientWidth / 2, y: center.clientHeight * 0.42, count, spread: 70 });
  const tiles = h('div', { class: 'hw-tiles' });
  f.body.append(poster, center, tiles);

  // 먼저 물 묻히고 비누 짜기
  const soap = h('button', { class: 'act-btn small' }, h('i', { html: ICON('water') }), h('span', { text: SOAP }));
  tiles.append(soap);
  soap.focus({ preventScroll: true });
  await waitClick(soap);
  if (stopped()) { f.close(); return { ok: false, aborted: true, mistakes: 0 }; }
  use(soapImg);
  audio.sfx('water');
  setTimeout(() => audio.sfx('bubbles'), 400);
  soap.remove();
  yeon?.play('wash');
  pop(['bubble_large_0', 'bubble_large_1']);

  const order = shuffled(HW_STEPS.length);
  const btns = order.map((i) => h('button', { class: 'hw-tile', 'data-i': i, 'aria-label': HW_STEPS[i].label },
    h('i', { html: ICON(HW_STEPS[i].icon) }), h('span', { text: HW_STEPS[i].label })));
  tiles.append(...btns);
  btns[0].focus({ preventScroll: true });

  let k = 0;
  let mistakes = 0;
  let busy = false;

  const result = await new Promise((resolve) => {
    f.onAbort(() => resolve({ ok: false, aborted: true, mistakes }));
    tiles.addEventListener('click', async (e) => {
      const btn = e.target.closest('.hw-tile');
      if (!btn || busy || btn.disabled) return;
      e.stopPropagation();
      const i = Number(btn.dataset.i);
      busy = true;
      if (i === k) {
        btn.disabled = true;
        btn.classList.add('done');
        posterItems[k].classList.remove('hi');
        posterItems[k].classList.add('done');
        germs.children[k]?.classList.add('gone');
        audio.sfx('bubbles');
        // 다섯을 세는 동안 문지르기: 두 프레임을 번갈아 + 좌우로 흔들기 + 셀 때마다 거품
        hands.classList.add('scrub');
        yeon?.play(SCRUB[k]);
        for (let c = 0; c < COUNT.length; c++) {
          countEl.textContent = `${k + 1}단계 · ${COUNT[c]}`;
          pop(['bubble_small_0', 'bubble_small_1'], 2);
          await sleep(dur(240));
          if (stopped()) { resolve({ ok: false, aborted: true, mistakes }); return; }
        }
        hands.classList.remove('scrub');
        yeon?.play('wash');
        audio.sfx('good');
        k += 1;
        if (k === HW_STEPS.length) { resolve({ ok: true, mistakes }); return; }
      } else {
        mistakes += 1;
        shake(btn);
        audio.sfx('hint');
        yeon?.play('panic');
        setTimeout(() => yeon?.play('wash'), 900);
        posterItems[k].classList.add('hi');
        germs.classList.add('wiggle');
        setTimeout(() => germs.classList.remove('wiggle'), 600);
        if (mistakes >= 3) { resolve({ ok: false, mistakes }); return; }
        dialogue.line({ kind: 'say', who: mentor, face: mentorFace(mentor), text: SAY.hint(k + 1), noWait: true });
      }
      busy = false;
    });
  });

  if (result.ok) {
    countEl.textContent = '거품을 다 냈어요!';
    tiles.replaceChildren();
    for (const [icon, label, sfx] of FINISH) {
      const b = h('button', { class: 'act-btn small' }, h('i', { html: ICON(icon) }), h('span', { text: label }));
      tiles.append(b);
      b.focus({ preventScroll: true });
      tts.speak(label, 'sys');
      await waitClick(b);
      if (stopped()) { f.close(); return { ok: false, aborted: true, mistakes }; }
      if (icon === 'towel') use(towelImg);
      audio.sfx(sfx);
      // 헹구기: 물을 털고 · 닦기: 손을 모으고 가만히
      yeon?.play(icon === 'rinse' ? ['wash_3'] : 'idle');
      if (icon === 'rinse') pop(['droplet_left_0', 'droplet_left_1', 'droplet_right_0', 'droplet_right_1'], 4);
      b.remove();
      await sleep(dur(500));
    }
    countEl.textContent = '반짝반짝, 깨끗해요!';
    center.classList.add('clean');
    yeon?.play('happy');
    pop(['sparkle_big_0', 'sparkle_big_1'], 4);
    audio.sfx('great');
    await sleep(dur(1100));
  }
  f.close();
  await sleep(dur(150));
  return result;
}

export async function handwash(opts = {}) {
  const t0 = performance.now();
  const gen = abortGeneration();
  const stopped = () => abortGeneration() !== gen;
  let attempts = 0;
  let mistakes = 0;
  for (;;) {
    attempts += 1;
    const r = await round(opts.mentor || 'dohyun', Boolean(opts.quit), stopped);
    mistakes += r.mistakes;
    if (r.aborted || stopped()) return { ok: false, attempts, mistakes, ms: performance.now() - t0 };
    if (r.ok) return { ok: true, attempts, mistakes, ms: performance.now() - t0 };
    // 결과 장면: 세균이 남은 손
    await dialogue.line({ kind: 'narr', text: SAY.fail });
    if (stopped()) return { ok: false, attempts, mistakes, ms: performance.now() - t0 };
    await showOops(opts.oops || OOPS);
    if (stopped()) return { ok: false, attempts, mistakes, ms: performance.now() - t0 };
    dialogue.line({ kind: 'say', who: opts.mentor || 'dohyun', face: mentorFace(opts.mentor || 'dohyun'), text: SAY.retry, noWait: true });
  }
}
