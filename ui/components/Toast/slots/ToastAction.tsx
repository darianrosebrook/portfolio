'use client';
import * as React from 'react';
import type { ToastAction as Action } from '../Types';

export function ToastAction({ action }: { action: Action }) {
  return (
    <button type="button" onClick={action.onClick}>
      {action.label}
    </button>
  );
}
