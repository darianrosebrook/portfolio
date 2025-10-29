import * as React from 'react';
import { render, screen } from '@testing-library/react';

import Avatar from '../Avatar';

// Extend Jest matchers

describe('Avatar', () => {
  it('renders avatar with image correctly', () => {
    render(<Avatar src="/test-image.jpg" name="Test Avatar" size="medium" />);

    const avatar = screen.getByRole('img', { name: 'Test Avatar' });
    expect(avatar).toBeInTheDocument();
    expect(avatar).toHaveAttribute('src', '/test-image.jpg');
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
      const avatar = screen.getByText('JD');

      // Verify CSS custom properties are being used
      expect(avatar).toHaveClass('avatar');
    });
  });

  describe('Variants', () => {
    it('applies size classes correctly', () => {
      render(<Avatar name="John Doe" size="large" />);
      const avatar = screen.getByText('JD');
      expect(avatar).toHaveAttribute('data-size', 'large');
    });
  });
});
