// src/pages/Perfil.js
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/cadastro.css'; // Reusa o fundo e estilos
import brasao from '../assets/brasao.png';
import instituto from '../assets/instituto.png';
import sagrado from '../assets/Sagrado.png';

const Perfil = () => {
  const { id } = useParams(); // Pega o ID da URL
  const navigate = useNavigate();
  const [participante, setParticipante] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.body.classList.add('cadastro-page-active');
    const fetchParticipante = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/participantes/${id}`);
        if (response.ok) {
          const data = await response.json();
          setParticipante(data);
        } else {
          alert('Participante não encontrado');
          navigate('/dashboard');
        }
      } catch (error) {
        console.error('Erro:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchParticipante();

    return () => document.body.classList.remove('cadastro-page-active');
  }, [id, navigate]);

  if (loading) return <div className="app-container"><h1 style={{color:'#fff'}}>Carregando...</h1></div>;
  if (!participante) return null;

  return (
    <div className="app-container">
      <header className="cadastro-header">
        <img src={brasao} alt="Brasão" className="header-brasao" />
        <div className="header-divider" />
        <div className="header-logos-instituto">
          <img src={instituto} alt="Instituto" className="header-instituto" />
          <img src={sagrado} alt="Sagrado" className="header-sagrado" />
        </div>
      </header>

      <div className="cadastro-form-container">
        <h1 className="cadastro-title">Perfil do Participante</h1>
        
        <div style={{ color: '#fff' }}>
          <div className="form-group">
            <label className="cadastro-label">Nome Completo:</label>
            <div className="input" style={{ display: 'flex', alignItems: 'center', background: '#e2e2e2' }}>
              {participante.nomeCompleto}
            </div>
          </div>

          <div className="form-group-row">
            <div className="form-group">
                <label className="cadastro-label">CPF:</label>
                <div className="input" style={{ display: 'flex', alignItems: 'center' }}>{participante.cpf}</div>
            </div>
            <div className="form-group">
                <label className="cadastro-label">Nascimento:</label>
                <div className="input" style={{ display: 'flex', alignItems: 'center' }}>{participante.dataNascimento}</div>
            </div>
          </div>

          <div className="form-group-row">
            <div className="form-group">
                <label className="cadastro-label">NIS:</label>
                <div className="input" style={{ display: 'flex', alignItems: 'center' }}>{participante.nis}</div>
            </div>
            <div className="form-group">
                <label className="cadastro-label">Telefone:</label>
                <div className="input" style={{ display: 'flex', alignItems: 'center' }}>{participante.telefoneContato}</div>
            </div>
          </div>

          <div className="form-group">
            <label className="cadastro-label">Situação Escolar:</label>
            <div className="input" style={{ display: 'flex', alignItems: 'center' }}>
                {participante.situacao_escolar === 'frequenta' ? `Frequenta: ${participante.nome_escola}` : 'Não Frequenta'}
            </div>
          </div>
          
          <div className="form-group">
            <label className="cadastro-label">Renda Familiar:</label>
            <div className="input" style={{ display: 'flex', alignItems: 'center' }}>
                R$ {participante.rendaFamiliar}
            </div>
          </div>

        </div>

        <div className="navigation-buttons" style={{ marginTop: '2rem' }}>
            <button className="nav-button prev-button" onClick={() => navigate('/dashboard')}>
            Voltar ao Dashboard
            </button>
             {/* Aqui futuramente você pode pôr um botão de "Editar" ou "Excluir" */}
        </div>
      </div>
    </div>
  );
};

export default Perfil;