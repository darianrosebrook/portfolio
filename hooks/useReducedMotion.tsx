'use client';
import { useState, useEffect, useCallback } from 'react';

interface ReducedMotionState {
  prefersReducedMotion: boolean;
  setPrefersReducedMotion: (shouldReduce: boolean) => void;
}

const checkMediaPreference = () => {
  if (typeof window === 'undefined') return false;

  const systemPreference = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const bodyPreference = document.body.classList.contains('reduce-motion');
  const storedPreference = localStorage.getItem('reduce-motion');

  if (storedPreference !== null) {
      return storedPreference === 'true';
  }

  return systemPreference || bodyPreference;
};

export const useReducedMotion = (): ReducedMotionState => { 

  const [prefersReducedMotion, setIsReduced] = useState<boolean>(checkMediaPreference()); 

  useEffect(() => {
    if (typeof window === 'undefined') return;

 
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = (event: MediaQueryListEvent) => {
        if (localStorage.getItem('reduce-motion') === null) {
            setIsReduced(event.matches);
        }
    };

    mediaQuery.addEventListener('change', handleChange);  

    if (prefersReducedMotion) {
        document.body.classList.add('reduce-motion');
    } else {
        document.body.classList.remove('reduce-motion');
    }

    return () => {
        mediaQuery.removeEventListener('change', handleChange);
    };
}, [prefersReducedMotion]);

  const setPrefersReducedMotion = useCallback((shouldReduce: boolean) => {
    setIsReduced(shouldReduce);
  }, []);
  
  return {
    prefersReducedMotion,
    setPrefersReducedMotion 
  };
};