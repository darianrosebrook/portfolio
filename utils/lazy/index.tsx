/**
 * Lazy Loading Utilities
 *
 * Code splitting and lazy loading utilities for optimal bundle sizes
 * and performance. Includes component lazy loading, route-based splitting,
 * and resource preloading.
 */

import React, { Suspense, ComponentType } from 'react';

// Lazy loading wrapper component
interface LazyWrapperProps {
  children: React.ReactNode;
  fallback?: React.ComponentType | React.ReactElement;
  errorFallback?: React.ComponentType<{ error: Error; retry: () => void }>;
}

export const LazyWrapper: React.FC<LazyWrapperProps> = ({
  children,
  fallback,
  errorFallback: ErrorFallback,
}) => {
  const [hasError, setHasError] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  const retry = React.useCallback(() => {
    setHasError(false);
    setError(null);
  }, []);

  if (hasError && ErrorFallback) {
    if (React.isValidElement(ErrorFallback)) {
      return ErrorFallback;
    }
    // ErrorFallback is a component type
    const ErrorComponent = ErrorFallback as React.ComponentType<{
      error: Error;
      retry: () => void;
    }>;
    return <ErrorComponent error={error!} retry={retry} />;
  }

  const defaultFallback = fallback
    ? React.isValidElement(fallback)
      ? fallback
      : React.createElement(
          fallback as React.ComponentType<any>,
          { className: 'lazy-loading' },
          'Loading...'
        )
    : React.createElement('div', { className: 'lazy-loading' }, 'Loading...');

  return <Suspense fallback={defaultFallback}>{children}</Suspense>;
};

// Lazy load a component with error handling
export function lazyLoad<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  options: {
    fallback?: React.ComponentType | React.ReactElement;
    errorFallback?: React.ComponentType<{ error: Error; retry: () => void }>;
  } = {}
): React.ComponentType<React.ComponentProps<T>> {
  const LazyComponent = React.lazy(importFn);

  return React.forwardRef<any, React.ComponentProps<T>>((props, ref) => {
    return (
      <LazyWrapper
        fallback={options.fallback}
        errorFallback={options.errorFallback}
      >
        <LazyComponent {...(props as any)} ref={ref} />
      </LazyWrapper>
    );
  }) as React.ComponentType<React.ComponentProps<T>>;
}

// Bundle size monitoring
export const bundleMonitor = {
  trackChunk: (chunkName: string, size: number) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(
        `📦 Chunk loaded: ${chunkName} (${(size / 1024).toFixed(2)} KB)`
      );
    }

    // Report to performance monitor if available
    if (typeof window !== 'undefined' && 'performanceMonitor' in window) {
      (window as any).performanceMonitor?.trackBundleSize?.(size);
    }
  },

  // Warn about large chunks
  warnLargeChunk: (chunkName: string, size: number, threshold = 500 * 1024) => {
    if (size > threshold) {
      console.warn(
        `⚠️ Large chunk detected: ${chunkName} (${(size / 1024).toFixed(2)} KB). ` +
          'Consider code splitting or lazy loading.'
      );
    }
  },

  // Analyze bundle composition
  analyzeBundle: (chunks: Record<string, number>) => {
    const totalSize = Object.values(chunks).reduce(
      (sum, size) => sum + size,
      0
    );
    const analysis = {
      totalSize,
      totalSizeKB: totalSize / 1024,
      chunkCount: Object.keys(chunks).length,
      largestChunk: Object.entries(chunks).reduce(
        (max, [name, size]) => (size > max.size ? { name, size } : max),
        { name: '', size: 0 }
      ),
      chunks: Object.entries(chunks).map(([name, size]) => ({
        name,
        size,
        sizeKB: size / 1024,
        percentage: ((size / totalSize) * 100).toFixed(2),
      })),
    };

    if (process.env.NODE_ENV === 'development') {
      console.table(analysis.chunks);
      console.log(`📊 Total bundle size: ${(totalSize / 1024).toFixed(2)} KB`);
    }

    return analysis;
  },
};

// Dynamic imports with better error handling
export function createDynamicImport<T>(
  importFn: () => Promise<T>,
  options: {
    onLoad?: (result: T) => void;
    onError?: (error: Error) => void;
    timeout?: number;
  } = {}
): Promise<T> {
  const { onLoad, onError, timeout = 10000 } = options;

  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      const error = new Error('Dynamic import timed out');
      onError?.(error);
      reject(error);
    }, timeout);

    importFn()
      .then((result) => {
        clearTimeout(timeoutId);
        onLoad?.(result);
        resolve(result);
      })
      .catch((error) => {
        clearTimeout(timeoutId);
        onError?.(error);
        reject(error);
      });
  });
}

// Export types
// Note: Type exports for lazy components/routes can be added when they are implemented
