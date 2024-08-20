// src/components/RotateScreenDialog.js

import React from 'react';
import './RotateScreenDialog.css';

const RotateScreenDialog = ({ onClose }) => {
  return (
    <div className="dialog-overlay">
      <div className="dialog-box">
        <p>For a better experience, please rotate your device to landscape mode.</p>
        <button onClick={onClose}>OK</button>
      </div>
    </div>
  );
};

export default RotateScreenDialog;
