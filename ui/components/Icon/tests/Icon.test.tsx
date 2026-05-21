import * as React from 'react';
import { render, screen } from '@testing-library/react';

import Icon from '../Icon';

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
  describe('with accessible label', () => {
    it('renders as role="img" with the supplied aria-label', () => {
      render(<Icon icon={mockIcon} label="User profile" />);

      const icon = screen.getByRole('img', { name: 'User profile' });
      expect(icon).toBeInTheDocument();
    });

    it('applies custom width and height', () => {
      render(<Icon icon={mockIcon} label="User" width={32} height={32} />);
      const icon = screen.getByRole('img', { name: 'User' });
      expect(icon).toHaveStyle({ width: '32px', height: '32px' });
    });

    it('renders with default dimensions when not specified', () => {
      render(<Icon icon={mockIcon} label="User" />);
      const icon = screen.getByRole('img', { name: 'User' });
      expect(icon).toHaveStyle({ width: '20px', height: '20px' });
    });

    it('hides the inner SVG from assistive tech', () => {
      const { container } = render(<Icon icon={mockIcon} label="User" />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('without label (decorative default)', () => {
    it('hides the icon from assistive tech via aria-hidden', () => {
      const { container } = render(<Icon icon={mockIcon} />);
      const root = container.querySelector('[data-ds-component="Icon"]');
      expect(root).toHaveAttribute('aria-hidden', 'true');
      expect(root).not.toHaveAttribute('role');
    });

    it('treats empty-string label as decorative', () => {
      const { container } = render(<Icon icon={mockIcon} label="" />);
      const root = container.querySelector('[data-ds-component="Icon"]');
      expect(root).toHaveAttribute('aria-hidden', 'true');
    });

    it('still renders the SVG geometry', () => {
      const { container } = render(<Icon icon={mockIcon} />);
      expect(container.querySelector('svg')).toBeInTheDocument();
      expect(container.querySelector('path')).toBeInTheDocument();
    });
  });

  describe('null guard', () => {
    it('renders nothing when icon is falsy', () => {
      const { container } = render(<Icon icon={null as any} />);
      expect(container.firstChild).toBeNull();
    });
  });

  describe('Design Tokens', () => {
    it('marks the root with the Icon design-system class and component id', () => {
      const { container } = render(<Icon icon={mockIcon} />);
      const root = container.querySelector('[data-ds-component="Icon"]');
      expect(root).toHaveClass('icon');
    });
  });
});
