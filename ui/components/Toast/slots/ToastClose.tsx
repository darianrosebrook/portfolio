'use client';
import * as React from 'react';
import styles from '../Toast.module.scss';

export interface ToastCloseProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export const ToastClose: React.FC<ToastCloseProps> = ({
  className = '',
  children,
  ...rest
}) => {
  return (
    <button
      type="button"
      className={[styles.close, className].filter(Boolean).join(' ')}
      aria-label="Dismiss notification"
      {...rest}
    >
      {children || (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      )}
    </button>
  );
};

ToastClose.displayName = 'Toast.Close';
