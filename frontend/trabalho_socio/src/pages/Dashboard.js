import { Link } from 'react-router-dom';
import '../styles/dashboard.css';

// 1. IMPORTAÇÕES DE GRÁFICOS COMENTADAS TEMPORARIAMENTE
// import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
// import { Doughnut, Bar } from 'react-chartjs-2';

// 2. REGISTRO DO CHART.JS COMENTADO TEMPORARIAMENTE
// ChartJS.register(
//   ArcElement,
//   Tooltip,
//   Legend,
//   CategoryScale,
//   LinearScale,
//   BarElement,
//   Title
// );

// --- DADOS FICTÍCIOS (MOCK) ---
const dashboardData = {
  totalParticipants: 87,
  capacity: 120,
  pendingRegistrations: 5,
  priorityAudience: 23,
  recentRegistrations: [
    { id: 1, name: 'João Silva', date: '25/10/2025' },
    { id: 2, name: 'Maria Souza', date: '24/10/2025' },
    { id: 3, name: 'Pedro Alves', date: '24/10/2025' },
  ],
  pendingTasks: [
    { id: 4, name: 'Ana Costa', task: 'Falta CPF do responsável' },
    { id: 7, name: 'Carlos Lima', task: 'Endereço incompleto' },
    { id: 5, name: 'Lucas Martins', task: 'Revisar ficha escolar' },
  ],
  ageData: {
    labels: ['Crianças', 'Adolescentes'],
    values: [55, 32],
  },
  schoolData: {
    labels: ['Frequenta Escola', 'Não Frequenta'],
    values: [80, 7],
  }
};
// ------------------------------

// 3. PREPARAR os dados para os gráficos

// Dados para o Gráfico de Pizza (Doughnut)
const doughnutData = {
  labels: dashboardData.ageData.labels,
  datasets: [
    {
      label: '# de Participantes',
      data: dashboardData.ageData.values,
      backgroundColor: [
        'rgba(255, 99, 132, 0.7)',
        'rgba(54, 162, 235, 0.7)',
      ],
      borderColor: [
        'rgba(255, 99, 132, 1)',
        'rgba(54, 162, 235, 1)',
      ],
      borderWidth: 1,
    },
  ],
};

// Dados para o Gráfico de Barras (Bar)
const barData = {
  labels: dashboardData.schoolData.labels,
  datasets: [
    {
      label: 'Status Escolar',
      data: dashboardData.schoolData.values,
      backgroundColor: 'rgba(75, 192, 192, 0.7)',
      borderColor: 'rgba(75, 192, 192, 1)',
      borderWidth: 1,
    },
  ],
};

// Opções para o Gráfico de Barras (para não começar do 0 se quiser)
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

      {/* --- KPIs (Indicadores-Chave) --- */}
      <div className="kpi-grid">
        {/* ... (os 4 kpi-cards continuam iguais) ... */}
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
      </div>

      {/* --- Widget de Busca --- */}
      <div className="search-widget">
         {/* ... (o widget de busca continua igual) ... */}
        <h3>Buscar Participante</h3>
        <input type="text" placeholder="Digite o nome ou CPF..." />
        <button type="button">Buscar</button>
      </div>

      {/* --- Listas de Ação --- */}
      <div className="dashboard-row">
        {/* ... (Os dois list-widgets continuam iguais) ... */}
         <div className="dashboard-widget list-widget">
          <h3>Pendências para Revisão</h3>
          <ul>
            {dashboardData.pendingTasks.map(item => (
              <li key={item.id} className="list-item">
                <strong>{item.name}</strong>
                <span>{item.task}</span>
                <Link to={`/cadastro/${item.id}`}>Corrigir</Link>
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
                <Link to={`/perfil/${item.id}`}>Ver</Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* --- 4. SUBSTITUIR os placeholders pelos gráficos --- */}
      <div className="dashboard-row">
        
        {/* Gráfico de Faixa Etária */}
        <div className="dashboard-widget chart-widget">
          <h3>Participantes por Faixa Etária</h3>
          <div className="chart-placeholder">
            Gráfico desativado temporariamente.
          </div>
        </div>

        {/* Gráfico de Status Escolar */}
        <div className="dashboard-widget chart-widget">
          <h3>Status Escolar</h3>
          <div className="chart-placeholder">
            Gráfico desativado temporariamente.
          </div>
        </div>
      </div>

    </div>
  );
};

export default PageDashboard;