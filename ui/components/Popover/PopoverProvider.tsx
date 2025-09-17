/** Context Provider for Popover */
'use client';
import * as React from 'react';
import {
  usePopover,
  type UsePopoverOptions,
  type UsePopoverReturn,
} from './usePopover';

export type PopoverContextValue = UsePopoverReturn;

const PopoverContext = React.createContext<PopoverContextValue | null>(null);
export const usePopoverContext = () => {
  const ctx = React.useContext(PopoverContext);
  if (!ctx)
    throw new Error('usePopoverContext must be used within PopoverProvider');
  return ctx;
};

export const PopoverProvider: React.FC<
  { children: React.ReactNode } & UsePopoverOptions
> = ({ children, ...options }) => {
  const value = usePopover(options);
  return (
    <PopoverContext.Provider value={value}>{children}</PopoverContext.Provider>
  );
};
