import { useState } from 'react';
import { useRegister } from '../hooks/useAuth';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const register = useRegister();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    register.mutate({ name, email, password }, {
      onSuccess: () => navigate('/app')
    });
  };

  return (
    <div className="animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-text-main mb-2">Create an account</h2>
        <p className="text-sm text-text-muted">Start forging your path to mastery</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="input-label">Full Name</label>
          <input 
            type="text" 
            required 
            className="input-field" 
            placeholder="John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
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
          <label className="input-label">Password</label>
          <div className="relative">
            <input 
              type={showPassword ? "text" : "password"} 
              required 
              className="input-field pr-10"
              placeholder="Min. 8 characters, 1 letter, 1 number"
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
        
        <div className="flex items-start gap-2 mt-2 pt-2">
          <input type="checkbox" id="terms" required className="mt-1 bg-bg-elevated border-border-dark rounded" />
          <label htmlFor="terms" className="text-xs text-text-muted">
            I agree to the <Link to="#" className="text-brand-primary hover:underline">Terms of Service</Link> and <Link to="#" className="text-brand-primary hover:underline">Privacy Policy</Link>.
          </label>
        </div>
        
        <button 
          type="submit" 
          disabled={register.isPending}
          className="btn-primary w-full py-3 mt-4"
        >
          {register.isPending ? 'Creating account...' : 'Create free account'}
        </button>
      </form>
      
      <p className="mt-8 text-center text-sm text-text-muted">
        Already have an account? <Link to="/login" className="text-brand-primary hover:text-brand-secondary font-semibold">Sign in here</Link>
      </p>
    </div>
  );
}
