import '../styles/style.css';
import React from 'react';
import { useEffect } from 'react';
import '../styles/dashboard.css';

const PageDashboard = () => {
    useEffect(() => {
    document.title = 'C.S.E. - IRMÃ ADELAIDE | Dashboard';
    }, []);
  return (
    <div>
      <h1>Dashboard</h1>
      <h2>Bem-vindo ao Dashboard!</h2>
      <h2></h2>
    </div>
  );
};

export default PageDashboard;