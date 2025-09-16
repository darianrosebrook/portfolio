'use client';
import * as React from 'react';
import type { ToastAction as Action } from '../types';

export function ToastAction({ action }: { action: Action }) {
  return (
    <button type="button" onClick={action.onClick}>
      {action.label}
    </button>
  );
}
