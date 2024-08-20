// src/components/Welcome.js

import React from 'react';
import { useNavigate } from 'react-router-dom'; // Updated import
import './Welcome.css';

const Welcome = () => {
  const navigate = useNavigate(); // Updated hook

  const handlePlayGame = () => {
    navigate('/game'); // Navigate to the /game route
  };

  return (
    <div className="welcome-container">
      <h1 className="typewriter">Welcome to Geo-Guesser</h1>
      <h3>Made by Kapil Pandey</h3>
      <button className="play-button" onClick={handlePlayGame}>
        Play Game
      </button>
    </div>
  );
};

export default Welcome;
