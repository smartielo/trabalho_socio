import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import InputMask from 'react-input-mask';

import '../styles/Login.css'; // Estilos específicos do Login
import '../styles/cadastro.css'; // Reutiliza estilos do cadastro

import brasao from '../assets/brasao.png';
import instituto from '../assets/instituto.png';
import sagrado from '../assets/Sagrado.png';

const Login = () => {
  const navigate = useNavigate();
  const [cpf, setCpf] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    document.body.classList.add('cadastro-page-active');
    document.title = 'C.S.E. - Irmã Adelaide | Login';
    return () => {
      document.body.classList.remove('cadastro-page-active');
    };
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(''); // Limpa erros anteriores

    if (!cpf || !senha) {
      setError('Por favor, preencha o CPF e a senha.');
      return;
    }

    try {
      // A URL deve corresponder à rota do seu backend para login
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cpf, senha }),
      });

      if (response.ok) {
        const data = await response.json();
        // Sucesso! Armazene o token e redirecione
        localStorage.setItem('token', data.token);
        navigate('/dashboard');
      } else {
        // Tenta ler a mensagem de erro do backend
        const data = await response.json();
        // Falha no login
        setError(data.message || 'CPF ou senha inválidos.');
      }
    } catch (err) {
      setError('Falha ao conectar com o servidor. Tente novamente.');
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

      <div className="login-form-container">
        <h1 className="cadastro-title">Login</h1>
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="cpf" className="cadastro-label">CPF</label>
            <InputMask mask="999.999.999-99" maskChar={null} id="cpf" name="cpf" className="input" placeholder="Digite seu CPF" value={cpf} onChange={(e) => setCpf(e.target.value)} />
          </div>
          <div className="form-group">
            <label htmlFor="senha" className="cadastro-label">Senha</label>
            <input type="password" id="senha" name="senha" className="input" placeholder="Digite sua senha" value={senha} onChange={(e) => setSenha(e.target.value)} />
          </div>
          {error && <p className="error-message">{error}</p>}
          <button type="submit" className="submit-button login-button">Entrar</button>
        </form>
        <p className="signup-link">Não tem uma conta? <Link to="/cadastro">Cadastre-se</Link></p>
      </div>
    </div>
  );
};

export default Login;