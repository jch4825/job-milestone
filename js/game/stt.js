/**
 * 말로 대답하기 (Web Speech API 음성 인식)
 * 주의: 브라우저 음성 인식은 소리를 브라우저 회사 서버로 보내 처리할 수 있습니다.
 *       Electron 앱에서는 동작하지 않는 경우가 많아, 실패하면 다른 대답 방법을 안내합니다.
 */

const Rec = typeof window !== 'undefined' ? (window.SpeechRecognition || window.webkitSpeechRecognition) : null;
let rec = null;

export const stt = {
  supported() { return Boolean(Rec); },

  /** 한 번 듣기. resolve({ text, error }) */
  listen({ onPartial } = {}) {
    return new Promise((resolve) => {
      if (!Rec) { resolve({ text: '', error: 'unsupported' }); return; }
      stt.stop();
      rec = new Rec();
      rec.lang = 'ko-KR';
      rec.continuous = false;
      rec.interimResults = true;
      let finalText = '';
      let settled = false;
      const done = (res) => { if (!settled) { settled = true; resolve(res); } };
      rec.onresult = (ev) => {
        let interim = '';
        for (let i = ev.resultIndex; i < ev.results.length; i++) {
          const r = ev.results[i];
          if (r.isFinal) finalText += r[0].transcript;
          else interim += r[0].transcript;
        }
        onPartial?.((finalText + interim).trim());
      };
      rec.onerror = (ev) => done({ text: finalText.trim(), error: ev.error || 'error' });
      rec.onend = () => done({ text: finalText.trim(), error: finalText.trim() ? null : 'no-speech' });
      try { rec.start(); } catch (e) { done({ text: '', error: 'start-failed' }); }
    });
  },

  stop() {
    if (rec) {
      try { rec.stop(); } catch (e) { /* 무시 */ }
      rec = null;
    }
  },
};

export function sttErrorMessage(err) {
  switch (err) {
    case 'unsupported': return '이 기기에서는 말로 대답하기를 쓸 수 없어요. 골라서 말하기나 글자로 쓰기를 써 주세요.';
    case 'not-allowed':
    case 'service-not-allowed': return '마이크를 쓸 수 없어요. 마이크 허락을 확인하거나 다른 방법으로 대답해 주세요.';
    case 'network': return '이 기기에서는 말 알아듣기 서버에 연결할 수 없어요. 다른 방법으로 대답해 주세요.';
    case 'no-speech': return '목소리가 들리지 않았어요. 한 번 더 말해 볼까요?';
    default: return '말을 알아듣지 못했어요. 한 번 더 해 볼까요?';
  }
}
