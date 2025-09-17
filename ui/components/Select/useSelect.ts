/** Headless logic hook for Select */
import * as React from 'react';
import type { Option } from '@/types/ui';

export interface UseSelectOptions {
  /** Initial open state */
  defaultOpen?: boolean;
  /** Controlled value id(s) when used in single-select mode */
  value?: string | null;
  /** Available options for lookup */
  options?: Option[];
}

export interface UseSelectReturn {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  selectedKey: string | null;
  setSelectedKey: (key: string | null) => void;
  selectedOption: Option | null;
}

export function useSelect(options: UseSelectOptions = {}): UseSelectReturn {
  const {
    defaultOpen = false,
    value = null,
    options: availableOptions = [],
  } = options;

  const [isOpen, setIsOpen] = React.useState<boolean>(defaultOpen);
  const [selectedKey, setSelectedKey] = React.useState<string | null>(value);

  // Keep internal selectedKey in sync with controlled value prop
  React.useEffect(() => {
    setSelectedKey(value);
  }, [value]);

  const open = React.useCallback(() => setIsOpen(true), []);
  const close = React.useCallback(() => setIsOpen(false), []);
  const toggle = React.useCallback(() => setIsOpen((prev) => !prev), []);

  const selectedOption = React.useMemo(() => {
    if (selectedKey == null) return null;
    return availableOptions.find((o) => o.id === selectedKey) || null;
  }, [availableOptions, selectedKey]);

  return {
    isOpen,
    open,
    close,
    toggle,
    selectedKey,
    setSelectedKey,
    selectedOption,
  };
}
