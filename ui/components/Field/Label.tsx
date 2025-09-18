import React from 'react';
import { useFieldCtx } from './FieldProvider';

export const Label: React.FC<{ children?: React.ReactNode }> = ({
  children,
}) => {
  const f = useFieldCtx();
  return (
    <label id={f.labelId} htmlFor={f.inputId}>
      {children ?? f.label}
      {f.required ? <span aria-hidden="true"> *</span> : null}
    </label>
  );
};
