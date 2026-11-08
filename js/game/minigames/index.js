import { handwash, handwashLines } from './handwash.js';
import { cups, cupsLines } from './cups.js';
import { order, orderLines } from './order.js';
import { closing, closingLines } from './closing.js';
import { memowrite, memowriteLines } from './memowrite.js';
import { spill, spillLines, SPILL_OOPS } from './spill.js';
import { catchGame, catchLines, CATCH_OOPS } from './catch.js';
import { whack, whackLines, WHACK_OOPS } from './whack.js';
import { snake, snakeLines, SNAKE_OOPS } from './snake.js';
import { timing, timingLines } from './timing.js';
import { tables, tablesLines, TABLES_OOPS } from './tables.js';

/**
 * 미니게임 등록부: mini('이름', 옵션) 비트로 실행. 4장 근무판 자석의 '직접 하기'도 여기서 찾음(js/data/work/tasks.js 의 mini)
 *  - spill: 쏟은 음료 수습(턴 방식)
 *  - catch(받기: 얼음·컵) · timing(빵 진열: 타이밍 맞춰 놓기) · tables(테이블 닦기: 손님이 앉았다 떠난 자리) · whack(반짝반짝 청소: 바닥·쓰레기) · snake(쉬는 시간 지렁이): 4장 손맛 미니게임(2026-10-15).
 *    빠르기는 설정 '시간 제한'을 따르고, 끄기·자동 스캔이면 턴 방식(arcade.js)
 */
export const MINIGAMES = { handwash, cups, order, closing, memowrite, spill, catch: catchGame, timing, tables, whack, snake };

/** 미니게임이 읽어 주는 문장 (tools/export-lines.mjs 가 mini 비트·자석의 옵션으로 호출) */
export const MINIGAME_LINES = { handwash: handwashLines, cups: cupsLines, order: orderLines, closing: closingLines, memowrite: memowriteLines, spill: spillLines, catch: catchLines, timing: timingLines, tables: tablesLines, whack: whackLines, snake: snakeLines };

/** 받기·청소 미니게임의 모양(skin) 이름 (검사기용) */
export const MINIGAME_SKINS = { catch: ['ice', 'cups'], whack: ['floor', 'trash'] };

/** 미니게임 안에서 생기는 아차(아차 노트에 등록) */
export const MINIGAME_OOPS = [SPILL_OOPS, ...Object.values(CATCH_OOPS), TABLES_OOPS, ...Object.values(WHACK_OOPS), SNAKE_OOPS];
