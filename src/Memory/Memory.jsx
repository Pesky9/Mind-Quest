import React, { useState, useEffect } from "react";
import "./Memory.css"; 

const cardsArray = [
  { name: "shell", img: "/assets/blueshell.png" },
  { name: "star", img: "/assets/star.png" },
  { name: "bobomb", img: "/assets/bobomb.png" },
  { name: "mario", img: "/assets/mario.png" },
  { name: "luigi", img: "/assets/luigi.png" },
  { name: "peach", img: "/assets/peach.png" },
  { name: "1up", img: "/assets/1up.png" },
  { name: "mushroom", img: "/assets/mushroom.png" },
  { name: "thwomp", img: "/assets/thwomp.png" },
  { name: "bulletbill", img: "/assets/bulletbill.png" },
  { name: "coin", img: "/assets/coin.png" },
  { name: "goomba", img: "/assets/goomba.png" },
];

const MemoryGame = () => {
  const [gameGrid, setGameGrid] = useState([]);
  const [firstGuess, setFirstGuess] = useState(null);
  const [secondGuess, setSecondGuess] = useState(null);
  const [matchedCards, setMatchedCards] = useState([]);
  const [isClickable, setIsClickable] = useState(true);

  useEffect(() => {
    const shuffledGrid = [...cardsArray, ...cardsArray].sort(() => 0.5 - Math.random());
    setGameGrid(shuffledGrid);
  }, []);

  useEffect(() => {
    if (firstGuess && secondGuess) {
      setIsClickable(false);
      if (firstGuess.name === secondGuess.name) {
        setMatchedCards([...matchedCards, firstGuess.name]);
        setTimeout(() => resetGuesses(), 1000);
      } else {
        setTimeout(() => resetGuesses(), 1000);
      }
    }
  }, [firstGuess, secondGuess]);

  const handleCardClick = (index) => {
    if (!isClickable || matchedCards.includes(gameGrid[index].name)) return;
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

  return (
    <div className="game-container">
      <div className="grid">
        {gameGrid.map((card, index) => (
          <div
            key={index}
            className={`card ${
              matchedCards.includes(card.name) || firstGuess?.index === index || secondGuess?.index === index
                ? "selected"
                : ""
            }`}
            onClick={() => handleCardClick(index)}
          >
            <div className="front"></div>
            <div className="back" style={{ backgroundImage: `url(${card.img})` }}></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MemoryGame;
