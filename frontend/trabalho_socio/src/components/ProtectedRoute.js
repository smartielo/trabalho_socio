import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ allowedTypes }) => {
  const token = localStorage.getItem('token');
  const userType = localStorage.getItem('userType'); // 'Admin', 'Master' ou 'comum'

  // 1. Se não tiver token, manda pro Login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // 2. Se tiver token, mas o tipo de usuário não for permitido para esta rota
  // (Ex: usuário comum tentando acessar página de admin)
  if (allowedTypes && !allowedTypes.includes(userType)) {
    alert('Acesso não autorizado para o seu nível de usuário.');
    return <Navigate to="/" replace />; // Ou para uma página de "Acesso Negado"
  }

  // 3. Se passou, renderiza a página solicitada (Outlet)
  return <Outlet />;
};

export default ProtectedRoute;