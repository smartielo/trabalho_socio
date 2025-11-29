import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import InputMask from 'react-input-mask';
import { toast } from 'react-toastify'; // Importa o toast

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

  useEffect(() => {
    document.body.classList.add('cadastro-page-active');
    return () => {
      document.body.classList.remove('cadastro-page-active');
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validações manuais simples
    if (!formData.nome || !formData.cpf || !formData.senha) {
        return toast.warn("Preencha todos os campos obrigatórios.");
    }
    if (formData.senha.length < 4) { // Senha curta para teste, ideal ser maior
        return toast.warn("A senha deve ter pelo menos 4 caracteres.");
    }
    if (formData.senha !== formData.confirmarSenha) {
        return toast.error("As senhas não coincidem.");
    }

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

      const data = await response.json();

      if (response.ok) {
        toast.success('Administrador cadastrado com sucesso!');
        navigate('/gerenciar-usuarios'); // Volta para a lista de usuários
      } else {
        toast.error(data.msg || 'Erro ao cadastrar.');
      }
    } catch (err) {
      toast.error('Não foi possível conectar ao servidor.');
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
            <input type="text" id="nome" name="nome" className="input" placeholder="Digite o nome completo" value={formData.nome} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label htmlFor="cpf" className="cadastro-label">CPF</label>
            <InputMask mask="999.999.999-99" maskChar={null} id="cpf" name="cpf" className="input" placeholder="Digite o CPF" value={formData.cpf} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label htmlFor="senha" className="cadastro-label">Senha</label>
            <input type="password" id="senha" name="senha" className="input" placeholder="Mínimo de 4 caracteres" value={formData.senha} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label htmlFor="confirmarSenha" className="cadastro-label">Confirmar Senha</label>
            <input type="password" id="confirmarSenha" name="confirmarSenha" className="input" placeholder="Redigite a senha" value={formData.confirmarSenha} onChange={handleChange} />
          </div>

          <div className="navigation-buttons" style={{ justifyContent: 'center', marginTop: '2rem', gap: '15px' }}>
            <button type="button" className="submit-button cancel-button" onClick={() => navigate('/gerenciar-usuarios')}>Cancelar</button>
            <button type="submit" className="submit-button">Cadastrar Admin</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CadastroAdmin;