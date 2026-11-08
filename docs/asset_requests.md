# 직업 마1스톤: 에셋 요청 목록 (BGM·효과음·환경음·음성·픽셀 아트)

> 이 목록의 **파일 이름(ID)** 그대로 저장해서 아래 폴더에 넣어 주시면, `npm run assets` 한 번으로 게임에 자동 적용됩니다.
> 파일이 없는 항목은 게임이 **합성음으로 대신 재생**하므로, 준비되는 순서대로 하나씩 넣어도 됩니다.

| 종류 | 폴더 | 형식 |
| :--- | :--- | :--- |
| 배경음악 | `assets/audio/bgm/` | `.ogg`(권장) 또는 `.mp3` |
| 짧은 음악(징글) | `assets/audio/sfx/` | `.ogg` / `.mp3` / `.wav` |
| 효과음 | `assets/audio/sfx/` | `.ogg` / `.mp3` / `.wav` |
| 환경음(반복) | `assets/audio/amb/` | `.ogg` / `.mp3` |

우선순위: **P0** = 첫 시연에 꼭 필요 / **P1** = 있으면 몰입도가 크게 오름 / **P2** = 여유 있을 때

> **적용 현황 (2026-10-10)**: 보내 주신 사운드 팩에서 **67개를 적용**했습니다(배경음악 12 · 효과음·징글 52 · 환경음 3). 고른 파일과 이유는 `assets/audio/CREDITS.md`, 바꾸는 법은 `tools/audio/audio_map.mjs`(고친 뒤 `npm run audio`)에 있습니다.
> - **배경음악 교체 (2026-10-11)**: 앰비언트 곡이 너무 우울하다는 의견에 따라, 새로 주신 **Visual Novel / Anime Music Pack v2**로 11곡을 바꿨습니다. 아침은 '새로운 하루의 에너지', 일하는 장면은 '방과 후 산책', 피크타임은 '파티', 쉬는 시간은 '나른한 오후', 집은 오르골, 면접은 메인 테마 피아노, 결과 화면은 '즐거운 시간'입니다. 소리 과부하(`overload`)만 연출상 기존 먹먹한 드론을 유지합니다. 들어 보고 바꿀 곡은 ID만 알려 주세요.
> - **매장 웅성거림 끔 (2026-10-11)**: 카페 매장·주방 장면의 환경음(`cafe` 웅성거림, `kitchen` 합성 소음)을 쓰지 않습니다. `crowd`는 3장 소리 과부하 장면에서만 판단이 끝날 때까지 짧게 납니다.
> - **아직 필요한 소리(합성음으로 재생 중)**: 효과음 `snap`(폴라로이드 셔터) · `shutter_phone`(휴대폰 셔터) · `bus`(버스 도착) · `espresso`(커피 머신) · `steam`(우유 스팀) · `mixer`(반죽기) · `mug`(머그 내려놓기), 환경음 `street`(정류장 아침 거리) · `kitchen`(주방) · `classroom`(교실).

> **그림(스탠딩·배경·이벤트 CG·오늘의 한 장·꼬마 캐릭터·소품·이모트·VFX 텍스처)은 [이미지 요청서](image_requests.md)에 따로 있습니다.**

---

## 1. 배경음악 (BGM): 12곡

| ID (파일 이름) | 쓰이는 장면 | 분위기 · 악기 제안 | 빠르기 | 길이·반복 | 우선 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `title` | 타이틀, 근무표(에피소드 선택) | **메인 테마**. 설레고 따뜻함. 피아노, 어쿠스틱 기타, 가벼운 브러시 드럼 | 90~100 | 1:30~2:00 반복 | P0 |
| `cafe` | 카페 일상, 루틴, 미니게임 (**가장 많이 들림**) | 로파이 재즈, 보사노바. 오래 들어도 지치지 않게 단순하게 | 75~90 | 2:00 이상 반복 | P0 |
| `morning` | 출근길, 아침 준비, 월급날 아침 | 경쾌하고 희망참. 우쿨렐레, 글로켄슈필, 박수 | 95~110 | 1:30 반복 | P0 |
| `home` | 연우의 방(밤), 엄마와의 장면 | 잔잔한 피아노와 오르골, 조용한 밤 | 60~70 | 1:30 반복 | P0 |
| `tension` | 사건 발생(시럽 사고, 실수, 낯선 손님) | **가벼운** 긴장. 피치카토 현, 낮은 맥박. 무섭지 않게 | 75~85 | 1:00 반복 | P0 |
| `warm` | 감동 장면(도현의 고백, 점장의 비밀, 엄마의 눈물) | 피아노와 현악 발라드 | 60~70 | 2:00 반복 | P0 |
| `interview` | 1장 면접, 근로계약서 | 차분하지만 살짝 긴장됨. 미니멀 피아노와 패드 | 70 | 1:30 반복 | P1 |
| `peak` | 3장 피크타임 | 분주하지만 즐거움. 펑크나 스윙, 베이스가 통통 튐. **불안감 주지 않게** | 110~125 | 1:30 반복 | P1 |
| `overload` | 3장 소리 과부하 순간 | 앰비언트 드론, 먹먹한 질감. 멜로디 없음 | 자유 | 0:45 반복 | P1 |
| `tea` | 5일 차 티타임 | 어쿠스틱 기타 잔잔함 | 80 | 1:30 반복 | P2 |
| `celebrate` | 배지 수여, 에피소드 완료 화면 | 밝은 팡파르와 리듬 | 110 | 0:30 반복 | P1 |
| `ending` | 엔딩 몽타주, 크레디트 | 메인 테마 편곡(피아노, 현, 드럼). 마지막에 벅차게 | 70~80 | 2:30~3:00 (반복 안 함) | P1 |

> 작곡 팁: `title`의 멜로디(4~8마디)를 `warm`과 `ending`에서 다시 쓰면 '주제 선율'이 생겨 감동이 커집니다.

---

## 2. 징글 (짧은 음악): 6개

| ID | 쓰이는 때 | 느낌 | 길이 | 우선 |
| :--- | :--- | :--- | :--- | :--- |
| `jingle_complete` | 에피소드 완료 도장 | 밝고 짧은 성공 | 2~4초 | P0 |
| `jingle_oops` | **아차! 카드** (실패 결과) | 장난스럽고 부드러운 "띠옹". 꾸중처럼 들리면 안 됨 | 1~1.5초 | P0 |
| `jingle_rewind` | **회중시계 되감기** | 테이프 되감기와 태엽 역회전이 섞인 소리 | 1~1.5초 | P0 |
| `jingle_badge` | 정규 크루 배지 수여 | 웅장하고 따뜻함 | 3~5초 | P1 |
| `jingle_unlock` | 새 낱말, 사진, 아차 카드 수집 | 반짝이는 소리 | 1초 | P1 |
| `jingle_payday` | 월급 입금 알림 | 동전과 반짝임 | 1~2초 | P2 |

---

## 3. 효과음 (SFX)

### 3.1 화면 조작 (UI): 14개
| ID | 쓰이는 때 | 메모 | 우선 |
| :--- | :--- | :--- | :--- |
| `tap` | 버튼 누름 | 아주 짧고 부드럽게 | P0 |
| `next` | 대사 넘김 | 거의 안 들릴 만큼 작게 (수천 번 들림) | P0 |
| `focus` | 카드에 초점, 스캔 이동 | 아주 작은 틱 | P1 |
| `good` | 올바른 선택 | 기분 좋은 3음 상승 | P0 |
| `great` | **한 번에** 맞힘 | `good`보다 반짝임 추가 | P0 |
| `hint` | 도와주세요 버튼, 힌트 | 부드러운 마림바 2음 | P0 |
| `stamp` | 도장 쾅 | 묵직하지만 부드럽게 | P0 |
| `snap` | 칭찬 사진(폴라로이드) | 즉석카메라 셔터 + 필름 나오는 소리 | P0 |
| `page` | 메모·서류·수첩 넘김 | 종이 사락 | P0 |
| `whoosh` | 장면 전환 | 바람 스침 | P1 |
| `open` / `close` | 창 열기·닫기 | 짧은 팝 | P1 |
| `heart` | 감동 순간 강조 | 맑은 종 두 음 | P1 |
| `coin` | 월급, 시급 표시 | 동전 | P2 |
| `cheer` | 에피소드 완료 축하 | 박수 소리 섞인 팡파르 (`jingle_complete`와 함께 써도 됨) | P1 |
| `breathIn` / `breathOut` | 숨 고르기 (4초 들이쉬기 / 4초 내쉬기) | 아주 부드럽게 올라가는 / 내려가는 소리. 4초 길이 | P1 |

### 3.2 장면 속 소리 (귀마개를 끼면 먹먹해지는 소리): 30개
| ID | 장면 | 우선 |
| :--- | :--- | :--- |
| `bell` | 카페 문 종 (딸랑) | P0 |
| `knock` | 노크 세 번 (똑똑똑) | P0 |
| `door` | 문 열림·닫힘 | P0 |
| `phone` | 휴대폰 진동 (문자) | P0 |
| `alarm` | 알람시계 (부드러운 소리) | P1 |
| `bus` | 버스 도착, 브레이크, 문 열림 | P0 |
| `card_beep` | 교통카드 '삑' | P1 |
| `pen` | 출근 기록부에 쓰기 | P1 |
| `seal` | 계약서 도장 찍기 | P0 |
| `water` | 수도꼭지 물 | P0 |
| `bubbles` | 비누 거품 뽀글 | P0 |
| `towel` | 종이 타월 뽑기 | P1 |
| `clink` | 컵 부딪힘 | P0 |
| `stack` | 컵 쌓기 딸깍 | P0 |
| `pour` | 음료 따르기 | P0 |
| `ice` | 얼음이 컵에 떨어짐 | P1 |
| `espresso` | 커피 머신 추출 | P1 |
| `steam` | 우유 스팀 | P2 |
| `spill` | 시럽이나 주스 쏟아짐 | P0 |
| `wipe` | 행주로 닦기 | P0 |
| `mop` | 대걸레질 | P2 |
| `sign` | 주의 표지판 펼치기, OPEN 푯말 돌리기 | P0 |
| `tray` | 트레이 내려놓기 | P0 |
| `pos` | 포스기 버튼, 영수증 출력 | P1 |
| `mixer` | 반죽기 (크지만 귀가 아프지 않게, 최대 -6 dBFS) | P0 |
| `oven` | 오븐 '띵' | P2 |
| `beep` | 제빙기 고장 경고 (삐삐삐) | P0 |
| `shutter_phone` | 스마트폰 카메라 셔터 (4일 차) | P0 |
| `highfive` | 하이파이브 짝 | P0 |
| `mug` | 머그잔 내려놓기 (티타임) | P2 |

### 3.3 실패 결과 장면용 (아차! 장면): 6개
> 시행착오가 게임의 중심입니다. **결과는 분명하게, 소리는 다치지 않게.** 폭력적이거나 귀를 찌르는 소리는 피해 주세요.

| ID | 실패 장면 | 우선 |
| :--- | :--- | :--- |
| `slip` | 손님이 미끄러져 엉덩방아 (쿵, 아이고) | P0 |
| `glass_break` | 유리컵 깨짐 (작고 짧게) | P1 |
| `crowd_angry` | 손님들 웅성웅성 불만 | P1 |
| `crash_small` | 물건이 우르르 쏟아짐 (컵 탑 무너짐) | P1 |
| `tick_fast` | 시간이 흘러가는 시계 소리 (늦음) | P1 |
| `sad_trombone` | 아주 짧은 '빠밤' (웃음 포인트, 선택적) | P2 |

---

## 4. 환경음 (반복): 6개

| ID | 장면 | 메모 | 우선 |
| :--- | :--- | :--- | :--- |
| `cafe` | ~~카페 평소~~ **쓰지 않음**(2026-10-11 사용자: 웅성거림이 거슬림) | 낮은 웅성거림, 가끔 컵 소리 | - |
| `crowd` | 3장 소리 과부하 장면에서만(판단이 끝나면 꺼짐) | 여러 사람 목소리가 겹침. 3장 과부하 장면의 핵심 | P0 |
| `street` | 버스 정류장, 아침 거리 | 차 지나가는 소리, 새소리 | P0 |
| `kitchen` | 주방 | 오븐과 환풍기 웅웅 | P1 |
| `home` | 연우의 방(밤) | 시계 째깍, 멀리 차 소리 | P1 |
| `classroom` | 교실 회상 | 아이들 소리 (멀리, 흐릿하게) | P2 |

- 30~60초, **끊김 없이 반복**되게 만들어 주세요.

---

## 5. 기술 규격

| 항목 | 기준 |
| :--- | :--- |
| 샘플레이트 | 44.1kHz 또는 48kHz |
| 음량 | BGM 약 -18 LUFS / 효과음 최고 -3 dBFS / 환경음 약 -26 LUFS |
| 반복 | BGM·환경음은 파일 전체가 끊김 없이 반복되어야 함 (앞뒤 무음 없이) |
| 효과음 앞뒤 | 앞 무음 0초, 끝에 10~50ms 페이드 |
| 라이선스 | 앱에 넣어 **학교에 배포해도 되는** 조건인지 확인. 출처·라이선스를 `assets/audio/CREDITS.md`에 적어 주세요 |

### 감각 친화 원칙 (중요)
1. **갑작스러운 큰 소리 금지.** 모든 소리는 부드럽게 시작합니다(어택 5ms 이상).
2. **귀를 찌르는 높은 소리 금지.** 8kHz 이상은 줄여 주세요.
3. **실패 소리는 꾸중이 아니라 '아차!'** 처럼 들려야 합니다. 부저나 경고음 같은 소리는 쓰지 않습니다.
4. 피크타임 음악도 **신나는 분주함**이어야 합니다. 공포나 압박감을 주면 안 됩니다.
5. 게임 안 **차분 모드**에서는 효과음과 음악이 자동으로 25% 작아집니다.

---

## 6. 대사 음성 (로컬 TTS: Supertonic 3)

대사 음성은 직접 녹음하지 않고, PC에 있는 **Supertonic 3 로컬 TTS**로 자동 생성합니다.
- 생성: `npm run voices` (대본에서 대사를 뽑고 → Supertonic으로 음성을 만들고 → `assets/voice/`에 저장)
- 대사를 고치면 바뀐 줄만 다시 만들어집니다. 음성 파일이 없는 줄은 브라우저 읽어 주기(Web Speech)로 대신합니다.
- **목소리 배정은 `tools/voice/voice_cast.json`에서 바꿀 수 있습니다.** 샘플은 Supertonic 폴더의 `public/voice-samples/`에서 들어 보세요.

| 인물 | 제안 목소리 | 빠르기 | 이유 |
| :--- | :--- | :--- | :--- |
| 연우 (대사·나레이션·속마음) | F2 | 1.0 | 또렷하고 젊은 목소리 |
| 도현 | M2 | 1.0 | 부드러운 청년 |
| 점장님 | M4 | 0.95 | 낮고 차분함 |
| 소라 | F3 | 1.1 | 밝고 빠름 |
| 민재 | M3 | 0.92 | 조용하고 느림 |
| 엄마 | F4 | 0.95 | 따뜻한 중년 |
| 선생님 | F5 | 1.0 | 단단함 |
| 지호 | M1 | 1.0 | 앳된 목소리 |
| 봉순 할머니 | F1 | 0.85 | 느린 말투 |
| 손님들 | M5 / F1 / F3 등 | 1.0 | `voice_cast.json` 참고 |

> 목소리를 들어 보시고 바꾸고 싶은 배정이 있으면 알려 주세요.

---

## 7. 픽셀 아트 (일하는 장면용)

> **적용 현황 (2026-10-10)**: 아래 7.3의 1차 목록을 Codex가 만든 시트(`assets/pixel/`)로 미니게임 5종에 적용했습니다. 다듬거나 다시 그리려면 같은 이름·규격으로 바꿔 넣으면 됩니다.

> 이야기 장면(대화)은 지금처럼 **일러스트 + 폴라로이드**로 두고, 손 씻기·컵 채우기·주문 확인·퇴근 전 정리 같은 **일하는 장면(미니게임)**을 픽셀 아트로 바꾸는 안입니다.
> 미니게임은 화면 그리기와 규칙이 분리되어 있어서, 픽셀 그림만 바꿔 끼우면 됩니다.

### 7.1 Aseprite 구매 여부
- **픽셀 아트를 직접 그리거나 수정할 계획이면 구매를 권합니다.** 픽셀 아트 업계의 표준 도구입니다.
- 구매 후 설치 경로를 알려 주시면, **Aseprite 명령줄(CLI)로 `.aseprite` 파일을 스프라이트 시트(PNG)와 데이터(JSON)로 자동 변환**하는 파이프라인을 연결하겠습니다.
  - 예: `aseprite -b cups.aseprite --sheet cups.png --data cups.json --format json-array --list-tags`
- 그림을 외주로 받거나 다른 도구로 만든다면 구매하지 않아도 됩니다(PNG 시트와 프레임 정보만 있으면 됨).

### 7.2 픽셀 아트 규격 (제안)
| 항목 | 기준 |
| :--- | :--- |
| 기본 해상도 | 480 × 270 (화면에서 정확히 4배 확대 → 1920 × 1080) |
| 타일 | 16 × 16 |
| 인물 스프라이트 | 24 × 40 (머리가 큰 2.5등신, 표정이 보이게) |
| 팔레트 | 32색 고정 팔레트 (마일스톤 레드 `#E3262E`, 포스트잇 옐로 `#FFD43B`, 크림 `#FFF7E8`, 잉크 `#17141C` 포함). `.gpl` 파일로 드릴 수 있습니다 |
| 애니메이션 태그 | `idle`, `walk`, `wash`, `carry`, `wipe`, `bow`, `panic`, `happy` (Aseprite 태그 이름 그대로 사용) |
| 내보내기 | PNG 시트 + JSON (json-array, 태그 포함) |

### 7.3 1차로 필요한 픽셀 그림
1. 연우 스프라이트: `idle`, `walk`(4방향), `wash`(손 씻기), `carry`(트레이), `wipe`(닦기), `bow`(인사), `panic`(당황), `happy`(기쁨)
2. 도현·소라 스프라이트: `idle`, `walk`, `point`(가리키기)
3. 카페 타일셋: 카운터, 진열장, 컵 보관대(종이컵 칸·아이스컵 칸·빨대통·뚜껑칸), 싱크대, 손 씻기 포스터, 바닥 타일, 주의 표지판
4. 소품 아이콘(16×16): 종이컵, 아이스컵, 빨대, 뚜껑, 소금빵, 크루아상, 머핀, 아메리카노, 라테, 우유, 주스, 행주, 쓰레기통, 의자, 조명 스위치
5. 효과: 비누 거품, 물방울, 반짝임, 세균(귀여운 캐릭터), '아차!' 말풍선

### 7.4 2차 요청: v3 자립 근무편 (2026-10-11, Codex에 그대로 전달)

> v3 1단계(4장 1화)는 지금 그림으로 만들어 두었습니다. 아래가 오면 **같은 이름으로 넣기만 하면** 손님 얼굴 토큰·CSS 그림이 픽셀 그림으로 바뀝니다.
> 규격은 7.2와 같습니다(인물 24×40, 타일·소품 16×16, 같은 32색 팔레트, PNG 시트 + JSON `frames`·`tags`). 기존 `tools/generate-pixel-assets.py`에 추가해 만들고, 기존 시트는 `--force` 없이 건드리지 않습니다.

| 시트(파일 이름) | 내용 | 프레임·태그 이름 | 쓰는 곳 |
| :--- | :--- | :--- | :--- |
| `guests.png/.json` | 손님 6명: 회사원(남·여), 대학생, 할머니, 아이와 엄마, 택배 기사 | 손님마다 `{id}_idle`·`{id}_walk_left`·`{id}_walk_right` 태그(4프레임). id: `office_m` `office_f` `student` `grandma` `kid` `courier` | 픽셀 매장 손님, 쏟은 음료 미니게임 손님 |
| `crew2.png/.json` | 지호(신입, 하늘색 포인트), 민재(제빵, 귀덮개), 점장(조끼·회중시계) | `jiho_*` `minjae_*` `manager_*`: `idle`, `walk_left`, `walk_right`, `point` | 4장(지호 가르치기, 점장님 부르기) |
| `seojin.png/.json` | 서진 손님(휠체어) | `idle`, `move_left`, `move_right`, `move_up`, `move_down` | 길 만들기 미니게임 |
| `yeonwoo.png/.json`에 태그 추가 | 연우 새 동작 | `mop`(대걸레질) `sweep`(비질) `place`(표지판 내려놓기) `scoop`(얼음 푸기) `lift`(무거운 것 들기, 휘청) `serve`(쟁반 건네기) `teach`(가리키며 설명) `earmuff`(귀마개 끼기) | 사건 미니게임 |
| `props2.png/.json` | 대걸레, 양동이(빈·반·가득), 빗자루, 쓰레받기, 고무장갑, 신문지 뭉치, '깨진 유리' 상자, 얼음 삽, 얼음통(0~4칸), 유리컵, 금 간 유리컵, 우산꽂이, 입구 매트, 우유 상자(날짜 스티커 초록·빨강), 쟁반 | 이름 그대로(예: `bucket_full`, `ice_bin_3`, `glass_cracked`) | 미니게임 도구·소품 |
| `floorfx.png/.json` | 바닥 효과: 라테 웅덩이 3단계(크게→작게), 젖은 발자국, 유리 조각, 빵 부스러기, 끈적한 얼룩 | `puddle_3` `puddle_2` `puddle_1` `footprint` `shards` `crumbs` `sticky` | 쏟은 음료·깨진 컵·테이블 정리 |
| `cafe_tileset`에 타일 추가 | 창고 선반, 냉장고, 제빙기, 비 오는 창문, 직원 공간 문, 화이트보드 | `storage_shelf` `fridge` `ice_machine` `window_rain` `staff_door` `whiteboard` | 픽셀 매장·얼음 채우기 |

- 표정·동작은 과장하지 않고 귀엽게. 미끄러짐(`lift` 휘청 등)은 다치지 않는 장난스러운 동작으로.
- **붉은 바탕·가운데 원·퍼지는 빛살(욱일기 연상) 금지**, 타사 IP 금지(`docs/art_bible.md` 1.1).

### 7.5 3차 요청: 4장 손맛 미니게임 (2026-10-15)

> 받기(얼음·컵·빵) · 반짝반짝 청소(바닥·테이블·쓰레기) · 쉬는 시간 지렁이 게임은 **지금 있는 그림(연우 픽셀·카페 타일·소품·먼지 효과)과 CSS로 이미 움직입니다.**
> 아래 그림이 오면 이 이름대로 넣어 주세요. 받은 그림을 보고 CSS 그림·얼굴 동그라미 자리를 픽셀 그림으로 바꿔 연결하겠습니다. 규격은 7.2와 같습니다(32색 팔레트, 1픽셀 잉크 테두리, PNG 시트 + JSON `frames`·`tags`).
> 7.4의 `guests`(걷는 손님)·`crew2`(민재·점장)·`floorfx`도 오면 청소 게임의 손님과 받기 게임의 민재·점장님에 함께 씁니다.

| 우선 | 시트(파일) · 프레임 이름 | 원본 크기 → 화면(1920 기준) | 내용 | 쓰는 곳 |
| :---: | :--- | :--- | :--- | :--- |
| P1 | `props3`: `ice_cube` `glass_cup` `glass_shards` `salt_bread_burnt` `cup_bundle` `lid_stack` `straw_bundle` | 16×16 → 64×64 | 얼음 한 덩이, 유리컵(받으면 안 되는 것), 깨진 유리 조각, 탄 소금빵(검게, 김 2프레임은 `effects`의 `steam`), 종이컵 묶음·뚜껑 묶음·빨대 묶음 | 받기: 떨어지는 것 |
| P1 | `props3`: `holder_bucket_0`~`_4` `holder_box_0`~`_4` `holder_tray` | 32×16 → 128×64 | 연우가 앞에 드는 그릇: 얼음 양동이(얼음 0~4칸), 컵 상자(0~4칸), 빵 쟁반 | 받기: 연우 그릇 |
| P1 | `yeonwoo`에 태그 추가: `hold`(2) `hold_walk_left`(4) `hold_walk_right`(4) `sweep`(4) `pick`(2) | 24×40 → 72×120(3배) | 그릇을 두 손으로 앞에 든 모습·걷기, 빗자루질, 허리 숙여 줍기 | 받기·청소 |
| P1 | `floorfx`에 추가: `dust_s` `dust_m` `dust_l`(각 2프레임) `crumbs` `coffee_ring` `sticky`(2프레임 반짝) | 16×16 → 64~96 | 먼지 뭉치 3단계(작게→크게), 빵 부스러기, 커피 자국, 끈적한 시럽 | 청소: 바닥·테이블 |
| P1 | `props3`: `tissue_ball` `straw_wrapper` `cup_crumpled` `lost_phone` `trash_bag_full` | 16×16 → 64×64 | 휴지 뭉치, 빨대 껍질, 구겨진 종이컵, 손님 휴대폰(분홍 케이스, 쓰레기와 확실히 달라 보이게), 묶은 쓰레기봉투 | 청소: 쓰레기 |
| P1 | `cafe_tileset`에 추가: `table_round`(32×32) `ice_machine_l` `ice_machine_m` `ice_machine_r` `glass_shelf` | 32×32·16×16 → 128·64 | 위에서 본 둥근 테이블, 가로로 긴 제빙기(왼·가운데·오른 조각, 가운데에 얼음 나오는 입구), 유리컵이 놓인 선반 | 청소 테이블·받기 얼음 |
| P2 | `worm`: `head_up` `head_down` `head_left` `head_right` `head_eat` `head_dizzy` `body` `body_alt` `tail` | **11×11** → 44×44(4배) | 분홍 지렁이(눈 둘, 웃는 얼굴), 먹을 때 입 벌림, 부딪히면 어지러운 눈 | 쉬는 시간 휴대폰 게임 |
| P2 | `props3`: `alarm_clock`(2프레임 흔들림) `broom` `tongs` | 16×16 → 64×64 | 알람 시계, 빗자루, 빵 집게 | 지렁이 알람·청소·받기 |
| P2 | `crew2`에 태그 추가: `manager_hand_down`(2) `minjae_tongs`(2) | 24×40 → 72×120 | 점장님이 선반에서 컵을 내려 주는 손, 민재가 집게로 빵을 놓는 손 | 받기: 위쪽 사람 |

**만드는 방법**
- (가) Codex: `tools/generate-pixel-assets.py`에 위 시트를 더해 만들기(기존 시트는 `--force` 없이 건드리지 않음). 7.4와 같은 방식.
- (나) 그림 도구(Flow 등)로 만들 때: 아래 프롬프트로 **초록 바탕(#00FF00) 시트**를 만들어 `assets/_src/pixel/`에 넣어 주시면, 제가 칸을 잘라 위 크기로 줄여 넣겠습니다(줄이면서 픽셀 격자에 맞춤).

공통 스타일(모든 프롬프트 앞에 붙임):
```
cute 16-bit pixel art sprite sheet for a cozy bakery cafe game, warm cream and pastel palette,
crisp 1-pixel dark outline, flat shading, no anti-aliasing, each item centered in its own square cell,
evenly spaced grid, solid pure green #00FF00 background
```
피할 것(네거티브):
```
blurry, gradient, 3D render, photorealistic, text, letters, logo, watermark, shadow on background,
sunburst, radial rays, red background with a central circle
```
- 받기 소품: `a single ice cube, a clear drinking glass, broken glass shards, a burnt dark salt bread with a little smoke, a bundle of paper cups, a stack of plastic lids, a bundle of straws`
- 그릇: `a small bucket seen from the front in five fill states (empty to full of ice cubes), a cardboard box in five fill states (empty to full of paper cups), a wooden bread tray`
- 청소: `three dust bunnies small medium large, bread crumbs, a brown coffee ring stain, a shiny sticky syrup puddle, a crumpled tissue, a straw wrapper, a crumpled paper cup, a smartphone with a pink case, a tied trash bag`
- 지렁이: `a cute pink worm game tiles on an 11x11 pixel grid: head facing up, down, left, right, head with open mouth, head with dizzy swirl eyes, round body segment, striped body segment, tail tip`
- 타일: `top-down round wooden cafe table, a long ice machine with a front chute (split into left middle right tiles), a wall shelf holding clear glasses`

**소리**는 사운드 팩에서 새로 잘라 넣었습니다(받기 `catch` 퐁 · 비질 `sweep` · 줍기 `pickup` · 바삭 먹기 `nom` · 보잉 `bump`, `tools/audio/audio_map.mjs`). 들어 보고 바꾸고 싶은 소리만 알려 주세요.

---

## 8. 받는 방법

- 파일은 이름만 맞춰서 위 폴더에 넣어 주시면 됩니다. 넣은 뒤에는 `npm run assets`를 실행합니다.
- 일부만 먼저 주셔도 됩니다. **P0 목록(BGM 6곡, 징글 3개, 효과음 약 30개, 환경음 3개)**이 갖춰지면 첫 시연 품질이 됩니다.
