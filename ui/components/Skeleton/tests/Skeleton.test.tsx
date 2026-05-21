import * as React from 'react';
import { render, screen } from '@testing-library/react';

import Skeleton from '../Skeleton';

describe('Skeleton', () => {
  describe('default rendering', () => {
    it('announces as role="status" with the default Loading label', () => {
      render(<Skeleton />);
      const skeleton = screen.getByRole('status', { name: 'Loading…' });
      expect(skeleton).toBeInTheDocument();
    });

    it('applies the skeleton design-system class on the root', () => {
      render(<Skeleton />);
      const skeleton = screen.getByRole('status');
      expect(skeleton).toHaveClass('skeleton');
    });

    it('marks the root with data-ds-component="Skeleton"', () => {
      render(<Skeleton />);
      const skeleton = screen.getByRole('status');
      expect(skeleton).toHaveAttribute('data-ds-component', 'Skeleton');
    });
  });

  describe('variant', () => {
    it('reflects variant on data-variant attribute', () => {
      render(<Skeleton variant="text" />);
      const skeleton = screen.getByRole('status');
      expect(skeleton).toHaveAttribute('data-variant', 'text');
    });

    it('defaults variant to block', () => {
      render(<Skeleton />);
      const skeleton = screen.getByRole('status');
      expect(skeleton).toHaveAttribute('data-variant', 'block');
    });

    it.each(['text', 'avatar', 'media', 'dataviz', 'actions'] as const)(
      'renders the %s variant without throwing',
      (variant) => {
        const { container } = render(<Skeleton variant={variant} />);
        expect(
          container.querySelector('[data-ds-component="Skeleton"]')
        ).toBeInTheDocument();
      }
    );
  });

  describe('passthrough', () => {
    it('forwards arbitrary HTML attributes via the spread', () => {
      render(<Skeleton data-testid="test-skeleton" />);
      expect(screen.getByTestId('test-skeleton')).toBeInTheDocument();
    });

    it('appends custom className alongside skeleton', () => {
      render(<Skeleton className="custom-class" />);
      const skeleton = screen.getByRole('status');
      expect(skeleton).toHaveClass('skeleton');
      expect(skeleton).toHaveClass('custom-class');
    });
  });

  describe('Accessibility', () => {
    it('pairs role="status" with aria-busy="true" and aria-live="polite"', () => {
      render(<Skeleton />);
      const skeleton = screen.getByRole('status');
      expect(skeleton).toHaveAttribute('aria-busy', 'true');
      expect(skeleton).toHaveAttribute('aria-live', 'polite');
    });

    it('uses a custom label when provided', () => {
      render(<Skeleton label="Fetching results" />);
      expect(
        screen.getByRole('status', { name: 'Fetching results' })
      ).toBeInTheDocument();
    });

    it('hides from AT and drops role when decorative', () => {
      const { container } = render(<Skeleton decorative />);
      const root = container.querySelector('[data-ds-component="Skeleton"]');
      expect(root).toHaveAttribute('aria-hidden', 'true');
      expect(root).not.toHaveAttribute('role');
      expect(root).not.toHaveAttribute('aria-busy');
    });
  });

  describe('content', () => {
    it('renders custom children when provided', () => {
      render(
        <Skeleton>
          <span data-testid="custom-content">custom</span>
        </Skeleton>
      );
      expect(screen.getByTestId('custom-content')).toBeInTheDocument();
    });
  });
});
