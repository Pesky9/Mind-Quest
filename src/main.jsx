import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./Intro/Intro.jsx";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Homepage from "./Homepage/Homepage.jsx";
import Memory from "./Memory/Memory.jsx";
import Tetris from "./Tetris/Tetris.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Router>
      <Routes>
        <Route exact path="/" element={<App />} />
        <Route path="/home" element={<Homepage />} />
        <Route path="/memory" element={<Memory />} />
        <Route path="/tetris" element={<Tetris />} />
      </Routes>
    </Router>
  </StrictMode>
);
