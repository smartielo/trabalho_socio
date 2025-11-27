import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/dashboard.css'; // Reutiliza estilos do dashboard
import '../styles/cadastro.css';

const PainelUsuario = () => {
  const navigate = useNavigate();
  const [participante, setParticipante] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.body.classList.add('cadastro-page-active');
    const fetchMeuPerfil = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        // Vamos criar esta rota no backend
        const response = await fetch('http://localhost:5000/api/meu-perfil', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          const data = await response.json();
          setParticipante(data);
        } else {
          alert('Sessão expirada ou erro ao buscar dados.');
          navigate('/login');
        }
      } catch (error) {
        console.error('Erro:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMeuPerfil();
    return () => document.body.classList.remove('cadastro-page-active');
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  if (loading) return <div className="dashboard-container"><h2 style={{color: '#fff'}}>Carregando...</h2></div>;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Minha Área - Usuário</h1>
        <button onClick={handleLogout} className="submit-button" style={{ backgroundColor: '#dc3545', borderColor: '#dc3545' }}>
            Sair
        </button>
      </div>

      {participante ? (
        <div className="search-result-widget" style={{ borderLeft: `5px solid ${participante.status === 'aprovado' ? '#4caf50' : '#FEBF00'}` }}>
            <h3>Bem-vindo(a), {participante.nomeCompleto}</h3>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <strong>Status:</strong> 
                <span style={{ 
                    backgroundColor: participante.status === 'aprovado' ? '#4caf50' : '#ff9800',
                    padding: '4px 8px', borderRadius: '4px', color: '#fff', textTransform: 'uppercase', fontSize: '0.9rem' 
                }}>
                    {participante.status}
                </span>
      </div>

      <p><strong>CPF:</strong> {participante.cpf}</p>
      <hr style={{ borderColor: 'rgba(255,255,255,0.2)', margin: '15px 0' }}/>

      <div style={{ display: 'flex', gap: '10px' }}>
        <button onClick={() => navigate('/editar-perfil')} className="submit-button" style={{ padding: '10px', width: 'auto' }}>
            ✏️ Editar Meus Dados
        </button>
      </div>
    </div>
      ) : (
        <p style={{color: '#fff'}}>Nenhum dado de participante vinculado a este usuário.</p>
      )}
    </div>
  );
};

export default PainelUsuario;