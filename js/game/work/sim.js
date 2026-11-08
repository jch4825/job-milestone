/**
 * v3 자립 근무: 하루 상태 계산 (DOM 없음 → 검사기·자동 테스트가 node 로 씀)
 * 상태는 플래그 'work'(근무 상태)와 'workPlan'(근무판)에 저장되어 되감기 때 함께 돌아갑니다.
 */

import { TASKS, BLOCKS, MAX } from '../../data/work/tasks.js';

const clamp = (v) => Math.max(0, Math.min(MAX, v));

export function initState(init = {}) {
  return {
    block: -1, cups: 2, ice: 1, bread: 3, clean: 3, energy: MAX,
    guests: 0, smiles: 0, waited: 0, events: [], mistakes: 0, rewinds: 0,
    ...init,
  };
}

/** 근무판: { s1: ['restock_cups'], s3: ['break'], … } (빈칸에 붙인 자석만) */
export function tasksOf(plan, block) {
  return [...block.fixed, ...(plan?.[block.id] || [])];
}

export function planHas(plan, id) {
  return Object.values(plan || {}).some((list) => list.includes(id));
}

export function breakSlot(plan) {
  return Object.keys(plan || {}).find((k) => plan[k].includes('break')) || null;
}

/** 근무판 확정 전 점검: 꼭 지킬 것만(쉬는 시간). 빈칸은 따로 알려 줌 */
export function checkPlan(plan, pool) {
  const empty = BLOCKS.reduce((n, b) => n + Math.max(0, b.free - (plan?.[b.id]?.length || 0)), 0);
  const brk = breakSlot(plan);
  return {
    breakMissing: pool.includes('break') && !brk,
    breakWrong: Boolean(brk && !BLOCKS.find((b) => b.id === brk)?.breakOk),
    empty,
  };
}

/**
 * 시간 칸 하나 진행: 자석 효과 → 손님이 씀 → 기운
 * 돌려주는 값: { state, steps } (steps 는 픽셀 매장 연출 순서)
 */
export function runBlock(state, plan, blockIndex, day = {}) {
  const b = BLOCKS[blockIndex];
  const s = { ...state, block: blockIndex, events: [...(state.events || [])] };
  const steps = [];
  let rest = false;
  for (const id of tasksOf(plan, b)) {
    const t = TASKS[id];
    if (!t) continue;
    const before = { ...s };
    for (const k of t.fill || []) s[k] = MAX;
    for (const [k, v] of Object.entries(t.add || {})) s[k] = clamp(s[k] + v);
    if (t.rest) rest = true;
    steps.push({ type: 'task', id, delta: delta(before, s) });
  }
  const busy = day.busy || 1;
  const guests = Math.round((b.guests || 0) * busy);
  let short = 0;
  const before = { ...s };
  // day.more: 그날 그 칸에서 더 줄어드는 것(매일 매일 카페 생활의 메모 판: 더운 날 얼음 등)
  const use = { ...(b.use || {}) };
  const more = day.more || {};
  for (const k of Object.keys(more)) if (!(k in use)) use[k] = 0;
  for (const [k, v] of Object.entries(use)) {
    const left = s[k] - Math.round(v * busy) - (more[k] || 0);
    if (left < 0) short = Math.max(short, -left);
    s[k] = Math.max(0, left);
  }
  s.guests += guests;
  s.smiles += Math.max(0, guests - short);
  if (!rest) s.energy = clamp(s.energy - (b.tire || 0));
  steps.push({ type: 'guests', n: guests, short, delta: delta(before, s) });
  return { state: s, steps };
}

function delta(a, b) {
  const d = {};
  for (const k of ['cups', 'ice', 'bread', 'clean', 'energy']) if (b[k] !== a[k]) d[k] = b[k] - a[k];
  return d;
}

/**
 * 비트의 조건 `if` (모두 참이어야 실행, 배열이면 하나라도)
 *  { cups: '<2' } 상태 비교(< <= > >= == !=) · { planned: 'check_ice' } · { unplanned: 'x' }
 *  { breakAt: 's3' } · { flag: '이름' } · { notFlag: '이름' }
 */
export const COND_KEYS = ['cups', 'ice', 'bread', 'clean', 'energy', 'guests', 'smiles', 'waited', 'mistakes', 'planned', 'unplanned', 'breakAt', 'flag', 'notFlag'];

export function checkCond(cond, ctx) {
  if (Array.isArray(cond)) return cond.some((c) => checkCond(c, ctx));
  for (const [k, v] of Object.entries(cond || {})) {
    if (k === 'planned') { if (!planHas(ctx.plan, v)) return false; continue; }
    if (k === 'unplanned') { if (planHas(ctx.plan, v)) return false; continue; }
    if (k === 'breakAt') { if (breakSlot(ctx.plan) !== v) return false; continue; }
    if (k === 'flag' || k === 'notFlag') {
      // 'payPlan' 이면 값이 있는지, 'payPlan=gift' 이면 그 값인지
      const [name, want] = String(v).split('=');
      const x = ctx.flag(name);
      const hit = want === undefined ? Boolean(x) : String(x ?? '') === want;
      if (k === 'flag' ? !hit : hit) return false;
      continue;
    }
    const m = String(v).match(/^(<=|>=|==|!=|<|>)(-?\d+)$/);
    if (!m) return false;
    const x = Number(ctx.state?.[k] ?? 0);
    const n = Number(m[2]);
    const ok = { '<': x < n, '<=': x <= n, '>': x > n, '>=': x >= n, '==': x === n, '!=': x !== n }[m[1]];
    if (!ok) return false;
  }
  return true;
}

/** 조건 문법 검사(검사기용): 틀린 곳의 설명 목록 */
export function condErrors(cond) {
  const errs = [];
  const one = (c) => {
    if (!c || typeof c !== 'object') { errs.push('조건은 객체여야 함'); return; }
    for (const [k, v] of Object.entries(c)) {
      if (!COND_KEYS.includes(k)) errs.push(`조건 이름 없음: ${k}`);
      else if (['planned', 'unplanned'].includes(k) && !TASKS[v]) errs.push(`자석 없음: ${v}`);
      else if (k === 'breakAt' && !BLOCKS.some((b) => b.id === v)) errs.push(`시간 칸 없음: ${v}`);
      else if (!['planned', 'unplanned', 'breakAt', 'flag', 'notFlag'].includes(k) && !/^(<=|>=|==|!=|<|>)-?\d+$/.test(String(v))) errs.push(`비교 문법: ${k}: ${v}`);
    }
  };
  if (Array.isArray(cond)) cond.forEach(one); else one(cond);
  return errs;
}

/** 퇴근 정산: 계획 별(계획 때문에 생긴 사건 수) · 수습 별(미니게임 실수·되감기) */
export function payout(state, wage) {
  const planIssues = (state.events || []).filter((e) => e.plan).length;
  const plan = planIssues === 0 ? 3 : planIssues === 1 ? 2 : 1;
  const slips = (state.mistakes || 0) + (state.rewinds || 0);
  const handle = slips === 0 ? 3 : slips <= 2 ? 2 : 1;
  const hours = 4;
  const waited = state.waited || 0;
  return { plan, handle, smiles: Math.max(0, state.smiles - waited), guests: state.guests, waited, hours, hourly: wage, money: hours * wage };
}
