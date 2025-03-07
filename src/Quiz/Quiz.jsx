import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Quiz.css";
import { useNavigate } from "react-router-dom";

function Quiz() {
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [feedback, setFeedback] = useState({});
  const [score, setScore] = useState(null);
  const [showScore, setShowScore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    setIsLoading(true);
    axios
      .get("https://mind-quest-api.vercel.app/api/questions")
      .then((response) => {
        setQuizQuestions(response.data);
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
    let newScore = 0;
    const newFeedback = {};

    quizQuestions.forEach((question, index) => {
      if (answers[index] !== undefined) {
        if (parseInt(answers[index], 10) === question.answer) {
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

  const restartQuiz = () => {
    setAnswers({});
    setFeedback({});
    setScore(null);
    setShowScore(false);
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
      <h1 className="quiz-title">
        <span role="img" aria-label="star">
          🌟
        </span>{" "}
        Fun English Grammar Quiz{" "}
        <span role="img" aria-label="star">
          🌟
        </span>
      </h1>

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
    </div>
  );
}

export default Quiz;
