import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import InputMask from 'react-input-mask'; 

import '../styles/Login.css';
import '../styles/cadastro.css';

import brasao from '../assets/brasao.png';
import instituto from '../assets/instituto.png';
import sagrado from '../assets/Sagrado.png';

const Login = () => {
  const navigate = useNavigate();
  
  // Estado para controlar se é login de Admin ou Usuário Comum
  const [isAdminMode, setIsAdminMode] = useState(false);
  
  const [cpf, setCpf] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    document.body.classList.add('cadastro-page-active');
    // Muda o título da aba dependendo do modo
    document.title = isAdminMode 
        ? 'C.S.E. - Irmã Adelaide | Login Administrativo' 
        : 'C.S.E. - Irmã Adelaide | Login Participante';

    return () => {
      document.body.classList.remove('cadastro-page-active');
    };
  }, [isAdminMode]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!cpf || !senha) {
      setError('Por favor, preencha o CPF e a senha.');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cpf, senha }),
      });

      if (response.ok) {
        const data = await response.json();

        // --- NOVA VALIDAÇÃO DE SEGURANÇA ---
        // Se estiver no modo Admin, mas o usuário for 'comum', BLOQUEIA.
        if (isAdminMode && data.tipo === 'comum') {
            setError('Acesso negado. Esta área é exclusiva para administradores.');
            return; // Não salva o token e não loga
        }
        // -----------------------------------
        
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('userType', data.tipo); 
        localStorage.setItem('userName', data.nome);

        // Redirecionamento
        if (data.tipo === 'Master' || data.tipo === 'Admin') {
            navigate('/dashboard');
        } else {
            navigate('/painel-usuario'); 
        }
        
      } else {
        const data = await response.json();
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

      <div className="login-form-container" style={{ 
          border: isAdminMode ? '2px solid #FEBF00' : '1px solid rgba(255,255,255,0.18)', // Destaque dourado no admin
          transition: 'all 0.3s ease'
      }}>
        
        <h1 className="cadastro-title" style={{ color: isAdminMode ? '#FEBF00' : '#fff' }}>
            {isAdminMode ? 'Acesso Administrativo' : 'Área do Participante'}
        </h1>

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="cpf" className="cadastro-label">CPF</label>
            <InputMask 
                mask="999.999.999-99" 
                maskChar={null}
                id="cpf" 
                name="cpf" 
                className="input" 
                placeholder="Digite seu CPF" 
                value={cpf} 
                onChange={(e) => setCpf(e.target.value)} 
            />
          </div>
          <div className="form-group">
            <label htmlFor="senha" className="cadastro-label">Senha</label>
            <input 
                type="password" 
                id="senha" 
                name="senha" 
                className="input" 
                placeholder="Digite sua senha" 
                value={senha} 
                onChange={(e) => setSenha(e.target.value)} 
            />
          </div>
          
          {error && <p className="error-message" style={{textAlign: 'center', fontWeight: 'bold'}}>{error}</p>}
          
          <button type="submit" className="submit-button login-button" style={{
              backgroundColor: isAdminMode ? '#FEBF00' : '#28a745', // Botão muda de cor
              color: isAdminMode ? '#5c0017' : '#fff',
              borderColor: isAdminMode ? '#FEBF00' : '#28a745'
          }}>
              {isAdminMode ? 'Entrar como Admin' : 'Entrar'}
          </button>
        </form>

        {/* Links de Rodapé do Card */}
        <div style={{ marginTop: '25px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            
            {!isAdminMode && (
                <span className="signup-link">
                    Não tem uma conta? <Link to="/cadastro">Cadastre-se</Link>
                </span>
            )}

            {/* --- BOTÃO DE TROCA DE MODO --- */}
            <button 
                onClick={() => {
                    setIsAdminMode(!isAdminMode);
                    setError(''); // Limpa erros ao trocar
                    setCpf('');
                    setSenha('');
                }}
                style={{
                    background: 'none',
                    border: 'none',
                    color: isAdminMode ? '#fff' : '#FEBF00', // Cor inversa ao título
                    textDecoration: 'underline',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    marginTop: '10px'
                }}
            >
                {isAdminMode ? '← Voltar para Área do Participante' : 'Sou Coordenador / Administrador'}
            </button>
        </div>

      </div>

      <div className="back-button-container">
        <button className="back-button" onClick={() => navigate('/')}>
          Voltar ao Início
        </button>
      </div>
    </div>
  );
};

export default Login;