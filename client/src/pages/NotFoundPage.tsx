import { Link } from 'react-router-dom';
import { Sparkles, ArrowLeft } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-bg-dark flex flex-col items-center justify-center p-6 relative overflow-hidden text-center animate-fade-in">
      <Helmet>
        <title>404 — Not Found</title>
      </Helmet>
      
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-brand-primary/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-brand-accent/20 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="relative z-10 max-w-md w-full">
        <div className="mx-auto w-20 h-20 bg-brand-primary/10 border border-brand-primary/20 rounded-2xl flex items-center justify-center mb-6">
           <Sparkles className="w-10 h-10 text-brand-primary" />
        </div>
        
        <h1 className="text-6xl font-extrabold text-text-main mb-4 tracking-tight">404</h1>
        <h2 className="text-2xl font-bold text-text-main mb-4">Lost in the void</h2>
        <p className="text-text-muted mb-8 text-lg">
          We couldn't find the page you're looking for. It might have been moved or deleted.
        </p>
        
        <Link to="/" className="btn-primary inline-flex items-center gap-2 px-6 py-3 text-lg">
          <ArrowLeft className="w-5 h-5" /> Go Back Home
        </Link>
      </div>
    </div>
  );
}
