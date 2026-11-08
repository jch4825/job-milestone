/**
 * 엔딩: 다음 이정표
 * 이야기의 마지막 에피소드(index.js 의 FINALE, 지금은 4장 1화)를 처음 마치면 결과 화면 뒤에 이어집니다.
 * 근무표의 '엔딩' 칸에서 언제든 다시 볼 수 있습니다. 판단·도장·일기가 없는 감상 장면입니다.
 * 짜임: 퇴근 인사(크루) → 밤, 연우의 방(프롤로그 첫 장면을 되풀이: 벽의 일정표·알람시계·엄마)
 *       → 지나온 날들(사진 벽과 크레디트) → 다음 날 아침, 연우가 스스로 여는 유리문 → 연우의 마지막 메모 → 엔딩 영수증
 * 4장 2~4화가 생기면 엔딩은 저절로 마지막 화 뒤로 옮겨 갑니다. 그때 퇴근 인사(지호·도현) 대사를 맞춰 고칩니다.
 */

import {
  bg, bgm, amb, sfx, show, enter, leave, say, narr, think, phone, time, place, big, cg,
  credits, letter, finish, end,
} from '../../core/dsl.js';

export default {
  id: 'ending',
  ending: true,
  label: '엔딩',
  title: '다음 이정표',
  when: '그날 저녁',
  costume: { yeonwoo: 'interview' }, // 퇴근해 앞치마를 벗은 뒤 · 집 · 출근 전 아침: 흰 셔츠(프롤로그와 같은 옷)
  // 화면 문장(음성은 tools/export-lines.mjs 가 만듦)
  // cue: 마지막 에피소드를 처음 마친 결과 화면에서 [엔딩 보기]와 함께 읽어 줌(result.js)
  cue: '마지막 이야기까지 해냈어요. 엔딩을 볼까요?',
  // notice: 엔딩을 처음 본 뒤 알림(main.js). 근무표의 엔딩 칸에도 늘 보임(hub.js)
  notice: {
    title: '모든 이야기가 열렸어요',
    body: '근무표에서 하고 싶은 이야기를 골라요. 언제든 다시 할 수 있어요.',
  },
  script: [
    big('엔딩', '다음 이정표'),

    // 1. 퇴근 인사: 오늘을 함께한 사람들
    bg('staff'), bgm('warm'), amb(null), time('13:30'),
    place('13:30', '퇴근 시간'),
    show({ left: 'yeonwoo:smile', right: 'dohyun:smile' }),
    narr('퇴근 기록을 찍고, 앞치마를 접었다.'),
    say('dohyun', 'smile', '연우 씨, 근무판 봤어요. 하루를 혼자 다 짰네요?'),
    say('yeonwoo', 'smile', '모르는 건 점장님께 물어보면서 짰어요.'),
    say('dohyun', 'teach', '그게 제일 잘한 거예요. 처음 만난 날 생각나요?'),
    say('dohyun', 'smile', '문 앞에서 떨던 연우 씨가, 이제 하루를 혼자 짜요.'),
    think('그날은 가슴이 쿵쿵 뛰었는데.'),
    enter('center', 'jiho:smile'),
    narr('오후 근무를 하러 온 지호 씨가 꾸벅 인사했다.'),
    say('jiho', 'smile', '선배님, 근무판 저도 봤어요. 저도 언젠가 짜 보고 싶어요.'),
    say('yeonwoo', 'smile', '그럼 다음에 같이 짜 봐요. 모르면 물어봐요.'),
    show({ left: 'yeonwoo:smile', center: 'manager:smile', right: 'dohyun:smile' }),
    say('manager', 'smile', '연우 씨, 오늘도 수고했어요. 내일 근무판도 기대할게요.'),
    say('yeonwoo', 'determined', '먼저 들어가 보겠습니다. 수고하셨습니다!'),
    cg('wall'),
    narr('민재 선배는 주방 창문 너머로 손을 흔들었다. 소라 씨는 카메라를 들어 보였다.'),
    narr('벽에는 오늘의 한 장이 또 한 장 늘어 있었다.'),
    cg(null),

    // 2. 밤, 연우의 방: 면접 전날 밤과 같은 자리
    bg('home', 'night'), bgm('home'), amb('home'), time('21:30'),
    place('21:30', '연우의 방'),
    show({ left: 'yeonwoo:normal' }),
    narr('밤 9시 30분. 면접 전날 밤에도 이 책상 앞에 앉아 있었다.'),
    narr('벽에는 선생님과 같이 만든 일정표가 아직 붙어 있다.'),
    think('7시 알람, 8시 20분 버스, 8시 50분 도착.'),
    narr('나는 새 종이를 꺼냈다. 내일 일정표는 내가 쓴다.'),
    sfx('pen'),
    narr('출근, 손 씻기, 컵 채우기, 쉬는 시간. 하나씩 적었다.'),
    phone('teacher', '연우야, 근무판을 혼자 짰다고 들었어. 선생님은 연우가 정말 자랑스러워.'),
    narr('나는 답장을 썼다.'),
    say('yeonwoo', 'smile', '"선생님, 세 가지 약속 다 써 봤어요. 고맙습니다!"'),
    think('모르면 물어보기. 실수하면 말하기. 힘들면 쉬겠다고 말하기.'),
    narr('학교에서 배운 약속을, 일터에서 하나씩 해 보았다.'),
    enter('right', 'mom:smile'),
    say('mom', 'smile', '연우야, 아직 안 자? 내일 일찍 일어나야지.'),
    say('yeonwoo', 'smile', '내일 일정표 쓰고 있어요. 이번에는 혼자 썼어요.'),
    narr('엄마가 일정표를 한참 들여다보았다.'),
    say('mom', 'smile', '…엄마는 이제 걱정 대신 응원할게.'),
    say('yeonwoo', 'smile', '고마워, 엄마. 모르면 꼭 물어볼게.'),
    leave('mom'),
    narr('일정표 맨 아래에 한 줄을 더 적었다.'),
    think('언젠가, 내가 만든 빵을 진열대에 놓기.'),
    narr('아직은 먼 이정표다. 그래도 하나씩 가면 된다.'),
    narr('알람을 7시에 맞췄다. 그리고 불을 껐다.'),

    // 3. 지나온 날들: 사진 벽(제목을 한 장씩 읽어 줌)과 크레디트
    bg('black'), show({}), amb(null), bgm('ending'),
    narr('눈을 감자, 지나온 날들이 한 장씩 떠올랐다.'),
    credits(),

    // 4. 다음 날 아침: 이번에는 연우가 스스로 문을 엶(프롤로그에서는 도현이 열어 주었음)
    bg('cafe_front', 'morning'), amb('street'), time('08:55'),
    place('08:55', '다음 날 아침'),
    show({ left: 'yeonwoo:smile' }),
    narr('다음 날 아침. 빨간 차양 아래 유리문 앞에 섰다.'),
    narr('가슴이 조금 뛴다. 그래도 이제 무섭지 않다.'),
    think('오늘 근무판도 내가 짠다.'),
    sfx('door'),
    narr('나는 유리문을 열었다.'),
    say('yeonwoo', 'determined', '안녕하세요! 오늘도 잘 부탁드립니다!'),

    // 5. 연우의 마지막 메모(플레이어에게) → 엔딩 영수증('완결' 대신 '엔딩': 4장 2~4화가 더 들어올 예정, 2026-10-14 사용자 결정)
    letter({
      to: '{player} 님에게',
      lines: ['모르면 물어봐요. 물어봐도 괜찮아요.', '실수하면 바로 말해요. 같이 해결해요.', '힘들면 쉬겠다고 말해요.'],
      ps: '함께해 줘서 고마워요. 우리는 같이 일하니까요!',
      from: '연우',
    }),
    finish('직업 마1스톤 엔딩', '끝까지 함께해 줘서 고마워요!'),
    end(),
  ],
};
