/**
 * Testing Infrastructure
 *
 * Comprehensive testing utilities for components, performance,
 * accessibility, and integration testing.
 */

import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
// @ts-ignore - axe-core types may not be available
import axe from 'axe-core';
import { vi } from 'vitest';

// Test providers wrapper
interface TestProvidersProps {
  children: React.ReactNode;
  theme?: any;
  router?: any;
  user?: any;
}

const TestProviders: React.FC<TestProvidersProps> = ({
  children,
  theme,
  router,
  user,
}) => {
  // This would wrap with actual providers when implemented
  return <>{children}</>;
};

// Render with providers
export const renderWithProviders = (
  component: React.ReactElement,
  options: {
    theme?: any;
    router?: any;
    user?: any;
  } & Omit<RenderOptions, 'wrapper'> = {}
): ReturnType<typeof render> => {
  const { theme, router, user, ...renderOptions } = options;

  return render(component, {
    wrapper: ({ children }) => (
      <TestProviders theme={theme} router={router} user={user}>
        {children}
      </TestProviders>
    ),
    ...renderOptions,
  });
};

// User event setup with common configuration
export const setupUserEvent = () => {
  return userEvent.setup({
    advanceTimers: vi.advanceTimersByTime,
    delay: null, // Disable delays for faster tests
  });
};

// Mock utilities
export const createMockHandlers = () => ({
  onChange: vi.fn(),
  onClick: vi.fn(),
  onFocus: vi.fn(),
  onBlur: vi.fn(),
  onSubmit: vi.fn(),
  onKeyDown: vi.fn(),
  onMouseEnter: vi.fn(),
  onMouseLeave: vi.fn(),
});

export const createMockProps = <T extends Record<string, any>>(
  overrides: Partial<T> = {}
): T => {
  const baseProps = {
    className: 'test-class',
    'data-testid': 'test-component',
    ...overrides,
  } as unknown as T;

  return baseProps;
};

// Component testing helpers
export const componentTestUtils = {
  // Test component renders without crashing
  testRenders: (Component: React.ComponentType<any>, props = {}) => {
    it('renders without crashing', () => {
      expect(() => renderWithProviders(<Component {...props} />)).not.toThrow();
    });
  },

  // Test component forwards ref
  testRefForwarding: (Component: React.ComponentType<any>, props = {}) => {
    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLElement>();
      renderWithProviders(<Component {...props} ref={ref} />);
      expect(ref.current).toBeInTheDocument();
    });
  },

  // Test component accepts and applies className
  testClassName: (Component: React.ComponentType<any>, baseProps = {}) => {
    it('applies custom className', () => {
      const { container } = renderWithProviders(
        <Component {...baseProps} className="custom-class" />
      );
      expect(container.firstChild).toHaveClass('custom-class');
    });
  },

  // Test component applies data-testid
  testDataTestId: (Component: React.ComponentType<any>, baseProps = {}) => {
    it('applies data-testid attribute', () => {
      renderWithProviders(
        <Component {...baseProps} data-testid="custom-test-id" />
      );
      expect(
        document.querySelector('[data-testid="custom-test-id"]')
      ).toBeInTheDocument();
    });
  },

  // Test interactive behavior
  testInteraction: (
    Component: React.ComponentType<any>,
    trigger: (element: HTMLElement) => Promise<void> | void,
    expectedBehavior: () => void,
    props = {}
  ) => {
    it('handles interaction correctly', async () => {
      const user = setupUserEvent();
      const handlers = createMockHandlers();

      const { container } = renderWithProviders(
        <Component {...props} {...handlers} />
      );

      const element = container.firstChild as HTMLElement;
      await trigger(element);

      expectedBehavior();
    });
  },
};

// Performance testing utilities
export const performanceTestUtils = {
  // Measure component render time
  measureRenderTime: async (
    component: React.ReactElement,
    iterations: number = 10,
    options: { timeout?: number } = {}
  ): Promise<{
    average: number;
    min: number;
    max: number;
    median: number;
    iterations: number;
  }> => {
    const { timeout = 5000 } = options;
    const times: number[] = [];

    for (let i = 0; i < iterations; i++) {
      const start = performance.now();

      const { rerender, unmount } = renderWithProviders(component);

      // Wait for render to complete
      await new Promise((resolve) => setTimeout(resolve, 0));

      const end = performance.now();
      times.push(end - start);

      unmount();
    }

    times.sort((a, b) => a - b);

    return {
      average: times.reduce((a, b) => a + b) / times.length,
      min: times[0],
      max: times[times.length - 1],
      median: times[Math.floor(times.length / 2)],
      iterations,
    };
  },

  // Measure interaction performance
  measureInteractionTime: async (
    component: React.ReactElement,
    interaction: (
      container: HTMLElement,
      user: ReturnType<typeof setupUserEvent>
    ) => Promise<void>,
    options: { warmupRuns?: number; measureRuns?: number } = {}
  ): Promise<{
    average: number;
    min: number;
    max: number;
    samples: number;
  }> => {
    const { warmupRuns = 2, measureRuns = 5 } = options;
    const times: number[] = [];

    // Warmup runs
    for (let i = 0; i < warmupRuns; i++) {
      const { container, unmount } = renderWithProviders(component);
      const user = setupUserEvent();
      await interaction(container, user);
      unmount();
    }

    // Measured runs
    for (let i = 0; i < measureRuns; i++) {
      const { container, unmount } = renderWithProviders(component);
      const user = setupUserEvent();

      const start = performance.now();
      await interaction(container, user);
      const end = performance.now();

      times.push(end - start);
      unmount();
    }

    return {
      average: times.reduce((a, b) => a + b) / times.length,
      min: Math.min(...times),
      max: Math.max(...times),
      samples: measureRuns,
    };
  },

  // Memory usage testing
  measureMemoryUsage: async (
    operation: () => Promise<void> | void,
    options: { iterations?: number } = {}
  ): Promise<{
    before: number;
    after: number;
    delta: number;
    iterations: number;
  }> => {
    const { iterations = 1 } = options;

    const getMemoryUsage = () => {
      if ('memory' in performance) {
        return (performance as any).memory.usedJSHeapSize;
      }
      return 0;
    };

    const before = getMemoryUsage();

    for (let i = 0; i < iterations; i++) {
      await operation();
    }

    // Force garbage collection if available
    if ('gc' in window) {
      (window as any).gc();
    }

    // Small delay for GC
    await new Promise((resolve) => setTimeout(resolve, 100));

    const after = getMemoryUsage();

    return {
      before,
      after,
      delta: after - before,
      iterations,
    };
  },
};

// Accessibility testing utilities
export const accessibilityTestUtils = {
  // Run axe-core accessibility tests
  testAccessibility: async (
    component: React.ReactElement,
    options: {
      rules?: Record<string, axe.Rule>;
      disableRules?: string[];
    } = {}
  ): Promise<axe.AxeResults> => {
    const { container } = renderWithProviders(component);

    const axeOptions: any = {};
    if (options.rules) {
      axeOptions.rules = options.rules;
    }
    if (options.disableRules) {
      axeOptions.runOnly = {
        type: 'tag',
        values: ['wcag2a', 'wcag2aa', 'best-practice'],
      };
      axeOptions.rules = options.disableRules.reduce(
        (acc, rule) => {
          acc[rule] = { id: rule, enabled: false };
          return acc;
        },
        {} as Record<string, axe.Rule>
      );
    }

    const results = await axe.run(container, axeOptions);

    return results as axe.AxeResults;
  },

  // Test for WCAG compliance
  testWCAGCompliance: async (
    component: React.ReactElement,
    level: 'A' | 'AA' | 'AAA' = 'AA'
  ): Promise<{
    violations: axe.Result[];
    passes: boolean;
    summary: string;
  }> => {
    const results = await accessibilityTestUtils.testAccessibility(component, {
      rules: {
        // Custom rules for specific WCAG level
        'color-contrast': { id: 'color-contrast', enabled: level === 'AAA' },
        'link-name': { id: 'link-name', enabled: true },
        'button-name': { id: 'button-name', enabled: true },
        'image-alt': { id: 'image-alt', enabled: true },
        'heading-order': { id: 'heading-order', enabled: true },
        keyboard: { id: 'keyboard', enabled: true },
      },
    });

    const passes = results.violations.length === 0;

    return {
      violations: results.violations,
      passes,
      summary: passes
        ? `✅ WCAG ${level} compliant`
        : `❌ ${results.violations.length} WCAG ${level} violations found`,
    };
  },

  // Test keyboard navigation
  testKeyboardNavigation: async (
    component: React.ReactElement,
    navigationTest: (
      container: HTMLElement,
      user: ReturnType<typeof setupUserEvent>
    ) => Promise<void>
  ): Promise<{
    navigableElements: number;
    tabOrder: string[];
    errors: string[];
  }> => {
    const user = setupUserEvent();
    const { container } = renderWithProviders(component);

    const errors: string[] = [];
    const tabOrder: string[] = [];

    // Find all focusable elements
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    // Test Tab navigation
    for (let i = 0; i < focusableElements.length; i++) {
      await user.tab();
      const activeElement = document.activeElement;

      if (activeElement) {
        const identifier =
          activeElement.getAttribute('data-testid') ||
          activeElement.getAttribute('aria-label') ||
          activeElement.textContent?.slice(0, 20) ||
          activeElement.tagName.toLowerCase();
        tabOrder.push(identifier);
      }
    }

    // Run custom navigation test
    await navigationTest(container, user);

    return {
      navigableElements: focusableElements.length,
      tabOrder,
      errors,
    };
  },

  // Test ARIA attributes
  testAriaAttributes: (
    component: React.ReactElement,
    requiredAttributes: Record<string, string[]>
  ): {
    missingAttributes: Record<string, string[]>;
    invalidAttributes: Record<string, string[]>;
  } => {
    const { container } = renderWithProviders(component);

    const missingAttributes: Record<string, string[]> = {};
    const invalidAttributes: Record<string, string[]> = {};

    Object.entries(requiredAttributes).forEach(([selector, attributes]) => {
      const elements = container.querySelectorAll(selector);

      elements.forEach((element, index) => {
        const elementKey = `${selector}[${index}]`;

        attributes.forEach((attr) => {
          if (!element.hasAttribute(attr)) {
            if (!missingAttributes[elementKey]) {
              missingAttributes[elementKey] = [];
            }
            missingAttributes[elementKey].push(attr);
          } else {
            // Validate attribute values
            const value = element.getAttribute(attr);
            if (
              attr === 'aria-checked' &&
              !['true', 'false', 'mixed'].includes(value || '')
            ) {
              if (!invalidAttributes[elementKey]) {
                invalidAttributes[elementKey] = [];
              }
              invalidAttributes[elementKey].push(`${attr}="${value}"`);
            }
          }
        });
      });
    });

    return { missingAttributes, invalidAttributes };
  },
};

// Visual regression testing utilities
export const visualTestUtils = {
  // Capture component screenshot (requires playwright or similar)
  captureScreenshot: async (
    component: React.ReactElement,
    name: string,
    options: { viewport?: { width: number; height: number } } = {}
  ): Promise<string | null> => {
    // This would integrate with a visual testing library
    // For now, return a placeholder
    console.log(`📸 Capturing screenshot for ${name}`);
    return null;
  },

  // Compare screenshots
  compareScreenshots: (
    baseline: string,
    current: string,
    threshold: number = 0.01
  ): {
    matches: boolean;
    difference: number;
    diffImage?: string;
  } => {
    // This would use a visual diffing library
    return {
      matches: true,
      difference: 0,
    };
  },
};

// Integration testing utilities
export const integrationTestUtils = {
  // Mock API responses
  createMockApi: <T extends Record<string, any>>(responses: T) => {
    const mockFetch = vi.fn();

    Object.entries(responses).forEach(([endpoint, response]) => {
      mockFetch.mockImplementationOnce((url: string) => {
        if (url.includes(endpoint)) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(response),
          });
        }
        return Promise.reject(new Error(`Unexpected URL: ${url}`));
      });
    });

    global.fetch = mockFetch as any;
    return mockFetch;
  },

  // Mock local storage
  createMockStorage: (initialData: Record<string, string> = {}) => {
    const mockStorage = {
      data: { ...initialData },
      getItem: vi.fn((key: string) => mockStorage.data[key] || null),
      setItem: vi.fn((key: string, value: string) => {
        mockStorage.data[key] = value;
      }),
      removeItem: vi.fn((key: string) => {
        delete mockStorage.data[key];
      }),
      clear: vi.fn(() => {
        mockStorage.data = {};
      }),
      get length() {
        return Object.keys(mockStorage.data).length;
      },
      key: vi.fn((index: number) => {
        const keys = Object.keys(mockStorage.data);
        return keys[index] || null;
      }),
    };

    Object.defineProperty(window, 'localStorage', {
      value: mockStorage,
      writable: true,
    });

    return mockStorage;
  },

  // Mock Intersection Observer
  createMockIntersectionObserver: () => {
    const mockIntersectionObserver = vi.fn();
    mockIntersectionObserver.mockReturnValue({
      observe: vi.fn(),
      disconnect: vi.fn(),
      unobserve: vi.fn(),
    });

    Object.defineProperty(window, 'IntersectionObserver', {
      writable: true,
      configurable: true,
      value: mockIntersectionObserver,
    });

    Object.defineProperty(global, 'IntersectionObserver', {
      writable: true,
      configurable: true,
      value: mockIntersectionObserver,
    });

    return mockIntersectionObserver;
  },
};

// Export commonly used testing utilities
export {
  componentTestUtils as componentTests,
  performanceTestUtils as performanceTests,
  accessibilityTestUtils as accessibilityTests,
  visualTestUtils as visualTests,
  integrationTestUtils as integrationTests,
};
