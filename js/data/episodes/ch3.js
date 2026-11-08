/**
 * 3장: 피크타임
 * 학습: 폭언 손님은 혼자 상대하지 않기(관리자 호출, 직원 보호), 소리 과부하 때 필요한 도움 요청(귀마개·잠깐 쉬기),
 *       역할 분담 주도하기, 고장 기계 보고, 손님 안내 문장, 바쁠 때 주문 확인
 * 감정 장면: 면접 때 고른 '필요한 도움'의 회수, 점장의 메모 비밀, 정규 크루 배지
 * 성취기준: [12진로04-06] [12진로03-04] [12진로04-05] [12진로04-01] [12진로01-02]
 */

import {
  bg, bgm, amb, sfx, show, enter, say, narr, think, time, place, schedule, memo, big,
  decide, good, bad, branch, mini, breathe, act, photo, term, finish, end, face, fx, earplugs, phone,
  check, cg, guide,
  got,
} from '../../core/dsl.js';

export default {
  id: 'ch3',
  act: 3,
  label: '3장',
  title: '피크타임',
  when: '넷째 주 금요일 11:40', // 2026-10-18 셋째 주 → 넷째 주: 한 달(4주)을 채워야 3장 마무리의 첫 월급(20일치)과 맞음
  goal: '숨을 고르고, 역할을 나누고, 어려우면 바로 말해요.',
  schedule: [['breathe', '숨 고르기'], ['team', '역할 나누기'], ['hand', '어려우면 바로 말하기']],
  skills: ['safety', 'help', 'team', 'report', 'serve'],
  costume: { customer: 'laptop' }, // 점심 피크 손님: 노트북 가방을 든 직장인
  standards: ['[12진로04-06]', '[12진로03-04]', '[12진로04-05]', '[12진로04-01]', '[12진로01-02]'],
  photo: 'badge',
  diary: '피크타임. 반말하는 손님이 있었지만 혼자 상대하지 않고 점장님을 불렀다. 단체 손님이 몰려와 소리가 너무 컸다. 숨을 세 번 쉬고, 필요한 걸 말했다. 그리고 선배에게 역할을 나누자고 먼저 말했다. 제빙기가 멈췄을 때도 바로 알렸다. 점장님이 메모의 비밀을 말해 주었다. 나는 정규 크루가 되었다. 가슴의 배지가 햇빛에 반짝였다.',
  script: [
    big('3장 · 피크타임', '넷째 주 금요일'),
    bg('counter', 'day'), bgm('cafe'), amb(null), time('11:40'),
    schedule(),
    memo('피크타임 수칙', [['breathe', '당황하면 숨 세 번'], ['team', '선배와 역할 나누기'], ['hand', '어려우면 바로 말하기']]),
    show({ left: 'yeonwoo:smile', right: 'dohyun:smile' }),
    // 둘째·셋째 주는 독백으로 건너뜀(1막·2막에서 배운 것을 한 줄씩 짚음)
    narr('첫 주가 지나고 둘째 주가 왔다. 둘째 주에는 컵 채우기를 혼자 해냈다.'),
    narr('셋째 주에는 봉순 할머니 주문을 내가 먼저 말했다. 할머니가 활짝 웃었다.'),
    narr('그리고 오늘은 넷째 주 금요일. 일한 지 이제 곧 한 달이다.'),
    narr('이제 손 씻기도, 컵 채우기도 메모를 안 보고 할 수 있다.'),
    narr('그래도 메모는 매일 본다. 메모를 보면 마음이 편하니까.'),
    say('dohyun', 'teach', '오늘 근처 회사에 행사가 있대요. 12시 30분쯤 단체 손님이 올 거예요.'),
    term('peak'),

    time('11:50'), sfx('bell'), bgm('tension'),
    place('11:50', '카운터'),
    show({ left: 'yeonwoo:normal', right: 'hiker:angry' }),
    say('hiker', 'angry', '야! 여기 왜 이렇게 늦어? 점장 어디 있어?'),
    say('hiker', 'angry', '어이 아가씨, 귀 먹었어? 빨리빨리 하라고!'),
    narr('손님이 카운터를 손가락으로 쾅쾅 두드렸다. 큰 소리에 몸이 굳었다.'),
    fx('shake'), face('yeonwoo', 'nervous'),
    guide('timer', '이번에는 고를 시간이 정해져 있어요. **막대**가 다 줄어들기 전에 골라요.'),
    decide({
      id: 'ch3_hiker', title: '반말하는 손님', q: '손님이 반말로 소리친다. 어떻게 할까?', who: 'yeonwoo', skill: 'safety', memo: 3,
      timer: { sec: 15, label: '손님이 소리치고 있어요', as: 'freeze' }, // 급한 장면: 시간이 다 되면 혼자 꾹 참은 것과 같음
      choices: [
        bad('shout', '나도 큰 소리로 맞받아친다', {
          fail: [
            say('yeonwoo', 'determined', '저한테 왜 반말하세요?! 소리 지르지 마세요!'),
            say('hiker', 'angry', '뭐? 이 가게는 직원 교육을 어떻게 시킨 거야!'),
            narr('싸움이 커졌다. 다른 손님들이 하나둘 가게를 나갔다.'),
          ],
          oops: { id: 'ch3_fight', title: '싸움이 커졌어요', lesson: '화난 손님과 맞서지 말고, 한 걸음 물러서서 점장님(관리자)을 불러요.', icon: 'bell_call' },
        }),
        good('step_back', '한 걸음 물러서서 "점장님!" 하고 부른다', {
          praise: [
            say('yeonwoo', 'determined', '점장님! 잠깐 와 주시겠어요?'),
            enter('center', 'manager:strict'),
            say('manager', 'strict', '손님, 우리 직원에게 반말과 큰 소리는 안 됩니다.'),
            say('manager', 'strict', '주문은 제가 도와드리겠습니다.'),
            say('hiker', 'normal', '…흠. 아메리카노 하나요.'),
            narr('손님은 목소리를 낮추었다.'),
            say('manager', 'front', '연우 씨, 잘했어요. 이런 손님은 혼자 상대하지 않아도 돼요. 부르는 게 맞아요.'),
            term('worker_protection'),
          ],
        }),
        bad('freeze', '무서워서 혼자 꾹 참는다', {
          fail: [
            narr('나는 고개를 숙이고 울음을 참았다. 손님 목소리는 점점 커졌다.'),
            narr('손님이 간 뒤에도 손이 계속 떨렸다. 아무에게도 말하지 못했다.'),
          ],
          oops: { id: 'ch3_endure', title: '혼자 참고 상처받았어요', lesson: '직원은 보호받을 권리가 있어요. 혼자 참지 말고 관리자를 부르고, 나중에라도 꼭 말해요.', icon: 'shield' },
        }),
      ],
    }),

    bgm('cafe'), time('12:30'),
    place('12:30', '점심 피크타임'),
    sfx('bell'), sfx('bell'),
    bg('counter', 'peak'), amb('crowd', 1.5), bgm('peak'),
    show({ left: 'yeonwoo:nervous', right: 'dohyun:normal' }),
    narr('딸랑, 딸랑, 딸랑. 회사원 열다섯 명이 한꺼번에 들어왔다.'),
    say('customer', 'normal', '아이스 아메리카노 다섯 잔이요!'),
    say('customer', 'normal', '라테 세 잔이랑 크루아상 네 개 포장이요!'),
    say('customer', 'worried', '저희 시간 없는데, 빨리 돼요?'),
    fx('overload'), bgm('overload'),
    narr('목소리가 한꺼번에 몰려왔다. 귀가 멍멍하고, 글자가 흐려 보였다.'),
    narr('발이 바닥에 붙은 것 같았다.'),
    think('소리가 너무 커. 아무것도 안 들려.'),
    branch('accommodation', {
      earplugs: [
        narr('그때, 앞치마 주머니 속 작은 통이 손에 닿았다. 면접 날 점장님이 챙겨 준 귀마개.'),
        think('필요할 때 써도 된다고 했어.'),
      ],
      _: [say('dohyun', 'teach', '연우 씨! 괜찮아요? 소리가 커서 힘들어요?')],
    }),

    decide({
      id: 'ch3_overload', title: '소리가 너무 클 때', q: '소리가 너무 크다. 어떻게 할까?', who: 'yeonwoo', skill: 'help', memo: 3,
      choices: [
        good('earplug', '귀마개를 낀다 (없으면 "귀마개를 써도 될까요?" 하고 묻는다)', {
          set: { overloadChoice: 'earplugs' },
          praise: [
            branch('accommodation', {
              earplugs: [],
              _: [
                say('yeonwoo', 'determined', '선배님, 소리가 너무 커요. 귀마개를 써도 될까요?'),
                say('dohyun', 'smile', '그럼요! 창고 첫 번째 칸에 있어요. 말해 줘서 고마워요.'),
              ],
            }),
            earplugs(true),
            narr('귀마개를 끼자, 소리가 먹먹하게 멀어졌다. 내 숨소리가 들렸다.'),
          ],
        }),
        bad('freeze', '괜찮은 척하고 그냥 참는다', {
          fail: [
            narr('나는 괜찮은 척 컵을 집었다. 그런데 손이 떨렸다.'),
            sfx('crash_small'),
            narr('아이스컵 탑이 와르르 무너졌다. 얼음이 바닥에 흩어졌다.'),
            say('dohyun', 'worried', '연우 씨! 괜찮아요? 다친 데 없어요?'),
          ],
          oops: { id: 'ch3_pretend', title: '참다가 컵 탑이 무너졌어요', lesson: '힘들 때 괜찮은 척하면 더 큰 실수가 생겨요. "귀마개를 써도 될까요?", "잠깐 쉬어도 될까요?"라고 말해요.', icon: 'hand' },
        }),
        good('tea', '"선배님, 2분만 쉬고 와도 될까요?" 하고 말한다', {
          set: { overloadChoice: 'break' },
          praise: [
            say('yeonwoo', 'determined', '선배님, 소리가 너무 커서 그래요. 2분만 쉬고 와도 될까요?'),
            say('dohyun', 'smile', '그럼요. 다녀와요. 말해 줘서 고마워요.'),
            bg('staff'), amb(null), bgm(null),
            narr('직원 공간에서 물을 한 모금 마셨다. 조용했다. 내 숨소리가 들렸다.'),
            bg('counter', 'peak'), amb('crowd', 1.5),
          ],
        }),
        bad('run', '말없이 매장 밖으로 나가 버린다', {
          fail: [
            narr('나는 아무 말 없이 뒷문으로 나갔다.'),
            narr('도현 선배는 혼자서 열다섯 잔을 만들었다. 주문이 밀리고, 손님들이 화를 냈다.'),
            phone('dohyun', '연우 씨 어디 있어요? 무슨 일 있어요? 걱정돼요.'),
          ],
          oops: { id: 'ch3_vanish', title: '말없이 사라졌어요', lesson: '쉬어도 괜찮아요. 다만 "잠깐 쉬고 올게요"라고 말하고 가요. 그래야 동료가 걱정하지 않고 일을 나눌 수 있어요.', icon: 'door' },
        }),
      ],
    }),
    amb(null), // 과부하 장면의 군중 소리는 여기까지(숨 고르기는 조용히). 평소 매장 장면에는 군중 소리를 쓰지 않음(사용자 요청)
    breathe(3, '하나, 둘, 셋. 피크타임 수칙 1번.'),
    check(1),
    fx('overload', false), bgm('peak'), face('yeonwoo', 'determined'),
    think('그래. 혼자 다 하는 게 아니야. 나눠서 하면 돼.'),

    decide({
      id: 'ch3_roles', title: '역할 나누기', q: '주문이 밀려 있다. 이제 무엇을 할까?', who: 'yeonwoo', skill: 'team', memo: 2,
      timer: { sec: 18, label: '주문이 밀려 있어요', as: 'freeze' }, // 시간이 다 되면 선배가 시킬 때까지 기다린 것과 같음
      choices: [
        bad('coffee', '혼자 음료까지 전부 만든다', {
          fail: [
            narr('나는 음료도, 포장도, 뚜껑도 혼자 하려고 했다.'),
            narr('라테 우유가 넘치고, 크루아상 봉투가 바뀌었다.'),
            say('customer', 'angry', '이거 제 포장 아닌데요? 라테는 왜 이렇게 식었어요?'),
          ],
          oops: { id: 'ch3_alone', title: '혼자 다 하려다 다 꼬였어요', lesson: '바쁠수록 역할을 나눠요. "제가 이걸 맡을게요. 선배님은 저걸 해 주세요."', icon: 'team' },
        }),
        bad('freeze', '선배가 시킬 때까지 기다린다', {
          fail: [
            narr('나는 선배가 시킬 때까지 기다렸다. 선배는 음료를 만드느라 나를 볼 틈이 없었다.'),
            sfx('tick_fast'),
            say('customer', 'worried', '저기요, 포장 언제 돼요? 벌써 10분째예요.'),
          ],
          oops: { id: 'ch3_wait', title: '손님들이 10분이나 기다렸어요', lesson: '바쁠 때는 선배도 여유가 없어요. 내가 할 수 있는 일을 먼저 말해요.', icon: 'hand' },
        }),
        good('team', '"제가 포장과 뚜껑을 맡을게요. 음료는 선배님이 해 주세요."', {
          praise: [
            say('yeonwoo', 'determined', '선배님! 제가 빵 포장이랑 컵 뚜껑을 맡을게요. 음료는 선배님이 해 주세요!'),
            say('dohyun', 'smile', '좋아요! 오늘은 연우 씨가 정해 줘요. 나는 음료!'),
            term('role_split'),
          ],
        }),
      ],
    }),
    check(2),
    sfx('espresso'),
    narr('선배가 에스프레소를 뽑으면, 나는 뚜껑을 딱 소리 나게 닫았다.'),
    sfx('stack'),
    narr('주문서를 손가락으로 짚고, 크루아상을 봉투에 담고, 스티커를 붙였다. 하나씩, 차례대로.'),

    sfx('beep'), bgm('tension'),
    narr('삐, 삐, 삐. 갑자기 제빙기에서 경고음이 울렸다.'),
    say('dohyun', 'teach', '어? 얼음이 안 나와요!'),
    decide({
      id: 'ch3_ice', title: '제빙기 고장', q: '제빙기에서 얼음이 안 나온다. 어떻게 할까?', who: 'yeonwoo', skill: 'report', memo: 3,
      timer: {
        sec: 15, label: '아이스 주문이 기다려요',
        fail: [
          narr('나는 멈춘 제빙기 앞에서 어쩔 줄 몰랐다.'),
          say('customer', 'worried', '아이스 아메리카노 아직이에요? 저희 시간 없는데요.'),
          narr('점장님은 제빙기가 멈춘 걸 몰랐다. 아이스 주문이 계속 쌓였다.'),
        ],
        oops: { id: 'ch3_ice_wait', title: '머뭇거리는 사이 주문이 쌓였어요', lesson: '기계가 멈추면 혼자 고민하지 말고 바로 관리자에게 알려요. 알려야 빨리 고칠 수 있어요.', icon: 'bell_call' },
      },
      choices: [
        good('bell_call', '손대지 않고 점장님께 바로 알린다', {
          praise: [
            say('yeonwoo', 'determined', '점장님! 제빙기에서 삐 소리가 나고 얼음이 안 나와요!'),
            enter('center', 'manager:think'),
            say('manager', 'think', '보고 고마워요. 제빙기는 내가 볼게요. 손대지 마요.'),
            term('ice_machine'),
          ],
        }),
        bad('hand', '손을 넣어서 직접 고쳐 본다', {
          fail: [
            narr('나는 제빙기 문을 열고 안쪽에 손을 넣었다.'),
            sfx('crash_small'),
            narr('날카로운 부분에 손가락이 끼일 뻔했다. 차가운 금속에 손등이 쓸렸다.'),
            say('dohyun', 'worried', '연우 씨! 손 빼요! 그 안에는 날카로운 부분이 있어요!'),
          ],
          oops: { id: 'ch3_fix', title: '손을 다칠 뻔했어요', lesson: '고장 난 기계는 직접 고치지 않아요. 손대지 말고 관리자에게 바로 알려요.', icon: 'ice' },
        }),
        bad('icecup', '얼음 없이 그냥 아이스 음료를 만든다', {
          fail: [
            narr('나는 얼음 없이 커피를 아이스컵에 부었다. 뜨거운 커피에 컵이 흐물흐물해졌다.'),
            say('customer', 'angry', '아이스 시켰는데 왜 뜨거워요?'),
          ],
          oops: { id: 'ch3_noice', title: '뜨거운 아이스커피가 나갔어요', lesson: '문제가 생기면 혼자 넘기지 말고 바로 보고해요. 그래야 손님께 제대로 안내할 수 있어요.', icon: 'speech' },
        }),
      ],
    }),
    check(3),
    say('manager', 'front', '연우 씨, 손님들께 아이스 음료가 잠깐 늦어진다고 안내해 줄래요?'),
    decide({
      id: 'ch3_announce', title: '손님께 안내하기', q: '손님들께 어떻게 안내할까?', who: 'yeonwoo', skill: 'serve',
      timer: {
        sec: 20, label: '손님들이 기다려요',
        fail: [
          narr('나는 무슨 말을 해야 할지 몰라 가만히 서 있었다.'),
          sfx('crowd_angry'),
          say('customer', 'angry', '아이스 음료는 언제 나와요? 아무도 말을 안 해 주네.'),
        ],
        oops: { id: 'ch3_noannounce', title: '아무 안내도 못 했어요', lesson: '무슨 일인지 모르면 손님은 더 답답해요. 무슨 일인지, 얼마나 걸리는지, 대신 할 수 있는 것을 바로 말해요.', icon: 'speech' },
      },
      help: '무슨 일인지, 얼마나 걸리는지, 대신 할 수 있는 게 뭔지 함께 말하면 좋아요.',
      choices: [
        bad('ice', '"얼음 없어요."라고만 말한다', {
          fail: [
            say('yeonwoo', 'normal', '얼음 없어요.'),
            sfx('crowd_angry'),
            say('customer', 'angry', '그래서 어떻게 하라는 거예요? 기다려요? 취소해요?'),
            narr('손님들이 웅성거렸다. 아무도 어떻게 해야 할지 몰랐다.'),
          ],
          oops: { id: 'ch3_short', title: '손님들이 더 헷갈렸어요', lesson: '안내할 때는 "무슨 일인지 + 얼마나 걸리는지 + 대신 할 수 있는 것"을 함께 말해요.', icon: 'speech' },
        }),
        good('speech', '"죄송합니다. 얼음이 부족해서 아이스 음료는 10분 정도 걸려요. 따뜻한 음료는 바로 돼요."', {
          praise: [
            say('yeonwoo', 'determined', '손님 여러분, 죄송합니다. 지금 얼음이 부족해서 아이스 음료는 10분 정도 걸려요.'),
            say('yeonwoo', 'determined', '따뜻한 음료는 바로 준비해 드릴 수 있어요.'),
            say('customer', 'smile', '아, 그럼 저는 따뜻한 걸로 바꿀게요.'),
            say('customer', 'normal', '저는 기다릴게요. 알려 줘서 고마워요.'),
          ],
        }),
      ],
    }),
    bgm('peak'),
    mini('order', {
      skill: 'serve', title: '포장 주문 확인',
      orders: [
        { who: '단체 손님 1', items: { croissant: 4, latte: 3 } },
        { who: '단체 손님 2', items: { hot_ame: 2, saltbread: 2, muffin: 1 } },
      ],
      oops: { id: 'ch3_order', title: '포장이 바뀌었어요', lesson: '바쁠수록 주문서를 손가락으로 짚으며 담아요.', icon: 'order_check' },
      // 급한 장면: 점심시간에 단체 손님이 줄 서 있음. 손님마다 시간 제한 막대(18초 + 물건 하나에 3초)
      timer: {
        label: '단체 손님들이 기다려요', say: '저기요, 아직이에요? 저희 점심시간 끝나요.',
        oops: { id: 'ch3_order_slow', title: '손님들이 너무 오래 기다렸어요', lesson: '바쁠 때 머뭇거리면 손님이 오래 기다려요. 주문서를 한 줄씩 짚으며 차례대로 담아요.', icon: 'clock' },
      },
    }),
    sfx('ice'),
    narr('점장님이 제빙기를 다시 켰다. 얼음이 와르르 쏟아졌다.'),
    say('customer', 'smile', '와, 손이 정말 빠르시네요! 포장도 예쁘게 해 주셔서 고마워요.'),
    term('fast_hands'),
    think('"손이 빠르다"… 칭찬이구나.'),
    narr('손님에게 직접 고맙다는 말을 들었다. 가슴속이 따뜻하게 차올랐다.'),

    earplugs(false), amb(null), bgm('cafe'), bg('counter', 'day'), time('13:20'),
    place('13:20', '폭풍이 지나간 뒤'),
    narr('폭풍 같은 점심이 끝났다. 가게에 다시 조용한 음악이 흘렀다.'),
    show({ left: 'yeonwoo:smile', center: 'manager:front', right: 'dohyun:smile' }),
    bgm('warm'),
    say('manager', 'front', '연우 씨, 잠깐 이리 와 봐요.'),
    narr('점장님 손에 작은 검은 상자가 들려 있었다.'),
    say('manager', 'think', '아까 다 봤어요. 반말하는 손님 앞에서 물러나 나를 불렀고, 소리가 클 때 필요한 걸 말했고.'),
    say('manager', 'front', '역할을 나누자고 먼저 말했고, 제빙기 고장도 바로 보고했어요.'),
    say('manager', 'normal', '연우 씨, 나 비밀 하나 말해 줄까요?'),
    say('manager', 'think', '나는 어릴 때부터 긴 글이나, 말로만 들은 지시를 잘 기억하지 못했어요.'),
    say('manager', 'think', '그래서 나를 위해 메모를 쓰기 시작했어요. 크게, 짧게, 세 줄로.'),
    narr('점장님이 벽의 노란 메모를 바라보았다.'),
    say('manager', 'smile', '그런데 써 보니까, 모두가 편하더라고요. 그래서 우리 가게는 외우지 않아도 되는 가게가 됐어요.'),
    think('메모는… 나만을 위한 게 아니었구나.'),
    say('manager', 'front', '도움을 쓰는 건 부끄러운 일이 아니에요. 일을 잘하는 방법이에요.'),
    narr('점장님이 상자를 열었다. 금빛 배지가 반짝였다. MILESTONE CREW.'),
    act('배지 받기', 'badge', 'jingle_badge'),
    got('item_badge', '정규 크루 배지', 'badge'),
    cg('badge'),
    say('manager', 'smile', '오늘부로 정연우 씨를 카페 마일스톤의 정규 크루로 인정합니다. 자랑스러워요, 연우 크루.'),
    term('crew'),
    narr('눈이 뜨거워졌다. 학교에서 손 씻기와 인사를 연습하던 날들이 스쳐 지나갔다.'),
    say('yeonwoo', 'smile', '감사합니다, 점장님! 앞으로도 모르면 묻고, 실수하면 말할게요!'),
    say('dohyun', 'glasses', '연우 씨, 오늘은 연우 씨가 나한테 역할을 정해 줬어요. 내가 배웠어요.'),
    say('dohyun', 'smile', '하이파이브 한번 할까요?'),
    act('하이파이브!', 'highfive', 'highfive'),
    narr('주방 창문 너머로 민재 선배가 엄지를 들어 보였다.'),
    cg(null),
    show({ left: 'yeonwoo:smile', center: 'sora:smile', right: 'dohyun:smile' }),
    say('sora', 'smile', '잠깐! 오늘의 한 장! 다들 웃어요!'),
    photo('badge'),
    finish('3장 완료', '정규 크루가 되었어요!'),
    end(),
  ],
};
