import * as React from 'react';
import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import Spinner from '../Spinner';

describe('Spinner', () => {
  describe('default rendering', () => {
    it('exposes role="status" with default Loading label', () => {
      render(<Spinner />);
      const spinner = screen.getByRole('status', { name: 'Loading' });
      expect(spinner).toBeInTheDocument();
    });

    it('appears immediately (showAfterMs=0 by default)', () => {
      render(<Spinner />);
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('applies the spinner class on the root', () => {
      render(<Spinner />);
      const spinner = screen.getByRole('status');
      expect(spinner).toHaveClass('spinner');
    });

    it('marks the root with data-ds-component="Spinner"', () => {
      render(<Spinner />);
      const spinner = screen.getByRole('status');
      expect(spinner).toHaveAttribute('data-ds-component', 'Spinner');
    });
  });

  describe('size', () => {
    it('reflects size token on data-size attribute', () => {
      render(<Spinner size="lg" />);
      const spinner = screen.getByRole('status');
      expect(spinner).toHaveAttribute('data-size', 'lg');
    });

    it('omits data-size when size is a numeric override', () => {
      render(<Spinner size={32} />);
      const spinner = screen.getByRole('status');
      expect(spinner).not.toHaveAttribute('data-size');
    });
  });

  describe('variant', () => {
    it('reflects variant on data-variant attribute', () => {
      render(<Spinner variant="dots" />);
      const spinner = screen.getByRole('status');
      expect(spinner).toHaveAttribute('data-variant', 'dots');
    });

    it('defaults variant to ring', () => {
      render(<Spinner />);
      const spinner = screen.getByRole('status');
      expect(spinner).toHaveAttribute('data-variant', 'ring');
    });
  });

  describe('passthrough', () => {
    it('forwards arbitrary HTML attributes', () => {
      render(<Spinner data-testid="test-spinner" />);
      expect(screen.getByTestId('test-spinner')).toBeInTheDocument();
    });

    it('appends custom className alongside spinner', () => {
      render(<Spinner className="custom-class" />);
      const spinner = screen.getByRole('status');
      expect(spinner).toHaveClass('spinner');
      expect(spinner).toHaveClass('custom-class');
    });

    it('forwards ref to the root element', () => {
      const ref = React.createRef<HTMLSpanElement>();
      render(<Spinner ref={ref} />);
      expect(ref.current).not.toBeNull();
      expect(ref.current?.getAttribute('data-ds-component')).toBe('Spinner');
    });
  });

  describe('Accessibility', () => {
    it('pairs role="status" with aria-busy="true" and aria-live="polite"', () => {
      render(<Spinner />);
      const spinner = screen.getByRole('status');
      expect(spinner).toHaveAttribute('aria-busy', 'true');
      expect(spinner).toHaveAttribute('aria-live', 'polite');
    });

    it('uses a custom label when provided', () => {
      render(<Spinner label="Submitting" />);
      expect(
        screen.getByRole('status', { name: 'Submitting' })
      ).toBeInTheDocument();
    });

    it('hides from AT when ariaHidden is true', () => {
      const { container } = render(<Spinner ariaHidden />);
      const root = container.querySelector('[data-ds-component="Spinner"]');
      expect(root).toHaveAttribute('aria-hidden', 'true');
      expect(root).not.toHaveAttribute('role');
      expect(root).not.toHaveAttribute('aria-busy');
    });
  });

  describe('delayed appearance (showAfterMs > 0)', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });
    afterEach(() => {
      vi.useRealTimers();
    });

    it('renders nothing before the delay elapses', () => {
      render(<Spinner showAfterMs={150} />);
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    it('appears once the delay elapses', () => {
      render(<Spinner showAfterMs={150} />);
      act(() => {
        vi.advanceTimersByTime(150);
      });
      expect(screen.getByRole('status')).toBeInTheDocument();
    });
  });
});
