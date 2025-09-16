import type * as React from 'react';

export type FieldStatus = 'idle' | 'validating' | 'valid' | 'invalid';

export interface FieldProps {
  name: string;
  id?: string;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  defaultValue?: unknown;
  value?: unknown;
  onChange?(value: unknown): void;
  validate?(
    value: unknown,
    context: { name: string; touched: boolean; dirty: boolean }
  ): string | string[] | null | Promise<string | string[] | null>;
  label?: React.ReactNode;
  helpText?: React.ReactNode;
}

export interface FieldApi {
  // identity & associations
  name: string;
  inputId: string;
  labelId: string;
  helpId: string;
  errId: string;
  describedBy?: string;
  // state
  value: unknown;
  required: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  touched: boolean;
  dirty: boolean;
  status: FieldStatus;
  errors: string[];
  // handlers
  setValue(value: unknown): void;
  onBlur(): void;
  setTouched(v: boolean): void;
  // passthrough defaults
  label?: React.ReactNode;
  helpText?: React.ReactNode;
}
