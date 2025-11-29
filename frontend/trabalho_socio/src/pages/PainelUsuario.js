import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/dashboard.css'; 
import '../styles/cadastro.css';



import Loading from '../components/Loading';

const PainelUsuario = () => {
  const navigate = useNavigate();
  const [participante, setParticipante] = useState(null);
  const [loading, setLoading] = useState(true);
  const [eventos, setEventos] = useState([]);

  const fetchEventos = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    
    try {
      const response = await fetch('http://localhost:5000/api/eventos', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setEventos(await response.json());
      }
    } catch (err) {
      console.error("Erro ao buscar eventos:", err);
    }
  }, []);

  useEffect(() => {
    document.body.classList.add('cadastro-page-active');

    const fetchMeuPerfil = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
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
    fetchEventos();

    return () => document.body.classList.remove('cadastro-page-active');
  }, [navigate, fetchEventos]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const handleToggleInscricao = async (eventoId) => {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`http://localhost:5000/api/eventos/${eventoId}/toggle-inscricao`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if(response.ok) {
            const data = await response.json();
            alert(data.msg);
            fetchEventos();
        } else {
            const err = await response.json();
            alert(err.msg);
        }
    } catch(error) {
        alert("Erro de conexão");
    }
  };

  // Função para formatar data de forma bonita
  const formatarData = (dataISO) => {
    if (!dataISO) return '';
    return new Date(dataISO).toLocaleString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric', 
      hour: '2-digit', minute: '2-digit'
    });
  };

  if (loading) return <div className="dashboard-container"><h2 style={{color: '#fff'}}>if (loading) return <Loading /></h2></div>;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Minha Área - Usuário</h1>
        <button onClick={handleLogout} className="submit-button" style={{ backgroundColor: '#dc3545', borderColor: '#dc3545' }}>
            Sair
        </button>
      </div>

      {participante ? (
        <>
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

            <div style={{ marginTop: '30px' }}>
                <h2 style={{ color: '#fff', borderBottom: '2px solid #FEBF00', paddingBottom: '10px' }}>Próximos Eventos</h2>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', marginTop: '20px' }}>
                    {eventos.length === 0 ? <p style={{color: '#ccc'}}>Nenhum evento disponível no momento.</p> : eventos.map(evento => (
                        <div key={evento.id} style={{ 
                            backgroundColor: '#5c0017', 
                            border: '1px solid #FEBF00', 
                            borderRadius: '10px', 
                            overflow: 'hidden',
                            display: 'flex', flexDirection: 'column'
                        }}>
                            {evento.imagem_url && (
                                <img src={evento.imagem_url} alt={evento.titulo} style={{width: '100%', height: '150px', objectFit: 'cover'}} />
                            )}
                            <div style={{ padding: '15px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                <h3 style={{ color: '#FEBF00', margin: '0 0 10px 0' }}>{evento.titulo}</h3>
                                
                                {/* --- DATA ATUALIZADA --- */}
                                <p style={{ color: '#fff', fontSize: '0.9rem', marginBottom: '5px' }}>
                                    <strong>Data:</strong> {formatarData(evento.data_inicio)} 
                                    {evento.data_fim ? ` até ${formatarData(evento.data_fim)}` : ''}
                                </p>

                                {/* --- LOCAL (ADICIONADO) --- */}
                                {evento.local && (
                                    <p style={{ color: '#fff', fontSize: '0.9rem', marginBottom: '5px' }}>
                                        <strong>Local:</strong> {evento.local}
                                    </p>
                                )}

                                <p style={{ color: '#ccc', fontSize: '0.9rem', marginBottom: '15px', flex: 1, whiteSpace: 'pre-wrap' }}>
                                    {evento.descricao}
                                </p>
                                
                                <div style={{ marginTop: 'auto' }}>
                                    <label style={{ 
                                        display: 'flex', alignItems: 'center', gap: '10px', 
                                        cursor: 'pointer', background: 'rgba(255,255,255,0.1)', 
                                        padding: '10px', borderRadius: '5px' 
                                    }}>
                                        <input 
                                            type="checkbox" 
                                            checked={evento.inscrito} 
                                            onChange={() => handleToggleInscricao(evento.id)}
                                            style={{ width: '20px', height: '20px', accentColor: '#FEBF00' }}
                                        />
                                        <span style={{ color: '#fff', fontWeight: 'bold' }}>
                                            {evento.inscrito ? 'Inscrito (Confirmado)' : 'Quero Participar'}
                                        </span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
      ) : (
        <p style={{color: '#fff'}}>Nenhum dado de participante vinculado a este usuário.</p>
      )}
    </div>
  );
};

export default PainelUsuario;