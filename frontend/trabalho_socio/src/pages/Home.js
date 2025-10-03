import { useEffect } from 'react';
import React from 'react';
import './Login.css';
import Button from './Button';
import brasao from '../assets/brasao.png';
import instituto from '../assets/instituto.png';
import sagrado from '../assets/Sagrado.png';

const Home = () => {
  const handleLoginClick = () => {
    alert('Botão de Login clicado!');
  };

  const handleSignUpClick = () => {
    alert('Botão de Cadastrar clicado!');
  };

  return (
    <div className="app-container">
      <div className="content-wrapper">
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
          <img src={instituto} alt="Instituto das Apostolas" style={{ width: '250px' }} />
          <img src={sagrado} alt="Sagrado Coração de Jesus" style={{ width: '210px' }} />
        </div>
        <img src={brasao} alt="Brasão da Instituição" style={{ width: '300px', marginBottom: '30px' }} />
        <div style={{ display: 'flex', gap: '20px' }}>
          <Button onClick={handleLoginClick}>Entrar</Button>
          <Button onClick={handleSignUpClick}>Cadastrar</Button>
        </div>
      </div>
    </div>
  );
};

export default Home;