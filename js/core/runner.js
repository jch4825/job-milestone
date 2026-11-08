/**
 * 시나리오 실행기
 *  - 에피소드의 비트 배열을 순서대로 실행합니다.
 *  - 판단 카드(decide): 좋은 선택 → 칭찬·도장 / 나쁜 선택 → 결과 장면 → 아차! → 선택 직전으로 되감기
 *    급한 장면(decide 의 timer)은 막대가 줄어들고, 시간이 다 되면 '못 고른 결과' → 아차! → 되감기
 *  - 판단·선택·미니게임마다 '되감기 지점'과 자동 저장을 남깁니다.
 *  - 상단 [되감기] 버튼으로 지난 지점 어디로든 즉시 돌아갈 수 있습니다.
 */

import { store } from './store.js';
import { bus } from './bus.js';
import { plain, fill, josa } from './text.js';
import { sleep, $ } from './dom.js';
import { showOops, oopsInfo, oopsFound, oopsTotal } from './oops.js';
import { stage } from '../ui/stage.js';
import { dialogue } from '../ui/dialogue.js';
import { memo } from '../ui/memo.js';
import { hud } from '../ui/hud.js';
import { cards } from '../ui/cards.js';
import { ov } from '../ui/overlays.js';
import { docPanel } from '../ui/doc.js';
import { breathe as breatheUI } from '../ui/breathe.js';
import { audio } from '../av/audio.js';
import { tts } from '../av/tts.js';
import { askUI, classify } from '../game/interview.js';
import { llm } from '../game/llm.js';
import { MINIGAMES } from '../game/minigames/index.js';
import { abortMinigame } from '../game/minigames/frame.js';
import { SKILLS } from '../data/skills.js';
import { vfx } from '../ui/vfx.js';
import { tutor } from '../ui/tutor.js';
import { timerBar, timerFactor } from '../ui/timer.js';
import { setCostumes } from '../data/characters.js';
import { findTerm } from '../data/glossary.js';
import { currentWage } from '../config.js';
import { board as boardUI } from '../game/work/board.js';
import { cafe } from '../game/work/cafe.js';
import { initState, runBlock, tasksOf, checkCond, payout } from '../game/work/sim.js';
import { TASKS, BLOCKS, BLOCK_BY_ID, METERS, MAX, timeSpeech } from '../data/work/tasks.js';

const METER_IDS = new Set(METERS.map((m) => m.id));

class Interrupt {
  constructor(kind, data) { this.kind = kind; this.data = data; }
}

let session = null;

function deferred() {
  let resolve;
  let reject;
  const p = new Promise((res, rej) => { resolve = res; reject = rej; });
  p.catch(() => {});
  return { p, resolve, reject };
}

function newSession(ep) {
  const labels = {};
  ep.script.forEach((b, i) => { if (b.t === 'label') labels[b.name] = i; });
  return { ep, labels, index: 0, epoch: 0, stamps: [], points: [], photos: [], terms: [], interrupt: deferred(), earplugs: false };
}

/* ------------------------------------------------------------------ */
/* 상태 저장·복원                                                        */
/* ------------------------------------------------------------------ */
function snapshot(s) {
  return {
    stage: stage.getState(),
    memo: memo.getState(),
    doc: docPanel.kind(),
    time: hud.getTime(),
    place: hud.getPlace(),
    sched: hud.getSchedule().done,
    audio: audio.state(),
    earplugs: s.earplugs,
    work: cafe.getState(),
    flags: { ...(store.active()?.flags || {}) },
  };
}

function clearTask() {
  abortMinigame(); // 미니게임 도중 되감기·나가기: 실시간 고리·방향키까지 정리
  cards.close();
  $('#layer-task').replaceChildren();
  document.querySelectorAll('.doc-next-wrap').forEach((el) => el.remove());
  document.body.classList.remove('tasking', 'mg-open');
}

function restore(s, snap) {
  tts.stop();
  ov.clearAll();
  clearTask();
  docPanel.close(true);
  dialogue.clear();
  stage.restore(snap.stage);
  memo.restore(snap.memo);
  if (snap.doc) docPanel.open(snap.doc, { silent: true });
  hud.setTime(snap.time);
  hud.setPlace(snap.place || '');
  hud.setSchedule(s.ep.schedule, snap.sched || []);
  audio.bgm(snap.audio?.mood || null);
  audio.ambience(snap.audio?.ambience || null, snap.audio?.ambLevel || 1);
  s.earplugs = Boolean(snap.earplugs);
  audio.setEarplugs(s.earplugs);
  stage.effect('earplugs', s.earplugs);
  store.restoreFlags(snap.flags);
  cafe.restore(snap.work || null, snap.flags?.work);
}

function addPoint(s, index, title, snap) {
  s.points = s.points.filter((p) => p.index !== index);
  s.points.push({ index, title: String(title).slice(0, 40), snap, at: Date.now() });
  if (s.points.length > 15) s.points.shift();
  hud.setRewindEnabled(true);
  bus.emit('rewind-points', s.points.length);
}

function save(s, index, name, snap) {
  store.setCheckpoint({ ep: s.ep.id, index, name, snapshot: snap || snapshot(s) });
  hud.saved();
}

function target(s, name) {
  if (!(name in s.labels)) throw new Error(`[runner] 없는 라벨: ${name}`);
  return s.labels[name];
}

/* ------------------------------------------------------------------ */
/* 보상                                                                  */
/* ------------------------------------------------------------------ */
/** quiet: 컷인이 이미 스킬과 별을 보여 줬으면 토스트 대신 별이 수첩으로 날아감 */
function award(s, skill, level, { quiet = false } = {}) {
  if (!SKILLS[skill]) return;
  store.awardStamp(skill, level);
  s.stamps.push({ skill, level });
  audio.sfx('stamp');
  if (quiet) vfx.flyStars({ x: 960, y: 470 }, hud.stampTarget(), { n: level });
  else ov.toast(`${SKILLS[skill].name} 도장 ${'★'.repeat(level)}${'☆'.repeat(3 - level)}`, SKILLS[skill].icon);
}

/** 좋은 결과 연출: '잘했어요' 컷인 → 도장(별이 수첩으로) */
async function celebrate(s, w, { skill = null, level = 3, title = '' }) {
  await w(ov.cutin({ skill: SKILLS[skill] ? skill : null, level, title }));
  if (skill) award(s, skill, level, { quiet: true });
}

function highlightRef(ref) {
  if (typeof ref === 'string' && ref.startsWith('doc:')) docPanel.highlight(Number(ref.slice(4)));
  else if (ref) memo.highlight(Number(ref));
}

function qKind(b) {
  if (b.who === 'yeonwoo') return 'think';
  if (b.who === 'sys') return 'sys';
  return 'say';
}

function praiseBeats(praise, b) {
  if (Array.isArray(praise)) return praise;
  return [{ t: 'say', who: b.mentor || 'dohyun', face: 'smile', text: praise }];
}

function defaultHelp(b) {
  if (typeof b.memo === 'string' && b.memo.startsWith('doc:')) return `종이의 ${b.memo.slice(4)}번 줄을 같이 볼까요? 거기에 답이 있어요.`;
  if (b.memo) return `메모 ${b.memo}번을 같이 볼까요? 거기에 힌트가 있어요.`;
  return '천천히 다시 생각해 봐요. 무엇이 가장 안전할까요?';
}

/* ------------------------------------------------------------------ */
/* 비트 실행                                                             */
/* ------------------------------------------------------------------ */
async function runSub(s, list, w) {
  for (const sb of list || []) await w(exec(s, sb, null));
}

async function exec(s, b, index) {
  const E = s.epoch;
  const w = async (p) => {
    const r = await p;
    if (s.epoch !== E) throw new Interrupt('stale');
    return r;
  };

  // 조건부 비트(v3 근무 상태·근무판·플래그). onlyIf 묶음은 첫 비트에서 한 번만 검사
  if (b.if) {
    s.ifGroups = s.ifGroups || {};
    let ok;
    if (b.ifGroup) {
      if (b.ifFirst || !(b.ifGroup in s.ifGroups)) s.ifGroups[b.ifGroup] = workCond(b.if);
      ok = s.ifGroups[b.ifGroup];
    } else ok = workCond(b.if);
    if (!ok) return undefined;
  }

  switch (b.t) {
    case 'bg': await w(stage.setBg(b.id, b.variant)); return undefined;
    case 'bgm': audio.bgm(b.mood); return undefined;
    case 'amb': audio.ambience(b.kind, b.level || 1); return undefined;
    case 'sfx': audio.sfx(b.name); return undefined;
    case 'show': stage.setCast(b.cast); await w(sleep(150)); return undefined;
    case 'enter': stage.enter(b.slot, b.who); await w(sleep(150)); return undefined;
    case 'leave': stage.leave(b.who); return undefined;
    case 'face': stage.setFace(b.who, b.face); return undefined;
    case 'motion': stage.motion(b.who, b.type); return undefined;
    case 'camera': stage.camera(b.mode); return undefined;
    case 'fx': stage.effect(b.name, b.on); return undefined;
    case 'earplugs':
      s.earplugs = b.on;
      audio.setEarplugs(b.on);
      stage.effect('earplugs', b.on);
      return undefined;

    case 'say':
    case 'narr':
    case 'think':
    case 'sys':
      await w(dialogue.line({ kind: b.t, who: b.who, face: b.face, text: b.text }));
      return undefined;
    case 'phone': await w(ov.phone({ from: b.from, text: b.text })); return undefined;
    case 'guide': // 버튼 알려 주기: 이미 배운 버튼이면 안내 대사를 건너뜀
      if (!tutor.wants(b.key)) return undefined;
      if (b.key === 'timer' && !timerFactor()) return undefined; // 시간 제한을 끈 학생에게는 막대 안내가 필요 없음
      tutor.arm(b.key, b.span);
      await w(dialogue.line({ kind: 'sys', text: b.text }));
      return undefined;

    case 'time': hud.setTime(b.v); return undefined;
    case 'place': {
      ov.place(b.time, b.text);
      hud.setPlace(b.text);
      const hm = String(b.time || '').match(/(\d{1,2}:\d{2})/);
      if (hm) hud.setTime(hm[1]);
      return undefined;
    }
    case 'big': dialogue.hide(); await w(ov.big(b.text, b.sub)); dialogue.show(); return undefined;
    case 'schedule': dialogue.hide(); await w(ov.schedule(s.ep)); dialogue.show(); return undefined;
    case 'check': hud.checkStep(b.n); await w(ov.check(b.n, s.ep.schedule?.[b.n - 1])); return undefined;
    case 'meet': if (store.meet(b.who)) await w(ov.crewCard(b.who)); return undefined;
    case 'cg': if (stage.setCg(b.id) && b.id) store.unlockPhoto(`cg_${b.id}`); return undefined;
    case 'emote': stage.emote(b.who, b.kind); return undefined;
    case 'memo': memo.set(b.title, b.items); await w(sleep(250)); return undefined;
    case 'memoHi': memo.highlight(b.n); return undefined;
    case 'info': await w(ov.info({ title: b.title, body: b.body, icon: b.icon })); return undefined;

    case 'doc': docPanel.open(b.kind); await w(sleep(350)); return undefined;
    case 'docRead': await w(docPanel.readThrough()); return undefined;
    case 'docHi': docPanel.highlight(b.n); return undefined;
    case 'docSeal': await w(docPanel.seal(b.label)); return undefined;
    case 'docClose': docPanel.close(); return undefined;

    case 'act': await w(ov.act({ label: fill(b.label), icon: b.icon, sfx: b.sfx })); return undefined;
    case 'breathe': {
      const done = await w(breatheUI({ cycles: b.cycles, note: b.note }));
      if (done && b.skill) award(s, b.skill, 3);
      store.log({ type: 'breathe', ep: s.ep.id, done });
      return undefined;
    }

    case 'snap': await w(ov.snap({ who: b.who, face: b.face, title: b.title, caption: fill(b.caption) })); return undefined;
    case 'photo': s.photos.push(b.id); await w(ov.photo(b.id)); return undefined;
    case 'got': await w(ov.got({ item: b.item, title: fill(b.title || ''), icon: b.icon })); return undefined;
    case 'stamp': award(s, b.skill, b.level || 3); return undefined;
    case 'term': {
      const t = findTerm(b.id);
      if (t && store.unlockTerm(t.id)) {
        s.terms.push(t.id);
        audio.sfx('jingle_unlock');
        ov.toast(`말 사전에 '${t.word}'${josa(t.word, '이/가').slice(t.word.length)} 들어왔어요`, 'book');
      }
      return undefined;
    }
    case 'finish': dialogue.hide(); await w(ov.finish({ title: b.title, sub: b.sub })); dialogue.show(); return undefined;
    // 엔딩 연출: 대화창은 다음 대사가 나올 때 다시 보임(연출 사이에 지난 대사가 깜빡 보이지 않게)
    case 'credits': dialogue.hide(); await w(ov.credits()); return undefined;
    case 'letter': dialogue.hide(); await w(ov.letter({ to: fill(b.to), lines: b.lines, ps: b.ps, from: b.from, speech: b.speech })); return undefined;

    case 'label': return undefined;
    case 'jump': return { jump: target(s, b.to) };
    case 'set': store.setFlag(b.flag, b.value); return undefined;
    case 'branch': {
      const v = store.flag(b.flag);
      const list = (v !== undefined && v !== null && b.cases[String(v)]) || b.cases._ || [];
      await runSub(s, list, w);
      return undefined;
    }
    case 'checkpoint': save(s, index, b.name); return undefined;
    case 'wait': await w(sleep(b.ms)); return undefined;
    case 'end': return { end: true };

    /* ---------- v3 자립 근무 ---------- */
    case 'briefing': dialogue.hide(); await w(ov.briefing({ day: b.day, cards: b.cards, note: b.note })); dialogue.show(); return undefined;
    case 'board': return boardBeat(s, b, index, w);
    case 'shiftStart': {
      const st = initState(b.init);
      store.setFlag('work', st);
      await w(cafe.mount());
      cafe.setBlock(-1);
      cafe.setMeters(st, { quiet: true });
      return undefined;
    }
    case 'block': return blockBeat(s, b, index, w);
    case 'workSet': {
      const st = { ...(store.flag('work') || initState()) };
      for (const k of b.fill || []) st[k] = MAX;
      for (const [k, v] of Object.entries(b.add || {})) { const next = Math.max(0, (st[k] || 0) + v); st[k] = METER_IDS.has(k) ? Math.min(MAX, next) : next; }
      if (b.event) st.events = [...(st.events || []), { id: b.event, plan: Boolean(b.plan) }];
      store.setFlag('work', st);
      cafe.setMeters(st);
      return undefined;
    }
    case 'workOops': return workOopsBeat(s, b, index, w);
    case 'shiftEnd': return shiftEndBeat(s, b, index, w);

    case 'decide': return decideBeat(s, b, index, w);
    case 'choose': return chooseBeat(s, b, index, w);
    case 'ask': return askBeat(s, b, index, w);
    case 'ivStart': return ivStartBeat(s, b, index, w);
    case 'ivEnd': return ivEndBeat(s, b, index, w);
    case 'mini': return miniBeat(s, b, index, w);
    default:
      console.warn('[runner] 알 수 없는 비트', b);
      return undefined;
  }
}

/* ---------------- 판단 카드 ---------------- */
async function decideBeat(s, b, index, w) {
  const id = b.id || `${s.ep.id}@${index}`;
  const snap = snapshot(s);
  addPoint(s, index, b.title || plain(fill(b.q || '판단')), snap);
  save(s, index, id, snap);
  const t0 = performance.now();
  const tried = new Set();
  const okIdx = b.choices.map((c, i) => (c.ok ? i : -1)).filter((i) => i >= 0);
  const helpLv = store.settings().help;
  let picks = 0;
  let fails = 0;
  let helps = 0;
  let timeouts = 0;
  let glow = -1;

  for (;;) {
    if (b.q) await w(dialogue.line({ kind: qKind(b), who: b.who || 'dohyun', face: b.face, text: b.q, noWait: true }));
    // 시간 제한(급한 장면): 설정 배율 · 한 번 실패한 뒤에는 1.5배 · 두 번 넘게 실패하면 막대 없이
    const factor = b.timer ? timerFactor() : 0;
    const tm = factor && fails < 2 ? timerBar({ sec: (b.timer.sec || 15) * factor * (fails ? 1.5 : 1), label: b.timer.label }) : null;
    const res = await w(cards.present(b, { tried, glow, timer: tm }));

    if (res.type === 'help') {
      helps += 1;
      cards.close();
      highlightRef(b.memo);
      await w(dialogue.line({ kind: 'say', who: b.helper || 'dohyun', face: 'teach', text: b.help || defaultHelp(b) }));
      if (helps >= 2 && okIdx.length) glow = okIdx[0];
      store.log({ type: 'help', ep: s.ep.id, id });
      continue;
    }

    picks += 1;
    if (res.type === 'timeout') {
      // 시간이 다 됨: 아무것도 못 고른 결과(멈춰 버린 카드와 같은 결과, 또는 따로 쓴 장면) → 아차! → 되감기
      fails += 1;
      timeouts += 1;
      await w(sleep(1000)); // '시간이 다 됐어요!'를 보여 주고 읽어 줌
      cards.close();
      const as = b.timer.as ? b.choices.find((x) => !x.ok && x.icon === b.timer.as) : null;
      const oops = b.timer.oops || as?.oops || { id: `${id}:time`, title: '시간이 다 됐어요', lesson: '급할 때는 생각보다 먼저 정해진 말과 행동을 해요.', icon: 'hourglass' };
      store.log({ type: 'fail', ep: s.ep.id, id, chosen: '시간 초과', oops: oops.id, timeout: true });
      await runSub(s, b.timer.fail || as?.fail || [], w);
      await w(showOops(oops));
      restore(s, snap);
      if (helpLv !== 'self') highlightRef(b.memo);
      const glowAfterT = helpLv === 'many' ? 1 : helpLv === 'some' ? 2 : 3;
      if (fails >= glowAfterT && okIdx.length) glow = okIdx[0];
      continue;
    }
    const c = b.choices[res.index];
    if (c.ok) {
      // 별 = 고를 때 실제로 보인 도움: 정답 반짝임 → 함께 · 아차(되감기)·메모 강조·도움 버튼 → 조금 도움 · 없음 → 스스로
      const level = glow >= 0 ? 1 : fails || helps ? 2 : 3;
      await w(cards.success(res.index, { great: level === 3 }));
      cards.close();
      memo.clearHighlight();
      docPanel.clearHighlight();
      await celebrate(s, w, { skill: b.skill, level, title: b.title });
      store.log({
        type: 'decide', ep: s.ep.id, id, q: plain(fill(b.q || b.title || '')), skill: b.skill || null,
        picks, rewinds: fails, helps, timeouts, level, chosen: plain(fill(c.label)),
        tried: [...tried].map((i) => plain(fill(b.choices[i].label))), ms: Math.round(performance.now() - t0),
      });
      if (c.set) for (const [k, v] of Object.entries(c.set)) store.setFlag(k, v);
      if (c.praise) await runSub(s, praiseBeats(c.praise, b), w);
      if (c.next) return { jump: target(s, c.next) };
      return undefined;
    }

    // 나쁜 선택: 결과 장면 → 아차! → 선택 직전으로 되감기
    fails += 1;
    await w(cards.markBad(res.index));
    cards.close();
    tried.add(res.index);
    store.log({ type: 'fail', ep: s.ep.id, id, chosen: plain(fill(c.label)), oops: c.oops?.id || null });
    if (c.fail) await runSub(s, c.fail, w);
    await w(showOops(c.oops || { id: `${id}:${res.index}`, title: '다시 생각해 봐요', lesson: c.hint || '', icon: 'think' }));
    restore(s, snap);
    // 되감은 뒤 도움(설정: 도움 많이 / 보통 / 스스로)
    if (helpLv !== 'self') highlightRef(b.memo);
    const glowAfter = helpLv === 'many' ? 1 : helpLv === 'some' ? 2 : 3;
    if (fails >= glowAfter && okIdx.length) glow = okIdx[0];
  }
}

/* ---------------- 자유 선택 ---------------- */
async function chooseBeat(s, b, index, w) {
  const id = b.id || `${s.ep.id}@${index}`;
  const snap = snapshot(s);
  addPoint(s, index, b.title || plain(fill(b.q || '선택')), snap);
  save(s, index, id, snap);
  if (b.q) await w(dialogue.line({ kind: qKind(b), who: b.who || 'yeonwoo', face: b.face, text: b.q, noWait: true }));
  const i = await w(cards.ask(b.options, { variant: b.variant || '' }));
  const o = b.options[i];
  cards.close();
  if (b.flag) store.setFlag(b.flag, o.value);
  if (o.set) for (const [k, v] of Object.entries(o.set)) store.setFlag(k, v);
  store.log({ type: 'choose', ep: s.ep.id, id, value: o.value, chosen: plain(fill(o.label)) });
  if (o.then) await runSub(s, o.then, w);
  if (o.next) return { jump: target(s, o.next) };
  return undefined;
}

/* ---------------- 면접 질문 ---------------- */
function pickReply(r) {
  if (Array.isArray(r)) return r[Math.floor(Math.random() * r.length)];
  return r || '말해 줘서 고마워요.';
}

async function askBeat(s, b, index, w) {
  const id = b.id || `${s.ep.id}@${index}`;
  const iv = s.iv?.open ? s.iv : null; // 점수제 면접 안
  const snap = snapshot(s);
  addPoint(s, index, b.title || plain(fill(b.q)), snap);
  if (iv) save(s, iv.index, iv.id, iv.snap); // 이어 하기는 면접 처음부터
  else save(s, index, id, snap);
  let attempts = 0;
  let q = b.q;
  let followed = false;
  const t0 = performance.now();

  for (;;) {
    const ans = await w(askUI({ ...b, q, modes: iv && !iv.llm ? ['chips'] : undefined, shuffle: iv ? `${id}:${iv.tries}` : '' }));
    let cat = ans.cat || classify(ans.text, b.cats);
    if (!b.cats[cat]) cat = '_';
    const out = b.cats[cat];
    await w(dialogue.line({ kind: 'say', who: 'yeonwoo', face: out.ok === false ? 'nervous' : 'determined', text: ans.text }));
    store.saveInterview({ ep: s.ep.id, id, q: plain(fill(q)), answer: ans.text, mode: ans.mode, cat });
    if (ans.helpers.repeat) award(s, 'ask', 3);
    if (ans.helpers.wait) award(s, 'calm', 3);

    if (out.follow && !followed) {
      followed = true;
      q = out.follow;
      continue;
    }
    attempts += 1;
    if (iv) return ivAnswer(s, b, iv, id, ans, cat, out, w);

    if (out.ok === false) {
      store.log({ type: 'fail', ep: s.ep.id, id, chosen: ans.text, oops: out.oops?.id || null });
      if (out.fail) await runSub(s, out.fail, w);
      await w(showOops(out.oops));
      restore(s, snap);
      q = b.q;
      followed = false;
      continue;
    }

    let reply = pickReply(out.reply);
    if (ans.mode !== 'chips' && b.llm !== false && store.settings().llm !== 'off') {
      ov.toast('점장님이 메모하고 있어요…', 'pen');
      const r = await w(llm.reply({ question: plain(fill(b.q)), answer: ans.text, catLabel: out.label || cat }));
      if (r) reply = r;
    }
    await w(dialogue.line({ kind: 'say', who: b.who || 'manager', face: out.face || 'smile', text: reply }));
    if (b.flag && out.value !== undefined) store.setFlag(b.flag, out.value);
    const level = attempts === 1 ? 3 : attempts === 2 ? 2 : 1;
    await celebrate(s, w, { skill: b.skill, level, title: b.title });
    store.log({ type: 'ask', ep: s.ep.id, id, q: plain(fill(b.q)), skill: b.skill || null, cat, mode: ans.mode, level, rewinds: attempts - 1, ms: Math.round(performance.now() - t0) });
    if (out.then) await runSub(s, out.then, w);
    return undefined;
  }
}

/* ---------------- 점수제 면접 (ivStart … ask … ivEnd) ---------------- */
async function ivStartBeat(s, b, index, w) {
  const again = s.iv && s.iv.index === index; // 탈락 뒤 다시 보는 면접
  const snap = snapshot(s);
  addPoint(s, index, '면접 처음부터', snap);
  const id = b.id || `${s.ep.id}@${index}`;
  save(s, index, id, snap);
  store.setFlag('ivAnswers', []);
  s.iv = { id, index, snap, pass: b.pass || 3, tries: again ? s.iv.tries + 1 : 1, open: true, llm: false, line: dialogue.history().slice(-1)[0] || null };
  // 로컬 LLM 이 없으면 '골라서 말하기'와 대본 반응만 (연결 확인은 2~3초 안)
  s.iv.llm = await w(llm.available());
  if (s.iv.llm) llm.warmup();
  return undefined;
}

/** 면접 대답 하나: 틀려도 바로 되감지 않고 기록. 점장님은 짧게 반응 */
async function ivAnswer(s, b, iv, id, ans, cat, out, w) {
  const ok = out.ok !== false;
  let reply = pickReply(out.reply);
  if (ok && iv.llm && ans.mode !== 'chips' && b.llm !== false && store.settings().llm !== 'off') {
    ov.toast('점장님이 메모하고 있어요…', 'pen');
    const r = await w(llm.reply({ question: plain(fill(b.q)), answer: ans.text, catLabel: out.label || cat }));
    if (r) reply = r;
  }
  await w(dialogue.line({ kind: 'say', who: b.who || 'manager', face: out.face || (ok ? 'smile' : 'think'), text: reply }));
  if (ok && b.flag && out.value !== undefined) store.setFlag(b.flag, out.value);
  const best = (b.chips || []).find((c) => b.cats[c.cat] && b.cats[c.cat].ok !== false);
  const rec = { id, title: b.title, skill: b.skill || null, ok, answer: ans.text, better: ok || !best ? '' : plain(fill(best.label)), oops: ok ? null : out.oops || null };
  store.setFlag('ivAnswers', [...(store.flag('ivAnswers') || []), rec]);
  store.log({ type: ok ? 'ask' : 'fail', ep: s.ep.id, id, q: plain(fill(b.q)), skill: b.skill || null, cat, mode: ans.mode, chosen: ans.text, oops: out.oops?.id || null, tries: iv.tries });
  if (ok && out.then) await runSub(s, out.then, w);
  return undefined;
}

/** 면접 끝: 알맞은 대답이 pass 개 이상이면 합격, 아니면 탈락 장면 → 돌아보기 → 면접 처음으로 되감기 */
async function ivEndBeat(s, b, index, w) {
  const iv = s.iv?.open ? s.iv : null;
  if (!iv) return undefined; // 면접 중간에서 이어 하기 등: 그냥 계속
  iv.open = false;
  const rows = store.flag('ivAnswers') || [];
  const okN = rows.filter((r) => r.ok).length;
  const pass = okN >= iv.pass;
  store.log({ type: 'interview', ep: s.ep.id, id: iv.id, ok: okN, total: rows.length, pass, tries: iv.tries });
  for (const r of rows) if (!r.ok && r.oops) store.addOops(r.oops.id); // 틀린 대답의 교훈은 아차 노트에
  if (pass) {
    if (rows.some((r) => !r.ok)) await w(ov.review({ pass, ok: okN, total: rows.length, need: iv.pass, rows }));
    const level = iv.tries === 1 ? 3 : iv.tries === 2 ? 2 : 1;
    await celebrate(s, w, { level, title: '면접 합격' });
    for (const sk of new Set(rows.filter((r) => r.ok && r.skill).map((r) => r.skill))) award(s, sk, level, { quiet: true });
    return undefined;
  }
  if (b.fail) await runSub(s, b.fail, w);
  await w(ov.review({ pass, ok: okN, total: rows.length, need: iv.pass, rows }));
  await w(ov.rewindFx());
  restore(s, iv.snap);
  return { jump: iv.index };
}

/* ---------------- 미니게임 ---------------- */
async function miniBeat(s, b, index, w) {
  const id = b.id || `${s.ep.id}@${index}`;
  const snap = snapshot(s);
  addPoint(s, index, b.title || b.name, snap);
  save(s, index, id, snap);
  const fn = MINIGAMES[b.name];
  if (!fn) { console.warn('[runner] 없는 미니게임', b.name); return undefined; }
  const r = await w(fn(b));
  workRecord(r);
  const level = r.attempts === 1 && r.mistakes === 0 ? 3 : r.attempts <= 2 && r.mistakes <= 2 ? 2 : 1;
  await celebrate(s, w, { skill: b.skill, level, title: b.title });
  store.log({ type: 'mini', ep: s.ep.id, id, name: b.name, skill: b.skill || null, attempts: r.attempts, mistakes: r.mistakes, level, ms: Math.round(r.ms || 0) });
  return undefined;
}

/* ---------------- v3 자립 근무: 근무판 · 시간 칸 · 정산 ---------------- */
function workCond(cond) {
  return checkCond(cond, { state: store.flag('work') || {}, plan: store.flag('workPlan') || {}, flag: (k) => store.flag(k) });
}

/** 미니게임 결과를 근무 상태(수습 별)에 더함 */
function workRecord(r) {
  const st = store.flag('work');
  if (!st || !cafe.isOn() || !r) return;
  store.setFlag('work', { ...st, mistakes: (st.mistakes || 0) + (r.mistakes || 0), rewinds: (st.rewinds || 0) + Math.max(0, (r.attempts || 1) - 1) });
}

async function boardBeat(s, b, index, w) {
  const id = b.id || `${s.ep.id}@${index}`;
  const snap = snapshot(s);
  addPoint(s, index, b.title || '근무판', snap);
  save(s, index, id, snap);
  s.board = { index, snap };
  dialogue.hide();
  const plan = await w(boardUI({ title: b.title, pool: b.pool || [], draft: s.planDraft || null, mentor: b.mentor || 'manager', tutorial: Boolean(b.tutorial), breakSlots: b.breakSlots || null }));
  dialogue.show();
  s.planDraft = plan;
  store.setFlag('workPlan', plan);
  store.log({ type: 'board', ep: s.ep.id, id, plan });
  return undefined;
}

async function blockBeat(s, b, index, w) {
  const bi = BLOCK_BY_ID[b.id]?.index;
  if (bi === undefined) return undefined;
  const block = BLOCKS[bi];
  const plan = store.flag('workPlan') || {};
  const state = store.flag('work') || initState();
  if (!cafe.isOn()) await w(cafe.mount());
  cafe.setBlock(bi);
  hud.setTime(block.time);
  const tasks = tasksOf(plan, block);
  await w(cafe.waitNext(block, tasks));
  tts.speakSeq([timeSpeech(block.time), ...tasks.map((id) => `${TASKS[id].label}.`)], 'sys');
  const { state: next, steps } = runBlock(state, plan, bi, b.day || {});
  let shown = { ...state };
  for (const st of steps) {
    shown = { ...shown };
    for (const [k, v] of Object.entries(st.delta || {})) shown[k] = (shown[k] || 0) + v;
    if (st.type === 'task') {
      const t = TASKS[st.id];
      if (t.mini && MINIGAMES[t.mini]) {
        const how = await w(cafe.askHands(st.id));
        if (how === 'hands') {
          // [그만하기]를 누르면 '보기'처럼 연우가 마저 함(실수로 세지 않음)
          let offQuit = null;
          const quitP = new Promise((res) => { offQuit = bus.on('mg:quit', () => res({ quit: true })); });
          // 무한 모드는 그날만의 옵션(b.day.mini, 예: 피크 주문서)을 더함
          const r = await w(Promise.race([MINIGAMES[t.mini]({ ...(t.miniOpts || {}), ...(b.day?.mini?.[st.id] || {}), title: t.label, from: block.time, quit: true }), quitP]));
          offQuit?.();
          if (r.quit) {
            abortMinigame();
            store.log({ type: 'mini', ep: s.ep.id, id: `${s.ep.id}:${st.id}`, name: t.mini, skill: null, quit: true });
          } else {
            next.mistakes = (next.mistakes || 0) + (r.mistakes || 0);
            next.rewinds = (next.rewinds || 0) + Math.max(0, (r.attempts || 1) - 1);
            store.log({ type: 'mini', ep: s.ep.id, id: `${s.ep.id}:${st.id}`, name: t.mini, skill: null, attempts: r.attempts, mistakes: r.mistakes, level: 0, ms: Math.round(r.ms || 0) });
          }
        }
      }
      await w(cafe.doTask(st.id, shown));
    } else {
      await w(cafe.guests(st.n, st.short, shown));
    }
  }
  store.setFlag('work', next);
  cafe.setMeters(next, { quiet: true });
  return undefined;
}

/** 계획 때문에 생긴 사건: 아차 → [근무판으로 되감기] 또는 [이대로 계속] */
async function workOopsBeat(s, b, index, w) {
  const o = { id: b.id, title: b.title, lesson: b.lesson, icon: b.icon || 'think' };
  const info = { ...(oopsInfo(o.id) || {}), ...o };
  const isNew = store.addOops(o.id);
  const st = store.flag('work') || initState();
  store.setFlag('work', { ...st, events: [...(st.events || []), { id: o.id, plan: true }] });
  store.log({ type: 'fail', ep: s.ep.id, id: o.id, chosen: 'plan', oops: o.id });
  const pick = await w(ov.oops({ ...info, found: oopsFound(), total: oopsTotal(), isNew, alt: '이대로 계속', rewindLabel: '근무판으로 되감기', hint: '근무판으로 돌아가 다시 짤 수 있어요. 이대로 계속해도 괜찮아요.' }));
  if (pick === 'rewind' && s.board) {
    await w(ov.rewindFx());
    s.points = s.points.filter((p) => p.index <= s.board.index);
    restore(s, s.board.snap);
    return { jump: s.board.index };
  }
  return undefined;
}

async function shiftEndBeat(s, b, index, w) {
  const st = store.flag('work') || initState();
  const p = payout(st, currentWage().hourly);
  cafe.setBlock(BLOCKS.length);
  dialogue.hide();
  await w(ov.payout({ day: b.day || '', ...p }));
  dialogue.show();
  cafe.unmount();
  store.log({ type: 'shift', ep: s.ep.id, plan: p.plan, handle: p.handle, smiles: p.smiles, guests: p.guests, money: p.money });
  award(s, 'time', p.plan, { quiet: true });
  award(s, 'safety', p.handle, { quiet: true });
  return undefined;
}

/* ------------------------------------------------------------------ */
/* 실행 루프                                                             */
/* ------------------------------------------------------------------ */
async function loop(s) {
  while (s.index < s.ep.script.length) {
    const b = s.ep.script[s.index];
    s.current = b;
    s.beatSnap = snapshot(s); // 수동 저장(세이브 슬롯)은 '지금 비트가 시작된 순간'을 저장
    let r;
    try {
      const p = exec(s, b, s.index);
      p.catch(() => {});
      r = await Promise.race([p, s.interrupt.p]);
    } catch (e) {
      if (!(e instanceof Interrupt)) throw e;
      s.epoch += 1;
      s.interrupt = deferred();
      if (e.kind === 'abort') return 'aborted';
      if (e.kind === 'jump') {
        const pt = e.data;
        s.points = s.points.filter((p) => p.index < pt.index);
        restore(s, pt.snap);
        await ov.rewindFx();
        s.index = pt.index;
        continue;
      }
      continue;
    }
    if (r && r.end) return 'ended';
    if (r && r.jump !== undefined) { s.index = r.jump; continue; }
    s.index += 1;
  }
  return 'ended';
}

export const runner = {
  /** 에피소드 실행. resume: store.checkpoint() 값 */
  async play(ep, { resume = null } = {}) {
    if (session) runner.abort();
    const s = newSession(ep);
    session = s;
    ov.clearAll();
    clearTask();
    cafe.unmount();
    docPanel.close(true);
    dialogue.clear();
    dialogue.resetHistory();
    dialogue.show();
    setCostumes(ep.costume);
    tutor.setEpisode(ep.id);
    hud.setEpisode(ep.label, ep.title);
    hud.setTime('');
    hud.setPlace('');
    hud.setSchedule(ep.schedule, []);
    hud.setRewindEnabled(false);
    hud.show();
    if (resume && resume.ep === ep.id) {
      restore(s, resume.snapshot);
      s.index = resume.index;
      // 세이브 슬롯에서 불러온 경우: 이 에피소드에서 모은 도장·사진·말, 근무판 되감기 정보도 함께
      if (Array.isArray(resume.stamps)) s.stamps = [...resume.stamps];
      if (Array.isArray(resume.photos)) s.photos = [...resume.photos];
      if (Array.isArray(resume.terms)) s.terms = [...resume.terms];
      if (resume.work?.boardSnap) { s.board = { index: resume.work.boardIndex, snap: resume.work.boardSnap }; s.planDraft = resume.work.planDraft || null; }
    } else {
      stage.clear();
      memo.clear();
      audio.stopAll();
    }
    const t0 = Date.now();
    const status = await loop(s);
    store.addPlayTime(Date.now() - t0);
    if (session === s) { session = null; tutor.setEpisode(null); }
    tts.stop();
    return { status, stamps: s.stamps, photos: s.photos, terms: s.terms, ms: Date.now() - t0 };
  },

  rewindPoints() { return session ? session.points.slice().reverse() : []; },

  /**
   * 세이브 슬롯에 넣을 지금 상태. 진행 중인 비트가 시작된 순간으로 저장합니다(불러오면 그 비트부터 다시).
   * 점수제 면접 안이면 면접 처음(ivStart)으로 — 면접 점수가 세션에만 있기 때문
   */
  captureSave() {
    const s = session;
    if (!s || !s.beatSnap) return null;
    const inIv = Boolean(s.iv?.open);
    // 면접 안이면 면접이 시작될 때의 마지막 대사를 보여 줌(불러오면 거기부터 다시 하므로)
    const last = inIv ? s.iv.line : (dialogue.history().slice(-1)[0] || null);
    return {
      ep: s.ep.id,
      index: inIv ? s.iv.index : s.index,
      snapshot: inIv ? s.iv.snap : s.beatSnap,
      stamps: [...s.stamps], photos: [...s.photos], terms: [...s.terms],
      work: s.board ? { boardIndex: s.board.index, boardSnap: s.board.snap, planDraft: s.planDraft || null } : null,
      line: last ? { label: last.label || '', text: last.text } : null,
      note: inIv ? '면접 처음부터' : '',
    };
  },


  jumpTo(point) {
    if (!session) return;
    session.interrupt.reject(new Interrupt('jump', point));
  },

  abort() {
    if (!session) return;
    const s = session;
    session = null;
    tutor.setEpisode(null);
    s.interrupt.reject(new Interrupt('abort'));
    s.epoch += 1;
    tts.stop();
    ov.clearAll();
    vfx.clear();
    clearTask();
    cafe.unmount();
    docPanel.close(true);
  },

  isRunning() { return Boolean(session); },
  currentEpisode() { return session?.ep || null; },
  /** 디버그·자동 테스트용: 지금 실행 중인 비트 */
  currentBeat() { return session?.current || null; },
};
