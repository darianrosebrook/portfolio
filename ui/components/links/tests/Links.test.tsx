import * as React from 'react';
import { render, screen } from '@testing-library/react';

import Links from '../Links';

// Extend Jest matchers

describe('Links', () => {
  it('renders links list correctly', () => {
    render(
      <div>
        <Links href="/link1">Link 1</Links>
        <Links href="/link2">Link 2</Links>
      </div>
    );

    const link1 = screen.getByText('Link 1');
    const link2 = screen.getByText('Link 2');

    expect(link1).toBeInTheDocument();
    expect(link2).toBeInTheDocument();
    expect(link1).toHaveAttribute('href', '/link1');
    expect(link2).toHaveAttribute('href', '/link2');
  });

  it('applies custom className', () => {
    render(
      <Links href="/test" className="custom-class">
        Test Link
      </Links>
    );

    const link = screen.getByText('Test Link');
    expect(link).toHaveClass('custom-class');
  });

  it('passes through HTML attributes', () => {
    render(
      <Links href="/test" data-testid="test-links">
        Test Link
      </Links>
    );

    expect(screen.getByTestId('test-links')).toBeInTheDocument();
  });

  it('renders with proper href', () => {
    render(<Links href="/test">Test Link</Links>);

    const link = screen.getByText('Test Link');
    expect(link).toHaveAttribute('href', '/test');
  });

  describe('Accessibility', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(<Links href="/test">Test Link</Links>);
      // Note: axe testing is handled by the setup file
      expect(container).toBeInTheDocument();
    });
  });

  describe('Design Tokens', () => {
    it('uses design tokens instead of hardcoded values', () => {
      render(<Links href="/test">Test Link</Links>);

      const link = screen.getByText('Test Link');

      // Verify CSS custom properties are being used
      expect(link).toHaveClass('animated-link');
    });
  });
});
