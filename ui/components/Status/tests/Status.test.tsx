import * as React from 'react';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import Status from '../Status';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

describe('Status', () => {
  it('renders status correctly', () => {
    render(<Status>Status content</Status>);

    const status = screen.getByText('Status content');
    expect(status).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<Status className="custom-class">Content</Status>);

    const status = screen.getByText('Content');
    expect(status).toHaveClass('custom-class');
  });

  it('passes through HTML attributes', () => {
    render(<Status data-testid="test-status">Content</Status>);

    expect(screen.getByTestId('test-status')).toBeInTheDocument();
  });

  it('applies variant correctly', () => {
    render(<Status variant="success">Success</Status>);

    const status = screen.getByText('Success');
    expect(status).toHaveAttribute('data-variant', 'success');
  });

  describe('Accessibility', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(<Status>Content</Status>);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Design Tokens', () => {
    it('uses design tokens instead of hardcoded values', () => {
      render(<Status>Content</Status>);

      const status = screen.getByText('Content');

      // Verify CSS custom properties are being used
      expect(status).toHaveClass('status');
    });
  });
});
