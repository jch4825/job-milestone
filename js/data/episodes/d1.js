/**
 * DAY 1 · 월요일: 첫 출근
 * 학습: 출근 기록, 유니폼, 손 씻기 6단계, 애매한 지시에 확인 질문, 퇴근 인사
 * 성취기준: [12진로04-02] [12진로03-01] [12진로03-02] [12진로04-04] [12진로04-05]
 */

import {
  bg, bgm, amb, sfx, show, enter, say, narr, think, sys, time, place, schedule, memo,
  decide, good, bad, branch, mini, snap, photo, term, finish, end, fx, phone,
  check, meet,
} from '../../core/dsl.js';

export default {
  id: 'd1',
  act: 2,
  label: 'DAY 1 · 월요일',
  title: '첫 출근',
  when: '첫째 주 월요일 08:50',
  goal: '출근 기록을 쓰고, 손을 6단계로 씻고, 모르면 물어봐요.',
  schedule: [['clock', '출근 기록하기'], ['handwash', '손 씻기 6단계'], ['question', '모르면 물어보기']],
  skills: ['time', 'hygiene', 'ask', 'team'],
  standards: ['[12진로04-02]', '[12진로03-01]', '[12진로03-02]', '[12진로04-04]', '[12진로04-05]'],
  photo: 'minjae',
  diary: '첫 출근. 출근 기록부에 8시 52분이라고 썼다. 포스터를 보며 손을 6단계로 씻었다. 주방에서 민재 선배를 만났다. 우리 학교 선배였다. "나도 처음엔 무서웠어." 소라 선배가 "그거"라고 했을 때, 나는 "어떤 것을 어디에서요?"라고 물었다. 묻는 건 생각보다 쉬웠다.',
  script: [
    bg('cafe_front', 'morning'), bgm('morning'), amb('street'), time('08:50'),
    schedule(),
    place('월요일 08:50', '카페 마일스톤 뒷문'),
    show({ left: 'yeonwoo:normal' }),
    narr('정식 출근 첫날. 가슴에 단 명찰을 손가락으로 만졌다.'),
    narr('차가운 명찰을 만지면 마음이 조금 단단해진다.'),

    bg('staff'), amb(null), bgm('cafe'),
    show({ left: 'yeonwoo:normal', right: 'dohyun:smile' }),
    say('dohyun', 'smile', '연우 씨, 좋은 아침이에요! 시간 맞춰 잘 왔네요.'),
    say('yeonwoo', 'smile', '안녕하세요, 선배님! 오늘부터 잘 부탁드립니다.'),
    memo('월요일 메모', [['clock', '출근하면 기록부에 시간 쓰기'], ['handwash', '유니폼 입고 손 씻기 (포스터 보기)'], ['question', '모르면 꼭 물어보기']]),
    say('dohyun', 'teach', '저기 노란 메모 보이죠? 점장님이 매일 아침 써 두시는 오늘의 메모예요.'),
    say('dohyun', 'smile', '우리 가게에서는 외우려고 애쓰지 않아도 돼요. 헷갈리면 메모를 보면 되거든요.'),
    sys('화면 오른쪽 위의 노란 메모는 언제든 볼 수 있어요. 스피커 그림을 누르면 읽어 줘요.'),

    decide({
      id: 'd1_clockin', title: '출근 기록', q: '출근해서 가장 먼저 할 일은 무엇일까요?', who: 'dohyun', skill: 'time', memo: 1,
      choices: [
        good('pen', '출근 기록부에 이름과 시간을 쓴다', {
          praise: [
            sfx('pen'),
            narr('기록부에 이름을 쓰고, 벽시계를 보고 시간을 적었다. 08:52.'),
            say('dohyun', 'smile', '좋아요. 이 기록이 연우 씨가 일한 시간의 증거가 돼요.'),
            term('clock_in'),
          ],
        }),
        bad('cup', '바로 홀에 나가서 컵부터 채운다', {
          fail: [
            narr('나는 바로 홀로 나가 컵을 채우기 시작했다.'),
            time('13:30'),
            narr('퇴근할 때 보니, 출근 기록부에 내 이름이 없었다.'),
            say('manager', 'think', '연우 씨, 오늘 출근 기록이 없네요. 몇 시에 왔는지 알 수가 없어요.'),
          ],
          oops: { id: 'd1_noclockin', title: '출근 기록이 없어요', lesson: '출근 기록은 내가 일한 시간의 증거예요. 출근하면 가장 먼저 기록부에 써요.', icon: 'pen' },
        }),
      ],
    }),

    check(1),
    narr('사물함에서 빨간 앞치마를 꺼내 입었다. 거울을 보며 끈을 반듯하게 묶었다.'),
    term('uniform'),
    say('dohyun', 'teach', '이제 손을 씻을 거예요. 벽에 있는 {{손 씻기 6단계}} 포스터를 보면서 해 봐요.'),
    mini('handwash', {
      skill: 'hygiene', title: '손 씻기 6단계',
      oops: { id: 'd1_handwash', title: '세균이 남았어요', lesson: '손 씻기는 포스터 순서대로 해요. 헷갈리면 포스터를 손가락으로 짚어요.', icon: 'germ' },
    }),
    say('dohyun', 'smile', '완벽해요! 손가락 사이, 손톱 밑까지. 이제 컵을 만져도 돼요.'),
    snap('dohyun', 'smile', '깨끗해요!', '손 씻기 6단계 완료'),
    check(2),

    bg('kitchen'), amb(null),
    place('09:10', '주방'),
    show({ left: 'yeonwoo:normal', right: 'dohyun:normal' }),
    say('dohyun', 'smile', '여기는 주방이에요. 매일 아침 빵을 굽는 곳이죠.'),
    sfx('mixer'), fx('shake'),
    show({ left: 'yeonwoo:nervous', right: 'dohyun:normal' }),
    narr('갑자기 웅 하는 큰 소리가 났다. 나도 모르게 두 손으로 귀를 막았다.'),
    think('소리가 너무 커. 무서워.'),
    enter('center', 'minjae:normal'),
    say('minjae', 'normal', '…놀랐지. {{반죽기}} 소리야.'),
    narr('하얀 모자를 쓴 남자가 반죽기를 멈췄다. 목에 커다란 파란 귀덮개가 걸려 있었다.'),
    say('dohyun', 'smile', '인사해요. 빵 담당 오민재 선배예요. 여기서 5년째 일하고 있어요.'),
    say('minjae', 'normal', '…민재. 반가워.'),
    say('minjae', 'smile', '나도 소리 큰 거 싫어. 그래서 반죽기 돌릴 땐 이거 껴.'),
    branch('accommodation', {
      earplugs: [
        say('minjae', 'smile', '점장님이 그러던데. 너도 귀마개 쓴다고. 잘했어.'),
        think('나만 그런 게 아니구나.'),
      ],
      _: [
        say('minjae', 'normal', '너도 필요하면 말해. 창고 첫 번째 칸에 귀마개 있어.'),
        think('필요하면… 말해도 되는구나.'),
      ],
    }),
    term('earplugs'),
    say('minjae', 'normal', '그리고… 나도 해솔학교 나왔어. 전공과.'),
    say('yeonwoo', 'surprised', '네? 해솔학교요? 저도요!'),
    say('minjae', 'smile', '알아. 김선영 선생님 반이지? …나도 처음엔 무서웠어. 괜찮아.'),
    narr('민재 선배는 그 말만 하고 다시 반죽을 시작했다.'),
    narr('그런데 그 짧은 말이 오래 마음에 남았다.'),
    meet('minjae'),
    photo('minjae'),

    bg('counter', 'morning'), amb(null),
    place('09:25', '홀 · 계산대'),
    show({ left: 'yeonwoo:normal', right: 'sora:smile' }),
    say('sora', 'smile', '아, 신입이다! 안녕! 나는 계산대 맡은 한소라예요. 대학생이고, 그림 그리는 거 좋아해요!'),
    meet('sora'),
    say('yeonwoo', 'smile', '안녕하세요. 정연우입니다.'),
    say('sora', 'smile', '연우 씨, 미안한데 저기 그거 좀 갖다줄래요? 빨리빨리!'),
    narr('소라 선배는 손가락으로 대충 뒤쪽을 가리켰다. 뒤쪽에는 선반이 다섯 개나 있었다.'),
    think('"그거"가 뭐지? "저기"는 어디지?'),

    decide({
      id: 'd1_vague', title: '"저기 그거 좀"', q: '"저기 그거"가 무엇인지 모르겠다. 어떻게 할까?', who: 'yeonwoo', skill: 'ask', memo: 3,
      choices: [
        good('question', '"어떤 것을 어디에서 가져올까요?" 하고 묻는다', {
          praise: [
            say('yeonwoo', 'determined', '소라 선배님, "그거"가 무엇인지, 어디에 있는지 알려 주실 수 있나요?'),
            say('sora', 'surprised', '아! 미안해요. 내가 너무 대충 말했네요.'),
            say('sora', 'smile', '창고 선반 두 번째 칸에 있는 냅킨 한 묶음이요!'),
            term('clarify'),
          ],
        }),
        bad('walk', '비슷해 보이는 것을 아무거나 가져간다', {
          fail: [
            narr('나는 선반에서 하얀 상자 하나를 들고 왔다.'),
            say('sora', 'surprised', '어? 이건 냅킨이 아니라 종이컵 상자인데…'),
            narr('소라 선배가 직접 창고에 다녀왔다. 줄 선 손님들이 그동안 기다렸다.'),
          ],
          oops: { id: 'd1_guess', title: '엉뚱한 물건을 가져갔어요', lesson: '"그거", "저기"처럼 애매한 말은 다시 물어봐요. "어떤 것을 어디에서 가져올까요?"', icon: 'question' },
        }),
        bad('freeze', '못 들은 척 하던 일을 계속한다', {
          fail: [
            narr('나는 못 들은 척 컵만 만지작거렸다.'),
            say('sora', 'worried', '연우 씨…? 냅킨이 없어서 손님이 기다리고 있어요!'),
            narr('소라 선배의 목소리가 조금 커졌다. 나는 얼굴이 빨개졌다.'),
          ],
          oops: { id: 'd1_ignore', title: '손님이 기다렸어요', lesson: '모르는 말을 들었을 때 가만히 있으면 일이 멈춰요. 모르면 물어봐요.', icon: 'speech' },
        }),
      ],
    }),
    branch('accommodation', {
      pictures: [
        narr('소라 선배가 앞치마 주머니에서 펜을 꺼냈다. 작은 종이에 냅킨 그림과 선반 그림을 쓱쓱 그렸다.'),
        say('sora', 'smile', '점장님이 그림으로 알려 주면 좋다고 했지? 앞으로 내가 그려 줄게요! 나 그림 잘 그려요.'),
      ],
      slowly: [say('sora', 'smile', '그리고 점장님이 한 번에 하나씩 말해 달라고 했는데… 내가 또 빨랐네. 다음엔 천천히 말할게요.')],
      _: [say('sora', 'smile', '앞으로 내가 헷갈리게 말하면 지금처럼 물어봐 줘요. 진짜 고마워요!')],
    }),
    narr('창고 선반 두 번째 칸. 냅킨 한 묶음. 정확하게 찾아서 가져다드렸다.'),
    say('sora', 'smile', '고마워요, 연우 씨! 덕분에 살았다!'),
    check(3),

    bg('staff'), amb(null), time('13:30'),
    place('13:30', '퇴근 시간'),
    show({ left: 'yeonwoo:smile', right: 'dohyun:smile' }),
    narr('시계가 1시 30분을 가리켰다. 첫날 일이 끝났다.'),
    decide({
      id: 'd1_leave', title: '퇴근 인사', q: '퇴근할 때 어떻게 할까?', who: 'yeonwoo', skill: 'team',
      choices: [
        good('greet', '"먼저 들어가 보겠습니다. 수고하셨습니다!" 인사하고 퇴근 기록을 쓴다', {
          praise: [
            say('yeonwoo', 'smile', '먼저 들어가 보겠습니다. 수고하셨습니다!'),
            sfx('pen'),
            say('dohyun', 'smile', '수고했어요, 연우 씨! 내일 봐요.'),
            term('clock_out'),
          ],
        }),
        bad('door', '조용히 가방만 챙겨서 나간다', {
          fail: [
            narr('나는 아무 말 없이 뒷문으로 나왔다.'),
            phone('dohyun', '연우 씨, 어디 갔어요? 갑자기 안 보여서 다들 걱정했어요. 무슨 일 있어요?'),
          ],
          oops: { id: 'd1_noleave', title: '말없이 사라졌어요', lesson: '퇴근할 때는 인사하고, 퇴근 기록을 써요. 말없이 가면 동료들이 걱정해요.', icon: 'door' },
        }),
      ],
    }),
    finish('DAY 1 완료', '첫 출근, 해냈어요!'),
    end(),
  ],
};
