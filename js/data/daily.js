/**
 * 매일 매일 카페 생활 (무한 모드, 2026-10-15) — 엔딩을 본 뒤 근무표 가운데에 열림
 *  - 이야기는 가볍게: 아침 메모(오늘의 조건) → 아침 브리핑 → 근무판 → 근무(미니게임) → 계획의 결과 → 퇴근 정산 → 다음 날
 *  - 메모 판(오늘의 조건) 30가지를 돌려 씀(사용자: "메모에 제시되는 조건이 여러 버전, 몇 십 개"). 판마다 손님 수·빨리 줄어드는 것·
 *    아침에 모자란 것·쉬는 시간·마감 점검이 달라서, 메모를 읽고 근무판을 짜야 하루가 매끄럽습니다(정답 대조가 아니라 하루의 결과)
 *  - 하루 = 만들어 낸 에피소드 'daily:주:요일'. 주·요일이 같으면 늘 같은 하루(되감기·저장·이어하기가 그대로 됨, Math.random 쓰지 않음)
 *  - 읽어 주는 문장은 모두 고정 문장(음성 파일). 주 번호·돈 액수는 화면에만 보입니다.
 *  - 한 주(월~금) 안에서는 같은 메모 판이 겹치지 않고, 주마다 순서가 달라집니다.
 */

import {
  bg, bgm, amb, sfx, show, say, narr, think, time, place, memo, big, act, mini,
  briefing, board, shiftStart, block, workSet, workOops, shiftEnd, onlyIf, end,
} from '../core/dsl.js';

export const WEEKDAYS = ['월요일', '화요일', '수요일', '목요일', '금요일'];
export const DAILY_LABEL = '매일 매일 카페 생활';
export const dailyId = (week, day) => `daily:${week}:${day}`;
export function parseDailyId(id) {
  const m = /^daily:(\d+):([0-4])$/.exec(String(id || ''));
  return m ? { week: Number(m[1]), day: Number(m[2]) } : null;
}

/** 하루를 마칠 때 읽어 주는 말(js/ui/overlays.js dailyDone) */
export const DAILY_SAY = {
  day: '오늘 근무를 마쳤어요. 내일도 함께해요!',
  week: '이번 주 근무를 모두 마쳤어요. 정말 수고했어요!',
  hub: '근무판을 짜고, 미니게임으로 일해요. 날마다 메모가 달라요.',
};

/** 매일 매일 카페 생활에서만 나오는 아차(아차 노트에는 4장 1화에 묶음: js/data/episodes/index.js) */
export const DAILY_OOPS = {
  cupsEarly: { id: 'daily_cups_early', title: '아침부터 컵이 없었어요', lesson: '컵이 없으면 손님이 기다려야 해요. 메모를 보고 손님이 오기 전에 채워요.', icon: 'icecup' },
  dirtyEarly: { id: 'daily_dirty_early', title: '아침부터 매장이 지저분했어요', lesson: '지저분하면 손님 기분이 나빠져요. 메모를 보고 오픈 전에 바닥을 쓸어요.', icon: 'mop' },
  iceEarly: { id: 'daily_ice_early', title: '아침부터 얼음이 없었어요', lesson: '얼음이 없으면 아이스 음료를 못 만들어요. 메모를 보고 바쁘기 전에 채워요.', icon: 'ice' },
  breadEarly: { id: 'daily_bread_early', title: '오전에 빵이 다 팔렸어요', lesson: '빵이 잘 팔리는 날은 빨리 비어요. 메모를 보고 오전에도 빵을 채워요.', icon: 'croissant' },
  inspect: { id: 'daily_inspect', title: '위생 점검에서 지적을 받았어요', lesson: '점검 날에는 매장이 깨끗해야 해요. 마감 전에 청소 자석을 넣어요.', icon: 'sparkle' },
  trash: { id: 'daily_trash', title: '쓰레기를 내놓지 못했어요', lesson: '수거 시간이 지나면 쓰레기가 가게에 남아요. 메모의 시간 전에 쓰레기를 비워요.', icon: 'trash' },
};
// 4장 1화와 같은 아차(같은 문장·같은 음성)
const CUPS_OUT = { id: 'ch4_cups_out', title: '피크 직전에 컵이 모자랐어요', lesson: '바쁜 시간 전에 컵을 채워 두면 손님이 기다리지 않아요. 근무판에 미리 넣어요.', icon: 'icecup' };
const ICE_OUT = { id: 'ch4_ice_out', title: '피크에 얼음이 모자랐어요', lesson: '얼음은 채우는 데 시간이 걸려요. 바쁜 시간 전에 근무판에 넣어요.', icon: 'ice' };

const WEATHER = {
  sunny: { icon: 'light', name: '맑음' },
  cloudy: { icon: 'window', name: '흐림' },
  rain: { icon: 'water', name: '비' },
  hot: { icon: 'ice', name: '더움' },
  cold: { icon: 'coffee', name: '추움' },
};
const POOL = ['restock_cups', 'check_ice', 'bread_display', 'wipe_tables', 'sweep', 'trash', 'break'];
const each = (ids, use) => Object.fromEntries(ids.map((id) => [id, { ...use }]));
const merge = (...maps) => {
  const out = {};
  for (const m of maps) for (const [id, use] of Object.entries(m)) { out[id] = { ...(out[id] || {}) }; for (const [k, v] of Object.entries(use)) out[id][k] = (out[id][k] || 0) + v; }
  return out;
};
const BREAK_ANY = ['tea', '쉬는 시간: 10시 30분 또는 11시'];
const BREAK_1030 = ['tea', '쉬는 시간: 10시 30분'];
const BREAK_11 = ['tea', '쉬는 시간: 11시'];

/**
 * 메모 판(오늘의 조건) 30가지
 *  name 브리핑 '오늘의 일' · weather 날씨 · memo 노란 메모(3줄 이하, 화면과 읽어 주기)
 *  start 아침 상태(그날 중심이 아닌 것은 가득 4로 두어 메모의 일에 빈칸을 쓸 수 있게) · busy 손님 배율(숫자 = 하루 내내, 객체 = 칸마다) · more 칸마다 더 줄어드는 것
 *  breakSlots 쉬는 시간을 넣을 수 있는 칸(메모의 시간) · need 피크 직전 점검의 기준(기본 2칸)
 *  early 10시 30분에 보는 것(cups·ice·bread·clean, 0칸이면 사건) — '아침에 한 번, 피크 전에 한 번'이 필요한 날 · endCheck 마감 뒤 점검(inspect·trash)
 *  event 오전의 작은 일(spill·grandma·student·office·birthday) · days 나올 수 있는 요일(없으면 모두)
 *  extra 근무판에 한 장 더 주는 자석(메모에 맞게: 컵이 빨리 주는 날 → 컵·빨대 채우기 2장. 빈칸 수는 그대로라 다른 일을 미뤄야 함)
 */
export const DAY_MEMOS = [
  { id: 'basic', name: '보통 날', weather: 'sunny', memo: [['icecup', '12시 피크 전에 컵·얼음·빵 채우기'], ['cloth', '테이블은 피크 바로 전에 닦기'], BREAK_ANY], event: 'grandma' },
  { id: 'group_order', name: '단체 주문 15잔', weather: 'sunny', memo: [['icecup', '11시 40분에 단체 주문 15잔'], ['ice', '11시 30분 전에 컵·얼음 채우기'], BREAK_1030], more: each(['s5'], { cups: 1, ice: 1 }), breakSlots: ['s3'], extra: ['restock_cups'], start: { cups: 1, ice: 4 }, early: ['cups'], event: 'office' },
  { id: 'hot_day', name: '더운 날', weather: 'hot', memo: [['ice', '더워서 얼음이 빨리 줄어요'], ['ice', '얼음은 두 번 채우기'], BREAK_11], more: each(['s2', 's4', 's5'], { ice: 1 }), breakSlots: ['s4'], extra: ['check_ice'], early: ['ice'], start: { cups: 4 }, event: 'student' },
  { id: 'rainy', name: '비 오는 날', weather: 'rain', memo: [['water', '비가 와서 바닥이 금방 더러워요'], ['mop', '바닥 쓸기를 두 번 해요'], BREAK_ANY], more: each(['s2', 's3', 's4'], { clean: 1 }), busy: 0.9, need: { clean: 2 }, extra: ['sweep'], start: { clean: 1, cups: 4, bread: 4 }, early: ['clean'], event: 'spill' },
  { id: 'new_bread', name: '새 빵 나오는 날', weather: 'sunny', memo: [['croissant', '새 빵이 나와서 빵이 잘 팔려요'], ['croissant', '빵은 두 번 채우기'], BREAK_1030], more: each(['s2', 's4', 's5'], { bread: 1 }), breakSlots: ['s3'], extra: ['bread_display'], start: { bread: 2, cups: 4 }, early: ['bread'], event: 'grandma' },
  { id: 'delivery', name: '빵 납품 날', weather: 'cloudy', memo: [['bread', '아침에 빵이 가득 들어와요'], ['trash', '빈 상자가 많아요: 쓰레기 비우기'], BREAK_11], start: { bread: 4, clean: 2 }, more: each(['s2'], { clean: 1 }), breakSlots: ['s4'], days: [0, 2], event: 'office' },
  { id: 'quiet', name: '조용한 날', weather: 'cloudy', memo: [['greet', '오늘은 손님이 적어요'], ['cloth', '한가할 때 청소를 해 두기'], BREAK_ANY], busy: 0.7, event: 'grandma' },
  { id: 'busy_friday', name: '바쁜 금요일', weather: 'sunny', memo: [['tray', '금요일 점심은 아주 바빠요'], ['icecup', '피크 전에 컵·얼음·빵 가득'], BREAK_1030], busy: { s6: 1.5 }, need: { cups: 3, ice: 3 }, breakSlots: ['s3'], days: [4], extra: ['restock_cups'], start: { cups: 1, ice: 4 }, early: ['cups'], event: 'office' },
  { id: 'inspection', name: '위생 점검 날', weather: 'cloudy', memo: [['sparkle', '1시에 위생 점검이 있어요'], ['cloth', '마감 전에 테이블 닦기'], ['mop', '바닥도 깨끗하게']], endCheck: ['inspect'], extra: ['wipe_tables'], need: { clean: 2 }, event: 'student' },
  { id: 'cup_low', name: '컵이 모자란 아침', weather: 'sunny', memo: [['icecup', '아침에 컵이 거의 없어요'], ['icecup', '오픈 전과 피크 전에 컵 채우기'], BREAK_11], start: { cups: 0, ice: 4 }, early: ['cups'], breakSlots: ['s4'], extra: ['restock_cups'], more: each(['s4'], { cups: 1 }), event: 'grandma' },
  { id: 'slow_ice', name: '제빙기가 느린 날', weather: 'hot', memo: [['ice', '제빙기가 느려서 얼음이 적어요'], ['ice', '얼음은 아침과 피크 전에 채우기'], BREAK_1030], start: { ice: 0, cups: 4 }, more: each(['s4', 's5'], { ice: 1 }), breakSlots: ['s3'], extra: ['check_ice'], early: ['ice'], event: 'spill' },
  { id: 'school_trip', name: '학생 손님이 많은 날', weather: 'sunny', memo: [['greet', '근처 학교 소풍날이에요'], ['croissant', '오전에 빵이 많이 팔려요'], BREAK_11], more: each(['s2'], { bread: 1 }), breakSlots: ['s4'], extra: ['bread_display'], start: { bread: 2, cups: 4 }, early: ['bread'], event: 'student' },
  { id: 'meeting', name: '점장님 회의', weather: 'cloudy', memo: [['team', '10시~11시 점장님 회의'], ['bell_call', '모르면 선배에게 물어보기'], BREAK_11], breakSlots: ['s4'], event: 'office' },
  { id: 'windy', name: '바람 부는 날', weather: 'cloudy', memo: [['door', '문이 자주 열려 먼지가 들어와요'], ['mop', '바닥 쓸기를 잊지 않기'], BREAK_ANY], more: each(['s2', 's3', 's4', 's5'], { clean: 1 }), need: { clean: 2 }, extra: ['sweep'], start: { clean: 1, cups: 4, bread: 4 }, early: ['clean'], event: 'grandma' },
  { id: 'cake_pickup', name: '케이크 픽업', weather: 'sunny', memo: [['calendar', '12시에 케이크 찾으러 오는 손님'], ['cloth', '테이블을 깨끗하게 해 두기'], BREAK_1030], need: { clean: 3 }, breakSlots: ['s3'], extra: ['wipe_tables'], start: { clean: 1, cups: 4 }, early: ['clean'], event: 'office' },
  { id: 'terrace', name: '테라스가 붐비는 날', weather: 'sunny', memo: [['light', '날씨가 좋아 손님이 많아요'], ['icecup', '아이스 음료가 잘 팔려요'], BREAK_1030], busy: 1.2, more: merge(each(['s2', 's4', 's5'], { ice: 1 }), each(['s4', 's5'], { cups: 1 })), breakSlots: ['s3'], extra: ['check_ice'], early: ['ice'], start: { bread: 4 }, event: 'student' },
  { id: 'rain_lunch', name: '비 오는 점심', weather: 'rain', memo: [['water', '점심에 비가 와요'], ['mop', '피크 전에 바닥 쓸기'], ['cloth', '테이블도 닦아 두기']], more: each(['s5'], { clean: 1 }), need: { clean: 2 }, extra: ['wipe_tables'], start: { clean: 1, cups: 4 }, early: ['clean'], event: 'spill' },
  { id: 'trash_day', name: '쓰레기 수거 날', weather: 'cloudy', memo: [['trash', '1시에 쓰레기 수거 차가 와요'], ['trash', '마감 전에 쓰레기 비우기'], BREAK_1030], endCheck: ['trash'], breakSlots: ['s3'], event: 'grandma' },
  { id: 'heavy_monday', name: '몸이 무거운 월요일', weather: 'cloudy', memo: [['heart', '월요일 아침은 몸이 무거워요'], ['tea', '쉬는 시간을 꼭 지키기'], ['icecup', '피크 전에 컵·얼음·빵 채우기']], start: { energy: 3 }, days: [0], event: 'student' },
  { id: 'grandma_day', name: '할머니 오시는 날', weather: 'sunny', memo: [['greet', '봉순 할머니가 오시는 날'], ['croissant', '소금빵을 넉넉하게 채우기'], BREAK_11], need: { bread: 3 }, breakSlots: ['s4'], extra: ['bread_display'], start: { bread: 1, cups: 4 }, early: ['bread'], event: 'grandma' },
  { id: 'cold_day', name: '추운 날', weather: 'cold', memo: [['coffee', '추워서 따뜻한 음료가 잘 팔려요'], ['icecup', '종이컵이 빨리 줄어요: 두 번 채우기'], BREAK_1030], more: each(['s2', 's4', 's5'], { cups: 1 }), breakSlots: ['s3'], extra: ['restock_cups'], early: ['cups'], start: { ice: 4 }, event: 'office' },
  { id: 'busy_morning', name: '오전도 바쁜 날', weather: 'sunny', memo: [['tray', '10시에도 손님이 많아요'], ['icecup', '컵은 오픈 전과 피크 전에 채우기'], BREAK_11], start: { cups: 1, ice: 4 }, more: each(['s2'], { cups: 1 }), early: ['cups'], breakSlots: ['s4'], extra: ['restock_cups'], event: 'office' },
  { id: 'messy_start', name: '어제 청소를 못 한 날', weather: 'cloudy', memo: [['cloth', '어제 마감 청소를 못 했어요'], ['mop', '오픈 전에 바닥 쓸기'], BREAK_ANY], start: { clean: 1, cups: 4 }, early: ['clean'], extra: ['sweep'], need: { clean: 2 }, event: 'grandma' },
  { id: 'coupon', name: '쿠폰 행사 날', weather: 'sunny', memo: [['card', '쿠폰 행사로 손님이 많아요'], ['icecup', '컵·얼음을 넉넉하게'], BREAK_1030], busy: 1.3, breakSlots: ['s3'], extra: ['restock_cups'], more: each(['s2'], { cups: 1 }), early: ['cups'], start: { ice: 4 }, event: 'student' },
  { id: 'late_sora', name: '일손이 적은 날', weather: 'cloudy', memo: [['team', '오늘은 선배 한 명이 늦게 와요'], ['checklist', '할 일을 차례대로 하기'], BREAK_11], busy: 1.1, breakSlots: ['s4'], event: 'office' },
  { id: 'photo_day', name: '가게 사진 찍는 날', weather: 'sunny', memo: [['camera', '12시에 가게 사진을 찍어요'], ['sparkle', '테이블과 바닥을 반짝반짝'], BREAK_1030], need: { clean: 3 }, breakSlots: ['s3'], extra: ['wipe_tables'], start: { clean: 1, cups: 4 }, early: ['clean'], event: 'student' },
  { id: 'birthday', name: '점장님 생신', weather: 'sunny', memo: [['heart', '오늘은 점장님 생신이에요'], ['icecup', '피크 전에 컵·얼음·빵 채우기'], BREAK_ANY], event: 'birthday' },
  { id: 'heavy_rain', name: '비가 많이 오는 날', weather: 'rain', memo: [['water', '비가 많이 와서 손님이 적어요'], ['mop', '바닥은 자주 쓸기'], BREAK_11], busy: 0.7, more: each(['s2', 's3', 's4', 's5', 's6'], { clean: 1 }), need: { clean: 2 }, breakSlots: ['s4'], extra: ['sweep'], start: { clean: 1, cups: 4, ice: 4 }, early: ['clean'], event: 'spill' },
  { id: 'heat_wave', name: '아주 더운 날', weather: 'hot', memo: [['ice', '아주 더워서 얼음이 금방 녹아요'], ['ice', '얼음은 두 번 채우기'], BREAK_1030], more: merge(each(['s2', 's3', 's4', 's5'], { ice: 1 }), each(['s5'], { cups: 1 })), breakSlots: ['s3'], extra: ['check_ice'], early: ['ice'], start: { bread: 4 }, event: 'student' },
  { id: 'friday_close', name: '금요일 마감 점검', weather: 'cloudy', memo: [['checklist', '금요일은 마감 점검이 있어요'], ['trash', '마감 전에 쓰레기 비우기'], ['cloth', '테이블도 닦아 두기']], endCheck: ['inspect', 'trash'], days: [4], extra: ['wipe_tables'], need: { clean: 2 }, start: { cups: 4 }, event: 'grandma' },
];

/* ---------- 요일마다 같은 것 ---------- */
// 도현 선배는 화·목 오전에 바리스타 학원(4장) → 화·목은 소라 씨가 함께
const HELPER = ['dohyun', 'sora', 'dohyun', 'sora', 'dohyun'];
const CREW = ['점장님, 도현 선배, 민재 선배', '점장님, 민재 선배, 소라 씨', '점장님, 도현 선배, 민재 선배', '점장님, 민재 선배, 소라 씨', '점장님, 도현 선배, 민재 선배'];
const GREET = [
  '좋은 아침이에요. 이번 주도 잘 부탁해요.',
  '좋은 아침이에요. 오늘 메모를 같이 볼까요?',
  '벌써 수요일이에요. 오늘도 근무판을 짜 봐요.',
  '좋은 아침이에요. 오늘은 조건이 조금 달라요.',
  '금요일이에요! 오늘만 힘내면 주말이에요.',
];
const BYE = ['오늘도 수고했어요. 내일 또 봐요.', '오늘도 수고했어요. 내일 또 봐요.', '오늘도 수고했어요. 내일 또 봐요.', '오늘도 수고했어요. 내일 또 봐요.', '이번 주도 수고했어요. 주말 잘 쉬어요.'];

/* ---------- 메모 판 고르기: 주마다 다른 순서, 한 주 안에서는 겹치지 않음 ---------- */
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
/** 그 주의 월~금 메모 판 */
export function weekPlan(week) {
  const r = rng(week * 2654435761 + 97);
  const used = new Set();
  return WEEKDAYS.map((_, d) => {
    const pool = DAY_MEMOS.filter((m) => (!m.days || m.days.includes(d)) && !used.has(m.id));
    // 요일 전용 판(월요일·금요일 등)은 그 요일에 조금 더 자주
    const weighted = pool.flatMap((m) => (m.days ? [m, m] : [m]));
    const pick = weighted[Math.floor(r() * weighted.length)];
    used.add(pick.id);
    return pick;
  });
}

/* ---------- 하루 만들기 ---------- */
function blockDay(m, id) {
  const busy = typeof m.busy === 'number' ? m.busy : (m.busy?.[id] ?? 1);
  const more = m.more?.[id];
  return { day: { busy, ...(more ? { more } : {}) } };
}

/* ---------- 피크 주문서(무한 모드) ----------
 * 2026-10-16 사용자: '단체 손님이 요구하는 메뉴 양이 적다. 실제로는 10개, 20개가 넘는 경우가 종종 있다. 무한 모드는 더 큰 도전이 필요하다'
 *  - 하루 6장 = 작은 주문 + 단체 주문. 단체 주문은 주가 지날수록 커짐: 1주 10~14개 → 2~3주 12~18개 → 4주부터 15~24개
 *  - 단체·바쁜 날 메모면 단체 주문 2장. '단체 주문 15잔' 메모의 날은 음료 15잔 그대로
 *  - 같은 주·요일이면 늘 같은 주문(Math.random 없이). 읽어 주는 문장은 tools/export-lines.mjs 가 모든 경우를 미리 만듦
 *  - 4장 1화(이야기)는 그대로 tasks.js 의 PEAK_ORDERS */
export const PEAK_COUNT = 6;
export const ORDER_MAX_Q = 12; // 한 줄에 담는 최대 개수(음성 파일 '열두 개'까지)
const DRINKS = ['ice_ame', 'hot_ame', 'latte', 'milk', 'juice'];
const BREADS = ['saltbread', 'croissant', 'muffin'];
export const SMALL_WHO = ['회사원 손님', '학생 손님', '등산복 손님', '아이와 엄마 손님', '대학생 손님', '할머니 손님'];
export const GROUP_WHO = ['회사 단체 주문', '학생 단체 손님', '동아리 모임 손님', '등산 모임 손님', '병원 단체 주문'];
const GROUP_DAYS = ['group_order', 'busy_friday', 'terrace', 'coupon', 'busy_morning'];

const pick = (r, list) => list[Math.floor(r() * list.length)];
const shuffled = (r, list) => list.map((x) => [r(), x]).sort((a, b) => a[0] - b[0]).map(([, x]) => x);
const seedOf = (s) => [...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);

/** total 개를 kinds 가지 물건에 나눔(한 줄 1~ORDER_MAX_Q개) */
function split(r, kinds, total) {
  const q = Object.fromEntries(kinds.map((k) => [k, 1]));
  let left = total - kinds.length;
  while (left > 0) {
    const room = kinds.filter((k) => q[k] < ORDER_MAX_Q);
    if (!room.length) break;
    q[pick(r, room)] += 1;
    left -= 1;
  }
  return q;
}

function groupOrder(r, who, total, onlyDrinks = false) {
  const nDrink = onlyDrinks ? 3 + Math.floor(r() * 2) : 2 + Math.floor(r() * 2);
  const nBread = onlyDrinks ? 0 : 1 + Math.floor(r() * 2);
  const kinds = [...shuffled(r, DRINKS).slice(0, nDrink), ...shuffled(r, BREADS).slice(0, nBread)];
  const minKinds = Math.ceil(total / ORDER_MAX_Q);
  while (kinds.length < minKinds) kinds.push(...[...DRINKS, ...BREADS].filter((k) => !kinds.includes(k)).slice(0, 1));
  return { who, items: split(r, kinds, total) };
}

function smallOrder(r, who) {
  const kinds = shuffled(r, [...DRINKS, ...BREADS]).slice(0, 1 + Math.floor(r() * 3));
  return { who, items: Object.fromEntries(kinds.map((k) => [k, 1 + Math.floor(r() * 2)])) };
}

/** 그날 피크(12시~1시)의 주문서 6장 */
export function dailyOrders(m, week, day) {
  const r = rng(week * 7919 + day * 131 + seedOf(m.id));
  const [lo, hi] = week <= 1 ? [10, 14] : week <= 3 ? [12, 18] : [15, 24];
  const size = () => lo + Math.floor(r() * (hi - lo + 1));
  const groups = [];
  if (m.id === 'group_order') groups.push(groupOrder(r, '회사 단체 주문', 15, true)); // 메모: 단체 주문 15잔
  else if (m.id === 'school_trip') groups.push(groupOrder(r, '학생 단체 손님', size()));
  else groups.push(groupOrder(r, pick(r, GROUP_WHO), size()));
  if (GROUP_DAYS.includes(m.id)) groups.push(groupOrder(r, pick(r, GROUP_WHO.filter((x) => x !== groups[0].who)), size()));
  const smalls = shuffled(r, SMALL_WHO).slice(0, PEAK_COUNT - groups.length).map((who) => smallOrder(r, who));
  // 단체 주문은 앞(3번째)과 끝(6번째) 쪽에: 처음 두 장으로 손을 풀고 시작
  const out = [...smalls];
  out.splice(2, 0, groups[0]);
  if (groups[1]) out.push(groups[1]);
  return out.slice(0, PEAK_COUNT);
}

function midEvent(kind) {
  switch (kind) {
    case 'spill': return [
      sfx('spill'),
      say('customer', 'surprised', '앗, 커피를 쏟았어요!'),
      think('바닥이 젖었어. 손님들이 지나가는 길이야.', 'nervous'),
      mini('spill', { title: '쏟은 음료 수습', skill: 'safety', speech: '손님이 커피를 쏟았어요. 바닥을 안전하게 치워요.' }),
      say('customer', 'smile', '고마워요. 덕분에 아무도 안 미끄러졌어요.'),
    ];
    case 'grandma': return [
      say('grandma', 'smile', '연우 씨, 오늘도 척척이네.'),
      say('yeonwoo', 'smile', '고맙습니다! 소금빵 드릴까요?'),
      say('grandma', 'happy', '응, 하나 줘요.'),
    ];
    case 'student': return [
      say('student', 'smile', '여기 빵이 제일 맛있어요!'),
      say('yeonwoo', 'smile', '고마워요. 맛있게 먹어요!'),
    ];
    case 'office': return [
      say('daeri', 'normal', '아이스 아메리카노 두 잔이요. 빨리 부탁해요.'),
      say('yeonwoo', 'determined', '네, 잠시만 기다려 주세요!'),
    ];
    case 'birthday': return [
      say('sora', 'smile', '오늘 점장님 생신이래요. 쉬는 시간에 같이 카드 써요!'),
      say('yeonwoo', 'smile', '좋아요! 저도 한 줄 쓸게요.'),
    ];
    default: return [];
  }
}

/** 9시 30분~10시 30분(s2) 뒤: 아침부터 모자란 것 */
function earlyChecks(m, helper) {
  const out = [];
  if (m.early?.includes('cups')) out.push(...onlyIf({ cups: '<1' },
    say(helper, 'surprised', '연우 씨, 컵이 하나도 없어요!'),
    act('창고에서 컵 가져오기', 'icecup', 'stack'),
    workSet({ fill: ['cups'], add: { waited: 2 } }),
    workOops(DAILY_OOPS.cupsEarly)));
  if (m.early?.includes('ice')) out.push(...onlyIf({ ice: '<1' },
    say(helper, 'worried', '연우 씨, 얼음이 하나도 없어요!'),
    act('제빙기에서 얼음 퍼 오기', 'ice', 'ice'),
    workSet({ fill: ['ice'], add: { waited: 2 } }),
    workOops(DAILY_OOPS.iceEarly)));
  if (m.early?.includes('bread')) out.push(...onlyIf({ bread: '<1' },
    say('minjae', 'surprised', '진열대가 벌써 비었네!'),
    act('민재 선배에게 빵 부탁하기', 'croissant', 'tap'),
    workSet({ fill: ['bread'], add: { waited: 1 } }),
    workOops(DAILY_OOPS.breadEarly)));
  if (m.early?.includes('clean')) out.push(...onlyIf({ clean: '<1' },
    narr('바닥에 먼지가 굴러다녔다. 손님이 얼굴을 찡그렸다.'),
    workSet({ fill: ['clean'], add: { smiles: -1 } }),
    workOops(DAILY_OOPS.dirtyEarly)));
  return out;
}

/** 피크 직전(s5 뒤): 4장 1화와 같은 사건, 메모 판의 기준(need)으로 */
function peakChecks(m, helper) {
  // 청결은 기본 1칸(매일 매일 카페 생활: 자석 한 번씩이라 청소까지 늘 2칸이면 풀 수 없는 날이 생김), 청소를 내세운 판은 need 로 올림
  const need = { cups: 2, ice: 2, bread: 2, clean: 1, ...(m.need || {}) };
  return [
    ...onlyIf({ cups: `<${need.cups}` },
      say(helper, 'surprised', '연우 씨, 컵이 거의 없어요!'),
      act('창고에서 컵 가져오기', 'icecup', 'stack'),
      workSet({ fill: ['cups'], add: { waited: 2 } }),
      workOops(CUPS_OUT)),
    ...onlyIf({ ice: `<${need.ice}` },
      say(helper, 'worried', '연우 씨, 얼음통이 거의 비었어요!'),
      mini('catch', { skin: 'ice', title: '얼음 채우기', skill: 'prepare', rush: true, speech: '얼음이 거의 없어요. 제빙기에서 얼음을 받아 얼음통을 채워요.' }),
      workSet({ fill: ['ice'], add: { waited: 2 } }),
      workOops(ICE_OUT)),
    ...onlyIf({ bread: `<${need.bread}` },
      say('minjae', 'normal', '진열대 빵, 비었네.'),
      act('민재 선배에게 빵 부탁하기', 'croissant', 'tap'),
      say('minjae', 'smile', '말해 줘서 고마워. 금방 줄게.'),
      workSet({ fill: ['bread'], add: { waited: 1 } })),
    ...onlyIf({ clean: `<${need.clean}` },
      narr('한 손님이 끈적한 테이블을 휴지로 닦고 있었다.'),
      think('테이블을 피크 바로 전에 닦았으면 좋았을걸.', 'nervous'),
      workSet({ fill: ['clean'], add: { smiles: -1 } })),
  ];
}

/** 마감 뒤(s7 뒤): 메모의 마감 약속 */
function endChecks(m) {
  const out = [];
  if (m.endCheck?.includes('inspect')) out.push(...onlyIf({ clean: '<3' },
    say('manager', 'think', '점검하시는 분이 바닥을 보고 메모를 하셨어요.'),
    workOops(DAILY_OOPS.inspect)));
  if (m.endCheck?.includes('trash')) out.push(...onlyIf({ unplanned: 'trash' },
    say('manager', 'think', '쓰레기 수거 차가 벌써 가 버렸네요.'),
    workOops(DAILY_OOPS.trash)));
  return out;
}

/** 메모 판 m 으로 하루를 만듦(검사기·음성 도구는 모든 판을 이렇게 돌려 봄) */
export function makeDayWith(m, week, day) {
  const DAY = WEEKDAYS[day];
  const helper = HELPER[day];
  const w = WEATHER[m.weather] || WEATHER.sunny;
  const start = { cups: 2, ice: 1, bread: 3, clean: 3, energy: 4, ...(m.start || {}) };
  return {
    id: dailyId(week, day),
    daily: { week, day, memo: m.id },
    label: DAILY_LABEL,
    title: `${week}주 차 ${DAY}`,
    goal: '메모를 보고 근무판을 짜요.',
    schedule: [],
    skills: ['time', 'safety'],
    script: [
      big(DAY, DAILY_LABEL),
      bg('staff'), bgm('morning'), amb(null), time('08:55'),
      place(`${DAY} 08:55`, '직원 공간'),
      show({ left: 'yeonwoo:normal', right: 'manager:front' }),
      say('manager', 'front', GREET[day]),
      memo('오늘의 메모', m.memo),
      say('manager', 'normal', '메모를 보고 근무판을 짜 봐요.'),
      briefing({ day: DAY, cards: [[w.icon, '날씨', w.name], ['greet', '오늘의 일', m.name], ['team', '오늘 함께', CREW[day]]] }),
      board({ id: 'daily_board', title: `${DAY} 근무판`, pool: POOL.flatMap((id) => [id, ...(m.extra || []).filter((x) => x === id)]), breakSlots: m.breakSlots || null }),
      bg('counter', 'morning'), bgm('cafe'),
      shiftStart(start),
      block('s1', blockDay(m, 's1')),
      block('s2', blockDay(m, 's2')),
      ...earlyChecks(m, helper),
      ...midEvent(m.event),
      block('s3', blockDay(m, 's3')),
      block('s4', blockDay(m, 's4')),
      block('s5', blockDay(m, 's5')),
      ...peakChecks(m, helper),
      say(helper, 'smile', '피크 시작이에요. 같이 힘내요!'),
      block('s6', { day: { ...blockDay(m, 's6').day, mini: { serve_peak: { orders: dailyOrders(m, week, day) } } } }),
      block('s7', blockDay(m, 's7')),
      ...endChecks(m),
      shiftEnd({ day: DAY }),
      bg('staff'), bgm('warm'),
      show({ left: 'yeonwoo:smile', right: 'manager:smile' }),
      say('manager', 'smile', BYE[day]),
      end(),
    ],
  };
}

/** 주·요일의 하루 */
export function makeDay(week, day) {
  return makeDayWith(weekPlan(week)[day], week, day);
}

/** 'daily:주:요일' → 하루(근무표·이어하기·불러오기) */
export function dailyEpisode(id) {
  const p = parseDailyId(id);
  return p ? makeDay(p.week, p.day) : null;
}

/** 모든 메모 판 × 요일(검사기·음성 도구) */
export function allDailyDays() {
  const out = [];
  for (const m of DAY_MEMOS) for (let d = 0; d < 5; d++) if (!m.days || m.days.includes(d)) out.push(makeDayWith(m, 1, d));
  return out;
}
