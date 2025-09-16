'use client';
import * as React from 'react';

export interface ToastDescriptionProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export const ToastDescription: React.FC<ToastDescriptionProps> = ({
  children,
  ...rest
}) => {
  return <div {...rest}>{children}</div>;
};
