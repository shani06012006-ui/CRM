//src/components/Auth/ProtectedRoute.tsx

import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};