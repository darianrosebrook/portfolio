/** Headless logic hook for Sheet */
import * as React from 'react';

export type SheetSide = 'top' | 'right' | 'bottom' | 'left';

export interface UseSheetOptions {
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  side?: SheetSide;
  modal?: boolean;
}

export interface UseSheetReturn {
  isOpen: boolean;
  side: SheetSide;
  modal: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

export function useSheet(options: UseSheetOptions = {}): UseSheetReturn {
  const {
    defaultOpen = false,
    open: controlledOpen,
    onOpenChange,
    side = 'right',
    modal = true,
  } = options;

  const [internalOpen, setInternalOpen] = React.useState<boolean>(defaultOpen);
  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : internalOpen;

  const setOpen = React.useCallback(
    (newOpen: boolean) => {
      if (!isControlled) {
        setInternalOpen(newOpen);
      }
      onOpenChange?.(newOpen);
    },
    [isControlled, onOpenChange]
  );

  const open = React.useCallback(() => setOpen(true), [setOpen]);
  const close = React.useCallback(() => setOpen(false), [setOpen]);
  const toggle = React.useCallback(() => setOpen(!isOpen), [setOpen, isOpen]);

  return { isOpen, side, modal, open, close, toggle };
}
