/**
 * 에피소드 목록 (3막 9에피소드 + 4막 자립 근무편) + 엔딩
 */

import prologue from './prologue.js';
import ch1 from './ch1.js';
import d1 from './d1.js';
import d2 from './d2.js';
import d3 from './d3.js';
import d4 from './d4.js';
import d5 from './d5.js';
import ch3 from './ch3.js';
import epilogue from './epilogue.js';
import ch4_1 from './ch4_1.js';
import ending from './ending.js';
import { registerOops } from '../../core/oops.js';
import { MINIGAME_OOPS } from '../../game/minigames/index.js';
import { PEAK_OOPS } from '../work/tasks.js';
import { dailyEpisode, DAILY_OOPS } from '../daily.js';

/** 이야기 순서(도장·일기·결과 화면이 있는 에피소드). 엔딩은 여기에 넣지 않습니다 */
export const EPISODES = [prologue, ch1, d1, d2, d3, d4, d5, ch3, epilogue, ch4_1];

export const ACTS = [
  { n: 1, title: '제1막 · 첫 관문', sub: '출근길과 면접', ids: ['prologue', 'ch1'] },
  { n: 2, title: '제2막 · 첫 주', sub: '월요일부터 금요일까지', ids: ['d1', 'd2', 'd3', 'd4', 'd5'] },
  { n: 3, title: '제3막 · 나의 이정표', sub: '피크타임과 첫 메모', ids: ['ch3', 'epilogue'] },
  { n: 4, title: '제4막 · 자립 근무', sub: '내 하루를 내가 짜요', ids: ['ch4_1'] },
];

/**
 * 엔딩: 마지막 막의 마지막 에피소드(FINALE)를 처음 마치면 결과 화면 뒤에 나옵니다(main.js).
 * 엔딩을 본 학생은 모든 이야기가 늘 열립니다(hub.js). 4장 2~4화를 ACTS 에 넣으면 FINALE 도 저절로 바뀝니다.
 */
export const ENDING = ending;
export const FINALE = ACTS[ACTS.length - 1].ids[ACTS[ACTS.length - 1].ids.length - 1];

/**
 * 판단 카드의 정답 자리를 고르게: 이야기 순서대로, 카드 수가 같은 판단끼리 정답(첫 good) 자리를 0 → 1 → 2 … 로 돌려 가며 둠.
 * 나머지 카드는 원래 순서 그대로. decide.order(화면 자리 → 원래 카드 번호)를 cards.js 가 씀. 대본 파일의 순서는 바꾸지 않음
 */
{
  const turn = {};
  for (const ep of EPISODES) for (const b of ep.script) {
    if (b.t !== 'decide') continue;
    const n = b.choices.length;
    const good = b.choices.findIndex((c) => c.ok);
    const slot = (turn[n] = (turn[n] ?? -1) + 1) % n;
    const rest = b.choices.map((_, i) => i).filter((i) => i !== good);
    b.order = good < 0 ? null : [...rest.slice(0, slot), good, ...rest.slice(slot)];
  }
}

const byId = new Map([...EPISODES, ENDING].map((e) => [e.id, e]));

/** 에피소드(또는 엔딩, 매일 매일 카페 생활의 하루 'daily:주:요일') 찾기: 근무표·세이브 슬롯·이어하기·nav.go('play', id) 가 씀 */
export function getEpisode(id) { return byId.get(id) || dailyEpisode(id) || null; }

export function nextEpisode(id) {
  const i = EPISODES.findIndex((e) => e.id === id);
  return i >= 0 && i < EPISODES.length - 1 ? EPISODES[i + 1] : null;
}

/** 에피소드 안의 모든 '아차!' 결과 모으기 */
export function collectOops(ep) {
  const out = [];
  const walk = (list) => {
    for (const b of list || []) {
      if (b.t === 'decide') {
        for (const c of b.choices) if (!c.ok && c.oops) out.push({ ...c.oops, ep: ep.id });
        if (b.timer?.oops) out.push({ ...b.timer.oops, ep: ep.id }); // 시간이 다 됐을 때(따로 쓴 결과)
      } else if (b.t === 'ask') {
        for (const c of Object.values(b.cats || {})) if (c.ok === false && c.oops) out.push({ ...c.oops, ep: ep.id });
      } else if (b.t === 'mini' && b.oops) {
        out.push({ ...b.oops, ep: ep.id });
        if (b.timer?.oops) out.push({ ...b.timer.oops, ep: ep.id });
      } else if (b.t === 'workOops') {
        out.push({ id: b.id, title: b.title, lesson: b.lesson, icon: b.icon, ep: ep.id });
      }
      if (b.t === 'branch') for (const l of Object.values(b.cases || {})) walk(l);
    }
  };
  walk(ep.script);
  return out;
}

// 4장 미니게임(쏟은 음료·받기·청소·쉬는 시간)과 근무판 자석(피크 주문)의 아차는 처음 나오는 4장 1화에 묶음
export const ALL_OOPS = [...EPISODES.flatMap(collectOops), ...[...MINIGAME_OOPS, PEAK_OOPS, ...Object.values(DAILY_OOPS)].map((o) => ({ ...o, ep: 'ch4_1' }))];
registerOops(ALL_OOPS);
