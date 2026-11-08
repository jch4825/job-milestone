/**
 * 직업 마1스톤 v2 - 진입점
 * 화면 연결(nav), HUD 버튼, 에피소드 실행 흐름을 묶습니다.
 */

import { CONFIG } from './config.js';
import { initScale } from './core/scale.js';
import { input } from './core/input.js';
import { store } from './core/store.js';
import { bus } from './core/bus.js';
import { nav } from './core/nav.js';
import { runner } from './core/runner.js';
import { setTextContext } from './core/text.js';
import { audio } from './av/audio.js';
import { tts } from './av/tts.js';
import { img } from './core/assets.js';
import { stage } from './ui/stage.js';
import { vfx } from './ui/vfx.js';
import { memo } from './ui/memo.js';
import { hud } from './ui/hud.js';
import { dialogue } from './ui/dialogue.js';
import { breathe } from './ui/breathe.js';
import { tutor } from './ui/tutor.js';
import { preloadEpisode, warmAll } from './ui/loading.js';
import { getEpisode, nextEpisode, ENDING, FINALE } from './data/episodes/index.js';
import { dailyId, WEEKDAYS, DAILY_SAY } from './data/daily.js';
import { ov } from './ui/overlays.js';
import { showTitle, hideTitle } from './screens/title.js';
import { showProfileSetup } from './screens/profile.js';
import { showHub } from './screens/hub.js';
import { showResult } from './screens/result.js';
import { showNotebook } from './screens/notebook.js';
import { showSettings, applySettingsToBody } from './screens/settings.js';
import { showTeacher } from './screens/teacher.js';
import { showPause, showBacklog, showRewindList } from './screens/menus.js';
import { closeAllScreens } from './screens/screen.js';
import { showSaves } from './screens/saves.js';

let playing = false;

/** resume: 자동 저장(이어하기)부터 · save: 세이브 슬롯에서 불러온 저장 데이터 */
async function playEpisode(id, { resume = false, save = null } = {}) {
  const ep = getEpisode(id);
  if (!ep) return;
  if (runner.isRunning()) runner.abort();
  closeAllScreens();
  hideTitle();
  audio.unlock();
  playing = true;
  await preloadEpisode(ep); // 출근 중 화면: 그날 그림을 미리 받기(웹판)
  const result = await runner.play(ep, { resume: save || (resume ? store.checkpoint() : null) });
  playing = false;
  if (result.status !== 'ended') return;
  if (ep.id === ENDING.id) { await afterEnding(); return; }
  if (ep.daily) { await afterDaily(ep); return; }
  store.markDone(ep.id);
  hud.hide();
  dialogue.hide();
  // 이야기의 마지막 에피소드를 처음 마치면 결과 화면 뒤에 엔딩(본 뒤에 다시 하면 엔딩은 근무표에서)
  const endingNext = ep.id === FINALE && store.ending()?.after !== FINALE;
  const next = await showResult(ep, result, { ending: endingNext });
  if (next === 'ending') nav.go('play', ENDING.id);
  else if (next === 'next' && nextEpisode(ep.id)) nav.go('play', nextEpisode(ep.id).id);
  else if (next === 'hub') { nav.go('title'); nav.go('hub'); }
  else nav.go('title');
}

/**
 * 매일 매일 카페 생활의 하루가 끝나면: 오늘 번 돈·웃은 손님을 쌓고 다음 날(금요일 뒤에는 다음 주 월요일)로.
 * 지난 날을 근무표·불러오기로 다시 했으면 기록은 그대로 두고 카드만 보여 줌
 */
async function afterDaily(ep) {
  hud.hide();
  dialogue.hide();
  if (store.checkpoint()?.ep === ep.id) store.clearCheckpoint(); // 끝난 하루는 처음 화면 '이어하기'에서 빼기
  const { week, day } = ep.daily;
  const d = store.daily();
  const shift = [...store.logs()].reverse().find((l) => l.type === 'shift' && l.ep === ep.id) || {};
  const money = shift.money || 0;
  const smiles = shift.smiles || 0;
  let next = d;
  if (d.week === week && d.day === day) {
    next = {
      ...d,
      money: d.money + money,
      smiles: d.smiles + smiles,
      days: d.days + 1,
      weekMoney: (day === 0 ? 0 : d.weekMoney) + money,
      weekSmiles: (day === 0 ? 0 : d.weekSmiles) + smiles,
      week: day >= 4 ? week + 1 : week,
      day: day >= 4 ? 0 : day + 1,
    };
    store.setDaily(next);
  }
  const weekEnd = day >= 4;
  const pick = await ov.dailyDone({
    week, dayName: WEEKDAYS[day], money, smiles, weekMoney: next.weekMoney, weekSmiles: next.weekSmiles, days: next.days,
    weekEnd, say: weekEnd ? DAILY_SAY.week : DAILY_SAY.day,
  });
  if (pick === 'next') nav.go('play', dailyId(next.week, next.day));
  else { nav.go('title'); nav.go('hub'); }
}

/** 엔딩이 끝나면: 본 것으로 기록 → (처음이면) 모든 이야기가 열렸다는 알림 → 근무표 */
async function afterEnding() {
  const first = !store.ending();
  store.markEnding(FINALE);
  hud.hide();
  dialogue.hide();
  if (first) await ov.info({ title: ENDING.notice.title, body: ENDING.notice.body, icon: 'calendar', button: '근무표 보기' });
  nav.go('title');
  nav.go('hub');
}

function bindHud() {
  bus.on('hud:rewind', () => showRewindList());
  bus.on('hud:memo', () => memo.toggle());
  bus.on('hud:notebook', () => showNotebook());
  bus.on('hud:breathe', async () => {
    const done = await breathe({ note: '천천히, 하나 둘 셋. 언제든 여기서 숨을 고를 수 있어요.' });
    store.log({ type: 'breathe-self', done });
  });
  bus.on('hud:settings', () => showSettings());
  bus.on('hud:pause', () => showPause());
  bus.on('hud:backlog', () => showBacklog());
  bus.on('escape', () => {
    if (playing && !document.querySelector('#layer-screen .scr, #layer-modal .ov, #layer-overlay .ov')) showPause();
  });
  document.addEventListener('keydown', (e) => {
    if (!playing) return;
    const tag = (document.activeElement?.tagName || '').toLowerCase();
    if (tag === 'input' || tag === 'textarea') return;
    if ((e.key === 'Backspace' || e.key === 'r' || e.key === 'R') && !document.querySelector('#layer-screen .scr, #layer-modal .ov')) {
      e.preventDefault();
      showRewindList();
    }
  });
}

function unlockOnFirstGesture() {
  const go = () => {
    audio.unlock();
    window.removeEventListener('pointerdown', go, true);
    window.removeEventListener('keydown', go, true);
  };
  window.addEventListener('pointerdown', go, true);
  window.addEventListener('keydown', go, true);
}

async function boot() {
  document.title = CONFIG.TITLE;
  initScale();
  stage.init();
  vfx.init();
  memo.init();
  hud.init();
  dialogue.init();
  input.init();
  applySettingsToBody();
  setTextContext({ player: store.active()?.name || '플레이어' });
  bus.on('profile', (p) => {
    applySettingsToBody();
    setTextContext({ player: p?.name || '플레이어' });
  });
  bus.on('settings', () => applySettingsToBody());
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches && store.hasProfile() && store.settings().motion === 'full' && !store.active().settings.motionChosen) {
    store.setSettings({ motion: 'reduced', motionChosen: true });
  }

  await Promise.all([audio.init(), tts.init(), img.init()]);
  tutor.init(); // 그림 목록(손가락 그림)을 읽은 뒤

  nav.register('title', () => { if (runner.isRunning()) runner.abort(); closeAllScreens(); showTitle(); });
  nav.register('newProfile', showProfileSetup);
  nav.register('hub', showHub);
  nav.register('play', playEpisode);
  nav.register('notebook', showNotebook);
  nav.register('settings', showSettings);
  nav.register('teacher', showTeacher);
  nav.register('saves', (mode) => showSaves(mode));
  nav.register('breathe', () => bus.emit('hud:breathe'));

  bindHud();
  unlockOnFirstGesture();
  // 자동 플레이 테스트(tools/autoplay.js)용 디버그 훅: 주소에 ?debug 가 있을 때만
  if (new URLSearchParams(location.search).has('debug')) window.__jm = { runner, store, nav, getEpisode, img, stage, vfx, tutor };
  nav.go('title');
  document.getElementById('boot')?.remove();
  // 모든 그림을 뒤에서 미리 받기(표지 그림·영상이 먼저 뜬 뒤): 이어 할 이야기가 있으면 그 그림부터(2026-10-26)
  const cp = store.checkpoint();
  setTimeout(() => warmAll(cp ? getEpisode(cp.ep) : null), 800);
}

boot().catch((e) => {
  console.error(e);
  const b = document.getElementById('boot');
  if (b) b.textContent = `시작하지 못했어요: ${e.message}`;
});
