const assert = require('assert');
const { N, BLACK, WHITE, newBoard, isWin } = require('../core.js');
const { chooseMove } = require('../ai.js');

function place(board, stones, player) {
  for (const [x, y] of stones) board[y * N + x] = player;
}

// 가로·세로·대각 5목
for (const [name, stones] of [
  ['가로', [[3, 5], [4, 5], [5, 5], [6, 5], [7, 5]]],
  ['세로', [[5, 3], [5, 4], [5, 5], [5, 6], [5, 7]]],
  ['대각 \\', [[3, 3], [4, 4], [5, 5], [6, 6], [7, 7]]],
  ['대각 /', [[7, 3], [6, 4], [5, 5], [4, 6], [3, 7]]],
]) {
  const b = newBoard();
  place(b, stones, BLACK);
  assert(isWin(b, 5, 5, BLACK), `${name} 5목 승리`);
}

// 4목은 승리 아님, 6목(자유룰)은 승리
let b = newBoard();
place(b, [[3, 5], [4, 5], [5, 5], [6, 5]], BLACK);
assert(!isWin(b, 5, 5, BLACK), '4목은 승리 아님');
place(b, [[7, 5], [8, 5]], BLACK);
assert(isWin(b, 5, 5, BLACK), '6목도 승리');

// 가장자리 경계
b = newBoard();
place(b, [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0]], WHITE);
assert(isWin(b, 0, 0, WHITE), '가장자리 5목');

// AI: 즉시 승리 / 즉시 방어 (레벨 2~5)
for (let level = 2; level <= 5; level++) {
  b = newBoard();
  place(b, [[3, 7], [4, 7], [5, 7], [6, 7]], WHITE);
  place(b, [[3, 8], [4, 8], [5, 8]], BLACK);
  assert([2 * 0 + 7 * N + 2, 7 * N + 7].includes(chooseMove(b, WHITE, level)), `레벨${level} 즉시 승리`);

  b = newBoard();
  place(b, [[3, 7], [4, 7], [5, 7], [6, 7]], BLACK);
  place(b, [[3, 9], [4, 9]], WHITE);
  assert([7 * N + 2, 7 * N + 7].includes(chooseMove(b, WHITE, level)), `레벨${level} 즉시 방어`);
}

console.log('모든 테스트 통과');
