/**
 * 직업 마1스톤 - 페르소나 5 스타일 모션 그래픽 & 오디오 FX 컨트롤러
 */

class MotionEngine {
  constructor() {
    this.audioCtx = null;
  }

  // Web Audio API 초기화 (사용자 인터랙션 시 자동 활성화)
  initAudio() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.audioCtx = new AudioContext();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  // 내장 신스 효과음 (파일 의존성 없이 즉각 반응)
  playSfx(type = 'select') {
    this.initAudio();
    if (!this.audioCtx) return;

    const ctx = this.audioCtx;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'select') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.1);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
      osc.start(now);
      osc.stop(now + 0.1);
    } else if (type === 'success') {
      // P5 특유의 경쾌한 아르페지오 느낌
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.connect(g);
        g.connect(ctx.destination);
        o.type = 'sawtooth';
        o.frequency.setValueAtTime(freq, now + i * 0.08);
        g.gain.setValueAtTime(0.12, now + i * 0.08);
        g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.25);
        o.start(now + i * 0.08);
        o.stop(now + i * 0.08 + 0.25);
      });
    } else if (type === 'hint') {
      // 부드러운 피아노/마림바 톤
      osc.type = 'sine';
      osc.frequency.setValueAtTime(392, now);
      osc.frequency.exponentialRampToValueAtTime(329.63, now + 0.2);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
      osc.start(now);
      osc.stop(now + 0.25);
    } else if (type === 'cutin') {
      // 쾅 하는 묵직한 타격음
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(120, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.3);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
      osc.start(now);
      osc.stop(now + 0.35);
    }
  }

  // 페르소나 5 시그니처 컷인(Cut-in) 연출
  triggerCutIn(speakerName, messageText = "PERFECT ACTION!") {
    const overlay = document.getElementById('cutin-overlay');
    const nameEl = document.getElementById('cutin-speaker-name');
    const textEl = document.getElementById('cutin-banner-text');

    if (!overlay) return;

    if (nameEl) nameEl.textContent = speakerName;
    if (textEl) textEl.textContent = messageText;

    this.playSfx('cutin');
    overlay.classList.add('active');

    setTimeout(() => {
      overlay.classList.remove('active');
    }, 1300);
  }

  // 대각선 슬래시 화면 전환 연출
  triggerSlashTransition(onMidpointCallback) {
    const slash = document.getElementById('transition-slash');
    if (!slash) {
      if (onMidpointCallback) onMidpointCallback();
      return;
    }

    this.playSfx('select');
    slash.className = 'p5-transition-slash active';

    setTimeout(() => {
      if (onMidpointCallback) onMidpointCallback();
      slash.className = 'p5-transition-slash exit';

      setTimeout(() => {
        slash.className = 'p5-transition-slash';
      }, 600);
    }, 350);
  }

  // All-Out Attack 승리 연출
  triggerAllOutAttack(title = "MISSION COMPLETE", subtitle = "정식 크루 임명을 축하합니다!", onFinish) {
    const banner = document.getElementById('all-out-banner');
    const titleEl = document.getElementById('all-out-title');
    const subtitleEl = document.getElementById('all-out-subtitle');

    if (!banner) return;
    if (titleEl) titleEl.textContent = title;
    if (subtitleEl) subtitleEl.textContent = subtitle;

    this.playSfx('success');
    banner.classList.add('active');

    setTimeout(() => {
      banner.classList.remove('active');
      if (onFinish) onFinish();
    }, 2800);
  }

  // 시네마틱 카메라 펀치인 줌 연출 (YouTube Ref: '그녀의 하수인' 벤치마킹)
  triggerCameraZoom(side = 'normal', durationMs = 1500) {
    const stage = document.querySelector('.stage-container');
    if (!stage) return;

    stage.classList.remove('camera-zoom-left', 'camera-zoom-right', 'camera-normal');
    if (side === 'left') {
      stage.classList.add('camera-zoom-left');
    } else if (side === 'right') {
      stage.classList.add('camera-zoom-right');
    } else {
      stage.classList.add('camera-normal');
    }

    if (side !== 'normal' && durationMs > 0) {
      setTimeout(() => {
        stage.classList.remove('camera-zoom-left', 'camera-zoom-right');
        stage.classList.add('camera-normal');
      }, durationMs);
    }
  }
}

export const motionEngine = new MotionEngine();
