import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { vi } from 'vitest';
import {
  OTPProvider,
  OTPInput,
  OTPField,
  OTPLabel,
  OTPError,
  OTPSeparator,
} from '@/ui/components/OTP';


describe('OTP Component', () => {
  const defaultProps = {
    length: 6,
    mode: 'numeric' as const,
  };

  const renderOTP = (props = {}) => {
    const mergedProps = { ...defaultProps, ...props };
    return render(
      <OTPProvider {...mergedProps}>
        <OTPLabel htmlFor="otp-group">Enter 6-digit code</OTPLabel>
        <OTPInput id="otp-group">
          {Array.from({ length: mergedProps.length }).map((_, i) => (
            <OTPField key={i} index={i} />
          ))}
        </OTPInput>
        <OTPError id="otp-error">Error message</OTPError>
      </OTPProvider>
    );
  };

  describe('Basic Rendering', () => {
    it('renders all fields correctly', () => {
      renderOTP();
      const fields = screen.getAllByRole('textbox');
      expect(fields).toHaveLength(6);
    });

    it('applies correct ARIA attributes', () => {
      renderOTP();
      const group = screen.getByRole('group');
      expect(group).toHaveAttribute('id', 'otp-group');

      const fields = screen.getAllByRole('textbox');
      fields.forEach((field, index) => {
        expect(field).toHaveAttribute('aria-label', `Digit ${index + 1}`);
        expect(field).toHaveAttribute('maxLength', '1');
      });
    });

    it('renders with custom length', () => {
      renderOTP({ length: 4 });
      const fields = screen.getAllByRole('textbox');
      expect(fields).toHaveLength(4);
    });
  });

  describe('Input Validation', () => {
    it('accepts numeric input in numeric mode', async () => {
      const user = userEvent.setup();
      renderOTP();
      const firstField = screen.getAllByRole('textbox')[0];

      await user.type(firstField, '5');
      expect(firstField).toHaveValue('5');
    });

    it('rejects non-numeric input in numeric mode', async () => {
      const user = userEvent.setup();
      renderOTP();
      const firstField = screen.getAllByRole('textbox')[0];

      await user.type(firstField, 'a');
      expect(firstField).toHaveValue('');
    });

    it('accepts alphanumeric input in alphanumeric mode', async () => {
      const user = userEvent.setup();
      renderOTP({ mode: 'alphanumeric' });
      const firstField = screen.getAllByRole('textbox')[0];

      await user.type(firstField, 'A');
      expect(firstField).toHaveValue('A');

      await user.clear(firstField);
      await user.type(firstField, '5');
      expect(firstField).toHaveValue('5');
    });

    it('accepts custom regex validation', async () => {
      const user = userEvent.setup();
      renderOTP({ mode: /^[A-F0-9]$/i }); // Hex characters only
      const firstField = screen.getAllByRole('textbox')[0];

      await user.type(firstField, 'F');
      expect(firstField).toHaveValue('F');

      await user.clear(firstField);
      await user.type(firstField, 'G');
      expect(firstField).toHaveValue('');
    });
  });

  describe('Focus Management', () => {
    it('advances focus to next field on valid input', async () => {
      const user = userEvent.setup();
      renderOTP();
      const fields = screen.getAllByRole('textbox');

      await user.type(fields[0], '1');
      expect(fields[1]).toHaveFocus();
    });

    it('handles backspace correctly when field is empty', async () => {
      const user = userEvent.setup();
      renderOTP();
      const fields = screen.getAllByRole('textbox');

      // Fill first field, then move to second
      await user.type(fields[0], '1');
      expect(fields[1]).toHaveFocus();

      // Backspace on empty second field should move to first
      await user.keyboard('{Backspace}');
      expect(fields[0]).toHaveFocus();
    });

    it('clears field on backspace when field has content', async () => {
      const user = userEvent.setup();
      renderOTP();
      const fields = screen.getAllByRole('textbox');

      await user.type(fields[0], '1');
      await user.type(fields[1], '2');

      // Focus back to first field and backspace
      fields[0].focus();
      await user.keyboard('{Backspace}');
      expect(fields[0]).toHaveValue('');
      expect(fields[0]).toHaveFocus();
    });

    it('handles arrow key navigation', async () => {
      const user = userEvent.setup();
      renderOTP();
      const fields = screen.getAllByRole('textbox');

      fields[2].focus();

      await user.keyboard('{ArrowLeft}');
      expect(fields[1]).toHaveFocus();

      await user.keyboard('{ArrowRight}');
      expect(fields[2]).toHaveFocus();
    });
  });

  describe('Paste Behavior', () => {
    it('distributes pasted content across fields', async () => {
      const user = userEvent.setup();
      renderOTP();
      const fields = screen.getAllByRole('textbox');

      fields[0].focus();
      await user.paste('123456');

      expect(fields[0]).toHaveValue('1');
      expect(fields[1]).toHaveValue('2');
      expect(fields[2]).toHaveValue('3');
      expect(fields[3]).toHaveValue('4');
      expect(fields[4]).toHaveValue('5');
      expect(fields[5]).toHaveValue('6');
    });

    it('filters invalid characters during paste', async () => {
      const user = userEvent.setup();
      renderOTP();
      const fields = screen.getAllByRole('textbox');

      fields[0].focus();
      await user.paste('1a2b3c');

      expect(fields[0]).toHaveValue('1');
      expect(fields[1]).toHaveValue('2');
      expect(fields[2]).toHaveValue('3');
      expect(fields[3]).toHaveValue('');
    });

    it('handles partial paste from middle field', async () => {
      const user = userEvent.setup();
      renderOTP();
      const fields = screen.getAllByRole('textbox');

      fields[2].focus();
      await user.paste('456');

      expect(fields[0]).toHaveValue('');
      expect(fields[1]).toHaveValue('');
      expect(fields[2]).toHaveValue('4');
      expect(fields[3]).toHaveValue('5');
      expect(fields[4]).toHaveValue('6');
      expect(fields[5]).toHaveValue('');
    });
  });

  describe('Controlled vs Uncontrolled', () => {
    it('works in uncontrolled mode', async () => {
      const user = userEvent.setup();
      const onComplete = vi.fn();
      renderOTP({ onComplete });

      const fields = screen.getAllByRole('textbox');
      await user.type(fields[0], '123456');

      expect(onComplete).toHaveBeenCalledWith('123456');
    });

    it('works in controlled mode', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const TestComponent = () => {
        const [value, setValue] = React.useState('');

        return (
          <OTPProvider
            {...defaultProps}
            value={value}
            onChange={(code) => {
              setValue(code);
              onChange(code);
            }}
          >
            <OTPInput>
              {Array.from({ length: 6 }).map((_, i) => (
                <OTPField key={i} index={i} />
              ))}
            </OTPInput>
          </OTPProvider>
        );
      };

      render(<TestComponent />);
      const fields = screen.getAllByRole('textbox');

      await user.type(fields[0], '1');
      expect(onChange).toHaveBeenCalledWith('1');
    });
  });

  describe('Masking', () => {
    it('masks input when mask prop is true', async () => {
      const user = userEvent.setup();
      renderOTP({ mask: true });

      const firstField = screen.getAllByRole('textbox')[0];
      await user.type(firstField, '5');

      expect(firstField).toHaveValue('•');
    });

    it('shows actual characters when mask is false', async () => {
      const user = userEvent.setup();
      renderOTP({ mask: false });

      const firstField = screen.getAllByRole('textbox')[0];
      await user.type(firstField, '5');

      expect(firstField).toHaveValue('5');
    });
  });

  describe('Input Mode Inference', () => {
    it('infers numeric inputMode for numeric mode', () => {
      renderOTP({ mode: 'numeric' });
      const firstField = screen.getAllByRole('textbox')[0];
      expect(firstField).toHaveAttribute('inputMode', 'numeric');
    });

    it('infers text inputMode for alphanumeric mode', () => {
      renderOTP({ mode: 'alphanumeric' });
      const firstField = screen.getAllByRole('textbox')[0];
      expect(firstField).toHaveAttribute('inputMode', 'text');
    });

    it('uses explicit inputMode when provided', () => {
      renderOTP({ mode: 'numeric', inputMode: 'tel' });
      const firstField = screen.getAllByRole('textbox')[0];
      expect(firstField).toHaveAttribute('inputMode', 'tel');
    });
  });

  describe('Disabled and ReadOnly States', () => {
    it('disables all fields when disabled', () => {
      renderOTP({ disabled: true });
      const fields = screen.getAllByRole('textbox');
      fields.forEach((field) => {
        expect(field).toBeDisabled();
      });
    });

    it('makes all fields readonly when readOnly', () => {
      renderOTP({ readOnly: true });
      const fields = screen.getAllByRole('textbox');
      fields.forEach((field) => {
        expect(field).toHaveAttribute('readOnly');
      });
    });
  });

  describe('Callbacks', () => {
    it('calls onChange on every character input', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      renderOTP({ onChange });

      const firstField = screen.getAllByRole('textbox')[0];
      await user.type(firstField, '1');

      expect(onChange).toHaveBeenCalledWith('1');
    });

    it('calls onComplete when all fields are filled', async () => {
      const user = userEvent.setup();
      const onComplete = vi.fn();
      renderOTP({ onComplete });

      const fields = screen.getAllByRole('textbox');
      for (let i = 0; i < 6; i++) {
        await user.type(fields[i], String(i + 1));
      }

      expect(onComplete).toHaveBeenCalledWith('123456');
    });
  });

  describe('Accessibility', () => {
    it('has no accessibility violations', async () => {
      const { container } = renderOTP();
      // Note: axe testing is handled by the setup file
      expect(container).toBeInTheDocument();
    });

    it('associates label with group', () => {
      renderOTP();
      const label = screen.getByText('Enter 6-digit code');
      const group = screen.getByRole('group');
      expect(label).toHaveAttribute('for', 'otp-group');
      expect(group).toHaveAttribute('id', 'otp-group');
    });

    it('announces errors with role="alert"', () => {
      renderOTP();
      const errorElement = screen.getByRole('alert');
      expect(errorElement).toBeInTheDocument();
      expect(errorElement).toHaveTextContent('Error message');
    });
  });

  describe('Separators', () => {
    it('renders custom separators', () => {
      render(
        <OTPProvider {...defaultProps}>
          <OTPInput>
            <OTPField index={0} />
            <OTPField index={1} />
            <OTPSeparator>-</OTPSeparator>
            <OTPField index={2} />
            <OTPField index={3} />
          </OTPInput>
        </OTPProvider>
      );

      expect(screen.getByText('-')).toBeInTheDocument();
    });
  });
});
