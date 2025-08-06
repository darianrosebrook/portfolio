import React from 'react';
import ErrorBoundary from './ErrorBoundary';

interface AnimationErrorBoundaryProps {
  children: React.ReactNode;
  fallbackContent?: React.ReactNode;
  animationName?: string;
  disableAnimations?: boolean;
}

/**
 * Specialized error boundary for animation components using libraries like GSAP
 * Provides graceful degradation when animations fail
 *
 * @example
 * <AnimationErrorBoundary animationName="GooeyHighlight" disableAnimations={reduceMotion}>
 *   <GooeyHighlight />
 * </AnimationErrorBoundary>
 */
const AnimationErrorBoundary: React.FC<AnimationErrorBoundaryProps> = ({
  children,
  fallbackContent,
  animationName = 'Animation',
  disableAnimations = false,
}) => {
  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    // Log animation-specific error context
    console.error(`${animationName} animation error:`, {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      animationContext: {
        userAgent: navigator.userAgent,
        reduceMotion: window.matchMedia?.('(prefers-reduced-motion: reduce)')
          .matches,
        animationSupport: {
          requestAnimationFrame: typeof requestAnimationFrame !== 'undefined',
          cssTransitions:
            typeof CSS !== 'undefined' &&
            CSS.supports?.('transition', 'opacity 1s'),
          gsap: typeof window !== 'undefined' && 'gsap' in window,
        },
        performanceNow:
          typeof performance !== 'undefined' &&
          typeof performance.now === 'function',
      },
      timestamp: new Date().toISOString(),
    });
  };

  const defaultFallback = fallbackContent || (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        border: '1px solid #e5e7eb',
        borderRadius: '0.5rem',
        backgroundColor: '#f9fafb',
        color: '#6b7280',
        textAlign: 'center',
        minHeight: '150px',
      }}
    >
      <svg
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ marginBottom: '1rem', opacity: 0.6 }}
      >
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path>
      </svg>

      <h4
        style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', color: '#374151' }}
      >
        {animationName} Disabled
      </h4>

      <p
        style={{
          margin: '0 0 1rem 0',
          fontSize: '0.875rem',
          maxWidth: '300px',
          lineHeight: 1.4,
        }}
      >
        Animations are temporarily disabled to ensure a smooth experience.
      </p>

      {disableAnimations && (
        <p
          style={{
            margin: '0',
            fontSize: '0.75rem',
            color: '#9ca3af',
            fontStyle: 'italic',
          }}
        >
          Motion preferences respected
        </p>
      )}
    </div>
  );

  // If animations are disabled by user preference, show fallback immediately
  if (disableAnimations) {
    return <>{defaultFallback}</>;
  }

  return (
    <ErrorBoundary fallback={defaultFallback} onError={handleError}>
      {children}
    </ErrorBoundary>
  );
};

export default AnimationErrorBoundary;
