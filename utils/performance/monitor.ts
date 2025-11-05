/**
 * Performance Monitoring for Portfolio Site
 * Tracks Core Web Vitals and custom performance metrics
 */

interface PerformanceMetrics {
  fcp: number;
  lcp: number;
  fid: number;
  cls: number;
  ttfb: number;
  navigationStart: number;
}

interface CustomMetrics {
  componentLoadTime: Record<string, number>;
  apiResponseTime: Record<string, number>;
  cacheHitRate: Record<string, { hits: number; misses: number }>;
  bundleSize: number;
  memoryUsage?: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics = {
    fcp: 0,
    lcp: 0,
    fid: 0,
    cls: 0,
    ttfb: 0,
    navigationStart: 0,
  };

  private customMetrics: CustomMetrics = {
    componentLoadTime: {},
    apiResponseTime: {},
    cacheHitRate: {},
    bundleSize: 0,
  };

  private observers: PerformanceObserver[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeObservers();
      this.trackNavigationTiming();
    }
  }

  /**
   * Initialize performance observers for Core Web Vitals and custom metrics.
   *
   * Sets up observers for LCP, FID, CLS, and other performance metrics.
   * Only initializes if running in browser environment.
   */
  private initializeObservers() {
    // First Contentful Paint
    if ('PerformanceObserver' in window) {
      try {
        const fcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const fcpEntry = entries[entries.length - 1];
          this.metrics.fcp = fcpEntry.startTime;
          this.logMetric('FCP', this.metrics.fcp);
        });
        fcpObserver.observe({ entryTypes: ['paint'] });

        // Largest Contentful Paint
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lcpEntry = entries[entries.length - 1];
          this.metrics.lcp = lcpEntry.startTime;
          this.logMetric('LCP', this.metrics.lcp);
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

        // First Input Delay
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            const firstInput = entry as PerformanceEventTiming;
            this.metrics.fid =
              firstInput.processingStart - firstInput.startTime;
            this.logMetric('FID', this.metrics.fid);
          });
        });
        fidObserver.observe({ entryTypes: ['first-input'] });

        // Cumulative Layout Shift
        const clsObserver = new PerformanceObserver((list) => {
          let clsValue = 0;
          const entries = list.getEntries();
          entries.forEach((entry) => {
            const layoutShift = entry as any;
            if (!layoutShift.hadRecentInput) {
              clsValue += layoutShift.value;
            }
          });
          this.metrics.cls = clsValue;
          this.logMetric('CLS', this.metrics.cls);
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });

        this.observers = [fcpObserver, lcpObserver, fidObserver, clsObserver];
      } catch (error) {
        console.warn('Performance monitoring not supported:', error);
      }
    }
  }

  /**
   * Track navigation timing
   */
  private trackNavigationTiming() {
    if ('performance' in window) {
      const navigation = performance.getEntriesByType(
        'navigation'
      )[0] as PerformanceNavigationTiming;
      if (navigation) {
        this.metrics.navigationStart = navigation.startTime;
        this.metrics.ttfb = navigation.responseStart - navigation.requestStart;
        this.logMetric('TTFB', this.metrics.ttfb);
      }
    }
  }

  /**
   * Track component load time
   */
  /**
   * Track component load time for performance monitoring.
   *
   * @param componentName - Name/identifier of the component
   * @param startTime - Timestamp when component loading started (performance.now())
   */
  trackComponentLoad(componentName: string, startTime: number) {
    const loadTime = performance.now() - startTime;
    this.customMetrics.componentLoadTime[componentName] = loadTime;
    this.logMetric(`Component: ${componentName}`, loadTime);
  }

  /**
   * Track API response time
   */
  /**
   * Track API response time for performance monitoring.
   *
   * @param endpoint - API endpoint URL or identifier
   * @param responseTime - Response time in milliseconds
   */
  trackApiResponse(endpoint: string, responseTime: number) {
    this.customMetrics.apiResponseTime[endpoint] = responseTime;
    this.logMetric(`API: ${endpoint}`, responseTime);
  }

  /**
   * Track cache hit rate
   */
  trackCacheHit(cacheName: string, hit: boolean) {
    if (!this.customMetrics.cacheHitRate[cacheName]) {
      this.customMetrics.cacheHitRate[cacheName] = { hits: 0, misses: 0 };
    }

    if (hit) {
      this.customMetrics.cacheHitRate[cacheName].hits++;
    } else {
      this.customMetrics.cacheHitRate[cacheName].misses++;
    }
  }

  /**
   * Track bundle size
   */
  trackBundleSize(size: number) {
    this.customMetrics.bundleSize = size;
    this.logMetric('Bundle Size', size);
  }

  /**
   * Track memory usage (if available)
   */
  trackMemoryUsage() {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      this.customMetrics.memoryUsage = memory.usedJSHeapSize;
      this.logMetric('Memory Usage', memory.usedJSHeapSize);
    }
  }

  /**
   * Log performance metric
   */
  private logMetric(name: string, value: number) {
    console.log(`📊 ${name}: ${value.toFixed(2)}ms`);

    // Send to analytics if available
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'performance_metric', {
        metric_name: name,
        value: value,
      });
    }
  }

  /**
   * Get all performance metrics
   */
  /**
   * Get current performance metrics snapshot.
   *
   * @returns Combined Core Web Vitals and custom performance metrics
   */
  getMetrics(): PerformanceMetrics & CustomMetrics {
    return {
      ...this.metrics,
      ...this.customMetrics,
    };
  }

  /**
   * Get performance report
   */
  /**
   * Generate a comprehensive performance report.
   *
   * @returns Human-readable performance report with scores and recommendations
   */
  getReport() {
    const metrics = this.getMetrics();
    const report = {
      coreWebVitals: {
        fcp: metrics.fcp,
        lcp: metrics.lcp,
        fid: metrics.fid,
        cls: metrics.cls,
        ttfb: metrics.ttfb,
      },
      customMetrics: {
        componentLoadTime: metrics.componentLoadTime,
        apiResponseTime: metrics.apiResponseTime,
        cacheHitRate: metrics.cacheHitRate,
        bundleSize: metrics.bundleSize,
        memoryUsage: metrics.memoryUsage,
      },
      summary: {
        isGood: this.isPerformanceGood(),
        recommendations: this.getRecommendations(),
      },
    };

    return report;
  }

  /**
   * Check if performance is good based on Core Web Vitals
   */
  private isPerformanceGood(): boolean {
    return (
      this.metrics.fcp < 1800 &&
      this.metrics.lcp < 2500 &&
      this.metrics.fid < 100 &&
      this.metrics.cls < 0.1
    );
  }

  /**
   * Get performance recommendations
   */
  private getRecommendations(): string[] {
    const recommendations: string[] = [];

    if (this.metrics.fcp > 1800) {
      recommendations.push(
        'Optimize First Contentful Paint - reduce render-blocking resources'
      );
    }
    if (this.metrics.lcp > 2500) {
      recommendations.push(
        'Optimize Largest Contentful Paint - optimize images and critical resources'
      );
    }
    if (this.metrics.fid > 100) {
      recommendations.push(
        'Optimize First Input Delay - reduce JavaScript execution time'
      );
    }
    if (this.metrics.cls > 0.1) {
      recommendations.push(
        'Optimize Cumulative Layout Shift - ensure stable layout'
      );
    }

    return recommendations;
  }

  /**
   * Cleanup observers
   */
  destroy() {
    this.observers.forEach((observer) => observer.disconnect());
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Auto-track memory usage periodically
if (typeof window !== 'undefined') {
  setInterval(() => {
    performanceMonitor.trackMemoryUsage();
  }, 30000); // Every 30 seconds
}
