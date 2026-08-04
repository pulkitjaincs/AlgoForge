import { useState } from 'react';
import { useLogin } from '../hooks/useAuth';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const login = useLogin();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login.mutate({ email, password }, {
      onSuccess: () => navigate('/app')
    });
  };

  return (
    <div className="animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-text-main mb-2">Welcome back</h2>
        <p className="text-sm text-text-muted">Enter your credentials to access your account</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="input-label">Email address</label>
          <input 
            type="email" 
            required 
            className="input-field" 
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="input-label mb-0">Password</label>
            <Link to="#" className="text-xs text-brand-primary hover:text-brand-secondary font-medium">Forgot password?</Link>
          </div>
          <div className="relative">
            <input 
              type={showPassword ? "text" : "password"} 
              required 
              className="input-field pr-10"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-main"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <button 
          type="submit" 
          disabled={login.isPending}
          className="btn-primary w-full py-3 mt-2"
        >
          {login.isPending ? 'Signing in...' : 'Sign in to account'}
        </button>
      </form>
      
      <p className="mt-8 text-center text-sm text-text-muted">
        Don't have an account? <Link to="/register" className="text-brand-primary hover:text-brand-secondary font-semibold">Sign up for free</Link>
      </p>
    </div>
  );
}
