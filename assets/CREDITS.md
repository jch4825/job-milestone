# 그림 출처

| 묶음 | 파일 | 만든 방법 | 비고 |
| :--- | :--- | :--- | :--- |
| 배경 14장 | `assets/bg/*.jpg` | 사용자가 Google Flow(생성형 AI)로 제작 | 원래 이름은 `assets/bg/SOURCES.md`. 오른쪽 아래에 생성 도구 표시(✦)가 남아 있음 |
| 스탠딩 17장 | `assets/stand/*.png` | 사용자가 Google Flow(생성형 AI)로 제작 → `tools/import-images.py`로 배경 지우기·자르기 | 원본은 `assets/_src/stand/` |
| 조연·손님 스탠딩 23장 (2026-10-12) | `assets/stand/{grandma,hiker,daeri,…,customer-*}_*.png` | 사용자가 Google Flow(생성형 AI)로 제작(전신, 흰 배경) → 같은 도구로 배경 지우기·자르기 | 원본·원래 이름은 `assets/_src/stand/`, `assets/_src/SOURCES.md` |
| 소품 24장 (2026-10-12) | `assets/items/item_*.png` | 사용자가 Google Flow(생성형 AI)로 제작(흰 배경) → 배경 지우기·256×256 | 원본은 `assets/_src/items/` |
| 오늘의 한 장 8장 (2026-10-12) | `assets/photos/*.jpg` | 사용자가 Google Flow(생성형 AI)로 제작 → 폴라로이드 비율로 자름(그림 속 테두리·글자 뺌) | 원본은 `assets/_src/photos/` |
| VFX 텍스처 16장 | `assets/vfx/*.png` | 사용자가 Google Flow(생성형 AI)로 제작(초록 배경) → 같은 도구로 크로마키·자르기 | 원본은 `assets/_src/vfx/` |
| 크루·가족 스탠딩 3장(소라·민재·엄마) | `assets/stand/{sora,minjae,mom}_normal.png` | 사용자가 Google Flow(생성형 AI)로 제작(전신, 흰 배경) → 배경 지우기·자르기 | 원래 파일 이름 기록 없음 |
| 루나 2장 (2026-10-15) | `assets/stand/luna_*.png` | Claude가 드린 프롬프트로 사용자가 Google Flow에서 제작 | 원래 이름은 `assets/_src/SOURCES.md` |
| 표지 영상 1편 (2026-10-16) | `assets/movies/title_intro.webm` | 사용자가 Google Flow로 만든 크로마키 영상 → `tools/import-movies.mjs`로 초록 지우기·앞 2초 빼기·소리 빼기 | 원본은 `assets/_src/movies/` |
| 표정 초상 13장 | `assets/portraits/*.jpg` | 설정화 시트(`assets/*_sheet.jpg`)를 `tools/crop-portraits.py`로 자름 | 칭찬 사진·문자·수첩에 사용 |
| 픽셀 아트 | `assets/pixel/*` | Codex가 `tools/generate-pixel-assets.py`로 제작 | `assets/pixel/CREDITS.md` |
| 아이콘 | `assets/icon.png` | Codex 픽셀 아트의 연우 그림에서 얼굴만 잘라 만듦(Claude, 2026-10-10) | |

- 그림마다 제작 프롬프트 복기·원래 이름·만든 날짜는 선생님 모드 → **제작·저작권 정보 → 그림** 탭에 있습니다(자료: `tools/credits/image_prompts.mjs`, `npm run credits`).
- Google Flow 결과물: Google은 소유권을 주장하지 않는다고 안내(Flow 도움말). 보이지 않는 워터마크(SynthID)가 들어 있고, 한국 거주자에게는 보이는 표시가 붙습니다. 인물·소품·효과·사진은 그 표시를 지웠고, 배경·표지 영상에는 남아 있습니다. 처음 화면에 'AI로 만든 그림·음성을 씁니다'를 늘 보여 줍니다.

# 글꼴 출처

| 파일 | 글꼴 | 라이선스 |
| :--- | :--- | :--- |
| `assets/fonts/PretendardVariable.woff2` | Pretendard Variable 1.309 · © 2023 Kil Hyung-jin (github.com/orioncactus/pretendard) | SIL Open Font License 1.1 (`assets/fonts/OFL-Pretendard.txt`, 배포본에 함께 들어감) |
| `assets/fonts/BlackHanSans-Regular.ttf` | Black Han Sans 1.001 · © 2015 The Black Han Sans Project Authors (github.com/zesstype/Black-Han-Sans), Google Fonts 공식 저장소에서 받음 | SIL Open Font License 1.1 (`assets/fonts/OFL-BlackHanSans.txt`) |

- 음악·효과음 출처는 `assets/audio/CREDITS.md`에 있습니다.
