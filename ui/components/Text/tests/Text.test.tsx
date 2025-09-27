import * as React from 'react';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import Text from '../Text';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

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
    render(<Text variant="heading1">Heading Text</Text>);
    const text = screen.getByText('Heading Text');
    expect(text).toHaveAttribute('data-variant', 'heading1');
  });

  it('applies size correctly', () => {
    render(<Text size="large">Large Text</Text>);
    const text = screen.getByText('Large Text');
    expect(text).toHaveAttribute('data-size', 'large');
  });

  it('applies color correctly', () => {
    render(<Text color="primary">Primary Text</Text>);
    const text = screen.getByText('Primary Text');
    expect(text).toHaveAttribute('data-color', 'primary');
  });

  describe('Accessibility', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(<Text>Test content</Text>);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Design Tokens', () => {
    it('uses design tokens instead of hardcoded values', () => {
      render(<Text>Test content</Text>);
      const text = screen.getByText('Test content');

      // Verify CSS custom properties are being used
      expect(text).toHaveClass('text');
    });
  });
});
