import logo from './logo.svg';
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Home from './pages/Home';
//import About from './pages/About';
//import Cadastro from './pages/Cadastro';
//import Login from './pages/Login';
//import Formulario from './pages/Formulario';
//import Contact from './pages/Contact';

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
      </Routes>
    </BrowserRouter>
  );
}

export default App;
