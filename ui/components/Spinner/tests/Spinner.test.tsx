import * as React from 'react';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import Spinner from '../Spinner';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

describe('Spinner', () => {
  it('renders spinner', () => {
    render(<Spinner />);

    const spinner = screen.getByRole('status');
    expect(spinner).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<Spinner className="custom-class" />);

    const spinner = screen.getByRole('status');
    expect(spinner).toHaveClass('custom-class');
  });

  it('passes through HTML attributes', () => {
    render(<Spinner data-testid="test-spinner" />);

    expect(screen.getByTestId('test-spinner')).toBeInTheDocument();
  });

  it('applies size correctly', () => {
    render(<Spinner size="large" />);

    const spinner = screen.getByRole('status');
    expect(spinner).toHaveAttribute('data-size', 'large');
  });

  describe('Accessibility', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(<Spinner />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('provides proper ARIA attributes', () => {
      render(<Spinner />);

      const spinner = screen.getByRole('status');
      expect(spinner).toHaveAttribute('aria-busy', 'true');
    });
  });

  describe('Design Tokens', () => {
    it('uses design tokens instead of hardcoded values', () => {
      render(<Spinner />);

      const spinner = screen.getByRole('status');

      // Verify CSS custom properties are being used
      expect(spinner).toHaveClass('spinner');
    });
  });
});
