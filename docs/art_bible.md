# 직업 마1스톤: 아트 바이블 (v2.0)

> 화면에 보이는 모든 것의 기준입니다. 색·글꼴 토큰은 `css/base.css`, 인물 표정은 `js/data/characters.js`, 배경은 `js/data/backgrounds.js`와 같아야 합니다.
> v1의 시트 문서(`assets/character_*.md`)는 참고용으로 남겨 두었고, 이 문서가 그 내용을 대신합니다.

---

## 1. 비주얼 언어: '마일스톤 팝'

**페르소나 5에서 영감을 받은 고대비 코믹 팝**을 카페라는 일터의 사물로 다시 만든 고유 스타일입니다.

| 모티프 | 화면에서 | 의미 |
| :--- | :--- | :--- |
| 영수증 종이 | 대화창(톱니 모양 윗변, 크림 종이) | 일터의 기록 |
| 가격표 | 이름표(구멍 뚫린 꼬리표 모양) | 모두가 각자의 자리 |
| 포스트잇 | 점장의 노란 메모, 연우의 첫 메모 | 보이는 규칙, 이어지는 마음 |
| 도장 | 완료, 마일스톤 도장, 계약서 서명 | 해냈다는 증거 |
| 폴라로이드 | 칭찬 스냅, 오늘의 한 장, 크루 카드 사진, 엔딩 사진 벽 (스탠딩 그림이 없는 인물의 무대 모습) | 함께한 시간 |
| 클립보드 | 크루 카드(처음 만난 사람 소개) | 함께 일하는 사람 |
| 회중시계 | 되감기 | 다시 해 볼 수 있다 |
| 이정표 | 로고의 '1'(노란 표지판), 간판 | 첫 번째 이정표 |

### 1.1 하지 말 것 (타사 IP)
- 'All-Out Attack', 'Take Your Heart', 예고장(calling card) 디자인, 페르소나 로고나 전용 글꼴 모방, 특정 캐릭터 실루엣 차용.
- 홍보 문구에 "페르소나 5 스타일"을 쓰지 않습니다. 내부 참고로만 씁니다.

### 1.1-2 하지 말 것 (역사·문화)
- **욱일기를 떠올리게 하는 구도**: 붉은(또는 흰) 바탕 + 가운데 원 + 바깥으로 퍼지거나 도는 빛살(선버스트, 방사형 줄무늬, 후광, 집중선 원형 배치). 한국 사용자가 크게 거부감을 느낍니다. 색만 바꾼 변형도 쓰지 않습니다.
- 축하·성공 연출은 **색종이·도장·영수증·폴라로이드**로 합니다. 에피소드 완료 화면은 '완료 영수증이 나오고 모서리에 MILESTONE 도장'입니다.
- 그림 제작 프롬프트에 `sunburst`, `radial rays`, `rising sun`, `radial speed lines background`를 넣지 않습니다. 속도선은 가로 띠(`vfx_speedlines`)만 씁니다.

### 1.2 감각 친화 원칙
- 고대비는 **글자와 버튼**에만 씁니다. 배경은 그보다 한 단계 낮은 대비로 둡니다.
- 번쩍임, 화면 흔들림, 빠른 회전은 짧게 씁니다. **차분 모드와 움직임 줄이기에서는 없앱니다.**
- 실패 연출(아차!)은 꾸중이 아니라 '장난스러운 앗!'이어야 합니다. 주황·노랑 계열을 쓰고, 빨간 경고 아이콘은 쓰지 않습니다.

---

## 2. 색과 글꼴

| 토큰 | 마일스톤 팝 | 차분 모드 | 쓰임 |
| :--- | :--- | :--- | :--- |
| `--red` | `#E3262E` | `#C8575B` | 브랜드, 이름표, 주요 버튼 |
| `--ink` | `#17141C` | 같음 | 글자, 외곽선 |
| `--paper` / `--cream` | `#FFFDF8` / `#FFF7E8` | 같음 | 대화창, 카드, 창 배경 |
| `--yellow` | `#FFD43B` | `#F4DC86` | 메모, 강조, 별 |
| `--mint` | `#16A99A` | 같음 | 도움, 말 사전, 숨 고르기, 스캔 표시 |
| `--sky` | `#3D8BD9` | 같음 | 되감기, 자유 선택 |
| 아차 | `#F59E0B` | 같음 | 실패 결과 카드 |
| 인물 색 | 연우 `#E3262E` · 도현 `#7A1F2B` · 점장 `#3E4B4F` · 소라 `#FF7A59` · 민재 `#B8864A` · 엄마 `#8C7AE6` · 선생님 `#3FA46A` · 지호 `#3D8BD9` | | 이름표, 말하는 사람 테두리 |

- **글꼴은 게임에 넣은 파일만 씁니다**(2026-10-11): `assets/fonts/PretendardVariable.woff2`(SIL OFL, 라이선스 `OFL-Pretendard.txt`). PC에 설치된 글꼴에 기대지 않으므로 학교 PC마다 모양이 같습니다.
- **본문 글꼴**: Pretendard(가변, 굵기 45~920).
- **제목 글꼴**: Black Han Sans 1.001(SIL OFL, `assets/fonts/BlackHanSans-Regular.ttf`, 라이선스 `OFL-BlackHanSans.txt`, Google Fonts 공식 저장소에서 받음). 게임에 쓰인 한글은 모두 들어 있습니다. 없는 글자가 생기면 Pretendard의 가장 굵은 굵기('Milestone Display')로 보입니다.
- 본문 크기(1080p 기준): 보통 36px, 크게 42px, 아주 크게 48px. 줄 간격 1.55. 한 줄 약 30~35자.

---

## 3. 인물

### 3.1 현재 상태 (프로토타입)
- 주요 3인(연우·도현·점장)은 캐릭터 설정화에서 **표정 초상 13장**을 잘라 폴라로이드 액자에 넣었습니다. 흰 배경은 '사진'으로 보이도록 의도한 것입니다.
- 조연 12인은 **임시 SVG 초상**(`js/data/portrait-svg.js`)입니다. 일러스트가 생기면 `characters.js`에 `faces`를 추가하면 교체됩니다.

### 3.1.1 대화 장면은 스탠딩으로 (2026-10-10 결정, `docs/image_requests.md` I-1·I-2)
- 대화 무대는 **상반신 스탠딩**(`assets/stand/{id}_{face}.png`, 900 × 1100)으로 바꿉니다. 인물마다 `_normal`이 들어오면 그 인물부터 자동으로 바뀝니다.
- 폴라로이드는 **'사진' 연출**(칭찬 스냅, 오늘의 한 장, 크루 카드, 엔딩 사진 벽)에만 남겨 모티프를 또렷하게 합니다.
- 스탠딩이 아직 없는 인물은 같은 화면에서도 폴라로이드로 섭니다(조연 위주라 어색함이 적음).
- 그림 속 인물이 바라보는 쪽은 `characters.js`의 `look`(연우 오른쪽, 나머지 왼쪽)입니다. 반대쪽 자리에 서면 좌우를 뒤집으므로 명찰·소품에 글자를 넣지 않습니다.
- 대화창 얼굴 아이콘은 스탠딩에서 잘라 씁니다. 잘라 낼 위치가 어긋나면 `characters.js`의 `faceBox: [크기%, 가로%, 세로%]`로 맞춥니다.

### 3.2 최종 일러스트 규격
| 항목 | 기준 |
| :--- | :--- |
| 형식 | PNG(투명 배경) 또는 고품질 JPG(흰 배경, 폴라로이드용) |
| 크기 | 초상 720×836(2배 해상도, 비율 0.86) / 스탠딩(선택) 1200×2400 |
| 파일 이름 | `assets/portraits/{id}_{face}.png` 예: `yeonwoo_nervous.png` |
| 화풍 | 깔끔한 셀 셰이딩, 굵은 외곽선, 채도 중간. 세 사람의 그림체를 반드시 통일 |
| 시선 | 정면 또는 약간 측면, 어깨선까지 |

### 3.3 표정 목록 (필요 수량)
| 인물 | 지금 있음 | 더 필요함 |
| :--- | :--- | :--- |
| 연우 | normal, smile, nervous, determined | **sad(울먹), surprised, think, proud(뿌듯)** |
| 도현 | normal, smile, teach, glasses | **worried, surprised** |
| 점장 | normal, strict, think, smile, front | **sad(고백 장면의 쓸쓸한 미소)** |
| 소라 · 민재 · 엄마 · 지호 | (임시) | normal, smile, worried, surprised |
| 선생님 · 봉순 할머니 · 서진 | (임시) | normal, smile, worried |
| 손님 4명(최 대리·루나·아주머니·등산복) | (임시) | normal, angry/worried, surprised |

### 3.4 의상과 소품 일관성
- **연우**: 흰 셔츠(소매 걷음), **빨간 앞치마**, 검은 바지, 흰 운동화, 왼손목 실 팔찌. 명찰에는 "정연우 · 신입 크루"라고 또렷하게 씁니다(스탠딩은 좌우 반전을 위해 빈 명찰). 3장 이후에는 앞치마 왼쪽 가슴에 금빛 'MILESTONE CREW' 배지를 답니다.
- **연우의 면접 복장**(프롤로그·1장, 2026-10-10 결정 I-6): 흰 블라우스 + 남색 니트 조끼 + 검은 바지 + 작은 갈색 크로스백. 앞치마와 명찰은 1장 끝에 받고, 1일 차부터 입습니다.
- **도현**: 흰 셔츠, 회색 조끼, 와인색 넥타이, 검은 뿔테 안경. 앞치마는 없습니다(바리스타 선임).
- **점장**: 회녹색 머리, 짧은 수염, 검은 조끼, 남색 넥타이, 금 회중시계와 초승달 장식, 메모장과 펜.
- **가게 로고**: 앞치마와 간판 모두 **CAFE MILESTONE**입니다. 이정표 모양 로고(노란 기둥과 빨간 화살표 깃발)를 씁니다.

### 3.5 현재 시트의 품질 문제 (최종 일러스트에서 고칠 것)
- [ ] 점장 시트 앞치마 주머니에 **'CAFÉ LUMINA'** 문구 → 'CAFE MILESTONE'으로
- [ ] 연우 명찰 글자 깨짐("YEONIAOO") → 한글 "정연우"
- [ ] 점장 시트의 깨진 라벨("High-resolt amdige")과 색상 견본이 초상 근처에 있음
- [ ] 세 시트의 그림체(선 굵기, 명암)가 조금씩 다름 → 한 작가 또는 같은 설정으로 다시 만들기
- [ ] 전신 시트만 있고 표정별 상반신이 부족함 → 3.3의 표정 목록대로

---

## 4. 이미지 생성 프롬프트

> 생성 이미지는 **같은 스타일 블록**을 붙여 일관성을 지킵니다. 결과물은 사람이 손으로 보정하고, 생성 도구 약관(학교 배포 가능 여부)을 확인한 뒤 `assets/CREDITS.md`에 기록합니다.

**공통 스타일 블록**
```
clean modern anime cel-shading, bold clean black outlines, medium saturation, warm bakery-cafe palette
(crimson red #E3262E accents, cream, warm brown), soft studio lighting, consistent character design,
upper-body portrait, facing viewer, plain white background, high resolution
```
**공통 제외(네거티브)**
```
text, letters, watermark, logo, signature, extra fingers, deformed hands, persona 5 logo, calling card, red-black ransom note letters
```

### 4.1 새 인물 설정화
| 인물 | 프롬프트(스타일 블록 앞에 붙임) |
| :--- | :--- |
| 소라 | `Korean woman age 23, university design student working part-time at a bakery cafe, high ponytail with coral hair tie, round glasses, white shirt and crimson red apron with three pens in the pocket, instant film camera on a strap around the neck, bright energetic smile` |
| 민재 | `Korean man age 29, quiet gentle baker, short black hair, white baker cap, flour smudge on cheek, cream baker jacket, big blue noise-cancelling earmuffs resting around his neck, small kind smile, calm eyes` |
| 엄마 | `Korean woman age 48, warm caring mother, hair in a low bun, lavender cardigan over a simple blouse, gentle worried eyes, holding a small yellow sticky note` |
| 김선영 선생님 | `Korean woman age 38, special education teacher, shoulder-length hair, square glasses, green cardigan, ID lanyard, firm and kind expression` |
| 지호 | `Korean young man age 19, nervous first day at work, messy black hair, white shirt and crimson red apron, fiddling with a button, shy hopeful face` |
| 봉순 할머니 | `Korean grandmother age 78, curly short grey hair, round glasses, warm terracotta coat, wooden cane, kind wrinkled smile` |
| 서진 | `Korean woman age 31, office worker using a manual wheelchair, bob haircut, teal blazer, confident friendly smile, wheelchair push handles visible behind shoulders` |
| 최 대리 | `Korean man age 33, rushed office worker, navy suit, loosened red tie, checking his wristwatch, impatient frown` |
| 루나 | `Korean woman age 22, trendy social media influencer, red beret, pastel pink oversized jacket, holding a smartphone up to take a photo, playful smile` |
| 장바구니 아주머니 | `Korean woman age 55, hurried shopper carrying many shopping bags and an umbrella, short permed hair, beige coat, flustered apologetic face` |
| 등산복 아저씨 | `Korean man age 58, bright orange hiking jacket and cap, arms crossed, loud angry expression (not violent), slightly comical` |

표정 시트를 만들 때는 `character expression sheet, 4 expressions in a 2x2 grid: neutral, smile, worried, surprised`를 덧붙입니다.

### 4.2 배경 (16:9, 3840×2160 → 1920×1080으로 줄여 씀)
공통: `anime visual novel background, no people, clean flat-shaded painterly style, soft halftone texture, 16:9, eye-level, uncluttered lower third (dialogue box area)`

| ID_변형 | 장면 | 프롬프트 핵심 |
| :--- | :--- | :--- |
| `home_night` / `home_morning` | 연우의 방 | `small tidy bedroom, yellow curtains, window with moon (night) / morning sun, desk with lamp, cork board with three pictogram schedule cards (07:00 alarm, 08:20 bus, 08:50 cafe), white shirt on hanger` |
| `living` | 거실(저녁) | `cozy Korean apartment living room at dusk, small dining table with lamp, warm orange window light` |
| `bus_stop_morning` / `_evening` | 정류장 | `clean Seoul neighborhood bus stop, green shelter, LED arrival board, yellow tactile paving, ginkgo trees` |
| `cafe_front_morning` / `_evening` | 가게 앞 | `charcoal brick bakery cafe, crimson red scalloped awning, gold sign CAFE MILESTONE (render sign text separately), warm window light, A-frame board` |
| `counter_morning` / `_day` / `_peak` / `_closing` | 홀·카운터 | `wooden counter, pastry showcase, chalkboard menu, espresso machine, cup dispenser, pendant lights; peak = silhouettes of a crowd; closing = warm dim light` |
| `office` | 점장실 | `manager office, venetian blinds casting stripes, dark wood desk with contract papers and pocket watch, binders, framed certificates, coffee sacks` |
| `staff` | 직원 공간 | `staff room, lockers, mirror, sink with soap dispenser, hand-washing 6-step poster, cork memo board, polaroid photo wall` |
| `kitchen` | 주방 | `bakery kitchen, deck oven glowing, red stand mixer, bread racks, flour sacks, white tiles` |
| `tea` | 휴게 | `small break nook, window daylight, round table with two mugs, plant` |
| `school` | 교실(회상, 세피아) | `special education classroom, green chalkboard (text added in-game), soft sepia memory tone` |

> 간판·메뉴판·포스터의 **글자는 생성하지 말고** 게임에서 덧그립니다. 생성형 글자는 깨지기 쉽습니다.

### 4.3 오늘의 한 장 (폴라로이드 10장, 최종 일러스트 권장)
| ID | 장면 |
| :--- | :--- |
| note | 버스 창가에서 엄마의 노란 쪽지를 펼친 손 |
| contract | 계약서 위 빨간 도장 클로즈업, 연우의 손 |
| minjae | 귀덮개를 보여 주며 웃는 민재, 밀가루 묻은 볼 |
| open | OPEN 푯말을 돌리는 연우, 문 너머 봉순 할머니 |
| grandma | 두 손으로 트레이를 건네는 연우와 소금빵 |
| latte | 하트 라테만 찍힌 사진(얼굴 없음) |
| tea | 창가의 머그잔 두 개, 도현의 손 |
| badge | 금빛 배지를 단 연우와 하이파이브 |
| memo | 점장 메모 옆에 붙은 연우 글씨의 노란 메모 |
| mom | 선물을 받고 웃으며 눈가를 닦는 엄마 |

---

## 5. 픽토그램
- 64×64, 선 굵기 4, 둥근 끝, `currentColor`, 한 그림에는 한 행동이나 물건만 담습니다. 항상 글자 라벨과 함께 씁니다.
- 현재 약 100종(`js/data/icons.js`). 손 씻기 6단계는 숫자와 함께 표시합니다(질병관리청 6단계 순서).
- ARASAAC 등 **비영리 조건** 상징은 쓰지 않습니다(학교 배포 조건 충돌).

## 6. 픽셀 아트(미니게임용, 검토 중)
규격과 1차 목록은 [에셋 요청 목록 7장](asset_requests.md)에 있습니다. 480×270 → 4배 확대, 16px 타일, 32색 고정 팔레트, Aseprite 태그 이름을 애니메이션 ID로 씁니다.

## 7. 에셋 검수 체크리스트
- [ ] 파일 이름과 ID가 문서와 같은가
- [ ] 인물 그림체와 의상이 3.4와 같은가(앞치마 색, 명찰, 로고)
- [ ] 글자가 들어간 그림에 깨진 글자가 없는가
- [ ] 대화창 영역(아래쪽 1/3)에 중요한 정보가 없는가
- [ ] 차분 모드에서 너무 어둡거나 탁하지 않은가
- [ ] 출처와 라이선스를 `CREDITS.md`에 적었는가
