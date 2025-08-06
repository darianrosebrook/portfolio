import React, { Component, ReactNode } from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorBoundaryKey: number;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

/**
 * Base ErrorBoundary component that catches JavaScript errors anywhere in the child component tree
 * Provides a fallback UI instead of crashing the entire application
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, errorBoundaryKey: 0 };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log the error to console or error reporting service
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Call custom onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      // Render fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          style={{
            padding: '1rem',
            margin: '1rem 0',
            border: '1px solid #ff6b6b',
            borderRadius: '0.5rem',
            backgroundColor: '#fff5f5',
            color: '#c92a2a',
          }}
        >
          <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem' }}>
            Something went wrong
          </h3>
          <p style={{ margin: '0 0 1rem 0', fontSize: '0.9rem' }}>
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              onClick={() =>
                this.setState({
                  hasError: false,
                  error: undefined,
                  errorBoundaryKey: this.state.errorBoundaryKey + 1,
                })
              }
              style={{ padding: '0.5rem', fontSize: '0.8rem' }}
            >
              Try Again
            </button>
            <button
              onClick={() => {
                setTimeout(() => window.location.reload(), 3000);
              }}
              style={{ padding: '0.5rem', fontSize: '0.8rem' }}
            >
              Retry in 3s
            </button>
            <button
              onClick={() => window.location.reload()}
              style={{ padding: '0.5rem', fontSize: '0.8rem' }}
            >
              Reload Page
            </button>
          </div>
          {process.env.NODE_ENV === 'development' && (
            <details style={{ marginTop: '1rem' }}>
              <summary>Error Details</summary>
              <pre style={{ fontSize: '0.7rem', overflow: 'auto' }}>
                {this.state.error?.stack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return (
      <React.Fragment key={this.state.errorBoundaryKey}>
        {this.props.children}
      </React.Fragment>
    );
  }
}

export default ErrorBoundary;

interface WithErrorBoundaryOptions {
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  componentName?: string;
}

/**
 * Higher-order component that wraps a component with ErrorBoundary
 */
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  options?: WithErrorBoundaryOptions
) => {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary fallback={options?.fallback} onError={options?.onError}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  return WrappedComponent;
};
