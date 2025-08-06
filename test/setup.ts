import '@testing-library/jest-dom';

// Polyfill requestIdleCallback for accessibility testing
if (typeof globalThis.requestIdleCallback === 'undefined') {
  globalThis.requestIdleCallback = function (
    cb: IdleRequestCallback,
    options?: IdleRequestOptions
  ): number {
    const start = Date.now();
    return setTimeout(() => {
      cb({
        didTimeout: false,
        timeRemaining() {
          return Math.max(0, 50 - (Date.now() - start));
        },
      });
    }, 1) as unknown as number;
  };
}

if (typeof globalThis.cancelIdleCallback === 'undefined') {
  globalThis.cancelIdleCallback = function (id: number) {
    clearTimeout(id);
  };
}
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Configure axe-core for accessibility testing (disabled in tests to avoid conflicts)
// @axe-core/react is primarily for development, not testing
// We use jest-axe for testing instead

// Mock IntersectionObserver for components that use it
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
  rootMargin: string = '';
  thresholds: number[] = [];
  root: null = null;
};

// Mock ResizeObserver for components that use it
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock matchMedia for responsive components
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {}, // deprecated
    removeListener: () => {}, // deprecated
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});

// Mock localStorage
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
    clear: () => {},
  },
});

// Mock requestIdleCallback for @axe-core/react
global.requestIdleCallback = (callback: IdleRequestCallback) => {
  return setTimeout(callback, 0);
};

global.cancelIdleCallback = (id: number) => {
  clearTimeout(id);
};

// Cleanup after each test
afterEach(() => {
  cleanup();
});
