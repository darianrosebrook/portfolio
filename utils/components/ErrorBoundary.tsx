/**
 * Error Boundary Component
 *
 * Provides resilience for component failures with graceful fallback UI
 * and error reporting integration.
 */

'use client';

import React from 'react';
import styles from './ErrorBoundary.module.scss';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  /**
   * Custom fallback component to render when an error occurs
   */
  fallback?: React.ComponentType<{
    error: Error;
    errorInfo?: React.ErrorInfo;
    resetError: () => void;
  }>;
  /**
   * Callback fired when an error is caught
   */
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  /**
   * Whether to log errors to console (default: true in development)
   */
  logErrors?: boolean;
  /**
   * Additional CSS classes
   */
  className?: string;
}

const DefaultErrorFallback: React.FC<{
  error: Error;
  errorInfo?: React.ErrorInfo;
  resetError: () => void;
}> = ({ error, resetError }) => (
  <div className={styles.errorFallback}>
    <div className={styles.errorIcon}>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="15" y1="9" x2="9" y2="15" />
        <line x1="9" y1="9" x2="15" y2="15" />
      </svg>
    </div>
    <h3 className={styles.errorTitle}>Something went wrong</h3>
    <p className={styles.errorMessage}>
      {process.env.NODE_ENV === 'development'
        ? error.message
        : 'An unexpected error occurred. Please try refreshing the page.'}
    </p>
    {process.env.NODE_ENV === 'development' && (
      <details className={styles.errorDetails}>
        <summary>Error Details</summary>
        <pre className={styles.errorStack}>
          {error.stack}
          {errorInfo?.componentStack && (
            <>
              {'\n\nComponent Stack:\n'}
              {errorInfo.componentStack}
            </>
          )}
        </pre>
      </details>
    )}
    <button
      className={styles.errorReset}
      onClick={resetError}
      type="button"
    >
      Try Again
    </button>
  </div>
);

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  private resetTimeoutId: number | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const { onError, logErrors = process.env.NODE_ENV === 'development' } = this.props;

    this.setState({
      error,
      errorInfo,
    });

    if (logErrors) {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    // Call custom error handler if provided
    onError?.(error, errorInfo);

    // Report to monitoring service if available
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'exception', {
        description: error.message,
        fatal: false,
      });
    }
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  resetErrorWithDelay = () => {
    // Clear any existing timeout
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }

    // Reset after a brief delay to prevent immediate re-render issues
    this.resetTimeoutId = window.setTimeout(() => {
      this.resetError();
      this.resetTimeoutId = null;
    }, 100);
  };

  componentWillUnmount() {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }
  }

  render() {
    const { hasError, error, errorInfo } = this.state;
    const { children, fallback: Fallback = DefaultErrorFallback, className } = this.props;

    if (hasError && error) {
      return (
        <div className={`${styles.errorBoundary} ${className || ''}`}>
          <Fallback
            error={error}
            errorInfo={errorInfo}
            resetError={this.resetErrorWithDelay}
          />
        </div>
      );
    }

    return children;
  }
}

// Hook version for functional components
export function useErrorHandler() {
  return (error: Error, errorInfo?: React.ErrorInfo) => {
    console.error('Error caught by useErrorHandler:', error, errorInfo);

    // Report to monitoring
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'exception', {
        description: error.message,
        fatal: false,
      });
    }
  };
}

// Higher-order component for wrapping components with error boundaries
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
}

export default ErrorBoundary;
