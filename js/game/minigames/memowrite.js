/**
 * 미니게임: 나의 첫 메모 (에필로그)
 * 연우가 새 신입 지호에게 줄 메모. 팁 6개 중 3개를 고릅니다. 정답은 없습니다.
 */

import { h, sleep, dur } from '../../core/dom.js';
import { ICON } from '../../data/icons.js';
import { audio } from '../../av/audio.js';
import { tts } from '../../av/tts.js';
import { store } from '../../core/store.js';
import { MEMO_TIPS } from '../../data/photos.js';
import { pixel } from '../../ui/pixel.js';
import { frame, waitClick, line, abortGeneration } from './frame.js';

const TIP_ICON = { ask: 'question', report: 'speech', memo: 'memo', breathe: 'breathe', help: 'hand', hands: 'tray' };

const TITLE = '나의 첫 메모';
const HOWTO = '지호 씨에게 꼭 알려 주고 싶은 것 3가지를 골라요.';

/** 읽어 주는 문장 목록 (음성 파일 미리 만들기용) */
export function memowriteLines() {
  return [...line.intro(TITLE, HOWTO), ...Object.values(MEMO_TIPS).map(line.sys)];
}

export async function memowrite() {
  const t0 = performance.now();
  const gen = abortGeneration();
  const stopped = () => abortGeneration() !== gen;
  await pixel.ready();
  const f = frame({ title: TITLE, instruction: HOWTO, icon: 'memo', cls: 'mg-memo' });
  const picked = [];
  const preview = h('div', { class: 'mw-postit' });
  const attach = h('button', { class: 'btn btn-big btn-red', disabled: true }, h('i', { html: ICON('memo') }), h('span', { text: '메모 붙이기' }));
  const renderPreview = () => {
    preview.replaceChildren(h('b', { text: '지호 씨에게' }),
      ...[0, 1, 2].map((i) => h('span', { class: picked[i] ? '' : 'empty', text: picked[i] ? `${i + 1}. ${MEMO_TIPS[picked[i]]}` : `${i + 1}. …` })),
      h('em', { text: '- 연우' }));
    attach.disabled = picked.length !== 3;
  };
  const tips = Object.entries(MEMO_TIPS).map(([id, text]) => {
    const b = h('button', { class: 'mw-tip', 'data-id': id, 'aria-pressed': 'false' }, h('i', { html: ICON(TIP_ICON[id]) }), h('span', { text }));
    b.addEventListener('click', (e) => {
      e.stopPropagation();
      const i = picked.indexOf(id);
      if (i >= 0) picked.splice(i, 1);
      else if (picked.length < 3) picked.push(id);
      else { audio.sfx('hint'); return; }
      b.classList.toggle('on', picked.includes(id));
      b.setAttribute('aria-pressed', String(picked.includes(id)));
      audio.sfx('tap');
      tts.speak(text, 'sys', { force: true });
      renderPreview();
    });
    return b;
  });
  const yeon = pixel.sprite('yeonwoo', 'memo', { scale: 3, cls: 'mw-pal' });
  const side = h('div', { class: 'mw-side' }, preview, attach, yeon?.el);
  f.body.append(h('div', { class: 'mw-tips' }, ...tips), side);
  renderPreview();
  tips[0].focus({ preventScroll: true });
  await waitClick(attach);
  if (stopped()) { f.close(); return { ok: false, attempts: 1, mistakes: 0, ms: performance.now() - t0, tips: [] }; }
  store.setFlag('memoTips', picked.slice());
  audio.sfx('page');
  preview.classList.add('stick');
  yeon?.play('happy');
  pixel.burst(side, ['heart_0', 'heart_1'], { x: side.clientWidth / 2, y: side.clientHeight * 0.3, count: 3, spread: 120 });
  await sleep(dur(800));
  f.close();
  await sleep(dur(150));
  return { ok: true, attempts: 1, mistakes: 0, ms: performance.now() - t0, tips: picked.slice() };
}
