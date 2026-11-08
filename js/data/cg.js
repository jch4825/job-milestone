/**
 * 이벤트 CG (감정 포인트의 전체 화면 그림, assets/cg/cg_{id}.jpg)
 * 대본의 cg('door') 비트가 쓰고, 그림이 있을 때만 보입니다. 본 CG 는 수첩 사진첩에 모입니다.
 * 장면 설명과 프롬프트: docs/image_requests.md D 묶음
 */

export const CGS = {
  door: { ep: 'prologue', title: '문 앞의 첫인사' },
  syrup: { ep: 'd2', title: '같이 닦아요' },
  badge: { ep: 'ch3', title: '정규 크루 배지' },
  jiho: { ep: 'epilogue', title: '이번에는 내가 문을 열어요' },
  wall: { ep: 'ending', title: '다 함께, 내일 봐요' },
};

export const CG_IDS = Object.keys(CGS);
