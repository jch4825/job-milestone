/**
 * 직업 마1스톤 - 음성 입력 (Web Speech API STT) 헬퍼
 * 발달장애 학생이 키보드 타자 없이도 마이크를 통해 편안하게 음성으로 면접에 참여할 수 있도록 지원합니다.
 */

class VoiceInputEngine {
  constructor() {
    this.recognition = null;
    this.isListening = false;
    this.onResultCallback = null;
    this.onStatusChangeCallback = null;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.lang = 'ko-KR';
      this.recognition.continuous = false;
      this.recognition.interimResults = true;

      this.recognition.onstart = () => {
        this.isListening = true;
        if (this.onStatusChangeCallback) this.onStatusChangeCallback(true);
      };

      this.recognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        if (this.onResultCallback) {
          this.onResultCallback(transcript, event.results[0].isFinal);
        }
      };

      this.recognition.onerror = (event) => {
        console.warn("[VoiceInputEngine] 음성 인식 오류:", event.error);
        this.stop();
      };

      this.recognition.onend = () => {
        this.isListening = false;
        if (this.onStatusChangeCallback) this.onStatusChangeCallback(false);
      };
    } else {
      console.warn("[VoiceInputEngine] 브라우저/환경이 Web Speech API를 지원하지 않습니다.");
    }
  }

  isSupported() {
    return Boolean(this.recognition);
  }

  start(onResult, onStatusChange) {
    if (!this.recognition) {
      alert("현재 환경에서 마이크 음성 인식을 지원하지 않습니다. 버튼이나 타자 입력을 이용해주세요.");
      return;
    }
    this.onResultCallback = onResult;
    this.onStatusChangeCallback = onStatusChange;
    try {
      this.recognition.start();
    } catch (e) {
      console.warn("[VoiceInputEngine] 이미 인식 중이거나 시작 실패:", e);
    }
  }

  stop() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {}
    }
    this.isListening = false;
    if (this.onStatusChangeCallback) this.onStatusChangeCallback(false);
  }

  toggle(onResult, onStatusChange) {
    if (this.isListening) {
      this.stop();
    } else {
      this.start(onResult, onStatusChange);
    }
  }
}

export const voiceInputEngine = new VoiceInputEngine();
