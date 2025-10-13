'use client';
import * as React from 'react';
import { useToast } from './ToastProvider';
import type { ToastId } from './types';
import { ToastTitle } from './slots/ToastTitle';
import { ToastDescription } from './slots/ToastDescription';
import { ToastAction } from './slots/ToastAction';
import { ToastClose } from './slots/ToastClose';
import styles from './Toast.module.scss';

export interface ToastItemProps extends React.HTMLAttributes<HTMLDivElement> {
  id: ToastId;
}

export const ToastItem = React.forwardRef<HTMLDivElement, ToastItemProps>(
  ({ id, className = '', children, ...rest }, ref) => {
    const { toasts, dismiss, pause, resume } = useToast();
    const rec = toasts.get(id);
    if (!rec) return null;

    const onMouseEnter = React.useCallback(() => pause(id), [pause, id]);
    const onMouseLeave = React.useCallback(() => resume(id), [resume, id]);

    return (
      <div
        ref={ref}
        className={[
          styles.item,
          styles[`variant-${rec.variant}` as const] ?? '',
          rec.state === 'entering' ? styles.entering : '',
          rec.state === 'leaving' ? styles.leaving : '',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        role={rec.variant === 'error' ? 'alert' : 'status'}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        data-state={rec.state}
        {...rest}
      >
        {children ?? (
          <>
            {rec.title && <ToastTitle>{rec.title}</ToastTitle>}
            {rec.description && (
              <ToastDescription>{rec.description}</ToastDescription>
            )}
            <div className={styles.row}>
              {rec.action && <ToastAction action={rec.action} />}
              {rec.dismissible && <ToastClose onClick={() => dismiss(id)} />}
            </div>
          </>
        )}
      </div>
    );
  }
);
ToastItem.displayName = 'ToastItem';
