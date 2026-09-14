import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in React ErrorBoundary:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-bg-main p-4">
          <div className="glass max-w-md w-full p-8 rounded-2xl border-danger/20 text-center space-y-6">
            <div className="w-16 h-16 bg-danger/10 text-danger rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-text-main">Something went wrong</h2>
              <p className="text-text-muted">
                An unexpected error occurred in the application. Our team has been notified.
              </p>
            </div>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="bg-bg-dark p-4 rounded-lg border border-border-dark text-left overflow-auto max-h-40">
                <pre className="text-xs text-danger font-mono whitespace-pre-wrap">
                  {this.state.error.message}
                </pre>
              </div>
            )}
            <button
              onClick={this.handleReload}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              <RefreshCcw className="w-4 h-4" />
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
