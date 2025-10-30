import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';

interface ReducedMotionContextType {
  prefersReducedMotion: boolean;
  setPrefersReducedMotion: (value: boolean) => void;
}

const ReducedMotionContext = createContext<
  ReducedMotionContextType | undefined
>(undefined);

const REDUCE_MOTION_KEY = 'reduce-motion';

/**
 * Checks media preference and localStorage for reduced motion preference
 * SSR-safe
 */
const checkMediaPreference = (): boolean => {
  if (typeof window === 'undefined') return false;
  const systemPreference = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;
  const storedPreference = localStorage.getItem(REDUCE_MOTION_KEY);
  return storedPreference !== null
    ? storedPreference === 'true'
    : systemPreference;
};

export const ReducedMotionProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [prefersReducedMotion, setPrefersReducedMotionState] =
    useState(checkMediaPreference);

  const setPrefersReducedMotion = useCallback((value: boolean) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(REDUCE_MOTION_KEY, String(value));
    }
    setPrefersReducedMotionState(value);
  }, []);

  useEffect(() => {
    // Early return for SSR
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    const handleChange = (e: MediaQueryListEvent) => {
      // Only update if user hasn't explicitly set a preference
      if (localStorage.getItem(REDUCE_MOTION_KEY) === null) {
        setPrefersReducedMotionState(e.matches);
      }
    };

    // Use addEventListener for better browser support
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, []);

  const contextValue = useMemo(
    () => ({
      prefersReducedMotion,
      setPrefersReducedMotion,
    }),
    [prefersReducedMotion, setPrefersReducedMotion]
  );

  return (
    <ReducedMotionContext.Provider value={contextValue}>
      {children}
    </ReducedMotionContext.Provider>
  );
};

export const useReducedMotion = (): ReducedMotionContextType => {
  const context = useContext(ReducedMotionContext);
  if (!context) {
    throw new Error(
      'useReducedMotion must be used within a ReducedMotionProvider'
    );
  }
  return context;
};
