/** Headless logic hook for Calendar */
import * as React from 'react';

export interface UseCalendarOptions {
  defaultOpen?: boolean;
}

export interface UseCalendarReturn {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

export function useCalendar(
  options: UseCalendarOptions = {}
): UseCalendarReturn {
  const { defaultOpen = false } = options;
  const [isOpen, setIsOpen] = React.useState<boolean>(defaultOpen);
  const open = React.useCallback(() => setIsOpen(true), []);
  const close = React.useCallback(() => setIsOpen(false), []);
  const toggle = React.useCallback(() => setIsOpen((prev) => !prev), []);
  return { isOpen, open, close, toggle };
}
