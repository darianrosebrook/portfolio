/** Context Provider for OTP */
'use client';
import * as React from 'react';
import { useOTP, UseOTPOptions, UseOTPResult } from './useOTP';

export interface OTPProviderProps extends UseOTPOptions {
  children: React.ReactNode;
  id?: string;
  'aria-describedby'?: string;
  autocomplete?: string;
  inputMode?: React.InputHTMLAttributes<HTMLInputElement>['inputMode'];
  mask?: boolean;
  separator?: 'none' | 'space' | 'dash' | React.ReactNode;
}

export interface OTPContextValue extends UseOTPResult {
  id?: string;
  describedBy?: string;
  autocomplete: string;
  inputMode?: React.InputHTMLAttributes<HTMLInputElement>['inputMode'];
  mask: boolean;
  separator: 'none' | 'space' | 'dash' | React.ReactNode;
  refs: React.MutableRefObject<HTMLInputElement[]>;
}

const OTPContext = React.createContext<OTPContextValue | null>(null);
export const useOTPContext = () => {
  const ctx = React.useContext(OTPContext);
  if (!ctx) throw new Error('useOTPContext must be used within OTPProvider');
  return ctx;
};

export const OTPProvider: React.FC<OTPProviderProps> = (props) => {
  const {
    children,
    id,
    'aria-describedby': describedBy,
    autocomplete = 'one-time-code',
    inputMode,
    mask = false,
    separator = 'space',
    ...opts
  } = props;

  const api = useOTP(opts);

  // Infer inputMode based on mode if not explicitly provided
  const inferredInputMode = React.useMemo(() => {
    if (inputMode) return inputMode;
    if (opts.mode === 'numeric') return 'numeric';
    if (opts.mode === 'alphanumeric') return 'text';
    return 'text';
  }, [inputMode, opts.mode]);

  const value = React.useMemo<OTPContextValue>(
    () => ({
      ...api,
      id,
      describedBy,
      autocomplete,
      inputMode: inferredInputMode,
      mask,
      separator,
      refs: api.refs,
    }),
    [api, id, describedBy, autocomplete, inferredInputMode, mask, separator]
  );

  return <OTPContext.Provider value={value}>{children}</OTPContext.Provider>;
};
