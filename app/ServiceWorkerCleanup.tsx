'use client';

import { useEffect } from 'react';

/**
 * One-time migration: unregister any leftover service workers and clear their
 * caches. The previous version of this site shipped a service worker that
 * we've since removed; without this cleanup, returning visitors keep serving
 * the old SW until they manually clear it.
 *
 * Rendered as a client component so the body executes in the browser. It
 * doesn't render anything visible.
 */
export function ServiceWorkerCleanup() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    void navigator.serviceWorker.getRegistrations().then((registrations) => {
      if (registrations.length === 0) return;
      return Promise.all(
        registrations.map((registration) => registration.unregister())
      ).then(() => {
        if (!('caches' in window)) return;
        return caches
          .keys()
          .then((cacheNames) =>
            Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)))
          );
      });
    });
  }, []);

  return null;
}
