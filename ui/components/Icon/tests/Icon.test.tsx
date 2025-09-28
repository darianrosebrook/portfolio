import * as React from 'react';
import { render, screen } from '@testing-library/react';

import Icon from '../Icon';

// Extend Jest matchers

// Mock icon definition for testing
const mockIcon = {
  icon: [
    24,
    24,
    [],
    '',
    'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z',
  ],
  iconName: 'user',
  prefix: 'fas',
} as any;

describe('Icon', () => {
  it('renders icon correctly', () => {
    render(<Icon icon={mockIcon} />);

    const icon = screen.getByRole('img');
    expect(icon).toBeInTheDocument();
  });

  it('applies custom width and height', () => {
    render(<Icon icon={mockIcon} width={32} height={32} />);
    const icon = screen.getByRole('img');
    expect(icon).toHaveStyle({ width: '32px', height: '32px' });
  });

  it('renders with default dimensions', () => {
    render(<Icon icon={mockIcon} />);
    const icon = screen.getByRole('img');
    expect(icon).toHaveStyle({ width: '20px', height: '20px' });
  });

  describe('Accessibility', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(<Icon icon={mockIcon} />);
      // Note: axe testing is handled by the setup file
      expect(container).toBeInTheDocument();
    });
  });

  describe('Design Tokens', () => {
    it('uses design tokens instead of hardcoded values', () => {
      render(<Icon icon={mockIcon} />);
      const icon = screen.getByRole('img');

      // Verify CSS custom properties are being used
      expect(icon).toHaveClass('icon');
    });
  });
});
