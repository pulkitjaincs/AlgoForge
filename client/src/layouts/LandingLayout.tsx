import { Outlet, Link, useNavigate } from 'react-router-dom';
import { BookOpen, LogOut, LayoutDashboard } from 'lucide-react';
import { ThemeToggle } from '../components/shared/ThemeToggle';
import { useEffect, useState } from 'react';
import { useUser } from '../hooks/useAuth';
import { authApi } from '../api/auth';
import { useQueryClient } from '@tanstack/react-query';

export default function LandingLayout() {
  const [scrolled, setScrolled] = useState(false);
  const { data: user } = useUser();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await authApi.logout();
      queryClient.setQueryData(['user'], null);
      navigate('/');
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  return (
    <div className="min-h-screen bg-bg-dark flex flex-col relative overflow-hidden">
      {/* Background ambient light */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-brand-primary/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-brand-accent/20 blur-[120px] rounded-full pointer-events-none" />

      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'bg-bg-dark/80 backdrop-blur-lg border-b border-border-dark py-3' : 'bg-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl text-text-main group">
            <div className="p-2 bg-gradient-to-br from-brand-primary/20 to-brand-secondary/20 border border-brand-primary/20 rounded-lg group-hover:border-brand-primary/50 transition-colors">
              <BookOpen className="w-5 h-5 text-brand-primary" />
            </div>
            AlgoForge
          </Link>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <div className="h-6 w-px bg-border-dark hidden sm:block" />
            
            {user ? (
              <>
                <Link to="/app/dashboard" className="btn-primary py-2 px-4 shadow-brand-primary/20 flex items-center gap-2">
                  <LayoutDashboard className="w-4 h-4" /> Dashboard
                </Link>
                <button onClick={handleLogout} className="btn-ghost hidden sm:flex font-medium items-center gap-2 text-danger">
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-ghost hidden sm:block font-medium">Sign In</Link>
                <Link to="/register" className="btn-primary py-2 px-4 shadow-brand-primary/20">Get Started</Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 mt-[80px]">
        <Outlet />
      </main>
      
      <footer className="border-t border-border-dark mt-20 bg-bg-elevated/50 py-8 relative z-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 font-semibold text-text-main">
            <BookOpen className="w-4 h-4 text-brand-primary" />
            AlgoForge &copy; {new Date().getFullYear()}
          </div>
          <div className="text-sm text-text-muted">
            Forging paths to algorithmic mastery.
          </div>
        </div>
      </footer>
    </div>
  );
}
