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

  // Memoize context value. Pick the keys explicitly so the closure's reads
  // match the dep array exactly. (useSheet returns a fresh object each
  // render, so depending on `sheet` itself would never deduplicate; we
  // depend on its useCallback-stable functions and primitive state.)
  const { isOpen, side, modal, open, close, toggle } = sheet;
  const value = React.useMemo<SheetContextValue>(
    () => ({
      isOpen,
      side,
      modal,
      open,
      close,
      toggle,
      contentRef,
      triggerRef,
    }),
    [isOpen, side, modal, open, close, toggle]
  );

  return (
    <SheetContext.Provider value={value}>{children}</SheetContext.Provider>
  );
};
