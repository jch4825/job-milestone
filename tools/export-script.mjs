/**
 * 읽기용 대본 내보내기
 *   node tools/export-script.mjs  →  scenarios/README.md, scenarios/{id}.md
 * 원본은 js/data/episodes/*.js 입니다. 이 파일들은 검수·인쇄·수업 자료용으로 자동 생성됩니다(직접 고치지 마세요).
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const imp = (p) => import(pathToFileURL(path.join(root, p)).href);
const { CHARS } = await imp('js/data/characters.js');
const { SKILLS, STANDARDS } = await imp('js/data/skills.js');
const { plain, fill } = await imp('js/core/text.js');

const EP_FILES = ['prologue', 'ch1', 'd1', 'd2', 'd3', 'd4', 'd5', 'ch3', 'epilogue', 'ch4_1', 'ending'];
const { TASKS, BLOCK_BY_ID } = await imp('js/data/work/tasks.js');
const BG_NAME = { home: '연우의 방', living: '연우네 거실', bus_stop: '버스 정류장', cafe_front: '카페 마일스톤 앞', counter: '홀·카운터', office: '점장실', staff: '직원 공간', kitchen: '주방', tea: '휴게 공간', school: '교실(회상)' };
const MINI_NAME = { handwash: '손 씻기 6단계', cups: '컵·빨대 채우기', order: '주문서 확인', closing: '퇴근 전 정리', memowrite: '나의 첫 메모', spill: '쏟은 음료 수습(턴 방식)', ice: '얼음 채우기' };
const METER_NAME = { cups: '컵', ice: '얼음', bread: '빵', clean: '청결', energy: '기운', smiles: '웃은 손님', waited: '기다린 손님' };
/** 조건 { cups: '<2' } → '컵 < 2' */
const flagText = (v, not) => { const [f, val] = String(v).split('='); return val === undefined ? `선택 기억 \`${f}\` ${not ? '없음' : '있음'}` : `선택 기억 \`${f}\` ${not ? '≠' : '='} ${val}`; };
const condText = (c) => (Array.isArray(c) ? c.map(condText).join(' 또는 ') : Object.entries(c || {}).map(([k, v]) => (k === 'planned' ? `근무판에 '${TASKS[v]?.label}' 있음` : k === 'unplanned' ? `근무판에 '${TASKS[v]?.label}' 없음` : k === 'flag' ? flagText(v) : k === 'notFlag' ? flagText(v, true) : `${METER_NAME[k] || k} ${v}`)).join(', '));
/** 선택 기억(플래그)만 보는 조건인지: 머리말을 '근무판 결과' 대신 '선택에 따라'로 */
const onlyFlags = (c) => (Array.isArray(c) ? c.every(onlyFlags) : Object.keys(c || {}).every((k) => k === 'flag' || k === 'notFlag'));
const name = (who) => CHARS[who]?.name || who;
const t = (s) => plain(fill(s || ''));
const skill = (k) => (k && SKILLS[k] ? ` · 스킬: ${SKILLS[k].name}` : '');
const { CGS } = await imp('js/data/cg.js');
await imp('js/data/episodes/index.js'); // 판단 카드의 화면 순서(decide.order)를 정함
let curSched = [];

function lines(list, depth = 0) {
  const out = [];
  const pad = '  '.repeat(depth);
  let lastIf = null;
  for (const b of list || []) {
    // 조건부 장면(onlyIf 묶음): 묶음 처음에 한 번 표시
    const group = b.ifGroup || (b.if ? JSON.stringify(b.if) : null);
    if (b.if && group !== lastIf) out.push('', `${pad}#### 🔀 ${onlyFlags(b.if) ? '선택에 따라' : '근무판 결과'}: ${condText(b.if)}일 때만`);
    lastIf = b.if ? group : null;
    switch (b.t) {
      case 'bg': out.push(`${pad}*[배경: ${BG_NAME[b.id] || b.id}${b.variant ? ` · ${b.variant}` : ''}]*`); break;
      case 'place': out.push(`${pad}**📍 ${b.time ? `${b.time} · ` : ''}${b.text}**`); break;
      case 'big': out.push(`${pad}## ${b.text}${b.sub ? ` — ${b.sub}` : ''}`); break;
      case 'say': out.push(`${pad}**${name(b.who)}**: ${t(b.text)}`); break;
      case 'narr': out.push(`${pad}${t(b.text)}`); break;
      case 'think': out.push(`${pad}**연우(속마음)**: *${t(b.text)}*`); break;
      case 'sys': out.push(`${pad}> 안내: ${t(b.text)}`); break;
      case 'guide': out.push(`${pad}> 버튼 안내(${b.key}, 처음 한 번): ${t(b.text)}`); break;
      case 'got': out.push(`${pad}> [받았어요] ${t(b.title || b.item)}`); break;
      case 'phone': out.push(`${pad}📱 **${name(b.from)}의 문자**: ${t(b.text)}`); break;
      case 'memo': out.push(`${pad}📌 **메모 「${b.title}」**: ${b.items.map(([, x], i) => `${i + 1}. ${x}`).join(' / ')}`); break;
      case 'act': out.push(`${pad}👆 *(플레이어 행동: ${t(b.label)})*`); break;
      case 'breathe': out.push(`${pad}🫧 *(숨 고르기 ${b.cycles}번${b.note ? `: ${b.note}` : ''})*`); break;
      case 'doc': out.push(`${pad}📄 *(${b.kind === 'contract' ? '근로계약서' : '급여명세서'}를 펼친다)*`); break;
      case 'docRead': out.push(`${pad}📄 *(한 줄씩 함께 읽기)*`); break;
      case 'docSeal': out.push(`${pad}🔴 *(서명란에 도장 찍기)*`); break;
      case 'photo': out.push(`${pad}📷 *(오늘의 한 장: ${b.id})*`); break;
      case 'snap': out.push(`${pad}📸 *칭찬 스냅 「${b.title}」 ${b.caption || ''}*`); break;
      case 'term': out.push(`${pad}📖 *(말 사전에 추가: ${b.id})*`); break;
      case 'check': out.push(`${pad}✅ **오늘의 일정 ${b.n}번 완료**: ${curSched[b.n - 1]?.[1] || ''}`); break;
      case 'meet': out.push(`${pad}🪪 *(크루 카드: ${CHARS[b.who]?.full || name(b.who)} · ${CHARS[b.who]?.role || ''})*`); break;
      case 'cg': out.push(`${pad}🖼 *(${b.id ? `이벤트 CG: ${CGS[b.id]?.title || b.id}` : '이벤트 CG 끝'})*`); break;
      case 'emote': out.push(`${pad}*(${name(b.who)} 머리 위에 이모트: ${b.kind})*`); break;
      case 'earplugs': out.push(`${pad}🎧 *(귀마개 ${b.on ? '끼기: 장면 속 소리가 먹먹해짐' : '빼기'})*`); break;
      case 'fx': if (b.name === 'overload') out.push(`${pad}*(${b.on ? '소리 과부하 효과 시작' : '과부하 효과 끝'})*`); break;
      case 'finish': out.push(`${pad}🏁 **${b.title}** — ${b.sub}`); break;
      case 'credits': out.push(`${pad}🎞 *(엔딩: 사진 벽에 모은 '오늘의 한 장'이 한 장씩 붙으며 제목을 읽어 줌 → 크레디트)*`); break;
      case 'letter': out.push(`${pad}💌 **연우의 마지막 메모** (${t(b.to)}): ${b.lines.map((x, i) => `${i + 1}. ${t(x)}`).join(' / ')}${b.ps ? ` — ${t(b.ps)}` : ''} — ${b.from}`); break;
      case 'branch':
        out.push(`${pad}🔀 *선택 기억 \`${b.flag}\` 에 따라:*`);
        for (const [k, l] of Object.entries(b.cases)) {
          if (!l.length) continue;
          out.push(`${pad}- **${k === '_' ? '그 밖' : k}**:`);
          out.push(...lines(l, depth + 1));
        }
        break;
      case 'choose':
        out.push('', `${pad}### 🔀 선택: ${b.title || t(b.q)} (정답 없음${b.flag ? ` · 기억: \`${b.flag}\`` : ''})`);
        if (b.q) out.push(`${pad}질문: ${t(b.q)}`);
        b.options.forEach((o, i) => {
          out.push(`${pad}${i + 1}) ${t(o.label)}`);
          if (o.then) out.push(...lines(o.then, depth + 1));
        });
        out.push('');
        break;
      case 'decide':
        out.push('', `${pad}### ⚖️ 판단: ${b.title || t(b.q)}${skill(b.skill)}`);
        if (b.q) out.push(`${pad}질문: ${t(b.q)}`);
        if (b.timer) {
          const as = b.timer.as ? b.choices.find((c) => !c.ok && c.icon === b.timer.as) : null;
          out.push(`${pad}⏱ **시간 제한 ${b.timer.sec || 15}초** · ${b.timer.label} · 시간이 다 되면: ${as ? `「${t(as.label)}」와 같은 결과` : '따로 쓴 결과 장면'} (설정 넉넉히 2배·끄기, 실패하면 1.5배, 두 번 넘으면 막대 없이)`);
          if (b.timer.fail) { out.push(`${pad}  - 시간이 다 됐을 때:`); out.push(...lines(b.timer.fail, depth + 2)); }
          if (b.timer.oops) out.push(`${pad}  - **아차! ${b.timer.oops.title}** — ${t(b.timer.oops.lesson)} → ⏪ 되감기`);
        }
        (b.order || b.choices.map((_, i) => i)).map((j) => b.choices[j]).forEach((c, i) => { // 화면에 보이는 순서
          out.push(`${pad}- ${c.ok ? '✅' : '❌'} **${i + 1}) ${t(c.label)}**`);
          if (c.ok && typeof c.praise === 'string') out.push(`${pad}  - 칭찬: ${t(c.praise)}`);
          if (c.ok && Array.isArray(c.praise)) out.push(...lines(c.praise, depth + 1));
          if (!c.ok) {
            if (c.fail) { out.push(`${pad}  - 결과 장면:`); out.push(...lines(c.fail, depth + 2)); }
            if (c.oops) out.push(`${pad}  - **아차! ${c.oops.title}** — ${t(c.oops.lesson)} → ⏪ 되감기`);
          }
        });
        out.push('');
        break;
      case 'ask':
        out.push('', `${pad}### 🎤 면접: ${b.title || t(b.q)}${skill(b.skill)}`);
        out.push(`${pad}**${name(b.who || 'manager')}**: ${t(b.q)}`, `${pad}(다시 말해 달라고 하면: ${t(b.simple || b.q)})`);
        for (const ch of b.chips) {
          const c = b.cats[ch.cat];
          out.push(`${pad}- ${c?.ok === false ? '❌' : '✅'} 「${t(ch.label)}」`);
          if (c?.reply) out.push(`${pad}  - 반응: ${[].concat(c.reply).map(t).join(' / ')}`);
          if (c?.ok === false) {
            if (c.fail) { out.push(`${pad}  - 결과 장면:`); out.push(...lines(c.fail, depth + 2)); }
            if (c.oops) out.push(`${pad}  - **아차! ${c.oops.title}** — ${t(c.oops.lesson)} ${c.fail ? '→ ⏪ 되감기' : '(점수제 면접: 끝의 돌아보기에서 보여 줌)'}`);
          }
        }
        out.push(`${pad}- (직접 쓰거나 말한 대답은 낱말로 분류하고, 로컬 LLM이 있으면 점장님 반응을 만들어요)`, '');
        break;
      case 'ivStart':
        out.push('', `${pad}### 📋 점수제 면접 시작: 알맞은 대답 ${b.pass || 3}개 이상이면 합격`, `${pad}(로컬 LLM이 없으면 '골라서 말하기'만, 점장님 반응은 대본. 틀려도 바로 되감지 않고 끝에서 셈)`);
        break;
      case 'ivEnd':
        out.push('', `${pad}### 📋 면접 결과: 합격이면 아래로 계속 · 모자라면 탈락 엔딩`);
        if (b.fail) { out.push(`${pad}- 탈락 장면:`); out.push(...lines(b.fail, depth + 1)); }
        out.push(`${pad}- 면접 돌아보기(문항별 내 대답·이렇게 말해요·이유) → ⏪ 면접 처음으로`, '');
        break;
      case 'mini':
        out.push('', `${pad}### 🎮 미니게임: ${MINI_NAME[b.name] || b.name}${skill(b.skill)}`);
        if (b.orders) out.push(`${pad}주문서: ${b.orders.map((o) => `${o.who}(${Object.entries(o.items).map(([k, n]) => `${k}×${n}`).join(', ')})`).join(' / ')}`);
        if (b.oops) out.push(`${pad}- 실패하면: **아차! ${b.oops.title}** — ${t(b.oops.lesson)}`);
        if (b.timer) out.push(`${pad}- ⏱ **손님마다 시간 제한**(${b.timer.sec ? `${b.timer.sec}초` : '18초 + 물건 하나에 3초'}) · ${b.timer.label} · 시간이 다 되면: 손님 "${t(b.timer.say || '')}" → **아차! ${b.timer.oops.title}** — ${t(b.timer.oops.lesson)}`);
        out.push('');
        break;
      /* v3 자립 근무 */
      case 'briefing': out.push(`${pad}🗓 **아침 브리핑 · ${b.day}**: ${(b.cards || []).map(([, l, v]) => `${l} ${v}`).join(' / ')}${b.note ? ` — ${b.note}` : ''}`); break;
      case 'board': out.push('', `${pad}### 🧲 근무판 짜기${b.tutorial ? ' (처음 배우기)' : ''}`, `${pad}붙일 자석: ${(b.pool || []).map((id) => TASKS[id]?.label || id).join(', ')}`, `${pad}- 확정할 때 알려 주는 것: 쉬는 시간(10:30·11:00 칸), 빈칸. 나머지는 근무 중 결과로 배움`, ''); break;
      case 'shiftStart': out.push(`${pad}🏪 *(픽셀 매장 근무 시작 · 컵 ${b.init?.cups} · 얼음 ${b.init?.ice} · 빵 ${b.init?.bread} · 청결 ${b.init?.clean} · 기운 ${b.init?.energy})*`); break;
      case 'block': { const k = BLOCK_BY_ID[b.id]; out.push(`${pad}⏱ **${k?.time} ${k?.name}** — 근무판대로 일함${k?.guests ? ` · 손님 ${k.guests}명` : ''}`); break; }
      case 'workSet': out.push(`${pad}*(근무 상태: ${[...(b.fill || []).map((x) => `${METER_NAME[x] || x} 가득`), ...Object.entries(b.add || {}).map(([x, v]) => `${METER_NAME[x] || x} ${v > 0 ? '+' : ''}${v}`)].join(', ')})*`); break;
      case 'workOops': out.push(`${pad}- **아차! ${b.title}** — ${t(b.lesson)} → [근무판으로 되감기] 또는 [이대로 계속]`); break;
      case 'shiftEnd': out.push('', `${pad}### 🧾 퇴근 정산: 계획 별 · 수습 별 · 웃으며 나간 손님 · 오늘 번 돈`, ''); break;
      default: break;
    }
  }
  return out;
}

const index = ['# 직업 마1스톤 대본 (자동 생성)', '', '> 원본: `js/data/episodes/*.js` · 생성: `npm run export` · 이 폴더의 파일은 직접 고치지 마세요.', '', '| 에피소드 | 제목 | 때 | 판단 | 아차 |', '| :--- | :--- | :--- | :--- | :--- |'];
for (const f of EP_FILES) {
  const ep = (await imp(`js/data/episodes/${f}.js`)).default;
  curSched = ep.schedule || [];
  const decides = ep.script.filter((b) => b.t === 'decide').length + ep.script.filter((b) => b.t === 'ask').length;
  const oops = JSON.stringify(ep.script).match(/"oops":\{"id"/g)?.length || 0;
  const meta = ep.ending
    ? [ // 엔딩: 마지막 에피소드를 처음 마친 뒤(결과 화면의 [엔딩 보기]) · 근무표에서 다시 보기
      `- **때**: ${ep.when}`,
      `- **나오는 때**: 마지막 에피소드를 처음 마치면 결과 화면 뒤에 · 근무표의 '엔딩' 칸에서 언제든 다시 보기`,
      `- **결과 화면 안내**: ${ep.cue}`,
      `- **엔딩 뒤 알림**: ${ep.notice.title} — ${ep.notice.body} (근무표에도 늘 보임)`,
    ]
    : [
      `- **때**: ${ep.when}`,
      `- **오늘의 목표**: ${ep.goal}`,
      `- **오늘의 일정표**: ${ep.schedule.map(([, l], i) => `${i + 1}) ${l}`).join('  ')}`,
      `- **연계 성취기준**: ${(ep.standards || []).map((c) => `${c} ${STANDARDS[c] || ''}`).join(' / ')}`,
      `- **연우의 일기**: ${ep.diary}`,
    ];
  const body = [
    `# ${ep.label} · ${ep.title}`,
    '',
    ...meta,
    '',
    '---',
    '',
    ...lines(ep.script),
  ].join('\n');
  fs.writeFileSync(path.join(root, 'scenarios', `${ep.id}.md`), `${body}\n`);
  index.push(`| [${ep.label}](${ep.id}.md) | ${ep.title} | ${ep.when} | ${decides} | ${oops} |`);
}
fs.writeFileSync(path.join(root, 'scenarios', 'README.md'), `${index.join('\n')}\n`);
console.log('대본을 scenarios/ 에 내보냈어요.');
