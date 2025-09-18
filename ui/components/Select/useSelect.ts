/**
 * useSelect - Headless logic hook for Select composer
 *
 * Handles state management, option filtering, keyboard navigation,
 * and selection logic separated from presentation concerns
 */
import {
  useCallback,
  useState,
  useId,
  useMemo,
  useRef,
  useEffect,
} from 'react';
import type { Option } from '@/types/ui';

export interface UseSelectOptions {
  /** Available options */
  options: Option[];
  /** Allow multiple selections */
  multiple?: boolean;
  /** Current value(s) */
  value?: string | string[];
  /** Default value(s) for uncontrolled */
  defaultValue?: string | string[];
  /** Selection change callback */
  onChange?: (selected: Option[] | Option | null) => void;
  /** Disabled state */
  disabled?: boolean;
  /** Custom id for accessibility */
  id?: string;
  /** Filter function for search */
  filterFn?: (option: Option, searchTerm: string) => boolean;
}

export interface UseSelectReturn {
  // State
  isOpen: boolean;
  selectedOptions: Option[];
  searchTerm: string;
  activeIndex: number;

  // Computed
  filteredOptions: Option[];
  selectedOption: Option | null; // For single select
  isEmpty: boolean;

  // Actions
  open: () => void;
  close: () => void;
  toggle: () => void;
  setSearchTerm: (term: string) => void;
  selectOption: (option: Option) => void;
  deselectOption: (option: Option) => void;
  clearSelection: () => void;

  // Keyboard navigation
  setActiveIndex: (index: number) => void;
  navigateUp: () => void;
  navigateDown: () => void;
  selectActive: () => void;

  // Accessibility
  id: string;
  ariaAttributes: {
    'aria-expanded': boolean;
    'aria-disabled'?: boolean;
    'aria-multiselectable'?: boolean;
  };

  // Refs for DOM management
  triggerRef: React.RefObject<HTMLElement | null>;
  listboxRef: React.RefObject<HTMLElement | null>;
}

const defaultFilterFn = (option: Option, searchTerm: string): boolean => {
  return option.title.toLowerCase().includes(searchTerm.toLowerCase());
};

export function useSelect(options: UseSelectOptions): UseSelectReturn {
  const {
    options: allOptions,
    multiple = false,
    value,
    defaultValue,
    onChange,
    disabled = false,
    id: providedId,
    filterFn = defaultFilterFn,
  } = options;

  const generatedId = useId();
  const id = providedId || `select-${generatedId}`;

  // Refs
  const triggerRef = useRef<HTMLElement>(null);
  const listboxRef = useRef<HTMLElement>(null);

  // State
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeIndex, setActiveIndex] = useState(-1);

  // Handle controlled vs uncontrolled selection
  const isControlled = value !== undefined;
  const [internalSelection, setInternalSelection] = useState<string[]>(() => {
    if (defaultValue) {
      return Array.isArray(defaultValue) ? defaultValue : [defaultValue];
    }
    return [];
  });

  const selectedIds = isControlled
    ? Array.isArray(value)
      ? value
      : value
        ? [value]
        : []
    : internalSelection;

  const selectedOptions = useMemo(() => {
    return allOptions.filter((option) => selectedIds.includes(option.id));
  }, [allOptions, selectedIds]);

  const selectedOption = multiple ? null : selectedOptions[0] || null;

  // Filtered options based on search
  const filteredOptions = useMemo(() => {
    if (!searchTerm.trim()) return allOptions;
    return allOptions.filter((option) => filterFn(option, searchTerm));
  }, [allOptions, searchTerm, filterFn]);

  // Actions
  const open = useCallback(() => {
    if (disabled) return;
    setIsOpen(true);
    setActiveIndex(-1);
  }, [disabled]);

  const close = useCallback(() => {
    setIsOpen(false);
    setSearchTerm('');
    setActiveIndex(-1);
  }, []);

  const toggle = useCallback(() => {
    if (isOpen) {
      close();
    } else {
      open();
    }
  }, [isOpen, open, close]);

  const updateSelection = useCallback(
    (newSelection: string[]) => {
      if (!isControlled) {
        setInternalSelection(newSelection);
      }

      const selectedOptions = allOptions.filter((option) =>
        newSelection.includes(option.id)
      );

      if (multiple) {
        onChange?.(selectedOptions);
      } else {
        onChange?.(selectedOptions[0] || null);
      }
    },
    [isControlled, allOptions, multiple, onChange]
  );

  const selectOption = useCallback(
    (option: Option) => {
      if (disabled || option.disabled) return;

      let newSelection: string[];

      if (multiple) {
        if (selectedIds.includes(option.id)) {
          // Deselect if already selected
          newSelection = selectedIds.filter((id) => id !== option.id);
        } else {
          // Add to selection
          newSelection = [...selectedIds, option.id];
        }
      } else {
        // Single select - replace selection and close
        newSelection = [option.id];
        close();
      }

      updateSelection(newSelection);
    },
    [disabled, multiple, selectedIds, close, updateSelection]
  );

  const deselectOption = useCallback(
    (option: Option) => {
      if (disabled) return;
      const newSelection = selectedIds.filter((id) => id !== option.id);
      updateSelection(newSelection);
    },
    [disabled, selectedIds, updateSelection]
  );

  const clearSelection = useCallback(() => {
    if (disabled) return;
    updateSelection([]);
  }, [disabled, updateSelection]);

  // Keyboard navigation
  const navigateUp = useCallback(() => {
    setActiveIndex((prev) => {
      const newIndex = prev <= 0 ? filteredOptions.length - 1 : prev - 1;
      return newIndex;
    });
  }, [filteredOptions.length]);

  const navigateDown = useCallback(() => {
    setActiveIndex((prev) => {
      const newIndex = prev >= filteredOptions.length - 1 ? 0 : prev + 1;
      return newIndex;
    });
  }, [filteredOptions.length]);

  const selectActive = useCallback(() => {
    if (activeIndex >= 0 && activeIndex < filteredOptions.length) {
      selectOption(filteredOptions[activeIndex]);
    }
  }, [activeIndex, filteredOptions, selectOption]);

  // Reset active index when options change
  useEffect(() => {
    setActiveIndex(-1);
  }, [filteredOptions]);

  const ariaAttributes = {
    'aria-expanded': isOpen,
    ...(disabled && { 'aria-disabled': true }),
    ...(multiple && { 'aria-multiselectable': true }),
  };

  return {
    // State
    isOpen,
    selectedOptions,
    searchTerm,
    activeIndex,

    // Computed
    filteredOptions,
    selectedOption,
    isEmpty: selectedOptions.length === 0,

    // Actions
    open,
    close,
    toggle,
    setSearchTerm,
    selectOption,
    deselectOption,
    clearSelection,

    // Keyboard navigation
    setActiveIndex,
    navigateUp,
    navigateDown,
    selectActive,

    // Accessibility
    id,
    ariaAttributes,

    // Refs
    triggerRef,
    listboxRef,
  };
}
