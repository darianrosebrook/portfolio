import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { ReducedMotionProvider } from '@/context/ReducedMotionContext';
import { InteractionProvider } from '@/context/InteractionContext';
import { vi } from 'vitest';

/**
 * Custom render function that includes common providers
 */
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <ReducedMotionProvider>
      <InteractionProvider>{children}</InteractionProvider>
    </ReducedMotionProvider>
  );
};

const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };

/**
 * Mock implementation for Next.js router
 */
export const mockRouter = {
  push: vi.fn(),
  replace: vi.fn(),
  prefetch: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  refresh: vi.fn(),
  pathname: '/',
  route: '/',
  query: {},
  asPath: '/',
  events: {
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn(),
  },
  beforePopState: vi.fn(),
  isFallback: false,
  isLocaleDomain: false,
  isReady: true,
  isPreview: false,
};

/**
 * Helper to wait for async operations in tests
 */
export const waitForLoadingToFinish = () =>
  new Promise((resolve) => setTimeout(resolve, 0));
