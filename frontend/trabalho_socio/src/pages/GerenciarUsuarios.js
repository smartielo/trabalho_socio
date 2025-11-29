import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import '../styles/cadastro.css'; 
import '../styles/GerenciarUsuarios.css'; 

import brasao from '../assets/brasao.png';
import instituto from '../assets/instituto.png';
import sagrado from '../assets/Sagrado.png';

const GerenciarUsuarios = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [resetRequests, setResetRequests] = useState([]); 
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
      const token = localStorage.getItem('token');
      try {
        const resUsers = await fetch('http://localhost:5000/api/admin/users', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (resUsers.ok) setUsers(await resUsers.json());

        const resRequests = await fetch('http://localhost:5000/api/admin/reset-requests', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (resRequests.ok) setResetRequests(await resRequests.json());

      } catch (err) {
        toast.error("Erro ao carregar dados.");
      } finally {
        setLoading(false);
      }
  };

  useEffect(() => {
    document.body.classList.add('cadastro-page-active');
    fetchAll();
    return () => document.body.classList.remove('cadastro-page-active');
  }, []);

  const handleRemoveUser = async (userId) => {
    if (window.confirm('Remover este usuário?')) {
      const token = localStorage.getItem('token');
      try {
        const response = await fetch(`http://localhost:5000/api/admin/users/${userId}`, { 
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          toast.success('Usuário removido!');
          setUsers(prev => prev.filter(u => u.id !== userId));
        }
      } catch (err) { toast.error('Erro na conexão.'); }
    }
  };

  const handleResetAction = async (id, acao) => {
      const token = localStorage.getItem('token');
      try {
          const response = await fetch(`http://localhost:5000/api/admin/reset-requests/${id}/acao`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
              body: JSON.stringify({ acao })
          });
          
          const data = await response.json();
          if (response.ok) {
              toast.success(data.msg);
              setResetRequests(prev => prev.filter(r => r.id !== id));
          } else {
              toast.error(data.msg);
          }
      } catch (err) { toast.error('Erro na conexão.'); }
  };

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

      <div className="gerenciar-container">
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
            <h1 className="cadastro-title" style={{margin:0}}>Gerenciar Usuários</h1>
            <button onClick={()=>navigate('/cadastro-admin')} className="submit-button" style={{padding:'8px 15px', marginTop:0}}>+ Novo Admin</button>
        </div>

        {/* SEÇÃO DE PEDIDOS DE RESET */}
        {resetRequests.length > 0 && (
            <div style={{marginBottom: '2rem', border:'2px solid #FEBF00', padding:'15px', borderRadius:'10px', background:'rgba(0,0,0,0.3)'}}>
                <h3 style={{color:'#FEBF00', marginTop:0}}>🔔 Solicitações de Recuperação de Senha</h3>
                {resetRequests.map(req => (
                    <div key={req.id} style={{display:'flex', justifyContent:'space-between', alignItems:'center', background:'rgba(255,255,255,0.05)', padding:'10px', marginBottom:'5px', borderRadius:'5px'}}>
                        <div>
                            <strong style={{color:'#fff'}}>{req.usuario_nome}</strong>
                            <div style={{color:'#ccc', fontSize:'0.9rem'}}>CPF: {req.usuario_cpf} | Data: {req.data}</div>
                        </div>
                        <div style={{display:'flex', gap:'5px'}}>
                            <button onClick={() => handleResetAction(req.id, 'aprovar')} style={{background:'#28a745', border:'none', color:'#fff', padding:'5px 10px', borderRadius:'5px', cursor:'pointer'}}>Resetar para 'mudar123'</button>
                            <button onClick={() => handleResetAction(req.id, 'rejeitar')} style={{background:'#dc3545', border:'none', color:'#fff', padding:'5px 10px', borderRadius:'5px', cursor:'pointer'}}>Rejeitar</button>
                        </div>
                    </div>
                ))}
            </div>
        )}

        {loading && <p style={{ color: 'white', textAlign: 'center' }}>Carregando...</p>}

        <div className="user-list">
          {users.map(user => {
              // CORREÇÃO DE SEGURANÇA AQUI:
              const tipo = user.tipo || ''; // Garante que seja uma string, mesmo se vier vazio
              const roleClass = tipo.includes('Master') ? 'master' : tipo.includes('Admin') ? 'admin' : 'comum';
              
              return (
              <div key={user.id} className={`user-card ${roleClass}`}>
                <div className="user-info">
                  <span className="user-name">{user.nome}</span>
                  <span className="user-cpf">CPF: {user.cpf}</span>
                  <span className={`user-role ${roleClass}`}>{tipo}</span>
                </div>
                <div className="user-actions">
                  <button 
                    className="remove-user-btn"
                    onClick={() => handleRemoveUser(user.id)}
                    disabled={tipo.includes('Master')}
                  >
                    Remover
                  </button>
                </div>
              </div>
              );
            })
          }
        </div>
      </div>

      <div className="back-button-container">
        <button className="back-button" onClick={() => navigate('/dashboard')}>Voltar ao Dashboard</button>
      </div>
    </div>
  );
};

export default GerenciarUsuarios;