/**
 * v3 자립 근무: 근무판의 업무 자석과 시간 칸 (docs/v3_design.md 5장)
 * 순수 데이터입니다(검사기·음성 도구가 node 로 읽음). 상태 변화는 js/game/work/sim.js 가 적용합니다.
 *  fill: 가득 채우는 상태 · add: 더하는 값 · station: 픽셀 매장에서 일하는 자리 · anim: 연우 픽셀 동작
 *  mini: '직접 하기'로 해 볼 수 있는 미니게임(js/game/minigames/index.js) · miniOpts: 그 미니게임에 줄 옵션(skin 등)
 *  hands: '직접 하기 / 보기'를 물을 때의 말(없으면 기본) · rest: 쉬는 시간(그 칸에는 기운이 줄지 않음)
 *  4장은 모든 활동에 미니게임이 있습니다(2026-10-15). 출근·퇴근 기록은 카드를 찍는 순간이라 그대로 둡니다.
 */

/** 상태 칸 수(가득) */
export const MAX = 4;

/** 상태 막대 (화면 위쪽) */
export const METERS = [
  { id: 'cups', name: '컵', icon: 'icecup' },
  { id: 'ice', name: '얼음', icon: 'ice' },
  { id: 'bread', name: '빵', icon: 'croissant' },
  { id: 'clean', name: '청결', icon: 'sparkle' },
  { id: 'energy', name: '기운', icon: 'heart' },
];

/** 자석 종류: 근무판 왼쪽 띠 색 */
export const KINDS = {
  routine: { name: '매일 하는 일', color: '#8C8794' },
  prep: { name: '준비', color: '#3D8BD9' },
  serve: { name: '손님', color: '#E3262E' },
  clean: { name: '청소', color: '#16A99A' },
  rest: { name: '쉼', color: '#E0B100' },
};

/** 손님 맞이(주문서 확인)에서 받는 주문: 4장 오전 · 피크 */
export const SERVE_ORDERS = [
  { who: '회사원 손님', items: { ice_ame: 1, croissant: 1 } },
  { who: '학생 손님', items: { latte: 1, muffin: 1 } },
];
// 피크는 주문이 많아요(2026-10-15 사용자: 피크 주문서가 적다 → 3장 → 6장)
export const PEAK_ORDERS = [
  { who: '회사원 손님', items: { ice_ame: 2, saltbread: 2 } },
  { who: '단체 손님', items: { latte: 2, juice: 1, croissant: 1 } },
  { who: '학생 손님', items: { milk: 1, muffin: 2 } },
  { who: '등산복 손님', items: { hot_ame: 1, croissant: 2 } },
  { who: '아이와 엄마 손님', items: { juice: 1, milk: 1, muffin: 1 } },
  { who: '대학생 손님', items: { ice_ame: 1, latte: 1, saltbread: 1 } },
];
/** 피크 주문이 늦었을 때(시간 제한 막대) */
export const PEAK_OOPS = { id: 'ch4_peak_wait', title: '손님이 오래 기다리셨어요', lesson: '점심시간이 짧은 손님은 금방 지쳐요. 주문서를 한 줄씩 짚으며 차례로 담아요.', icon: 'tray' };

/** '직접 하기 / 보기'를 물을 때의 기본 말 */
export const HANDS = { q: '직접 해 볼까요?', yes: '직접 하기', no: '보기' };

export const TASKS = {
  clock_in: { label: '출근 기록', icon: 'idcard', kind: 'routine', station: 'staff', anim: 'carry' },
  handwash: { label: '손 씻기', icon: 'handwash', kind: 'routine', station: 'sink', anim: 'wash', mini: 'handwash', miniOpts: { mentor: 'manager' } },
  serve: { label: '손님 맞이', icon: 'greet', kind: 'serve', station: 'counter', anim: 'bow', mini: 'order', miniOpts: { orders: SERVE_ORDERS, mentor: 'manager' } },
  serve_peak: {
    label: '바쁜 손님 맞이', icon: 'tray', kind: 'serve', station: 'counter', anim: 'carry', mini: 'order',
    miniOpts: { orders: PEAK_ORDERS, mentor: 'manager', timer: { label: '손님이 줄 서 있어요', say: '저기요, 아직이에요? 점심시간이 얼마 안 남았어요.', oops: PEAK_OOPS } },
  },
  clock_out: { label: '퇴근 기록', icon: 'idcard', kind: 'routine', station: 'staff', anim: 'carry' },
  restock_cups: { label: '컵·빨대 채우기', icon: 'icecup', kind: 'prep', station: 'rack', anim: 'carry', fill: ['cups'], mini: 'catch', miniOpts: { skin: 'cups' } },
  check_ice: { label: '얼음 채우기', icon: 'ice', kind: 'prep', station: 'bar', anim: 'carry', fill: ['ice'], mini: 'catch', miniOpts: { skin: 'ice' } },
  bread_display: { label: '진열대 빵 채우기', icon: 'croissant', kind: 'prep', station: 'showcase', anim: 'carry', fill: ['bread'], mini: 'timing' },
  wipe_tables: { label: '테이블 닦기', icon: 'cloth', kind: 'clean', station: 'tables', anim: 'wipe', fill: ['clean'], mini: 'tables' },
  sweep: { label: '바닥 쓸기', icon: 'mop', kind: 'clean', station: 'floor', anim: 'sweep', add: { clean: 1 }, mini: 'whack', miniOpts: { skin: 'floor' } },
  trash: { label: '쓰레기 비우기', icon: 'trash', kind: 'clean', station: 'door', anim: 'carry', add: { clean: 1 }, mini: 'whack', miniOpts: { skin: 'trash' } },
  break: {
    label: '쉬는 시간 30분', icon: 'tea', kind: 'rest', station: 'staff', anim: 'idle', add: { energy: 3 }, rest: true,
    mini: 'snake', hands: { q: '쉬는 시간이에요. 휴대폰 게임을 할까요?', yes: '게임하기', no: '그냥 쉬기' },
  },
};

/** '직접 하기'를 물을 때 읽어 주는 말 (음성 파일: export-lines) */
export const handsSpeech = (id) => `${TASKS[id].label}. ${(TASKS[id].hands || HANDS).q}`;

/**
 * 시간 칸 (계약서 09:00~13:30, 09:30 오픈, 12~13시 피크)
 *  fixed: 핀으로 고정된 자석 · free: 빈칸 수 · breakOk: 쉬는 시간을 넣을 수 있는 칸
 *  guests: 오는 손님 수 · use: 그 칸에서 손님이 쓰는 양 · tire: 기운이 주는 양
 */
export const BLOCKS = [
  { id: 's1', time: '09:00', end: '09:30', name: '오픈 전', fixed: ['clock_in', 'handwash'], free: 1, guests: 0, use: {}, tire: 0 },
  { id: 's2', time: '09:30', end: '10:30', name: '오전', fixed: ['serve'], free: 1, guests: 4, use: { cups: 1, bread: 1, clean: 1 }, tire: 1 },
  { id: 's3', time: '10:30', end: '11:00', name: '오전', fixed: [], free: 1, guests: 2, use: { ice: 1, clean: 1 }, tire: 1, breakOk: true },
  { id: 's4', time: '11:00', end: '11:30', name: '오전', fixed: [], free: 1, guests: 2, use: { cups: 1 }, tire: 1, breakOk: true },
  { id: 's5', time: '11:30', end: '12:00', name: '피크 준비', fixed: [], free: 1, guests: 3, use: { bread: 1, clean: 1 }, tire: 1 },
  { id: 's6', time: '12:00', end: '13:00', name: '피크', fixed: ['serve_peak'], free: 0, guests: 8, use: { cups: 2, ice: 2, bread: 2, clean: 2 }, tire: 1, peak: true },
  { id: 's7', time: '13:00', end: '13:30', name: '마감', fixed: ['clock_out'], free: 1, guests: 1, use: { clean: 1 }, tire: 0 },
];

export const BLOCK_BY_ID = Object.fromEntries(BLOCKS.map((b, i) => [b.id, { ...b, index: i }]));

/** 시각을 읽어 줄 때 쓰는 말 ('9시 30분.') — 음성 파일을 미리 만들기 위해 고정 */
export const timeSpeech = (t) => {
  const [h, m] = t.split(':').map(Number);
  return `${h}시${m ? ` ${m}분` : ''}.`;
};
