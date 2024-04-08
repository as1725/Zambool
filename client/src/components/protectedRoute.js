import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ component: Component, ...rest }) => {
  const authenticateToken = localStorage.getItem('token'); // or however you manage your auth state

  if (!authenticateToken) {
    console.log("NOT AUTHENTICATED: redirecting back to login");
    return <Navigate to="/" replace />;
  }

  return <Component {...rest} />;
};

export default ProtectedRoute;