/**
 * OTP (Composer)
 * Generated via scaffold CLI.
 */
'use client';
import * as React from 'react';
import './OTP.css';
import { useOTPContext } from './OTPProvider';

export interface OTPProps extends React.HTMLAttributes<HTMLDivElement> {}

export const OTP = React.forwardRef<HTMLDivElement, OTPProps>(
  ({ className = '', children, ...rest }, ref) => {
    const ctx = useOTPContext();
    return (
      <div
        ref={ref}
        role="group"
        data-ds-component="Otp"
        data-slot="otp"
        id={ctx.id}
        aria-describedby={ctx.describedBy}
        aria-disabled={ctx.disabled || undefined}
        aria-readonly={ctx.readOnly || undefined}
        data-length={ctx.length}
        className={['otp', className].filter(Boolean).join(' ')}
        {...rest}
      >
        {children}
      </div>
    );
  }
);
OTP.displayName = 'OTP';

export default OTP;
