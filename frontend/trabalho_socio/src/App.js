import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Home from './pages/Home';
import PageFormulario from './pages/Form';
import NotFound from './pages/NotFound';
import PageDashboard from './pages/Dashboard';
import Login from './pages/Login';
import Cadastro from './pages/Cadastro';
import Creditos from './pages/Creditos';
import Perfil from './pages/Perfil';
import ListaParticipantes from './pages/ListaParticipantes';
import ProtectedRoute from './components/ProtectedRoute';
import PainelUsuario from './pages/PainelUsuario';
import EditarPerfil from './pages/EditarPerfil';
import GerenciarUsuarios from './pages/GerenciarUsuarios';
import GerenciarEventos from './pages/GerenciarEventos';
import CadastroAdmin from './pages/CadastroAdmin'; // <--- IMPORTANTE: Importe o componente

function App() {
  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} theme="dark" />
      <BrowserRouter>
        <Routes>
          <Route path="*" element={<NotFound />} />
          <Route path="/" element={<Home />} />
          <Route path="/form" element={<PageFormulario />} />
          <Route path="/dashboard" element={<PageDashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/cadastro" element={<Cadastro />} />
          <Route path="/creditos" element={<Creditos />} />
          <Route path="/perfil/:id" element={<Perfil />} />
          
          {/* ROTAS PROTEGIDAS DE ADMIN/MASTER */}
          <Route element={<ProtectedRoute allowedTypes={['Admin', 'Master']} />}>
             <Route path="/participantes" element={<ListaParticipantes />} />
             <Route path="/gerenciar-usuarios" element={<GerenciarUsuarios />} />
             <Route path="/gerenciar-eventos" element={<GerenciarEventos />} />
             <Route path="/cadastro-admin" element={<CadastroAdmin />} /> {/* <--- ROTA ADICIONADA */}
          </Route>
  
          {/* ROTAS DE USUÁRIO COMUM */}
          <Route element={<ProtectedRoute allowedTypes={['comum']} />}>
             <Route path="/painel-usuario" element={<PainelUsuario />} />
             <Route path="/editar-perfil" element={<EditarPerfil />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;