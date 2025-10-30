'use client';

import { useCallback } from 'react';
import { useSyncExternalStore } from 'react';

const STORAGE_KEY = 'showPerformanceDashboard';

/**
 * Subscribes to localStorage changes for the performance monitor setting
 */
function subscribeStorage(callback: () => void): () => void {
  // Listen for storage events (from other tabs/windows)
  const handleStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      callback();
    }
  };

  window.addEventListener('storage', handleStorage);

  // Return unsubscribe function
  return () => {
    window.removeEventListener('storage', handleStorage);
  };
}

/**
 * Gets the current value from localStorage
 */
function getStorageSnapshot(): boolean {
  if (typeof window === 'undefined') return false;
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored === 'true';
}

/**
 * Custom hook to manage performance monitor visibility state
 * Provides toggle functionality and persists state in localStorage
 * Uses useSyncExternalStore for better SSR support and cross-tab synchronization
 */
export function usePerformanceMonitor() {
  const isEnabled = useSyncExternalStore(
    subscribeStorage,
    getStorageSnapshot,
    () => false // SSR fallback
  );

  const togglePerformanceMonitor = useCallback(
    (enabled?: boolean) => {
      const newState = enabled !== undefined ? enabled : !isEnabled;

      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, newState.toString());

        // Trigger a custom event to notify the PerformanceDashboard component
        window.dispatchEvent(
          new CustomEvent('performanceMonitorToggle', {
            detail: { enabled: newState },
          })
        );
      }
    },
    [isEnabled]
  );

  return {
    isEnabled,
    togglePerformanceMonitor,
  };
}
