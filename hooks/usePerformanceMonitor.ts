'use client';

import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook to manage performance monitor visibility state
 * Provides toggle functionality and persists state in localStorage
 */
export function usePerformanceMonitor() {
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    // Check localStorage on mount
    const stored = localStorage.getItem('showPerformanceDashboard');
    setIsEnabled(stored === 'true');
  }, []);

  const togglePerformanceMonitor = useCallback(
    (enabled?: boolean) => {
      const newState = enabled !== undefined ? enabled : !isEnabled;
      setIsEnabled(newState);
      localStorage.setItem('showPerformanceDashboard', newState.toString());

      // Trigger a custom event to notify the PerformanceDashboard component
      window.dispatchEvent(
        new CustomEvent('performanceMonitorToggle', {
          detail: { enabled: newState },
        })
      );
    },
    [isEnabled]
  );

  return {
    isEnabled,
    togglePerformanceMonitor,
  };
}
