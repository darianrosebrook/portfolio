import React from 'react';
import { useFieldCtx } from './FieldProvider';

export function HelpText({ children }: { children?: React.ReactNode }) {
  const f = useFieldCtx();
  const content = children ?? f.helpText;
  if (!content) return null;
  return <div id={f.helpId}>{content}</div>;
}
