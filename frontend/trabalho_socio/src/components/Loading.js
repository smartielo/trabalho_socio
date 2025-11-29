import React from 'react';
// O CSS já foi adicionado no index.css anteriormente

const Loading = ({ message = "Carregando..." }) => {
  return (
    <div className="loading-overlay">
      <div className="spinner"></div>
      <div className="loading-text">{message}</div>
    </div>
  );
};

export default Loading;