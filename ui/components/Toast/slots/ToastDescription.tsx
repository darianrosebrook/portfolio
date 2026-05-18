'use client';
import * as React from 'react';
import '../Toast.css';

export interface ToastDescriptionProps extends React.HTMLAttributes<HTMLDivElement> {}

export const ToastDescription: React.FC<ToastDescriptionProps> = ({
  className = '',
  children,
  ...rest
}) => {
  return (
    <div
      className={['description', className].filter(Boolean).join(' ')}
      data-slot="toast-description"
      {...rest}
    >
      {children}
    </div>
  );
};

ToastDescription.displayName = 'Toast.Description';
