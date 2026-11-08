/**
 * 직업 마1스톤 - 챕터 2: 일상 루틴과 이벤트
 * 
 * 핵심 시스템:
 * 1. 점장님의 오픈북 포스트잇 메모 상시 단서
 * 2. 3지선다 그림 카드 선택 (아이콘 + 행동 라벨)
 * 3. 처벌 배제(Non-Punitive Design): 오답 시 감점 없이 도현 선배의 친절한 힌트 대사
 * 4. 정답 시 P5 컷인 및 경쾌한 긍정 피드백
 */

import { dialogueEngine } from '../engine/dialogue.js';
import { motionEngine } from '../engine/motion.js';
import { cardSystem } from '../engine/card_system.js';
import { ICONS } from '../engine/icons.js';

export class Chapter2Scenario {
  constructor(app) {
    this.app = app;
    this.currentRoutineIndex = 0;
  }

  start() {
    this.currentRoutineIndex = 0;

    // 점장님의 오픈북 포스트잇 메모 게시
    this.app.updateClueBoard(
      "오픈 준비 루틴",
      "1. 유니폼 입고 손 씻기 (위생)\n2. 컵과 소모품 채우기 (준비)\n3. 주문 접수 및 인사 (고객)"
    );

    this.app.setStageCharacters({
      left: { id: "연우", name: "연우", visible: true },
      right: { id: "도현", name: "도현 (선임)", visible: true }
    });

    dialogueEngine.say(
      "도현 (선임)",
      "연우 씨! 오늘부터 본격적인 매장 오픈 루틴을 함께 해볼 거예요. 오른쪽 위 점장님 메모를 보면서 차근차근 순서대로 해봐요!",
      () => {
        setTimeout(() => this.runRoutineStep(0), 500);
      }
    );
  }

  // 루틴 단계별 데이터 정의
  getRoutineSteps() {
    return [
      {
        instruction: "도현: 출근하자마자 가장 먼저 해야 할 위생 준비는 무엇일까요?",
        choices: [
          {
            iconSvg: ICONS.UNIFORM,
            label: "유니폼 입고 손 씻기",
            badge: "위생 1단계",
            isCorrect: true,
            mentorPraise: "정답이에요! 청결한 유니폼을 입고 손을 꼼꼼히 씻는 것이 기본 중의 기본이죠.",
          },
          {
            iconSvg: ICONS.CUP,
            label: "음료 컵 채우기",
            badge: "준비",
            isCorrect: false,
            mentorHint: "컵을 만지기 전에, 먼저 손을 깨끗하게 씻고 유니폼을 단정히 입어야 해요!"
          },
          {
            iconSvg: ICONS.GREETING,
            label: "포스기 앞에서 손님 기다리기",
            badge: "응대",
            isCorrect: false,
            mentorHint: "손님을 맞이하기 전에 오픈 준비와 손 씻기를 먼저 해야 한답니다. 점장님 메모를 볼까요?"
          }
        ]
      },
      {
        instruction: "도현: 손을 깨끗이 씻었으니, 이제 카운터 비품을 준비해 볼까요?",
        choices: [
          {
            iconSvg: ICONS.CLEAN,
            label: "바닥에 대걸레질하기",
            badge: "청소",
            isCorrect: false,
            mentorHint: "바닥 청소도 좋지만, 손님이 오시기 전에 주문받을 컵과 냅킨부터 채워볼까요?"
          },
          {
            iconSvg: ICONS.CUP,
            label: "컵과 빨대 채우기",
            badge: "비품 준비",
            isCorrect: true,
            mentorPraise: "아주 좋아요! 컵을 종류별로 채워두니 마음이 든든하네요."
          },
          {
            iconSvg: ICONS.REPORT,
            label: "휴게실에서 쉬기",
            badge: "휴식",
            isCorrect: false,
            mentorHint: "휴식 시간은 근무 후에 가진답니다. 지금은 점장님 메모대로 비품을 채워봐요!"
          }
        ]
      },
      {
        instruction: "도현: 앗, 연우 씨! 실수로 테이블에 시럽을 조금 쏟았네요. 이럴 땐 어떻게 해야 할까요?",
        choices: [
          {
            iconSvg: ICONS.GREETING,
            label: "모르는 척 자리를 피한다",
            badge: "회피",
            isCorrect: false,
            mentorHint: "실수를 숨기면 다른 사람이 미끄러질 수 있어요. 즉시 솔직하게 말하는 게 가장 멋져요!"
          },
          {
            iconSvg: ICONS.REPORT,
            label: "선배에게 즉시 보고하고 닦기",
            badge: "정직한 보고",
            isCorrect: true,
            mentorPraise: "훌륭해요! 실수는 누구에게나 있어요. 즉시 알리고 함께 치우는 게 최고의 프로예요!"
          },
          {
            iconSvg: ICONS.CHECKLIST,
            label: "혼자 끙끙 앓으며 고민한다",
            badge: "고민",
            isCorrect: false,
            mentorHint: "혼자 고민하지 마세요. 저나 점장님께 바로 '선배님, 시럽을 쏟았습니다'라고 말씀해주세요!"
          }
        ]
      }
    ];
  }

  runRoutineStep(stepIndex) {
    const steps = this.getRoutineSteps();
    if (stepIndex >= steps.length) {
      this.completeChapter2();
      return;
    }

    const currentStep = steps[stepIndex];
    dialogueEngine.say("도현 (선임)", currentStep.instruction, () => {
      cardSystem.renderCards(currentStep, () => {
        // 정답 성공 시 다음 단계로 진행
        this.app.addMilestoneStar();
        setTimeout(() => {
          this.runRoutineStep(stepIndex + 1);
        }, 1200);
      });
    });
  }

  completeChapter2() {
    cardSystem.clear();
    motionEngine.triggerAllOutAttack(
      "CHAPTER 2 COMPLETE!",
      "매장 루틴 마스터! 훌륭한 직업인으로 성장 중!",
      () => {
        this.app.loadChapter(3);
      }
    );
  }
}
