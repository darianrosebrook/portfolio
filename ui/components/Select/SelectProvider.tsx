/** Context Provider for Select */
'use client';
import * as React from 'react';

interface SelectContextValue {}

const SelectContext = React.createContext<SelectContextValue | null>(null);
export const useSelectContext = () => {
  const ctx = React.useContext(SelectContext);
  if (!ctx)
    throw new Error('useSelectContext must be used within SelectProvider');
  return ctx;
};

export const SelectProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const value = React.useMemo<SelectContextValue>(() => ({}), []);
  return (
    <SelectContext.Provider value={value}>{children}</SelectContext.Provider>
  );
};
