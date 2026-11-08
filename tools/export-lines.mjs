/**
 * 읽어 줄 문장 목록 만들기 (음성 생성용)
 *   node tools/export-lines.mjs  →  tools/voice/lines.json
 * 게임이 실제로 읽어 주는 문장(대사·나레이션·속마음·안내·카드·면접 칩)을 모두 모읍니다.
 * key 는 게임(tts.js)과 같은 규칙: hashKey(`${voiceId}|${speakable(text)}`)
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const imp = (p) => import(pathToFileURL(path.join(root, p)).href);
const { hashKey, speakable, plain, fill } = await imp('js/core/text.js');
const { CHARS, CARD_IDS, cardSpeech, costumeVoice } = await imp('js/data/characters.js');
const { FEELINGS, SKILLS, LEVELS } = await imp('js/data/skills.js');
const { GLOSSARY } = await imp('js/data/glossary.js');
const { PHOTOS, PHOTO_ORDER } = await imp('js/data/photos.js');
const { DOCS } = await imp('js/ui/doc.js');
const { MINIGAME_LINES, MINIGAME_OOPS } = await imp('js/game/minigames/index.js');
const { boardLines } = await imp('js/game/work/board.js');
const { TASKS, BLOCKS, timeSpeech, handsSpeech, PEAK_OOPS } = await imp('js/data/work/tasks.js');
const { currentWage, CONFIG } = await imp('js/config.js');
const { saveLines } = await imp('js/screens/saves.js');
const { recordLines } = await imp('js/screens/records.js');
const { TIMEOUT_SAY } = await imp('js/ui/timer.js');
const { QUIT_ASK } = await imp('js/game/minigames/frame.js');

const EP_FILES = ['prologue', 'ch1', 'd1', 'd2', 'd3', 'd4', 'd5', 'ch3', 'epilogue', 'ch4_1', 'ending'];
const ORDINAL = ['첫 번째', '두 번째', '세 번째', '네 번째', '다섯 번째']; // overlays.js 와 같음
const lines = new Map();
let epCostume = null; // 지금 모으는 에피소드의 costume(의상별 목소리)
const voiceOf = (who) => costumeVoice(who, epCostume) || CHARS[who]?.voice || 'narr';

function add(voice, text, ep) {
  if (!text || /\{player/.test(text)) return; // 이름이 들어가는 줄은 실행할 때 브라우저 음성으로
  const spoken = speakable(text).trim();
  if (!spoken) return;
  const key = hashKey(`${voice}|${spoken}`);
  if (!lines.has(key)) lines.set(key, { key, voice, text: spoken, ep });
}

function walk(list, ep, ctx = {}) {
  for (const b of list || []) {
    switch (b.t) {
      case 'say': add(voiceOf(b.who), b.text, ep); break;
      case 'narr': add('narr', b.text, ep); break;
      case 'think': add('think', b.text, ep); break;
      case 'sys': add('sys', b.text, ep); break;
      case 'guide': add('sys', b.text, ep); break; // 버튼 알려 주기 안내
      case 'phone': add(voiceOf(b.from), b.text, ep); break;
      case 'branch': for (const l of Object.values(b.cases || {})) walk(l, ep); break;
      case 'choose':
        if (b.q) add(b.who === 'yeonwoo' || !b.who ? 'think' : voiceOf(b.who), b.q, ep);
        for (const o of b.options || []) { add('sys', plain(fill(o.label)), ep); walk(o.then, ep); }
        break;
      case 'decide': {
        const qVoice = b.who === 'yeonwoo' ? 'think' : b.who === 'sys' ? 'sys' : voiceOf(b.who || 'dohyun');
        if (b.q) add(qVoice, b.q, ep);
        if (b.help) add(voiceOf(b.helper || 'dohyun'), b.help, ep);
        for (const c of b.choices || []) {
          add('sys', plain(fill(c.label)), ep);
          if (typeof c.praise === 'string') add(voiceOf(b.mentor || 'dohyun'), c.praise, ep);
          else walk(c.praise, ep);
          walk(c.fail, ep);
          if (c.oops) add('sys', `아차! ${c.oops.title}. ${c.oops.lesson}`, ep);
        }
        // 시간 제한(급한 장면): 시간이 다 됐을 때 따로 쓴 결과 장면·아차
        if (b.timer) { walk(b.timer.fail, ep); if (b.timer.oops) add('sys', `아차! ${b.timer.oops.title}. ${b.timer.oops.lesson}`, ep); }
        break;
      }
      case 'ask': {
        const v = voiceOf(b.who || 'manager');
        add(v, b.q, ep);
        if (b.simple) add(v, b.simple, ep);
        for (const ch of b.chips || []) { add('sys', plain(fill(ch.label)), ep); add('yeonwoo', ch.label, ep); }
        for (const c of Object.values(b.cats || {})) {
          if (c.follow) add(v, c.follow, ep);
          for (const r of [].concat(c.reply || [])) add(v, r, ep);
          walk(c.fail, ep);
          walk(c.then, ep);
          if (c.oops) add('sys', `아차! ${c.oops.title}. ${c.oops.lesson}`, ep);
          if (c.ok === false && c.oops) add('sys', c.oops.lesson, ep); // 면접 돌아보기의 줄별 읽어 주기
        }
        break;
      }
      case 'mini': walk(MINIGAME_LINES[b.name]?.(b), ep); break;
      case 'ivEnd': walk(b.fail, ep); break;
      // 화면 안내도 같은 문장으로 (overlays.js 의 tts.speak 와 똑같이 만듦)
      case 'act': add('sys', fill(b.label), ep); break;
      case 'finish': add('sys', `${b.title} ${b.sub}`, ep); break;
      // 엔딩: 사진 벽에 붙는 사진 제목(overlays.credits) · 연우의 마지막 메모(overlays.letter, 연우 목소리)
      case 'credits': for (const id of PHOTO_ORDER) add('sys', PHOTOS[id].title, ep); break;
      case 'letter': add(voiceOf('yeonwoo'), b.speech, ep); break;
      case 'big': add('sys', `${b.text}. ${b.sub}`, ep); break;
      case 'photo': if (PHOTOS[b.id]) add('sys', `오늘의 한 장. ${PHOTOS[b.id].title}`, ep); break;
      case 'info': add('sys', `${b.title}. ${b.body}`, ep); break;
      case 'docSeal': add('sys', b.label || '도장 찍기', ep); break;
      // 메모 다시 듣기 (memo.speak 와 같은 문장)
      case 'memo': add('sys', `${b.title}. ${b.items.map((it, i) => `${i + 1}번, ${Array.isArray(it) ? it[1] : it.text}`).join('. ')}`, ep); break;
      case 'snap': break;
      // v3 자립 근무 (overlays.briefing · board · workOops 와 같은 문장)
      case 'briefing':
        add('sys', `${b.day}. 오늘의 조건.`, ep);
        for (const [, label, value] of b.cards || []) add('sys', `${label}, ${value}.`, ep);
        if (b.note) add('sys', b.note, ep);
        break;
      case 'board': {
        walk(boardLines(b.pool || []), ep);
        // 근무판의 자석(+ 고정 자석)마다 '직접 하기' 물음과 그 미니게임 문장 (runner.blockBeat 와 같은 옵션)
        const ids = [...new Set([...(b.pool || []), ...BLOCKS.flatMap((x) => x.fixed)])];
        for (const id of ids) {
          const t = TASKS[id];
          if (!t?.mini) continue;
          add('sys', handsSpeech(id), ep);
          walk(MINIGAME_LINES[t.mini]?.({ ...(t.miniOpts || {}), title: t.label }) || [], ep);
        }
        break;
      }
      case 'workOops': add('sys', `아차! ${b.title}. ${b.lesson}`, ep); break;
      default: break;
    }
  }
}

for (const f of EP_FILES) {
  const ep = (await imp(`js/data/episodes/${f}.js`)).default;
  epCostume = ep.costume || null;
  walk(ep.script, ep.id);
  epCostume = null;
  if (ep.ending) {
    // 엔딩: 결과 화면의 [엔딩 보기] 안내(result.js) · 엔딩 뒤 알림과 근무표 안내(main.js · hub.js)
    add('sys', ep.cue, ep.id);
    add('sys', `${ep.notice.title}. ${ep.notice.body}`, ep.id);
    continue; // 일정표·일기·결과 화면이 없음
  }
  // 오늘의 일정표 (overlays.schedule 과 같은 문장)
  add('sys', `${ep.label}. ${ep.title}. 오늘 할 일. ${(ep.schedule || []).map(([, l], i) => `${i + 1}번, ${l}`).join('. ')}`, ep.id);
  if (ep.diary) add('yeonwoo', ep.diary, ep.id);
  // 오늘의 일정 완료 배너 (overlays.check 와 같은 문장)
  (ep.schedule || []).forEach(([, l], i) => add('sys', `${ORDINAL[i]} 일정 끝! ${l}.`, ep.id));
  add('sys', `${ep.title}: 저장된 곳부터 이어서 할까요?`, ep.id); // 근무표에서 이어하기
  add('sys', `${ep.title}. 오늘의 마일스톤.`, ep.id); // 결과 화면 요약 첫 조각
}

add('sys', QUIT_ASK, 'work'); // 미니게임 [그만하기] 확인 창

// 매일 매일 카페 생활(무한 모드): 메모 판 30가지 × 요일의 하루 · 하루 끝 카드 · 근무표 칸
{
  const { allDailyDays, DAILY_SAY, DAILY_LABEL, DAILY_OOPS } = await imp('js/data/daily.js');
  for (const day of allDailyDays()) { epCostume = null; walk(day.script, 'daily'); }
  for (const t of Object.values(DAILY_SAY)) add('sys', t, 'daily');
  add('sys', `${DAILY_LABEL}. ${DAILY_SAY.hub}`, 'daily');
  add('sys', `${DAILY_LABEL}: 저장된 곳부터 이어서 할까요?`, 'daily');
  for (const o of Object.values(DAILY_OOPS)) add('sys', `아차! ${o.title}. ${o.lesson}`, 'daily');
  // 무한 모드 피크 주문서(주·요일마다 달라짐): 손님 이름 × 순서, 메뉴 × 개수(1~ORDER_MAX_Q)를 모두
  const { PEAK_COUNT, ORDER_MAX_Q, SMALL_WHO, GROUP_WHO } = await imp('js/data/daily.js');
  const { MENU, introLine, tickLine } = await imp('js/game/minigames/order.js');
  for (const who of [...SMALL_WHO, ...GROUP_WHO]) for (let n = 1; n <= PEAK_COUNT; n++) add('sys', introLine({ who }, n, PEAK_COUNT), 'daily');
  for (const k of Object.keys(MENU)) for (let q = 1; q <= ORDER_MAX_Q; q++) add('sys', tickLine(k, q), 'daily');
}

// v3 근무: 시간 칸 안내(시각 + 자석 이름 조각) · 퇴근 정산 조각 · 미니게임 아차
for (const b of BLOCKS) add('sys', timeSpeech(b.time), 'work');
for (const t of Object.values(TASKS)) { add('sys', `${t.label}.`, 'work'); add('sys', t.label, 'work'); }
add('sys', '퇴근 정산.', 'work');
for (let n = 1; n <= 3; n++) { add('sys', `계획 별 ${n}개.`, 'work'); add('sys', `수습 별 ${n}개.`, 'work'); }
for (let n = 0; n <= 30; n++) add('sys', `웃으며 나간 손님 ${n}명.`, 'work');
{ const w = currentWage().hourly; add('sys', `오늘 번 돈 ${(4 * w).toLocaleString('ko-KR')}원.`, 'work'); }
for (const o of [...MINIGAME_OOPS, PEAK_OOPS]) add('sys', `아차! ${o.title}. ${o.lesson}`, 'work');

// 저장하기·불러오기 (screens/saves.js 의 SAVE_SAY, 확인 창 문장 포함)
for (const t of saveLines()) add('sys', t, 'saves');
add('sys', '판단 장면마다 자동으로 저장돼요. [저장하기]로 원하는 장면을 6칸에 따로 저장할 수 있어요.', 'saves');
// 기록 파일 저장·불러오기 (screens/records.js 의 RECORD_SAY: 확인 창·알림. 별명은 화면에만)
for (const t of recordLines()) add('sys', t, 'saves');

// 크루 카드 (overlays.crewCard 와 같은 문장)
for (const id of CARD_IDS) add('sys', cardSpeech(id), 'crew');

// 말 사전 팝업 (overlays.glossary 와 같은 문장)
for (const g of GLOSSARY) add('sys', `${g.word}. ${fill(g.easy)} 예를 들어, ${fill(g.ex)}`, 'glossary');

// 계약서·급여명세서 함께 읽기 (doc.readThrough 와 같은 문장)
for (const kind of Object.keys(DOCS)) {
  DOCS[kind]().rows.forEach((r, i) => {
    add('sys', `${i + 1}번. ${r.k}. ${fill(r.v)}`, kind);
    add('sys', `${r.k}. ${fill(r.v)}`, kind); // 줄마다 있는 읽어 주기 버튼
  });
}

// 코드 안에 고정된 문장 (면접 도움 버튼·첫 시작·설정·확인 창·결과 화면 등)
// 미니게임 문장은 각 미니게임의 xxxLines() 가 내보냅니다.
const EXTRA = [
  ['yeonwoo', '죄송하지만, 다시 한번 말씀해 주시겠어요?'],
  ['yeonwoo', '잠깐 생각할 시간을 주실 수 있나요?'],
  ['manager', '그럼요. 천천히 생각해요. 준비되면 대답해 줘요.'],
  ['sys', '안녕하세요! 게임에서 쓸 별명을 알려 주세요.'],
  ['sys', '진짜 이름은 쓰지 말고, 나만의 별명을 써요.'],
  ['yeonwoo', '연우는 오늘 처음으로 혼자 버스를 타요.'],
  ['sys', '보기 편하게 맞춰요.'],
  ['sys', '이 빠르기로 읽어 줄게요.'],
  ['sys', '근무표로 나갈까요? 지금까지 한 것은 저장돼요.'],
  ['sys', '처음 화면으로 갈까요? 지금까지 한 것은 저장돼요.'],
  ['sys', '나는 오늘 어땠나요?'],
  ['sys', '면접 돌아보기.'], ['sys', '탈락 엔딩. 면접에서 떨어졌어요.'], ['sys', '이렇게 말해요.'],
  ...[0, 1, 2, 3, 4, 5].map((n) => ['sys', `알맞은 대답은 ${n}개예요.`]),
  ['sys', '들이쉬기'], ['sys', '내쉬기'], ['sys', '잘했어요. 마음이 조금 편해졌나요?'],
  ['sys', '직업 마일스톤'],
  ['sys', CONFIG.TAGLINE.join(' ')], // 처음 화면 캐치프레이즈(title.js 의 speakSeq 둘째 조각)
  ['sys', TIMEOUT_SAY], // 시간 제한 막대가 다 됐을 때(js/ui/timer.js)
];
for (const [v, t] of EXTRA) add(v, t, 'common');
for (const f of FEELINGS) add('sys', f.label, 'common');
// 결과 화면 요약 조각: 스킬 × 별 단계 (result.js 의 speakSeq)
for (const sk of Object.values(SKILLS)) for (const lv of Object.values(LEVELS)) add('sys', `${sk.name}, ${lv.name}.`, 'result');

const out = [...lines.values()];
fs.mkdirSync(path.join(root, 'tools', 'voice'), { recursive: true });
fs.writeFileSync(path.join(root, 'tools', 'voice', 'lines.json'), `${JSON.stringify(out, null, 1)}\n`);
const byVoice = {};
for (const l of out) byVoice[l.voice] = (byVoice[l.voice] || 0) + 1;
console.log(`읽어 줄 문장 ${out.length}줄 → tools/voice/lines.json`);
console.log(byVoice);
