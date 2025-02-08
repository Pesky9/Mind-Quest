import React, { useEffect, useState } from "react";
import "./Homepage.css";
import Memory from "../assets/memory.webp";
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

  const backgroundImages = [
    `url(${Memory})`,
    `url(${Memory})`,
    `url(${Memory})`,
    `url(${Memory})`,
    `url(${Memory})`,
    `url(${Memory})`,
  ];

  const [randomPhrase, setRandomPhrase] = useState("");
  const [randomBackground, setRandomBackground] = useState("");

  useEffect(() => {
    setRandomPhrase(phrases[Math.floor(Math.random() * phrases.length)]);
    setRandomBackground(
      backgroundImages[Math.floor(Math.random() * backgroundImages.length)]
    );
  }, []);

  return (
    <div className="Main_Section">
      <div className="Heading">
        <h1>Hello, Player!</h1>
        <h2>Good Evening</h2>
        <div
          className="Try_This"
          style={{ backgroundImage: randomBackground }}
          onClick={() => {
            navigate("/memory");
          }}
        >
          <h3>{randomPhrase}</h3>
        </div>
      </div>
    </div>
  );
};

export default Homepage;
