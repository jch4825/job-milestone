/**
 * 3장 마무리: 나의 첫 메모 (파일·저장 id 는 예전 이름 그대로 'epilogue')
 * 학습: 급여명세서 읽기(주휴수당·공제), 월급 계획(저축), 새 동료 맞이하기, 받은 도움을 건네기
 * 감정 장면: 문 앞의 신입(1장의 반복), 연우의 첫 메모, 엄마에게 첫 선물
 * 성취기준: [12진로04-01] [12진로02-01] [12진로05-04] [12진로04-05]
 */

import {
  bg, bgm, amb, sfx, show, enter, say, narr, think, sys, time, place, schedule, big,
  decide, good, bad, choose, opt, branch, doc, docRead, docClose, mini, photo, term, finish, end,
  check, meet, cg, onlyIf,
  got,
} from '../../core/dsl.js';

export default {
  id: 'epilogue',
  act: 3,
  label: '3장 마무리', // 2026-10-14 '에필로그'에서 바꿈: 게임의 끝이 아니라 3막의 끝(엔딩은 4장 뒤 ending.js)
  title: '나의 첫 메모',
  when: '다음 달 10일, 월급날',
  goal: '급여명세서를 읽고, 새 신입을 맞이해요.',
  schedule: [['coin', '급여명세서 읽기'], ['door', '새 신입 맞이하기'], ['memo', '나의 메모 쓰기']],
  skills: ['rights', 'team'],
  standards: ['[12진로04-01]', '[12진로02-01]', '[12진로05-04]', '[12진로04-05]'],
  photo: 'memo',
  diary: '첫 월급날. 급여명세서를 읽었다. 일한 시간, 주휴수당, 보험료. 다 내가 일한 기록이다. 새 신입 지호 씨가 문 앞에서 단추를 만지작거렸다. 나는 도현 선배가 했던 말을 그대로 했다. 그리고 메모를 썼다. 노란 메모가 한 장 더 붙었다. 이번에는 내 글씨다.',
  script: [
    big('3장 마무리', '다음 달 10일, 월급날'),
    bg('home', 'morning'), bgm('morning'), time('07:30'),
    schedule(),
    show({ left: 'yeonwoo:normal' }),
    sfx('phone'),
    narr('아침, 휴대폰이 짧게 울렸다.'),
    sys('[해솔은행] {netPay} 입금 · 카페마일스톤 급여'),
    sfx('jingle_payday'),
    think('…내가 일해서 번 돈이다.'),
    narr('숫자를 몇 번이나 다시 보았다. 하나, 둘, 셋.'),

    bg('staff'), bgm('cafe'), time('09:00'),
    show({ left: 'yeonwoo:smile', right: 'manager:front' }),
    say('manager', 'front', '연우 씨, 첫 {{급여명세서}}예요. 같이 읽어 볼까요?'),
    got('item_payslip', '첫 급여명세서', 'ticket'),
    doc('payslip'),
    docRead(),
    decide({
      id: 'ep_pay1', title: '급여명세서: 주휴수당', q: '"주휴수당"은 무엇일까요?', who: 'manager', mentor: 'manager', helper: 'manager', skill: 'rights', memo: 'doc:4',
      choices: [
        good('star', '일주일에 15시간 넘게 일하면 더 받는 하루치 돈', { praise: '맞아요. 연우 씨는 일주일에 20시간 일해서 주휴수당을 받아요.' }),
        bad('gift', '점장님이 기분이 좋아서 주는 선물', {
          fail: [narr('나는 주휴수당이 점장님의 선물인 줄 알았다.'), narr('그래서 다음 달 명세서에 주휴수당이 빠져 있었을 때도, 아무 말도 하지 않았다.')],
          oops: { id: 'ep_weekly', title: '내 돈을 모르고 지나쳤어요', lesson: '주휴수당은 선물이 아니라 법으로 정한 내 권리예요. 빠져 있으면 꼭 물어봐요.', icon: 'star' },
        }),
      ],
    }),
    decide({
      id: 'ep_pay2', title: '급여명세서: 공제', q: '"공제"는 무엇일까요?', who: 'manager', mentor: 'manager', helper: 'manager', skill: 'rights', memo: 'doc:5',
      choices: [
        bad('coin', '점장님이 실수로 덜 준 돈', {
          fail: [
            say('yeonwoo', 'nervous', '점장님, 돈이 덜 들어왔어요! 왜 빼셨어요?'),
            say('manager', 'think', '아, 그건 보험료라서 빠지는 거예요. 명세서를 같이 다시 볼까요?'),
            narr('얼굴이 화끈거렸다. 명세서를 끝까지 읽어 볼걸.'),
          ],
          oops: { id: 'ep_deduct', title: '공제를 오해했어요', lesson: '공제는 4대 보험료처럼 나를 지키는 데 쓰이는 돈이에요. 모르면 먼저 물어봐요.', icon: 'heart' },
        }),
        good('heart', '보험료처럼 월급에서 미리 빠지는 돈', { praise: '맞아요. 아플 때나 일을 그만둘 때 연우 씨를 지켜 주는 보험료예요.' }),
      ],
    }),
    term('deduction'), term('insurance'),
    say('manager', 'smile', '명세서는 버리지 말고 잘 보관해요. 연우 씨가 일한 기록이니까요.'),
    docClose(),
    choose({
      id: 'ep_plan', title: '첫 월급 계획', q: '첫 월급을 어떻게 쓸까?', who: 'yeonwoo', flag: 'payPlan',
      options: [
        // 여기서 고른 계획에 따라 저녁에 고르는 선물이 달라짐(작은 선물 / 큰 선물)
        opt('piggy', '반은 저축하고, 엄마에게는 작은 선물', 'balance', {
          then: [think('반은 저축 통장에. 나머지로 교통비, 그리고 엄마에게 작은 선물.')],
        }),
        opt('gift', '이번 달은 엄마에게 큰 선물, 저축은 다음 달부터', 'gift', {
          then: [think('첫 월급이니까, 엄마에게 제일 좋은 걸 주고 싶어. 다음 달부터는 꼭 저축해야지.')],
        }),
      ],
    }),
    term('saving'),
    check(1),

    time('10:00'), bg('cafe_front', 'morning'), amb('street'),
    place('10:00', '가게 앞'),
    show({ left: 'yeonwoo:smile' }),
    narr('가게 앞에 낯선 남자가 서 있었다. 단추를 만지작거리고 있었다. 한 번, 두 번, 세 번.'),
    enter('right', 'jiho:worried'),
    narr('…어디서 많이 본 모습이었다.'),
    decide({
      id: 'ep_jiho', title: '문 앞의 신입', q: '긴장한 신입 지호 씨에게 뭐라고 말할까?', who: 'yeonwoo', skill: 'team',
      help: '연우가 처음 왔던 날, 도현 선배가 문 앞에서 뭐라고 했는지 떠올려 봐요.',
      choices: [
        bad('clock', '"빨리 들어와요. 시간 됐어요."', {
          fail: [
            say('yeonwoo', 'normal', '빨리 들어와요. 시간 됐어요.'),
            say('jiho', 'worried', '아, 네… 죄송합니다.'),
            narr('지호 씨는 하루 종일 고개를 숙이고 있었다. 아무것도 묻지 못했다.'),
          ],
          oops: { id: 'ep_cold', title: '신입이 더 얼어붙었어요', lesson: '처음 온 사람은 긴장해요. 내가 처음 받았던 따뜻한 말을 건네 봐요.', icon: 'smile' },
        }),
        good('smile', '"많이 긴장했죠? 어깨에 힘을 조금 빼도 괜찮아요."', {
          praise: [
            cg('jiho'),
            say('yeonwoo', 'smile', '안녕하세요! 오늘 처음 오신 유지호 씨 맞죠?'),
            say('yeonwoo', 'smile', '많이 긴장했죠? 어깨에 힘을 조금 빼도 괜찮아요.'),
            say('jiho', 'smile', '…네. 감사합니다.'),
            narr('지호 씨의 어깨가 조금 내려갔다.'),
            think('도현 선배가 나한테 해 준 말이다.'),
          ],
        }),
      ],
    }),

    meet('jiho'),
    check(2),
    bg('staff'), bgm('warm'),
    show({ left: 'yeonwoo:smile', center: 'manager:front', right: 'jiho:normal' }),
    say('manager', 'front', '연우 씨, 지호 씨에게 첫 메모를 써 줄래요? 연우 씨가 배운 것 중에, 꼭 필요한 세 가지로.'),
    think('내가 쓰는 메모. 처음이다.'),
    mini('memowrite', { title: '나의 첫 메모' }),
    sfx('page'),
    narr('나는 노란 메모를 점장님의 메모 옆에 붙였다.'),
    check(3),
    photo('memo'),
    say('jiho', 'smile', '…이거, 계속 볼게요. 고맙습니다, 선배님.'),
    narr('선배님. 처음 들어 보는 말이었다.'),

    bg('living'), bgm('home'), amb(null), time('18:30'),
    place('18:30', '집'),
    show({ left: 'yeonwoo:smile', right: 'mom:smile' }),
    // 첫 월급 계획(payPlan)에 따라 갈림: 큰 선물(gift) → 비싼 선물 셋 중 하나 / 작은 선물(balance) → 작은 선물 셋 중 하나
    branch('payPlan', {
      gift: [narr('저녁. 나는 큰 선물 상자와 노란 쪽지를 들고 거실로 나갔다.')],
      _: [narr('저녁. 나는 가방에서 작은 선물과 노란 쪽지를 꺼냈다.')],
    }),
    ...onlyIf({ flag: 'payPlan=gift' }, choose({
      id: 'ep_gift_big', title: '엄마에게 줄 큰 선물', q: '이번 달은 크게! 엄마에게 줄 선물은?', who: 'yeonwoo', flag: 'giftChoice',
      options: [
        opt('gift', '엄마가 좋아하는 보라색 스카프', 'scarf'),
        opt('walk', '푹신하고 가벼운 운동화', 'shoes'),
        opt('hand', '어깨 안마기', 'massager'),
      ],
    })),
    ...onlyIf({ notFlag: 'payPlan=gift' }, choose({
      id: 'ep_gift_small', title: '엄마에게 줄 작은 선물', q: '저축하고 남은 돈으로, 엄마에게 줄 선물은?', who: 'yeonwoo', flag: 'giftChoice',
      options: [
        opt('bread', '마일스톤 소금빵 세트', 'bread'),
        opt('heart', '작은 꽃다발', 'flower'),
        opt('hand', '엄마 손에 바를 핸드크림', 'handcream'),
      ],
    })),
    say('yeonwoo', 'smile', '엄마, 첫 월급으로 산 거야.'),
    branch('giftChoice', {
      scarf: [say('mom', 'surprised', '어머… 엄마가 보라색 좋아하는 거 어떻게 알았어?')],
      shoes: [say('mom', 'surprised', '어머, 엄마 신발 낡은 거 봤구나. 이거 신으면 하나도 안 아프겠다.')],
      massager: [say('mom', 'surprised', '어머, 엄마 어깨 아픈 거 알고 있었어?')],
      bread: [say('mom', 'surprised', '어머, 이게 연우가 매일 포장하는 그 빵이야?')],
      flower: [say('mom', 'surprised', '어머… 꽃이네. 엄마 꽃 받아 본 지 오래됐는데.')],
      handcream: [say('mom', 'surprised', '어머, 엄마 손 거친 거 알았어? 매일 바를게.')],
      _: [],
    }),
    // 선물 크기에 따른 엄마의 한마디(정답 없는 선택: 어느 쪽도 꾸중하지 않음)
    branch('payPlan', {
      gift: [say('mom', 'smile', '이렇게 큰 선물은 처음이야. 그래도 다음 달부터는 연우를 위해 저축하자.')],
      _: [say('mom', 'smile', '작아도 연우가 일해서 번 돈으로 산 거라 더 귀해.')],
    }),
    narr('엄마는 쪽지도 펼쳤다.'),
    say('yeonwoo', 'smile', '"엄마, 모르면 물어볼게. 그러니까 걱정은 조금만 해요."'),
    narr('엄마는 한참 동안 쪽지를 보았다. 그러다 웃었다. 눈가가 젖어 있었다.'),
    say('mom', 'smile', '…그래. 이제 엄마가 걱정 조금만 할게.'),
    photo('mom'),

    // 3막의 끝(게임의 끝이 아님): 크레디트·엔딩 영수증·작별 인사는 4장을 마친 뒤의 엔딩(ending.js)에서
    bgm('warm'), bg('staff'), show({}),
    narr('카페 마일스톤의 직원 공간 벽에는, 오늘의 한 장이 하나씩 늘어 간다.'),
    narr('그리고 노란 메모가 한 장 더 붙었다. 이번에는 내 글씨다.'),
    narr('나의 첫 번째 이정표. 마일스톤.'),
    think('다음 주에는 또 어떤 일이 기다리고 있을까?'),
    finish('3장 마무리 완료', '나의 첫 메모를 썼어요!'),
    end(),
  ],
};
