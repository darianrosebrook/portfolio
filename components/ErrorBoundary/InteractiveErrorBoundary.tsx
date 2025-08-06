import React from 'react';
import ErrorBoundary from './ErrorBoundary';

interface InteractiveErrorBoundaryProps {
  children: React.ReactNode;
  componentName?: string;
}

/**
 * Error boundary specifically for interactive components
 * Provides fallback UI for interactive failures without breaking the entire page
 */
const InteractiveErrorBoundary: React.FC<InteractiveErrorBoundaryProps> = ({
  children,
  componentName,
}) => {
  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    console.error(`${componentName || 'Interactive component'} error:`, {
      error: error.message,
      browserAPIs: {
        canvas: typeof HTMLCanvasElement !== 'undefined',
        webGL: typeof WebGLRenderingContext !== 'undefined',
        fileAPI: typeof FileReader !== 'undefined',
        intersectionObserver: typeof IntersectionObserver !== 'undefined',
      },
      errorInfo,
    });
  };

  return (
    <ErrorBoundary
      onError={handleError}
      fallback={
        <div style={{ padding: '1rem', textAlign: 'center' }}>
          <h3>{componentName || 'Interactive feature'} Unavailable</h3>
          <p>This may be due to browser compatibility issues.</p>
          <button onClick={() => window.location.reload()}>Refresh Page</button>
          <button
            onClick={() =>
              window.open(
                'https://github.com/darianrosebrook/portfolio/issues',
                '_blank'
              )
            }
          >
            Get Help
          </button>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
};

export default InteractiveErrorBoundary;
