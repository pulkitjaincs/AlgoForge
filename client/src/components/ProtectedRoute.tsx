import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useUser } from '../hooks/useAuth';
import { BookOpen } from 'lucide-react';

export default function ProtectedRoute() {
  const { data: user, isLoading } = useUser();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-bg-dark">
        <div className="p-4 bg-gradient-to-br from-brand-primary/20 to-brand-secondary/20 border border-brand-primary/20 rounded-2xl animate-pulse mb-4">
          <BookOpen className="w-8 h-8 text-brand-primary" />
        </div>
        <div className="h-2 w-24 bg-border-dark rounded-full overflow-hidden relative">
          <div className="absolute top-0 left-0 h-full w-1/2 bg-brand-primary rounded-full animate-bounce"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
