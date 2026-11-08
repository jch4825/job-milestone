/**
 * 직업 마1스톤 - 전역 게임 설정 및 로컬 LLM 연동 파라미터
 */

export const CONFIG = {
  TITLE: "직업 마1스톤",
  VERSION: "1.0.0",

  // 로컬 LLM (Gemma 2B / Gemma 4 e2b 등) 연동 설정
  LLM: {
    DEFAULT_PROVIDER: "ollama", // "ollama" | "electron-ipc" | "mock"
    OLLAMA_ENDPOINT: "http://127.0.0.1:11434/api/chat",
    MODEL_NAME: "gemma:2b", // 사용자 제안: gemma4 e2b / gemma2:2b
    TEMPERATURE: 0.4,
    MAX_TOKENS: 150,
    TIMEOUT_MS: 4000,
    FALLBACK_TO_MOCK_ON_ERROR: true, // 로컬 LLM 미구동 시에도 매끄럽게 fallback

    // e2b(2B 초경량) 모델 최적화: 초압축 프롬프트 (토큰 절약 및 환각 방지)
    SYSTEM_PROMPT: `[역할] 카페 점장 (친절하고 따뜻함)
[상대] 발달장애 취업준비생 연우
[규칙]
1. 존댓말(~해요), 가장 쉬운 일상 단어 사용
2. 최대 1~2줄로 아주 짧게 대답
3. 비유/은유 절대 금지 (손 씻기, 보고 등 구체적 행동만 언급)
4. 솔직하게 말하면 무조건 칭찬
5. 칭찬 후 다음 질문 1개 하기`
  },

  // 챕터별 기본 정보
  CHAPTERS: [
    {
      id: 1,
      title: "제1막: 첫 관문 (면접과 계약)",
      badge: "CH.01",
      clueTitle: "면접 수칙",
      clueText: "1. 바른 자세로 인사하기\n2. 모르는 것은 솔직히 묻기\n3. 계약서 내용 확인하기"
    },
    {
      id: 2,
      title: "제2막: 일상 루틴과 이벤트",
      badge: "CH.02",
      clueTitle: "점장님의 오픈 메모",
      clueText: "1. 유니폼 입고 손 씻기\n2. 컵과 냅킨 채우기\n3. 실수하면 즉시 보고하기"
    },
    {
      id: 3,
      title: "제3막: 클라이맥스와 독립",
      badge: "CH.03",
      clueTitle: "피크 타임 대비",
      clueText: "1. 당황하지 않고 심호흡\n2. 선임과 역할 나누기\n3. 끝까지 정직하게 소통!"
    }
  ]
};

// 런타임 환경 감지 (Electron 또는 일반 Web 브라우저)
export const isElectron = () => {
  return typeof window !== 'undefined' && Boolean(window.electronAPI);
};
