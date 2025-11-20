/**
 * Development cache clearing utilities
 * Helps developers clear all caches during development
 */

/**
 * Clears all browser caches (Service Worker caches, Cache API, localStorage, sessionStorage)
 * Useful for development when changes aren't appearing
 */
export async function clearAllCaches(): Promise<void> {
  const cleared: string[] = [];

  // 1. Clear Service Worker caches
  if ('caches' in window) {
    try {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(async (cacheName) => {
          await caches.delete(cacheName);
          cleared.push(`Cache: ${cacheName}`);
        })
      );
    } catch (error) {
      console.error('Error clearing caches:', error);
    }
  }

  // 2. Unregister all Service Workers
  if ('serviceWorker' in navigator) {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(
        registrations.map(async (registration) => {
          await registration.unregister();
          cleared.push(`Service Worker: ${registration.scope}`);
        })
      );
    } catch (error) {
      console.error('Error unregistering service workers:', error);
    }
  }

  // 3. Clear localStorage (optional - only if you want to clear app state)
  // Uncomment if needed:
  // try {
  //   localStorage.clear();
  //   cleared.push('localStorage');
  // } catch (error) {
  //   console.error('Error clearing localStorage:', error);
  // }

  // 4. Clear sessionStorage
  try {
    sessionStorage.clear();
    cleared.push('sessionStorage');
  } catch (error) {
    console.error('Error clearing sessionStorage:', error);
  }

  console.log('✅ Cleared:', cleared);
  return Promise.resolve();
}

/**
 * Force reloads the page after clearing caches
 */
export async function hardReload(): Promise<void> {
  await clearAllCaches();
  window.location.reload();
}

/**
 * Adds a global keyboard shortcut to clear caches
 * Press Ctrl+Shift+K (or Cmd+Shift+K on Mac) to clear all caches
 */
export function setupCacheClearShortcut(): void {
  if (typeof window === 'undefined') return;

  window.addEventListener('keydown', async (event) => {
    // Ctrl+Shift+K (Windows/Linux) or Cmd+Shift+K (Mac)
    if (
      (event.ctrlKey || event.metaKey) &&
      event.shiftKey &&
      event.key === 'K'
    ) {
      event.preventDefault();
      console.log('🔄 Clearing all caches...');
      await clearAllCaches();
      console.log('✅ Caches cleared! Reload to see changes.');

      // Optionally reload automatically
      const shouldReload = confirm(
        'Caches cleared! Reload page to see changes?'
      );
      if (shouldReload) {
        window.location.reload();
      }
    }
  });
}

// Auto-setup on import in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  setupCacheClearShortcut();
  console.log('💡 Press Ctrl+Shift+K (or Cmd+Shift+K) to clear all caches');
}
