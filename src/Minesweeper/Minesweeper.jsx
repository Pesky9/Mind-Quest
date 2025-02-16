import React, { useState, useEffect } from "react";
import "./Minesweeper.css";
import { useNavigate } from "react-router-dom";

function Minesweeper() {
  const navigate = useNavigate();
  const [boardSize, setBoardSize] = useState(window.innerWidth < 600 ? 4 : 8);
  const [board, setBoard] = useState(generateBoard(boardSize));
  const [result, setResult] = useState("");
  const [timeElapsed, setTimeElapsed] = useState(0);

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
  }, [boardSize]);

  useEffect(() => {
    if (result) return;
    const timer = setInterval(() => {
      setTimeElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [result]);

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
        <h2>
          Minesweeper ({boardSize}x{boardSize})
        </h2>
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
      </div>
    </div>
  );
}

export default Minesweeper;
