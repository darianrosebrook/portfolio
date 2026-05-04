'use client';
import * as React from 'react';
import styles from '../Toast.module.scss';

export interface ToastTitleProps extends React.HTMLAttributes<HTMLDivElement> {}

export const ToastTitle: React.FC<ToastTitleProps> = ({
  className = '',
  children,
  ...rest
}) => {
  return (
    <div
      className={[styles.title, className].filter(Boolean).join(' ')}
      data-slot="toast-title"
      {...rest}
    >
      {children}
    </div>
  );
};

ToastTitle.displayName = 'Toast.Title';
