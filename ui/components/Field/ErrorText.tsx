import React from 'react';
import { useFieldCtx } from './FieldProvider';

export function ErrorText() {
  const f = useFieldCtx();
  if (!f.errors.length) return null;
  return (
    <div id={f.errId} role="alert">
      {f.errors.map((e, i) => (
        <div key={i}>{e}</div>
      ))}
    </div>
  );
}
