/** Headless logic hook for Dialog */
import * as React from 'react';

export interface UseDialogOptions {
  defaultOpen?: boolean;
}

export interface UseDialogReturn {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

export function useDialog(options: UseDialogOptions = {}): UseDialogReturn {
  const { defaultOpen = false } = options;
  const [isOpen, setIsOpen] = React.useState<boolean>(defaultOpen);
  const open = React.useCallback(() => setIsOpen(true), []);
  const close = React.useCallback(() => setIsOpen(false), []);
  const toggle = React.useCallback(() => setIsOpen((prev) => !prev), []);
  return { isOpen, open, close, toggle };
}
