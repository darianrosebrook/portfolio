/**
 * Checkbox Component Types
 *
 * Defines TypeScript interfaces for Checkbox component props and design tokens
 */

import { CSSProperties } from 'react';
import { TokenValue, ComponentTokenConfig } from '@/utils/designTokens';

/**
 * Checkbox size variants
 */
export type CheckboxSize = 'small' | 'medium' | 'large';

/**
 * Checkbox visual variants
 */
export type CheckboxVariant = 'default' | 'success' | 'warning' | 'danger';

/**
 * Checkbox state variants
 */
export type CheckboxState = 'default' | 'error' | 'success' | 'warning';

/**
 * Checkbox design tokens interface
 */
export interface CheckboxTokens {
  // Box (checkbox) colors
  'color-box-unchecked': TokenValue;
  'color-box-checked': TokenValue;
  'color-box-indeterminate': TokenValue;
  'color-box-disabled': TokenValue;
  'color-box-hover': TokenValue;
  'color-box-focus': TokenValue;

  // Border colors
  'color-border-unchecked': TokenValue;
  'color-border-checked': TokenValue;
  'color-border-indeterminate': TokenValue;
  'color-border-disabled': TokenValue;
  'color-border-hover': TokenValue;
  'color-border-focus': TokenValue;
  'color-border-error': TokenValue;
  'color-border-success': TokenValue;
  'color-border-warning': TokenValue;

  // Checkmark colors
  'color-checkmark-default': TokenValue;
  'color-checkmark-disabled': TokenValue;

  // Label colors
  'color-label-default': TokenValue;
  'color-label-disabled': TokenValue;

  // Size tokens for each variant
  'size-small-boxSize': TokenValue;
  'size-small-fontSize': TokenValue;
  'size-small-gap': TokenValue;
  'size-small-checkmarkSize': TokenValue;
  'size-medium-boxSize': TokenValue;
  'size-medium-fontSize': TokenValue;
  'size-medium-gap': TokenValue;
  'size-medium-checkmarkSize': TokenValue;
  'size-large-boxSize': TokenValue;
  'size-large-fontSize': TokenValue;
  'size-large-gap': TokenValue;
  'size-large-checkmarkSize': TokenValue;

  // Layout tokens
  'border-width': TokenValue;
  'border-radius': TokenValue;

  // Typography tokens
  'typography-fontFamily': TokenValue;
  'typography-fontWeight': TokenValue;
  'typography-lineHeight': TokenValue;
  'typography-letterSpacing': TokenValue;

  // Animation tokens
  'transition-duration': TokenValue;
  'transition-easing': TokenValue;
  'transition-properties': TokenValue;

  // Focus tokens
  'focus-outlineColor': TokenValue;
  'focus-outlineWidth': TokenValue;
  'focus-outlineOffset': TokenValue;
  'focus-boxShadow': TokenValue;
}

/**
 * Checkbox theming options
 */
export interface CheckboxTheme {
  /** Custom token overrides */
  tokens?: Partial<CheckboxTokens>;
  /** Custom CSS properties */
  cssProperties?: CSSProperties;
  /** External token configuration */
  tokenConfig?: ComponentTokenConfig;
}

/**
 * Base Checkbox props
 */
export interface CheckboxProps {
  /** Whether the checkbox is checked */
  checked?: boolean;
  /** Whether the checkbox is in an indeterminate state */
  indeterminate?: boolean;
  /** Whether the checkbox is disabled */
  disabled?: boolean;
  /** Change handler */
  onChange?: (
    checked: boolean,
    event: React.ChangeEvent<HTMLInputElement>
  ) => void;
  /** Label content */
  children?: React.ReactNode;
  /** Visual size variant */
  size?: CheckboxSize;
  /** Visual style variant */
  variant?: CheckboxVariant;
  /** Visual state for validation */
  state?: CheckboxState;
  /** Custom theming */
  theme?: CheckboxTheme;
  /** Additional CSS class names */
  className?: string;
  /** Container class name */
  containerClassName?: string;
  /** Input element ID */
  id?: string;
  /** Input name attribute */
  name?: string;
  /** Input value attribute */
  value?: string;
  /** Whether the checkbox is required */
  required?: boolean;
  /** ARIA label for accessibility */
  'aria-label'?: string;
  /** ARIA described by for accessibility */
  'aria-describedby'?: string;
  /** Helper text */
  helperText?: string;
  /** Error message */
  errorMessage?: string;
  /** Success message */
  successMessage?: string;
  /** Warning message */
  warningMessage?: string;
}

/**
 * Checkbox wrapper props
 */
export interface CheckboxWrapperProps {
  children: React.ReactNode;
  className?: string;
  theme?: CheckboxTheme;
}

/**
 * Checkbox input props
 */
export interface CheckboxInputProps {
  id: string;
  checked?: boolean;
  indeterminate?: boolean;
  disabled?: boolean;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  name?: string;
  value?: string;
  required?: boolean;
  'aria-label'?: string;
  'aria-describedby'?: string;
  className?: string;
}

/**
 * Checkbox label props
 */
export interface CheckboxLabelProps {
  htmlFor: string;
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
}

/**
 * Checkbox message props
 */
export interface CheckboxMessageProps {
  type: 'helper' | 'error' | 'success' | 'warning';
  children: React.ReactNode;
  className?: string;
}

/**
 * Default Checkbox token values
 */
export const DEFAULT_CHECKBOX_TOKENS: CheckboxTokens = {
  // Box colors
  'color-box-unchecked': '#ffffff',
  'color-box-checked': '#d9292b',
  'color-box-indeterminate': '#d9292b',
  'color-box-disabled': '#f0f0f0',
  'color-box-hover': '#f5f5f5',
  'color-box-focus': '#ffffff',

  // Border colors
  'color-border-unchecked': '#cecece',
  'color-border-checked': '#d9292b',
  'color-border-indeterminate': '#d9292b',
  'color-border-disabled': '#e0e0e0',
  'color-border-hover': '#aeaeae',
  'color-border-focus': '#d9292b',
  'color-border-error': '#ae0001',
  'color-border-success': '#336006',
  'color-border-warning': '#824500',

  // Checkmark colors
  'color-checkmark-default': '#ffffff',
  'color-checkmark-disabled': '#aeaeae',

  // Label colors
  'color-label-default': '#141414',
  'color-label-disabled': '#aeaeae',

  // Size tokens
  'size-small-boxSize': '16px',
  'size-small-fontSize': '12px',
  'size-small-gap': '6px',
  'size-small-checkmarkSize': '10px',
  'size-medium-boxSize': '20px',
  'size-medium-fontSize': '14px',
  'size-medium-gap': '8px',
  'size-medium-checkmarkSize': '12px',
  'size-large-boxSize': '24px',
  'size-large-fontSize': '16px',
  'size-large-gap': '10px',
  'size-large-checkmarkSize': '14px',

  // Layout tokens
  'border-width': '1px',
  'border-radius': '4px',

  // Typography tokens
  'typography-fontFamily': 'Inter, sans-serif',
  'typography-fontWeight': '400',
  'typography-lineHeight': '1.5',
  'typography-letterSpacing': '0',

  // Animation tokens
  'transition-duration': '0.2s',
  'transition-easing': 'ease-in-out',
  'transition-properties': 'background-color, border-color, transform',

  // Focus tokens
  'focus-outlineColor': '#d9292b',
  'focus-outlineWidth': '2px',
  'focus-outlineOffset': '2px',
  'focus-boxShadow': '0 0 0 3px rgba(217, 41, 43, 0.1)',
};
