'use client';
import * as React from 'react';
import type { ToastContextValue, ToastId, ToastOptions } from './types';
import { useToastLogic } from './useToast';

const ToastContext = React.createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within <ToastProvider>');
  return ctx;
}

export interface ToastProviderProps {
  children: React.ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const api = useToastLogic();
  const value = React.useMemo(() => api, [api]);
  return (
    <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
  );
}
