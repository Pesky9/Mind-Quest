"use client";

import { useState, useEffect, useMemo } from "react";
import "./Sudoku.css";
import { useNavigate, useLocation } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { leaderboardService } from "../services/leaderboardService";
import Leaderboard from "../components/Leaderboard";

function Sudoku() {
  const navigate = useNavigate();
  const location = useLocation();
  const { username } = useUser();

  const [boardSize, setBoardSize] = useState(window.innerWidth < 600 ? 4 : 8);
  const solution = useMemo(() => {
    const sol = [];
    for (let i = 0; i < boardSize; i++) {
      const row = [];
      for (let j = 0; j < boardSize; j++) {
        row.push(((i + j) % boardSize) + 1);
      }
      sol.push(row);
    }
    return sol;
  }, [boardSize]);

  const generateBoard = () => {
    const newBoard = [];
    for (let i = 0; i < boardSize; i++) {
      const row = [];
      for (let j = 0; j < boardSize; j++) {
        if (Math.random() > 0.5) {
          row.push({ value: solution[i][j], disabled: true });
        } else {
          row.push({ value: "", disabled: false });
        }
      }
      newBoard.push(row);
    }
    return newBoard;
  };

  const [board, setBoard] = useState(generateBoard());
  const [result, setResult] = useState("");
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [scoreSubmitted, setScoreSubmitted] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("showLeaderboard") === "true") {
      setShowLeaderboard(true);
      navigate("/sudoku", { replace: true });
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
    setBoard(generateBoard());
    setResult("");
    setTimeElapsed(0);
    setScoreSubmitted(false);
  }, [boardSize]);

  useEffect(() => {
    if (result === "Correct! 🎉") {
      if (!scoreSubmitted) {
        const baseScore = boardSize * 1000;
        const timeDeduction = timeElapsed * 5;
        const finalScore = Math.max(0, baseScore - timeDeduction);

        const leaderboardData = {
          game: "Sudoku",
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

  const handleChange = (e, rowIndex, colIndex) => {
    const newValue = e.target.value;
    setBoard((prevBoard) => {
      const newBoard = prevBoard.map((row) => row.slice());
      newBoard[rowIndex][colIndex] = {
        ...newBoard[rowIndex][colIndex],
        value: newValue,
      };
      return newBoard;
    });
  };

  const checkSudoku = () => {
    let isCorrect = true;
    for (let i = 0; i < boardSize; i++) {
      for (let j = 0; j < boardSize; j++) {
        if (!board[i][j].disabled) {
          if (Number.parseInt(board[i][j].value) !== solution[i][j]) {
            isCorrect = false;
          }
        }
      }
    }
    setResult(isCorrect ? "Correct! 🎉" : "Try Again! ❌");
  };

  const resetGame = () => {
    setBoard(generateBoard());
    setResult("");
    setTimeElapsed(0);
    setScoreSubmitted(false);
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
            Mini Sudoku ({boardSize}x{boardSize})
          </h2>
          <button
            className="leaderboard-toggle-btn"
            onClick={() => setShowLeaderboard(true)}
          >
            View Leaderboard
          </button>
        </div>
        <div className="timer">Time: {timeElapsed}s</div>
        <div className="sudoku-grid">
          {board.map((row, rowIndex) =>
            row.map((cell, colIndex) => (
              <input
                key={`${rowIndex}-${colIndex}`}
                type="number"
                min="1"
                max={boardSize}
                className="sudoku-cell"
                value={cell.value}
                disabled={cell.disabled}
                onChange={(e) => handleChange(e, rowIndex, colIndex)}
              />
            ))
          )}
        </div>
        <button onClick={checkSudoku}>Check Solution</button>
        <button onClick={resetGame}>New Game</button>
        <p className="result">{result}</p>

        {result === "Correct! 🎉" && (
          <div className="success-message">
            <p>Great job! You completed the puzzle in {timeElapsed} seconds.</p>
            <button onClick={resetGame}>Play Again</button>
          </div>
        )}
      </div>

      {showLeaderboard && (
        <Leaderboard game="Sudoku" onClose={() => setShowLeaderboard(false)} />
      )}
    </div>
  );
}

export default Sudoku;
