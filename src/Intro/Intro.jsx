import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import "./Intro.css";
import { useNavigate } from "react-router-dom";

const App = () => {
  const [slideOut, setSlideOut] = useState(false);
  const navigate = useNavigate();

  const handleStartQuest = () => {
    setTimeout(() => {
      navigate("/home");
    }, 800);
  };

  useEffect(() => {
    if (slideOut) {
      handleStartQuest();
    }
  }, [slideOut]);

  return (
    <div className={`container ${slideOut ? "slide-out" : ""}`}>
      <motion.h1
        className="hero-title"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        Mind Quest
      </motion.h1>
      <motion.p
        className="hero-description"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        Embark on a futuristic digital adventure. Test your intellect, solve
        puzzles, and challenge your mind in the ultimate gaming experience.
      </motion.p>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <button
          className="cta-button"
          onClick={() => {
            setSlideOut(true);
          }}
        >
          Start Your Quest
        </button>
      </motion.div>

      <div className="game-grid">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((index) => (
          <motion.div
            key={index}
            className="game-icon"
            whileHover={{ scale: 1.1 }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.1 }}
          >
            <span className="icon">🎮</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default App;
