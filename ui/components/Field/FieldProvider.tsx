import React, { createContext, useContext, useMemo } from 'react';
import { useField } from './useField';
import type { FieldApi, FieldProps } from './types';

const Ctx = createContext<FieldApi | null>(null);

export const useFieldCtx = () => {
  const ctx = useContext(Ctx);
  if (!ctx)
    throw new Error('Field components must be used within <FieldProvider>');
  return ctx;
};

export function FieldProvider({
  children,
  ...props
}: React.PropsWithChildren<FieldProps>) {
  const api = useField(props);
  const value = useMemo(() => api, [api]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
