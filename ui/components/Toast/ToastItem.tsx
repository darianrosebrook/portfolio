'use client';
import * as React from 'react';
import { useToast } from './ToastProvider';
import type { ToastId } from './types';
import { ToastTitle } from './slots/ToastTitle';
import { ToastDescription } from './slots/ToastDescription';
import { ToastAction } from './slots/ToastAction';
import { ToastClose } from './slots/ToastClose';
import './Toast.css';

export interface ToastItemProps extends React.HTMLAttributes<HTMLDivElement> {
  id: ToastId;
}

export const ToastItem = React.forwardRef<HTMLDivElement, ToastItemProps>(
  ({ id, className = '', children, ...rest }, ref) => {
    const { toasts, dismiss, pause, resume } = useToast();
    const onMouseEnter = React.useCallback(() => pause(id), [pause, id]);
    const onMouseLeave = React.useCallback(() => resume(id), [resume, id]);
    const rec = toasts.get(id);
    if (!rec) return null;

    return (
      <div
        ref={ref}
        className={[
          'item',
          `variant-${rec.variant}`,
          rec.state === 'entering' ? 'entering' : '',
          rec.state === 'leaving' ? 'leaving' : '',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        role={rec.variant === 'error' ? 'alert' : 'status'}
        aria-live={rec.variant === 'error' ? 'assertive' : 'polite'}
        aria-atomic="true"
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        data-slot="toast"
        data-state={rec.state}
        data-variant={rec.variant}
        {...rest}
      >
        {children ?? (
          <>
            {rec.title && <ToastTitle>{rec.title}</ToastTitle>}
            {rec.description && (
              <ToastDescription>{rec.description}</ToastDescription>
            )}
            <div data-slot="toast-row" className="row">
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
