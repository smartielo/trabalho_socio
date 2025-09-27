import '../styles/style.css';
import React from 'react';
import { useEffect } from 'react';

const Dashboard = () => {
    useEffect(() => {
    document.title = 'C.S.E. - IRMÃ ADELAIDE | Dashboard';
    }, []);
  return (
    <div>
      <h1>Dashboard</h1>
      <h2>Bem-vindo ao Dashboard!</h2>
    </div>
  );
};

export default Dashboard;