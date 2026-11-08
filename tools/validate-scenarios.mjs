/**
 * 시나리오 검사기
 *   node tools/validate-scenarios.mjs
 * 인물·표정·배경·소리·아이콘·말 사전·사진·미니게임 참조, 판단 카드 구조, 아차 ID 중복,
 * 라벨/점프, 중첩 비트 규칙, 문장 길이(쉬운 글 기준)를 검사합니다.
 */

import { pathToFileURL } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..');
const imp = (p) => import(pathToFileURL(path.join(root, p)).href);

const { CHARS } = await imp('js/data/characters.js');
const { hasIcon } = await imp('js/data/icons.js');
const { findTerm } = await imp('js/data/glossary.js');
const { BG_IDS } = await imp('js/data/backgrounds.js');
const { SFX_NAMES, BGM_NAMES, AMB_NAMES } = await imp('js/av/audio.js');
const { SKILLS } = await imp('js/data/skills.js');
const { PHOTOS } = await imp('js/data/photos.js');
const { CG_IDS } = await imp('js/data/cg.js');
const { EMOTES } = await imp('js/ui/emote.js');
const { TASKS, BLOCK_BY_ID, PEAK_OOPS, HANDS } = await imp('js/data/work/tasks.js');
const { condErrors } = await imp('js/game/work/sim.js');
const { MINIGAMES, MINIGAME_SKINS, MINIGAME_OOPS } = await imp('js/game/minigames/index.js');
const { GUIDE_KEYS } = await imp('js/data/tutorial.js');
const { DAY_MEMOS, allDailyDays, DAILY_OOPS } = await imp('js/data/daily.js');

const EP_FILES = ['prologue', 'ch1', 'd1', 'd2', 'd3', 'd4', 'd5', 'ch3', 'epilogue', 'ch4_1', 'ending'];
const MINIS = Object.keys(MINIGAMES);
// 엔딩(ending.js)은 감상 장면: 판단·미니게임·근무·일정 완료를 두지 않음
const NOT_IN_ENDING = new Set(['decide', 'choose', 'ask', 'mini', 'ivStart', 'ivEnd', 'board', 'shiftStart', 'block', 'workOops', 'shiftEnd', 'schedule', 'check', 'stamp']);
const SVG_FACES = ['normal', 'smile', 'happy', 'proud', 'worried', 'nervous', 'scared', 'angry', 'surprised', 'sad', 'think'];
const MOTIONS = ['bow', 'nod', 'shake', 'jump', 'breathe'];
const KNOWN = new Set(['bg', 'bgm', 'amb', 'sfx', 'show', 'enter', 'leave', 'face', 'motion', 'camera', 'fx', 'earplugs', 'say', 'narr', 'think', 'sys', 'phone',
  'time', 'place', 'big', 'schedule', 'memo', 'memoHi', 'info', 'doc', 'docRead', 'docHi', 'docSeal', 'docClose', 'act', 'breathe', 'decide', 'choose', 'branch',
  'ask', 'mini', 'snap', 'photo', 'stamp', 'term', 'finish', 'credits', 'letter', 'label', 'jump', 'set', 'checkpoint', 'wait', 'end',
  'check', 'meet', 'cg', 'emote', 'ivStart', 'ivEnd',
  'briefing', 'board', 'shiftStart', 'block', 'workSet', 'workOops', 'shiftEnd', 'guide', 'got']);
// check(일정 완료)는 실패·칭찬 장면 안에 두지 않습니다(되감기 전 장면에서 완료로 표시되면 안 됨)
const NO_NEST = new Set(['decide', 'choose', 'ask', 'mini', 'label', 'jump', 'checkpoint', 'end', 'schedule', 'check', 'ivStart', 'ivEnd',
  'board', 'shiftStart', 'block', 'workOops', 'shiftEnd']);
const LONG = 70;

let errors = 0;
let warns = 0;
const err = (ep, msg) => { errors += 1; console.log(`  ✗ [${ep}] ${msg}`); };
const warn = (ep, msg) => { warns += 1; console.log(`  △ [${ep}] ${msg}`); };

const oopsIds = new Map();
const flagsSet = new Set(['accommodation', 'calmStyle', 'askedQuestion', 'rideChoice', 'momTalk', 'payPlan', 'giftChoice', 'overloadChoice', 'memoTips', 'ivMode']);
const flagsUsed = [];
const totals = { beats: 0, lines: 0, chars: 0, decides: 0, oops: 0 };
let curSchedule = [];
let checks = [];

function checkFace(ep, who, face) {
  if (!face) return;
  const c = CHARS[who];
  if (!c) return;
  if (c.faces) {
    if (!c.faces.includes(face) && !(c.alias && c.alias[face])) err(ep, `${who} 의 표정 '${face}' 없음`);
  } else if (!SVG_FACES.includes(face)) err(ep, `${who}(임시 초상) 표정 '${face}' 없음`);
}

function checkCastValue(ep, v) {
  if (!v) return;
  const [id, face] = String(v).split(':');
  if (!CHARS[id]) err(ep, `무대 인물 '${id}' 없음`);
  else checkFace(ep, id, face || 'normal');
}

function checkText(ep, text) {
  if (typeof text !== 'string') { err(ep, `대사 텍스트가 문자열이 아님: ${JSON.stringify(text)}`); return; }
  for (const m of text.matchAll(/\{\{([^}]+)\}\}/g)) {
    const [, id] = m[1].split('|');
    if (!findTerm((id || m[1]).trim())) err(ep, `말 사전에 없는 낱말: {{${m[1]}}}`);
  }
  const plain = text.replace(/\{\{([^}|]+)(\|[^}]+)?\}\}/g, '$1').replace(/\*\*/g, '');
  totals.chars += plain.length;
  if (plain.length > LONG) warn(ep, `긴 대사(${plain.length}자): ${plain.slice(0, 40)}…`);
}

let sharedOops = null; // 매일 매일 카페 생활: 날마다 같은 아차를 다시 씀(중복 검사 대신 같은 내용인지만)
function checkOops(ep, o, where) {
  if (!o || !o.id || !o.title || !o.lesson) { err(ep, `${where}: oops(id/title/lesson) 필요`); return; }
  if (sharedOops && oopsIds.has(o.id)) {
    const first = sharedOops.get(o.id);
    if (first && (first.title !== o.title || first.lesson !== o.lesson)) err(ep, `같은 oops id 인데 내용이 다름: ${o.id}`);
    return;
  }
  if (sharedOops) sharedOops.set(o.id, o);
  if (oopsIds.has(o.id)) err(ep, `oops id 중복: ${o.id} (이미 ${oopsIds.get(o.id)})`);
  oopsIds.set(o.id, ep);
  totals.oops += 1;
  if (o.icon && !hasIcon(o.icon)) err(ep, `oops 아이콘 없음: ${o.icon}`);
  checkText(ep, o.lesson);
}

/** 시간 제한(급한 장면): label 필수, 시간이 다 됐을 때의 결과는 as(나쁜 카드 아이콘) 또는 fail+oops */
function checkTimer(ep, b, where) {
  const tm = b.timer;
  if (!tm) return;
  if (!tm.label) err(ep, `${where}: timer.label(왜 급한지) 필요`);
  if (tm.sec !== undefined && !(Number(tm.sec) >= 5)) err(ep, `${where}: timer.sec 는 5초 이상`);
  if (b.t === 'decide') {
    if (tm.as && !(b.choices || []).some((c) => !c.ok && c.icon === tm.as)) err(ep, `${where}: timer.as '${tm.as}' 인 나쁜 카드가 없음`);
    if (!tm.as && !(tm.fail && tm.oops)) err(ep, `${where}: 시간이 다 됐을 때의 결과(timer.as 또는 timer.fail+oops) 필요`);
    if (tm.fail) walk(ep, tm.fail, { nested: true });
  } else if (tm.say) checkText(ep, tm.say);
  if (tm.oops || b.t !== 'decide') checkOops(ep, tm.oops, `${where} timer`);
}

function walk(ep, list, { nested = false, labels = new Set(), jumps = [] } = {}) {
  let iv = null; // 점수제 면접(ivStart … ivEnd) 안
  const work = { board: 0, on: false }; // v3 근무: board → shiftStart → block… → shiftEnd
  for (const b of list || []) {
    totals.beats += 1;
    if (!b || !KNOWN.has(b.t)) { err(ep, `알 수 없는 비트: ${JSON.stringify(b)}`); continue; }
    if (nested && NO_NEST.has(b.t)) err(ep, `중첩 목록 안에서 쓸 수 없는 비트: ${b.t}`);
    if (b.if) {
      for (const e of condErrors(b.if)) err(ep, `조건(if) ${e}: ${b.t}`);
      if (['label', 'jump', 'end', 'check', 'board', 'shiftStart', 'shiftEnd', 'block'].includes(b.t)) err(ep, `조건(if)을 붙일 수 없는 비트: ${b.t}`);
      if (b.if.flag || b.if.notFlag) flagsUsed.push([ep, String(b.if.flag || b.if.notFlag).split('=')[0]]);
    }
    switch (b.t) {
      case 'bg': if (!BG_IDS.includes(b.id)) err(ep, `배경 없음: ${b.id}`); break;
      case 'bgm': if (b.mood && !BGM_NAMES.includes(b.mood)) err(ep, `BGM 없음: ${b.mood}`); break;
      case 'amb': if (b.kind && !AMB_NAMES.includes(b.kind)) err(ep, `환경음 없음: ${b.kind}`); break;
      case 'sfx': if (!SFX_NAMES.includes(b.name)) err(ep, `효과음 없음: ${b.name}`); break;
      case 'show': Object.values(b.cast || {}).forEach((v) => checkCastValue(ep, v)); break;
      case 'enter': checkCastValue(ep, b.who); break;
      case 'leave': if (!CHARS[b.who]) err(ep, `인물 없음: ${b.who}`); break;
      case 'face': if (!CHARS[b.who]) err(ep, `인물 없음: ${b.who}`); else checkFace(ep, b.who, b.face); break;
      case 'motion': if (!MOTIONS.includes(b.type)) err(ep, `동작 없음: ${b.type}`); break;
      case 'say':
        totals.lines += 1;
        if (!CHARS[b.who]) err(ep, `화자 없음: ${b.who}`);
        checkFace(ep, b.who, b.face);
        checkText(ep, b.text);
        break;
      case 'narr': case 'sys': totals.lines += 1; checkText(ep, b.text); break;
      case 'letter': // 연우의 마지막 메모: 받는 사람만 {player} 가능, 읽어 줄 줄(speech)에는 이름을 넣지 않음(음성 파일)
        if (!(b.lines || []).length) err(ep, 'letter 에 줄(lines)이 없음');
        for (const t of [...(b.lines || []), b.ps].filter(Boolean)) { totals.lines += 1; checkText(ep, t); }
        if (/\{player/.test(b.speech || '')) err(ep, 'letter 의 줄·추신에는 {player} 를 쓰지 않아요(받는 사람 to 에만)');
        break;
      case 'got': // 받은 물건: 소품 그림 ID(assets/items) + 그림이 없을 때의 픽토그램
        if (!/^item_[a-z_]+$/.test(b.item || '')) err(ep, `받은 물건 ID는 item_… 이어야 해요: ${b.item}`);
        if (b.icon && !hasIcon(b.icon)) err(ep, `받은 물건 아이콘 없음: ${b.icon}`);
        break;
      case 'guide': // 버튼 알려 주기 안내(js/data/tutorial.js)
        totals.lines += 1;
        if (!GUIDE_KEYS.includes(b.key)) err(ep, `guide 종류 없음: ${b.key} (쓸 수 있는 것: ${GUIDE_KEYS.join(' ')})`);
        checkText(ep, b.text);
        break;
      case 'think': totals.lines += 1; checkFace(ep, 'yeonwoo', b.face); checkText(ep, b.text); break;
      case 'phone': totals.lines += 1; if (!CHARS[b.from]) err(ep, `문자 보낸 사람 없음: ${b.from}`); checkText(ep, b.text); break;
      case 'memo': if (!Array.isArray(b.items) || b.items.length > 3) warn(ep, `메모는 3줄 이하 권장: ${b.title}`); (b.items || []).forEach(([ic, t]) => { if (!hasIcon(ic)) err(ep, `메모 아이콘 없음: ${ic}`); checkText(ep, t); }); break;
      case 'doc': if (!['contract', 'payslip'].includes(b.kind)) err(ep, `문서 종류 없음: ${b.kind}`); break;
      case 'act': if (!hasIcon(b.icon)) err(ep, `행동 아이콘 없음: ${b.icon}`); if (b.sfx && !SFX_NAMES.includes(b.sfx)) err(ep, `효과음 없음: ${b.sfx}`); break;
      case 'snap': checkFace(ep, b.who, b.face); break;
      case 'photo': if (!PHOTOS[b.id]) err(ep, `사진 없음: ${b.id}`); break;
      case 'stamp': if (!SKILLS[b.skill]) err(ep, `스킬 없음: ${b.skill}`); break;
      case 'term': if (!findTerm(b.id)) err(ep, `말 사전 id 없음: ${b.id}`); break;
      case 'check':
        if (!Number.isInteger(b.n) || b.n < 1 || b.n > curSchedule.length) err(ep, `일정 번호가 일정표(${curSchedule.length}개) 밖: check(${b.n})`);
        checks.push(b.n);
        break;
      case 'meet': if (!CHARS[b.who]?.card) err(ep, `크루 카드가 없는 인물: meet('${b.who}')`); break;
      case 'cg': if (b.id !== null && !CG_IDS.includes(b.id)) err(ep, `이벤트 CG 없음: ${b.id} (js/data/cg.js)`); break;
      case 'emote':
        if (!CHARS[b.who]) err(ep, `인물 없음: ${b.who}`);
        if (!EMOTES.includes(b.kind)) err(ep, `이모트 없음: ${b.kind}`);
        break;
      case 'label': labels.add(b.name); break;
      case 'jump': jumps.push(b.to); break;
      case 'set': flagsSet.add(b.flag); break;
      case 'branch': flagsUsed.push([ep, b.flag]); for (const l of Object.values(b.cases || {})) walk(ep, l, { nested: true }); break;
      case 'mini':
        if (!MINIS.includes(b.name)) err(ep, `미니게임 없음: ${b.name}`);
        if (MINIGAME_SKINS[b.name] && b.skin && !MINIGAME_SKINS[b.name].includes(b.skin)) err(ep, `미니게임 ${b.name} 모양 없음: ${b.skin}`);
        if (b.skill && !SKILLS[b.skill]) err(ep, `스킬 없음: ${b.skill}`);
        if (b.oops) checkOops(ep, b.oops, `mini ${b.name}`);
        if (b.timer && b.name !== 'order') err(ep, `시간 제한은 주문서 확인(order) 미니게임에만: ${b.name}`);
        checkTimer(ep, b, `mini ${b.name}`);
        break;
      case 'choose':
        if (b.flag) flagsSet.add(b.flag);
        if (b.q) checkText(ep, b.q);
        for (const o of b.options || []) {
          if (o.icon && !hasIcon(o.icon)) err(ep, `선택 아이콘 없음: ${o.icon}`);
          checkText(ep, o.label);
          if (o.then) walk(ep, o.then, { nested: true });
          if (o.next) jumps.push(o.next);
        }
        break;
      case 'decide': {
        totals.decides += 1;
        if (b.q) checkText(ep, b.q);
        if (b.skill && !SKILLS[b.skill]) err(ep, `스킬 없음: ${b.skill}`);
        if (!b.id) warn(ep, `decide 에 id 권장: ${b.q}`);
        const oks = (b.choices || []).filter((c) => c.ok);
        if (!oks.length) err(ep, `좋은 선택이 없음: ${b.id}`);
        checkTimer(ep, b, `decide ${b.id}`);
        if ((b.choices || []).length < 2 || b.choices.length > 4) err(ep, `카드는 2~4장: ${b.id}`);
        for (const c of b.choices || []) {
          if (!hasIcon(c.icon)) err(ep, `카드 아이콘 없음: ${c.icon} (${b.id})`);
          checkText(ep, c.label);
          if (c.ok) {
            if (!c.praise) warn(ep, `좋은 선택에 칭찬이 없음: ${b.id}`);
            else if (Array.isArray(c.praise)) walk(ep, c.praise, { nested: true });
            else checkText(ep, c.praise);
            if (c.set) Object.keys(c.set).forEach((k) => flagsSet.add(k));
            if (c.next) jumps.push(c.next);
          } else {
            checkOops(ep, c.oops, `decide ${b.id}`);
            if (c.fail) walk(ep, c.fail, { nested: true });
            else warn(ep, `나쁜 선택에 결과 장면이 없음: ${b.id}`);
          }
        }
        break;
      }
      case 'ivStart':
        if (iv) err(ep, 'ivStart 가 닫히기 전에 또 시작됨');
        iv = { pass: b.pass || 3, asks: 0 };
        break;
      case 'ivEnd':
        if (!iv) err(ep, 'ivEnd 앞에 ivStart 가 없음');
        else if (iv.asks < iv.pass) err(ep, `면접 문항(${iv.asks})이 합격 기준(${iv.pass})보다 적음`);
        iv = null;
        walk(ep, b.fail, { nested: true });
        break;
      case 'ask': {
        if (b.flag) flagsSet.add(b.flag);
        if (iv) {
          iv.asks += 1;
          if (!(b.chips || []).some((ch) => b.cats[ch.cat]?.ok === false)) warn(ep, `점수제 면접인데 알맞지 않은 선택지가 없음: ${b.id}`);
          for (const [k, c] of Object.entries(b.cats || {})) if (c.ok === false && !c.reply) err(ep, `점수제 면접의 틀린 대답에 점장님 반응(reply)이 없음: ${b.id}.${k}`);
        }
        if (b.skill && !SKILLS[b.skill]) err(ep, `스킬 없음: ${b.skill}`);
        checkText(ep, b.q);
        for (const ch of b.chips || []) if (!b.cats[ch.cat]) err(ep, `칩의 분류 '${ch.cat}' 가 cats 에 없음 (${b.id})`);
        if (!b.cats._) warn(ep, `ask 에 기본 분류(_) 권장: ${b.id}`);
        for (const [k, c] of Object.entries(b.cats || {})) {
          if (c.ok === false) { checkOops(ep, c.oops, `ask ${b.id}.${k}`); walk(ep, c.fail, { nested: true }); }
          if (c.then) walk(ep, c.then, { nested: true });
        }
        break;
      }
      /* v3 자립 근무 */
      case 'briefing': (b.cards || []).forEach(([ic, label, value]) => { if (!hasIcon(ic)) err(ep, `브리핑 아이콘 없음: ${ic}`); checkText(ep, `${label}, ${value}.`); }); if (b.note) checkText(ep, b.note); break;
      case 'board':
        work.board += 1;
        if (!b.id) warn(ep, 'board 에 id 권장');
        for (const id of b.pool || []) if (!TASKS[id]) err(ep, `근무판 자석 없음: ${id}`);
        if (!(b.pool || []).includes('break')) warn(ep, `근무판에 쉬는 시간 자석(break)이 없음: ${b.id}`);
        break;
      case 'shiftStart': if (!work.board) err(ep, 'shiftStart 앞에 board 가 없음'); work.on = true; break;
      case 'block': if (!BLOCK_BY_ID[b.id]) err(ep, `시간 칸 없음: ${b.id}`); if (!work.on) err(ep, `block 앞에 shiftStart 가 없음: ${b.id}`); break;
      case 'workSet': for (const k of [...(b.fill || []), ...Object.keys(b.add || {})]) if (!['cups', 'ice', 'bread', 'clean', 'energy', 'guests', 'smiles', 'waited'].includes(k)) err(ep, `근무 상태 이름 없음: ${k}`); break;
      case 'workOops': checkOops(ep, { id: b.id, title: b.title, lesson: b.lesson, icon: b.icon }, 'workOops'); break;
      case 'shiftEnd': if (!work.on) err(ep, 'shiftEnd 앞에 shiftStart 가 없음'); work.on = false; break;
      default: break;
    }
  }
  if (iv) err(ep, 'ivStart 뒤에 ivEnd 가 없음');
  if (work.on) err(ep, 'shiftStart 뒤에 shiftEnd 가 없음');
  return { labels, jumps };
}

const summary = [];
for (const f of EP_FILES) {
  const ep = (await imp(`js/data/episodes/${f}.js`)).default;
  const id = ep?.id || f;
  if (!ep || !Array.isArray(ep.script)) { err(f, 'script 배열이 없음'); continue; }
  const metaKeys = ep.ending ? ['id', 'label', 'title', 'cue', 'notice'] : ['id', 'label', 'title', 'goal', 'diary', 'schedule'];
  for (const k of metaKeys) if (!ep[k]) err(id, `메타 정보 '${k}' 없음`);
  if (ep.ending) {
    for (const b of ep.script) if (NOT_IN_ENDING.has(b.t)) err(id, `엔딩에는 둘 수 없는 비트: ${b.t}`);
    if (!ep.script.some((b) => b.t === 'finish')) err(id, '엔딩에 finish(엔딩 영수증) 가 없음');
    for (const t of [ep.cue, ep.notice?.title, ep.notice?.body].filter(Boolean)) checkText(id, t);
  }
  (ep.schedule || []).forEach(([ic]) => { if (!hasIcon(ic)) err(id, `일정표 아이콘 없음: ${ic}`); });
  if (ep.photo && !PHOTOS[ep.photo]) err(id, `대표 사진 없음: ${ep.photo}`);
  if (ep.script[ep.script.length - 1]?.t !== 'end') err(id, '마지막 비트는 end() 이어야 함');
  const before = { ...totals };
  curSchedule = ep.schedule || [];
  checks = [];
  const { labels, jumps } = walk(id, ep.script);
  curSchedule.forEach((_, i) => {
    const n = checks.filter((c) => c === i + 1).length;
    if (n === 0) warn(id, `일정 ${i + 1}번을 마치는 check(${i + 1}) 가 없음`);
    if (n > 1) err(id, `check(${i + 1}) 가 ${n}번 있음`);
  });
  for (const j of jumps) if (!labels.has(j)) err(id, `없는 라벨로 점프: ${j}`);
  summary.push({ id, beats: totals.beats - before.beats, lines: totals.lines - before.lines, decides: totals.decides - before.decides, oops: totals.oops - before.oops });
}
for (const [ep, fl] of flagsUsed) if (!flagsSet.has(fl)) warn(ep, `branch 플래그 '${fl}' 를 정하는 곳이 없음`);

// 매일 매일 카페 생활(무한 모드, 2026-10-15): 메모 판마다 하루를 만들어 같은 규칙으로 검사
{
  const ids = new Set();
  for (const m of DAY_MEMOS) {
    if (ids.has(m.id)) err('daily', `메모 판 id 중복: ${m.id}`);
    ids.add(m.id);
    if (!m.memo?.length || m.memo.length > 3) err('daily', `메모 판 ${m.id}: 메모는 1~3줄`);
  }
  if (DAY_MEMOS.length < 20) warn('daily', `메모 판이 ${DAY_MEMOS.length}개뿐`);
  // 4장 1화가 이미 등록한 아차(ch4_cups_out 등)를 다시 쓰므로, 같은 내용이면 통과
  sharedOops = new Map([...oopsIds.keys()].map((id) => [id, null]));
  for (const o of Object.values(DAILY_OOPS)) checkOops('daily', o, 'daily');
  for (const ep of allDailyDays()) walk(`daily:${ep.daily.memo}:${ep.daily.day}`, ep.script);
  sharedOops = null;
  console.log(`매일 매일 카페 생활: 메모 판 ${DAY_MEMOS.length}가지 · 하루 ${allDailyDays().length}개 검사`);
}

// 4장 근무판 자석의 '직접 하기' 미니게임과 미니게임 안의 아차(2026-10-15: 4장은 모든 활동에 미니게임)
for (const [id, t] of Object.entries(TASKS)) {
  if (!t.mini) continue;
  if (!MINIS.includes(t.mini)) err('work', `자석 ${id}: 미니게임 없음 ${t.mini}`);
  const skin = t.miniOpts?.skin;
  if (MINIGAME_SKINS[t.mini] && skin && !MINIGAME_SKINS[t.mini].includes(skin)) err('work', `자석 ${id}: 미니게임 ${t.mini} 모양 없음 ${skin}`);
  if (t.miniOpts?.timer && t.mini !== 'order') err('work', `자석 ${id}: 시간 제한은 주문서 확인(order)에만`);
  const ask = t.hands || HANDS;
  for (const x of [ask.q, ask.yes, ask.no]) checkText('work', x);
}
for (const o of [...MINIGAME_OOPS, PEAK_OOPS]) checkOops('work', o, 'mini');

console.log('\n에피소드별 요약');
console.table(summary);
console.log(`합계: 비트 ${totals.beats} · 대사 ${totals.lines}줄 · 글자 ${totals.chars} · 판단 ${totals.decides} · 아차 ${totals.oops}`);
console.log(errors ? `\n✗ 오류 ${errors}개, 경고 ${warns}개` : `\n✓ 오류 없음 (경고 ${warns}개)`);
process.exit(errors ? 1 : 0);
