'use client';
import * as React from 'react';

export interface ToastCloseProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export const ToastClose: React.FC<ToastCloseProps> = ({
  children = 'Dismiss',
  ...rest
}) => {
  return (
    <button type="button" aria-label="Dismiss notification" {...rest}>
      {children}
    </button>
  );
};
