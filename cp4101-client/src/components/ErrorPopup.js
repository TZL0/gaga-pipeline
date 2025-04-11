// src/components/ErrorPopup.js
import React from 'react';
import { PopUp } from './common';

const ErrorPopup = ({ error, clearError }) => {
  if (!error) return null;

  return (
    <PopUp
      onClose={clearError}
      zIndex={2000}
    >
      <h2>Oops..</h2>
      <p>{error}</p>
    </PopUp>
  );
};

export default ErrorPopup;
