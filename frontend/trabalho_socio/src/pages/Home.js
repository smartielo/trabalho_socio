import { useEffect } from 'react';
import React from 'react';
import Login from '../components/Login';

const Home = () => {
  useEffect(() => {
    document.title = 'C.S.E. - Irmã Adelaide | Home';
  }, []);
  return (
    <div>
      <h1>Página Inicial</h1>
      <p>Bem-vindo ao site da nossa fundação!</p>
    </div>
  );
};

export default Home;