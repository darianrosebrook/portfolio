'use client';
import * as React from 'react';

export interface ToastTitleProps extends React.HTMLAttributes<HTMLDivElement> {}

export const ToastTitle: React.FC<ToastTitleProps> = ({
  children,
  ...rest
}) => {
  return <div {...rest}>{children}</div>;
};
