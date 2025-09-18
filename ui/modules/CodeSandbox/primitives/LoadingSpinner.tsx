import * as React from 'react';

export type LoadingSpinnerProps = {
  size?: 'small' | 'medium' | 'large';
  color?: string;
  message?: string;
  overlay?: boolean;
};

const SIZES = {
  small: 16,
  medium: 24,
  large: 32,
} as const;

export function LoadingSpinner({
  size = 'medium',
  color = 'var(--semantic-color-foreground-accent)',
  message,
  overlay = false,
}: LoadingSpinnerProps) {
  const spinnerSize = SIZES[size];

  const spinner = (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
      }}
    >
      <div
        style={{
          width: spinnerSize,
          height: spinnerSize,
          border: `2px solid var(--semantic-color-border-subtle)`,
          borderTop: `2px solid ${color}`,
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }}
      />
      {message && (
        <span
          style={{
            fontSize: 12,
            color: 'var(--semantic-color-foreground-secondary)',
            textAlign: 'center',
          }}
        >
          {message}
        </span>
      )}
      <style jsx>{`
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );

  if (overlay) {
    return (
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--semantic-color-background-overlay)',
          backdropFilter: 'blur(2px)',
          zIndex: 1000,
        }}
      >
        {spinner}
      </div>
    );
  }

  return spinner;
}

export type LoadingStateProps = {
  isLoading: boolean;
  children: React.ReactNode;
  loadingComponent?: React.ReactNode;
  overlay?: boolean;
  message?: string;
};

export function LoadingState({
  isLoading,
  children,
  loadingComponent,
  overlay = false,
  message = 'Loading...',
}: LoadingStateProps) {
  if (!isLoading) {
    return <>{children}</>;
  }

  const loading = loadingComponent || (
    <LoadingSpinner message={message} overlay={overlay} />
  );

  if (overlay) {
    return (
      <div style={{ position: 'relative' }}>
        {children}
        {loading}
      </div>
    );
  }

  return <>{loading}</>;
}

// Hook for managing loading states
export function useLoadingState(initialState = false) {
  const [isLoading, setIsLoading] = React.useState(initialState);

  const startLoading = React.useCallback(() => setIsLoading(true), []);
  const stopLoading = React.useCallback(() => setIsLoading(false), []);
  const toggleLoading = React.useCallback(
    () => setIsLoading((prev) => !prev),
    []
  );

  const withLoading = React.useCallback(
    async <T,>(asyncFn: () => Promise<T>): Promise<T> => {
      startLoading();
      try {
        const result = await asyncFn();
        return result;
      } finally {
        stopLoading();
      }
    },
    [startLoading, stopLoading]
  );

  return {
    isLoading,
    startLoading,
    stopLoading,
    toggleLoading,
    withLoading,
  };
}
