import React, { useEffect, useState } from "react";
import "./Homepage.css";
import Memory from "../assets/memory.webp";
import Tetris from "../assets/Tetris.jpeg";
import Twogame from "../assets/Twogame.webp";
import { useNavigate } from "react-router-dom";

const Homepage = () => {
  const navigate = useNavigate();
  const phrases = [
    "Give this game a shot!",
    "Check out this game!",
    "You’ve got to play this!",
    "Take this game for a spin!",
    "Don’t miss this game!",
    "This game is a must-play!",
    "Experience the thrill of this game!",
    "You won’t believe how fun this game is!",
    "Explore this game today!",
    "Discover what this game has to offer!",
    "Engage with this exciting game!",
    "See what makes this game special!",
  ];

  const [randomPhrase, setRandomPhrase] = useState("");

  useEffect(() => {
    setRandomPhrase(phrases[Math.floor(Math.random() * phrases.length)]);
  }, []);

  return (
    <div className="Main_Section">
      <div className="Heading">
        <h1>Hello, Player!</h1>
        <h2>Good Evening</h2>
        <div className="Game_Section">
          <div
            className="Try_This"
            style={{ backgroundImage: `url(${Memory})` }}
            onClick={() => {
              navigate("/memory");
            }}
          >
            <h3>Memory</h3>
          </div>
          <div
            className="Try_This"
            style={{ backgroundImage: `url(${Tetris})` }}
            onClick={() => {
              navigate("/tetris");
            }}
          >
            <h3>Tetris</h3>
          </div>
          <div
            className="Try_This"
            style={{ backgroundImage: `url(${Twogame})` }}
            onClick={() => {
              navigate("/twogame");
            }}
          >
            <h3>2048</h3>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Homepage;
