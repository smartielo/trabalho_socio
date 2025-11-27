import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import InputMask from 'react-input-mask'; // Adicionado para máscaras
import '../styles/cadastro.css';
import brasao from '../assets/brasao.png';
import instituto from '../assets/instituto.png';
import sagrado from '../assets/Sagrado.png';

const EditarPerfil = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nomeCompleto: '',
    dataNascimento: '',
    sexo: '',
    rg: '',
    cpf: '', // Será ReadOnly
    nis: '',
    endereco: '',
    naturalidadeCidade: '',
    telefoneContato: '',
    nomeResponsavel: '',
    situacao_escolar: '',
    nome_escola: '',
    serie: '',
    rendaFamiliar: ''
  });

  useEffect(() => {
    document.body.classList.add('cadastro-page-active');
    const fetchDados = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch('http://localhost:5000/api/meu-perfil', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                
                // Ajusta data para formato do input date (yyyy-MM-dd)
                let dataNascFormatada = '';
                if(data.dataNascimento && data.dataNascimento.includes('/')) {
                    const [dia, mes, ano] = data.dataNascimento.split('/');
                    dataNascFormatada = `${ano}-${mes}-${dia}`;
                }

                setFormData({
                    ...data,
                    dataNascimento: dataNascFormatada,
                    // Garante que campos nulos venham como string vazia
                    nomeCompleto: data.nomeCompleto || '',
                    rg: data.rg || '',
                    nis: data.nis || '',
                    endereco: data.endereco || '',
                    telefoneContato: data.telefoneContato || '',
                    nomeResponsavel: data.nomeResponsavel || '',
                    nome_escola: data.nome_escola || '',
                    serie: data.serie || '',
                    rendaFamiliar: data.rendaFamiliar || ''
                });
            }
        } catch (err) { console.error(err); }
    };
    fetchDados();
    return () => document.body.classList.remove('cadastro-page-active');
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    if(window.confirm("Ao salvar, seu status voltará para 'Pendente' para que o administrador revise as mudanças. Confirmar?")) {
        try {
            const response = await fetch('http://localhost:5000/api/meu-perfil', {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                alert('Perfil atualizado e enviado para análise!');
                navigate('/painel-usuario');
            } else {
                alert('Erro ao atualizar.');
            }
        } catch (err) {
            alert('Erro de conexão.');
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

      <div className="cadastro-form-container" style={{ maxWidth: '800px' }}>
        <h1 className="cadastro-title">Editar Meus Dados</h1>
        <p style={{color: '#FEBF00', textAlign: 'center', marginBottom: '20px'}}>
            Atenção: Alterar seus dados resetará sua aprovação.
        </p>

        <form onSubmit={handleSubmit}>
            {/* BLOCO 1: PESSOAL */}
            <h3 className="form-section-title">Dados Pessoais</h3>
            <div className="form-group">
                <label className="cadastro-label">Nome Completo</label>
                <input type="text" name="nomeCompleto" className="input" value={formData.nomeCompleto} onChange={handleChange} />
            </div>

            <div className="form-group-row">
                <div className="form-group">
                    <label className="cadastro-label">CPF (Não editável)</label>
                    <input type="text" className="input" value={formData.cpf} disabled style={{backgroundColor: '#444', color: '#aaa', borderColor: '#555'}} />
                </div>
                <div className="form-group">
                    <label className="cadastro-label">Data Nascimento</label>
                    <input type="date" name="dataNascimento" className="input" value={formData.dataNascimento} onChange={handleChange} />
                </div>
            </div>

            <div className="form-group-row">
                <div className="form-group">
                    <label className="cadastro-label">RG</label>
                    <input type="text" name="rg" className="input" value={formData.rg} onChange={handleChange} />
                </div>
                <div className="form-group">
                     <label className="cadastro-label">NIS</label>
                     <input type="text" name="nis" className="input" value={formData.nis} onChange={handleChange} />
                </div>
            </div>

            {/* BLOCO 2: CONTATO E ENDEREÇO */}
            <h3 className="form-section-title">Contato</h3>
            <div className="form-group">
                <label className="cadastro-label">Endereço</label>
                <input type="text" name="endereco" className="input" value={formData.endereco} onChange={handleChange} />
            </div>
            <div className="form-group">
                <label className="cadastro-label">Telefone</label>
                <InputMask mask="(99) 99999-9999" className="input" name="telefoneContato" value={formData.telefoneContato} onChange={handleChange} />
            </div>

             {/* BLOCO 3: ESCOLA E FAMÍLIA */}
             <h3 className="form-section-title">Escola e Família</h3>
             <div className="form-group">
                <label className="cadastro-label">Escola</label>
                <input type="text" name="nome_escola" className="input" value={formData.nome_escola} onChange={handleChange} />
            </div>
            <div className="form-group-row">
                <div className="form-group">
                     <label className="cadastro-label">Série</label>
                     <input type="text" name="serie" className="input" value={formData.serie} onChange={handleChange} />
                </div>
                <div className="form-group">
                     <label className="cadastro-label">Renda Familiar</label>
                     <input type="text" name="rendaFamiliar" className="input" value={formData.rendaFamiliar} onChange={handleChange} />
                </div>
            </div>

            <div className="navigation-buttons" style={{ justifyContent: 'center', marginTop: '2rem', gap: '15px' }}>
                <button type="button" className="submit-button cancel-button" onClick={() => navigate('/painel-usuario')}>
                    Cancelar
                </button>
                <button type="submit" className="submit-button">
                    Salvar e Enviar para Análise
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default EditarPerfil;