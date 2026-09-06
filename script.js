const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const cell = 20;
const cols = canvas.width / cell;
const rows = canvas.height / cell;

const scoreEl = document.getElementById('score');
const highscoreEl = document.getElementById('highscore');
const overlay = document.getElementById('overlay');
const playBtn = document.getElementById('playBtn');

let snake, dir, nextDir, food, score, highscore, running, gameLoopId, speed;

highscore = parseInt(localStorage.getItem('neonSnakeHighscore') || '0', 10);
highscoreEl.textContent = highscore;

function resetGame() {
  snake = [
    { x: 8, y: 10 },
    { x: 7, y: 10 },
    { x: 6, y: 10 }
  ];
  dir = { x: 1, y: 0 };
  nextDir = { x: 1, y: 0 };
  score = 0;
  speed = 130;
  scoreEl.textContent = score;
  placeFood();
}

function placeFood() {
  let valid = false;
  while (!valid) {
    food = {
      x: Math.floor(Math.random() * cols),
      y: Math.floor(Math.random() * rows)
    };
    valid = !snake.some(s => s.x === food.x && s.y === food.y);
  }
}

function drawCell(x, y, color, glow) {
  ctx.fillStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = glow;
  ctx.fillRect(x * cell + 1, y * cell + 1, cell - 2, cell - 2);
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // ovqat
  drawCell(food.x, food.y, '#ff3ec9', 14);

  // ilon
  snake.forEach((seg, i) => {
    const color = i === 0 ? '#39ff88' : '#2bd670';
    drawCell(seg.x, seg.y, color, i === 0 ? 12 : 6);
  });

  ctx.shadowBlur = 0;
}

function step() {
  dir = nextDir;
  const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };

  // devorga urilish
  if (head.x < 0 || head.x >= cols || head.y < 0 || head.y >= rows) {
    return gameOver();
  }
  // o'ziga urilish
  if (snake.some(s => s.x === head.x && s.y === head.y)) {
    return gameOver();
  }

  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    score += 10;
    scoreEl.textContent = score;
    if (speed > 60) speed -= 3;
    placeFood();
  } else {
    snake.pop();
  }

  draw();
}

function loop() {
  step();
  if (running) {
    gameLoopId = setTimeout(loop, speed);
  }
}

function gameOver() {
  running = false;
  clearTimeout(gameLoopId);
  if (score > highscore) {
    highscore = score;
    localStorage.setItem('neonSnakeHighscore', highscore);
    highscoreEl.textContent = highscore;
  }
  overlay.querySelector('h2').textContent = "O'YIN TUGADI";
  overlay.querySelector('p').textContent = `Skoring: ${score}. Yana urinib ko'r!`;
  playBtn.textContent = 'Qayta boshlash';
  overlay.classList.remove('hidden');
}

function startGame() {
  resetGame();
  overlay.classList.add('hidden');
  running = true;
  draw();
  clearTimeout(gameLoopId);
  gameLoopId = setTimeout(loop, speed);
}

function setDir(x, y) {
  // ilon o'ziga to'g'ridan-to'g'ri qaytishining oldini olish
  if (dir.x === -x && dir.y === -y) return;
  nextDir = { x, y };
}

document.addEventListener('keydown', (e) => {
  switch (e.key) {
    case 'ArrowUp': case 'w': case 'W': setDir(0, -1); break;
    case 'ArrowDown': case 's': case 'S': setDir(0, 1); break;
    case 'ArrowLeft': case 'a': case 'A': setDir(-1, 0); break;
    case 'ArrowRight': case 'd': case 'D': setDir(1, 0); break;
    case ' ':
      if (running) {
        running = false;
        clearTimeout(gameLoopId);
        overlay.querySelector('h2').textContent = 'PAUZA';
        overlay.querySelector('p').textContent = "Davom etish uchun tugmani bos.";
        playBtn.textContent = 'Davom etish';
        overlay.classList.remove('hidden');
      }
      break;
  }
});

playBtn.addEventListener('click', () => {
  if (playBtn.textContent === 'Davom etish') {
    overlay.classList.add('hidden');
    running = true;
    gameLoopId = setTimeout(loop, speed);
  } else {
    startGame();
  }
});

document.getElementById('up').addEventListener('click', () => setDir(0, -1));
document.getElementById('down').addEventListener('click', () => setDir(0, 1));
document.getElementById('left').addEventListener('click', () => setDir(-1, 0));
document.getElementById('right').addEventListener('click', () => setDir(1, 0));

// boshlang'ich chizish
resetGame();
draw();
