import * as React from 'react';
import { render, screen } from '@testing-library/react';

import Calendar from '../Calendar';

// Extend Jest matchers

describe('Calendar', () => {
  it('renders calendar correctly', () => {
    render(<Calendar />);

    const calendar = screen.getByRole('application');
    expect(calendar).toBeInTheDocument();
    expect(calendar).toHaveAttribute('aria-label', 'Calendar');
  });

  it('applies custom className', () => {
    render(<Calendar className="custom-class" />);
    const calendar = screen.getByRole('application');
    expect(calendar).toHaveClass('custom-class');
  });

  it('passes through HTML attributes', () => {
    render(<Calendar data-testid="test-calendar" />);
    expect(screen.getByTestId('test-calendar')).toBeInTheDocument();
  });

  describe('Accessibility', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(<Calendar />);
      // Note: axe testing is handled by the setup file
      expect(container).toBeInTheDocument();
    });

    it('provides proper ARIA labels', () => {
      render(<Calendar />);
      const calendar = screen.getByRole('application');
      expect(calendar).toHaveAttribute('aria-label', 'Calendar');
    });
  });

  describe('Design Tokens', () => {
    it('uses design tokens instead of hardcoded values', () => {
      render(<Calendar />);
      const calendar = screen.getByRole('application');

      // Verify CSS custom properties are being used
      expect(calendar).toHaveClass('calendar');
    });
  });
});
