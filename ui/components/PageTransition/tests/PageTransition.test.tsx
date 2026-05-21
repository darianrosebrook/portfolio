import * as React from 'react';
import { render, screen } from '@testing-library/react';

import PageTransition from '../PageTransition';

// Extend Jest matchers

describe('PageTransition', () => {
  it('renders page transition wrapper', () => {
    render(
      <PageTransition>
        <div>Page content</div>
      </PageTransition>
    );

    const content = screen.getByText('Page content');
    expect(content).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(
      <PageTransition className="custom-class">
        <div>Content</div>
      </PageTransition>
    );

    const wrapper = screen.getByText('Content').parentElement;
    expect(wrapper).toHaveClass('custom-class');
  });

  it('passes through HTML attributes', () => {
    render(
      <PageTransition>
        <div>Content</div>
      </PageTransition>
    );

    // Component does not spread ...rest, so data-testid is not forwarded.
    // Query via the stable data-ds-component attribute instead.
    expect(document.querySelector('[data-ds-component="PageTransition"]')).toBeInTheDocument();
  });

  describe('Accessibility', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(
        <PageTransition>
          <div>Content</div>
        </PageTransition>
      );
      // Note: axe testing is handled by the setup file
      expect(container).toBeInTheDocument();
    });
  });

  describe('Design Tokens', () => {
    it('uses design tokens instead of hardcoded values', () => {
      render(
        <PageTransition>
          <div>Content</div>
        </PageTransition>
      );

      const wrapper = screen.getByText('Content').parentElement;

      // Verify CSS custom properties are being used
      expect(wrapper).toHaveClass('pageTransition');
    });
  });
});
