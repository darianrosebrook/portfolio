import React from 'react';
import ErrorBoundary from './ErrorBoundary';

/**
 * Error boundary specifically for editor-related components
 * Provides fallback UI for editor failures without breaking the entire page
 */
const EditorErrorBoundary: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <ErrorBoundary
      fallback={
        <div style={{ padding: '1rem', border: '1px solid #ccc' }}>
          <p>Editor temporarily unavailable</p>
          <p>Please refresh the page to try again.</p>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
};

export default EditorErrorBoundary;
