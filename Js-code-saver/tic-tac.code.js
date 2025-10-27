// HTML se board ka element le rahe hain (jaha cells dikhengi)
const boardEl = document.getElementById("board");

// Status text dikhane ke liye element (e.g., "X's turn", "Winner: O")
const statusEl = document.getElementById("status");

// Scoreboard ke numbers lene ke liye elements
const xWinsEl = document.getElementById("xWins");
const oWinsEl = document.getElementById("oWins");
const drawsEl = document.getElementById("draws");

// Buttons ke elements
const resetBtn = document.getElementById("resetBtn");
const resetScoresBtn = document.getElementById("resetScoresBtn");

// Select dropdowns
const modeSel = document.getElementById("mode"); // Mode selection (PVP, CPU Easy, CPU Hard)
const firstMoveSel = document.getElementById("firstMove"); // Kaun pehle khelega (X/O/Random)

// Winning positions ka array — har inner array me 3 index hote hain jo line banate hain
const WINS = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8], // rows
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8], // columns
  [0, 4, 8],
  [2, 4, 6], // diagonals
];

// Game ke state ko store karne ke liye variables
let board, current, gameOver, scores, mode, humanMark, aiMark;

// Board ko setup karne ka function (UI me 9 buttons banana)
function setupBoard() {
  boardEl.innerHTML = ""; // Purana board clear karna
  for (let i = 0; i < 9; i++) {
    // 9 baar loop (9 cells)
    const btn = document.createElement("button"); // Button create karna
    btn.className = "cell"; // CSS class assign karna
    btn.setAttribute("data-index", i); // Index save karna (kaunsi cell hai)
    btn.setAttribute("aria-label", `Cell ${i + 1}`); // Accessibility ke liye label
    btn.addEventListener("click", () => playAt(i)); // Click hone par cell fill kare
    btn.addEventListener("keydown", (e) => {
      // Keyboard support (Enter/Space)
      if ((e.key === "Enter" || e.key === " ") && !btn.disabled) {
        e.preventDefault();
        playAt(i);
      }
    });
    boardEl.appendChild(btn); // Button board me add karna
  }
}

// Nayi round shuru karne ka function
function newRound() {
  board = Array(9).fill(null); // 9 empty cells (null means khali)
  gameOver = false; // Game chalu hai
  mode = modeSel.value; // Mode dropdown se value lena

  // First move decide karna (Random option bhi hai)
  const fm =
    firstMoveSel.value === "R"
      ? Math.random() < 0.5
        ? "X"
        : "O"
      : firstMoveSel.value;

  current = fm; // Current player ko set karna
  humanMark = "X"; // Human ka mark (by default X)
  aiMark = "O"; // Computer ka mark (by default O)

  updateUI(); // Board refresh karna

  // Agar mode CPU hai aur pehla move AI ka hai, to AI ka move kare
  if (mode.startsWith("cpu") && current === aiMark) {
    setTimeout(cpuMove, 350); // Thoda delay for UX
  }
}

// UI update karne ka function
function updateUI(highlightLine) {
  for (let i = 0; i < 9; i++) {
    // Har cell update karna
    const btn = boardEl.children[i];
    btn.textContent = board[i] ?? ""; // Board me jo value hai (X/O) wo set karna
    btn.disabled = !!board[i] || gameOver; // Agar filled ya game over, disable karna
    btn.classList.toggle("win", highlightLine?.includes(i)); // Win line highlight
  }
  if (!gameOver) {
    if (mode.startsWith("cpu")) {
      const turnName = current === humanMark ? "Your" : "Computer";
      statusEl.innerHTML = `<strong>${turnName}</strong> turn (${current}).`;
    } else {
      statusEl.innerHTML = `Turn: <strong>${current}</strong>`;
    }
  }
}

// Player ka move handle karna
function playAt(i) {
  if (gameOver || board[i]) return; // Agar game khatam ya cell filled, kuch mat karo
  board[i] = current; // Cell me current player ka mark lagao

  const result = evaluate(board); // Win/draw check karo

  if (result.winner) {
    // Agar koi jeeta
    finishGame(result.winner, result.line);
    return;
  }
  if (result.draw) {
    // Agar draw hai
    finishGame(null);
    return;
  }

  // Turn switch karo
  current = current === "X" ? "O" : "X";
  updateUI();

  // Agar CPU ka turn hai
  if (mode.startsWith("cpu") && current === aiMark && !gameOver) {
    setTimeout(cpuMove, 250);
  }
}

// Game finish hone par chalne wala function
function finishGame(winner, line) {
  gameOver = true;
  if (winner) {
    statusEl.innerHTML = `Winner: <strong>${winner}</strong> 🎉`;
    if (winner === "X") xWinsEl.textContent = ++scores.X;
    else oWinsEl.textContent = ++scores.O;
  } else {
    statusEl.textContent = `It's a draw.`;
    drawsEl.textContent = ++scores.D;
  }
  updateUI(line); // Winning line highlight karo
}

// Board ko check karne ka function (win/draw)
function evaluate(b) {
  for (const line of WINS) {
    // Har winning combo check karo
    const [a, b1, c] = line;
    if (b[a] && b[a] === b[b1] && b[a] === b[c]) {
      return { winner: b[a], line }; // Winner mil gaya
    }
  }
  if (b.every((v) => v)) return { draw: true }; // Sab fill -> draw
  return {};
}

// CPU ka move
function cpuMove() {
  if (mode === "cpu-easy") {
    // Random cell choose karo
    const empty = board.map((v, i) => (v ? null : i)).filter((v) => v !== null);
    const pick = empty[Math.floor(Math.random() * empty.length)];
    playAt(pick);
  } else if (mode === "cpu-hard") {
    // Minimax se best move choose karo
    const best = bestMoveMinimax(board, aiMark);
    playAt(best.index);
  }
}

// Minimax algorithm (AI unbeatable banane ke liye)
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
    // Score maximize karo
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
    // Score minimize karo
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

// Scores reset karna
function resetScores() {
  scores = { X: 0, O: 0, D: 0 };
  xWinsEl.textContent = scores.X;
  oWinsEl.textContent = scores.O;
  drawsEl.textContent = scores.D;
}

// EVENTS (buttons aur dropdowns ka kaam)
resetBtn.addEventListener("click", newRound); // New Round button
resetScoresBtn.addEventListener("click", () => {
  resetScores();
  newRound();
}); // Reset Scores button
modeSel.addEventListener("change", newRound); // Mode change hone par
firstMoveSel.addEventListener("change", newRound); // First move change hone par

// INIT (start game)
setupBoard(); // Board create karo
resetScores(); // Scores 0 se start karo
newRound(); // Pehli game shuru karo
