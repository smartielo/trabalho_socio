import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import '../styles/cadastro.css';
import '../styles/dashboard.css';
import brasao from '../assets/brasao.png';
import instituto from '../assets/instituto.png';
import sagrado from '../assets/Sagrado.png';
import Loading from '../components/Loading';

const ListaParticipantes = () => {
  const navigate = useNavigate();
  const [participantes, setParticipantes] = useState([]);
  const [filtroTexto, setFiltroTexto] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos'); // Novo Estado
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.body.classList.add('cadastro-page-active');
    
    const fetchTodos = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await fetch('http://localhost:5000/api/participantes/todos', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          setParticipantes(await response.json());
        }
      } catch (error) {
        toast.error("Erro ao buscar lista.");
      } finally {
        setLoading(false);
      }
    };

    fetchTodos();
    return () => document.body.classList.remove('cadastro-page-active');
  }, []);

  const handleStatusChange = async (id, novoStatus) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:5000/api/admin/participantes/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status: novoStatus })
      });

      if (response.ok) {
        toast.success(`Status atualizado para ${novoStatus}!`);
        setParticipantes(prev => prev.map(p => p.id === id ? { ...p, status: novoStatus } : p));
      } else {
        toast.error("Erro ao atualizar status.");
      }
    } catch (error) { console.error(error); }
  };

  // Lógica de Filtro Avançada
  const participantesFiltrados = participantes.filter(p => {
    const termo = filtroTexto.toLowerCase();
    const matchTexto = (p.nomeCompleto && p.nomeCompleto.toLowerCase().includes(termo)) || 
                       (p.cpf && p.cpf.includes(termo));
    
    const matchStatus = filtroStatus === 'todos' ? true : p.status === filtroStatus;

    return matchTexto && matchStatus;
  });

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

      <div className="cadastro-form-container" style={{ maxWidth: '1000px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h1 className="cadastro-title" style={{ margin: 0 }}>Lista de Matrículas</h1>
            <button onClick={() => navigate('/dashboard')} className="submit-button" style={{ padding: '8px 20px', fontSize: '0.9rem' }}>Voltar</button>
        </div>

        {/* FILTROS */}
        <div className="form-group-row" style={{ marginBottom: '20px' }}>
            <div className="form-group" style={{ flex: 3 }}>
                <input 
                    type="text" 
                    className="input" 
                    placeholder="Buscar por Nome ou CPF..." 
                    value={filtroTexto}
                    onChange={(e) => setFiltroTexto(e.target.value)}
                    style={{ backgroundColor: '#fff', color: '#333' }}
                />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
                <select 
                    className="input" 
                    value={filtroStatus} 
                    onChange={(e) => setFiltroStatus(e.target.value)}
                    style={{ backgroundColor: '#fff', color: '#333' }}
                >
                    <option value="todos">Todos os Status</option>
                    <option value="pendente">Pendentes</option>
                    <option value="aprovado">Aprovados</option>
                    <option value="reprovado">Reprovados</option>
                </select>
            </div>
        </div>

        <div style={{ backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: '10px', padding: '15px', maxHeight: '60vh', overflowY: 'auto' }}>
            {loading ? (
                <p style={{ color: '#fff', textAlign: 'center' }}>if (loading) return <Loading /></p>
            ) : participantesFiltrados.length > 0 ? (
                <table style={{ width: '100%', borderCollapse: 'collapse', color: '#fff' }}>
                    <thead>
                        <tr style={{ borderBottom: '2px solid #FEBF00', textAlign: 'left' }}>
                            <th style={{ padding: '10px' }}>Nome</th>
                            <th style={{ padding: '10px' }}>Status</th>
                            <th style={{ padding: '10px' }}>CPF</th>
                            <th style={{ padding: '10px' }}>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {participantesFiltrados.map((p) => (
                            <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                <td style={{ padding: '10px' }}>{p.nomeCompleto}</td>
                                <td style={{ padding: '10px' }}>
                                    <span style={{ 
                                        color: p.status === 'aprovado' ? '#4caf50' : p.status === 'pendente' ? '#ff9800' : '#f44336',
                                        fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.8rem'
                                    }}>
                                        {p.status}
                                    </span>
                                </td>
                                <td style={{ padding: '10px' }}>{p.cpf}</td>
                                <td style={{ padding: '10px', display: 'flex', gap: '5px' }}>
                                    <button onClick={() => navigate(`/perfil/${p.id}`)} style={{ background: '#42a5f5', color: '#fff', border: 'none', borderRadius: '5px', padding: '5px 10px', cursor: 'pointer' }}>Ver</button>
                                    <button onClick={() => handleStatusChange(p.id, 'aprovado')} style={{ background: '#66bb6a', color: '#fff', border: 'none', borderRadius: '5px', padding: '5px 10px', cursor: 'pointer' }} title="Aprovar">✓</button>
                                    <button onClick={() => handleStatusChange(p.id, 'reprovado')} style={{ background: '#ef5350', color: '#fff', border: 'none', borderRadius: '5px', padding: '5px 10px', cursor: 'pointer' }} title="Reprovar">✕</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p style={{ color: '#ccc', textAlign: 'center' }}>Nenhum participante encontrado.</p>
            )}
        </div>
        
        <div style={{ marginTop: '10px', color: '#ccc', fontSize: '0.9rem', textAlign: 'right' }}>
            Total: {participantesFiltrados.length}
        </div>
      </div>
    </div>
  );
};

export default ListaParticipantes;