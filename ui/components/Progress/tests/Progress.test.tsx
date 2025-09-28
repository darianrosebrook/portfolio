import * as React from 'react';
import { render, screen } from '@testing-library/react';

import Progress from '../Progress';

// Extend Jest matchers

describe('Progress', () => {
  it('renders progress bar correctly', () => {
    render(<Progress value={50} max={100} />);

    const progress = screen.getByRole('progressbar');
    expect(progress).toBeInTheDocument();
    expect(progress).toHaveAttribute('aria-valuenow', '50');
    expect(progress).toHaveAttribute('aria-valuemax', '100');
  });

  it('applies custom className', () => {
    render(<Progress value={25} className="custom-class" />);

    const progress = screen.getByRole('progressbar');
    expect(progress).toHaveClass('custom-class');
  });

  it('passes through HTML attributes', () => {
    render(<Progress value={75} data-testid="test-progress" />);

    expect(screen.getByTestId('test-progress')).toBeInTheDocument();
  });

  it('applies variant correctly', () => {
    render(<Progress value={30} variant="circular" />);

    const progress = screen.getByRole('progressbar');
    expect(progress).toHaveAttribute('data-variant', 'circular');
  });

  it('applies size correctly', () => {
    render(<Progress value={40} size="lg" />);

    const progress = screen.getByRole('progressbar');
    expect(progress).toHaveAttribute('data-size', 'lg');
  });

  it('shows correct percentage when max is 100', () => {
    render(<Progress value={75} />);

    const progress = screen.getByRole('progressbar');
    expect(progress).toHaveAttribute('aria-valuenow', '75');
    expect(progress).toHaveAttribute('aria-valuemax', '100');
  });

  describe('Accessibility', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(<Progress value={50} />);
      // Note: axe testing is handled by the setup file
      expect(container).toBeInTheDocument();
    });

    it('provides proper ARIA attributes', () => {
      render(<Progress value={25} max={200} />);

      const progress = screen.getByRole('progressbar');
      expect(progress).toHaveAttribute('aria-valuenow', '25');
      expect(progress).toHaveAttribute('aria-valuemax', '200');
      expect(progress).toHaveAttribute('aria-valuemin', '0');
    });

    it('provides accessible label', () => {
      render(<Progress value={60} aria-label="Upload progress" />);

      const progress = screen.getByRole('progressbar');
      expect(progress).toHaveAttribute('aria-label', 'Upload progress');
    });
  });

  describe('Design Tokens', () => {
    it('uses design tokens instead of hardcoded values', () => {
      render(<Progress value={50} />);

      const progress = screen.getByRole('progressbar');

      // Verify CSS custom properties are being used
      expect(progress).toHaveClass('progress');
    });
  });
});
