/**
 * 면접 대답 입력 (골라서 말하기 / 글자로 쓰기 / 말로 하기)
 *  - [다시 말해 주세요] : 점장님이 더 쉬운 말로 다시 묻습니다(실제 면접에서도 써도 되는 말)
 *  - [생각할 시간 주세요] : 점장님이 기다려 줍니다
 *  - 말로 하기는 알아들은 문장을 먼저 보여 주고, 보낼지 고칠지 고르게 합니다
 */

import { $, h, sleep } from '../core/dom.js';
import { plain, fill } from '../core/text.js';
import { ICON } from '../data/icons.js';
import { store } from '../core/store.js';
import { input } from '../core/input.js';
import { audio } from '../av/audio.js';
import { tts } from '../av/tts.js';
import { dialogue } from '../ui/dialogue.js';
import { stt, sttErrorMessage } from './stt.js';

const MODES = [
  { id: 'chips', icon: 'chips', label: '골라서 말하기' },
  { id: 'type', icon: 'keyboard', label: '글자로 쓰기' },
  { id: 'voice', icon: 'mic', label: '말로 하기' },
];

/** 같은 seed 면 같은 순서로 섞기 (면접을 다시 볼 때마다 선택지 자리가 바뀌어, 자리 대신 내용을 읽게 함) */
function shuffled(list, seed) {
  let x = [...String(seed)].reduce((a, ch) => (Math.imul(a, 31) + ch.charCodeAt(0)) >>> 0, 7) || 1;
  const rnd = () => { x = (Math.imul(x, 1664525) + 1013904223) >>> 0; return x / 4294967296; };
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** 자유 대답 분류: cats = { report: { kw: ['말씀','보고'] }, ... } */
export function classify(text, cats) {
  // "숨기지 않고", "안 숨기고" 같은 부정 표현은 지우고 판단
  const t = String(text || '')
    .replace(/\s+/g, ' ')
    .replace(/(숨기|숨겨|몰래|모른\s*척|버리)\S*\s*(않|말고|말아|안\s)/g, ' ')
    .replace(/(안|절대)\s*(숨기|숨겨|몰래|버리)\S*/g, ' ');
  for (const [cat, def] of Object.entries(cats || {})) {
    if (cat === '_' || !def.kw) continue;
    if (def.kw.some((k) => (k instanceof RegExp ? k.test(t) : t.includes(k)))) return cat;
  }
  return '_';
}

/**
 * 질문 하나에 대한 대답 받기
 * b: { q, simple, who, chips: [{label, cat}], modes?: ['chips'] (보여 줄 대답 방법), shuffle?: 섞기 seed }
 * 반환: { mode, text, cat|null, helpers: { repeat, wait } }
 */
export async function askUI(b) {
  const who = b.who || 'manager';
  const helpers = { repeat: 0, wait: 0 };
  await dialogue.line({ kind: 'say', who, face: b.face || 'normal', text: b.q, noWait: true });

  return new Promise((resolve) => {
    const modes = MODES.filter((m) => !b.modes || b.modes.includes(m.id));
    let mode = store.flag('ivMode') || 'chips';
    if (!modes.some((m) => m.id === mode)) mode = modes[0].id;
    const chips = b.shuffle ? shuffled(b.chips || [], b.shuffle) : (b.chips || []);
    const area = $('#layer-task');
    const body = h('div', { class: 'iv-body' });
    const tabs = h('div', { class: 'iv-tabs', role: 'tablist', 'aria-label': '대답하는 방법' });
    const tabBtns = modes.map((m) => {
      const tb = h('button', { class: 'iv-tab', role: 'tab', 'aria-selected': 'false', onclick: (e) => { e.stopPropagation(); audio.sfx('tap'); setMode(m.id); } },
        h('i', { html: ICON(m.icon) }), h('span', { text: m.label }));
      tabs.append(tb);
      return tb;
    });
    const repeatBtn = h('button', { class: 'btn btn-soft' }, h('i', { html: ICON('repeat') }), h('span', { text: '다시 말해 주세요' }));
    const waitBtn = h('button', { class: 'btn btn-soft' }, h('i', { html: ICON('hourglass') }), h('span', { text: '생각할 시간 주세요' }));
    const helpRow = h('div', { class: 'iv-help' }, repeatBtn, waitBtn);
    const wrap = h('div', { class: 'iv', role: 'group', 'aria-label': '면접 대답' }, modes.length > 1 ? tabs : null, body, helpRow);
    area.replaceChildren(wrap);
    document.body.classList.add('tasking');
    requestAnimationFrame(() => wrap.classList.add('is-in'));
    input.pushScope(wrap);

    let finished = false;
    const finish = (res) => {
      if (finished) return;
      finished = true;
      stt.stop();
      tts.stop();
      input.popScope(wrap);
      wrap.classList.add('is-out');
      document.body.classList.remove('tasking');
      setTimeout(() => wrap.remove(), 200);
      store.setFlag('ivMode', res.mode);
      resolve({ ...res, helpers });
    };

    // 도움 버튼: 연우가 말하고, 그 목소리가 끝난 뒤에 점장님이 대답(앞 목소리를 끊지 않게).
    // 대화가 이어지는 동안 다시 누르면 무시하고, 그사이 대답을 고르면 점장님 말은 하지 않음
    let helping = false;
    async function helperTalk(kind, face, mine, reply) {
      if (helping || finished) return;
      helping = true;
      helpers[kind] += 1;
      audio.sfx('tap');
      await Promise.all([
        dialogue.line({ kind: 'say', who: 'yeonwoo', face, text: mine, noWait: true, waitVoice: true }),
        sleep(1500), // 읽어 주기를 꺼 두었을 때도 연우 말을 읽을 시간
      ]);
      if (!finished) await sleep(400);
      if (!finished) await dialogue.line({ kind: 'say', who, face: 'front', text: reply, noWait: true });
      helping = false;
    }
    repeatBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      helperTalk('repeat', 'nervous', '죄송하지만, 다시 한번 말씀해 주시겠어요?', b.simple || b.q);
    });
    waitBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      helperTalk('wait', 'normal', '잠깐 생각할 시간을 주실 수 있나요?', '그럼요. 천천히 생각해요. 준비되면 대답해 줘요.');
    });

    function chipsView() {
      const list = h('div', { class: 'iv-chips' });
      let autoFocus = true; // 처음 자동 초점은 읽지 않음(점장님 질문 음성이 끊기지 않게)
      chips.forEach((c, i) => {
        const label = plain(fill(c.label));
        const btn = h('button', { class: 'iv-chip', 'data-cat': c.cat, 'aria-label': `${i + 1}번. ${label}` },
          h('b', { text: String(i + 1) }), h('span', { text: label }),
          h('i', { class: 'chip-say', 'aria-hidden': 'true', title: '읽어 주기', html: ICON('volume') }));
        let armed = false;
        btn.addEventListener('focus', () => {
          if (autoFocus) { autoFocus = false; return; }
          if (store.settings().readCards && store.settings().voice === 'auto') tts.speak(label, 'sys', { force: true });
        });
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          if (e.target.closest('.chip-say')) { audio.sfx('tap'); tts.speak(label, 'sys', { force: true }); return; }
          if (store.settings().selectMode === 'two' && !armed) {
            list.querySelectorAll('.iv-chip').forEach((x) => x.classList.remove('selected'));
            btn.classList.add('selected');
            armed = true;
            tts.speak(label, 'sys', { force: true });
            return;
          }
          audio.sfx('tap');
          finish({ mode: 'chips', text: label, cat: c.cat, chipIndex: i });
        });
        list.append(btn);
      });
      return list;
    }

    function typeView(prefill = '') {
      const ta = h('textarea', { class: 'iv-input', rows: '2', maxlength: '120', placeholder: '여기에 대답을 써 주세요', 'aria-label': '대답 쓰기' });
      ta.value = prefill;
      const send = h('button', { class: 'btn btn-big btn-red', disabled: !prefill }, h('i', { html: ICON('arrow_right') }), h('span', { text: '보내기' }));
      ta.addEventListener('input', () => { send.disabled = !ta.value.trim(); });
      ta.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); if (ta.value.trim()) send.click(); }
      });
      send.addEventListener('click', (e) => { e.stopPropagation(); if (ta.value.trim()) finish({ mode: 'type', text: ta.value.trim(), cat: null }); });
      setTimeout(() => ta.focus(), 50);
      return h('div', { class: 'iv-type' }, ta, send);
    }

    function voiceView() {
      const status = h('p', { class: 'iv-status', text: stt.supported() ? '아래 버튼을 누르고 말해 주세요.' : sttErrorMessage('unsupported') });
      const heard = h('p', { class: 'iv-heard' });
      const mic = h('button', { class: 'iv-mic', disabled: !stt.supported() }, h('i', { html: ICON('mic') }), h('span', { text: '누르고 말하기' }));
      const confirmRow = h('div', { class: 'iv-confirm is-hidden' });
      mic.addEventListener('click', async (e) => {
        e.stopPropagation();
        confirmRow.classList.add('is-hidden');
        mic.classList.add('on');
        status.textContent = '듣고 있어요… 말해 주세요.';
        heard.textContent = '';
        const r = await stt.listen({ onPartial: (t) => { heard.textContent = t; } });
        mic.classList.remove('on');
        if (r.error && !r.text) { status.textContent = sttErrorMessage(r.error); return; }
        heard.textContent = r.text;
        status.textContent = '이렇게 들었어요. 보낼까요?';
        const sendB = h('button', { class: 'btn btn-big btn-red' }, h('i', { html: ICON('arrow_right') }), h('span', { text: '보내기' }));
        const again = h('button', { class: 'btn btn-soft' }, h('i', { html: ICON('repeat') }), h('span', { text: '다시 말하기' }));
        const fix = h('button', { class: 'btn btn-soft' }, h('i', { html: ICON('keyboard') }), h('span', { text: '글자로 고치기' }));
        sendB.addEventListener('click', (ev) => { ev.stopPropagation(); finish({ mode: 'voice', text: r.text, cat: null }); });
        again.addEventListener('click', (ev) => { ev.stopPropagation(); mic.click(); });
        fix.addEventListener('click', (ev) => { ev.stopPropagation(); setMode('type', r.text); });
        confirmRow.replaceChildren(sendB, again, fix);
        confirmRow.classList.remove('is-hidden');
        sendB.focus({ preventScroll: true });
      });
      return h('div', { class: 'iv-voice' }, mic, status, heard, confirmRow);
    }

    function setMode(m, prefill) {
      mode = m;
      stt.stop();
      tabBtns.forEach((tb, i) => {
        const on = modes[i].id === m;
        tb.classList.toggle('on', on);
        tb.setAttribute('aria-selected', String(on));
      });
      body.replaceChildren(m === 'chips' ? chipsView() : m === 'type' ? typeView(prefill) : voiceView());
      if (m === 'chips') setTimeout(() => input.focusFirst(body), 50);
    }

    setMode(mode);
  });
}
