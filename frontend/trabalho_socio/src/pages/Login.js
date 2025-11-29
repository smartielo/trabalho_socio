import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import InputMask from 'react-input-mask'; 
import { toast } from 'react-toastify';
import Loading from '../components/Loading'; // Importa o Loading

import '../styles/Login.css';
import '../styles/cadastro.css';

import brasao from '../assets/brasao.png';
import instituto from '../assets/instituto.png';
import sagrado from '../assets/Sagrado.png';

const Login = () => {
  const navigate = useNavigate();
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [cpf, setCpf] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false); // Novo estado
  
  // Modal de Reset
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetCpf, setResetCpf] = useState('');

  useEffect(() => {
    document.body.classList.add('cadastro-page-active');
    document.title = isAdminMode 
        ? 'C.S.E. - Login Administrativo' 
        : 'C.S.E. - Login Participante';

    return () => {
      document.body.classList.remove('cadastro-page-active');
    };
  }, [isAdminMode]);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!cpf || !senha) {
      toast.warn('Por favor, preencha CPF e senha.');
      return;
    }

    setLoading(true); // Ativa o spinner

    try {
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cpf, senha }),
      });

      if (response.ok) {
        const data = await response.json();

        if (isAdminMode && data.tipo === 'comum') {
            toast.error('Acesso negado. Área exclusiva para administradores.');
            setLoading(false); // Desativa spinner
            return;
        }
        
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('userType', data.tipo); 
        localStorage.setItem('userName', data.nome);

        toast.success(`Bem-vindo(a), ${data.nome}!`);

        if (data.tipo === 'Master' || data.tipo === 'Admin') {
            navigate('/dashboard');
        } else {
            navigate('/painel-usuario'); 
        }
        // Não precisa setLoading(false) aqui porque vai navegar para outra página
        
      } else {
        const data = await response.json();
        toast.error(data.msg || 'CPF ou senha inválidos.');
        setLoading(false);
      }
    } catch (err) {
      toast.error('Falha na conexão com o servidor.');
      setLoading(false);
    }
  };

  const handleResetRequest = async () => {
      if (!resetCpf) return toast.warn("Digite seu CPF para recuperar a senha.");
      
      try {
          const response = await fetch('http://localhost:5000/api/reset-password-request', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ cpf: resetCpf })
          });
          
          const data = await response.json();
          if (response.ok) {
              toast.success(data.msg);
              setShowResetModal(false);
              setResetCpf('');
          } else {
              toast.error(data.msg);
          }
      } catch (error) {
          toast.error("Erro ao solicitar recuperação.");
      }
  };

  return (
    <div className="app-container">
      
      {/* Loading fora do container para não cortar */}
      {loading && <Loading message="Autenticando..." />}

      <header className="cadastro-header">
        <img src={brasao} alt="Brasão" className="header-brasao" />
        <div className="header-divider" />
        <div className="header-logos-instituto">
          <img src={instituto} alt="Instituto" className="header-instituto" />
          <img src={sagrado} alt="Sagrado" className="header-sagrado" />
        </div>
      </header>

      <div className="login-form-container" style={{ 
          border: isAdminMode ? '2px solid #FEBF00' : '1px solid rgba(255,255,255,0.18)'
      }}>
        
        <h1 className="cadastro-title" style={{ color: isAdminMode ? '#FEBF00' : '#fff' }}>
            {isAdminMode ? 'Acesso Administrativo' : 'Área do Participante'}
        </h1>

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="cadastro-label">CPF</label>
            <InputMask 
                mask="999.999.999-99" 
                maskChar={null}
                className="input" 
                placeholder="Digite seu CPF" 
                value={cpf} 
                onChange={(e) => setCpf(e.target.value)} 
            />
          </div>
          <div className="form-group">
            <label className="cadastro-label">Senha</label>
            <input 
                type="password" 
                className="input" 
                placeholder="Digite sua senha" 
                value={senha} 
                onChange={(e) => setSenha(e.target.value)} 
            />
          </div>
          
          <button type="submit" className="submit-button login-button" style={{
              backgroundColor: isAdminMode ? '#FEBF00' : '#28a745',
              color: isAdminMode ? '#5c0017' : '#fff',
              borderColor: isAdminMode ? '#FEBF00' : '#28a745'
          }} disabled={loading}>
              {isAdminMode ? 'Entrar como Admin' : 'Entrar'}
          </button>
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            
            <button onClick={() => setShowResetModal(true)} style={{background:'none', border:'none', color:'#ccc', textDecoration:'underline', cursor:'pointer'}}>
                Esqueci minha senha
            </button>

            {!isAdminMode && (
                <span className="signup-link">
                    Não tem uma conta? <Link to="/cadastro">Cadastre-se</Link>
                </span>
            )}

            <button 
                onClick={() => {
                    setIsAdminMode(!isAdminMode);
                    setCpf(''); setSenha('');
                }}
                style={{
                    background: 'none', border: 'none',
                    color: isAdminMode ? '#fff' : '#FEBF00',
                    textDecoration: 'underline', cursor: 'pointer', fontSize: '0.9rem', marginTop: '10px'
                }}
            >
                {isAdminMode ? '← Voltar para Área do Participante' : 'Sou Coordenador / Administrador'}
            </button>
        </div>
      </div>

      {/* MODAL RESET SENHA */}
      {showResetModal && (
          <div style={{position:'fixed', top:0, left:0, width:'100%', height:'100%', background:'rgba(0,0,0,0.8)', display:'flex', justifyContent:'center', alignItems:'center', zIndex:1000}}>
              <div style={{background:'#1b263b', padding:'30px', borderRadius:'10px', width:'90%', maxWidth:'400px', border:'1px solid #FEBF00'}}>
                  <h3 style={{color:'#fff', marginTop:0}}>Recuperar Senha</h3>
                  <p style={{color:'#ccc'}}>Informe seu CPF para solicitar o reset de senha ao administrador.</p>
                  <InputMask 
                    mask="999.999.999-99" 
                    className="input" 
                    placeholder="Seu CPF" 
                    value={resetCpf} 
                    onChange={(e) => setResetCpf(e.target.value)} 
                  />
                  <div style={{display:'flex', gap:'10px', marginTop:'20px'}}>
                      <button onClick={handleResetRequest} className="submit-button" style={{flex:1}}>Solicitar</button>
                      <button onClick={() => setShowResetModal(false)} className="submit-button" style={{flex:1, background:'#dc3545', borderColor:'#dc3545'}}>Cancelar</button>
                  </div>
              </div>
          </div>
      )}

      <div className="back-button-container">
        <button className="back-button" onClick={() => navigate('/')}>Voltar ao Início</button>
      </div>
    </div>
  );
};

export default Login;