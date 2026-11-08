/**
 * 미니게임: 퇴근 전 정리 (체크리스트)
 * 순서는 자유. 체크리스트에 없는 일(커피 머신 청소)은 '먼저 묻기'를 배웁니다.
 */

import { h, sleep, dur } from '../../core/dom.js';
import { ICON } from '../../data/icons.js';
import { audio } from '../../av/audio.js';
import { dialogue } from '../../ui/dialogue.js';
import { pixel } from '../../ui/pixel.js';
import { frame, waitClick, shake, line, abortGeneration } from './frame.js';

const TASKS = [
  { id: 'cups', icon: 'cup', spot: '테이블 위 빈 컵', label: '빈 컵 치우기', sfx: 'clink' },
  { id: 'wipe', icon: 'cloth', spot: '끈적한 테이블', label: '테이블 닦기', sfx: 'wipe' },
  { id: 'chair', icon: 'chair', spot: '삐뚤어진 의자', label: '의자 밀어 넣기', sfx: 'tray' },
  { id: 'stock', icon: 'icecup', spot: '반쯤 빈 컵 보관대', label: '컵 보관대 채우기', sfx: 'stack' },
  { id: 'cloth', icon: 'water', spot: '더러운 행주', label: '행주 빨아서 널기', sfx: 'water' },
];
const TRAP = { id: 'machine', icon: 'coffee', spot: '커피 머신', label: '커피 머신 청소' };

const TITLE = '퇴근 전 정리';
const HOWTO = '오른쪽 체크리스트를 보고, 정리할 곳을 눌러요. 순서는 자유예요.';
const SAY = {
  trap: '커피 머신은 바리스타가 따로 청소해요. 체크리스트에 없는 일은 먼저 물어봐 줘요.',
  left: (n) => `체크리스트를 다시 볼까요? 아직 ${n}개가 남았어요.`,
};

/** 읽어 주는 문장 목록 (음성 파일 미리 만들기용) */
export function closingLines() {
  return [...line.intro(TITLE, HOWTO), line.say('dohyun', SAY.trap), ...TASKS.map((t, i) => line.say('dohyun', SAY.left(i + 1)))];
}

// 픽셀 그림 ← 아이콘 이름. 없으면 픽토그램
const PIX = { cup: ['props', 'paper_cup'], cloth: ['props', 'dishcloth'], chair: ['props', 'chair'], icecup: ['props', 'ice_cup'], water: ['effects', 'droplet_left_0'], coffee: ['props', 'americano'] };
const pic = (icon, scale) => (PIX[icon] ? pixel.icon(PIX[icon][0], PIX[icon][1], scale) : null) || h('i', { html: ICON(icon) });

export async function closing() {
  const t0 = performance.now();
  const gen = abortGeneration();
  const stopped = () => abortGeneration() !== gen;
  await pixel.ready();
  const f = frame({ title: TITLE, instruction: HOWTO, icon: 'checklist', cls: 'mg-closing' });
  const done = new Set();
  let mistakes = 0;

  const checks = TASKS.map((t) => h('li', { 'data-id': t.id }, h('span', { class: 'box' }), pic(t.icon, 3), h('span', { text: t.label })));
  const finishBtn = h('button', { class: 'btn btn-big btn-red' }, h('i', { html: ICON('check') }), h('span', { text: '다 했어요' }));
  const list = h('div', { class: 'cl-list' }, h('h3', { text: '퇴근 전 체크리스트' }), h('ol', {}, ...checks), finishBtn);
  const spots = [...TASKS, TRAP].sort(() => Math.random() - 0.5).map((t) => h('button', { class: 'cl-spot', 'data-id': t.id, 'aria-label': t.spot },
    pic(t.icon, 5), h('span', { text: t.spot })));
  const yeon = pixel.sprite('yeonwoo', 'wipe', { scale: 4, cls: 'cl-pal' });
  const scene = h('div', { class: 'cl-scene' }, h('div', { class: 'cl-spots' }, ...spots), yeon?.el);
  f.body.append(scene, list);
  spots[0].focus({ preventScroll: true });

  scene.addEventListener('click', async (e) => {
    const b = e.target.closest('.cl-spot');
    if (!b || b.disabled) return;
    e.stopPropagation();
    const id = b.dataset.id;
    if (id === TRAP.id) {
      mistakes += 1;
      shake(b);
      audio.sfx('hint');
      dialogue.line({ kind: 'say', who: 'dohyun', face: 'teach', text: SAY.trap, noWait: true });
      return;
    }
    const t = TASKS.find((x) => x.id === id);
    pixel.burst(scene, ['dust_0', 'dust_1'], { x: b.offsetLeft + b.offsetWidth / 2, y: b.offsetTop + b.offsetHeight / 2, count: 2, spread: 40 });
    done.add(id);
    b.disabled = true;
    b.classList.add('done');
    checks.find((li) => li.dataset.id === id)?.classList.add('checked');
    audio.sfx(t.sfx);
  });

  for (;;) {
    await waitClick(finishBtn);
    if (stopped()) { f.close(); return { ok: false, attempts: 1, mistakes, ms: performance.now() - t0 }; }
    if (done.size === TASKS.length) break;
    mistakes += 1;
    shake(list);
    audio.sfx('hint');
    checks.forEach((li) => li.classList.toggle('hi', !done.has(li.dataset.id)));
    await dialogue.line({ kind: 'say', who: 'dohyun', face: 'teach', text: SAY.left(TASKS.length - done.size), noWait: true });
    if (stopped()) { f.close(); return { ok: false, attempts: 1, mistakes, ms: performance.now() - t0 }; }
  }
  audio.sfx('great');
  yeon?.play('happy');
  await sleep(dur(700));
  f.close();
  await sleep(dur(150));
  return { ok: true, attempts: 1, mistakes, ms: performance.now() - t0 };
}
