// AI 레벨끼리 대전시켜 강함 순서를 확인한다. 사용: node test/selfplay.js [판수] [레벨A] [레벨B]
const { N, BLACK, WHITE, newBoard, isWin, isFull } = require('../core.js');
const { chooseMove } = require('../ai.js');

function play(blackLevel, whiteLevel) {
  const board = newBoard();
  const levels = { [BLACK]: blackLevel, [WHITE]: whiteLevel };
  let player = BLACK;
  for (;;) {
    const i = chooseMove(board, player, levels[player]);
    board[i] = player;
    if (isWin(board, i % N, (i / N) | 0, player)) return player;
    if (isFull(board)) return 0;
    player = 3 - player;
  }
}

function match(a, b, games) {
  let aWins = 0, bWins = 0, draws = 0;
  const t0 = Date.now();
  for (let g = 0; g < games; g++) {
    const aBlack = g % 2 === 0;
    const winner = aBlack ? play(a, b) : play(b, a);
    if (winner === 0) draws++;
    else if ((winner === BLACK) === aBlack) aWins++;
    else bWins++;
  }
  console.log(`L${a} vs L${b}: ${aWins}승 ${bWins}패 ${draws}무 (${((Date.now() - t0) / 1000).toFixed(1)}s)`);
}

const games = Number(process.argv[2] || 10);
if (process.argv[3] && process.argv[4]) {
  match(Number(process.argv[3]), Number(process.argv[4]), games);
} else {
  for (const [a, b] of [[2, 1], [3, 2], [4, 3], [5, 4], [5, 1]]) match(a, b, games);
}
