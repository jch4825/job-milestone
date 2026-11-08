/**
 * 4장 1화: 나의 첫 근무판 (v3 자립 근무편, 1단계 세로 조각) — 설계: docs/v3_design.md
 * 학습: 시간 계획과 우선순위(근무판), 쉬는 시간 권리(계약을 바꿀 때는 서로 동의하고 글로), 쏟은 음료 안전 수습, 준비 부족의 결과
 * 성취기준: [12진로03-01] [12진로04-02] [12진로03-04] [12진로06-02]
 * 근무판의 계획에 따라 피크 직전 사건(컵·얼음·빵·청결)이 생기거나 생기지 않습니다(onlyIf).
 */

import {
  bg, bgm, amb, sfx, show, enter, say, narr, think, sys, phone, time, place, schedule, memo, big,
  doc, docHi, docSeal, docClose, act, mini, photo, finish, end, check,
  briefing, board, shiftStart, block, workSet, workOops, shiftEnd, onlyIf,
} from '../../core/dsl.js';

export default {
  id: 'ch4_1',
  act: 4,
  label: '4장 1화',
  title: '나의 첫 근무판',
  when: '화요일 08:55',
  goal: '내 하루를 근무판에 짜고, 그대로 일해요.',
  schedule: [['calendar', '근무판 짜기'], ['apron', '혼자 오전 근무'], ['coin', '퇴근 정산']],
  skills: ['time', 'safety', 'rights'],
  costume: { customer: 'olive', grandma: 'cardigan' }, // 라테를 쏟은 손님 · 다른 날 옷을 갈아입은 봉순 할머니
  standards: ['[12진로03-01]', '[12진로04-02]', '[12진로03-04]', '[12진로06-02]'],
  photo: 'board',
  diary: '오늘 처음으로 내 근무판을 짰다. 자석을 하나씩 붙이고, 그대로 일했다. 라테가 쏟아졌을 때 표지판부터 세웠다. 내 하루를 내가 정한다는 건, 조금 무섭고 많이 뿌듯하다.',
  script: [
    big('4장 · 자립 근무', '다음 주 화요일'),
    bg('staff'), bgm('morning'), amb(null), time('08:55'),
    schedule(),
    place('화요일 08:55', '직원 공간'),
    show({ left: 'yeonwoo:normal', right: 'manager:front' }),
    narr('메모 보드 옆에 커다란 화이트보드가 새로 붙어 있었다.'),
    say('manager', 'front', '연우 씨, 오늘부터 이걸 써 봐요. 근무판이에요.'),
    say('manager', 'normal', '요즘 점심 손님이 많아졌어요. 길 건너에 새 회사 건물이 생겼거든요.'),
    phone('dohyun', '연우 씨, 저는 오늘 오전에 바리스타 학원에 가요. 근무판 화이팅!'),
    say('manager', 'smile', '도현 씨는 화요일, 목요일 오전에 학원에 가요.'),
    say('manager', 'front', '그래서 오늘 오전은, 연우 씨 하루를 연우 씨가 짜요.'),
    think('내 하루를… 내가 짠다고?', 'nervous'),
    say('manager', 'normal', '메모는 남이 써 준 거고, 근무판은 내가 쓰는 거예요.'),
    say('manager', 'smile', '모르면 묻고, 짜 보고, 해 보고, 고치면 돼요.'),

    // 쉬는 시간: 서로 동의하고 계약서에 고쳐 적기
    say('manager', 'front', '그리고 쉬는 시간 말인데요. 점심이 바빠져서 시간을 바꾸고 싶어요.'),
    doc('contract'), docHi(5),
    say('manager', 'normal', '30분 쉬는 건 그대로예요. 10시 30분이나 11시 중에 고르면 어때요?'),
    say('yeonwoo', 'determined', '좋아요. 근무판에 제가 넣어 볼게요.'),
    say('manager', 'smile', '그럼 고친 곳에 도장을 찍어요. 저도 찍을게요.'),
    docSeal('고친 곳에 도장 찍기'),
    say('manager', 'front', '계약 내용을 바꿀 때는 이렇게 둘 다 동의하고 글로 적어요.'),
    docClose(),

    // 아침 브리핑 → 근무판
    memo('근무판 메모', [['icecup', '12시 피크 전에 컵·얼음·빵 채우기'], ['cloth', '테이블은 바쁘기 바로 전에 닦기'], ['tea', '쉬는 시간: 10시 30분 또는 11시']]),
    briefing({ day: '화요일', cards: [['light', '날씨', '맑음'], ['team', '오늘 함께', '점장님, 민재 선배, 소라 씨'], ['greet', '손님', '점심에 많아요']], note: '도현 선배는 오전에 학원에 가요.' }),
    board({ id: 'ch4_1_board', title: '화요일 근무판', pool: ['restock_cups', 'check_ice', 'bread_display', 'wipe_tables', 'sweep', 'trash', 'break'], tutorial: true }),
    check(1),
    say('manager', 'smile', '좋아요. 근무판은 메모 보드 옆에 붙여 둘게요.'),

    // 근무: 픽셀 매장 (시간은 [다음]을 누를 때만 흐름)
    bg('counter', 'morning'), bgm('cafe'),
    shiftStart({ cups: 2, ice: 1, bread: 3, clean: 3, energy: 4 }),
    sys('[다음]을 누르면 근무판대로 일해요. 시간은 내가 누를 때만 흘러요.'),
    block('s1'),
    block('s2'),

    // 사건: 손님이 라테를 쏟음 (미니게임: 쏟은 음료 수습)
    sfx('spill'),
    say('customer', 'surprised', '어머, 어떡해! 라테를 쏟았어요.'),
    think('바닥이 젖었어. 손님들이 지나가는 길이야.', 'nervous'),
    mini('spill', { id: 'ch4_1_spill', title: '쏟은 음료 수습', skill: 'safety', speech: '손님이 라테를 쏟았어요. 바닥을 안전하게 치워요.' }),
    say('customer', 'smile', '고마워요. 덕분에 아무도 안 미끄러졌어요.'),
    block('s3'),
    block('s4'),
    block('s5'),

    // 즐거운 일: 봉순 할머니
    say('grandma', 'smile', '연우 씨, 오늘은 혼자서도 척척이네.'),
    say('yeonwoo', 'smile', '오늘은 제가 근무판을 짰어요!'),
    say('grandma', 'happy', '어머, 멋지다. 소금빵 하나 줘요.'),
    check(2),

    // 피크 직전: 근무판의 결과
    say('sora', 'smile', '안녕하세요! 피크 전에 왔어요.'),
    ...onlyIf({ cups: '<2' },
      say('sora', 'surprised', '연우 씨, 컵이 거의 없어요!'),
      act('창고에서 컵 가져오기', 'icecup', 'stack'),
      workSet({ fill: ['cups'], add: { waited: 2 } }),
      workOops({ id: 'ch4_cups_out', title: '피크 직전에 컵이 모자랐어요', lesson: '바쁜 시간 전에 컵을 채워 두면 손님이 기다리지 않아요. 근무판에 미리 넣어요.', icon: 'icecup' })),
    ...onlyIf({ ice: '<2' },
      say('sora', 'worried', '연우 씨, 얼음통이 거의 비었어요!'),
      mini('catch', { id: 'ch4_1_ice_rush', skin: 'ice', title: '얼음 채우기', skill: 'prepare', rush: true, speech: '얼음이 거의 없어요. 제빙기에서 얼음을 받아 얼음통을 채워요.' }),
      workSet({ fill: ['ice'], add: { waited: 2 } }),
      workOops({ id: 'ch4_ice_out', title: '피크에 얼음이 모자랐어요', lesson: '얼음은 채우는 데 시간이 걸려요. 바쁜 시간 전에 근무판에 넣어요.', icon: 'ice' })),
    ...onlyIf({ bread: '<2' },
      say('minjae', 'normal', '진열대 빵, 비었네.'),
      act('민재 선배에게 빵 부탁하기', 'croissant', 'tap'),
      say('minjae', 'smile', '말해 줘서 고마워. 금방 줄게.'),
      workSet({ fill: ['bread'], add: { waited: 1 } })),
    ...onlyIf({ clean: '<2' },
      narr('한 손님이 끈적한 테이블을 휴지로 닦고 있었다.'),
      think('테이블을 피크 바로 전에 닦았으면 좋았을걸.', 'nervous'),
      workSet({ fill: ['clean'], add: { smiles: -1 } })),
    say('sora', 'smile', '피크 시작이에요. 같이 힘내요!'),
    block('s6'),
    block('s7'),
    shiftEnd({ day: '화요일 · 4장 1화' }),
    check(3),

    // 돌아보기
    bg('staff'), bgm('warm'),
    show({ left: 'yeonwoo:smile', right: 'manager:front' }),
    say('manager', 'front', '첫 근무판, 어땠어요?'),
    say('yeonwoo', 'normal', '자석을 붙일 때는 어려웠어요. 그런데 하고 나니까 뿌듯해요.'),
    say('manager', 'smile', '내일도 연우 씨가 짜요. 바꾸고 싶은 곳은 고치면 돼요.'),
    think('내 하루를 내가 정한다. 조금 무섭고, 많이 뿌듯하다.', 'smile'),
    enter('center', 'sora:smile'),
    say('sora', 'smile', '잠깐! 오늘의 한 장! 연우 씨, 근무판 옆에 서 봐요.'),
    photo('board'),
    finish('4장 1화 완료', '내 하루를 내가 짰어요!'),
    end(),
  ],
};
