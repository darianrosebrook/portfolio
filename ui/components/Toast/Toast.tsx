'use client';
import * as React from 'react';
import { ToastViewport } from './ToastViewport';
import styles from './Toast.module.scss';

export interface ToastProps extends React.ComponentPropsWithoutRef<'div'> {
  politeness?: 'polite' | 'assertive';
}

export const Toast: React.FC<ToastProps> = ({
  politeness = 'polite',
  ...rest
}) => {
  return (
    <ToastViewport
      className={styles.viewport}
      politeness={politeness}
      {...rest}
    />
  );
};

Toast.displayName = 'Toast';

export default Toast;
