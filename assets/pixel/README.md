# 마일스톤 팝 픽셀 에셋

`docs/asset_requests.md` 7장의 1차 픽셀 아트 요청을 기준으로 만든 게임용 원본 에셋입니다.

## 파일

- `yeonwoo.png` / `yeonwoo.json`: SD 연우 스프라이트(2026-10-25부터, 프레임 120×159). Flow로 만든 한 장짜리 시트 `assets/_src/pixel/px_yeonwoo_sheet.jpg`를 `npm run pixel`(`tools/import-pixel-sheet.py`)이 잘라 만듭니다. 태그: `idle`, 4방향 `walk`, `wash`, `carry`, `wipe`, `sweep`, `bow`, `panic`, `happy`, `memo`, `point`, `wave`. JSON 의 `unit`·`foot`은 `js/ui/pixel.js` 참고. 아래 생성 스크립트는 연우를 만들지 않습니다.
- `dohyun.png` / `dohyun.json`: 도현의 `idle`, 4방향 `walk`, `point`
- `sora.png` / `sora.json`: 소라의 `idle`, 4방향 `walk`, `point`
- `cafe_room.png` / `cafe_room.json`: 4장 근무판 매장 그림(1280×448)과 일하는 자리(`spots`). `assets/_src/pixel/px_cafe_room.jpg`에서 `npm run pixel`이 잘라 만듭니다(2026-10-25).
- `cafe_objects.png` / `cafe_objects.json`: 미니게임 방 가구(문·테이블·의자·화분·계산대·세면대·창문 등, 원본 크기). `px_cafe_objects.jpg`에서.
- `props.png` / `props.json`: 종이컵·음료·빵·행주·쓰레기통 등 소품(옛 이름 그대로, unit 으로 옛 16px 크기). `px_cafe_objects.jpg`에서(2026-10-25).
- `effects.png` / `effects.json`: 거품·물방울·반짝임·세균·김·하트·별·먼지 프레임(옛 이름 그대로). `px_cafe_objects.jpg`에서(2026-10-25).
- `people.png` / `people.json`: 미니게임 손님·점장님·민재 30장(프레임 142×174, 연우와 같은 `unit`·`foot`). 앉아 먹기 `sit_*`·투덜 `grumble_*`(손님 6명) · 걷기 `walk_*`(4명, 2프레임 태그) · `wait_*` · `slip_daeri` · `search_customer` · `manager_idle|cup|stop` · `minjae_idle|tray`. `assets/_src/pixel/px_minigame_sheet.jpg`에서(2026-10-26, G-4).
- `mg_objects.png` / `mg_objects.json`: 미니게임 물건·얼룩·먼지 24개(원본 크기, unit 1): 제빙기·유리컵·양동이·상자·얼음통·컵 보관대·진열장·주방 창·얼룩 3가지·주스 웅덩이 2크기·휴대폰·접시·커피잔·쓰레기봉투 2가지·물비누·종이 타월·휴지·빨대 포장지·먼지 2크기. 먼지(`px_minigame_dust.jpg`, 얼굴을 지움)·양동이(`px_minigame_bucket.jpg`)만 다른 그림에서.
- `cafe_tileset.png` / `cafe_tileset.json`: 16×16 카페 타일셋(옛 그림, 매장 그림이 없을 때만 씀)
- `acha_bubble.png`: 실패 결과 화면에 쓸 `아차!` 말풍선
- `preview.png`: 검수용 4배 확대 미리보기(생성 스크립트를 실행하면 만들어짐, 게임에는 쓰지 않아 지워 둠)

인게임에서는 PNG를 4배 nearest-neighbor로 확대해 480×270 기준 화면에 사용합니다. JSON의 좌표는 원본 PNG 기준입니다.

재생성 명령:

```powershell
py tools/generate-pixel-assets.py
```

기존 파일을 의도적으로 교체해야 할 때만 `--force`를 붙입니다.

검수 명령:

```powershell
py tools/validate-pixel-assets.py
```
