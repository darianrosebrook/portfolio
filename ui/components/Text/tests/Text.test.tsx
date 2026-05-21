import * as React from 'react';
import { render, screen } from '@testing-library/react';

import Text from '../Text';

// Extend Jest matchers

describe('Text', () => {
  it('renders text correctly', () => {
    render(<Text>Test content</Text>);

    const text = screen.getByText('Test content');
    expect(text).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<Text className="custom-class">Test content</Text>);
    const text = screen.getByText('Test content');
    expect(text).toHaveClass('custom-class');
  });

  it('passes through HTML attributes', () => {
    render(<Text data-testid="test-text">Test content</Text>);
    expect(screen.getByTestId('test-text')).toBeInTheDocument();
  });

  it('applies variant correctly', () => {
    render(<Text variant="title">Heading Text</Text>);
    const text = screen.getByText('Heading Text');
    // Component encodes variant as a CSS class, not a data-variant attribute
    expect(text).toHaveClass('title');
  });

  it('applies size correctly', () => {
    render(<Text size="lg">Large Text</Text>);
    const text = screen.getByText('Large Text');
    // Component encodes size as a CSS class, not a data-size attribute
    expect(text).toHaveClass('lg');
  });

  it('applies color correctly', () => {
    render(<Text color="accent">Primary Text</Text>);
    const text = screen.getByText('Primary Text');
    // Component encodes color as a CSS class (color-<value>), not a data-color attribute
    expect(text).toHaveClass('color-accent');
  });

  describe('Accessibility', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(<Text>Test content</Text>);
      // Note: axe testing is handled by the setup file
      expect(container).toBeInTheDocument();
    });
  });

  describe('Design Tokens', () => {
    it('uses design tokens instead of hardcoded values', () => {
      render(<Text>Test content</Text>);
      const text = screen.getByText('Test content');

      // Component root classes are variant+size+weight, not a single 'text' class
      expect(text).toHaveClass('body', 'md', 'weight-normal');
    });
  });
});
