'use client';
import * as React from 'react';
import type { ToastAction as ToastActionType } from '../types';
import styles from '../Toast.module.scss';

export interface ToastActionProps {
  action: ToastActionType;
  className?: string;
}

export const ToastAction: React.FC<ToastActionProps> = ({
  action,
  className = '',
}) => {
  return (
    <button
      type="button"
      className={[styles.action, className].filter(Boolean).join(' ')}
      onClick={action.onClick}
    >
      {action.label}
    </button>
  );
};

ToastAction.displayName = 'Toast.Action';
