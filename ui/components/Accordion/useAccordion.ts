/** Headless logic hook for Accordion */
import * as React from 'react';

export type AccordionType = 'single' | 'multiple';

export interface UseAccordionOptions {
  type?: AccordionType;
  defaultValue?: string | string[];
  value?: string | string[];
  onValueChange?: (value: string | string[]) => void;
  collapsible?: boolean;
}

export interface UseAccordionReturn {
  value: string | string[];
  isItemOpen: (itemValue: string) => boolean;
  toggleItem: (itemValue: string) => void;
  openItem: (itemValue: string) => void;
  closeItem: (itemValue: string) => void;
}

export function useAccordion(
  options: UseAccordionOptions = {}
): UseAccordionReturn {
  const {
    type = 'single',
    defaultValue,
    value: controlledValue,
    onValueChange,
    collapsible = false,
  } = options;

  const [internalValue, setInternalValue] = React.useState<string | string[]>(
    () => {
      if (defaultValue !== undefined) return defaultValue;
      return type === 'single' ? '' : [];
    }
  );

  const value = controlledValue !== undefined ? controlledValue : internalValue;

  const setValue = React.useCallback(
    (newValue: string | string[]) => {
      if (controlledValue === undefined) {
        setInternalValue(newValue);
      }
      onValueChange?.(newValue);
    },
    [controlledValue, onValueChange]
  );

  const isItemOpen = React.useCallback(
    (itemValue: string): boolean => {
      if (type === 'single') {
        return value === itemValue;
      }
      return Array.isArray(value) && value.includes(itemValue);
    },
    [value, type]
  );

  const toggleItem = React.useCallback(
    (itemValue: string) => {
      if (type === 'single') {
        const currentValue = value as string;
        if (currentValue === itemValue && collapsible) {
          setValue('');
        } else {
          setValue(itemValue);
        }
      } else {
        const currentValue = value as string[];
        if (currentValue.includes(itemValue)) {
          setValue(currentValue.filter((v) => v !== itemValue));
        } else {
          setValue([...currentValue, itemValue]);
        }
      }
    },
    [value, type, collapsible, setValue]
  );

  const openItem = React.useCallback(
    (itemValue: string) => {
      if (type === 'single') {
        setValue(itemValue);
      } else {
        const currentValue = value as string[];
        if (!currentValue.includes(itemValue)) {
          setValue([...currentValue, itemValue]);
        }
      }
    },
    [value, type, setValue]
  );

  const closeItem = React.useCallback(
    (itemValue: string) => {
      if (type === 'single') {
        if (collapsible) {
          setValue('');
        }
      } else {
        const currentValue = value as string[];
        setValue(currentValue.filter((v) => v !== itemValue));
      }
    },
    [value, type, collapsible, setValue]
  );

  return {
    value,
    isItemOpen,
    toggleItem,
    openItem,
    closeItem,
  };
}
