# [직업 마1스톤] 캐릭터 모션 시트 (Motion Sheet & Keyframe Animation) 명세서

본 문서는 **페르소나 5 스타일의 다이내믹 모션 그래픽**과 **2D 애니메이션(스프라이트/스파인/라이브2D)** 구현을 위한 주인공 3인의 핵심 모션 키프레임 시트 명세서입니다.

---

## 1. 주인공 연우 (Yeonwoo) 모션 시트

| 모션 ID | 모션명 | 프레임 수 / 시간 | 루프 여부 | 설명 및 페르소나 5 연출 큐 |
| :--- | :--- | :--- | :--- | :--- |
| **YW-M01** | **기본 대기 (Idle Breathing)** | 4 프레임 / 1200ms | 무한 루프 | 가슴이 잔잔하게 오르내리며 눈을 부드럽게 깜빡이는 기본 대기 동작. |
| **YW-M02** | **정중한 인사 (Polite Bow)** | 6 프레임 / 800ms | 1회 재생 | 허리를 30도 숙여 두 손을 모으고 인사한 뒤 천천히 일어남. (출근 인사 및 손님 응대) |
| **YW-M03** | **심호흡 (Deep Breathing)** | 8 프레임 / 1500ms | 1회 재생 | 눈을 감고 오른손을 가슴에 얹으며 천천히 숨을 들이쉬고 내쉼. 주변에 부드러운 펄스 이펙트. |
| **YW-M04** | **손 씻기 6단계 (Hand Washing)** | 12 프레임 / 2400ms | 1회 재생 | 소매를 걷고 비누 거품을 내어 손바닥, 손등, 손가락 사이를 꼼꼼히 문지르는 교육용 루틴 모션. |
| **YW-M05** | **트레이 전달 (Tray Serving)** | 6 프레임 / 900ms | 1회 재생 | 빵과 음료가 담긴 트레이를 양손으로 정성스럽게 앞으로 내밀며 미소 짓는 모션. |
| **YW-M06** | **돌발 당황 (Flustered Panic)** | 6 프레임 / 600ms | 부드러운 징검다리 루프 | 시럽을 쏟거나 큰 소리가 났을 때, 눈을 크게 뜨고 어깨를 움츠리며 좌우로 살짝 흔들림. (P5 느낌표 마크 팝업) |
| **YW-M07** | **솔직한 보고 (Honest Report)** | 6 프레임 / 800ms | 1회 재생 | 도현 선배를 향해 허리를 세우고 두 손을 모아 또박또박 보고하는 당당한 결의 포즈. (P5 사선 컷인 연결) |
| **YW-M08** | **정규 크루 승리 (Victory Pose)** | 8 프레임 / 1200ms | 1회 멈춤 | 가슴의 금빛 [MASTER CREW] 배지를 손으로 살짝 가리키며 밝게 웃는 All-Out 피니시 포즈. |

### ▶ 연우 모션 스프라이트 생성 프롬프트 (리셋 후 사용):
> `Animation sprite motion sheet of anime heroine Yeonwoo, Persona 5 cel-shading style. A clean 3x3 grid showing a sequence of 8 keyframe animation poses: 1) idle breathing, 2) polite 30-degree bow, 3) hands on chest deep breathing, 4) washing hands with soap bubbles, 5) carrying bakery tray, 6) flustered surprised look with sweatdrop, 7) determined honest reporting pose, 8) proud victory smile pointing to crew badge. High resolution 2D game sprite sheet, clean white background.`

---

## 2. 선임 멘토 강도현 (Dohyun) 모션 시트

| 모션 ID | 모션명 | 프레임 수 / 시간 | 루프 여부 | 설명 및 페르소나 5 연출 큐 |
| :--- | :--- | :--- | :--- | :--- |
| **DH-M01** | **기본 대기 (Mentor Idle)** | 4 프레임 / 1400ms | 무한 루프 | 한 손을 주머니에 가볍게 넣고 여유롭게 호흡하는 선임의 대기 동작. |
| **DH-M02** | **안경 올리기 (Adjusting Glasses)** | 6 프레임 / 700ms | 1회 재생 | 검지 손가락으로 검은 뿔테 안경 중앙을 툭 밀어 올리며 안경알에 흰색 하이라이트가 번쩍임. (P5 시그니처 컷인) |
| **DH-M03** | **친절한 힌트 가리키기 (Pointing Hint)** | 6 프레임 / 800ms | 1회 재생 | 오른손 검지로 벽면의 [점장님 메모]를 부드럽게 가리키며 연우를 돌아보는 동작. |
| **DH-M04** | **바리스타 추출 (Espresso Brewing)** | 10 프레임 / 2000ms | 1회 재생 | 포타필터를 머신에 체결하고 스팀 피처를 다루며 커피 향을 즐기는 전문적인 작업 모션. |
| **DH-M05** | **함께 청소 (Cooperative Cleaning)** | 8 프레임 / 1600ms | 루프 가능 | 젖은 행주를 들고 시럽이 쏟아진 카운터를 능숙하게 닦아내며 괜찮다는 듯 웃어주는 모션. |
| **DH-M06** | **하이파이브 (Victory High-Five)** | 6 프레임 / 700ms | 1회 멈춤 | 오른손 손바닥을 번쩍 들어 연우와 짝 소리 나게 하이파이브를 마주치는 축하 모션. |

### ▶ 도현 모션 스프라이트 생성 프롬프트 (리셋 후 사용):
> `Animation motion sprite sheet of handsome anime male barista mentor Dohyun, Persona 5 graphic novel aesthetic. 3x3 grid displaying 6 keyframes: 1) relaxed standing idle, 2) finger adjusting black glasses with lens glare flash, 3) smiling and pointing finger toward notice board, 4) operating espresso machine with steam, 5) wiping counter with damp cloth smiling reassuringly, 6) raised palm ready for high-five. Clean 2D character animation model sheet, white background.`

---

## 3. 점장 박건우 (Gunwoo) 모션 시트

| 모션 ID | 모션명 | 프레임 수 / 시간 | 루프 여부 | 설명 및 페르소나 5 연출 큐 |
| :--- | :--- | :--- | :--- | :--- |
| **GW-M01** | **근엄한 관찰 대기 (Manager Idle)** | 4 프레임 / 1600ms | 무한 루프 | 팔짱을 끼고 묵직하게 서서 매장 전체를 예리하게 관찰하는 기본 자세. |
| **GW-M02** | **회중시계 & 장부 점검 (Time Check)** | 8 프레임 / 1400ms | 1회 재생 | 조끼 주머니에서 황금 회중시계를 꺼내 시간을 확인하고 클립보드 장부에 만년필로 체크하는 모션. |
| **GW-M03** | **계약서 건네기 (Handing Contract)** | 6 프레임 / 900ms | 1회 재생 | 책상 위로 표준근로계약서와 펜을 정중하게 내밀며 자리에 앉으라고 권하는 면접 완료 모션. |
| **GW-M04** | **흐뭇한 인정 (Proud Nod)** | 6 프레임 / 1000ms | 1회 재생 | 찌푸렸던 미간을 풀고 눈을 감았다 뜨며 부드러운 미소와 함께 고개를 끄덕이는 신뢰 표정. |
| **GW-M05** | **배지 수여식 (Awarding Badge)** | 8 프레임 / 1500ms | 1회 재생 | 검은 벨벳 상자에서 반짝이는 금빛 배지를 꺼내 연우의 앞치마에 달아주는 명예로운 모션. |

### ▶ 점장님 모션 스프라이트 생성 프롬프트 (리셋 후 사용):
> `Animation keyframe motion sheet of charismatic 42-year-old cafe manager Gunwoo, Persona 5 style cel shading. 3x3 layout of 5 distinct key poses: 1) arms crossed strict standing idle, 2) pulling out golden pocket watch checking time with clipboard, 3) handing over contract paper and pen forward, 4) gentle approving nod with proud smile, 5) pinning golden master crew badge forward. Clean character model sheet, white background.`

---

## 4. 인게임 CSS/JS 모션 구현 규격

웹 및 Electron 런타임 환경에서 위 모션 시트를 실시간으로 구동하기 위해 아래 5가지 핵심 CSS 키프레임 애니메이션 클래스를 제공합니다:

1. `.motion-idle`: `char-breathe` (Y축 4px 상하 부드러운 호흡)
2. `.motion-bow`: `char-bow` (전면 12도 기울임 인사 모션)
3. `.motion-breathe`: `char-deep-breathe` (확대 1.05배 및 펄스 글로우)
4. `.motion-flustered`: `char-flustered-shake` (X축 ±5px 빠른 진동 및 느낌표)
5. `.motion-victory`: `char-victory-bounce` (탄력 있는 팝업 바운스 및 황금빛 글로우)
