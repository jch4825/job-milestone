/**
 * 직업 마1스톤 - 대화 출력 및 타이핑 시스템
 */

import { motionEngine } from './motion.js';

class DialogueEngine {
  constructor() {
    this.textEl = null;
    this.speakerEl = null;
    this.isTyping = false;
    this.currentText = "";
    this.typingInterval = null;
    this.onFinishCallback = null;
  }

  init(textElementId = 'dialogue-text', speakerElementId = 'dialogue-speaker') {
    this.textEl = document.getElementById(textElementId);
    this.speakerEl = document.getElementById(speakerElementId);
  }

  say(speaker, text, onFinish) {
    if (!this.textEl || !this.speakerEl) this.init();

    this.speakerEl.textContent = speaker;
    this.currentText = text;
    this.onFinishCallback = onFinish;

    // 캐릭터 하이라이트 전환
    this.updateCharacterHighlights(speaker);

    if (this.typingInterval) clearInterval(this.typingInterval);

    this.textEl.textContent = "";
    this.isTyping = true;
    let idx = 0;

    this.typingInterval = setInterval(() => {
      if (idx < text.length) {
        this.textEl.textContent += text[idx];
        idx++;
      } else {
        this.finishTyping();
      }
    }, 28);
  }

  finishTyping() {
    if (this.typingInterval) clearInterval(this.typingInterval);
    if (this.textEl) this.textEl.textContent = this.currentText;
    this.isTyping = false;
    if (this.onFinishCallback) {
      const cb = this.onFinishCallback;
      this.onFinishCallback = null;
      cb();
    }
  }

  skipOrNext() {
    if (this.isTyping) {
      this.finishTyping();
      return true;
    }
    return false;
  }

  updateCharacterHighlights(speaker) {
    const chars = document.querySelectorAll('.char-slot');
    chars.forEach(slot => {
      const charName = slot.getAttribute('data-character');
      if (speaker.includes(charName) || (speaker === '나(연우)' && charName === '연우')) {
        slot.classList.add('active-speaker');
        slot.classList.remove('inactive');
      } else {
        slot.classList.remove('active-speaker');
        slot.classList.add('inactive');
      }
    });
  }
}

export const dialogueEngine = new DialogueEngine();
