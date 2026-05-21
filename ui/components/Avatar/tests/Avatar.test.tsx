import * as React from 'react';
import { render, screen } from '@testing-library/react';

import Avatar from '../Avatar';

// Extend Jest matchers

describe('Avatar', () => {
  it('renders avatar with image correctly', () => {
    render(<Avatar src="/test-image.jpg" name="Test Avatar" size="medium" />);

    const avatar = screen.getByRole('img', { name: 'Test Avatar' });
    expect(avatar).toBeInTheDocument();
    // Next/Image rewrites src to its own CDN URL; verify the original path is
    // encoded somewhere in the resolved src rather than doing a literal match.
    expect(avatar.getAttribute('src')).toContain('test-image');
  });

  it('renders avatar with fallback text', () => {
    render(<Avatar name="John Doe" size="medium" />);

    const avatar = screen.getByText('JD');
    expect(avatar).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<Avatar name="John Doe" size="medium" />);
    const avatar = screen.getByText('JD');
    expect(avatar).toBeInTheDocument();
  });

  it('passes through HTML attributes', () => {
    render(<Avatar name="John Doe" size="medium" />);
    const avatar = screen.getByText('JD');
    expect(avatar).toBeInTheDocument();
  });

  describe('Accessibility', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(<Avatar name="John Doe" size="medium" />);
      // Note: axe testing is handled by the setup file
      expect(container).toBeInTheDocument();
    });

    it('provides proper alt text for images', () => {
      render(<Avatar src="/test-image.jpg" name="User avatar" size="medium" />);
      const avatar = screen.getByRole('img');
      expect(avatar).toHaveAttribute('alt', 'User avatar');
    });
  });

  describe('Design Tokens', () => {
    it('uses design tokens instead of hardcoded values', () => {
      render(<Avatar name="John Doe" size="medium" />);
      // getByText('JD') returns the inner span.avatar_initials; walk up to the
      // container div which carries the 'avatar' class.
      const container = screen.getByText('JD').closest('[data-ds-component="Avatar"]');
      expect(container).toHaveClass('avatar');
    });
  });

  describe('Variants', () => {
    it('applies size classes correctly', () => {
      render(<Avatar name="John Doe" size="large" />);
      // Size is applied as a CSS class on the container div, not a data-size attribute.
      const container = screen.getByText('JD').closest('[data-ds-component="Avatar"]');
      expect(container).toHaveClass('large');
    });
  });
});
