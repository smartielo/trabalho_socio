// src/pages/Dashboard/Dashboard.js

import React from 'react'; // Adicionei a importação do React
import { Link } from 'react-router-dom';
import '../styles/dashboard.css';

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
const dashboardData = {
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
  labels: dashboardData.encaminhamentosData.labels,
  datasets: [
    {
      label: 'Origem',
      data: dashboardData.encaminhamentosData.values,
      backgroundColor: [
        'rgba(255, 99, 132, 0.7)',
        'rgba(54, 162, 235, 0.7)',
        'rgba(255, 206, 86, 0.7)',
        'rgba(75, 192, 192, 0.7)',
        'rgba(153, 102, 255, 0.7)',
      ],
      borderColor: [
        'rgba(255, 99, 132, 1)',
        'rgba(54, 162, 235, 1)',
        'rgba(255, 206, 86, 1)',
        'rgba(75, 192, 192, 1)',
        'rgba(153, 102, 255, 1)',
      ],
      borderWidth: 1,
    },
  ],
};

// Dados para o Gráfico de Barras (Bar) - AGORA DE PÚBLICO ALVO
const barData = {
  labels: dashboardData.publicoAlvoData.labels,
  datasets: [
    {
      label: 'Número de Participantes',
      data: dashboardData.publicoAlvoData.values,
      backgroundColor: 'rgba(75, 192, 192, 0.7)',
      borderColor: 'rgba(75, 192, 192, 1)',
      borderWidth: 1,
    },
  ],
};

// Opções para o Gráfico de Barras
const barOptions = {
  scales: {
    y: {
      beginAtZero: true
    }
  },
  plugins: {
    legend: {
      display: false // Não precisa de legenda para uma barra só
    }
  }
};


const PageDashboard = () => {
  const availableSlots = dashboardData.capacity - dashboardData.totalParticipants;

  return (
    <div className="dashboard-container">
      
      <div className="dashboard-header">
        <h1>Dashboard Administrativo</h1>
        <Link to="/cadastro" className="btn-primary">
          + Nova Matrícula
        </Link>
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
        <input type="text" placeholder="Digite o nome ou CPF..." />
        <button type="button">Buscar</button>
      </div>

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
            <Doughnut data={doughnutData} />
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

    </div>
  );
};

export default PageDashboard;