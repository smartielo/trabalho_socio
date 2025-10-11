import { useEffect } from 'react';
import React from 'react';
import './Login.css';
import Button from './Button';
import brasao from '../assets/brasao.png';
import instituto from '../assets/instituto.png';
import sagrado from '../assets/Sagrado.png';

const Home = () => {
  const handleSignUpClick = () => {
    alert('Botão de Cadastrar clicado!');
  };

  const handleLoginLinkClick = (e) => {
    e.preventDefault(); // Impede o recarregamento da página
    alert('Link "Entrar" clicado!');
  };

  return (
    <div className="app-container">
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
        <img src={instituto} alt="Instituto das Apostolas" style={{ width: '250px' }} />
        <img src={sagrado} alt="Sagrado Coração de Jesus" style={{ width: '210px' }} />
      </div>
      <img src={brasao} alt="Brasão da Instituição" style={{ width: '300px', marginBottom: '30px' }} />
      <Button onClick={handleSignUpClick}>Cadastrar</Button>
      <p className="login-link">
        Já possui um cadastro? <a href="#" onClick={handleLoginLinkClick}>Entrar</a>
      </p>
    </div>
  );
};

export default Home;