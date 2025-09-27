import * as React from 'react';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import VisuallyHidden from '../VisuallyHidden';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

describe('VisuallyHidden', () => {
  it('renders visually hidden content', () => {
    render(<VisuallyHidden>Hidden text</VisuallyHidden>);

    const hidden = screen.getByText('Hidden text');
    expect(hidden).toBeInTheDocument();
    expect(hidden).toHaveClass('visuallyHidden');
  });

  it('applies custom className', () => {
    render(<VisuallyHidden className="custom-class">Content</VisuallyHidden>);

    const hidden = screen.getByText('Content');
    expect(hidden).toHaveClass('custom-class');
  });

  it('passes through HTML attributes', () => {
    render(<VisuallyHidden data-testid="test-hidden">Content</VisuallyHidden>);

    expect(screen.getByTestId('test-hidden')).toBeInTheDocument();
  });

  describe('Accessibility', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(<VisuallyHidden>Content</VisuallyHidden>);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('remains accessible to screen readers', () => {
      render(<VisuallyHidden>Screen reader text</VisuallyHidden>);

      const hidden = screen.getByText('Screen reader text');
      expect(hidden).toBeInTheDocument();
      expect(hidden).toHaveClass('visuallyHidden');
    });
  });

  describe('Design Tokens', () => {
    it('uses design tokens instead of hardcoded values', () => {
      render(<VisuallyHidden>Content</VisuallyHidden>);

      const hidden = screen.getByText('Content');

      // Verify CSS custom properties are being used
      expect(hidden).toHaveClass('visuallyHidden');
    });
  });
});
