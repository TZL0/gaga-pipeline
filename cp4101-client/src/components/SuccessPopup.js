// src/components/SuccessPopup.js
import React from 'react';
import { PopUp } from './common';
import { FiSmile } from 'react-icons/fi';

const SuccessPopup = ({ success, clearSuccess }) => {
  if (!success) return null;

  return (
    <PopUp
      onClose={clearSuccess}
      zIndex={2000}
    >
      <h2>Congratulations</h2>
      <p>{success}</p>
      <FiSmile />
    </PopUp>
  );
};

export default SuccessPopup;
