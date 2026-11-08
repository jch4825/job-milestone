/**
 * DAY 2 · 화요일: 쏟아진 시럽
 * 학습: 오픈 준비 순서(메모), 컵 분류, 실수 즉시 보고(핵심), 올바른 청소 방법, 첫 손님 인사
 * 성취기준: [12진로03-01] [12진로04-04] [12진로04-01] [12진로03-04] [12진로04-05]
 */

import {
  bg, bgm, amb, sfx, show, enter, say, narr, think, time, place, schedule, memo, memoHi,
  decide, good, bad, mini, act, snap, photo, term, finish, end, fx,
  check, cg, guide,
} from '../../core/dsl.js';

export default {
  id: 'd2',
  act: 2,
  label: 'DAY 2 · 화요일',
  title: '쏟아진 시럽',
  when: '첫째 주 화요일 08:50',
  goal: '순서대로 준비하고, 실수하면 바로 말해요.',
  schedule: [['cup', '컵·빨대 채우기'], ['speech', '실수하면 바로 말하기'], ['greet', '첫 손님 맞이']],
  skills: ['prepare', 'report', 'clean', 'serve'],
  standards: ['[12진로03-01]', '[12진로04-04]', '[12진로04-01]', '[12진로03-04]', '[12진로04-05]'],
  photo: 'open',
  diary: '컵 보관대를 채웠다. 종이컵은 왼쪽, 아이스컵은 오른쪽. 그리고 시럽을 쏟았다. 무서웠지만 "선배님, 제가 쏟았습니다"라고 말했다. 선배는 "말해줘서 고마워요"라고 했다. 혼나지 않았다. 같이 닦으니 1분도 안 걸렸다. 점장님 말대로 OPEN 푯말을 돌리고, 나는 처음으로 "어서 오세요"라고 말했다.',
  script: [
    bg('staff'), bgm('cafe'), time('08:50'),
    schedule(),
    show({ left: 'yeonwoo:smile' }),
    sfx('pen'),
    narr('출근 기록부에 이름을 쓰고, 손을 6단계로 씻었다. 어제 배운 순서다.'),
    memo('화요일 오픈 메모', [['cup', '컵과 빨대 채우기 (종이컵 왼쪽, 아이스컵 오른쪽)'], ['window', '창문 열고 10분 환기'], ['speech', '실수하면 바로 선배에게 말하기']]),

    bg('counter', 'morning'), amb(null),
    place('09:00', '홀 · 카운터'),
    show({ left: 'yeonwoo:normal', right: 'dohyun:smile' }),
    say('dohyun', 'smile', '오늘은 {{오픈 준비}}를 같이 해요. 메모를 보면서 순서대로요.'),
    decide({
      id: 'd2_order', title: '오픈 준비 순서', q: '메모를 보면, 지금 가장 먼저 할 일은 무엇일까요?', who: 'dohyun', skill: 'prepare', memo: 1,
      choices: [
        bad('greet', '계산대에서 손님 기다리기', {
          fail: [
            time('09:35'), sfx('bell'), enter('center', 'grandma:smile'),
            say('grandma', 'smile', '따뜻한 우유 한 잔 줄래요?'),
            narr('그런데 컵 보관대가 텅 비어 있었다. 나는 창고까지 뛰어가야 했다.'),
            say('grandma', 'worried', '…아이고, 오래 걸리네.'),
          ],
          oops: { id: 'd2_wait_first', title: '컵이 없어서 손님이 기다렸어요', lesson: '오픈 준비는 손님이 오기 전에 해요. 메모 1번부터 순서대로!', icon: 'cup' },
        }),
        good('cup', '컵과 빨대 채우기', { praise: '맞아요. 손님이 오기 전에 컵이 준비되어 있어야 해요.' }),
        bad('mop', '바닥 대걸레질부터 하기', {
          fail: [
            narr('나는 바닥을 열심히 닦았다. 그런데 바닥은 이미 반짝반짝했다.'),
            say('dohyun', 'teach', '바닥은 아까 내가 했어요. 메모에 없는 일부터 하면 시간이 모자라요.'),
          ],
          oops: { id: 'd2_mop_first', title: '이미 한 일을 또 했어요', lesson: '할 일이 헷갈리면 메모를 보고, 메모에 없는 일은 먼저 물어봐요.', icon: 'memo' },
        }),
      ],
    }),
    term('supplies'),
    say('dohyun', 'teach', '종이컵은 왼쪽, 투명한 아이스컵은 오른쪽이에요. 빨대는 빨대 통, 뚜껑은 뚜껑 칸.'),
    mini('cups', {
      skill: 'prepare', title: '컵·빨대 채우기',
      oops: { id: 'd2_cups', title: '컵 보관대가 뒤죽박죽', lesson: '칸이 섞이면 바쁠 때 엉뚱한 컵을 쓰게 돼요. 종이컵은 왼쪽, 아이스컵은 오른쪽!', icon: 'icecup' },
    }),
    narr('컵들이 딱 맞게 쌓였다. 딸깍, 딸깍. 나는 이 소리가 좋다.'),
    check(1),
    act('창문 열기', 'window', 'door'),
    narr('창문을 열자 시원한 아침 공기가 들어왔다.'),
    term('ventilation'),

    narr('마지막으로, 바닐라 시럽 통을 받침대에 올려놓으려던 순간이었다.'),
    bgm('tension'), sfx('spill'), fx('shake'),
    show({ left: 'yeonwoo:nervous' }),
    narr('툭. 손에 힘이 살짝 빠졌다.'),
    narr('뚜껑이 덜 닫혀 있던 시럽이 카운터 위로 주르륵 쏟아졌다.'),
    narr('달콤한 냄새가 끈적하게 퍼졌다. 얼굴이 뜨거워지고 손끝이 차가워졌다.'),
    think('어떡하지. 또 실수했어. 혼나면 어떡하지.'),
    think('…고등학교 실습 때처럼.'),
    narr('도현 선배는 등을 돌리고 원두를 갈고 있었다. 아직 모른다.'),
    memoHi(3),

    decide({
      id: 'd2_syrup', title: '시럽을 쏟았을 때', q: '시럽을 쏟았다. 어떻게 할까?', who: 'yeonwoo', skill: 'report', memo: 3,
      help: '메모 3번을 같이 볼까요? 실수하면 어떻게 하기로 했죠?',
      choices: [
        bad('walk', '모르는 척 창고로 간다', {
          fail: [
            narr('나는 쏟아진 시럽을 그대로 두고 창고로 갔다.'),
            time('09:35'), sfx('bell'), enter('right', 'grandma:smile'),
            narr('첫 손님이 카운터에 손을 짚었다.'),
            sfx('slip'),
            say('grandma', 'surprised', '아이고! 이게 왜 이렇게 끈적해? 손이랑 소매가 다 젖었네.'),
            narr('할머니가 놀라서 뒤로 미끄러질 뻔했다.'),
          ],
          oops: { id: 'd2_hide_syrup', title: '손님이 다칠 뻔했어요', lesson: '쏟은 것을 숨기면 다른 사람이 미끄러지거나 다칠 수 있어요. 바로 말하고 같이 닦아요.', icon: 'caution' },
        }),
        bad('cloth', '혼날까 봐 혼자 몰래 닦는다', {
          fail: [
            narr('나는 몰래 마른 휴지로 시럽을 닦았다. 그런데 시럽은 닦을수록 더 넓게 번졌다.'),
            narr('휴지가 다 떨어졌다. 끈적한 자국이 카운터 끝까지 이어졌다.'),
            enter('right', 'manager:strict'),
            say('manager', 'strict', '이게 뭐죠? 왜 아무도 말을 안 했어요? 오픈이 15분 늦어지겠어요.'),
          ],
          oops: { id: 'd2_secret_wipe', title: '시럽이 더 번졌어요', lesson: '몰래 혼자 해결하려다 일이 더 커질 수 있어요. 바로 말하면 선배가 맞는 방법을 알려 줘요.', icon: 'cloth' },
        }),
        good('speech', '"선배님! 제가 시럽을 쏟았습니다!" 바로 말한다', {
          praise: [
            bgm(null),
            // 실수를 말하는 순간은 당황한 얼굴(주먹 쥔 determined 는 어울리지 않음)
            show({ left: 'yeonwoo:nervous', right: 'dohyun:normal' }),
            say('yeonwoo', 'nervous', '선배님! 제가… 시럽을 쏟았습니다!'),
            narr('목소리가 조금 떨렸다. 그래도 또박또박 말했다.'),
            narr('도현 선배가 뒤를 돌아보았다. 나는 눈을 질끈 감았다.'),
            say('dohyun', 'smile', '말해줘서 고마워요.'),
            narr('눈을 떴다. 선배는 웃고 있었다.'),
            say('yeonwoo', 'nervous', '…혼 안 내시나요?'),
            bgm('warm'),
            say('dohyun', 'smile', '혼을 왜 내요? 시럽은 닦으면 돼요. 그런데 숨기면 누가 미끄러질 수 있어요.'),
            say('dohyun', 'glasses', '바로 말해 준 게 제일 중요해요. 자, 같이 닦아요.'),
            term('report'),
          ],
        }),
      ],
    }),

    say('dohyun', 'teach', '시럽은 끈적해서, 마른 휴지로 닦으면 번져요.'),
    decide({
      id: 'd2_wipe', title: '시럽 닦는 방법', q: '어떤 순서로 닦을까요?', who: 'dohyun', skill: 'clean',
      help: '끈적한 건 물기가 있어야 잘 닦여요. 무엇을 먼저 쓸까요?',
      choices: [
        good('cloth', '따뜻한 물에 적신 행주로 닦고 → 마른 행주로 물기 닦기', {
          praise: [
            sfx('wipe'),
            cg('syrup'),
            narr('선배가 따뜻한 행주로 시럽을 닦고, 내가 마른 행주로 물기를 닦았다.'),
            narr('1분도 안 걸려서 카운터가 다시 반짝였다.'),
            say('dohyun', 'smile', '봐요. 같이 하니까 금방이죠.'),
          ],
        }),
        bad('tissue', '마른 휴지로 문지르기', {
          fail: [narr('휴지가 시럽에 달라붙어 하얀 보풀이 카운터에 붙었다.'), say('dohyun', 'teach', '앗, 휴지가 다 붙어 버렸네요.')],
          oops: { id: 'd2_tissue', title: '휴지가 달라붙었어요', lesson: '끈적한 것은 젖은 행주로 먼저 닦고, 마른 행주로 물기를 닦아요.', icon: 'cloth' },
        }),
      ],
    }),
    narr('가슴에 꽉 차 있던 무서움이 스르르 풀렸다.'),
    think('실수해도 괜찮구나. 말하면, 같이 해결하면 되는구나.'),
    snap('dohyun', 'smile', '정직한 보고!', '말해줘서 고마워요'),
    cg(null),
    check(2),

    bgm('cafe'), sfx('door'),
    enter('center', 'manager:normal'),
    place('09:28', '오픈 2분 전'),
    narr('점장님이 카운터를 천천히 둘러보았다. 가득 찬 컵 보관대, 반짝이는 카운터.'),
    say('manager', 'think', '음. 컵도 크기별로 반듯하게 쌓았네요.'),
    say('dohyun', 'smile', '점장님, 아까 연우 씨가 시럽을 쏟았는데, 바로 말해 줘서 금방 같이 닦았어요.'),
    say('manager', 'smile', '거봐요. 면접 때 말했죠? 실수는 괜찮아요. 말해 주는 게 중요해요.'),
    say('manager', 'front', '9시 30분이에요. 연우 씨가 푯말을 돌려 볼래요?'),
    act('OPEN 푯말 돌리기', 'sign_open', 'sign'),
    sfx('bell'),
    show({ left: 'yeonwoo:normal', right: 'grandma:smile' }),
    narr('딸랑. 첫 손님이 들어왔다. 지팡이를 짚은 할머니였다.'),
    guide('timer', '이번에는 고를 시간이 정해져 있어요. **막대**가 다 줄어들기 전에 골라요.'),

    decide({
      id: 'd2_greet', title: '첫 손님 인사', q: '첫 손님이 들어왔다. 뭐라고 말할까?', who: 'yeonwoo', skill: 'serve',
      timer: { sec: 15, label: '손님이 기다려요', as: 'freeze' }, // 급한 장면: 손님이 카운터 앞에서 기다림
      choices: [
        good('greet', '"어서 오세요! 카페 마일스톤입니다!"', {
          praise: [say('yeonwoo', 'smile', '어서 오세요! 카페 마일스톤입니다!'), say('grandma', 'smile', '어머, 목소리가 참 밝네. 새로 왔어요?')],
        }),
        bad('menu', '"뭐 드릴까요?"만 짧게 말한다', {
          fail: [
            say('yeonwoo', 'normal', '뭐 드릴까요?'),
            say('grandma', 'worried', '…아, 네. 우유요.'),
            narr('할머니는 조금 머쓱한 얼굴로 메뉴판만 보았다.'),
          ],
          oops: { id: 'd2_nohello', title: '인사 없이 주문부터 물었어요', lesson: '손님이 오면 먼저 밝게 인사해요. "어서 오세요! 카페 마일스톤입니다!"', icon: 'greet' },
        }),
        bad('freeze', '긴장해서 아무 말도 못 한다', {
          fail: [
            narr('나는 입을 열지 못했다. 할머니는 한참 서 있다가 주위를 두리번거렸다.'),
            say('grandma', 'worried', '저기요… 주문 받아 주는 사람 있어요?'),
          ],
          oops: { id: 'd2_silent', title: '손님이 혼자 기다렸어요', lesson: '떨려도 인사는 꼭 해요. 정해진 인사말을 외워 두면 입이 먼저 움직여요.', icon: 'speech' },
        }),
      ],
    }),
    say('grandma', 'smile', '나는 최봉순이에요. 여기 {{단골}}이지. 소금빵 하나랑 따뜻한 우유 줘요.'),
    narr('나는 마음속으로 따라 했다. 봉순 할머니. 소금빵 하나, 따뜻한 우유.'),
    check(3),
    photo('open'),
    finish('DAY 2 완료', '실수했을 때 바로 말했어요!'),
    end(),
  ],
};
