import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import PageFormulario from './pages/Form';
import NotFound from './pages/NotFound';
import PageDashboard from './pages/Dashboard';
import Login from './pages/Login';
import Cadastro from './pages/Cadastro';
import Creditos from './pages/Creditos';
import CadastroAdmin from './pages/CadastroAdmin';
import GerenciarUsuarios from './pages/GerenciarUsuarios';
import Perfil from './pages/Perfil';

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
        <Route path="/cadastro-admin" element={<CadastroAdmin />} />
        <Route path="/gerenciar-usuarios" element={<GerenciarUsuarios />} />
        <Route path="/perfil" element={<Perfil />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
