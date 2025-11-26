import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/cadastro.css';
import brasao from '../assets/brasao.png';
import instituto from '../assets/instituto.png';
import sagrado from '../assets/Sagrado.png';

const Perfil = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [p, setP] = useState(null); // p = participante (abreviação para facilitar)
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.body.classList.add('cadastro-page-active');
    const fetchParticipante = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/participantes/${id}`);
        if (response.ok) {
          const data = await response.json();
          setP(data);
        } else {
          alert('Participante não encontrado');
          navigate('/dashboard');
        }
      } catch (error) {
        console.error('Erro:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchParticipante();
    return () => document.body.classList.remove('cadastro-page-active');
  }, [id, navigate]);

  if (loading) return <div className="app-container"><h1 style={{color:'#fff'}}>Carregando...</h1></div>;
  if (!p) return null;

  // Estilo personalizado para os campos de leitura
  const readOnlyStyle = {
    backgroundColor: 'rgba(0, 0, 0, 0.3)', // Fundo escuro transparente
    color: '#fff', // Texto branco
    border: '1px solid #FEBF00', // Borda dourada fina
    padding: '10px',
    borderRadius: '8px',
    fontSize: '1rem',
    minHeight: '45px',
    display: 'flex',
    alignItems: 'center'
  };

  const labelStyle = {
    color: '#FEBF00', // Label dourado
    fontWeight: 'bold',
    marginBottom: '5px',
    display: 'block'
  };

  const SectionTitle = ({ title }) => (
    <h3 style={{ color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: '5px', marginTop: '20px' }}>
      {title}
    </h3>
  );

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

      <div className="cadastro-form-container" style={{ maxWidth: '900px' }}>
        <h1 className="cadastro-title">Ficha do Participante</h1>
        
        {/* --- DADOS PESSOAIS --- */}
        <SectionTitle title="Identificação" />
        <div className="form-group">
            <label style={labelStyle}>Nome Completo:</label>
            <div style={readOnlyStyle}>{p.nomeCompleto}</div>
        </div>
        
        <div className="form-group-row">
            <div className="form-group">
                <label style={labelStyle}>Data de Nascimento:</label>
                <div style={readOnlyStyle}>{p.dataNascimento}</div>
            </div>
            <div className="form-group">
                <label style={labelStyle}>Sexo:</label>
                <div style={readOnlyStyle}>{p.sexo}</div>
            </div>
            <div className="form-group">
                <label style={labelStyle}>CPF:</label>
                <div style={readOnlyStyle}>{p.cpf}</div>
            </div>
        </div>

        <div className="form-group">
             <label style={labelStyle}>Endereço:</label>
             <div style={readOnlyStyle}>{p.endereco || 'Não informado'}</div>
        </div>

        <div className="form-group-row">
             <div className="form-group">
                <label style={labelStyle}>Cidade/UF:</label>
                <div style={readOnlyStyle}>{p.naturalidadeCidade} - {p.ufNaturalidade}</div>
             </div>
             <div className="form-group">
                <label style={labelStyle}>Telefone:</label>
                <div style={readOnlyStyle}>{p.telefoneContato}</div>
             </div>
        </div>

        {/* --- RESPONSÁVEL --- */}
        <SectionTitle title="Responsável Legal" />
        <div className="form-group">
             <label style={labelStyle}>Nome do Responsável:</label>
             <div style={readOnlyStyle}>{p.nomeResponsavel}</div>
        </div>
        <div className="form-group-row">
             <div className="form-group">
                <label style={labelStyle}>CPF Responsável:</label>
                <div style={readOnlyStyle}>{p.cpfResponsavel}</div>
             </div>
             <div className="form-group">
                <label style={labelStyle}>RG Responsável:</label>
                <div style={readOnlyStyle}>{p.rgResponsavel}</div>
             </div>
        </div>

        {/* --- ESCOLA --- */}
        <SectionTitle title="Informações Escolares" />
        <div className="form-group-row">
             <div className="form-group">
                <label style={labelStyle}>Situação:</label>
                <div style={readOnlyStyle}>{p.situacao_escolar === 'frequenta' ? 'Frequenta Escola' : 'Não Frequenta'}</div>
             </div>
             <div className="form-group">
                <label style={labelStyle}>Escola:</label>
                <div style={readOnlyStyle}>{p.nome_escola || '-'}</div>
             </div>
        </div>
        <div className="form-group-row">
             <div className="form-group">
                <label style={labelStyle}>Série:</label>
                <div style={readOnlyStyle}>{p.serie || '-'}</div>
             </div>
             <div className="form-group">
                <label style={labelStyle}>Turno:</label>
                <div style={readOnlyStyle}>{p.turno || '-'}</div>
             </div>
        </div>

        {/* --- FAMÍLIA E RENDA --- */}
        <SectionTitle title="Dados Familiares e Sociais" />
        <div className="form-group-row">
             <div className="form-group">
                <label style={labelStyle}>Renda Familiar:</label>
                <div style={readOnlyStyle}>{p.rendaFamiliar}</div>
             </div>
             <div className="form-group">
                <label style={labelStyle}>Chefe de Família:</label>
                <div style={readOnlyStyle}>{p.chefeFamilia}</div>
             </div>
        </div>

        <div className="form-group">
             <label style={labelStyle}>Benefícios:</label>
             <div style={readOnlyStyle}>
                {p.beneficios && p.beneficios.length > 0 ? p.beneficios.join(', ') : 'Nenhum benefício informado'}
             </div>
        </div>

        {/* --- LISTA DE FAMILIARES --- */}
        {p.familiares && p.familiares.length > 0 && (
            <>
                <label style={labelStyle}>Composição Familiar:</label>
                <div style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', padding: '10px' }}>
                    {p.familiares.map((fam, idx) => (
                        <div key={idx} style={{ borderBottom: '1px solid #555', padding: '8px 0', color: '#fff', display: 'flex', justifyContent: 'space-between' }}>
                            <span><strong>{fam.nome}</strong> ({fam.parentesco})</span>
                            <span>{fam.idade ? `${fam.idade} anos` : '-'}</span>
                        </div>
                    ))}
                </div>
            </>
        )}

        {/* --- SAÚDE --- */}
        <SectionTitle title="Saúde" />
        <div className="form-group">
             <label style={labelStyle}>Medicamentos:</label>
             <div style={readOnlyStyle}>{p.medicamentoUso || 'Não usa'}</div>
        </div>
        <div className="form-group">
             <label style={labelStyle}>Alergias:</label>
             <div style={readOnlyStyle}>{p.alergiaDescricao || 'Não possui'}</div>
        </div>

        {/* --- BOTÃO --- */}
        <div className="navigation-buttons" style={{ marginTop: '2rem', justifyContent: 'center' }}>
            <button className="nav-button prev-button" onClick={() => navigate('/dashboard')} style={{ borderColor: '#fff', color: '#fff' }}>
            Voltar ao Dashboard
            </button>
        </div>
      </div>
    </div>
  );
};

export default Perfil;