import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import PageFormulario from './pages/Form';
import NotFound from './pages/NotFound';
import PageDashboard from './pages/Dashboard';
import Login from './pages/Login';
import Cadastro from './pages/Cadastro';
import Creditos from './pages/Creditos';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="*" element={<NotFound />} />
        <Route path="/" element={<Home />} />
        <Route path="/form" element={<PageFormulario />} />
        <Route path="/dashboard" element={<PageDashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/creditos" element={<Creditos />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
