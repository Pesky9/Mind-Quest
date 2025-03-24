"use client";

import { useEffect, useState } from "react";
import "./Homepage.css";
import Memory from "../assets/memory.webp";
import Tetris from "../assets/Tetris.jpeg";
import Twogame from "../assets/Twogame.webp";
import Sudoku from "../assets/Sudoku.webp";
import Minesweeper from "../assets/Minesweeper.jpeg";
import Quiz from "../assets/Quiz.webp";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";

const Homepage = () => {
  const navigate = useNavigate();
  const { username, setUsername } = useUser();
  const [inputUsername, setInputUsername] = useState(username);
  const [showUsernameModal, setShowUsernameModal] = useState(false);

  const phrases = [
    "Give this game a shot!",
    "Check out this game!",
    "You've got to play this!",
    "Take this game for a spin!",
    "Don't miss this game!",
    "This game is a must-play!",
    "Experience the thrill of this game!",
    "You won't believe how fun this game is!",
    "Explore this game today!",
    "Discover what this game has to offer!",
    "Engage with this exciting game!",
    "See what makes this game special!",
  ];

  const [randomPhrase, setRandomPhrase] = useState("");

  useEffect(() => {
    setRandomPhrase(phrases[Math.floor(Math.random() * phrases.length)]);
  }, []);

  const handleUsernameSubmit = (e) => {
    e.preventDefault();
    setUsername(inputUsername.trim());
    setShowUsernameModal(false);
  };

  return (
    <>
      <div className="Main_Section">
        <div className="Heading">
          <div className="user-section">
            <h1>Hello, {username ? username : "Player"}!</h1>
            <button
              className="username-btn"
              onClick={() => setShowUsernameModal(true)}
            >
              {username ? "Change Username" : "Set Username"}
            </button>
          </div>
          <h2>Good Afternoon</h2>
          <div className="Game_Section">
            <div
              className="Try_This"
              style={{ backgroundImage: `url(${Memory})` }}
              onClick={() => {
                navigate("/memory");
              }}
            >
              <h3>Memory</h3>
              <div className="game-overlay">
                <button
                  className="leaderboard-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate("/memory?showLeaderboard=true");
                  }}
                >
                  Leaderboard
                </button>
              </div>
            </div>
            <div
              className="Try_This"
              style={{ backgroundImage: `url(${Tetris})` }}
              onClick={() => {
                navigate("/tetris");
              }}
            >
              <h3>Tetris</h3>
              <div className="game-overlay">
                <button
                  className="leaderboard-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate("/tetris?showLeaderboard=true");
                  }}
                >
                  Leaderboard
                </button>
              </div>
            </div>
            <div
              className="Try_This"
              style={{ backgroundImage: `url(${Twogame})` }}
              onClick={() => {
                navigate("/twogame");
              }}
            >
              <h3>2048</h3>
              <div className="game-overlay">
                <button
                  className="leaderboard-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate("/twogame?showLeaderboard=true");
                  }}
                >
                  Leaderboard
                </button>
              </div>
            </div>
            <div
              className="Try_This"
              style={{ backgroundImage: `url(${Sudoku})` }}
              onClick={() => {
                navigate("/sudoku");
              }}
            >
              <h3>Sudoku</h3>
              <div className="game-overlay">
                <button
                  className="leaderboard-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate("/sudoku?showLeaderboard=true");
                  }}
                >
                  Leaderboard
                </button>
              </div>
            </div>
            <div
              className="Try_This"
              style={{ backgroundImage: `url(${Minesweeper})` }}
              onClick={() => {
                navigate("/minesweeper");
              }}
            >
              <h3>Minesweeper</h3>
              <div className="game-overlay">
                <button
                  className="leaderboard-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate("/minesweeper?showLeaderboard=true");
                  }}
                >
                  Leaderboard
                </button>
              </div>
            </div>
            <div
              className="Try_This"
              style={{ backgroundImage: `url(${Quiz})` }}
              onClick={() => {
                navigate("/quiz");
              }}
            >
              <h3>Quiz Time</h3>
              <div className="game-overlay">
                <button
                  className="leaderboard-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate("/quiz?showLeaderboard=true");
                  }}
                >
                  Leaderboard
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {showUsernameModal && (
        <div className="username-modal-overlay">
          <div className="username-modal">
            <h2>Set Your Username</h2>
            <p>Enter a username to track your scores on the leaderboards</p>
            <form onSubmit={handleUsernameSubmit}>
              <input
                type="text"
                value={inputUsername}
                onChange={(e) => setInputUsername(e.target.value)}
                placeholder="Enter username"
                maxLength={15}
              />
              <div className="modal-buttons">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setShowUsernameModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="save-btn"
                  disabled={!inputUsername.trim()}
                >
                  Save
                </button>
              </div>
            </form>
            <p className="anonymous-note">
              Note: You can still play games without setting a username, but
              your scores will be saved as "Anonymous"
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default Homepage;
