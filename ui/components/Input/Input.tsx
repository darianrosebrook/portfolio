'use client';
import * as React from 'react';
import styles from './Input.module.scss';

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  invalid?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', invalid, 'aria-invalid': ariaInvalid, ...rest }, ref) => {
    const aria = ariaInvalid ?? (invalid ? true : undefined);
    return (
      <input
        ref={ref}
        className={[styles.input, invalid ? styles.invalid : '', className]
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
