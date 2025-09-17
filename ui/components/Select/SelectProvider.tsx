/** Context Provider for Select */
'use client';
import * as React from 'react';
import {
  useSelect,
  type UseSelectOptions,
  type UseSelectReturn,
} from './useSelect';

export type SelectContextValue = UseSelectReturn;

const SelectContext = React.createContext<SelectContextValue | null>(null);
export const useSelectContext = () => {
  const ctx = React.useContext(SelectContext);
  if (!ctx)
    throw new Error('useSelectContext must be used within SelectProvider');
  return ctx;
};

export const SelectProvider: React.FC<
  { children: React.ReactNode } & UseSelectOptions
> = ({ children, ...options }) => {
  const value = useSelect(options);
  return (
    <SelectContext.Provider value={value}>{children}</SelectContext.Provider>
  );
};
