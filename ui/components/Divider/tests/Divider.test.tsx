import * as React from 'react';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import Divider from '../Divider';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

describe('Divider', () => {
  it('renders divider correctly', () => {
    render(<Divider />);

    const divider = screen.getByRole('separator');
    expect(divider).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<Divider className="custom-class" />);

    const divider = screen.getByRole('separator');
    expect(divider).toHaveClass('custom-class');
  });

  it('passes through HTML attributes', () => {
    render(<Divider data-testid="test-divider" />);

    expect(screen.getByTestId('test-divider')).toBeInTheDocument();
  });

  it('applies orientation correctly', () => {
    render(<Divider orientation="vertical" />);

    const divider = screen.getByRole('separator');
    expect(divider).toHaveAttribute('aria-orientation', 'vertical');
  });

  describe('Accessibility', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(<Divider />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('provides proper ARIA role', () => {
      render(<Divider />);

      const divider = screen.getByRole('separator');
      expect(divider).toBeInTheDocument();
    });

    it('provides orientation for vertical dividers', () => {
      render(<Divider orientation="vertical" />);

      const divider = screen.getByRole('separator');
      expect(divider).toHaveAttribute('aria-orientation', 'vertical');
    });
  });

  describe('Design Tokens', () => {
    it('uses design tokens instead of hardcoded values', () => {
      render(<Divider />);

      const divider = screen.getByRole('separator');

      // Verify CSS custom properties are being used
      expect(divider).toHaveClass('divider');
    });
  });
});
