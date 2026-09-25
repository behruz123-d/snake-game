import { useCallback, useEffect, useRef, useState } from "react";
import "./style.css";

const SIZE = 20;
const START_SNAKE = [
  { x: 10, y: 10 },
  { x: 9, y: 10 },
  { x: 8, y: 10 },
];

const DIRECTIONS = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 },
};

function randomFood(snake) {
  const free = [];
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      if (!snake.some((part) => part.x === x && part.y === y)) {
        free.push({ x, y });
      }
    }
  }
  return free[Math.floor(Math.random() * free.length)] || { x: 0, y: 0 };
}

function App() {
  const [snake, setSnake] = useState(START_SNAKE);
  const [food, setFood] = useState(() => randomFood(START_SNAKE));
  const [direction, setDirection] = useState(DIRECTIONS.RIGHT);
  const [nextDirection, setNextDirection] = useState(DIRECTIONS.RIGHT);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(
    () => Number(localStorage.getItem("snake-best")) || 0
  );
  const [running, setRunning] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const directionRef = useRef(DIRECTIONS.RIGHT);

  const resetGame = useCallback(() => {
    setSnake(START_SNAKE);
    setFood(randomFood(START_SNAKE));
    setDirection(DIRECTIONS.RIGHT);
    setNextDirection(DIRECTIONS.RIGHT);
    directionRef.current = DIRECTIONS.RIGHT;
    setScore(0);
    setGameOver(false);
    setRunning(true);
  }, []);

  const changeDirection = useCallback((newDirection) => {
    const current = directionRef.current;

    if (
      current.x + newDirection.x === 0 &&
      current.y + newDirection.y === 0
    ) {
      return;
    }

    directionRef.current = newDirection;
    setNextDirection(newDirection);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      const keys = {
        ArrowUp: DIRECTIONS.UP,
        w: DIRECTIONS.UP,
        W: DIRECTIONS.UP,
        ArrowDown: DIRECTIONS.DOWN,
        s: DIRECTIONS.DOWN,
        S: DIRECTIONS.DOWN,
        ArrowLeft: DIRECTIONS.LEFT,
        a: DIRECTIONS.LEFT,
        A: DIRECTIONS.LEFT,
        ArrowRight: DIRECTIONS.RIGHT,
        d: DIRECTIONS.RIGHT,
        D: DIRECTIONS.RIGHT,
      };

      if (keys[event.key]) {
        event.preventDefault();
        changeDirection(keys[event.key]);
        setRunning(true);
      }

      if (event.key === " " && gameOver) {
        resetGame();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [changeDirection, gameOver, resetGame]);

  useEffect(() => {
    if (!running || gameOver) return;

    const speed = Math.max(65, 150 - Math.floor(score / 50) * 8);

    const timer = setInterval(() => {
      setSnake((currentSnake) => {
        const head = currentSnake[0];
        const dir = directionRef.current;

        const newHead = {
          x: head.x + dir.x,
          y: head.y + dir.y,
        };

        const hitWall =
          newHead.x < 0 ||
          newHead.x >= SIZE ||
          newHead.y < 0 ||
          newHead.y >= SIZE;

        const eating = newHead.x === food.x && newHead.y === food.y;
        const bodyToCheck = eating
          ? currentSnake
          : currentSnake.slice(0, -1);

        const hitBody = bodyToCheck.some(
          (part) => part.x === newHead.x && part.y === newHead.y
        );

        if (hitWall || hitBody) {
          setRunning(false);
          setGameOver(true);
          setBest((oldBest) => {
            const newBest = Math.max(oldBest, score);
            localStorage.setItem("snake-best", String(newBest));
            return newBest;
          });
          return currentSnake;
        }

        const newSnake = [newHead, ...currentSnake];

        if (eating) {
          const newScore = score + 10;
          setScore(newScore);
          setFood(randomFood(newSnake));
        } else {
          newSnake.pop();
        }

        return newSnake;
      });

      setDirection(directionRef.current);
    }, speed);

    return () => clearInterval(timer);
  }, [running, gameOver, food, score]);

  const startGame = () => {
    if (gameOver) {
      resetGame();
      return;
    }
    setRunning(true);
  };

  const isSnake = (x, y) =>
    snake.some((part) => part.x === x && part.y === y);

  const isHead = (x, y) =>
    snake[0]?.x === x && snake[0]?.y === y;

  return (
    <div className="page">
      <div className="game-card">
        <header className="header">
          <div>
            <p className="eyebrow">ARCADE</p>
            <h1>Snake Game</h1>
          </div>

          <button className="restart" onClick={resetGame}>
            ↻ Restart
          </button>
        </header>

        <div className="stats">
          <div className="stat">
            <span>Score</span>
            <strong>{score}</strong>
          </div>

          <div className="stat">
            <span>Best</span>
            <strong>{best}</strong>
          </div>

          <div className="stat">
            <span>Status</span>
            <strong>{gameOver ? "Game Over" : running ? "Playing" : "Ready"}</strong>
          </div>
        </div>

        <div className="board-wrap">
          <div
            className="board"
            style={{
              gridTemplateColumns: `repeat(${SIZE}, 1fr)`,
              gridTemplateRows: `repeat(${SIZE}, 1fr)`,
            }}
          >
            {Array.from({ length: SIZE * SIZE }, (_, index) => {
              const x = index % SIZE;
              const y = Math.floor(index / SIZE);
              const snakeCell = isSnake(x, y);
              const headCell = isHead(x, y);
              const foodCell = food.x === x && food.y === y;

              return (
                <div
                  key={`${x}-${y}`}
                  className={[
                    "cell",
                    snakeCell ? "snake" : "",
                    headCell ? "head" : "",
                    foodCell ? "food" : "",
                  ].join(" ")}
                >
                  {headCell && <span />}
                  {foodCell && <span />}
                </div>
              );
            })}

            {!running && (
              <div className="overlay">
                <div className="overlay-box">
                  <div className="overlay-icon">
                    {gameOver ? "☠" : "🐍"}
                  </div>

                  <h2>{gameOver ? "Game Over" : "Ready?"}</h2>

                  <p>
                    {gameOver
                      ? `Your score: ${score}`
                      : "Use Arrow Keys or WASD to move"}
                  </p>

                  <button className="start-btn" onClick={startGame}>
                    {gameOver ? "Play Again" : "Start Game"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="controls">
          <button onClick={() => changeDirection(DIRECTIONS.UP)}>↑</button>
          <div>
            <button onClick={() => changeDirection(DIRECTIONS.LEFT)}>←</button>
            <button onClick={() => changeDirection(DIRECTIONS.DOWN)}>↓</button>
            <button onClick={() => changeDirection(DIRECTIONS.RIGHT)}>→</button>
          </div>
        </div>

        <p className="hint">
          Arrow Keys / WASD • Eat the food • Don't hit the wall or yourself
        </p>
      </div>
    </div>
  );
}

export default App;
