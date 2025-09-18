import React from 'react';
import { useFieldCtx } from './FieldProvider';

export const HelpText: React.FC<{ children?: React.ReactNode }> = ({
  children,
}) => {
  const f = useFieldCtx();
  const content = children ?? f.helpText;
  if (!content) return null;
  return <div id={f.helpId}>{content}</div>;
};
