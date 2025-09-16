'use client';
import * as React from 'react';
import { useToast } from './ToastProvider';
import { ToastItem } from './ToastItem';
import styles from './Toast.module.scss';

export interface ToastViewportProps
  extends React.HTMLAttributes<HTMLDivElement> {
  politeness?: 'polite' | 'assertive';
}

export const ToastViewport = React.forwardRef<
  HTMLDivElement,
  ToastViewportProps
>(({ className = '', politeness = 'polite', ...rest }, ref) => {
  const { visibleIds } = useToast();
  return (
    <div
      ref={ref}
      className={[styles.viewport, className].filter(Boolean).join(' ')}
      aria-live={politeness}
      {...rest}
    >
      {visibleIds.map((id) => (
        <ToastItem key={id} id={id} />
      ))}
    </div>
  );
});
ToastViewport.displayName = 'ToastViewport';
