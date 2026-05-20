'use client';
import { useSyncExternalStore } from 'react';

// Always return `false` on the server snapshot, `true` on the client
// snapshot. useSyncExternalStore guarantees the value is correct after
// hydration without an effect-driven setState.
const subscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

/**
 * Returns `false` on the server / during hydration, `true` after hydration.
 * Use this instead of `useEffect(() => setMounted(true), [])` patterns —
 * eliminates a render cycle, satisfies React Compiler's
 * react-hooks/set-state-in-effect rule, and is the React 18+ canonical
 * pattern for SSR-safe client detection.
 */
export function useIsMounted(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
