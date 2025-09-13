import React from 'react';

const ErrorMessage = ({ error }) => (
  error ? <div className="error">{error}</div> : null
);

export default ErrorMessage;
