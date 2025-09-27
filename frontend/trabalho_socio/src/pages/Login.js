import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  function handleSubmit(e) {
    e.preventDefault();
    setError('');
    // Simulação simples: aceitar qualquer usuário com senha >= 4
    if (!email || password.length < 4) {
      setError('Email ou senha inválidos (senha precisa ter ao menos 4 caracteres)');
      return;
    }
    // Simular login e redirecionar
    // Em app real: chamar API, guardar token, etc.
    localStorage.setItem('mock_user', JSON.stringify({ email }));
    navigate('/home');
  }

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={handleSubmit}>
        <h2>Entrar</h2>
        {error && <div className="login-error">{error}</div>}
        <label>
          Email
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        </label>
        <label>
          Senha
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        </label>
        <button type="submit" className="btn">Entrar</button>
      </form>
    </div>
  );
}
