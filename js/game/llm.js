/**
 * 로컬 LLM 면접관 어댑터 (Gemma e2b / 2B급, Ollama)
 *  - Electron: IPC(window.electronAPI.chatWithLLM) / 웹: http://127.0.0.1:11434 직접 호출
 *  - 안전장치: 2문장·90자 제한, 영어·이모지·부정어 거르기. 통과하지 못하면 null → 규칙 기반 대답 사용
 *  - 대화 내용은 이 기기 안에서만 처리됩니다(외부 서버로 보내지 않음).
 */

import { CONFIG, isElectron } from '../config.js';
import { store } from '../core/store.js';

const BANNED = /불합격|탈락|떨어|틀렸|틀린|바보|멍청|실망|못하|싫어|장애|진단|환자/;

function cfg() {
  return { ...CONFIG.LLM, ...store.llmConfig() };
}

function sanitize(t) {
  if (!t) return null;
  let s = String(t)
    .replace(/<[^>]+>/g, '')
    .replace(/[*_#`>"“”‘’]/g, '')
    .replace(/\([^)]*\)/g, '')
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
  const parts = s.match(/[^.!?]+[.!?]?/g) || [s];
  s = parts.slice(0, 2).join(' ').trim();
  if (s.length > 90) s = `${s.slice(0, 88).trim()}…`;
  if (/[A-Za-z]{4,}/.test(s)) return null;
  if (BANNED.test(s)) return null;
  if (!/[가-힣]/.test(s) || s.length < 6) return null;
  return s;
}

// 웹판(인터넷에 올린 사이트)에서는 로컬 AI 면접관을 찾지 않음: 공개 사이트가 이 PC(127.0.0.1)에 접속하려 하면
// 브라우저가 학생에게 '로컬 네트워크 접근' 권한 창을 띄울 수 있음. 설치용 앱·이 PC에서 연 개발 서버만 연결 시도
function localPage() {
  if (typeof location === 'undefined') return true;
  const host = location.hostname;
  return location.protocol === 'app:' || host === 'localhost' || host === '127.0.0.1' || host === '[::1]' || host.endsWith('.localhost');
}

function withTimeout(p, ms) {
  return Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), ms))]);
}

export const llm = {
  async reply({ question, answer, catLabel }) {
    if (store.settings().llm === 'off') return null;
    if (!isElectron() && !localPage()) return null; // 웹판: 로컬 AI 면접관 없음(위 localPage 참고)
    const c = cfg();
    const system = [
      '[역할] 카페 점장 박건우. 면접관. 따뜻하고 짧게 말함.',
      '[상대] 신입 지원자 정연우(20세). 쉬운 말이 필요함.',
      '[규칙] 해요체. 2문장 이내. 60자 이내. 쉬운 낱말. 비유 금지. 대답의 좋은 점을 구체적으로 칭찬. 질문하지 않기. 영어·이모지·괄호 금지.',
    ].join('\n');
    const user = `[질문] ${question}\n[지원자 답] ${answer}\n[답의 종류] ${catLabel}\n[할 일] 점장으로서 이 답에 짧게 반응하기.`;
    const messages = [{ role: 'system', content: system }, { role: 'user', content: user }];
    try {
      if (isElectron() && window.electronAPI?.chatWithLLM) {
        const r = await withTimeout(window.electronAPI.chatWithLLM({
          endpoint: c.OLLAMA_ENDPOINT, model: c.MODEL_NAME, messages,
          options: { temperature: c.TEMPERATURE, num_predict: c.MAX_TOKENS },
        }), c.TIMEOUT_MS);
        return r?.success ? sanitize(r.content) : null;
      }
      const ctl = new AbortController();
      const timer = setTimeout(() => ctl.abort(), c.TIMEOUT_MS);
      const res = await fetch(c.OLLAMA_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: ctl.signal,
        body: JSON.stringify({ model: c.MODEL_NAME, messages, stream: false, options: { temperature: c.TEMPERATURE, num_predict: c.MAX_TOKENS } }),
      });
      clearTimeout(timer);
      if (!res.ok) return null;
      const data = await res.json();
      return sanitize(data.message?.content);
    } catch (e) {
      return null;
    }
  },

  /**
   * 면접 시작 때 빠른 확인: Ollama 가 켜져 있고 그 모델을 내려받아 두었는지(대답을 만들지 않아 2~3초 안에 끝남).
   * false 면 면접은 '골라서 말하기'와 대본 반응으로만 진행합니다.
   */
  async available() {
    if (store.settings().llm === 'off') return false;
    if (!isElectron() && !localPage()) return false;
    const c = cfg();
    const base = String(c.OLLAMA_ENDPOINT).replace(/\/api\/.*$/, '');
    try {
      const res = await withTimeout(fetch(`${base}/api/tags`, { cache: 'no-store' }), 2500);
      if (!res.ok) return false;
      const models = ((await res.json()).models || []).map((m) => m.name || m.model);
      const want = c.MODEL_NAME.includes(':') ? c.MODEL_NAME : `${c.MODEL_NAME}:latest`;
      return models.includes(want);
    } catch (e) {
      return false;
    }
  },

  /** 첫 대답이 늦지 않게 모델을 미리 메모리에 올려 둠 (기다리지 않음) */
  warmup() {
    const c = cfg();
    const base = String(c.OLLAMA_ENDPOINT).replace(/\/api\/.*$/, '');
    fetch(`${base}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: c.MODEL_NAME, prompt: '', keep_alive: '15m' }),
    }).catch(() => {});
  },

  /** 교사 모드: 연결 확인 */
  async test() {
    const c = cfg();
    const t0 = performance.now();
    const r = await llm.reply({ question: '잘하는 일이 무엇인가요?', answer: '컵 정리를 꼼꼼하게 잘합니다.', catLabel: '강점 말하기' });
    return { ok: Boolean(r), ms: Math.round(performance.now() - t0), sample: r, model: c.MODEL_NAME };
  },
};
