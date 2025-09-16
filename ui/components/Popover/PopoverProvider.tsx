/** Context Provider for Popover */
'use client';
import * as React from 'react';

interface PopoverContextValue {}

const PopoverContext = React.createContext<PopoverContextValue | null>(null);
export const usePopoverContext = () => {
  const ctx = React.useContext(PopoverContext);
  if (!ctx)
    throw new Error('usePopoverContext must be used within PopoverProvider');
  return ctx;
};

export const PopoverProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const value = React.useMemo<PopoverContextValue>(() => ({}), []);
  return (
    <PopoverContext.Provider value={value}>{children}</PopoverContext.Provider>
  );
};
