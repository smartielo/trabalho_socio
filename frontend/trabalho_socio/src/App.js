import './styles/style.css';
import { BrowserRouter, Routes, Route, Form } from 'react-router-dom';
import Home from './pages/Home';
import PageLogin from './pages/pageLogin';
import PageDashboard from './pages/Dashboard';
import PageFormulario from './pages/Form';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/form" element={<PageFormulario />} />
        <Route path="/login" element={<PageLogin />} />
        <Route path="/dashboard" element={<PageDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
