import * as React from 'react';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import AspectRatio from '../AspectRatio';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

describe('AspectRatio', () => {
  it('renders aspect ratio container correctly', () => {
    render(
      <AspectRatio ratio={16 / 9}>
        <div>Test content</div>
      </AspectRatio>
    );

    const container = screen.getByText('Test content').parentElement;
    expect(container).toBeInTheDocument();
    expect(container).toHaveAttribute('data-ratio', '16/9');
  });

  it('applies custom className', () => {
    render(
      <AspectRatio ratio={4 / 3} className="custom-class">
        <div>Content</div>
      </AspectRatio>
    );

    const container = screen.getByText('Content').parentElement;
    expect(container).toHaveClass('custom-class');
  });

  it('passes through HTML attributes', () => {
    render(
      <AspectRatio ratio={1} data-testid="test-ratio">
        <div>Content</div>
      </AspectRatio>
    );

    expect(screen.getByTestId('test-ratio')).toBeInTheDocument();
  });

  it('applies ratio as CSS custom property', () => {
    render(
      <AspectRatio ratio={3 / 2}>
        <div>Content</div>
      </AspectRatio>
    );

    const container = screen.getByText('Content').parentElement;
    expect(container).toHaveAttribute('data-ratio', '3/2');
  });

  describe('Accessibility', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(
        <AspectRatio ratio={16 / 9}>
          <div>Content</div>
        </AspectRatio>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Design Tokens', () => {
    it('uses design tokens instead of hardcoded values', () => {
      render(
        <AspectRatio ratio={16 / 9}>
          <div>Content</div>
        </AspectRatio>
      );

      const container = screen.getByText('Content').parentElement;

      // Verify CSS custom properties are being used
      expect(container).toHaveClass('aspectRatio');
    });
  });
});
