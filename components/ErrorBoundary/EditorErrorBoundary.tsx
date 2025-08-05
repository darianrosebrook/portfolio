import React from 'react';
import ErrorBoundary from './ErrorBoundary';

interface EditorErrorBoundaryProps {
  children: React.ReactNode;
  onDataLoss?: () => void;
  editorName?: string;
}

/**
 * Specialized error boundary for rich text editors and content creation components
 * Provides data recovery options and graceful degradation
 *
 * @example
 * <EditorErrorBoundary editorName="Article Editor" onDataLoss={handleDataBackup}>
 *   <TiptapEditor />
 * </EditorErrorBoundary>
 */
const EditorErrorBoundary: React.FC<EditorErrorBoundaryProps> = ({
  children,
  onDataLoss,
  editorName = 'Editor',
}) => {
  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    // Log editor-specific error context
    console.error(`${editorName} error:`, {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      editorContext: {
        localStorage: typeof localStorage !== 'undefined',
        sessionStorage: typeof sessionStorage !== 'undefined',
        clipboardAPI: typeof navigator.clipboard !== 'undefined',
      },
      timestamp: new Date().toISOString(),
    });

    // Attempt to recover any unsaved data
    if (onDataLoss) {
      try {
        onDataLoss();
      } catch (recoveryError) {
        console.error('Data recovery failed:', recoveryError);
      }
    }
  };

  const handleRecoverData = () => {
    // Try to recover data from localStorage
    try {
      const savedData = localStorage.getItem(
        `${editorName.toLowerCase()}-autosave`
      );
      if (savedData) {
        // Create a simple text area with recovered content
        const textarea = document.createElement('textarea');
        textarea.value = savedData;
        textarea.style.width = '100%';
        textarea.style.height = '200px';
        textarea.style.padding = '1rem';
        textarea.style.border = '1px solid #d1d5db';
        textarea.style.borderRadius = '0.375rem';
        textarea.style.fontFamily = 'monospace';

        const container = document.createElement('div');
        container.style.position = 'fixed';
        container.style.top = '50%';
        container.style.left = '50%';
        container.style.transform = 'translate(-50%, -50%)';
        container.style.backgroundColor = 'white';
        container.style.padding = '2rem';
        container.style.borderRadius = '0.5rem';
        container.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1)';
        container.style.zIndex = '1000';
        container.style.maxWidth = '90vw';
        container.style.maxHeight = '90vh';

        const title = document.createElement('h3');
        title.textContent = 'Recovered Content';
        title.style.margin = '0 0 1rem 0';

        const closeButton = document.createElement('button');
        closeButton.textContent = 'Close';
        closeButton.style.marginTop = '1rem';
        closeButton.style.padding = '0.5rem 1rem';
        closeButton.style.backgroundColor = '#374151';
        closeButton.style.color = 'white';
        closeButton.style.border = 'none';
        closeButton.style.borderRadius = '0.25rem';
        closeButton.style.cursor = 'pointer';
        closeButton.onclick = () => document.body.removeChild(container);

        container.appendChild(title);
        container.appendChild(textarea);
        container.appendChild(closeButton);
        document.body.appendChild(container);
      } else {
        alert('No auto-saved data found.');
      }
    } catch (error) {
      console.error('Failed to recover data:', error);
      alert(
        'Failed to recover data. Please check your browser console for details.'
      );
    }
  };

  const fallbackUI = (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 2rem',
        border: '2px solid #fbbf24',
        borderRadius: '0.75rem',
        backgroundColor: '#fffbeb',
        color: '#92400e',
        textAlign: 'center',
        minHeight: '300px',
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
        style={{ marginBottom: '1rem', color: '#f59e0b' }}
      >
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14,2 14,8 20,8"></polyline>
        <line x1="16" y1="13" x2="8" y2="13"></line>
        <line x1="16" y1="17" x2="8" y2="17"></line>
        <polyline points="10,9 9,9 8,9"></polyline>
      </svg>

      <h3
        style={{
          margin: '0 0 0.5rem 0',
          fontSize: '1.25rem',
          color: '#92400e',
        }}
      >
        {editorName} Error
      </h3>

      <p style={{ margin: '0 0 1rem 0', maxWidth: '400px', lineHeight: 1.5 }}>
        The editor encountered an error and stopped working. Your content may
        have been auto-saved.
      </p>

      <p
        style={{
          margin: '0 0 2rem 0',
          fontSize: '0.875rem',
          backgroundColor: '#fef3c7',
          padding: '0.75rem',
          borderRadius: '0.375rem',
          maxWidth: '400px',
        }}
      >
        <strong>⚠️ Data Protection:</strong> We automatically save your work
        every few seconds. Use the &quot;Recover Data&quot; button to access any
        saved content.
      </p>

      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <button
          onClick={handleRecoverData}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#f59e0b',
            color: 'white',
            border: 'none',
            borderRadius: '0.375rem',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: '500',
          }}
        >
          Recover Data
        </button>

        <button
          onClick={() => window.location.reload()}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#374151',
            color: 'white',
            border: 'none',
            borderRadius: '0.375rem',
            cursor: 'pointer',
            fontSize: '0.875rem',
          }}
        >
          Restart Editor
        </button>

        <button
          onClick={() => {
            // Copy error details to clipboard
            const errorDetails = `${editorName} Error at ${new Date().toISOString()}`;
            if (navigator.clipboard) {
              navigator.clipboard.writeText(errorDetails);
              alert('Error details copied to clipboard');
            } else {
              prompt('Copy this error information:', errorDetails);
            }
          }}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: 'transparent',
            color: '#92400e',
            border: '1px solid #f59e0b',
            borderRadius: '0.375rem',
            cursor: 'pointer',
            fontSize: '0.875rem',
          }}
        >
          Copy Error Info
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

export default EditorErrorBoundary;
