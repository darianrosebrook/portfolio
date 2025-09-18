/**
 * useDetails - Headless logic hook for Details composer
 *
 * Handles state management, coordination, and orchestration logic
 * separated from presentation concerns
 */
import { useCallback, useState, useId } from 'react';

export interface UseDetailsOptions {
  /** Controlled open state */
  open?: boolean;
  /** Default open state for uncontrolled */
  defaultOpen?: boolean;
  /** Callback when open state changes */
  onToggle?: (open: boolean) => void;
  /** Disabled state */
  disabled?: boolean;
  /** Custom id for accessibility */
  id?: string;
}

export interface UseDetailsReturn {
  /** Current open state */
  isOpen: boolean;
  /** Unique id for accessibility */
  id: string;
  /** Toggle function */
  toggle: () => void;
  /** Set open state directly */
  setOpen: (open: boolean) => void;
  /** Whether component is disabled */
  disabled: boolean;
  /** ARIA attributes for accessibility */
  ariaAttributes: {
    'aria-expanded': boolean;
    'aria-disabled'?: boolean;
  };
}

export function useDetails(options: UseDetailsOptions): UseDetailsReturn {
  const {
    open,
    defaultOpen = false,
    onToggle,
    disabled = false,
    id: providedId,
  } = options;

  const generatedId = useId();
  const id = providedId || `details-${generatedId}`;

  // Handle controlled vs uncontrolled state
  const isControlled = open !== undefined;
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isOpen = isControlled ? open : internalOpen;

  const setOpen = useCallback(
    (newOpen: boolean) => {
      if (disabled) return;

      if (!isControlled) {
        setInternalOpen(newOpen);
      }
      onToggle?.(newOpen);
    },
    [disabled, isControlled, onToggle]
  );

  const toggle = useCallback(() => {
    setOpen(!isOpen);
  }, [isOpen, setOpen]);

  const ariaAttributes = {
    'aria-expanded': isOpen,
    ...(disabled && { 'aria-disabled': true }),
  };

  return {
    isOpen,
    id,
    toggle,
    setOpen,
    disabled,
    ariaAttributes,
  };
}
