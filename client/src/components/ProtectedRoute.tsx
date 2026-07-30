import { Navigate, Outlet } from 'react-router-dom';
import { useUser } from '../hooks/useAuth';

export default function ProtectedRoute() {
  const { data: user, isLoading } = useUser();

  if (isLoading) {
    return <div className="h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
