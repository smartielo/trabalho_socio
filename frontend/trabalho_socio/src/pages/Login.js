import React from 'react';
import './Login.css';
import Button from './Button'; // Importe o componente que você criou
import brasao from '../assets/brasao.png'; // Importe a imagem do brasão 
import instituto from '../assets/instituto.png';
import sagrado from '../assets/Sagrado.png';

function Login() {
  const handleLoginClick = () => {
    alert('Botão de Login clicado!');
  };

  const handleSignUpClick = () => {
    alert('Botão de Cadastrar clicado!');
  };

  return (
    <div className="app-container">
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
  );
}

export default Login;
