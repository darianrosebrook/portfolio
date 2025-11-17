/**
 * Advanced Performance Monitoring
 *
 * Comprehensive performance tracking for modern CSS features,
 * bundle analysis, and runtime performance metrics.
 */

import { performanceMonitor } from './monitor';

// Bundle size tracking with modern CSS awareness
export const bundleAnalyzer = {
  trackChunk: (chunkName: string, size: number) => {
    const kb = size / 1024;

    if (kb > 500) {
      console.warn(`🚨 Large chunk: ${chunkName} (${kb.toFixed(1)}KB)`);
      performanceMonitor.trackMetric('bundle_chunk_large', kb, { chunkName });
    } else if (kb > 100) {
      console.info(`📦 Chunk: ${chunkName} (${kb.toFixed(1)}KB)`);
    }

    // Send to analytics
    if (typeof window !== 'undefined' && 'gtag' in window) {
      (window as any).gtag('event', 'bundle_chunk', {
        chunk_name: chunkName,
        size_kb: kb,
        timestamp: Date.now(),
      });
    }

    performanceMonitor.trackBundleSize(size);
  },

  analyzeDependencies: (componentName: string) => {
    // Analyze which dependencies are loaded for each component
    const deps = getComponentDependencies(componentName);
    const totalSize = deps.reduce((sum, dep) => sum + dep.size, 0);

    const analysis = {
      component: componentName,
      dependencies: deps.length,
      totalSize,
      totalSizeKB: totalSize / 1024,
      largestDep: deps.reduce((max, dep) => (dep.size > max.size ? dep : max), {
        name: '',
        size: 0,
      }),
      deps: deps.map((dep) => ({
        name: dep.name,
        size: dep.size,
        sizeKB: dep.size / 1024,
        percentage: ((dep.size / totalSize) * 100).toFixed(2),
      })),
    };

    if (process.env.NODE_ENV === 'development') {
      console.table(analysis.deps);
      console.log(
        `📊 Component bundle: ${componentName} (${analysis.totalSizeKB.toFixed(1)}KB)`
      );
    }

    return analysis;
  },

  // Track modern CSS feature usage
  trackCSSFeature: (
    feature: string,
    componentName: string,
    impact?: number
  ) => {
    performanceMonitor.trackMetric(`css_feature_${feature}`, impact || 1, {
      component: componentName,
      supported: CSS.supports ? CSS.supports(feature) : false,
    });
  },
};

// CSS performance monitoring
export const cssPerformanceMonitor = {
  trackStyleComputation: (componentName: string, duration: number) => {
    if (duration > 16) {
      // Over 1 frame
      console.warn(
        `🐌 Slow style computation: ${componentName} (${duration.toFixed(2)}ms)`
      );
      performanceMonitor.trackMetric('css_computation_slow', duration, {
        componentName,
      });
    }

    performanceMonitor.trackMetric('css_computation_time', duration, {
      componentName,
    });
  },

  trackStyleRecalculation: (element: Element, duration: number) => {
    if (duration > 8) {
      console.warn(
        `🎨 Slow style recalculation (${duration.toFixed(2)}ms)`,
        element
      );
      performanceMonitor.trackMetric('css_recalculation_slow', duration, {
        element: element.tagName.toLowerCase(),
        className: element.className,
      });
    }
  },

  // Monitor container query performance
  trackContainerQuery: (
    container: Element,
    query: string,
    matched: boolean
  ) => {
    performanceMonitor.trackMetric(
      'container_query_evaluation',
      matched ? 1 : 0,
      {
        container: container.className,
        query,
        matched,
      }
    );
  },

  // Monitor :has() selector performance
  trackHasSelector: (element: Element, selector: string, matched: boolean) => {
    const start = performance.now();
    const result = element.matches(selector);
    const duration = performance.now() - start;

    if (duration > 1) {
      console.warn(
        `🐌 Slow :has() selector: ${selector} (${duration.toFixed(2)}ms)`
      );
    }

    performanceMonitor.trackMetric('has_selector_time', duration, {
      selector,
      matched: result,
      expectedMatch: matched,
    });
  },

  // Monitor logical property usage
  trackLogicalProperty: (property: string, element: Element) => {
    performanceMonitor.trackMetric('logical_property_used', 1, {
      property,
      element: element.tagName.toLowerCase(),
    });
  },
};

// Modern CSS feature detection and monitoring
export const modernCSSMonitor = {
  features: {
    containerQueries: 'container-type: inline-size',
    hasSelector: 'selector(:has(*))',
    logicalProperties: 'margin-inline-start: 1px',
    aspectRatio: 'aspect-ratio: 1',
    whereSelector: 'selector(:where(*))',
  },

  detectSupport: () => {
    const results: Record<string, boolean> = {};

    if (typeof CSS !== 'undefined' && CSS.supports) {
      Object.entries(modernCSSMonitor.features).forEach(([feature, test]) => {
        results[feature] = CSS.supports(test);
      });
    }

    performanceMonitor.trackMetric('css_support_detection', 1, results);
    return results;
  },

  // Track fallback usage
  trackFallback: (feature: string, componentName: string) => {
    console.info(`🔄 Using fallback for ${feature} in ${componentName}`);
    performanceMonitor.trackMetric('css_fallback_used', 1, {
      feature,
      component: componentName,
    });
  },

  // Monitor progressive enhancement
  trackProgressiveEnhancement: (feature: string, enhanced: boolean) => {
    performanceMonitor.trackMetric(
      'progressive_enhancement',
      enhanced ? 1 : 0,
      {
        feature,
        enhanced,
      }
    );
  },
};

// Runtime performance observer
export const runtimePerformanceObserver = {
  observers: new Map<string, PerformanceObserver>(),

  startObserving: () => {
    // Observe layout shifts
    if ('PerformanceObserver' in window) {
      const layoutShiftObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const layoutShift = entry as any;
          if (layoutShift.value > 0.1) {
            console.warn(`📐 Layout shift detected: ${layoutShift.value}`);
            performanceMonitor.trackMetric('layout_shift', layoutShift.value, {
              sources: layoutShift.sources
                ?.map((s: any) => s.node?.tagName)
                .join(','),
            });
          }
        }
      });

      try {
        layoutShiftObserver.observe({ entryTypes: ['layout-shift'] });
        runtimePerformanceObserver.observers.set(
          'layout-shift',
          layoutShiftObserver
        );
      } catch (e) {
        console.warn('Layout shift observation not supported');
      }

      // Observe long tasks
      const longTaskObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const longTask = entry as any;
          if (longTask.duration > 50) {
            console.warn(`⏰ Long task detected: ${longTask.duration}ms`);
            performanceMonitor.trackMetric('long_task', longTask.duration, {
              name: longTask.name,
              startTime: longTask.startTime,
            });
          }
        }
      });

      try {
        longTaskObserver.observe({ entryTypes: ['longtask'] });
        runtimePerformanceObserver.observers.set('longtask', longTaskObserver);
      } catch (e) {
        console.warn('Long task observation not supported');
      }
    }
  },

  stopObserving: () => {
    runtimePerformanceObserver.observers.forEach((observer) =>
      observer.disconnect()
    );
    runtimePerformanceObserver.observers.clear();
  },
};

// Component-specific performance monitoring
export const componentPerformanceMonitor = {
  // Track component render performance
  trackRender: (componentName: string, renderTime: number) => {
    if (renderTime > 16) {
      console.warn(
        `🐌 Slow render: ${componentName} (${renderTime.toFixed(2)}ms)`
      );
      performanceMonitor.trackMetric('component_render_slow', renderTime, {
        componentName,
      });
    }

    performanceMonitor.trackMetric('component_render_time', renderTime, {
      componentName,
    });
  },

  // Track animation performance
  trackAnimation: (
    componentName: string,
    animationName: string,
    duration: number
  ) => {
    performanceMonitor.trackMetric('animation_duration', duration, {
      component: componentName,
      animation: animationName,
    });

    // Detect janky animations
    if (duration > 100) {
      console.warn(
        `🎬 Janky animation: ${animationName} in ${componentName} (${duration}ms)`
      );
    }
  },

  // Track container query evaluations
  trackContainerQueryPerformance: (
    componentName: string,
    container: Element,
    query: string,
    evaluationTime: number
  ) => {
    if (evaluationTime > 1) {
      console.warn(
        `🐌 Slow container query: ${query} in ${componentName} (${evaluationTime.toFixed(2)}ms)`
      );
    }

    performanceMonitor.trackMetric('container_query_time', evaluationTime, {
      component: componentName,
      query,
      containerSize: `${container.clientWidth}x${container.clientHeight}`,
    });
  },
};

// Initialize monitoring on module load
if (typeof window !== 'undefined') {
  // Detect CSS support
  setTimeout(() => {
    modernCSSMonitor.detectSupport();
    runtimePerformanceObserver.startObserving();
  }, 1000);
}

// Helper function for dependency analysis (simplified)
function getComponentDependencies(
  componentName: string
): Array<{ name: string; size: number }> {
  // This would integrate with your build tool to get actual dependency sizes
  // For now, return mock data
  return [
    { name: 'react', size: 45000 },
    { name: 'styled-components', size: 28000 },
    { name: 'framer-motion', size: 15000 },
  ];
}
