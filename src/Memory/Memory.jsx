import React, { useState, useEffect } from "react";
import "./Memory.css";
import BlueShell from "../assets/blueshell.png";
import Star from "../assets/star.png";
import BoBomb from "../assets/bobomb.png";
import Mushroom from "../assets/mushroom.png";
import Mario from "../assets/mario.png";
import Luigi from "../assets/luigi.png";
import Peach from "../assets/peach.png";
import Iup from "../assets/1up.png";
import Thwomp from "../assets/thwomp.png";
import Blulletbill from "../assets/bulletbill.png";
import Coin from "../assets/coin.png";
import Goomba from "../assets/goomba.png";
import Question from "../assets/question.gif";
import { useNavigate, useLocation } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { leaderboardService } from "../services/leaderboardService";
import Leaderboard from "../components/Leaderboard";

const cardsArray = [
  { name: "shell", img: BlueShell },
  { name: "star", img: Star },
  { name: "bobomb", img: BoBomb },
  { name: "mario", img: Mario },
  { name: "luigi", img: Luigi },
  { name: "peach", img: Peach },
  { name: "1up", img: Iup },
  { name: "mushroom", img: Mushroom },
  { name: "thwomp", img: Thwomp },
  { name: "bulletbill", img: Blulletbill },
  { name: "coin", img: Coin },
  { name: "goomba", img: Goomba },
];

const MemoryGame = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { username } = useUser();

  const [gameGrid, setGameGrid] = useState([]);
  const [firstGuess, setFirstGuess] = useState(null);
  const [secondGuess, setSecondGuess] = useState(null);
  const [matchedCards, setMatchedCards] = useState([]);
  const [isClickable, setIsClickable] = useState(true);

  const [timer, setTimer] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [scoreSubmitted, setScoreSubmitted] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("showLeaderboard") === "true") {
      setShowLeaderboard(true);
      navigate("/memory", { replace: true });
    }
  }, [location, navigate]);

  useEffect(() => {
    let selectedCards = cardsArray;
    if (window.innerWidth < 768) {
      selectedCards = cardsArray.slice(0, 6);
    }
    let shuffledGrid = [...selectedCards, ...selectedCards];

    for (let i = 0; i < 5; i++) {
      shuffledGrid = shuffledGrid.sort(() => 0.5 - Math.random());
    }

    if (Math.random() > 0.5) {
      const half = shuffledGrid.length / 2;
      shuffledGrid = [
        ...shuffledGrid.slice(half).reverse(),
        ...shuffledGrid.slice(0, half),
      ];
    }
    setGameGrid(shuffledGrid);
  }, []);

  useEffect(() => {
    let interval = null;
    if (isTimerActive) {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    } else if (!isTimerActive && timer !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isTimerActive, timer]);

  useEffect(() => {
    if (firstGuess && secondGuess) {
      setIsClickable(false);
      if (firstGuess.name === secondGuess.name) {
        setTimeout(() => {
          setMatchedCards((prev) => [...prev, firstGuess.name]);
          resetGuesses();
        }, 1000);
      } else {
        setTimeout(() => resetGuesses(), 1000);
      }
    }
  }, [firstGuess, secondGuess]);

  useEffect(() => {
    const expectedPairs = window.innerWidth < 768 ? 6 : cardsArray.length;
    if (matchedCards.length === expectedPairs) {
      setIsTimerActive(false);
      setGameOver(true);

      const score = Math.max(0, 10000 - (timer * 10 + clickCount * 5));

      if (!scoreSubmitted) {
        const leaderboardData = {
          game: "Memory",
          username: username || "Anonymous",
          score: score,
          time: timer,
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
    }
  }, [matchedCards, timer, clickCount, username, scoreSubmitted]);

  const handleCardClick = (index) => {
    if (!isClickable || matchedCards.includes(gameGrid[index].name) || gameOver)
      return;

    if (!isTimerActive) {
      setIsTimerActive(true);
    }
    setClickCount((prev) => prev + 1);

    if (!firstGuess) {
      setFirstGuess({ ...gameGrid[index], index });
    } else if (!secondGuess && index !== firstGuess.index) {
      setSecondGuess({ ...gameGrid[index], index });
    }
  };

  const resetGuesses = () => {
    setFirstGuess(null);
    setSecondGuess(null);
    setIsClickable(true);
  };

  const restartGame = () => {
    let selectedCards = cardsArray;
    if (window.innerWidth < 768) {
      selectedCards = cardsArray.slice(0, 6);
    }
    let shuffledGrid = [...selectedCards, ...selectedCards];

    for (let i = 0; i < 5; i++) {
      shuffledGrid = shuffledGrid.sort(() => 0.5 - Math.random());
    }

    setGameGrid(shuffledGrid);
    setFirstGuess(null);
    setSecondGuess(null);
    setMatchedCards([]);
    setIsClickable(true);
    setTimer(0);
    setIsTimerActive(false);
    setClickCount(0);
    setGameOver(false);
    setScoreSubmitted(false);
  };

  return (
    <div className="game-container">
      <img
        className="Back_button"
        src="https://cdn-icons-png.freepik.com/256/10117/10117449.png?ga=GA1.1.319443277.1739009519&semt=ais_hybrid"
        alt="Back"
        onClick={() => {
          navigate("/home");
        }}
      />
      <div className="memory-game">
        <div className="info">
          <div className="game-header">
            <h1>Memory Game</h1>
            <button
              className="leaderboard-toggle-btn"
              onClick={() => setShowLeaderboard(true)}
            >
              View Leaderboard
            </button>
          </div>
          {!gameOver && (
            <div className="stats">
              <span>
                Time:{" "}
                {timer >= 60
                  ? `${Math.floor(timer / 60)}m ${timer % 60}s`
                  : `${timer}s`}
              </span>
              <span>Clicks: {clickCount}</span>
            </div>
          )}
          {gameOver && (
            <div className="game-over">
              <p>
                Game Over! Total Time:{" "}
                {timer >= 60
                  ? `${Math.floor(timer / 60)}m ${timer % 60}s`
                  : `${timer}s`}
                , Total Clicks: {clickCount}
              </p>
              <button className="restart-btn" onClick={restartGame}>
                Play Again
              </button>
            </div>
          )}
        </div>
        <div className="grid">
          {gameGrid.map((card, index) => (
            <div
              key={index}
              className={`card ${
                matchedCards.includes(card.name) ? "vanish" : ""
              } ${
                firstGuess?.index === index || secondGuess?.index === index
                  ? "selected"
                  : ""
              }`}
              onClick={() => handleCardClick(index)}
            >
              <div
                className="front"
                style={{ backgroundImage: `url(${Question})` }}
              ></div>
              <div
                className="back"
                style={{ backgroundImage: `url(${card.img})` }}
              ></div>
            </div>
          ))}
        </div>
      </div>

      {showLeaderboard && (
        <Leaderboard game="Memory" onClose={() => setShowLeaderboard(false)} />
      )}
    </div>
  );
};

export default MemoryGame;
