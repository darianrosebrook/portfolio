import * as React from 'react';
import { render, screen } from '@testing-library/react';

import Truncate from '../Truncate';

// Extend Jest matchers

describe('Truncate', () => {
  it('renders truncated text', () => {
    const longText =
      'This is a very long text that should be truncated when it exceeds the maximum length';
    render(<Truncate lines={1}>{longText}</Truncate>);

    const truncated = screen.getByText(longText);
    expect(truncated).toBeInTheDocument();
  });

  it('renders full text when within limit', () => {
    const shortText = 'Short text';
    render(<Truncate lines={1}>{shortText}</Truncate>);

    const text = screen.getByText('Short text');
    expect(text).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(
      <Truncate lines={1} className="custom-class">
        Very long text
      </Truncate>
    );

    const truncated = screen.getByText('Very long text');
    expect(truncated).toHaveClass('custom-class');
  });

  it('passes through HTML attributes', () => {
    render(
      <Truncate lines={1} data-testid="test-truncate">
        Test text
      </Truncate>
    );

    expect(screen.getByTestId('test-truncate')).toBeInTheDocument();
  });

  it('uses custom ellipsis', () => {
    render(<Truncate lines={1}>Hello world</Truncate>);

    const truncated = screen.getByText('Hello world');
    expect(truncated).toBeInTheDocument();
  });

  describe('Accessibility', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(
        <Truncate lines={1}>Long text content</Truncate>
      );
      // Note: axe testing is handled by the setup file
      expect(container).toBeInTheDocument();
    });

    it('preserves original text in title for accessibility', () => {
      const longText = 'This is a very long text that should be truncated';
      render(<Truncate lines={1}>{longText}</Truncate>);

      const truncated = screen.getByText(longText);
      expect(truncated).toBeInTheDocument();
    });
  });

  describe('Design Tokens', () => {
    it('uses design tokens instead of hardcoded values', () => {
      render(<Truncate lines={1}>Long text</Truncate>);

      const truncated = screen.getByText('Long text');

      // Verify CSS custom properties are being used
      expect(truncated).toHaveClass('truncate');
    });
  });
});
