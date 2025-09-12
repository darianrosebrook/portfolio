import React, { useEffect, useMemo, useRef, useState } from 'react';
import styles from './Combobox.module.scss';

export type ComboboxOption = {
  id: string;
  title: string;
  disabled?: boolean;
  group?: string;
};

export interface ComboboxProps {
  options: ComboboxOption[];
  value?: string;
  onChange: (option: ComboboxOption | null) => void;
  placeholder?: string;
  disabled?: boolean;
  name?: string;
  clearable?: boolean;
  loading?: boolean;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export const Combobox: React.FC<ComboboxProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Search...',
  disabled = false,
  name,
  clearable = false,
  loading = false,
  size = 'medium',
  className = '',
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxRef = useRef<HTMLUListElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = useMemo(
    () => options.find((o) => o.id === value) || null,
    [options, value]
  );

  const filteredOptions = useMemo(() => {
    const base =
      query.trim().length > 0
        ? options.filter((o) =>
            o.title.toLowerCase().includes(query.toLowerCase())
          )
        : options;
    return base;
  }, [options, query]);

  const listboxId = useMemo(
    () => `combobox-listbox-${Math.random().toString(36).slice(2, 10)}`,
    []
  );
  const inputId = useMemo(
    () => `combobox-input-${Math.random().toString(36).slice(2, 10)}`,
    []
  );

  useEffect(() => {
    const onDocMouseDown = (e: MouseEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setActiveIndex(-1);
      }
    };
    document.addEventListener('mousedown', onDocMouseDown);
    return () => document.removeEventListener('mousedown', onDocMouseDown);
  }, []);

  useEffect(() => {
    // Keep query synced with selected value title when value changes externally
    if (selectedOption && !open) {
      setQuery(selectedOption.title);
    }
    if (!selectedOption && !open) {
      setQuery('');
    }
  }, [selectedOption, open]);

  const commitSelection = (option: ComboboxOption | null) => {
    if (option) {
      onChange(option);
      setQuery(option.title);
    } else {
      onChange(null);
      setQuery('');
    }
    setOpen(false);
    setActiveIndex(-1);
    inputRef.current?.focus();
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setOpen(true);
    setActiveIndex(0);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      setOpen(true);
      setActiveIndex(0);
      e.preventDefault();
      return;
    }
    switch (e.key) {
      case 'ArrowDown': {
        e.preventDefault();
        setActiveIndex((idx) => {
          const next = Math.min(
            (idx < 0 ? -1 : idx) + 1,
            filteredOptions.length - 1
          );
          return next;
        });
        break;
      }
      case 'ArrowUp': {
        e.preventDefault();
        setActiveIndex((idx) => Math.max((idx < 0 ? 0 : idx) - 1, 0));
        break;
      }
      case 'Home': {
        e.preventDefault();
        setActiveIndex(0);
        break;
      }
      case 'End': {
        e.preventDefault();
        setActiveIndex(Math.max(filteredOptions.length - 1, 0));
        break;
      }
      case 'Enter': {
        if (open) {
          e.preventDefault();
          const option = filteredOptions[activeIndex];
          if (option && !option.disabled) commitSelection(option);
        }
        break;
      }
      case 'Escape': {
        if (open) {
          e.preventDefault();
          setOpen(false);
          setActiveIndex(-1);
        } else if (clearable && query) {
          e.preventDefault();
          commitSelection(null);
        }
        break;
      }
      default:
        break;
    }
  };

  const onOptionMouseDown = (e: React.MouseEvent) => {
    // Prevent input blur before we select
    e.preventDefault();
  };

  const onOptionClick = (option: ComboboxOption) => {
    if (option.disabled) return;
    commitSelection(option);
  };

  const clearSelection = () => commitSelection(null);

  const activeDescendantId =
    activeIndex >= 0 && filteredOptions[activeIndex]
      ? `${listboxId}-option-${filteredOptions[activeIndex].id}`
      : undefined;

  return (
    <div
      ref={containerRef}
      className={`${styles.comboboxContainer} ${className}`}
    >
      <div className={`${styles.inputWrapper}`}>
        <input
          id={inputId}
          ref={inputRef}
          type="text"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls={listboxId}
          aria-activedescendant={activeDescendantId}
          className={`${styles.input} ${styles[size]} ${disabled ? styles.disabled : ''}`}
          placeholder={placeholder}
          name={name}
          disabled={disabled || loading}
          value={query}
          onChange={onInputChange}
          onKeyDown={onKeyDown}
          onFocus={() => setOpen(true)}
          aria-busy={loading || undefined}
        />
        {clearable && !disabled && query && (
          <button
            type="button"
            className={styles.clearButton}
            onClick={clearSelection}
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

      {open && (
        <ul
          ref={listboxRef}
          id={listboxId}
          role="listbox"
          className={styles.listbox}
        >
          {loading ? (
            <li
              role="option"
              aria-disabled
              aria-selected={false}
              className={styles.option}
            >
              Loading...
            </li>
          ) : filteredOptions.length === 0 ? (
            <li
              role="option"
              aria-disabled
              aria-selected={false}
              className={styles.option}
            >
              No results
            </li>
          ) : (
            filteredOptions.map((opt, idx) => {
              const id = `${listboxId}-option-${opt.id}`;
              const isActive = idx === activeIndex;
              const isSelected = selectedOption?.id === opt.id;
              return (
                <li
                  id={id}
                  key={opt.id}
                  role="option"
                  aria-selected={isSelected}
                  aria-disabled={opt.disabled || undefined}
                  className={`${styles.option} ${isActive ? styles.active : ''} ${opt.disabled ? styles.optionDisabled : ''}`}
                  onMouseDown={onOptionMouseDown}
                  onMouseEnter={() => setActiveIndex(idx)}
                  onClick={() => onOptionClick(opt)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onOptionClick(opt);
                    }
                  }}
                  tabIndex={-1}
                >
                  {opt.title}
                </li>
              );
            })
          )}
        </ul>
      )}
    </div>
  );
};
