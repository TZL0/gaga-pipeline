// src/components/ErrorPopup.js
import React from 'react';
import { PopUp } from './common';

const ErrorPopup = ({ error, clearError }) => {
  if (!error) return null;

  return (
    <PopUp
      id="Error"
      onClose={clearError}
      style={{ maxWidth: '30%' }}
    >
      <h2>Oops..</h2>
      <p style={{ margin: '0 3rem' }}>{error}</p>
    </PopUp>
  );
};

export default ErrorPopup;
