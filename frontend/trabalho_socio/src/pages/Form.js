import '../styles/Login.css';
import React from 'react';
import { useEffect } from 'react';
import Login from '../components/Login';

const PageFormulario = () => {
  useEffect(() => {
      document.title = 'C.E.S. - Irmã Adelaide | Inscrição';
    }, []);
  return (
    <div>/
      <Login />
    </div>
  );
};

export default PageFormulario;