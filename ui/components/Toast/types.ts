import * as React from 'react';

export type ToastId = string;

export type ToastVariant = 'info' | 'success' | 'warning' | 'error';

export interface ToastAction {
  label: string;
  onClick(): void;
}

export interface ToastOptions {
  id?: ToastId;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastAction;
  variant?: ToastVariant;
  autoDismiss?: boolean;
  durationMs?: number;
  dismissible?: boolean;
}

export type ToastState = 'entering' | 'visible' | 'leaving';

export interface ToastRecord
  extends Required<
    Pick<ToastOptions, 'variant' | 'autoDismiss' | 'durationMs' | 'dismissible'>
  > {
  id: ToastId;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastAction;
  state: ToastState;
  createdAt: number;
}

export interface ToastContextValue {
  toasts: Map<ToastId, ToastRecord>;
  visibleIds: ToastId[]; // ordered; max length 3
  enqueue(opts: ToastOptions): ToastId;
  dismiss(id?: ToastId): void; // if no id, dismiss all visible (FIFO)
  clear(): void; // remove all immediately
  pause(id: ToastId): void;
  resume(id: ToastId): void;
}
