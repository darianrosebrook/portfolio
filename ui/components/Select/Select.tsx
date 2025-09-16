/**
 * Select - Unified select component supporting native and combobox modes
 * Consolidates Select and Combobox components
 */
import { useState, useEffect, useRef, ChangeEvent, useMemo } from 'react';
import * as React from 'react';
import { Option, ControlSize } from '@/types/ui';
import styles from './Select.module.scss';

export type SelectMode = 'native' | 'combobox';

export interface SelectProps {
  /**
   * Available options
   */
  options: Option[];
  /**
   * Select mode - native HTML select or custom combobox
   */
  mode?: SelectMode;
  /**
   * Allow multiple selections (native mode only)
   */
  multiselect?: boolean;
  /**
   * Change handler
   */
  onChange: (selected: Option[] | Option | null) => void;
  /**
   * Current value(s)
   */
  value?: string | string[];
  /**
   * Placeholder text
   */
  placeholder?: string;
  /**
   * Whether the select is disabled
   */
  disabled?: boolean;
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Form name attribute
   */
  name?: string;
  /**
   * Native select id; used to associate external <label htmlFor>
   */
  id?: string;
  /**
   * Required state for native select
   */
  required?: boolean;
  /**
   * Blur handler (native select)
   */
  onBlur?: React.FocusEventHandler<HTMLSelectElement>;
  /** a11y associations forwarded from Field */
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  'aria-errormessage'?: string;
  'aria-invalid'?: boolean;
  /**
   * Enable search/filtering (combobox mode only)
   */
  searchable?: boolean;
  /**
   * Allow clearing selection
   */
  clearable?: boolean;
  /**
   * Loading state
   */
  loading?: boolean;
  /**
   * Size using design tokens
   */
  size?: ControlSize;
}

const Select = ({
  options,
  mode = 'native',
  multiselect = false,
  onChange,
  value,
  placeholder = 'Choose an option',
  disabled = false,
  className = '',
  name = '',
  id,
  required,
  onBlur,
  'aria-labelledby': ariaLabelledby,
  'aria-describedby': ariaDescribedby,
  'aria-errormessage': ariaErrormessage,
  'aria-invalid': ariaInvalid,
  searchable = false,
  clearable = false,
  loading = false,
  size = 'md',
}: SelectProps) => {
  const [selected, setSelected] = useState<Option[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const selectRef = useRef<HTMLSelectElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxRef = useRef<HTMLUListElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredOptions = useMemo(() => {
    if (mode === 'native' || !searchable) return options;
    return options.filter((option) =>
      option.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [options, searchTerm, mode, searchable]);

  const selectedOption = useMemo(
    () => options.find((o) => o.id === value) || null,
    [options, value]
  );

  useEffect(() => {
    if (value && options.length > 0) {
      if (multiselect && Array.isArray(value)) {
        const selectedOptions = options.filter((option) =>
          value.includes(option.id)
        );
        setSelected(selectedOptions);
      } else if (!multiselect && typeof value === 'string') {
        const selectedOption = options.find((option) => option.id === value);
        if (selectedOption) {
          setSelected([selectedOption]);
        }
      }
    } else if (!value) {
      setSelected([]);
    }
  }, [value, options, multiselect]);

  const handleNativeSelect = (e: ChangeEvent<HTMLSelectElement>) => {
    const { target } = e;
    const selectedOptions: Option[] = [];

    if (multiselect) {
      for (let i = 0; i < target.options.length; i++) {
        if (target.options[i].selected) {
          const option = options.find(
            (opt) => opt.id === target.options[i].value
          );
          if (option) selectedOptions.push(option);
        }
      }
    } else {
      const selectedOption = options.find((opt) => opt.id === target.value);
      if (selectedOption) {
        selectedOptions.push(selectedOption);
      }
    }

    setSelected(selectedOptions);
    onChange(multiselect ? selectedOptions : selectedOptions[0] || null);
  };

  const handleComboboxSelect = (option: Option) => {
    setSelected([option]);
    onChange(option);
    setIsOpen(false);
    setSearchTerm('');
    setActiveIndex(-1);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    const clearedOptions: Option[] = [];
    setSelected(clearedOptions);
    onChange(multiselect ? clearedOptions : null);
    setSearchTerm('');

    if (selectRef.current) {
      selectRef.current.value = '';
    }
  };

  const selectId = id ?? `select-${Math.random().toString(36).substr(2, 9)}`;
  const sizeClass = styles[`select--${size}`] || styles['select--md'];

  // Native select mode
  if (mode === 'native') {
    return (
      <div
        ref={containerRef}
        className={`${styles.selectContainer} ${className} ${disabled ? styles.disabled : ''} ${sizeClass}`}
      >
        {searchable && (
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            disabled={disabled}
            aria-label="Search options"
          />
        )}

        <select
          id={selectId}
          ref={selectRef}
          onChange={handleNativeSelect}
          onBlur={onBlur}
          multiple={multiselect}
          disabled={disabled || loading}
          className={`${styles.select} ${sizeClass}`}
          name={name}
          required={required}
          value={
            multiselect ? selected.map((opt) => opt.id) : selected[0]?.id || ''
          }
          aria-disabled={disabled || loading || undefined}
          aria-busy={loading || undefined}
          aria-labelledby={ariaLabelledby}
          aria-describedby={ariaDescribedby}
          aria-errormessage={ariaErrormessage}
          aria-invalid={ariaInvalid || undefined}
        >
          {!multiselect && !value && !loading && (
            <option value="" disabled hidden>
              {placeholder}
            </option>
          )}
          {loading ? (
            <option value="" disabled>
              Loading...
            </option>
          ) : (
            (() => {
              const hasGroups = filteredOptions.some((o) => o.group);
              if (!hasGroups) {
                return filteredOptions.map((selectOption) => (
                  <option
                    key={selectOption.id}
                    value={selectOption.id}
                    disabled={selectOption.disabled}
                  >
                    {selectOption.title}
                  </option>
                ));
              }
              const groups = filteredOptions.reduce<Record<string, Option[]>>(
                (acc, opt) => {
                  const groupKey = opt.group || 'Ungrouped';
                  if (!acc[groupKey]) acc[groupKey] = [];
                  acc[groupKey].push(opt);
                  return acc;
                },
                {}
              );
              return Object.entries(groups).map(
                ([groupLabel, groupOptions]) => (
                  <optgroup key={groupLabel} label={groupLabel}>
                    {groupOptions.map((selectOption) => (
                      <option
                        key={selectOption.id}
                        value={selectOption.id}
                        disabled={selectOption.disabled}
                      >
                        {selectOption.title}
                      </option>
                    ))}
                  </optgroup>
                )
              );
            })()
          )}
        </select>

        <div className={styles.selectIndicator} aria-hidden="true">
          <svg
            className={styles.indicatorIcon}
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
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

        {clearable && selected.length > 0 && !multiselect && (
          <button
            type="button"
            className={styles.clearButton}
            onClick={handleClear}
            aria-label="Clear selection"
          >
            <svg
              className={styles.clearIcon}
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
      </div>
    );
  }

  // Combobox mode - simplified implementation
  return (
    <div
      ref={containerRef}
      className={`${styles.comboboxContainer} ${className} ${disabled ? styles.disabled : ''} ${sizeClass}`}
    >
      <input
        ref={inputRef}
        type="text"
        className={`${styles.comboboxInput} ${sizeClass}`}
        placeholder={selectedOption ? selectedOption.title : placeholder}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setTimeout(() => setIsOpen(false), 150)}
        disabled={disabled || loading}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        role="combobox"
      />

      {isOpen && (
        <ul ref={listboxRef} className={styles.comboboxList} role="listbox">
          {filteredOptions.length === 0 ? (
            <li className={styles.comboboxOption} role="option">
              No options found
            </li>
          ) : (
            filteredOptions.map((option, index) => (
              <li
                key={option.id}
                className={`${styles.comboboxOption} ${
                  index === activeIndex ? styles.active : ''
                } ${option.disabled ? styles.disabled : ''}`}
                role="option"
                aria-selected={selectedOption?.id === option.id}
                onClick={() => !option.disabled && handleComboboxSelect(option)}
              >
                {option.title}
              </li>
            ))
          )}
        </ul>
      )}

      {clearable && selectedOption && (
        <button
          type="button"
          className={styles.clearButton}
          onClick={handleClear}
          aria-label="Clear selection"
        >
          <svg
            className={styles.clearIcon}
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
    </div>
  );
};

export { Select };
export default Select;
