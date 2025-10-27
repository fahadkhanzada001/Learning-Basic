$(document).ready(function () {
  const $boardEl = $("#board");
  const $statusEl = $("#status");
  const $xWinsEl = $("#xWins");
  const $oWinsEl = $("#oWins");
  const $drawsEl = $("#draws");
  const $resetBtn = $("#resetBtn");
  const $resetScoresBtn = $("#resetScoresBtn");
  const $modeSel = $("#mode");
  const $firstMoveSel = $("#firstMove");

  const WINS = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8], // rows
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8], // cols
    [0, 4, 8],
    [2, 4, 6], // diags
  ];

  console.log("Winning Combinations:", WINS); // for debugging
  let board, current, gameOver, scores, mode, humanMark, aiMark;

  function setupBoard() {
    $boardEl.empty();
    for (let i = 0; i < 9; i++) {
      const $btn = $("<button>")
        .addClass("cell")
        .attr("data-index", i)
        .attr("aria-label", `Cell ${i + 1}`)
        .on("click", () => playAt(i))
        .on("keydown", (e) => {
          if ((e.key === "Enter" || e.key === " ") && !$btn.prop("disabled")) {
            e.preventDefault();
            playAt(i);
          }
        });
      $boardEl.append($btn);
    }
  }

  function newRound() {
    board = Array(9).fill(null);
    gameOver = false;
    mode = $modeSel.val();
    const fm =
      $firstMoveSel.val() === "R"
        ? Math.random() < 0.5
          ? "X"
          : "O"
        : $firstMoveSel.val();
    current = fm;
    humanMark = "X";
    aiMark = "O";
    updateUI();
    if (mode.startsWith("cpu") && current === aiMark) {
      setTimeout(cpuMove, 350);
    }
  }

  function updateUI(highlightLine) {
    $boardEl.children().each(function (i) {
      const $btn = $(this);
      $btn
        .text(board[i] ?? "")
        .prop("disabled", !!board[i] || gameOver)
        .toggleClass("win", highlightLine?.includes(i));
    });

    if (!gameOver) {
      if (mode.startsWith("cpu")) {
        const turnName = current === humanMark ? "Your" : "Computer";
        $statusEl.html(`<strong>${turnName}</strong> turn (${current}).`);
      } else {
        $statusEl.html(`Turn: <strong>${current}</strong>`);
      }
    }
  }

  function playAt(i) {
    if (gameOver || board[i]) return;
    board[i] = current;
    const result = evaluate(board);
    if (result.winner) return finishGame(result.winner, result.line);
    if (result.draw) return finishGame(null);

    current = current === "X" ? "O" : "X";
    updateUI();
    if (mode.startsWith("cpu") && current === aiMark && !gameOver) {
      setTimeout(cpuMove, 250);
    }
  }

  function finishGame(winner, line) {
    gameOver = true;
    if (winner) {
      $statusEl.html(`Winner: <strong>${winner}</strong> 🎉`);
      if (winner === "X") $xWinsEl.text(++scores.X);
      else $oWinsEl.text(++scores.O);
    } else {
      $statusEl.text("It's a draw.");
      $drawsEl.text(++scores.D);
    }
    updateUI(line);
  }

  function evaluate(b) {
    for (const line of WINS) {
      const [a, b1, c] = line;
      if (b[a] && b[a] === b[b1] && b[a] === b[c]) {
        return { winner: b[a], line };
      }
    }
    if (b.every((v) => v)) return { draw: true };
    return {};
  }

  function cpuMove() {
    if (mode === "cpu-easy") {
      const empty = board
        .map((v, i) => (v ? null : i))
        .filter((v) => v !== null);
      const pick = empty[Math.floor(Math.random() * empty.length)];
      playAt(pick);
    } else if (mode === "cpu-hard") {
      const best = bestMoveMinimax(board, aiMark);
      playAt(best.index);
    }
  }

  function bestMoveMinimax(b, player) {
    const opp = player === "X" ? "O" : "X";
    const res = evaluate(b);
    if (res.winner === aiMark) return { score: +10 };
    if (res.winner === humanMark) return { score: -10 };
    if (res.draw) return { score: 0 };

    const moves = [];
    for (let i = 0; i < 9; i++) {
      if (!b[i]) {
        const newBoard = b.slice();
        newBoard[i] = player;
        const result = bestMoveMinimax(newBoard, opp);
        moves.push({ index: i, score: result.score });
      }
    }

    if (player === aiMark) {
      let best = -Infinity,
        bestIdx = null;
      for (const m of moves) {
        if (m.score > best) {
          best = m.score;
          bestIdx = m.index;
        }
      }
      return { index: bestIdx, score: best };
    } else {
      let best = +Infinity,
        bestIdx = null;
      for (const m of moves) {
        if (m.score < best) {
          best = m.score;
          bestIdx = m.index;
        }
      }
      return { index: bestIdx, score: best };
    }
  }

  function resetScores() {
    scores = { X: 0, O: 0, D: 0 };
    $xWinsEl.text(scores.X);
    $oWinsEl.text(scores.O);
    $drawsEl.text(scores.D);
  }

  console.log("Game State:", { board, current, gameOver }); // for debugging 
  // EVENTS
  $resetBtn.on("click", newRound);
  $resetScoresBtn.on("click", () => {
    resetScores();
    newRound();
  });
  $modeSel.on("change", newRound);
  $firstMoveSel.on("change", newRound);

  // INIT
  setupBoard();
  resetScores();
  newRound();
});
