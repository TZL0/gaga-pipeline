// src/components/SuccessPopup.js
import React from 'react';
import { PopUp } from './common';
import { FiSmile } from 'react-icons/fi';

const SuccessPopup = ({ success, clearSuccess }) => {
  if (!success) return null;

  return (
    <PopUp
      id="Success"
      onClose={clearSuccess}
      style={{ maxWidth: '30%' }}
    >
      <h2>Congratulations</h2>
      <p style={{ margin: '0 3rem' }}>{success}</p>
      <FiSmile />
    </PopUp>
  );
};

export default SuccessPopup;
