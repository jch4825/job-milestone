/**
 * 매일 매일 카페 생활: 메모 판마다 가능한 근무판(720~1,440가지)을 모두 돌려 보기
 *   node tools/daily-balance.mjs
 *  - 사건 없음%: 아차(workOops)가 하나도 없이 지나가는 계획의 비율(낮을수록 메모를 잘 읽어야 함)
 *  - 완벽%: 아차도, 작은 사건(빵·청결 부족)도 없는 계획의 비율
 *  - best: 가장 좋은 계획에도 남는 사건(OK 가 아니면 그 판은 완벽하게 풀 수 없음 → 숫자를 고침)
 *  - 한 장 더: 메모에 맞춰 한 장 더 준 자석(extra)을 두 장 다 써야 완벽한지
 *      '꼭 필요'(한 장으로는 완벽 없음) · '써도 됨'(청소처럼 다른 자석으로 대신할 수 있음) · '함정!'(두 장 쓰면 완벽 없음 → 고침)
 */
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = process.argv[2] || path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const imp = (p) => import(pathToFileURL(path.join(root, p)).href);
const { runBlock, initState, checkCond } = await imp('js/game/work/sim.js');
const { DAY_MEMOS, makeDayWith } = await imp('js/data/daily.js');
const { BLOCKS } = await imp('js/data/work/tasks.js');

const FREE = ['s1', 's2', 's3', 's4', 's5', 's7'];

// 같은 자석이 여러 장이면 같은 배치를 두 번 세지 않게(중복 없는 순열)
function* perms(arr, k) {
  if (k === 0) { yield []; return; }
  const seen = new Set();
  for (let i = 0; i < arr.length; i++) {
    if (seen.has(arr[i])) continue;
    seen.add(arr[i]);
    const rest = arr.slice(0, i).concat(arr.slice(i + 1));
    for (const p of perms(rest, k - 1)) yield [arr[i], ...p];
  }
}

function play(ep, plan) {
  // 비트를 따라가며 block · onlyIf(workSet/workOops 등) 를 흉내
  let st = null;
  const groups = {};
  let planEvents = 0;
  let soft = [];
  for (const b of ep.script) {
    if (b.ifGroup) {
      if (b.ifFirst || !(b.ifGroup in groups)) groups[b.ifGroup] = checkCond(b.if, { state: st, plan, flag: () => null });
      if (!groups[b.ifGroup]) continue;
    }
    if (b.t === 'shiftStart') st = initState(b.init);
    else if (b.t === 'block') {
      const bi = BLOCKS.findIndex((x) => x.id === b.id);
      if (plan[b.id]?.includes('break') && !(b.id === 's3' || b.id === 's4')) return null;
      st = runBlock(st, plan, bi, b.day || {}).state;
    } else if (b.t === 'workSet') {
      st = { ...st };
      for (const k of b.fill || []) st[k] = 4;
      for (const [k, v] of Object.entries(b.add || {})) st[k] = Math.max(0, (st[k] || 0) + v);
      if (b.add?.smiles) soft.push('clean');
      if (b.add?.waited === 1) soft.push('bread');
    } else if (b.t === 'workOops') { planEvents += 1; soft.push('OOPS:' + b.id); }
  }
  return { planEvents, soft: soft.length, why: soft.join(','), smiles: st.smiles - st.waited };
}

const rows = [];
for (const m of DAY_MEMOS) {
  const ep = makeDayWith(m, 1, (m.days || [2])[0]);
  const work = ep.script.find((b) => b.t === 'board').pool.filter((id) => id !== 'break');
  const breakSlots = m.breakSlots || ['s3', 's4'];
  let total = 0;
  let clean = 0;
  let perfect = 0;
  let best = { score: 99, plan: null, why: '' };
  const ex = m.extra?.[0];
  let perfectTwice = 0;
  let perfectOnce = 0;
  for (const brk of breakSlots) {
    const slots = FREE.filter((x) => x !== brk);
    for (const p of perms(work, slots.length)) {
      const plan = { [brk]: ['break'] };
      slots.forEach((s, i) => { plan[s] = [p[i]]; });
      const r = play(ep, plan);
      if (!r) continue;
      total += 1;
      if (r.planEvents === 0) clean += 1;
      if (r.planEvents === 0 && r.soft === 0) {
        perfect += 1;
        if (ex && p.filter((x) => x === ex).length >= 2) perfectTwice += 1; else perfectOnce += 1;
      }
      const score = r.planEvents * 10 + r.soft;
      if (score < best.score) best = { score, plan: Object.entries(plan).map(([k, v]) => `${k}:${v[0]}`).join(' '), why: r.why };
    }
  }
  const extraNote = !ex ? '' : perfectTwice === 0 ? '함정!' : perfectOnce === 0 ? '꼭 필요' : '써도 됨';
  rows.push({ id: m.id, '사건 없음%': Math.round((clean / total) * 100), '완벽%': Math.round((perfect / total) * 100), best: best.score ? best.why : 'OK', '한 장 더': ex ? `${ex} ${extraNote}` : '' });
}
console.table(rows);
