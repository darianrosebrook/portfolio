'use client';

import { useState, useEffect } from 'react';

/**
 * Hook to detect when fonts are loaded and ready for use
 * This prevents SplitText from being called before fonts are loaded,
 * which can cause incorrect measurements and layout issues.
 *
 * @returns boolean indicating if fonts are loaded
 */
export function useFontsLoaded(): boolean {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    // Early return for SSR
    if (typeof document === 'undefined') {
      return;
    }

    // Check if document.fonts is available (modern browsers)
    if ('fonts' in document) {
      // If fonts are already loaded
      if (document.fonts.status === 'loaded') {
        setFontsLoaded(true);
        return;
      }

      let isCleanedUp = false;

      // Wait for fonts to load
      const handleFontsReady = () => {
        if (!isCleanedUp) {
          setFontsLoaded(true);
        }
      };

      // Listen for font loading completion
      document.fonts.ready.then(handleFontsReady).catch((error) => {
        console.warn('Font loading detection failed:', error);
        // Fallback to timeout if promise fails
        if (!isCleanedUp) {
          setTimeout(() => setFontsLoaded(true), 500);
        }
      });

      // Fallback: check periodically in case the promise doesn't resolve
      const checkInterval = setInterval(() => {
        if (!isCleanedUp && document.fonts.status === 'loaded') {
          setFontsLoaded(true);
          clearInterval(checkInterval);
        }
      }, 100);

      // Maximum timeout to prevent infinite waiting
      const maxTimeout = setTimeout(() => {
        if (!isCleanedUp) {
          console.warn('Font loading timeout reached, proceeding anyway');
          setFontsLoaded(true);
        }
      }, 3000);

      // Cleanup
      return () => {
        isCleanedUp = true;
        clearInterval(checkInterval);
        clearTimeout(maxTimeout);
      };
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
