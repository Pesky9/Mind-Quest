"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import "./Quiz.css";
import { useNavigate, useLocation } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { leaderboardService } from "../services/leaderboardService";
import Leaderboard from "../components/Leaderboard";

function Quiz() {
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [feedback, setFeedback] = useState({});
  const [score, setScore] = useState(null);
  const [showScore, setShowScore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [scoreSubmitted, setScoreSubmitted] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { username } = useUser();

  useEffect(() => {
    // Check if URL has showLeaderboard parameter
    const params = new URLSearchParams(location.search);
    if (params.get("showLeaderboard") === "true") {
      setShowLeaderboard(true);
      // Clean up the URL
      navigate("/quiz", { replace: true });
    }
  }, [location, navigate]);

  useEffect(() => {
    setIsLoading(true);
    axios
      .get("https://mind-quest-api.vercel.app/api/questions")
      .then((response) => {
        setQuizQuestions(response.data);
        // Set start time when questions are loaded
        setStartTime(Date.now());
        setTimeout(() => {
          setIsLoading(false);
        }, 2000);
      })
      .catch((error) => {
        console.error("Error fetching quiz questions:", error);
        setIsLoading(true);
      });
  }, []);

  const handleOptionChange = (questionIndex, optionIndex) => {
    setAnswers({ ...answers, [questionIndex]: optionIndex });
  };

  const checkAnswers = () => {
    // Record end time
    setEndTime(Date.now());

    let newScore = 0;
    const newFeedback = {};

    quizQuestions.forEach((question, index) => {
      if (answers[index] !== undefined) {
        if (Number.parseInt(answers[index], 10) === question.answer) {
          newScore++;
          newFeedback[index] = {
            correct: true,
            message: `✓ Correct! ${question.explanation}`,
          };
        } else {
          newFeedback[index] = {
            correct: false,
            message: `✗ Incorrect. The correct answer is: ${
              question.options[question.answer]
            }. ${question.explanation}`,
          };
        }
      } else {
        newFeedback[index] = {
          correct: false,
          message: `✗ You didn't select an answer. The correct answer is: ${
            question.options[question.answer]
          }. ${question.explanation}`,
        };
      }
    });

    setScore(newScore);
    setFeedback(newFeedback);
    setShowScore(true);
  };

  // Submit score to leaderboard
  useEffect(() => {
    if (showScore && score !== null && endTime && !scoreSubmitted) {
      const timeSpent = Math.floor((endTime - startTime) / 1000); // Convert to seconds

      const leaderboardData = {
        game: "Quiz",
        username: username || "Anonymous",
        score: score,
        totalQuestions: quizQuestions.length,
        time: timeSpent,
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
  }, [
    showScore,
    score,
    endTime,
    username,
    quizQuestions.length,
    scoreSubmitted,
    startTime,
  ]);

  const restartQuiz = () => {
    setAnswers({});
    setFeedback({});
    setScore(null);
    setShowScore(false);
    setStartTime(Date.now());
    setEndTime(null);
    setScoreSubmitted(false);
  };

  const percentage =
    quizQuestions.length > 0 && score !== null
      ? Math.round((score / quizQuestions.length) * 100)
      : 0;

  let resultMessage = "";
  if (percentage >= 90) {
    resultMessage = "Excellent! You're a grammar superstar! 🌟";
  } else if (percentage >= 70) {
    resultMessage = "Great job! You know your grammar well! 😀";
  } else if (percentage >= 50) {
    resultMessage = "Good effort! Keep practicing! 👍";
  } else {
    resultMessage = "Keep learning! You'll get better with practice! 📚";
  }

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
        </div>
        <h2>Loading Quiz Questions...</h2>
        <p>Get ready for some grammar fun! 🌟</p>
      </div>
    );
  }

  return (
    <div className="quiz-container">
      <img
        className="Back_button"
        src="https://cdn-icons-png.freepik.com/256/10117/10117449.png?ga=GA1.1.319443277.1739009519&semt=ais_hybrid"
        alt="Back"
        onClick={() => navigate("/home")}
      />
      <div className="quiz-header">
        <h1 className="quiz-title">
          <span role="img" aria-label="star">
            🌟
          </span>{" "}
          Fun English Grammar Quiz{" "}
          <span role="img" aria-label="star">
            🌟
          </span>
        </h1>
        <button
          className="leaderboard-toggle-btn"
          onClick={() => setShowLeaderboard(true)}
        >
          View Leaderboard
        </button>
      </div>

      <div className="questions-wrapper">
        {quizQuestions.map((question, index) => (
          <div
            className={`question-card ${
              feedback[index]?.correct ? "correct" : ""
            } ${feedback[index]?.correct === false ? "incorrect" : ""}`}
            key={index}
          >
            <div className="question-number">Question {index + 1}</div>
            <div className="question-text">{question.question}</div>
            <div className="options-grid">
              {question.options.map((option, optionIndex) => (
                <label
                  className={`option-item ${
                    answers[index] === optionIndex ? "selecteds" : ""
                  }`}
                  key={optionIndex}
                >
                  <input
                    type="radio"
                    name={`question${index}`}
                    value={optionIndex}
                    onChange={() => handleOptionChange(index, optionIndex)}
                    checked={answers[index] === optionIndex}
                  />
                  <span className="option-text">{option}</span>
                </label>
              ))}
            </div>
            {feedback[index] && (
              <div className="feedback-message">{feedback[index].message}</div>
            )}
          </div>
        ))}
      </div>

      {!showScore ? (
        <button className="submit-btn" onClick={checkAnswers}>
          Check My Answers
        </button>
      ) : (
        <div className="results-container">
          <div className="score-card">
            <div className="score-circle">
              <span>{percentage}%</span>
            </div>
            <div className="score-details">
              <p>
                Score: {score} / {quizQuestions.length}
              </p>
              <p className="result-message">{resultMessage}</p>
            </div>
          </div>
          <button className="restart-btn" onClick={restartQuiz}>
            Try Again
          </button>
        </div>
      )}

      {showLeaderboard && (
        <Leaderboard game="Quiz" onClose={() => setShowLeaderboard(false)} />
      )}
    </div>
  );
}

export default Quiz;
