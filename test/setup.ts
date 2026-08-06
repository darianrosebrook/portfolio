import '@testing-library/jest-dom';
import { vi } from 'vitest';
import { toHaveNoViolations } from 'jest-axe';

vi.mock('next/navigation', () => ({
  usePathname: () => '/',
  useRouter: () => ({
    back: vi.fn(),
    forward: vi.fn(),
    prefetch: vi.fn(),
    push: vi.fn(),
    refresh: vi.fn(),
    replace: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  notFound: vi.fn(),
  redirect: vi.fn(),
}));

vi.mock('@codesandbox/sandpack-react', async () => {
  const React = await import('react');
  const passthrough = ({ children }: { children?: React.ReactNode }) =>
    React.createElement(React.Fragment, null, children);
  const sandpack = {
    activeFile: '/App.tsx',
    files: { '/App.tsx': { code: '' } },
    openFile: vi.fn(),
    updateFile: vi.fn(),
  };

  return {
    SandpackCodeEditor: ({ style }: { style?: React.CSSProperties }) =>
      React.createElement('div', {
        'data-testid': 'sandpack-code-editor',
        style,
      }),
    SandpackLayout: passthrough,
    SandpackPreview: ({ style }: { style?: React.CSSProperties }) =>
      React.createElement(
        'div',
        { 'data-testid': 'sandpack-preview', style },
        React.createElement('iframe', { title: 'Sandpack preview' }),
        React.createElement(
          'a',
          { href: 'https://codesandbox.io/', target: '_blank' },
          'Open in CodeSandbox'
        )
      ),
    SandpackProvider: passthrough,
    SandpackThemeProvider: passthrough,
    useSandpack: () => ({ sandpack }),
  };
});

// Extend Vitest's expect with jest-axe matchers
expect.extend(toHaveNoViolations);

// Polyfill requestIdleCallback for accessibility testing
if (typeof globalThis.requestIdleCallback === 'undefined') {
  globalThis.requestIdleCallback = function (
    cb: IdleRequestCallback,
    _options?: IdleRequestOptions
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

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
} as any;

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
} as any;

// Mock matchMedia (only when window exists - i.e., in jsdom)
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(), // deprecated
      removeListener: vi.fn(), // deprecated
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
};
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
  });
}
