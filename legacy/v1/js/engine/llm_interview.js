/**
 * 직업 마1스톤 - 로컬 LLM (Gemma 2B / Gemma 4 e2b) 면접 연동 엔진
 * 
 * - Electron 환경: IPC (window.electronAPI.chatWithLLM) 우선 사용
 * - 일반 웹 환경: 로컬 Ollama 엔드포인트(http://127.0.0.1:11434) HTTP fetch
 * - 오프라인/미설치 환경: 발달장애 학생 맞춤형 시뮬레이션 Mock Fallback 자동 가동
 */

import { CONFIG, isElectron } from '../config.js';

class LLMInterviewEngine {
  constructor() {
    this.history = [];
    this.isProcessing = false;
  }

  reset() {
    this.history = [
      { role: "system", content: CONFIG.LLM.SYSTEM_PROMPT }
    ];
  }

  async sendCandidateResponse(userMessage) {
    if (this.isProcessing) return null;
    this.isProcessing = true;

    this.history.push({ role: "user", content: userMessage });

    // e2b 초경량 모델용 초압축 슬라이딩 윈도우 (시스템 프롬프트 + 직전 대화 2개만 추출)
    const condensedMessages = [
      this.history[0], // SYSTEM_PROMPT
      ...this.history.slice(1).slice(-2) // 최근 2개 메시지만 유지하여 컨텍스트 초과 방지
    ];

    try {
      // 1. Electron IPC 우선 확인
      if (isElectron() && window.electronAPI.chatWithLLM) {
        const response = await window.electronAPI.chatWithLLM({
          model: CONFIG.LLM.MODEL_NAME,
          messages: condensedMessages
        });
        this.history.push({ role: "assistant", content: response.content });
        this.isProcessing = false;
        return { source: "electron-ipc", reply: response.content };
      }

      // 2. 브라우저에서 로컬 Ollama 직접 호출 시도
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), CONFIG.LLM.TIMEOUT_MS);

      const response = await fetch(CONFIG.LLM.OLLAMA_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          model: CONFIG.LLM.MODEL_NAME,
          messages: condensedMessages,
          stream: false,
          options: {
            temperature: CONFIG.LLM.TEMPERATURE,
            num_predict: CONFIG.LLM.MAX_TOKENS
          }
        })
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        const replyText = data.message?.content || "답변을 잘 들었습니다. 고마워요.";
        this.history.push({ role: "assistant", content: replyText });
        this.isProcessing = false;
        return { source: "local-ollama", reply: replyText };
      } else {
        throw new Error(`Ollama HTTP Error: ${response.status}`);
      }
    } catch (err) {
      console.warn("[LLMInterviewEngine] 로컬 LLM 호출 실패 또는 미구동, Fallback Mock 엔진 가동:", err.message);

      // 3. Fallback 시뮬레이션 Mock 응답 (발달장애 학생 친화형 피드백)
      const mockReply = this.generateMockReply(userMessage);
      this.history.push({ role: "assistant", content: mockReply });
      this.isProcessing = false;
      return { source: "local-mock", reply: mockReply };
    }
  }

  // 발달장애 학생을 위한 규칙 기반 시뮬레이터
  generateMockReply(msg) {
    const text = msg.toLowerCase();

    if (text.includes("인사") || text.includes("안녕하세요") || text.includes("반갑습니다")) {
      return "반가워요, 연우 씨! 바른 자세로 밝게 인사해주어 기쁩니다. 카페에서 어떤 일을 가장 해보고 싶나요?";
    }
    if (text.includes("빵") || text.includes("정리") || text.includes("설거지") || text.includes("청소") || text.includes("포장")) {
      return "성실하게 매장 정돈을 돕고 싶다는 마음이 참 멋지네요! 혹시 일하다가 모르는 것이 생기면 어떻게 행동할 건가요?";
    }
    if (text.includes("물어") || text.includes("질문") || text.includes("도움") || text.includes("선배") || text.includes("점장님")) {
      return "훌륭해요! 모를 때 숨기지 않고 물어보는 것이 가장 중요한 직업인의 태도랍니다. 우리 함께 즐겁게 일해봐요!";
    }
    
    // 기본 친절 피드백
    return "솔직하고 차분하게 본인의 생각을 말해주어서 참 듬직하군요. 함께 일하며 차근차근 배워나가면 잘할 수 있을 거예요!";
  }
}

export const llmInterviewEngine = new LLMInterviewEngine();
