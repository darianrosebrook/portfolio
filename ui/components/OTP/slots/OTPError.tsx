'use client';
import * as React from 'react';

export interface OTPErrorProps extends React.HTMLAttributes<HTMLDivElement> {}

export const OTPError: React.FC<OTPErrorProps> = ({ children, ...rest }) => {
  if (!children) return null;
  return (
    <div role="alert" {...rest}>
      {children}
    </div>
  );
};
