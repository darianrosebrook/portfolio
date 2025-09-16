import React from 'react';
import { render, screen, fireEvent } from '../test-utils';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import ErrorBoundary, {
  InteractiveErrorBoundary,
  EditorErrorBoundary,
  AnimationErrorBoundary,
  withErrorBoundary,
} from '@/ui/modules/ErrorBoundary';
import { expectNoAccessibilityViolations } from '../axe-helper';

// Mock console methods to avoid cluttering test output
const originalConsoleError = console.error;
const mockConsoleError = vi.fn();

// Component that throws an error for testing
const ThrowErrorComponent: React.FC<{
  shouldThrow?: boolean;
  message?: string;
}> = ({ shouldThrow = true, message = 'Test error' }) => {
  if (shouldThrow) {
    throw new Error(message);
  }
  return <div>Component rendered successfully</div>;
};

// Component that works normally
const SafeComponent: React.FC = () => <div>Safe component</div>;

describe('Error Boundary Components', () => {
  beforeEach(() => {
    console.error = mockConsoleError;
    mockConsoleError.mockClear();
  });

  afterEach(() => {
    console.error = originalConsoleError;
    vi.clearAllMocks();
  });

  describe('Base ErrorBoundary', () => {
    it('should render children when no error occurs', () => {
      render(
        <ErrorBoundary>
          <SafeComponent />
        </ErrorBoundary>
      );

      expect(screen.getByText('Safe component')).toBeInTheDocument();
    });

    it('should catch errors and show default fallback UI', () => {
      render(
        <ErrorBoundary>
          <ThrowErrorComponent message="Component failed" />
        </ErrorBoundary>
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /try again/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /retry in 3s/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /reload page/i })
      ).toBeInTheDocument();
    });

    it('should show custom fallback UI when provided', () => {
      const customFallback = <div>Custom error message</div>;

      render(
        <ErrorBoundary fallback={customFallback}>
          <ThrowErrorComponent />
        </ErrorBoundary>
      );

      expect(screen.getByText('Custom error message')).toBeInTheDocument();
      expect(
        screen.queryByText('Something went wrong')
      ).not.toBeInTheDocument();
    });

    it('should call onError callback when error occurs', () => {
      const onError = vi.fn();

      render(
        <ErrorBoundary onError={onError}>
          <ThrowErrorComponent message="Callback test error" />
        </ErrorBoundary>
      );

      expect(onError).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Callback test error' }),
        expect.objectContaining({ componentStack: expect.any(String) })
      );
    });

    it('should reset error state when Try Again is clicked', () => {
      let shouldThrow = true;
      const ConditionalErrorComponent = () => {
        if (shouldThrow) {
          throw new Error('Test error');
        }
        return <div>Component recovered</div>;
      };

      const { rerender } = render(
        <ErrorBoundary>
          <ConditionalErrorComponent />
        </ErrorBoundary>
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();

      // Now stop throwing errors
      shouldThrow = false;

      // Click Try Again button
      fireEvent.click(screen.getByRole('button', { name: /try again/i }));

      // Re-render the same component but now it won't throw
      rerender(
        <ErrorBoundary>
          <ConditionalErrorComponent />
        </ErrorBoundary>
      );

      expect(screen.getByText('Component recovered')).toBeInTheDocument();
      expect(
        screen.queryByText('Something went wrong')
      ).not.toBeInTheDocument();
    });

    it('should show error details in development mode', () => {
      vi.stubEnv('NODE_ENV', 'development');

      render(
        <ErrorBoundary>
          <ThrowErrorComponent message="Development error details" />
        </ErrorBoundary>
      );

      expect(screen.getByText('Error Details')).toBeInTheDocument();

      vi.clearAllMocks();
      vi.restoreAllMocks();
    });

    it('should handle reload page button click', () => {
      // Mock window.location.reload
      const mockReload = vi.fn();
      Object.defineProperty(window, 'location', {
        value: { reload: mockReload },
        writable: true,
      });

      render(
        <ErrorBoundary>
          <ThrowErrorComponent />
        </ErrorBoundary>
      );

      fireEvent.click(screen.getByRole('button', { name: /reload page/i }));
      expect(mockReload).toHaveBeenCalled();
    });

    it('should be accessible', async () => {
      const renderResult = render(
        <ErrorBoundary>
          <ThrowErrorComponent />
        </ErrorBoundary>
      );

      await expectNoAccessibilityViolations(renderResult);
    });
  });

  describe('InteractiveErrorBoundary', () => {
    it('should render children when no error occurs', () => {
      render(
        <InteractiveErrorBoundary componentName="TestComponent">
          <SafeComponent />
        </InteractiveErrorBoundary>
      );

      expect(screen.getByText('Safe component')).toBeInTheDocument();
    });

    it('should show interactive-specific fallback UI', () => {
      render(
        <InteractiveErrorBoundary componentName="FontInspector">
          <ThrowErrorComponent />
        </InteractiveErrorBoundary>
      );

      expect(screen.getByText('FontInspector Unavailable')).toBeInTheDocument();
      expect(screen.getByText(/browser compatibility/i)).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /refresh page/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /get help/i })
      ).toBeInTheDocument();
    });

    it('should log browser API availability on error', () => {
      render(
        <InteractiveErrorBoundary componentName="TestComponent">
          <ThrowErrorComponent />
        </InteractiveErrorBoundary>
      );

      expect(mockConsoleError).toHaveBeenCalledWith(
        'TestComponent error:',
        expect.objectContaining({
          browserAPIs: expect.objectContaining({
            canvas: expect.any(Boolean),
            webGL: expect.any(Boolean),
            fileAPI: expect.any(Boolean),
            intersectionObserver: expect.any(Boolean),
          }),
        })
      );
    });

    it('should be accessible', async () => {
      const renderResult = render(
        <InteractiveErrorBoundary>
          <ThrowErrorComponent />
        </InteractiveErrorBoundary>
      );

      await expectNoAccessibilityViolations(renderResult);
    });
  });

  describe('EditorErrorBoundary', () => {
    beforeEach(() => {
      // Mock localStorage
      const localStorageMock = {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
      };
      Object.defineProperty(window, 'localStorage', {
        value: localStorageMock,
        writable: true,
      });
    });

    it('should render children when no error occurs', () => {
      render(
        <EditorErrorBoundary editorName="TestEditor">
          <SafeComponent />
        </EditorErrorBoundary>
      );

      expect(screen.getByText('Safe component')).toBeInTheDocument();
    });

    it('should show editor-specific fallback UI', () => {
      render(
        <EditorErrorBoundary editorName="Article Editor">
          <ThrowErrorComponent />
        </EditorErrorBoundary>
      );

      expect(screen.getByText('Article Editor Error')).toBeInTheDocument();
      expect(screen.getByText(/auto-saved/i)).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /recover data/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /restart editor/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /copy error info/i })
      ).toBeInTheDocument();
    });

    it('should call onDataLoss callback when error occurs', () => {
      const onDataLoss = vi.fn();

      render(
        <EditorErrorBoundary onDataLoss={onDataLoss}>
          <ThrowErrorComponent />
        </EditorErrorBoundary>
      );

      expect(onDataLoss).toHaveBeenCalled();
    });

    it('should attempt data recovery when recover button is clicked', () => {
      const mockGetItem = vi
        .fn()
        .mockReturnValue(JSON.stringify({ content: 'recovered content' }));
      window.localStorage.getItem = mockGetItem;

      render(
        <EditorErrorBoundary editorName="test-editor">
          <ThrowErrorComponent />
        </EditorErrorBoundary>
      );

      fireEvent.click(screen.getByRole('button', { name: /recover data/i }));

      expect(mockGetItem).toHaveBeenCalledWith('test-editor-autosave');
    });

    it('should be accessible', async () => {
      const renderResult = render(
        <EditorErrorBoundary>
          <ThrowErrorComponent />
        </EditorErrorBoundary>
      );

      await expectNoAccessibilityViolations(renderResult);
    });
  });

  describe('AnimationErrorBoundary', () => {
    it('should render children when no error occurs', () => {
      render(
        <AnimationErrorBoundary animationName="TestAnimation">
          <SafeComponent />
        </AnimationErrorBoundary>
      );

      expect(screen.getByText('Safe component')).toBeInTheDocument();
    });

    it('should show animation-specific fallback UI', () => {
      render(
        <AnimationErrorBoundary animationName="GooeyHighlight">
          <ThrowErrorComponent />
        </AnimationErrorBoundary>
      );

      expect(screen.getByText('GooeyHighlight Disabled')).toBeInTheDocument();
      expect(
        screen.getByText(/animations are temporarily disabled/i)
      ).toBeInTheDocument();
    });

    it('should show fallback immediately when animations are disabled', () => {
      render(
        <AnimationErrorBoundary
          animationName="TestAnimation"
          disableAnimations={true}
        >
          <SafeComponent />
        </AnimationErrorBoundary>
      );

      expect(screen.getByText('TestAnimation Disabled')).toBeInTheDocument();
      expect(
        screen.getByText('Motion preferences respected')
      ).toBeInTheDocument();
      expect(screen.queryByText('Safe component')).not.toBeInTheDocument();
    });

    it('should show custom fallback content when provided', () => {
      const customFallback = <div>Custom animation fallback</div>;

      render(
        <AnimationErrorBoundary
          animationName="TestAnimation"
          fallbackContent={customFallback}
          disableAnimations={true}
        >
          <SafeComponent />
        </AnimationErrorBoundary>
      );

      expect(screen.getByText('Custom animation fallback')).toBeInTheDocument();
    });

    it('should log animation context on error', () => {
      render(
        <AnimationErrorBoundary animationName="TestAnimation">
          <ThrowErrorComponent />
        </AnimationErrorBoundary>
      );

      expect(mockConsoleError).toHaveBeenCalledWith(
        'TestAnimation animation error:',
        expect.objectContaining({
          animationContext: expect.objectContaining({
            animationSupport: expect.objectContaining({
              requestAnimationFrame: expect.any(Boolean),
            }),
          }),
        })
      );
    });

    it('should be accessible', async () => {
      const renderResult = render(
        <AnimationErrorBoundary>
          <ThrowErrorComponent />
        </AnimationErrorBoundary>
      );

      await expectNoAccessibilityViolations(renderResult);
    });
  });

  describe('withErrorBoundary HOC', () => {
    it('should wrap component with error boundary', () => {
      const SafeWrappedComponent = withErrorBoundary(SafeComponent);

      render(<SafeWrappedComponent />);
      expect(screen.getByText('Safe component')).toBeInTheDocument();
    });

    it('should catch errors in wrapped component', () => {
      const ErrorWrappedComponent = withErrorBoundary(ThrowErrorComponent, {
        componentName: 'WrappedError',
      });

      render(<ErrorWrappedComponent />);
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });

    it('should use custom fallback in HOC', () => {
      const customFallback = <div>HOC custom fallback</div>;
      const ErrorWrappedComponent = withErrorBoundary(ThrowErrorComponent, {
        fallback: customFallback,
      });

      render(<ErrorWrappedComponent />);
      expect(screen.getByText('HOC custom fallback')).toBeInTheDocument();
    });

    it('should call custom onError in HOC', () => {
      const onError = vi.fn();
      const ErrorWrappedComponent = withErrorBoundary(ThrowErrorComponent, {
        onError,
        componentName: 'TestHOC',
      });

      render(<ErrorWrappedComponent />);
      expect(onError).toHaveBeenCalled();
    });
  });
});
