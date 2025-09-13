import { useState, useEffect, useRef, ChangeEvent } from 'react';
import styles from './Select.module.scss';

type SelectOption = {
  title: string;
  id: string;
  group?: string;
  disabled?: boolean;
};

interface SelectProps {
  options: SelectOption[];
  multiselect?: boolean;
  onChange: (selected: SelectOption[] | SelectOption | null) => void;
  value?: string | string[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  name?: string;
  searchable?: boolean;
  clearable?: boolean;
  loading?: boolean;
  size?: 'small' | 'medium' | 'large';
}

const Select = ({
  options,
  multiselect = false,
  onChange,
  value,
  placeholder = 'Choose an option',
  disabled = false,
  className = '',
  name = '',
  searchable = false,
  clearable = false,
  loading = false,
  size = 'medium',
}: SelectProps) => {
  const [selected, setSelected] = useState<SelectOption[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const selectRef = useRef<HTMLSelectElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredOptions = options.filter((option) =>
    option.title.toLowerCase().includes(searchTerm.toLowerCase())
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

  const handleSelect = (e: ChangeEvent<HTMLSelectElement>) => {
    const { target } = e;
    const selectedOptions: SelectOption[] = [];

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

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    const clearedOptions: SelectOption[] = [];
    setSelected(clearedOptions);
    onChange(multiselect ? clearedOptions : null);

    if (selectRef.current) {
      selectRef.current.value = '';
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        // Handle click outside if needed
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectId = `select-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div
      ref={containerRef}
      className={`${styles.selectContainer} ${className} ${disabled ? styles.disabled : ''}`}
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
        onChange={handleSelect}
        multiple={multiselect}
        disabled={disabled || loading}
        className={`${styles.select} ${styles[size]}`}
        name={name}
        value={
          multiselect ? selected.map((opt) => opt.id) : selected[0]?.id || ''
        }
        aria-disabled={disabled || loading || undefined}
        aria-busy={loading || undefined}
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
            const groups = filteredOptions.reduce<
              Record<string, SelectOption[]>
            >((acc, opt) => {
              const groupKey = opt.group || 'Ungrouped';
              if (!acc[groupKey]) acc[groupKey] = [];
              acc[groupKey].push(opt);
              return acc;
            }, {});
            return Object.entries(groups).map(([groupLabel, groupOptions]) => (
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
            ));
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
};

export { Select };
