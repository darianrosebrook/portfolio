import React from 'react';
import ErrorBoundary from './ErrorBoundary';

interface InteractiveErrorBoundaryProps {
  children: React.ReactNode;
  componentName?: string;
}

/**
 * Specialized error boundary for interactive components that use browser APIs
 * like Canvas, WebGL, File API, etc.
 *
 * @example
 * <InteractiveErrorBoundary componentName="FontInspector">
 *   <FontInspector />
 * </InteractiveErrorBoundary>
 */
const InteractiveErrorBoundary: React.FC<InteractiveErrorBoundaryProps> = ({
  children,
  componentName = 'Interactive Component',
}) => {
  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    // Log specific context for interactive component errors
    console.error(`${componentName} error:`, {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      browserAPIs: {
        canvas: typeof HTMLCanvasElement !== 'undefined',
        webGL: typeof WebGLRenderingContext !== 'undefined',
        fileAPI: typeof FileReader !== 'undefined',
        intersectionObserver: typeof IntersectionObserver !== 'undefined',
      },
      timestamp: new Date().toISOString(),
    });
  };

  const fallbackUI = (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 2rem',
        border: '2px dashed #d1d5db',
        borderRadius: '0.75rem',
        backgroundColor: '#f9fafb',
        color: '#6b7280',
        textAlign: 'center',
        minHeight: '200px',
      }}
    >
      <svg
        width="48"
        height="48"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ marginBottom: '1rem', opacity: 0.5 }}
      >
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>

      <h3
        style={{
          margin: '0 0 0.5rem 0',
          fontSize: '1.125rem',
          color: '#374151',
        }}
      >
        {componentName} Unavailable
      </h3>

      <p style={{ margin: '0 0 1.5rem 0', maxWidth: '400px', lineHeight: 1.5 }}>
        This interactive component encountered an error and cannot be displayed.
        This might be due to browser compatibility or a temporary issue.
      </p>

      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#374151',
            color: 'white',
            border: 'none',
            borderRadius: '0.375rem',
            cursor: 'pointer',
            fontSize: '0.875rem',
          }}
        >
          Refresh Page
        </button>

        <button
          onClick={() => {
            // Check browser compatibility and suggest alternatives
            const isModernBrowser =
              typeof HTMLCanvasElement !== 'undefined' &&
              typeof IntersectionObserver !== 'undefined';

            if (!isModernBrowser) {
              alert(
                'This component requires a modern browser. Please update your browser and try again.'
              );
            } else {
              alert(
                'Please try refreshing the page or contact support if the issue persists.'
              );
            }
          }}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: 'transparent',
            color: '#6b7280',
            border: '1px solid #d1d5db',
            borderRadius: '0.375rem',
            cursor: 'pointer',
            fontSize: '0.875rem',
          }}
        >
          Get Help
        </button>
      </div>
    </div>
  );

  return (
    <ErrorBoundary fallback={fallbackUI} onError={handleError}>
      {children}
    </ErrorBoundary>
  );
};

export default InteractiveErrorBoundary;
