import React from 'react';
import { useFieldCtx } from './FieldProvider';

export const ErrorText: React.FC = () => {
  const f = useFieldCtx();
  if (!f.errors.length) return null;
  return (
    <div id={f.errId} role="alert">
      {f.errors.map((e: string, i: number) => (
        <div key={i}>{e}</div>
      ))}
    </div>
  );
};
