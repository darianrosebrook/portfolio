/**
 * Select Component Types
 *
 * Defines TypeScript interfaces for Select component props and design tokens
 */

import { CSSProperties } from 'react';
import { TokenValue, ComponentTokenConfig } from '@/utils/designTokens';

/**
 * Select size variants
 */
export type SelectSize = 'small' | 'medium' | 'large';

/**
 * Select visual variants
 */
export type SelectVariant = 'default' | 'filled' | 'outlined';

/**
 * Select state variants
 */
export type SelectState = 'default' | 'error' | 'warning' | 'success';

/**
 * Select option interface
 */
export interface SelectOption {
  /** Option value */
  value: string | number;
  /** Display label */
  label: string;
  /** Whether option is disabled */
  disabled?: boolean;
  /** Optional description */
  description?: string;
  /** Optional icon */
  icon?: React.ReactNode;
  /** Optional group */
  group?: string;
}

/**
 * Select option group interface
 */
export interface SelectOptionGroup {
  /** Group label */
  label: string;
  /** Options in this group */
  options: SelectOption[];
  /** Whether group is disabled */
  disabled?: boolean;
}

/**
 * Select design tokens interface
 */
export interface SelectTokens {
  // Color tokens for different states
  'color-background-default': TokenValue;
  'color-background-filled': TokenValue;
  'color-background-disabled': TokenValue;
  'color-background-readonly': TokenValue;
  'color-foreground-default': TokenValue;
  'color-foreground-placeholder': TokenValue;
  'color-foreground-disabled': TokenValue;
  'color-border-default': TokenValue;
  'color-border-hover': TokenValue;
  'color-border-focus': TokenValue;
  'color-border-error': TokenValue;
  'color-border-warning': TokenValue;
  'color-border-success': TokenValue;
  'color-border-disabled': TokenValue;

  // Dropdown colors
  'color-dropdown-background': TokenValue;
  'color-dropdown-border': TokenValue;
  'color-dropdown-shadow': TokenValue;
  'color-option-background-default': TokenValue;
  'color-option-background-hover': TokenValue;
  'color-option-background-selected': TokenValue;
  'color-option-background-disabled': TokenValue;
  'color-option-foreground-default': TokenValue;
  'color-option-foreground-hover': TokenValue;
  'color-option-foreground-selected': TokenValue;
  'color-option-foreground-disabled': TokenValue;

  // Size tokens for each variant
  'size-small-height': TokenValue;
  'size-small-padding': TokenValue;
  'size-small-fontSize': TokenValue;
  'size-small-iconSize': TokenValue;
  'size-small-gap': TokenValue;
  'size-medium-height': TokenValue;
  'size-medium-padding': TokenValue;
  'size-medium-fontSize': TokenValue;
  'size-medium-iconSize': TokenValue;
  'size-medium-gap': TokenValue;
  'size-large-height': TokenValue;
  'size-large-padding': TokenValue;
  'size-large-fontSize': TokenValue;
  'size-large-iconSize': TokenValue;
  'size-large-gap': TokenValue;

  // Layout tokens
  'border-width': TokenValue;
  'border-radius': TokenValue;
  'dropdown-maxHeight': TokenValue;
  'dropdown-minWidth': TokenValue;
  'dropdown-offset': TokenValue;

  // Typography tokens
  'typography-fontFamily': TokenValue;
  'typography-fontWeight': TokenValue;
  'typography-lineHeight': TokenValue;
  'typography-letterSpacing': TokenValue;

  // Focus tokens
  'focus-outlineWidth': TokenValue;
  'focus-outlineColor': TokenValue;
  'focus-outlineOffset': TokenValue;

  // Animation tokens
  'transition-duration': TokenValue;
  'transition-easing': TokenValue;
  'transition-properties': TokenValue;
  'dropdown-animation-duration': TokenValue;
  'dropdown-animation-easing': TokenValue;

  // Search tokens
  'search-background': TokenValue;
  'search-border': TokenValue;
  'search-placeholder': TokenValue;
}

/**
 * Select theming options
 */
export interface SelectTheme {
  /** Custom token overrides */
  tokens?: Partial<SelectTokens>;
  /** Custom CSS properties */
  cssProperties?: CSSProperties;
  /** External token configuration */
  tokenConfig?: ComponentTokenConfig;
}

/**
 * Base Select props
 */
export interface SelectProps {
  /** Select options */
  options: SelectOption[] | SelectOptionGroup[];
  /** Current value */
  value?: string | number | (string | number)[];
  /** Default value for uncontrolled mode */
  defaultValue?: string | number | (string | number)[];
  /** Change handler */
  onChange?: (value: string | number | (string | number)[]) => void;
  /** Visual size variant */
  size?: SelectSize;
  /** Visual style variant */
  variant?: SelectVariant;
  /** Current state */
  state?: SelectState;
  /** Custom theming */
  theme?: SelectTheme;
  /** Additional CSS class names */
  className?: string;
  /** Container class name */
  containerClassName?: string;
  /** Placeholder text */
  placeholder?: string;
  /** Whether select is disabled */
  disabled?: boolean;
  /** Whether select is readonly */
  readonly?: boolean;
  /** Whether select is required */
  required?: boolean;
  /** Whether to allow multiple selections */
  multiple?: boolean;
  /** Whether to show search/filter input */
  searchable?: boolean;
  /** Search placeholder text */
  searchPlaceholder?: string;
  /** Whether to clear search on selection */
  clearSearchOnSelect?: boolean;
  /** Custom search filter function */
  filterFunction?: (option: SelectOption, searchTerm: string) => boolean;
  /** Whether to show clear button */
  clearable?: boolean;
  /** Maximum number of visible options */
  maxVisibleOptions?: number;
  /** Custom loading state */
  loading?: boolean;
  /** Loading text */
  loadingText?: string;
  /** No options text */
  noOptionsText?: string;
  /** Custom option renderer */
  renderOption?: (option: SelectOption, isSelected: boolean) => React.ReactNode;
  /** Custom value renderer */
  renderValue?: (
    value: string | number | (string | number)[]
  ) => React.ReactNode;
  /** Label text */
  label?: string;
  /** Helper text */
  helperText?: string;
  /** Error message */
  errorMessage?: string;
  /** Warning message */
  warningMessage?: string;
  /** Success message */
  successMessage?: string;
  /** ARIA label for accessibility */
  'aria-label'?: string;
  /** ARIA described by for accessibility */
  'aria-describedby'?: string;
  /** Custom test ID */
  'data-testid'?: string;
}

/**
 * Select wrapper props
 */
export interface SelectWrapperProps {
  children: React.ReactNode;
  className?: string;
  theme?: SelectTheme;
}

/**
 * Select label props
 */
export interface SelectLabelProps {
  children: React.ReactNode;
  htmlFor?: string;
  required?: boolean;
  className?: string;
}

/**
 * Select message props
 */
export interface SelectMessageProps {
  children: React.ReactNode;
  type?: 'helper' | 'error' | 'warning' | 'success';
  className?: string;
}

/**
 * Select trigger props
 */
export interface SelectTriggerProps {
  children: React.ReactNode;
  isOpen: boolean;
  disabled?: boolean;
  readonly?: boolean;
  onClick: () => void;
  onKeyDown: (event: React.KeyboardEvent) => void;
  className?: string;
  'aria-expanded': boolean;
  'aria-haspopup': 'listbox';
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
}

/**
 * Select dropdown props
 */
export interface SelectDropdownProps {
  children: React.ReactNode;
  isOpen: boolean;
  className?: string;
  style?: CSSProperties;
}

/**
 * Select option props
 */
export interface SelectOptionProps {
  option: SelectOption;
  isSelected: boolean;
  isHighlighted: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
  className?: string;
  renderOption?: (option: SelectOption, isSelected: boolean) => React.ReactNode;
}

/**
 * Select search props
 */
export interface SelectSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

/**
 * Default Select token values
 */
export const DEFAULT_SELECT_TOKENS: SelectTokens = {
  // Color tokens
  'color-background-default': '#ffffff',
  'color-background-filled': '#f9fafb',
  'color-background-disabled': '#f3f4f6',
  'color-background-readonly': '#fafafa',
  'color-foreground-default': '#374151',
  'color-foreground-placeholder': '#9ca3af',
  'color-foreground-disabled': '#d1d5db',
  'color-border-default': '#d1d5db',
  'color-border-hover': '#9ca3af',
  'color-border-focus': '#2563eb',
  'color-border-error': '#dc2626',
  'color-border-warning': '#d97706',
  'color-border-success': '#059669',
  'color-border-disabled': '#e5e7eb',

  // Dropdown colors
  'color-dropdown-background': '#ffffff',
  'color-dropdown-border': '#e5e7eb',
  'color-dropdown-shadow':
    '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  'color-option-background-default': 'transparent',
  'color-option-background-hover': '#f3f4f6',
  'color-option-background-selected': '#dbeafe',
  'color-option-background-disabled': 'transparent',
  'color-option-foreground-default': '#374151',
  'color-option-foreground-hover': '#111827',
  'color-option-foreground-selected': '#1d4ed8',
  'color-option-foreground-disabled': '#9ca3af',

  // Size tokens
  'size-small-height': '32px',
  'size-small-padding': '6px 8px',
  'size-small-fontSize': '14px',
  'size-small-iconSize': '16px',
  'size-small-gap': '6px',
  'size-medium-height': '40px',
  'size-medium-padding': '8px 12px',
  'size-medium-fontSize': '16px',
  'size-medium-iconSize': '20px',
  'size-medium-gap': '8px',
  'size-large-height': '48px',
  'size-large-padding': '12px 16px',
  'size-large-fontSize': '18px',
  'size-large-iconSize': '24px',
  'size-large-gap': '12px',

  // Layout tokens
  'border-width': '1px',
  'border-radius': '6px',
  'dropdown-maxHeight': '200px',
  'dropdown-minWidth': '200px',
  'dropdown-offset': '4px',

  // Typography tokens
  'typography-fontFamily': 'Inter, sans-serif',
  'typography-fontWeight': '400',
  'typography-lineHeight': '1.5',
  'typography-letterSpacing': '0',

  // Focus tokens
  'focus-outlineWidth': '2px',
  'focus-outlineColor': '#2563eb',
  'focus-outlineOffset': '2px',

  // Animation tokens
  'transition-duration': '0.15s',
  'transition-easing': 'ease-in-out',
  'transition-properties': 'border-color, box-shadow, background-color',
  'dropdown-animation-duration': '0.2s',
  'dropdown-animation-easing': 'ease-out',

  // Search tokens
  'search-background': '#ffffff',
  'search-border': '#e5e7eb',
  'search-placeholder': '#9ca3af',
};
