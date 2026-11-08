/**
 * 1장: 첫 관문 (면접과 계약)
 * 학습: 노크·입장 예절, 강점 말하기, 실수 보고 태도, 필요한 도움 말하기(자기옹호), 질문하기, 근로계약서 읽기
 * 성취기준: [12진로06-02] [12진로01-03] [12진로04-01] [12진로04-05]
 */

import {
  bg, bgm, amb, sfx, show, enter, say, narr, think, sys, phone, time, place, schedule, memo,
  decide, good, bad, choose, opt, branch, ask, ivStart, ivEnd, doc, docRead, docSeal, docClose, photo, term,
  finish, end, face, motion,
  check, meet,
} from '../../core/dsl.js';

// 면접 3번에서 필요한 도움을 알맞게 말했을 때만 이어지는 장면
const HELP_THANKS = [
  bgm('warm'),
  say('manager', 'smile', '말해줘서 고마워요. 그건 연우 씨가 일을 잘하게 돕는 방법이에요.'),
  term('accommodation'),
  think('…말해도 되는 거였구나.'),
  bgm('interview'),
];

export default {
  id: 'ch1',
  act: 1,
  label: '1장',
  title: '첫 관문: 면접과 계약',
  when: '금요일 08:52',
  goal: '솔직하게 대답하고, 계약서를 읽고 도장을 찍어요.',
  schedule: [['speech', '면접 보기'], ['contract', '계약서 같이 읽기'], ['stamp', '도장 찍기']],
  skills: ['team', 'report', 'help', 'ask', 'rights'],
  standards: ['[12진로06-02]', '[12진로01-03]', '[12진로04-01]', '[12진로04-05]'],
  costume: { yeonwoo: 'interview' }, // 면접 복장 스탠딩(yeonwoo-interview_*)이 있으면 사용. 앞치마는 1장 끝에 받음
  photo: 'contract',
  diary: '면접을 봤다. 실수하면 숨기지 않고 말하겠다고 했다. 나에게 필요한 도움도 말했다. 점장님이 "말해줘서 고마워요"라고 했다. 근로계약서를 한 줄씩 읽고, 내 이름 옆에 도장을 찍었다. 다음 주 월요일 9시, 나는 카페 마일스톤의 신입 크루다.',
  script: [
    bg('cafe_front', 'morning'), bgm('morning'), amb('street'), time('08:52'),
    schedule(),
    show({ left: 'yeonwoo:nervous', right: 'dohyun:smile' }),
    say('dohyun', 'smile', '저는 여기서 일하는 바리스타 강도현이에요. 많이 긴장했죠?'),
    meet('dohyun'),
    say('yeonwoo', 'nervous', '네… 조금요.'),
    say('dohyun', 'smile', '어깨에 힘을 조금 빼도 괜찮아요. 우리 점장님, 무뚝뚝해 보여도 친절한 분이에요.'),
    say('dohyun', 'teach', '들어가기 전에 하나 해 볼까요? 연우 씨는 긴장될 때 어떻게 해요?'),
    choose({
      id: 'ch1_calm', title: '긴장될 때 나는', q: '긴장될 때 나는…', who: 'yeonwoo', flag: 'calmStyle',
      options: [
        opt('breathe', '숨을 천천히 세 번 쉬어요', 'breath', {
          then: [motion('yeonwoo', 'breathe'), say('dohyun', 'smile', '좋아요. 대답이 바로 안 떠오르면, 숨 한 번 쉬고 말해도 돼요.')],
        }),
        opt('mirror', '옷과 단추를 바르게 정리해요', 'tidy', {
          then: [say('dohyun', 'smile', '오, 옷차림이 정말 단정하네요. 깨끗한 옷차림은 좋은 첫인사예요.')],
        }),
      ],
    }),
    say('dohyun', 'smile', '점장실은 저 안쪽 끝이에요. 파이팅!'),

    bg('office'), bgm('interview'), amb(null),
    show({ left: 'yeonwoo:nervous' }),
    place('08:58', '점장실 앞'),
    narr('문이 닫혀 있다. 안에서 종이 넘기는 소리가 났다.'),
    decide({
      id: 'ch1_knock', title: '점장실 문 앞', q: '문이 닫혀 있다. 어떻게 들어갈까?', who: 'yeonwoo', skill: 'team',
      help: '닫힌 문 앞에서는 먼저 내가 왔다고 알려요. 어떻게 알리면 좋을까요?',
      choices: [
        good('knock', '노크하고 "들어가도 될까요?" 하고 기다린다', {
          praise: [sfx('knock'), say('yeonwoo', 'normal', '면접 보러 온 정연우입니다. 들어가도 될까요?'), say('manager', 'normal', '네, 들어오세요.')],
        }),
        bad('door', '노크 없이 문을 연다', {
          fail: [
            sfx('door'), enter('right', 'manager:strict'),
            say('manager', 'strict', '네, 그 서류는 오후에… 잠깐만요.'),
            narr('점장님은 전화를 하고 계셨다. 나를 보고 눈썹을 찌푸렸다.'),
            say('manager', 'strict', '…밖에서 잠깐 기다려 줄래요?'),
          ],
          oops: { id: 'ch1_noknock', title: '통화 중에 문을 열었어요', lesson: '닫힌 문은 노크하고, "들어가도 될까요?" 하고 기다려요.', icon: 'knock' },
        }),
        bad('clock', '누가 열어 줄 때까지 문 앞에서 기다리기만 한다', {
          fail: [
            sfx('tick_fast'), time('09:10'),
            narr('시간이 흘렀다. 아무도 문을 열지 않았다.'),
            narr('안에서 점장님 목소리가 들렸다. "연우 씨가 아직 안 왔나?"'),
          ],
          oops: { id: 'ch1_wait', title: '면접 시간이 지났어요', lesson: '기다리기만 하면 내가 온 걸 아무도 몰라요. 노크해서 왔다고 알려요.', icon: 'clock' },
        }),
      ],
    }),

    time('09:00'),
    show({ left: 'yeonwoo:normal', right: 'manager:front' }),
    narr('책상 위에 내 이력서가 놓여 있었다. 점장님 조끼 주머니에서 금색 시곗줄이 반짝였다.'),
    say('manager', 'front', '연우 씨, 어서 와요. 여기 편하게 앉아요.'),
    meet('manager'),
    narr('나는 의자에 바르게 앉았다. 두 손을 무릎 위에 올렸다.'),
    say('manager', 'normal', '어려운 질문은 안 할 거예요. 아는 대로, 솔직하게 말해 주면 돼요.'),
    sys('질문은 4개예요. 3개를 알맞게 대답하면 합격이에요. [다시 말해 주세요] 버튼도 쓸 수 있어요.'),
    ivStart({ id: 'ch1_iv', pass: 3 }),

    ask({
      id: 'ch1_q1', title: '면접 1: 잘하는 일',
      q: '첫 번째 질문이에요. 연우 씨는 우리 카페에서 어떤 일을 잘할 수 있어요?',
      simple: '연우 씨가 잘하는 일은 뭐예요?',
      chips: [
        { label: '정리와 청소를 꼼꼼하게 잘합니다.', cat: 'tidy' },
        { label: '잘하는 건 없어요.', cat: 'nothing' },
        { label: '사람 이름과 주문을 잘 기억합니다.', cat: 'memory' },
        { label: '아직 잘 모르겠지만, 배우면서 열심히 하겠습니다.', cat: 'learn' },
      ],
      cats: {
        nothing: {
          kw: ['잘하는 건 없', '잘하는 게 없', '잘하는 것이 없', '아무것도 못'], ok: false, label: '잘하는 일 없음', face: 'think',
          reply: '음… 그렇군요. 작은 것이라도 괜찮은데요.',
          oops: { id: 'ch1_q1_none', title: '잘하는 일을 말하지 못했어요', lesson: '작은 것도 강점이에요. "정리를 꼼꼼하게 해요"처럼 내가 잘하는 일을 하나 말해요.', icon: 'star' },
        },
        tidy: { kw: ['정리', '청소', '닦', '깨끗', '꼼꼼'], label: '정리와 청소', reply: '꼼꼼하게 정리하는 사람은 우리 가게에 꼭 필요해요. 컵 보관대를 맡겨도 되겠네요.' },
        time: { kw: ['시간', '약속', '늦지', '일찍'], label: '시간 약속', reply: '시간 약속을 지키는 건 손님과의 약속을 지키는 거예요. 아주 좋아요.' },
        memory: { kw: ['기억', '이름', '주문', '외우'], label: '기억력', reply: '손님 이름을 기억해 주면 손님이 정말 기뻐해요. 멋진 강점이에요.' },
        learn: { kw: ['배우', '열심', '모르', '노력'], label: '배우려는 마음', reply: '모르는 걸 인정하고 배우겠다는 마음, 그게 제일 중요해요.' },
        _: { label: '자기 강점', reply: '자기가 잘하는 걸 말할 수 있다는 건 좋은 거예요. 고마워요.' },
      },
    }),

    ask({
      id: 'ch1_q2', title: '면접 2: 컵을 깨뜨리면', skill: 'report',
      q: '두 번째 질문이에요. 일하다가 유리컵을 깨뜨리면, 어떻게 할 거예요?',
      simple: '컵을 깨뜨렸어요. 그다음에 무엇을 할 거예요?',
      chips: [
        { label: '"제가 컵을 깨뜨렸습니다"라고 바로 말씀드리겠습니다.', cat: 'report' },
        { label: '혼나지 않게, 아무도 모르게 제가 몰래 치우겠습니다.', cat: 'hide' },
        { label: '다치지 않게 멈추고, 선배님께 치우는 방법을 여쭤보겠습니다.', cat: 'safety' },
        { label: '바쁘면 그냥 두고, 하던 일을 계속하겠습니다.', cat: 'ignore' },
      ],
      cats: {
        hide: {
          kw: ['몰래', '숨기', '숨겨', '모르게', '모른 척', '버리'], ok: false, label: '숨기기', face: 'think',
          reply: '…아무도 모르게 치운다고요. 알겠어요.',
          oops: { id: 'ch1_hide', title: '실수를 숨기겠다고 했어요', lesson: '실수를 숨기겠다고 하면 믿고 함께 일하기 어려워요. "바로 말하겠습니다"라고 솔직하게 대답해요.', icon: 'speech' },
        },
        ignore: {
          kw: ['그냥 두', '계속하', '계속 일', '나중에 치우'], ok: false, label: '그냥 두기', face: 'think',
          reply: '그냥 두면… 다른 사람이 밟을 수도 있겠네요.',
          oops: { id: 'ch1_q2_ignore', title: '깨진 컵을 그냥 두겠다고 했어요', lesson: '깨진 유리는 다른 사람을 다치게 해요. 하던 일을 멈추고 바로 알려요.', icon: 'caution' },
        },
        report: { kw: ['말씀', '말하', '보고', '알리', '알려'], label: '바로 보고', reply: '바로 말해 주면, 아무도 다치지 않게 같이 치울 수 있어요. 백 점짜리 대답이에요.' },
        safety: { kw: ['다치', '조심', '여쭤', '물어', '선배', '도와'], label: '안전하게 묻기', reply: '먼저 다치지 않게 멈추고 묻는 것, 아주 안전한 방법이에요.' },
        _: { follow: '좋아요. 그럼 컵이 깨지면, 누구에게 먼저 말할 거예요?', label: '더 묻기', reply: '말해 줘서 고마워요.' },
      },
    }),

    ask({
      id: 'ch1_q3', title: '면접 3: 필요한 도움', skill: 'help', flag: 'accommodation',
      q: '세 번째 질문이에요. 연우 씨가 일할 때, 도움이 필요한 것이 있으면 말해 줄래요?',
      simple: '일할 때 무엇을 도와주면 좋을까요?',
      chips: [
        { label: '큰 소리가 나면 깜짝 놀라요. 귀마개를 써도 될까요?', cat: 'earplugs' },
        { label: '일의 순서를 그림이나 글로 보여 주시면 잘할 수 있어요.', cat: 'pictures' },
        { label: '힘든 일은 하고 싶지 않아요.', cat: 'refuse' },
        { label: '한 번에 하나씩, 천천히 말씀해 주세요.', cat: 'slowly' },
        { label: '지금은 잘 모르겠어요. 일하면서 말씀드려도 될까요?', cat: 'later' },
      ],
      cats: {
        refuse: {
          kw: ['안 할', '하기 싫', '안 하고 싶', '하고 싶지 않'], ok: false, label: '일 거절', face: 'think',
          reply: '힘든 일이요? 어떤 일이 힘든지 말해 주면, 도울 방법을 같이 찾을 수 있는데요.',
          oops: { id: 'ch1_q3_refuse', title: '힘든 일은 안 하겠다고 했어요', lesson: '어려운 일은 피하지 말고, "이렇게 도와주시면 할 수 있어요"처럼 필요한 도움을 말해요.', icon: 'hand' },
        },
        earplugs: { kw: ['귀마개', '소리', '시끄', '귀'], value: 'earplugs', label: '귀마개 요청', face: 'front', reply: '그럼요. 여기 새 귀마개 하나 줄게요. 필요할 때 언제든 써요.', then: HELP_THANKS },
        pictures: { kw: ['그림', '순서', '글로', '적어', '메모'], value: 'pictures', label: '그림 순서표 요청', face: 'front', reply: '좋아요. 우리 가게는 원래 메모를 많이 붙여요. 그림도 더 붙여 줄게요.', then: HELP_THANKS },
        slowly: { kw: ['천천히', '하나씩', '한 번에', '다시'], value: 'slowly', label: '천천히 말하기 요청', face: 'front', reply: '알겠어요. 직원들에게도 한 번에 하나씩 말하자고 할게요.', then: HELP_THANKS },
        later: { kw: ['모르', '나중', '일하면서'], value: 'later', label: '나중에 말하기', face: 'front', reply: '좋아요. 일하다가 필요한 게 생기면 그때 바로 말해 줘요.', then: HELP_THANKS },
        _: { value: 'later', label: '필요한 도움', face: 'front', reply: '말해 줘서 고마워요. 필요한 게 생기면 언제든 말해 줘요.', then: HELP_THANKS },
      },
    }),

    ask({
      id: 'ch1_q4', title: '면접 4: 궁금한 것', skill: 'ask', flag: 'askedQuestion',
      q: '마지막으로, 연우 씨가 궁금한 것 있어요?',
      simple: '저한테 묻고 싶은 것 있어요?',
      chips: [
        { label: '쉬는 시간은 언제예요?', cat: 'break' },
        { label: '점장님은 결혼하셨어요?', cat: 'personal' },
        { label: '첫날에는 몇 시까지 오면 돼요?', cat: 'firstday' },
        { label: '없습니다.', cat: 'none' },
      ],
      cats: {
        personal: {
          kw: ['결혼', '몇 살', '나이', '애인', '여자 친구', '남자 친구'], ok: false, label: '개인적인 질문', face: 'think',
          reply: '하하, 그건 일과 상관없는 질문이네요.',
          oops: { id: 'ch1_q4_personal', title: '일과 상관없는 질문을 했어요', lesson: '면접에서는 쉬는 시간·옷·첫날처럼 일에 대해 물어요. 나이나 결혼 같은 개인적인 것은 묻지 않아요.', icon: 'question' },
        },
        break: { kw: ['쉬', '휴게'], value: true, label: '쉬는 시간 질문', reply: '좋은 질문이에요. 11시부터 11시 30분까지, 30분 쉬어요. 계약서에도 적혀 있어요.' },
        uniform: { kw: ['옷', '유니폼', '갈아'], value: true, label: '유니폼 질문', reply: '직원 공간에 사물함이 있어요. 첫날 도현 씨가 알려 줄 거예요.' },
        firstday: { kw: ['첫날', '몇 시', '출근'], value: true, label: '첫 출근 질문', reply: '다음 주 월요일, 9시에 시작해요. 옷 갈아입을 시간이 있으니 8시 50분쯤 오면 좋아요.' },
        none: { kw: ['없', '괜찮'], value: false, label: '질문 없음', face: 'front', reply: '괜찮아요. 그런데 면접에서 질문하는 건 좋은 거예요. 궁금한 게 생기면 언제든 물어봐요.' },
        _: { value: true, label: '질문하기', reply: '좋은 질문이에요. 첫 출근 날, 도현 씨가 자세히 알려 줄 거예요.' },
      },
    }),

    // 알맞은 대답이 3개보다 적으면: 탈락 장면 → 면접 돌아보기 → 면접 처음으로 되감기
    ivEnd({
      fail: [
        say('manager', 'normal', '오늘 와 줘서 고마워요. 결과는 내일 문자로 알려 줄게요.'),
        bg('home', 'morning'), bgm('home'), amb(null), time('10:00'),
        show({ center: 'yeonwoo:nervous' }),
        narr('다음 날 아침, 휴대폰이 울렸다.'),
        phone('manager', '연우 씨, 면접에 와 줘서 고마워요. 이번에는 함께 일하기 어렵게 되었어요. 다음에 또 만나요.'),
        face('yeonwoo', 'sad'),
        think('…떨어졌다. 어떤 대답이 아쉬웠을까?'),
      ],
    }),

    say('manager', 'smile', '면접 끝났어요. 연우 씨는 합격이에요!'),
    bgm('warm'), sfx('heart'), face('yeonwoo', 'smile'), motion('yeonwoo', 'jump'),
    narr('합격. 그 말이 귀에 오래 남았다.'),
    check(1),
    say('manager', 'front', '이제 {{근로계약서}}를 같이 읽어 볼까요? 일하는 시간과 돈을 내 눈으로 확인하는 건 아주 중요해요.'),
    bgm('interview'),
    memo('계약서 읽는 법', [['volume', '한 줄씩 소리 내어 읽기'], ['question', '모르는 말은 묻기'], ['stamp', '다 이해하면 도장 찍기']]),
    doc('contract'),
    docRead(),
    say('manager', 'normal', '좋아요. 이해했는지 세 가지만 확인할게요. 종이를 보면서 대답해도 돼요.'),

    decide({
      id: 'ch1_c1', title: '계약서: 시작 시간', q: '일은 몇 시에 시작해요?', who: 'manager', mentor: 'manager', helper: 'manager', skill: 'rights', memo: 'doc:4',
      choices: [
        good('clock', '아침 9시', { praise: '맞아요. 9시에 일을 시작하니까, 조금 일찍 와서 옷을 갈아입어요.' }),
        bad('clock', '낮 12시', {
          fail: [time('12:00'), narr('월요일, 나는 낮 12시에 카페에 도착했다.'), say('dohyun', 'teach', '연우 씨…? 오늘 9시부터였어요. 오전 내내 기다렸어요.')],
          oops: { id: 'ch1_c1_noon', title: '첫 출근에 늦었어요', lesson: '계약서의 일하는 시간을 꼭 확인해요. 연우는 9시에 시작해요.', icon: 'clock' },
        }),
        bad('clock', '오후 1시 30분', {
          fail: [narr('오후 1시 30분에 카페에 도착했다.'), narr('문 앞에 "오전 근무 끝" 메모가 붙어 있었다.')],
          oops: { id: 'ch1_c1_end', title: '일이 끝난 뒤에 왔어요', lesson: '1시 30분은 일이 끝나는 시간이에요. 시작 시간과 끝나는 시간을 헷갈리지 않게 확인해요.', icon: 'clock' },
        }),
      ],
    }),
    decide({
      id: 'ch1_c2', title: '계약서: 쉬는 시간', q: '쉬는 시간은 몇 분이에요?', who: 'manager', mentor: 'manager', helper: 'manager', skill: 'rights', memo: 'doc:5',
      choices: [
        bad('tea', '5분', {
          fail: [narr('나는 5분만 쉬고 바로 일어났다. 다리가 아프고 머리가 멍했다.'), say('dohyun', 'teach', '연우 씨, 벌써 일어났어요? 30분 쉬는 시간인데요.')],
          oops: { id: 'ch1_c2_short', title: '제대로 못 쉬었어요', lesson: '쉬는 시간은 연우의 권리예요. 계약서에 적힌 30분을 쉬어요.', icon: 'tea' },
        }),
        good('tea', '30분', { praise: '맞아요. 4시간 일하면 30분 넘게 쉬어야 해요. 법으로 정해져 있어요.' }),
        bad('tea', '쉬는 시간은 없다', {
          fail: [narr('나는 4시간 동안 한 번도 쉬지 않았다. 손이 떨려서 컵을 놓칠 뻔했다.')],
          oops: { id: 'ch1_c2_none', title: '쉬지 않고 일했어요', lesson: '4시간 일하면 30분 넘게 쉬어야 해요. 쉬는 시간이 없다면 꼭 물어봐요.', icon: 'tea' },
        }),
      ],
    }),
    decide({
      id: 'ch1_c3', title: '계약서: 월급날', q: '월급은 언제 받아요?', who: 'manager', mentor: 'manager', helper: 'manager', skill: 'rights', memo: 'doc:7',
      choices: [
        good('calendar', '매달 10일, 내 통장으로', { praise: '맞아요. 매달 10일에 연우 씨 통장으로 들어가요.' }),
        bad('coin', '일이 끝날 때마다 매일 현금으로', {
          fail: [narr('첫날 퇴근할 때, 나는 계산대 앞에서 손을 내밀고 기다렸다.'), say('dohyun', 'teach', '연우 씨…? 무얼 기다려요? 월급은 한 달에 한 번, 통장으로 들어와요.')],
          oops: { id: 'ch1_c3_daily', title: '매일 돈을 기다렸어요', lesson: '월급날은 계약서에 적혀 있어요. 연우는 매달 10일에 통장으로 받아요.', icon: 'calendar' },
        }),
      ],
    }),

    check(2),
    say('manager', 'smile', '완벽해요. 마지막으로, 맨 아래 서명란에 도장을 찍어 주세요.'),
    docSeal('도장 찍기'),
    check(3),
    say('manager', 'front', '계약서는 두 장이에요. 한 장은 가게가, 한 장은 연우 씨가 가져가요. 잘 보관해요.'),
    term('wage'), term('weekly_pay'), term('break'),
    narr('나는 계약서를 투명 파일에 넣었다. 내 이름이 적힌 첫 계약서였다.'),
    docClose(),
    photo('contract'),

    bg('cafe_front', 'morning'), bgm('morning'), amb('street'),
    show({ left: 'yeonwoo:smile', right: 'dohyun:smile' }),
    say('dohyun', 'smile', '연우 씨! 합격 축하해요! 점장님이 크게 칭찬하시던데요?'),
    branch('calmStyle', {
      breath: [say('dohyun', 'glasses', '숨 고르기 작전이 통했나 봐요.')],
      tidy: [say('dohyun', 'glasses', '역시 첫인상부터 단정했잖아요.')],
      _: [],
    }),
    say('yeonwoo', 'smile', '감사합니다! 계약서도 제가 직접 읽고 도장 찍었어요.'),
    narr('도현 선배가 빨간 앞치마와 명찰을 건네주었다. 명찰에는 내 이름이 적혀 있었다.'),
    say('dohyun', 'smile', '다음 주 월요일부터 저랑 같이 일해요. 모르는 건 언제든 "선배님!" 하고 불러요.'),
    think('엄마한테 문자 해야지.'),
    phone('mom', '우리 연우!!! 축하해. 엄마가 오늘 맛있는 거 해 놓을게.'),
    finish('1장 완료', '면접 합격, 근로계약서 서명!'),
    end(),
  ],
};
