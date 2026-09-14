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

  // The stored value is an external store, so it is read through
  // useSyncExternalStore rather than copied into state from an effect. React uses
  // the server snapshot (null) for SSR and for the hydrating render, which is
  // what keeps this free of a hydration mismatch.
  const storedExpanded = React.useSyncExternalStore(
    React.useCallback(
      (onStoreChange: () => void) => {
        if (!storageKey) return () => {};
        const handler = (event: StorageEvent) => {
          if (event.key === storageKey || event.key === null) onStoreChange();
        };
        window.addEventListener('storage', handler);
        return () => window.removeEventListener('storage', handler);
      },
      [storageKey]
    ),
    React.useCallback(() => {
      if (!storageKey) return null;
      try {
        const stored = window.localStorage.getItem(storageKey);
        return stored == null ? null : stored === 'true';
      } catch {
        return null;
      }
    }, [storageKey]),
    () => null
  );

  // A choice made in this session wins; otherwise the stored value, then the
  // documented default.
  const [override, setOverride] = React.useState<boolean | null>(null);
  const isExpanded = override ?? storedExpanded ?? defaultExpanded;

  const setExpanded = React.useCallback(
    (next: boolean) => {
      setOverride(next);
      if (!storageKey) return;
      try {
        window.localStorage.setItem(storageKey, String(next));
      } catch {
        // ignore storage errors
      }
    },
    [storageKey]
  );

  const expand = React.useCallback(() => setExpanded(true), [setExpanded]);
  const collapse = React.useCallback(() => setExpanded(false), [setExpanded]);
  const toggle = React.useCallback(
    () => setExpanded(!(override ?? storedExpanded ?? defaultExpanded)),
    [setExpanded, override, storedExpanded, defaultExpanded]
  );

  return { isExpanded, expand, collapse, toggle };
}
