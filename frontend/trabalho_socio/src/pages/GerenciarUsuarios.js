import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import '../styles/cadastro.css'; // Reutiliza estilos de formulário
import '../styles/GerenciarUsuarios.css'; // Estilos específicos para esta página

import brasao from '../assets/brasao.png';
import instituto from '../assets/instituto.png';
import sagrado from '../assets/Sagrado.png';

const GerenciarUsuarios = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      const token = localStorage.getItem('token');
      if (!location.state?.fromDashboard || !token) {
        navigate('/dashboard');
        return;
      }

      try {
        const response = await fetch('http://localhost:5000/api/admin/users', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          const data = await response.json();
          setUsers(data);
        } else {
          setError('Falha ao carregar a lista de usuários.');
        }
      } catch (err) {
        setError('Não foi possível conectar ao servidor.');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();

    // Proteção de rota para garantir que o acesso venha do dashboard
    if (!location.state?.fromDashboard) {
      navigate('/dashboard');
      return;
    }

    document.body.classList.add('cadastro-page-active');
    document.title = 'C.S.E. - Irmã Adelaide | Gerenciar Usuários';
    return () => {
      document.body.classList.remove('cadastro-page-active');
    };
  }, [location.state, navigate]);

  const handleRemoveUser = async (userId) => {
    // Janela de confirmação para segurança
    if (window.confirm('Tem certeza que deseja remover este usuário? Esta ação não pode ser desfeita.')) {
      const token = localStorage.getItem('token');
      try {
        const response = await fetch(`http://localhost:5000/api/admin/users/${userId}`, { 
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          alert('Usuário removido com sucesso!');
          // Remove o usuário da lista localmente para atualizar a UI
          setUsers(currentUsers => currentUsers.filter(user => user.id !== userId));
        } else {
          alert('Falha ao remover o usuário.');
        }
      } catch (err) {
        alert('Erro de conexão com o servidor.');
      }
    }
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
        <h1 className="cadastro-title">Gerenciar Usuários</h1>

        {loading && <p style={{ color: 'white', textAlign: 'center' }}>Carregando usuários...</p>}
        {error && <p className="error-message" style={{ textAlign: 'center' }}>{error}</p>}

        <div className="user-list">
          {users.length > 0 ? (
            users.map(user => {
              // Define a classe com base no tipo de usuário para estilização
              const roleClass = user.tipo.includes('Master') 
                ? 'master' 
                : user.tipo.includes('Admin') 
                ? 'admin' 
                : 'comum';

              return (
              <div key={user.id} className={`user-card ${roleClass}`}>
                <div className="user-info">
                  <span className="user-name">{user.nome}</span>
                  <span className="user-cpf">CPF: {user.cpf}</span>
                  <span className={`user-role ${roleClass}`}>{user.tipo}</span>
                </div>
                <div className="user-actions">
                  <button 
                    className="remove-user-btn"
                    onClick={() => handleRemoveUser(user.id)}
                    // Desabilita a remoção do admin master para segurança
                    disabled={user.tipo.includes('Master')}
                    title={user.tipo.includes('Master') ? 'Não é possível remover o administrador principal' : 'Remover usuário'}
                  >
                    Remover
                  </button>
                </div>
              </div>
              );
            })
          ) : (
            <p className="empty-list-message">Nenhum usuário para gerenciar.</p>
          )}
        </div>
      </div>

      <div className="back-button-container">
        <button className="back-button" onClick={() => navigate('/dashboard')}>
          Voltar ao Dashboard
        </button>
      </div>
    </div>
  );
};

export default GerenciarUsuarios;