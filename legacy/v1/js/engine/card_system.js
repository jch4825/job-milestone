/**
 * 직업 마1스톤 - 3지선다 그림 카드 루틴 시스템 (Non-Punitive Design)
 */

import { motionEngine } from './motion.js';
import { dialogueEngine } from './dialogue.js';

class CardSystem {
  constructor() {
    this.containerEl = null;
    this.currentStep = null;
    this.onSuccessCallback = null;
  }

  init(containerId = 'card-tray') {
    this.containerEl = document.getElementById(containerId);
  }

  renderCards(stepData, onSuccess) {
    if (!this.containerEl) this.init();
    this.currentStep = stepData;
    this.onSuccessCallback = onSuccess;

    this.containerEl.innerHTML = "";
    this.containerEl.style.display = "flex";

    stepData.choices.forEach((choice, index) => {
      const card = document.createElement('div');
      card.className = 'p5-action-card';
      card.setAttribute('data-index', index);

      card.innerHTML = `
        <div class="p5-card-icon-wrap">
          ${choice.iconSvg}
        </div>
        <div class="p5-card-text-wrap">
          <span class="p5-card-step-badge">${choice.badge || `ACTION ${index + 1}`}</span>
          <div class="p5-card-action-title">${choice.label}</div>
        </div>
      `;

      card.addEventListener('click', () => this.handleCardSelect(choice, card));
      this.containerEl.appendChild(card);
    });
  }

  handleCardSelect(choice, cardEl) {
    if (choice.isCorrect) {
      // 1. 올바른 선택 (즉각적인 긍정 강화)
      motionEngine.playSfx('success');
      cardEl.classList.add('p5-success-feedback');

      // P5 컷인 발동
      motionEngine.triggerCutIn("도현 (선임)", choice.mentorPraise || "완벽해요, 연우 씨!");

      // 멘토 칭찬 대사 출력
      dialogueEngine.say("도현 (멘토)", choice.mentorPraise || "맞아요! 아주 훌륭한 순서예요.", () => {
        setTimeout(() => {
          this.containerEl.style.display = "none";
          if (this.onSuccessCallback) this.onSuccessCallback();
        }, 600);
      });
    } else {
      // 2. 다른 카드 선택 (처벌 배제: 실패나 감점 없이 부드러운 힌트 제공)
      motionEngine.playSfx('hint');
      cardEl.classList.add('p5-hint-guidance');
      setTimeout(() => cardEl.classList.remove('p5-hint-guidance'), 500);

      // 도현의 힌트 피드백 대사 출력
      const hintText = choice.mentorHint || "좋은 생각이지만, 점장님 메모를 보고 먼저 해야 할 일을 찾아볼까요?";
      dialogueEngine.say("도현 (멘토)", hintText);
    }
  }

  clear() {
    if (this.containerEl) {
      this.containerEl.innerHTML = "";
      this.containerEl.style.display = "none";
    }
  }
}

export const cardSystem = new CardSystem();
