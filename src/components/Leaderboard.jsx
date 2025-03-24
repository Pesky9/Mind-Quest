"use client";

import { useState, useEffect } from "react";
import { leaderboardService } from "../services/leaderboardService";
import "./Leaderboard.css";

const Leaderboard = ({ game, onClose }) => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const data = await leaderboardService.getDetailedLeaderboard(game);
        setLeaderboard(data);
        setLoading(false);
      } catch (err) {
        setError("Failed to load leaderboard");
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [game]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const getSpecialColumnHeader = () => {
    switch (game) {
      case "Twogame":
        return "Highest Tile";
      case "Sudoku":
      case "Minesweeper":
        return "Board Size";
      case "Quiz":
        return "Questions";
      default:
        return null;
    }
  };

  const getSpecialValue = (entry) => {
    switch (game) {
      case "Twogame":
        return entry.highestTile;
      case "Sudoku":
      case "Minesweeper":
        return `${entry.boardSize}x${entry.boardSize}`;
      case "Quiz":
        return `${entry.score}/${entry.totalQuestions}`;
      default:
        return null;
    }
  };

  const specialColumn = getSpecialColumnHeader();

  return (
    <div className="leaderboard-overlay">
      <div className="leaderboard-container">
        <button className="close-btn" onClick={onClose}>
          ×
        </button>
        <h2 className="leaderboard-title">{game} Leaderboard</h2>

        {loading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
          </div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : (
          <>
            {leaderboard.length === 0 ? (
              <p className="no-scores">No scores yet. Be the first to play!</p>
            ) : (
              <div className="leaderboard-table">
                <div className="leaderboard-header">
                  <div className="rank">Rank</div>
                  <div className="player">Player</div>
                  <div className="score">Score</div>
                  <div className="time">Time</div>
                  {specialColumn && (
                    <div className="special">{specialColumn}</div>
                  )}
                </div>
                {leaderboard.map((entry, index) => (
                  <div
                    key={index}
                    className={`leaderboard-row ${
                      index < 3 ? "top-three" : ""
                    }`}
                  >
                    <div className="rank">{index + 1}</div>
                    <div className="player">
                      {entry.username || "Anonymous"}
                    </div>
                    <div className="score">{entry.score}</div>
                    <div className="time">{formatTime(entry.time)}</div>
                    {specialColumn && (
                      <div className="special">{getSpecialValue(entry)}</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
