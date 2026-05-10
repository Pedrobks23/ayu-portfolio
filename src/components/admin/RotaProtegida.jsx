import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

export default function RotaProtegida({ children }) {
  const { loggedIn, loading } = useAuth();
  if (loading) return null;
  if (!loggedIn) return <Navigate to="/painel-ayume/login" replace />;
  return children;
}
