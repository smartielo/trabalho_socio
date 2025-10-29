import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Home.css';
import Button from './Button';
import brasao from '../assets/brasao.png';
import instituto from '../assets/instituto.png';
import sagrado from '../assets/Sagrado.png';

const Home = () => {
  const navigate = useNavigate();
  // 1. Controlar o estado do menu (aberto/fechado)
  const [isMenuOpen, setMenuOpen] = useState(false);

  const handleSignUpClick = () => {
    navigate('/cadastro');
  };

  const handleLoginLinkClick = (e) => {
    e.preventDefault(); // Impede o comportamento padrão do link
    navigate('/login'); // Navega para a página de login
  };

  return (
    <div className={`app-container ${isMenuOpen ? 'menu-open' : ''}`}>
      {/* Início do Menu Hambúrguer */}
      <div className="menu-container">
        {/* O input agora é puramente visual e seu estado é controlado pelo React */}
        <input type="checkbox" className="label-check" checked={isMenuOpen} readOnly />
        <label className="hamburger-label" onClick={() => setMenuOpen(!isMenuOpen)}>
          <div className="line1"></div>
          <div className="line2"></div>
          <div className="line3"></div>
        </label>
        <nav className="menu">
          <ul>
            <li><a href="#">Quem somos?</a></li>
            <li><a href="#">Onde estamos?</a></li>
            <li><a href="#">Pedir ajuda</a></li>
          </ul>
        </nav>
      </div>
      {/* Fim do Menu Hambúrguer */}

      <div className="content-wrapper">
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
    </div>
  );
};

export default Home;