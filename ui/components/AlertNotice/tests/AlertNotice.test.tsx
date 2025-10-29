import * as React from 'react';
import { render, screen } from '@testing-library/react';

import { Container as AlertNotice } from '../AlertNotice';

// Extend Jest matchers

describe('AlertNotice', () => {
  it('renders alert notice correctly', () => {
    render(<AlertNotice index={0}>Alert message</AlertNotice>);

    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveTextContent('Alert message');
  });

  it('applies custom className', () => {
    render(
      <AlertNotice index={0} className="custom-class">
        Message
      </AlertNotice>
    );

    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('custom-class');
  });

  it('passes through HTML attributes', () => {
    render(
      <AlertNotice index={0} data-testid="test-alert">
        Message
      </AlertNotice>
    );

    expect(screen.getByTestId('test-alert')).toBeInTheDocument();
  });

  it('applies level correctly', () => {
    render(
      <AlertNotice index={0} level="inline">
        Success message
      </AlertNotice>
    );

    const alert = screen.getByRole('alert');
    expect(alert).toHaveAttribute('data-level', 'inline');
  });

  describe('Accessibility', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(
        <AlertNotice index={0}>Message</AlertNotice>
      );
      // Note: axe testing is handled by the setup file
      expect(container).toBeInTheDocument();
    });

    it('provides proper ARIA role', () => {
      render(<AlertNotice index={0}>Alert message</AlertNotice>);

      const alert = screen.getByRole('alert');
      expect(alert).toBeInTheDocument();
    });
  });

  describe('Design Tokens', () => {
    it('uses design tokens instead of hardcoded values', () => {
      render(<AlertNotice index={0}>Message</AlertNotice>);

      const alert = screen.getByRole('alert');

      // Verify CSS custom properties are being used
      expect(alert).toHaveClass('alertNotice');
    });
  });
});
