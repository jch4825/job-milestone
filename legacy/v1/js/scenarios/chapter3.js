/**
 * 직업 마1스톤 - 챕터 3: 클라이맥스 (독립 직업인으로의 도약)
 * 
 * 핵심 시스템:
 * 1. 피크타임 돌발 상황 (단체 주문 + 혼잡)
 * 2. 우선순위에 따른 침착한 대처와 소통
 * 3. 점장님의 정식 크루(정규 채용) 배지 수여 및 엔딩
 */

import { dialogueEngine } from '../engine/dialogue.js';
import { motionEngine } from '../engine/motion.js';
import { cardSystem } from '../engine/card_system.js';
import { ICONS } from '../engine/icons.js';

export class Chapter3Scenario {
  constructor(app) {
    this.app = app;
  }

  start() {
    this.app.updateClueBoard(
      "피크타임 대처 수칙",
      "1. 당황하지 않고 깊게 심호흡\n2. 우선순위대로 차근차근\n3. 선임과 역할을 명확히 나누기"
    );

    this.app.setStageCharacters({
      left: { id: "연우", name: "연우", visible: true },
      right: { id: "점장", name: "점장님", visible: true }
    });

    dialogueEngine.say(
      "점장님",
      "연우 씨! 지금 근처 회사에서 단체 손님 20명이 갑자기 들어오셨어요. 매장이 매우 바쁜 상황입니다. 당황하지 말고 침착하게 해볼 수 있겠어요?",
      () => {
        this.runClimaxDecision();
      }
    );
  }

  runClimaxDecision() {
    const step = {
      instruction: "나(연우): 주문이 한꺼번에 몰려왔다. 어떻게 해야 할까?",
      choices: [
        {
          iconSvg: ICONS.CHECKLIST,
          label: "심호흡하고, 도현 선배와 역할을 나눈다",
          badge: "우선순위 & 협업",
          isCorrect: true,
          mentorPraise: "완벽한 판단이에요! 침착하게 호흡하고 분담하니 주문을 척척 소화했어요!"
        },
        {
          iconSvg: ICONS.REPORT,
          label: "너무 무서워서 눈을 감고 가만히 있는다",
          badge: "패닉",
          isCorrect: false,
          mentorHint: "긴장될 수 있어요! 그럴 땐 점장님 메모처럼 깊게 숨을 들이쉬고 선배에게 손을 내밀어 보세요."
        },
        {
          iconSvg: ICONS.CLEAN,
          label: "갑자기 엉뚱하게 매장 밖으로 뛰어나간다",
          badge: "이탈",
          isCorrect: false,
          mentorHint: "자리를 비우기보다, 우리 매장 동료들을 믿고 함께 호흡을 맞춰봐요!"
        }
      ]
    };

    cardSystem.renderCards(step, () => {
      this.app.addMilestoneStar();
      setTimeout(() => this.sceneBadgeCeremony(), 1200);
    });
  }

  sceneBadgeCeremony() {
    motionEngine.triggerSlashTransition(() => {
      this.app.setStageCharacters({
        left: { id: "연우", name: "연우", visible: true },
        right: { id: "점장", name: "점장님", visible: true }
      });

      motionEngine.triggerCutIn("점장님의 인정", "BEST PROFESSIONAL CREW!");

      dialogueEngine.say(
        "점장님",
        "연우 씨, 정말 놀라웠어요! 위기 상황에서도 규칙을 지키고 정직하게 소통하는 모습을 보며 큰 감동을 받았습니다. 오늘부로 연우 씨를 베이커리 카페 '마일스톤'의 정식 마스터 크루로 임명합니다!",
        () => {
          this.completeGame();
        }
      );
    });
  }

  completeGame() {
    this.app.addMilestoneStar();
    motionEngine.triggerAllOutAttack(
      "CONGRATULATIONS!",
      "연우의 자립 직업인 성장 스토리 완결!",
      () => {
        dialogueEngine.say(
          "도현 (선임)",
          "연우 씨, 진심으로 축하해요! 이제 우리는 최고의 파트너예요. 앞으로도 서로 의지하며 멋진 바리스타 & 베이커리로 함께 나아가요!"
        );
      }
    );
  }
}
