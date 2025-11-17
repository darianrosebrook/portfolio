/**
 * ErrorBoundary for UI modules
 *
 * Wraps the base ErrorBoundary from utils/components with module-specific styling.
 * Uses inline styles for module isolation.
 */
import React from 'react';
import { ErrorBoundary as BaseErrorBoundary } from '../../../utils/components/ErrorBoundary';

interface UIErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

/**
 * Default fallback UI for UI modules (inline styles for isolation)
 */
const DefaultUIFallback: React.FC<{
  error: Error;
  resetError: () => void;
}> = ({ error, resetError }) => (
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
      {error.message || 'An unexpected error occurred'}
    </p>
    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
      <button
        onClick={resetError}
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
          {error.stack}
        </pre>
      </details>
    )}
  </div>
);

/**
 * ErrorBoundary component for UI modules
 * Uses the base ErrorBoundary from utils/components with module-specific styling
 */
export class ErrorBoundary extends React.Component<UIErrorBoundaryProps> {
  render() {
    const { children, fallback, onError } = this.props;

    // If custom fallback is provided, wrap it in a component
    if (fallback) {
      const FallbackComponent: React.ComponentType<{
        error: Error;
        errorInfo?: React.ErrorInfo;
        resetError: () => void;
      }> = () => <>{fallback}</>;

      return (
        <BaseErrorBoundary fallback={FallbackComponent} onError={onError}>
          {children}
        </BaseErrorBoundary>
      );
    }

    // Use default UI fallback
    return (
      <BaseErrorBoundary fallback={DefaultUIFallback} onError={onError}>
        {children}
      </BaseErrorBoundary>
    );
  }
}

export default ErrorBoundary;

interface WithErrorBoundaryOptions {
  fallback?: React.ReactNode;
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
