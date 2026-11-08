/**
 * 직업 마1스톤 - 챕터 1: 첫 관문 (면접과 계약)
 * 
 * 핵심 기능:
 * 1. 멘토 도현과의 사전 교류 및 긴장 완화 분기
 * 2. Gemma 2B 로컬 LLM 면접관 실시간 대화
 * 3. 3대 입력 인터페이스 동시 지원 (버튼 클릭형 / 타자형 / 음성 입력형)
 * 4. 시각적 근로계약서 검토 및 서명 인터랙션
 */

import { dialogueEngine } from '../engine/dialogue.js';
import { motionEngine } from '../engine/motion.js';
import { llmInterviewEngine } from '../engine/llm_interview.js';
import { voiceInputEngine } from '../engine/voice_input.js';

export class Chapter1Scenario {
  constructor(app) {
    this.app = app;
    this.interviewTurn = 0; // 0: 첫질문 대기, 1: 1차답변 완료, 2: 2차답변 완료
    this.interviewHistory = [];
  }

  start() {
    this.interviewTurn = 0;
    this.interviewHistory = [];
    llmInterviewEngine.reset();

    // 점장님 메모 게시판 설정
    this.app.updateClueBoard(
      "면접 첫걸음",
      "1. 단정한 옷차림과 노크 인사\n2. 모르는 것은 솔직히 질문하기\n3. 도움을 청하는 당당한 태도"
    );

    // 멘토 도현과의 첫 대화 시작
    this.sceneGreeting();
  }

  // 1. 도현과의 사전 대화 & 분기
  sceneGreeting() {
    this.app.setStageCharacters({
      left: { id: "연우", name: "연우", visible: true },
      right: { id: "도현", name: "도현 (멘토)", visible: true }
    });

    dialogueEngine.say(
      "도현 (멘토)",
      "연우 씨, 좋은 아침이에요! 오늘 점장님과의 첫 면접 날이라 많이 떨리죠? 심호흡 한 번 크게 하고 긴장을 풀어볼까요?",
      () => {
        this.showPreInterviewChoices();
      }
    );
  }

  // 면접 전 태도 선택지 분기
  showPreInterviewChoices() {
    const choices = [
      {
        label: "심호흡을 크게 하고 긴장을 푼다",
        feedback: "맞아요, 후-하! 천천히 숨을 쉬면 마음이 훨씬 편안해질 거예요. 점장님은 성실하고 정직한 사람을 가장 좋아하시니까 안심해요."
      },
      {
        label: "거울을 보며 유니폼과 옷매무새를 단정히 한다",
        feedback: "오, 눈빛이 아주 단정하고 멋지네요! 첫인상에서 단정한 옷차림은 신뢰의 기본이니까요."
      }
    ];

    this.renderSimpleBranch(choices, (choice) => {
      motionEngine.playSfx('select');
      if (choice.label.includes("심호흡")) {
        this.app.triggerCharacterMotion("연우", "breathe");
      } else {
        this.app.triggerCharacterMotion("연우", "bow");
      }
      dialogueEngine.say("도현 (멘토)", choice.feedback, () => {
        setTimeout(() => this.sceneEnterOffice(), 500);
      });
    });
  }

  // 2. 점장실 입장
  sceneEnterOffice() {
    motionEngine.triggerSlashTransition(() => {
      this.app.setStageCharacters({
        left: { id: "연우", name: "연우", visible: true },
        right: { id: "점장", name: "점장님", visible: true }
      });

      dialogueEngine.say(
        "점장님",
        "어서 와요, 연우 씨. 자리에 편하게 앉아요. 긴장하지 말고 우리 카페에서 함께 일할 수 있을지 편안하게 이야기 나눠봅시다.",
        () => {
          setTimeout(() => this.startLLMInterview(), 400);
        }
      );
    });
  }

  // 3. Gemma 2B 기반 실시간 면접 루프 시작
  startLLMInterview() {
    this.interviewTurn = 1;
    const initialQuestion = "우리 베이커리 카페 '마일스톤'에 지원하게 된 이유와, 평소에 자신 있는 일이 무엇인지 말해줄래요?";

    dialogueEngine.say("점장님", initialQuestion, () => {
      this.showInterviewInputPanel({
        questionType: "motivation",
        presets: [
          "카페를 좋아하고, 빵 포장과 컵 정리를 성실하게 잘할 수 있습니다!",
          "매장 청소와 정리를 꼼꼼하게 잘하며, 약속 시간을 철저히 지킵니다.",
          "새로운 일 배우는 것을 좋아하고, 밝은 미소로 인사할 수 있습니다!"
        ]
      });
    });
  }

  // 3대 입력 인터페이스 (버튼 클릭형 / 타자형 / 음성 입력형) 렌더링
  showInterviewInputPanel({ questionType, presets }) {
    const panel = document.getElementById('interview-panel');
    const presetsContainer = document.getElementById('interview-presets');
    const inputEl = document.getElementById('interview-input');
    const sendBtn = document.getElementById('interview-send-btn');
    const micBtn = document.getElementById('interview-mic-btn');
    const micStatus = document.getElementById('interview-mic-status');

    if (!panel) return;
    panel.style.display = "flex";
    inputEl.value = "";
    inputEl.placeholder = "답변을 입력하거나 아래 추천 버튼/마이크를 눌러보세요...";

    // 1) 버튼 클릭형 프리셋 칩 생성
    presetsContainer.innerHTML = "";
    presets.forEach(text => {
      const chip = document.createElement('button');
      chip.className = 'preset-chip';
      chip.textContent = text;
      chip.addEventListener('click', () => {
        inputEl.value = text;
        this.submitCandidateResponse(text);
      });
      presetsContainer.appendChild(chip);
    });

    // 2) 타자형 전송 핸들러
    const handleSend = () => {
      const text = inputEl.value.trim();
      if (text) {
        this.submitCandidateResponse(text);
      }
    };

    sendBtn.onclick = handleSend;
    inputEl.onkeydown = (e) => {
      if (e.key === 'Enter') handleSend();
    };

    // 3) 음성 입력형 (STT) 마이크 핸들러
    if (micBtn) {
      micBtn.onclick = () => {
        voiceInputEngine.toggle(
          (recognizedText, isFinal) => {
            inputEl.value = recognizedText;
            if (isFinal && recognizedText.trim().length > 0) {
              // 음성 인식이 완료되면 살짝 대기 후 전송
              setTimeout(() => this.submitCandidateResponse(recognizedText), 600);
            }
          },
          (isListening) => {
            if (isListening) {
              micBtn.style.background = "var(--p5-yellow)";
              micBtn.style.color = "#000";
              if (micStatus) micStatus.textContent = "🎙️ 듣고 있어요... 말씀하세요!";
            } else {
              micBtn.style.background = "";
              micBtn.style.color = "";
              if (micStatus) micStatus.textContent = "";
            }
          }
        );
      };
    }
  }

  // 지원자 답변 전송 및 LLM 생성 처리
  async submitCandidateResponse(userAnswer) {
    const panel = document.getElementById('interview-panel');
    if (panel) panel.style.display = "none";
    voiceInputEngine.stop();

    motionEngine.playSfx('select');

    // 연우의 답변 대사 출력
    dialogueEngine.say("나 (연우)", userAnswer, async () => {
      // LLM 응답 대기 로딩 표시
      dialogueEngine.say("점장님", "생각 중입니다... (연우 씨의 답변을 따뜻하게 경청하고 있어요)", null);

      // Gemma 2B 호출
      const result = await llmInterviewEngine.sendCandidateResponse(userAnswer);
      const reply = result ? result.reply : "답변을 잘 들었습니다. 참 솔직하고 성실하군요!";

      // P5 컷인 효과로 점장님의 반응 강조
      motionEngine.triggerCutIn("점장님", "훌륭한 태도입니다!");

      // 점장님의 LLM 생성 대사 출력
      dialogueEngine.say("점장님", reply, () => {
        this.advanceInterviewFlow();
      });
    });
  }

  // 인터뷰 다음 단계 진행 (2단계 질문 또는 계약서 단계)
  advanceInterviewFlow() {
    if (this.interviewTurn === 1) {
      this.interviewTurn = 2;
      // 2차 질문: 돌발 상황 및 정직한 대처
      const secondQuestion = "만약 일하다가 컵을 떨어뜨려 깨뜨리거나, 어떻게 해야 할지 모르는 상황이 오면 어떻게 대처할 건가요?";
      setTimeout(() => {
        dialogueEngine.say("점장님", secondQuestion, () => {
          this.showInterviewInputPanel({
            questionType: "contingency",
            presets: [
              "당황하지 않고, '점장님 제가 컵을 깨뜨렸습니다'라고 즉시 솔직하게 보고하겠습니다.",
              "다치지 않게 조심하고, 선배님이나 점장님께 어떻게 치워야 할지 물어보겠습니다.",
              "모르는 일이 생기면 혼자 해결하려 하지 않고 바로 도움을 요청하겠습니다."
            ]
          });
        });
      }, 600);
    } else {
      // 인터뷰 성공적 종료 -> 근로계약서 확인 단계
      setTimeout(() => {
        dialogueEngine.say(
          "점장님",
          "모르는 것을 솔직하게 인정하고 보고하는 자세야말로 우리 매장에서 가장 원하는 인재상이에요. 연우 씨의 성실함을 믿습니다! 자, 그럼 근로계약서를 함께 확인해 볼까요?",
          () => {
            this.showContractModal();
          }
        );
      }, 600);
    }
  }

  // 4. 근로계약서 확인 및 서명 인터랙션
  showContractModal() {
    const modal = document.getElementById('contract-modal');
    const signBtn = document.getElementById('contract-sign-btn');
    if (!modal) return;

    modal.classList.add('active');
    motionEngine.playSfx('select');

    if (signBtn) {
      signBtn.onclick = () => {
        motionEngine.playSfx('success');
        modal.classList.remove('active');

        // P5 컷인 및 축하 연출
        motionEngine.triggerCutIn("정식 채용 계약", "ALL-OUT CONTRACT SIGNED!");

        dialogueEngine.say(
          "점장님",
          "계약이 완료되었습니다! 오늘부터 연우 씨는 베이커리 카페 '마일스톤'의 당당한 신입 크루입니다. 선임 도현 씨와 함께 즐겁게 일해봐요!",
          () => {
            this.completeChapter1();
          }
        );
      };
    }
  }

  // 챕터 1 마무리 & 챕터 2 전환
  completeChapter1() {
    this.app.addMilestoneStar();
    motionEngine.triggerAllOutAttack(
      "CHAPTER 1 COMPLETE!",
      "면접 통과 및 정식 근로계약 체결 완료!",
      () => {
        this.app.loadChapter(2);
      }
    );
  }

  // 공통 선택지 렌더러
  renderSimpleBranch(choices, onSelect) {
    const tray = document.getElementById('card-tray');
    if (!tray) return;

    tray.innerHTML = "";
    tray.style.display = "flex";

    choices.forEach((choice, idx) => {
      const card = document.createElement('div');
      card.className = 'p5-action-card';
      card.innerHTML = `
        <div class="p5-card-icon-wrap">
          <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
        </div>
        <div class="p5-card-text-wrap">
          <span class="p5-card-step-badge">CHOICE ${idx + 1}</span>
          <div class="p5-card-action-title">${choice.label}</div>
        </div>
      `;
      card.onclick = () => {
        tray.style.display = "none";
        onSelect(choice);
      };
      tray.appendChild(card);
    });
  }
}
