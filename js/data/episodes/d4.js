/**
 * DAY 4 · 목요일: 낯선 손님들
 * 학습: 화난 손님 앞 침착한 안내, 내 실수 사과, 사진 촬영 거절(초상권), 혼자 정하지 않고 묻기, 동료의 실수 보고 모델링
 * 성취기준: [12진로04-05] [12진로04-01] [12진로01-02]
 */

import {
  bg, bgm, amb, sfx, show, say, narr, think, time, place, schedule, memo,
  decide, good, bad, photo, term, finish, end, face, motion,
  check, guide,
} from '../../core/dsl.js';

export default {
  id: 'd4',
  act: 2,
  label: 'DAY 4 · 목요일',
  title: '낯선 손님들',
  when: '첫째 주 목요일 09:40',
  goal: '화난 손님 앞에서 차분하게, 싫은 건 "어려워요"라고 말해요.',
  schedule: [['breathe', '차분하게 안내하기'], ['stop', '싫은 건 "어려워요"'], ['question', '혼자 정하지 말고 묻기']],
  skills: ['calm', 'report', 'rights', 'ask'],
  // 음료가 바뀐 손님: 기본 손님 그림(지갑을 든 남성). 목소리가 남자 손님이라 남성 그림으로(2026-10-15, 예전엔 coffee 여성)
  standards: ['[12진로04-05]', '[12진로04-01]', '[12진로01-02]'],
  photo: 'latte',
  diary: '재촉하는 손님 앞에서 숨을 쉬고 말했다. 주문을 잘못 만들어서 "죄송합니다. 바로 다시 만들어 드릴게요"라고 했다. 사진 찍는 손님에게 처음으로 "제 얼굴은 찍지 말아 주세요"라고 말했다. 무례한 게 아니라 나를 지키는 거라고 선배가 말했다. 그리고 도현 선배도 실수를 보고했다. 선배도 실수를 하는구나.',
  script: [
    bg('counter', 'day'), bgm('cafe'), amb(null), time('09:40'),
    schedule(),
    memo('목요일 메모', [['clock', '주문은 순서대로, 차분하게'], ['question', '혼자 정하기 어려우면 선배에게'], ['stop', '불편한 일은 "어려워요"라고 말하기']]),
    sfx('bell'),
    place('09:40', '출근 시간'),
    show({ left: 'yeonwoo:normal', center: 'dohyun:normal', right: 'daeri:angry' }),
    say('daeri', 'angry', '저기요! 아메리카노 한 잔 나오는 데 몇 분이나 걸려요? 저 회의 늦는다고요!'),
    narr('손님이 손목시계를 톡톡 두드렸다. 목소리가 커서 심장이 쿵 내려앉았다.'),
    face('yeonwoo', 'nervous'),
    guide('timer', '이번에는 고를 시간이 정해져 있어요. **막대**가 다 줄어들기 전에 골라요.'),

    decide({
      id: 'd4_rush', title: '재촉하는 손님', q: '손님이 화를 낸다. 어떻게 할까?', who: 'yeonwoo', skill: 'calm', memo: 1,
      timer: { sec: 18, label: '손님이 재촉해요', as: 'freeze' }, // 급한 장면: 회의에 늦는 손님이 시계를 두드림
      choices: [
        bad('run', '서둘러 대충 만든다', {
          fail: [
            narr('나는 허둥지둥 컵을 집었다. 손이 떨렸다.'),
            sfx('spill'),
            narr('뜨거운 커피가 컵 밖으로 넘쳤다. 손님 셔츠 소매에 커피가 튀었다.'),
            say('daeri', 'angry', '아, 진짜! 오늘 중요한 회의인데!'),
          ],
          oops: { id: 'd4_hurry', title: '서두르다 커피를 쏟았어요', lesson: '재촉받아도 서두르면 실수가 커져요. 숨 한 번 쉬고, 순서대로 차분하게 말해요.', icon: 'coffee' },
        }),
        good('breathe', '숨을 한 번 쉬고 "주문하신 순서대로 빠르게 준비하고 있습니다"라고 말한다', {
          praise: [
            motion('yeonwoo', 'breathe'),
            say('yeonwoo', 'determined', '주문하신 순서대로 빠르게 준비하고 있습니다. 조금만 기다려 주세요.'),
            say('dohyun', 'smile', '아메리카노 바로 나가요!'),
            say('daeri', 'normal', '…네. 알겠어요.'),
            narr('손님은 커피를 받아 서둘러 나갔다.'),
          ],
        }),
        bad('freeze', '고개를 숙이고 아무 말도 안 한다', {
          fail: [
            narr('나는 고개를 푹 숙였다. 아무 말도 나오지 않았다.'),
            say('daeri', 'angry', '듣고 있어요? 대답 좀 해 봐요!'),
            narr('손님 목소리가 더 커졌다. 다른 손님들이 우리를 쳐다보았다.'),
          ],
          oops: { id: 'd4_silent', title: '손님이 더 화가 났어요', lesson: '대답이 없으면 손님은 무시당했다고 느껴요. 정해진 문장으로 차분하게 안내해요.', icon: 'speech' },
        }),
      ],
    }),
    say('dohyun', 'teach', '잘했어요. 손님이 화를 내도, 연우 씨 잘못이 아니에요. 급한 사정이 있었던 거예요.'),
    check(1),

    narr('그런데 다음 주문에서, 이번에는 내가 실수를 했다.'),
    time('10:15'), sfx('bell'),
    show({ left: 'yeonwoo:normal', right: 'customer:normal' }),
    say('customer', 'normal', '저 아이스 라테 시켰는데요. 이건 따뜻한 거네요?'),
    narr('주문서를 다시 보았다. 아이스. 나는 따뜻한 라테를 만들었다.'),
    face('yeonwoo', 'nervous'),
    decide({
      id: 'd4_mistake', title: '내 주문 실수', q: '내가 주문을 잘못 만들었다. 어떻게 할까?', who: 'yeonwoo', skill: 'report',
      choices: [
        good('greet', '"죄송합니다. 바로 다시 만들어 드릴게요." 사과하고 선배에게 알린다', {
          praise: [
            say('yeonwoo', 'determined', '죄송합니다. 바로 아이스로 다시 만들어 드릴게요.'),
            say('yeonwoo', 'normal', '선배님, 제가 아이스를 따뜻한 걸로 잘못 만들었습니다.'),
            show({ left: 'yeonwoo:normal', center: 'dohyun:smile', right: 'customer:smile' }),
            say('dohyun', 'smile', '알려 줘서 고마워요. 아이스 라테 하나 다시 갈게요.'),
            say('customer', 'smile', '괜찮아요. 고마워요.'),
            term('apology'),
          ],
        }),
        bad('think', '"주문서에는 따뜻한 걸로 적혀 있었어요"라고 우긴다', {
          fail: [
            say('yeonwoo', 'nervous', '주문서에는… 따뜻한 걸로 적혀 있었어요.'),
            say('customer', 'angry', '제가 분명히 아이스라고 했는데요? 주문서 다시 보세요.'),
            narr('주문서에는 "아이스"라고 적혀 있었다. 나는 아무 말도 할 수 없었다.'),
          ],
          oops: { id: 'd4_insist', title: '내 실수를 우겼어요', lesson: '내 실수가 맞으면 먼저 사과하고 고쳐요. "죄송합니다. 바로 다시 만들어 드릴게요."', icon: 'speech' },
        }),
        bad('ice', '얼음만 몇 개 넣어서 다시 준다', {
          fail: [
            narr('나는 따뜻한 라테에 얼음을 넣었다. 얼음이 금방 녹아 라테가 미지근해졌다.'),
            say('customer', 'worried', '이거… 맛이 이상한데요.'),
          ],
          oops: { id: 'd4_patch', title: '대충 고쳐서 맛이 없어졌어요', lesson: '잘못 만든 음료는 다시 만들어요. 혼자 대충 고치지 말고 선배에게 알려요.', icon: 'icecup' },
        }),
      ],
    }),

    time('10:50'), sfx('bell'),
    place('10:50', '창가 테이블'),
    show({ left: 'yeonwoo:normal', right: 'luna:smile' }),
    say('luna', 'smile', '와, 여기 인테리어 예쁘다! 라테에 하트 그려 주세요. SNS에 올릴 거예요!'),
    narr('라테가 나오자, 손님이 휴대폰으로 사진을 찍었다.'),
    sfx('shutter_phone'),
    say('luna', 'smile', '직원분도 같이 찍어요! 라테 들고, 웃어 봐요~'),
    narr('휴대폰 카메라가 내 얼굴 쪽을 향했다. 가슴이 답답해졌다.'),
    think('싫어. 내 얼굴이 인터넷에 올라가는 건 싫어.'),
    face('yeonwoo', 'nervous'),
    decide({
      id: 'd4_photo', title: '사진을 찍자는 손님', q: '얼굴을 찍히고 싶지 않다. 어떻게 할까?', who: 'yeonwoo', skill: 'rights', memo: 3,
      choices: [
        bad('smile', '싫지만 그냥 참고 웃는다', {
          fail: [
            sfx('shutter_phone'),
            narr('찰칵. 나는 억지로 웃었다.'),
            bg('home', 'night'), time('21:00'),
            narr('그날 밤, 내 얼굴이 모르는 사람의 SNS에 올라가 있었다. 댓글이 수십 개 달렸다.'),
            think('…싫다고 말할걸.'),
          ],
          oops: { id: 'd4_endure', title: '내 얼굴이 인터넷에 올라갔어요', lesson: '싫은 건 정중하게 "어려워요"라고 말해도 돼요. 내 얼굴은 내 허락 없이 찍을 수 없어요.', icon: 'no_camera' },
        }),
        bad('run', '얼굴을 가리고 주방으로 뛰어간다', {
          fail: [
            narr('나는 얼굴을 가리고 주방으로 뛰어갔다. 손에 든 트레이가 덜컹 흔들렸다.'),
            sfx('crash_small'),
            say('luna', 'surprised', '어머, 왜 그래요? 내가 뭐 잘못했어요?'),
            narr('라테가 바닥에 쏟아졌고, 손님은 당황했다.'),
          ],
          oops: { id: 'd4_runaway', title: '놀라서 도망쳤어요', lesson: '싫을 때는 도망치지 말고, 말로 정중하게 거절해요. "제 얼굴은 찍지 말아 주세요."', icon: 'stop' },
        }),
        good('no_camera', '"죄송하지만, 제 얼굴은 찍지 말아 주세요."', {
          praise: [
            say('yeonwoo', 'determined', '죄송하지만, 제 얼굴은 찍지 말아 주세요.'),
            say('luna', 'surprised', '아, 그래요? 미안해요! 그럼 라테만 찍을게요.'),
            narr('손님은 라테만 다시 찍었다. 생각보다 아무 일도 일어나지 않았다.'),
            term('refuse'), term('portrait_right'),
          ],
        }),
      ],
    }),

    check(2),
    say('luna', 'worried', '그런데… 하트가 좀 찌그러졌네. 다시 해 주면 안 돼요?'),
    narr('다시 만들어도 되는지 나는 모른다. 라테 그림은 도현 선배가 그린다.'),
    decide({
      id: 'd4_remake', title: '다시 해 달라는 요청', q: '다시 만들어 달라고 한다. 어떻게 할까?', who: 'yeonwoo', skill: 'ask', memo: 2,
      choices: [
        good('question', '"선배님께 여쭤보고 올게요" 하고 선배에게 묻는다', {
          praise: [
            say('yeonwoo', 'normal', '잠시만요, 선배님께 여쭤보고 올게요.'),
            show({ left: 'yeonwoo:smile', center: 'dohyun:smile', right: 'luna:smile' }),
            say('dohyun', 'smile', '제가 할게요. 연우 씨, 혼자 정하지 않고 물어본 거 정말 잘했어요.'),
          ],
        }),
        bad('coffee', '혼자 라테를 다시 만들어 준다', {
          fail: [
            narr('나는 라테를 다시 만들었다. 우유가 넘치고, 하트는 더 찌그러졌다.'),
            say('luna', 'worried', '어… 아까보다 더 이상한데요?'),
            say('dohyun', 'teach', '연우 씨, 라테 그림은 아직 배우지 않았잖아요. 먼저 물어봐 줬으면 좋았을 텐데.'),
          ],
          oops: { id: 'd4_alone', title: '혼자 정했다가 더 꼬였어요', lesson: '처음 하는 일이나 정하기 어려운 일은 혼자 하지 말고 선배에게 먼저 물어봐요.', icon: 'question' },
        }),
      ],
    }),
    check(3),
    photo('latte'),

    bg('tea'), bgm('tea'), amb(null), time('11:00'),
    place('11:00', '쉬는 시간'),
    show({ left: 'yeonwoo:normal', right: 'dohyun:smile' }),
    say('dohyun', 'smile', '아까 "찍지 말아 주세요"라고 말한 거, 정말 멋졌어요.'),
    say('yeonwoo', 'nervous', '…손님한테 무례한 거 아니었어요?'),
    bgm('warm'),
    say('dohyun', 'glasses', '아니요. 싫은 건 싫다고 말해도 돼요. 그건 무례한 게 아니라 나를 지키는 거예요.'),
    think('나를 지키는 것.'),
    narr('나는 그 말을 마음속 메모에 적었다.'),

    bg('counter', 'day'), bgm('cafe'), amb(null), time('12:30'),
    show({ left: 'yeonwoo:normal', center: 'dohyun:teach', right: 'manager:normal' }),
    narr('점심 무렵, 도현 선배가 우유 냉장고를 열더니 얼굴이 굳었다.'),
    say('dohyun', 'teach', '…아.'),
    say('dohyun', 'teach', '점장님, 죄송해요. 제가 어제 우유 주문을 깜빡했어요. 오후에 우유가 모자랄 것 같아요.'),
    say('manager', 'front', '말해줘서 고마워요. 지금 알았으니 괜찮아요. 내가 옆 마트에서 사 올게요.'),
    narr('나는 두 사람을 번갈아 보았다.'),
    think('선배도 실수를 하는구나. 그리고 바로 말하는구나.'),
    say('dohyun', 'smile', '봤죠? 나도 실수해요. 그래서 말하는 거예요.'),
    finish('DAY 4 완료', '나를 지키는 말을 배웠어요!'),
    end(),
  ],
};
