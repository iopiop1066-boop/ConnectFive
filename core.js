// 오목 규칙 (자유룰, 15x15): 가로·세로·대각선으로 5개 이상 연속하면 승리.
// 브라우저(window.GomokuCore)와 Node(module.exports) 양쪽에서 사용한다.
(function (root) {
  const N = 15;
  const EMPTY = 0;
  const BLACK = 1;
  const WHITE = 2;
  const DIRS = [[1, 0], [0, 1], [1, 1], [1, -1]];

  function newBoard() {
    return new Int8Array(N * N);
  }

  function inside(x, y) {
    return x >= 0 && x < N && y >= 0 && y < N;
  }

  // (x, y)에 방금 둔 player의 돌로 5목 이상이 만들어졌는지 검사한다.
  function isWin(board, x, y, player) {
    for (const [dx, dy] of DIRS) {
      let count = 1;
      for (let s = 1; s < 5; s++) {
        const nx = x + dx * s, ny = y + dy * s;
        if (!inside(nx, ny) || board[ny * N + nx] !== player) break;
        count++;
      }
      for (let s = 1; s < 5; s++) {
        const nx = x - dx * s, ny = y - dy * s;
        if (!inside(nx, ny) || board[ny * N + nx] !== player) break;
        count++;
      }
      if (count >= 5) return true;
    }
    return false;
  }

  function isFull(board) {
    for (let i = 0; i < board.length; i++) if (board[i] === EMPTY) return false;
    return true;
  }

  // 기존 돌에서 dist 칸 이내의 빈 칸 목록. 돌이 없으면 중앙.
  function candidates(board, dist) {
    const mark = new Uint8Array(N * N);
    const out = [];
    let any = false;
    for (let y = 0; y < N; y++) {
      for (let x = 0; x < N; x++) {
        if (board[y * N + x] === EMPTY) continue;
        any = true;
        for (let dy = -dist; dy <= dist; dy++) {
          for (let dx = -dist; dx <= dist; dx++) {
            const nx = x + dx, ny = y + dy;
            if (!inside(nx, ny)) continue;
            const i = ny * N + nx;
            if (board[i] === EMPTY && !mark[i]) {
              mark[i] = 1;
              out.push(i);
            }
          }
        }
      }
    }
    if (!any) out.push((N >> 1) * N + (N >> 1));
    return out;
  }

  const api = { N, EMPTY, BLACK, WHITE, DIRS, newBoard, inside, isWin, isFull, candidates };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.GomokuCore = api;
})(typeof window !== 'undefined' ? window : globalThis);
