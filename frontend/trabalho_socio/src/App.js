import React from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import './App.css';
import Login from './pages/Login';

function Home(){
  const navigate = useNavigate();
  function logout(){
    localStorage.removeItem('mock_user');
    navigate('/');
  }
  const user = JSON.parse(localStorage.getItem('mock_user') || 'null');
  return (
    <div className="App">
      <header className="App-header">
        <h2>Bem-vindo{user ? `, ${user.email}` : ''}!</h2>
        <p>Esse é um exemplo de página inicial após login.</p>
        <button onClick={logout}>Sair</button>
      </header>
    </div>
  )
}

function App(){
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login/>} />
        <Route path="/home" element={<Home/>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App;
