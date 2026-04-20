import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error Boundary Caught an Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-neutral-50 p-4 transition-colors">
          <div className="card max-w-lg w-full text-center space-y-6">
            <div className="w-20 h-20 bg-danger-50 text-danger-500 rounded-full flex items-center justify-center mx-auto text-4xl">
              ⚠️
            </div>
            <div>
              <h1 className="text-2xl font-bold text-neutral-800">Something went wrong</h1>
              <p className="text-neutral-500 mt-2">
                An unexpected error occurred in Kirana OS. Our team has been notified.
              </p>
            </div>
            
            <div className="p-4 bg-neutral-100 rounded-lg text-left overflow-x-auto text-xs text-danger-600 font-mono">
              {this.state.error?.toString() || 'Unknown runtime UI error'}
            </div>

            <button 
              className="btn btn-primary w-full"
              onClick={() => {
                this.setState({ hasError: false });
                window.location.href = '/dashboard';
              }}
            >
              🔄 Restart Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
