// src/pages/Dashboard/Dashboard.js

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/dashboard.css'; // Estilos específicos do dashboard
import '../styles/cadastro.css'; // Importando para usar estilos de input e botão

// 1. IMPORTAÇÕES DE GRÁFICOS REATIVADAS
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';

// 2. REGISTRO DO CHART.JS REATIVADO
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

// --- DADOS FICTÍCIOS (MOCK) ATUALIZADOS COM BASE NO CADASTRO.JS ---
const mockDashboardData = { // --- ALTERAÇÃO: Renomeado para evitar conflito ---
  totalParticipants: 87,
  capacity: 120,
  pendingRegistrations: 5,
  priorityAudience: 23,
  familiasPNE: 18, // NOVO KPI: Baseado em 'familiaPossuiDeficiencia'
  recentRegistrations: [
    { id: 1, name: 'João Silva', date: '25/10/2025' },
    { id: 2, name: 'Maria Souza', date: '24/10/2025' },
    { id: 3, name: 'Pedro Alves', date: '24/10/2025' },
  ],
  pendingTasks: [
    { id: 4, name: 'Ana Costa', task: 'Falta CPF do responsável' },
    { id: 7, name: 'Carlos Lima', task: 'Endereço incompleto' },
    { id: 5, name: 'Lucas Martins', task: 'Revisar ficha escolar' },
    { id: 8, name: 'Juliana Paes', task: 'Revisar Ficha de Saúde (Alergia)' }, // NOVA TAREFA
  ],
  // NOVO GRÁFICO 1: Baseado em 'orgaoDemandante'
  encaminhamentosData: {
    labels: ['CRAS', 'CREAS', 'Conselho Tutelar', 'Demanda Espontânea', 'Outros'],
    values: [40, 15, 12, 10, 10], // Total 87
  },
  // NOVO GRÁFICO 2: Baseado em 'publico_alvo'
  publicoAlvoData: {
    labels: ['Crianças', 'Adolescentes', 'Jovens', 'Idosos'],
    values: [45, 25, 12, 5], // Total 87
  }
};
// ------------------------------

// 3. PREPARAR os dados para os gráficos

// Dados para o Gráfico de Pizza (Doughnut) - AGORA DE ENCAMINHAMENTOS
const doughnutData = {
  labels: mockDashboardData.encaminhamentosData.labels,
  datasets: [
    {
      label: 'Origem',
      data: mockDashboardData.encaminhamentosData.values,
      // NOVAS CORES VIBRANTES
      backgroundColor: [
        'rgba(255, 140, 0, 0.8)',   // Laranja Vibrante
        'rgba(255, 215, 0, 0.8)',   // Amarelo Dourado
        'rgba(236, 64, 122, 0.8)',  // Rosa Vibrante
        'rgba(30, 136, 229, 0.8)',  // Azul Elétrico
        'rgba(0, 200, 83, 0.8)',    // Verde Brilhante
      ],
      borderColor: [
        '#FF8C00',
        '#FFD700',
        '#EC407A',
        '#1E88E5',
        '#00C853',
      ],
      borderWidth: 1,
    },
  ],
};

// Dados para o Gráfico de Barras (Bar) - AGORA DE PÚBLICO ALVO
const barData = {
  labels: mockDashboardData.publicoAlvoData.labels,
  datasets: [
    {
      label: 'Número de Participantes',
      data: mockDashboardData.publicoAlvoData.values,
      backgroundColor: '#ffae00ff',
      borderColor: '#ffa600ff',
      borderWidth: 1,
    },
  ],
};

// Opções para o Gráfico de Barras
const barOptions = {
  scales: {
    y: { beginAtZero: true, ticks: { color: '#fff' } }, // Cor dos textos do eixo Y
    x: { ticks: { color: '#fff' } } // Cor dos textos do eixo X
  },
  plugins: {
    legend: {
      display: false, // Não precisa de legenda para uma barra só
      labels: { color: '#fff' } // Cor das legendas (se ativas)
    }
  }
};


const PageDashboard = () => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [searchResult, setSearchResult] = useState(null); // null | 'not_found' | { user_object }

  useEffect(() => {
    const fetchDashboardData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const response = await fetch('http://localhost:5000/api/dashboard', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          const data = await response.json();
          setDashboardData(data);
        } else {
          setError('Sessão inválida. Faça login novamente.');
          localStorage.removeItem('token');
          navigate('/login');
        }
      } catch (err) {
        setError('Falha ao carregar os dados do dashboard.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setSearchResult(null);
      return;
    }

    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:5000/api/participantes/search?q=${searchTerm}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setSearchResult(data);
      } else if (response.status === 404) {
        setSearchResult('not_found');
      } else {
        alert('Erro ao realizar a busca.');
      }
    } catch (err) {
      alert('Falha de conexão ao buscar participante.');
    }
  };

  // Enquanto os dados não chegam, pode-se exibir uma mensagem de carregamento
  if (loading) {
    return <div className="dashboard-container"><h1>Carregando dados do Dashboard...</h1></div>;
  }

  // Se houver um erro, exibe a mensagem de erro
  if (error) {
    return <div className="dashboard-container"><h1>{error}</h1></div>;
  }

  // Se dashboardData for null, retorna um container vazio para evitar erros
  if (!dashboardData) return <div className="dashboard-container"></div>;

  const availableSlots = dashboardData.capacity - dashboardData.totalParticipants;

  return (
    <div className="dashboard-container">
      
      <div className="dashboard-header">
        <h1>Dashboard Administrativo</h1>
        <div className="dashboard-header-actions">
          <Link to="/cadastro-admin" state={{ fromDashboard: true }} className="submit-button" style={{ textDecoration: 'none' }}>
            Cadastrar Administrador
          </Link>
          <Link to="/gerenciar-usuarios" state={{ fromDashboard: true }} className="submit-button" style={{ textDecoration: 'none' }}>
            Gerenciar Usuários
          </Link>
        </div>
      </div>

      {/* --- KPIs (Indicadores-Chave) - ADICIONADO +1 KPI --- */}
      <div className="kpi-grid kpi-grid-5"> {/* Use kpi-grid-5 se quiser 5 colunas, ou deixe como está e ele se ajusta */}
         <div className="kpi-card">
          <h2>{dashboardData.totalParticipants}</h2>
          <p>Total de Matrículas Ativas</p>
        </div>
        <div className="kpi-card">
          <h2>{availableSlots}</h2>
          <p>Vagas Disponíveis</p>
        </div>
        <div className="kpi-card warning">
          <h2>{dashboardData.pendingRegistrations}</h2>
          <p>Cadastros Pendentes</p>
        </div>
        <div className="kpi-card danger">
          <h2>{dashboardData.priorityAudience}</h2>
          <p>Em Público Prioritário</p>
        </div>
        {/* NOVO KPI */}
        <div className="kpi-card danger">
          <h2>{dashboardData.familiasPNE}</h2>
          <p>Famílias com PNE</p>
        </div>
      </div>

      {/* --- Widget de Busca --- */}
      <div className="search-widget">
        <h3>Buscar Participante</h3>
        <input 
          type="text" 
          placeholder="Digite o nome ou CPF..." 
          className="input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button type="button" className="submit-button" onClick={handleSearch}>Buscar</button>
      </div>

      {/* --- ALTERAÇÃO 4: Container para exibir o resultado da busca --- */}
      {searchResult && (
        <div className="search-result-widget">
          {searchResult === 'not_found' ? (
            <p>Participante não encontrado.</p>
          ) : (
            <div className="search-result-item"><strong>{searchResult.name}</strong> <Link to={`/perfil/${searchResult.id}`}>ver</Link></div>
          )}
        </div>
      )}

      {/* --- Listas de Ação --- */}
      <div className="dashboard-row">
         <div className="dashboard-widget list-widget">
          <h3>Pendências para Revisão</h3>
          <ul>
            {dashboardData.pendingTasks.map(item => (
              <li key={item.id} className="list-item">
                <strong>{item.name}</strong>
                <span>{item.task}</span>
                {/* O link de corrigir agora pode ser mais genérico ou apontar para uma página de edição */}
                <Link to={`/editar-cadastro/${item.id}`}>Corrigir</Link> 
              </li>
            ))}
          </ul>
        </div>
        
        <div className="dashboard-widget list-widget">
          <h3>Últimas Matrículas</h3>
          <ul>
            {dashboardData.recentRegistrations.map(item => (
              <li key={item.id} className="list-item">
                <strong>{item.name}</strong>
                <span>{item.date}</span>
                {/* O link para o perfil do usuário */}
                <Link to={`/perfil/${item.id}`}>Ver</Link> 
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* --- 4. GRÁFICOS REATIVADOS E ATUALIZADOS --- */}
      <div className="dashboard-row">
        
        {/* Gráfico de Encaminhamentos (Pizza) */}
        <div className="dashboard-widget chart-widget">
          <h3>Origem dos Encaminhamentos</h3>
          <div className="chart-container">
            <Doughnut data={doughnutData} options={{ plugins: { legend: { labels: { color: '#fff' } } } }} />
          </div>
        </div>

        {/* Gráfico de Público Alvo (Barras) */}
        <div className="dashboard-widget chart-widget">
          <h3>Participantes por Público Alvo</h3>
          <div className="chart-container">
            <Bar data={barData} options={barOptions} />
          </div>
        </div>
      </div>

      {/* --- ALTERAÇÃO 5: Botão de Voltar no final da página --- */}
      <div className="back-button-container" style={{ marginTop: '3rem' }}>
        <button className="back-button" onClick={() => navigate('/')}>
          Voltar
        </button>
      </div>

    </div>
  );
};

export default PageDashboard;