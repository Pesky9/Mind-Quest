import React, { useState, useEffect, useRef } from "react";
import "./Twogame.css";
import { useNavigate, useLocation } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { leaderboardService } from "../services/leaderboardService";
import Leaderboard from "../components/Leaderboard";

const createEmptyGrid = (size) =>
  Array.from({ length: size }, () =>
    Array.from({ length: size }, () => ({ value: 0, merged: false }))
  );

const addRandomTile = (grid) => {
  const emptyCells = [];
  grid.forEach((row, i) => {
    row.forEach((tile, j) => {
      if (tile.value === 0) emptyCells.push({ i, j });
    });
  });
  if (emptyCells.length === 0) return grid;
  const { i, j } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
  grid[i][j] = { value: Math.random() < 0.9 ? 2 : 4, merged: false };
  return grid;
};

const getInitialGrid = (size) => {
  let grid = createEmptyGrid(size);
  grid = addRandomTile(grid);
  grid = addRandomTile(grid);
  return grid;
};

const cloneGrid = (grid) => grid.map((row) => row.map((tile) => ({ ...tile })));

const gridsEqual = (g1, g2) => {
  for (let i = 0; i < g1.length; i++) {
    for (let j = 0; j < g1[i].length; j++) {
      if (g1[i][j].value !== g2[i][j].value) return false;
    }
  }
  return true;
};

const slideRowLeft = (row) => {
  let nonZero = row
    .filter((tile) => tile.value !== 0)
    .map((tile) => ({ ...tile }));
  for (let i = 0; i < nonZero.length - 1; i++) {
    if (nonZero[i].value === nonZero[i + 1].value) {
      nonZero[i].value *= 2;
      nonZero[i].merged = true;
      nonZero[i + 1].value = 0;
      i++;
    }
  }
  nonZero = nonZero.filter((tile) => tile.value !== 0);
  while (nonZero.length < row.length) {
    nonZero.push({ value: 0, merged: false });
  }
  return nonZero;
};

const moveLeft = (grid) => grid.map((row) => slideRowLeft(row));

const moveRight = (grid) => {
  const reversed = grid.map((row) => row.slice().reverse());
  const moved = reversed.map((row) => slideRowLeft(row));
  return moved.map((row) => row.reverse());
};

const transpose = (grid) => {
  const size = grid.length;
  const newGrid = createEmptyGrid(size);
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      newGrid[i][j] = { ...grid[j][i] };
    }
  }
  return newGrid;
};

const moveUp = (grid) => {
  const transposed = transpose(grid);
  const moved = moveLeft(transposed);
  return transpose(moved);
};

const moveDown = (grid) => {
  const transposed = transpose(grid);
  const moved = moveRight(transposed);
  return transpose(moved);
};

const isGameOver = (grid) => {
  const size = grid.length;
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      if (grid[i][j].value === 0) return false;
      if (i < size - 1 && grid[i][j].value === grid[i + 1][j].value)
        return false;
      if (j < size - 1 && grid[i][j].value === grid[i][j + 1].value)
        return false;
    }
  }
  return true;
};

const getHighestTile = (grid) => {
  let highest = 0;
  grid.forEach((row) => {
    row.forEach((tile) => {
      if (tile.value > highest) {
        highest = tile.value;
      }
    });
  });
  return highest;
};

const calculateScore = (grid) => {
  let score = 0;
  grid.forEach((row) => {
    row.forEach((tile) => {
      score += tile.value;
    });
  });
  return score;
};

const Twogame = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { username } = useUser();

  const [gridSize, setGridSize] = useState(4);
  const [grid, setGrid] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [gameTime, setGameTime] = useState(0);
  const touchStartRef = useRef(null);
  const boardRef = useRef(null);

  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [scoreSubmitted, setScoreSubmitted] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("showLeaderboard") === "true") {
      setShowLeaderboard(true);
      navigate("/twogame", { replace: true });
    }
  }, [location, navigate]);

  useEffect(() => {
    const updateGridSize = () => {
      window.innerWidth > 600 ? setGridSize(5) : setGridSize(4);
    };
    updateGridSize();
    window.addEventListener("resize", updateGridSize);
    return () => window.removeEventListener("resize", updateGridSize);
  }, []);

  useEffect(() => {
    resetGame();
  }, [gridSize]);

  useEffect(() => {
    if (!startTime) {
      setStartTime(Date.now());
    }
  }, [startTime]);

  // Update game time
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
    const board = boardRef.current;
    const preventDefault = (e) => e.preventDefault();
    board.addEventListener("touchmove", preventDefault, { passive: false });

    return () => {
      board.removeEventListener("touchmove", preventDefault);
    };
  }, []);

  useEffect(() => {
    if (gameOver && !scoreSubmitted) {
      const finalScore = calculateScore(grid);
      const highestTile = getHighestTile(grid);

      const leaderboardData = {
        game: "Twogame",
        username: username || "Anonymous",
        score: finalScore,
        time: gameTime,
        highestTile: highestTile,
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
  }, [gameOver, grid, gameTime, username, scoreSubmitted]);

  const resetGame = () => {
    setGrid(getInitialGrid(gridSize));
    setGameOver(false);
    setScore(0);
    setStartTime(Date.now());
    setGameTime(0);
    setScoreSubmitted(false);
  };

  const handleMove = (direction) => {
    if (gameOver) return;
    let newGrid;
    const currentGrid = cloneGrid(grid);
    if (direction === "left") newGrid = moveLeft(currentGrid);
    else if (direction === "right") newGrid = moveRight(currentGrid);
    else if (direction === "up") newGrid = moveUp(currentGrid);
    else if (direction === "down") newGrid = moveDown(currentGrid);
    if (!gridsEqual(grid, newGrid)) {
      newGrid = addRandomTile(newGrid);
      setGrid(newGrid);

      const newScore = calculateScore(newGrid);
      setScore(newScore);

      if (isGameOver(newGrid)) setGameOver(true);
    }
  };

  const handleKeyDown = (e) => {
    switch (e.key) {
      case "ArrowLeft":
        handleMove("left");
        break;
      case "ArrowRight":
        handleMove("right");
        break;
      case "ArrowUp":
        handleMove("up");
        break;
      case "ArrowDown":
        handleMove("down");
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

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
    if (Math.abs(dx) < 10 && Math.abs(dy) < 10 && dt < 300) return;
    Math.abs(dx) > Math.abs(dy)
      ? dx > 0
        ? handleMove("right")
        : handleMove("left")
      : dy > 0
      ? handleMove("down")
      : handleMove("up");
    touchStartRef.current = null;
  };

  useEffect(() => {
    let shouldClear = false;
    const newGrid = cloneGrid(grid);
    for (let i = 0; i < newGrid.length; i++) {
      for (let j = 0; j < newGrid[i].length; j++) {
        if (newGrid[i][j].merged) {
          newGrid[i][j].merged = false;
          shouldClear = true;
        }
      }
    }
    if (shouldClear) {
      const timeout = setTimeout(() => {
        setGrid(newGrid);
      }, 300);
      return () => clearTimeout(timeout);
    }
  }, [grid]);

  return (
    <div className="game2048-container">
      <img
        className="Back_button"
        src="https://cdn-icons-png.freepik.com/256/10117/10117449.png?ga=GA1.1.319443277.1739009519&semt=ais_hybrid"
        alt="Back"
        onClick={() => {
          navigate("/home");
        }}
      />
      <div className="game-header">
        <h1>2048</h1>
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
        <div className="game2048-gameover">
          <p>Game Over</p>
          <p>Final Score: {score}</p>
          <p>Highest Tile: {getHighestTile(grid)}</p>
          <button onClick={resetGame}>Retry</button>
        </div>
      )}
      <div
        ref={boardRef}
        className="game2048-board"
        style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {grid.flat().map((tile, index) => (
          <div
            key={index}
            className={`game2048-cell game2048-cell-${tile.value}`}
          >
            {tile.value !== 0 && (
              <div
                className={`game2048-cell-content ${
                  tile.merged ? "merged" : ""
                }`}
              >
                {tile.value}
              </div>
            )}
          </div>
        ))}
      </div>
      <p>Use arrow keys or swipe to move the tiles.</p>

      {showLeaderboard && (
        <Leaderboard game="2048" onClose={() => setShowLeaderboard(false)} />
      )}
    </div>
  );
};

export default Twogame;
