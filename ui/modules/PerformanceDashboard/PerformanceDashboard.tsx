'use client';

import React, { useState, useEffect } from 'react';
import './PerformanceDashboard.css';

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
  const [isVisible, setIsVisible] = useState(
    () =>
      typeof window !== 'undefined' &&
      localStorage.getItem('showPerformanceDashboard') === 'true'
  );

  useEffect(() => {
    // Listen for toggle events from the navigation menu
    const handleToggle = (event: CustomEvent) => {
      setIsVisible(event.detail.enabled);
    };

    window.addEventListener(
      'performanceMonitorToggle',
      handleToggle as EventListener
    );

    if (isVisible) {
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
  }, [isVisible]);

  if (!isVisible) {
    return null;
  }

  return (
    <div data-ds-component="PerformanceDashboard">
      <div className="header">
        <h3>Performance Monitor</h3>
        <button
          onClick={() => {
            localStorage.setItem('showPerformanceDashboard', 'false');
            setIsVisible(false);
          }}
          className="closeButton"
        >
          ×
        </button>
      </div>
      <div className="metrics">
        {performanceData.fcp && (
          <div className="metric">
            <span className="label">FCP:</span>
            <span className="value">{performanceData.fcp.toFixed(0)}ms</span>
          </div>
        )}
        {performanceData.lcp && (
          <div className="metric">
            <span className="label">LCP:</span>
            <span className="value">{performanceData.lcp.toFixed(0)}ms</span>
          </div>
        )}
        {performanceData.cls !== undefined && (
          <div className="metric">
            <span className="label">CLS:</span>
            <span className="value">{performanceData.cls.toFixed(3)}</span>
          </div>
        )}
        {performanceData.cacheHitRate !== undefined && (
          <div className="metric">
            <span className="label">Cache:</span>
            <span className="value">
              {(performanceData.cacheHitRate * 100).toFixed(1)}%
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default PerformanceDashboard;
