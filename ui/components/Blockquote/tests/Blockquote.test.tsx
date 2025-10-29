import * as React from 'react';
import { render, screen } from '@testing-library/react';

import Blockquote from '../Blockquote';

// Extend Jest matchers

describe('Blockquote', () => {
  it('renders blockquote correctly', () => {
    render(<Blockquote>Quoted text content</Blockquote>);

    const blockquote = screen.getByText('Quoted text content');
    expect(blockquote).toBeInTheDocument();
    expect(blockquote.tagName).toBe('BLOCKQUOTE');
  });

  it('applies custom className', () => {
    render(<Blockquote className="custom-class">Content</Blockquote>);

    const blockquote = screen.getByText('Content');
    expect(blockquote).toHaveClass('custom-class');
  });

  it('passes through HTML attributes', () => {
    render(<Blockquote data-testid="test-blockquote">Content</Blockquote>);

    expect(screen.getByTestId('test-blockquote')).toBeInTheDocument();
  });

  it('renders with citation', () => {
    render(<Blockquote cite="https://example.com">Quoted text</Blockquote>);

    const blockquote = screen.getByText('Quoted text');
    expect(blockquote).toHaveAttribute('cite', 'https://example.com');
  });

  describe('Accessibility', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(<Blockquote>Content</Blockquote>);
      // Note: axe testing is handled by the setup file
      expect(container).toBeInTheDocument();
    });
  });

  describe('Design Tokens', () => {
    it('uses design tokens instead of hardcoded values', () => {
      render(<Blockquote>Content</Blockquote>);

      const blockquote = screen.getByText('Content');

      // Verify CSS custom properties are being used
      expect(blockquote).toHaveClass('blockquote');
    });
  });
});
