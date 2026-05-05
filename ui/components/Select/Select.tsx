/**
 * Select Composer - Provider-based orchestration with slots
 *
 * Layer: Composer
 * Meta-patterns: Context provider, slotting & substitution, headless logic
 *
 * Before: 6 boolean props (multiselect, searchable, clearable, loading, disabled, required)
 * After: Provider pattern with context orchestration and slots
 */
'use client';
import React, { useCallback, useEffect } from 'react';
import { useSelectContext } from './SelectProvider';
import { ControlSize } from '@/types/ui';
import { setRef } from '@/utils/refs';
import './Select.css';

// Trigger component - what the user clicks to open the select
export interface SelectTriggerProps {
  /** Placeholder text when no selection */
  placeholder?: string;
  /** Additional CSS classes */
  className?: string;
  /** Size variant */
  size?: ControlSize;
  /** Show clear button when selection exists */
  clearable?: boolean;
  /** Loading state */
  loading?: boolean;
  /** Form attributes */
  name?: string;
  required?: boolean;
  /** Blur handler */
  onBlur?: React.FocusEventHandler<HTMLElement>;
  /** ARIA attributes */
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  'aria-errormessage'?: string;
  'aria-invalid'?: boolean;
}

export const SelectTrigger = React.forwardRef<
  HTMLButtonElement,
  SelectTriggerProps
>((props, ref) => {
  const {
    placeholder = 'Select an option...',
    className = '',
    size = 'md',
    clearable = false,
    loading = false,
    onBlur,
    ...ariaProps
  } = props;

  const {
    isOpen,
    selectedOptions,
    selectedOption: _selectedOption,
    isEmpty,
    toggle,
    clearSelection,
    id: _id,
    ariaAttributes,
    triggerRef,
  } = useSelectContext();

  // Combine refs
  const combinedRef = useCallback(
    (node: HTMLButtonElement) => {
      triggerRef.current = node;
      setRef(ref, node);
    },
    [triggerRef, ref]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'Enter':
        case ' ':
          e.preventDefault();
          toggle();
          break;
        case 'ArrowDown':
        case 'ArrowUp':
          e.preventDefault();
          if (!isOpen) {
            toggle();
          }
          break;
        case 'Escape':
          if (isOpen) {
            e.preventDefault();
            toggle();
          }
          break;
      }
    },
    [isOpen, toggle]
  );

  const handleClear = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      clearSelection();
    },
    [clearSelection]
  );

  const displayText = isEmpty
    ? placeholder
    : selectedOptions.map((option) => option.title).join(', ');

  const sizeClass = size || 'md';

  return (
    <button
      ref={combinedRef}
      type="button"
      data-slot="select-trigger"
      className={`trigger ${sizeClass} ${className}`}
      onClick={toggle}
      onKeyDown={handleKeyDown}
      onBlur={onBlur}
      data-state={isOpen ? 'open' : 'closed'}
      data-loading={loading || undefined}
      {...ariaAttributes}
      {...ariaProps}
    >
      <span className="text">
        {loading ? 'Loading...' : displayText}
      </span>

      <div className="icons">
        {clearable && !isEmpty && !loading && (
          <button
            type="button"
            className="clear"
            onClick={handleClear}
            aria-label="Clear selection"
            tabIndex={-1}
          >
            <svg
              className="clearIcon"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M18 6L6 18M6 6L18 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        )}

        <svg
          className="chevronIcon"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M7 10L12 15L17 10"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </button>
  );
});

SelectTrigger.displayName = 'Select.Trigger';

// Content component - the dropdown content container
export interface SelectContentProps {
  children: React.ReactNode;
  className?: string;
  /** Maximum height before scrolling */
  maxHeight?: string;
  /** Positioning strategy */
  position?: 'bottom' | 'top' | 'auto';
}

export const SelectContent = React.forwardRef<
  HTMLDivElement,
  SelectContentProps
>(
  (
    { children, className = '', maxHeight = '200px', position = 'bottom' },
    ref
  ) => {
    const { isOpen, close, listboxRef } = useSelectContext();

    // Combine refs
    const combinedRef = useCallback(
      (node: HTMLDivElement) => {
        if (listboxRef) {
          (listboxRef as React.MutableRefObject<HTMLDivElement>).current = node;
        }
        if (ref) {
          if (typeof ref === 'function') {
            ref(node);
          } else {
            ref.current = node;
          }
        }
      },
      [listboxRef, ref]
    );

    // Close on outside click
    useEffect(() => {
      if (!isOpen) return;

      const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as Node;
        const content = listboxRef?.current;
        const trigger = (listboxRef as any)?.current
          ?.closest('[data-select-root]')
          ?.querySelector('[role="combobox"]');

        if (
          content &&
          !content.contains(target) &&
          trigger &&
          !trigger.contains(target)
        ) {
          close();
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () =>
        document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen, close, listboxRef]);

    if (!isOpen) return null;

    return (
      <div
        ref={combinedRef}
        data-slot="select-content"
        className={`content ${className}`}
        data-position={position}
        style={{ maxHeight }}
        role="listbox"
      >
        {children}
      </div>
    );
  }
);

SelectContent.displayName = 'Select.Content';

// Search component - for filtering options
export interface SelectSearchProps {
  placeholder?: string;
  className?: string;
}

export const SelectSearch: React.FC<SelectSearchProps> = ({
  placeholder = 'Search...',
  className = '',
}) => {
  const { searchTerm, setSearchTerm } = useSelectContext();

  return (
    <div
      data-slot="select-search"
      className={`searchContainer ${className}`}
    >
      <input
        type="text"
        className="search"
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        aria-label="Search options"
      />
    </div>
  );
};

SelectSearch.displayName = 'Select.Search';

// Options component - renders the list of options
export interface SelectOptionsProps {
  className?: string;
  /** Custom empty state */
  emptyState?: React.ReactNode;
}

export const SelectOptions: React.FC<SelectOptionsProps> = ({
  className = '',
  emptyState = 'No options found',
}) => {
  const {
    filteredOptions,
    selectedOptions,
    activeIndex,
    selectOption,
    setActiveIndex,
  } = useSelectContext();

  const handleMouseEnter = useCallback(
    (index: number) => {
      setActiveIndex(index);
    },
    [setActiveIndex]
  );

  const handleClick = useCallback(
    (option: any) => {
      selectOption(option);
    },
    [selectOption]
  );

  if (filteredOptions.length === 0) {
    return (
      <div className={`emptyState ${className}`}>{emptyState}</div>
    );
  }

  return (
    <div
      data-slot="select-options"
      className={`options ${className}`}
    >
      {filteredOptions.map((option, index) => {
        const isSelected = selectedOptions.some(
          (selected) => selected.id === option.id
        );
        const isActive = index === activeIndex;

        return (
          <div
            key={option.id}
            data-slot="select-option"
            className={`option ${isSelected ? 'selected' : ''} ${isActive ? 'active' : ''}`}
            role="option"
            aria-selected={isSelected}
            data-disabled={option.disabled || undefined}
            onMouseEnter={() => handleMouseEnter(index)}
            onClick={() => !option.disabled && handleClick(option)}
          >
            <span className="text">{option.title}</span>
            {isSelected && (
              <svg
                className="check"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M20 6L9 17L4 12"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </div>
        );
      })}
    </div>
  );
};

SelectOptions.displayName = 'Select.Options';

// Main Select component (for backward compatibility)
export interface SelectProps {
  children: React.ReactNode;
  className?: string;
}

export const Select: React.FC<SelectProps> = ({ children, className = '' }) => {
  return (
    <div
      data-ds-component="Select"
      data-slot="select"
      className={`root ${className}`}
      data-select-root
    >
      {children}
    </div>
  );
};

Select.displayName = 'Select';

export default Select;
