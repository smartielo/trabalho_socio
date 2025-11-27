import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/dashboard.css';
import '../styles/cadastro.css';

import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const PageDashboard = () => {
  const navigate = useNavigate();
  
  // Estado para a busca
  const [searchTerm, setSearchTerm] = useState('');
  
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Função para buscar dados do Dashboard
  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    const token = localStorage.getItem('token');

    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/dashboard', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });

      if (response.ok) {
        const data = await response.json();
        setDashboardData(data);
      } else {
        setError('Sessão expirada.');
        localStorage.removeItem('token');
        navigate('/login');
      }
    } catch (err) {
      setError('Erro de conexão.');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  // --- NOVA FUNÇÃO: GERAR CSV ---
  const handleExportCSV = async () => {
    const token = localStorage.getItem('token');
    try {
      // 1. Busca todos
      const response = await fetch('http://localhost:5000/api/participantes/todos', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) throw new Error('Erro ao baixar dados');
      
      const listaCompleta = await response.json();

      // --- ALTERAÇÃO: REMOVIDO O FILTRO DE APROVADOS ---
      // Agora usamos a listaCompleta diretamente
      if (listaCompleta.length === 0) {
        alert("Nenhum participante para exportar.");
        return;
      }

      // 3. Pega Data e Hora atuais
      const agora = new Date();
      const dataHoraGeracao = agora.toLocaleString('pt-BR');

      // 4. Define o Cabeçalho do CSV
      const headers = [
        "ID", "Nome Completo", "Status", "CPF", "Nascimento", "Sexo", "Telefone", 
        "Situação Escolar", "Renda Familiar", "Chefe Família"
      ];

      // 5. Monta o CSV com metadados no topo
      // Adicionei a coluna Status para facilitar a visualização no Excel
      const csvRows = [
        `Relatório Geral de Participantes (Todos os Status);;;;;;;;;`, // Título
        `Gerado em: ${dataHoraGeracao};;;;;;;;;`,       // Data/Hora
        ``, // Linha em branco
        headers.join(';'), // Cabeçalho das colunas
        ...listaCompleta.map(p => [
          p.id,
          `"${p.nomeCompleto}"`,
          p.status ? p.status.toUpperCase() : 'PENDENTE', // Mostra o status no CSV
          `"${p.cpf}"`,
          p.dataNascimento,
          p.sexo,
          `"${p.telefoneContato || ''}"`,
          p.situacao_escolar,
          `"${p.rendaFamiliar}"`,
          p.chefeFamilia
        ].join(';'))
      ];

      // 6. Cria o arquivo e força o download
      const csvString = "\uFEFF" + csvRows.join('\n');
      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      
      const dataArquivo = agora.toISOString().slice(0,10); 
      link.setAttribute('download', `relatorio_geral_participantes_${dataArquivo}.csv`); // Nome do arquivo atualizado
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (error) {
      alert("Erro ao gerar planilha: " + error.message);
    }
  };

  if (loading && !dashboardData) return <div className="dashboard-container"><h1 style={{color:'#fff'}}>Carregando...</h1></div>;
  if (error) return <div className="dashboard-container"><h1 style={{color:'#fff'}}>{error}</h1></div>;

  // Preparação dos Gráficos
  const doughnutData = {
    labels: dashboardData?.encaminhamentosData?.labels || [],
    datasets: [{
      label: 'Origem',
      data: dashboardData?.encaminhamentosData?.values || [],
      backgroundColor: ['rgba(255, 140, 0, 0.8)', 'rgba(255, 215, 0, 0.8)', 'rgba(236, 64, 122, 0.8)', 'rgba(30, 136, 229, 0.8)', 'rgba(0, 200, 83, 0.8)'],
      borderColor: ['#FF8C00', '#FFD700', '#EC407A', '#1E88E5', '#00C853'],
      borderWidth: 1,
    }],
  };

  const barData = {
    labels: dashboardData?.publicoAlvoData?.labels || [],
    datasets: [{
      label: 'Participantes',
      data: dashboardData?.publicoAlvoData?.values || [],
      backgroundColor: '#ffae00ff',
      borderColor: '#ffa600ff',
      borderWidth: 1,
    }],
  };

  const barOptions = {
    scales: { y: { beginAtZero: true, ticks: { color: '#fff' } }, x: { ticks: { color: '#fff' } } },
    plugins: { legend: { display: false } }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Dashboard Administrativo</h1>
        
        <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={fetchDashboardData} className="submit-button" style={{ padding: '10px 15px', fontSize: '0.9rem', backgroundColor: '#1E88E5', borderColor: '#1E88E5' }}>
                🔄 Atualizar
            </button>
            
            {/* BOTÃO DE PLANILHA */}
            <button onClick={handleExportCSV} className="submit-button" style={{ padding: '10px 15px', fontSize: '0.9rem', backgroundColor: '#28a745', borderColor: '#28a745' }}>
                📊 Baixar Planilha
            </button>

            <Link to="/cadastro" className="submit-button" style={{ textDecoration: 'none', textAlign: 'center', padding: '10px 15px', fontSize: '0.9rem' }}>
                + Nova Matrícula
            </Link>
            <button onClick={handleLogout} className="submit-button" style={{ padding: '10px 15px', fontSize: '0.9rem', backgroundColor: '#dc3545', borderColor: '#dc3545' }}>
                Sair
            </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="kpi-grid">
        <div className="kpi-card"><h2>{dashboardData.totalParticipants}</h2><p>Total Ativos</p></div>
        <div className="kpi-card warning"><h2>{dashboardData.pendingRegistrations}</h2><p>Pendentes</p></div>
        <div className="kpi-card danger"><h2>{dashboardData.priorityAudience}</h2><p>Público Prioritário</p></div>
        <div className="kpi-card danger"><h2>{dashboardData.familiasPNE}</h2><p>Famílias PNE</p></div>
      </div>

      {/* Widget de Busca FUNCIONAL */}
      <div className="search-widget">
        <h3>Buscar Participante</h3>
        <input 
            type="text" 
            placeholder="Digite o nome ou CPF..." 
            className="input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && navigate(`/participantes?q=${searchTerm}`)}
        />
        <button 
            type="button" 
            className="submit-button"
            onClick={() => navigate(`/participantes?q=${searchTerm}`)}
        >
            Buscar
        </button>
        
        {/* Botão para ver todos */}
        <button 
            type="button" 
            className="submit-button"
            onClick={() => navigate('/participantes')}
        >
            Ver Todos
        </button>
      </div>

      {/* Listas */}
      <div className="dashboard-row">
         <div className="dashboard-widget list-widget">
          <h3>Últimas Matrículas</h3>
          <ul>
            {dashboardData.recentRegistrations.map(item => (
              <li key={item.id} className="list-item">
                <strong>{item.name}</strong>
                <span>{item.date}</span>
                <Link to={`/perfil/${item.id}`}>Ver Perfil</Link> 
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Gráficos */}
      <div className="dashboard-row">
        <div className="dashboard-widget chart-widget">
          <h3>Origem dos Encaminhamentos</h3>
          <div className="chart-container">
            <Doughnut data={doughnutData} options={{ plugins: { legend: { labels: { color: '#fff' } } } }} />
          </div>
        </div>
        <div className="dashboard-widget chart-widget">
          <h3>Participantes por Sexo</h3>
          <div className="chart-container">
            <Bar data={barData} options={barOptions} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageDashboard;