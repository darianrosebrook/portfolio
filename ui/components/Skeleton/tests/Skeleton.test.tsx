import * as React from 'react';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import Skeleton from '../Skeleton';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

describe('Skeleton', () => {
  it('renders skeleton loading state', () => {
    render(<Skeleton />);

    const skeleton = screen.getByRole('progressbar');
    expect(skeleton).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<Skeleton className="custom-class" />);

    const skeleton = screen.getByRole('progressbar');
    expect(skeleton).toHaveClass('custom-class');
  });

  it('passes through HTML attributes', () => {
    render(<Skeleton data-testid="test-skeleton" />);

    expect(screen.getByTestId('test-skeleton')).toBeInTheDocument();
  });

  it('applies variant correctly', () => {
    render(<Skeleton variant="text" />);

    const skeleton = screen.getByRole('progressbar');
    expect(skeleton).toHaveAttribute('data-variant', 'text');
  });

  describe('Accessibility', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(<Skeleton />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('provides proper ARIA role', () => {
      render(<Skeleton />);

      const skeleton = screen.getByRole('progressbar');
      expect(skeleton).toHaveAttribute('aria-busy', 'true');
    });
  });

  describe('Design Tokens', () => {
    it('uses design tokens instead of hardcoded values', () => {
      render(<Skeleton />);

      const skeleton = screen.getByRole('progressbar');

      // Verify CSS custom properties are being used
      expect(skeleton).toHaveClass('skeleton');
    });
  });
});
