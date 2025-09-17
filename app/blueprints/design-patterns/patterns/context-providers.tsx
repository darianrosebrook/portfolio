// Context Provider Pattern
// Orchestrate complex state and behavior through React context

import React, { createContext, useContext, useMemo } from 'react';

/**
 * Context providers orchestrate complex state and behavior, providing a clean API for
 * consuming components while maintaining encapsulation and performance.
 */

// Example: OTP Provider (from example1.md)
interface OTPContextValue {
  length: number;
  chars: string[];
  disabled: boolean;
  readOnly: boolean;
  register: (el: HTMLInputElement | null, i: number) => void;
  setChar: (index: number, ch: string) => void;
  clearChar: (index: number) => void;
  handlePaste: (index: number, text: string) => void;
  focus: (i: number) => void;
  id?: string;
  describedBy?: string;
  autocomplete?: string;
  inputMode?: React.InputHTMLAttributes<HTMLInputElement>['inputMode'];
  mask?: boolean;
  separator?: 'none' | 'space' | 'dash' | React.ReactNode;
}

const OtpCtx = createContext<OTPContextValue | null>(null);

export const useOtpCtx = () => {
  const ctx = useContext(OtpCtx);
  if (!ctx) throw new Error('OTP components must be used within <OTPProvider>');
  return ctx;
};

export interface OTPProviderProps {
  children: React.ReactNode;
  length: number;
  mode: 'numeric' | 'alphanumeric' | RegExp;
  value?: string;
  defaultValue?: string;
  onChange?(code: string): void;
  onComplete?(code: string): void;
  disabled?: boolean;
  readOnly?: boolean;
  id?: string;
  'aria-describedby'?: string;
  autocomplete?: string;
  inputMode?: React.InputHTMLAttributes<HTMLInputElement>['inputMode'];
  mask?: boolean;
  separator?: 'none' | 'space' | 'dash' | React.ReactNode;
}

export function OTPProvider(props: OTPProviderProps) {
  const {
    children,
    length,
    mode,
    value,
    defaultValue,
    onChange,
    onComplete,
    disabled,
    readOnly,
    id,
    'aria-describedby': describedBy,
    autocomplete = 'one-time-code',
    inputMode,
    mask = false,
    separator = 'space',
  } = props;

  // Headless logic hook (from previous example)
  const api = useOtp({
    length,
    mode,
    value,
    defaultValue,
    onChange,
    onComplete,
    disabled,
    readOnly,
  });

  // Context value combines logic with configuration
  const value = useMemo(
    () => ({
      ...api,
      id,
      describedBy,
      autocomplete,
      inputMode,
      mask,
      separator,
    }),
    [api, id, describedBy, autocomplete, inputMode, mask, separator]
  );

  return <OtpCtx.Provider value={value}>{children}</OtpCtx.Provider>;
}

/**
 * Key Benefits of Context Providers:
 *
 * 1. Centralized State: All related state lives in one place
 * 2. Clean APIs: Components get exactly what they need
 * 3. Performance: Context boundaries prevent unnecessary re-renders
 * 4. Testing: Easy to mock and test in isolation
 * 5. Composition: Multiple providers can be composed together
 */

// Example: Field Provider (from example6.md)
interface FieldContextValue {
  name: string;
  inputId: string;
  labelId: string;
  helpId: string;
  errId: string;
  describedBy?: string;
  value: any;
  required: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  touched: boolean;
  dirty: boolean;
  status: 'idle' | 'validating' | 'valid' | 'invalid';
  errors: string[];
  setValue: (value: any) => void;
  onBlur: () => void;
  setTouched: (touched: boolean) => void;
  label?: React.ReactNode;
  helpText?: React.ReactNode;
}

const FieldCtx = createContext<FieldContextValue | null>(null);

export const useFieldCtx = () => {
  const ctx = useContext(FieldCtx);
  if (!ctx)
    throw new Error('Field components must be used within <FieldProvider>');
  return ctx;
};

export interface FieldProviderProps {
  children: React.ReactNode;
  name: string;
  id?: string;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  defaultValue?: any;
  value?: any;
  onChange?(value: any): void;
  validate?(
    value: any,
    context: { name: string; touched: boolean; dirty: boolean }
  ): string | string[] | null | Promise<string | string[] | null>;
  label?: React.ReactNode;
  helpText?: React.ReactNode;
}

export function FieldProvider(props: FieldProviderProps) {
  const {
    children,
    name,
    id: providedId,
    required = false,
    disabled,
    readOnly,
    defaultValue,
    value,
    onChange,
    validate,
    label,
    helpText,
  } = props;

  // Headless field logic
  const api = useField({
    name,
    id: providedId,
    required,
    disabled,
    readOnly,
    defaultValue,
    value,
    onChange,
    validate,
    label,
    helpText,
  });

  const value = useMemo(() => api, [api]);

  return <FieldCtx.Provider value={value}>{children}</FieldCtx.Provider>;
}

// Placeholder for useField hook (would be imported from actual implementation)
function useField(props: any) {
  // Implementation would be here
  return {} as FieldContextValue;
}

/**
 * Provider vs Direct Props Decision Matrix:
 *
 * Use Providers when:
 * - Complex state needs to be shared across multiple components
 * - Component tree becomes unwieldy with prop drilling
 * - State logic is reusable across different UI implementations
 * - You need performance optimization through context boundaries
 *
 * Use Direct Props when:
 * - Simple state that doesn't need to be shared
 * - Clear parent-child relationship
 * - Performance is critical and context overhead is too much
 * - State is tightly coupled to a single component
 */
