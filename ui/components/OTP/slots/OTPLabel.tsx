'use client';
import * as React from 'react';

export interface OTPLabelProps
  extends React.LabelHTMLAttributes<HTMLLabelElement> {}

export const OTPLabel: React.FC<OTPLabelProps> = ({ children, ...rest }) => {
  return <label {...rest}>{children}</label>;
};
