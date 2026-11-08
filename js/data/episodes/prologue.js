/**
 * 프롤로그: 첫 출근길
 * 학습: 시간 관리(알람), 대중교통 이용(버스 번호 끝까지 읽기), 긴장 다스리기
 * 튜토리얼: 프롤로그는 조작을 처음 배우는 곳입니다. guide() 안내는 그 버튼을 아직 안 배운 학생에게만 나오고,
 *   안내하는 동안 그 버튼에 무지개 테두리 + 손가락이 붙습니다(js/ui/tutor.js). 정답을 알려 주는 안내는 판단 뒤에만 둡니다.
 * 성취기준: [12진로04-02] [12진로04-03] [12진로01-02]
 */

import {
  bg, bgm, amb, sfx, show, enter, leave, say, narr, think, sys, phone, time, place, schedule,
  decide, good, bad, choose, opt, branch, breathe, photo, term, finish, end, fx, motion,
  check, meet, cg, memo, guide,
} from '../../core/dsl.js';

export default {
  id: 'prologue',
  act: 1,
  label: '프롤로그',
  title: '첫 출근길',
  when: '면접 전날 밤 → 금요일 아침',
  goal: '시간에 맞춰 준비하고, 혼자 버스를 타요.',
  schedule: [['bag', '내일 준비물 챙기기'], ['bus', '혼자 버스 타기'], ['clock', '8시 50분에 도착하기']],
  skills: ['time', 'calm'],
  standards: ['[12진로04-02]', '[12진로04-03]', '[12진로01-02]'],
  costume: { yeonwoo: 'interview' }, // 면접 복장 스탠딩(yeonwoo-interview_*)이 있으면 사용. 앞치마는 1장 끝에 받음
  photo: 'note',
  diary: '오늘 처음으로 혼자 버스를 탔다. 버스 번호를 끝까지 읽었다. 가방 속에서 엄마의 쪽지를 찾았다. "모르면 물어보면 돼." 그 말을 주머니에 넣고 카페 문 앞에 섰다.',
  script: [
    bg('home', 'night'), bgm('home'), amb('home'), time('21:30'),
    schedule(),
    place('목요일 21:30', '연우의 방'),
    guide('next', '이야기는 화면을 톡 누르면 넘어가요. 스페이스 키를 눌러도 돼요.'),
    narr('내일은 면접 날이다.'),
    narr('나는 책상 위에 준비물을 하나씩 놓았다.'),
    show({ left: 'yeonwoo:normal' }),
    guide('term', '밑줄 친 말은 눌러 볼 수 있어요. 뜻을 쉽게 알려 줘요.', 1),
    think('{{이력서}}, 신분증, {{교통카드}}, 손수건. 하나, 둘, 셋, 넷.'),
    meet('yeonwoo'),
    narr('벽에는 선생님과 같이 만든 일정표가 붙어 있다. 7시 알람, 8시 20분 버스, 8시 50분 도착.'),
    memo('선생님과 만든 일정표', [['alarm', '7시 알람'], ['bus', '8시 20분 해솔07 버스'], ['clock', '8시 50분 카페 도착']]),
    guide('hud-memo', '할 일은 노란 메모에 적어 둬요. **메모** 버튼으로 접고 펼 수 있어요.'),
    sfx('door'),
    enter('right', 'mom:smile'),
    say('mom', 'smile', '연우야, 아직 안 자? 내일 일찍 일어나야지.'),
    meet('mom'),
    say('yeonwoo', 'normal', '준비물 확인하고 있었어요. 다 챙겼어요.'),
    say('mom', 'worried', '내일 엄마가 차로 데려다줄게. 버스는 복잡하잖아.'),
    narr('엄마 목소리가 조금 떨렸다. 엄마는 늘 나를 걱정한다.'),
    guide('card', '내가 고를 때는 카드가 나와요. 마음에 드는 카드를 눌러요.'),

    choose({
      id: 'pro_ride', title: '엄마에게 하는 대답', q: '엄마에게 뭐라고 대답할까?', who: 'yeonwoo', flag: 'rideChoice',
      options: [
        opt('bus', '"혼자 가 볼게요. 선생님이랑 연습했어요."', 'alone', {
          then: [
            say('yeonwoo', 'determined', '혼자 가 볼게요. 선생님이랑 버스 타는 거 연습했어요.'),
            say('mom', 'sad', '…그래. 연습했지.'),
            say('mom', 'smile', '그럼 버스 타면 꼭 문자 해 줘.'),
          ],
        }),
        opt('hand', '"정류장까지만 같이 가 주세요. 버스는 혼자 탈게요."', 'half', {
          then: [
            say('yeonwoo', 'normal', '정류장까지만 같이 가 주세요. 버스는 혼자 탈게요.'),
            say('mom', 'smile', '좋아. 정류장까지만 같이 가자.'),
            narr('필요한 만큼만 도움을 받는 것. 그것도 선생님과 연습한 것이다.'),
          ],
        }),
      ],
    }),

    leave('mom'),
    narr('엄마가 나가고, 나는 알람시계를 들었다.'),
    decide({
      id: 'pro_alarm', title: '알람 맞추기', q: '내일 9시 면접. 알람을 몇 시에 맞출까?', who: 'yeonwoo', skill: 'time', memo: 1,
      help: '준비하는 시간과 버스 타는 시간을 더해 봐요. 벽의 일정표에 답이 있어요.',
      choices: [
        good('alarm', '7시 (준비 1시간 + 버스 30분 + 여유)', {
          praise: [think('7시에 일어나면 씻고, 옷 입고, 8시 20분 버스를 탈 수 있어. 일정표랑 똑같아.')],
        }),
        bad('alarm', '8시 40분 (조금 더 자고 싶어)', {
          fail: [
            bg('home', 'morning'), sfx('alarm'), time('08:40'),
            narr('알람이 울렸다. 시계는 8시 40분.'),
            think('면접은 9시인데! 버스만 30분이 걸려.'),
            fx('shake'),
            narr('나는 허둥지둥 옷을 입었지만, 면접 시간에 늦고 말았다.'),
          ],
          oops: { id: 'pro_alarm_late', title: '면접에 늦었어요', lesson: '준비하는 시간과 가는 시간을 더해서 알람을 맞춰요. 처음 가는 곳은 더 일찍!', icon: 'alarm' },
        }),
        bad('phone', '알람 없이 엄마가 깨워 주기를 기다린다', {
          fail: [
            bg('home', 'morning'), time('08:55'),
            narr('아침에 엄마는 일찍 일하러 나갔다. 아무도 나를 깨우지 않았다.'),
            think('8시 55분…? 지금 일어나면 늦어.'),
          ],
          oops: { id: 'pro_noalarm', title: '아무도 깨워 주지 않았어요', lesson: '출근 시간은 내가 지키는 약속이에요. 알람은 스스로 맞춰요.', icon: 'clock' },
        }),
      ],
    }),

    narr('알람을 7시에 맞췄다. 그리고 불을 껐다.'),
    check(1),
    guide('hud-rewind', '판단 장면을 지나면 **되감기**로 돌아갈 수 있어요. 다른 카드도 골라 볼 수 있어요.'),
    bg('home', 'morning'), bgm('morning'), amb(null), time('07:00'),
    sfx('alarm'),
    place('금요일 07:00', '면접 날 아침'),
    show({ left: 'yeonwoo:normal' }),
    narr('알람이 울렸다. 창문으로 햇빛이 들어왔다.'),
    narr('세수를 하고, 흰 셔츠를 입었다. 단추를 하나씩 잠갔다.'),
    think('한 번, 두 번, 세 번. 다 잠겼다.'),
    guide('hud-settings', '글자 크기나 소리는 **설정**에서 바꿀 수 있어요.'),
    branch('rideChoice', {
      half: [enter('right', 'mom:smile'), say('mom', 'smile', '준비 다 됐어? 정류장까지 같이 걷자.')],
      _: [phone('mom', '연우야, 엄마는 먼저 일하러 가. 버스 타면 문자 줘. 할 수 있어!')],
    }),

    bg('bus_stop', 'morning'), amb('street'), time('08:15'),
    place('08:15', '해솔시장 앞 정류장'),
    branch('rideChoice', {
      half: [
        show({ left: 'yeonwoo:normal', right: 'mom:smile' }),
        say('mom', 'smile', '여기까지! 엄마는 이제 갈게. 이따 문자 해.'),
        leave('mom'),
        narr('엄마는 몇 번이나 뒤를 돌아보며 손을 흔들었다.'),
      ],
      _: [],
    }),
    show({ left: 'yeonwoo:nervous' }),
    guide('dlg-replay', '말을 한 번 더 듣고 싶으면 **다시 듣기**를 눌러요.'),
    narr('정류장 전광판에 주황색 글자가 지나갔다.'),
    narr('해솔07, 3분 후. 해솔17, 곧 도착.'),
    sfx('bus'),
    narr('버스 한 대가 먼저 들어왔다. 앞 유리에 큰 숫자가 보였다. "해솔1…"'),

    decide({
      id: 'pro_bus', title: '어떤 버스를 탈까?', q: '버스가 왔다. 어떻게 할까?', who: 'yeonwoo', skill: 'time',
      help: '버스 번호는 끝까지 읽어요. 연우가 탈 버스는 해솔07이에요.',
      choices: [
        good('bus', '번호를 끝까지 읽는다. "해솔17"이다. 내 버스가 아니다.', {
          praise: [
            think('해솔17. 내가 탈 버스는 해솔07이야. 끝까지 읽길 잘했다.'),
            narr('3분 뒤, 해솔07이 들어왔다.'),
          ],
        }),
        bad('run', '"1"이 보이니까 일단 탄다', {
          fail: [
            sfx('card_beep'),
            narr('버스에 올라 교통카드를 찍었다.'),
            narr('그런데 창밖 풍경이 연습한 길과 달랐다.'),
            think('여기가 어디지? 시장도, 큰 은행나무도 안 보여.'),
            fx('shake'),
            narr('나는 다른 방향으로 가는 해솔17을 탄 것이다.'),
          ],
          oops: { id: 'pro_wrongbus', title: '다른 버스를 탔어요', lesson: '버스 번호는 끝까지 읽어요. 헷갈리면 기사님께 "마일스톤 카페 앞 가요?" 하고 물어봐요.', icon: 'bus' },
        }),
        bad('freeze', '어떤 버스인지 몰라서 다 그냥 보낸다', {
          fail: [
            time('08:50'),
            narr('버스가 세 대나 지나갔다.'),
            think('8시 50분…. 이제 타도 늦어.'),
            narr('나는 정류장 의자에 앉아 손만 꼭 쥐고 있었다.'),
          ],
          oops: { id: 'pro_missbus', title: '버스를 계속 놓쳤어요', lesson: '모르면 물어봐요. 옆 사람이나 기사님께 "해솔07 맞아요?" 하고 물으면 돼요.', icon: 'question' },
        }),
      ],
    }),

    sfx('bus'),
    narr('해솔07에 탔다.'),
    sfx('card_beep'),
    narr('삑. 교통카드를 찍었다.'),
    term('transit_card'),
    guide('hud-notebook', '새로 배운 말과 도장은 **수첩**에 모여요.'),
    narr('창가 자리에 앉았다. 네 정거장. 손가락으로 하나씩 세었다.'),
    narr('두 번째 정거장을 지날 때, 가방 앞주머니에서 바스락 소리가 났다.'),
    bgm(null), sfx('heart'),
    narr('작은 노란 쪽지가 들어 있었다. 엄마 글씨였다.'),
    photo('note'),
    think('모르면 물어보면 돼.'),
    narr('나는 쪽지를 주머니에 넣었다. 손끝이 조금 따뜻해졌다.'),
    check(2),
    guide('dlg-backlog', '지나간 말은 **지난 대화**에서 다시 볼 수 있어요.'),
    bgm('morning'),

    bg('cafe_front', 'morning'), amb('street'), time('08:50'),
    place('08:50', '카페 마일스톤 앞'),
    show({ left: 'yeonwoo:nervous' }),
    narr('빨간 차양 아래 유리문. 안에서 빵 굽는 냄새가 났다.'),
    narr('면접 10분 전. 가슴이 쿵쿵 뛰었다.'),

    decide({
      id: 'pro_door', title: '카페 문 앞에서', q: '가슴이 너무 뛴다. 지금 어떻게 할까?', who: 'yeonwoo', skill: 'calm',
      help: '긴장되면 할 수 있는 방법이 있어요. 연우는 셋까지 세면 마음이 편해져요.',
      choices: [
        good('breathe', '숨을 세 번 천천히 쉰다', {
          praise: [breathe(3, '하나, 둘, 셋. 연습한 대로 천천히.'), think('괜찮아. 연습한 대로 하면 돼.')],
        }),
        good('note', '엄마의 쪽지를 다시 읽는다', {
          praise: [narr('"모르면 물어보면 돼." 쪽지 글씨를 손가락으로 따라 읽었다.'), think('괜찮아. 모르면 물어보면 돼.')],
        }),
        bad('run', '너무 떨려서 집으로 돌아간다', {
          fail: [
            bg('bus_stop', 'morning'),
            narr('나는 반대쪽 정류장으로 걸어갔다.'),
            phone('teacher', '연우야, 면접은 잘 갔니? 점장님이 연우를 기다리고 계신대.'),
            think('…연습했는데. 문 앞까지 왔었는데.'),
          ],
          oops: { id: 'pro_goback', title: '면접을 보지 못했어요', lesson: '떨리는 건 당연해요. 돌아가기 전에 숨을 세 번 쉬어 봐요. 마음이 조금 가라앉아요.', icon: 'breathe' },
        }),
      ],
    }),

    guide('hud-breathe', '떨릴 때는 언제든 **숨 고르기**를 눌러 같이 숨을 쉬어요.'),
    motion('yeonwoo', 'breathe'),
    sfx('door'),
    narr('그때, 유리문이 달칵 열렸다.'),
    cg('door'),
    enter('right', 'dohyun:smile'),
    say('dohyun', 'smile', '안녕하세요! 혹시 9시에 면접 보러 온 정연우 씨 맞죠?'),
    check(3),
    sys('면접이 시작돼요. 대답하는 방법은 세 가지 중에서 고를 수 있어요.'),
    guide('hud-pause', '쉬고 싶을 때는 **멈춤**을 눌러요. 저장하기와 불러오기도 거기 있어요.'),
    finish('프롤로그 완료', '혼자서 출근길을 해냈어요!'),
    end(),
  ],
};
