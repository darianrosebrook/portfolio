import React from 'react';
import ErrorBoundary from './ErrorBoundary';

interface AnimationErrorBoundaryProps {
  children: React.ReactNode;
  animationName?: string;
  disableAnimations?: boolean;
  fallbackContent?: React.ReactNode;
}

/**
 * Error boundary specifically for animation-related components
 * Provides fallback UI for animation failures without breaking the entire page
 */
const AnimationErrorBoundary: React.FC<AnimationErrorBoundaryProps> = ({
  children,
  animationName,
  disableAnimations = false,
  fallbackContent,
}) => {
  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    console.error(`${animationName || 'Animation'} animation error:`, {
      animationContext: {
        animationSupport: {
          requestAnimationFrame:
            typeof window !== 'undefined' && 'requestAnimationFrame' in window,
        },
      },
      error,
      errorInfo,
    });
  };

  // Show fallback immediately if animations are disabled
  if (disableAnimations) {
    if (fallbackContent) {
      return <>{fallbackContent}</>;
    }
    return (
      <div style={{ padding: '1rem', textAlign: 'center' }}>
        <h3>{animationName || 'Animation'} Disabled</h3>
        <p>Motion preferences respected</p>
      </div>
    );
  }

  return (
    <ErrorBoundary
      onError={handleError}
      fallback={
        <div style={{ padding: '1rem', textAlign: 'center' }}>
          <h3>{animationName || 'Animation'} Disabled</h3>
          <p>Animations are temporarily disabled for stability.</p>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
};

export default AnimationErrorBoundary;
