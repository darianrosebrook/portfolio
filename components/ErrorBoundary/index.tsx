export { default as ErrorBoundary } from './ErrorBoundary';
export { default as InteractiveErrorBoundary } from './InteractiveErrorBoundary';
export { default as EditorErrorBoundary } from './EditorErrorBoundary';
export { default as AnimationErrorBoundary } from './AnimationErrorBoundary';

// Re-export for convenience
export { default } from './ErrorBoundary';

// Higher-order component for wrapping components with error boundaries
import React from 'react';
import ErrorBoundary from './ErrorBoundary';

interface WithErrorBoundaryOptions {
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  componentName?: string;
}

/**
 * Higher-order component that wraps a component with an error boundary
 *
 * @example
 * const SafeComponent = withErrorBoundary(RiskyComponent, {
 *   fallback: <div>Component failed to load</div>,
 *   componentName: 'RiskyComponent'
 * });
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  options: WithErrorBoundaryOptions = {}
): React.ComponentType<P> {
  const {
    fallback,
    onError,
    componentName = Component.displayName || Component.name,
  } = options;

  const WrappedComponent: React.FC<P> = (props) => (
    <ErrorBoundary
      fallback={fallback}
      onError={(error, errorInfo) => {
        console.error(`Error in ${componentName}:`, error);
        onError?.(error, errorInfo);
      }}
    >
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${componentName})`;

  return WrappedComponent;
}
