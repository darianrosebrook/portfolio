'use client';

import React, { useState, useEffect } from 'react';
import styles from './PerformanceDashboard.module.scss';

interface PerformanceData {
  fcp?: number;
  lcp?: number;
  cls?: number;
  fid?: number;
  tbt?: number;
  cacheStats?: Record<string, { hits: number; misses: number }>;
  cacheHitRate?: number;
}

/**
 * Performance monitoring dashboard component
 * Displays real-time performance metrics and cache statistics
 */
const PerformanceDashboard: React.FC = () => {
  const [performanceData, setPerformanceData] = useState<PerformanceData>({});
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show when explicitly enabled via localStorage
    // Disabled by default even in development to avoid clutter
    const shouldShow =
      localStorage.getItem('showPerformanceDashboard') === 'true';

    setIsVisible(shouldShow);

    // Listen for toggle events from the navigation menu
    const handleToggle = (event: CustomEvent) => {
      setIsVisible(event.detail.enabled);
    };

    window.addEventListener(
      'performanceMonitorToggle',
      handleToggle as EventListener
    );

    if (shouldShow) {
      // Collect performance metrics
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming;
            setPerformanceData((prev) => ({
              ...prev,
              fcp: navEntry.loadEventEnd - navEntry.startTime,
            }));
          }
        }
      });

      try {
        observer.observe({ entryTypes: ['navigation', 'measure'] });
      } catch {
        // Performance Observer not supported
        console.debug('Performance Observer not supported');
      }

      return () => {
        observer.disconnect();
        window.removeEventListener(
          'performanceMonitorToggle',
          handleToggle as EventListener
        );
      };
    }

    return () => {
      window.removeEventListener(
        'performanceMonitorToggle',
        handleToggle as EventListener
      );
    };
  }, []);

  if (!isVisible) {
    return null;
  }

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <h3>Performance Monitor</h3>
        <button
          onClick={() => {
            localStorage.setItem('showPerformanceDashboard', 'false');
            setIsVisible(false);
          }}
          className={styles.closeButton}
        >
          ×
        </button>
      </div>
      <div className={styles.metrics}>
        {performanceData.fcp && (
          <div className={styles.metric}>
            <span className={styles.label}>FCP:</span>
            <span className={styles.value}>
              {performanceData.fcp.toFixed(0)}ms
            </span>
          </div>
        )}
        {performanceData.lcp && (
          <div className={styles.metric}>
            <span className={styles.label}>LCP:</span>
            <span className={styles.value}>
              {performanceData.lcp.toFixed(0)}ms
            </span>
          </div>
        )}
        {performanceData.cls !== undefined && (
          <div className={styles.metric}>
            <span className={styles.label}>CLS:</span>
            <span className={styles.value}>
              {performanceData.cls.toFixed(3)}
            </span>
          </div>
        )}
        {performanceData.cacheHitRate !== undefined && (
          <div className={styles.metric}>
            <span className={styles.label}>Cache:</span>
            <span className={styles.value}>
              {(performanceData.cacheHitRate * 100).toFixed(1)}%
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default PerformanceDashboard;
