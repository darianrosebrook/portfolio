import React from 'react';
import ErrorBoundary from './ErrorBoundary';

interface EditorErrorBoundaryProps {
  children: React.ReactNode;
  editorName?: string;
  onDataLoss?: () => void;
}

/**
 * Error boundary specifically for editor-related components
 * Provides fallback UI for editor failures without breaking the entire page
 */
const EditorErrorBoundary: React.FC<EditorErrorBoundaryProps> = ({
  children,
  editorName,
  onDataLoss,
}) => {
  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    console.error(`${editorName || 'Editor'} error:`, error, errorInfo);
    if (onDataLoss) {
      onDataLoss();
    }
  };

  const handleDataRecovery = () => {
    const storageKey = editorName
      ? `${editorName}-autosave`
      : 'editor-autosave';
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      console.log('Recovered data:', JSON.parse(saved));
    }
  };

  return (
    <ErrorBoundary
      onError={handleError}
      fallback={
        <div style={{ padding: '1rem', border: '1px solid #ccc' }}>
          <h3>{editorName || 'Editor'} Error</h3>
          <p>Your work has been auto-saved and can be recovered.</p>
          <button onClick={handleDataRecovery}>Recover Data</button>
          <button onClick={() => window.location.reload()}>
            Restart Editor
          </button>
          <button
            onClick={() =>
              navigator.clipboard.writeText(
                JSON.stringify({ editorName, timestamp: new Date() })
              )
            }
          >
            Copy Error Info
          </button>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
};

export default EditorErrorBoundary;
