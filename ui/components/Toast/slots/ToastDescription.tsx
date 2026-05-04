'use client';
import * as React from 'react';
import styles from '../Toast.module.scss';

export interface ToastDescriptionProps extends React.HTMLAttributes<HTMLDivElement> {}

export const ToastDescription: React.FC<ToastDescriptionProps> = ({
  className = '',
  children,
  ...rest
}) => {
  return (
    <div
      className={[styles.description, className].filter(Boolean).join(' ')}
      data-slot="toast-description"
      {...rest}
    >
      {children}
    </div>
  );
};

ToastDescription.displayName = 'Toast.Description';
