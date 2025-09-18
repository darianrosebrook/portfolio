/** Headless logic hook for SideNavigation */
import * as React from 'react';

export interface UseSideNavigationOptions {
  /** Initial expanded state when no stored value exists */
  defaultExpanded?: boolean;
  /** Optional localStorage key to persist expanded state */
  storageKey?: string;
}

export interface UseSideNavigationReturn {
  isExpanded: boolean;
  expand: () => void;
  collapse: () => void;
  toggle: () => void;
}

export function useSideNavigation(
  options: UseSideNavigationOptions = {}
): UseSideNavigationReturn {
  const { defaultExpanded = false, storageKey } = options;

  const [isExpanded, setIsExpanded] = React.useState<boolean>(defaultExpanded);

  // Hydrate from storage on mount in a client-safe way
  React.useEffect(() => {
    if (!storageKey) return;
    try {
      const stored = window.localStorage.getItem(storageKey);
      if (stored != null) {
        setIsExpanded(stored === 'true');
      }
    } catch (_) {
      // ignore storage errors
    }
  }, [storageKey]);

  // Persist to storage when changed
  React.useEffect(() => {
    if (!storageKey) return;
    try {
      window.localStorage.setItem(storageKey, String(isExpanded));
    } catch (_) {
      // ignore storage errors
    }
  }, [isExpanded, storageKey]);

  const expand = React.useCallback(() => setIsExpanded(true), []);
  const collapse = React.useCallback(() => setIsExpanded(false), []);
  const toggle = React.useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  return { isExpanded, expand, collapse, toggle };
}
