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
  errorFallback: ErrorFallback
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
    return <ErrorFallback error={error!} retry={retry} />;
  }

  const defaultFallback = React.createElement(
    fallback || 'div',
    { className: 'lazy-loading' },
    'Loading...'
  );

  return (
    <Suspense fallback={defaultFallback}>
      {children}
    </Suspense>
  );
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

  return React.forwardRef<any, React.ComponentProps<T>>((props, ref) => (
    <LazyWrapper
      fallback={options.fallback}
      errorFallback={options.errorFallback}
    >
      <LazyComponent {...props} ref={ref} />
    </LazyWrapper>
  ));
}

// Predefined lazy-loaded components
export const lazyComponents = {
  // Heavy components loaded on demand
  Chart: lazyLoad(() => import('../components/Chart')),
  CodeEditor: lazyLoad(() => import('../components/CodeEditor')),
  DataTable: lazyLoad(() => import('../components/DataTable')),
  RichTextEditor: lazyLoad(() => import('../components/RichTextEditor')),
  Calendar: lazyLoad(() => import('../components/Calendar')),
  DatePicker: lazyLoad(() => import('../components/DatePicker')),

  // Modal components
  ConfirmDialog: lazyLoad(() => import('../components/ConfirmDialog')),
  ImageGallery: lazyLoad(() => import('../components/ImageGallery')),
  FileUpload: lazyLoad(() => import('../components/FileUpload')),

  // Specialized components
  SyntaxHighlighter: lazyLoad(() => import('../components/SyntaxHighlighter')),
  VideoPlayer: lazyLoad(() => import('../components/VideoPlayer')),
  MapComponent: lazyLoad(() => import('../components/Map')),
} as const;

// Route-based code splitting
export const lazyRoutes = {
  // Dashboard pages
  Dashboard: lazyLoad(() => import('../pages/Dashboard')),
  Analytics: lazyLoad(() => import('../pages/Analytics')),
  Settings: lazyLoad(() => import('../pages/Settings')),

  // Content pages
  Articles: lazyLoad(() => import('../pages/Articles')),
  ArticlesEdit: lazyLoad(() => import('../pages/Articles/Edit')),
  CaseStudies: lazyLoad(() => import('../pages/CaseStudies')),
  Portfolio: lazyLoad(() => import('../pages/Portfolio')),

  // Admin pages
  Admin: lazyLoad(() => import('../pages/Admin')),
  AdminUsers: lazyLoad(() => import('../pages/Admin/Users')),
  AdminContent: lazyLoad(() => import('../pages/Admin/Content')),
} as const;

// Resource preloading utilities
export const preloadUtils = {
  // Preload a component
  preloadComponent: (componentName: keyof typeof lazyComponents) => {
    const component = lazyComponents[componentName];
    if (component && 'preload' in component) {
      (component as any).preload();
    }
  },

  // Preload a route
  preloadRoute: (routeName: keyof typeof lazyRoutes) => {
    const route = lazyRoutes[routeName];
    if (route && 'preload' in route) {
      (route as any).preload();
    }
  },

  // Preload multiple components
  preloadComponents: (componentNames: (keyof typeof lazyComponents)[]) => {
    componentNames.forEach(name => preloadUtils.preloadComponent(name));
  },

  // Preload on user interaction
  preloadOnHover: (
    element: HTMLElement,
    componentName: keyof typeof lazyComponents
  ) => {
    let preloadTimeout: number;

    const handleMouseEnter = () => {
      preloadTimeout = window.setTimeout(() => {
        preloadUtils.preloadComponent(componentName);
      }, 100); // Small delay to avoid unnecessary preloads
    };

    const handleMouseLeave = () => {
      clearTimeout(preloadTimeout);
    };

    element.addEventListener('mouseenter', handleMouseEnter);
    element.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      element.removeEventListener('mouseenter', handleMouseEnter);
      element.removeEventListener('mouseleave', handleMouseLeave);
      clearTimeout(preloadTimeout);
    };
  },

  // Preload on scroll proximity
  preloadOnVisible: (
    element: HTMLElement,
    componentName: keyof typeof lazyComponents,
    rootMargin = '50px'
  ) => {
    if (!('IntersectionObserver' in window)) return () => {};

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            preloadUtils.preloadComponent(componentName);
            observer.disconnect();
          }
        });
      },
      { rootMargin }
    );

    observer.observe(element);

    return () => observer.disconnect();
  },

  // Intelligent preloading based on user behavior
  createSmartPreloader: () => {
    const preloadedComponents = new Set<string>();
    const preloadQueue: Array<() => void> = [];
    let isProcessing = false;

    const processQueue = async () => {
      if (isProcessing || preloadQueue.length === 0) return;

      isProcessing = true;

      while (preloadQueue.length > 0) {
        const preloadFn = preloadQueue.shift();
        if (preloadFn) {
          try {
            await preloadFn();
            // Small delay between preloads to avoid overwhelming the network
            await new Promise(resolve => setTimeout(resolve, 100));
          } catch (error) {
            console.warn('Preload failed:', error);
          }
        }
      }

      isProcessing = false;
    };

    return {
      preload: (componentName: keyof typeof lazyComponents) => {
        if (preloadedComponents.has(componentName)) return;

        preloadQueue.push(() => {
          preloadUtils.preloadComponent(componentName);
          preloadedComponents.add(componentName);
        });

        processQueue();
      },

      preloadMultiple: (componentNames: (keyof typeof lazyComponents)[]) => {
        componentNames.forEach(name => {
          if (!preloadedComponents.has(name)) {
            preloadQueue.push(() => {
              preloadUtils.preloadComponent(name);
              preloadedComponents.add(name);
            });
          }
        });

        processQueue();
      }
    };
  }
};

// Bundle size monitoring
export const bundleMonitor = {
  trackChunk: (chunkName: string, size: number) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`📦 Chunk loaded: ${chunkName} (${(size / 1024).toFixed(2)} KB)`);
    }

    // Report to performance monitor
    performanceMonitor.trackBundleSize(size);
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
    const totalSize = Object.values(chunks).reduce((sum, size) => sum + size, 0);
    const analysis = {
      totalSize,
      totalSizeKB: totalSize / 1024,
      chunkCount: Object.keys(chunks).length,
      largestChunk: Object.entries(chunks).reduce((max, [name, size]) =>
        size > max.size ? { name, size } : max,
        { name: '', size: 0 }
      ),
      chunks: Object.entries(chunks).map(([name, size]) => ({
        name,
        size,
        sizeKB: size / 1024,
        percentage: (size / totalSize * 100).toFixed(2)
      }))
    };

    if (process.env.NODE_ENV === 'development') {
      console.table(analysis.chunks);
      console.log(`📊 Total bundle size: ${(totalSize / 1024).toFixed(2)} KB`);
    }

    return analysis;
  }
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
export type LazyComponentName = keyof typeof lazyComponents;
export type LazyRouteName = keyof typeof lazyRoutes;


