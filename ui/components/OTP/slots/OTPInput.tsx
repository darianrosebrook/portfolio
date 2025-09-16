'use client';
import * as React from 'react';
import { useOTPContext } from '../OTPProvider';
import styles from '../OTP.module.scss';

export interface OTPInputProps extends React.HTMLAttributes<HTMLDivElement> {}

export const OTPInput = React.forwardRef<HTMLDivElement, OTPInputProps>(
  ({ className = '', children, ...rest }, ref) => {
    const { id, describedBy, disabled, readOnly, length } = useOTPContext();
    return (
      <div
        ref={ref}
        role="group"
        id={id}
        aria-describedby={describedBy}
        aria-disabled={disabled || undefined}
        aria-readonly={readOnly || undefined}
        data-length={length}
        className={[styles.group, className].filter(Boolean).join(' ')}
        {...rest}
      >
        {children}
      </div>
    );
  }
);
OTPInput.displayName = 'OTPInput';
