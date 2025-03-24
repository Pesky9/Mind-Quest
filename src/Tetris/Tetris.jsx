import React, { useState, useEffect, useRef } from "react";
import "./Tetris.css";
import { useNavigate, useLocation } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { leaderboardService } from "../services/leaderboardService";
import Leaderboard from "../components/Leaderboard";

const ROWS = 20;
const COLS = 10;

const createBoard = () => {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(0));
};

const TETROMINOES = {
  I: { shape: [[1, 1, 1, 1]], color: "cyan" },
  J: {
    shape: [
      [1, 0, 0],
      [1, 1, 1],
    ],
    color: "blue",
  },
  L: {
    shape: [
      [0, 0, 1],
      [1, 1, 1],
    ],
    color: "orange",
  },
  O: {
    shape: [
      [1, 1],
      [1, 1],
    ],
    color: "yellow",
  },
  S: {
    shape: [
      [0, 1, 1],
      [1, 1, 0],
    ],
    color: "green",
  },
  T: {
    shape: [
      [0, 1, 0],
      [1, 1, 1],
    ],
    color: "purple",
  },
  Z: {
    shape: [
      [1, 1, 0],
      [0, 1, 1],
    ],
    color: "red",
  },
};

const randomTetromino = () => {
  const tetrominoNames = Object.keys(TETROMINOES);
  const rand =
    tetrominoNames[Math.floor(Math.random() * tetrominoNames.length)];
  return TETROMINOES[rand];
};

const rotate = (matrix) => {
  return matrix[0].map((_, index) => matrix.map((row) => row[index]).reverse());
};

function useInterval(callback, delay) {
  const savedCallback = useRef();

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delay !== null) {
      const tick = () => {
        savedCallback.current();
      };
      const id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}

const Tetris = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { username } = useUser();

  const [board, setBoard] = useState(createBoard());
  const [currentTetromino, setCurrentTetromino] = useState(randomTetromino());
  const [currentShape, setCurrentShape] = useState(currentTetromino.shape);
  const [position, setPosition] = useState({
    x: Math.floor(COLS / 2) - Math.ceil(currentTetromino.shape[0].length / 2),
    y: 0,
  });
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [gameTime, setGameTime] = useState(0);
  const [dropInterval, setDropInterval] = useState(1000);
  const touchStartRef = useRef(null);
  const boardRef = useRef(null);

  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [scoreSubmitted, setScoreSubmitted] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("showLeaderboard") === "true") {
      setShowLeaderboard(true);
      navigate("/tetris", { replace: true });
    }
  }, [location, navigate]);

  useEffect(() => {
    if (!gameOver && !startTime) {
      setStartTime(Date.now());
    }
  }, [gameOver, startTime]);

  useEffect(() => {
    let interval;
    if (startTime && !gameOver) {
      interval = setInterval(() => {
        setGameTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [startTime, gameOver]);

  useEffect(() => {
    if (gameOver && score > 0 && !scoreSubmitted) {
      const leaderboardData = {
        game: "Tetris",
        username: username || "Anonymous",
        score: score,
        time: gameTime,
      };

      leaderboardService
        .submitScore(leaderboardData)
        .then(() => {
          setScoreSubmitted(true);
        })
        .catch((error) => {
          console.error("Error submitting score:", error);
        });
    }
  }, [gameOver, score, gameTime, username, scoreSubmitted]);

  const checkCollision = (pos, shape) => {
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x]) {
          const boardX = pos.x + x;
          const boardY = pos.y + y;
          if (boardX < 0 || boardX >= COLS || boardY >= ROWS) return true;
          if (boardY >= 0 && board[boardY][boardX]) return true;
        }
      }
    }
    return false;
  };

  const clearRows = (newBoard) => {
    const filteredRows = newBoard.filter((row) =>
      row.some((cell) => cell === 0)
    );
    const clearedRows = ROWS - filteredRows.length;
    const emptyRows = Array.from({ length: clearedRows }, () =>
      Array(COLS).fill(0)
    );

    if (clearedRows > 0) {
      const rowBonus = clearedRows > 1 ? Math.pow(2, clearedRows - 1) : 1;
      setScore((prevScore) => prevScore + clearedRows * 100 * rowBonus);

      setDropInterval(Math.max(100, 1000 - Math.floor(score / 1000) * 100));
    }

    return [...emptyRows, ...filteredRows];
  };

  const lockTetromino = (pos) => {
    const newBoard = board.map((row) => [...row]);
    let hitTop = false;
    currentShape.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell) {
          const boardY = pos.y + y;
          const boardX = pos.x + x;
          if (boardY < 0) {
            hitTop = true;
          } else {
            newBoard[boardY][boardX] = currentTetromino.color;
          }
        }
      });
    });
    if (hitTop) {
      setGameOver(true);
      return;
    }
    const clearedBoard = clearRows(newBoard);
    setBoard(clearedBoard);

    const newTetromino = randomTetromino();
    const startingPosition = {
      x: Math.floor(COLS / 2) - Math.ceil(newTetromino.shape[0].length / 2),
      y: 0,
    };

    if (checkCollision(startingPosition, newTetromino.shape)) {
      setGameOver(true);
      return;
    }

    setCurrentTetromino(newTetromino);
    setCurrentShape(newTetromino.shape);
    setPosition(startingPosition);
  };

  const drop = () => {
    if (gameOver) return;
    const newPos = { ...position, y: position.y + 1 };
    if (!checkCollision(newPos, currentShape)) {
      setPosition(newPos);
    } else {
      lockTetromino(position);
    }
  };

  const move = (dir) => {
    if (gameOver) return;
    const newPos = { ...position, x: position.x + dir };
    if (!checkCollision(newPos, currentShape)) {
      setPosition(newPos);
    }
  };

  const handleKeyDown = (e) => {
    if (gameOver) return;
    switch (e.key) {
      case "ArrowLeft":
        move(-1);
        break;
      case "ArrowRight":
        move(1);
        break;
      case "ArrowDown":
        drop();
        break;
      case "ArrowUp":
        const rotated = rotate(currentShape);
        if (!checkCollision(position, rotated)) {
          setCurrentShape(rotated);
        }
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    const board = boardRef.current;
    const preventDefault = (e) => e.preventDefault();
    board.addEventListener("touchmove", preventDefault, { passive: false });

    return () => {
      board.removeEventListener("touchmove", preventDefault);
    };
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  useInterval(
    () => {
      drop();
    },
    gameOver ? null : dropInterval
  );

  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    };
  };

  const handleTouchEnd = (e) => {
    if (!touchStartRef.current) return;
    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;
    const dt = Date.now() - touchStartRef.current.time;

    if (Math.abs(dx) < 10 && Math.abs(dy) < 10 && dt < 300) {
      const rotated = rotate(currentShape);
      if (!checkCollision(position, rotated)) {
        setCurrentShape(rotated);
      }
      return;
    }

    if (Math.abs(dx) > Math.abs(dy)) {
      if (dx > 0) {
        move(1);
      } else {
        move(-1);
      }
    } else {
      if (dy > 0) {
        drop();
      }
    }
    touchStartRef.current = null;
  };

  const renderBoard = () => {
    const displayBoard = board.map((row) => [...row]);
    currentShape.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell) {
          const boardY = position.y + y;
          const boardX = position.x + x;
          if (boardY >= 0 && boardY < ROWS && boardX >= 0 && boardX < COLS) {
            displayBoard[boardY][boardX] = currentTetromino.color;
          }
        }
      });
    });
    return displayBoard;
  };

  const flatBoard = renderBoard().reduce((acc, row) => acc.concat(row), []);

  const resetGame = () => {
    const newTetromino = randomTetromino();
    setBoard(createBoard());
    setCurrentTetromino(newTetromino);
    setCurrentShape(newTetromino.shape);
    setPosition({
      x: Math.floor(COLS / 2) - Math.ceil(newTetromino.shape[0].length / 2),
      y: 0,
    });
    setGameOver(false);
    setScore(0);
    setStartTime(Date.now());
    setGameTime(0);
    setDropInterval(1000);
    setScoreSubmitted(false);
  };

  return (
    <div className="tetris-container">
      <img
        className="Back_button"
        src="https://cdn-icons-png.freepik.com/256/10117/10117449.png?ga=GA1.1.319443277.1739009519&semt=ais_hybrid"
        alt="Back"
        onClick={() => {
          navigate("/home");
        }}
      />
      <div className="game-header">
        <h1>Tetris</h1>
        <button
          className="leaderboard-toggle-btn"
          onClick={() => setShowLeaderboard(true)}
        >
          View Leaderboard
        </button>
      </div>

      <div className="game-stats">
        <div className="stat-item">Score: {score}</div>
        <div className="stat-item">
          Time: {Math.floor(gameTime / 60)}:
          {(gameTime % 60).toString().padStart(2, "0")}
        </div>
      </div>

      {gameOver && (
        <div className="game-over">
          <p>Game Over</p>
          <p>Final Score: {score}</p>
          <button onClick={resetGame}>Retry</button>
        </div>
      )}
      <div
        ref={boardRef}
        className="board"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {flatBoard.map((cell, index) => (
          <div
            key={index}
            className="cell"
            style={{ backgroundColor: cell || "black" }}
          />
        ))}
      </div>
      <p>
        Controls: Use arrow keys or swipe/tap on mobile — swipe left/right to
        move, swipe down to drop, tap to rotate.
      </p>

      {showLeaderboard && (
        <Leaderboard game="Tetris" onClose={() => setShowLeaderboard(false)} />
      )}
    </div>
  );
};

export default Tetris;
