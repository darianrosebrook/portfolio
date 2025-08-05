'use client';

import { useState, useEffect } from 'react';
import { performanceMonitor } from '@/utils/performance/monitor';
import { resourceOptimizer } from '@/utils/performance/resourceOptimizer';
import {
  articleCache,
  imageCache,
  apiCache,
} from '@/utils/caching/advancedCache';
import styles from './PerformanceDashboard.module.scss';

interface PerformanceData {
  coreWebVitals: {
    fcp: number;
    lcp: number;
    fid: number;
    cls: number;
    ttfb: number;
  };
  customMetrics: {
    componentLoadTime: Record<string, number>;
    apiResponseTime: Record<string, number>;
    cacheHitRate: Record<string, unknown>;
    bundleSize: number;
    memoryUsage?: number;
  };
  cacheStats: {
    articleCache: {
      size: number;
      averageAge: number;
      totalAccesses: number;
      averageAccesses: number;
    };
    imageCache: {
      size: number;
      averageAge: number;
      totalAccesses: number;
      averageAccesses: number;
    };
    apiCache: {
      size: number;
      averageAge: number;
      totalAccesses: number;
      averageAccesses: number;
    };
  };
  resourceStats: {
    preloadedResources: number;
    prefetchedResources: number;
    establishedConnections: number;
  };
}

export default function PerformanceDashboard() {
  const [isVisible, setIsVisible] = useState(false);
  const [performanceData, setPerformanceData] =
    useState<PerformanceData | null>(null);

  useEffect(() => {
    const updatePerformanceData = () => {
      const report = performanceMonitor.getReport();
      const cacheStats = {
        articleCache: articleCache.getStats(),
        imageCache: imageCache.getStats(),
        apiCache: apiCache.getStats(),
      };
      const resourceStats = resourceOptimizer.getStats();

      setPerformanceData({
        ...report,
        cacheStats,
        resourceStats,
      });
    };

    // Update data every 5 seconds
    const interval = setInterval(updatePerformanceData, 5000);
    updatePerformanceData(); // Initial update

    return () => clearInterval(interval);
  }, []);

  if (!isVisible) {
    return (
      <button
        className={styles.toggleButton}
        onClick={() => setIsVisible(true)}
        title="Show Performance Dashboard"
      >
        📊
      </button>
    );
  }

  if (!performanceData) {
    return (
      <div className={styles.dashboard}>
        <div className={styles.header}>
          <h3>Performance Dashboard</h3>
          <button onClick={() => setIsVisible(false)}>×</button>
        </div>
        <div className={styles.loading}>Loading performance data...</div>
      </div>
    );
  }

  const { coreWebVitals, customMetrics, cacheStats, resourceStats } =
    performanceData;

  const getStatusColor = (value: number, threshold: number) => {
    return value <= threshold
      ? 'green'
      : value <= threshold * 1.5
        ? 'yellow'
        : 'red';
  };

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <h3>Performance Dashboard</h3>
        <button onClick={() => setIsVisible(false)}>×</button>
      </div>

      <div className={styles.content}>
        {/* Core Web Vitals */}
        <section className={styles.section}>
          <h4>Core Web Vitals</h4>
          <div className={styles.metrics}>
            <div className={styles.metric}>
              <span className={styles.label}>FCP</span>
              <span
                className={`${styles.value} ${styles[getStatusColor(coreWebVitals.fcp, 1800)]}`}
              >
                {coreWebVitals.fcp.toFixed(0)}ms
              </span>
            </div>
            <div className={styles.metric}>
              <span className={styles.label}>LCP</span>
              <span
                className={`${styles.value} ${styles[getStatusColor(coreWebVitals.lcp, 2500)]}`}
              >
                {coreWebVitals.lcp.toFixed(0)}ms
              </span>
            </div>
            <div className={styles.metric}>
              <span className={styles.label}>FID</span>
              <span
                className={`${styles.value} ${styles[getStatusColor(coreWebVitals.fid, 100)]}`}
              >
                {coreWebVitals.fid.toFixed(0)}ms
              </span>
            </div>
            <div className={styles.metric}>
              <span className={styles.label}>CLS</span>
              <span
                className={`${styles.value} ${styles[getStatusColor(coreWebVitals.cls, 0.1)]}`}
              >
                {coreWebVitals.cls.toFixed(3)}
              </span>
            </div>
            <div className={styles.metric}>
              <span className={styles.label}>TTFB</span>
              <span className={styles.value}>
                {coreWebVitals.ttfb.toFixed(0)}ms
              </span>
            </div>
          </div>
        </section>

        {/* Cache Statistics */}
        <section className={styles.section}>
          <h4>Cache Performance</h4>
          <div className={styles.metrics}>
            <div className={styles.metric}>
              <span className={styles.label}>Article Cache</span>
              <span className={styles.value}>
                {cacheStats.articleCache.size} items
              </span>
            </div>
            <div className={styles.metric}>
              <span className={styles.label}>Image Cache</span>
              <span className={styles.value}>
                {cacheStats.imageCache.size} items
              </span>
            </div>
            <div className={styles.metric}>
              <span className={styles.label}>API Cache</span>
              <span className={styles.value}>
                {cacheStats.apiCache.size} items
              </span>
            </div>
          </div>
        </section>

        {/* Resource Optimization */}
        <section className={styles.section}>
          <h4>Resource Optimization</h4>
          <div className={styles.metrics}>
            <div className={styles.metric}>
              <span className={styles.label}>Preloaded</span>
              <span className={styles.value}>
                {resourceStats.preloadedResources} resources
              </span>
            </div>
            <div className={styles.metric}>
              <span className={styles.label}>Prefetched</span>
              <span className={styles.value}>
                {resourceStats.prefetchedResources} resources
              </span>
            </div>
            <div className={styles.metric}>
              <span className={styles.label}>Connections</span>
              <span className={styles.value}>
                {resourceStats.establishedConnections} established
              </span>
            </div>
          </div>
        </section>

        {/* Memory Usage */}
        {customMetrics.memoryUsage && (
          <section className={styles.section}>
            <h4>Memory Usage</h4>
            <div className={styles.metric}>
              <span className={styles.label}>Used Heap</span>
              <span className={styles.value}>
                {(customMetrics.memoryUsage / 1024 / 1024).toFixed(1)}MB
              </span>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
