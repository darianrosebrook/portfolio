'use client';
import * as React from 'react';
import { useOTPContext } from '../OTPProvider';
import styles from '../OTP.module.scss';

export interface OTPFieldProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    'size' | 'value' | 'onChange'
  > {
  index: number;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
}

export const OTPField = React.forwardRef<HTMLInputElement, OTPFieldProps>(
  ({ index, className = '', onKeyDown, onPaste, onChange, ...rest }, ref) => {
    const {
      chars,
      register,
      setChar,
      clearChar,
      handlePaste,
      disabled,
      readOnly,
      autocomplete,
      inputMode,
      mask,
      refs,
    } = useOTPContext();

    const handleKeyDown = React.useCallback<
      React.KeyboardEventHandler<HTMLInputElement>
    >(
      (e) => {
        const key = e.key;
        if (key === 'Backspace') {
          if (!chars[index]) {
            // Move backward if current field is empty
            if (index > 0) {
              refs.current[index - 1]?.focus();
            }
          } else {
            // Clear current field if it has content
            clearChar(index);
          }
          e.preventDefault();
        }
        if (key === 'ArrowLeft' && index > 0) {
          refs.current[index - 1]?.focus();
          e.preventDefault();
        }
        if (key === 'ArrowRight' && index < chars.length - 1) {
          refs.current[index + 1]?.focus();
          e.preventDefault();
        }
        onKeyDown?.(e);
      },
      [chars, index, clearChar, onKeyDown]
    );

    const handleChange = React.useCallback<
      React.ChangeEventHandler<HTMLInputElement>
    >(
      (e) => {
        const v = e.target.value;
        if (!v) {
          // Clear the field
          clearChar(index);
          onChange?.(e);
          return;
        }
        // Extract last character to handle multi-char input
        const lastChar = v.slice(-1);
        const prevValue = chars[index] || '';
        setChar(index, lastChar);
        // If the character was rejected, the input field will be reset by the controlled value
        onChange?.(e);
      },
      [index, setChar, clearChar, onChange, chars]
    );

    const handleOnPaste = React.useCallback<
      React.ClipboardEventHandler<HTMLInputElement>
    >(
      (e) => {
        const text = e.clipboardData.getData('text');
        if (text) {
          e.preventDefault();
          handlePaste(index, text);
        }
        onPaste?.(e);
      },
      [handlePaste, index, onPaste]
    );

    return (
      <input
        ref={(el) => {
          register(el, index);
          if (typeof ref === 'function') ref(el);
          else if (ref)
            (ref as React.MutableRefObject<HTMLInputElement | null>).current =
              el;
        }}
        className={[styles.field, className].filter(Boolean).join(' ')}
        value={mask && chars[index] ? '•' : chars[index] || ''}
        inputMode={inputMode}
        autoComplete={autocomplete}
        pattern={undefined} // platform heuristics suffice; validation lives in hook
        maxLength={1}
        onKeyDown={handleKeyDown}
        onChange={handleChange}
        onPaste={handleOnPaste}
        disabled={disabled}
        readOnly={readOnly}
        aria-label={rest['aria-label'] ?? `Digit ${index + 1}`}
        aria-invalid={undefined}
        {...rest}
      />
    );
  }
);
OTPField.displayName = 'OTPField';
