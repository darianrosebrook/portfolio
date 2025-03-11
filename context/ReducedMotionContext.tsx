import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';

interface ReducedMotionContextType {
  prefersReducedMotion: boolean;
  setPrefersReducedMotion: (value: boolean) => void;
}

const ReducedMotionContext = createContext<
  ReducedMotionContextType | undefined
>(undefined);

const checkMediaPreference = () => {
  if (typeof window === 'undefined') return false;
  const systemPreference = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;
  const storedPreference = localStorage.getItem('reduce-motion');
  return storedPreference !== null
    ? storedPreference === 'true'
    : systemPreference;
};

export const ReducedMotionProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [prefersReducedMotion, setPrefersReducedMotionState] = useState(
    checkMediaPreference()
  );

  const setPrefersReducedMotion = useCallback((value: boolean) => {
    localStorage.setItem('reduce-motion', String(value));
    setPrefersReducedMotionState(value);
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = (e: MediaQueryListEvent) => {
      if (localStorage.getItem('reduce-motion') === null) {
        setPrefersReducedMotionState(e.matches);
      }
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return (
    <ReducedMotionContext.Provider
      value={{ prefersReducedMotion, setPrefersReducedMotion }}
    >
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
