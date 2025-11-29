import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/cadastro.css'; 
import brasao from '../assets/brasao.png';
import instituto from '../assets/instituto.png';
import sagrado from '../assets/Sagrado.png';

const GerenciarEventos = () => {
  const navigate = useNavigate();
  
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('lista'); 

  const [formData, setFormData] = useState({
    id: null,
    titulo: '',
    descricao: '',
    local: '',
    categoria: '',
    imagem_url: '',
    data_inicio: '',
    data_fim: ''
  });

  const fetchEventos = async () => {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch('http://localhost:5000/api/admin/eventos', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
            setEventos(await response.json());
        }
    } catch (error) {
        console.error(error);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    document.body.classList.add('cadastro-page-active');
    fetchEventos();
    return () => document.body.classList.remove('cadastro-page-active');
  }, []);

  const handleNew = () => {
      setFormData({ id: null, titulo: '', descricao: '', local: '', categoria: '', imagem_url: '', data_inicio: '', data_fim: '' });
      setView('formulario');
  };

  const handleEdit = (evento) => {
      setFormData(evento);
      setView('formulario');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const method = formData.id ? 'PUT' : 'POST';
    const url = formData.id 
        ? `http://localhost:5000/api/admin/eventos/${formData.id}`
        : 'http://localhost:5000/api/admin/eventos';

    try {
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(formData)
        });
        if (response.ok) {
            alert('Salvo com sucesso!');
            fetchEventos();
            setView('lista');
        } else {
            alert('Erro ao salvar.');
        }
    } catch (error) { console.error(error); }
  };

  const handleDelete = async (id) => {
      if(!window.confirm("Tem certeza que deseja excluir este evento?")) return;
      const token = localStorage.getItem('token');
      try {
          await fetch(`http://localhost:5000/api/admin/eventos/${id}`, {
              method: 'DELETE',
              headers: { 'Authorization': `Bearer ${token}` }
          });
          fetchEventos();
      } catch (error) { alert('Erro ao excluir'); }
  };

  // Função auxiliar para formatar data
  const formatarData = (dataISO) => {
    if (!dataISO) return '';
    return new Date(dataISO).toLocaleString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric', 
      hour: '2-digit', minute: '2-digit'
    });
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

      <div className="cadastro-form-container" style={{ maxWidth: '1000px', width: '95%' }}>
        
        {view === 'lista' && (
            <>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px'}}>
                    <h1 className="cadastro-title" style={{margin: 0}}>Gerenciar Eventos</h1>
                    <div style={{display: 'flex', gap: '10px'}}>
                        <button onClick={handleNew} className="submit-button" style={{padding: '10px 20px', marginTop: 0}}>+ Novo Evento</button>
                        <button onClick={() => navigate('/dashboard')} className="submit-button" style={{padding: '10px 20px', marginTop: 0, background: '#555', borderColor: '#777'}}>Voltar</button>
                    </div>
                </div>

                <div style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
                    {loading ? <p style={{color: '#fff', textAlign: 'center'}}>Carregando...</p> : eventos.length === 0 ? <p style={{color: '#ccc', textAlign: 'center'}}>Nenhum evento cadastrado.</p> : eventos.map(evento => (
                        <div key={evento.id} style={{background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '10px', borderLeft: '5px solid #FEBF00', display: 'flex', flexDirection: 'column', gap: '10px'}}>
                            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px'}}>
                                <div>
                                    <h3 style={{color: '#FEBF00', margin: '0 0 5px 0', fontSize: '1.2rem'}}>{evento.titulo}</h3>
                                    <span style={{background: '#42a5f5', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem'}}>{evento.categoria || 'Geral'}</span>
                                </div>
                                <div>
                                    <button onClick={() => handleEdit(evento)} style={{cursor: 'pointer', marginRight: '15px', background: '#FEBF00', border: 'none', color: '#5c0017', padding: '5px 10px', borderRadius: '4px', fontWeight: 'bold'}}>Editar</button>
                                    <button onClick={() => handleDelete(evento.id)} style={{cursor: 'pointer', background: '#ef5350', border: 'none', color: '#fff', padding: '5px 10px', borderRadius: '4px', fontWeight: 'bold'}}>Excluir</button>
                                </div>
                            </div>
                            
                            {/* --- DATA E LOCAL ATUALIZADOS --- */}
                            <p style={{color: '#ccc', fontSize: '0.9rem', margin: 0}}>
                                📅 {formatarData(evento.data_inicio)}
                                {evento.data_fim ? ` até ${formatarData(evento.data_fim)}` : ''} 
                                {evento.local && ` | 📍 ${evento.local}`} 
                            </p>

                            <div style={{background: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: '5px'}}>
                                <p style={{color: '#fff', margin: '0 0 5px 0'}}><strong>👥 Inscritos ({evento.total_inscritos}):</strong></p>
                                {evento.participantes_lista.length > 0 ? (
                                    <div style={{maxHeight: '100px', overflowY: 'auto', fontSize: '0.9rem', color: '#ccc'}}>
                                        {evento.participantes_lista.map(p => <span key={p.id} style={{display: 'inline-block', marginRight: '10px'}}>• {p.nome}</span>)}
                                    </div>
                                ) : (
                                    <span style={{color: '#777', fontSize: '0.9rem'}}>Ninguém inscrito ainda.</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </>
        )}

        {view === 'formulario' && (
            <div style={{animation: 'fadeIn 0.3s ease'}}>
                <h2 style={{color: '#FEBF00', borderBottom: '1px solid #555', paddingBottom: '10px', marginBottom: '20px'}}>
                    {formData.id ? 'Editar Evento' : 'Criar Novo Evento'}
                </h2>
                
                <form onSubmit={handleSave}>
                    <div className="form-group">
                        <label className="cadastro-label">Título do Evento</label>
                        <input className="input" placeholder="Ex: Festa Junina" value={formData.titulo} onChange={e => setFormData({...formData, titulo: e.target.value})} required />
                    </div>

                    <div className="form-group">
                        <label className="cadastro-label">Descrição Detalhada</label>
                        <textarea className="input" placeholder="Descreva o evento..." value={formData.descricao} onChange={e => setFormData({...formData, descricao: e.target.value})} style={{height: '120px', resize: 'vertical', fontFamily: 'inherit'}} />
                    </div>

                    <div className="form-group-row">
                        <div className="form-group">
                            <label className="cadastro-label">Data/Hora Início</label>
                            <input className="input" type="datetime-local" value={formData.data_inicio} onChange={e => setFormData({...formData, data_inicio: e.target.value})} required />
                        </div>
                        <div className="form-group">
                            <label className="cadastro-label">Data/Hora Fim</label>
                            <input className="input" type="datetime-local" value={formData.data_fim} onChange={e => setFormData({...formData, data_fim: e.target.value})} />
                        </div>
                    </div>

                    <div className="form-group-row">
                         <div className="form-group">
                            <label className="cadastro-label">Local</label>
                            <input className="input" placeholder="Ex: Salão Paroquial" value={formData.local} onChange={e => setFormData({...formData, local: e.target.value})} />
                        </div>
                        <div className="form-group">
                            <label className="cadastro-label">Categoria</label>
                            <input className="input" placeholder="Ex: Esporte, Lazer" value={formData.categoria} onChange={e => setFormData({...formData, categoria: e.target.value})} />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="cadastro-label">URL da Imagem (Link)</label>
                        <input className="input" placeholder="http://..." value={formData.imagem_url} onChange={e => setFormData({...formData, imagem_url: e.target.value})} />
                    </div>
                    
                    <div style={{display: 'flex', justifyContent: 'flex-end', gap: '15px', marginTop: '30px'}}>
                        <button type="button" onClick={() => setView('lista')} className="submit-button" style={{background: 'transparent', border: '2px solid #ccc', color: '#ccc'}}>
                            Cancelar
                        </button>
                        <button type="submit" className="submit-button">
                            Salvar Evento
                        </button>
                    </div>
                </form>
            </div>
        )}

      </div>
    </div>
  );
};

export default GerenciarEventos;