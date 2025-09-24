/** Context Provider for Sheet */
'use client';
import * as React from 'react';
import { useSheet, UseSheetOptions, UseSheetReturn } from './useSheet';

interface SheetContextValue extends UseSheetReturn {
  contentRef: React.RefObject<HTMLDivElement>;
  triggerRef: React.RefObject<HTMLButtonElement>;
}

const SheetContext = React.createContext<SheetContextValue | null>(null);

export const useSheetContext = () => {
  const ctx = React.useContext(SheetContext);
  if (!ctx)
    throw new Error('useSheetContext must be used within SheetProvider');
  return ctx;
};

export interface SheetProviderProps extends UseSheetOptions {
  children: React.ReactNode;
}

export const SheetProvider: React.FC<SheetProviderProps> = ({
  children,
  ...sheetOptions
}) => {
  const sheet = useSheet(sheetOptions);
  const contentRef = React.useRef<HTMLDivElement>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);

  const value = React.useMemo<SheetContextValue>(
    () => ({
      ...sheet,
      contentRef,
      triggerRef,
    }),
    [sheet]
  );

  return (
    <SheetContext.Provider value={value}>{children}</SheetContext.Provider>
  );
};
