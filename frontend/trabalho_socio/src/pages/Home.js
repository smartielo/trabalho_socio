import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Home.css';
import Button from './Button';
import brasao from '../assets/brasao.png';
import instituto from '../assets/instituto.png';
import sagrado from '../assets/Sagrado.png';
import gif from '../assets/livro.gif'; // Substitua pelo seu GIF animado

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

  const handleCreditsClick = () => {
    navigate('/creditos');
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
            <li><a href="https://www.instagram.com/projetos_sociaisiascj/" target="_blank" rel="noopener noreferrer">Quem somos?</a></li>
            <li><a href="https://www.google.com.br/maps/place/Av.+Santa+Beatriz+da+Silva,+7-40+-+Ferradura+Mirim,+Bauru+-+SP,+17031-365/@-22.3139096,-49.0167234,17z/data=!3m1!4b1!4m6!3m5!1s0x94bf5d04f596b605:0x46d43e54bd740c87!8m2!3d-22.3139096!4d-49.0141485!16s%2Fg%2F11sg_xdlnj?entry=ttu&g_ep=EgoyMDI1MTExNy4wIKXMDSoASAFQAw%3D%3D" target="_blank" rel="noopener noreferrer">Onde estamos?</a></li>
            <li><a href="https://wa.link/83wegp" target="_blank" rel="noopener noreferrer">Pedir ajuda</a></li>
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

      <button className="floating-credits-btn" onClick={handleCreditsClick}>
        <span className="transition"></span>
        <span className="gradient"></span>
        <span className="label">Créditos</span>
      </button>

    </div>
  );
};

export default Home;