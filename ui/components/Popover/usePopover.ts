/** Headless logic hook for Popover */
import * as React from 'react';

export interface UsePopoverOptions {
  /** Initial open state */
  defaultOpen?: boolean;
  /** Close when clicking outside content */
  closeOnOutsideClick?: boolean;
  /** Close when pressing Escape */
  closeOnEscape?: boolean;
}

export interface UsePopoverReturn {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  triggerRef: React.RefObject<HTMLElement | null>;
  contentRef: React.RefObject<HTMLElement | null>;
}

export function usePopover(options: UsePopoverOptions = {}): UsePopoverReturn {
  const {
    defaultOpen = false,
    closeOnOutsideClick = true,
    closeOnEscape = true,
  } = options;

  const [isOpen, setIsOpen] = React.useState<boolean>(defaultOpen);
  const triggerRef = React.useRef<HTMLElement>(null);
  const contentRef = React.useRef<HTMLElement>(null);

  const open = React.useCallback(() => setIsOpen(true), []);
  const close = React.useCallback(() => setIsOpen(false), []);
  const toggle = React.useCallback(() => setIsOpen((prev) => !prev), []);

  // Handle outside clicks
  React.useEffect(() => {
    if (!isOpen || !closeOnOutsideClick) return;
    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node | null;
      const trigger = triggerRef.current;
      const content = contentRef.current;
      if (!target) return;
      if (trigger?.contains(target)) return;
      if (content?.contains(target)) return;
      setIsOpen(false);
    }
    window.addEventListener('mousedown', handlePointerDown, { capture: true });
    return () =>
      window.removeEventListener('mousedown', handlePointerDown, {
        capture: true,
      } as any);
  }, [isOpen, closeOnOutsideClick]);

  // Handle Escape key
  React.useEffect(() => {
    if (!isOpen || !closeOnEscape) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setIsOpen(false);
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, closeOnEscape]);

  return { isOpen, open, close, toggle, triggerRef, contentRef };
}
