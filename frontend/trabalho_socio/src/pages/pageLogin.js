import '../styles/Login.css';
import React from 'react';
import { useEffect } from 'react';
import Login from '../components/Login';

const PageLogin = () => {
  useEffect(() => {
      document.title = 'C.S.E. - Irmã Adelaide | Login';
    }, []);
  return (
    <div>
      <Login />
    </div>
  );
};

export default PageLogin;