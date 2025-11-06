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
  // Fix: Hooks must be called unconditionally at the top level
  // Cannot call hooks inside useMemo, useCallback, or conditionally
  const selectValue = useSelect(options);
  
  // useSelect already returns stable function references (via useCallback)
  // and manages state properly. The context value will update when state changes,
  // which is the correct behavior. No additional memoization needed.
  return (
    <SelectContext.Provider value={selectValue}>{children}</SelectContext.Provider>
  );
};
