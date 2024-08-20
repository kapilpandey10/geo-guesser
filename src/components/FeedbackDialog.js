import React from 'react';
import './FeedbackDialog.css';

const FeedbackDialog = ({ message, onClose, isCorrect, isMobile }) => {
  return (
    <div className="dialog-overlay">
      <div className={`dialog-box ${isMobile ? 'mobile' : 'desktop'}`}>
        <h1>{isCorrect ? '🎉 Congratulations!' : '😞 Try Again'}</h1>
        <p>{message}</p>
        {isCorrect && (
          <div className="stars">
            {Array.from({ length: 5 }).map((_, index) => (
              <span key={index} className="star">⭐</span>
            ))}
          </div>
        )}
        <button onClick={onClose} className="dialog-button">
          {isCorrect ? 'Play More' : 'Try Again'}
        </button>
      </div>
    </div>
  );
};

export default FeedbackDialog;
