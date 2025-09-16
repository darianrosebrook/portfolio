/**
 * OTP (Composer)
 * Generated via scaffold CLI.
 */
'use client';
import * as React from 'react';
import styles from './OTP.module.scss';
import { useOTPContext } from './OTPProvider';

export interface OTPProps extends React.HTMLAttributes<HTMLDivElement> {}

export const OTP = React.forwardRef<HTMLDivElement, OTPProps>(
  ({ className = '', children, ...rest }, ref) => {
    const ctx = useOTPContext();
    return (
      <div
        ref={ref}
        role="group"
        id={ctx.id}
        aria-describedby={ctx.describedBy}
        aria-disabled={ctx.disabled || undefined}
        aria-readonly={ctx.readOnly || undefined}
        data-length={ctx.length}
        className={[styles.otp, className].filter(Boolean).join(' ')}
        {...rest}
      >
        {children}
      </div>
    );
  }
);
OTP.displayName = 'OTP';

export default OTP;
