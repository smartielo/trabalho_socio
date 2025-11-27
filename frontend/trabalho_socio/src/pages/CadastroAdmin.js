import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import InputMask from 'react-input-mask';

import '../styles/cadastro.css'; 
import brasao from '../assets/brasao.png';
import instituto from '../assets/instituto.png';
import sagrado from '../assets/Sagrado.png';

const CadastroAdmin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    senha: '',
    confirmarSenha: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    // A proteção de rota agora é feita pelo App.js (ProtectedRoute)
    // Não precisamos mais verificar location.state
    
    document.body.classList.add('cadastro-page-active');
    document.title = 'C.S.E. - Irmã Adelaide | Cadastrar Administrador';
    return () => {
      document.body.classList.remove('cadastro-page-active');
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.nome) newErrors.nome = 'O nome é obrigatório.';
    if (!formData.cpf) newErrors.cpf = 'O CPF é obrigatório.';
    if (!formData.senha) {
      newErrors.senha = 'A senha é obrigatória.';
    } else if (formData.senha.length < 8) {
      newErrors.senha = 'A senha deve ter no mínimo 8 caracteres.';
    }
    if (formData.senha !== formData.confirmarSenha) {
      newErrors.confirmarSenha = 'As senhas não coincidem.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/admin/cadastro', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          alert('Administrador cadastrado com sucesso!');
          // Redireciona para a lista de usuários em vez do dashboard
          navigate('/gerenciar-usuarios'); 
        } else {
          const errorData = await response.json();
          setErrors(prev => ({ ...prev, api: errorData.message || 'Erro ao cadastrar.' }));
        }
      } catch (err) {
        setErrors(prev => ({ ...prev, api: 'Não foi possível conectar ao servidor.' }));
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

      <div className="cadastro-form-container" style={{ maxWidth: '600px' }}>
        <h1 className="cadastro-title">Cadastrar Novo Administrador</h1>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="nome" className="cadastro-label">Nome Completo</label>
            <input type="text" id="nome" name="nome" className={`input ${errors.nome ? 'error' : ''}`} placeholder="Digite o nome completo" value={formData.nome} onChange={handleChange} />
            {errors.nome && <p className="error-message">{errors.nome}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="cpf" className="cadastro-label">CPF</label>
            <InputMask mask="999.999.999-99" maskChar={null} id="cpf" name="cpf" className={`input ${errors.cpf ? 'error' : ''}`} placeholder="Digite o CPF" value={formData.cpf} onChange={handleChange} />
            {errors.cpf && <p className="error-message">{errors.cpf}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="senha" className="cadastro-label">Senha</label>
            <input type="password" id="senha" name="senha" className={`input ${errors.senha ? 'error' : ''}`} placeholder="Mínimo de 8 caracteres" value={formData.senha} onChange={handleChange} />
            {errors.senha && <p className="error-message">{errors.senha}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="confirmarSenha" className="cadastro-label">Confirmar Senha</label>
            <input type="password" id="confirmarSenha" name="confirmarSenha" className={`input ${errors.confirmarSenha ? 'error' : ''}`} placeholder="Redigite a senha" value={formData.confirmarSenha} onChange={handleChange} />
            {errors.confirmarSenha && <p className="error-message">{errors.confirmarSenha}</p>}
          </div>

          {errors.api && <p className="error-message">{errors.api}</p>}

          <div className="navigation-buttons" style={{ justifyContent: 'center', marginTop: '2rem' }}>
            <button type="submit" className="submit-button">Concluir Cadastro</button>
          </div>
        </form>
      </div>

      <div className="back-button-container">
        <button className="back-button" onClick={() => navigate('/gerenciar-usuarios')}>
          Voltar
        </button>
      </div>
    </div>
  );
};

export default CadastroAdmin;