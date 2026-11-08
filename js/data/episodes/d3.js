/**
 * DAY 3 · 수요일: 손님 맞이
 * 학습: 단골 손님 응대, 주문서 짚어 확인(미니게임), 고민하는 손님 안내, 빠른 말에 다시 묻기, 도움은 먼저 묻기
 * 성취기준: [12진로04-05] [12진로04-04] [12진로03-02] [12진로04-02]
 */

import {
  bg, bgm, amb, sfx, show, say, narr, think, time, place, schedule, memo,
  decide, good, bad, branch, mini, photo, term, finish, end,
  check,
} from '../../core/dsl.js';

export default {
  id: 'd3',
  act: 2,
  label: 'DAY 3 · 수요일',
  title: '손님 맞이',
  when: '첫째 주 수요일 09:35',
  goal: '주문서를 짚어 확인하고, 도움은 먼저 물어봐요.',
  schedule: [['greet', '웃으며 인사하기'], ['order_check', '주문서 짚어 확인하기'], ['hand', '도와드릴까요? 먼저 묻기']],
  skills: ['serve', 'ask'],
  costume: { customer: 'stripe' }, // 손님 그림: 줄무늬 셔츠 청년(assets/stand/customer-stripe_normal.webp)
  standards: ['[12진로04-05]', '[12진로04-04]', '[12진로03-02]', '[12진로04-02]'],
  photo: 'grandma',
  diary: '봉순 할머니가 또 오셨다. "오늘도 소금빵이랑 따뜻한 우유요?" 하고 물었더니 할머니가 웃었다. 주문서를 손가락으로 짚으면서 트레이에 담았다. 서진 씨에게는 "도와드릴까요?" 하고 먼저 물었다. 서진 씨가 "물어봐 줘서 더 고마워요"라고 했다. 나도 누군가를 존중할 수 있다.',
  script: [
    bg('counter', 'morning'), bgm('cafe'), amb(null), time('09:35'),
    schedule(),
    memo('수요일 메모', [['greet', '웃으며 인사하기'], ['order_check', '주문서는 손가락으로 짚으며 확인'], ['tray', '트레이는 두 손으로']]),
    show({ left: 'yeonwoo:smile', right: 'dohyun:smile' }),
    say('dohyun', 'smile', '오늘은 손님 맞이를 해 볼 거예요. {{주문서}}를 보고 {{트레이}}에 담아 드리는 일이에요.'),
    sfx('bell'),
    show({ left: 'yeonwoo:smile', center: 'dohyun:normal', right: 'grandma:smile' }),
    narr('딸랑. 어제 그 할머니다. 봉순 할머니.'),

    decide({
      id: 'd3_regular', title: '단골 할머니', q: '봉순 할머니가 오셨다. 뭐라고 인사할까?', who: 'yeonwoo', skill: 'serve',
      choices: [
        good('heart', '"어서 오세요, 봉순 할머니! 오늘도 소금빵이랑 따뜻한 우유 드릴까요?"', {
          praise: [
            say('yeonwoo', 'smile', '어서 오세요, 봉순 할머니! 오늘도 소금빵이랑 따뜻한 우유 드릴까요?'),
            say('grandma', 'smile', '어머나! 내 이름이랑 주문까지 기억했어요?'),
            say('grandma', 'smile', '고마워라. 연우 씨 덕분에 아침이 기분 좋네.'),
          ],
        }),
        good('greet', '"어서 오세요! 카페 마일스톤입니다!"', {
          praise: [say('yeonwoo', 'smile', '어서 오세요! 카페 마일스톤입니다!'), say('grandma', 'smile', '아이고, 오늘도 밝네. 늘 먹던 걸로 줘요.')],
        }),
        bad('think', '"할머니 또 오셨네요? 매일 오시네요."', {
          fail: [
            say('yeonwoo', 'normal', '할머니 또 오셨네요? 매일 오시네요.'),
            say('grandma', 'worried', '…응? 내가 너무 자주 왔나?'),
            narr('할머니가 머쓱하게 웃으며 지갑을 만지작거렸다.'),
          ],
          oops: { id: 'd3_toofamiliar', title: '할머니가 머쓱해졌어요', lesson: '손님의 습관을 말할 때는 조심해요. 반갑게 인사하고 주문을 확인하면 충분해요.', icon: 'greet' },
        }),
      ],
    }),

    check(1),
    say('dohyun', 'teach', '주문서를 손가락으로 한 줄씩 짚으면서 담으면 빠뜨리지 않아요. 같이 해 봐요.'),
    mini('order', {
      skill: 'serve', title: '주문서 확인',
      orders: [
        { who: '봉순 할머니', items: { milk: 1, saltbread: 1 } },
        { who: '회사원 손님', items: { ice_ame: 2, croissant: 1 } },
        { who: '학생 손님', items: { latte: 1, juice: 1, muffin: 2 } },
      ],
      oops: { id: 'd3_order', title: '주문을 잘못 드렸어요', lesson: '주문서를 손가락으로 한 줄씩 짚으면서 담으면 빠뜨리지 않아요.', icon: 'order_check' },
    }),
    show({ left: 'yeonwoo:smile', right: 'grandma:smile' }),
    say('grandma', 'smile', '트레이를 두 손으로 들어 주니까 마음이 놓이네. 고마워요.'),
    photo('grandma'),
    check(2),

    time('10:20'), sfx('bell'),
    place('10:20', '카운터 앞 줄'),
    show({ left: 'yeonwoo:normal', right: 'student:think' }),
    narr('대학생 손님이 메뉴판 앞에서 한참 고민하고 있었다. 뒤로 손님이 세 명이나 줄을 섰다.'),
    say('student', 'think', '음… 라테를 마실까… 주스를 마실까? 아, 빵도 먹고 싶은데…'),
    narr('뒤쪽에서 작은 한숨 소리가 들렸다.'),
    decide({
      id: 'd3_indecisive', title: '오래 고민하는 손님', q: '손님이 오래 고민한다. 어떻게 할까?', who: 'yeonwoo', skill: 'serve',
      choices: [
        good('menu', '추천 메뉴를 가리키며 차분히 안내한다', {
          praise: [
            say('yeonwoo', 'smile', '저희 가게는 소금빵과 바닐라라테가 가장 인기가 많아요.'),
            say('student', 'smile', '오, 그럼 그걸로 할게요! 고마워요.'),
            term('recommend'),
          ],
        }),
        bad('clock', '"빨리 골라 주세요. 뒤에 손님이 많아요."', {
          fail: [
            say('yeonwoo', 'nervous', '빨리 골라 주세요. 뒤에 손님이 많아요.'),
            say('student', 'sad', '아… 죄송해요. 그냥 아메리카노요.'),
            narr('손님은 얼굴이 빨개져서 아무거나 시켰다. 그리고 그 뒤로 다시 오지 않았다.'),
          ],
          oops: { id: 'd3_rush', title: '손님을 재촉했어요', lesson: '재촉하면 손님 마음이 상해요. 고르기 어려워하면 추천 메뉴를 알려 드려요.', icon: 'menu' },
        }),
        bad('freeze', '아무 말 없이 계속 기다린다', {
          fail: [
            sfx('tick_fast'),
            narr('5분이 지났다. 줄이 문밖까지 늘어났다.'),
            say('customer', 'worried', '저기요, 주문 언제 받아요?'),
          ],
          oops: { id: 'd3_waitlong', title: '줄이 문밖까지 늘었어요', lesson: '기다리기만 하지 말고, 추천 메뉴로 부드럽게 도와드려요.', icon: 'clock' },
        }),
      ],
    }),

    bg('tea'), amb(null), bgm('tea'), time('11:00'),
    place('11:00', '쉬는 시간'),
    show({ left: 'yeonwoo:smile' }),
    narr('11시. 30분 쉬는 시간이다. 계약서에 적힌 대로.'),
    narr('물을 마시고, 창밖을 보았다. 쉬는 것도 일의 한 부분이다.'),

    bg('counter', 'day'), bgm('cafe'), amb(null), time('12:10'),
    place('12:10', '점심 무렵'),
    show({ left: 'yeonwoo:normal', right: 'sora:smile' }),
    say('sora', 'smile', '연우씨아이스아메리카노두잔이랑소금빵하나포장이랑라테는매장이요!'),
    narr('소라 선배의 말이 너무 빨라서 하나도 들리지 않았다.'),
    decide({
      id: 'd3_fast', title: '너무 빠른 말', q: '말이 너무 빨라서 못 알아들었다. 어떻게 할까?', who: 'yeonwoo', skill: 'ask',
      choices: [
        good('repeat', '"천천히 한 번 더 말씀해 주세요."', {
          praise: [
            say('yeonwoo', 'determined', '선배님, 천천히 한 번 더 말씀해 주세요.'),
            branch('accommodation', {
              slowly: [say('sora', 'surprised', '앗, 맞다! 한 번에 하나씩이랬지. 미안해요!')],
              _: [say('sora', 'surprised', '앗, 미안해요. 내가 또 빨랐네!')],
            }),
            say('sora', 'smile', '아이스 아메리카노 두 잔. 소금빵 하나는 포장. 라테 한 잔은 매장에서 먹어요.'),
            think('하나씩 들으니까 다 알겠다.'),
          ],
        }),
        bad('think', '대충 들린 대로 만든다', {
          fail: [
            narr('나는 "라테 두 잔"이라고 생각하고 만들었다.'),
            say('customer', 'surprised', '저는 아이스 아메리카노 두 잔 시켰는데요…?'),
            narr('음료를 다시 만드느라 손님들이 더 기다렸다.'),
          ],
          oops: { id: 'd3_guessorder', title: '주문을 잘못 들었어요', lesson: '못 알아들으면 "천천히 한 번 더 말씀해 주세요"라고 해요. 다시 묻는 건 실례가 아니에요.', icon: 'repeat' },
        }),
      ],
    }),

    time('12:40'), sfx('bell'),
    place('12:40', '창가 자리'),
    show({ left: 'yeonwoo:normal', right: 'seojin:smile' }),
    narr('휠체어를 탄 손님이 창가 쪽으로 들어왔다. 근처 회사에서 일하는 서진 씨다.'),
    say('seojin', 'smile', '라테 한 잔이랑 크루아상 하나 주세요.'),
    narr('음료가 나왔다. 그런데 트레이를 받는 곳이 서진 씨 자리에서 조금 멀었다.'),
    decide({
      id: 'd3_seojin', title: '휠체어를 탄 손님', q: '서진 씨가 트레이를 받기 어려워 보인다. 어떻게 할까?', who: 'yeonwoo', skill: 'serve',
      choices: [
        bad('wheelchair', '묻지 않고 휠체어를 밀어서 카운터로 모신다', {
          fail: [
            narr('나는 서진 씨 뒤로 가서 휠체어 손잡이를 잡고 밀었다.'),
            say('seojin', 'surprised', '앗! 잠깐만요! 놀랐잖아요.'),
            say('seojin', 'sad', '휠체어는 제 몸 같은 거예요. 묻지 않고 밀면 정말 무서워요.'),
          ],
          oops: { id: 'd3_push', title: '묻지 않고 휠체어를 밀었어요', lesson: '도움은 먼저 물어봐요. "도와드릴까요?" 휠체어 같은 보조기구는 허락 없이 만지지 않아요.', icon: 'wheelchair' },
        }),
        good('hand', '"트레이를 자리까지 가져다드릴까요?" 먼저 묻는다', {
          praise: [
            say('yeonwoo', 'smile', '트레이를 자리까지 가져다드릴까요?'),
            say('seojin', 'smile', '네, 부탁해요. 고마워요.'),
            narr('나는 트레이를 두 손으로 들고 천천히 걸어가 테이블에 놓았다.'),
            say('seojin', 'smile', '물어봐 줘서 더 고마워요. 어떤 사람들은 묻지도 않고 휠체어부터 밀거든요.'),
            think('나도 늘, 누가 먼저 물어봐 주기를 바랐었는데.'),
            narr('오늘은 내가 누군가에게 그렇게 했다.'),
          ],
        }),
        bad('walk', '받으러 오실 때까지 그냥 기다린다', {
          fail: [
            narr('서진 씨는 테이블 사이를 힘들게 지나 카운터까지 왔다. 바퀴가 의자 다리에 몇 번이나 걸렸다.'),
            say('seojin', 'worried', '…조금 도와주셨으면 좋았을 텐데.'),
          ],
          oops: { id: 'd3_noask', title: '도움이 필요했는데 지나쳤어요', lesson: '불편해 보이면 "도와드릴까요?" 하고 먼저 물어봐요. 손님이 괜찮다고 하면 그 뜻을 따라요.', icon: 'hand' },
        }),
      ],
    }),

    check(3),
    bg('staff'), bgm('warm'), amb(null), time('13:30'),
    show({ left: 'yeonwoo:smile', right: 'dohyun:smile' }),
    say('dohyun', 'smile', '오늘 봉순 할머니가 연우 씨 칭찬을 엄청 하셨어요. 이름을 기억해 줬다고요.'),
    say('yeonwoo', 'smile', '저, 이름 기억하는 건 잘해요.'),
    say('dohyun', 'glasses', '그게 연우 씨의 강점이에요. 손님들은 자기 이름을 기억해 주는 가게를 다시 찾아와요.'),
    finish('DAY 3 완료', '손님을 존중하며 맞이했어요!'),
    end(),
  ],
};
