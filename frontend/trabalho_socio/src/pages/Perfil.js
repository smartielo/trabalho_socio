import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import InputMask from 'react-input-mask';

import '../styles/cadastro.css'; // Reutiliza estilos
import '../styles/Perfil.css';   // Estilos específicos para o perfil

import brasao from '../assets/brasao.png';
import instituto from '../assets/instituto.png';
import sagrado from '../assets/Sagrado.png';

const Perfil = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    document.body.classList.add('cadastro-page-active');
    document.title = 'C.S.E. - Irmã Adelaide | Meu Perfil';
    
    const fetchUserData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Acesso negado. Faça login novamente.');
        setLoading(false);
        navigate('/login'); // Redireciona para o login se não houver token
        return;
      }

      try {
        const response = await fetch('http://localhost:5000/api/perfil', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setUserData(data);
        } else {
          const errorData = await response.json();
          setError(errorData.message || 'Falha ao carregar os dados do perfil.');
        }
      } catch (err) {
        setError('Não foi possível conectar ao servidor. Tente mais tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
   
    return () => {
      document.body.classList.remove('cadastro-page-active');
    };
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({ ...prev, [name]: value }));
  };

  const handleRecadastroSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    try {
      // Assumindo que você terá um endpoint para ATUALIZAR os dados
      const response = await fetch('http://localhost:5000/api/perfil', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(userData)
      });

      if (response.ok) {
        alert('Dados atualizados com sucesso!');
        setIsEditing(false); // Volta para o modo de visualização
      } else {
        const errorData = await response.json();
        alert(`Erro ao atualizar: ${errorData.message || 'Tente novamente.'}`);
      }
    } catch (err) {
      alert('Falha na comunicação com o servidor.');
    }
  };

  if (loading) {
    return <div className="app-container"><h1>Carregando...</h1></div>;
  }

  if (error) {
    return <div className="app-container"><h1>{error}</h1></div>;
  }

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
        <h1 className="cadastro-title">Meu Perfil</h1>

        {/* O formulário é usado tanto para exibir quanto para editar */}
        <form onSubmit={handleRecadastroSubmit}>
          {/* Exemplo de campo: Nome Completo */}
          <div className="form-group">
            <label htmlFor="nomeCompleto" className="cadastro-label">Nome Completo</label>
            <input
              type="text"
              id="nomeCompleto"
              name="nomeCompleto"
              className="input"
              value={userData?.nomeCompleto || ''}
              onChange={handleInputChange}
              readOnly={!isEditing}
            />
          </div>

          {/* Exemplo de campo: CPF */}
          <div className="form-group">
            <label htmlFor="cpf" className="cadastro-label">CPF</label>
            <InputMask
              mask="999.999.999-99"
              id="cpf"
              name="cpf"
              className="input"
              value={userData?.cpf || ''}
              readOnly // CPF geralmente não é editável
            />
          </div>

          {/* Exemplo de campo: Endereço */}
          <div className="form-group">
            <label htmlFor="endereco" className="cadastro-label">Endereço</label>
            <input
              type="text"
              id="endereco"
              name="endereco"
              className="input"
              value={userData?.endereco || ''}
              onChange={handleInputChange}
              readOnly={!isEditing}
            />
          </div>

          {/* Adicione aqui outros campos do cadastro que o usuário pode visualizar/editar */}

          <div className="perfil-actions">
            {isEditing ? (
              <>
                <button type="submit" className="submit-button">Concluir Recadastro</button>
                <button type="button" className="submit-button cancel-button" onClick={() => setIsEditing(false)}>Cancelar</button>
              </>
            ) : (
              <button type="button" className="submit-button" onClick={() => setIsEditing(true)}>Fazer Recadastro</button>
            )}
          </div>
        </form>
      </div>

      <div className="back-button-container">
        <button className="back-button" onClick={() => navigate('/')}>
          Sair
        </button>
      </div>
    </div>
  );
};

export default Perfil;