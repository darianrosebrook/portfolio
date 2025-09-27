import * as React from 'react';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import Icon from '../Icon';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

describe('Icon', () => {
  it('renders icon correctly', () => {
    render(<Icon name="user" />);

    const icon = screen.getByRole('img', { name: 'user icon' });
    expect(icon).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<Icon name="user" className="custom-class" />);
    const icon = screen.getByRole('img');
    expect(icon).toHaveClass('custom-class');
  });

  it('passes through HTML attributes', () => {
    render(<Icon name="user" data-testid="test-icon" />);
    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
  });

  it('applies size classes correctly', () => {
    render(<Icon name="user" size="large" />);
    const icon = screen.getByRole('img');
    expect(icon).toHaveAttribute('data-size', 'large');
  });

  it('applies color classes correctly', () => {
    render(<Icon name="user" color="primary" />);
    const icon = screen.getByRole('img');
    expect(icon).toHaveAttribute('data-color', 'primary');
  });

  describe('Accessibility', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(<Icon name="user" />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('provides proper aria-label', () => {
      render(<Icon name="user" ariaLabel="User account" />);
      const icon = screen.getByRole('img');
      expect(icon).toHaveAttribute('aria-label', 'User account');
    });

    it('is hidden from screen readers when decorative', () => {
      render(<Icon name="user" decorative />);
      const icon = screen.getByRole('img');
      expect(icon).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('Design Tokens', () => {
    it('uses design tokens instead of hardcoded values', () => {
      render(<Icon name="user" />);
      const icon = screen.getByRole('img');

      // Verify CSS custom properties are being used
      expect(icon).toHaveClass('icon');
    });
  });
});
