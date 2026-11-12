(function () {
  const { N, EMPTY, BLACK, WHITE, newBoard, isWin, isFull } = window.GomokuCore;
  const { chooseMove } = window.GomokuAI;

  const canvas = document.getElementById('board');
  const ctx = canvas.getContext('2d');
  const statusEl = document.getElementById('status');
  const levelEl = document.getElementById('level');
  const sideEl = document.getElementById('side');
  const aiRows = document.querySelectorAll('.ai-only');

  const SIZE = canvas.width;
  const PAD = 30;
  const CELL = (SIZE - PAD * 2) / (N - 1);
  const STAR_POINTS = [[3, 3], [11, 3], [7, 7], [3, 11], [11, 11]];

  let board, turn, over, lastMove, aiTimer;

  function mode() {
    return document.querySelector('input[name="mode"]:checked').value;
  }

  function humanColor() {
    return Number(sideEl.value);
  }

  function isAiTurn() {
    return mode() === 'ai' && turn !== humanColor();
  }

  function names(player) {
    return player === BLACK ? '흑' : '백';
  }

  function drawStone(x, y, player, isLast) {
    const cx = PAD + x * CELL, cy = PAD + y * CELL, r = CELL * 0.43;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = player === BLACK ? '#111' : '#f8f8f8';
    ctx.fill();
    ctx.strokeStyle = '#111';
    ctx.lineWidth = 1;
    ctx.stroke();
    if (isLast) {
      ctx.beginPath();
      ctx.arc(cx, cy, r * 0.28, 0, Math.PI * 2);
      ctx.fillStyle = '#e53935';
      ctx.fill();
    }
  }

  function render() {
    ctx.fillStyle = '#e2b667';
    ctx.fillRect(0, 0, SIZE, SIZE);
    ctx.strokeStyle = '#5a3d1a';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i < N; i++) {
      const p = PAD + i * CELL;
      ctx.moveTo(PAD, p); ctx.lineTo(SIZE - PAD, p);
      ctx.moveTo(p, PAD); ctx.lineTo(p, SIZE - PAD);
    }
    ctx.stroke();
    ctx.fillStyle = '#5a3d1a';
    for (const [x, y] of STAR_POINTS) {
      ctx.beginPath();
      ctx.arc(PAD + x * CELL, PAD + y * CELL, 4, 0, Math.PI * 2);
      ctx.fill();
    }
    for (let y = 0; y < N; y++) {
      for (let x = 0; x < N; x++) {
        const p = board[y * N + x];
        if (p !== EMPTY) drawStone(x, y, p, lastMove === y * N + x);
      }
    }
  }

  function setStatus(text) {
    statusEl.textContent = text;
  }

  function updateTurnStatus() {
    if (isAiTurn()) setStatus(`AI(${names(turn)}) 생각 중...`);
    else if (mode() === 'ai') setStatus(`내 차례 (${names(turn)})`);
    else setStatus(`${names(turn)}의 차례`);
  }

  function place(i) {
    board[i] = turn;
    lastMove = i;
    render();
    if (isWin(board, i % N, (i / N) | 0, turn)) {
      over = true;
      const who = mode() === 'ai' ? (turn === humanColor() ? '당신' : 'AI') : names(turn);
      setStatus(`${who} 승리! (${names(turn)} 5목)`);
      return;
    }
    if (isFull(board)) {
      over = true;
      setStatus('무승부');
      return;
    }
    turn = 3 - turn;
    updateTurnStatus();
    if (isAiTurn()) scheduleAi();
  }

  function scheduleAi() {
    clearTimeout(aiTimer);
    aiTimer = setTimeout(() => {
      if (over || !isAiTurn()) return;
      place(chooseMove(board, turn, Number(levelEl.value)));
    }, 300);
  }

  function newGame() {
    clearTimeout(aiTimer);
    board = newBoard();
    turn = BLACK;
    over = false;
    lastMove = -1;
    aiRows.forEach((el) => el.classList.toggle('hidden', mode() !== 'ai'));
    render();
    updateTurnStatus();
    if (isAiTurn()) scheduleAi();
  }

  canvas.addEventListener('click', (e) => {
    if (over || isAiTurn()) return;
    const rect = canvas.getBoundingClientRect();
    const scale = SIZE / rect.width;
    const x = Math.round(((e.clientX - rect.left) * scale - PAD) / CELL);
    const y = Math.round(((e.clientY - rect.top) * scale - PAD) / CELL);
    if (x < 0 || x >= N || y < 0 || y >= N || board[y * N + x] !== EMPTY) return;
    place(y * N + x);
  });

  document.getElementById('restart').addEventListener('click', newGame);
  document.querySelectorAll('input[name="mode"]').forEach((el) => el.addEventListener('change', newGame));
  levelEl.addEventListener('change', newGame);
  sideEl.addEventListener('change', newGame);

  newGame();
})();
