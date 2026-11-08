/**
 * 자동 플레이 테스트 (브라우저에서 실행)
 *   1) http://localhost:5173/?debug 로 연 뒤
 *   2) 개발자 도구 콘솔에서:
 *        const { autoplay } = await import('/tools/autoplay.js');
 *        await autoplay({ episode: 'prologue', bad: true });
 * 에피소드를 처음부터 결과 화면까지 자동으로 진행하며, 실행 중 오류를 모아 돌려줍니다.
 * bad: true 이면 판단 카드마다 나쁜 선택을 먼저 모두 골라 '결과 장면 → 아차! → 되감기'까지 검사합니다.
 * 엔딩(episode: 'ending')은 결과 화면 대신 근무표에 닿으면 끝납니다.
 * timeout: true 이면 시간 제한 막대가 있는 판단·주문마다 한 번은 아무것도 누르지 않고 시간이 다 되게 둡니다(시간 초과 → 아차 → 되감기 검사).
 */

const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const q = (s) => document.querySelector(s);
const qa = (s) => [...document.querySelectorAll(s)];

async function solveMini(mg, { bad = false, tried = new Set() } = {}) {
  // v3 미니게임(쏟은 음료 · 4장 받기·청소·지렁이): bad 이면 나쁜 행동을 한 번 먼저(아차 → 되감기 검사), 그다음 자동 풀이(__mgAuto)
  const arcade = mg.dataset.arcade; // catch · whack · snake (+ 모양은 클래스 ct-ice 등)
  if (mg.classList.contains('mg-spill') || arcade) {
    if (mg.dataset.auto) return;
    const kind = arcade ? `${arcade}:${[...mg.classList].find((c) => /^(ct|wh)-/.test(c)) || ''}` : 'spill';
    if (bad && !tried.has(kind)) {
      tried.add(kind);
      if (kind === 'spill') {
        mg.querySelector('.sp-tool[data-tool="mop"]')?.click(); await wait(120);
        for (let i = 0; i < 2; i++) { mg.querySelector('.sp-tile.can')?.click(); await wait(500); }
      } else if (window.__mgBad) {
        await window.__mgBad();
        await wait(300);
      }
      return;
    }
    // 기다리지 않음: 자동 풀이 중에 아차 카드가 뜨면 바깥 고리가 닫아 줌(4장 손맛 미니게임은 실시간)
    if (window.__mgAuto && !q('#layer-overlay .ov')) { mg.dataset.auto = '1'; window.__mgAuto(); }
    return;
  }
  // 손 씻기
  if (mg.classList.contains('mg-handwash')) {
    const act = mg.querySelector('.hw-tiles .act-btn');
    if (act) { act.click(); return; }
    const next = mg.querySelector('.hw-poster li:not(.done)');
    if (next) mg.querySelector(`.hw-tile[data-i="${next.dataset.n}"]`)?.click();
    return;
  }
  // 컵·빨대 채우기
  if (mg.classList.contains('mg-cups')) {
    const label = mg.querySelector('.cup-item span:not(.px)')?.textContent || ''; // .px 는 픽셀 그림
    const bin = /종이컵/.test(label) ? 'paper' : /아이스컵/.test(label) ? 'ice' : /빨대/.test(label) ? 'straw' : 'lid';
    mg.querySelector(`.cup-bin[data-bin="${bin}"]`)?.click();
    return;
  }
  // 주문서 확인
  if (mg.classList.contains('mg-order')) {
    const { MENU } = await import('/js/game/minigames/order.js');
    const byName = Object.fromEntries(Object.entries(MENU).map(([k, m]) => [m.name, k]));
    const inTray = mg.querySelectorAll('.od-in').length;
    if (!inTray) {
      for (const li of mg.querySelectorAll('.od-ticket li')) {
        const k = byName[li.querySelector('span:not(.px)').textContent];
        const n = Number(li.querySelector('b').textContent.replace(/[^0-9]/g, ''));
        for (let i = 0; i < n; i++) { mg.querySelector(`.od-item[data-k="${k}"]`)?.click(); await wait(30); }
      }
      await wait(60);
    }
    mg.querySelector('.od-done')?.click();
    return;
  }
  // 퇴근 전 정리
  if (mg.classList.contains('mg-closing')) {
    const spot = mg.querySelector('.cl-spot:not([disabled]):not([data-id="machine"])');
    if (spot) spot.click(); else mg.querySelector('.cl-list .btn')?.click();
    return;
  }
  // 나의 첫 메모
  if (mg.classList.contains('mg-memo')) {
    const on = mg.querySelectorAll('.mw-tip.on').length;
    if (on < 3) mg.querySelectorAll('.mw-tip:not(.on)')[0]?.click();
    else mg.querySelector('.mw-side .btn-big')?.click();
  }
}

export async function autoplay({ episode = null, bad = false, timeout = false, delay = 40, maxSteps = 6000 } = {}) {
  const J = window.__jm;
  if (!J) throw new Error('?debug 로 열어 주세요');
  const errors = [];
  const onErr = (e) => errors.push(String(e.message || e.reason || e));
  window.addEventListener('error', onErr);
  window.addEventListener('unhandledrejection', onErr);
  const stats = { steps: 0, decides: 0, fails: 0, asks: 0, minis: 0, beatsSeen: new Set() };
  if (!J.store.hasProfile()) J.store.createProfile('자동테스트');
  J.store.setSettings({ textSpeed: 'instant', voice: 'off', motion: 'reduced', auto: 'off', selectMode: 'one' });
  if (episode) { J.nav.go('play', episode); await wait(300); }
  const triedBad = new Set();
  const triedPlan = new Set(); // 근무판: bad 이면 처음 한 번은 준비를 빠뜨린 계획
  const triedMini = new Set();
  const triedTimeout = new Set(); // 시간 초과를 해 본 판단·주문

  try {
    while (stats.steps++ < maxSteps) {
      await wait(delay);
      const beat = J.runner.currentBeat();
      if (beat) stats.beatsSeen.add(beat);

      if (q('#layer-screen .scr-result')) break;
      if (q('#layer-overlay .ov-daily')) break; // 매일 매일 카페 생활: 하루 끝 카드에서 멈춤(다음 날로 끝없이 가지 않게)
      // 엔딩은 결과 화면 없이 (처음이면 '모든 이야기가 열렸어요' 알림 뒤) 근무표로 나감
      if (q('#layer-screen .scr-hub') && !J.runner.isRunning()) break;

      const ov = q('#layer-overlay .ov');
      if (ov) {
        if (ov.classList.contains('ov-oops')) stats.fails += 1;
        // 근무판 아차(두 버튼): 처음엔 근무판으로 되감기, 같은 아차가 또 나오면 이대로 계속
        const alt = ov.querySelector('.oops-btns .btn-soft');
        if (ov.classList.contains('ov-oops') && alt) {
          const title = ov.querySelector('.oops-title')?.textContent || '';
          if (!triedBad.has(`plan:${title}`)) { triedBad.add(`plan:${title}`); ov.querySelector('.btn-rewind').click(); } else alt.click();
          await wait(300);
          continue;
        }
        if (ov.classList.contains('ov-breathe')) {
          (ov.querySelector('.btn-big:not(.is-hidden)') || ov.querySelector('.br-btns .btn-small'))?.click();
          continue;
        }
        if (ov.classList.contains('ov-rewind')) continue;
        (ov.querySelector('.btn-rewind') || ov.querySelector('.act-btn') || ov.querySelector('.btn-big') || ov.querySelector('.ov-next') || ov.querySelector('button'))?.click();
        continue;
      }
      const docNext = q('.doc-next-wrap .doc-next');
      if (docNext) { docNext.click(); continue; }
      const seal = q('.docp .act-btn');
      if (seal) { seal.click(); continue; }

      const iv = q('#layer-task .iv.is-in');
      if (iv && beat?.t === 'ask') {
        const chips = [...iv.querySelectorAll('.iv-chip')];
        if (!chips.length) { iv.querySelector('.iv-tab')?.click(); continue; }
        let idx = beat.chips.findIndex((c) => beat.cats[c.cat]?.ok !== false);
        if (bad) {
          const bi = beat.chips.findIndex((c) => beat.cats[c.cat]?.ok === false);
          if (bi >= 0 && !triedBad.has(`${beat.id}:${bi}`)) { triedBad.add(`${beat.id}:${bi}`); idx = bi; }
        }
        stats.asks += 1;
        // 점수제 면접은 선택지를 섞으므로 분류(data-cat)로 찾음
        (iv.querySelector(`.iv-chip[data-cat="${beat.chips[idx]?.cat}"]`) || chips[idx])?.click();
        continue;
      }

      // v3 근무판: 빈칸을 비우고 다시 짬(bad 면 처음 한 번은 얼음·컵을 빠뜨림)
      const wb = q('.wk-board.is-in');
      if (wb && !wb.dataset.auto) {
        wb.dataset.auto = '1';
        stats.boards = (stats.boards || 0) + 1;
        for (const slot of [...wb.querySelectorAll('.wk-slot.filled')]) { slot.click(); await wait(60); }
        const pool = [...wb.querySelectorAll('.wk-pool .wk-mag')].map((m) => m.dataset.task);
        const badPlan = bad && !triedPlan.has(beat?.id);
        if (badPlan) triedPlan.add(beat?.id);
        const prep = badPlan ? ['bread_display', 'wipe_tables', 'sweep'] : ['check_ice', 'restock_cups', 'bread_display'];
        const want = { s1: prep[0], s2: prep[1], s3: prep[2], s4: 'break', s5: badPlan ? 'trash' : 'wipe_tables' };
        const used = new Set(Object.values(want));
        want.s7 = pool.find((id) => !used.has(id) && id !== 'break') || null;
        for (const [blk, id] of Object.entries(want)) {
          if (!id || !pool.includes(id)) continue;
          wb.querySelector(`.wk-slot[data-block="${blk}"]`)?.click(); await wait(60);
          wb.querySelector(`.wk-pool .wk-mag[data-task="${id}"]`)?.click(); await wait(80);
        }
        for (let i = 0; i < 3 && q('.wk-board.is-in'); i++) { wb.querySelector('.wk-ok')?.click(); await wait(300); }
        continue;
      }
      if (wb) continue;
      const handsAsk = q('.wk-now-ask');
      if (handsAsk) { q('.wk-now .wk-hand.do')?.click(); continue; }
      const wkNext = q('.wk-next:not([disabled])');
      if (wkNext) { wkNext.click(); stats.blocks = (stats.blocks || 0) + 1; continue; }

      const mg = q('#layer-task .mg.is-in');
      if (mg) {
        // 시간 초과 검사: 막대가 있는 주문은 손님마다 한 번 그냥 둠
        const tm = mg.querySelector('.tm');
        const key = `order:${mg.querySelector('.od-who')?.textContent || ''}`;
        if (timeout && tm && !tm.classList.contains('over') && (!triedTimeout.has(key) || mg.dataset.waiting === '1')) {
          if (!triedTimeout.has(key)) { triedTimeout.add(key); mg.dataset.waiting = '1'; stats.timeouts = (stats.timeouts || 0) + 1; }
          continue;
        }
        stats.minis += 1; await solveMini(mg, { bad, tried: triedMini }); continue;
      }

      const wrap = q('#layer-task .cards-wrap.is-in');
      // 시간 초과 검사: 막대가 있는 판단은 한 번 그냥 둠(막대가 다 줄 때까지)
      if (wrap && timeout && beat?.t === 'decide' && beat.timer && wrap.querySelector('.tm') && (!triedTimeout.has(beat.id) || wrap.dataset.waiting === '1')) {
        if (!triedTimeout.has(beat.id)) { triedTimeout.add(beat.id); wrap.dataset.waiting = '1'; stats.timeouts = (stats.timeouts || 0) + 1; }
        continue;
      }
      if (wrap) {
        const cards = [...wrap.querySelectorAll('.card')];
        let idx = 0;
        if (beat?.t === 'decide') {
          stats.decides += 1;
          idx = beat.choices.findIndex((c) => c.ok);
          if (bad) {
            const bi = beat.choices.findIndex((c, i) => !c.ok && !wrap.querySelector(`.card[data-i="${i}"]`)?.classList.contains('tried'));
            if (bi >= 0) idx = bi;
          }
        }
        (wrap.querySelector(`.card[data-i="${idx}"]`) || cards[idx])?.click();
        await wait(150);
        continue;
      }
      q('.dlg')?.click();
    }
  } finally {
    window.removeEventListener('error', onErr);
    window.removeEventListener('unhandledrejection', onErr);
  }
  const reachedResult = Boolean(q('#layer-screen .scr-result') || q('#layer-overlay .ov-daily') || (episode === 'ending' && q('#layer-screen .scr-hub')));
  return { reachedResult, steps: stats.steps, beats: stats.beatsSeen.size, decides: stats.decides, fails: stats.fails, asks: stats.asks, minis: stats.minis, boards: stats.boards || 0, blocks: stats.blocks || 0, timeouts: stats.timeouts || 0, oopsFound: J.store.oopsList().length, errors };
}

/** 결과 화면을 지나 다음 에피소드로 넘어가기 */
export async function passResult() {
  for (let i = 0; i < 40; i++) {
    await wait(120);
    const scr = q('#layer-screen .scr-result');
    if (!scr) return 'left';
    const feel = scr.querySelector('.rs-feel-btn');
    if (feel) { feel.click(); continue; }
    const btn = [...scr.querySelectorAll('button')].find((b) => /일기 쓰기|다음 이야기|처음 화면/.test(b.textContent));
    btn?.click();
  }
  return 'stuck';
}

/**
 * 음성 파일 확인: 에피소드를 자동으로 돌리며, 읽어 준 문장마다 미리 만든 음성 파일이 있는지 셉니다.
 *   const { voiceCoverage } = await import('/tools/autoplay.js');
 *   await voiceCoverage();                       // 전체 (몇 분 걸림)
 *   await voiceCoverage({ episodes: ['d2'] });   // 한 에피소드만
 * miss 에 나온 문장은 tools/export-lines.mjs(또는 미니게임 xxxLines)에 빠진 것입니다.
 * 이름({player})이 든 문장은 원래 브라우저 음성으로 읽으므로 miss 에 남습니다.
 */
export async function voiceCoverage({ episodes = ['prologue', 'ch1', 'd1', 'd2', 'd3', 'd4', 'd5', 'ch3', 'epilogue', 'ch4_1', 'ending'], bad = true } = {}) {
  const { tts, voiceKey } = await import('/js/av/tts.js');
  const manifest = await fetch('/assets/voice/manifest.json', { cache: 'no-store' }).then((r) => r.json()).then((m) => m.lines || {}).catch(() => ({}));
  const spoken = [];
  const rec = (text, who) => {
    const t = String(text ?? '');
    if (t.trim()) spoken.push({ who, text: t, ok: Boolean(manifest[voiceKey(who, t)]) });
  };
  const orig = { speak: tts.speak, speakSeq: tts.speakSeq };
  tts.speak = (text, who = 'narr') => { rec(text, who); return Promise.resolve(); };
  tts.speakSeq = async (parts, who = 'sys') => { for (const p of parts) rec(p, who); };
  const runs = [];
  try {
    for (const ep of episodes) {
      const r = await autoplay({ episode: ep, bad });
      runs.push({ ep, reachedResult: r.reachedResult, errors: r.errors });
      await passResult();
    }
  } finally {
    Object.assign(tts, orig);
  }
  const miss = [...new Map(spoken.filter((x) => !x.ok).map((x) => [`${x.who} | ${x.text}`, x])).keys()];
  return { files: Object.keys(manifest).length, spoken: spoken.length, withFile: spoken.filter((x) => x.ok).length, miss, runs };
}
