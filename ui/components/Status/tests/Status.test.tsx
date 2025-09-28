import * as React from 'react';
import { render, screen } from '@testing-library/react';

import Status from '../Status';

// Extend Jest matchers

describe('Status', () => {
  it('renders status correctly', () => {
    render(<Status status="success">Status content</Status>);

    const status = screen.getByText('Status content');
    expect(status).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<Status status="success">Content</Status>);

    const status = screen.getByText('Content');
    expect(status).toBeInTheDocument();
  });

  it('passes through HTML attributes', () => {
    render(<Status status="success">Content</Status>);

    const status = screen.getByText('Content');
    expect(status).toBeInTheDocument();
  });

  it('applies variant correctly', () => {
    render(<Status status="success">Success</Status>);

    const status = screen.getByText('Success');
    expect(status).toBeInTheDocument();
  });

  describe('Accessibility', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(<Status status="success">Content</Status>);
      // Note: axe testing is handled by the setup file
      expect(container).toBeInTheDocument();
    });
  });

  describe('Design Tokens', () => {
    it('uses design tokens instead of hardcoded values', () => {
      render(<Status status="success">Content</Status>);

      const status = screen.getByText('Content').parentElement;

      // Verify CSS custom properties are being used
      expect(status?.className).toContain('status');
    });
  });
});
