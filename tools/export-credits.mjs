/**
 * 선생님 모드 '제작·저작권 정보'에 보일 자료 만들기 → assets/credits/credits.json
 *   node tools/export-credits.mjs        (npm run credits)
 *
 * 모으는 것
 *  - PRD: prd_final.md(최종본)를 절마다 나눠 HTML 로
 *  - 요청 기록: Claude Code 대화 기록(~/.claude/projects/C--AI-game/*.jsonl)에서 사용자가 쓴 요청만(LEAVE_OUT 의 대화는 뺌).
 *    기록 폴더가 없으면(다른 PC) 지난번에 만든 요청 기록을 그대로 둡니다. 폴더는 CLAUDE_LOG_DIR 로 바꿀 수 있습니다.
 *  - 작업 기록: docs/review_v2.md(검수 문서)를 절마다 나눠 HTML 로
 *  - 그림: assets/images.json + 원래 파일 이름(assets/_src/SOURCES.md · assets/bg/SOURCES.md) + 프롬프트 복기(tools/credits/image_prompts.mjs)
 *  - 음악·효과음: tools/audio/audio_map.mjs(팩·작곡가·파일별 출처) · 음성: tools/voice/voice_cast.json
 * 대사·그림·소리를 바꾼 뒤 실행하면 최신으로 바뀝니다.
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import readline from 'node:readline';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(root, 'assets', 'credits', 'credits.json');
const LOG_DIR = process.env.CLAUDE_LOG_DIR || path.join(os.homedir(), '.claude', 'projects', 'C--AI-game');
const imp = (rel) => import(pathToFileURL(path.join(root, rel)).href);
const { IMAGE_PROMPTS, NO_SOURCE_NOTE } = await imp('tools/credits/image_prompts.mjs');
const { AUDIO_MAP, PACKS } = await imp('tools/audio/audio_map.mjs');
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');
const prev = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, 'utf8')) : {};
const warn = [];

/* ---------------- 1. 요청 기록 ---------------- */
const kst = (iso) => {
  const d = new Date(new Date(iso).getTime() + 9 * 3600e3);
  return d.toISOString().slice(0, 16).replace('T', ' ');
};
function cleanText(t) {
  return t
    .replace(/<system-reminder>[\s\S]*?<\/system-reminder>/g, '')
    .replace(/<pasted_content[^>]*>/g, '[붙여 넣은 글]\n')
    .replace(/<\/pasted_content[^>]*>/g, '\n[붙여 넣은 글 끝]')
    .replace(/[A-Za-z]:\\Users\\[^\\\s"']+/g, 'C:\\Users\\…')       // 사용자 폴더 이름 가리기
    .replace(/[\w.+-]+@[\w-]+\.[\w.]+/g, '(메일 주소)')            // 메일 주소 가리기
    .trim();
}
const AUTO = /^작업 중에 사용량 한도에 도달했지만/;
const SKIP = /^(This session is being continued|<command-|<local-command|Caveat:|\[Request interrupted|<task-notification>)/;
/**
 * 요청 기록에서 빼는 대화(사용자 결정, 2026-10-26): 같은 폴더에서 한 다른 프로그램(보드게임) 작업과, 다 만든 뒤의 마무리 대화.
 *  sid = 대화 기록 파일 이름 앞 8자리 · from/to(UTC)가 있으면 그 사이의 요청만, 없으면 그 대화 전체
 */
const LEAVE_OUT = [
  { sid: '316c7186', why: '보드게임(꿈의 주사위) 구상' },
  { sid: 'cfe43a3b', why: '보드게임(꿈의 주사위) 제작' },
  { sid: '989b26ce', from: '2026-10-22T12:28:00Z', to: '2026-10-22T12:31:00Z', why: 'GitHub 플러그인 오류(보드게임 저장소)' },
  { sid: '53b4d396', from: '2026-10-26T13:41:00Z', why: '다 만든 뒤 최종 PRD를 올리고 요청 기록을 정리한 마무리 대화' },
];
const leftOut = (r) => {
  const t = Date.parse(r.ts);
  return LEAVE_OUT.some((x) => x.sid === r.sid && (!x.from || t >= Date.parse(x.from)) && (!x.to || t <= Date.parse(x.to)));
};
let leftOutCount = 0;

async function readRequests() {
  if (!fs.existsSync(LOG_DIR)) return null;
  const files = fs.readdirSync(LOG_DIR).filter((f) => f.endsWith('.jsonl'));
  if (!files.length) return null;
  const items = [];
  for (const f of files) {
    const sid = f.slice(0, 8);
    const rl = readline.createInterface({ input: fs.createReadStream(path.join(LOG_DIR, f), 'utf8'), crlfDelay: Infinity });
    for await (const line of rl) {
      if (!line.includes('"user"') && !line.includes('queued_command')) continue;
      let o;
      try { o = JSON.parse(line); } catch { continue; }
      if (o.type === 'user' && !o.isMeta && !o.isCompactSummary) {
        const c = o.message?.content;
        let text = '';
        let images = 0;
        if (typeof c === 'string') text = c;
        else if (Array.isArray(c)) {
          if (c.some((p) => p.type === 'tool_result')) continue;
          images = c.filter((p) => p.type === 'image').length;
          text = c.filter((p) => p.type === 'text').map((p) => p.text || '').join('\n');
        }
        text = cleanText(text);
        if ((!text && !images) || SKIP.test(text)) continue;
        items.push({ sid, ts: o.timestamp, text, images, how: AUTO.test(text) ? 'auto' : 'prompt' });
      } else if (o.type === 'attachment' && o.attachment?.type === 'queued_command' && o.attachment?.origin?.kind === 'human') {
        // 그림을 붙인 중간 메시지는 글이 아니라 [글·그림 조각] 목록으로 남음
        const pr = o.attachment.prompt || '';
        const parts = Array.isArray(pr) ? pr : [];
        const text = cleanText(typeof pr === 'string' ? pr : parts.filter((p) => p.type === 'text').map((p) => p.text || '').join('\n'));
        const images = parts.filter((p) => p.type === 'image').length;
        if ((text || images) && !SKIP.test(text)) items.push({ sid, ts: o.attachment.timestamp || o.timestamp, text, images, how: 'midturn' });
      }
    }
  }
  items.sort((a, b) => a.ts.localeCompare(b.ts));
  const kept = items.filter((it) => !leftOut(it));
  leftOutCount = items.length - kept.length;
  const out = [];
  for (const it of kept) {
    const t = Date.parse(it.ts);
    const dup = out.slice(-6).find((p) => p.text === it.text && Math.abs(Date.parse(p.ts) - t) < 180e3);
    if (dup) { dup.images = Math.max(dup.images, it.images); continue; }
    out.push(it);
  }
  // 대화(세션) 번호: 처음 요청한 순서대로 1, 2, 3…
  const order = [...new Set(out.map((r) => r.sid))];
  const fresh = out.map((r, i) => ({ n: i + 1, at: kst(r.ts), talk: order.indexOf(r.sid) + 1, how: r.how, images: r.images, text: r.text }));
  // 오래된 세션 파일이 지워져도 지난번 요청 기록(prev.requests)을 잃지 않게 합치고, Antigravity 대화 기록도 더함
  const base = (prev.requests || []).length > fresh.length ? [...prev.requests] : fresh;
  const seen = new Set(base.map((r) => `${r.at}|${r.text}`));
  for (const r of fresh) if (!seen.has(`${r.at}|${r.text}`)) { base.push(r); seen.add(`${r.at}|${r.text}`); }
  const agyBrain = path.join(os.homedir(), '.gemini', 'antigravity', 'brain');
  let maxTalk = base.reduce((m, r) => Math.max(m, r.talk || 1), 0);
  for (const agyId of ['41b7f4e5-e581-43da-b522-c742df9380d3']) {
    const tf = path.join(agyBrain, agyId, '.system_generated', 'logs', 'transcript.jsonl');
    if (!fs.existsSync(tf)) continue;
    const rows = fs.readFileSync(tf, 'utf8').trim().split('\n').map((l) => { try { return JSON.parse(l); } catch { return null; } }).filter((o) => o?.type === 'USER_INPUT');
    let talkNo = null;
    for (const o of rows) {
      const m = /<USER_REQUEST>\s*([\s\S]*?)\s*<\/USER_REQUEST>/.exec(o.content || '');
      const text = cleanText(m ? m[1] : o.content || '');
      if (!text) continue;
      const at = kst(o.created_at);
      const existing = base.find((r) => r.at === at && r.text === text);
      if (existing) { talkNo = existing.talk; continue; }
      if (!talkNo) talkNo = ++maxTalk;
      base.push({ n: base.length + 1, at, talk: talkNo, how: 'prompt', images: (o.media || []).length, text });
      seen.add(`${at}|${text}`);
    }
  }
  base.sort((a, b) => a.at.localeCompare(b.at));
  return base.map((r, i) => ({ ...r, n: i + 1 }));
}

/* ---------------- 2. 작업 기록 (검수 문서 → HTML) ---------------- */
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
function inline(s) {
  return esc(s)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1');
}
function mdToHtml(md) {
  const lines = md.split(/\r?\n/);
  const html = [];
  let list = null;
  let table = null;
  const closeList = () => { if (list) { html.push(`</${list}>`); list = null; } };
  const closeTable = () => {
    if (!table) return;
    const [head, , ...body] = table;
    const cells = (r) => r.replace(/^\||\|$/g, '').split('|').map((c) => c.trim());
    html.push(`<table><thead><tr>${cells(head).map((c) => `<th>${inline(c)}</th>`).join('')}</tr></thead><tbody>${body.map((r) => `<tr>${cells(r).map((c) => `<td>${inline(c).replace(/&lt;br&gt;/g, '<br>')}</td>`).join('')}</tr>`).join('')}</tbody></table>`);
    table = null;
  };
  for (const raw of lines) {
    const l = raw.trimEnd();
    if (/^\s*\|/.test(l)) { closeList(); (table ||= []).push(l.trim()); continue; }
    closeTable();
    let m;
    if (!l.trim()) { closeList(); continue; }
    if ((m = l.match(/^(#{3,6})\s+(.*)/))) { closeList(); html.push(`<h4>${inline(m[2])}</h4>`); continue; }
    if (/^---+$/.test(l.trim())) { closeList(); html.push('<hr>'); continue; }
    if ((m = l.match(/^>\s?(.*)/))) { closeList(); html.push(`<blockquote>${inline(m[1])}</blockquote>`); continue; }
    if ((m = l.match(/^(\s*)[-*]\s+(.*)/))) {
      if (list !== 'ul') { closeList(); html.push('<ul>'); list = 'ul'; }
      html.push(`<li${m[1].length >= 2 ? ' class="sub"' : ''}>${inline(m[2])}</li>`);
      continue;
    }
    if ((m = l.match(/^(\s*)\d+\.\s+(.*)/))) {
      if (list !== 'ol') { closeList(); html.push('<ol>'); list = 'ol'; }
      html.push(`<li${m[1].length >= 2 ? ' class="sub"' : ''}>${inline(m[2])}</li>`);
      continue;
    }
    closeList();
    html.push(`<p>${inline(l.trim())}</p>`);
  }
  closeList();
  closeTable();
  return html.join('');
}
/** 마크다운 문서를 '## ' 절마다 나눠 HTML 로: 작업 기록(검수 문서)·PRD 탭이 같이 씀 */
function readDoc(rel, fallbackTitle) {
  const md = read(rel);
  const parts = md.split(/^## /m);
  const intro = parts.shift();
  const sections = parts.map((p) => {
    const nl = p.indexOf('\n');
    return { title: p.slice(0, nl).trim(), html: mdToHtml(p.slice(nl + 1)) };
  });
  const title = (intro.match(/^#\s+(.*)/m) || [])[1] || fallbackTitle;
  return { title, intro: mdToHtml(intro.replace(/^#\s+.*$/m, '')), sections };
}

/* ---------------- 3. 그림 ---------------- */
const images = JSON.parse(read('assets/images.json'));
/** SOURCES.md 표에서 원래 파일 이름(나중 줄이 앞 줄을 덮음: 업스케일링 교체) */
function readSources() {
  const map = {};
  const take = (text, prefix = '') => {
    for (const m of text.matchAll(/^\|\s*`([^`]+)`\s*\|\s*`([^`]+)`(.*)\|/gm)) {
      const key = prefix + m[1].replace(/\.(jpe?g|png|mp4)$/i, '');
      const name = m[2];
      const ts = name.match(/(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})\d{2}\./);
      const entry = { flow: name, made: ts ? `${ts[1]}-${ts[2]}-${ts[3]} ${ts[4]}:${ts[5]}` : '' };
      if (map[key]) { entry.first = map[key].first || map[key].flow; entry.firstMade = map[key].firstMade || map[key].made; }
      if (/업스케일링/.test(m[3])) entry.upscaled = true;
      map[key] = entry;
    }
  };
  take(read('assets/_src/SOURCES.md'));
  take(read('assets/bg/SOURCES.md'), 'bg/');
  return map;
}
const SRC = readSources();
const KINDS = [
  ['stand', '사람(스탠딩)'], ['bg', '배경'], ['photos', '오늘의 한 장'], ['items', '소품'], ['vfx', '효과(VFX)'], ['movies', '영상'],
];
const imageList = [];
for (const [kind, group] of KINDS) {
  for (const [id, file] of Object.entries(images[kind] || {})) {
    if (kind === 'movies' && id.endsWith('_end')) continue;                     // 마지막 장면 그림은 영상에서 뽑은 것
    const key = kind === 'movies' ? `movie:${id}` : kind === 'photos' ? `photos:${id}` : id;
    const p = IMAGE_PROMPTS[key] || IMAGE_PROMPTS[id];
    if (!p) warn.push(`프롬프트 복기 없음: ${kind}/${id}`);
    const src = SRC[`${kind}/${id}`] || SRC[`bg/${id}`] || {};
    imageList.push({
      id, kind, group, title: p?.title || id,
      file: kind === 'movies' ? `assets/${images.movies[`${id}_end`] || file}` : `assets/${file}`,
      tool: 'Google Flow', made: src.made || '', flow: src.flow || NO_SOURCE_NOTE, first: src.first || '', firstMade: src.firstMade || '', upscaled: Boolean(src.upscaled),
      from: p?.from || 'none', prompt: p?.prompt || '', neg: p?.neg || '', note: p?.note || '',
    });
  }
}
// 종류 안에서는 프롬프트 표의 순서(주요 인물 → 크루 → 손님)대로
const ORDER = Object.keys(IMAGE_PROMPTS);
const rank = (i) => {
  const k = i.kind === 'movies' ? `movie:${i.id}` : i.kind === 'photos' ? `photos:${i.id}` : i.id;
  const n = ORDER.indexOf(k);
  return n < 0 ? 1e9 : n;
};
imageList.sort((a, b) => KINDS.findIndex((k) => k[0] === a.kind) - KINDS.findIndex((k) => k[0] === b.kind) || rank(a) - rank(b));
for (const who of ['yeonwoo', 'dohyun', 'manager']) {
  const p = IMAGE_PROMPTS[`sheet:${who}`];
  imageList.push({ id: `${who}_sheet`, kind: 'sheet', group: '설정화', title: p.title, file: `assets/${who}_sheet.jpg`, tool: 'Google Flow', made: '', flow: '게임 작업 전(1판)에 사용자가 만든 설정화', first: '', from: p.from, prompt: p.prompt, neg: p.neg, note: `${p.note ? `${p.note} · ` : ''}표정 초상(assets/portraits/${who}_*.jpg)을 여기서 잘라 씀(tools/crop-portraits.py)` });
}
// 픽셀 아트(일하는 장면): Flow로 만든 그림에서 잘라 씀(tools/import-pixel-sheet.py, 2026-10-25 · 미니게임 사람·물건 2026-10-26)
for (const [key, srcId, file] of [['yeonwoo', 'px_yeonwoo_sheet', 'yeonwoo.png'], ['cafe_room', 'px_cafe_room', 'cafe_room.png'], ['cafe_objects', 'px_cafe_objects', 'cafe_objects.png'], ['minigame', 'px_minigame_sheet', 'people.png']]) {
  const p = IMAGE_PROMPTS[`px:${key}`];
  const src = SRC[`pixel/${srcId}`] || {};
  imageList.push({ id: `px_${key}`, kind: 'pixel', group: '픽셀 아트', title: p.title, file: `assets/pixel/${file}`, tool: 'Google Flow', made: src.made || '', flow: src.flow || NO_SOURCE_NOTE, first: '', firstMade: '', upscaled: false, from: p.from, prompt: p.prompt, neg: '', note: p.note });
}
const portraits = fs.readdirSync(path.join(root, 'assets', 'portraits')).filter((f) => f.endsWith('.jpg'));
const pixel = fs.readdirSync(path.join(root, 'assets', 'pixel')).filter((f) => f.endsWith('.png'));

/* ---------------- 4. 음악·효과음 ---------------- */
const BGM_USE = {
  title: '처음 화면(오프닝)', morning: '아침·출근길', cafe: '일하는 장면', cafe_2: '일하는 장면 2', cafe_4: '일하는 장면 3 · 아침 2', peak: '피크타임',
  tea: '쉬는 시간', home: '집·밤', interview: '면접', tension: '긴장(앗!)', warm: '고마움·감동', celebrate: '결과 화면', ending: '엔딩', overload: '소리 과부하',
};
const TRACK_NAME = {
  MenuScreen_UpbeatVersion_Loop: 'Menu Screen (Upbeat Version)',
  'Fantasy Vol4 Seasonal Main': 'Seasonal',
  MenuScreen_PianoVersion_Loop: 'Menu Screen (Piano Version)',
  Theme_1_NewDayEnergy_Loop: 'Theme 1: New Day Energy',
  Theme_1_NewDayEnergy_PianoVersion_Loop: 'Theme 1: New Day Energy (Piano Version)',
  Theme_1_NewDayEnergy_WithoutPercussion_Loop: 'Theme 1: New Day Energy (Without Percussion)',
  Theme_1_NewDayEnergy_FunnyCharacterVersion_WithoutPercussion_Loop: 'Theme 1: New Day Energy (Funny Character Version, Without Percussion)',
  Theme_2_AfterSchoolWalk_Loop: 'Theme 2: After School Walk',
  Theme_3_PlayfulTime_Loop: 'Theme 3: Playful Time',
  Theme_4_Emotional_Loop: 'Theme 4: Emotional',
  Theme_4_Emotoinal_MusicBoxVersion_Loop: 'Theme 4: Emotional (Music Box Version)',
  Theme_5_PartyTime_Loop: 'Theme 5: Party Time',
  Theme_6_LazyAfternoon_Loop: 'Theme 6: Lazy Afternoon',
  'Level 2 (Loop)': 'Level 2',
};
const srcList = (e) => [...new Set(e.layers ? e.layers.map((l) => l.src) : e.repeat ? [e.repeat.src] : [e.src])];
const packKey = (rel) => Object.keys(PACKS).find((k) => rel.startsWith(k));
const fileName = (rel) => rel.split('/').pop();
const packs = Object.entries(PACKS).map(([key, p]) => ({ key, ...p, used: AUDIO_MAP.filter((e) => srcList(e).some((s) => s.startsWith(key))).length }));
const music = AUDIO_MAP.filter((e) => e.kind === 'bgm').map((e) => {
  const s = srcList(e)[0];
  const base = fileName(s).replace(/\.wav$/i, '');
  const p = PACKS[packKey(s)] || {};
  return { id: e.id, use: BGM_USE[e.id] || e.id, track: TRACK_NAME[base] || base, file: fileName(s), pack: p.name, composer: p.composer || p.author, composerNote: p.composerNote || '', license: p.license, ai: p.ai || '', note: e.note || '' };
});
const sounds = AUDIO_MAP.filter((e) => e.kind !== 'bgm').map((e) => ({
  id: `${e.kind}/${e.id}`, kind: e.kind,
  from: srcList(e).map((s) => ({ pack: PACKS[packKey(s)]?.name || s.split('/')[0], file: fileName(s) })),
  note: e.note || '',
}));

/* ---------------- 5. 음성 ---------------- */
const VOICE_WHO = {
  yeonwoo: '연우', think: '연우 속마음', narr: '연우 서술', dohyun: '도현', manager: '점장님', sora: '소라', minjae: '민재', mom: '엄마',
  teacher: '김선영 선생님', jiho: '지호', grandma: '봉순 할머니', student: '대학생 손님', seojin: '서진', daeri: '최 대리', luna: '루나',
  auntie: '아주머니 손님', hiker: '등산복 손님', customer: '손님(남자)', customer_f: '손님(여자)', sys: '안내 목소리',
};
const cast = JSON.parse(read('tools/voice/voice_cast.json'));
const voiceManifest = JSON.parse(read('assets/voice/manifest.json'));
const voices = {
  model: cast._model || 'supertonic-3',
  lines: Object.keys(voiceManifest.lines || {}).length,
  cast: Object.entries(cast).filter(([k]) => !k.startsWith('_')).map(([k, v]) => ({ who: VOICE_WHO[k] || k, voice: v.voice, speed: v.speed })),
};

/* ---------------- 쓰기 ---------------- */
const requests = await readRequests();
if (!requests) warn.push(`대화 기록 폴더가 없어 요청 기록은 지난번 것을 그대로 둠: ${LOG_DIR}`);
const data = {
  updated: kst(new Date().toISOString()).slice(0, 10),
  prd: readDoc('prd_final.md', '제품 요구사항 정의서(PRD)'),
  requests: requests || prev.requests || [],
  worklog: readDoc('docs/review_v2.md', '검수 문서'),
  images: imageList,
  derived: { portraits: portraits.length, pixel: pixel.length },
  audio: { packs, music, sounds },
  voices,
};
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, `${JSON.stringify(data, null, 1)}\n`);
const kb = Math.round(fs.statSync(OUT).size / 1024);
console.log(`제작·저작권 자료 → assets/credits/credits.json (${kb}KB)`);
console.log(`  PRD ${data.prd.sections.length}절 · 요청 ${data.requests.length}건${requests ? `(뺀 것 ${leftOutCount}건: 보드게임·마무리 대화)` : ''} · 작업 기록 ${data.worklog.sections.length}절 · 그림 ${imageList.length}장(+초상 ${portraits.length} · 픽셀 ${pixel.length}) · 음악 ${music.length}곡 · 효과음·환경음 ${sounds.length}개 · 음성 ${voices.lines}줄`);
for (const w of warn) console.log(`  ! ${w}`);
