'use client';

import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook to manage performance monitor visibility state
 * Provides toggle functionality and persists state in localStorage
 */
export function usePerformanceMonitor() {
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    // Check localStorage on mount. Read here rather than in a lazy useState
    // initializer because localStorage does not exist during SSR: seeding
    // initial state from it would throw on the server and diverge from the
    // server markup on the client. useSyncExternalStore is the principled
    // alternative and is tracked as follow-up work.
    const stored = localStorage.getItem('showPerformanceDashboard');
    // eslint-disable-next-line react-hooks/set-state-in-effect
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
