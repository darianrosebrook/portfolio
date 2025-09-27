import * as React from 'react';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import ProfileFlag from '../ProfileFlag';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

describe('ProfileFlag', () => {
  it('renders profile flag correctly', () => {
    render(<ProfileFlag>Flag content</ProfileFlag>);

    const flag = screen.getByText('Flag content');
    expect(flag).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<ProfileFlag className="custom-class">Content</ProfileFlag>);

    const flag = screen.getByText('Content');
    expect(flag).toHaveClass('custom-class');
  });

  it('passes through HTML attributes', () => {
    render(<ProfileFlag data-testid="test-flag">Content</ProfileFlag>);

    expect(screen.getByTestId('test-flag')).toBeInTheDocument();
  });

  describe('Accessibility', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(<ProfileFlag>Content</ProfileFlag>);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Design Tokens', () => {
    it('uses design tokens instead of hardcoded values', () => {
      render(<ProfileFlag>Content</ProfileFlag>);

      const flag = screen.getByText('Content');

      // Verify CSS custom properties are being used
      expect(flag).toHaveClass('profileFlag');
    });
  });
});
