/**
 * 직업 마1스톤 v2 - 전역 설정
 * 숫자·연도처럼 해마다 바뀌는 값은 모두 여기에서만 관리합니다.
 */

export const CONFIG = {
  TITLE: '직업 마1스톤',
  // 처음 화면 캐치프레이즈 [큰 줄, 작은 줄]: 게임의 본질(직장 생활을 직접 해 보며, 되감아 다시 해 보며 배움). 2026-10-14 사용자가 고름.
  // 처음 화면이 '직업 마일스톤' 다음에 읽어 줌(음성 파일: tools/export-lines.mjs)
  TAGLINE: ['직장 생활, 해 보면서 배워요.', '되감아 다시 할 수 있는 나의 첫 직장.'],
  VERSION: '2.0.1',
  SAVE_KEY: 'jobms.v2',

  // 고정 캔버스(16:9). 모든 UI 좌표는 이 크기를 기준으로 그립니다.
  SCREEN: { W: 1920, H: 1080 },

  // 최저임금(시급). 매년 8월 고시값으로 갱신합니다.
  // 2026년 10,320원 / 2027년 10,700원 (최저임금위원회 결정)
  WAGE_TABLE: { 2026: 10320, 2027: 10700 },

  // 연우의 근로 조건 (근로계약서·급여명세서와 반드시 일치해야 함)
  JOB: {
    place: "베이커리 카페 '마일스톤'",
    days: '월요일 ~ 금요일',
    start: '09:00',
    end: '13:30',
    breakTime: '11:00 ~ 11:30',
    breakMinutes: 30,
    hoursPerDay: 4,
    hoursPerWeek: 20,
    payday: '매달 10일',
    duties: '오픈 준비, 컵·비품 채우기, 빵 포장, 트레이 전달, 매장 정리',
  },

  // 급여명세서 예시(에필로그). 공제율은 '예시'이며 실제 보험료율과 다를 수 있습니다.
  PAYSLIP: { workDays: 20, weeklyHolidayHours: 16, exampleDeductionRate: 0.09 },

  // 로컬 LLM (Gemma e2b / 2B급) 면접관 연동
  LLM: {
    OLLAMA_ENDPOINT: 'http://127.0.0.1:11434/api/chat',
    MODEL_NAME: 'gemma:2b', // 교사 모드에서 변경 가능 (예: gemma2:2b, gemma3n:e2b 등 e2b급)
    TEMPERATURE: 0.4,
    MAX_TOKENS: 120,
    TIMEOUT_MS: 8000,
  },

  // 설정 기본값 (프로필마다 따로 저장됩니다)
  DEFAULT_SETTINGS: {
    textSize: 'normal',   // normal | large | xlarge
    textSpeed: 'normal',  // slow | normal | fast | instant
    auto: 'off',          // off | slow | normal
    voice: 'auto',        // auto(자동 읽기) | button(버튼으로만) | off
    voiceRate: 'normal',  // slow | normal | fast
    volMaster: 0.8,
    volBgm: 0.35,
    volSfx: 0.6,
    theme: 'pop',         // pop(마일스톤 팝) | calm(차분 모드)
    contrast: false,      // 고대비
    motion: 'full',       // full | reduced
    selectMode: 'one',    // one(한 번 눌러 고르기) | two(두 번 눌러 고르기)
    help: 'some',         // many(도움 많이) | some(보통) | self(스스로)
    timer: 'normal',      // 급한 장면의 시간 제한 막대: normal(보통) | slow(넉넉히, 2배) | off(끄기). 자동 스캔을 켜면 꺼짐
    readCards: false,     // 키보드·스캔으로 카드에 초점이 가면 읽어 주기(기본은 소리 아이콘을 눌러야 읽음)
    scan: false,          // 스위치 자동 스캔
    scanSpeed: 1.8,       // 초
    llm: 'auto',          // auto | off
    saveInterview: false, // 면접 답변 기록 저장(교사 보고서용)
    tutorial: true,       // 처음 보는 버튼 알려 주기(무지개 테두리 + 손가락 + 쪽지)
  },

  DEFAULT_TEACHER_PIN: '1234',
};

/** 오늘 날짜 기준 시급. 표에 없는 해는 가장 최근 값을 씁니다. */
export function currentWage(date = new Date()) {
  const y = date.getFullYear();
  const years = Object.keys(CONFIG.WAGE_TABLE).map(Number).sort((a, b) => a - b);
  let pick = years[0];
  for (const yr of years) if (yr <= y) pick = yr;
  if (y > years[years.length - 1]) pick = years[years.length - 1];
  return { year: pick, hourly: CONFIG.WAGE_TABLE[pick] };
}

export const isElectron = () => typeof window !== 'undefined' && Boolean(window.electronAPI);
