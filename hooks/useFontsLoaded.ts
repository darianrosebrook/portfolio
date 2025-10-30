'use client';

import { useState, useEffect, useRef } from 'react';

/**
 * Hook to detect when fonts are loaded and ready for use
 * This prevents SplitText from being called before fonts are loaded,
 * which can cause incorrect measurements and layout issues.
 *
 * @returns boolean indicating if fonts are loaded
 */
export function useFontsLoaded(): boolean {
  // SSR-safe initial state
  const [fontsLoaded, setFontsLoaded] = useState(() => {
    if (typeof document === 'undefined') return false;
    return document.fonts?.status === 'loaded';
  });

  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    // Early return for SSR
    if (typeof document === 'undefined') {
      return;
    }

    // Check if document.fonts is available (modern browsers)
    if ('fonts' in document && document.fonts) {
      // If fonts are already loaded, set immediately
      if (document.fonts.status === 'loaded') {
        setFontsLoaded(true);
        return;
      }

      let isCleanedUp = false;
      let checkInterval: ReturnType<typeof setInterval> | null = null;
      let maxTimeout: ReturnType<typeof setTimeout> | null = null;
      let fallbackTimeout: ReturnType<typeof setTimeout> | null = null;

      // Wait for fonts to load
      const handleFontsReady = () => {
        if (!isCleanedUp) {
          setFontsLoaded(true);
          cleanup();
        }
      };

      // Cleanup function
      const cleanup = () => {
        isCleanedUp = true;
        if (checkInterval) clearInterval(checkInterval);
        if (maxTimeout) clearTimeout(maxTimeout);
        if (fallbackTimeout) clearTimeout(fallbackTimeout);
        cleanupRef.current = null;
      };

      cleanupRef.current = cleanup;

      // Listen for font loading completion
      document.fonts.ready
        .then(handleFontsReady)
        .catch((error) => {
          console.warn('Font loading detection failed:', error);
          // Fallback to timeout if promise fails
          if (!isCleanedUp) {
            fallbackTimeout = setTimeout(() => {
              if (!isCleanedUp) {
                setFontsLoaded(true);
                cleanup();
              }
            }, 500);
          }
        });

      // Fallback: check periodically in case the promise doesn't resolve
      checkInterval = setInterval(() => {
        if (!isCleanedUp && document.fonts.status === 'loaded') {
          setFontsLoaded(true);
          cleanup();
        }
      }, 100);

      // Maximum timeout to prevent infinite waiting
      maxTimeout = setTimeout(() => {
        if (!isCleanedUp) {
          console.warn('Font loading timeout reached, proceeding anyway');
          setFontsLoaded(true);
          cleanup();
        }
      }, 3000);

      return cleanup;
    } else {
      // Fallback for older browsers
      // Use a timeout to assume fonts are loaded after a reasonable delay
      const fallbackTimeout = setTimeout(() => {
        setFontsLoaded(true);
      }, 1000);

      return () => {
        clearTimeout(fallbackTimeout);
      };
    }
  }, []);

  return fontsLoaded;
}
