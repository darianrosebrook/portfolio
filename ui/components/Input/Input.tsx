'use client';
import * as React from 'react';
import './Input.css';

export interface InputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'size'
> {
  invalid?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', invalid, 'aria-invalid': ariaInvalid, ...rest }, ref) => {
    const aria = ariaInvalid ?? (invalid ? true : undefined);
    return (
      <input
        ref={ref}
        data-ds-component="Input"
        data-slot="input"
        className={['input', invalid ? 'invalid' : '', className]
          .filter(Boolean)
          .join(' ')}
        aria-invalid={aria}
        {...rest}
      />
    );
  }
);
Input.displayName = 'Input';

export default Input;
