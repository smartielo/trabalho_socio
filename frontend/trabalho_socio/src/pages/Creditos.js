import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/creditos.css';
import '../styles/cadastro.css'; // Reutiliza estilos globais como o background e header

// Importação das imagens do cabeçalho (mesmo padrão do Login/Cadastro)
import brasao from '../assets/brasao.png';
import instituto from '../assets/instituto.png';
import sagrado from '../assets/Sagrado.png';
import extensao from '../assets/coordenadoria-de-extensao.jpg';


// Importe a logo da extensão aqui quando tiver o arquivo
// import logoExtensao from '../assets/logo-extensao.jpg'; 

const Creditos = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Adiciona a classe para o gradiente de fundo correto
    document.body.classList.add('cadastro-page-active');
    document.title = 'C.S.E. - Irmã Adelaide | Créditos';
    
    return () => {
      document.body.classList.remove('cadastro-page-active');
    };
  }, []);

  return (
    <div className="app-container">
      {/* --- Cabeçalho Padrão --- */}
      <header className="cadastro-header">
        <img src={brasao} alt="Brasão" className="header-brasao" />
        <div className="header-divider" />
        <div className="header-logos-instituto">
          <img src={instituto} alt="Instituto" className="header-instituto" />
          <img src={sagrado} alt="Sagrado" className="header-sagrado" />
        </div>
      </header>

      <div className="credits-container">
        <h1 className="cadastro-title">Créditos</h1>

        <div className="credits-section">
          <h2 className="credits-title">Projeto de Extensão</h2>
          <p className="credits-text">
            Fábrica de Software: Desenvolvimento de Websites, Aplicativos e Jogos
          </p>
        </div>

        <div className="credits-section">
          <h2 className="credits-title">Professor Orientador</h2>
          <p className="credits-text">Prof. Dr. Elvio Gilberto da Silva</p>
        </div>

        <div className="credits-section">
          <h2 className="credits-title">Equipe de Desenvolvimento</h2>
          <ul className="team-list">
            {/* Liste os alunos aqui */}
            <li>Ana Nabeiro Junc</li>
            <li>Eduardo Perfeito Euzébio</li>
            <li>Emerson Mazzeto</li>
            <li>Gabriel Furlaneto de Luiz</li>
            <li>Gabriel Martielo da Silva</li>
            <li>João Vitor de Paula Diniz</li>
          </ul>
        </div>

        <div className="support-box">
            <span className="support-label">Apoio:</span>
            <img 
                src={extensao}
                alt="Coordenadoria de Extensão" 
                className="support-logo-placeholder" 
            />
        </div>

        <div className="back-button-container" style={{ marginTop: '2rem', paddingBottom: '0' }}>
          <button className="back-button" onClick={() => navigate('/')}>
            Voltar ao Início
          </button>
        </div>
      </div>
    </div>
  );
};

export default Creditos;