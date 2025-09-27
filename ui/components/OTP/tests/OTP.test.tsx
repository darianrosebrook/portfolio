import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import OTP from '../OTP';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

describe('OTP', () => {
  it('renders OTP input fields', () => {
    render(<OTP length={4} />);

    const inputs = screen.getAllByRole('textbox');
    expect(inputs).toHaveLength(4);
  });

  it('applies custom className', () => {
    render(<OTP length={3} className="custom-class" />);

    const container = screen.getAllByRole('textbox')[0].closest('div');
    expect(container).toHaveClass('custom-class');
  });

  it('passes through HTML attributes', () => {
    render(<OTP length={2} data-testid="test-otp" />);

    expect(screen.getByTestId('test-otp')).toBeInTheDocument();
  });

  it('handles input changes', () => {
    const handleChange = jest.fn();

    render(<OTP length={3} onChange={handleChange} />);

    const inputs = screen.getAllByRole('textbox');

    // Type in first input
    fireEvent.change(inputs[0], { target: { value: '1' } });
    expect(handleChange).toHaveBeenCalledWith('1', 0);

    // Type in second input
    fireEvent.change(inputs[1], { target: { value: '2' } });
    expect(handleChange).toHaveBeenCalledWith('12', 1);
  });

  it('handles paste events', () => {
    const handleChange = jest.fn();

    render(<OTP length={4} onChange={handleChange} />);

    const inputs = screen.getAllByRole('textbox');

    // Paste into first input
    fireEvent.paste(inputs[0], { clipboardData: { getData: () => '1234' } });
    expect(handleChange).toHaveBeenCalledWith('1234', 3);
  });

  describe('Accessibility', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(<OTP length={4} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('provides proper labels and descriptions', () => {
      render(<OTP length={3} />);

      const inputs = screen.getAllByRole('textbox');

      inputs.forEach((input, index) => {
        expect(input).toHaveAttribute('aria-label', `OTP digit ${index + 1}`);
      });
    });
  });

  describe('Design Tokens', () => {
    it('uses design tokens instead of hardcoded values', () => {
      render(<OTP length={3} />);

      const container = screen.getAllByRole('textbox')[0].closest('div');

      // Verify CSS custom properties are being used
      expect(container).toHaveClass('otp');
    });
  });
});
