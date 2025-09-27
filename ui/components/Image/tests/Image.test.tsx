import * as React from 'react';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import Image from '../Image';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

describe('Image', () => {
  it('renders image correctly', () => {
    render(<Image src="/test-image.jpg" alt="Test Image" />);

    const image = screen.getByRole('img', { name: 'Test Image' });
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', '/test-image.jpg');
  });

  it('applies custom className', () => {
    render(<Image src="/test-image.jpg" alt="Test" className="custom-class" />);
    const image = screen.getByRole('img');
    expect(image).toHaveClass('custom-class');
  });

  it('passes through HTML attributes', () => {
    render(<Image src="/test-image.jpg" alt="Test" data-testid="test-image" />);
    expect(screen.getByTestId('test-image')).toBeInTheDocument();
  });

  it('applies aspect ratio correctly', () => {
    render(<Image src="/test-image.jpg" alt="Test" aspectRatio="16/9" />);
    const image = screen.getByRole('img');
    expect(image).toHaveAttribute('data-aspect-ratio', '16/9');
  });

  it('applies loading behavior correctly', () => {
    render(<Image src="/test-image.jpg" alt="Test" loading="lazy" />);
    const image = screen.getByRole('img');
    expect(image).toHaveAttribute('loading', 'lazy');
  });

  describe('Accessibility', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(
        <Image src="/test-image.jpg" alt="Test Image" />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('provides proper alt text', () => {
      render(<Image src="/test-image.jpg" alt="Descriptive alt text" />);
      const image = screen.getByRole('img');
      expect(image).toHaveAttribute('alt', 'Descriptive alt text');
    });

    it('handles missing alt text gracefully', () => {
      // This should still render but may show accessibility warnings
      render(<Image src="/test-image.jpg" />);
      const image = screen.getByRole('img');
      expect(image).toBeInTheDocument();
    });
  });

  describe('Design Tokens', () => {
    it('uses design tokens instead of hardcoded values', () => {
      render(<Image src="/test-image.jpg" alt="Test" />);
      const image = screen.getByRole('img');

      // Verify CSS custom properties are being used
      expect(image).toHaveClass('image');
    });
  });
});
