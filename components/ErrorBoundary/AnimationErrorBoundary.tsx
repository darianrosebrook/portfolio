import React from 'react';
import ErrorBoundary from './ErrorBoundary';

/**
 * Error boundary specifically for animation-related components
 * Provides fallback UI for animation failures without breaking the entire page
 */
const AnimationErrorBoundary: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <ErrorBoundary
      fallback={
        <div style={{ padding: '1rem', textAlign: 'center' }}>
          <p>Animation temporarily unavailable</p>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
};

export default AnimationErrorBoundary;
