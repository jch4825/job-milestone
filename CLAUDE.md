# CLAUDE.md: 직업 마1스톤 (Job Milestone)

발달장애 학생(특수학교 고등부·전공과)을 위한 **시행착오형 직업 적응 스토리 시뮬레이션**입니다.
스무 살 연우가 베이커리 카페 '마일스톤'에서 보내는 첫 한 달(3막 9에피소드)과 자립 근무(4막)를 플레이어가 고르고, 실패하고, **회중시계로 되감으며** 배웁니다. 4막을 처음 마치면 엔딩이 나옵니다.
상업 목적이 아니라 **교육 품질**이 목표입니다. 문서와 대화는 한국어로 씁니다.

- 제품 요구사항: `prd_final.md`(최종본, 2026-10-26: 최초 PRD v1 + 업데이트 v2 `2_prd.md`·v3 `3_prd.md`를 합침) · 이야기 기준: `docs/narrative_bible.md` · 아트: `docs/art_bible.md`
- 에셋 요청: 소리 `docs/asset_requests.md` · 그림 `docs/image_requests.md` · 교사용 지도서: `docs/teacher_guide.md` · 검수 현황: `docs/review_v2.md`
- v1(구 기획·코드)은 `legacy/v1/`에 보관 중입니다. **수정하지 마세요.**

---

## 1. 실행과 검사

```bash
npm run web          # 개발 서버 http://localhost:5173 (의존성 없음, ES 모듈이라 file:// 로는 안 열림)
npm start            # Electron (app:// 프로토콜로 로딩, LLM IPC)
npm run validate     # 시나리오 검사: 오류 0 이어야 함 (대사·카드·아차·참조·라벨)
npm run export       # 읽기용 대본 생성 → scenarios/*.md (자동 생성물, 직접 고치지 않기)
npm run assets       # 소리 assets/audio/{bgm,sfx,amb}/ → manifest.json, 그림 assets/{stand,bg,cg,photos,...}/ · 영상 assets/movies/ → assets/images.json
npm run pixel        # Flow SD 픽셀(assets/_src/pixel/) → assets/pixel/ 연우·매장 배경·소품·효과·가구·미니게임 사람·물건 (일부만: -- room, --check: 자른 결과 보기)
npm run voices       # 대사 줄 추출 + Supertonic 3 로컬 TTS로 음성 생성 (바뀐 줄만)
npm run credits      # 선생님 모드 '제작·저작권 정보' 자료(PRD·요청 기록·그림 프롬프트·음악 출처) → assets/credits/credits.json
npm run build:web    # 웹판 배포용 폴더 → dist/job-milestone (원본·문서·도구 제외). Vercel: npx vercel@64.5.0 deploy dist/job-milestone --scope jch4825s-projects
npm run build:win    # 설치용 앱(Electron) → dist/직업 마1스톤 Setup {version}.exe · dist/win-unpacked/ (처음 한 번 npm install. 고친 뒤 다시 만들어 PC마다 덮어 설치, 학생 기록은 남음)
                     # 앱 아이콘: python tools/make-icon.py (픽셀 연우 carry_0 → build/icon.ico·icon.png, assets/icon.png). 서명 안 함(검수 문서 N-31)
```

- 자동 플레이 테스트: `http://localhost:5173/?debug`를 연 뒤 콘솔에서 다음을 실행합니다. `bad: true`는 판단마다 나쁜 선택을 먼저 모두 시도합니다(v3: 처음 근무판은 준비를 빠뜨린 계획 → 계획 아차에서 근무판으로 되감기 → 좋은 계획, 사건 미니게임은 나쁜 행동 한 번 → 자동 풀이).
  ```js
  const { autoplay } = await import('/tools/autoplay.js');
  await autoplay({ episode: 'd2', bad: true });
  ```
  엔딩은 `await autoplay({ episode: 'ending' })`(결과 화면 대신 근무표에 닿으면 끝).
- 음성 파일 확인: 같은 콘솔에서 `await (await import('/tools/autoplay.js')).voiceCoverage()`를 실행합니다. 결과의 `miss`가 음성 파일 없이 브라우저 음성으로 읽힌 문장입니다.
- 대사·카드·에피소드를 고친 뒤에는 **`npm run validate` → 자동 플레이 → `npm run export` → `npm run voices`** 순서로 진행합니다.
- 브라우저 패널 스크린샷은 한 프레임 늦게 찍힐 수 있습니다. 상태를 바꾼 직후에는 두 번 찍어 확인합니다(또는 DOM으로 확인).

## 2. 절대 원칙 (교육·재현)

1. **시행착오가 핵심입니다.** 나쁜 선택은 *결과 장면*으로 보여 주고, **아차! 카드 → 되감기**로 돌아옵니다. 힌트로 정답을 미리 알려 주는 구조로 되돌리지 않습니다.
2. **아차 카드 공식**: 제목은 "일어난 일", 교훈은 "왜 그런지 + 대신 할 행동"으로, 두 문장 이내입니다.
   예: `{ title: '손님이 미끄러졌어요', lesson: '쏟은 것을 숨기면 다른 사람이 다칠 수 있어요. 바로 말하고 같이 닦아요.' }`
3. **결과 장면**은 원인과 결과가 한눈에 보이게 쓰고, 모욕·위협·공포 연출은 넣지 않습니다.
4. **쉬운 한국어**: 대사 한 칸은 두 문장 이내, 한 문장은 35자 안팎으로 씁니다. 비유와 관용 표현은 아끼고, 꼭 필요하면 `{{말 사전}}`으로 연결합니다.
5. **정답 카드 문장 = 학생이 그대로 따라 말할 모범 문장**입니다. 실제 일터에서 쓸 수 있게 씁니다.
6. **진단명 라벨링 금지**: 서술에서 연우를 "발달장애가 있는 나" 같은 말로 부르지 않습니다. 특성은 감각과 행동으로 보여 줍니다. 동정이나 영웅화를 하지 않습니다.
7. **도움은 모두의 도구**입니다. 귀마개, 메모, 그림 카드는 동료들도 씁니다(민재의 귀덮개, 점장의 메모 비밀).
8. **타사 IP 표현 금지**: All-Out Attack, Take Your Heart, 예고장, 페르소나 로고·폰트 모방은 쓰지 않습니다. 비주얼 언어는 '마일스톤 팝'(영수증·포스트잇·도장·폴라로이드)입니다.
   **욱일기를 떠올리게 하는 연출도 금지**: 붉은 바탕, 가운데 원, 퍼지거나 도는 빛살(선버스트·방사형 줄무늬·후광)을 함께 쓰지 않습니다. 한국 사용자가 크게 거부감을 느낍니다. 축하·성공은 색종이·도장·영수증·폴라로이드로 표현합니다(완료 화면 = 완료 영수증 + 모서리 도장). 그림 요청 프롬프트에도 sunburst·radial rays를 넣지 않습니다.
9. **근로 조건은 `js/config.js`의 `JOB`·`WAGE_TABLE`에서만** 관리합니다. 시급은 매년 8월 고시값으로 갱신합니다(2026년 10,320원, 2027년 10,700원).
10. **접근성 회귀 금지**: 모든 조작은 `<button>`입니다. 키보드·스캔으로 가능해야 합니다. 차분 모드와 움직임 줄이기에서 번쩍임·흔들림은 없앱니다.
11. **프롤로그는 튜토리얼입니다.** 조작(대사 넘기기·카드·말 사전·메모·되감기·다시 듣기·수첩·숨 고르기·멈춤·설정)을 이야기 흐름 속 `guide()` 안내로 하나씩 가르칩니다.
    **처음 나오는 버튼·행동은 늘 무지개 테두리가 돕니다**(`js/ui/tutor.js`, 한 번에 한 종류, 누르면 학생마다 '배운 것'). 새 버튼 종류를 만들면 `js/data/tutorial.js`에 등록합니다.
    여러 개 중 고르는 것(카드·미니게임 칸·자석)은 `hand: 'group'`(손가락이 모든 칸을 차례로 짚음)으로 두어 정답을 가리키지 않습니다. 판단의 정답을 알려 주는 안내(예: 숨 고르기)는 판단 **뒤에** 둡니다.

## 3. 구조

```
index.html            CSP: script-src 'self' (eval·인라인 스크립트 금지), connect-src 는 로컬 Ollama 만
css/                  base(토큰·테마·인쇄) · ui(게임 화면) · screens(전체 화면 창) · minigames · work(v3 근무판·픽셀 매장·사건 미니게임)
js/main.js            부트, nav 등록, HUD 이벤트, 에피소드 → 결과 화면 흐름, ?debug 훅(window.__jm)
js/config.js          전역 설정: JOB, WAGE_TABLE, PAYSLIP, LLM, DEFAULT_SETTINGS, 교사 PIN 기본값
js/core/
  runner.js           시나리오 실행기: 비트 실행, decide/choose/ask/mini, 스냅숏·되감기, 자동 저장, 도장
  dsl.js              시나리오 작성 함수 (아래 4장)
  store.js            localStorage 'jobms.v2' : 프로필(학생)별 설정·진행·플래그·도장·로그·말·사진·아차·일기 · 세이브 6칸(saves)
  text.js             {player}/{wage}/{netPay} 치환, 조사, {{말 사전}}·**강조** 파싱, speakable, hashKey(음성 키)
  oops.js             아차 등록부 + showOops(아차 카드 → 되감기 연출)
  assets.js           그림 목록(assets/images.json): img.has/url. 그림이 없으면 각 화면이 임시 그림을 씀
  input.js            키보드(Space/Enter/→/숫자/화살표/Esc), 스위치 자동 스캔, 포커스 범위
  nav.js · bus.js · scale.js(1920×1080 고정 캔버스) · dom.js(h(), sleep, dur)
js/ui/                stage(배경·스탠딩/폴라로이드·CG·효과) · dialogue(영수증 대화창+얼굴 아이콘) · cards · memo · hud(장소·일정 칩)
                      overlays(컷인·크루 카드·일정 완료 등) · vfx(파티클) · emote(감정 이모트) · doc · breathe
                      tutor(처음 보는 버튼 알려 주기: 무지개 테두리·손가락·쪽지, #layer-tut)
js/game/              interview(골라서·써서·말로) · llm(Ollama+안전장치) · stt · minigames/(spill = v3 사건 · catch·timing·tables·whack·snake = 4장 손맛 미니게임, 공통 arcade.js)
js/game/work/         v3 자립 근무: sim(상태·조건·정산, DOM 없음) · board(근무판) · cafe(픽셀 매장, #layer-work)
js/data/work/         tasks(업무 자석·시간 칸·상태 막대)
js/screens/           title · profile · hub(근무표) · result · notebook · settings · teacher · credits(제작·저작권 정보) · menus · saves(저장·불러오기) · records(기록 파일) · screen(공통)
js/av/                audio(파일 우선 + 합성 대체, 귀마개 필터) · tts(음성 파일 우선 + Web Speech)
js/data/              episodes/(10개 + ending) · daily(매일 매일 카페 생활: 메모 판 30가지 → 하루 만들기) · characters(스탠딩 규칙·크루 카드) · portrait-svg · backgrounds(SVG) · icons(픽토그램) · glossary · skills · photos · cg(이벤트 CG 목록)
                      tutorial(처음 보는 버튼 종류 목록: 순서·고르는 법·쪽지 글)
tools/                serve · validate-scenarios · export-script · export-lines · run-voices · voice/ · scan-assets · autoplay · crop-portraits.py
assets/               portraits/(표정 초상) · audio/(BGM·효과음·환경음+manifest) · voice/(lines/+manifest) · *_sheet.jpg(원본 시트)
                      stand/ bg/ cg/ photos/ sd/ items/ emotes/ vfx/ ui/ (그림, images.json) · movies/(표지 영상) — 규격은 docs/image_requests.md
```

## 4. 시나리오 DSL (`js/core/dsl.js`)

에피소드 파일은 메타 정보 + `script: [비트…]`로 구성됩니다. 모든 비트는 `{ t: '종류', … }` 순수 데이터입니다.

| 분류 | 함수 |
| :--- | :--- |
| 배경·소리 | `bg(id, variant)` `bgm(mood)` `amb(kind, level)` `sfx(name)` |
| 무대 | `show({left,center,right})` (전체 교체, 'id:표정') `enter(slot, 'id:표정')` `leave(id)` `face(id, 표정)` `motion(id, bow·nod·shake·jump·breathe)` `camera(left·right·center·normal)` `fx(overload·shake·flash·dark·sepia, on)` `earplugs(on)` `emote(id, kind)` `cg(id)`·`cg(null)` |
| 대사 | `say(who, [face], text)` `narr(text)`(연우 1인칭) `think(text)`(연우 속마음) `sys(text)`(안내) `phone(from, text)` `guide(key, text, span)`(버튼 알려 주기: 그 버튼을 안 배운 학생에게만, 안내하는 동안 무지개 테두리) |
| 화면 정보 | `time('09:00')` `place('09:00', '장소')`(HUD 장소도 바뀜) `big(제목, 부제)` `schedule()`(오늘의 일정표) `check(n)`(일정 n번 완료) `memo(제목, [[아이콘, 글], …])`(3줄 이하) `memoHi(n)` `info(title, body)` `meet(id)`(크루 카드) |
| 문서 | `doc('contract'|'payslip')` `docRead()` `docHi(n)` `docSeal(label)` `docClose()` |
| 상호작용 | `act(label, icon, sfx)` `breathe(cycles, note)` |
| 판단 | `decide({ id, title, q, who, skill, memo, help, mentor, helper, timer, choices:[good(icon,label,{praise,next,set}), bad(icon,label,{fail:[…], oops:{id,title,lesson,icon}})] })` · 급한 장면 `timer: { sec, label, as }` 또는 `{ sec, label, fail:[…], oops }` |
| 자유 선택 | `choose({ id, title, q, who, flag, options:[opt(icon,label,value,{then:[…],next})] })` |
| 분기 | `branch(flag, { 값: […], _: […] })` `label(name)` `jump(name)` `set(flag, v)` · 선택지 목록 자체를 바꿀 때는 `...onlyIf({ flag: 'payPlan=gift' }, choose(…))` / `notFlag`(3장 마무리 선물) |
| 면접 | `ask({ id, title, q, simple, who, skill, flag, chips:[{label,cat}], cats:{ cat:{kw,reply,value,face,follow,ok:false,fail,oops,then}, _:{…} } })` · 점수제 묶음 `ivStart({ id, pass })` … `ivEnd({ fail:[탈락 장면] })` |
| 미니게임 | `mini('handwash'|'cups'|'order'|'closing'|'memowrite'|'spill'|'catch'|'timing'|'tables'|'whack'|'snake', { skill, title, orders, oops, rush, timer, skin })` · `timer`는 order 만: `{ label, say, oops, sec }` · `skin`: catch `ice·cups`, whack `floor·trash` |
| v3 자립 근무 | `briefing({ day, cards:[[icon,label,value]], note })` `board({ id, title, pool:[자석], tutorial })` `shiftStart({ cups, ice, bread, clean, energy })` `block('s1'…'s7')` `workSet({ fill:[…], add:{…} })` `workOops({ id, title, lesson, icon })` `shiftEnd({ day })` · 조건부 `...onlyIf({ cups:'<2' }, 비트…)` |
| 보상·끝 | `snap(who, face, title, caption)` `photo(id)` `got(item, 이름, icon)`(받은 물건: 소품 그림) `stamp(skill, level)` `term(id)` `finish(title, sub)` `credits()`(엔딩 사진 벽·크레디트) `letter({ to, lines, ps, from })`(엔딩: 연우의 마지막 메모) `checkpoint(name)` `wait(ms)` `end()` |

규칙(검사기가 확인):
- `decide`·`choose`·`ask`·`mini`는 **최상위 목록에만** 둡니다(`fail`, `praise`, `then`, `branch` 안에는 둘 수 없음).
- **점수제 면접**(`ivStart`~`ivEnd`): 안의 `ask`는 틀려도 바로 되감지 않고 기록만 합니다. 틀린 대답(`ok:false`)에는 점장님의 담담한 반응 `reply`와 돌아보기에 보일 `oops`가 필요합니다. 알맞은 대답이 `pass`개보다 적으면 `fail` 장면 → 돌아보기(문항별 내 대답·이렇게 말해요·이유) → 면접 처음으로 되감기. 로컬 LLM이 연결되지 않으면 '골라서 말하기'만 나오고, 선택지 순서는 다시 볼 때마다 바뀝니다.
- 나쁜 선택에는 `fail`(결과 장면)과 `oops`(전역 고유 id)가 필요합니다. 좋은 선택에는 `praise`를 답니다.
- 에피소드 마지막 비트는 `end()`입니다. 메모는 3줄 이하로 씁니다. 대사는 70자를 넘기면 경고가 납니다.
- **엔딩**(`js/data/episodes/ending.js`, 2026-10-14): 크레디트·엔딩 영수증('직업 마1스톤 엔딩')·플레이어에게 하는 작별 인사는 **엔딩에만** 둡니다(3막 끝에 가벼운 엔딩이 나오고 4막이 시작되면 이야기가 끊겨 보인다는 사용자 의견). 엔딩은 `EPISODES`에 넣지 않고, 마지막 막의 마지막 에피소드(`index.js`의 `FINALE`)를 처음 마치면 결과 화면의 [엔딩 보기] → 엔딩 → '모든 이야기가 열렸어요' 알림(음성) → 근무표로 이어집니다(`main.js`). 엔딩을 본 학생은 모든 이야기가 늘 열리고(`store.ending()`), 근무표 엔딩 칸에서 다시 볼 수 있습니다. 4장 2~4화를 `ACTS`에 넣으면 엔딩은 저절로 그 뒤로 옮겨 갑니다. 엔딩에는 판단·미니게임·근무·일정 완료를 두지 않습니다(검사기가 확인). `letter`의 줄·추신에는 `{player}`를 쓰지 않습니다(받는 사람 `to`에만, 음성 파일).
- **시간 제한 막대**(2026-10-14, `js/ui/timer.js`): 이야기 속에서 급한 판단(`decide`의 `timer`)과 급한 주문 담기(`mini('order', { timer })`)에만 붙입니다. 지금은 2일 차 첫 손님, 4일 차 재촉하는 손님, 5일 차 쏟아진 주스, 3장 피크타임(반말 손님·역할 나누기·제빙기·안내·포장 주문)입니다.
  - 주문 담기(`mini('order', { timer })`)의 기본 시간은 '18초 + 물건 하나에 3초', **상한 45초**(order.js MAX_SEC, 2026-10-16 사용자). 배율(넉넉히·실패 뒤 1.5배)은 상한 다음에 곱합니다.
  - `label`은 왜 급한지('손님이 기다려요'). 시간이 다 되면 '시간이 다 됐어요!'(음성) → `as`(멈춰 버린 나쁜 카드의 아이콘)와 같은 결과, 또는 따로 쓴 `fail`·`oops` → 아차 → 되감기. 한 번 실패하면 1.5배, 두 번 넘게 실패하면 막대 없이.
  - 설정 '시간 제한'(보통 · 넉넉히 2배 · 끄기). 자동 스캔이면 꺼지고, 두 번 눌러 고르기면 1.5배. 멈춤·설정·말 사전처럼 다른 창이 열려 있으면 멈춥니다.
  - 급한 장면 앞에는 `guide('timer', …)`를 둡니다(그 학생이 처음 볼 때만 안내, 막대에 무지개 테두리). 면접·소리 과부하·프롤로그(튜토리얼)처럼 '천천히, 쉬겠다고 말하기'가 답인 장면에는 붙이지 않습니다.
  - 자동 플레이 `autoplay({ episode, timeout: true })`는 막대마다 한 번씩 시간이 다 되게 두어 시간 초과 흐름을 검사합니다.
- `check(n)`은 **그 일을 해낸 직후**, 최상위 목록에만 둡니다. 일정 항목마다 정확히 한 번입니다. 사건 직전에 두면 정답을 미리 알려 주게 됩니다(절대 원칙 1).
- `meet(id)`는 `characters.js`에 `card`가 있는 크루·가족만 씁니다(손님 카드는 판단 힌트가 되므로 없음). 프로필마다 한 번만 뜹니다.
- `cg(id)`의 id는 `js/data/cg.js`에 있어야 합니다. 그림 파일이 없으면 아무 일도 없고, 다음 `bg()`나 `cg(null)`에서 끝납니다.
- 표정이 바뀌면 이모트가 자동으로 뜹니다(긴장·걱정 → 땀, 놀람 → !, 생각 → ?, 슬픔 → 눈물). 따로 띄울 때만 `emote()`를 씁니다.
- 에피소드 메타 `costume: { yeonwoo: 'interview' }`: 그 에피소드의 스탠딩 의상(`yeonwoo-interview_*.png`이 있을 때만). 이름 없는 손님(`customer`)과 봉순 할머니도 에피소드마다 다른 그림을 씁니다(`{ customer: 'coffee', grandma: 'cardigan' }`).
- 인물 id: `yeonwoo dohyun manager sora minjae mom teacher jiho grandma student seojin daeri luna auntie hiker customer`
- 표정: 주요 3인은 `characters.js`의 `faces/alias`(예: 연우 normal·smile·nervous·determined), 임시 초상은 `normal smile worried angry surprised sad think`.
- 스킬: `time hygiene prepare serve clean report ask help calm team safety rights`
- 말 사전 링크: `{{근로계약서}}` 또는 `{{표시|사전id}}`. 없는 낱말은 검사 오류입니다.
- 플래그: `accommodation`(earplugs·pictures·slowly·later), `calmStyle`, `rideChoice`, `askedQuestion`, `momTalk`, `payPlan`, `giftChoice`, `overloadChoice`, `memoTips` · v3: `work`(근무 상태), `workPlan`(근무판)
- **v3 자립 근무**(설계 `docs/v3_design.md`): `board` → `shiftStart` → `block`… → `shiftEnd` 순서(검사기가 확인). 시간은 [다음]을 누를 때만 흐릅니다.
  - 문제는 정답 대조가 아니라 **계획의 결과**로 생깁니다: 블록이 끝난 뒤 `...onlyIf({ ice: '<2' }, …)`로 부족 사건을 둡니다. onlyIf 묶음의 조건은 첫 비트에서 한 번만 검사합니다(묶음 안에서 `workSet`으로 채워도 끝까지 실행).
  - 계획 때문에 생긴 사건은 `workOops`(아차 → [근무판으로 되감기] / [이대로 계속]). 근무판으로 되감으면 지난 계획이 남아 고쳐 씁니다.
  - **미니게임은 문제 맞추기 금지**: 손으로 하는 일(놓기·문지르기·나르기·붓기·받기·쓸기), 여러 방법으로 끝나는 목표 상태, 실수는 자연스러운 결과 → 아차 → 몇 수(몇 초) 되감기. 자동 플레이용으로 `?debug`일 때 `window.__mgAuto`(끝까지 풀기)와 `window.__mgBad`(실수 한 번, 아차 카드를 기다리지 않음)를 둡니다.
  - **4장은 모든 활동에 미니게임**(2026-10-15): 근무판 자석(`js/data/work/tasks.js`)의 `mini`·`miniOpts`·`hands`. 블록마다 [직접 하기 / 보기]를 묻습니다. 출근·퇴근 기록만 없음.
  - **손맛 미니게임**(받기 `catch`: 얼음·컵 · 빵 진열 `timing`: 타이밍 맞춰 놓기 15개 · 테이블 닦기 `tables`: 손님 1~2명(테이블 그림의 의자 둘)이 앉았다 떠난 자리 닦기, 늦으면 새 손님이 투덜 · 반짝반짝 청소 `whack`: 바닥·쓰레기 · 쉬는 시간 지렁이 `snake`, 공통 `arcade.js`)은 실시간입니다. 같은 방식(받기 등)이 셋 이상 겹치지 않게 합니다(사용자: 받기 셋은 지루함). 빠르기는 설정 '시간 제한'(보통 · 넉넉히 2배 · '두 번 눌러 고르기' 1.5배), **끄기·자동 스캔이면 턴 방식**(누를 때만 한 칸, [기다리기]). [시작!]을 눌러야 움직이고, 다른 창이 열려 있으면 멈춥니다. 놓치거나 부딪히는 것은 벌 없음, 아차는 일터의 실제 결과일 때만. 근무판 '직접 하기'에서 연 미니게임은 머리글에 [그만하기](frame `quit`, bus 'mg:quit' → '보기'처럼 이어 감). 새 미니게임은 `f.onAbort(() => resolveDone())`로 도중 정리를 등록합니다(되감기·나가기 때 runner 의 clearTask → `abortMinigame()`). 시간 막대·타이머도 onAbort 에서 멈추고, 대사·잠깐 쉬기를 기다리는 곳에서는 `abortGeneration()`(frame.js)을 받아 두었다가 기다린 뒤 달라졌으면 그만둡니다(2026-10-27, 검수 문서 N-33).

## 5. 에셋 파이프라인

- **표정 초상**: `python tools/crop-portraits.py`로 `assets/*_sheet.jpg`를 잘라 `assets/portraits/{id}_{face}.jpg`(360×418)를 만듭니다. 새 일러스트가 오면 `characters.js`의 `faces`에 추가합니다.
- **그림**: `docs/image_requests.md`의 ID를 파일 이름으로 `assets/{stand,bg,cg,photos,sd,items,emotes,vfx,ui}/`에 넣고 `npm run assets`를 실행하면 끝입니다(`assets/images.json`). 없는 그림은 임시 그림(폴라로이드·SVG 배경·SVG 이모트·SVG 파티클)으로 보입니다.
  - 스탠딩은 인물마다 `{id}_normal.png`이 있어야 켜집니다. 바라보는 쪽(`look`), 얼굴 아이콘 자르기(`faceBox`), 없는 표정 대체(`standAlias`)는 `characters.js`에서 맞춥니다.
- **스탠딩·VFX·소품·사진 그림**: 사용자가 만든 원본을 ID 이름으로 `assets/_src/{stand,vfx,items,photos}/`에 두고(원래 이름은 `assets/_src/SOURCES.md`) `npm run images`(`tools/import-images.py` + 목록 갱신)를 실행합니다.
  - 스탠딩 `{인물}[-{의상}]_{표정}.jpg`: 흰색·단색 배경을 바깥에서부터 지우고 머리~허벅지로 잘라 900×1100 WebP(품질 92: PNG 의 1/6 크기, 2026-10-26 웹판에서 늦게 뜨던 문제). 전신 그림이면 됩니다. 앉은 사람처럼 키로 재면 크기가 달라지는 그림은 `STAND_FIT`(배율·가로 옮김)
  - VFX `vfx_{종류}.jpg`(초록 배경 크로마키) · 소품 `item_{물건}.jpg`(흰 배경 → 256×256 PNG) · 사진 `{ID}.jpg`(`PHOTO_CROP`의 자리를 620×720으로, 오른쪽 아래 생성 도구 표시는 메움)
  - 이름 없는 손님은 한 인물 ID(`customer`)에 에피소드마다 다른 그림: `costume: { customer: 'coffee' }` → `customer-coffee_normal.png`(대사 ID는 그대로). 여성 손님 그림은 `characters.js`의 `COSTUME_VOICE`에 넣어 여성 목소리(`customer_f`)로 읽습니다
  - 원본을 더 큰 그림(업스케일링)으로 바꾸면 `COORD_W`에 옛 원본 너비를 적어 두면 갇힌 배경 좌표를 비율대로 늘려 씁니다. 스탠딩을 넣거나 바꾼 뒤에는 `python tools/face-boxes.py`(대화창 얼굴 아이콘·초상 자르기 값 → `js/data/faceboxes.js`)를 실행합니다. 손님은 `characters.js`의 `standScale: 0.85`로 무대에서 조금 작게 섭니다.
  - 팔과 몸 사이·컵 손잡이 속처럼 **갇힌 배경은 자동으로 못 지웁니다**(흰 셔츠·흰 컵과 색이 같음). `python tools/import-images.py --check 이름…`이 어두운 바탕에 남은 곳을 분홍 번호로 그려 `assets/_src/_check/`에 둡니다. 배경인 곳만 `POCKETS`(한 점)나 `AREAS`(바퀴살처럼 많을 때 범위)에 적습니다. `assets/_src/`는 배포에서 빠집니다(`package.json` build).
- **소품 그림 쓰는 곳**(`js/data/items.js`의 `artHTML`): 말 사전 카드(`glossary.js`의 `item`), 아차 카드·아침 브리핑(픽토그램 이름 → 소품), 받은 물건(`got(item, 이름)` 비트, 읽어 주지 않음), 되감기 회중시계, 주문서 확인·컵 보관대 미니게임의 물건. **누르는 버튼 안의 선 아이콘은 바꾸지 않습니다**(접근성).
- **배경**: 사용자가 준 일러스트 14장이 `assets/bg/{id}_{variant}.jpg`로 들어 있습니다(원래 파일 이름은 `assets/bg/SOURCES.md`). 그림이 없는 배경(`school` 등)은 `js/data/backgrounds.js`의 SVG로 그립니다. 새 그림은 이름을 맞춰 넣고 `npm run assets`를 실행합니다(이름이 다를 때만 `BG_FILES`에 등록).
- **표지 영상**(2026-10-16): 크로마키 원본을 `assets/_src/movies/{ID}.mp4`에 두고(원래 이름은 `assets/_src/SOURCES.md`) `npm run movies`(`tools/import-movies.mjs` + 목록 갱신)를 실행하면 `assets/movies/{ID}.webm`(VP9+투명, 소리 없음)과 마지막 장면 `{ID}_end.png`가 생깁니다. 초록 지우기 값·자를 자리·앞에서 뺄 초(`start`)는 그 파일의 `MOVIES`에서 맞추고, 결과는 `assets/_src/_check/{ID}.png`(밝은·어두운 바탕)로 확인합니다. 표지(`title.js` titleMovie)는 앱을 켜고 처음 본 표지에서 한 번 틀고 마지막 장면에 멈추며, **표지는 팬시해야 하므로 움직임 줄이기의 예외**입니다(영상·등장 효과 모두).
- **제작·저작권 정보**(선생님 모드, 2026-10-16, `js/screens/credits.js` · 고정 글 `js/data/credits.js`): PRD·요청 기록·작업 기록·그림 프롬프트·음악 출처·데이터·저작권. 자료는 `npm run credits`(`tools/export-credits.mjs` → `assets/credits/credits.json`)가 `prd_final.md`·Claude Code 대화 기록(`~/.claude/projects/C--AI-game`, `CLAUDE_LOG_DIR`)·`docs/review_v2.md`·`assets/images.json`·`SOURCES.md`·`tools/audio/audio_map.mjs`에서 모읍니다.
  - **요청 기록에는 이 게임에 관한 요청만**(2026-10-26 사용자 결정): 이 폴더에서 한 다른 프로그램 작업(보드게임 '꿈의 주사위')과 다 만든 뒤의 마무리 대화(최종 PRD 올리기·요청 기록 정리)는 `export-credits.mjs`의 `LEAVE_OUT`(대화 파일 이름 앞 8자리 + 시각 범위)으로 뺍니다. 다른 프로그램을 이 폴더에서 또 작업했다면 그 대화를 `LEAVE_OUT`에 더한 뒤 `npm run credits`를 실행합니다.
  - **새 그림을 넣으면 `tools/credits/image_prompts.mjs`에 제작 프롬프트를 한 줄 더하고**(출처 `chat`·`doc`·`look`), 원래 파일 이름을 `assets/_src/SOURCES.md`에 적은 뒤 `npm run credits`를 실행합니다(프롬프트가 없으면 경고).
  - **처음 화면 오른쪽 위의 'AI로 만든 그림·음성·음악을 씁니다'**(`AI_NOTICE`, AI 기본법 제31조 취지)는 지우지 않습니다.
  - **학생 이름은 본명 대신 별명**: 처음 시작하기(`profile.js` PROFILE_SAY)와 선생님 모드 [학생 추가]에서 안내합니다. AI 기능을 쓰면 데이터가 나가는 것을 모두 막을 수는 없다는 사용자 판단(2026-10-16)이라 이 안내를 지우지 않습니다.
  - 사운드는 모두 사용자가 Humble Bundle에서 산 묶음입니다(예외: 배경음악 「The Carousel Turn」 `bgm/carousel`은 사용자가 Gemini로 만든 AI 음악, 원본은 `assets/_src/audio/`(배포에서 빠짐), audio_map 의 `GEM`). 새 사운드 팩은 `audio_map.mjs` PACKS에 만든 곳·작곡가·라이선스·구매 묶음(`bundle`)·AI 관련 조건(`ai`)을 적고 `node tools/import-audio.mjs --credits`(CREDITS.md만 다시 씀)와 `npm run credits`를 실행합니다. 판매 페이지에 AI 관련 금지 조건이 있는 팩은 쓰지 않습니다.
- **글꼴**: 게임에 넣은 OFL 글꼴만 씁니다(PC에 설치된 글꼴에 기대지 않음). 본문 `assets/fonts/PretendardVariable.woff2`, 제목 `BlackHanSans-Regular.ttf`(라이선스 `OFL-*.txt`). 제목 글꼴에 없는 글자는 Pretendard 900('Milestone Display')으로 보입니다. 새 글자가 많은 제목을 넣으면 `assets/fonts/`의 cmap을 확인합니다.
- **BGM·효과음**: 파일 이름이 ID입니다(`docs/asset_requests.md`). 없는 ID는 합성음으로 재생됩니다.
  - 배경음악은 Visual Novel 팩의 밝은 곡입니다(2026-10-11, 앰비언트 곡은 너무 우울하다는 의견). 매장·주방 환경음(웅성거림)은 쓰지 않고, `crowd`는 3장 소리 과부하 장면에서만 판단이 끝날 때까지 납니다.
  - 사용자가 Humble Bundle에서 구매한 사운드 팩(`C:\AI\sound effect assets`, 환경 변수 `SOUND_SRC`. GameDev Market 묶음 2개 + `OVANI/` Ovani Sound 묶음)에서 `tools/audio/audio_map.mjs` 대응표대로 잘라 넣습니다: `npm run audio`(가져오기 + 목록 갱신). 출처 문서 `assets/audio/CREDITS.md`는 자동으로 만들어집니다.
  - **원본 WAV는 프로젝트에 복사하지 않습니다**(라이선스: 원본을 그대로 내려받게 하면 안 됨). 파일을 직접 넣었다면 `npm run assets`만 실행합니다.
- **음성**: `tools/voice/voice_cast.json`(인물 → Supertonic F1~F5/M1~M5, 속도)을 고친 뒤 `npm run voices`를 실행합니다(`-- --force`는 전체 재생성).
  - 키 규칙: `hashKey(voiceId|speakable(text))`. 대사를 고치면 그 줄만 다시 만들어집니다. `{player}`가 든 줄은 브라우저 음성이 읽습니다.
  - **숫자는 `speakable()`이 소리 나는 대로 바꿔서** 엔진에 넘깁니다. 시각·시간·개수는 고유어(한 시, 네 시간, 두 개), 번호·분·돈·날짜는 한자어(일 번, 삼십분, 만 삼백이십원), 0으로 시작하는 번호는 한 자리씩(해솔공칠)입니다. 새 단위 명사(예: '켤레')가 나오면 `js/core/text.js`의 `sayNumbers()` 고유어 목록에 넣습니다.
  - 읽어 줄 문장의 출처: 에피소드 비트, 말 사전, 문서 행, 미니게임의 `xxxLines()`(각 미니게임 파일), `export-lines.mjs`의 `EXTRA`(화면 고정 문장)입니다. 결과 화면 요약처럼 바뀌는 문장은 `tts.speakSeq([조각…])`로 나눠 읽게 하고 조각을 목록에 넣습니다.
  - Supertonic 위치: `C:\AI\supertonic3-local-tts-20260520-r2\supertonic3-local-tts`(환경 변수 `SUPERTONIC_DIR`, `SUPERTONIC_PY`로 바꿀 수 있음).
- **픽셀 아트(일하는 장면 전용)**: `assets/pixel/*.png + .json`(Codex가 `tools/generate-pixel-assets.py`로 생성). 미니게임이 `js/ui/pixel.js`로 소품·효과·연우 스프라이트를 4~6배로 키워 씁니다. 그림이 없으면 SVG 픽토그램으로 돌아갑니다. 이야기 장면은 일러스트를 유지합니다.
  - **연우는 Flow로 만든 SD 시트**(2026-10-25): 모든 동작을 한 장(8칸 × 6줄, 마지막 칸은 Gemini 표시를 얹을 버리는 칸)으로 받아 `npm run pixel`이 자릅니다(`tools/import-pixel-sheet.py`의 LAYOUT = 칸 → 동작 이름). JSON 의 `unit`(그림 1px 이 옛 24×40 기준 몇 px)·`foot`(발끝 자리) 덕분에 부르는 쪽 scale(3~6)은 옛 기준 그대로이고, **자리는 `sprite.foot`·`sprite.w`로 잡습니다**(옛 크기 숫자 36·48·120·160 금지). 생성 그림은 따로 만들면 얼굴·크기가 달라지므로 **필요한 모습을 모두 한 장에** 요청합니다(사용자 경험).
  - **매장·물건도 같은 그림체**(2026-10-25, `docs/image_requests.md` G-3): 근무판 매장은 그림 한 장(`cafe_room`, 가운데 20:7 띠)이고 **일하는 자리는 그 그림에서 잰 발 위치**(`import-pixel-sheet.py` ROOM spots → `cafe_room.json`, `cafe.js`가 읽음). 매장 그림을 바꾸면 spots 를 다시 재고 `--check`(`assets/_src/_check/px_cafe_room.png`)로 확인합니다. 물건 시트는 `props`·`effects`(옛 이름 그대로)·`cafe_objects`(가구, 원본 크기)로 잘리고, 미니게임 방은 `pixel.floor`(체크무늬)·`pixel.paint`(가구 한 장)로 그립니다. `cafe_tileset`은 매장 그림이 없을 때만.
  - **미니게임 사람·물건**(2026-10-26, G-4): `people`(손님·점장님·민재: `sit_*`·`grumble_*`·`walk_*`(2프레임)·`wait_*`·`slip_daeri`·`search_customer`·`manager_idle|cup|stop`·`minjae_idle|tray`)과 `mg_objects`(물건·얼룩·먼지, 원본 크기)는 `px_minigame_sheet.jpg`에서 자릅니다(먼지는 그 시트의 먼지 칸만 Flow 고치기로 다시 그린 2K 그림 `px_minigame_dust.jpg`를 반으로 줄여서, 빈 양동이는 다른 한 장에서). 그림 프롬프트에 'dust bunny'를 쓰면 토끼·쥐로 그려집니다. 사람은 `pixel.person(태그, 발끝 x, y)`(앉은 그림은 의자 다리 끝이 발끝), 물건은 `pixel.art(이름, 배율)`(소품용 잉크 테두리 없음). **미니게임에서 상태 표시 class 이름으로 `px`를 쓰지 않습니다**(픽셀 그림 class 와 겹쳐 잉크 테두리가 씌워짐, `has-art`를 씀).
  - 픽셀 그림은 장식(`aria-hidden`)이고 뜻은 글자로 전합니다. 움직임 줄이기에서는 멈춘 그림만 보입니다. 미니게임 안의 글자를 읽을 때는 `span:not(.px)`처럼 픽셀 그림을 빼고 고릅니다(자동 플레이 도구 참고).

## 6. 자주 틀리는 것

- `h()`의 style 객체에서 `--변수`는 `setProperty`로 처리되어 있습니다(그냥 대입하면 안 먹음).
- 입력창에서 Enter로 다음 화면에 넘어갈 때는 `preventDefault()`를 쓰고, 다음 버튼 포커스는 지연시킵니다(Enter가 다음 버튼까지 누르는 문제).
- 오버레이와 화면을 열면 `input.pushScope`로, 닫으면 `popScope`로 처리해야 스캔과 키보드가 올바른 범위에서 동작합니다.
- 비동기 화면 조작 뒤에 이야기를 이어 갈 때는 runner의 `w()`로 감싸야 합니다(되감기 후 이전 작업이 화면을 건드리지 않게 하는 epoch 검사).
- Electron에서는 `window.prompt`가 동작하지 않습니다. 대신 `ov.prompt()`를 씁니다.
- Electron에서 Web Speech 음성 인식은 대개 동작하지 않습니다. 실패하면 다른 대답 방법을 안내합니다.
- 끝 장면이 투명한 CSS 애니메이션(`forwards`)은 움직임 줄이기에서 0.01ms로 끝나 **아예 안 보입니다.** 이런 요소는 `body.reduce-motion … { animation: none !important; }`로 멈춰 두고 타이머로 지웁니다(이모트·장소 자막·토스트가 이 방식).
- 짧게 떴다 사라지는 연출(컷인·일정 배너)은 브라우저 패널 스크린샷에 잘 안 잡힙니다. 요소를 복제해 붙잡아 두고 두 번 찍어 확인합니다.
- 코드에 `tts.speak('새 문장')`을 넣으면 음성 파일이 없어 브라우저 음성으로 읽힙니다. 같은 문장을 `EXTRA`나 미니게임 `xxxLines()`에도 넣고 `npm run voices`를 실행합니다(`voiceCoverage()`로 확인).
- **저장·불러오기**(`screens/saves.js`, `runner.captureSave()`): 수동 6칸 + 자동 1칸(`progress.checkpoint`). 저장은 *진행 중인 비트가 시작된 순간*(`s.beatSnap`)이고, 점수제 면접 안에서는 면접 처음(`ivStart`)입니다. 근무판(`s.board`)·도장·사진·말도 함께 저장됩니다. 비트가 시작될 때 상태를 바꾸는 새 비트를 만들면 스냅숏에 그 상태가 들어가는지 확인합니다.
- **기록 파일**(2026-10-17, `screens/records.js` · `store.exportRecords/readRecords/importRecords`): 서버 없이 학생 기록 전체를 `.json` 파일로 저장하고 다른 컴퓨터에서 불러옵니다(서버 저장은 사용자 결정으로 보류). 같은 학생(id)은 `mergeProfiles`로 합칩니다(모으기·최댓값, 별명·설정·flags 는 더 최근 쪽, 같은 파일을 두 번 불러와도 그대로). **프로필에 목록·기록처럼 합쳐야 하는 새 칸을 만들면 `normalizeProfile`·`mergeProfiles`에도 넣습니다**(모르는 칸은 그대로 두지만 더 최근 쪽 값만 남음). 선생님 번호·AI 설정은 파일에 넣지 않습니다. 불러오기는 이야기 밖에서만(저장 화면은 이야기 도중 저장만). 웹판·설치용 앱은 한 코드(브랜치를 나누지 않음).
- **매일 매일 카페 생활**(무한 모드, 2026-10-15, `js/data/daily.js`): 엔딩을 본 뒤 근무표 제2막 아래 빈자리(`hub.js` dailyCard)에 열립니다. 하루는 만든 에피소드 `daily:주:요일`(`getEpisode`가 만들어 줌, Math.random 없이 늘 같은 하루). 메모 판(`DAY_MEMOS`)마다 아침 상태(start)·손님 배율(busy)·칸마다 더 줄어드는 것(more → `sim.runBlock`의 `day.more`)·쉬는 시간 칸(breakSlots → 근무판)·피크 직전 기준(need)·아침 점검(early)·마감 점검(endCheck)·오전의 작은 일(event)·메모에 맞는 자석 한 장 더(extra, 근무판은 같은 자석 여러 장 가능)를 정합니다. 피크(s6)의 주문서는 그날그날 다름(`dailyOrders`: 작은 주문 + 단체 주문, 단체는 주가 갈수록 10~24개, 블록 비트의 `day.mini.serve_peak.orders` → runner 가 미니게임 옵션에 합침). 손님 이름(SMALL_WHO·GROUP_WHO)이나 PEAK_COUNT·ORDER_MAX_Q 를 바꾸면 `npm run voices`(export-lines 가 모든 경우를 만듦). 판을 더하거나 숫자를 바꾸면 `node tools/daily-balance.mjs`로 **모든 계획을 돌려 풀 수 있는지** 확인합니다(best 가 모두 OK, '한 장 더'에 함정! 없음). 하루가 끝나면 `main.js` afterDaily → 기록(`store.daily()`) → 하루 끝 카드. 자동 플레이는 `autoplay({ episode: 'daily:1:0' })`(하루 끝 카드에서 멈춤). 읽어 주는 말은 고정 문장만(주 번호·돈은 화면에만).
- **그림 미리 받기**(2026-10-26, `js/ui/loading.js`): 앱을 켜면 `warmAll`이 모든 그림(images.json 의 종류들·초상·픽셀 시트)을 뒤에서 받아 붙잡아 둡니다(받기만, 풀기는 '출근 중' 화면이 그날 그림만: 다 풀면 메모리 수백 MB). 새 그림 종류·폴더를 만들면 warmAll 목록에도 넣습니다. 웹판 캐시는 `npm run build:web`이 만드는 `vercel.json`(`/assets/` 1시간 + stale-while-revalidate)이고, 목록 JSON 은 늘 `cache: 'no-store'`로 받아서 배포하면 바로 바뀝니다(새 목록 JSON 도 같은 방식으로).
- **웹판**(2026-10-17, Vercel 프로젝트 `jch4825s-projects/job-milestone`): 로컬 AI 면접관은 찾지 않습니다(`llm.js` localPage: 설치용 앱·localhost 만). 저장은 그 브라우저에만 남습니다(옮기기·보관은 기록 파일). **공개(정식 배포 `--prod`, 공개 주소 붙이기)는 사용자 허락을 받은 뒤에만** 합니다. 프로젝트의 첫 배포는 Vercel 이 정식으로 올려 공개 주소가 붙었던 일이 있습니다(떼어 냄).
- **표지 오프닝 음악**(2026-10-16): `bgm/title` = Ovani 「Seasonal」. 끝 울림을 다음 반복에 겹친 184초 파일이고, 끝나면 `LOOP_FROM.title`(92.16초)부터 다시 틉니다(처음 한 번만 곡의 시작 = 오프닝). 설치용 앱은 `autoplayPolicy: 'no-user-gesture-required'`라 켜자마자 영상과 함께 나오고, 웹 브라우저는 첫 누름 때 나옵니다(`audio.unlock`이 막혔던 곡을 다시 틂). '소리와 함께 시작' 같은 버튼은 두지 않습니다(사용자 의견).
- **배경음악 돌려 듣기**(`js/av/audio.js` BGM_VARIANTS): 평소 분위기(cafe·morning·home·tea)는 여러 곡을 차례로 틉니다(Visual Novel 팩 곡만: Fantasy 팩 Quiet 곡은 어둡다는 의견으로 뺌). 새 곡은 `tools/audio/audio_map.mjs`에 `cafe_2`처럼 더하고 BGM_VARIANTS에 넣습니다. 상황 곡(peak·tension·warm·ending 등)은 한 곡.
- **확인 창**(`ov.confirm`·`ov.prompt`)은 맨 위 층 `#layer-modal`(z 35, 전체 화면 창 위)에 뜹니다(2026-10-15, 불러오기 창 뒤에 숨던 문제). '다른 창이 열려 있나'를 볼 때는 `#layer-screen .scr, #layer-modal .ov, #layer-overlay .ov`를 함께 봅니다.
- **처음 보는 버튼 알려 주기**(`js/ui/tutor.js`): 그림은 `#layer-tut`(z 40)에만 그리고 버튼 DOM은 건드리지 않습니다. 가려진 버튼(`elementFromPoint`)에는 테두리가 안 나옵니다. 대사 넘기기는 `bus 'dialogue:tap'`, 새 대사는 `'dialogue:line'`으로 셉니다. 디버그: `__jm.tutor.current()`, `__jm.tutor.reset()`. 설정 '처음 보는 버튼 알려 주기'(끄기·처음부터 다시).

## 7. 작업 방식 (사용자 선호)

- 큰 단계를 하나 마칠 때마다 **무엇을 보강했는지 중간 보고**하고 `docs/review_v2.md`를 갱신합니다. 사용자가 검수하고 수정합니다.
- 설정·인물·감정 장면처럼 결정이 필요한 것은 검수 문서의 '검수 포인트'에 적어 확인을 받습니다.
- 음악·효과음·픽셀 아트는 사용자가 제공할 수 있습니다. 필요하면 `docs/asset_requests.md` 형식으로 요청합니다.
