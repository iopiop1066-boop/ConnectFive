// 오목 AI (난이도 1~5). 숫자가 클수록 강하다.
// 1: 랜덤 / 2: 즉시 승리·즉시 방어 / 3: 패턴 점수 1수 평가
// 4: 2수 탐색 / 5: 알파-베타 4수 탐색
(function (root) {
  const Core = typeof require !== 'undefined' ? require('./core.js') : root.GomokuCore;
  const { N, EMPTY, DIRS, isWin, candidates, inside } = Core;

  const WIN_SCORE = 10000000;

  // 연속 길이 count, 열린 끝 수 open(0~2)에 대한 점수
  function patternScore(count, open) {
    if (count >= 5) return 100000;
    if (open === 0) return 0;
    switch (count) {
      case 4: return open === 2 ? 10000 : 1000;
      case 3: return open === 2 ? 1000 : 100;
      case 2: return open === 2 ? 100 : 10;
      default: return open === 2 ? 10 : 1;
    }
  }

  // 빈 칸 (x, y)에 player가 둔다고 가정했을 때의 4방향 패턴 점수 합
  function cellScore(board, x, y, player) {
    let total = 0;
    for (const [dx, dy] of DIRS) {
      let count = 1, open = 0;
      let nx = x + dx, ny = y + dy;
      while (inside(nx, ny) && board[ny * N + nx] === player) { count++; nx += dx; ny += dy; }
      if (inside(nx, ny) && board[ny * N + nx] === EMPTY) open++;
      nx = x - dx; ny = y - dy;
      while (inside(nx, ny) && board[ny * N + nx] === player) { count++; nx -= dx; ny -= dy; }
      if (inside(nx, ny) && board[ny * N + nx] === EMPTY) open++;
      total += patternScore(count, open);
    }
    return total;
  }

  // 후보 칸의 공격+수비 점수 (수비에 약간 가중)
  function moveHeuristic(board, i, player) {
    const x = i % N, y = (i / N) | 0;
    const opp = 3 - player;
    return cellScore(board, x, y, player) * 1.1 + cellScore(board, x, y, opp);
  }

  // 판 전체 평가: player 관점에서 (내 패턴 - 상대 패턴)
  function evaluate(board, player) {
    const opp = 3 - player;
    let score = 0;
    for (let y = 0; y < N; y++) {
      for (let x = 0; x < N; x++) {
        const p = board[y * N + x];
        if (p === EMPTY) continue;
        for (const [dx, dy] of DIRS) {
          // 런의 시작점에서만 센다
          const px = x - dx, py = y - dy;
          if (inside(px, py) && board[py * N + px] === p) continue;
          let count = 0, nx = x, ny = y;
          while (inside(nx, ny) && board[ny * N + nx] === p) { count++; nx += dx; ny += dy; }
          let open = 0;
          if (inside(nx, ny) && board[ny * N + nx] === EMPTY) open++;
          if (inside(px, py) && board[py * N + px] === EMPTY) open++;
          const s = patternScore(count, open);
          score += p === player ? s : -s * 1.1;
        }
      }
    }
    return score;
  }

  function sortedCandidates(board, player, width) {
    const list = candidates(board, 2).map((i) => ({ i, h: moveHeuristic(board, i, player) }));
    list.sort((a, b) => b.h - a.h);
    return list.slice(0, width).map((c) => c.i);
  }

  // player가 둘 차례. 알파-베타 minimax. root 관점 점수 반환.
  function search(board, player, rootPlayer, depth, alpha, beta, width) {
    const maximizing = player === rootPlayer;
    const moves = sortedCandidates(board, player, width);
    if (moves.length === 0) return 0;
    let best = maximizing ? -Infinity : Infinity;
    for (const i of moves) {
      const x = i % N, y = (i / N) | 0;
      board[i] = player;
      let score;
      if (isWin(board, x, y, player)) {
        score = (maximizing ? 1 : -1) * (WIN_SCORE + depth);
      } else if (depth <= 1) {
        score = evaluate(board, rootPlayer);
      } else {
        score = search(board, 3 - player, rootPlayer, depth - 1, alpha, beta, width);
      }
      board[i] = EMPTY;
      if (maximizing) {
        if (score > best) best = score;
        if (best > alpha) alpha = best;
      } else {
        if (score < best) best = score;
        if (best < beta) beta = best;
      }
      if (alpha >= beta) break;
    }
    return best;
  }

  function pick(arr) {
    return arr[(Math.random() * arr.length) | 0];
  }

  // 즉시 이기는 칸, 상대가 다음에 이기는 칸을 찾는다.
  function findForcedMove(board, player, cands) {
    const opp = 3 - player;
    let block = -1;
    for (const i of cands) {
      const x = i % N, y = (i / N) | 0;
      board[i] = player;
      const win = isWin(board, x, y, player);
      board[i] = EMPTY;
      if (win) return i;
      if (block < 0) {
        board[i] = opp;
        if (isWin(board, x, y, opp)) block = i;
        board[i] = EMPTY;
      }
    }
    return block;
  }

  function searchMove(board, player, depth, width) {
    const moves = sortedCandidates(board, player, width);
    let bestScore = -Infinity;
    let bestMoves = [];
    let alpha = -Infinity;
    for (const i of moves) {
      board[i] = player;
      const score = search(board, 3 - player, player, depth - 1, alpha, Infinity, width);
      board[i] = EMPTY;
      if (score > bestScore) { bestScore = score; bestMoves = [i]; }
      else if (score === bestScore) bestMoves.push(i);
      if (score > alpha) alpha = score;
    }
    return pick(bestMoves);
  }

  // board는 호출 중 임시로 수정되지만 반환 시 원상복구된다. 반환값: 칸 인덱스(y*N+x)
  function chooseMove(board, player, level) {
    const cands = candidates(board, 2);

    if (level === 1) {
      // 이길 수 있을 때만 이기고, 그 외에는 무작위
      const forced = findForcedMove(board, player, cands);
      if (forced >= 0 && isWinningMove(board, forced, player)) return forced;
      return pick(cands);
    }

    const forced = findForcedMove(board, player, cands);
    if (forced >= 0) return forced;

    if (level === 2) {
      const near = candidates(board, 1);
      return pick(near);
    }

    if (level === 3) {
      // 1수 평가. 가끔 차선책을 둬서 4단계보다 약하게 유지한다.
      const scored = cands.map((i) => ({ i, h: moveHeuristic(board, i, player) }));
      scored.sort((a, b) => b.h - a.h);
      return Math.random() < 0.2 && scored.length > 1 ? scored[1].i : scored[0].i;
    }

    if (level === 4) return searchMove(board, player, 2, 12);
    return searchMove(board, player, 4, 14);
  }

  function isWinningMove(board, i, player) {
    board[i] = player;
    const win = isWin(board, i % N, (i / N) | 0, player);
    board[i] = EMPTY;
    return win;
  }

  const api = { chooseMove, evaluate };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.GomokuAI = api;
})(typeof window !== 'undefined' ? window : globalThis);
