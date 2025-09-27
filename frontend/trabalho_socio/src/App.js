import logo from './logo.svg';
import './App.css';
import Login from './pages/Login';
import { BrowserRouter, Routes, Route, Form } from 'react-router-dom';
import Home from './pages/Home';

function App() {
  return (
    // O BrowserRouter é o componente que "liga" o roteamento na sua aplicação.
    // Ele deve envolver toda a lógica de rotas.
    <BrowserRouter>
      {/* Aqui dentro você pode colocar componentes que aparecem em todas as páginas, como Header e Footer */}
      
      {/* O componente Routes funciona como um "switch". Ele olha a URL atual
          e renderiza a primeira rota <Route> que corresponder. */}
      <Routes>
        {/* Cada <Route> é uma regra. */}
        {/* path="/" define a URL. */}
        {/* element={...} define qual componente será renderizado para essa URL. */}
        <Route path="/" element={<Home />} />
        <Route path="/form" element={<Form />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
