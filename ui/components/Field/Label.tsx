import React from 'react';
import { useFieldCtx } from './FieldProvider';

export function Label({ children }: { children?: React.ReactNode }) {
  const f = useFieldCtx();
  return (
    <label id={f.labelId} htmlFor={f.inputId}>
      {children ?? f.label}
      {f.required ? <span aria-hidden="true"> *</span> : null}
    </label>
  );
}
