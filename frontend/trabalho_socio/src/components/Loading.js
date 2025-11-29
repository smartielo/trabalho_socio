import React from 'react';

const Loading = ({ message = "Carregando..." }) => {
  return (
    <div className="loading-overlay">
      <div className="spinner"></div>
      <div className="loading-text">{message}</div>
    </div>
  );
};

export default Loading;