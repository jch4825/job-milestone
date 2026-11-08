/**
 * 직업 마1스톤 - 메인 애플리케이션 진입점 & 씬 라이프사이클 매니저
 */

import { CONFIG } from './config.js';
import { motionEngine } from './engine/motion.js';
import { dialogueEngine } from './engine/dialogue.js';
import { Chapter1Scenario } from './scenarios/chapter1.js';
import { Chapter2Scenario } from './scenarios/chapter2.js';
import { Chapter3Scenario } from './scenarios/chapter3.js';

class GameApp {
  constructor() {
    this.currentChapterId = 1;
    this.milestoneStars = 0;
    this.maxStars = 5;

    this.scenarios = {
      1: new Chapter1Scenario(this),
      2: new Chapter2Scenario(this),
      3: new Chapter3Scenario(this)
    };
  }

  init() {
    dialogueEngine.init();
    this.bindEvents();
    this.renderMilestones();
    this.loadChapter(1);
  }

  bindEvents() {
    // 대화창 클릭 시 타이핑 스킵
    const dialogueBox = document.getElementById('dialogue-box');
    if (dialogueBox) {
      dialogueBox.addEventListener('click', () => {
        dialogueEngine.skipOrNext();
      });
    }

    // 챕터 점프 버튼들 (디버그/시연용 상단 배지 클릭)
    const chapterBadge = document.getElementById('header-chapter-badge');
    if (chapterBadge) {
      chapterBadge.addEventListener('click', () => {
        const nextChap = (this.currentChapterId % 3) + 1;
        this.loadChapter(nextChap);
      });
    }
  }

  loadChapter(chapterId) {
    this.currentChapterId = chapterId;
    const chapterData = CONFIG.CHAPTERS.find(c => c.id === chapterId);

    // UI 헤더 업데이트
    const badgeEl = document.getElementById('header-chapter-badge');
    const titleEl = document.getElementById('header-chapter-title');

    if (badgeEl && chapterData) badgeEl.textContent = chapterData.badge;
    if (titleEl && chapterData) titleEl.textContent = chapterData.title;

    // 슬래시 전환 후 시나리오 시작
    motionEngine.triggerSlashTransition(() => {
      if (this.scenarios[chapterId]) {
        this.scenarios[chapterId].start();
      }
    });
  }

  // 상시 오픈북 단서 보드(포스트잇 메모) 텍스트 업데이트
  updateClueBoard(title, content) {
    const titleEl = document.getElementById('clue-title-text');
    const contentEl = document.getElementById('clue-content-text');

    if (titleEl) titleEl.textContent = title;
    if (contentEl) contentEl.innerText = content;
  }

  // 무대 캐릭터 스탠딩 슬롯 가시성 제어
  setStageCharacters({ left, right }) {
    const leftSlot = document.getElementById('char-slot-left');
    const rightSlot = document.getElementById('char-slot-right');
    const leftLabel = document.getElementById('char-name-left');
    const rightLabel = document.getElementById('char-name-right');
    const leftImg = document.getElementById('char-svg-left');
    const rightImg = document.getElementById('char-svg-right');

    if (left && leftSlot) {
      leftSlot.style.display = left.visible ? 'flex' : 'none';
      leftSlot.setAttribute('data-character', left.id);
      if (leftLabel) leftLabel.textContent = left.name;
      this.renderCharacterSvg(leftImg, left.id);
    }

    if (right && rightSlot) {
      rightSlot.style.display = right.visible ? 'flex' : 'none';
      rightSlot.setAttribute('data-character', right.id);
      if (rightLabel) rightLabel.textContent = right.name;
      this.renderCharacterSvg(rightImg, right.id);
    }
  }

  // 캐릭터 모션 시트 키프레임 애니메이션 트리거 (bow, breathe, flustered, victory, idle)
  triggerCharacterMotion(charId, motionType = 'idle') {
    const slots = document.querySelectorAll('.char-slot');
    slots.forEach(slot => {
      if (slot.getAttribute('data-character') === charId) {
        slot.classList.remove('motion-idle', 'motion-bow', 'motion-breathe', 'motion-flustered', 'motion-victory');
        slot.classList.add(`motion-${motionType}`);

        if (motionType !== 'idle') {
          setTimeout(() => {
            slot.classList.remove(`motion-${motionType}`);
            slot.classList.add('motion-idle');
          }, 1200);
        }
      }
    });
  }

  // 캐릭터별 고화질 일러스트 렌더러 (생성된 캐릭터 시트 우선 사용)
  renderCharacterSvg(imgEl, charId) {
    if (!imgEl) return;

    let charClass = "";
    if (charId === "연우") charClass = "char-yeonwoo";
    else if (charId === "도현") charClass = "char-dohyun";
    else if (charId === "점장") charClass = "char-manager";

    if (charClass) {
      imgEl.innerHTML = `<div class="char-portrait-img ${charClass}"></div>`;
      return;
    }
      // 주인공 연우 (단정하고 성실한 베이커리 크루 복장)
      imgEl.innerHTML = `
        <svg viewBox="0 0 200 400" width="100%" height="100%">
          <defs>
            <linearGradient id="yeonwoo-apron" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stop-color="#b3000d"/>
              <stop offset="100%" stop-color="#e60012"/>
            </linearGradient>
          </defs>
          <!-- 머리 & 헤어 -->
          <circle cx="100" cy="90" r="45" fill="#4a2e18"/>
          <path d="M55,95 Q100,20 145,95 Q100,50 55,95 Z" fill="#361f0e"/>
          <!-- 얼굴 -->
          <ellipse cx="100" cy="100" rx="35" ry="38" fill="#ffe0bd"/>
          <!-- 눈 & 미소 -->
          <ellipse cx="88" cy="98" rx="4" ry="6" fill="#222"/>
          <ellipse cx="112" cy="98" rx="4" ry="6" fill="#222"/>
          <circle cx="89" cy="96" r="1.5" fill="#fff"/>
          <circle cx="113" cy="96" r="1.5" fill="#fff"/>
          <path d="M93,115 Q100,123 107,115" stroke="#e60012" stroke-width="2.5" fill="none"/>
          <!-- 유니폼 & 에이프런 -->
          <path d="M60,140 L140,140 L150,340 L50,340 Z" fill="url(#yeonwoo-apron)" stroke="#fff" stroke-width="3"/>
          <rect x="80" y="170" width="40" height="30" fill="#fff" rx="4"/>
          <!-- 이름표 -->
          <rect x="85" y="175" width="30" height="8" fill="#e60012"/>
          <text x="100" y="240" fill="#fff" font-size="14" font-weight="bold" text-anchor="middle">YEONWOO</text>
        </svg>
      `;
    } else if (charId === "도현") {
      // 멘토 도현 (따뜻하고 듬직한 선임 코치)
      imgEl.innerHTML = `
        <svg viewBox="0 0 200 400" width="100%" height="100%">
          <defs>
            <linearGradient id="dohyun-vest" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stop-color="#1e1e24"/>
              <stop offset="100%" stop-color="#0c0c10"/>
            </linearGradient>
          </defs>
          <!-- 머리 & 헤어 -->
          <path d="M50,85 Q100,15 150,85 Q150,45 100,40 Q50,45 50,85 Z" fill="#222"/>
          <!-- 얼굴 -->
          <ellipse cx="100" cy="95" rx="36" ry="40" fill="#fcdbb2"/>
          <!-- 안경 -->
          <rect x="74" y="88" width="22" height="15" fill="none" stroke="#e60012" stroke-width="3" rx="2"/>
          <rect x="104" y="88" width="22" height="15" fill="none" stroke="#e60012" stroke-width="3" rx="2"/>
          <line x1="96" y1="95" x2="104" y2="95" stroke="#e60012" stroke-width="3"/>
          <!-- 눈 & 온화한 미소 -->
          <circle cx="85" cy="95" r="3" fill="#222"/>
          <circle cx="115" cy="95" r="3" fill="#222"/>
          <path d="M92,118 Q100,126 108,118" stroke="#333" stroke-width="2.5" fill="none"/>
          <!-- 바리스타 셔츠 & 베스트 -->
          <path d="M55,135 L145,135 L155,350 L45,350 Z" fill="url(#dohyun-vest)" stroke="#fff" stroke-width="3"/>
          <path d="M85,135 L100,170 L115,135 Z" fill="#e60012"/>
          <text x="100" y="240" fill="#ffd200" font-size="14" font-weight="bold" text-anchor="middle">MENTOR</text>
        </svg>
      `;
    } else if (charId === "점장") {
      // 깐깐하지만 원칙을 지키며 인정해주는 점장님
      imgEl.innerHTML = `
        <svg viewBox="0 0 200 400" width="100%" height="100%">
          <!-- 머리 -->
          <ellipse cx="100" cy="85" rx="42" ry="40" fill="#444"/>
          <!-- 얼굴 -->
          <ellipse cx="100" cy="95" rx="37" ry="40" fill="#f5ceab"/>
          <!-- 눈 & 날카로운 시선 -> 미소 -->
          <path d="M78,92 L92,94" stroke="#222" stroke-width="4"/>
          <path d="M108,94 L122,92" stroke="#222" stroke-width="4"/>
          <circle cx="85" cy="98" r="3.5" fill="#222"/>
          <circle cx="115" cy="98" r="3.5" fill="#222"/>
          <path d="M92,120 Q100,124 108,120" stroke="#222" stroke-width="3" fill="none"/>
          <!-- 정장 슈트 -->
          <path d="M50,135 L150,135 L160,350 L40,350 Z" fill="#15151e" stroke="#ffd200" stroke-width="3"/>
          <path d="M92,135 L100,200 L108,135 Z" fill="#e60012"/>
          <text x="100" y="240" fill="#fff" font-size="14" font-weight="bold" text-anchor="middle">MANAGER</text>
        </svg>
      `;
    }
  }

  // 마일스톤 별 게이지 업데이트
  addMilestoneStar() {
    this.milestoneStars = Math.min(this.milestoneStars + 1, this.maxStars);
    this.renderMilestones();
  }

  renderMilestones() {
    const container = document.getElementById('milestone-stars-container');
    if (!container) return;

    container.innerHTML = "";
    for (let i = 0; i < this.maxStars; i++) {
      const star = document.createElement('span');
      star.className = `p5-star ${i < this.milestoneStars ? 'active' : ''}`;
      star.textContent = "★";
      container.appendChild(star);
    }
  }
}

// 윈도우 로드 시 게임 시작
window.addEventListener('DOMContentLoaded', () => {
  window.gameApp = new GameApp();
  window.gameApp.init();
});
