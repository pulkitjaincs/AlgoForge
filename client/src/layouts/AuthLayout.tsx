import { Outlet, Link, Navigate } from 'react-router-dom';
import { BookOpen, ArrowLeft } from 'lucide-react';
import { ThemeToggle } from '../components/shared/ThemeToggle';
import { useUser } from '../hooks/useAuth';

export default function AuthLayout() {
  const { data: user, isLoading } = useUser();

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center text-brand-primary">Loading...</div>;
  }

  if (user) {
    return <Navigate to="/app" replace />;
  }

  return (
    <div className="min-h-screen bg-bg-dark flex flex-col md:flex-row">
      {/* Left side - Branding/Illustration */}
      <div className="hidden md:flex md:w-1/2 lg:w-[55%] bg-bg-elevated border-r border-border-dark flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-brand-primary/20 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-brand-accent/20 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-2 font-bold text-2xl text-text-main group w-fit">
            <div className="p-2 bg-gradient-to-br from-brand-primary/20 to-brand-secondary/20 border border-brand-primary/20 rounded-xl group-hover:border-brand-primary/50 transition-colors">
              <BookOpen className="w-6 h-6 text-brand-primary" />
            </div>
            AlgoForge
          </Link>
        </div>
        
        <div className="relative z-10 max-w-lg mt-auto">
          <h1 className="text-4xl font-extrabold text-text-main mb-4 leading-tight">
            Master algorithms, <br/>one problem at a time.
          </h1>
          <p className="text-lg text-text-muted">
            Join thousands of developers tracking their interview preparation journey with intelligent spaced repetition.
          </p>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-6 sm:px-12 lg:px-24 relative">
        <div className="absolute top-6 right-6 flex items-center gap-4">
          <ThemeToggle />
        </div>
        
        <Link to="/" className="absolute top-6 left-6 md:hidden flex items-center gap-2 text-sm text-text-muted hover:text-text-main">
          <ArrowLeft className="w-4 h-4" /> Home
        </Link>
        
        <div className="mx-auto w-full max-w-md">
          <div className="md:hidden flex items-center gap-2 font-bold text-2xl text-text-main mb-8 justify-center">
            <BookOpen className="w-6 h-6 text-brand-primary" />
            AlgoForge
          </div>
          
          <div className="card p-8 shadow-xl shadow-brand-primary/5">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
