/**
 * 마일스톤 말 사전
 * 대사 속 {{낱말}} 또는 {{표시|id}} 로 연결합니다.
 * easy: 1~2문장 쉬운 설명 / ex: 일터에서 쓰는 예문 / icon: 그림 / item: 물건 낱말이면 소품 그림(assets/items, 카드에 크게)
 * {wage}, {wageYear} 같은 값은 실행할 때 채워집니다.
 */

export const GLOSSARY = [
  { id: 'interview', word: '면접', icon: 'speech', easy: '일할 사람을 뽑기 전에 만나서 이야기를 나누는 것이에요.', ex: '면접에서는 아는 대로 솔직하게 말하면 돼요.' },
  { id: 'resume', word: '이력서', icon: 'resume', easy: '내 이름, 학교, 할 수 있는 일을 적은 종이예요.', ex: '면접 날에는 이력서를 챙겨 가요.' },
  { id: 'contract', word: '근로계약서', icon: 'contract', item: 'item_contract', easy: '일하는 사람과 가게가 일하는 조건을 약속하는 종이예요. 일을 시작하기 전에 쓰고, 한 장은 내가 가져요.', ex: '근로계약서에 일하는 시간과 시급이 적혀 있어요.' },
  { id: 'wage', word: '시급', icon: 'coin', easy: '한 시간 일하면 받는 돈이에요.', ex: '시급 × 일한 시간 = 내가 받는 돈.' },
  { id: 'minwage', word: '최저임금', icon: 'coin', easy: '나라에서 정한 가장 적은 시급이에요. 이보다 적게 주면 안 돼요.', ex: '{wageYear} 최저임금은 시간당 {wage}이에요.' },
  { id: 'weekly_pay', word: '주휴수당', icon: 'calendar', easy: '일주일에 15시간 넘게 약속대로 일하면, 하루치 돈을 더 받는 거예요.', ex: '연우는 일주일에 20시간 일해서 주휴수당을 받아요.' },
  { id: 'break', word: '휴게시간', icon: 'tea', easy: '일하는 중간에 쉬는 시간이에요. 4시간 일하면 30분 넘게 쉬어야 해요.', ex: '쉬는 시간에는 일하지 않고 쉬어도 돼요.' },
  { id: 'payday', word: '월급날', icon: 'calendar', easy: '한 달 동안 일한 돈이 통장에 들어오는 날이에요.', ex: '연우의 월급날은 매달 10일이에요.' },
  { id: 'payslip', word: '급여명세서', icon: 'ticket', item: 'item_payslip', easy: '월급을 얼마 받았는지, 왜 그만큼인지 적은 종이예요.', ex: '급여명세서는 버리지 말고 잘 보관해요.' },
  { id: 'deduction', word: '공제', icon: 'coin', easy: '월급에서 미리 빠지는 돈이에요. 보험료처럼 나를 지켜 주는 데 쓰여요.', ex: '보험료가 공제되고 남은 돈이 통장에 들어와요.' },
  { id: 'insurance', word: '4대 보험', icon: 'heart', easy: '아플 때, 다쳤을 때, 일을 그만두었을 때, 나이가 들었을 때 나를 도와주는 보험 네 가지예요.', ex: '일하는 사람은 4대 보험에 들어요.' },
  { id: 'saving', word: '저축', icon: 'piggy', easy: '돈을 쓰지 않고 모아 두는 것이에요.', ex: '월급의 일부는 저축해요.' },
  { id: 'clock_in', word: '출근 기록', icon: 'clock', easy: '일하러 온 시간을 적거나 찍는 것이에요. 내가 일한 시간의 증거가 돼요.', ex: '출근하면 기록부에 시간을 적어요.' },
  { id: 'clock_out', word: '퇴근', icon: 'door', easy: '일을 마치고 집에 가는 것이에요. 인사하고 퇴근 기록도 해요.', ex: '"먼저 들어가 보겠습니다. 수고하셨습니다!"' },
  { id: 'transit_card', word: '교통카드', icon: 'card', easy: '버스나 지하철을 탈 때 찍는 카드예요.', ex: '버스에 타면 교통카드를 단말기에 대요.' },
  { id: 'uniform', word: '유니폼', icon: 'apron', easy: '일할 때 입기로 정한 옷이에요. 깨끗하게 입어요.', ex: '출근하면 먼저 유니폼으로 갈아입어요.' },
  { id: 'hygiene', word: '위생', icon: 'handwash', easy: '병균이 생기지 않게 몸과 물건을 깨끗하게 하는 것이에요.', ex: '음식을 다루는 곳에서는 위생이 가장 중요해요.' },
  { id: 'handwash6', word: '손 씻기 6단계', icon: 'handwash', easy: '손바닥, 손등, 손가락 사이, 손가락, 엄지, 손톱 밑까지 여섯 단계로 30초 넘게 씻는 방법이에요.', ex: '손 씻기 포스터를 보면서 순서대로 씻어요.' },
  { id: 'opening', word: '오픈 준비', icon: 'sign_open', easy: '가게 문을 열기 전에 손님 맞을 준비를 하는 일이에요.', ex: '오픈 준비로 컵과 빨대를 채워요.' },
  { id: 'supplies', word: '비품', icon: 'cup', item: 'item_papercup', easy: '가게에서 쓰는 물건이에요. 컵, 빨대, 냅킨 같은 것이에요.', ex: '비품이 모자라면 창고에서 가져와요.' },
  { id: 'ventilation', word: '환기', icon: 'window', easy: '창문을 열어 안의 공기를 바꾸는 것이에요.', ex: '아침에 10분 동안 환기해요.' },
  { id: 'report', word: '보고', icon: 'speech', easy: '일어난 일을 선배나 점장님께 알리는 것이에요. 실수도 바로 보고해요.', ex: '"선배님, 제가 시럽을 쏟았습니다."' },
  { id: 'clarify', word: '확인 질문', icon: 'question', easy: '잘 모르는 말을 들었을 때 정확하게 다시 묻는 질문이에요.', ex: '"어떤 것을 어디에서 가져올까요?"' },
  { id: 'accommodation', word: '편의', icon: 'hand', easy: '일을 더 잘할 수 있게 도와주는 방법이나 도구예요. 필요하면 요청해도 돼요.', ex: '귀마개, 그림 순서표, 천천히 말해 주기도 편의예요.' },
  { id: 'earplugs', word: '귀마개', icon: 'ear', item: 'item_earplugs', easy: '큰 소리를 작게 줄여 주는 도구예요. 필요할 때 써도 돼요.', ex: '"소리가 너무 커요. 귀마개를 써도 될까요?"' },
  { id: 'breathe', word: '숨 고르기', icon: 'breathe', easy: '숨을 천천히 쉬어서 마음을 차분하게 하는 방법이에요.', ex: '연우는 하나, 둘, 셋 세면서 숨을 쉬어요.' },
  { id: 'mixer', word: '반죽기', icon: 'mixer', easy: '빵 반죽을 섞는 큰 기계예요. 돌아갈 때 소리가 커요.', ex: '반죽기가 돌아갈 때는 가까이 가지 않아요.' },
  { id: 'peak', word: '피크타임', icon: 'clock', easy: '손님이 가장 많이 오는 바쁜 시간이에요.', ex: '마일스톤의 피크타임은 낮 12시부터 1시까지예요.' },
  { id: 'regular', word: '단골', icon: 'heart', easy: '같은 가게에 자주 오는 손님이에요.', ex: '봉순 할머니는 마일스톤의 단골이에요.' },
  { id: 'tray', word: '트레이', icon: 'tray', item: 'item_tray', easy: '음료와 빵을 올려 나르는 쟁반이에요. 두 손으로 들어요.', ex: '트레이를 두 손으로 들고 천천히 걸어요.' },
  { id: 'order_ticket', word: '주문서', icon: 'ticket', easy: '손님이 주문한 것을 적은 종이예요. 손가락으로 하나씩 짚으며 확인해요.', ex: '주문서와 트레이를 하나씩 맞춰 봐요.' },
  { id: 'recommend', word: '추천 메뉴', icon: 'menu', easy: '손님께 권하는 인기 메뉴예요. 손님이 고르기 어려워할 때 알려 드려요.', ex: '"소금빵과 바닐라라테가 가장 인기가 많아요."' },
  { id: 'caution_sign', word: '주의 표지판', icon: 'caution', item: 'item_caution', easy: "'미끄러우니 조심하세요'라고 알려 주는 노란 표지판이에요. 바닥이 젖으면 먼저 세워요.", ex: '쏟아진 곳에 주의 표지판을 먼저 세워요.' },
  { id: 'closing', word: '마감', icon: 'checklist', easy: '일을 끝내면서 정리하고 청소하는 것이에요.', ex: '퇴근 전에 체크리스트대로 정리해요.' },
  { id: 'checklist', word: '체크리스트', icon: 'checklist', easy: '해야 할 일을 적어 두고, 한 일에 표시하는 목록이에요.', ex: '하나 할 때마다 체크리스트에 표시해요.' },
  { id: 'private_q', word: '사적인 질문', icon: 'lock', easy: '돈, 연애, 몸, 가족처럼 개인적인 것을 묻는 질문이에요. 직장에서는 조심해요.', ex: '"월급 얼마 받아요?"는 사적인 질문이에요.' },
  { id: 'refuse', word: '거절', icon: 'stop', easy: "싫거나 할 수 없는 일을 정중하게 '어려워요'라고 말하는 것이에요. 무례한 것이 아니에요.", ex: '"죄송하지만 그건 어려워요."' },
  { id: 'portrait_right', word: '초상권', icon: 'no_camera', easy: '내 얼굴을 허락 없이 찍거나 올리지 못하게 할 수 있는 권리예요.', ex: '"제 얼굴은 찍지 말아 주세요."' },
  { id: 'worker_protection', word: '직원 보호', icon: 'shield', easy: '손님이 직원에게 욕하거나 소리 지르면, 가게는 직원을 보호해야 해요. 혼자 참지 말고 관리자를 불러요.', ex: '법(산업안전보건법)에도 직원을 보호하라고 적혀 있어요.' },
  { id: 'fast_hands', word: '손이 빠르다', icon: 'sparkle', easy: '일을 빠르고 솜씨 좋게 한다는 칭찬이에요. 손이 진짜로 빨리 움직인다는 뜻만은 아니에요.', ex: '"손이 정말 빠르시네요!"는 칭찬이에요.' },
  { id: 'nunchi', word: '눈치', icon: 'think', easy: '말하지 않아도 분위기를 알아차리는 것이에요. 잘 모르겠으면 물어봐도 괜찮아요.', ex: '"제가 지금 무엇을 도와드릴까요?"라고 물어도 돼요.' },
  { id: 'role_split', word: '역할 분담', icon: 'team', easy: '할 일을 사람마다 나누어 맡는 것이에요.', ex: '"제가 포장을 맡을게요. 음료는 선배님이 해 주세요."' },
  { id: 'ice_machine', word: '제빙기', icon: 'ice', easy: '얼음을 만드는 기계예요. 고장 나면 손대지 말고 바로 알려요.', ex: '"점장님, 제빙기에서 삐 소리가 나요."' },
  { id: 'sasu', word: '사수', icon: 'team', easy: '일을 가르쳐 주는 선배예요.', ex: '연우의 사수는 도현 선배예요.' },
  { id: 'crew', word: '정규 크루', icon: 'badge', item: 'item_badge', easy: '가게의 정식 직원이라는 뜻이에요.', ex: '연우는 정규 크루 배지를 받았어요.' },
  { id: 'apology', word: '사과', icon: 'greet', easy: '내 실수로 다른 사람이 불편했을 때 "죄송합니다"라고 말하는 것이에요.', ex: '"죄송합니다. 바로 다시 만들어 드릴게요."' },
];

const byWord = new Map(GLOSSARY.map((g) => [g.word, g]));
const byId = new Map(GLOSSARY.map((g) => [g.id, g]));

export function findTerm(key) {
  if (!key) return null;
  return byId.get(key) || byWord.get(key) || null;
}
