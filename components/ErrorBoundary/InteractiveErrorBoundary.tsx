import React from 'react';
import ErrorBoundary from './ErrorBoundary';

/**
 * Error boundary specifically for interactive components
 * Provides fallback UI for interactive failures without breaking the entire page
 */
const InteractiveErrorBoundary: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <ErrorBoundary
      fallback={
        <div style={{ padding: '1rem', textAlign: 'center' }}>
          <p>Interactive feature temporarily unavailable</p>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
};

export default InteractiveErrorBoundary;
