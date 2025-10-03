import React from 'react';
import { Link } from 'react-router-dom'; 
import '../styles/NotFound.css'; 
import { useEffect } from 'react';

const NotFound = () => {
    useEffect(() => {
        document.title = 'C.S.E. - Irmã Adelaide | Not Found';
      }, []);
  return (
    <div className="not-found-container">
      <h1>404</h1>
      <h2>Página Não Encontrada</h2>
      <p>
        Desculpe, a página que você está procurando não existe ou foi movida.
      </p>
      <Link to="/" className="home-button">
        Voltar para a Página Inicial
      </Link>
    </div>
  );
};

export default NotFound;