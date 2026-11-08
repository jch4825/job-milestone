/**
 * 그림마다 제작 프롬프트 복기 (tools/export-credits.mjs 가 읽어 선생님 모드 '제작·저작권 정보'에 보여 줌)
 *
 * 그림은 사용자가 Google Flow로 만들었습니다. Flow에 실제로 넣은 글은 Flow 기록에만 남아 있어서,
 * 같은 그림을 다시 만들 수 있게 아래 자료로 프롬프트를 복기했습니다.
 *   from: 'chat'   대화에서 드린 프롬프트를 그대로(기록 있음)
 *         'doc'    요청서(docs/image_requests.md · docs/art_bible.md)의 블록을 바탕으로, 실제 그림(전신·흰 배경 등)에 맞춰 복기
 *         'look'   요청서에 없어 그림을 보고 복기
 *         'derived' 다른 그림에서 잘라 냄(새로 만들지 않음)
 *         'code'   생성 AI가 아니라 코드로 그림
 * 새 그림을 넣으면 여기에 한 줄을 더하고 `npm run credits`를 실행합니다.
 */

/* ---------- 공통 블록 (docs/image_requests.md 2.2·2.3) ---------- */
export const STYLE = 'clean modern anime cel-shading, bold clean black outlines, medium saturation, soft warm lighting, warm bakery-cafe palette (crimson red #E3262E accents, cream, warm brown), consistent character design, sharp lineart, high resolution';
export const NEG = 'text, letters, numbers, watermark, logo, signature, writing on name tag, extra fingers, deformed hands, blurry, cropped head, cropped feet, duplicate character, weapon, military uniform, persona 5 style, calling card, ransom-note letters, sexualized, revealing clothes, horror, gore';
const NEG_SAME = 'different outfit, different hairstyle, changed pose angle, text, letters, watermark, logo, writing on name tag, extra fingers, deformed hands, blurry, cropped head, cropped feet, duplicate character, background objects';
const WHITE = 'plain pure white background, whole body visible from head to feet with empty space above the head, single character centered';
const STUDIO = 'plain light grey-white studio background, whole body visible from head to feet with small margin above the head, single character centered';
const full = (dir) => `full-body character design, standing naturally, body turned slightly toward the viewer's ${dir}, looking at the viewer`;
const same = (ref, extra = '') => `Same character as the reference image (${ref}): identical face, hairstyle, outfit, colors, body proportions, line style and framing${extra}. Change only the facial expression and hands:`;

/* ---------- 인물 블록 (요청서 A·F, 아트 바이블 4.1) ---------- */
const YEONWOO = 'Korean young woman age 20, brown chin-length bob with soft bangs, large warm brown eyes, white collared shirt with sleeves rolled up, deep crimson red bib apron tied at the waist, small blank brass name tag on the apron, black trousers, white sneakers, thin red string bracelet on left wrist';
const YEONWOO_IV = 'Korean young woman age 20, brown chin-length bob with soft bangs, large warm brown eyes, neat white button-up blouse, navy knit vest, black trousers, small brown crossbody bag strap across the chest, thin red string bracelet on left wrist, no apron, no name tag';
const DOHYUN = 'Korean man age 26, neat black hair, black rectangular glasses, white shirt with rolled sleeves, charcoal grey vest, wine red necktie, black trousers, brown shoes, calm kind face';
const MANAGER = 'Korean man age 42, short slate grey-green hair, short stubble beard, white shirt with rolled sleeves, black vest, navy necktie, gold pocket watch chain with a small crescent charm, dark grey trousers, small spiral notepad and pen';

const P = (parts) => parts.filter(Boolean).join('\n');
const main = (who, ref, dir, pose) => P([STYLE + '.', who + '.', `${full(dir)}, ${pose}.`, STUDIO + '.', `Reference image: ${ref} (character sheet) for the same face and outfit.`]);
const face = (ref, what) => P([same(ref), what + '.', STYLE + '.']);

/**
 * id → { title(한국어), prompt, neg?, from, note? }
 * id 는 assets/images.json 의 ID(종류는 export-credits 가 붙임) 또는 'sheet:…' · 'movie:…'
 */
export const IMAGE_PROMPTS = {
  /* ===== 주요 3인 스탠딩 (896×1200, 설정화를 참조 이미지로) ===== */
  yeonwoo_normal: { title: '연우 · 보통', from: 'doc', prompt: main(YEONWOO, 'yeonwoo_sheet.jpg', 'right', 'hands lightly together in front of the apron, calm neutral expression, mouth closed'), neg: NEG },
  yeonwoo_smile: { title: '연우 · 웃음', from: 'doc', prompt: face('yeonwoo_normal', 'bright open smile with eyes closed in joy, one hand raised in a small cheerful fist near the shoulder'), neg: NEG_SAME },
  yeonwoo_nervous: { title: '연우 · 긴장', from: 'doc', prompt: face('yeonwoo_normal', 'nervous expression, eyebrows drawn together, small sweat drop, fingers touching a shirt button at the collar'), neg: NEG_SAME },
  yeonwoo_determined: { title: '연우 · 다짐', from: 'doc', prompt: face('yeonwoo_normal', 'determined expression, firm mouth, focused eyes, one hand in a small fist at shoulder height'), neg: NEG_SAME },
  yeonwoo_surprised: { title: '연우 · 놀람', from: 'doc', prompt: face('yeonwoo_normal', 'surprised expression, eyes wide, small open mouth, one open hand raised near the shoulder'), neg: NEG_SAME },
  yeonwoo_sad: { title: '연우 · 슬픔', from: 'doc', prompt: face('yeonwoo_normal', 'teary sad expression, lips pressed together, eyes glistening, not crying loudly, hands together in front of the apron'), neg: NEG_SAME },
  'yeonwoo-interview_normal': { title: '연우 면접 복장 · 보통', from: 'doc', prompt: main(YEONWOO_IV, 'yeonwoo_sheet.jpg', 'right', 'hands lightly together in front, calm neutral expression, mouth closed'), neg: NEG, note: '앞치마를 받기 전(프롤로그·1장)에 입는 옷' },
  'yeonwoo-interview_smile': { title: '연우 면접 복장 · 웃음', from: 'doc', prompt: face('yeonwoo-interview_normal', 'bright open smile with eyes closed in joy, hands together in front'), neg: NEG_SAME },
  'yeonwoo-interview_nervous': { title: '연우 면접 복장 · 긴장', from: 'doc', prompt: face('yeonwoo-interview_normal', 'nervous expression, eyebrows drawn together, fingers touching the blouse collar button'), neg: NEG_SAME },
  'yeonwoo-interview_determined': { title: '연우 면접 복장 · 다짐', from: 'doc', prompt: face('yeonwoo-interview_normal', 'determined expression, focused eyes, one hand in a small fist at shoulder height'), neg: NEG_SAME },
  dohyun_normal: { title: '도현 · 보통', from: 'doc', prompt: main(DOHYUN, 'dohyun_sheet.jpg', 'left', 'arms relaxed at his sides, calm gentle expression, mouth closed'), neg: NEG },
  dohyun_smile: { title: '도현 · 웃음', from: 'doc', prompt: face('dohyun_normal', 'warm friendly smile, one hand resting on his chest'), neg: NEG_SAME },
  dohyun_teach: { title: '도현 · 알려 주기', from: 'doc', prompt: face('dohyun_normal', 'explaining kindly, one hand raised palm up as if showing a step, attentive eyes'), neg: NEG_SAME },
  manager_normal: { title: '점장님 · 보통', from: 'doc', prompt: main(MANAGER, 'manager_sheet.jpg', 'left', 'notepad and pen held at the waist, composed neutral expression'), neg: NEG },
  manager_smile: { title: '점장님 · 웃음', from: 'doc', prompt: face('manager_normal', 'proud genuine warm smile, one hand in the trouser pocket'), neg: NEG_SAME },
  manager_strict: { title: '점장님 · 엄격', from: 'doc', prompt: face('manager_normal', 'serious firm expression, standing straight, notepad held at chest height (no crossed arms, no glaring)'), neg: NEG_SAME },
  manager_think: { title: '점장님 · 생각', from: 'doc', prompt: face('manager_normal', 'thoughtful, hand on chin, looking at the notepad'), neg: NEG_SAME },

  /* ===== 크루·가족 (768×1376, 요청서 F 인물 블록) ===== */
  sora_normal: { title: '소라', from: 'doc', prompt: P([STYLE + '.', 'Korean woman age 23, high ponytail with coral hair tie, round glasses, white shirt and crimson red apron with three pens in the pocket, black trousers, white sneakers, instant film camera held in both hands with a strap around the neck, bright energetic smile.', full('left') + '.', WHITE + '.']), neg: NEG },
  minjae_normal: { title: '민재', from: 'doc', prompt: P([STYLE + '.', 'Korean man age 29, quiet gentle baker, short black hair, white baker cap, flour smudge on cheek, cream baker jacket, dark brown long apron, big blue noise-cancelling earmuffs resting around his neck, calm eyes, small kind smile.', full('left') + ', hands together in front.', WHITE + '.']), neg: NEG },
  mom_normal: { title: '엄마', from: 'doc', prompt: P([STYLE + '.', 'Korean woman age 48, warm caring mother, brown hair in a low bun, lavender cardigan over a cream blouse, grey trousers, gentle eyes and a soft smile.', full('left') + ', hands lightly together in front.', WHITE + '.']), neg: NEG },

  /* ===== 손님·조연 (2026-10-12 제작, 2026-10-14 2K 업스케일링) ===== */
  jiho_normal: { title: '지호(새 신입)', from: 'doc', prompt: P([STYLE + '.', 'Korean young man age 19, nervous first day at work, messy black hair, white shirt and crimson red apron, black trousers, hands together in front, shy hopeful smile.', full('left') + '.', WHITE + '.']), neg: NEG },
  teacher_normal: { title: '김선영 선생님', from: 'doc', prompt: P([STYLE + '.', 'Korean woman age 38, special education teacher, shoulder-length brown hair, thin glasses, mint green cardigan over a cream top, navy trousers, firm and kind expression with a gentle smile.', full('left') + '.', WHITE + '.']), neg: NEG },
  grandma_normal: { title: '봉순 할머니', from: 'doc', prompt: P([STYLE + '.', 'Korean grandmother age 78, curly short grey hair, round glasses, warm terracotta coat over a patterned knit sweater, patchwork tote bag on her arm, kind wrinkled smile.', full('left') + ', hands together in front.', WHITE + '.']), neg: NEG },
  'grandma-cardigan_normal': { title: '할머니 손님(카디건)', from: 'look', prompt: P([STYLE + '.', 'Korean grandmother age 75, curly short grey hair, round glasses, dusty pink cardigan over a cream blouse, light patterned scarf, brown handbag held in front, gentle smile.', full('left') + '.', WHITE + '.']), neg: NEG },
  seojin_normal: { title: '서진(휠체어 이용 손님)', from: 'doc', prompt: P([STYLE + '.', 'Korean woman age 31, office worker using a manual wheelchair, black bob haircut, green knit sweater, grey trousers, sitting comfortably in the wheelchair with hands on her lap, confident friendly smile, wheelchair wheels and push handles fully visible.', 'full-body view, body turned slightly toward the viewer\'s left, looking at the viewer.', WHITE + '.']), neg: NEG, note: '아트 바이블에는 청록 재킷으로 적었으나 그림은 초록 스웨터' },
  daeri_normal: { title: '최 대리 · 보통', from: 'doc', prompt: P([STYLE + '.', 'Korean man age 33, office worker, navy suit, white shirt, red necktie, black briefcase in one hand, neutral busy face.', full('left') + '.', WHITE + '.']), neg: NEG },
  daeri_angry: { title: '최 대리 · 재촉', from: 'doc', prompt: P([STYLE + '.', 'Korean man age 33, rushed office worker, navy suit, loosened red tie, checking his wristwatch, impatient frown, black briefcase.', full('left') + '.', WHITE + '.']), neg: NEG },
  hiker_normal: { title: '등산복 손님 · 보통', from: 'doc', prompt: P([STYLE + '.', 'Korean man age 58, bright orange hiking jacket, beige cap, hiking backpack, grey hiking trousers, scratching the back of his head with a sheepish apologetic smile, slightly comical.', full('left') + '.', WHITE + '.']), neg: NEG, note: '표정을 고친 수정본을 씀(사용자 2026-10-15)' },
  hiker_angry: { title: '등산복 손님 · 화남', from: 'doc', prompt: P([STYLE + '.', 'Korean man age 58, bright orange hiking jacket and beige cap, hiking backpack, pointing forward and shouting, face flushed, loud angry expression (not violent), slightly comical.', full('left') + '.', WHITE + '.']), neg: NEG },
  auntie_normal: { title: '장바구니 아주머니', from: 'doc', prompt: P([STYLE + '.', 'Korean woman age 55, hurried shopper, short curly permed brown hair, beige quilted jacket, grey trousers, carrying a green shopping bag, kind slightly flustered smile.', full('left') + '.', WHITE + '.']), neg: NEG },
  student_normal: { title: '대학생 손님', from: 'look', prompt: P([STYLE + '.', 'Korean young man age 21, university student, messy black hair, grey zip-up hoodie over a white T-shirt, light blue jeans, backpack on one shoulder, one hand in the pocket, relaxed face.', full('left') + '.', WHITE + '.']), neg: NEG },
  customer_normal: { title: '손님(기본)', from: 'look', prompt: P([STYLE + '.', 'Korean man age 50, short grey hair, navy blazer over a grey turtleneck, beige chinos, holding a brown leather wallet, calm polite face.', full('left') + '.', WHITE + '.']), neg: NEG },
  'customer-angry_normal': { title: '손님 · 항의', from: 'look', prompt: P([STYLE + '.', 'Korean man age 40, short black hair, light blue dress shirt with rolled sleeves, dark grey trousers, leaning forward pointing and shouting, face flushed red, angry but comical (not violent).', full('left') + '.', WHITE + '.']), neg: NEG },
  'customer-arms_normal': { title: '손님 · 팔짱', from: 'look', prompt: P([STYLE + '.', 'Korean woman age 40, short wavy black bob, beige trench coat over a navy top, black trousers, beige handbag on her arm, arms crossed, annoyed frown while complaining.', full('left') + '.', WHITE + '.']), neg: NEG },
  'customer-coffee_normal': { title: '손님 · 테이크아웃 커피', from: 'look', prompt: P([STYLE + '.', 'Korean woman age 30, office worker, long straight black hair, beige long coat over a white blouse, navy trousers, holding a takeout coffee cup, gentle smile.', full('left') + '.', WHITE + '.']), neg: NEG },
  'customer-film_normal': { title: '손님 · 휴대폰 촬영', from: 'look', prompt: P([STYLE + '.', 'Korean young man age 25, messy black hair, black bomber jacket over a dark graphic T-shirt, ripped black jeans, sneakers, holding up a smartphone as if filming, irritated frown.', full('left') + '.', WHITE + '.']), neg: NEG },
  'customer-laptop_normal': { title: '손님 · 노트북 가방', from: 'look', prompt: P([STYLE + '.', 'Korean man age 30, short black hair, round glasses, olive green overshirt over a white T-shirt, black trousers, carrying a dark laptop case, calm friendly smile.', full('left') + '.', WHITE + '.']), neg: NEG },
  'customer-olive_normal': { title: '손님 · 올리브 셔츠', from: 'look', prompt: P([STYLE + '.', 'Korean woman age 28, long wavy brown hair, olive green blouse with rolled sleeves, cream wide-leg trousers, woven straw tote bag on her shoulder, gentle smile.', full('left') + '.', WHITE + '.']), neg: NEG },
  'customer-sporty_normal': { title: '손님 · 운동복', from: 'look', prompt: P([STYLE + '.', 'Korean woman age 25, sporty, black high ponytail, mint green zip-up track jacket, black leggings, sneakers, holding a water bottle, one hand on her hip, cheerful smile.', full('left') + '.', WHITE + '.']), neg: NEG },
  'customer-stripe_normal': { title: '손님 · 줄무늬 셔츠', from: 'look', prompt: P([STYLE + '.', 'Korean young man age 22, university student, black hair, round glasses, headphones around the neck, navy and white vertical striped open shirt over a white T-shirt, dark jeans, hands in pockets, relaxed smile.', full('left') + '.', WHITE + '.']), neg: NEG, note: '같은 프롬프트로 두 장(줄무늬 셔츠 2)' },
  'customer-stripe2_normal': { title: '손님 · 줄무늬 셔츠 2', from: 'look', prompt: P([STYLE + '.', 'Korean young man age 22, university student, black hair, round glasses, headphones around the neck, navy and white vertical striped open shirt over a white T-shirt, dark jeans, hands in pockets, relaxed smile.', full('left') + '.', WHITE + '.']), neg: NEG },
  'customer-uniform_normal': { title: '손님 · 교복', from: 'look', prompt: P([STYLE + '.', 'Korean high school boy age 17, neat black hair, navy school blazer, white shirt and striped tie, cream knit vest, grey trousers, backpack straps on both shoulders, polite smile.', full('left') + '.', WHITE + '.']), neg: NEG },
  'customer-vest_normal': { title: '손님 · 니트 조끼', from: 'look', prompt: P([STYLE + '.', 'Korean man age 45, neat black hair, thin glasses, light blue shirt, grey knit vest, grey trousers, gentle smile.', full('left') + '.', WHITE + '.']), neg: NEG },

  /* ===== 루나 (2026-10-15, 대화에서 드린 프롬프트 그대로) ===== */
  luna_normal: {
    title: '루나(SNS 손님) · 웃음', from: 'chat',
    prompt: P([
      'clean modern anime cel-shading, bold clean black outlines, medium saturation, soft warm lighting, warm bakery-cafe palette (crimson red #E3262E accents, cream, warm brown), consistent character design, sharp lineart, high resolution.',
      'Korean woman age 22, trendy social media influencer, long wavy chestnut-brown hair, red beret, pastel pink oversized jacket over a white top, light jeans, white sneakers, small crossbody bag, holding a smartphone at chest height with the screen facing her, playful bright smile with eyes slightly curved, cheerful friendly energy.',
      'Full-body character design, standing naturally, body turned three-quarters to the left, looking at the viewer.',
      'Plain pure white background, whole body visible from head to feet with empty space above the head, single character centered.',
    ]),
    neg: 'text, letters, numbers, watermark, logo, signature, phone screen content, extra fingers, deformed hands, blurry, cropped head, cropped feet, duplicate character, sexualized, revealing clothes, horror',
  },
  luna_worried: {
    title: '루나(SNS 손님) · 당황', from: 'chat',
    prompt: P([
      'Same character as the reference image: identical face, hair, red beret, pastel pink oversized jacket, outfit, colors, body proportions, line style and pose (body turned three-quarters to the left), same framing and pure white background, still holding the smartphone.',
      'Change only the facial expression: surprised and a little disappointed, eyebrows raised and tilted upward in the middle, eyes wide, lips slightly pouted and parted, one small sweat drop near the temple. Mild and polite, not angry or scary.',
      'clean modern anime cel-shading, bold clean black outlines, medium saturation, soft warm lighting, sharp lineart, high resolution.',
    ]),
    neg: 'different outfit, different hairstyle, changed pose angle, angry face, crying, text, letters, watermark, logo, phone screen content, extra fingers, deformed hands, blurry, cropped head, cropped feet, duplicate character, background objects',
    note: '참조 이미지: luna_normal',
  },

  /* ===== 배경 (요청서 B, 1376×768) ===== */
  ...Object.fromEntries([
    ['staff', '직원 휴게실', 'staff room of a small bakery cafe, lockers, wall mirror, small sink with soap dispenser, hand-washing step poster with pictures only, cork board with yellow sticky notes and polaroid photos, time card rack'],
    ['counter_day', '카운터 · 낮', 'bakery cafe counter, wooden counter top, glass pastry showcase with breads, blank chalkboard menu, espresso machine, cup dispenser rack, pendant lights, bright daylight from big windows'],
    ['cafe_front_morning', '카페 앞 · 아침', 'charcoal brick bakery cafe storefront, crimson red scalloped awning, blank gold sign board above door, glass door, warm window light, small A-frame board (blank), morning sun, quiet Korean neighborhood street'],
    ['home_morning', '연우의 방 · 아침', 'small tidy bedroom, yellow curtains open, morning sun, desk with lamp and red alarm clock, cork board with three picture schedule cards (no text), white shirt on a hanger'],
    ['tea', '휴게 공간', 'small break nook in a cafe, window daylight, round wooden table, two empty mugs, potted plant'],
    ['counter_morning', '카운터 · 오픈 전', 'bakery cafe counter, wooden counter top, glass pastry showcase, espresso machine, early morning before opening, chairs neatly placed, soft cool light, lights half on'],
    ['home_night', '연우의 방 · 밤', 'small tidy bedroom, desk with lamp and red alarm clock, cork board with picture cards, night, moon in window, warm desk lamp glow'],
    ['counter_peak', '카운터 · 피크타임', 'bakery cafe counter, glass pastry showcase, busy lunch rush, soft blurred silhouettes of many customers in line, warm lights'],
    ['bus_stop_morning', '정류장 · 아침', 'clean Seoul neighborhood bus stop, green shelter, blank LED arrival board, yellow tactile paving, ginkgo trees, market street behind, morning'],
    ['bus_stop_evening', '정류장 · 저녁', 'clean Seoul neighborhood bus stop, green shelter, blank LED arrival board, yellow tactile paving, ginkgo trees, evening, street lights on, orange sky'],
    ['office', '점장실', 'small manager office, venetian blinds casting soft stripes, dark wood desk with papers and a gold pocket watch, binders, framed certificates (blank), coffee sacks'],
    ['living', '거실 · 저녁', 'cozy Korean apartment living room at dusk, small dining table with lamp, sofa, warm orange window light'],
    ['kitchen', '제빵 주방', 'bakery kitchen, deck oven glowing, red stand mixer, bread cooling racks, flour sacks, white tiles'],
    ['counter_closing', '카운터 · 마감', 'bakery cafe counter, closing time, chairs up on tables, warm dim light, tidy'],
  ].map(([id, title, scene]) => [id, {
    title, from: 'doc',
    prompt: P(['anime visual novel background art, no people, clean painterly cel style, soft halftone texture, warm calm mood, eye-level camera, 16:9, uncluttered center (characters stand there), simple lower third (dialogue box covers it), no readable text anywhere.', scene + '.']),
    neg: 'people, characters, text, letters, numbers, watermark, logo, signature, readable signs',
    note: id.startsWith('counter_') && id !== 'counter_day' ? '같은 장소의 첫 장(카운터 · 낮)을 참조 이미지로 넣고 조명만 바꿈' : (id === 'home_night' || id === 'bus_stop_evening' ? '아침 그림을 참조 이미지로 넣고 시간만 바꿈' : ''),
  }])),

  /* ===== 오늘의 한 장 (요청서 E, 1376×768 → 게임에서 620×720으로 자름) ===== */
  ...Object.fromEntries([
    ['open', '오늘의 한 장 · OPEN 푯말', 'Yeonwoo (brown bob, white shirt, crimson apron) flipping a wooden OPEN sign on the glass door of a bakery cafe, an elderly woman with curly grey hair and a terracotta coat smiling through the glass, morning sunlight'],
    ['grandma', '오늘의 한 장 · 할머니와 소금빵', 'Yeonwoo (brown bob, white shirt, crimson apron) handing a tray with a salt bread roll and a cup of warm milk to an elderly woman with curly grey hair, round glasses and a terracotta coat, using both hands, both smiling, cozy cafe counter'],
    ['latte', '오늘의 한 장 · 라테', 'top-down photo of a latte with heart latte art in a ceramic mug on a wooden table, no people'],
    ['tea', '오늘의 한 장 · 창가의 머그잔', 'two mugs on a round wooden table by a window, a man\'s hand holding one mug, small potted plant, daylight'],
    ['badge', '오늘의 한 장 · 하이파이브', 'Yeonwoo and Dohyun (glasses, grey vest, wine red tie) giving a high-five, a small gold badge on her crimson apron, cafe counter, joyful moment'],
    ['memo_bg', '오늘의 한 장 · 나의 첫 메모(배경)', 'cork board with several yellow sticky notes, one large empty yellow sticky note in the center, no writing'],
    ['minjae', '오늘의 한 장 · 민재와 귀덮개', 'Minjae the baker (white baker cap, cream baker jacket, flour smudge on cheek) shyly pointing at the big blue earmuffs around his neck, bakery kitchen behind'],
    ['mom', '오늘의 한 장 · 엄마와 선물', 'Yeonwoo\'s mother (low bun, lavender cardigan) smiling and wiping the corner of her eye, holding a small wrapped gift box, living room at evening'],
  ].map(([id, title, scene]) => [`photos:${id}`, {
    title, from: 'doc',
    prompt: P([STYLE + '.', 'polaroid snapshot photo feel, candid moment, soft natural light, slightly warm film tone.', scene + '.']),
    neg: NEG,
    note: id === 'grandma' ? '할머니 얼굴을 무대 그림(grandma_normal)과 맞추려고 2026-10-15에 다시 만든 2K 그림' : '원본은 폴라로이드 틀이 있는 가로 그림. 게임은 가운데만 잘라 씀(틀·글자·생성 도구 표시 제외)',
  }])),

  /* ===== 소품 (요청서 H-1, 흰 배경 → 게임에서 배경을 지워 256×256) ===== */
  ...Object.fromEntries([
    ['item_saltbread', '소금빵', 'Korean salt bread roll (shio-pan) with coarse salt flakes on top'],
    ['item_croissant', '크루아상', 'golden flaky croissant'],
    ['item_muffin', '머핀', 'bakery muffin with chocolate chips in a paper cup'],
    ['item_americano', '따뜻한 아메리카노', 'white ceramic mug of hot black coffee with light steam'],
    ['item_iced_americano', '아이스 아메리카노', 'iced americano in a clear plastic cup with ice cubes and a straw'],
    ['item_latte', '라테', 'cup of cafe latte with heart latte art'],
    ['item_milk', '따뜻한 우유', 'ceramic mug with steamed warm milk'],
    ['item_juice', '오렌지 주스', 'glass of orange juice'],
    ['item_papercup', '종이컵', 'stack of white paper coffee cups'],
    ['item_icecup', '아이스컵', 'stack of clear plastic cups'],
    ['item_straw', '빨대', 'drinking straws standing in a small container'],
    ['item_lid', '컵 뚜껑', 'stack of white coffee cup lids'],
    ['item_syrup', '바닐라 시럽', 'glass bottle of vanilla syrup with a pump, blank label'],
    ['item_tray', '트레이', 'wooden cafe serving tray'],
    ['item_cloth', '행주', 'neatly folded cleaning cloth'],
    ['item_caution', '주의 표지판', 'yellow wet floor caution sign with a slipping person pictogram only, no words'],
    ['item_earplugs', '귀마개', 'pair of foam earplugs with a small mint storage case'],
    ['item_earmuffs', '귀덮개', 'big blue noise-cancelling safety earmuffs'],
    ['item_watch', '회중시계', 'gold pocket watch with a small crescent moon charm on its chain'],
    ['item_postit', '노란 메모', 'blank yellow sticky note, slightly curled corner'],
    ['item_contract', '근로계약서', 'wooden clipboard holding an employment contract with blurred lines only, no readable text'],
    ['item_payslip', '급여명세서', 'wage statement paper peeking out of an envelope, blurred lines only, no readable text'],
    ['item_badge', '크루 배지', 'small gold enamel milestone pin badge, no letters'],
    ['item_camera', '즉석카메라', 'retro instant film camera'],
  ].map(([id, title, thing]) => [id, {
    title: `소품 · ${title}`, from: 'doc',
    prompt: P(['single object game item icon, slight 3/4 top view, cute clean anime illustration, bold outline, simple shading with one highlight, centered, plain white background.', thing + '.']),
    neg: 'text, letters, numbers, watermark, logo, hands, people, cluttered background',
    note: '요청서 블록(H-1) + 물건 이름을 영어로 옮김. 요청서는 초록 배경이었으나 실제 그림은 흰 배경',
  }])),

  /* ===== VFX 텍스처 (요청서 I, 초록 배경 → 게임에서 초록을 지움) ===== */
  ...Object.fromEntries([
    ['vfx_sparkle', '반짝임', 'white four-pointed sparkle particle'],
    ['vfx_star', '별', 'plump yellow star'],
    ['vfx_glow', '빛 덩어리', 'soft round glowing white light particle'],
    ['vfx_confetti', '색종이', 'six colorful confetti pieces (red, yellow, mint, sky blue) scattered'],
    ['vfx_ink', '잉크 튐', 'red ink splash splat'],
    ['vfx_steam', '커피 김', 'single wisp of white semi-transparent coffee steam'],
    ['vfx_bubble', '비누 거품', 'iridescent soap bubble'],
    ['vfx_drop', '물방울', 'single blue water drop'],
    ['vfx_splash', '액체 튐', 'translucent brown liquid splash splat'],
    ['vfx_puff', '연기 퐁', 'round white smoke cloud poof'],
    ['vfx_flour', '밀가루 퐁', 'white flour dust burst'],
    ['vfx_ring', '소리 파동', 'circular glowing sound wave ring shockwave'],
    ['vfx_speedlines', '속도선 띠', 'horizontal white speed lines band (wide strip)'],
    ['vfx_gear', '톱니바퀴', 'small golden mechanical gear'],
    ['vfx_heart', '하트', 'small red heart'],
    ['vfx_paper', '종이 조각', 'small white paper scrap'],
  ].map(([id, title, thing]) => [id, {
    title: `효과 · ${title}`, from: 'doc',
    prompt: P(['game VFX particle texture, single element centered, soft edges, plain solid #00FF00 background.', thing + '.']),
    neg: 'text, letters, watermark, logo, extra elements, red background with rays',
    note: '요청서 블록(I) + 모양 설명을 영어로 옮김',
  }])),

  /* ===== 표지 영상 (Flow 영상, 2026-10-15) ===== */
  'movie:title_intro': {
    title: '표지 영상 · 손을 맞잡는 두 사람', from: 'look',
    prompt: P([
      'Anime-style short animation, 8 seconds, 16:9, solid chroma key green background (#16EB17) for easy removal.',
      'Two characters as dark silhouettes with warm golden rim light: a young man with glasses (neat hair, shirt and vest) stands on the left; a young woman with a chin-length bob and a cafe apron walks in from the right.',
      'They face each other, he reaches out his hand, and they clasp hands firmly at chest height like teammates; she rests her other hand on her hip with confidence.',
      'Small twinkling sparkles, slow gentle camera push-in, hopeful warm mood, no text.',
    ]),
    neg: 'text, letters, logo, red background, sunburst, radial rays, romantic kiss, scary mood',
    note: '게임은 오른쪽 840×720만 잘라 초록을 지우고, 앞 2초를 뺀 6초를 씀(소리 없음)',
  },

  /* ===== 설정화 (표정 초상을 잘라 낸 원본, 896×1200) ===== */
  'sheet:yeonwoo': { title: '설정화 · 연우', from: 'look', prompt: P([STYLE + ', plain white background.', 'character design sheet of YEONWOO, age 20, role: diligent baker, personality: diligent, warm.', YEONWOO + '.', 'full-body front view and side view, three expression headshots on the right: nervous, determination, bright smile.']), neg: 'watermark, logo, deformed hands', note: '그림 안의 글자(이름표 등)가 깨져 있어 게임에서는 쓰지 않음' },
  'sheet:dohyun': { title: '설정화 · 도현', from: 'look', prompt: P([STYLE + ', plain white background.', 'character design sheet of DOHYUN (26).', DOHYUN + '.', 'full-body front view and side view, three expression headshots in boxes: friendly warm smile, attentive teaching look, adjusting glasses with confidence.']), neg: 'watermark, logo, deformed hands' },
  // 일하는 장면의 픽셀 연우: 한 장에 모든 동작(같은 프롬프트로 4장 만들어 1장 고름), tools/import-pixel-sheet.py 가 잘라 씀
  'px:yeonwoo': { title: '픽셀 연우 · 동작 시트(8칸 × 6줄)', from: 'chat', prompt: P([
    'A clean 2D game sprite sheet of ONE chibi pixel-art character, arranged in a strict grid of 8 columns x 6 rows (48 equal cells, each cell a little taller than wide), square image. Each row holds two 4-frame animations: cells 1-4 (left half) and cells 5-8 (right half).',
    'Character (identical in every cell, match the reference image): a young woman drawn as a cute chibi, about 2.5 heads tall, brown bob haircut with bangs, amber-brown eyes, white shirt with rolled sleeves, dark red apron, black pants, dark shoes.',
    'Consistency rules: the character appears in 47 cells (every cell except the last one, bottom right) and has exactly the same size, pixel scale, outline thickness, palette and outfit in all of them. She is centered in each cell. In every row her feet stand on the same baseline (except the jump frames). Keep the bottom-right corner of the image free of the character.',
    'Rows, top to bottom (cells left to right): Row 1 walking toward the viewer / walking away (back view). Row 2 walking to the right (side view) / standing idle loop with a blink. Row 3 carrying a wooden tray with a paper cup / washing hands with soap foam, no sink. Row 4 wiping with a yellow cloth / sweeping with a straw broom. Row 5 polite customer-service bow / very happy (smile, jump, jump with tiny sparkles, landing). Row 6 a little flustered with sweat drops (last frame scratching the head) / writing on a notepad, pointing at an order ticket, waving hello, spare cell with only a small cardboard box.',
    'Style: crisp pixel art, hard edges, 1-pixel dark outline, limited palette, no anti-aliasing, no blur, no gradients.',
    'Background: one solid flat chroma-key green (#00FF00) over the whole image. No grid lines, no borders, no labels, no text, no numbers, no ground shadows, no lines radiating from the character.',
  ]), note: '참고 그림: 사용자가 먼저 만든 큰 정면 SD 그림. 전문은 docs/image_requests.md G-2. 마지막 칸은 Gemini 표시를 얹을 버리는 칸' },
  'px:cafe_room': { title: '픽셀 매장 배경(4장 근무판)', from: 'look', prompt: P([
    'A pixel-art background of the inside of a cozy bakery cafe, in exactly the same pixel-art style, palette and outline thickness as the reference sprite sheet (crisp pixels, 1-pixel dark outlines, soft warm shading). Use the reference only for the art style; do not draw the character. Wide 16:9 image, 3/4 top-down view like a classic 16-bit RPG interior, seen straight from the front.',
    'A large customer hall: six wooden cafe tables with chairs in two rows, potted plants between them, two bright windows and a wall shelf with bread baskets on the back wall, three pendant lamps, a glass entrance door with a coffee cup sign on the angled left wall.',
    'At the right: a small counter with a cash register, a glass showcase with cakes, a hand-washing sink with a pictogram poster on the wall, and a staff door. Light cream and beige checkered floor. No people, no text.',
  ]), note: '참고 그림: 고른 연우 시트. 처음 프롬프트(docs/image_requests.md G-3)를 사용자가 홀을 키우게 고쳐 만든 그림을 보고 복기(정확한 글은 Flow 기록). 가운데 20:7 띠를 잘라 씀' },
  'px:cafe_objects': { title: '픽셀 가구·소품·효과 시트(8칸 × 7줄)', from: 'chat', prompt: P([
    'A clean 2D game asset sheet of cafe objects, props and small effects, in exactly the same pixel-art style, palette and outline thickness as the reference sprite sheet (crisp pixels, 1-pixel dark outline, soft warm shading). Use the reference only for the art style; do not draw the character. Square image, strict grid of 8 columns x 7 rows (56 equal cells). One object per cell, centered, drawn as large as fits with a small margin, in a 3/4 top-down view like a classic 16-bit RPG.',
    'Rows: 1 door, square table, round table with two chairs, chair, tall plant, small plant, counter piece, wet-floor sign. 2 trash bin, mop in a bucket, broom and dustpan, sink, window, pendant lamp, bread shelf, bread showcase. 3 paper cup, iced cup, straw, lid, salt bread, croissant, muffin, hot americano. 4 latte, milk carton, orange juice, yellow dishcloth, stack of paper cups, light switch, blank name badge, ice cube. 5-7 two-frame effects: small bubbles, big bubble, water drops, twinkle, big twinkle, cute worried germ, heart, star, dust puff, steam; then a serving tray, broken glass, bread tongs, and a spare cell with only a small cardboard box.',
    'Background: one solid flat chroma-key green (#00FF00) over the whole image. No grid lines, no borders, no labels, no text, no letters, no numbers, no ground shadows, no lines radiating from anything.',
  ]), note: '전문은 docs/image_requests.md G-3. 소품·효과는 옛 이름으로 잘라 넣음' },
  // 미니게임 손님·점장님·민재와 물건·얼룩: 같은 손님이 앉기·투덜·걷기·기다리기에서 같은 모습이게 한 장에(같은 프롬프트로 5장 만들어 고름)
  'px:minigame': { title: '픽셀 미니게임 사람·물건·얼룩 시트(8칸 × 7줄)', from: 'chat', prompt: P([
    'A clean 2D game asset sheet for cafe minigames, in exactly the same chibi pixel-art style, palette and outline thickness as the reference sprite sheets (crisp pixels, 1-pixel dark outline, soft warm shading). Use the references only for the art style; do not draw the girl in the red apron. Square image, strict grid of 8 columns x 7 rows (56 equal cells). One thing per cell, centered. People are chibi, about 2.5 heads tall, all at the same scale; every person keeps exactly the same face, hair, outfit and colors in every cell they appear in.',
    'The people: Customer A (man about 50, short grey hair, navy blazer over a grey turtleneck, beige chinos), Student (young man about 21, messy black hair, grey zip-up hoodie, light blue jeans), Auntie (woman about 55, short curly permed brown hair, beige quilted jacket), Office worker (man about 33, navy suit, red necktie), Hiker (man about 58, bright orange hiking jacket, beige cap), Grandma (woman about 78, curly short grey hair, round glasses, terracotta coat), Manager (man about 42, slate grey-green hair, stubble, black vest, navy necktie), Baker (man about 29, white baker cap, cream baker jacket, dark brown apron, big blue earmuffs around his neck).',
    'Rows: 1 the six customers sitting on small wooden chairs, happily eating or drinking, then the Manager and the Baker standing. 2 the same six customers sitting but annoyed (not scary), the Manager holding up a white paper cup, the Baker holding a tray of fresh bread. 3 walking toward the viewer, two frames each: Customer A, Student, Auntie, Office worker. 4 the Office worker slipping on a wet floor (surprised, not hurt), Customer A searching, three customers waiting a little worried, the Manager with one arm out politely stopping people, a crumpled tissue, a crumpled straw wrapper. 5 ice machine, clear glass, ice bucket, open cardboard cup box, open steel ice bin, cup dispenser rack, empty glass bread showcase, kitchen pass-through window. 6 (seen from above) bread crumbs, coffee ring stain, sticky syrup spill, three grey dust bunnies (small, medium, big), small and big orange juice puddles. 7 smartphone, plate with a half-eaten croissant, coffee cup on a saucer, tied trash bag, open trash bag, soap pump bottle, folded paper towels, and a spare cell with only a small cardboard box.',
    'Background: one solid flat chroma-key green (#00FF00) over the whole image. No grid lines, no borders, no labels, no text, no letters, no numbers, no ground shadows, no lines radiating from anything.',
  ]), note: '참고 그림: 연우 시트 + 가구·소품 시트. 전문은 docs/image_requests.md G-4. 5장 중 정사각형 1장을 쓰고, 먼지(토끼 모양이라 다른 장의 털뭉치를 얼굴을 지워)·빈 양동이만 다른 두 장에서 가져옴' },
  'sheet:manager': { title: '설정화 · 점장님', from: 'look', prompt: P([STYLE + ', plain white background.', 'character design sheet of the cafe manager.', MANAGER + '.', 'color swatches, full-body front view and side view, headshot, three expression headshots: strict disciplined look, serious thoughtful evaluation, proud genuine warm smile, small detail boxes: hand, pocket watch, apron pocket, name tag.']), neg: 'watermark, logo, deformed hands', note: '그림 속 가게 이름(CAFÉ LUMINA)은 옛 이름이라 쓰지 않음' },
};

/** 원래 파일 이름이 SOURCES.md 에 없는 그림 */
export const NO_SOURCE_NOTE = '원래 파일 이름 기록 없음';
