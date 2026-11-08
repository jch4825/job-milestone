/**
 * '오늘의 한 장' 폴라로이드 (에피소드마다 1장, 엔딩 사진 벽에 모임)
 * render(): 사진 안쪽(4:5 비율) HTML. 초상과 픽토그램을 조합합니다.
 */

import { portraitHTML } from './characters.js';
import { ICON } from './icons.js';
import { store } from '../core/store.js';
import { escapeHtml } from '../core/dom.js';
import { img } from '../core/assets.js';
import { artHTML, itemOf } from './items.js';

const sticker = (icon, cls = '') => `<div class="ph-sticker ${cls}">${ICON(icon)}</div>`;
const face = (id, f, cls = '') => `<div class="ph-face ${cls}">${portraitHTML(id, f)}</div>`;

export const MEMO_TIPS = {
  ask: '모르면 물어보기. 물어봐도 괜찮아요.',
  report: '실수하면 바로 말하기. 같이 해결해요.',
  memo: '헷갈리면 노란 메모 보기.',
  breathe: '긴장되면 숨 세 번 쉬기.',
  help: '필요한 도움은 말해도 돼요.',
  hands: '트레이는 두 손으로!',
};

export const PHOTOS = {
  note: {
    ep: 'prologue', title: '엄마의 쪽지',
    render: () => '<div class="ph-bg" style="background:#F6EBDD"><div class="ph-note">연우야,<br>모르면 물어보면 돼.<br>엄마는 연우를 믿어.</div></div>',
  },
  contract: {
    ep: 'ch1', title: '나의 첫 계약서',
    // 사진 그림이 아직 없어 소품 그림(도장 찍힌 계약서 클립보드)을 책상 위에 둠. 그것도 없으면 그린 종이
    render: () => (itemOf('item_contract')
      ? `<div class="ph-bg ph-desk">${artHTML('item_contract', 'ph-item')}</div>`
      : `<div class="ph-bg" style="background:#E9E1D3"><div class="ph-doc"><b>근로계약서</b><i></i><i></i><i></i><i class="short"></i><span class="ph-seal">정연우</span></div></div>`),
  },
  minjae: {
    ep: 'd1', title: '민재 선배의 귀덮개',
    render: () => `<div class="ph-bg" style="background:#F2E4CB">${face('minjae', 'smile', 'big')}${sticker('earplug', 'br')}</div>`,
  },
  open: {
    ep: 'd2', title: 'OPEN! 첫 손님',
    render: () => `<div class="ph-bg" style="background:#FFE9C4">${sticker('sign_open', 'center xl red')}${face('yeonwoo', 'smile', 'small bl')}</div>`,
  },
  grandma: {
    ep: 'd3', title: '봉순 할머니와 소금빵',
    render: () => `<div class="ph-bg" style="background:#F6E7D8">${face('grandma', 'smile', 'big')}${sticker('bread', 'br')}</div>`,
  },
  latte: {
    ep: 'd4', title: '얼굴 대신 라테만 찰칵',
    render: () => '<div class="ph-bg" style="background:#E8D6C3"><div class="ph-latte"><div class="ph-latte-heart"></div></div></div>',
  },
  tea: {
    ep: 'd5', title: '도현 선배와 티타임',
    render: () => `<div class="ph-bg" style="background:#E9F0E3">${sticker('tea', 'left xl')}${sticker('tea', 'right xl yellow')}</div>`,
  },
  badge: {
    ep: 'ch3', title: '정규 크루가 된 날',
    render: () => `<div class="ph-bg" style="background:#FFE1D6">${face('yeonwoo', 'smile', 'big')}${sticker('badge', 'br gold')}</div>`,
  },
  memo: {
    ep: 'epilogue', title: '나의 첫 메모', file: 'memo_bg',
    render: () => `<div class="ph-bg" style="background:#C49A63">${memoPostit()}</div>`,
    // 그림(코르크판)이 있으면 그 위에 플레이어가 고른 메모 글을 얹음
    overlay: () => `<div class="ph-bg ph-over">${memoPostit()}</div>`,
  },
  mom: {
    ep: 'epilogue', title: '엄마에게 첫 선물',
    render: () => `<div class="ph-bg" style="background:#ECE6FF">${face('mom', 'smile', 'big')}${sticker('gift', 'br red')}</div>`,
  },
  board: {
    ep: 'ch4_1', title: '나의 첫 근무판',
    // 사진 그림(assets/photos/board.jpg)이 아직 없어 화이트보드와 자석을 그림. 자석 색은 근무판의 종류 색(tasks.js KINDS)
    render: () => `<div class="ph-bg" style="background:#DCE6EC"><div class="ph-board"><b>화요일 근무판</b>${['#3D8BD9', '#3D8BD9', '#16A99A', '#E0B100', '#E3262E'].map((c, i) => `<i style="--c:${c};--w:${[70, 56, 64, 48, 60][i]}%"></i>`).join('')}</div>${face('yeonwoo', 'smile', 'small bl')}</div>`,
  },
};

export const PHOTO_ORDER = ['note', 'contract', 'minjae', 'open', 'grandma', 'latte', 'tea', 'badge', 'memo', 'mom', 'board'];

function memoPostit() {
  const tips = (store.flag('memoTips') || ['ask', 'report', 'breathe']).map((k) => MEMO_TIPS[k]).filter(Boolean);
  return `<div class="ph-postit"><b>지호 씨에게</b>${tips.map((t, i) => `<span>${i + 1}. ${escapeHtml(t)}</span>`).join('')}<em>- 연우</em></div>`;
}

/** 사진 안쪽 HTML: assets/photos/{id}.jpg 가 있으면 그 그림, 없으면 초상·픽토그램을 합친 임시 사진 */
export function photoHTML(id) {
  const p = PHOTOS[id];
  if (!p) return '';
  const u = img.url('photos', p.file || id);
  if (u) return `<img class="ph-img" src="${u}" alt="" draggable="false">${p.overlay ? p.overlay() : ''}`;
  return p.render();
}
