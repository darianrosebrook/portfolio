'use client';
import * as React from 'react';

export interface OTPSeparatorProps {
  children?: React.ReactNode;
  className?: string;
}

export const OTPSeparator: React.FC<OTPSeparatorProps> = ({
  children = ' ',
  className,
}) => {
  return (
    <span data-slot="otp-separator" className={className}>
      {children}
    </span>
  );
};
