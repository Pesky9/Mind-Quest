"use client";

import { useState, useEffect } from "react";
import "./Minesweeper.css";
import { useNavigate, useLocation } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { leaderboardService } from "../services/leaderboardService";
import Leaderboard from "../components/Leaderboard";

function Minesweeper() {
  const navigate = useNavigate();
  const location = useLocation();
  const { username } = useUser();

  const [boardSize, setBoardSize] = useState(window.innerWidth < 600 ? 4 : 8);
  const [board, setBoard] = useState(generateBoard(boardSize));
  const [result, setResult] = useState("");
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [scoreSubmitted, setScoreSubmitted] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("showLeaderboard") === "true") {
      setShowLeaderboard(true);
      navigate("/minesweeper", { replace: true });
    }
  }, [location, navigate]);

  useEffect(() => {
    const handleResize = () => {
      const newSize = window.innerWidth < 600 ? 4 : 8;
      setBoardSize(newSize);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    setBoard(generateBoard(boardSize));
    setResult("");
    setTimeElapsed(0);
    setScoreSubmitted(false);
  }, [boardSize]);

  useEffect(() => {
    if (result) {
      if (result === "You Win! 🎉" && !scoreSubmitted) {
        const baseScore = boardSize * boardSize * 100;
        const timeDeduction = timeElapsed * 10;
        const finalScore = Math.max(0, baseScore - timeDeduction);

        const leaderboardData = {
          game: "Minesweeper",
          username: username || "Anonymous",
          score: finalScore,
          time: timeElapsed,
          boardSize: boardSize,
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
      return;
    }

    const timer = setInterval(() => {
      setTimeElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [result, timeElapsed, boardSize, username, scoreSubmitted]);

  function generateBoard(size) {
    const totalCells = size * size;
    const mineCount = Math.floor(totalCells * 0.2);
    const mines = Array(totalCells).fill(false);
    let placed = 0;
    while (placed < mineCount) {
      const index = Math.floor(Math.random() * totalCells);
      if (!mines[index]) {
        mines[index] = true;
        placed++;
      }
    }
    const newBoard = [];
    for (let i = 0; i < size; i++) {
      const row = [];
      for (let j = 0; j < size; j++) {
        const index = i * size + j;
        row.push({
          hasMine: mines[index],
          revealed: false,
          flagged: false,
          adjacentMines: 0,
        });
      }
      newBoard.push(row);
    }
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        if (!newBoard[i][j].hasMine) {
          let count = 0;
          for (let x = -1; x <= 1; x++) {
            for (let y = -1; y <= 1; y++) {
              if (x === 0 && y === 0) continue;
              const ni = i + x;
              const nj = j + y;
              if (ni >= 0 && ni < size && nj >= 0 && nj < size) {
                if (newBoard[ni][nj].hasMine) count++;
              }
            }
          }
          newBoard[i][j].adjacentMines = count;
        }
      }
    }
    return newBoard;
  }

  const handleCellClick = (rowIndex, colIndex) => {
    if (result) return;
    setBoard((prevBoard) => {
      const newBoard = prevBoard.map((row) => row.map((cell) => ({ ...cell })));
      const cell = newBoard[rowIndex][colIndex];
      if (cell.revealed || cell.flagged) return prevBoard;
      if (cell.hasMine) {
        newBoard.forEach((row) =>
          row.forEach((cell) => {
            if (cell.hasMine) cell.revealed = true;
          })
        );
        setResult("Game Over! 💥");
        return newBoard;
      } else {
        const revealRecursively = (i, j) => {
          if (i < 0 || i >= boardSize || j < 0 || j >= boardSize) return;
          const currentCell = newBoard[i][j];
          if (currentCell.revealed || currentCell.flagged) return;
          newBoard[i][j].revealed = true;
          if (currentCell.adjacentMines === 0) {
            for (let x = -1; x <= 1; x++) {
              for (let y = -1; y <= 1; y++) {
                if (x === 0 && y === 0) continue;
                revealRecursively(i + x, j + y);
              }
            }
          }
        };
        revealRecursively(rowIndex, colIndex);
      }
      let win = true;
      for (let i = 0; i < boardSize; i++) {
        for (let j = 0; j < boardSize; j++) {
          if (!newBoard[i][j].hasMine && !newBoard[i][j].revealed) {
            win = false;
            break;
          }
        }
        if (!win) break;
      }
      if (win) setResult("You Win! 🎉");
      return newBoard;
    });
  };

  const handleRightClick = (e, rowIndex, colIndex) => {
    e.preventDefault();
    if (result) return;
    setBoard((prevBoard) => {
      const newBoard = prevBoard.map((row) => row.map((cell) => ({ ...cell })));
      const cell = newBoard[rowIndex][colIndex];
      if (cell.revealed) return prevBoard;
      newBoard[rowIndex][colIndex].flagged = !cell.flagged;
      return newBoard;
    });
  };

  const resetGame = () => {
    setBoard(generateBoard(boardSize));
    setResult("");
    setTimeElapsed(0);
    setScoreSubmitted(false);
  };

  const formatTime = (seconds) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    const paddedMin = min < 10 ? `0${min}` : min;
    const paddedSec = sec < 10 ? `0${sec}` : sec;
    return `${paddedMin}:${paddedSec}`;
  };

  return (
    <div className="game2048-container">
      <img
        className="Back_button"
        src="https://cdn-icons-png.freepik.com/256/10117/10117449.png?ga=GA1.1.319443277.1739009519&semt=ais_hybrid"
        alt="Back"
        onClick={() => navigate("/home")}
      />
      <div className="app">
        <div className="game-header">
          <h2>
            Minesweeper ({boardSize}x{boardSize})
          </h2>
          <button
            className="leaderboard-toggle-btn"
            onClick={() => setShowLeaderboard(true)}
          >
            View Leaderboard
          </button>
        </div>
        <div className="timer">Time: {formatTime(timeElapsed)}</div>
        <div className="sudoku-grid">
          {board.map((row, rowIndex) =>
            row.map((cell, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={`sudoku-cell ${cell.revealed ? "revealed" : ""} ${
                  cell.flagged && !cell.revealed ? "flagged" : ""
                }`}
                onClick={() => handleCellClick(rowIndex, colIndex)}
                onContextMenu={(e) => handleRightClick(e, rowIndex, colIndex)}
              >
                {cell.revealed
                  ? cell.hasMine
                    ? "💣"
                    : cell.adjacentMines > 0
                    ? cell.adjacentMines
                    : ""
                  : cell.flagged
                  ? "🚩"
                  : ""}
              </div>
            ))
          )}
        </div>
        <button onClick={resetGame}>New Game</button>
        <p className="result">{result}</p>

        {result === "You Win! 🎉" && (
          <div className="success-message">
            <p>
              Great job! You completed the game in {formatTime(timeElapsed)}.
            </p>
            <button onClick={resetGame}>Play Again</button>
          </div>
        )}
      </div>

      {showLeaderboard && (
        <Leaderboard
          game="Minesweeper"
          onClose={() => setShowLeaderboard(false)}
        />
      )}
    </div>
  );
}

export default Minesweeper;
