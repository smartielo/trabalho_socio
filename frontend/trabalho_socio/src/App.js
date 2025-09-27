import logo from './logo.svg';
import './styles/style.css';
import Login from './components/Login';
import { BrowserRouter, Routes, Route, Form } from 'react-router-dom';
import Home from './pages/Home';
import PageLogin from './pages/pageLogin';
import Dashboard from './pages/Dashboard';
import PageFormulario from './pages/Form';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/form" element={<PageFormulario />} />
        <Route path="/login" element={<PageLogin />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
