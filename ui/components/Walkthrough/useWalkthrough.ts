/** Headless logic hook for Walkthrough */
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { WalkthroughStepSpec } from './types';

type PersistedState = { index?: number; completed?: boolean };

const storage = {
  get(key?: string) {
    if (!key || typeof window === 'undefined') return null;
    try {
      return JSON.parse(localStorage.getItem(key) || 'null');
    } catch {
      return null;
    }
  },
  set(key: string | undefined, value: PersistedState) {
    if (!key || typeof window === 'undefined') return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Silently fail if localStorage is not available
    }
  },
  remove(key?: string) {
    if (!key || typeof window === 'undefined') return;
    try {
      localStorage.removeItem(key);
    } catch {
      // Silently fail if localStorage is not available
    }
  },
};

function toElement(target?: string | HTMLElement | null): HTMLElement | null {
  if (!target || typeof window === 'undefined') return null;
  if (typeof target === 'string') {
    return document.querySelector(target) as HTMLElement | null;
  }
  return target as HTMLElement;
}

export interface UseWalkthroughOptions {
  stepsProp?: WalkthroughStepSpec[];
  defaultIndex?: number;
  index?: number;
  onIndexChange?(next: number, prev: number): void;
  storageKey?: string;
  autoStart?: boolean;
  allowConcurrent?: boolean;
  closeOnOutsideClick?: boolean;
  onStart?(): void;
  onComplete?(): void;
  onCancel?(): void;
}

export function useWalkthrough(opts: UseWalkthroughOptions) {
  const {
    stepsProp = [],
    defaultIndex = 0,
    index,
    onIndexChange,
    storageKey,
    autoStart = false,
    allowConcurrent = true,
    closeOnOutsideClick = true,
    onStart,
    onComplete,
    onCancel,
  } = opts;

  const persisted = storage.get(storageKey) as {
    index?: number;
    completed?: boolean;
  } | null;

  const [internalIndex, setInternalIndex] = useState<number>(() => {
    if (typeof index === 'number') return index;
    if (persisted?.completed) return -1;
    if (typeof persisted?.index === 'number') return persisted.index;
    return autoStart ? defaultIndex : -1;
  });

  const isControlled = typeof index === 'number';
  const currentIndex = isControlled ? (index as number) : internalIndex;

  const steps = useMemo(() => stepsProp, [stepsProp]);
  const count = steps.length;

  const [open, setOpen] = useState<boolean>(() => currentIndex >= 0);
  // Concurrent instance guard (simple global flag)
  const concurrentGuard = React.useMemo(() => {
    const key = '__walkthrough_open__';
    return {
      canOpen: (): boolean => {
        if (typeof window === 'undefined') return true;
        return allowConcurrent || !(window as any)[key];
      },
      setOpen: (value: boolean) => {
        if (typeof window === 'undefined') return;
        (window as any)[key] = value;
      },
    };
  }, [allowConcurrent]);

  const [completed, setCompleted] = useState<boolean>(!!persisted?.completed);

  // Anchor resolution
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const resolver = useCallback(() => {
    const step = steps[currentIndex];
    setAnchorEl(step ? toElement(step.target ?? null) : null);
  }, [steps, currentIndex]);

  // Start/Cancel/Complete
  const start = useCallback(
    (i = 0) => {
      if (count === 0) return;
      if (!concurrentGuard.canOpen()) return;
      if (!isControlled) setInternalIndex(i);
      setOpen(true);
      concurrentGuard.setOpen(true);
      setCompleted(false);
      storage.set(storageKey, { index: i, completed: false });
      onStart?.();
    },
    [count, isControlled, storageKey, onStart, concurrentGuard]
  );

  const cancel = useCallback(() => {
    setOpen(false);
    concurrentGuard.setOpen(false);
    if (!isControlled) setInternalIndex(-1);
    storage.remove(storageKey);
    onCancel?.();
  }, [isControlled, onCancel, storageKey, concurrentGuard]);

  const complete = useCallback(() => {
    setOpen(false);
    concurrentGuard.setOpen(false);
    setCompleted(true);
    storage.set(storageKey, { index: count - 1, completed: true });
    onComplete?.();
  }, [count, onComplete, storageKey, concurrentGuard]);

  const goTo = useCallback(
    (i: number) => {
      if (i < 0 || i >= count) return;
      const prev = currentIndex;
      const next = i;
      // per-step hooks
      if (prev >= 0 && prev < steps.length) {
        steps[prev]?.onExit?.(prev);
      }
      if (next >= 0 && next < steps.length) {
        steps[next]?.onEnter?.(next);
      }
      if (!isControlled) setInternalIndex(next);
      onIndexChange?.(next, prev);
      storage.set(storageKey, { index: next, completed: false });
      setOpen(true);
    },
    [count, currentIndex, isControlled, onIndexChange, steps, storageKey]
  );

  const next = useCallback(() => {
    const nextIdx = currentIndex + 1;
    if (nextIdx >= count) return complete();
    goTo(nextIdx);
  }, [currentIndex, count, complete, goTo]);

  const prev = useCallback(() => {
    const prevIdx = currentIndex - 1;
    if (prevIdx < 0) return;
    goTo(prevIdx);
  }, [currentIndex, goTo]);

  // Resolve anchor whenever step changes or layout possibly changed.
  // The setAnchorEl inside resolver() is the entire purpose of this effect:
  // we need to re-query the DOM for the current step's target whenever the
  // step changes or the viewport reflows. There's no derive-at-render
  // alternative because toElement() does document.querySelector — a DOM
  // read during render would be its own anti-pattern. React 19's
  // useEffectEvent would let us mark this intentional; until that's stable
  // the rule disagrees with the load-bearing pattern.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional DOM-to-state sync on step/layout change
    resolver();
    if (typeof window === 'undefined') return;

    const onResize = () => resolver();
    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', onResize, true);
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onResize, true);
    };
  }, [resolver]);

  // Minimal scroll-into-view on step changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const el = anchorEl;
    if (!el) return;
    // Respect reduced motion; rely on scroll-margin CSS where possible
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    try {
      el.scrollIntoView({
        block: 'nearest',
        inline: 'nearest',
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
      });
    } catch {
      // noop
    }
  }, [anchorEl, currentIndex]);

  // Auto-start once on mount when conditions are met. The setState chain
  // inside start() (setOpen / setInternalIndex / setCompleted) plus the
  // onStart?.() callback need to fire after mount, not during render, so
  // an effect is the right shape — the lint rule still flags it. Guard
  // with a ref so we fire at most once even if deps change.
  const hasAutoStartedRef = useRef(false);
  useEffect(() => {
    if (hasAutoStartedRef.current) return;
    if (autoStart && currentIndex < 0 && !completed && count > 0) {
      hasAutoStartedRef.current = true;
      // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional once-on-mount auto-start
      start();
    }
  }, [autoStart, completed, count, currentIndex, start]);

  return {
    steps,
    count,
    index: currentIndex,
    current: Math.max(0, currentIndex),
    started: currentIndex >= 0,
    completed,
    open,
    anchorEl,
    resolveAnchor: resolver,
    start,
    cancel,
    complete,
    next,
    prev,
    goTo,
    closeOnOutsideClick,
  };
}
