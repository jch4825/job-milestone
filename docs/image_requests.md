# 직업 마1스톤: 이미지·애니메이션·VFX 요청서 (v3)

> **레퍼런스**: 「위대한 악녀: 릴리의 전략」 리뷰 영상(https://www.youtube.com/watch?v=DP45BiKql8w, 5분 11초)을 장면별로 약 35컷 캡처해 분석했습니다.
> **가져오는 것**은 화면 구성, 연출 리듬, 그림이 들어가는 자리입니다. 그 게임의 그림체, 문장(장미 엠블럼 등), 군복·전쟁 소재, 'LIVE 방송' 콘셉트, 노출 연출은 가져오지 않습니다. 우리 비주얼 언어는 계속 '마일스톤 팝'(영수증·포스트잇·도장·폴라로이드)입니다.
> **화면 기준**: 게임 창은 **1920 × 1080** 고정 캔버스입니다(`js/config.js`의 `SCREEN`, `js/core/scale.js`). 이 문서의 크기는 모두 **1920 × 1080 화면에 실제로 보이는 픽셀 크기**입니다. 더 크게 만들어 주셔도 되고, 넣을 때 이 크기로 줄입니다.
> **상태(2026-10-10)**: 8장의 결정을 추천안대로 확정했고, 그림 없이 만들 수 있는 부분(7장)은 구현했습니다. 그림이 들어갈 자리는 모두 연결해 두었으므로 **파일을 폴더에 넣고 `npm run assets`를 실행하면 바로 바뀝니다.** 그림이 없는 동안은 지금의 임시 그림(폴라로이드·SVG)이 그대로 보입니다.

우선순위: **P0** = 화면 인상이 바뀌는 핵심 / **P1** = 게임다운 손맛이 크게 늘어남 / **P2** = 여유 있을 때

---

## 0. 한눈에 보기

| 묶음 | 내용 | 장수 | 우선 |
| :--- | :--- | ---: | :--- |
| A | 주요 3인 **상반신 스탠딩**(표정별) + 연우 **면접 복장** 4장 | 18 | P0 |
| B | **배경** 일러스트(지금은 SVG 임시) | 14 | P0 |
| C | 스탠딩 **눈 깜빡임·말하는 입** 변형 | 12 | P1 |
| D | **이벤트 CG**(전체 화면 명장면) | 4 | P1 |
| E | **오늘의 한 장** 폴라로이드 일러스트 | 10 | P1 |
| F | 조연 크루·가족 스탠딩(소라·민재·엄마·지호) | 13 | P1 |
| G | **꼬마(SD) 연우** 포즈 컷아웃(일하는 장면·리액션) | 10 | P1 |
| H | 작은 이미지: **소품 일러스트 24 · 감정 이모트 12 · 버스 1** | 37 | P1 |
| I | **VFX 텍스처**(반짝임·김·거품·잉크 등) | 16 | P1 |
| J | 손님·선생님·할머니 초상, UI 질감, 타이틀 키 비주얼, 되감기 방, 컷인 눈 | 약 20 | P2 |

> **받은 그림 현황 (2026-10-10)**: A 17/18(도현 `worried`만 없음, 대신 가까운 표정으로 대체) · B 14/14 · I 16/16 적용. 받은 원본은 `assets/_src/`에 ID 이름으로 두고, `npm run images`가 배경을 지우고 잘라 게임용 PNG를 만듭니다. 나머지(C·D·E·F·G·H·J)는 대기.
>
> **받은 그림 현황 (2026-10-13 추가)**: 사람 23장 · 소품 24장 · 오늘의 한 장 9장 적용.
> - **조연·손님 스탠딩**(전신 그림 → 머리~허벅지로 잘라 900×1100): 지호 · 김선영 선생님 · 봉순 할머니(+카디건 옷) · 등산복 손님(보통·화남) · 최 대리(보통·화남=시계 보기) · 대학생 손님 · 장바구니 아주머니 · 서진(휠체어, 앉은 키에 맞춰 크기 맞춤) · 이름 없는 손님 12명(에피소드마다 다른 손님: `costume: { customer: 'coffee' }` 식). 루나(2026-10-15, 웃음·당황 2장)
> - **H-1 소품 24/24**(흰 배경 → 256×256 PNG): 말 사전 카드·아차 카드·주문서 확인·컵 보관대 미니게임·받은 물건 연출·되감기 회중시계·아침 브리핑에 씀(누르는 버튼 안의 선 아이콘은 그대로)
> - **E 오늘의 한 장 8/10**(620×720으로 잘라 씀, 생성 도구의 테두리·글자는 뺌): minjae · open · grandma · latte · tea · badge · memo_bg · mom. `note`(버스 창가의 엄마 쪽지)와 `contract`(계약서 도장)는 아직 없음 → 계약서는 소품 그림을 책상 위에 놓은 임시 사진. 예비 메모판 그림 1장은 `assets/_src/photos/memo_bg-alt.jpg`
> - 아직 없는 것: 도현 `worried`, C 깜빡임·입, D 이벤트 CG, G 꼬마 연우, H-2 이모트, H-3 버스, F의 소라·민재·엄마 표정(지금은 `normal`만)

**첫 시연 묶음 추천**: A(연우 6장 + 면접 복장 4장 먼저) → B(가장 많이 나오는 `staff`·`counter_day`·`cafe_front_morning`·`home_morning`) → I → H의 이모트. 이 정도면 대화·판단·아차 장면의 인상이 바로 달라집니다.

---

## 1. 레퍼런스에서 본 것 → 우리 게임에 쓰는 법

| 레퍼런스 장면 | 거기서 배울 점 | 우리 게임 적용 | 필요한 그림 |
| :--- | :--- | :--- | :--- |
| 대화(0:12, 0:42) | 화면의 60~80%를 채우는 **큰 상반신 그림**, 대화창 왼쪽의 **동그란 얼굴 아이콘**, 이름표 탭 | 지금은 작은 폴라로이드(330px). 대화 장면은 **스탠딩**으로 바꾸고, 대화창 안에 얼굴 아이콘을 넣어 **누가 말하는지 바로 보이게** 함 | A, C, F |
| 인물 소개(0:15, 4:32) | 클립보드 + 폴라로이드 증명사진 + 붉은 도장 + 줄 친 종이의 **인물 서류 카드** | 처음 만나는 크루·가족에게 **'크루 카드'**를 보여 줌. 마일스톤 팝과 정확히 맞는 모티프 | A, F(얼굴을 잘라 씀) |
| 장 제목(0:58) | 엠블럼 위에 작은 장소 + 큰 제목 | `big()` 장 제목을 **이정표 엠블럼 카드**로 바꿈 | 없음(SVG로 제작) |
| 장소 배지(1:26) | 왼쪽 위에 계속 떠 있는 장소 이름 | HUD에 **지금 장소** 표시 | 없음 |
| 데드 엔딩 극장(1:26) | 실패를 **돌아보고 해설하는 공간** | 아차! → 되감기 연출에 **'되감기 방'** 배경 | J(되감기 방) |
| 머리 위 말풍선(1:06, 3:00) | 작은 얼굴 + 이름표가 달린 **떠 있는 말풍선** | 일하는 장면(미니게임)에서 선배 한마디를 말풍선으로 | 없음(초상 재사용) |
| 명령 메뉴(1:44, 3:36) | 고르는 사람의 **상반신이 메뉴 옆**에 서 있음 | 판단 카드 옆에 **고민하는 연우** 상반신 | A |
| 스킬 컷인(1:53, 2:47) | 화면을 가로지르는 **띠 + 눈 클로즈업 + 기술 이름** | 좋은 선택 뒤 **'잘했어요' 컷인**: 띠 + 연우 눈 + 스킬 이름 + 별 | J(컷인 눈) 또는 A |
| 페이즈 배너(2:12, 2:23) | 3단계 진행 막대 + 가운데 큰 배너 | **오늘의 일정 3단계**를 HUD에 칩으로, 단계가 바뀌면 가운데 배너. 그림 일정표와 같은 원리라 교육적으로도 좋음 | 없음(픽토그램 재사용) |
| 전투 화면(1:06, 2:42) | 이야기는 일러스트, 플레이는 **꼬마 도트 캐릭터** | 대화 = 일러스트, 일하는 장면 = **꼬마 연우**(검수 C-6과 같은 방향) | G |
| 타격·스킬 효과(1:58) | 숫자 팝, 빛 줄기, 반짝임 | 별 획득 팝, 도장 잉크, 반짝임 등 **VFX** | I |
| 부대·유대(3:07, 3:25) | 왼쪽 목록 · 가운데 종이 카드 · 오른쪽 큰 그림, 잠긴 칸은 '??????' | 수첩에 **'함께 일하는 사람'** 탭 | A, F |
| CG 갤러리(3:57) | 왼쪽 목록 + 오른쪽 **겹쳐 놓은 큰 사진** | 사진첩을 **목록 + 큰 인화** 구조로 | D, E |
| 아래 오른쪽 큰 원 버튼, '자동 저장 중'(2:32) | 다음 단계 버튼이 크고 분명함, 저장 안심 표시 | '자동 저장했어요' 작은 표시 | 없음 |

---

## 2. 공통 규격

### 2.1 파일
| 항목 | 기준 |
| :--- | :--- |
| 투명 배경이 필요한 그림(스탠딩·SD·소품·이모트·VFX) | **PNG 투명 배경**. 투명이 안 되는 도구라면 **단색 초록 `#00FF00` 배경**으로 주세요(제가 잘라 냅니다). 연우·도현·점장이 흰 셔츠를 입어서 **흰 배경은 피해 주세요.** |
| 배경·CG·사진 | JPG(품질 90 이상) |
| 이름 | 이 문서의 **ID를 파일 이름**으로(예: `yeonwoo_smile.png`) |
| 폴더 | 스탠딩 `assets/stand/` · 배경 `assets/bg/`(`title_key`, `rewind_room` 포함) · CG `assets/cg/` · 사진 `assets/photos/` · SD `assets/sd/` · 소품 `assets/items/` · 이모트 `assets/emotes/` · VFX `assets/vfx/` · 질감·컷인 `assets/ui/` |
| 넣은 뒤 | `npm run assets` → `assets/images.json`에 목록이 생기고 게임이 자동으로 씁니다. |
| 글자 | **그림 안에 글자를 넣지 않습니다.** 간판·명찰·메뉴판·번호판은 비워 두면 게임이 덧그립니다(생성 글자는 깨지기 쉬움). |
| 라이선스 | 생성 도구 약관에서 학교 배포가 되는지 확인하고, 출처를 `assets/CREDITS.md`에 적습니다. |

### 2.2 공통 스타일 블록 (모든 일러스트 프롬프트 앞에 붙임)
```
clean modern anime cel-shading, bold clean black outlines, medium saturation,
soft warm lighting, warm bakery-cafe palette (crimson red #E3262E accents, cream, warm brown),
consistent character design, sharp lineart, high resolution
```

### 2.3 공통 제외(네거티브)
```
text, letters, numbers, watermark, logo, signature, writing on name tag, extra fingers, deformed hands,
blurry, cropped head, duplicate character, weapon, military uniform, rose emblem, persona 5 style,
calling card, ransom-note letters, sexualized, revealing clothes, horror, gore
```

### 2.4 같은 얼굴 유지하는 법
1. 지금 있는 설정화(`assets/yeonwoo_sheet.jpg`, `dohyun_sheet.jpg`, `manager_sheet.jpg`)를 생성 도구의 **참조 이미지(캐릭터 참조) 기능**에 넣습니다.
2. 인물마다 **기본 포즈 한 장(normal)을 먼저** 만들고, 마음에 들면 그 그림을 바탕으로 **얼굴만 고쳐 그리기(인페인팅·부분 편집)**로 표정을 만듭니다. 몸과 옷이 그대로여야 표정이 바뀔 때 화면이 튀지 않습니다.
3. C 묶음(깜빡임·입)은 **눈 또는 입 부분만** 고쳐서, 나머지 픽셀이 원본과 똑같아야 합니다.

---

## 3. P0 요청

### A. 주요 3인 상반신 스탠딩 (14장)
- **쓰이는 곳**: 대화 무대, 판단 화면 옆 '고민하는 연우', 크루 카드·대화창 얼굴 아이콘(얼굴을 잘라 씀), 수첩 '함께 일하는 사람'.
- **크기**: **900 × 1100 PNG**(머리부터 허벅지 위까지, 머리 위 여백 약 4%). 화면에서는 키 약 900px로 보이고 아랫부분은 대화창 뒤로 들어갑니다.
- **방향**: 연우는 몸을 **오른쪽**으로 3/4 돌림(보통 왼쪽 자리), 도현·점장은 **왼쪽**으로 3/4 돌림. 다른 자리에 서면 게임이 좌우를 뒤집습니다. 그래서 명찰은 **빈 금속판**으로 그립니다(뒤집어도 글자가 거꾸로 보이지 않게).
- **최소 조건**: 인물마다 `_normal`이 있어야 스탠딩으로 바뀝니다. 없는 표정은 가까운 표정으로 대신합니다(예: 도현 `glasses` → `smile`).
- 초상(폴라로이드)용 얼굴은 이 그림에서 잘라 만들므로 **따로 요청하지 않습니다.**

**구도 블록** (스타일 블록 뒤에 붙임)
```
single character, waist-up standing pose (head to upper thighs), body turned 3/4 toward viewer's {RIGHT|LEFT},
face toward viewer, relaxed natural posture, both hands visible, full head visible with small margin above,
plain solid #00FF00 background
```

**인물 블록**
| 인물 | 프롬프트 |
| :--- | :--- |
| 연우 | `Korean young woman age 20, brown chin-length bob with soft bangs, large warm brown eyes, white collared shirt with sleeves rolled up, deep crimson red bib apron tied at the waist, small blank brass name tag on the apron, black trousers, thin red string bracelet on left wrist` |
| 도현 | `Korean man age 26, neat black hair, black rectangular glasses, white shirt with rolled sleeves, charcoal grey vest, wine red necktie, calm kind face` |
| 점장 | `Korean man age 42, short slate grey-green hair, short stubble beard, white shirt with rolled sleeves, black vest, navy necktie, gold pocket watch chain with a small crescent charm, small spiral notepad and pen` |

**표정 목록**
| ID | 표정 프롬프트 | 비고 |
| :--- | :--- | :--- |
| `yeonwoo_normal` | `calm neutral expression, mouth closed, hands lightly together in front of apron` | 기본 포즈 |
| `yeonwoo_smile` | `bright open smile, eyes slightly narrowed with joy` | |
| `yeonwoo_nervous` | `nervous expression, eyebrows drawn together, small sweat drop, fingers touching a shirt button` | 단추 만지기 = 이야기 모티프 |
| `yeonwoo_determined` | `determined expression, firm mouth, focused eyes, one hand in a small fist at chest height` | 판단 화면에 자주 씀 |
| `yeonwoo_surprised` | `surprised expression, eyes wide, small open mouth, shoulders slightly raised` | |
| `yeonwoo_sad` | `teary sad expression, lips pressed together, eyes glistening, not crying loudly` | |
| `dohyun_normal` | `calm gentle expression, mouth closed` | 기본 포즈 |
| `dohyun_smile` | `warm friendly smile` | "말해줘서 고마워요" |
| `dohyun_teach` | `explaining kindly, one hand raised palm up as if showing a step, attentive eyes` | |
| `dohyun_worried` | `concerned gentle expression, eyebrows slightly drawn, leaning a little forward` | |
| `manager_normal` | `composed neutral expression, notepad held at waist` | 기본 포즈 |
| `manager_strict` | `serious firm expression, standing straight, notepad held at chest` | **팔짱·노려보기 금지**(위협 연출 금지 원칙) |
| `manager_smile` | `proud genuine warm smile` | |
| `manager_think` | `thoughtful, hand on chin, looking at the notepad` | |

**A-2 연우 면접 복장 (4장, P0)**: 프롤로그와 1장에서 씁니다. 앞치마와 명찰은 1장 끝에 받으므로, 이 두 에피소드에서 앞치마를 입으면 이야기와 어긋납니다. 파일이 있으면 게임이 이 두 에피소드에서만 자동으로 씁니다(`costume` 설정).
- 인물 블록(연우 대신): `Korean young woman age 20, brown chin-length bob with soft bangs, large warm brown eyes, neat white button-up blouse, navy knit vest, black trousers, small brown crossbody bag strap across the chest, thin red string bracelet on left wrist, no apron, no name tag`
- ID: `yeonwoo-interview_normal` · `yeonwoo-interview_smile` · `yeonwoo-interview_nervous` · `yeonwoo-interview_determined` (표정 프롬프트는 위 연우와 같음)

### B. 배경 (14장)
- **크기**: **1920 × 1080 JPG**. 지금 대본에 실제로 나오는 배경만 골랐습니다(괄호는 나오는 횟수).
- **배경 블록** (스타일 블록 대신 이것을 앞에 붙임)
```
anime visual novel background art, no people, clean painterly cel style, soft halftone texture,
warm calm mood, eye-level camera, 16:9, uncluttered center (characters stand there),
simple lower third (dialogue box covers it), no readable text anywhere
```

| ID (파일 이름) | 장면 | 프롬프트 핵심 | 우선 |
| :--- | :--- | :--- | :--- |
| `staff` (8) | 직원 공간 | `staff room of a small bakery cafe, lockers, wall mirror, small sink with soap dispenser, hand-washing step poster with pictures only, cork board with yellow sticky notes and polaroid photos, time card rack` | P0 첫 묶음 |
| `counter_day` (6) | 홀·카운터 낮 | `bakery cafe counter, wooden counter top, glass pastry showcase with breads, blank chalkboard menu, espresso machine, cup dispenser rack, pendant lights, bright daylight from big windows` | P0 첫 묶음 |
| `cafe_front_morning` (5) | 가게 앞 아침 | `charcoal brick bakery cafe storefront, crimson red scalloped awning, blank gold sign board above door, glass door, warm window light, small A-frame board (blank), morning sun, quiet Korean neighborhood street` | P0 첫 묶음 |
| `home_morning` (4) | 연우의 방 아침 | `small tidy bedroom, yellow curtains open, morning sun, desk with lamp and red alarm clock, cork board with three picture schedule cards (no text), white shirt on a hanger` | P0 첫 묶음 |
| `tea` (3) | 휴게 공간 | `small break nook in a cafe, window daylight, round wooden table, two empty mugs, potted plant` | P0 |
| `counter_morning` (3) | 카운터 오픈 전 | 위 `counter_day`와 같은 구도, `early morning before opening, chairs neatly placed, soft cool light, lights half on` | P0 |
| `home_night` (2) | 연우의 방 밤 | `home_morning`과 같은 구도, `night, moon in window, warm desk lamp glow` | P0 |
| `counter_peak` (2) | 점심 피크 | `counter_day`와 같은 구도, `busy lunch rush, soft blurred silhouettes of many customers in line, warm lights` | P0 |
| `bus_stop_morning` (2) | 해솔시장 앞 정류장 | `clean Seoul neighborhood bus stop, green shelter, blank LED arrival board, yellow tactile paving, ginkgo trees, market street behind, morning` | P0 |
| `office` (1) | 점장실 | `small manager office, venetian blinds casting soft stripes, dark wood desk with papers and a gold pocket watch, binders, framed certificates (blank), coffee sacks` | P0 |
| `living` (1) | 거실 저녁 | `cozy Korean apartment living room at dusk, small dining table with lamp, sofa, warm orange window light` | P0 |
| `kitchen` (1) | 제빵 주방 | `bakery kitchen, deck oven glowing, red stand mixer, bread cooling racks, flour sacks, white tiles` | P0 |
| `counter_closing` (1) | 마감 | `counter_day`와 같은 구도, `closing time, chairs up on tables, warm dim light, tidy` | P0 |
| `bus_stop_evening` (1) | 정류장 저녁 | `bus_stop_morning`과 같은 구도, `evening, street lights on, orange sky` | P0 |

> 같은 장소의 변형(아침·낮·피크·마감)은 **첫 장을 바탕으로 조명만 바꿔** 만들어 주세요. 그래야 장면이 바뀌어도 같은 가게로 보입니다.

---

## 4. P1 요청

### C. 깜빡임·말하는 입 (12장)
- **쓰이는 곳**: 대사가 나오는 동안 입이 움직이고, 가만히 있을 때 2~5초마다 눈을 깜빡입니다. 짧지만 화면이 '살아 있게' 만드는 가장 효과 큰 애니메이션입니다.
- **대상**: 연우·도현·점장의 `normal`, `smile` × (`_blink` 눈 감음, `_talk` 입 조금 벌림) = 12장.
- **규칙**: A의 원본과 **같은 크기·같은 위치**. 눈(또는 입) 부분만 고쳐 그립니다.
- 프롬프트: 원본 그림을 넣고 `same image, only the eyes closed gently (blink)` / `same image, only the mouth slightly open as if speaking`.

### D. 이벤트 CG (5장, 1920 × 1080 JPG)
- **쓰이는 곳**: 감정 포인트에서 배경과 인물을 한 장으로 바꿔 보여 줍니다. 아래 1/3은 대화창이 덮으므로 얼굴은 위쪽 2/3에 둡니다. 수첩 사진첩에 모입니다.
- `cg_door`와 `cg_jiho`는 **같은 문, 같은 카메라**로 그려서 '문 앞의 첫인사' 모티프가 한눈에 겹쳐 보이게 합니다.

| ID | 장면 | 프롬프트 (스타일 블록 + 인물 블록 뒤에) |
| :--- | :--- | :--- |
| `cg_door` | 프롤로그 끝: 문이 열리고 도현이 맞이함 | `view from outside a bakery cafe glass door, Dohyun opening the door from inside with a gentle welcoming smile, nervous Yeonwoo standing outside touching her shirt button, morning sunlight, warm bread glow from inside` · 연우는 **면접 복장**(앞치마 없음) → 8장 I-6 확인 |
| `cg_syrup` | 2일 차: "혼을 왜 내요? 같이 닦아요." | `bakery cafe counter, Yeonwoo and Dohyun side by side wiping spilled vanilla syrup on the wooden counter with cloths, Dohyun smiling kindly, Yeonwoo looking surprised and relieved, a yellow sticky note on the register, morning light` |
| `cg_badge` | 3장: 정규 크루 배지 | `the manager pinning a small gold badge on Yeonwoo's crimson apron, Yeonwoo proud with happy teary eyes, Dohyun clapping softly beside, cork board full of yellow sticky notes behind, warm afternoon light` |
| `cg_jiho` | 3장 마무리: 연우가 지호를 맞이함 | `cg_door`와 같은 문과 카메라, `Yeonwoo wearing her crimson apron with a small gold badge opening the door from inside with a gentle smile, a nervous young man (Jiho) outside fiddling with his shirt button` |
| `cg_wall` | 엔딩(2026-10-14 추가, 선택): 퇴근하는 연우에게 크루가 손을 흔듦 | `staff room of a small bakery cafe, cork board wall covered with yellow sticky notes, many polaroid photos and a small whiteboard schedule with colored magnets, Yeonwoo in a white shirt (apron folded over her arm) waving goodbye, Dohyun, the manager, Jiho in crimson aprons waving back, Sora holding up an instant camera, a quiet baker with earmuffs waving through the kitchen window, warm afternoon light` · 그림이 없으면 엔딩은 지금처럼 스탠딩으로만 진행 |

### E. 오늘의 한 장 (11장, 620 × 720 JPG)
- **쓰이는 곳**: 에피소드마다 받는 폴라로이드, 사진첩, 엔딩 사진 벽. 지금은 초상과 스티커를 합친 임시 그림입니다.
- 블록: `polaroid snapshot photo feel, candid moment, soft natural light, slightly warm film tone`

| ID | 장면 | 프롬프트 핵심 |
| :--- | :--- | :--- |
| `note` | 버스 창가에서 엄마 쪽지를 펼친 손 | `close-up of a young woman's hands unfolding a small yellow sticky note by a bus window, red string bracelet, morning light, note is blank` (글은 게임이 씀) |
| `contract` | 계약서 위 빨간 도장 | `close-up of a hand pressing a red ink seal on a document on a wooden desk, gold pocket watch nearby, document lines blurred` |
| `minjae` | 귀덮개를 보여 주며 웃는 민재 | F의 민재 블록 + `shyly showing big blue earmuffs, flour smudge on cheek, bakery kitchen` |
| `open` | OPEN 푯말을 돌리는 연우 | `Yeonwoo flipping a blank wooden sign on the glass door, an elderly woman with curly grey hair and terracotta coat smiling through the glass, morning` |
| `grandma` | 두 손으로 트레이를 건넴 | `Yeonwoo handing a tray with a salt bread roll and warm milk to an elderly woman with both hands, both smiling` |
| `latte` | 얼굴 대신 라테만 | `top-down photo of a latte with heart latte art on a wooden table, no people` |
| `tea` | 창가의 머그잔 두 개 | `two mugs on a round table by a window, a man's hand holding one, small plant, daylight` |
| `badge` | 배지를 단 연우와 하이파이브 | `Yeonwoo and Dohyun high-five, small gold badge on her crimson apron, cafe counter` |
| `memo_bg` | 나의 첫 메모(배경만) | `cork board with several yellow sticky notes, one large empty yellow sticky note in the center` · 메모 글은 플레이어가 고른 팁이라 **게임이 씀** |
| `mom` | 선물을 받은 엄마 | F의 엄마 블록 + `smiling and wiping the corner of her eye, holding a small wrapped gift, living room at evening` · 선물 종류(목도리·빵·꽃)별 3장은 P2 |
| `board` | 나의 첫 근무판(4장 1화, 2026-10-14 추가) | `Yeonwoo in her crimson apron standing proudly next to a small whiteboard schedule on the staff room wall, colored magnets in time slots (blue, green, yellow, red), yellow sticky notes on the cork board beside it, she points at the board with a shy proud smile` · 지금은 화이트보드·자석·얼굴을 합친 임시 사진 |

### F. 크루·가족 스탠딩 (13장, 900 × 1100 PNG, A와 같은 구도 블록, 모두 몸을 **왼쪽**으로 3/4 돌림)
| 인물 | 인물 블록 | 표정 ID |
| :--- | :--- | :--- |
| 소라 | `Korean woman age 23, high ponytail with coral hair tie, round glasses, white shirt and crimson red apron with three pens in the pocket, instant film camera on a strap around the neck, bright energetic look` | `sora_normal` `sora_smile` `sora_surprised` `sora_worried` |
| 민재 | `Korean man age 29, quiet gentle baker, short black hair, white baker cap, flour smudge on cheek, cream baker jacket, big blue noise-cancelling earmuffs resting around his neck, calm eyes` | `minjae_normal` `minjae_smile` `minjae_thumb`(엄지 척) |
| 엄마 | `Korean woman age 48, warm caring mother, hair in a low bun, lavender cardigan over a simple blouse, gentle eyes` | `mom_normal` `mom_smile` `mom_worried` |
| 지호 | `Korean young man age 19, nervous first day at work, messy black hair, white shirt and crimson red apron, shy hopeful face` | `jiho_nervous` `jiho_smile` `jiho_normal` |

### G. 꼬마(SD) 연우 포즈 컷아웃 (10장, 320 × 400 PNG)
- **쓰이는 곳**: 일하는 장면(손 씻기·컵 채우기·주문 확인·퇴근 정리), 결과 화면, 화면 구석의 작은 리액션. 레퍼런스처럼 **이야기는 일러스트, 일은 꼬마 캐릭터**로 나눕니다.
- **움직임은 코드로 만듭니다.** 포즈 한 장씩만 주시면 통통 튀기, 찌그러졌다 펴지기, 흔들기, 걷는 듯 위아래로 움직이기를 붙입니다(컷아웃 애니메이션). 프레임마다 그린 도트 애니메이션은 [에셋 요청 7장](asset_requests.md)의 픽셀 아트안으로, 결정 C-6에 따라 따로 진행합니다.
- 블록: `chibi super-deformed version of Yeonwoo, 2.5 heads tall, big head, simple cute proportions, thick clean outlines, flat colors with one shade, full body, plain solid #00FF00 background` + 연우 인물 블록

| ID | 포즈 |
| :--- | :--- |
| `sd_yeonwoo_idle` | `standing straight, small smile, hands together` |
| `sd_yeonwoo_happy` | `jumping with both arms up, big smile, sparkles` |
| `sd_yeonwoo_panic` | `flustered, arms flailing a little, sweat drops` (무서운 표정 금지) |
| `sd_yeonwoo_bow` | `polite bow from the waist, hands on the apron` |
| `sd_yeonwoo_tray` | `carrying a tray carefully with both hands` |
| `sd_yeonwoo_wash` | `washing hands with soap foam, looking at hands` |
| `sd_yeonwoo_wipe` | `wiping a table with a cloth` |
| `sd_yeonwoo_point` | `pointing at a paper order ticket with index finger` |
| `sd_yeonwoo_think` | `thinking, finger on chin, question mark feel` |
| `sd_yeonwoo_breathe` | `eyes closed, hand on chest, calm deep breath` |

### G-2. SD 픽셀 연우 동작 시트: 한 장에 모두 (2026-10-25, Flow로 제작) ✅ 받음·적용
> 같은 프롬프트로 만든 4장 중 얼굴이 가장 고르고 인사·당황 칸이 깨끗한 한 장을 골라 `assets/_src/pixel/px_yeonwoo_sheet.jpg`로 넣고(나머지 3장은 휴지통), `npm run pixel`(tools/import-pixel-sheet.py)로 게임용 `assets/pixel/yeonwoo.png`를 만들었습니다(검수 문서 N-26).

사용자가 만든 SD 픽셀 시트로 지금 픽셀 연우(`assets/pixel/yeonwoo.png`, 24×40)를 바꾸려면 코드가 쓰는 동작이 모두 있어야 합니다(검수 문서 N-26). 동작마다 따로 만들었더니 그림마다 얼굴·크기·옷이 달라져(사용자: "일관성을 얻지 못한다") **처음 받은 시트의 동작까지 모든 그림을 한 장에 넣어 한 번에** 만듭니다(사용자: "정말 모든 이미지를 한꺼번에 만들어야 해").

**칸 배치: 8칸 × 6줄 = 48칸, 정사각형(1:1)**. 한 줄에 4칸짜리 동작 두 개(왼쪽 반 · 오른쪽 반). 칸이 세로로 조금 긴 모양(가로:세로 = 3:4)이라 꼬마 캐릭터가 알맞게 들어갑니다.

| 줄 | 1~4칸 (왼쪽 반) | 5~8칸 (오른쪽 반) |
| :--- | :--- | :--- |
| 1 | 앞으로 걷기 `walk_down` | 뒤로 걷기 `walk_up` |
| 2 | 오른쪽으로 걷기 `walk_right` (왼쪽은 뒤집어서) ◆ | 서 있기·숨쉬기·눈 깜빡 `idle` ◆ |
| 3 | 쟁반 들고 나르기 `carry` | 손 씻기(6단계 느낌, 세면대 없음) `wash` ◆ |
| 4 | 행주로 닦기 `wipe` | 빗자루로 쓸기 `sweep`(새로) ◆ |
| 5 | 손님께 인사 `bow` | 기뻐하기(웃음 → 점프 → 반짝 → 착지) `happy` ◆ |
| 6 | 당황하기 `panic` ◆(4칸째는 머리 긁기) | 메모 쓰기 · 주문서 가리키기 · 손 흔들기 · **버리는 칸**(상자만) |

◆ = 처음 받은 4×5 시트에 있던 동작. 6줄 오른쪽의 메모 쓰기·가리키기·손 흔들기는 4×4 포즈 시트에서 게임에 쓸 만한 것(메모 쓰기 미니게임·주문 담기·손님 맞이)입니다.

- **Flow에서**: 큰 정면 그림(`px_yeonwoo_front`)을 **참고 그림(재료)**으로 올리고 아래 프롬프트 하나로, **정사각형(1:1)**으로 만듭니다.
- **오른쪽 아래 Gemini 표시(✦)**: 그림을 만든 뒤에 덧붙는 표시라 프롬프트로는 없앨 수 없습니다(사용자: "제미나이의 별이 나온다. 그래서 그림을 가린다"). 그래서 **마지막 칸(6줄 8칸)은 연우 없이 작은 상자만 있는 버리는 칸**으로 두어 표시가 그 위에 얹히게 합니다.
- **고르는 법**: 연우가 있는 47칸이 모두 같은 크기·같은 옷이고, 마지막 칸에 연우가 없는 것을 고릅니다. 칸이 많아 동작 순서가 조금 섞일 수 있는데, 칸이 고른 격자로 나뉘어 있으면 제가 칸을 골라 맞출 수 있습니다. 한두 칸만 틀렸으면 그 그림을 고치기(편집)로 "Keep everything else exactly the same. Only redraw row 6, cells 1-4: …"처럼 그 칸만 다시 그리게 합니다.
- **받는 곳**: `assets/_src/pixel/px_yeonwoo_sheet.png`. 원래 파일 이름은 `assets/_src/SOURCES.md`에, 이 프롬프트는 `tools/credits/image_prompts.mjs`에 적습니다.
- **코드에서 할 일**(그림이 오면): 발끝 기준으로 잘라 새 시트·JSON, 옆으로 걷기를 뒤집어 `walk_left`, 근무판 '바닥 쓸기'와 청소 미니게임은 `sweep`으로, 메모 쓰기·가리키기·손 흔들기는 그 미니게임에. 손 씻기는 세면대 없이 그려 근무판 매장의 세면대 타일과 겹치지 않습니다. 가게 소품·효과·타일 픽셀 그림은 연우와 따로라 이 시트에 넣지 않습니다.

```
A clean 2D game sprite sheet of ONE chibi pixel-art character, arranged in a strict grid of 8 columns x 6 rows (48 equal cells, each cell a little taller than wide), square image. Each row holds two 4-frame animations: cells 1-4 (left half) and cells 5-8 (right half).

Character (identical in every cell, match the reference image): a young woman drawn as a cute chibi, about 2.5 heads tall, brown bob haircut with bangs, amber-brown eyes, white shirt with rolled sleeves, dark red apron, black pants, dark shoes.

Consistency rules: the character appears in 47 cells (every cell except the last one, bottom right) and has exactly the same size, pixel scale, outline thickness, palette and outfit in all of them. She is centered in each cell. In every row her feet stand on the same baseline (except the jump frames). Keep the bottom-right corner of the image free of the character.

Rows, top to bottom (cells left to right):
Row 1: cells 1-4 front view, walking toward the viewer, a 4-frame walk cycle (left foot forward, passing, right foot forward, passing); cells 5-8 back view, walking away from the viewer, a 4-frame walk cycle, we see the back of her hair and the apron bow at her lower back, no face.
Row 2: cells 1-4 side view facing right, walking to the right, a 4-frame walk cycle; cells 5-8 front view standing with hands together and a gentle smile, a 4-frame idle loop (normal, body one pixel lower as she breathes in, normal, eyes closed in a blink).
Row 3: cells 1-4 front view carrying a small wooden tray with one white paper cup at chest height with both hands, a 4-frame walking-in-place bob, the tray stays level; cells 5-8 front view washing hands with white soap foam in front of her chest, looking at her hands, no sink (rubbing palms, rubbing the backs of the hands, rubbing between the fingers, shaking water drops off).
Row 4: cells 1-4 front view wiping with a yellow cloth at waist height, no table, the cloth moves left, center, right, center; cells 5-8 front view sweeping the floor with a straw broom, the broom moves left, center, right with a small puff of dust, center.
Row 5: cells 1-4 a polite customer-service bow (standing straight with hands on the apron, bending forward from the waist, deepest bow with the head lowered and eyes closed, coming back up halfway); cells 5-8 very happy (big smile with eyes closed and hands clasped, jumping with both arms raised and feet off the ground, top of the jump with two tiny yellow sparkles near her hands, landing with a big smile).
Row 6: cells 1-4 a little flustered but not scared (hands near her cheeks with two small light-blue sweat drops beside her head, the same with hands slightly lower and the drops moved, the same with eyes squeezed shut, scratching the back of her head with an awkward smile); cell 5 writing on a small notepad with a pen; cell 6 holding a paper order ticket and pointing at it with her index finger; cell 7 waving hello with one hand and a smile; cell 8 is a spare cell with NO character, only a small plain closed cardboard box sitting on the ground in the middle of the cell.

Style: crisp pixel art, hard edges, 1-pixel dark outline, limited palette, no anti-aliasing, no blur, no gradients.
Background: one solid flat chroma-key green (#00FF00) over the whole image. No grid lines, no borders, no labels, no text, no numbers, no ground shadows, no lines radiating from the character.
```

### G-3. SD 픽셀 매장·소품: 새 연우 그림체에 맞추기 (2026-10-25, Flow로 제작) ✅ 받음·적용
> 매장 배경은 사용자가 홀을 키우게 고쳐 만든 그림(`px_cafe_room.jpg`)을, 물건은 한 장(`px_cafe_objects.jpg`)을 넣었습니다(검수 문서 N-27). 홀이 큰 그림이라 계산대 쪽에 컵 선반·얼음 자리가 따로 없어, 그 일은 계산대 옆에서 합니다.
새 SD 픽셀 연우는 그림이 섬세한데, 매장 타일(`cafe_tileset`, 16px)·소품(`props`)·효과(`effects`)는 옛 그림(16px을 4배로 키운 납작한 그림)이라 함께 보면 배경이 매우 튑니다(사용자: "배경이 매우 튄다"). 그래서 매장과 물건을 같은 그림체로 다시 만듭니다. 그림체가 어긋나지 않게 **두 장 모두 연우 시트(`px_yeonwoo_sheet`)를 참고 그림(재료)으로** 올립니다.

| 파일 이름 | 무엇 | 비율 | 쓰는 곳 |
| :--- | :--- | :--- | :--- |
| `px_cafe_room` | 근무판 매장 배경 한 장(문·창문·테이블·계산대·진열대·컵 선반·세면대) | 가로(16:9) | 4장 근무판의 매장(지금 1280×448, 가운데 띠를 잘라 씀) |
| `px_cafe_objects` | 가구·소품·효과 시트(8칸 × 7줄 = 56칸, 마지막 칸은 버리는 칸) | 정사각형(1:1) | 쏟은 음료·테이블 닦기·바닥 쓸기의 방, 주문·컵·받기·빵 진열·퇴근 정리의 물건, 거품·물방울·반짝임·세균 효과 |

- **매장 배경은 잘라 씁니다**: 근무판 매장은 가로가 아주 긴 띠(20:7)라 Flow 비율(16:9)로 만든 뒤 가운데를 잘라 씁니다. 그래서 위아래 15%는 벽·바닥만 두게 했습니다. 오른쪽 아래 Gemini 표시(✦)도 잘려 나가는 바닥에 얹힙니다.
- **크기**: 처음 프롬프트(홀·계산대 반반, 위아래 18% 비움)로는 홀이 너무 작게 나왔습니다(사용자). 게임 속 연우 키가 매장 띠 높이의 35%쯤이라, 그림에서 사람이 그림 높이의 1/4쯤 되게 가까이 당기고, 홀을 왼쪽 60%(테이블 셋)·계산대를 오른쪽 40%로 정했습니다. 지금 근무판의 일하는 자리(계산대는 왼쪽에서 55~100%)와도 비슷합니다.
- **연우가 일하는 자리**(계산대·진열대·컵 선반·얼음·세면대·테이블·문)는 그림이 오면 그림 속 위치에 맞춰 코드(`cafe.js` STATION)를 옮깁니다. 프롬프트의 왼쪽→오른쪽 순서는 지금 자리 순서와 같게 썼습니다.
- **물건 시트**는 지금 코드가 쓰는 이름(`paper_cup`·`croissant`·`bubble_small_0`…)으로 잘라 넣어, 부르는 쪽 코드는 거의 그대로 둡니다. 바닥은 생성 그림이 이어 붙이기 어려워 코드로 같은 색의 체크무늬를 그립니다.
- **고르는 법**: 매장은 사람이 없고 글자가 없는 것. 물건 시트는 칸이 고른 격자이고 마지막 칸에 상자만 있는 것. 칸 순서가 조금 바뀌어도 물건을 보고 맞출 수 있습니다.
- **받는 곳**: `assets/_src/pixel/px_cafe_room.jpg` · `assets/_src/pixel/px_cafe_objects.jpg`(원래 파일 이름은 `assets/_src/SOURCES.md`에).

**`px_cafe_room`** (16:9) · 2026-10-25 고침: 홀이 너무 작게 나와서(사용자: "카페 홀이 너무 작게 나온다") 가까이 당겨 크게, 홀을 왼쪽 60%로
```
A pixel-art background of the inside of a cozy bakery cafe, in exactly the same pixel-art style, palette and outline thickness as the reference sprite sheet (crisp pixels, 1-pixel dark outlines, soft warm shading). Use the reference only for the art style; do not draw the character. Wide 16:9 image, 3/4 top-down view like a classic 16-bit RPG interior, seen straight from the front.

Scale: a close, zoomed-in view with big furniture, as if the camera is near. A person standing on the floor would be about one quarter of the image height. Do not show the whole building; the room continues beyond the left and right edges.

Composition (the image will be cropped to a wide strip): the top 15% of the image is only the plain upper wall, and the bottom 15% is only plain floor. Everything important is in the middle band.

The customer hall is the main subject and fills the left 60% of the image: a glass entrance door at the far left with a small hanging sign that shows a coffee cup picture, a tall potted plant next to the door, three wooden cafe tables with two chairs each placed side by side with wide open floor between them, two bright daytime windows on the back wall above the tables, and a small potted plant.

The staff area is only the right 40% of the image: a wooden counter with its top surface and front panel visible. On the counter from left to right: a glass bread showcase full of breads, a cash register, a rack of stacked white paper cups, a holder with clear plastic cups and straws, and an ice and drink station. Behind the counter at the far right: a small hand-washing sink with a simple pictogram poster of washing hands, and a staff door.

Three pendant lamps hang from the ceiling. Floor: light cream and beige checkered tiles, with plenty of open space in front of the counter and between the tables for a character to walk.

No people, no characters, no animals. No text, no letters, no numbers anywhere (signs and posters use simple pictures only). No light rays or glow beams. Bright, warm, friendly daytime colors.
```

**`px_cafe_objects`** (1:1)
```
A clean 2D game asset sheet of cafe objects, props and small effects, in exactly the same pixel-art style, palette and outline thickness as the reference sprite sheet (crisp pixels, 1-pixel dark outline, soft warm shading). Use the reference only for the art style; do not draw the character. Square image, strict grid of 8 columns x 7 rows (56 equal cells). One object per cell, centered, drawn as large as fits with a small margin, in a 3/4 top-down view like a classic 16-bit RPG.

Row 1: glass entrance door with a wooden frame; small square wooden cafe table; round wooden cafe table with two chairs; single wooden chair; tall potted plant; small potted plant; straight piece of wooden counter (top and front panel); yellow wet-floor warning sign with a slipping pictogram.
Row 2: trash bin with a lid; mop in a bucket; broom and dustpan; hand-washing sink with a faucet; window with a bright daytime sky; hanging pendant lamp; wall shelf with bread baskets; glass bread showcase with breads.
Row 3: white paper coffee cup with a sleeve; clear plastic cup with ice cubes; red and white drinking straw; white dome cup lid; Korean salt bread roll; croissant; muffin; hot americano in a white paper cup with the dark coffee visible.
Row 4: cafe latte with heart latte art in a white cup; small milk carton; glass of orange juice; folded yellow dishcloth; stack of white paper cups; light switch on a wall plate; blank staff name badge; one clear ice cube.
Row 5 (two animation frames per effect, side by side): cells 1-2 small soap bubbles (frame 2 slightly moved); cells 3-4 one big soap bubble (frame 2 slightly bigger); cells 5-6 light-blue water drops (frame 2 moved down); cells 7-8 small white four-point twinkle (frame 2 smaller).
Row 6: cells 1-2 big yellow four-point twinkle (frame 2 smaller); cells 3-4 a cute round green germ with a worried face, not scary (frame 2 squished); cells 5-6 red heart (frame 2 smaller); cells 7-8 yellow five-point star (frame 2 tilted).
Row 7: cells 1-2 small grey dust puff (frame 2 bigger and fainter); cells 3-4 white steam wisp (frame 2 moved up); cell 5 wooden serving tray; cell 6 a few pieces of broken glass; cell 7 bread tongs; cell 8 is a spare cell with only a small plain closed cardboard box in the middle.

Background: one solid flat chroma-key green (#00FF00) over the whole image. No grid lines, no borders, no labels, no text, no letters, no numbers, no ground shadows, no lines radiating from anything.
```

### G-4. SD 픽셀 미니게임 사람·물건·얼룩 (2026-10-25, Flow로 제작) ✅ 받음·적용
> 같은 프롬프트로 만든 5장 중 **연우 시트와 같은 픽셀 결이고 칸이 프롬프트대로인 정사각형 1장**(`px_minigame_sheet.jpg`)에서 사람 30장·물건 24개를 잘랐습니다(`npm run pixel` → `assets/pixel/people.png`·`mg_objects.png`, 검수 문서 N-28). 나머지 4장(1376×768)은 매끈한 스티커 그림체라 사람·물건은 쓰지 않고, 두 장에서 한 가지씩만 가져왔습니다: **먼지**(5장 모두 토끼·쥐처럼 그려져서 털뭉치에 가장 가까운 그림을 눈·입을 지워, `px_minigame_dust.jpg`) · **빈 양동이**(이 시트의 양동이는 얼음이 담겨 있어서, `px_minigame_bucket.jpg`). 안 쓴 2장은 휴지통.

매장·가구는 새 그림체가 됐지만, 미니게임 안의 **사람은 동그란 일러스트 얼굴**, **물건·얼룩은 CSS 도형**이라 픽셀 방 안에서 여전히 튑니다(사용자: "테이블 닦기 같은 경우에도 새로 이미지 필요하지 않니?"). 미니게임마다 살펴본 결과:

| 미니게임 | 이미 새 그림 | 아직 옛 그림 → 새로 필요 |
| :--- | :--- | :--- |
| 테이블 닦기 | 바닥·테이블·문·화분·연우 | 앉은 손님(동그란 얼굴) → **앉아서 먹는 손님 6명 · 투덜대는 손님 6명**, 테이블 얼룩(CSS) → **부스러기·커피 자국·끈적한 시럽**, 먹는 동안 **접시·커피잔** |
| 바닥 쓸기·쓰레기 비우기 | 바닥·테이블·계산대·문·화분·종이컵 | 먼지(CSS) → **먼지 3크기**, 휴지·빨대 껍질(선 아이콘) → **휴지·빨대 포장지**, 두고 간 휴대폰(선 아이콘) → **휴대폰**, 지나가는 손님(얼굴) → **걷는 손님**, **쓰레기봉투** |
| 쏟은 음료 | 바닥·가구·주의 표지판 | 손님(얼굴) → **걷는 손님 4명 · 미끄러지는 손님**, 문을 막아 주는 점장님(얼굴) → **팔을 뻗은 점장님**, 웅덩이(CSS) → **주스 웅덩이 2크기** |
| 얼음·컵 받기 | 소품(얼음·컵·빨대·뚜껑) | 제빙기·유리컵 선반·양동이·상자·얼음통·컵 보관대(CSS) → **각각 그림**, 컵을 건네는 점장님·기다리는 손님(얼굴) → **사람 그림** |
| 빵 진열 | 빵·집게 | 진열장·주방 창(CSS)·민재(얼굴) → **빈 진열장·주방 창·빵 쟁반 든 민재** |
| 손 씻기 | 연우·세균·거품 | (꾸밈) **물비누·종이 타월** |
| 주문 담기·컵 채우기·퇴근 정리·메모 쓰기 | 소품 | 카드·목록 화면이라 지금대로 |
| 쉬는 시간 지렁이 | 빵 | 휴대폰 속 게임 모양이라 지금대로 |

- 사람과 물건을 **한 장(8칸 × 7줄 = 56칸, 정사각형)**에: 같은 손님이 줄마다(앉기·투덜·걷기·기다리기) 같은 얼굴·옷이어야 해서 한 번에 만듭니다. 손님 생김새는 일러스트 프롬프트(`tools/credits/image_prompts.mjs`)에서 가져왔습니다.
- **참고 그림**: 연우 시트(`px_yeonwoo_sheet`)와 물건 시트(`px_cafe_objects`)를 둘 다 올립니다(그림체만 참고, 연우는 그리지 않게).
- **받는 곳**: `assets/_src/pixel/px_minigame_sheet.jpg`(원래 파일 이름은 `assets/_src/SOURCES.md`). 마지막 칸은 Gemini 표시를 얹을 버리는 칸.

**`px_minigame_sheet`** (1:1)
```
A clean 2D game asset sheet for cafe minigames, in exactly the same chibi pixel-art style, palette and outline thickness as the reference sprite sheets (crisp pixels, 1-pixel dark outline, soft warm shading). Use the references only for the art style; do not draw the girl in the red apron. Square image, strict grid of 8 columns x 7 rows (56 equal cells). One thing per cell, centered. People are chibi, about 2.5 heads tall, all at the same scale; every person keeps exactly the same face, hair, outfit and colors in every cell they appear in.

The people:
- Customer A: man about 50, short grey hair, navy blazer over a grey turtleneck, beige chinos.
- Student: young man about 21, messy black hair, grey zip-up hoodie over a white T-shirt, light blue jeans.
- Auntie: woman about 55, short curly permed brown hair, beige quilted jacket, grey trousers.
- Office worker: man about 33, navy suit, white shirt, red necktie.
- Hiker: man about 58, bright orange hiking jacket, beige cap, grey trousers.
- Grandma: woman about 78, curly short grey hair, round glasses, terracotta coat.
- Manager: man about 42, short slate grey-green hair, short stubble, white shirt with rolled sleeves, black vest, navy necktie, dark grey trousers.
- Baker: man about 29, short black hair, white baker cap, cream baker jacket, dark brown long apron, big blue earmuffs around his neck.

Row 1: Customer A, Student, Auntie, Office worker, Hiker, Grandma, each sitting on a small wooden chair seen from the front, happily eating or drinking with a cup or bread in hand; then the Manager standing, front view, calm smile; then the Baker standing, front view, small kind smile.
Row 2: the same six customers sitting the same way but annoyed (small frown, arms crossed or pointing down at the table), not scary; then the Manager holding a white paper cup up in one raised hand; then the Baker holding a wooden tray of fresh bread.
Row 3: walking toward the viewer, two frames each (left foot forward, right foot forward): Customer A, Customer A, Student, Student, Auntie, Auntie, Office worker, Office worker.
Row 4: the Office worker slipping on a wet floor, surprised, arms up, not hurt; Customer A looking around worried as if searching for something; Customer A, the Student and the Office worker standing and waiting, a little worried (three cells); the Manager standing with one arm held out to the side, politely stopping people; a crumpled white tissue; a crumpled paper straw wrapper.
Row 5 (objects, front view): an ice machine (wide steel box with a small window and an ice chute at the bottom); a clear drinking glass; an open white plastic ice bucket with a handle; an open brown cardboard box for carrying cups; an open steel ice storage bin; a cup dispenser rack with stacked paper cups; a glass bread showcase seen straight from the front with empty shelves; a kitchen pass-through window opening in a wall with a steel shelf.
Row 6 (mess, seen from above): bread crumbs; a brown coffee ring stain; a sticky yellow syrup spill; a small grey dust bunny; a medium grey dust bunny; a big grey dust bunny; a small orange juice puddle; a big orange juice puddle.
Row 7: a smartphone lying flat; a white plate with a half-eaten croissant; a coffee cup on a saucer; a tied white trash bag; an open trash bag, half full; a liquid soap pump bottle; a stack of folded paper towels; cell 8 is a spare cell with only a small plain closed cardboard box in the middle.

Background: one solid flat chroma-key green (#00FF00) over the whole image. No grid lines, no borders, no labels, no text, no letters, no numbers, no ground shadows, no lines radiating from anything.
```

### H. 작은 이미지 (37장)

**H-1 소품 일러스트 (24장, 160 × 160 PNG)**
- **쓰이는 곳**: 일하는 장면의 물건, 주문서, '손에 넣었어요' 알림, 결과 화면. 버튼 픽토그램(선 아이콘)은 접근성을 위해 그대로 두고, **장면 속 물건만** 그림으로 바꿉니다.
- 블록: `single object game item icon, slight 3/4 top view, cute clean anime illustration, bold outline, simple shading with one highlight, centered, plain solid #00FF00 background`

| ID | 물건 | ID | 물건 | ID | 물건 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `item_saltbread` | 소금빵 | `item_croissant` | 크루아상 | `item_muffin` | 머핀 |
| `item_americano` | 따뜻한 아메리카노(머그) | `item_iced_americano` | 아이스 아메리카노 | `item_latte` | 라테(하트) |
| `item_milk` | 따뜻한 우유 | `item_juice` | 오렌지 주스 | `item_papercup` | 종이컵 |
| `item_icecup` | 투명 아이스컵 | `item_straw` | 빨대 | `item_lid` | 컵 뚜껑 |
| `item_syrup` | 바닐라 시럽 병 | `item_tray` | 트레이 | `item_cloth` | 행주 |
| `item_caution` | 노란 주의 표지판(그림만) | `item_earplugs` | 귀마개 | `item_earmuffs` | 파란 귀덮개 |
| `item_watch` | 금 회중시계(초승달 장식) | `item_postit` | 노란 메모(빈 종이) | `item_contract` | 근로계약서(줄만) |
| `item_payslip` | 급여명세서(줄만) | `item_badge` | 금빛 크루 배지(글자 없음) | `item_camera` | 즉석카메라 |

**H-2 감정 이모트 (12장, 120 × 120 PNG)**
- **쓰이는 곳**: 말하는 사람 머리 옆에 0.8초 동안 뜹니다. **감정을 그림으로도 읽을 수 있게** 돕습니다(감정 이해 지원).
- 블록: `manga emotion symbol sticker, bold outline, flat bright colors, white sticker border, plain solid #00FF00 background`
- `emote_sweat`(땀방울) · `emote_exclaim`(!) · `emote_question`(?) · `emote_idea`(전구) · `emote_heart` · `emote_note`(음표) · `emote_sparkle` · `emote_tear`(눈물 한 방울) · `emote_dots`(…) · `emote_ok`(체크) · `emote_blush`(볼 빗금) · `emote_sigh`(한숨 김)
- 화난 표시(💢)는 넣지 않습니다. 등산복 손님 장면도 위협으로 보이지 않게 `emote_exclaim`으로 처리합니다.

**H-3 버스 (1장, 1400 × 560 PNG)**
- 프롤로그의 '번호 끝까지 읽기' 판단에서 **해솔17 → 해솔07** 버스가 실제로 들어오고 멈추는 애니메이션에 씁니다. 번호는 게임이 덧그립니다.
- `side view of a clean modern Korean city bus, green and white, front destination display blank, route number area blank, plain solid #00FF00 background`

### I. VFX 텍스처 (16장, PNG 투명)
- **방식**: 작은 텍스처 한 장을 코드가 여러 개 뿌리고 크기·회전·투명도를 바꿔 움직입니다(파티클). 그래서 **한 장씩만** 있으면 됩니다.
- 블록: `game VFX particle texture, single element centered, soft edges, plain solid #00FF00 background` (투명 PNG면 더 좋음)

| ID | 크기 | 모양 | 쓰는 순간 |
| :--- | :--- | :--- | :--- |
| `vfx_sparkle` | 128 | 네 갈래 반짝임(흰색) | 좋은 선택, 별 획득, 말 사전 |
| `vfx_star` | 128 | 통통한 노란 별 | 별이 HUD 도장으로 날아감 |
| `vfx_glow` | 256 | 부드러운 빛 덩어리(흰색) | 강조, 컷인 뒤 빛 |
| `vfx_confetti` | 256 | 색종이 6조각(빨강·노랑·민트·하늘) 한 장에 | 에피소드 완료 |
| `vfx_ink` | 256 | 빨간 잉크 튐 | 도장 찍기 |
| `vfx_steam` | 256 | 커피 김 한 줄기(흰색 반투명) | 카운터 배경, 티타임 |
| `vfx_bubble` | 128 | 비누 거품 | 손 씻기 |
| `vfx_drop` | 96 | 물방울 | 손 씻기, 쏟아짐 |
| `vfx_splash` | 256 | 액체 튐(투명한 갈색) | 시럽·주스 쏟아짐 |
| `vfx_puff` | 256 | 동그란 연기 퐁(흰색) | 등장·퇴장, 세균 사라짐 |
| `vfx_flour` | 256 | 밀가루 가루 퐁 | 주방, 민재 |
| `vfx_ring` | 512 | 동그란 소리 파동 링 | 소리 과부하, 귀마개를 끼면 작아짐 |
| `vfx_speedlines` | 1920 × 360 | 가로 집중선 띠(흰색) | '잘했어요' 컷인 |
| `vfx_gear` | 256 | 작은 금빛 톱니바퀴 | 되감기 |
| `vfx_heart` | 128 | 작은 하트 | 칭찬, 할머니 장면 |
| `vfx_paper` | 128 | 종이 조각 | 페이지 넘김, 문서 열기 |

> **대안**: VFX 텍스처는 **Kenney의 Particle Pack(CC0, 출처 표기 의무 없음)**으로 대부분 채울 수 있습니다. 허락해 주시면 제가 받아서 위 ID로 정리하겠습니다(다운로드는 승인 후 진행).

---

## 5. P2 요청

| ID | 크기 | 내용 | 프롬프트 핵심 |
| :--- | :--- | :--- | :--- |
| `title_key` | 1920 × 1080 JPG | 타이틀 키 비주얼 | `Yeonwoo smiling in front of the bakery cafe door in morning light, Dohyun, the manager, Sora and Minjae visible through the big window, inviting and warm, empty space on the right third for menu buttons` |
| `rewind_room` | 1920 × 1080 JPG | 아차! → 되감기 배경('되감기 방') | `inside of a giant antique gold pocket watch, warm amber light, large gears and clock hands, soft bokeh, calm and magical, not scary, center area empty` |
| `cutin_yeonwoo_determined` / `_smile` | 1920 × 360 PNG | 컷인 띠 속 눈 클로즈업 | `extreme close-up horizontal crop of Yeonwoo's eyes and eyebrows, {determined focused look / bright happy smile}, dynamic lighting` |
| 초상 6인 | 900 × 1100 PNG(normal·smile·worried) | 선생님·봉순 할머니·서진·최 대리·루나·아주머니·등산복 | 인물 블록은 [아트 바이블 4.1](art_bible.md) 그대로 + A 구도 블록 |
| `ui_paper` `ui_cork` `ui_kraft` | 512 × 512, 이어 붙는 무늬 | 종이·코르크·크라프트지 질감 | `seamless tileable texture, {cream receipt paper / cork board / kraft paper}, subtle, flat lighting` |
| `ui_tape_yellow` `_mint` `_pink` | 320 × 90 PNG | 마스킹테이프 조각 | `strip of washi masking tape, torn ends, {color}, slightly translucent` |
| `ui_ink` | 512 × 512 PNG | 도장 잉크 질감(모든 도장에 씌움) | `grunge rubber stamp ink texture, red, uneven edges, transparent background` |
| `photo_mom_scarf` `_bread` `_flower` | 620 × 720 JPG | 선물 종류별 엄마 사진 | E의 `mom` + 각 선물 |
| SD 도현·소라 | 320 × 400 PNG | `idle` `point` `thumb` | G 블록 + 인물 블록 |
| `ui/tut_hand` (선택) | 256 × 308 PNG 투명 | 처음 보는 버튼을 짚는 손가락(지금은 SVG). **검지가 곧게 위를 가리키고, 검지 끝이 가로 46%·세로 7% 지점**, 손목(노란 소매)이 아래 | `cartoon white glove hand pointing straight up with index finger, thick dark outline, yellow cuff, flat colors, sticker style, transparent background` |

---

## 6. 움직임과 VFX 계획 (그림이 오면 코드로 붙일 것)

### 6.1 짧은 애니메이션
| 움직임 | 쓰이는 곳 | 필요한 그림 | 차분 모드·움직임 줄이기 |
| :--- | :--- | :--- | :--- |
| 숨쉬기(아주 작게 오르내림) | 무대 위 모든 인물 | A, F | 멈춤 |
| 눈 깜빡임, 말할 때 입 | 대사 중 | C | 그대로(번쩍임 아님) |
| 들어오기·나가기 슬라이드, 놀람 점프, 끄덕임, 인사 | 기존 `motion()` 비트를 스탠딩에 적용 | A, F | 짧은 페이드로 바꿈 |
| 표정 바뀔 때 살짝 튀기 | `face()` | A | 바로 바꿈 |
| 감정 이모트 팝 | 말하는 사람 머리 옆 | H-2 | 페이드만 |
| 꼬마 연우 리액션 | 일하는 장면, 결과 화면 | G | 정지 그림 |
| 버스 들어와서 멈춤 | 프롤로그 정류장 | H-3, B | 바로 멈춘 상태로 |
| 커피 김·오븐 불빛 같은 배경 속 작은 움직임 | 카운터·주방·티타임 | I(`vfx_steam`) | 멈춤 |
| '잘했어요' 컷인 띠 | 좋은 선택 뒤 1.2초 | `vfx_speedlines`, J 컷인 눈(없으면 A에서 잘라 씀) | 띠가 미끄러지지 않고 0.8초 정지 화면 |
| 오늘의 일정 단계 배너 | 단계가 바뀔 때 | 없음 | 페이드만 |
| 장면 전환 와이프(영수증 찢기·포스트잇 넘기기) | 장소가 바뀔 때 | `ui_paper`(선택) | 페이드 |

### 6.2 VFX
| 순간 | 효과 | 텍스처 | 차분 모드 |
| :--- | :--- | :--- | :--- |
| 좋은 선택 | 카드에서 반짝임이 터지고 별이 HUD로 날아가 도장에 박힘 | sparkle, star, glow | 반짝임 수를 줄이고 빛은 없앰 |
| 도장 찍기 | 꾹 눌리는 움직임 + 잉크 튐 + 종이 가루 | ink, paper | 잉크만 |
| 아차! | 노란 '앗' 말풍선 팝 + 땀방울(장난스럽게, 빨간 경고 없음) | emote_sweat | 팝 없이 표시 |
| 되감기 | 회중시계 역회전 + 톱니 입자 + 세피아 + 테이프 되감는 줄무늬 | gear, `rewind_room` | 줄무늬·회전 없음, 세피아만 |
| 말 사전 열기 | 종이가 펼쳐지며 민트빛 반짝 | paper, sparkle | 페이드 |
| 오늘의 한 장 | 셔터 + 사진이 현상되듯 밝다가 색이 돎 | glow | **플래시 없음** |
| 손 씻기 | 거품·물방울, 세균이 '퐁' 하고 사라짐 | bubble, drop, puff | 입자 수 줄임 |
| 쏟아짐(시럽·주스) | 액체 튐 → 주의 표지판 세우면 반짝 | splash, sparkle | 튐 없이 얼룩만 |
| 소리 과부하(3장) | 화면 가장자리에서 소리 링이 퍼짐 → 귀마개를 끼면 링이 작고 흐려짐 | ring | 링 1개, 천천히 |
| 숨 고르기 | 원이 부드럽게 커졌다 작아짐 + 떠오르는 작은 빛 | glow | 그대로(느린 움직임) |
| 에피소드 완료 | 어두운 바탕에 완료 영수증이 나오고 모서리에 도장 + 색종이 (**붉은 바탕·퍼지거나 도는 빛살 금지**: 욱일기 연상, `docs/art_bible.md` 1.1-2) | confetti, ink | 색종이 없이 영수증·도장만 |
| 칭찬·따뜻한 장면 | 하트·음표가 살짝 떠오름 | heart, emote_note | 1개만 |

---

## 7. 그림 없이 코드로 만든 것 (✅ 2026-10-10 구현)
- ✅ 대화창 **동그란 얼굴 아이콘**(스탠딩이 오면 얼굴을 잘라 씀, 지금은 초상), 이름표 탭 이동, 무대에 없는 사람의 이모트는 얼굴 옆에
- ✅ **크루 카드**(클립보드·테이프 붙인 폴라로이드·'MILESTONE 크루/가족' 도장·공책 줄), 처음 만날 때 한 번(`meet` 비트 7곳), 읽어 주기
- ✅ 수첩 **'함께 일하는 사람'** 탭(목록 · 종이 카드 · 큰 그림), 사진첩 **목록 + 큰 인화**(본 이벤트 CG 포함)
- ✅ 장 제목 **이정표 엠블럼 카드**, HUD **지금 장소**, **오늘의 일정 칩 ①②③**(다음 차례 노랑, 끝나면 민트 체크)
- ✅ 일정 **완료 배너**(`check` 비트 27곳, 해낸 직후에만), '자동 저장했어요' 표시
- ✅ '잘했어요' **컷인 띠**(좋은 선택·면접·미니게임 뒤, 스킬 이름과 별), 별이 수첩 버튼으로 날아가 박힘
- ✅ **파티클 장치**: 좋은 카드 반짝임, 도장 잉크, 완료 색종이, 되감기 톱니, 말 사전 반짝임 (텍스처는 SVG 임시 모양 → 그림이 오면 교체)
- ✅ **감정 이모트** 12종 SVG 임시 모양, 표정이 바뀌면 자동으로(긴장·걱정 → 땀, 놀람 → !, 생각 → ?, 슬픔 → 눈물)
- ✅ **스탠딩 무대**(숨쉬기·눈 깜빡임·말하는 입·좌우 반전·표정 바뀔 때 튀기), **이벤트 CG 자리**(`cg` 비트 4곳), 배경·사진 그림 자동 교체
- ✅ 근무표 카드 **썸네일**(마친 날은 '오늘의 한 장', 아직이면 첫 장소 배경, 잠긴 날은 흐리게)
- ⏳ 그림이 와야 하는 것: 판단 화면 옆 '고민하는 연우'(A), 꼬마 연우 리액션(G), 버스 도착 애니메이션(H-3), 미니게임 소품 그림(H-1)

---

## 8. 결정 (✅ 2026-10-10 추천안대로 확정)
| # | 질문 | 결정 |
| :--- | :--- | :--- |
| I-1 | 대화 장면을 **폴라로이드 → 스탠딩**으로 바꿀까요? | 바꿈. 폴라로이드는 '사진'(칭찬 스냅·오늘의 한 장·크루 카드)에만 남겨 모티프를 더 또렷하게 |
| I-2 | 스탠딩이 없는 인물이 스탠딩 인물과 같은 화면에 서면? | F가 오기 전까지는 그 인물만 폴라로이드로 둠(조연 위주라 어색함이 적음) |
| I-3 | 크루 카드를 **손님**에게도 보여 줄까요? | 크루·가족만. 손님 카드는 판단의 정답 힌트가 될 수 있음(절대 원칙 1) |
| I-4 | '잘했어요' 컷인을 언제 보여 줄까요? | 모든 좋은 선택. ★ 개수만 다르게. 차분 모드는 정지 화면 0.8초 |
| I-5 | 오늘의 일정 단계 표시를 위해 9개 대본에 단계 비트를 넣어도 될까요? | 넣음(대사·내용 변화 없음). **단, '다음 단계 시작' 배너 대신 '해낸 직후 완료' 배너로 바꿨습니다.** 일정 항목이 그날의 정답 행동인 날(예: 2일 차 '실수하면 바로 말하기')이 있어, 사건 직전에 띄우면 정답을 미리 알려 주게 되기 때문입니다(절대 원칙 1). |
| I-6 | 프롤로그·면접 날 연우의 **면접 복장**은? | 흰 블라우스 + 남색 니트 조끼 + 검은 바지 + 작은 갈색 크로스백(앞치마는 1일 차부터) |
| I-7 | VFX 텍스처를 Kenney Particle Pack(CC0)으로 먼저 채울까요? | 네. 다운로드는 파일 이름·크기를 확인받은 뒤 진행. 그 전까지는 SVG 임시 모양으로 동작 |

---

## 9. 받는 방법
1. 위 ID 그대로 파일 이름을 붙여 해당 폴더에 넣어 주세요. 일부만 먼저 주셔도 됩니다.
2. 받은 순서대로 제가 연결하고, 화면 캡처로 전후를 보여 드립니다.
3. 그림체가 맞지 않거나 손·글자가 깨진 그림은 [아트 바이블 7장 체크리스트](art_bible.md)로 걸러 다시 요청합니다.
