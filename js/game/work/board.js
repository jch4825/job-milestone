/**
 * 근무판 (스케줄 보드): 시간 칸에 업무 자석을 붙여 오늘 하루를 계획합니다. (docs/v3_design.md 5장)
 *  - 드래그 없음: 빈칸 고르기 → 자석 고르기(어느 쪽을 먼저 해도 됨). 붙인 자석을 다시 누르면 뗌
 *  - 확정할 때 알려 주는 것은 꼭 지킬 것(쉬는 시간)과 빈칸뿐. 나머지는 근무 중 결과로 배웁니다(시행착오)
 *  - 오른쪽 노란 메모(보이는 규칙)는 가리지 않습니다
 */

import { $, h, sleep, dur } from '../../core/dom.js';
import { ICON } from '../../data/icons.js';
import { tts } from '../../av/tts.js';
import { audio } from '../../av/audio.js';
import { input } from '../../core/input.js';
import { portraitHTML } from '../../data/characters.js';
import { TASKS, KINDS, BLOCKS } from '../../data/work/tasks.js';
import { checkPlan } from './sim.js';

/** 근무판이 읽어 주는 문장 (tools/export-lines.mjs 가 음성 파일로 미리 만듦) */
export const BOARD_SAY = {
  intro: '빈칸을 고르고, 아래에서 자석을 골라 붙여요. 붙인 자석을 다시 누르면 떼요.',
  first: '좋아요. 이렇게 하나씩 붙여요.',
  breakOnly: '쉬는 시간은 10시 30분이나 11시 칸에 넣기로 했어요.',
  breakMemo: '오늘 쉬는 시간은 메모에 적힌 시간이에요. 메모를 다시 볼까요?',
  breakMissing: '쉬는 시간 30분을 꼭 넣어요. 쉬는 것도 일하는 사람의 권리예요.',
  empty: '빈칸이 남았어요. 빈칸에는 아무 일도 하지 않아요. 그래도 이대로 할까요?',
  help: '오른쪽 노란 메모를 같이 볼까요? 바쁜 시간 전에 무엇이 필요할까요?',
  ok: '좋아요. 오늘은 이대로 해 봐요.',
};

export function boardLines(pool = []) {
  return [
    ...Object.values(BOARD_SAY).map((text) => ({ t: 'say', who: 'manager', text })),
    ...[...new Set([...pool, ...BLOCKS.flatMap((b) => b.fixed)])].map((id) => ({ t: 'sys', text: TASKS[id].label })),
  ];
}

/** 자석: pinned(핀, 매일 하는 일) · inSlot(빈칸에 붙인 것, 버튼 안에 들어가므로 span) · 그 밖은 고를 수 있는 버튼 */
function magnet(id, { pinned = false, inSlot = false } = {}) {
  const t = TASKS[id];
  const k = KINDS[t.kind];
  const tag = pinned || inSlot ? 'span' : 'button';
  return h(tag, {
    class: `wk-mag ${pinned ? 'fixed' : ''} ${inSlot ? 'placed' : ''}`,
    'data-task': id,
    style: { '--k': k.color },
    'aria-label': pinned ? `${t.label}, 매일 하는 일` : t.label,
  },
  h('i', { class: 'wk-mag-ico', html: ICON(t.icon) }),
  h('span', { class: 'wk-mag-label', text: t.label }),
  pinned ? h('i', { class: 'wk-pin', html: ICON('lock'), 'aria-hidden': 'true' }) : null,
  !pinned && !inSlot ? h('span', { class: 'card-say wk-say', 'aria-hidden': 'true', title: '읽어 주기', html: ICON('volume') }) : null);
}

/**
 * opts: { title, pool: [자석 id], draft: 지난 계획(되감은 뒤 이어서 고치기), mentor: 'manager', tutorial }
 * 돌려주는 값: 근무판 { s1: ['…'], … }
 */
export function board({ title = '오늘의 근무판', pool = [], draft = null, mentor = 'manager', tutorial = false, breakSlots = null } = {}) {
  // 쉬는 시간을 넣을 수 있는 칸: 기본은 10:30·11:00 칸, 메모가 정하면(매일 매일 카페 생활) 그 칸만
  const canBreak = (b) => Boolean(b.breakOk) && (!breakSlots || breakSlots.includes(b.id));
  return new Promise((resolve) => {
    const placed = {};
    for (const b of BLOCKS) placed[b.id] = (draft?.[b.id] || []).filter((id) => pool.includes(id)).slice(0, b.free);
    let sel = null; // { block, pos } 고른 빈칸
    let pick = null; // 고른 자석 id
    let warnedEmpty = false;
    let firstDone = Boolean(draft);

    const bubbleText = h('p', { class: 'wk-bubble-text' });
    const say = (text, speak = true) => {
      bubbleText.textContent = text;
      bubbleText.parentElement?.classList.remove('pop');
      void bubbleText.offsetWidth;
      bubbleText.parentElement?.classList.add('pop');
      if (speak) tts.speak(text, mentor);
    };

    const rowsEl = h('div', { class: 'wk-rows' });
    const poolEl = h('div', { class: 'wk-pool', role: 'group', 'aria-label': '붙일 자석' });
    const helpBtn = h('button', { class: 'btn btn-soft' }, h('i', { html: ICON('hand') }), h('span', { text: '도움' }));
    const okBtn = h('button', { class: 'btn btn-big btn-red wk-ok' }, h('i', { html: ICON('check') }), h('span', { text: '이대로 일할게요' }));
    const el = h('section', { class: 'wk-board', role: 'group', 'aria-label': title },
      h('div', { class: 'wk-wb' },
        h('header', { class: 'wk-wb-head' }, h('i', { html: ICON('calendar') }), h('h2', { text: title }), h('span', { class: 'wk-wb-hint', text: '빈칸 → 자석' })),
        rowsEl),
      h('div', { class: 'wk-under' },
        poolEl,
        h('div', { class: 'wk-talk' },
          h('div', { class: 'wk-bubble' }, h('span', { class: 'wk-face', html: portraitHTML(mentor, 'normal') }), bubbleText),
          h('div', { class: 'wk-btns' }, helpBtn, okBtn))));

    function render() {
      rowsEl.replaceChildren(...BLOCKS.map((b) => {
        const slots = [];
        for (let p = 0; p < b.free; p++) {
          const id = placed[b.id][p];
          const on = sel && sel.block === b.id && sel.pos === p;
          const slot = h('button', {
            class: `wk-slot ${id ? 'filled' : ''} ${on ? 'sel' : ''} ${canBreak(b) ? 'can-break' : ''}`,
            'data-block': b.id, 'data-pos': String(p),
            'aria-label': id ? `${b.time} 칸, ${TASKS[id].label}. 누르면 떼요` : `${b.time} 칸, 빈칸${canBreak(b) ? ', 쉬는 시간을 넣을 수 있어요' : ''}`,
          }, id ? magnet(id, { inSlot: true }) : h('span', { class: 'wk-empty' }, h('i', { html: ICON(canBreak(b) ? 'tea' : 'check') }), h('span', { text: canBreak(b) ? '빈칸 · 쉬는 시간 가능' : '빈칸' })));
          slots.push(slot);
        }
        return h('div', { class: `wk-row ${b.peak ? 'peak' : ''}` },
          h('div', { class: 'wk-time' }, h('b', { text: b.time }), h('span', { text: b.name })),
          h('div', { class: 'wk-cells' }, ...b.fixed.map((id) => magnet(id, { pinned: true })), ...slots));
      }));
      // 같은 자석이 여러 장일 수 있음(매일 매일 카페 생활: 메모에 맞춰 한 장 더) → 붙인 장 수만큼 빼고 남은 것
      const left = [...pool];
      for (const id of Object.values(placed).flat()) { const k = left.indexOf(id); if (k >= 0) left.splice(k, 1); }
      poolEl.replaceChildren(...left.map((id) => {
        const m = magnet(id);
        if (pick === id) m.classList.add('picked');
        return m;
      }));
      if (!poolEl.children.length) poolEl.append(h('p', { class: 'wk-pool-empty', text: '자석을 모두 붙였어요.' }));
    }

    function nextEmpty() {
      for (const b of BLOCKS) for (let p = 0; p < b.free; p++) if (!placed[b.id][p]) return { block: b.id, pos: p };
      return null;
    }

    function place(slot, id) {
      const b = BLOCKS.find((x) => x.id === slot.block);
      if (TASKS[id].rest && !canBreak(b)) { audio.sfx('hint'); say(breakSlots && b.breakOk ? BOARD_SAY.breakMemo : BOARD_SAY.breakOnly); return false; }
      // 쉬는 시간은 하나만: 다른 칸에 있으면 옮김
      if (TASKS[id].rest) for (const k of Object.keys(placed)) placed[k] = placed[k].filter((x) => x !== id);
      const list = placed[slot.block];
      list[slot.pos] = id;
      placed[slot.block] = list.filter(Boolean);
      audio.sfx('stamp');
      tts.speak(TASKS[id].label, 'sys');
      if (tutorial && !firstDone) { firstDone = true; setTimeout(() => say(BOARD_SAY.first), 700); }
      pick = null;
      sel = nextEmpty();
      warnedEmpty = false;
      okBtn.querySelector('span').textContent = '이대로 일할게요';
      return true;
    }

    el.addEventListener('click', (e) => {
      const sayIco = e.target.closest('.wk-say');
      const mag = e.target.closest('.wk-pool .wk-mag');
      const slot = e.target.closest('.wk-slot');
      if (sayIco && mag) { e.stopPropagation(); audio.sfx('tap'); tts.speak(TASKS[mag.dataset.task].label, 'sys', { force: true }); return; }
      if (mag) {
        e.stopPropagation();
        const id = mag.dataset.task;
        if (sel) { if (place(sel, id)) render(); focusSel(); return; }
        pick = pick === id ? null : id;
        audio.sfx('focus');
        render();
        if (pick) { sel = nextEmpty(); render(); focusSel(); }
        return;
      }
      if (slot) {
        e.stopPropagation();
        const s = { block: slot.dataset.block, pos: Number(slot.dataset.pos) };
        const cur = placed[s.block][s.pos];
        if (pick) { if (place(s, pick)) render(); focusSel(); return; }
        if (cur) { // 떼기
          placed[s.block] = placed[s.block].filter((x, i) => i !== s.pos);
          audio.sfx('close');
          sel = { block: s.block, pos: Math.min(s.pos, placed[s.block].length) };
          render();
          focusPool();
          return;
        }
        sel = s;
        audio.sfx('focus');
        render();
        focusPool();
      }
    });

    function focusSel() {
      const t = sel && el.querySelector(`.wk-slot[data-block="${sel.block}"][data-pos="${sel.pos}"]`);
      (t || okBtn).focus({ preventScroll: true });
    }
    function focusPool() {
      const t = poolEl.querySelector('.wk-mag');
      (t || okBtn).focus({ preventScroll: true });
    }

    helpBtn.addEventListener('click', (e) => { e.stopPropagation(); audio.sfx('hint'); say(BOARD_SAY.help); });
    okBtn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const plan = Object.fromEntries(Object.entries(placed).filter(([, l]) => l.length));
      const r = checkPlan(plan, pool);
      if (r.breakMissing) { audio.sfx('hint'); say(BOARD_SAY.breakMissing); return; }
      if (r.empty && !warnedEmpty) {
        warnedEmpty = true;
        audio.sfx('hint');
        say(BOARD_SAY.empty);
        okBtn.querySelector('span').textContent = '그래도 이대로 할게요';
        return;
      }
      audio.sfx('great');
      say(BOARD_SAY.ok);
      el.classList.add('done');
      await sleep(dur(900));
      tts.stop();
      input.popScope(el);
      el.classList.add('is-out');
      setTimeout(() => el.remove(), dur(240));
      document.body.classList.remove('tasking');
      resolve(plan);
    });

    $('#layer-task').replaceChildren(el);
    document.body.classList.add('tasking');
    input.pushScope(el);
    sel = nextEmpty();
    render();
    requestAnimationFrame(() => el.classList.add('is-in'));
    say(BOARD_SAY.intro, true);
    setTimeout(focusSel, 80);
  });
}
