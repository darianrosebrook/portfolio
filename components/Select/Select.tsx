import React, {
  useMemo,
  useState,
  useRef,
  useEffect,
  useCallback,
  useId,
} from 'react';
import styles from './Select.module.scss';
import {
  SelectProps,
  SelectOption,
  SelectOptionGroup,
  SelectWrapperProps,
  SelectLabelProps,
  SelectMessageProps,
  SelectTriggerProps,
  SelectDropdownProps,
  SelectOptionProps,
  SelectSearchProps,
  SelectTheme,
  DEFAULT_SELECT_TOKENS,
} from './Select.types';
import {
  mergeTokenSources,
  tokensToCSSProperties,
  safeTokenValue,
  TokenSource,
  TokenValue,
} from '@/utils/designTokens';

// Import the default token configuration
import defaultTokenConfig from './Select.tokens.json';

/**
 * Custom hook for managing Select design tokens
 * Supports multiple token sources with smart defaults and BYODS patterns
 */
function useSelectTokens(
  theme?: SelectTheme,
  _size = 'medium',
  _variant = 'default',
  _state = 'default'
) {
  return useMemo(() => {
    const tokenSources: TokenSource[] = [];

    // 1. Start with JSON token configuration
    tokenSources.push({
      type: 'json',
      data: defaultTokenConfig,
    });

    // 2. Add external token config if provided
    if (theme?.tokenConfig) {
      tokenSources.push({
        type: 'json',
        data: theme.tokenConfig,
      });
    }

    // 3. Add inline token overrides
    if (theme?.tokens) {
      const inlineTokens: Record<string, TokenValue> = {};
      Object.entries(theme.tokens).forEach(([key, value]) => {
        inlineTokens[`select-${key}`] = value;
      });

      tokenSources.push({
        type: 'inline',
        tokens: inlineTokens,
      });
    }

    // Merge all token sources with fallbacks
    const resolvedTokens = mergeTokenSources(tokenSources, {
      fallbacks: (() => {
        const fallbacks: Record<string, TokenValue> = {};
        Object.entries(DEFAULT_SELECT_TOKENS).forEach(([key, value]) => {
          fallbacks[`select-${key}`] = value;
        });
        return fallbacks;
      })(),
    });

    // Generate CSS custom properties
    const cssProperties = tokensToCSSProperties(resolvedTokens, 'select');

    // Add any direct CSS property overrides
    if (theme?.cssProperties) {
      Object.assign(cssProperties, theme.cssProperties);
    }

    return {
      tokens: resolvedTokens,
      cssProperties,
    };
  }, [theme]);
}

/**
 * Select Wrapper Component
 */
const SelectWrapper: React.FC<SelectWrapperProps> = ({
  children,
  className = '',
  theme,
}) => {
  const { cssProperties } = useSelectTokens(theme);

  return (
    <div
      className={`${styles.selectWrapper} ${className}`}
      style={cssProperties}
    >
      {children}
    </div>
  );
};

/**
 * Select Label Component
 */
const SelectLabel: React.FC<SelectLabelProps> = ({
  children,
  htmlFor,
  required = false,
  className = '',
}) => (
  <label className={`${styles.selectLabel} ${className}`} htmlFor={htmlFor}>
    {children}
    {required && (
      <span className={styles.required} aria-label="required">
        *
      </span>
    )}
  </label>
);

/**
 * Select Message Component
 */
const SelectMessage: React.FC<SelectMessageProps> = ({
  children,
  type = 'helper',
  className = '',
}) => {
  const messageClass =
    styles[`selectMessage--${type}`] || styles.selectMessage;

  return <div className={`${messageClass} ${className}`}>{children}</div>;
};

/**
 * Select Trigger Component
 */
const SelectTrigger: React.FC<SelectTriggerProps> = ({
  children,
  isOpen,
  disabled,
  readonly,
  onClick,
  onKeyDown,
  className = '',
  ...ariaProps
}) => {
  const triggerClasses = [
    styles.selectTrigger,
    isOpen ? styles['selectTrigger--open'] : '',
    disabled ? styles['selectTrigger--disabled'] : '',
    readonly ? styles['selectTrigger--readonly'] : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type="button"
      className={triggerClasses}
      onClick={!disabled && !readonly ? onClick : undefined}
      onKeyDown={!disabled && !readonly ? onKeyDown : undefined}
      disabled={disabled}
      {...ariaProps}
    >
      <span className={styles.selectValue}>{children}</span>
      <span className={styles.selectIcon}>
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M5 7.5L10 12.5L15 7.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </button>
  );
};

/**
 * Select Dropdown Component
 */
const SelectDropdown: React.FC<SelectDropdownProps> = ({
  children,
  isOpen,
  className = '',
  style,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className={`${styles.selectDropdown} ${className}`}
      style={style}
      role="listbox"
    >
      {children}
    </div>
  );
};

/**
 * Select Option Component
 */
const SelectOption: React.FC<SelectOptionProps> = ({
  option,
  isSelected,
  isHighlighted,
  onClick,
  onMouseEnter,
  className = '',
  renderOption,
}) => {
  const optionClasses = [
    styles.selectOption,
    isSelected ? styles['selectOption--selected'] : '',
    isHighlighted ? styles['selectOption--highlighted'] : '',
    option.disabled ? styles['selectOption--disabled'] : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const handleClick = () => {
    if (!option.disabled) {
      onClick();
    }
  };

  const handleMouseEnter = () => {
    if (!option.disabled) {
      onMouseEnter();
    }
  };

  return (
    <div
      className={optionClasses}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      role="option"
      aria-selected={isSelected}
      aria-disabled={option.disabled}
    >
      {renderOption ? (
        renderOption(option, isSelected)
      ) : (
        <>
          {option.icon && (
            <span className={styles.selectOptionIcon}>{option.icon}</span>
          )}
          <span className={styles.selectOptionLabel}>{option.label}</span>
          {option.description && (
            <span className={styles.selectOptionDescription}>
              {option.description}
            </span>
          )}
          {isSelected && (
            <span className={styles.selectOptionCheck}>
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M13.5 4.5L6 12L2.5 8.5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          )}
        </>
      )}
    </div>
  );
};

/**
 * Select Search Component
 */
const SelectSearch: React.FC<SelectSearchProps> = ({
  value,
  onChange,
  placeholder = 'Search...',
  className = '',
}) => (
  <div className={`${styles.selectSearch} ${className}`}>
    <input
      type="text"
      className={styles.selectSearchInput}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      autoFocus
    />
  </div>
);

/**
 * Helper function to check if options array contains groups
 */
function isOptionGroups(
  options: SelectOption[] | SelectOptionGroup[]
): options is SelectOptionGroup[] {
  return options.length > 0 && 'options' in options[0];
}

/**
 * Helper function to flatten option groups into a single array
 */
function flattenOptions(
  options: SelectOption[] | SelectOptionGroup[]
): SelectOption[] {
  if (isOptionGroups(options)) {
    return options.reduce<SelectOption[]>((acc, group) => {
      return acc.concat(group.options);
    }, []);
  }
  return options;
}

/**
 * Select Component with Design Token Support
 *
 * Features:
 * - Smart defaults with fallback values
 * - Bring-your-own-design-system (BYODS) support
 * - Multiple token sources (JSON, CSS, inline)
 * - Type-safe token management
 * - Multiple sizes, variants, and states
 * - Single and multiple selection modes
 * - Searchable/filterable options
 * - Option groups and custom rendering
 * - Keyboard navigation and accessibility
 * - Loading and empty states
 * - Custom validation messages
 */
const Select: React.FC<SelectProps> = ({
  options,
  value,
  defaultValue,
  onChange,
  size = 'medium',
  variant = 'default',
  state = 'default',
  theme,
  className = '',
  containerClassName = '',
  placeholder = 'Select an option...',
  disabled = false,
  readonly = false,
  required = false,
  multiple = false,
  searchable = false,
  searchPlaceholder = 'Search...',
  clearSearchOnSelect = true,
  filterFunction,
  clearable = false,
  maxVisibleOptions = 10,
  loading = false,
  loadingText = 'Loading...',
  noOptionsText = 'No options available',
  renderOption,
  renderValue,
  label,
  helperText,
  errorMessage,
  warningMessage,
  successMessage,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  'data-testid': testId,
}) => {
  // Generate unique IDs
  const selectId = useId();
  const triggerId = `${selectId}-trigger`;
  const dropdownId = `${selectId}-dropdown`;

  // Internal state
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [internalValue, setInternalValue] = useState(
    defaultValue || (multiple ? [] : '')
  );

  // Refs
  const wrapperRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load and resolve design tokens
  const { cssProperties } = useSelectTokens(theme, size, variant, state);

  // Safe validation for props
  const safeSize = safeTokenValue(size, 'medium', (val) =>
    ['small', 'medium', 'large'].includes(val as string)
  ) as string;

  const safeVariant = safeTokenValue(variant, 'default', (val) =>
    ['default', 'filled', 'outlined'].includes(val as string)
  ) as string;

  const safeState = safeTokenValue(state, 'default', (val) =>
    ['default', 'error', 'warning', 'success'].includes(val as string)
  ) as string;

  // Determine current value (controlled vs uncontrolled)
  const currentValue = value !== undefined ? value : internalValue;

  // Flatten options for easier processing
  const flatOptions = useMemo(() => flattenOptions(options), [options]);

  // Filter options based on search term
  const filteredOptions = useMemo(() => {
    if (!searchable || !searchTerm) return flatOptions;

    const defaultFilter = (option: SelectOption, term: string) =>
      option.label.toLowerCase().includes(term.toLowerCase()) ||
      (option.description &&
        option.description.toLowerCase().includes(term.toLowerCase()));

    const filter = filterFunction || defaultFilter;
    return flatOptions.filter((option) => filter(option, searchTerm));
  }, [flatOptions, searchTerm, searchable, filterFunction]);

  // Limit visible options
  const visibleOptions = filteredOptions.slice(0, maxVisibleOptions);

  // Handle value changes
  const handleValueChange = useCallback(
    (newValue: string | number | (string | number)[]) => {
      if (value === undefined) {
        setInternalValue(newValue);
      }
      onChange?.(newValue);
    },
    [value, onChange]
  );

  // Handle option selection
  const handleOptionSelect = useCallback(
    (option: SelectOption) => {
      if (multiple) {
        const currentArray = Array.isArray(currentValue)
          ? currentValue
          : [currentValue].filter(Boolean);
        const isSelected = currentArray.includes(option.value);

        const newValue = isSelected
          ? currentArray.filter((v) => v !== option.value)
          : [...currentArray, option.value];

        handleValueChange(newValue);
      } else {
        handleValueChange(option.value);
        setIsOpen(false);
      }

      if (clearSearchOnSelect) {
        setSearchTerm('');
      }
      setHighlightedIndex(-1);
    },
    [multiple, currentValue, handleValueChange, clearSearchOnSelect]
  );

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      switch (event.key) {
        case 'Enter':
        case ' ':
          event.preventDefault();
          if (!isOpen) {
            setIsOpen(true);
          } else if (highlightedIndex >= 0) {
            handleOptionSelect(visibleOptions[highlightedIndex]);
          }
          break;
        case 'Escape':
          setIsOpen(false);
          setHighlightedIndex(-1);
          break;
        case 'ArrowDown':
          event.preventDefault();
          if (!isOpen) {
            setIsOpen(true);
          } else {
            setHighlightedIndex((prev) =>
              prev < visibleOptions.length - 1 ? prev + 1 : 0
            );
          }
          break;
        case 'ArrowUp':
          event.preventDefault();
          if (isOpen) {
            setHighlightedIndex((prev) =>
              prev > 0 ? prev - 1 : visibleOptions.length - 1
            );
          }
          break;
        case 'Tab':
          setIsOpen(false);
          break;
      }
    },
    [isOpen, highlightedIndex, visibleOptions, handleOptionSelect]
  );

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Determine current state for styling
  const currentState = errorMessage
    ? 'error'
    : warningMessage
    ? 'warning'
    : successMessage
    ? 'success'
    : safeState;

  // Determine which message to show
  const messageToShow =
    errorMessage || warningMessage || successMessage || helperText;
  const messageType = errorMessage
    ? 'error'
    : warningMessage
    ? 'warning'
    : successMessage
    ? 'success'
    : 'helper';

  // Format display value
  const formatDisplayValue = () => {
    if (renderValue) {
      return renderValue(currentValue);
    }

    if (multiple && Array.isArray(currentValue)) {
      if (currentValue.length === 0) return placeholder;
      if (currentValue.length === 1) {
        const option = flatOptions.find((opt) => opt.value === currentValue[0]);
        return option?.label || currentValue[0];
      }
      return `${currentValue.length} selected`;
    }

    if (!currentValue) return placeholder;
    const option = flatOptions.find((opt) => opt.value === currentValue);
    return option?.label || currentValue;
  };

  // Generate CSS classes
  const selectClasses = [
    styles.select,
    styles[`select--${safeSize}`] || '',
    styles[`select--${safeVariant}`] || '',
    styles[`select--${currentState}`] || '',
    disabled ? styles['select--disabled'] : '',
    readonly ? styles['select--readonly'] : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <SelectWrapper theme={theme} className={containerClassName}>
      {label && (
        <SelectLabel htmlFor={triggerId} required={required}>
          {label}
        </SelectLabel>
      )}

      <div ref={wrapperRef} className={selectClasses} style={cssProperties}>
        <SelectTrigger
          isOpen={isOpen}
          disabled={disabled}
          readonly={readonly}
          onClick={() => setIsOpen(!isOpen)}
          onKeyDown={handleKeyDown}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-labelledby={label ? `${selectId}-label` : undefined}
          aria-describedby={
            messageToShow ? `${selectId}-message` : ariaDescribedBy
          }
        >
          {formatDisplayValue()}
        </SelectTrigger>

        <SelectDropdown isOpen={isOpen}>
          {searchable && (
            <SelectSearch
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder={searchPlaceholder}
            />
          )}

          <div className={styles.selectOptions} ref={dropdownRef}>
            {loading ? (
              <div className={styles.selectLoading}>{loadingText}</div>
            ) : visibleOptions.length === 0 ? (
              <div className={styles.selectEmpty}>{noOptionsText}</div>
            ) : (
              visibleOptions.map((option, index) => {
                const isSelected = multiple
                  ? Array.isArray(currentValue) &&
                    currentValue.includes(option.value)
                  : currentValue === option.value;

                return (
                  <SelectOption
                    key={`${option.value}-${index}`}
                    option={option}
                    isSelected={isSelected}
                    isHighlighted={index === highlightedIndex}
                    onClick={() => handleOptionSelect(option)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    renderOption={renderOption}
                  />
                );
              })
            )}
          </div>
        </SelectDropdown>
      </div>

      {messageToShow && (
        <SelectMessage type={messageType} className={`${selectId}-message`}>
          {messageToShow}
        </SelectMessage>
      )}
    </SelectWrapper>
  );
};

// Export sub-components for advanced usage
export {
  SelectWrapper,
  SelectLabel,
  SelectMessage,
  SelectTrigger,
  SelectDropdown,
  SelectOption,
  SelectSearch,
};
export default Select;
export type { SelectProps, SelectOption, SelectOptionGroup, SelectTheme } from './Select.types';
