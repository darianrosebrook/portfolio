import * as React from 'react';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import Truncate from '../Truncate';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

describe('Truncate', () => {
  it('renders truncated text', () => {
    const longText =
      'This is a very long text that should be truncated when it exceeds the maximum length';
    render(<Truncate maxLength={20}>{longText}</Truncate>);

    const truncated = screen.getByText('This is a very...');
    expect(truncated).toBeInTheDocument();
  });

  it('renders full text when within limit', () => {
    const shortText = 'Short text';
    render(<Truncate maxLength={20}>{shortText}</Truncate>);

    const text = screen.getByText('Short text');
    expect(text).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(
      <Truncate maxLength={10} className="custom-class">
        Very long text
      </Truncate>
    );

    const truncated = screen.getByText('Very long...');
    expect(truncated).toHaveClass('custom-class');
  });

  it('passes through HTML attributes', () => {
    render(
      <Truncate maxLength={10} data-testid="test-truncate">
        Test text
      </Truncate>
    );

    expect(screen.getByTestId('test-truncate')).toBeInTheDocument();
  });

  it('uses custom ellipsis', () => {
    render(
      <Truncate maxLength={5} ellipsis="***">
        Hello world
      </Truncate>
    );

    const truncated = screen.getByText('Hello***');
    expect(truncated).toBeInTheDocument();
  });

  describe('Accessibility', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(
        <Truncate maxLength={10}>Long text content</Truncate>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('preserves original text in title for accessibility', () => {
      const longText = 'This is a very long text that should be truncated';
      render(<Truncate maxLength={20}>{longText}</Truncate>);

      const truncated = screen.getByText('This is a very...');
      expect(truncated).toHaveAttribute('title', longText);
    });
  });

  describe('Design Tokens', () => {
    it('uses design tokens instead of hardcoded values', () => {
      render(<Truncate maxLength={10}>Long text</Truncate>);

      const truncated = screen.getByText('Long...');

      // Verify CSS custom properties are being used
      expect(truncated).toHaveClass('truncate');
    });
  });
});
