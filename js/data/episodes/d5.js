/**
 * DAY 5 · 금요일: 마감과 티타임
 * 학습: 쏟아진 곳 안전 확보(주의 표지판 먼저), 휴게시간 사용, 동료 대화 예절(사적인 질문), 퇴근 전 체크리스트
 * 감정 장면: 도현의 과거 고백, 정류장의 엄마
 * 성취기준: [12진로03-04] [12진로04-06] [12진로04-05] [12진로03-01]
 */

import {
  bg, bgm, amb, sfx, show, enter, leave, say, narr, think, time, place, schedule, memo,
  decide, good, bad, choose, opt, mini, photo, term, finish, end,
  check, guide,
} from '../../core/dsl.js';

export default {
  id: 'd5',
  act: 2,
  label: 'DAY 5 · 금요일',
  title: '마감과 티타임',
  when: '첫째 주 금요일 10:10',
  goal: '안전 먼저, 쉬는 시간엔 쉬고, 체크리스트로 정리해요.',
  schedule: [['caution', '쏟아진 곳엔 표지판 먼저'], ['tea', '쉬는 시간 티타임'], ['checklist', '퇴근 전 정리']],
  skills: ['safety', 'team', 'clean'],
  costume: { customer: 'vest' }, // 미끄러질 뻔한 손님: 조끼 입은 남성
  standards: ['[12진로03-04]', '[12진로04-06]', '[12진로04-05]', '[12진로03-01]'],
  photo: 'tea',
  diary: '아주머니가 주스를 쏟고 가셨다. 나는 닦기 전에 노란 주의 표지판부터 세웠다. 티타임 때 도현 선배가 옛날 이야기를 해 줬다. 선배도 실수를 숨긴 적이 있었다고 했다. 그래서 내가 말해 줄 때마다 고맙다고 했다. 정류장에서 엄마가 기다리고 있었다. 엄마 걸음이 오늘은 내 걸음에 맞춰 느렸다.',
  script: [
    bg('counter', 'day'), bgm('cafe'), amb(null), time('10:10'),
    schedule(),
    memo('금요일 메모', [['caution', '쏟아진 곳엔 주의 표지판 먼저'], ['tea', '쉬는 시간에는 꼭 쉬기'], ['checklist', '퇴근 전 정리는 체크리스트대로']]),
    sfx('bell'),
    place('10:10', '홀'),
    show({ left: 'yeonwoo:normal', right: 'auntie:surprised' }),
    narr('장바구니를 잔뜩 든 아주머니가 카운터에 트레이를 쾅 내려놓았다.'),
    sfx('crash_small'), sfx('spill'),
    say('auntie', 'surprised', '어머, 어머! 빨대 통을 쳐 버렸네! 아이고 미안해요, 나 바빠서 이만!'),
    leave('auntie'),
    narr('바닥에 빨대 스무 개와 오렌지주스가 흩어졌다. 아주머니는 문밖으로 사라졌다.'),
    narr('가게 안에는 손님이 다섯 명. 화장실 쪽으로 걸어오는 손님도 있었다.'),
    guide('timer', '이번에는 고를 시간이 정해져 있어요. **막대**가 다 줄어들기 전에 골라요.'),

    decide({
      id: 'd5_spill', title: '쏟아진 주스', q: '바닥이 젖었다. 가장 먼저 할 일은 무엇일까?', who: 'yeonwoo', skill: 'safety', memo: 1,
      // 급한 장면: 손님이 젖은 바닥 쪽으로 걸어옴. 시간이 다 되면 머뭇거리는 사이 미끄러짐
      timer: {
        sec: 15, label: '손님이 젖은 바닥 쪽으로 와요',
        fail: [
          narr('나는 어떻게 할지 몰라 그 자리에 서 있었다.'),
          sfx('slip'),
          narr('그 사이에 화장실로 가던 손님이 젖은 바닥에서 미끄러졌다.'),
          show({ left: 'yeonwoo:nervous', right: 'customer:sad' }),
          say('customer', 'sad', '아야… 바닥이 젖은 줄 몰랐어요.'),
        ],
        oops: { id: 'd5_slip_wait', title: '머뭇거리는 사이 손님이 미끄러졌어요', lesson: '바닥이 젖으면 생각할 시간이 없어요. 주의 표지판부터 바로 세워요.', icon: 'caution' },
      },
      choices: [
        bad('mop', '대걸레를 가지러 창고에 먼저 간다', {
          fail: [
            narr('나는 대걸레를 가지러 창고로 갔다.'),
            sfx('slip'),
            narr('그 사이에 화장실로 가던 손님이 젖은 바닥에서 미끄러졌다.'),
            show({ left: 'yeonwoo:nervous', right: 'customer:sad' }),
            say('customer', 'sad', '아야… 바닥이 젖은 줄 몰랐어요.'),
          ],
          oops: { id: 'd5_slip', title: '손님이 미끄러졌어요', lesson: '청소 도구를 가지러 가기 전에, 주의 표지판부터 세워서 사람들이 피해 가게 해요.', icon: 'caution' },
        }),
        good('caution', '노란 주의 표지판부터 세운다', {
          praise: [
            sfx('sign'),
            narr('나는 창고 옆 노란 표지판을 펼쳐 젖은 바닥 앞에 세웠다.'),
            show({ left: 'yeonwoo:smile', right: 'customer:normal' }),
            say('customer', 'normal', '아, 미끄럽구나. 돌아서 갈게요.'),
            term('caution_sign'),
          ],
        }),
        bad('run', '아주머니를 쫓아가서 치우라고 한다', {
          fail: [
            narr('나는 가게 밖으로 뛰어나가 아주머니를 찾았다. 아주머니는 벌써 버스를 타고 있었다.'),
            narr('돌아오니, 젖은 바닥 위로 손님 두 명이 발자국을 찍어 놓았다.'),
          ],
          oops: { id: 'd5_chase', title: '바닥을 그대로 두고 나갔어요', lesson: '누가 쏟았든 먼저 안전을 챙겨요. 표지판을 세우고, 닦고, 선배에게 알려요.', icon: 'step_back' },
        }),
      ],
    }),
    sfx('mop'),
    narr('표지판을 세운 뒤, 빨대를 줍고 대걸레로 닦았다. 그리고 도현 선배에게 알렸다.'),
    show({ left: 'yeonwoo:smile', right: 'dohyun:smile' }),
    say('dohyun', 'smile', '표지판 먼저! 완벽한 순서예요. 다친 사람 없죠?'),
    check(1),

    bg('tea'), bgm('tea'), amb(null), time('11:00'),
    place('11:00', '쉬는 시간 · 티타임'),
    show({ left: 'yeonwoo:smile', right: 'dohyun:smile' }),
    sfx('mug'),
    say('dohyun', 'smile', '쉬는 시간이에요. 오늘은 같이 차 마실래요?'),
    say('dohyun', 'smile', '첫 주가 거의 끝났네요. 어땠어요?'),
    say('yeonwoo', 'smile', '처음엔 무서웠는데… 이제 메모를 보면 조금 괜찮아요.'),
    narr('나도 선배에게 무언가 묻고 싶었다. 그런데 어떤 걸 물어봐도 되는지 몰랐다.'),
    decide({
      id: 'd5_smalltalk', title: '동료에게 하는 질문', q: '도현 선배에게 무엇을 물어볼까?', who: 'yeonwoo', skill: 'team',
      choices: [
        bad('coin', '"선배님은 월급 얼마 받으세요?"', {
          fail: [
            say('yeonwoo', 'normal', '선배님은 월급 얼마 받으세요?'),
            say('dohyun', 'teach', '어… 그건 좀 대답하기 어렵네요.'),
            narr('선배가 머쓱하게 웃으며 차만 마셨다. 대화가 뚝 끊겼다.'),
          ],
          oops: { id: 'd5_salary', title: '대화가 끊겼어요', lesson: '월급, 연애, 몸, 가족 같은 사적인 질문은 직장에서 조심해요. 주말이나 좋아하는 음식 이야기가 편해요.', icon: 'lock' },
        }),
        good('tea', '"선배님은 주말에 뭐 하세요?"', {
          praise: [
            say('yeonwoo', 'smile', '선배님은 주말에 뭐 하세요?'),
            say('dohyun', 'smile', '저는 동네 카페를 돌아다녀요. 다른 가게 커피 맛을 공부하거든요.'),
            say('dohyun', 'glasses', '연우 씨는요?'),
            say('yeonwoo', 'smile', '저는 할머니 댁에 가요. 할머니가 만든 식혜가 제일 맛있어요.'),
          ],
        }),
        bad('heart', '"선배님은 여자 친구 있어요? 왜 없어요?"', {
          fail: [
            say('yeonwoo', 'normal', '선배님은 여자 친구 있어요? 왜 없어요?'),
            say('dohyun', 'teach', '하하… 그건 비밀이에요.'),
            narr('선배의 귀가 빨개졌다. 선배는 일어나서 컵을 씻으러 갔다.'),
          ],
          oops: { id: 'd5_private', title: '선배가 불편해했어요', lesson: '연애나 외모 같은 사적인 질문은 상대를 불편하게 할 수 있어요. 가벼운 이야기부터 해요.', icon: 'lock' },
        }),
      ],
    }),
    term('private_q'),

    bgm('warm'),
    say('dohyun', 'normal', '연우 씨. 나 이야기 하나 해 줄까요?'),
    say('dohyun', 'teach', '나도 첫 직장에서 실수한 적이 있어요. 우유 피처를 바닥에 쏟았어요.'),
    say('dohyun', 'teach', '혼날까 봐 무서워서, 아무에게도 말 안 하고 대충 닦았어요.'),
    narr('선배는 창밖을 보았다. 잠시 조용했다.'),
    say('dohyun', 'normal', '그 바닥에서 손님이 미끄러졌어요. 손목을 다쳤어요.'),
    say('dohyun', 'normal', '그날 사장님이 "왜 말 안 했어?"라고 했어요. 혼난 것보다 그 말이 더 아팠어요.'),
    think('…나랑 똑같았구나.'),
    narr('고등학교 실습 때, 접시를 깨고 말하지 못했던 내가 떠올랐다.'),
    say('dohyun', 'smile', '그래서 나는, 연우 씨가 실수를 말해 줄 때마다 고마워요. 진짜로요.'),
    say('yeonwoo', 'determined', '…저도 앞으로 계속 말할게요. 무서워도요.'),
    say('dohyun', 'glasses', '그럼 우리 약속한 거예요.'),
    photo('tea'),
    check(2),

    bg('counter', 'closing'), bgm('cafe'), amb(null), time('13:10'),
    place('13:10', '퇴근 20분 전'),
    show({ left: 'yeonwoo:normal', right: 'dohyun:smile' }),
    say('dohyun', 'teach', '퇴근 전에 {{체크리스트}}대로 정리해요. 순서는 자유예요. 체크리스트에 없는 일은 먼저 물어보고요.'),
    mini('closing', { skill: 'clean', title: '퇴근 전 정리' }),
    say('dohyun', 'smile', '첫 주 끝! 진짜 수고했어요, 연우 씨.'),
    check(3),

    bg('bus_stop', 'evening'), amb('street'), bgm('home'), time('14:05'),
    place('14:05', '해솔시장 앞 정류장'),
    show({ left: 'yeonwoo:normal' }),
    narr('버스에서 내리자, 정류장 의자에 익숙한 얼굴이 보였다.'),
    enter('right', 'mom:smile'),
    say('mom', 'smile', '연우야! 엄마 오늘 일찍 끝나서… 그냥 기다려 봤어.'),
    narr('엄마 손에는 내가 좋아하는 붕어빵 봉지가 들려 있었다.'),
    choose({
      id: 'd5_mom', title: '엄마에게', q: '엄마에게 뭐라고 말할까?', who: 'yeonwoo', flag: 'momTalk',
      options: [
        opt('home', '"엄마, 나 혼자 올 수 있어. 그래도 기다려 줘서 고마워."', 'gentle', {
          then: [
            say('yeonwoo', 'smile', '엄마, 나 혼자 올 수 있어. 그래도 기다려 줘서 고마워.'),
            say('mom', 'sad', '…알아. 엄마도 알아.'),
            say('mom', 'smile', '그래도 오늘은 같이 걷자. 붕어빵 식기 전에.'),
          ],
        }),
        opt('heart', '"엄마, 이번 주에 나 진짜 많이 했어. 들어 볼래?"', 'share', {
          then: [
            say('yeonwoo', 'smile', '엄마, 이번 주에 나 진짜 많이 했어. 들어 볼래?'),
            say('mom', 'smile', '응. 다 들어 볼래. 처음부터.'),
            narr('나는 시럽 이야기부터, 할머니 이야기, 사진 이야기까지 다 했다.'),
          ],
        }),
      ],
    }),
    narr('엄마랑 나란히 걸었다. 엄마 걸음이 오늘은 조금 느렸다. 내 걸음에 맞춰서.'),
    finish('DAY 5 완료', '첫 주를 해냈어요!'),
    end(),
  ],
};
