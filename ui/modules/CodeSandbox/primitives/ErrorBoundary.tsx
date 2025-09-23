import * as React from 'react';

export interface ErrorInfo {
  componentStack: string;
  errorBoundary?: string;
  errorBoundaryStack?: string;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{
    error: Error;
    errorInfo: ErrorInfo;
    retry: () => void;
  }>;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetOnPropsChange?: boolean;
  resetKeys?: Array<string | number>;
}

function DefaultErrorFallback({
  error,
  errorInfo,
  retry,
}: {
  error: Error;
  errorInfo: ErrorInfo;
  retry: () => void;
}) {
  const [showDetails, setShowDetails] = React.useState(false);

  return (
    <div
      style={{
        border: '1px solid var(--semantic-color-border-danger)',
        borderRadius: 8,
        padding: 16,
        background: 'var(--semantic-color-background-danger-subtle)',
        color: 'var(--semantic-color-foreground-danger)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 12,
        }}
      >
        <div>
          <h3
            style={{
              margin: 0,
              fontSize: 16,
              fontWeight: 600,
              color: 'var(--semantic-color-foreground-danger)',
            }}
          >
            Something went wrong
          </h3>
          <p
            style={{
              margin: '4px 0 0 0',
              fontSize: 14,
              color: 'var(--semantic-color-foreground-danger-secondary)',
            }}
          >
            {error.message || 'An unexpected error occurred'}
          </p>
        </div>
        <button
          type="button"
          onClick={retry}
          style={{
            padding: '6px 12px',
            fontSize: 12,
            borderRadius: 6,
            border: '1px solid var(--semantic-color-border-danger)',
            background: 'var(--semantic-color-background-danger)',
            color: 'var(--semantic-color-foreground-on-danger)',
            cursor: 'pointer',
          }}
        >
          Try again
        </button>
      </div>

      <button
        type="button"
        onClick={() => setShowDetails(!showDetails)}
        style={{
          padding: '4px 8px',
          fontSize: 11,
          borderRadius: 4,
          border: '1px solid var(--semantic-color-border-danger-secondary)',
          background: 'transparent',
          color: 'var(--semantic-color-foreground-danger-secondary)',
          cursor: 'pointer',
          marginBottom: showDetails ? 12 : 0,
        }}
      >
        {showDetails ? 'Hide' : 'Show'} details
      </button>

      {showDetails && (
        <details open>
          <summary
            style={{
              cursor: 'pointer',
              fontWeight: 600,
              marginBottom: 8,
              color: 'var(--semantic-color-foreground-danger)',
            }}
          >
            Error Details
          </summary>
          <div
            style={{
              background: 'var(--semantic-color-background-tertiary)',
              border: '1px solid var(--semantic-color-border-subtle)',
              borderRadius: 6,
              padding: 12,
              marginBottom: 12,
            }}
          >
            <div style={{ marginBottom: 8 }}>
              <strong>Error:</strong>
              <pre
                style={{
                  margin: '4px 0 0 0',
                  fontSize: 11,
                  fontFamily: 'var(--semantic-typography-font-family-mono)',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  color: 'var(--semantic-color-foreground-primary)',
                }}
              >
                {error.name}: {error.message}
              </pre>
            </div>

            {error.stack && (
              <div style={{ marginBottom: 8 }}>
                <strong>Stack Trace:</strong>
                <pre
                  style={{
                    margin: '4px 0 0 0',
                    fontSize: 10,
                    fontFamily: 'var(--semantic-typography-font-family-mono)',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    color: 'var(--semantic-color-foreground-secondary)',
                    maxHeight: 200,
                    overflow: 'auto',
                  }}
                >
                  {error.stack}
                </pre>
              </div>
            )}

            {errorInfo.componentStack && (
              <div>
                <strong>Component Stack:</strong>
                <pre
                  style={{
                    margin: '4px 0 0 0',
                    fontSize: 10,
                    fontFamily: 'var(--semantic-typography-font-family-mono)',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    color: 'var(--semantic-color-foreground-secondary)',
                    maxHeight: 200,
                    overflow: 'auto',
                  }}
                >
                  {errorInfo.componentStack}
                </pre>
              </div>
            )}
          </div>
        </details>
      )}
    </div>
  );
}

/**
 * A robust error boundary component that catches JavaScript errors in child components,
 * logs error information, and displays a fallback UI instead of crashing the whole component tree.
 *
 * Features:
 * - Customizable fallback UI
 * - Error reporting callbacks
 * - Automatic reset on prop changes
 * - Development-friendly error logging
 * - Retry functionality
 *
 * @example
 * ```tsx
 * <ErrorBoundary
 *   resetKeys={[userSession.id]}
 *   onError={(error, errorInfo) => analytics.track('component_error', { error })}
 * >
 *   <MyComponent />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  private resetTimeoutId: number | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const info: ErrorInfo = {
      componentStack: errorInfo.componentStack || '',
      errorBoundary: '',
      errorBoundaryStack: '',
    };

    this.setState({
      errorInfo: info,
    });

    // Call onError callback if provided
    this.props.onError?.(error, info);

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.group('🚨 ErrorBoundary caught an error');
      console.error('Error:', error);
      console.error('Error Info:', info);
      console.groupEnd();
    }
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    const { resetKeys, resetOnPropsChange } = this.props;
    const { hasError } = this.state;

    // Reset error state when resetKeys change
    if (hasError && resetKeys) {
      const hasResetKeyChanged = resetKeys.some(
        (key, index) => key !== prevProps.resetKeys?.[index]
      );
      if (hasResetKeyChanged) {
        this.resetErrorBoundary();
      }
    }

    // Reset error state when any prop changes (if enabled)
    if (hasError && resetOnPropsChange && prevProps !== this.props) {
      this.resetErrorBoundary();
    }
  }

  componentWillUnmount() {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }
  }

  resetErrorBoundary = () => {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }

    this.resetTimeoutId = window.setTimeout(() => {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
      });
    }, 0);
  };

  render() {
    const { hasError, error, errorInfo } = this.state;
    const { children, fallback: Fallback = DefaultErrorFallback } = this.props;

    if (hasError && error && errorInfo) {
      return (
        <Fallback
          error={error}
          errorInfo={errorInfo}
          retry={this.resetErrorBoundary}
        />
      );
    }

    return children;
  }
}

// Hook version for functional components
export function useErrorBoundary() {
  const [error, setError] = React.useState<Error | null>(null);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  const captureError = React.useCallback((error: Error) => {
    setError(error);
  }, []);

  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  return { captureError, resetError };
}

// Higher-order component wrapper
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
