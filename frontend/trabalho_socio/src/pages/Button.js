import React from 'react';
import './Login.css'; // Importa os estilos para o botão

const Button = ({ children, onClick, ...rest }) => {
  return (
    <button className="custom-btn" onClick={onClick} {...rest}>
      <span className="transition"></span>
      <span className="gradient"></span>
      <span className="label">{children}</span>
    </button>
  );
};

export default Button;
