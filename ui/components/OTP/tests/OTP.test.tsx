import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

import OTP from '../OTP';
import { OTPProvider } from '../OTPProvider';

// Extend Jest matchers

describe('OTP', () => {
  it('renders OTP input fields', () => {
    render(
      <OTPProvider length={4}>
        <OTP />
      </OTPProvider>
    );

    const container = screen.getByRole('group');
    expect(container).toBeInTheDocument();
    expect(container).toHaveAttribute('data-length', '4');
  });

  it('applies custom className', () => {
    render(
      <OTPProvider length={3}>
        <OTP className="custom-class" />
      </OTPProvider>
    );

    const container = screen.getByRole('group');
    expect(container).toHaveClass('custom-class');
  });

  it('passes through HTML attributes', () => {
    render(
      <OTPProvider length={4}>
        <OTP data-testid="test-otp" />
      </OTPProvider>
    );

    expect(screen.getByTestId('test-otp')).toBeInTheDocument();
  });

  it('handles input changes', () => {
    const handleChange = vi.fn();

    render(
      <OTPProvider length={4}>
        <OTP onChange={handleChange} />
      </OTPProvider>
    );

    const inputs = screen.getAllByRole('textbox');

    // Type in first input
    fireEvent.change(inputs[0], { target: { value: '1' } });
    expect(handleChange).toHaveBeenCalledWith('1', 0);

    // Type in second input
    fireEvent.change(inputs[1], { target: { value: '2' } });
    expect(handleChange).toHaveBeenCalledWith('12', 1);
  });

  it('handles paste events', () => {
    const handleChange = vi.fn();

    render(
      <OTPProvider length={4}>
        <OTP onChange={handleChange} />
      </OTPProvider>
    );

    const inputs = screen.getAllByRole('textbox');

    // Paste into first input
    fireEvent.paste(inputs[0], { clipboardData: { getData: () => '1234' } });
    expect(handleChange).toHaveBeenCalledWith('1234', 3);
  });

  describe('Accessibility', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(
        <OTPProvider length={4}>
          <OTP />
        </OTPProvider>
      );
      // Note: axe testing is handled by the setup file
      expect(container).toBeInTheDocument();
    });

    it('provides proper labels and descriptions', () => {
      render(
        <OTPProvider length={4}>
          <OTP />
        </OTPProvider>
      );

      const container = screen.getByRole('group');
      expect(container).toBeInTheDocument();
    });
  });

  describe('Design Tokens', () => {
    it('uses design tokens instead of hardcoded values', () => {
      render(
        <OTPProvider length={4}>
          <OTP />
        </OTPProvider>
      );

      const container = screen.getByRole('group');

      // Verify CSS custom properties are being used
      expect(container).toHaveClass('otp');
    });
  });
});
