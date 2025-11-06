/** Context Provider for Sheet */
'use client';
import * as React from 'react';
import { useSheet, UseSheetOptions, UseSheetReturn } from './useSheet';

interface SheetContextValue extends UseSheetReturn {
  contentRef: React.RefObject<HTMLDivElement | null>;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
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

  // Memoize context value with proper dependencies
  // Functions from useSheet are already stable (useCallback), but the object reference changes
  // Track the actual changing values: isOpen, side, modal
  // Refs are stable and don't need to be in dependencies
  const value = React.useMemo<SheetContextValue>(
    () => ({
      ...sheet,
      contentRef,
      triggerRef,
    }),
    [sheet.isOpen, sheet.side, sheet.modal, sheet.open, sheet.close, sheet.toggle]
  );

  return (
    <SheetContext.Provider value={value}>{children}</SheetContext.Provider>
  );
};
