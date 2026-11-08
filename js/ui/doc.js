/**
 * 문서 패널: 근로계약서 / 급여명세서
 * 화면 왼쪽에 종이로 펼쳐 두고(오픈북), 조항 강조·함께 읽기·도장 찍기를 합니다.
 */

import { $, h, sleep, dur, isReducedMotion } from '../core/dom.js';
import { CONFIG, currentWage } from '../config.js';
import { won, fill } from '../core/text.js';
import { ICON } from '../data/icons.js';
import { tts } from '../av/tts.js';
import { audio } from '../av/audio.js';
import { input } from '../core/input.js';

let panel = null;
let rows = [];
let currentKind = null;

function contractRows() {
  const w = currentWage();
  const J = CONFIG.JOB;
  return {
    title: '표준 근로계약서',
    sub: '(단시간 근로자용)',
    rows: [
      { icon: 'home', k: '일하는 곳', v: J.place },
      { icon: 'apron', k: '하는 일', v: J.duties },
      { icon: 'calendar', k: '일하는 날', v: `${J.days} (주 ${J.hoursPerWeek}시간)` },
      { icon: 'clock', k: '일하는 시간', v: `${J.start} ~ ${J.end} (하루 ${J.hoursPerDay}시간 일함)` },
      { icon: 'tea', k: '쉬는 시간', v: `${J.breakTime} (${J.breakMinutes}분)` },
      { icon: 'coin', k: '시급', v: `${won(w.hourly)} (${w.year}년 최저임금 이상)` },
      { icon: 'piggy', k: '월급날', v: `${J.payday}, 내 통장으로` },
      { icon: 'star', k: '주휴수당', v: '일주일에 15시간 넘게 일하면 하루치를 더 받아요' },
      { icon: 'heart', k: '함께 한 약속', v: '모르면 묻기 · 실수하면 말하기 · 힘들면 말하기' },
    ],
    sign: '정연우',
  };
}

function payslipRows() {
  const w = currentWage();
  const P = CONFIG.PAYSLIP;
  const workH = P.workDays * CONFIG.JOB.hoursPerDay;
  const base = workH * w.hourly;
  const weekly = P.weeklyHolidayHours * w.hourly;
  const gross = base + weekly;
  const deduct = Math.round((gross * P.exampleDeductionRate) / 10) * 10;
  const net = gross - deduct;
  return {
    title: '급여명세서',
    sub: '카페 마일스톤 · 정연우 · (예시)',
    rows: [
      { icon: 'calendar', k: '일한 날', v: `${P.workDays}일` },
      { icon: 'clock', k: '일한 시간', v: `${workH}시간 × ${won(w.hourly)}` },
      { icon: 'coin', k: '기본급', v: won(base) },
      { icon: 'star', k: '주휴수당', v: `${P.weeklyHolidayHours}시간분 ${won(weekly)}` },
      { icon: 'heart', k: '공제 (보험료 등)', v: `- ${won(deduct)} (예시)` },
      { icon: 'piggy', k: '받는 돈', v: won(net), strong: true },
    ],
    numbers: { workH, base, weekly, gross, deduct, net },
  };
}

export const DOCS = { contract: contractRows, payslip: payslipRows };

export const docPanel = {
  open(kind, { silent = false } = {}) {
    docPanel.close(true);
    currentKind = kind;
    const d = DOCS[kind]();
    rows = d.rows.map((r, i) => h('li', { 'data-n': i + 1, class: r.strong ? 'strong' : '' },
      h('b', { class: 'doc-n', text: String(i + 1) }),
      h('i', { class: 'doc-ico', html: ICON(r.icon) }),
      h('span', { class: 'doc-k', text: r.k }),
      h('span', { class: 'doc-v', text: fill(r.v) }),
      h('button', {
        class: 'doc-say', 'aria-label': `${r.k} 읽어 주기`, html: ICON('volume'),
        onclick: (e) => { e.stopPropagation(); tts.speak(`${r.k}. ${fill(r.v)}`, 'sys', { force: true }); },
      })));
    panel = h('section', { class: `docp docp-${kind}`, 'aria-label': d.title },
      h('h2', { class: 'doc-title', text: d.title }),
      h('p', { class: 'doc-sub', text: d.sub }),
      h('ol', { class: 'doc-list' }, ...rows),
      d.sign ? h('div', { class: 'doc-sign' }, h('span', { text: '일하는 사람' }), h('b', { text: d.sign }), h('div', { class: 'doc-seal-box' })) : null);
    $('#layer-memo').append(panel);
    document.body.classList.add('doc-open');
    const el = panel; // 다음 프레임 전에 닫혀도(빠르게 넘길 때) 오류가 나지 않게
    requestAnimationFrame(() => el.classList.add('is-in'));
    if (!silent) audio.sfx('page');
  },

  kind() { return currentKind; },

  highlight(n) {
    rows.forEach((li) => li.classList.toggle('hi', Number(li.dataset.n) === n));
    rows[n - 1]?.scrollIntoView({ block: 'nearest' });
  },
  clearHighlight() { rows.forEach((li) => li.classList.remove('hi')); },

  /** 한 줄씩 함께 읽기 */
  async readThrough() {
    if (!panel) return;
    const nextBtn = h('button', { class: 'btn btn-big btn-red doc-next' }, h('i', { html: ICON('arrow_right') }), h('span', { text: '다음 줄' }));
    const scope = h('div', { class: 'doc-next-wrap' }, nextBtn);
    $('#layer-memo').append(scope);
    input.pushScope(scope);
    for (let i = 0; i < rows.length; i++) {
      docPanel.highlight(i + 1);
      const k = rows[i].querySelector('.doc-k').textContent;
      const v = rows[i].querySelector('.doc-v').textContent;
      nextBtn.querySelector('span').textContent = i === rows.length - 1 ? '다 읽었어요' : '다음 줄';
      nextBtn.focus({ preventScroll: true });
      tts.speak(`${i + 1}번. ${k}. ${v}`, 'sys');
      await new Promise((r) => nextBtn.addEventListener('click', (e) => { e.stopPropagation(); r(); }, { once: true }));
      tts.stop();
      audio.sfx('next');
    }
    input.popScope(scope);
    scope.remove();
    docPanel.clearHighlight();
  },

  /** 서명란에 도장 */
  async seal(label = '도장 찍기') {
    if (!panel) return;
    const box = panel.querySelector('.doc-seal-box');
    const btn = h('button', { class: 'act-btn small' }, h('i', { html: ICON('stamp') }), h('span', { text: label }));
    box.append(btn);
    input.pushScope(panel);
    btn.focus({ preventScroll: true });
    // 도장 칸은 문서 맨 아래: 버튼이 보이게 저절로 내려 줌(4장 '고친 곳에 도장 찍기'처럼 위쪽 줄을 보던 중일 때)
    const p = panel;
    setTimeout(() => p.scrollTo({ top: p.scrollHeight, behavior: isReducedMotion() ? 'auto' : 'smooth' }), 30);
    tts.speak(label, 'sys');
    await new Promise((r) => btn.addEventListener('click', (e) => { e.stopPropagation(); r(); }, { once: true }));
    input.popScope(panel);
    btn.remove();
    audio.sfx('seal');
    box.append(h('span', { class: 'doc-seal', text: '정연우' }));
    await sleep(dur(700));
  },

  close(instant = false) {
    document.body.classList.remove('doc-open');
    currentKind = null;
    if (!panel) return;
    const p = panel;
    panel = null;
    rows = [];
    input.popScope(p);
    if (instant) { p.remove(); return; }
    p.classList.remove('is-in');
    setTimeout(() => p.remove(), dur(250));
  },

  isOpen() { return Boolean(panel); },
};
