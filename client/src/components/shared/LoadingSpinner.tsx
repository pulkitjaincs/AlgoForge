import React from 'react';
import { Sparkles } from 'lucide-react';

interface LoadingSpinnerProps {
  fullScreen?: boolean;
}

export const LoadingSpinner = ({ fullScreen = false }: LoadingSpinnerProps) => {
  const containerClass = fullScreen 
    ? "flex h-screen items-center justify-center" 
    : "flex py-12 items-center justify-center";

  return (
    <div className={containerClass}>
      <div className="flex flex-col items-center gap-4 animate-fade-in">
        <div className="relative">
          <div className="absolute inset-0 bg-brand-primary/20 blur-xl rounded-full" />
          <div
            className="relative p-4 bg-gradient-to-br from-brand-primary/20 to-brand-secondary/20 border border-brand-primary/20 animate-pulse"
            style={{ borderRadius: 'var(--radius-md)' }}
          >
            <Sparkles className="w-8 h-8 text-brand-primary animate-spin" style={{ animationDuration: '3s' }} />
          </div>
        </div>
        <p className="text-brand-primary font-medium tracking-widest uppercase text-sm animate-pulse">
          Loading...
        </p>
      </div>
    </div>
  );
};
